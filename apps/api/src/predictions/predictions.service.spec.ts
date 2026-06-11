import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { calculatePoints } from './scoring';
import type { PrismaService } from '../prisma/prisma.service';
import type { FanValueLedgerService } from '../fan-value/fan-value-ledger.service';
import type { AchievementsService } from '../achievements/achievements.service';

const makeAchievementsMock = () => ({
  safeEvaluate: vi.fn().mockResolvedValue(undefined),
}) as unknown as AchievementsService;

const makeFanValueMock = () => ({
  postPredictionSettlement: vi.fn().mockResolvedValue({}),
  postPeerChallenge: vi.fn().mockResolvedValue({}),
}) as unknown as FanValueLedgerService;

const makePrismaMock = () => ({
  fixture: { findUnique: vi.fn() },
  scorePrediction: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    count: vi.fn(),
  },
  peerChallenge: { findMany: vi.fn(), update: vi.fn() },
  predictionPointsLedger: { create: vi.fn() },
  gameweek: { findUnique: vi.fn() },
});

const FUTURE = new Date(Date.now() + 86_400_000);
const PAST = new Date(Date.now() - 86_400_000);

const MOCK_SCHEDULED = { id: 'f1', status: 'SCHEDULED', kickoffAt: FUTURE, homeScore: null, awayScore: null };
const MOCK_FINISHED = { id: 'f1', status: 'FINISHED', kickoffAt: PAST, homeScore: 2, awayScore: 1 };
const MOCK_LIVE = { id: 'f1', status: 'LIVE', kickoffAt: PAST };

const MOCK_PREDICTION = {
  id: 'pred-1', userId: 'user-1', fixtureId: 'f1',
  predictedHomeScore: 2, predictedAwayScore: 1,
  pointsAwarded: 0, status: 'PENDING',
  createdAt: new Date(), updatedAt: new Date(), settledAt: null,
  fixture: MOCK_SCHEDULED,
};

// ── Scoring function unit tests ───────────────────────────────────────────────
describe('calculatePoints', () => {
  it('exact score → 10', () => expect(calculatePoints(2, 1, 2, 1)).toBe(10));
  it('correct result and goal difference → 5', () => {
    expect(calculatePoints(2, 1, 3, 2)).toBe(5);
    expect(calculatePoints(2, 1, 1, 0)).toBe(5);
  });
  it('correct result only → 3', () => expect(calculatePoints(2, 1, 2, 0)).toBe(3));
  it('wrong result → 0', () => expect(calculatePoints(2, 1, 1, 1)).toBe(0));
  it('draw exact → 10', () => expect(calculatePoints(1, 1, 1, 1)).toBe(10));
  it('draw correct result → 3', () => expect(calculatePoints(1, 1, 0, 0)).toBe(5));
  it('away win exact → 10', () => expect(calculatePoints(0, 2, 0, 2)).toBe(10));
});

// ── PredictionsService tests ──────────────────────────────────────────────────
describe('PredictionsService', () => {
  let service: PredictionsService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    service = new PredictionsService(prisma as unknown as PrismaService, makeFanValueMock(), makeAchievementsMock());
  });

  // ── 1. Create prediction ───────────────────────────────────────────────────
  it('creates prediction for a scheduled fixture', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_SCHEDULED);
    (prisma.scorePrediction.create as Mock).mockResolvedValue(MOCK_PREDICTION);
    const result = await service.createPrediction('user-1', {
      fixtureId: 'f1', predictedHomeScore: 2, predictedAwayScore: 1,
    });
    expect(result.predictedHomeScore).toBe(2);
  });

  it('blocks prediction on non-existent fixture', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(null);
    await expect(
      service.createPrediction('user-1', { fixtureId: 'bad', predictedHomeScore: 1, predictedAwayScore: 0 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('blocks prediction when fixture is LIVE', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_LIVE);
    await expect(
      service.createPrediction('user-1', { fixtureId: 'f1', predictedHomeScore: 1, predictedAwayScore: 0 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('blocks prediction after kickoff even if SCHEDULED', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({ ...MOCK_SCHEDULED, kickoffAt: PAST });
    await expect(
      service.createPrediction('user-1', { fixtureId: 'f1', predictedHomeScore: 1, predictedAwayScore: 0 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('blocks prediction when gameweek deadline has passed', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({
      ...MOCK_SCHEDULED,
      kickoffAt: FUTURE,
      gameweek: { predictionDeadlineAt: PAST },
    });
    await expect(
      service.createPrediction('user-1', { fixtureId: 'f1', predictedHomeScore: 1, predictedAwayScore: 0 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('blocks duplicate prediction (Prisma P2002)', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_SCHEDULED);
    (prisma.scorePrediction.create as Mock).mockRejectedValue({ code: 'P2002' });
    await expect(
      service.createPrediction('user-1', { fixtureId: 'f1', predictedHomeScore: 1, predictedAwayScore: 0 }),
    ).rejects.toThrow(ConflictException);
  });

  // ── 2. Update prediction ───────────────────────────────────────────────────
  it('updates prediction before kickoff', async () => {
    (prisma.scorePrediction.findUnique as Mock).mockResolvedValue(MOCK_PREDICTION);
    (prisma.scorePrediction.update as Mock).mockResolvedValue({ ...MOCK_PREDICTION, predictedHomeScore: 3 });
    const result = await service.updatePrediction('user-1', 'pred-1', { predictedHomeScore: 3 });
    expect(result.predictedHomeScore).toBe(3);
  });

  it('blocks update after kickoff', async () => {
    (prisma.scorePrediction.findUnique as Mock).mockResolvedValue({
      ...MOCK_PREDICTION,
      fixture: { ...MOCK_SCHEDULED, id: 'f1', kickoffAt: PAST },
    });
    await expect(
      service.updatePrediction('user-1', 'pred-1', { predictedHomeScore: 3 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('blocks update of another user prediction', async () => {
    (prisma.scorePrediction.findUnique as Mock).mockResolvedValue({
      ...MOCK_PREDICTION, userId: 'other-user',
    });
    await expect(
      service.updatePrediction('user-1', 'pred-1', { predictedHomeScore: 3 }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('blocks update when prediction status is LOCKED', async () => {
    (prisma.scorePrediction.findUnique as Mock).mockResolvedValue({
      ...MOCK_PREDICTION,
      status: 'LOCKED',
    });
    await expect(
      service.updatePrediction('user-1', 'pred-1', { predictedHomeScore: 3 }),
    ).rejects.toThrow(BadRequestException);
  });

  // ── 3. Settle fixture ──────────────────────────────────────────────────────
  it('settleFixture awards 10 points for exact score', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_FINISHED); // 2–1
    (prisma.scorePrediction.findMany as Mock).mockResolvedValue([
      { ...MOCK_PREDICTION, predictedHomeScore: 2, predictedAwayScore: 1 }, // exact
    ]);
    (prisma.scorePrediction.update as Mock).mockResolvedValue({});
    (prisma.predictionPointsLedger.create as Mock).mockResolvedValue({});
    (prisma.peerChallenge.findMany as Mock).mockResolvedValue([]);

    const result = await service.settleFixture('f1');
    expect(result.predictionsSettled).toBe(1);
    expect(result.summary[0]!.points).toBe(10);
    expect(prisma.scorePrediction.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ pointsAwarded: 10, status: 'WON' }) }),
    );
  });

  it('settleFixture awards 5 points for correct result and goal difference', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_FINISHED); // 2–1
    (prisma.scorePrediction.findMany as Mock).mockResolvedValue([
      { ...MOCK_PREDICTION, predictedHomeScore: 3, predictedAwayScore: 2 }, // diff=1 ✓
    ]);
    (prisma.scorePrediction.update as Mock).mockResolvedValue({});
    (prisma.predictionPointsLedger.create as Mock).mockResolvedValue({});
    (prisma.peerChallenge.findMany as Mock).mockResolvedValue([]);

    const result = await service.settleFixture('f1');
    expect(result.summary[0]!.points).toBe(5);
  });

  it('settleFixture awards 3 points for correct result only', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_FINISHED); // 2–1
    (prisma.scorePrediction.findMany as Mock).mockResolvedValue([
      { ...MOCK_PREDICTION, predictedHomeScore: 2, predictedAwayScore: 0 }, // home win, wrong diff
    ]);
    (prisma.scorePrediction.update as Mock).mockResolvedValue({});
    (prisma.predictionPointsLedger.create as Mock).mockResolvedValue({});
    (prisma.peerChallenge.findMany as Mock).mockResolvedValue([]);

    const result = await service.settleFixture('f1');
    expect(result.summary[0]!.points).toBe(3);
  });

  it('settleFixture throws if fixture not FINISHED', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_SCHEDULED);
    await expect(service.settleFixture('f1')).rejects.toThrow(BadRequestException);
  });

  it('settleFixture settles LOCKED predictions', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_FINISHED);
    (prisma.scorePrediction.findMany as Mock).mockResolvedValue([
      { ...MOCK_PREDICTION, status: 'LOCKED', predictedHomeScore: 2, predictedAwayScore: 1 },
    ]);
    (prisma.scorePrediction.update as Mock).mockResolvedValue({});
    (prisma.predictionPointsLedger.create as Mock).mockResolvedValue({});
    (prisma.peerChallenge.findMany as Mock).mockResolvedValue([]);

    const result = await service.settleFixture('f1');
    expect(result.predictionsSettled).toBe(1);
    expect(result.summary[0]!.points).toBe(10);
  });

  it('settleFixture is idempotent — second call finds no PENDING/LOCKED rows', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_FINISHED);
    // Second call: all predictions already WON/LOST → findMany returns []
    (prisma.scorePrediction.findMany as Mock).mockResolvedValue([]);
    (prisma.peerChallenge.findMany as Mock).mockResolvedValue([]);

    const result = await service.settleFixture('f1');
    expect(result.predictionsSettled).toBe(0);
    expect(prisma.predictionPointsLedger.create).not.toHaveBeenCalled();
  });

  it('settleFixture determines challenge winner', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_FINISHED);
    (prisma.scorePrediction.findMany as Mock).mockResolvedValue([]);
    (prisma.peerChallenge.findMany as Mock).mockResolvedValue([
      {
        id: 'ch-1', challengerUserId: 'user-1', opponentUserId: 'user-2',
        challengerPredictionId: 'pred-a', opponentPredictionId: 'pred-b',
        fixtureId: 'f1',
      },
    ]);
    (prisma.scorePrediction.findUnique as Mock)
      .mockResolvedValueOnce({ pointsAwarded: 10 })  // challenger
      .mockResolvedValueOnce({ pointsAwarded: 3 });   // opponent

    (prisma.peerChallenge.update as Mock).mockResolvedValue({});

    await service.settleFixture('f1');
    expect(prisma.peerChallenge.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'SETTLED',
          winnerUserId: 'user-1',
          pointsAwardedChallenger: 10,
          pointsAwardedOpponent: 3,
        }),
      }),
    );
  });

  // ── 4. Lock gameweek predictions ───────────────────────────────────────────
  it('lockGameweekPredictions locks all PENDING predictions after deadline', async () => {
    (prisma.gameweek.findUnique as Mock).mockResolvedValue({
      id: 'gw-1', name: 'GW1',
      predictionDeadlineAt: PAST,
      fixtures: [{ id: 'f1' }, { id: 'f2' }],
    });
    (prisma.scorePrediction.updateMany as Mock).mockResolvedValue({ count: 4 });

    const result = await service.lockGameweekPredictions('gw-1');
    expect(result).toEqual({ gameweekId: 'gw-1', gameweekName: 'GW1', locked: 4 });
    expect(prisma.scorePrediction.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { fixtureId: { in: ['f1', 'f2'] }, status: 'PENDING' },
        data: { status: 'LOCKED' },
      }),
    );
  });

  it('lockGameweekPredictions throws if deadline not yet passed', async () => {
    (prisma.gameweek.findUnique as Mock).mockResolvedValue({
      id: 'gw-1', name: 'GW1',
      predictionDeadlineAt: FUTURE,
      fixtures: [{ id: 'f1' }],
    });

    await expect(service.lockGameweekPredictions('gw-1')).rejects.toThrow(BadRequestException);
  });

  it('lockGameweekPredictions with force=true ignores deadline', async () => {
    (prisma.gameweek.findUnique as Mock).mockResolvedValue({
      id: 'gw-1', name: 'GW1',
      predictionDeadlineAt: FUTURE,
      fixtures: [{ id: 'f1' }],
    });
    (prisma.scorePrediction.updateMany as Mock).mockResolvedValue({ count: 2 });

    const result = await service.lockGameweekPredictions('gw-1', true);
    expect(result.locked).toBe(2);
  });

  it('lockGameweekPredictions returns 0 for empty gameweek', async () => {
    (prisma.gameweek.findUnique as Mock).mockResolvedValue({
      id: 'gw-1', name: 'GW1',
      predictionDeadlineAt: PAST,
      fixtures: [],
    });

    const result = await service.lockGameweekPredictions('gw-1');
    expect(result).toEqual({ gameweekId: 'gw-1', gameweekName: 'GW1', locked: 0 });
    expect(prisma.scorePrediction.updateMany).not.toHaveBeenCalled();
  });

  it('lockGameweekPredictions throws NotFoundException for missing gameweek', async () => {
    (prisma.gameweek.findUnique as Mock).mockResolvedValue(null);
    await expect(service.lockGameweekPredictions('bad-id')).rejects.toThrow(NotFoundException);
  });

  // ── 5. Settle gameweek ─────────────────────────────────────────────────────
  it('settleGameweek settles only FINISHED fixtures', async () => {
    (prisma.gameweek.findUnique as Mock).mockResolvedValue({
      id: 'gw-1', name: 'GW1',
      fixtures: [
        { id: 'f1', status: 'FINISHED', homeScore: 2, awayScore: 1 },
        { id: 'f2', status: 'SCHEDULED', homeScore: null, awayScore: null },
      ],
    });
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_FINISHED);
    (prisma.scorePrediction.findMany as Mock).mockResolvedValue([]);
    (prisma.peerChallenge.findMany as Mock).mockResolvedValue([]);

    const result = await service.settleGameweek('gw-1');
    expect(result.fixturesSettled).toBe(1);
    expect(result.fixturesSkipped).toBe(1);
  });

  it('settleGameweek returns zero settled for no finished fixtures', async () => {
    (prisma.gameweek.findUnique as Mock).mockResolvedValue({
      id: 'gw-1', name: 'GW1',
      fixtures: [{ id: 'f1', status: 'SCHEDULED', homeScore: null, awayScore: null }],
    });

    const result = await service.settleGameweek('gw-1');
    expect(result.fixturesSettled).toBe(0);
    expect(result.totalPredictionsSettled).toBe(0);
  });

  it('settleGameweek throws NotFoundException for missing gameweek', async () => {
    (prisma.gameweek.findUnique as Mock).mockResolvedValue(null);
    await expect(service.settleGameweek('bad-id')).rejects.toThrow(NotFoundException);
  });

  it('settleGameweek is idempotent — second run settles 0 (no PENDING/LOCKED left)', async () => {
    (prisma.gameweek.findUnique as Mock).mockResolvedValue({
      id: 'gw-1', name: 'GW1',
      fixtures: [{ id: 'f1', status: 'FINISHED', homeScore: 2, awayScore: 1 }],
    });
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_FINISHED);
    // Second run: no PENDING/LOCKED predictions remain
    (prisma.scorePrediction.findMany as Mock).mockResolvedValue([]);
    (prisma.peerChallenge.findMany as Mock).mockResolvedValue([]);

    const result = await service.settleGameweek('gw-1');
    expect(result.totalPredictionsSettled).toBe(0);
    expect(prisma.predictionPointsLedger.create).not.toHaveBeenCalled();
  });

  // ── 6. Get gameweek predictions ────────────────────────────────────────────
  it('getGameweekPredictions returns predictions with locked flag', async () => {
    (prisma.gameweek.findUnique as Mock).mockResolvedValue({
      id: 'gw-1', name: 'GW1', slug: 'gw-1', round: 'GROUP',
      status: 'LOCKED', predictionDeadlineAt: PAST,
      fixtures: [{ id: 'f1' }],
    });
    (prisma.scorePrediction.findMany as Mock).mockResolvedValue([MOCK_PREDICTION]);

    const result = await service.getGameweekPredictions('user-1', 'gw-1');
    expect(result.gameweek.predictionLocked).toBe(true);
    expect(result.predictions).toHaveLength(1);
    expect(result.totalFixtures).toBe(1);
  });

  it('getGameweekPredictions shows predictionLocked=false when deadline is in future', async () => {
    (prisma.gameweek.findUnique as Mock).mockResolvedValue({
      id: 'gw-1', name: 'GW1', slug: 'gw-1', round: 'GROUP',
      status: 'OPEN', predictionDeadlineAt: FUTURE,
      fixtures: [{ id: 'f1' }],
    });
    (prisma.scorePrediction.findMany as Mock).mockResolvedValue([]);

    const result = await service.getGameweekPredictions('user-1', 'gw-1');
    expect(result.gameweek.predictionLocked).toBe(false);
  });

  it('getGameweekPredictions throws NotFoundException for missing gameweek', async () => {
    (prisma.gameweek.findUnique as Mock).mockResolvedValue(null);
    await expect(service.getGameweekPredictions('user-1', 'bad-id')).rejects.toThrow(NotFoundException);
  });

  // ── 7. Fixture lock state ──────────────────────────────────────────────────
  it('getFixtureLockState returns OPEN for scheduled future fixture', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({
      id: 'f1', status: 'SCHEDULED', kickoffAt: FUTURE, gameweek: null,
    });

    const result = await service.getFixtureLockState('f1');
    expect(result.isLocked).toBe(false);
    expect(result.lockReason).toBe('OPEN');
    expect(result.fixtureId).toBe('f1');
  });

  it('getFixtureLockState returns GAMEWEEK_DEADLINE when deadline passed', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({
      id: 'f1', status: 'SCHEDULED', kickoffAt: FUTURE,
      gameweek: { predictionDeadlineAt: PAST },
    });

    const result = await service.getFixtureLockState('f1');
    expect(result.isLocked).toBe(true);
    expect(result.lockReason).toBe('GAMEWEEK_DEADLINE');
    expect(result.gameweekPredictionDeadlineAt).toEqual(PAST);
  });

  it('getFixtureLockState returns KICKOFF_PASSED after kickoff without gameweek', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({
      id: 'f1', status: 'SCHEDULED', kickoffAt: PAST, gameweek: null,
    });

    const result = await service.getFixtureLockState('f1');
    expect(result.isLocked).toBe(true);
    expect(result.lockReason).toBe('KICKOFF_PASSED');
  });

  it('getFixtureLockState returns FIXTURE_FINISHED for finished fixture', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({
      id: 'f1', status: 'FINISHED', kickoffAt: PAST, gameweek: null,
    });

    const result = await service.getFixtureLockState('f1');
    expect(result.isLocked).toBe(true);
    expect(result.lockReason).toBe('FIXTURE_FINISHED');
  });

  it('getFixtureLockState returns FIXTURE_STARTED for LIVE fixture', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({
      id: 'f1', status: 'LIVE', kickoffAt: PAST, gameweek: null,
    });

    const result = await service.getFixtureLockState('f1');
    expect(result.isLocked).toBe(true);
    expect(result.lockReason).toBe('FIXTURE_STARTED');
  });

  it('getFixtureLockState uses gameweek deadline as deadlineAt when earlier than kickoff', async () => {
    const earlyDeadline = new Date(Date.now() + 3_600_000); // 1h from now
    const lateKickoff = new Date(Date.now() + 7_200_000);   // 2h from now
    (prisma.fixture.findUnique as Mock).mockResolvedValue({
      id: 'f1', status: 'SCHEDULED', kickoffAt: lateKickoff,
      gameweek: { predictionDeadlineAt: earlyDeadline },
    });

    const result = await service.getFixtureLockState('f1');
    expect(result.isLocked).toBe(false);
    expect(result.deadlineAt).toEqual(earlyDeadline);
  });

  it('getFixtureLockState throws NotFoundException for missing fixture', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(null);
    await expect(service.getFixtureLockState('bad')).rejects.toThrow(NotFoundException);
  });

  // ── 8. Lock fixture ────────────────────────────────────────────────────────
  it('lockFixture locks all PENDING predictions for a fixture', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({ id: 'f1' });
    (prisma.scorePrediction.count as Mock).mockResolvedValue(2); // already locked before op
    (prisma.scorePrediction.updateMany as Mock).mockResolvedValue({ count: 3 });

    const result = await service.lockFixture('f1');
    expect(result.fixtureId).toBe('f1');
    expect(result.predictionsLocked).toBe(3);
    expect(result.skippedAlreadyLocked).toBe(2);
  });

  it('lockFixture is idempotent — returns 0 locked when all already locked', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({ id: 'f1' });
    (prisma.scorePrediction.count as Mock).mockResolvedValue(5);
    (prisma.scorePrediction.updateMany as Mock).mockResolvedValue({ count: 0 });

    const result = await service.lockFixture('f1');
    expect(result.predictionsLocked).toBe(0);
    expect(result.skippedAlreadyLocked).toBe(5);
  });

  it('lockFixture throws NotFoundException for missing fixture', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(null);
    await expect(service.lockFixture('bad')).rejects.toThrow(NotFoundException);
  });

  // ── 9. Void fixture ────────────────────────────────────────────────────────
  it('voidFixture voids PENDING and LOCKED predictions', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({ id: 'f1' });
    (prisma.scorePrediction.count as Mock).mockResolvedValue(1); // 1 already terminal (WON)
    (prisma.scorePrediction.updateMany as Mock).mockResolvedValue({ count: 4 });

    const result = await service.voidFixture('f1');
    expect(result.fixtureId).toBe('f1');
    expect(result.predictionsVoided).toBe(4);
    expect(result.skippedAlreadySettledOrVoid).toBe(1);
    expect(prisma.predictionPointsLedger.create).not.toHaveBeenCalled();
  });

  it('voidFixture creates no ledger entries', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({ id: 'f1' });
    (prisma.scorePrediction.count as Mock).mockResolvedValue(0);
    (prisma.scorePrediction.updateMany as Mock).mockResolvedValue({ count: 2 });

    await service.voidFixture('f1');
    expect(prisma.predictionPointsLedger.create).not.toHaveBeenCalled();
  });

  it('voidFixture is idempotent — second call voids 0', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue({ id: 'f1' });
    (prisma.scorePrediction.count as Mock).mockResolvedValue(3); // 3 already VOID
    (prisma.scorePrediction.updateMany as Mock).mockResolvedValue({ count: 0 });

    const result = await service.voidFixture('f1');
    expect(result.predictionsVoided).toBe(0);
    expect(result.skippedAlreadySettledOrVoid).toBe(3);
  });

  it('voidFixture throws NotFoundException for missing fixture', async () => {
    (prisma.fixture.findUnique as Mock).mockResolvedValue(null);
    await expect(service.voidFixture('bad')).rejects.toThrow(NotFoundException);
  });
});
