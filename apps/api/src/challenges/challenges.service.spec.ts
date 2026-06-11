import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { AchievementsService } from '../achievements/achievements.service';

const makeAchievementsMock = () => ({
  safeEvaluate: vi.fn().mockResolvedValue(undefined),
}) as unknown as AchievementsService;

const makePrismaMock = () => ({
  user: { findUnique: vi.fn() },
  fixture: { findUnique: vi.fn() },
  scorePrediction: { findUnique: vi.fn() },
  peerChallenge: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
});

const FUTURE = new Date(Date.now() + 86_400_000);
const PAST = new Date(Date.now() - 86_400_000);

const MOCK_SCHEDULED = { id: 'f1', status: 'SCHEDULED', kickoffAt: FUTURE };
const MOCK_FINISHED = { id: 'f1', status: 'FINISHED', kickoffAt: PAST };

const MOCK_OPPONENT = { id: 'user-2', email: 'opp@test.com' };
const MOCK_CHALLENGER = { id: 'user-1', email: 'ch@test.com' };

const MOCK_PREDICTION_CHALLENGER = {
  id: 'pred-a', userId: 'user-1', fixtureId: 'f1',
  predictedHomeScore: 2, predictedAwayScore: 1, pointsAwarded: 0, status: 'PENDING',
};
const MOCK_PREDICTION_OPPONENT = {
  id: 'pred-b', userId: 'user-2', fixtureId: 'f1',
  predictedHomeScore: 0, predictedAwayScore: 1, pointsAwarded: 0, status: 'PENDING',
};

const MOCK_CHALLENGE_PENDING = {
  id: 'ch-1',
  challengerUserId: 'user-1',
  opponentUserId: 'user-2',
  fixtureId: 'f1',
  status: 'PENDING',
  challengerPredictionId: 'pred-a',
  opponentPredictionId: null,
  winnerUserId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  settledAt: null,
  pointsAwardedChallenger: null,
  pointsAwardedOpponent: null,
};

describe('ChallengesService', () => {
  let service: ChallengesService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    service = new ChallengesService(prisma as unknown as PrismaService, makeAchievementsMock(), { createInAppNotification: vi.fn().mockResolvedValue(null) } as any, { createChallengeActivity: vi.fn().mockResolvedValue(null) } as any);
  });

  // ── 1. Create challenge ────────────────────────────────────────────────────
  it('creates challenge successfully', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue(MOCK_OPPONENT);
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_SCHEDULED);
    (prisma.scorePrediction.findUnique as Mock).mockResolvedValue(MOCK_PREDICTION_CHALLENGER);
    (prisma.peerChallenge.create as Mock).mockResolvedValue(MOCK_CHALLENGE_PENDING);

    const result = await service.createChallenge('user-1', {
      fixtureId: 'f1', opponentEmail: 'opp@test.com',
    });
    expect(result.id).toBe('ch-1');
    expect(result.challengerUserId).toBe('user-1');
    expect(result.opponentUserId).toBe('user-2');
  });

  it('blocks challenging yourself', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue(MOCK_CHALLENGER); // same user
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_SCHEDULED);

    await expect(
      service.createChallenge('user-1', { fixtureId: 'f1', opponentEmail: 'ch@test.com' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when opponent email not found', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue(null);

    await expect(
      service.createChallenge('user-1', { fixtureId: 'f1', opponentEmail: 'ghost@test.com' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('blocks challenge when fixture not SCHEDULED', async () => {
    (prisma.user.findUnique as Mock).mockResolvedValue(MOCK_OPPONENT);
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_FINISHED);

    await expect(
      service.createChallenge('user-1', { fixtureId: 'f1', opponentEmail: 'opp@test.com' }),
    ).rejects.toThrow(BadRequestException);
  });

  // ── 2. Accept challenge ────────────────────────────────────────────────────
  it('accepts challenge when opponent has prediction', async () => {
    (prisma.peerChallenge.findUnique as Mock).mockResolvedValue(MOCK_CHALLENGE_PENDING);
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_SCHEDULED);
    (prisma.scorePrediction.findUnique as Mock).mockResolvedValue(MOCK_PREDICTION_OPPONENT);
    (prisma.peerChallenge.update as Mock).mockResolvedValue({
      ...MOCK_CHALLENGE_PENDING, status: 'ACCEPTED', opponentPredictionId: 'pred-b',
    });

    const result = await service.acceptChallenge('user-2', 'ch-1');
    expect(result.status).toBe('ACCEPTED');
  });

  it('blocks accept when opponent has no prediction', async () => {
    (prisma.peerChallenge.findUnique as Mock).mockResolvedValue(MOCK_CHALLENGE_PENDING);
    (prisma.fixture.findUnique as Mock).mockResolvedValue(MOCK_SCHEDULED);
    (prisma.scorePrediction.findUnique as Mock).mockResolvedValue(null);

    await expect(service.acceptChallenge('user-2', 'ch-1')).rejects.toThrow(BadRequestException);
  });

  it('blocks accept by non-opponent', async () => {
    (prisma.peerChallenge.findUnique as Mock).mockResolvedValue(MOCK_CHALLENGE_PENDING);

    await expect(service.acceptChallenge('user-3', 'ch-1')).rejects.toThrow(ForbiddenException);
  });

  it('blocks accept of already-accepted challenge', async () => {
    (prisma.peerChallenge.findUnique as Mock).mockResolvedValue({
      ...MOCK_CHALLENGE_PENDING,
      status: 'ACCEPTED',
    });

    await expect(service.acceptChallenge('user-2', 'ch-1')).rejects.toThrow(BadRequestException);
  });

  // ── 3. Decline challenge ───────────────────────────────────────────────────
  it('declines challenge successfully', async () => {
    (prisma.peerChallenge.findUnique as Mock).mockResolvedValue(MOCK_CHALLENGE_PENDING);
    (prisma.peerChallenge.update as Mock).mockResolvedValue({
      ...MOCK_CHALLENGE_PENDING, status: 'DECLINED',
    });

    const result = await service.declineChallenge('user-2', 'ch-1');
    expect(result.status).toBe('DECLINED');
  });

  it('blocks decline by non-opponent', async () => {
    (prisma.peerChallenge.findUnique as Mock).mockResolvedValue(MOCK_CHALLENGE_PENDING);

    await expect(service.declineChallenge('user-3', 'ch-1')).rejects.toThrow(ForbiddenException);
  });

  // ── 4. Cancel challenge ────────────────────────────────────────────────────
  it('cancels challenge by challenger', async () => {
    (prisma.peerChallenge.findUnique as Mock).mockResolvedValue(MOCK_CHALLENGE_PENDING);
    (prisma.peerChallenge.update as Mock).mockResolvedValue({
      ...MOCK_CHALLENGE_PENDING, status: 'CANCELLED',
    });

    const result = await service.cancelChallenge('user-1', 'ch-1');
    expect(result.status).toBe('CANCELLED');
  });

  it('blocks cancel by non-challenger', async () => {
    (prisma.peerChallenge.findUnique as Mock).mockResolvedValue(MOCK_CHALLENGE_PENDING);

    await expect(service.cancelChallenge('user-2', 'ch-1')).rejects.toThrow(ForbiddenException);
  });

  // ── 5. Get challenges ──────────────────────────────────────────────────────
  it('returns only challenges where user is participant', async () => {
    (prisma.peerChallenge.findMany as Mock).mockResolvedValue([MOCK_CHALLENGE_PENDING]);

    const result = await service.getMyChallenge('user-1');
    expect(result).toHaveLength(1);
    expect(prisma.peerChallenge.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ OR: expect.any(Array) }),
      }),
    );
  });

  it('throws NotFoundException for unknown challenge', async () => {
    (prisma.peerChallenge.findUnique as Mock).mockResolvedValue(null);

    await expect(service.getChallenge('user-1', 'bad-id')).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when non-participant accesses challenge', async () => {
    (prisma.peerChallenge.findUnique as Mock).mockResolvedValue(MOCK_CHALLENGE_PENDING);

    await expect(service.getChallenge('user-9', 'ch-1')).rejects.toThrow(ForbiddenException);
  });
});
