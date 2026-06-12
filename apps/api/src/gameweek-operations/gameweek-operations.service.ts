import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FixtureImportService } from '../fixture-import/fixture-import.service';
import { FantasyCalibrationService } from '../fantasy-calibration/fantasy-calibration.service';
import { PredictionCalibrationService } from '../prediction-calibration/prediction-calibration.service';

export type GameweekOperationalStatus =
  | 'DRAFT'
  | 'READY_TO_REVIEW'
  | 'READY_TO_PUBLISH'
  | 'OPEN'
  | 'LOCKED'
  | 'IN_PROGRESS'
  | 'FINALIZING'
  | 'COMPLETE'
  | 'NEEDS_REVIEW'
  | 'HISTORICAL';

export type MatchdayReadinessStatus =
  | 'READY'
  | 'READY_WITH_WARNINGS'
  | 'BLOCKED'
  | 'IN_PROGRESS'
  | 'CLOSED'
  | 'HISTORICAL';

export interface OperationalCheck {
  domain: string;
  label: string;
  severity: 'BLOCKER' | 'WARNING' | 'INFO';
  passed: boolean;
  detail: string;
}

export interface GameweekOperationalDetail {
  gameweekId: string;
  name: string;
  round: number;
  status: string;
  operationalStatus: GameweekOperationalStatus;
  fixtureCount: number;
  publishedFixtureCount: number;
  unpublishedFixtureCount: number;
  predictionEligibleCount: number;
  transferDeadlineAt: Date;
  predictionDeadlineAt: Date;
  firstKickoffAt: Date | null;
  lastKickoffAt: Date | null;
  deadlineValid: boolean;
  readinessStatus: MatchdayReadinessStatus;
  blockers: string[];
  warnings: string[];
}

const SEASON_SELECT = {
  id: true,
  name: true,
  slug: true,
  status: true,
  isActive: true,
  startDate: true,
  endDate: true,
} as const;

@Injectable()
export class GameweekOperationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fixtureImportService: FixtureImportService,
    private readonly fantasyCalibrationService: FantasyCalibrationService,
    private readonly predictionCalibrationService: PredictionCalibrationService,
  ) {}

  async getOperationalSeasons() {
    const seasons = await this.prisma.season.findMany({
      select: {
        ...SEASON_SELECT,
        _count: { select: { gameweeks: true, fixtures: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    return seasons.map((s) => ({
      seasonId: s.id,
      seasonName: s.name,
      slug: s.slug,
      status: s.status,
      isActive: s.isActive,
      startDate: s.startDate,
      endDate: s.endDate,
      gameweekCount: s._count.gameweeks,
      fixtureCount: s._count.fixtures,
    }));
  }

  async getSeasonOperationsOverview(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: SEASON_SELECT });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const [gwCount, fixtureCount, publishedCount, unassigned, fantasyConfig, predictionConfig] = await Promise.all([
      this.prisma.gameweek.count({ where: { seasonId } }),
      this.prisma.fixture.count({ where: { seasonId } }),
      this.prisma.fixture.count({ where: { seasonId, isPublished: true } }),
      this.prisma.fixture.count({ where: { seasonId, gameweekId: null } }),
      this.prisma.fantasyRulesConfig.findUnique({ where: { seasonId }, select: { id: true } }),
      this.prisma.predictionRulesConfig.findUnique({ where: { seasonId }, select: { id: true, status: true } }),
    ]);

    const blockers: string[] = [];
    const warnings: string[] = [];

    if (gwCount === 0) warnings.push('No gameweeks — derive gameweeks from fixtures');
    if (fixtureCount === 0) blockers.push('No fixtures loaded for this season');
    if (publishedCount === 0 && fixtureCount > 0) warnings.push('No fixtures published yet');
    if (unassigned > 0) warnings.push(`${unassigned} fixture(s) not assigned to a gameweek`);
    if (!fantasyConfig) warnings.push('No fantasy rules config — create provisional rules');
    if (!predictionConfig) warnings.push('No prediction rules config — create provisional rules');

    let overallStatus: MatchdayReadinessStatus = 'READY';
    if (blockers.length > 0) overallStatus = 'BLOCKED';
    else if (warnings.length > 0) overallStatus = 'READY_WITH_WARNINGS';

    return {
      seasonId,
      seasonName: season.name,
      seasonStatus: season.status,
      isActive: season.isActive,
      overallStatus,
      gameweekCount: gwCount,
      fixtureCount,
      publishedFixtureCount: publishedCount,
      unassignedFixtureCount: unassigned,
      fantasyConfigured: fantasyConfig !== null,
      predictionConfigured: predictionConfig !== null,
      predictionRulesStatus: predictionConfig?.status ?? null,
      blockers,
      warnings,
      nextAction: blockers.length > 0
        ? 'Resolve blockers before proceeding'
        : unassigned > 0
          ? 'Derive gameweeks to assign fixtures'
          : publishedCount === 0 && fixtureCount > 0
            ? 'Publish fixtures to enable fan gameplay'
            : 'Review readiness across all domains',
    };
  }

  async getGameweekOperations(seasonId: string): Promise<GameweekOperationalDetail[]> {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: { id: true } });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const gameweeks = await this.prisma.gameweek.findMany({
      where: { seasonId },
      orderBy: { round: 'asc' },
      select: {
        id: true,
        name: true,
        round: true,
        status: true,
        transferDeadlineAt: true,
        predictionDeadlineAt: true,
        fixtures: {
          select: { id: true, kickoffAt: true, isPublished: true, status: true },
          orderBy: { kickoffAt: 'asc' },
        },
      },
    });

    return gameweeks.map((gw) => this._computeGameweekDetail(gw));
  }

  async getGameweekOperationDetail(seasonId: string, gameweekId: string): Promise<GameweekOperationalDetail> {
    const gw = await this.prisma.gameweek.findFirst({
      where: { id: gameweekId, seasonId },
      select: {
        id: true,
        name: true,
        round: true,
        status: true,
        transferDeadlineAt: true,
        predictionDeadlineAt: true,
        fixtures: {
          select: { id: true, kickoffAt: true, isPublished: true, status: true },
          orderBy: { kickoffAt: 'asc' },
        },
      },
    });
    if (!gw) throw new NotFoundException(`Gameweek '${gameweekId}' not found in season '${seasonId}'`);

    return this._computeGameweekDetail(gw);
  }

  async getSeasonGameweekReadiness(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: SEASON_SELECT });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const [gwReadiness, validationResult] = await Promise.all([
      this.fixtureImportService.getGameweekReadiness(seasonId),
      this.fixtureImportService.getSeasonFixtureValidation(seasonId),
    ]);

    const checks: OperationalCheck[] = [];

    checks.push({
      domain: 'gameweeks',
      label: 'Gameweeks exist',
      severity: 'BLOCKER',
      passed: gwReadiness.gameweeksCreated > 0,
      detail: gwReadiness.gameweeksCreated > 0
        ? `${gwReadiness.gameweeksCreated} gameweek(s) defined`
        : 'No gameweeks — POST /gameweeks/admin/operations/:seasonId/gameweeks/derive',
    });

    checks.push({
      domain: 'gameweeks',
      label: 'Fixtures assigned to gameweeks',
      severity: 'WARNING',
      passed: gwReadiness.fixturesWithoutGameweek === 0,
      detail: gwReadiness.fixturesWithoutGameweek === 0
        ? `All ${gwReadiness.totalFixtures} fixture(s) assigned`
        : `${gwReadiness.fixturesWithoutGameweek} fixture(s) not assigned to a gameweek`,
    });

    checks.push({
      domain: 'gameweeks',
      label: 'Prediction deadlines valid',
      severity: 'WARNING',
      passed: gwReadiness.deadlineWarnings.length === 0,
      detail: gwReadiness.deadlineWarnings.length === 0
        ? 'All prediction deadlines are before kickoff'
        : `${gwReadiness.deadlineWarnings.length} deadline issue(s) detected`,
    });

    checks.push({
      domain: 'gameweeks',
      label: 'Transfer deadlines valid',
      severity: 'WARNING',
      passed: gwReadiness.lockTimingWarnings.length === 0,
      detail: gwReadiness.lockTimingWarnings.length === 0
        ? 'All transfer deadlines are before kickoff'
        : `${gwReadiness.lockTimingWarnings.length} transfer deadline issue(s) detected`,
    });

    checks.push({
      domain: 'fixtures',
      label: 'Fixtures published',
      severity: 'WARNING',
      passed: validationResult.publishedFixtures > 0,
      detail: validationResult.publishedFixtures > 0
        ? `${validationResult.publishedFixtures}/${validationResult.totalFixtures} fixture(s) published`
        : 'No fixtures published — fans cannot see fixture list',
    });

    const blockers = checks.filter((c) => c.severity === 'BLOCKER' && !c.passed);
    const warnings = checks.filter((c) => c.severity === 'WARNING' && !c.passed);

    let readinessStatus: MatchdayReadinessStatus = 'READY';
    if (blockers.length > 0) readinessStatus = 'BLOCKED';
    else if (warnings.length > 0) readinessStatus = 'READY_WITH_WARNINGS';

    return {
      seasonId,
      seasonName: season.name,
      readinessStatus,
      checks,
      blockers,
      warnings,
      fixtureAssignment: {
        total: gwReadiness.totalFixtures,
        assigned: gwReadiness.fixturesWithGameweek,
        unassigned: gwReadiness.fixturesWithoutGameweek,
        gameweeks: gwReadiness.gameweeksCreated,
      },
      deadlineWarnings: gwReadiness.deadlineWarnings,
      lockTimingWarnings: gwReadiness.lockTimingWarnings,
    };
  }

  async getDeadlineReadiness(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: SEASON_SELECT });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const gameweeks = await this.prisma.gameweek.findMany({
      where: { seasonId },
      orderBy: { round: 'asc' },
      select: {
        id: true,
        name: true,
        round: true,
        status: true,
        transferDeadlineAt: true,
        predictionDeadlineAt: true,
        fixtures: {
          where: { isPublished: true },
          select: { kickoffAt: true },
          orderBy: { kickoffAt: 'asc' },
        },
      },
    });

    const now = new Date();
    let validDeadlines = 0;
    let invalidDeadlines = 0;
    let deadlinesInPast = 0;

    const items = gameweeks.map((gw) => {
      const earliestKickoff = gw.fixtures[0]?.kickoffAt ?? null;
      const transferOk = earliestKickoff ? gw.transferDeadlineAt <= earliestKickoff : null;
      const predictionOk = earliestKickoff ? gw.predictionDeadlineAt <= earliestKickoff : null;
      const transferInPast = gw.transferDeadlineAt <= now;
      const predictionInPast = gw.predictionDeadlineAt <= now;

      const issues: string[] = [];
      if (earliestKickoff && transferOk === false) issues.push('Transfer deadline is after earliest kickoff');
      if (earliestKickoff && predictionOk === false) issues.push('Prediction deadline is after earliest kickoff');

      if (issues.length === 0 && earliestKickoff) validDeadlines++;
      else if (issues.length > 0) invalidDeadlines++;

      if (transferInPast && gw.status === 'UPCOMING') deadlinesInPast++;

      return {
        gameweekId: gw.id,
        name: gw.name,
        round: gw.round,
        status: gw.status,
        transferDeadlineAt: gw.transferDeadlineAt,
        predictionDeadlineAt: gw.predictionDeadlineAt,
        earliestKickoff,
        transferDeadlineBeforeKickoff: transferOk,
        predictionDeadlineBeforeKickoff: predictionOk,
        transferDeadlineInPast: transferInPast,
        predictionDeadlineInPast: predictionInPast,
        hasFixtures: gw.fixtures.length > 0,
        issues,
      };
    });

    return {
      seasonId,
      seasonName: season.name,
      totalGameweeks: gameweeks.length,
      gameweeksWithValidDeadlines: validDeadlines,
      gameweeksWithInvalidDeadlines: invalidDeadlines,
      gameweeksWithDeadlinesInPast: deadlinesInPast,
      nextFantasyDeadline: items.find((i) => !i.transferDeadlineInPast)?.transferDeadlineAt ?? null,
      nextPredictionDeadline: items.find((i) => !i.predictionDeadlineInPast)?.predictionDeadlineAt ?? null,
      gameweeks: items,
      note: 'Deadlines are non-nullable. Use POST /gameweeks/admin/operations/:seasonId/derive-deadlines to recalculate.',
    };
  }

  async getFixtureAssignmentReadiness(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: SEASON_SELECT });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const [validation, conflicts, gwReadiness] = await Promise.all([
      this.fixtureImportService.getSeasonFixtureValidation(seasonId),
      this.fixtureImportService.getSeasonFixtureConflicts(seasonId),
      this.fixtureImportService.getGameweekReadiness(seasonId),
    ]);

    return {
      seasonId,
      seasonName: season.name,
      fixtureCount: validation.totalFixtures,
      publishedFixtures: validation.publishedFixtures,
      unpublishedFixtures: validation.unpublishedFixtures,
      fixturesWithGameweek: validation.fixturesWithGameweek,
      fixturesWithoutGameweek: validation.fixturesWithoutGameweek,
      fixturesWithVenue: validation.fixturesWithVenue,
      fixturesWithoutVenue: validation.fixturesWithoutVenue,
      gameweeksCreated: gwReadiness.gameweeksCreated,
      deadlineWarnings: gwReadiness.deadlineWarnings,
      lockTimingWarnings: gwReadiness.lockTimingWarnings,
      conflicts: conflicts.conflicts,
      totalConflicts: conflicts.totalConflicts,
      validationIssues: validation.issues,
      canProceed: conflicts.conflicts.filter((c) => c.severity === 'ERROR').length === 0 && validation.fixturesWithoutGameweek === 0,
    };
  }

  async getFantasyImpact(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: SEASON_SELECT });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const [calibrationReadiness, gwReadiness, activationImpact] = await Promise.all([
      this.fantasyCalibrationService.getCalibrationReadiness(seasonId),
      this.fantasyCalibrationService.getGameweekReadiness(seasonId),
      this.fantasyCalibrationService.getActivationImpact(seasonId),
    ]);

    const now = new Date();
    const upcomingDeadlines = gwReadiness.gameweeks.filter(
      (gw) => gw.earliestKickoff && gw.earliestKickoff > now,
    );

    return {
      seasonId,
      seasonName: season.name,
      readinessStatus: calibrationReadiness.status,
      blockers: calibrationReadiness.blockers as unknown[],
      warnings: calibrationReadiness.warnings as unknown[],
      totalGameweeks: gwReadiness.totalGameweeks,
      gameweeksWithFixtures: gwReadiness.gameweeksWithFixtures,
      upcomingGameweeksWithFixtures: upcomingDeadlines.length,
      fantasyTeamsAffected: activationImpact.fantasyTeamsAffected,
      playerPricesSet: activationImpact.playerPricesSet,
      gameweeksConfigured: activationImpact.gameweeksConfigured,
      rulesConfigured: activationImpact.rulesConfigured,
      activationWarnings: activationImpact.warnings,
      worldCupNote: 'World Cup fantasy history is preserved. Only PSL season data is shown here.',
    };
  }

  async getPredictionImpact(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: SEASON_SELECT });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const [calibrationReadiness, lockReadiness, fixtureEligibility] = await Promise.all([
      this.predictionCalibrationService.getCalibrationReadiness(seasonId),
      this.predictionCalibrationService.getLockReadiness(seasonId),
      this.predictionCalibrationService.getFixtureEligibility(seasonId),
    ]);

    const eligibilityData = fixtureEligibility as { fixtures: Array<{ isEligible: boolean }> };
    const lockData = lockReadiness as { totalLocked: number; totalOpen: number; totalPublished: number; fixtures: unknown[] };
    const calibData = calibrationReadiness as { activationStatus: string; checks: unknown[]; blockers: unknown[]; warnings: unknown[] };

    const eligibleCount = eligibilityData.fixtures.filter((f) => f.isEligible).length;
    const ineligibleCount = eligibilityData.fixtures.filter((f) => !f.isEligible).length;

    return {
      seasonId,
      seasonName: season.name,
      readinessStatus: calibData.activationStatus,
      checks: calibData.checks,
      lockedFixtures: lockData.totalLocked,
      openFixtures: lockData.totalOpen,
      totalPublishedFixtures: lockData.totalPublished,
      eligibleFixtures: eligibleCount,
      ineligibleFixtures: ineligibleCount,
      lockReadinessByFixture: lockData.fixtures,
      worldCupNote: 'World Cup prediction history is preserved. Historical predictions are read-only.',
    };
  }

  async getPublicationReadiness(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: SEASON_SELECT });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const publishingReadiness = await this.fixtureImportService.getPublishingReadiness(seasonId);
    const gameweeks = await this.getGameweekOperations(seasonId);

    const readyToPublish = gameweeks.filter((gw) =>
      gw.operationalStatus === 'READY_TO_PUBLISH' || gw.operationalStatus === 'OPEN',
    );

    return {
      seasonId,
      seasonName: season.name,
      totalFixtures: publishingReadiness.totalFixtures,
      publishedFixtures: publishingReadiness.publishedFixtures,
      unpublishedFixtures: publishingReadiness.unpublishedFixtures,
      canPublish: publishingReadiness.canPublish,
      blockingErrors: publishingReadiness.blockingErrors,
      warnings: publishingReadiness.warnings,
      gameweeksReadyToPublish: readyToPublish.length,
      gameweekSummary: gameweeks.map((gw) => ({
        gameweekId: gw.gameweekId,
        name: gw.name,
        round: gw.round,
        fixtureCount: gw.fixtureCount,
        publishedFixtureCount: gw.publishedFixtureCount,
        operationalStatus: gw.operationalStatus,
        readyToPublish: gw.operationalStatus === 'READY_TO_PUBLISH',
      })),
    };
  }

  async getActivationImpact(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: SEASON_SELECT });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const [overview, fantasyImpact, gwReadiness, pubReadiness] = await Promise.all([
      this.getSeasonOperationsOverview(seasonId),
      this.fantasyCalibrationService.getActivationImpact(seasonId),
      this.fixtureImportService.getGameweekReadiness(seasonId),
      this.fixtureImportService.getPublishingReadiness(seasonId),
    ]);

    const warnings: string[] = [
      ...overview.warnings,
      ...fantasyImpact.warnings,
    ];

    return {
      seasonId,
      seasonName: season.name,
      overallStatus: overview.overallStatus,
      gameweeksReady: gwReadiness.gameweeksCreated > 0,
      allFixturesAssigned: gwReadiness.fixturesWithoutGameweek === 0,
      fixturesPublished: pubReadiness.publishedFixtures > 0,
      fantasyTeamsAffected: fantasyImpact.fantasyTeamsAffected,
      predictionCountAffected: fantasyImpact.predictionCountAffected,
      playerPricesSet: fantasyImpact.playerPricesSet,
      rulesConfigured: fantasyImpact.rulesConfigured,
      gameweeksConfigured: fantasyImpact.gameweeksConfigured,
      warnings: [...new Set(warnings)],
      blockers: overview.blockers,
      nextAction: overview.nextAction,
      worldCupPreservationNote: 'World Cup history (fixtures, predictions, fantasy, peer challenges, fan value) is preserved and unaffected.',
      operationalNote: 'Operational readiness only. No payments, betting, or live-provider integration.',
    };
  }

  async getMatchdayControl(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: SEASON_SELECT });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const [overview, gameweeks, gwReadiness, pubReadiness] = await Promise.all([
      this.getSeasonOperationsOverview(seasonId),
      this.getGameweekOperations(seasonId),
      this.fixtureImportService.getGameweekReadiness(seasonId),
      this.fixtureImportService.getPublishingReadiness(seasonId),
    ]);

    const now = new Date();
    const currentGameweek = gameweeks.find((gw) => gw.status === 'OPEN' || gw.status === 'LIVE')
      ?? gameweeks.find((gw) => gw.firstKickoffAt && gw.firstKickoffAt > now);

    const actions: string[] = [];
    if (gwReadiness.fixturesWithoutGameweek > 0) {
      actions.push(`Derive gameweeks — ${gwReadiness.fixturesWithoutGameweek} fixture(s) unassigned`);
    }
    if (pubReadiness.unpublishedFixtures > 0 && pubReadiness.canPublish) {
      actions.push(`Publish ${pubReadiness.unpublishedFixtures} fixture(s) to enable fan gameplay`);
    }
    if (!overview.fantasyConfigured) {
      actions.push('Create provisional fantasy rules config');
    }
    if (!overview.predictionConfigured) {
      actions.push('Create provisional prediction rules config');
    }
    if (actions.length === 0) {
      actions.push('Review season switching readiness before activation');
    }

    return {
      seasonId,
      seasonName: season.name,
      seasonStatus: season.status,
      isActive: season.isActive,
      overallReadiness: overview.overallStatus,
      currentGameweek: currentGameweek
        ? {
            gameweekId: currentGameweek.gameweekId,
            name: currentGameweek.name,
            round: currentGameweek.round,
            status: currentGameweek.status,
            operationalStatus: currentGameweek.operationalStatus,
          }
        : null,
      totalGameweeks: gameweeks.length,
      gameweeksByStatus: {
        draft: gameweeks.filter((g) => g.operationalStatus === 'DRAFT').length,
        needsReview: gameweeks.filter((g) => g.operationalStatus === 'NEEDS_REVIEW').length,
        readyToReview: gameweeks.filter((g) => g.operationalStatus === 'READY_TO_REVIEW').length,
        readyToPublish: gameweeks.filter((g) => g.operationalStatus === 'READY_TO_PUBLISH').length,
        open: gameweeks.filter((g) => g.operationalStatus === 'OPEN').length,
        locked: gameweeks.filter((g) => g.operationalStatus === 'LOCKED').length,
        inProgress: gameweeks.filter((g) => g.operationalStatus === 'IN_PROGRESS').length,
        complete: gameweeks.filter((g) => g.operationalStatus === 'COMPLETE' || g.operationalStatus === 'HISTORICAL').length,
      },
      fixtures: {
        total: gwReadiness.totalFixtures,
        withGameweek: gwReadiness.fixturesWithGameweek,
        withoutGameweek: gwReadiness.fixturesWithoutGameweek,
        published: pubReadiness.publishedFixtures,
        unpublished: pubReadiness.unpublishedFixtures,
      },
      fantasyConfigured: overview.fantasyConfigured,
      predictionConfigured: overview.predictionConfigured,
      fanVisibilitySafe: pubReadiness.publishedFixtures > 0 && gwReadiness.fixturesWithoutGameweek === 0,
      fantasyEntrySafe: pubReadiness.publishedFixtures > 0 && overview.fantasyConfigured,
      predictionEntrySafe: pubReadiness.publishedFixtures > 0 && overview.predictionConfigured,
      peerChallengesSafe: pubReadiness.publishedFixtures > 0 && overview.predictionConfigured,
      blockers: overview.blockers,
      warnings: overview.warnings,
      nextActions: actions,
      navigationLinks: {
        fixtureImport: '/admin/fixtures/imports',
        fantasyCalibration: '/admin/fantasy/calibration',
        predictionCalibration: '/admin/predictions/calibration',
        seasonSwitching: '/admin/seasons/switching',
      },
      safetyNote: 'Operational readiness only. No payments, real-money mechanics, or live-provider integration.',
    };
  }

  async deriveGameweeks(seasonId: string, overwriteExisting = false) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: { id: true } });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const result = await this.fixtureImportService.autoCreateGameweeks(seasonId);

    return {
      ...result,
      overwriteExisting,
      worldCupNote: 'Only PSL season gameweeks are derived. World Cup gameweeks are unaffected.',
    };
  }

  async deriveDeadlines(
    seasonId: string,
    options?: {
      mode?: 'MISSING_ONLY' | 'OVERWRITE_DERIVED_ONLY';
      fantasyBufferMinutes?: number;
      predictionBufferMinutes?: number;
    },
  ) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: { id: true } });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const mode = options?.mode ?? 'MISSING_ONLY';
    const fantasyBuffer = options?.fantasyBufferMinutes ?? 90;
    const predictionBuffer = options?.predictionBufferMinutes ?? 0;

    const gameweeks = await this.prisma.gameweek.findMany({
      where: { seasonId },
      orderBy: { round: 'asc' },
      select: {
        id: true,
        round: true,
        transferDeadlineAt: true,
        predictionDeadlineAt: true,
        fixtures: {
          where: { isPublished: true },
          select: { kickoffAt: true },
          orderBy: { kickoffAt: 'asc' },
          take: 1,
        },
      },
    });

    let updated = 0;
    let skipped = 0;
    const skippedReasons: string[] = [];

    const now = new Date();

    for (const gw of gameweeks) {
      const firstFixture = gw.fixtures[0];
      if (!firstFixture) {
        skipped++;
        skippedReasons.push(`Gameweek round ${gw.round}: no published fixtures`);
        continue;
      }

      const earliestKickoff = firstFixture.kickoffAt;

      if (earliestKickoff <= now) {
        skipped++;
        skippedReasons.push(`Gameweek round ${gw.round}: kickoff already passed`);
        continue;
      }

      const fantasyDeadline = new Date(earliestKickoff.getTime() - fantasyBuffer * 60_000);
      const predDeadlineBuffer = predictionBuffer > 0
        ? new Date(earliestKickoff.getTime() - predictionBuffer * 60_000)
        : earliestKickoff;

      if (fantasyDeadline >= earliestKickoff) {
        skipped++;
        skippedReasons.push(`Gameweek round ${gw.round}: fantasy buffer would push deadline past kickoff`);
        continue;
      }

      if (mode === 'MISSING_ONLY') {
        const transferAlreadyValid = gw.transferDeadlineAt < earliestKickoff;
        const predAlreadyValid = gw.predictionDeadlineAt <= earliestKickoff;
        if (transferAlreadyValid && predAlreadyValid) {
          skipped++;
          continue;
        }
      }

      await this.prisma.gameweek.update({
        where: { id: gw.id },
        data: {
          transferDeadlineAt: fantasyDeadline,
          predictionDeadlineAt: predDeadlineBuffer,
        },
      });
      updated++;
    }

    return {
      seasonId,
      mode,
      fantasyBufferMinutes: fantasyBuffer,
      predictionBufferMinutes: predictionBuffer,
      updated,
      skipped,
      skippedReasons,
      worldCupNote: 'Only PSL season deadlines are derived. World Cup gameweeks are unaffected.',
    };
  }

  async validateSeasonGameweeks(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: SEASON_SELECT });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const [gwReadiness, validation, conflicts] = await Promise.all([
      this.fixtureImportService.getGameweekReadiness(seasonId),
      this.fixtureImportService.getSeasonFixtureValidation(seasonId),
      this.fixtureImportService.getSeasonFixtureConflicts(seasonId),
    ]);

    const errors: string[] = [
      ...conflicts.conflicts.filter((c) => c.severity === 'ERROR').map((c) => c.description),
    ];
    const warnings: string[] = [
      ...validation.issues.filter((i) => i.severity === 'WARNING').map((i) => i.message),
      ...gwReadiness.deadlineWarnings,
      ...gwReadiness.lockTimingWarnings,
    ];
    const info: string[] = [
      ...validation.issues.filter((i) => i.severity === 'INFO').map((i) => i.message),
    ];

    const isValid = errors.length === 0;

    return {
      seasonId,
      seasonName: season.name,
      isValid,
      totalFixtures: validation.totalFixtures,
      gameweeksCreated: gwReadiness.gameweeksCreated,
      fixturesWithGameweek: gwReadiness.fixturesWithGameweek,
      fixturesWithoutGameweek: gwReadiness.fixturesWithoutGameweek,
      errors,
      warnings,
      info,
      conflictCount: conflicts.totalConflicts,
    };
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private _computeGameweekDetail(gw: {
    id: string;
    name: string;
    round: number;
    status: string;
    transferDeadlineAt: Date;
    predictionDeadlineAt: Date;
    fixtures: Array<{ id: string; kickoffAt: Date; isPublished: boolean; status: string }>;
  }): GameweekOperationalDetail {
    const published = gw.fixtures.filter((f) => f.isPublished);
    const unpublished = gw.fixtures.filter((f) => !f.isPublished);
    const now = new Date();

    const firstKickoff = gw.fixtures[0]?.kickoffAt ?? null;
    const lastKickoff = gw.fixtures.at(-1)?.kickoffAt ?? null;

    const predEligible = published.filter((f) => {
      const locked = f.kickoffAt <= now || gw.predictionDeadlineAt <= now;
      const finished = f.status === 'FINISHED' || f.status === 'CANCELLED' || f.status === 'POSTPONED';
      return !locked && !finished;
    });

    const deadlineValid = firstKickoff
      ? gw.transferDeadlineAt <= firstKickoff && gw.predictionDeadlineAt <= firstKickoff
      : false;

    const blockers: string[] = [];
    const warnings: string[] = [];

    if (gw.fixtures.length === 0) blockers.push('No fixtures assigned');
    if (deadlineValid === false && firstKickoff) blockers.push('Deadline is after earliest kickoff');
    if (unpublished.length > 0) warnings.push(`${unpublished.length} fixture(s) unpublished`);

    const operationalStatus = this._deriveOperationalStatus(gw.status, gw.fixtures.length, published.length, blockers.length > 0);

    let readinessStatus: MatchdayReadinessStatus = 'READY';
    if (gw.status === 'COMPLETED') readinessStatus = 'HISTORICAL';
    else if (gw.status === 'LIVE') readinessStatus = 'IN_PROGRESS';
    else if (blockers.length > 0) readinessStatus = 'BLOCKED';
    else if (warnings.length > 0) readinessStatus = 'READY_WITH_WARNINGS';

    return {
      gameweekId: gw.id,
      name: gw.name,
      round: gw.round,
      status: gw.status,
      operationalStatus,
      fixtureCount: gw.fixtures.length,
      publishedFixtureCount: published.length,
      unpublishedFixtureCount: unpublished.length,
      predictionEligibleCount: predEligible.length,
      transferDeadlineAt: gw.transferDeadlineAt,
      predictionDeadlineAt: gw.predictionDeadlineAt,
      firstKickoffAt: firstKickoff,
      lastKickoffAt: lastKickoff,
      deadlineValid,
      readinessStatus,
      blockers,
      warnings,
    };
  }

  private _deriveOperationalStatus(
    status: string,
    fixtureCount: number,
    publishedCount: number,
    hasBlockers: boolean,
  ): GameweekOperationalStatus {
    if (status === 'COMPLETED') return 'HISTORICAL';
    if (status === 'LIVE') return 'IN_PROGRESS';
    if (status === 'LOCKED') return 'LOCKED';
    if (status === 'OPEN') return 'OPEN';
    // UPCOMING
    if (fixtureCount === 0) return 'DRAFT';
    if (hasBlockers) return 'NEEDS_REVIEW';
    if (publishedCount === fixtureCount && publishedCount > 0) return 'READY_TO_PUBLISH';
    if (publishedCount > 0) return 'READY_TO_REVIEW';
    return 'DRAFT';
  }
}
