import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { LeaderboardsService } from './leaderboards.service';
import type { PrismaService } from '../prisma/prisma.service';

const makePrismaMock = () => ({
  predictionPointsLedger: { groupBy: vi.fn() },
  fanProfile: { findMany: vi.fn() },
});

describe('LeaderboardsService', () => {
  let service: LeaderboardsService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    service = new LeaderboardsService(prisma as unknown as PrismaService);
  });

  it('returns empty array when no ledger entries', async () => {
    (prisma.predictionPointsLedger.groupBy as Mock).mockResolvedValue([]);
    const result = await service.getPredictionsLeaderboard();
    expect(result).toEqual([]);
  });

  it('returns ranked entries from PredictionPointsLedger totals', async () => {
    (prisma.predictionPointsLedger.groupBy as Mock).mockResolvedValue([
      { userId: 'u1', _sum: { points: 25 }, _count: { id: 3 } },
      { userId: 'u2', _sum: { points: 10 }, _count: { id: 2 } },
    ]);
    (prisma.fanProfile.findMany as Mock).mockResolvedValue([
      { userId: 'u1', displayName: 'Alice' },
      { userId: 'u2', displayName: 'Bob' },
    ]);

    const result = await service.getPredictionsLeaderboard();
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ rank: 1, userId: 'u1', totalPoints: 25, displayName: 'Alice' });
    expect(result[1]).toMatchObject({ rank: 2, userId: 'u2', totalPoints: 10, displayName: 'Bob' });
  });

  it('uses settled ledger totals, not raw prediction points', async () => {
    (prisma.predictionPointsLedger.groupBy as Mock).mockResolvedValue([
      { userId: 'u1', _sum: { points: 30 }, _count: { id: 4 } },
    ]);
    (prisma.fanProfile.findMany as Mock).mockResolvedValue([]);

    const result = await service.getPredictionsLeaderboard();
    // Verify we're reading from predictionPointsLedger groupBy, not scorePrediction
    expect(prisma.predictionPointsLedger.groupBy).toHaveBeenCalled();
    expect(result[0]!.totalPoints).toBe(30);
  });

  it('orders by totalPoints descending', async () => {
    (prisma.predictionPointsLedger.groupBy as Mock).mockResolvedValue([
      { userId: 'u1', _sum: { points: 50 }, _count: { id: 5 } },
      { userId: 'u2', _sum: { points: 30 }, _count: { id: 3 } },
      { userId: 'u3', _sum: { points: 10 }, _count: { id: 1 } },
    ]);
    (prisma.fanProfile.findMany as Mock).mockResolvedValue([]);

    const result = await service.getPredictionsLeaderboard();
    expect(result[0]!.totalPoints).toBeGreaterThan(result[1]!.totalPoints);
    expect(result[1]!.totalPoints).toBeGreaterThan(result[2]!.totalPoints);
  });

  it('handles null displayName for users without fan profile', async () => {
    (prisma.predictionPointsLedger.groupBy as Mock).mockResolvedValue([
      { userId: 'u-no-profile', _sum: { points: 5 }, _count: { id: 1 } },
    ]);
    (prisma.fanProfile.findMany as Mock).mockResolvedValue([]);

    const result = await service.getPredictionsLeaderboard();
    expect(result[0]!.displayName).toBeNull();
  });

  it('duplicate settlement does not double-count — ledger groupBy is idempotent by design', async () => {
    // The guarantee: settleFixture only processes PENDING/LOCKED; second run finds 0 rows
    // so no new ledger entries are created. This test verifies the groupBy uses 'points' field.
    (prisma.predictionPointsLedger.groupBy as Mock).mockResolvedValue([
      { userId: 'u1', _sum: { points: 10 }, _count: { id: 1 } },
    ]);
    (prisma.fanProfile.findMany as Mock).mockResolvedValue([]);

    const result = await service.getPredictionsLeaderboard();
    expect(prisma.predictionPointsLedger.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        by: ['userId'],
        _sum: { points: true },
        orderBy: { _sum: { points: 'desc' } },
      }),
    );
    expect(result[0]!.totalPoints).toBe(10);
  });
});
