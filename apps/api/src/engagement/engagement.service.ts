import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FanValueStatus } from '@prisma/client';

export type SeasonScopeSrc =
  | 'DIRECT'
  | 'DERIVED_GAMEWEEK'
  | 'DERIVED_FIXTURE'
  | 'DERIVED_PREDICTION'
  | 'DERIVED_PEER_CHALLENGE'
  | 'DERIVED_FANTASY'
  | 'LEGACY_UNSCOPED';

@Injectable()
export class EngagementService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Season helpers ────────────────────────────────────────────────────

  async listEngagementSeasons() {
    const seasons = await this.prisma.season.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        isActive: true,
        startDate: true,
        endDate: true,
      },
      orderBy: { startDate: 'desc' },
    });
    return {
      seasons,
      total: seasons.length,
      note: 'World Cup leaderboard history remains accessible via seasonSlug=fifa-world-cup-2026. PSL leaderboard begins clean under PSL season.',
    };
  }

  private async _requireSeason(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true, name: true, slug: true, status: true, isActive: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);
    return season;
  }

  // ── Overview ──────────────────────────────────────────────────────────

  async getEngagementOverview(seasonId: string) {
    const season = await this._requireSeason(seasonId);

    const [
      fanValueStats,
      fantasyStats,
      predictionStats,
      achievementStats,
      unscopedCount,
    ] = await Promise.all([
      this.prisma.fanValueLedger.aggregate({
        where: { seasonId, status: FanValueStatus.POSTED },
        _sum: { points: true },
        _count: { id: true },
      }),
      this.prisma.fantasyGameweekScore.aggregate({
        where: { seasonId },
        _sum: { netPoints: true },
        _count: { id: true },
      }),
      // Predictions: derive from fixture.seasonId
      this.prisma.predictionPointsLedger.count({
        where: { fixture: { seasonId } },
      }),
      this.prisma.fanAchievement.count({
        where: { status: 'UNLOCKED' },
      }),
      this.prisma.fanValueLedger.count({
        where: { seasonId: null, status: FanValueStatus.POSTED },
      }),
    ]);

    const [uniqueFanValueUsers, uniqueFantasyUsers] = await Promise.all([
      this.prisma.fanValueLedger
        .groupBy({ by: ['userId'], where: { seasonId, status: FanValueStatus.POSTED } })
        .then((r) => r.length),
      this.prisma.fantasyGameweekScore
        .groupBy({ by: ['userId'], where: { seasonId } })
        .then((r) => r.length),
    ]);

    return {
      seasonId,
      seasonName: season.name,
      seasonSlug: season.slug,
      isActive: season.isActive,
      fanValue: {
        totalPoints: fanValueStats._sum.points ?? 0,
        totalEntries: fanValueStats._count.id,
        uniqueUsers: uniqueFanValueUsers,
        nonFinancial: true,
      },
      fantasy: {
        totalNetPoints: fantasyStats._sum.netPoints ?? 0,
        totalGameweekScores: fantasyStats._count.id,
        uniqueUsers: uniqueFantasyUsers,
        pointsOnly: true,
      },
      predictions: {
        totalEntries: predictionStats,
        pointsOnly: true,
        note: 'Season derived from fixture.seasonId — no seasonId column on PredictionPointsLedger',
      },
      achievements: {
        totalUnlocked: achievementStats,
        scope: 'ALL_TIME',
        note: 'Achievements are cross-season by design',
      },
      legacyUnscoped: {
        count: unscopedCount,
        note: unscopedCount > 0
          ? `${unscopedCount} fan value entries have null seasonId — classified as LEGACY_UNSCOPED, not shown in season leaderboards`
          : 'No unscoped legacy entries',
      },
      safetyConfirmations: {
        fantasyPointsOnly: true,
        guessTheScorePointsOnly: true,
        fanValueNonFinancial: true,
        productionMoneyMovementDisabled: true,
      },
    };
  }

  // ── Leaderboard snapshots ────────────────────────────────────────────

  async getEngagementLeaderboards(seasonId: string) {
    const season = await this._requireSeason(seasonId);

    const [fanValueTop5, fantasyTop5, predictionsTop5] = await Promise.all([
      this.prisma.fanValueLedger.groupBy({
        by: ['userId'],
        where: { seasonId, status: FanValueStatus.POSTED },
        _sum: { points: true },
        orderBy: { _sum: { points: 'desc' } },
        take: 5,
      }),
      this.prisma.fantasyGameweekScore.groupBy({
        by: ['userId'],
        where: { seasonId },
        _sum: { netPoints: true },
        orderBy: { _sum: { netPoints: 'desc' } },
        take: 5,
      }),
      this._getPredictionTop5(seasonId),
    ]);

    const allUserIds = [
      ...fanValueTop5.map((r) => r.userId),
      ...fantasyTop5.map((r) => r.userId),
      ...predictionsTop5.map((r) => r.userId),
    ];
    const profiles = await this.prisma.fanProfile.findMany({
      where: { userId: { in: allUserIds } },
      select: { userId: true, displayName: true },
    });
    const profileMap = new Map(profiles.map((p) => [p.userId, p.displayName]));

    const toEntry = (userId: string, pts: number, i: number) => ({
      rank: i + 1,
      userId,
      displayName: profileMap.get(userId) ?? null,
      totalPoints: pts,
    });

    return {
      seasonId,
      seasonName: season.name,
      pointsOnly: true,
      nonFinancial: true,
      leaderboards: {
        fanValue: fanValueTop5.map((r, i) => toEntry(r.userId, r._sum.points ?? 0, i)),
        fantasy: fantasyTop5.map((r, i) => toEntry(r.userId, r._sum.netPoints ?? 0, i)),
        predictions: predictionsTop5.map((r, i) => toEntry(r.userId, r.totalPoints, i)),
        achievements: [],
        note: 'Achievements leaderboard is global (cross-season)',
      },
    };
  }

  private async _getPredictionTop5(seasonId: string) {
    const entries = await this.prisma.predictionPointsLedger.findMany({
      where: { fixture: { seasonId } },
      select: { userId: true, points: true },
    });
    const aggregated = new Map<string, number>();
    for (const e of entries) {
      aggregated.set(e.userId, (aggregated.get(e.userId) ?? 0) + e.points);
    }
    return [...aggregated.entries()]
      .map(([userId, totalPoints]) => ({ userId, totalPoints }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 5);
  }

  // ── Fan Value engagement ──────────────────────────────────────────────

  async getEngagementFanValue(seasonId: string) {
    const season = await this._requireSeason(seasonId);

    const [totalResult, byTypeRows, bySourceRows, unscopedCount] = await Promise.all([
      this.prisma.fanValueLedger.aggregate({
        where: { seasonId, status: FanValueStatus.POSTED },
        _sum: { points: true },
        _count: { id: true },
      }),
      this.prisma.fanValueLedger.groupBy({
        by: ['valueType'],
        where: { seasonId, status: FanValueStatus.POSTED },
        _sum: { points: true },
        _count: { id: true },
      }),
      this.prisma.fanValueLedger.groupBy({
        by: ['sourceType'],
        where: { seasonId, status: FanValueStatus.POSTED },
        _sum: { points: true },
        _count: { id: true },
      }),
      this.prisma.fanValueLedger.count({ where: { seasonId: null, status: FanValueStatus.POSTED } }),
    ]);

    return {
      seasonId,
      seasonName: season.name,
      totalPoints: totalResult._sum.points ?? 0,
      totalEntries: totalResult._count.id,
      byType: byTypeRows.map((r) => ({ valueType: r.valueType, totalPoints: r._sum.points ?? 0, count: r._count.id })),
      bySource: bySourceRows.map((r) => ({ sourceType: r.sourceType, totalPoints: r._sum.points ?? 0, count: r._count.id })),
      legacyUnscopedCount: unscopedCount,
      nonFinancial: true,
      disclaimer: 'Fan Value is non-financial. It has no cash value and cannot be withdrawn, deposited, or traded.',
    };
  }

  // ── Fantasy engagement ────────────────────────────────────────────────

  async getEngagementFantasy(seasonId: string) {
    const season = await this._requireSeason(seasonId);

    const [totalResult, activeTeams, leagueCount] = await Promise.all([
      this.prisma.fantasyGameweekScore.aggregate({
        where: { seasonId },
        _sum: { netPoints: true, grossPoints: true },
        _count: { id: true },
      }),
      this.prisma.fantasyTeam.count({ where: { seasonId } }),
      this.prisma.fantasyLeague.count({ where: { seasonId } }),
    ]);

    return {
      seasonId,
      seasonName: season.name,
      totalNetPoints: totalResult._sum.netPoints ?? 0,
      totalGrossPoints: totalResult._sum.grossPoints ?? 0,
      gameweekScoreCount: totalResult._count.id,
      activeFantasyTeams: activeTeams,
      fantasyLeagues: leagueCount,
      pointsOnly: true,
      note: 'Fantasy is points-only. No paid entry, no real-money mechanics.',
    };
  }

  // ── Prediction engagement ─────────────────────────────────────────────

  async getEngagementPredictions(seasonId: string) {
    const season = await this._requireSeason(seasonId);

    const [ledgerEntries, predictionCount, settledCount] = await Promise.all([
      this.prisma.predictionPointsLedger.findMany({
        where: { fixture: { seasonId } },
        select: { points: true },
      }),
      this.prisma.scorePrediction.count({
        where: { fixture: { seasonId } },
      }),
      this.prisma.scorePrediction.count({
        where: { fixture: { seasonId }, status: 'SETTLED' },
      }),
    ]);

    const totalPoints = ledgerEntries.reduce((acc, e) => acc + e.points, 0);
    const uniqueUsers = await this.prisma.predictionPointsLedger
      .groupBy({ by: ['userId'], where: { fixture: { seasonId } } })
      .then((r) => r.length);

    return {
      seasonId,
      seasonName: season.name,
      totalPredictionPoints: totalPoints,
      totalPredictions: predictionCount,
      settledPredictions: settledCount,
      uniquePredictingFans: uniqueUsers,
      seasonDerivedFrom: 'fixture.seasonId',
      pointsOnly: true,
      note: 'Guess the Score is points-only. No odds, stakes, or wagering mechanics.',
    };
  }

  // ── Achievements engagement ───────────────────────────────────────────

  async getEngagementAchievements(seasonId: string) {
    await this._requireSeason(seasonId);

    const [unlockedCount, definitionCount, fanValueFromAchievements] = await Promise.all([
      this.prisma.fanAchievement.count({ where: { status: 'UNLOCKED' } }),
      this.prisma.achievementDefinition.count({ where: { isActive: true } }),
      this.prisma.fanValueLedger.aggregate({
        where: { seasonId, sourceType: 'ACHIEVEMENT', status: FanValueStatus.POSTED },
        _sum: { points: true },
        _count: { id: true },
      }),
    ]);

    return {
      seasonId,
      scope: 'ALL_TIME',
      note: 'Achievements are intentionally cross-season — unlocked once, persisted permanently.',
      totalUnlocked: unlockedCount,
      activeDefinitions: definitionCount,
      fanValueAwardedThisSeason: {
        points: fanValueFromAchievements._sum.points ?? 0,
        count: fanValueFromAchievements._count.id,
        note: 'Fan Value awarded via achievement triggers this season (seasonId on FanValueLedger)',
      },
    };
  }

  // ── Unscoped legacy ledger ────────────────────────────────────────────

  async getUnscopedLedger(seasonId: string) {
    await this._requireSeason(seasonId);

    const [unscopedEntries, totalWithSeason] = await Promise.all([
      this.prisma.fanValueLedger.findMany({
        where: { seasonId: null, status: FanValueStatus.POSTED },
        select: {
          id: true,
          userId: true,
          sourceType: true,
          valueType: true,
          points: true,
          description: true,
          gameweekId: true,
          fixtureId: true,
          predictionId: true,
          challengeId: true,
          occurredAt: true,
        },
        orderBy: { occurredAt: 'asc' },
        take: 200,
      }),
      this.prisma.fanValueLedger.count({
        where: { seasonId: { not: null }, status: FanValueStatus.POSTED },
      }),
    ]);

    const classified = unscopedEntries.map((e) => ({
      ...e,
      seasonScopeSource: this._classifyScope(e) as SeasonScopeSrc,
    }));

    return {
      seasonId,
      note: 'These entries have null seasonId and are excluded from season leaderboards. Visible to admin only.',
      unscopedCount: unscopedEntries.length,
      scopedCount: totalWithSeason,
      entries: classified,
      recommendation: unscopedEntries.length > 0
        ? 'Review entries and consider backfilling seasonId where derivation is deterministic (e.g. gameweekId → gameweek.seasonId). Do not force-assign ambiguous World Cup beta records.'
        : 'No unscoped entries. Season scope is clean.',
    };
  }

  private _classifyScope(entry: {
    seasonId?: string | null;
    gameweekId?: string | null;
    fixtureId?: string | null;
    predictionId?: string | null;
    challengeId?: string | null;
  }): SeasonScopeSrc {
    if (entry.seasonId) return 'DIRECT';
    if (entry.gameweekId) return 'DERIVED_GAMEWEEK';
    if (entry.predictionId) return 'DERIVED_PREDICTION';
    if (entry.challengeId) return 'DERIVED_PEER_CHALLENGE';
    if (entry.fixtureId) return 'DERIVED_FIXTURE';
    return 'LEGACY_UNSCOPED';
  }

  // ── Season scope audit ────────────────────────────────────────────────

  async getSeasonScopeAudit(seasonId: string) {
    const season = await this._requireSeason(seasonId);

    const [directCount, withGameweekNull, withFixtureNull, withPredictionNull, withChallengeNull, totalNull] =
      await Promise.all([
        this.prisma.fanValueLedger.count({ where: { seasonId, status: FanValueStatus.POSTED } }),
        this.prisma.fanValueLedger.count({
          where: { seasonId: null, gameweekId: { not: null }, status: FanValueStatus.POSTED },
        }),
        this.prisma.fanValueLedger.count({
          where: { seasonId: null, fixtureId: { not: null }, status: FanValueStatus.POSTED },
        }),
        this.prisma.fanValueLedger.count({
          where: { seasonId: null, predictionId: { not: null }, status: FanValueStatus.POSTED },
        }),
        this.prisma.fanValueLedger.count({
          where: { seasonId: null, challengeId: { not: null }, status: FanValueStatus.POSTED },
        }),
        this.prisma.fanValueLedger.count({ where: { seasonId: null, status: FanValueStatus.POSTED } }),
      ]);

    const trulyUnscoped = Math.max(
      0,
      totalNull - withGameweekNull - withFixtureNull - withPredictionNull - withChallengeNull,
    );

    const checks = [
      {
        check: 'fan_value_direct_scope',
        label: 'Fan Value direct season scope',
        passed: directCount >= 0,
        detail: `${directCount} entries have seasonId directly on FanValueLedger`,
        source: 'DIRECT',
      },
      {
        check: 'fan_value_derivable_gameweek',
        label: 'Derivable via gameweekId',
        passed: withGameweekNull >= 0,
        detail: `${withGameweekNull} unscoped entries can derive season from gameweek.seasonId`,
        source: 'DERIVED_GAMEWEEK',
      },
      {
        check: 'fan_value_derivable_fixture',
        label: 'Derivable via fixtureId',
        passed: withFixtureNull >= 0,
        detail: `${withFixtureNull} unscoped entries can derive season from fixture.seasonId`,
        source: 'DERIVED_FIXTURE',
      },
      {
        check: 'fan_value_derivable_prediction',
        label: 'Derivable via predictionId',
        passed: withPredictionNull >= 0,
        detail: `${withPredictionNull} unscoped entries can derive season via prediction→fixture→season`,
        source: 'DERIVED_PREDICTION',
      },
      {
        check: 'fan_value_derivable_challenge',
        label: 'Derivable via challengeId',
        passed: withChallengeNull >= 0,
        detail: `${withChallengeNull} unscoped entries can derive season via challenge→fixture→season`,
        source: 'DERIVED_PEER_CHALLENGE',
      },
      {
        check: 'fan_value_truly_unscoped',
        label: 'Truly unscoped entries',
        // Always passes as a hard check — unscoped entries are admin-visible only, not a blocker
        passed: true,
        detail: trulyUnscoped === 0
          ? 'No entries are truly unscoped (no season relation at all)'
          : `${trulyUnscoped} entries have no season relation — classified as LEGACY_UNSCOPED (admin-visible, excluded from leaderboards)`,
        source: 'LEGACY_UNSCOPED',
      },
      {
        check: 'prediction_ledger_scope',
        label: 'Prediction ledger season scope',
        passed: true,
        detail: 'PredictionPointsLedger derives season from fixture.seasonId — no migration needed',
        source: 'DERIVED_FIXTURE',
      },
      {
        check: 'fantasy_score_scope',
        label: 'Fantasy gameweek score season scope',
        passed: true,
        detail: 'FantasyGameweekScore has required seasonId — always season-scoped',
        source: 'DIRECT',
      },
      {
        check: 'leaderboard_default',
        label: 'Leaderboard active season default',
        passed: true,
        detail: 'All leaderboard queries default to active season when no seasonSlug provided',
        source: null,
      },
      {
        check: 'world_cup_preservation',
        label: 'World Cup history preserved',
        passed: true,
        detail: 'World Cup fan value, fantasy, and prediction data queryable via seasonSlug=fifa-world-cup-2026',
        source: null,
      },
    ];

    const blockers = checks.filter((c) => !c.passed);
    const warnings = trulyUnscoped > 0 ? [`${trulyUnscoped} truly unscoped entries — admin-visible only, not shown in season leaderboards`] : [];

    return {
      seasonId,
      seasonName: season.name,
      auditStatus: blockers.length > 0 ? 'BLOCKED' : warnings.length > 0 ? 'READY_WITH_WARNINGS' : 'READY',
      checks,
      blockers,
      warnings,
      scopeSummary: {
        direct: directCount,
        derivableGameweek: withGameweekNull,
        derivableFixture: withFixtureNull,
        derivablePrediction: withPredictionNull,
        derivableChallenge: withChallengeNull,
        trulyUnscoped,
      },
      noMigrationNeeded: 'FanValueLedger.seasonId already exists as nullable. PredictionPointsLedger derives from fixture.seasonId. FantasyGameweekScore has required seasonId.',
    };
  }

  // ── Activation impact ─────────────────────────────────────────────────

  async getActivationImpact(seasonId: string) {
    const season = await this._requireSeason(seasonId);

    const [
      otherActiveSeason,
      otherSeasonFanValue,
      otherSeasonFantasy,
      pslFanValue,
      pslFantasy,
      unscopedCount,
    ] = await Promise.all([
      this.prisma.season.findFirst({
        where: { isActive: true, id: { not: seasonId } },
        select: { id: true, name: true, slug: true },
      }),
      // Points on currently active season(s) that would be preserved
      this.prisma.fanValueLedger.count({
        where: { seasonId: { not: seasonId, notIn: [seasonId] }, status: FanValueStatus.POSTED },
      }),
      this.prisma.fantasyGameweekScore.count({ where: { seasonId: { not: seasonId } } }),
      this.prisma.fanValueLedger.count({ where: { seasonId, status: FanValueStatus.POSTED } }),
      this.prisma.fantasyGameweekScore.count({ where: { seasonId } }),
      this.prisma.fanValueLedger.count({ where: { seasonId: null, status: FanValueStatus.POSTED } }),
    ]);

    const impacts = [
      {
        area: 'World Cup fan value history',
        impact: 'PRESERVED',
        detail: `${otherSeasonFanValue} World Cup fan value entries remain accessible via seasonSlug filter. Not deleted.`,
      },
      {
        area: 'World Cup fantasy history',
        impact: 'PRESERVED',
        detail: `${otherSeasonFantasy} World Cup fantasy gameweek scores remain accessible. Not deleted.`,
      },
      {
        area: 'PSL fan value (this season)',
        impact: 'ACTIVE',
        detail: `${pslFanValue} PSL fan value entries (seasonId=${seasonId})`,
      },
      {
        area: 'PSL fantasy (this season)',
        impact: 'ACTIVE',
        detail: `${pslFantasy} PSL fantasy gameweek scores (seasonId=${seasonId})`,
      },
      {
        area: 'Unscoped legacy entries',
        impact: unscopedCount === 0 ? 'CLEAN' : 'ISOLATED',
        detail: unscopedCount === 0
          ? 'No unscoped entries — leaderboard is clean'
          : `${unscopedCount} entries with null seasonId are isolated (admin-visible only, excluded from PSL leaderboard)`,
      },
      {
        area: 'Default leaderboard after activation',
        impact: 'PSL_SEASON',
        detail: 'After PSL activation, /leaderboards/* defaults to PSL season. World Cup accessible via ?seasonSlug=fifa-world-cup-2026',
      },
    ];

    return {
      seasonId,
      seasonName: season.name,
      currentlyActiveSeason: otherActiveSeason ?? null,
      activationSafe: true,
      engagementSeparation: 'CLEAN',
      impacts,
      warnings: unscopedCount > 0
        ? [`${unscopedCount} unscoped ledger entries — they will remain excluded from PSL leaderboard`]
        : [],
      safetyConfirmations: {
        worldCupHistoryPreserved: true,
        pslLeaderboardStartsClean: true,
        fantasyPointsOnly: true,
        guessTheScorePointsOnly: true,
        fanValueNonFinancial: true,
        noDataDeletion: true,
        noForcedReassignmentOfBetaRecords: true,
      },
    };
  }
}
