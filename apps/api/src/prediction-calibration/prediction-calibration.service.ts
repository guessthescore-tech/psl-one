import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PredictionRulesStatus } from '@prisma/client';

export interface UpdatePredictionRulesDto {
  correctScorePoints?: number;
  correctGoalDifferencePoints?: number;
  correctResultPoints?: number;
  participationPoints?: number;
  challengeWinPoints?: number;
  challengeDrawPoints?: number;
  lockMinutesBeforeKickoff?: number;
  status?: PredictionRulesStatus;
}

export type CalibrationReadinessStatus = 'READY' | 'READY_WITH_WARNINGS' | 'BLOCKED';

export interface CalibrationCheck {
  domain: string;
  label: string;
  severity: 'BLOCKER' | 'WARNING' | 'INFO';
  passed: boolean;
  detail: string;
}

const PSL_DEFAULT_RULES = {
  correctScorePoints: 10,
  correctGoalDifferencePoints: 5,
  correctResultPoints: 3,
  participationPoints: 0,
  challengeWinPoints: 0,
  challengeDrawPoints: 0,
  lockMinutesBeforeKickoff: 0,
  status: PredictionRulesStatus.PROVISIONAL,
} as const;

@Injectable()
export class PredictionCalibrationService {
  constructor(private readonly prisma: PrismaService) {}

  async getCalibrationSeasons() {
    const seasons = await this.prisma.season.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        isActive: true,
        startDate: true,
        predictionRulesConfig: { select: { id: true, status: true } },
        _count: {
          select: { fixtures: true },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return seasons.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      status: s.status,
      isActive: s.isActive,
      startDate: s.startDate,
      hasPredictionRulesConfig: s.predictionRulesConfig !== null,
      rulesStatus: s.predictionRulesConfig?.status ?? null,
      totalFixtures: s._count.fixtures,
    }));
  }

  async getCalibrationReadiness(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true, name: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const checks: CalibrationCheck[] = await Promise.all([
      this.checkPredictionRulesConfig(seasonId),
      this.checkPublishedFixtures(seasonId),
      this.checkFixtureKickoffTimes(seasonId),
      this.checkPendingPredictions(seasonId),
      this.checkLockedPredictions(seasonId),
    ]);

    const blockers = checks.filter((c) => c.severity === 'BLOCKER' && !c.passed);
    const warnings = checks.filter((c) => c.severity === 'WARNING' && !c.passed);

    let activationStatus: CalibrationReadinessStatus = 'READY';
    if (blockers.length > 0) activationStatus = 'BLOCKED';
    else if (warnings.length > 0) activationStatus = 'READY_WITH_WARNINGS';

    return {
      seasonId,
      seasonName: season.name,
      activationStatus,
      checks,
      blockers,
      warnings,
    };
  }

  async getPredictionRules(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true, name: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const config = await this.prisma.predictionRulesConfig.findUnique({ where: { seasonId } });
    return { seasonId, seasonName: season.name, config };
  }

  async createProvisionalRules(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true, name: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const config = await this.prisma.predictionRulesConfig.upsert({
      where: { seasonId },
      create: { seasonId, ...PSL_DEFAULT_RULES },
      update: {},
    });
    return { seasonId, seasonName: season.name, config, provisional: true };
  }

  async updatePredictionRules(seasonId: string, dto: UpdatePredictionRulesDto) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true, name: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const config = await this.prisma.predictionRulesConfig.upsert({
      where: { seasonId },
      create: { seasonId, ...PSL_DEFAULT_RULES, ...dto },
      update: { ...dto },
    });
    return { seasonId, seasonName: season.name, config };
  }

  async getFixtureEligibility(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true, name: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const fixtures = await this.prisma.fixture.findMany({
      where: { seasonId },
      select: {
        id: true,
        isPublished: true,
        kickoffAt: true,
        status: true,
        round: true,
        homeTeam: { select: { name: true, shortName: true } },
        awayTeam: { select: { name: true, shortName: true } },
        gameweek: { select: { id: true, name: true, predictionDeadlineAt: true } },
        _count: { select: { predictions: true } },
      },
      orderBy: { kickoffAt: 'asc' },
    });

    const now = new Date();
    return {
      seasonId,
      seasonName: season.name,
      fixtures: fixtures.map((f) => {
        const eligibilityReasons: string[] = [];
        if (!f.isPublished) eligibilityReasons.push('Fixture not published');
        if (f.status === 'FINISHED' || f.status === 'CANCELLED' || f.status === 'POSTPONED') {
          eligibilityReasons.push(`Fixture status: ${f.status}`);
        }
        if (f.kickoffAt <= now) {
          eligibilityReasons.push('Kickoff has passed');
        }
        const isEligible = eligibilityReasons.length === 0;
        return {
          id: f.id,
          isPublished: f.isPublished,
          kickoffAt: f.kickoffAt,
          status: f.status,
          round: f.round,
          homeTeam: f.homeTeam.name,
          awayTeam: f.awayTeam.name,
          gameweekName: f.gameweek?.name ?? null,
          predictionDeadlineAt: f.gameweek?.predictionDeadlineAt ?? null,
          existingPredictions: f._count.predictions,
          isEligible,
          eligibilityReasons,
        };
      }),
    };
  }

  async getLockReadiness(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true, name: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const fixtures = await this.prisma.fixture.findMany({
      where: { seasonId, isPublished: true },
      select: {
        id: true,
        kickoffAt: true,
        status: true,
        gameweek: { select: { name: true, predictionDeadlineAt: true } },
        _count: {
          select: {
            predictions: true,
          },
        },
      },
      orderBy: { kickoffAt: 'asc' },
    });

    const now = new Date();
    const LOCKED_STATUSES = ['LIVE', 'HALF_TIME', 'FINISHED', 'POSTPONED', 'CANCELLED'];

    const summary = fixtures.map((f) => {
      const isLockedByStatus = LOCKED_STATUSES.includes(f.status);
      const isLockedByKickoff = f.kickoffAt <= now;
      const deadlineAt = f.gameweek?.predictionDeadlineAt;
      const isLockedByDeadline = deadlineAt ? deadlineAt <= now : false;
      const isLocked = isLockedByStatus || isLockedByKickoff || isLockedByDeadline;

      return {
        id: f.id,
        kickoffAt: f.kickoffAt,
        status: f.status,
        gameweekName: f.gameweek?.name ?? null,
        predictionDeadlineAt: deadlineAt ?? null,
        isLocked,
        lockReason: isLockedByStatus
          ? 'FIXTURE_STATUS'
          : isLockedByDeadline
            ? 'GAMEWEEK_DEADLINE'
            : isLockedByKickoff
              ? 'KICKOFF_PASSED'
              : 'OPEN',
        pendingPredictions: f._count.predictions,
      };
    });

    return {
      seasonId,
      seasonName: season.name,
      totalPublished: fixtures.length,
      totalLocked: summary.filter((f) => f.isLocked).length,
      totalOpen: summary.filter((f) => !f.isLocked).length,
      fixtures: summary,
    };
  }

  async getSettlementReadiness(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true, name: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const fixtures = await this.prisma.fixture.findMany({
      where: { seasonId, isPublished: true },
      select: {
        id: true,
        kickoffAt: true,
        status: true,
        homeScore: true,
        awayScore: true,
        homeTeam: { select: { shortName: true } },
        awayTeam: { select: { shortName: true } },
        gameweek: { select: { name: true } },
        _count: {
          select: {
            predictions: true,
          },
        },
      },
      orderBy: { kickoffAt: 'asc' },
    });

    const summary = fixtures.map((f) => {
      const hasResult = f.homeScore !== null && f.awayScore !== null;
      const canSettle = f.status === 'FINISHED' && hasResult;
      return {
        id: f.id,
        kickoffAt: f.kickoffAt,
        status: f.status,
        match: `${f.homeTeam.shortName} vs ${f.awayTeam.shortName}`,
        hasResult,
        result: hasResult ? `${f.homeScore}-${f.awayScore}` : null,
        canSettle,
        gameweekName: f.gameweek?.name ?? null,
        totalPredictions: f._count.predictions,
      };
    });

    return {
      seasonId,
      seasonName: season.name,
      totalPublished: fixtures.length,
      readyToSettle: summary.filter((f) => f.canSettle).length,
      awaitingResult: summary.filter((f) => f.status === 'FINISHED' && !f.hasResult).length,
      notYetFinished: summary.filter((f) => f.status !== 'FINISHED').length,
      fixtures: summary,
    };
  }

  async getPeerChallengeReadiness(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true, name: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const publishedFixtureIds = await this.prisma.fixture
      .findMany({
        where: { seasonId, isPublished: true },
        select: { id: true },
      })
      .then((rows) => rows.map((r) => r.id));

    const [pendingChallenges, acceptedChallenges, settledChallenges] = await Promise.all([
      this.prisma.peerChallenge.count({
        where: { fixtureId: { in: publishedFixtureIds }, status: 'PENDING' },
      }),
      this.prisma.peerChallenge.count({
        where: { fixtureId: { in: publishedFixtureIds }, status: 'ACCEPTED' },
      }),
      this.prisma.peerChallenge.count({
        where: { fixtureId: { in: publishedFixtureIds }, status: 'SETTLED' },
      }),
    ]);

    return {
      seasonId,
      seasonName: season.name,
      publishedFixtures: publishedFixtureIds.length,
      pendingChallenges,
      acceptedChallenges,
      settledChallenges,
    };
  }

  async getActivationImpact(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true, name: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const [totalFixtures, publishedFixtures, rulesConfig] = await Promise.all([
      this.prisma.fixture.count({ where: { seasonId } }),
      this.prisma.fixture.count({ where: { seasonId, isPublished: true } }),
      this.prisma.predictionRulesConfig.findUnique({ where: { seasonId } }),
    ]);

    const publishedIds = await this.prisma.fixture
      .findMany({ where: { seasonId, isPublished: true }, select: { id: true } })
      .then((rows) => rows.map((r) => r.id));

    const [totalPredictions, lockedPredictions, settledPredictions] = await Promise.all([
      this.prisma.scorePrediction.count({ where: { fixtureId: { in: publishedIds } } }),
      this.prisma.scorePrediction.count({ where: { fixtureId: { in: publishedIds }, status: 'LOCKED' } }),
      this.prisma.scorePrediction.count({
        where: {
          fixtureId: { in: publishedIds },
          status: { in: ['WON', 'LOST', 'SETTLED'] },
        },
      }),
    ]);

    return {
      seasonId,
      seasonName: season.name,
      fixtures: { total: totalFixtures, published: publishedFixtures, unpublished: totalFixtures - publishedFixtures },
      rulesConfig: rulesConfig
        ? {
            status: rulesConfig.status,
            correctScorePoints: rulesConfig.correctScorePoints,
            correctGoalDifferencePoints: rulesConfig.correctGoalDifferencePoints,
            correctResultPoints: rulesConfig.correctResultPoints,
          }
        : null,
      predictions: { total: totalPredictions, locked: lockedPredictions, settled: settledPredictions },
    };
  }

  // ── Private readiness checks ────────────────────────────────────────────────

  private async checkPredictionRulesConfig(seasonId: string): Promise<CalibrationCheck> {
    const config = await this.prisma.predictionRulesConfig.findUnique({ where: { seasonId } });
    return {
      domain: 'predictions',
      label: 'Prediction rules configured',
      severity: 'WARNING',
      passed: config !== null,
      detail: config
        ? `Rules configured (${config.status}): ${config.correctScorePoints}/${config.correctGoalDifferencePoints}/${config.correctResultPoints} pts`
        : 'No PredictionRulesConfig — create provisional rules to calibrate scoring',
    };
  }

  private async checkPublishedFixtures(seasonId: string): Promise<CalibrationCheck> {
    const [total, published] = await Promise.all([
      this.prisma.fixture.count({ where: { seasonId } }),
      this.prisma.fixture.count({ where: { seasonId, isPublished: true } }),
    ]);
    if (total === 0) {
      return { domain: 'fixtures', label: 'Published fixtures', severity: 'WARNING', passed: false, detail: 'No fixtures in season' };
    }
    return {
      domain: 'fixtures',
      label: 'Published fixtures',
      severity: 'WARNING',
      passed: published > 0,
      detail: published > 0
        ? `${published}/${total} fixtures published`
        : 'No published fixtures — fans cannot make predictions',
    };
  }

  private async checkFixtureKickoffTimes(seasonId: string): Promise<CalibrationCheck> {
    const upcoming = await this.prisma.fixture.count({
      where: { seasonId, isPublished: true, kickoffAt: { gt: new Date() } },
    });
    return {
      domain: 'fixtures',
      label: 'Upcoming published fixtures',
      severity: 'INFO',
      passed: upcoming > 0,
      detail: upcoming > 0
        ? `${upcoming} published fixture(s) with future kickoff time`
        : 'No published fixtures with future kickoff — prediction window may be closed',
    };
  }

  private async checkPendingPredictions(seasonId: string): Promise<CalibrationCheck> {
    const publishedIds = await this.prisma.fixture
      .findMany({ where: { seasonId, isPublished: true }, select: { id: true } })
      .then((rows) => rows.map((r) => r.id));
    const count = publishedIds.length
      ? await this.prisma.scorePrediction.count({ where: { fixtureId: { in: publishedIds }, status: 'PENDING' } })
      : 0;
    return {
      domain: 'predictions',
      label: 'Pending predictions',
      severity: 'INFO',
      passed: true,
      detail: count > 0 ? `${count} pending prediction(s) for published fixtures` : 'No pending predictions yet',
    };
  }

  private async checkLockedPredictions(seasonId: string): Promise<CalibrationCheck> {
    const publishedIds = await this.prisma.fixture
      .findMany({ where: { seasonId, isPublished: true }, select: { id: true } })
      .then((rows) => rows.map((r) => r.id));
    const count = publishedIds.length
      ? await this.prisma.scorePrediction.count({ where: { fixtureId: { in: publishedIds }, status: 'LOCKED' } })
      : 0;
    return {
      domain: 'predictions',
      label: 'Locked predictions',
      severity: 'INFO',
      passed: true,
      detail: count > 0 ? `${count} locked prediction(s) awaiting settlement` : 'No locked predictions',
    };
  }
}
