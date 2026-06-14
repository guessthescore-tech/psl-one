import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChallengeListingStatus, ChallengeListingVisibility, PredictionMarketStatus } from '@prisma/client';
import { SocialPredictionService } from './social-prediction.service';

function makePrisma() {
  return {
    predictionMarketConfig: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    fixturePredictionMarket: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    gameweekPointsAllocation: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    challengeListing: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    challengeMatch: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    challengeScore: {
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    socialPredictionPointsEntry: {
      create: vi.fn(),
      createMany: vi.fn(),
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    complianceDomainConfig: {
      findUnique: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    fixture: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(makePrisma())),
  };
}

function makeNotifications() {
  return {
    createInAppNotification: vi.fn().mockResolvedValue({}),
    createNotification: vi.fn().mockResolvedValue({}),
  };
}

function makeActivityFeed() {
  return { createUserActivity: vi.fn().mockResolvedValue({}) };
}

const mockConfig = {
  id: 'cfg-1',
  marketType: 'MATCH_RESULT',
  label: 'Match Result',
  baseOpportunity: 100,
  allowedMultipliersJson: [1.0, 1.5, 2.0],
  minCommitmentPct: 10,
  maxCommitmentPct: 100,
  pointsReturnRate: 1.0,
  isEnabled: true,
  seasonId: 'season-1',
  createdByUserId: 'admin-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMarket = {
  id: 'market-1',
  fixtureId: 'fixture-1',
  marketConfigId: 'cfg-1',
  marketType: 'MATCH_RESULT',
  status: PredictionMarketStatus.OPEN,
  homeSelectionLabel: 'Pirates',
  drawSelectionLabel: 'Draw',
  awaySelectionLabel: 'Chiefs',
  baseOpportunity: 100,
  pointsReturnRate: 1.0,
  allowedMultipliersJson: [1.0, 1.5, 2.0],
  marketConfig: mockConfig,
  settledOutcome: null,
  locksAt: null,
  lockedAt: null,
  settledAt: null,
  voidedAt: null,
  voidReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAllocation = {
  id: 'alloc-1',
  fanUserId: 'fan-1',
  gameweekId: 'gw-1',
  seasonId: 'season-1',
  totalAllocation: 500,
  usedAllocation: 0,
  remainingAllocation: 500,
  maxConcurrentChallenges: 10,
  maxCommitmentPctPerPrediction: 50,
  maxConfidenceMultiplier: 2.0,
  isAdminAdjusted: false,
  adjustmentReason: null,
  adjustedByUserId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockListing = {
  id: 'listing-1',
  fanUserId: 'fan-1',
  fixtureMarketId: 'market-1',
  gameweekId: 'gw-1',
  seasonId: 'season-1',
  supportingSelection: 'HOME',
  opposingSelection: 'AWAY_OR_DRAW',
  baseOpportunity: 100,
  pointsCommitmentPct: 40,
  committedPoints: 40,
  pointsReturnRate: 1.0,
  confidenceMultiplier: 1.5,
  potentialPointsAward: 60,
  maximumPointsExposure: 40,
  availablePoints: 40,
  matchedPoints: 0,
  status: ChallengeListingStatus.OPEN,
  visibility: ChallengeListingVisibility.PUBLIC,
  leagueId: null,
  publishedAt: new Date(),
  expiresAt: null,
  withdrawnAt: null,
  idempotencyKey: 'idem-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  fixtureMarket: mockMarket,
};

describe('SocialPredictionService', () => {
  let svc: SocialPredictionService;
  let prisma: ReturnType<typeof makePrisma>;
  let notifications: ReturnType<typeof makeNotifications>;

  beforeEach(() => {
    prisma = makePrisma();
    notifications = makeNotifications();
    const activityFeed = makeActivityFeed();
    svc = new SocialPredictionService(prisma as never, notifications as never, activityFeed as never);
  });

  // ── Market Config ─────────────────────────────────────────────────────────

  describe('adminCreateMarketConfig', () => {
    it('creates config when none exists', async () => {
      prisma.predictionMarketConfig.findUnique.mockResolvedValue(null);
      prisma.predictionMarketConfig.create.mockResolvedValue(mockConfig);

      const result = await svc.adminCreateMarketConfig('admin-1', {
        marketType: 'MATCH_RESULT' as never,
        label: 'Match Result',
        allowedMultipliers: [1.0, 1.5, 2.0],
        seasonId: 'season-1',
      });

      expect(result).toBe(mockConfig);
      expect(prisma.predictionMarketConfig.create).toHaveBeenCalledOnce();
    });

    it('throws BadRequest when config already exists', async () => {
      prisma.predictionMarketConfig.findUnique.mockResolvedValue(mockConfig);
      await expect(
        svc.adminCreateMarketConfig('admin-1', {
          marketType: 'MATCH_RESULT' as never,
          label: 'Match Result',
          allowedMultipliers: [1.0],
          seasonId: 'season-1',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── Grant Allocation ──────────────────────────────────────────────────────

  describe('adminGrantAllocation', () => {
    it('grants allocation to all active fans', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 'fan-1' }, { id: 'fan-2' }]);
      prisma.gameweekPointsAllocation.upsert.mockResolvedValue(mockAllocation);

      const result = await svc.adminGrantAllocation('admin-1', {
        gameweekId: 'gw-1',
        seasonId: 'season-1',
        totalAllocation: 500,
      });

      expect(result.granted).toBe(2);
      expect(prisma.gameweekPointsAllocation.upsert).toHaveBeenCalledTimes(2);
    });
  });

  // ── Fan Get Allocation ────────────────────────────────────────────────────

  describe('fanGetAllocation', () => {
    it('returns allocation and safety note', async () => {
      prisma.gameweekPointsAllocation.findUnique.mockResolvedValue(mockAllocation);
      const result = await svc.fanGetAllocation('fan-1', 'gw-1');
      expect(result.allocation).toBe(mockAllocation);
      expect(result.safetyNote).toContain('system-issued gameplay points');
    });

    it('returns null allocation without throwing', async () => {
      prisma.gameweekPointsAllocation.findUnique.mockResolvedValue(null);
      const result = await svc.fanGetAllocation('fan-1', 'gw-1');
      expect(result.allocation).toBeNull();
    });
  });

  // ── Create Listing ────────────────────────────────────────────────────────

  describe('fanCreateListing', () => {
    const baseDto = {
      fixtureMarketId: 'market-1',
      gameweekId: 'gw-1',
      seasonId: 'season-1',
      supportingSelection: 'HOME',
      pointsCommitmentPct: 40,
      confidenceMultiplier: 1.5,
      idempotencyKey: 'idem-new',
    };

    beforeEach(() => {
      prisma.challengeListing.findUnique.mockResolvedValue(null); // no idempotent match
      prisma.fixturePredictionMarket.findUnique.mockResolvedValue(mockMarket);
      prisma.gameweekPointsAllocation.findUnique.mockResolvedValue(mockAllocation);
      prisma.challengeListing.count.mockResolvedValue(0);
      prisma.gameweekPointsAllocation.update.mockResolvedValue(mockAllocation);
      // $transaction calls the callback inline
      prisma.$transaction.mockImplementation((fn) => {
        const txPrisma = makePrisma();
        txPrisma.challengeListing.create.mockResolvedValue(mockListing);
        txPrisma.challengeScore.create.mockResolvedValue({});
        txPrisma.socialPredictionPointsEntry.create.mockResolvedValue({});
        return fn(txPrisma);
      });
      prisma.challengeListing.findUnique.mockResolvedValueOnce(null).mockResolvedValue({ ...mockListing, score: null });
      prisma.challengeListing.findMany.mockResolvedValue([]); // no auto-match
    });

    it('creates listing with correct calculated points', async () => {
      const result = await svc.fanCreateListing('fan-1', baseDto);
      expect(result.safetyNote).toContain('system-issued gameplay points');
      // committedPoints = floor(100 * 40 / 100) = 40
      // potentialPointsAward = floor(40 * 1.0 * 1.5) = 60
    });

    it('returns idempotent result when key exists', async () => {
      prisma.challengeListing.findUnique.mockReset().mockResolvedValue(mockListing);
      const result = await svc.fanCreateListing('fan-1', baseDto);
      expect(result.idempotent).toBe(true);
      expect(prisma.challengeListing.create).not.toHaveBeenCalled();
    });

    it('throws NotFound when market missing', async () => {
      prisma.challengeListing.findUnique.mockResolvedValue(null);
      prisma.fixturePredictionMarket.findUnique.mockResolvedValue(null);
      await expect(svc.fanCreateListing('fan-1', baseDto)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequest when market not OPEN', async () => {
      prisma.challengeListing.findUnique.mockResolvedValue(null);
      prisma.fixturePredictionMarket.findUnique.mockResolvedValue({ ...mockMarket, status: PredictionMarketStatus.LOCKED });
      await expect(svc.fanCreateListing('fan-1', baseDto)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when selection invalid for market type', async () => {
      prisma.challengeListing.findUnique.mockResolvedValue(null);
      prisma.fixturePredictionMarket.findUnique.mockResolvedValue(mockMarket);
      prisma.gameweekPointsAllocation.findUnique.mockResolvedValue(mockAllocation);
      await expect(svc.fanCreateListing('fan-1', { ...baseDto, supportingSelection: 'INVALID' })).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when commitment pct out of bounds', async () => {
      prisma.challengeListing.findUnique.mockResolvedValue(null);
      prisma.fixturePredictionMarket.findUnique.mockResolvedValue(mockMarket);
      prisma.gameweekPointsAllocation.findUnique.mockResolvedValue(mockAllocation);
      await expect(svc.fanCreateListing('fan-1', { ...baseDto, pointsCommitmentPct: 5 })).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when confidence multiplier not allowed', async () => {
      prisma.challengeListing.findUnique.mockResolvedValue(null);
      prisma.fixturePredictionMarket.findUnique.mockResolvedValue(mockMarket);
      prisma.gameweekPointsAllocation.findUnique.mockResolvedValue(mockAllocation);
      await expect(svc.fanCreateListing('fan-1', { ...baseDto, confidenceMultiplier: 5.0 })).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when no allocation found', async () => {
      prisma.challengeListing.findUnique.mockResolvedValue(null);
      prisma.fixturePredictionMarket.findUnique.mockResolvedValue(mockMarket);
      prisma.gameweekPointsAllocation.findUnique.mockResolvedValue(null);
      await expect(svc.fanCreateListing('fan-1', baseDto)).rejects.toThrow(BadRequestException);
    });
  });

  // ── Withdraw Listing ──────────────────────────────────────────────────────

  describe('fanWithdrawListing', () => {
    it('withdraws open listing and refunds allocation', async () => {
      prisma.challengeListing.findUnique.mockResolvedValue(mockListing);
      prisma.gameweekPointsAllocation.update.mockResolvedValue(mockAllocation);
      prisma.challengeListing.update.mockResolvedValue({ ...mockListing, status: ChallengeListingStatus.WITHDRAWN });

      const result = await svc.fanWithdrawListing('fan-1', 'listing-1');
      expect(result.status).toBe(ChallengeListingStatus.WITHDRAWN);
      expect(prisma.gameweekPointsAllocation.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ remainingAllocation: expect.anything() }) }),
      );
    });

    it('throws Forbidden when not owner', async () => {
      prisma.challengeListing.findUnique.mockResolvedValue(mockListing);
      await expect(svc.fanWithdrawListing('other-fan', 'listing-1')).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequest when fully matched', async () => {
      prisma.challengeListing.findUnique.mockResolvedValue({ ...mockListing, status: ChallengeListingStatus.FULLY_MATCHED });
      await expect(svc.fanWithdrawListing('fan-1', 'listing-1')).rejects.toThrow(BadRequestException);
    });
  });

  // ── Accept Listing ────────────────────────────────────────────────────────

  describe('fanAcceptListing', () => {
    const acceptDto = { pointsToAccept: 20, idempotencyKey: 'accept-idem-1' };

    beforeEach(() => {
      prisma.challengeMatch.findUnique.mockResolvedValue(null);
      prisma.challengeListing.findUnique.mockResolvedValue(mockListing);
      prisma.gameweekPointsAllocation.findUnique.mockResolvedValue({ ...mockAllocation, fanUserId: 'fan-2' });
      prisma.$transaction.mockImplementation((fn) => {
        const txPrisma = makePrisma();
        txPrisma.challengeListing.updateMany.mockResolvedValue({ count: 1 });
        txPrisma.challengeListing.findUnique.mockResolvedValue({ availablePoints: 0 });
        txPrisma.challengeListing.update.mockResolvedValue(mockListing);
        txPrisma.gameweekPointsAllocation.updateMany.mockResolvedValue({ count: 1 });
        txPrisma.challengeMatch.create.mockResolvedValue({ id: 'match-1', idempotencyKey: acceptDto.idempotencyKey });
        txPrisma.socialPredictionPointsEntry.create.mockResolvedValue({});
        return fn(txPrisma);
      });
    });

    it('creates match and returns safety note', async () => {
      const result = await svc.fanAcceptListing('fan-2', 'listing-1', acceptDto);
      expect(result.safetyNote).toContain('system-issued gameplay points');
      expect(result.match).toBeDefined();
    });

    it('returns idempotent when key already exists', async () => {
      prisma.challengeMatch.findUnique.mockResolvedValue({ id: 'match-1', idempotencyKey: acceptDto.idempotencyKey });
      const result = await svc.fanAcceptListing('fan-2', 'listing-1', acceptDto);
      expect(result.idempotent).toBe(true);
    });

    it('throws BadRequest when self-matching', async () => {
      await expect(svc.fanAcceptListing('fan-1', 'listing-1', acceptDto)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when market not open', async () => {
      prisma.challengeListing.findUnique.mockResolvedValue({ ...mockListing, fixtureMarket: { ...mockMarket, status: PredictionMarketStatus.LOCKED } });
      await expect(svc.fanAcceptListing('fan-2', 'listing-1', acceptDto)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when accepting more than available', async () => {
      await expect(svc.fanAcceptListing('fan-2', 'listing-1', { ...acceptDto, pointsToAccept: 999 })).rejects.toThrow(BadRequestException);
    });
  });

  // ── Leaderboard ───────────────────────────────────────────────────────────

  describe('fanGetLeaderboard', () => {
    it('returns ranked leaderboard', async () => {
      prisma.socialPredictionPointsEntry.groupBy.mockResolvedValue([
        { fanUserId: 'fan-1', _sum: { points: 120 } },
        { fanUserId: 'fan-2', _sum: { points: 80 } },
      ]);
      prisma.user.findMany.mockResolvedValue([
        { id: 'fan-1', fanProfile: { displayName: 'Alice' } },
        { id: 'fan-2', fanProfile: { displayName: 'Bob' } },
      ]);

      const result = await svc.fanGetLeaderboard('season-1');
      expect(result.leaderboard).toHaveLength(2);
      expect(result.leaderboard[0]!.rank).toBe(1);
      expect(result.leaderboard[0]!.pointsAwarded).toBe(120);
      expect(result.safetyNote).toContain('system-issued gameplay points');
    });
  });

  // ── Settlement ────────────────────────────────────────────────────────────

  describe('adminSettleMarket', () => {
    it('throws BadRequest when market not LOCKED', async () => {
      prisma.fixturePredictionMarket.findUnique.mockResolvedValue({ ...mockMarket, status: PredictionMarketStatus.OPEN });
      await expect(svc.adminSettleMarket('market-1', { settledOutcome: 'HOME' })).rejects.toThrow(BadRequestException);
    });

    it('settles market and processes matches', async () => {
      prisma.fixturePredictionMarket.findUnique.mockResolvedValue({ ...mockMarket, status: PredictionMarketStatus.LOCKED });
      prisma.fixturePredictionMarket.update.mockResolvedValue({ ...mockMarket, status: PredictionMarketStatus.SETTLED });
      prisma.challengeListing.findMany.mockResolvedValue([]);
      prisma.fixturePredictionMarket.findUnique.mockResolvedValueOnce({ ...mockMarket, status: PredictionMarketStatus.LOCKED }).mockResolvedValue({ ...mockMarket, status: PredictionMarketStatus.SETTLED });

      const result = await svc.adminSettleMarket('market-1', { settledOutcome: 'HOME' });
      expect(prisma.fixturePredictionMarket.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: PredictionMarketStatus.SETTLED }) }),
      );
    });
  });

  // ── Compliance ────────────────────────────────────────────────────────────

  describe('adminGetComplianceStatus', () => {
    it('returns compliance overview with safety statements', async () => {
      prisma.complianceDomainConfig.findUnique.mockResolvedValue(null);
      const result = await svc.adminGetComplianceStatus();
      expect(result.domainKey).toBe('POINTS_BASED_SOCIAL_PREDICTION_COMPLIANCE');
      expect(result.status).toBe('INTERNAL_REVIEW_REQUIRED');
      expect(result.safetyStatement).toContain('system-issued gameplay points');
      expect(result.classificationNotes).toContain('This product must NOT be classified as betting.');
    });
  });

  // ── Direct Friend Challenges ───────────────────────────────────────────────

  describe('fanCreateDirectChallenge', () => {
    const listing = {
      id: 'list-1',
      fanUserId: 'fan-1',
      status: 'OPEN',
      challengedUserId: null,
      availablePoints: 100,
      committedPoints: 50,
      pointsReturnRate: 1.0,
      supportingSelection: 'HOME',
      opposingSelection: 'AWAY_OR_DRAW',
    };

    it('sets challengedUserId and invitationStatus PENDING', async () => {
      prisma.challengeListing.findUnique.mockResolvedValue(listing);
      prisma.user.findUnique.mockResolvedValue({ id: 'fan-2' });
      prisma.challengeListing.update.mockResolvedValue({ ...listing, challengedUserId: 'fan-2', invitationStatus: 'PENDING' });
      notifications.createInAppNotification.mockResolvedValue({});

      const result = await svc.fanCreateDirectChallenge('fan-1', 'list-1', 'fan-2');
      expect(result.invitationStatus).toBe('PENDING');
      expect(prisma.challengeListing.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ challengedUserId: 'fan-2', invitationStatus: 'PENDING' }) }),
      );
    });

    it('throws ForbiddenException when caller does not own listing', async () => {
      prisma.challengeListing.findUnique.mockResolvedValue({ ...listing, fanUserId: 'other' });
      await expect(svc.fanCreateDirectChallenge('fan-1', 'list-1', 'fan-2')).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when listing already has a challenged user', async () => {
      prisma.challengeListing.findUnique.mockResolvedValue({ ...listing, challengedUserId: 'someone' });
      await expect(svc.fanCreateDirectChallenge('fan-1', 'list-1', 'fan-2')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when challenging yourself', async () => {
      prisma.challengeListing.findUnique.mockResolvedValue(listing);
      prisma.user.findUnique.mockResolvedValue({ id: 'fan-1' });
      await expect(svc.fanCreateDirectChallenge('fan-1', 'list-1', 'fan-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('fanDeclineDirectChallenge', () => {
    it('sets invitationStatus to DECLINED (immutable — does not republish)', async () => {
      const listing = { id: 'list-1', challengedUserId: 'fan-2', invitationStatus: 'PENDING', fanUserId: 'fan-1' };
      prisma.challengeListing.findUnique.mockResolvedValue(listing);
      prisma.challengeListing.update.mockResolvedValue({});

      await svc.fanDeclineDirectChallenge('fan-2', 'list-1');
      const call = ((prisma.challengeListing.update.mock.calls[0] ?? [])[0] as { data: Record<string, unknown> } | undefined) ?? { data: {} };
      expect(call.data.invitationStatus).toBe('DECLINED');
      // Must NOT restore to PUBLIC_MARKETPLACE — declined keeps history
      expect(call.data.challengeMode).toBeUndefined();
      expect(call.data.visibility).toBeUndefined();
    });

    it('throws ForbiddenException when caller is not the challenged user', async () => {
      prisma.challengeListing.findUnique.mockResolvedValue({ id: 'list-1', challengedUserId: 'fan-2', invitationStatus: 'PENDING', fanUserId: 'fan-1' });
      await expect(svc.fanDeclineDirectChallenge('fan-3', 'list-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('fanWithdrawDirectChallenge', () => {
    it('sets invitationStatus to WITHDRAWN (immutable — does not republish)', async () => {
      const listing = { id: 'list-1', fanUserId: 'fan-1', invitationStatus: 'PENDING' };
      prisma.challengeListing.findUnique.mockResolvedValue(listing);
      prisma.challengeListing.update.mockResolvedValue({});

      await svc.fanWithdrawDirectChallenge('fan-1', 'list-1');
      const withdrawCall = ((prisma.challengeListing.update.mock.calls[0] ?? [])[0] as { data: Record<string, unknown> } | undefined) ?? { data: {} };
      expect(withdrawCall.data.invitationStatus).toBe('WITHDRAWN');
      // Must NOT restore to PUBLIC_MARKETPLACE — withdrawn keeps history
      expect(withdrawCall.data.challengeMode).toBeUndefined();
      expect(withdrawCall.data.visibility).toBeUndefined();
    });
  });

  describe('fanGetChallengeShareLink', () => {
    it('returns share link with safety note', async () => {
      prisma.challengeListing.findUnique.mockResolvedValue({ id: 'list-1', fanUserId: 'fan-1' });
      const result = await svc.fanGetChallengeShareLink('fan-1', 'list-1');
      expect(result.shareLink).toContain('list-1');
      expect(result.safetyNote).toContain('system-issued gameplay points');
    });
  });

  // ── Atomic direct accept + concurrency guard ──────────────────────────────

  describe('fanAcceptDirectChallenge — atomic', () => {
    const listing = {
      id: 'list-1',
      fanUserId: 'fan-owner',
      fixtureMarketId: 'mkt-1',
      gameweekId: 'gw-1',
      seasonId: 'season-1',
      supportingSelection: 'HOME',
      opposingSelection: 'AWAY_OR_DRAW',
      availablePoints: 40,
      committedPoints: 40,
      pointsReturnRate: 1.0,
      status: 'OPEN',
      invitationStatus: 'PENDING',
      challengedUserId: 'fan-2',
      fixtureMarket: { status: 'OPEN' },
    };

    function setupHappyPath() {
      prisma.$transaction.mockImplementation((fn: (tx: typeof prisma) => unknown) => fn(prisma));
      prisma.challengeMatch.findFirst.mockResolvedValue(null); // no existing match
      prisma.challengeListing.findUnique.mockResolvedValue(listing);
      prisma.challengeListing.updateMany.mockResolvedValue({ count: 1 });
      prisma.gameweekPointsAllocation.updateMany.mockResolvedValue({ count: 1 });
      prisma.challengeMatch.create.mockResolvedValue({ id: 'match-1' });
      prisma.socialPredictionPointsEntry.createMany.mockResolvedValue({ count: 2 });
    }

    it('creates match and ledger entries in one transaction', async () => {
      setupHappyPath();
      const result = await svc.fanAcceptDirectChallenge('fan-2', 'list-1');
      expect(result.matchId).toBe('match-1');
      expect(prisma.challengeMatch.create).toHaveBeenCalledOnce();
      expect(prisma.socialPredictionPointsEntry.createMany).toHaveBeenCalledOnce();
    });

    it('is idempotent — returns existing match without creating duplicate', async () => {
      prisma.$transaction.mockImplementation((fn: (tx: typeof prisma) => unknown) => fn(prisma));
      prisma.challengeMatch.findFirst.mockResolvedValue({ id: 'match-existing' });

      const result = await svc.fanAcceptDirectChallenge('fan-2', 'list-1');
      expect(result.matchId).toBe('match-existing');
      expect(prisma.challengeMatch.create).not.toHaveBeenCalled();
      expect(prisma.challengeListing.updateMany).not.toHaveBeenCalled();
    });

    it('throws ConflictException when listing updateMany count is 0 (concurrent accept wins)', async () => {
      prisma.$transaction.mockImplementation((fn: (tx: typeof prisma) => unknown) => fn(prisma));
      prisma.challengeMatch.findFirst.mockResolvedValue(null);
      prisma.challengeListing.findUnique.mockResolvedValue(listing);
      prisma.challengeListing.updateMany.mockResolvedValue({ count: 0 });

      await expect(svc.fanAcceptDirectChallenge('fan-2', 'list-1')).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException when allocation updateMany count is 0 (insufficient points)', async () => {
      prisma.$transaction.mockImplementation((fn: (tx: typeof prisma) => unknown) => fn(prisma));
      prisma.challengeMatch.findFirst.mockResolvedValue(null);
      prisma.challengeListing.findUnique.mockResolvedValue(listing);
      prisma.challengeListing.updateMany.mockResolvedValue({ count: 1 });
      prisma.gameweekPointsAllocation.updateMany.mockResolvedValue({ count: 0 });

      await expect(svc.fanAcceptDirectChallenge('fan-2', 'list-1')).rejects.toThrow(ConflictException);
    });

    it('throws ForbiddenException when caller is not the challenged user', async () => {
      prisma.$transaction.mockImplementation((fn: (tx: typeof prisma) => unknown) => fn(prisma));
      prisma.challengeMatch.findFirst.mockResolvedValue(null);
      prisma.challengeListing.findUnique.mockResolvedValue({ ...listing, challengedUserId: 'someone-else' });

      await expect(svc.fanAcceptDirectChallenge('fan-2', 'list-1')).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when market is locked', async () => {
      prisma.$transaction.mockImplementation((fn: (tx: typeof prisma) => unknown) => fn(prisma));
      prisma.challengeMatch.findFirst.mockResolvedValue(null);
      prisma.challengeListing.findUnique.mockResolvedValue({ ...listing, fixtureMarket: { status: 'LOCKED' } });

      await expect(svc.fanAcceptDirectChallenge('fan-2', 'list-1')).rejects.toThrow(BadRequestException);
    });

    it('uses deterministic idempotency key (listingId + accepterUserId)', async () => {
      setupHappyPath();
      await svc.fanAcceptDirectChallenge('fan-2', 'list-1');
      const txFindFirst = ((prisma.challengeMatch.findFirst.mock.calls[0] ?? [])[0] as { where: { idempotencyKey: string } } | undefined) ?? { where: { idempotencyKey: '' } };
      expect(txFindFirst.where.idempotencyKey).toBe('direct-accept:list-1:fan-2');
    });
  });
});
