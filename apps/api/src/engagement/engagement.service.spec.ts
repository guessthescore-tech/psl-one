import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { EngagementService } from './engagement.service';
import type { PrismaService } from '../prisma/prisma.service';

const WC_SEASON = { id: 'wc-id', name: 'FIFA World Cup 2026', slug: 'fifa-world-cup-2026', status: 'ACTIVE', isActive: true, startDate: new Date('2026-06-01'), endDate: new Date('2026-07-15') };
const PSL_SEASON = { id: 'psl-id', name: '2026/27 PSL', slug: 'psl-premiership-upcoming', status: 'UPCOMING', isActive: false, startDate: new Date('2026-08-01'), endDate: new Date('2027-05-31') };

const makePrismaMock = () => ({
  season: {
    findMany: vi.fn().mockResolvedValue([WC_SEASON, PSL_SEASON]),
    findFirst: vi.fn().mockResolvedValue(WC_SEASON),
    findUnique: vi.fn().mockResolvedValue(WC_SEASON),
  },
  fanValueLedger: {
    aggregate: vi.fn().mockResolvedValue({ _sum: { points: 0 }, _count: { id: 0 } }),
    groupBy: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    findMany: vi.fn().mockResolvedValue([]),
  },
  fantasyGameweekScore: {
    aggregate: vi.fn().mockResolvedValue({ _sum: { netPoints: 0, grossPoints: 0 }, _count: { id: 0 } }),
    groupBy: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
  },
  predictionPointsLedger: {
    count: vi.fn().mockResolvedValue(0),
    findMany: vi.fn().mockResolvedValue([]),
    groupBy: vi.fn().mockResolvedValue([]),
  },
  fanAchievement: {
    count: vi.fn().mockResolvedValue(0),
    groupBy: vi.fn().mockResolvedValue([]),
  },
  achievementDefinition: {
    count: vi.fn().mockResolvedValue(0),
  },
  fantasyTeam: { count: vi.fn().mockResolvedValue(0) },
  fantasyLeague: { count: vi.fn().mockResolvedValue(0) },
  scorePrediction: { count: vi.fn().mockResolvedValue(0) },
  fanProfile: { findMany: vi.fn().mockResolvedValue([]) },
});

describe('EngagementService', () => {
  let service: EngagementService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    service = new EngagementService(prisma as unknown as PrismaService);
  });

  // ── listEngagementSeasons ─────────────────────────────────────────────

  describe('listEngagementSeasons', () => {
    it('returns all seasons with note about World Cup preservation', async () => {
      const result = await service.listEngagementSeasons();
      expect(result.seasons).toHaveLength(2);
      expect(result.note).toContain('World Cup');
    });

    it('orders seasons by startDate desc', async () => {
      await service.listEngagementSeasons();
      expect(prisma.season.findMany).toHaveBeenCalledWith(expect.objectContaining({
        orderBy: { startDate: 'desc' },
      }));
    });
  });

  // ── _requireSeason throws when not found ──────────────────────────────

  describe('_requireSeason', () => {
    it('throws NotFoundException for unknown seasonId', async () => {
      prisma.season.findUnique.mockResolvedValue(null);
      await expect(service.getEngagementOverview('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── getEngagementOverview ─────────────────────────────────────────────

  describe('getEngagementOverview', () => {
    it('returns safetyConfirmations with all non-financial flags', async () => {
      const result = await service.getEngagementOverview('wc-id');
      expect(result.safetyConfirmations.fanValueNonFinancial).toBe(true);
      expect(result.safetyConfirmations.fantasyPointsOnly).toBe(true);
      expect(result.safetyConfirmations.guessTheScorePointsOnly).toBe(true);
      expect(result.safetyConfirmations.productionMoneyMovementDisabled).toBe(true);
    });

    it('includes seasonId and seasonName', async () => {
      const result = await service.getEngagementOverview('wc-id');
      expect(result.seasonId).toBe('wc-id');
      expect(result.seasonName).toBe('FIFA World Cup 2026');
    });

    it('achievements scope is ALL_TIME', async () => {
      const result = await service.getEngagementOverview('wc-id');
      expect(result.achievements.scope).toBe('ALL_TIME');
    });

    it('legacyUnscoped count is included', async () => {
      prisma.fanValueLedger.count.mockResolvedValue(5);
      const result = await service.getEngagementOverview('wc-id');
      expect(result.legacyUnscoped).toBeDefined();
    });
  });

  // ── getEngagementLeaderboards ─────────────────────────────────────────

  describe('getEngagementLeaderboards', () => {
    it('returns all leaderboard types in response', async () => {
      const result = await service.getEngagementLeaderboards('wc-id');
      expect(result.leaderboards).toHaveProperty('fanValue');
      expect(result.leaderboards).toHaveProperty('fantasy');
      expect(result.leaderboards).toHaveProperty('predictions');
      expect(result.leaderboards).toHaveProperty('achievements');
    });

    it('is pointsOnly and nonFinancial', async () => {
      const result = await service.getEngagementLeaderboards('wc-id');
      expect(result.pointsOnly).toBe(true);
      expect(result.nonFinancial).toBe(true);
    });

    it('enriches fan value entries with displayName', async () => {
      prisma.fanValueLedger.groupBy.mockResolvedValue([
        { userId: 'u1', _sum: { points: 100 }, _count: { id: 3 } },
      ]);
      prisma.fanProfile.findMany.mockResolvedValue([{ userId: 'u1', displayName: 'Top Fan' }]);
      const result = await service.getEngagementLeaderboards('wc-id');
      expect(result.leaderboards.fanValue[0]!.displayName).toBe('Top Fan');
    });
  });

  // ── getEngagementFanValue ─────────────────────────────────────────────

  describe('getEngagementFanValue', () => {
    it('filters FanValueLedger by seasonId and POSTED status', async () => {
      await service.getEngagementFanValue('wc-id');
      expect(prisma.fanValueLedger.aggregate).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ seasonId: 'wc-id' }),
      }));
    });

    it('sets nonFinancial=true with disclaimer', async () => {
      const result = await service.getEngagementFanValue('wc-id');
      expect(result.nonFinancial).toBe(true);
      expect(result.disclaimer).toContain('non-financial');
    });

    it('includes byType and bySource breakdowns', async () => {
      const result = await service.getEngagementFanValue('wc-id');
      expect(Array.isArray(result.byType)).toBe(true);
      expect(Array.isArray(result.bySource)).toBe(true);
    });

    it('includes legacyUnscopedCount', async () => {
      const result = await service.getEngagementFanValue('wc-id');
      expect(typeof result.legacyUnscopedCount).toBe('number');
    });
  });

  // ── getEngagementFantasy ──────────────────────────────────────────────

  describe('getEngagementFantasy', () => {
    it('filters FantasyGameweekScore by seasonId', async () => {
      await service.getEngagementFantasy('wc-id');
      expect(prisma.fantasyGameweekScore.aggregate).toHaveBeenCalledWith(expect.objectContaining({
        where: { seasonId: 'wc-id' },
      }));
    });

    it('is pointsOnly with no paid entry note', async () => {
      const result = await service.getEngagementFantasy('wc-id');
      expect(result.pointsOnly).toBe(true);
      expect(result.note).toContain('points-only');
    });
  });

  // ── getEngagementPredictions ──────────────────────────────────────────

  describe('getEngagementPredictions', () => {
    it('derives season from fixture.seasonId', async () => {
      await service.getEngagementPredictions('wc-id');
      expect(prisma.predictionPointsLedger.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { fixture: { seasonId: 'wc-id' } },
      }));
    });

    it('aggregates prediction points correctly', async () => {
      prisma.predictionPointsLedger.findMany.mockResolvedValue([
        { points: 10 },
        { points: 20 },
      ]);
      const result = await service.getEngagementPredictions('wc-id');
      expect(result.totalPredictionPoints).toBe(30);
    });

    it('is pointsOnly with no wagering note', async () => {
      const result = await service.getEngagementPredictions('wc-id');
      expect(result.pointsOnly).toBe(true);
      expect(result.note).toContain('points-only');
    });

    it('confirms season derived from fixture.seasonId', async () => {
      const result = await service.getEngagementPredictions('wc-id');
      expect(result.seasonDerivedFrom).toBe('fixture.seasonId');
    });
  });

  // ── getEngagementAchievements ─────────────────────────────────────────

  describe('getEngagementAchievements', () => {
    it('scope is ALL_TIME — achievements are cross-season', async () => {
      const result = await service.getEngagementAchievements('wc-id');
      expect(result.scope).toBe('ALL_TIME');
    });

    it('includes fan value awarded via achievements this season', async () => {
      prisma.fanValueLedger.aggregate.mockResolvedValue({ _sum: { points: 50 }, _count: { id: 5 } });
      const result = await service.getEngagementAchievements('wc-id');
      expect(result.fanValueAwardedThisSeason).toBeDefined();
    });

    it('note confirms cross-season design intent', async () => {
      const result = await service.getEngagementAchievements('wc-id');
      expect(result.note).toContain('cross-season');
    });
  });

  // ── getUnscopedLedger ─────────────────────────────────────────────────

  describe('getUnscopedLedger', () => {
    it('queries fanValueLedger where seasonId is null', async () => {
      await service.getUnscopedLedger('wc-id');
      expect(prisma.fanValueLedger.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ seasonId: null }),
      }));
    });

    it('classifies entries by scope source', async () => {
      prisma.fanValueLedger.findMany.mockResolvedValue([
        { id: '1', userId: 'u1', sourceType: 'FANTASY', valueType: 'STANDARD', points: 10, description: null, gameweekId: 'gw-1', fixtureId: null, predictionId: null, challengeId: null, occurredAt: new Date() },
        { id: '2', userId: 'u2', sourceType: 'PLATFORM', valueType: 'STANDARD', points: 5, description: null, gameweekId: null, fixtureId: null, predictionId: null, challengeId: null, occurredAt: new Date() },
      ]);
      const result = await service.getUnscopedLedger('wc-id');
      expect(result.entries[0]!.seasonScopeSource).toBe('DERIVED_GAMEWEEK');
      expect(result.entries[1]!.seasonScopeSource).toBe('LEGACY_UNSCOPED');
    });

    it('recommendation present when unscoped entries exist', async () => {
      prisma.fanValueLedger.findMany.mockResolvedValue([
        { id: '1', userId: 'u1', sourceType: 'PLATFORM', valueType: 'STANDARD', points: 5, description: null, gameweekId: null, fixtureId: null, predictionId: null, challengeId: null, occurredAt: new Date() },
      ]);
      const result = await service.getUnscopedLedger('wc-id');
      expect(result.recommendation).toContain('backfilling');
    });

    it('admin-only note present', async () => {
      const result = await service.getUnscopedLedger('wc-id');
      expect(result.note).toContain('admin only');
    });
  });

  // ── getSeasonScopeAudit ───────────────────────────────────────────────

  describe('getSeasonScopeAudit', () => {
    it('returns auditStatus READY when trulyUnscoped=0', async () => {
      prisma.fanValueLedger.count.mockResolvedValue(0);
      const result = await service.getSeasonScopeAudit('wc-id');
      expect(result.auditStatus).toBe('READY');
    });

    it('returns READY_WITH_WARNINGS when trulyUnscoped > 0', async () => {
      // direct: 100, gameweek: 0, fixture: 0, prediction: 0, challenge: 0, totalNull: 5
      // trulyUnscoped = max(0, 5 - 0 - 0 - 0 - 0) = 5 > 0 → READY_WITH_WARNINGS
      prisma.fanValueLedger.count
        .mockResolvedValueOnce(100)  // direct
        .mockResolvedValueOnce(0)    // withGameweekNull
        .mockResolvedValueOnce(0)    // withFixtureNull
        .mockResolvedValueOnce(0)    // withPredictionNull
        .mockResolvedValueOnce(0)    // withChallengeNull
        .mockResolvedValueOnce(5);   // totalNull
      const result = await service.getSeasonScopeAudit('wc-id');
      expect(result.auditStatus).toBe('READY_WITH_WARNINGS');
    });

    it('has 10 checks', async () => {
      const result = await service.getSeasonScopeAudit('wc-id');
      expect(result.checks).toHaveLength(10);
    });

    it('confirms no migration needed', async () => {
      const result = await service.getSeasonScopeAudit('wc-id');
      expect(result.noMigrationNeeded).toContain('FanValueLedger.seasonId already exists');
    });

    it('includes scopeSummary with derivation counts', async () => {
      const result = await service.getSeasonScopeAudit('wc-id');
      expect(result.scopeSummary).toHaveProperty('direct');
      expect(result.scopeSummary).toHaveProperty('derivableGameweek');
      expect(result.scopeSummary).toHaveProperty('trulyUnscoped');
    });
  });

  // ── getActivationImpact ───────────────────────────────────────────────

  describe('getActivationImpact', () => {
    it('activationSafe is true', async () => {
      const result = await service.getActivationImpact('psl-id');
      expect(result.activationSafe).toBe(true);
    });

    it('engagementSeparation is CLEAN', async () => {
      const result = await service.getActivationImpact('psl-id');
      expect(result.engagementSeparation).toBe('CLEAN');
    });

    it('includes World Cup preservation impact', async () => {
      const result = await service.getActivationImpact('psl-id');
      const wcImpact = result.impacts.find((i) => i.area.includes('World Cup fan value'));
      expect(wcImpact?.impact).toBe('PRESERVED');
    });

    it('safetyConfirmations include worldCupHistoryPreserved and noDataDeletion', async () => {
      const result = await service.getActivationImpact('psl-id');
      expect(result.safetyConfirmations.worldCupHistoryPreserved).toBe(true);
      expect(result.safetyConfirmations.noDataDeletion).toBe(true);
      expect(result.safetyConfirmations.noForcedReassignmentOfBetaRecords).toBe(true);
    });

    it('includes warning when unscoped entries exist', async () => {
      prisma.fanValueLedger.count.mockResolvedValue(3);
      const result = await service.getActivationImpact('psl-id');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('warns about no unscoped entries when count is zero', async () => {
      prisma.fanValueLedger.count.mockResolvedValue(0);
      const result = await service.getActivationImpact('psl-id');
      expect(result.warnings).toHaveLength(0);
    });
  });
});
