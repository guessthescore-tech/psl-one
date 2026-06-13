import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CampaignRewardsService } from './campaign-rewards.service';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const NOW = new Date('2026-06-01T12:00:00.000Z');

const REWARD_DEF = {
  id: 'def-1',
  title: 'Test Reward',
  rewardType: 'FAN_VALUE_POINTS',
  pointsAmount: 50,
  inventoryLimit: null,
  inventoryIssued: 0,
  isActive: true,
};

const FAN_REWARD_ISSUED = {
  id: 'reward-1',
  status: 'ISSUED',
  fanUserId: 'fan-1',
  rewardDefinitionId: 'def-1',
  campaignId: null,
  issuedAt: NOW,
  claimedAt: null,
  redeemedAt: null,
  expiresAt: null,
  metadataJson: null,
  createdAt: NOW,
  updatedAt: NOW,
};

const FAN_REWARD_CLAIMED = { ...FAN_REWARD_ISSUED, status: 'CLAIMED', claimedAt: NOW };

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

const makeFanValueSvc = () => ({
  postEntry: vi.fn().mockResolvedValue({ id: 'fv-1', points: 50 }),
});

const makeNotifications = () => ({
  createInAppNotification: vi.fn().mockResolvedValue(undefined),
});

const makeActivityFeed = () => ({
  createUserActivity: vi.fn().mockResolvedValue(undefined),
});

/**
 * Build a Prisma mock where $transaction executes the callback with an
 * inner transaction client (tx). The tx gets its own findUnique/update mocks
 * that can be overridden per-test via `overrideTx`.
 */
const makePrisma = (overrideTx: Record<string, unknown> = {}) => {
  const txClient = {
    rewardDefinition: {
      findUnique: vi.fn().mockResolvedValue(REWARD_DEF),
      update: vi.fn().mockResolvedValue(REWARD_DEF),
    },
    fanReward: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(FAN_REWARD_ISSUED),
    },
    ...overrideTx,
  };

  const prisma = {
    rewardDefinition: {
      findUnique: vi.fn().mockResolvedValue(REWARD_DEF),
      findMany: vi.fn().mockResolvedValue([REWARD_DEF]),
      create: vi.fn().mockResolvedValue(REWARD_DEF),
      update: vi.fn().mockResolvedValue(REWARD_DEF),
    },
    fanReward: {
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([FAN_REWARD_ISSUED]),
      create: vi.fn().mockResolvedValue(FAN_REWARD_ISSUED),
      update: vi.fn().mockResolvedValue({ ...FAN_REWARD_ISSUED, status: 'CLAIMED' }),
    },
    adminAuditLog: {
      create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
    },
    $transaction: vi.fn().mockImplementation(async (fn: any) => fn(txClient)),
  };

  return { prisma, txClient };
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CampaignRewardsService', () => {
  let service: CampaignRewardsService;
  let prisma: ReturnType<typeof makePrisma>['prisma'];
  let txClient: ReturnType<typeof makePrisma>['txClient'];
  let fanValueSvc: ReturnType<typeof makeFanValueSvc>;
  let notifications: ReturnType<typeof makeNotifications>;
  let activityFeed: ReturnType<typeof makeActivityFeed>;

  beforeEach(() => {
    const mocks = makePrisma();
    prisma = mocks.prisma;
    txClient = mocks.txClient;
    fanValueSvc = makeFanValueSvc();
    notifications = makeNotifications();
    activityFeed = makeActivityFeed();
    service = new CampaignRewardsService(prisma as any, fanValueSvc as any, notifications as any, activityFeed as any);
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // adminCreateRewardDefinition
  // -------------------------------------------------------------------------

  describe('adminCreateRewardDefinition', () => {
    it('creates reward definition and writes AdminAuditLog', async () => {
      const dto = { title: 'VIP Badge', rewardType: 'BADGE' };

      const result = await service.adminCreateRewardDefinition(dto, 'admin-1');

      expect(prisma.rewardDefinition.create).toHaveBeenCalledOnce();
      expect(prisma.adminAuditLog.create).toHaveBeenCalledOnce();
      const auditCall = prisma.adminAuditLog.create.mock.calls[0]![0]!;
      expect(auditCall.data.action).toBe('REWARD_DEFINITION_CREATED');
      expect(auditCall.data.actorUserId).toBe('admin-1');
      expect(result).toEqual(REWARD_DEF);
    });

    it('stores optional fields when provided', async () => {
      const dto = {
        title: 'Points Bundle',
        rewardType: 'FAN_VALUE_POINTS',
        pointsAmount: 100,
        inventoryLimit: 500,
        description: 'Win 100 points',
      };

      await service.adminCreateRewardDefinition(dto, 'admin-1');

      const createCall = prisma.rewardDefinition.create.mock.calls[0]![0]!;
      expect(createCall.data.pointsAmount).toBe(100);
      expect(createCall.data.inventoryLimit).toBe(500);
      expect(createCall.data.description).toBe('Win 100 points');
    });
  });

  // -------------------------------------------------------------------------
  // adminUpdateRewardDefinition
  // -------------------------------------------------------------------------

  describe('adminUpdateRewardDefinition', () => {
    it('applies partial update and writes AdminAuditLog', async () => {
      const dto = { title: 'Updated Title', isActive: false };

      const result = await service.adminUpdateRewardDefinition('def-1', dto, 'admin-1');

      expect(prisma.rewardDefinition.update).toHaveBeenCalledOnce();
      const updateCall = prisma.rewardDefinition.update.mock.calls[0]![0]!;
      expect(updateCall.where).toEqual({ id: 'def-1' });
      expect(updateCall.data.title).toBe('Updated Title');
      expect(updateCall.data.isActive).toBe(false);
      expect(prisma.adminAuditLog.create).toHaveBeenCalledOnce();
      const auditCall = prisma.adminAuditLog.create.mock.calls[0]![0]!;
      expect(auditCall.data.action).toBe('REWARD_DEFINITION_UPDATED');
      expect(result).toEqual(REWARD_DEF);
    });

    it('throws NotFoundException when definition does not exist', async () => {
      prisma.rewardDefinition.findUnique.mockResolvedValue(null);

      await expect(service.adminUpdateRewardDefinition('missing', {}, 'admin-1')).rejects.toThrow(NotFoundException);
      expect(prisma.rewardDefinition.update).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // adminListRewardDefinitions
  // -------------------------------------------------------------------------

  describe('adminListRewardDefinitions', () => {
    it('returns all definitions when no filters supplied', async () => {
      const result = await service.adminListRewardDefinitions();

      expect(prisma.rewardDefinition.findMany).toHaveBeenCalledOnce();
      expect(result).toEqual([REWARD_DEF]);
    });

    it('passes rewardType filter through to Prisma', async () => {
      await service.adminListRewardDefinitions({ rewardType: 'BADGE' });

      const where = prisma.rewardDefinition.findMany.mock.calls[0]![0]!.where;
      expect(where.rewardType).toBe('BADGE');
    });
  });

  // -------------------------------------------------------------------------
  // issueReward
  // -------------------------------------------------------------------------

  describe('issueReward', () => {
    it('creates FanReward and increments inventoryIssued inside a transaction', async () => {
      const dto = { rewardDefinitionId: 'def-1', fanUserId: 'fan-1' };

      const result = await service.issueReward(dto);

      expect(prisma.$transaction).toHaveBeenCalledOnce();
      expect(txClient.fanReward.create).toHaveBeenCalledOnce();
      expect(txClient.rewardDefinition.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'def-1' },
          data: { inventoryIssued: { increment: 1 } },
        }),
      );
      expect(result).toEqual(FAN_REWARD_ISSUED);
    });

    it('returns existing reward silently when idempotency key matches', async () => {
      prisma.fanReward.findUnique.mockResolvedValue(FAN_REWARD_ISSUED);

      const dto = { rewardDefinitionId: 'def-1', fanUserId: 'fan-1', idempotencyKey: 'idem-key-1' };
      const result = await service.issueReward(dto);

      // Should short-circuit before entering the transaction
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(result).toEqual(FAN_REWARD_ISSUED);
    });

    it('throws BadRequestException when inventory is exhausted', async () => {
      txClient.rewardDefinition.findUnique.mockResolvedValue({
        ...REWARD_DEF,
        inventoryLimit: 10,
        inventoryIssued: 10,
      });

      const dto = { rewardDefinitionId: 'def-1', fanUserId: 'fan-1' };

      await expect(service.issueReward(dto)).rejects.toThrow('Reward inventory exhausted');
    });

    it('throws NotFoundException when reward definition not found in transaction', async () => {
      txClient.rewardDefinition.findUnique.mockResolvedValue(null);

      const dto = { rewardDefinitionId: 'missing-def', fanUserId: 'fan-1' };

      await expect(service.issueReward(dto)).rejects.toThrow(NotFoundException);
    });

    it('calls fanValueLedgerService.postEntry with CAMPAIGN_REWARD sourceType for FAN_VALUE_POINTS reward', async () => {
      const dto = { rewardDefinitionId: 'def-1', fanUserId: 'fan-1', campaignId: 'campaign-1' };

      await service.issueReward(dto);

      expect(fanValueSvc.postEntry).toHaveBeenCalledOnce();
      const postCall = fanValueSvc.postEntry.mock.calls[0]![0]!;
      expect(postCall.sourceType).toBe('CAMPAIGN_REWARD');
      expect(postCall.userId).toBe('fan-1');
      expect(postCall.points).toBe(50);
    });

    it('includes nonFinancial: true and noCashValue: true in ledger entry metadata', async () => {
      const dto = { rewardDefinitionId: 'def-1', fanUserId: 'fan-1' };

      await service.issueReward(dto);

      const metadataJson = fanValueSvc.postEntry.mock.calls[0]![0]!.metadataJson;
      expect(metadataJson).toMatchObject({
        nonFinancial: true,
        noCashValue: true,
      });
    });

    it('does NOT call fanValueLedgerService for non-FAN_VALUE_POINTS reward types', async () => {
      txClient.rewardDefinition.findUnique.mockResolvedValue({
        ...REWARD_DEF,
        rewardType: 'BADGE',
        pointsAmount: 0,
      });

      const dto = { rewardDefinitionId: 'def-1', fanUserId: 'fan-1' };

      await service.issueReward(dto);

      expect(fanValueSvc.postEntry).not.toHaveBeenCalled();
    });

    it('fires REWARD_ISSUED notification and activity feed after issue', async () => {
      const dto = { rewardDefinitionId: 'def-1', fanUserId: 'fan-1' };
      await service.issueReward(dto);

      await vi.runAllTimersAsync();
      expect(notifications.createInAppNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'REWARD_ISSUED', userId: 'fan-1' }),
      );
      expect(activityFeed.createUserActivity).toHaveBeenCalledWith(
        'fan-1',
        expect.objectContaining({ type: 'REWARD_ISSUED' }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // claimReward
  // -------------------------------------------------------------------------

  describe('claimReward', () => {
    it('sets status=CLAIMED when reward is in ISSUED status', async () => {
      prisma.fanReward.findUnique.mockResolvedValue(FAN_REWARD_ISSUED);
      prisma.fanReward.update.mockResolvedValue({ ...FAN_REWARD_ISSUED, status: 'CLAIMED', claimedAt: NOW });

      const result = await service.claimReward('reward-1', 'fan-1');

      expect(prisma.fanReward.update).toHaveBeenCalledOnce();
      const updateCall = prisma.fanReward.update.mock.calls[0]![0]!;
      expect(updateCall.data.status).toBe('CLAIMED');
      expect(updateCall.data.claimedAt).toBeInstanceOf(Date);
    });

    it('throws ForbiddenException when reward belongs to a different fan', async () => {
      prisma.fanReward.findUnique.mockResolvedValue({ ...FAN_REWARD_ISSUED, fanUserId: 'fan-99' });

      await expect(service.claimReward('reward-1', 'fan-1')).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when reward is not in ISSUED status', async () => {
      prisma.fanReward.findUnique.mockResolvedValue({ ...FAN_REWARD_ISSUED, status: 'CLAIMED' });

      await expect(service.claimReward('reward-1', 'fan-1')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when reward has expired', async () => {
      prisma.fanReward.findUnique.mockResolvedValue({
        ...FAN_REWARD_ISSUED,
        expiresAt: new Date('2025-01-01T00:00:00.000Z'), // past
      });

      await expect(service.claimReward('reward-1', 'fan-1')).rejects.toThrow('Reward has expired');
    });

    it('throws NotFoundException when reward does not exist', async () => {
      prisma.fanReward.findUnique.mockResolvedValue(null);

      await expect(service.claimReward('missing', 'fan-1')).rejects.toThrow(NotFoundException);
    });
  });

  // -------------------------------------------------------------------------
  // sandboxRedeemReward
  // -------------------------------------------------------------------------

  describe('sandboxRedeemReward', () => {
    const claimedRewardWithDef = {
      ...FAN_REWARD_CLAIMED,
      rewardDefinition: { rewardType: 'FAN_VALUE_POINTS' },
    };

    it('sets status=REDEEMED for standard reward types', async () => {
      prisma.fanReward.findUnique.mockResolvedValue(claimedRewardWithDef);
      prisma.fanReward.update.mockResolvedValue({ ...FAN_REWARD_CLAIMED, status: 'REDEEMED', redeemedAt: NOW });

      await service.sandboxRedeemReward('reward-1', 'fan-1');

      const updateCall = prisma.fanReward.update.mock.calls[0]![0]!;
      expect(updateCall.data.status).toBe('REDEEMED');
      expect(updateCall.data.redeemedAt).toBeInstanceOf(Date);
    });

    it('sets status=PROVIDER_PENDING for WALLET_CREDIT_PENDING_PROVIDER reward type', async () => {
      prisma.fanReward.findUnique.mockResolvedValue({
        ...FAN_REWARD_CLAIMED,
        rewardDefinition: { rewardType: 'WALLET_CREDIT_PENDING_PROVIDER' },
      });
      prisma.fanReward.update.mockResolvedValue({ ...FAN_REWARD_CLAIMED, status: 'PROVIDER_PENDING' });

      await service.sandboxRedeemReward('reward-1', 'fan-1');

      const updateCall = prisma.fanReward.update.mock.calls[0]![0]!;
      expect(updateCall.data.status).toBe('PROVIDER_PENDING');
    });

    it('returns sandboxOnly: true in the response', async () => {
      prisma.fanReward.findUnique.mockResolvedValue(claimedRewardWithDef);
      prisma.fanReward.update.mockResolvedValue({ ...FAN_REWARD_CLAIMED, status: 'REDEEMED' });

      const result = await service.sandboxRedeemReward('reward-1', 'fan-1');

      expect(result.sandboxOnly).toBe(true);
    });

    it('throws ForbiddenException when reward belongs to a different fan', async () => {
      prisma.fanReward.findUnique.mockResolvedValue({
        ...claimedRewardWithDef,
        fanUserId: 'fan-99',
      });

      await expect(service.sandboxRedeemReward('reward-1', 'fan-1')).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when reward is not in CLAIMED status', async () => {
      prisma.fanReward.findUnique.mockResolvedValue({
        ...claimedRewardWithDef,
        status: 'ISSUED',
      });

      await expect(service.sandboxRedeemReward('reward-1', 'fan-1')).rejects.toThrow(BadRequestException);
    });
  });

  // -------------------------------------------------------------------------
  // fanListRewards
  // -------------------------------------------------------------------------

  describe('fanListRewards', () => {
    it('returns only this fan\'s rewards ordered by issuedAt desc', async () => {
      prisma.fanReward.findMany.mockResolvedValue([FAN_REWARD_ISSUED]);

      const result = await service.fanListRewards('fan-1');

      expect(prisma.fanReward.findMany).toHaveBeenCalledOnce();
      const call = prisma.fanReward.findMany.mock.calls[0]![0]!;
      expect(call.where).toEqual({ fanUserId: 'fan-1' });
      expect(call.orderBy).toEqual({ issuedAt: 'desc' });
      expect(result).toHaveLength(1);
      expect(result[0]!.fanUserId).toBe('fan-1');
    });

    it('returns empty array when fan has no rewards', async () => {
      prisma.fanReward.findMany.mockResolvedValue([]);

      const result = await service.fanListRewards('fan-with-no-rewards');

      expect(result).toHaveLength(0);
    });
  });
});
