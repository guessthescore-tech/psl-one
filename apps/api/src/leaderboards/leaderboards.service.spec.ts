import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeaderboardsService } from './leaderboards.service';
import type { PrismaService } from '../prisma/prisma.service';

const WC_SEASON = { id: 'wc-season', name: 'FIFA World Cup 2026', slug: 'fifa-world-cup-2026', isActive: true };
const PSL_SEASON = { id: 'psl-season', name: '2026/27 PSL', slug: 'psl-premiership-upcoming', isActive: false };

const makePrismaMock = () => ({
  season: {
    findFirst: vi.fn().mockResolvedValue(WC_SEASON),
    findUnique: vi.fn().mockResolvedValue(WC_SEASON),
    findMany: vi.fn().mockResolvedValue([WC_SEASON, PSL_SEASON]),
  },
  fanValueLedger: { groupBy: vi.fn().mockResolvedValue([]) },
  fantasyGameweekScore: { groupBy: vi.fn().mockResolvedValue([]) },
  predictionPointsLedger: {
    groupBy: vi.fn().mockResolvedValue([]),
    findMany: vi.fn().mockResolvedValue([]),
  },
  fanAchievement: { groupBy: vi.fn().mockResolvedValue([]) },
  fanProfile: { findMany: vi.fn().mockResolvedValue([]) },
});

describe('LeaderboardsService', () => {
  let service: LeaderboardsService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    service = new LeaderboardsService(prisma as unknown as PrismaService);
  });

  // ── Season resolution ─────────────────────────────────────────────────

  describe('getLeaderboardSeasons', () => {
    it('returns seasons with leaderboardUrl', async () => {
      const result = await service.getLeaderboardSeasons();
      expect(result).toHaveLength(2);
      expect(result[0]!.leaderboardUrl).toContain('seasonSlug=');
    });
  });

  describe('resolveSeasonFromSlug', () => {
    it('resolves a season by slug', async () => {
      prisma.season.findFirst.mockResolvedValue(WC_SEASON);
      const result = await service.resolveSeasonFromSlug('fifa-world-cup-2026');
      expect(result?.id).toBe('wc-season');
    });
  });

  // ── Fan Value leaderboard ──────────────────────────────────────────────

  describe('getFanValueLeaderboard', () => {
    it('defaults to active season when seasonId is null', async () => {
      const result = await service.getFanValueLeaderboard(null);
      expect(prisma.season.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { isActive: true } }));
      expect(result.leaderboardType).toBe('FAN_VALUE');
      expect(result.pointsOnly).toBe(true);
      expect(result.nonFinancial).toBe(true);
    });

    it('uses provided seasonId and sets scope SEASON', async () => {
      prisma.season.findUnique.mockResolvedValue(WC_SEASON);
      const result = await service.getFanValueLeaderboard('wc-season');
      expect(result.seasonId).toBe('wc-season');
      expect(result.scope).toBe('SEASON');
    });

    it('World Cup leaderboard is accessible via WC seasonId', async () => {
      prisma.season.findUnique.mockResolvedValue(WC_SEASON);
      prisma.fanValueLedger.groupBy.mockResolvedValue([
        { userId: 'fan-1', _sum: { points: 100 }, _count: { id: 5 } },
      ]);
      prisma.fanProfile.findMany.mockResolvedValue([{ userId: 'fan-1', displayName: 'WC Fan' }]);
      const result = await service.getFanValueLeaderboard('wc-season');
      expect(result.entries[0]!.totalPoints).toBe(100);
      expect(result.seasonSlug).toBe('fifa-world-cup-2026');
    });

    it('PSL leaderboard is accessible via PSL seasonId', async () => {
      prisma.season.findUnique.mockResolvedValue(PSL_SEASON);
      const result = await service.getFanValueLeaderboard('psl-season');
      expect(result.seasonSlug).toBe('psl-premiership-upcoming');
    });

    it('WC query filters by WC seasonId — seasons do not mix', async () => {
      prisma.season.findUnique.mockResolvedValue(WC_SEASON);
      await service.getFanValueLeaderboard('wc-season');
      expect(prisma.fanValueLedger.groupBy).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ seasonId: 'wc-season' }),
      }));
    });

    it('nonFinancial is always true', async () => {
      const result = await service.getFanValueLeaderboard(null);
      expect(result.nonFinancial).toBe(true);
    });

    it('returns empty entries when no fan value records exist', async () => {
      prisma.fanValueLedger.groupBy.mockResolvedValue([]);
      const result = await service.getFanValueLeaderboard(null);
      expect(result.entries).toHaveLength(0);
    });

    it('enriches entries with displayName from fanProfile', async () => {
      prisma.season.findUnique.mockResolvedValue(WC_SEASON);
      prisma.fanValueLedger.groupBy.mockResolvedValue([
        { userId: 'u1', _sum: { points: 50 }, _count: { id: 3 } },
      ]);
      prisma.fanProfile.findMany.mockResolvedValue([{ userId: 'u1', displayName: 'Top Fan' }]);
      const result = await service.getFanValueLeaderboard('wc-season');
      expect(result.entries[0]!.displayName).toBe('Top Fan');
    });

    it('handles null displayName for users without fan profile', async () => {
      prisma.season.findUnique.mockResolvedValue(WC_SEASON);
      prisma.fanValueLedger.groupBy.mockResolvedValue([
        { userId: 'u-no-profile', _sum: { points: 20 }, _count: { id: 1 } },
      ]);
      prisma.fanProfile.findMany.mockResolvedValue([]);
      const result = await service.getFanValueLeaderboard('wc-season');
      expect(result.entries[0]!.displayName).toBeNull();
    });
  });

  // ── Fantasy leaderboard ────────────────────────────────────────────────

  describe('getFantasyLeaderboard', () => {
    it('defaults to active season', async () => {
      const result = await service.getFantasyLeaderboard(null);
      expect(result.leaderboardType).toBe('FANTASY');
      expect(result.pointsOnly).toBe(true);
    });

    it('filters fantasy gameweek scores by seasonId', async () => {
      prisma.season.findUnique.mockResolvedValue(WC_SEASON);
      await service.getFantasyLeaderboard('wc-season');
      expect(prisma.fantasyGameweekScore.groupBy).toHaveBeenCalledWith(expect.objectContaining({
        where: { seasonId: 'wc-season' },
      }));
    });

    it('WC and PSL fantasy scores are separate', async () => {
      prisma.season.findUnique.mockResolvedValue(WC_SEASON);
      await service.getFantasyLeaderboard('wc-season');
      const call = prisma.fantasyGameweekScore.groupBy.mock.calls[0]![0]!
      expect(call.where.seasonId).toBe('wc-season');
    });
  });

  // ── Predictions leaderboard ────────────────────────────────────────────

  describe('getPredictionsLeaderboard', () => {
    it('returns LeaderboardResult shape', async () => {
      const result = await service.getPredictionsLeaderboard(null);
      expect(result.leaderboardType).toBe('PREDICTIONS');
      expect(result.pointsOnly).toBe(true);
      expect(Array.isArray(result.entries)).toBe(true);
    });

    it('season-scoped query derives season from fixture.seasonId via findMany', async () => {
      prisma.season.findUnique.mockResolvedValue(WC_SEASON);
      await service.getPredictionsLeaderboard('wc-season');
      expect(prisma.predictionPointsLedger.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { fixture: { seasonId: 'wc-season' } },
      }));
    });

    it('WC predictions are not included in PSL leaderboard', async () => {
      prisma.season.findUnique.mockResolvedValue(PSL_SEASON);
      await service.getPredictionsLeaderboard('psl-season');
      expect(prisma.predictionPointsLedger.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { fixture: { seasonId: 'psl-season' } },
      }));
    });

    it('aggregates prediction points correctly per user', async () => {
      prisma.season.findUnique.mockResolvedValue(WC_SEASON);
      prisma.predictionPointsLedger.findMany.mockResolvedValue([
        { userId: 'fan-1', points: 10 },
        { userId: 'fan-1', points: 5 },
        { userId: 'fan-2', points: 8 },
      ]);
      prisma.fanProfile.findMany.mockResolvedValue([
        { userId: 'fan-1', displayName: 'Fan One' },
        { userId: 'fan-2', displayName: 'Fan Two' },
      ]);
      const result = await service.getPredictionsLeaderboard('wc-season');
      expect(result.entries[0]!.totalPoints).toBe(15);
      expect(result.entries[0]!.rank).toBe(1);
      expect(result.entries[1]!.totalPoints).toBe(8);
    });

    it('all-time query uses groupBy when no seasonId resolved', async () => {
      prisma.season.findFirst.mockResolvedValue(null);
      await service.getPredictionsLeaderboard(null);
      expect(prisma.predictionPointsLedger.groupBy).toHaveBeenCalled();
    });

    it('orders entries by totalPoints descending', async () => {
      prisma.season.findUnique.mockResolvedValue(WC_SEASON);
      prisma.predictionPointsLedger.findMany.mockResolvedValue([
        { userId: 'fan-a', points: 10 },
        { userId: 'fan-b', points: 50 },
        { userId: 'fan-a', points: 20 },
      ]);
      prisma.fanProfile.findMany.mockResolvedValue([]);
      const result = await service.getPredictionsLeaderboard('wc-season');
      expect(result.entries[0]!.userId).toBe('fan-b');
      expect(result.entries[0]!.totalPoints).toBe(50);
    });

    it('uses settled ledger totals, not raw prediction points', async () => {
      prisma.season.findFirst.mockResolvedValue(null);
      prisma.predictionPointsLedger.groupBy.mockResolvedValue([
        { userId: 'u1', _sum: { points: 30 }, _count: { id: 4 } },
      ]);
      prisma.fanProfile.findMany.mockResolvedValue([]);
      const result = await service.getPredictionsLeaderboard(null);
      expect(result.entries[0]!.totalPoints).toBe(30);
    });
  });

  // ── Achievements leaderboard (global) ─────────────────────────────────

  describe('getAchievementsLeaderboard', () => {
    it('scope is always ALL_TIME — achievements are cross-season', async () => {
      const result = await service.getAchievementsLeaderboard();
      expect(result.scope).toBe('ALL_TIME');
      expect(result.seasonId).toBeNull();
    });

    it('counts UNLOCKED achievements per user', async () => {
      prisma.fanAchievement.groupBy.mockResolvedValue([
        { userId: 'fan-1', _count: { id: 3 } },
      ]);
      prisma.fanProfile.findMany.mockResolvedValue([{ userId: 'fan-1', displayName: 'Top Fan' }]);
      const result = await service.getAchievementsLeaderboard();
      expect(result.entries[0]!.totalPoints).toBe(3);
    });
  });

  // ── Overall leaderboard ────────────────────────────────────────────────

  describe('getOverallLeaderboard', () => {
    it('delegates to Fan Value to avoid double-counting', async () => {
      const result = await service.getOverallLeaderboard(null);
      expect(result.leaderboardType).toBe('OVERALL');
      expect(result.pointsOnly).toBe(true);
    });
  });

  // ── Overview ───────────────────────────────────────────────────────────

  describe('getLeaderboardOverview', () => {
    it('returns all four leaderboard types', async () => {
      const result = await service.getLeaderboardOverview(null);
      expect(result.leaderboards).toHaveProperty('fanValue');
      expect(result.leaderboards).toHaveProperty('fantasy');
      expect(result.leaderboards).toHaveProperty('predictions');
      expect(result.leaderboards).toHaveProperty('achievements');
    });

    it('is points-only and non-financial', async () => {
      const result = await service.getLeaderboardOverview(null);
      expect(result.pointsOnly).toBe(true);
      expect(result.nonFinancial).toBe(true);
    });
  });
});
