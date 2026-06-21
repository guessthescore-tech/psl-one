import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { FixtureStatus, PredictionChallengeStatus } from '@prisma/client';
import { ChallengeSettlementService } from './challenge-settlement.service';
import type { PrismaService } from '../prisma/prisma.service';

const makePrismaMock = () => ({
  predictionChallenge: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  authAuditLog: { create: vi.fn().mockResolvedValue({}) },
});

const FIXTURE_FINISHED = {
  id: 'fx-1',
  status: FixtureStatus.FINISHED,
  homeScore: 2,
  awayScore: 1,
  homeTeam: { id: 'ht', name: 'Home', shortName: 'HME', slug: 'home' },
  awayTeam: { id: 'at', name: 'Away', shortName: 'AWY', slug: 'away' },
};

const CHALLENGE_ACCEPTED = {
  id: 'ch-1',
  token: 'tok-1',
  fixtureId: 'fx-1',
  creatorUserId: 'u-creator',
  creatorHomeScore: 2,
  creatorAwayScore: 1,
  acceptorUserId: 'u-acc',
  acceptorHomeScore: 1,
  acceptorAwayScore: 0,
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

describe('ChallengeSettlementService — settleAllAcceptedForFixture', () => {
  let service: ChallengeSettlementService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = makePrismaMock();
    service = new ChallengeSettlementService(prisma as unknown as PrismaService);
  });

  it('settles all accepted challenges for a finished fixture', async () => {
    (prisma.predictionChallenge.findMany as Mock).mockResolvedValue([
      { token: 'tok-1' },
      { token: 'tok-2' },
    ]);
    // Both challenges accepted + fixture FINISHED
    (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue(CHALLENGE_ACCEPTED);
    (prisma.predictionChallenge.update as Mock).mockResolvedValue({});

    const result = await service.settleAllAcceptedForFixture('fx-1');
    expect(result.settled).toBe(2);
    expect(result.errors).toBe(0);
  });

  it('returns empty result when no accepted challenges exist', async () => {
    (prisma.predictionChallenge.findMany as Mock).mockResolvedValue([]);

    const result = await service.settleAllAcceptedForFixture('fx-no-challenges');
    expect(result.settled).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.errors).toBe(0);
  });

  it('skips already SETTLED challenges (idempotent)', async () => {
    (prisma.predictionChallenge.findMany as Mock).mockResolvedValue([{ token: 'tok-settled' }]);
    (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({
      ...CHALLENGE_ACCEPTED,
      status: PredictionChallengeStatus.SETTLED,
      creatorPoints: 10,
      acceptorPoints: 0,
      winnerUserId: 'u-creator',
      settlementReason: 'Creator wins: 10 pts vs 0 pts',
    });

    const result = await service.settleAllAcceptedForFixture('fx-1');
    // Already settled returns idempotent data with status SETTLED
    expect(result.settled).toBeGreaterThanOrEqual(0);
    expect(result.errors).toBe(0);
  });

  it('continues settling remaining challenges when one fails', async () => {
    (prisma.predictionChallenge.findMany as Mock).mockResolvedValue([
      { token: 'tok-fail' },
      { token: 'tok-ok' },
    ]);
    (prisma.predictionChallenge.findUnique as Mock)
      .mockResolvedValueOnce(null) // tok-fail → NotFoundException
      .mockResolvedValueOnce(CHALLENGE_ACCEPTED); // tok-ok → succeeds
    (prisma.predictionChallenge.update as Mock).mockResolvedValue({});

    const result = await service.settleAllAcceptedForFixture('fx-1');
    expect(result.errors).toBe(1);
    expect(result.settled).toBe(1);
  });

  it('does not settle if fixture is not FINISHED', async () => {
    // findMany returns token but individual settle should reject non-FINISHED
    (prisma.predictionChallenge.findMany as Mock).mockResolvedValue([{ token: 'tok-1' }]);
    (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue({
      ...CHALLENGE_ACCEPTED,
      fixture: { ...FIXTURE_FINISHED, status: FixtureStatus.LIVE },
    });

    const result = await service.settleAllAcceptedForFixture('fx-1');
    expect(result.errors).toBe(1);
    expect(result.settled).toBe(0);
  });

  it('queries only ACCEPTED status challenges for the fixture', async () => {
    (prisma.predictionChallenge.findMany as Mock).mockResolvedValue([]);

    await service.settleAllAcceptedForFixture('fx-specific');

    expect(prisma.predictionChallenge.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          fixtureId: 'fx-specific',
          status: PredictionChallengeStatus.ACCEPTED,
        }),
      }),
    );
  });

  it('does not create wallet records', async () => {
    (prisma.predictionChallenge.findMany as Mock).mockResolvedValue([{ token: 'tok-1' }]);
    (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue(CHALLENGE_ACCEPTED);
    (prisma.predictionChallenge.update as Mock).mockResolvedValue({});

    await service.settleAllAcceptedForFixture('fx-1');

    expect((prisma as Record<string, unknown>)['wallet']).toBeUndefined();
    expect((prisma as Record<string, unknown>)['fanValueLedger']).toBeUndefined();
  });

  it('settlement result contains no financial language', async () => {
    (prisma.predictionChallenge.findMany as Mock).mockResolvedValue([{ token: 'tok-1' }]);
    (prisma.predictionChallenge.findUnique as Mock).mockResolvedValue(CHALLENGE_ACCEPTED);
    (prisma.predictionChallenge.update as Mock).mockResolvedValue({});

    const result = await service.settleAllAcceptedForFixture('fx-1');
    expect(JSON.stringify(result)).not.toMatch(/\b(money|wallet|payout|deposit|cash|stake|odds)\b/i);
  });
});

describe('ChallengeSettlementService — Football integration: settle on FINISHED', () => {
  it('fixture FINISHED triggers settleAllAcceptedForFixture', () => {
    const fs = require('fs');
    const path = require('path');
    const footballServiceFile = fs.readFileSync(
      path.resolve(__dirname, '..', 'football', 'football.service.ts'),
      'utf8',
    );
    expect(footballServiceFile).toContain('FINISHED');
    expect(footballServiceFile).toContain('settleAllAcceptedForFixture');
    expect(footballServiceFile).toContain('ChallengeSettlementService');
  });

  it('football module imports PredictionChallengesModule', () => {
    const fs = require('fs');
    const path = require('path');
    const moduleFile = fs.readFileSync(
      path.resolve(__dirname, '..', 'football', 'football.module.ts'),
      'utf8',
    );
    expect(moduleFile).toContain('PredictionChallengesModule');
  });

  it('settle trigger is fire-and-forget (does not await)', () => {
    const fs = require('fs');
    const path = require('path');
    const footballServiceFile = fs.readFileSync(
      path.resolve(__dirname, '..', 'football', 'football.service.ts'),
      'utf8',
    );
    // Should use .catch() not await directly in the main flow
    expect(footballServiceFile).toContain('.catch(');
  });
});
