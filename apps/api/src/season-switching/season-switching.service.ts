import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SeasonStatus, SeasonSwitchAction, SeasonSwitchStatus, Prisma } from '@prisma/client';
import { ActivateSeasonDto } from './dto/activate-season.dto';

export type ReadinessSeverity = 'BLOCKER' | 'WARNING' | 'INFO';

export interface ReadinessCheck {
  domain: string;
  label: string;
  severity: ReadinessSeverity;
  passed: boolean;
  detail: string;
}

export type ActivationReadiness = 'READY' | 'READY_WITH_WARNINGS' | 'BLOCKED';

export interface SeasonSwitchReadiness {
  seasonId: string;
  seasonName: string;
  activationStatus: ActivationReadiness;
  checks: ReadinessCheck[];
  blockers: ReadinessCheck[];
  warnings: ReadinessCheck[];
}

export interface SeasonSwitchPreview {
  seasonId: string;
  seasonName: string;
  fromSeason: { id: string; name: string; status: string } | null;
  toSeason: { id: string; name: string; status: string };
  willComplete: string[];
  willActivate: string[];
  readiness: SeasonSwitchReadiness;
}

const SEASON_SELECT = {
  id: true,
  name: true,
  slug: true,
  status: true,
  isActive: true,
  startDate: true,
  endDate: true,
  competitionId: true,
} as const;

@Injectable()
export class SeasonSwitchingService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminSeasonContext() {
    const [activeSeason, allSeasons] = await Promise.all([
      this.prisma.season.findFirst({ where: { isActive: true }, select: SEASON_SELECT }),
      this.prisma.season.findMany({ select: SEASON_SELECT, orderBy: { startDate: 'desc' } }),
    ]);

    const latestAudit = await this.prisma.seasonSwitchAudit.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    return {
      activeSeason,
      allSeasons,
      lastSwitchAt: latestAudit?.createdAt ?? null,
      lastSwitchAction: latestAudit?.action ?? null,
    };
  }

  async getSeasonSwitchReadiness(seasonId: string): Promise<SeasonSwitchReadiness> {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { ...SEASON_SELECT },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const checks: ReadinessCheck[] = await Promise.all([
      this.checkSeasonTeams(seasonId),
      this.checkFixturesCommitted(seasonId),
      this.checkFixturesPublished(seasonId),
      this.checkGameweeks(seasonId),
      this.checkFantasyRulesConfig(seasonId),
      this.checkFantasyPlayerPrices(seasonId),
      this.checkClubProfiles(seasonId),
      this.checkPredictionReadiness(seasonId),
      this.checkMatchdayOperationsReadiness(seasonId),
      this.checkEngagementSeasonScope(seasonId),
    ]);

    const blockers = checks.filter((c) => c.severity === 'BLOCKER' && !c.passed);
    const warnings = checks.filter((c) => c.severity === 'WARNING' && !c.passed);

    let activationStatus: ActivationReadiness = 'READY';
    if (blockers.length > 0) activationStatus = 'BLOCKED';
    else if (warnings.length > 0) activationStatus = 'READY_WITH_WARNINGS';

    return { seasonId, seasonName: season.name, activationStatus, checks, blockers, warnings };
  }

  async getSeasonSwitchPreview(seasonId: string): Promise<SeasonSwitchPreview> {
    const [readiness, season, currentActive] = await Promise.all([
      this.getSeasonSwitchReadiness(seasonId),
      this.prisma.season.findUnique({ where: { id: seasonId }, select: SEASON_SELECT }),
      this.prisma.season.findFirst({ where: { isActive: true }, select: SEASON_SELECT }),
    ]);

    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const fromSeason = currentActive
      ? { id: currentActive.id, name: currentActive.name, status: currentActive.status }
      : null;

    const willComplete = fromSeason ? [`${fromSeason.name} → COMPLETED`] : [];
    const willActivate = [`${season.name} → ACTIVE`];

    await this.prisma.seasonSwitchAudit.create({
      data: {
        id: crypto.randomUUID(),
        toSeasonId: seasonId,
        fromSeasonId: fromSeason?.id ?? null,
        action: SeasonSwitchAction.PREVIEW,
        status: SeasonSwitchStatus.SUCCESS,
        summaryJson: { activationStatus: readiness.activationStatus } as unknown as Prisma.InputJsonValue,
      },
    });

    return {
      seasonId,
      seasonName: season.name,
      fromSeason,
      toSeason: { id: season.id, name: season.name, status: season.status },
      willComplete,
      willActivate,
      readiness,
    };
  }

  async activateSeason(seasonId: string, userId: string | null, dto: ActivateSeasonDto) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: SEASON_SELECT });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const readiness = await this.getSeasonSwitchReadiness(seasonId);

    if (readiness.activationStatus === 'BLOCKED') {
      await this.prisma.seasonSwitchAudit.create({
        data: {
          id: crypto.randomUUID(),
          toSeasonId: seasonId,
          action: SeasonSwitchAction.ACTIVATE,
          status: SeasonSwitchStatus.BLOCKED,
          performedByUserId: userId,
          blockersJson: readiness.blockers as unknown as Prisma.InputJsonValue,
        },
      });
      throw new BadRequestException({
        message: 'Season activation blocked by unresolved issues',
        blockers: readiness.blockers,
      });
    }

    if (readiness.activationStatus === 'READY_WITH_WARNINGS' && !dto.acknowledgeWarnings) {
      throw new BadRequestException({
        message: 'Season has warnings. Set acknowledgeWarnings=true to proceed.',
        warnings: readiness.warnings,
      });
    }

    const currentActive = await this.prisma.season.findFirst({ where: { isActive: true }, select: SEASON_SELECT });

    const result = await this.prisma.$transaction(async (tx) => {
      if (currentActive) {
        await tx.season.update({
          where: { id: currentActive.id },
          data: { isActive: false, status: SeasonStatus.COMPLETED },
        });
      }
      const activated = await tx.season.update({
        where: { id: seasonId },
        data: { isActive: true, status: SeasonStatus.ACTIVE },
        select: SEASON_SELECT,
      });
      return { activated, previousSeasonId: currentActive?.id ?? null };
    });

    await this.prisma.seasonSwitchAudit.create({
      data: {
        id: crypto.randomUUID(),
        toSeasonId: seasonId,
        fromSeasonId: result.previousSeasonId,
        action: SeasonSwitchAction.ACTIVATE,
        status: SeasonSwitchStatus.SUCCESS,
        performedByUserId: userId,
        warningsJson: readiness.warnings.length > 0
          ? (readiness.warnings as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        summaryJson: { acknowledgeWarnings: dto.acknowledgeWarnings ?? false, note: dto.activationNote ?? null } as unknown as Prisma.InputJsonValue,
      },
    });

    return result.activated;
  }

  async completeSeason(seasonId: string, userId: string | null) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: SEASON_SELECT });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);
    if (season.status === SeasonStatus.COMPLETED) {
      throw new BadRequestException(`Season '${season.name}' is already COMPLETED`);
    }

    const updated = await this.prisma.season.update({
      where: { id: seasonId },
      data: { isActive: false, status: SeasonStatus.COMPLETED },
      select: SEASON_SELECT,
    });

    await this.prisma.seasonSwitchAudit.create({
      data: {
        id: crypto.randomUUID(),
        toSeasonId: seasonId,
        action: SeasonSwitchAction.COMPLETE,
        status: SeasonSwitchStatus.SUCCESS,
        performedByUserId: userId,
      },
    });

    return updated;
  }

  async rollbackSeason(seasonId: string, userId: string | null) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId }, select: SEASON_SELECT });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    // Rollback is only allowed if there is a recent ACTIVATE audit that targeted this season
    const lastActivation = await this.prisma.seasonSwitchAudit.findFirst({
      where: { toSeasonId: seasonId, action: SeasonSwitchAction.ACTIVATE, status: SeasonSwitchStatus.SUCCESS },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastActivation) {
      throw new BadRequestException(`No successful activation found for season '${season.name}' to roll back`);
    }

    if (season.status !== SeasonStatus.ACTIVE) {
      throw new BadRequestException(`Season '${season.name}' is not currently ACTIVE — rollback not applicable`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const deactivated = await tx.season.update({
        where: { id: seasonId },
        data: { isActive: false, status: SeasonStatus.UPCOMING },
        select: SEASON_SELECT,
      });

      let restored = null;
      if (lastActivation.fromSeasonId) {
        restored = await tx.season.update({
          where: { id: lastActivation.fromSeasonId },
          data: { isActive: true, status: SeasonStatus.ACTIVE },
          select: SEASON_SELECT,
        });
      }

      return { deactivated, restored };
    });

    await this.prisma.seasonSwitchAudit.create({
      data: {
        id: crypto.randomUUID(),
        toSeasonId: seasonId,
        fromSeasonId: lastActivation.fromSeasonId,
        action: SeasonSwitchAction.ROLLBACK,
        status: SeasonSwitchStatus.SUCCESS,
        performedByUserId: userId,
        summaryJson: { restoredSeasonId: lastActivation.fromSeasonId ?? null } as unknown as Prisma.InputJsonValue,
      },
    });

    return result;
  }

  async getSwitchHistory(seasonId?: string) {
    return this.prisma.seasonSwitchAudit.findMany({
      ...(seasonId ? { where: { toSeasonId: seasonId } } : {}),
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ── Cross-domain readiness checks ─────────────────────────────────────────

  private async checkSeasonTeams(seasonId: string): Promise<ReadinessCheck> {
    const count = await this.prisma.seasonTeam.count({ where: { seasonId } });
    return {
      domain: 'clubs',
      label: 'Season teams registered',
      severity: 'BLOCKER',
      passed: count >= 2,
      detail: count >= 2 ? `${count} teams registered` : `Only ${count} team(s) — need at least 2`,
    };
  }

  private async checkFixturesCommitted(seasonId: string): Promise<ReadinessCheck> {
    const count = await this.prisma.fixture.count({ where: { seasonId } });
    return {
      domain: 'fixtures',
      label: 'Fixtures loaded',
      severity: 'WARNING',
      passed: count >= 1,
      detail: count >= 1 ? `${count} fixture(s) loaded` : 'No fixtures found — season will have no matches',
    };
  }

  private async checkFixturesPublished(seasonId: string): Promise<ReadinessCheck> {
    const total = await this.prisma.fixture.count({ where: { seasonId } });
    if (total === 0) {
      return { domain: 'fixtures', label: 'Fixtures published', severity: 'INFO', passed: false, detail: 'No fixtures to publish' };
    }
    const published = await this.prisma.fixture.count({ where: { seasonId, isPublished: true } });
    const pct = Math.round((published / total) * 100);
    return {
      domain: 'fixtures',
      label: 'Fixtures published',
      severity: 'WARNING',
      passed: published > 0,
      detail: published > 0 ? `${published}/${total} fixtures published (${pct}%)` : 'No fixtures are published yet',
    };
  }

  private async checkGameweeks(seasonId: string): Promise<ReadinessCheck> {
    const count = await this.prisma.gameweek.count({ where: { seasonId } });
    return {
      domain: 'gameweeks',
      label: 'Gameweeks created',
      severity: 'WARNING',
      passed: count >= 1,
      detail: count >= 1 ? `${count} gameweek(s) defined` : 'No gameweeks — fantasy scoring will not work',
    };
  }

  private async checkFantasyRulesConfig(seasonId: string): Promise<ReadinessCheck> {
    const cfg = await this.prisma.fantasyRulesConfig.findUnique({ where: { seasonId } });
    return {
      domain: 'fantasy',
      label: 'Fantasy rules configured',
      severity: 'WARNING',
      passed: cfg !== null,
      detail: cfg ? 'Fantasy rules config present' : 'No FantasyRulesConfig — fantasy team creation will fail',
    };
  }

  private async checkFantasyPlayerPrices(seasonId: string): Promise<ReadinessCheck> {
    const count = await this.prisma.fantasyPlayerPrice.count({ where: { seasonId } });
    return {
      domain: 'fantasy',
      label: 'Player prices set',
      severity: 'WARNING',
      passed: count >= 11,
      detail: count >= 11 ? `${count} player price(s) set` : `${count} player price(s) — need at least 11 for squad selection`,
    };
  }

  private async checkClubProfiles(seasonId: string): Promise<ReadinessCheck> {
    const teams = await this.prisma.seasonTeam.findMany({ where: { seasonId }, select: { teamId: true } });
    if (teams.length === 0) {
      return { domain: 'clubs', label: 'Club profiles complete', severity: 'INFO', passed: false, detail: 'No teams in season' };
    }
    const teamIds = teams.map((t) => t.teamId);
    const profileCount = await this.prisma.clubProfile.count({ where: { teamId: { in: teamIds } } });
    const passed = profileCount >= teams.length;
    return {
      domain: 'clubs',
      label: 'Club profiles complete',
      severity: 'INFO',
      passed,
      detail: passed
        ? `All ${teams.length} clubs have profiles`
        : `${profileCount}/${teams.length} clubs have profiles`,
    };
  }

  private async checkPredictionReadiness(seasonId: string): Promise<ReadinessCheck> {
    const config = await this.prisma.predictionRulesConfig.findUnique({ where: { seasonId } });
    return {
      domain: 'predictions',
      label: 'Prediction rules configured',
      severity: 'WARNING',
      passed: config !== null,
      detail: config
        ? `Prediction rules configured (${config.status})`
        : 'No PredictionRulesConfig — create provisional prediction rules before activation',
    };
  }

  private async checkMatchdayOperationsReadiness(seasonId: string): Promise<ReadinessCheck> {
    const [gameweeksCount, publishedFixtures] = await Promise.all([
      this.prisma.gameweek.count({ where: { seasonId } }),
      this.prisma.fixture.count({ where: { seasonId, isPublished: true } }),
    ]);

    if (gameweeksCount === 0) {
      return {
        domain: 'matchday',
        label: 'Matchday operations ready',
        severity: 'WARNING',
        passed: false,
        detail: 'No gameweeks — derive gameweeks from fixtures before activation',
      };
    }

    const passed = publishedFixtures > 0;
    return {
      domain: 'matchday',
      label: 'Matchday operations ready',
      severity: 'WARNING',
      passed,
      detail: passed
        ? `${gameweeksCount} gameweek(s) ready, ${publishedFixtures} published fixture(s)`
        : 'Gameweeks exist but no published fixtures — publish fixtures before activation',
    };
  }

  private async checkEngagementSeasonScope(seasonId: string): Promise<ReadinessCheck> {
    const [directCount, unscopedCount] = await Promise.all([
      this.prisma.fanValueLedger.count({ where: { seasonId } }),
      this.prisma.fanValueLedger.count({ where: { seasonId: null } }),
    ]);

    const trulyBlockingUnscoped = unscopedCount > 100;

    return {
      domain: 'engagement',
      label: 'Engagement season scope clean',
      severity: 'WARNING',
      passed: !trulyBlockingUnscoped,
      detail: trulyBlockingUnscoped
        ? `${unscopedCount} fan value entries have null seasonId — review unscoped ledger before activation (/admin/engagement/${seasonId}/unscoped-ledger)`
        : directCount > 0
          ? `${directCount} fan value entries scoped to this season. ${unscopedCount} legacy unscoped entries (admin-visible only).`
          : `No fan value entries yet for this season. ${unscopedCount} legacy unscoped entries (admin-visible only, normal for new seasons).`,
    };
  }
}
