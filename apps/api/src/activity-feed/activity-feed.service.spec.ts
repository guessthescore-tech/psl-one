import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  ActivityFeedType,
  ActivityVisibility,
  ActivityStatus,
  ActivityReactionType,
} from '@prisma/client';
import { ActivityFeedService } from './activity-feed.service';
import type { PrismaService } from '../prisma/prisma.service';

const mockItem = (overrides = {}) => ({
  id: 'item-1',
  userId: 'user-1',
  type: ActivityFeedType.SYSTEM,
  title: 'Test',
  body: 'Test body',
  visibility: ActivityVisibility.PUBLIC,
  status: ActivityStatus.ACTIVE,
  actionUrl: null,
  sourceType: null,
  sourceId: null,
  occurredAt: new Date(),
  createdAt: new Date(),
  hiddenAt: null,
  hiddenReason: null,
  hiddenByUserId: null,
  metadataJson: null,
  ...overrides,
});

const mockReaction = (overrides = {}) => ({
  id: 'reaction-1',
  activityFeedItemId: 'item-1',
  userId: 'user-1',
  reactionType: ActivityReactionType.LIKE,
  createdAt: new Date(),
  ...overrides,
});

const makePrismaMock = () => ({
  activityFeedItem: {
    create: vi.fn().mockResolvedValue(mockItem()),
    findFirst: vi.fn().mockResolvedValue(null),
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    update: vi.fn().mockResolvedValue(mockItem()),
    groupBy: vi.fn().mockResolvedValue([]),
  },
  activityReaction: {
    upsert: vi.fn().mockResolvedValue(mockReaction()),
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockResolvedValue(mockReaction()),
    groupBy: vi.fn().mockResolvedValue([]),
  },
});

describe('ActivityFeedService', () => {
  let service: ActivityFeedService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new ActivityFeedService(prisma as unknown as PrismaService);
  });

  // ── createActivityItem ─────────────────────────────────────────────────────

  describe('createActivityItem', () => {
    it('creates a new item', async () => {
      const result = await service.createActivityItem({
        type: ActivityFeedType.SYSTEM,
        title: 'Hello',
        body: 'World',
      });
      expect(prisma.activityFeedItem.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('returns existing item when sourceType+sourceId+type match (idempotent)', async () => {
      const existing = mockItem({ sourceType: 'ACHIEVEMENT', sourceId: 'ach-1' });
      prisma.activityFeedItem.findFirst.mockResolvedValue(existing);

      const result = await service.createActivityItem({
        type: ActivityFeedType.ACHIEVEMENT_UNLOCKED,
        title: 'Ach',
        body: 'body',
        sourceType: 'ACHIEVEMENT',
        sourceId: 'ach-1',
        userId: 'user-1',
      });

      expect(prisma.activityFeedItem.create).not.toHaveBeenCalled();
      expect(result.id).toBe('item-1');
    });

    it('creates when no sourceType set (non-idempotent)', async () => {
      await service.createActivityItem({ type: ActivityFeedType.SYSTEM, title: 'T', body: 'B' });
      expect(prisma.activityFeedItem.findFirst).not.toHaveBeenCalled();
      expect(prisma.activityFeedItem.create).toHaveBeenCalled();
    });
  });

  // ── Domain-specific creators ───────────────────────────────────────────────

  describe('createAchievementActivity', () => {
    it('creates ACHIEVEMENT_UNLOCKED activity', async () => {
      await service.createAchievementActivity('user-1', { id: 'ach-1', name: 'First Goal' });
      expect(prisma.activityFeedItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: ActivityFeedType.ACHIEVEMENT_UNLOCKED }),
        }),
      );
    });
  });

  describe('createBadgeActivity', () => {
    it('creates BADGE_EARNED activity', async () => {
      await service.createBadgeActivity('user-1', { id: 'badge-1', name: 'Scorer' });
      expect(prisma.activityFeedItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: ActivityFeedType.BADGE_EARNED }),
        }),
      );
    });
  });

  describe('createFantasyResultActivity', () => {
    it('creates FANTASY_RESULT activity', async () => {
      await service.createFantasyResultActivity('user-1', { id: 'score-1', netPoints: 55, gameweekId: 'gw-1' });
      expect(prisma.activityFeedItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: ActivityFeedType.FANTASY_RESULT }),
        }),
      );
    });
  });

  describe('createPredictionResultActivity', () => {
    it('creates PREDICTION_RESULT activity with positive points', async () => {
      await service.createPredictionResultActivity('user-1', { id: 'pred-1', pointsAwarded: 10 });
      const call = prisma.activityFeedItem.create.mock.calls[0]![0]!;
      expect(call.data.type).toBe(ActivityFeedType.PREDICTION_RESULT);
      expect(call.data.title).toContain('10');
    });
  });

  describe('createChallengeActivity', () => {
    it('creates CHALLENGE_CREATED activity', async () => {
      await service.createChallengeActivity('user-1', { id: 'ch-1' }, 'CREATED');
      const call = prisma.activityFeedItem.create.mock.calls[0]![0]!;
      expect(call.data.type).toBe(ActivityFeedType.CHALLENGE_CREATED);
    });

    it('creates CHALLENGE_RESULT activity with winner body', async () => {
      await service.createChallengeActivity('user-1', { id: 'ch-1' }, 'RESULT', { winnerUserId: 'user-1' });
      const call = prisma.activityFeedItem.create.mock.calls[0]![0]!;
      expect(call.data.type).toBe(ActivityFeedType.CHALLENGE_RESULT);
      expect(call.data.body).toContain('Won');
    });

    it('shows draw body when no winner', async () => {
      await service.createChallengeActivity('user-1', { id: 'ch-1' }, 'RESULT', { winnerUserId: null });
      const call = prisma.activityFeedItem.create.mock.calls[0]![0]!;
      expect(call.data.body).toContain('draw');
    });
  });

  describe('createRewardEligibleActivity', () => {
    it('creates REWARD_ELIGIBLE activity', async () => {
      await service.createRewardEligibleActivity('user-1', { id: 'rew-1', name: 'Kit Voucher' });
      expect(prisma.activityFeedItem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ type: ActivityFeedType.REWARD_ELIGIBLE }),
        }),
      );
    });
  });

  describe('createLiveMatchAlertActivity', () => {
    it('creates LIVE_MATCH_ALERT system activity', async () => {
      await service.createLiveMatchAlertActivity({ fixtureId: 'fix-1', title: 'GOAL!', body: 'Goal scored' });
      const call = prisma.activityFeedItem.create.mock.calls[0]![0]!;
      expect(call.data.type).toBe(ActivityFeedType.LIVE_MATCH_ALERT);
      expect(call.data.title).toBe('GOAL!');
    });
  });

  // ── Feed reads ─────────────────────────────────────────────────────────────

  describe('getGlobalFeed', () => {
    it('returns paginated items with reaction counts', async () => {
      const item = { ...mockItem(), reactions: [{ reactionType: ActivityReactionType.LIKE, userId: 'user-2' }] };
      prisma.activityFeedItem.findMany.mockResolvedValue([item]);
      prisma.activityFeedItem.count.mockResolvedValue(1);

      const result = await service.getGlobalFeed({}, 'user-1');
      expect(result.total).toBe(1);
      expect(result.items[0]!.reactionCounts[ActivityReactionType.LIKE]).toBe(1);
    });

    it('returns empty feed when no items', async () => {
      const result = await service.getGlobalFeed();
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getMyFeed', () => {
    it('returns own feed with private items', async () => {
      const item = { ...mockItem({ visibility: ActivityVisibility.PRIVATE }), reactions: [] };
      prisma.activityFeedItem.findMany.mockResolvedValue([item]);
      prisma.activityFeedItem.count.mockResolvedValue(1);

      const result = await service.getMyFeed('user-1');
      expect(result.total).toBe(1);
    });
  });

  describe('getActivityDetail', () => {
    it('returns item with reactions attached', async () => {
      const item = { ...mockItem(), reactions: [] };
      prisma.activityFeedItem.findUnique.mockResolvedValue(item);

      const result = await service.getActivityDetail('user-1', 'item-1') as Record<string, unknown>;
      expect(result['id']).toBe('item-1');
      expect(result).toHaveProperty('reactionCounts');
    });

    it('throws NotFoundException when item not found', async () => {
      prisma.activityFeedItem.findUnique.mockResolvedValue(null);
      await expect(service.getActivityDetail('user-1', 'bad-id')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException for cross-user private item', async () => {
      const item = { ...mockItem({ userId: 'user-2', visibility: ActivityVisibility.PRIVATE }), reactions: [] };
      prisma.activityFeedItem.findUnique.mockResolvedValue(item);
      await expect(service.getActivityDetail('user-1', 'item-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getAdminFeed', () => {
    it('returns all items without visibility filter', async () => {
      prisma.activityFeedItem.findMany.mockResolvedValue([{ ...mockItem(), reactions: [] }]);
      prisma.activityFeedItem.count.mockResolvedValue(1);
      const result = await service.getAdminFeed();
      expect(result.total).toBe(1);
    });
  });

  describe('getAdminStats', () => {
    it('returns aggregate stats', async () => {
      prisma.activityFeedItem.count.mockResolvedValue(10);
      prisma.activityFeedItem.groupBy.mockResolvedValue([]);
      prisma.activityReaction.groupBy.mockResolvedValue([]);

      const result = await service.getAdminStats();
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('byType');
      expect(result).toHaveProperty('reactionTotals');
    });
  });

  // ── Fan moderation ─────────────────────────────────────────────────────────

  describe('hideOwnActivity', () => {
    it('hides own active item', async () => {
      prisma.activityFeedItem.findUnique.mockResolvedValue(mockItem({ userId: 'user-1' }));
      await service.hideOwnActivity('user-1', 'item-1');
      expect(prisma.activityFeedItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: ActivityStatus.HIDDEN }),
        }),
      );
    });

    it('throws ForbiddenException when not owner', async () => {
      prisma.activityFeedItem.findUnique.mockResolvedValue(mockItem({ userId: 'user-2' }));
      await expect(service.hideOwnActivity('user-1', 'item-1')).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when already hidden', async () => {
      prisma.activityFeedItem.findUnique.mockResolvedValue(mockItem({ userId: 'user-1', status: ActivityStatus.HIDDEN }));
      await expect(service.hideOwnActivity('user-1', 'item-1')).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when item not found', async () => {
      prisma.activityFeedItem.findUnique.mockResolvedValue(null);
      await expect(service.hideOwnActivity('user-1', 'item-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ── Admin moderation ───────────────────────────────────────────────────────

  describe('adminHideActivity', () => {
    it('hides item as admin with reason', async () => {
      prisma.activityFeedItem.findUnique.mockResolvedValue(mockItem());
      await service.adminHideActivity('admin-1', 'item-1', 'spam');
      expect(prisma.activityFeedItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: ActivityStatus.HIDDEN, hiddenReason: 'spam' }),
        }),
      );
    });

    it('throws NotFoundException when item not found', async () => {
      prisma.activityFeedItem.findUnique.mockResolvedValue(null);
      await expect(service.adminHideActivity('admin-1', 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('adminUnhideActivity', () => {
    it('sets status back to ACTIVE', async () => {
      prisma.activityFeedItem.findUnique.mockResolvedValue(mockItem({ status: ActivityStatus.HIDDEN }));
      await service.adminUnhideActivity('admin-1', 'item-1');
      expect(prisma.activityFeedItem.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: ActivityStatus.ACTIVE }),
        }),
      );
    });

    it('throws NotFoundException when item not found', async () => {
      prisma.activityFeedItem.findUnique.mockResolvedValue(null);
      await expect(service.adminUnhideActivity('admin-1', 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── Reactions ──────────────────────────────────────────────────────────────

  describe('addReaction', () => {
    it('upserts reaction on active public item', async () => {
      prisma.activityFeedItem.findUnique.mockResolvedValue(mockItem());
      await service.addReaction('user-1', 'item-1', ActivityReactionType.FIRE);
      expect(prisma.activityReaction.upsert).toHaveBeenCalled();
    });

    it('throws NotFoundException when item not found', async () => {
      prisma.activityFeedItem.findUnique.mockResolvedValue(null);
      await expect(service.addReaction('user-1', 'bad-id', ActivityReactionType.LIKE)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when item is hidden', async () => {
      prisma.activityFeedItem.findUnique.mockResolvedValue(mockItem({ status: ActivityStatus.HIDDEN }));
      await expect(service.addReaction('user-1', 'item-1', ActivityReactionType.LIKE)).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException for non-public item', async () => {
      prisma.activityFeedItem.findUnique.mockResolvedValue(mockItem({ visibility: ActivityVisibility.PRIVATE }));
      await expect(service.addReaction('user-1', 'item-1', ActivityReactionType.LIKE)).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeReaction', () => {
    it('deletes the reaction', async () => {
      prisma.activityReaction.findUnique.mockResolvedValue(mockReaction({ userId: 'user-1' }));
      await service.removeReaction('user-1', 'item-1', ActivityReactionType.LIKE);
      expect(prisma.activityReaction.delete).toHaveBeenCalled();
    });

    it('throws NotFoundException when reaction not found', async () => {
      prisma.activityReaction.findUnique.mockResolvedValue(null);
      await expect(service.removeReaction('user-1', 'item-1', ActivityReactionType.LIKE)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException for another user reaction', async () => {
      prisma.activityReaction.findUnique.mockResolvedValue(mockReaction({ userId: 'user-2' }));
      await expect(service.removeReaction('user-1', 'item-1', ActivityReactionType.LIKE)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getReactionSummary', () => {
    it('returns reaction counts by type', async () => {
      prisma.activityReaction.findMany.mockResolvedValue([
        { reactionType: ActivityReactionType.LIKE, userId: 'u1' },
        { reactionType: ActivityReactionType.LIKE, userId: 'u2' },
        { reactionType: ActivityReactionType.FIRE, userId: 'u3' },
      ]);
      const result = await service.getReactionSummary('item-1');
      expect(result[ActivityReactionType.LIKE]).toBe(2);
      expect(result[ActivityReactionType.FIRE]).toBe(1);
    });
  });
});
