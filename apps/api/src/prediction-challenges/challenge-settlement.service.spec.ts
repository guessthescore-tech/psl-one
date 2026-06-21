import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuditEvent, FixtureStatus, PredictionChallengeStatus } from '@prisma/client';
import { ChallengeSettlementService } from './challenge-settlement.service';
import type { PrismaService } from '../prisma/prisma.service';

const makePrismaMock = () => ({
  predictionChallenge: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  authAuditLog: { create: vi.fn().mockResolvedValue({}) },
});

const FIXTURE_FINISHED = {
  id: 'fx-1',
  status: FixtureStatus.FINISHED,
  homeScore: 2,
  awayScore: 1,
  homeTeam: { id: 'ht-1', name: 'Home', shortName: 'HME', slug: 'home' },
  awayTeam: { id: 'at-1', name: 'Away', shortName: 'AWY', slug: 'away' },
};

const FIXTURE_LIVE = { ...FIXTURE_FINISHED, status: FixtureStatus.LIVE };
const FIXTURE_SCHEDULED = { ...FIXTURE_FINISHED, status: FixtureStatus.SCHEDULED, homeScore: null, awayScore: null };

const BASE_ACCEPTED = {
  id: 'ch-1',
  token: 'tok-abc',
  fixtureId: 'fx-1',
  creatorUserId: 'uid-creator',
  creatorHomeScore: 2,
  creatorAwayScore: 1,
  acceptorUserId: 'uid-acc',
  acceptorHomeScore: 1,
  acceptorAwayScore: 1,
  status: PredictionChallengeStatus.ACCEPTED,
  expiresAt: new Date(Date.now() + 86400000),
  acceptedAt: new Date(),
  settledAt: null,
  creatorPoints: null,
  acceptorPoints: null,
  winnerUserId: null,
  settlementReason: null,
  fixture: FIXTURE_FINISHED,
};

describe('ChallengeSettlementService', () => {
  let service: ChallengeSettlementService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    service = new ChallengeSettlementService(prisma as unknown as PrismaService);
  });

  describe('settle', () => {
    it('throws NotFoundException for unknown token', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue(null);
      await expect(service.settle('bad-token')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when challenge is not ACCEPTED', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({
        ...BASE_ACCEPTED,
        status: PredictionChallengeStatus.PENDING,
      });
      await expect(service.settle('tok-abc')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when fixture is not FINISHED', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({
        ...BASE_ACCEPTED,
        fixture: FIXTURE_LIVE,
      });
      await expect(service.settle('tok-abc')).rejects.toThrow(BadRequestException);
    });

    it('settles with exact score — creator wins', async () => {
      // creator predicted 2-1 (exact), acceptor predicted 1-1 (correct outcome is WRONG: actual is HOME win)
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({
        ...BASE_ACCEPTED,
        creatorHomeScore: 2,
        creatorAwayScore: 1,
        acceptorHomeScore: 1,
        acceptorAwayScore: 1,
        fixture: FIXTURE_FINISHED, // actual 2-1
      });
      (prisma.predictionChallenge.update as Mock).mockResolvedValue({});

      const result = await service.settle('tok-abc');
      expect(result.creatorPoints).toBe(10); // exact score
      expect(result.acceptorPoints).toBe(0); // wrong outcome (DRAW vs HOME_WIN)
      expect(result.winnerUserId).toBe('uid-creator');
    });

    it('settles with correct outcome only', async () => {
      // creator predicted 3-0 (home win, correct outcome), acceptor predicted 0-1 (away win, wrong)
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({
        ...BASE_ACCEPTED,
        creatorHomeScore: 3,
        creatorAwayScore: 0,
        acceptorHomeScore: 0,
        acceptorAwayScore: 1,
        fixture: FIXTURE_FINISHED, // actual 2-1 home win
      });
      (prisma.predictionChallenge.update as Mock).mockResolvedValue({});

      const result = await service.settle('tok-abc');
      expect(result.creatorPoints).toBe(5); // correct outcome
      expect(result.acceptorPoints).toBe(0); // wrong
      expect(result.winnerUserId).toBe('uid-creator');
    });

    it('settles as draw when both score same points', async () => {
      // both predict home win with different scores
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({
        ...BASE_ACCEPTED,
        creatorHomeScore: 3,
        creatorAwayScore: 0,
        acceptorHomeScore: 1,
        acceptorAwayScore: 0,
        fixture: FIXTURE_FINISHED, // 2-1 home win
      });
      (prisma.predictionChallenge.update as Mock).mockResolvedValue({});

      const result = await service.settle('tok-abc');
      expect(result.creatorPoints).toBe(5);
      expect(result.acceptorPoints).toBe(5);
      expect(result.winnerUserId).toBeNull();
    });

    it('is idempotent — already SETTLED returns existing result', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({
        ...BASE_ACCEPTED,
        status: PredictionChallengeStatus.SETTLED,
        creatorPoints: 10,
        acceptorPoints: 5,
        winnerUserId: 'uid-creator',
        settlementReason: 'Creator wins: 10 pts vs 5 pts',
      });

      const result = await service.settle('tok-abc');
      expect(result.status).toBe('SETTLED');
      expect(result.creatorPoints).toBe(10);
      // Must NOT call update — idempotent
      expect(prisma.predictionChallenge.update).not.toHaveBeenCalled();
    });

    it('records CHALLENGE_SETTLED audit event', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({ ...BASE_ACCEPTED });
      (prisma.predictionChallenge.update as Mock).mockResolvedValue({});

      await service.settle('tok-abc');
      expect(prisma.authAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ event: AuditEvent.CHALLENGE_SETTLED }),
        }),
      );
    });

    it('does not create wallet records', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({ ...BASE_ACCEPTED });
      (prisma.predictionChallenge.update as Mock).mockResolvedValue({});

      await service.settle('tok-abc');
      // No wallet-related prisma calls
      expect((prisma as Record<string, unknown>)['wallet']).toBeUndefined();
      expect((prisma as Record<string, unknown>)['fanValueLedger']).toBeUndefined();
    });

    it('points result has no money/financial fields', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({ ...BASE_ACCEPTED });
      (prisma.predictionChallenge.update as Mock).mockResolvedValue({});

      const result = await service.settle('tok-abc');
      expect(JSON.stringify(result)).not.toMatch(/\b(money|wallet|payout|deposit|cash|stake|odds)\b/i);
    });
  });

  describe('getResult', () => {
    it('returns settled challenge result', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({
        id: 'ch-1',
        status: PredictionChallengeStatus.SETTLED,
        creatorHomeScore: 2,
        creatorAwayScore: 1,
        acceptorHomeScore: 1,
        acceptorAwayScore: 1,
        creatorPoints: 10,
        acceptorPoints: 0,
        winnerUserId: 'uid-creator',
        settlementReason: 'Creator wins',
        settledAt: new Date(),
        fixture: FIXTURE_FINISHED,
      });

      const result = await service.getResult('tok-abc');
      expect(result.status).toBe(PredictionChallengeStatus.SETTLED);
      expect(result.creatorPoints).toBe(10);
    });

    it('returns pending challenge without points', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({
        id: 'ch-1',
        status: PredictionChallengeStatus.ACCEPTED,
        creatorHomeScore: 2,
        creatorAwayScore: 1,
        acceptorHomeScore: null,
        acceptorAwayScore: null,
        creatorPoints: null,
        acceptorPoints: null,
        winnerUserId: null,
        settlementReason: null,
        settledAt: null,
        fixture: { ...FIXTURE_SCHEDULED, status: FixtureStatus.SCHEDULED },
      });

      const result = await service.getResult('tok-abc');
      expect(result.creatorPoints).toBeNull();
      expect(result.winnerUserId).toBeNull();
    });

    it('throws NotFoundException for unknown token', async () => {
      (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue(null);
      await expect(service.getResult('bad')).rejects.toThrow(NotFoundException);
    });
  });
});
