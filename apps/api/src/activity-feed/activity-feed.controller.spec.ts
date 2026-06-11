import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActivityReactionType } from '@prisma/client';
import { ActivityFeedController } from './activity-feed.controller';
import type { ActivityFeedService } from './activity-feed.service';

const mockUser = { sub: 'user-1' };
const mockAdminUser = { sub: 'admin-1' };

const mockFeedResult = { items: [], total: 0, limit: 20, offset: 0 };

const makeMockService = (): Record<string, ReturnType<typeof vi.fn>> => ({
  getGlobalFeed: vi.fn().mockResolvedValue(mockFeedResult),
  getMyFeed: vi.fn().mockResolvedValue(mockFeedResult),
  getActivityDetail: vi.fn().mockResolvedValue({ id: 'item-1' }),
  getAdminFeed: vi.fn().mockResolvedValue(mockFeedResult),
  getAdminStats: vi.fn().mockResolvedValue({ total: 0, active: 0, hidden: 0, archived: 0, byType: {}, byVisibility: {}, reactionTotals: {} }),
  createSystemActivity: vi.fn().mockResolvedValue({ id: 'item-1' }),
  createLiveMatchAlertActivity: vi.fn().mockResolvedValue({ id: 'item-1' }),
  adminHideActivity: vi.fn().mockResolvedValue({ id: 'item-1' }),
  adminUnhideActivity: vi.fn().mockResolvedValue({ id: 'item-1' }),
  addReaction: vi.fn().mockResolvedValue({ id: 'reaction-1' }),
  removeReaction: vi.fn().mockResolvedValue({ id: 'reaction-1' }),
  hideOwnActivity: vi.fn().mockResolvedValue({ id: 'item-1' }),
});

describe('ActivityFeedController', () => {
  let controller: ActivityFeedController;
  let service: ReturnType<typeof makeMockService>;

  beforeEach(() => {
    service = makeMockService();
    controller = new ActivityFeedController(service as unknown as ActivityFeedService);
  });

  describe('getGlobalFeed', () => {
    it('calls service with parsed pagination', async () => {
      await controller.getGlobalFeed(mockUser, undefined, '10', '5');
      expect(service.getGlobalFeed).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 10, offset: 5 }),
        'user-1',
      );
    });

    it('defaults limit=20, offset=0', async () => {
      await controller.getGlobalFeed(mockUser);
      expect(service.getGlobalFeed).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 20, offset: 0 }),
        'user-1',
      );
    });
  });

  describe('getMyFeed', () => {
    it('calls service with user id', async () => {
      await controller.getMyFeed(mockUser);
      expect(service.getMyFeed).toHaveBeenCalledWith('user-1', expect.any(Object));
    });
  });

  describe('getDetail', () => {
    it('delegates to getActivityDetail', async () => {
      await controller.getDetail(mockUser, 'item-1');
      expect(service.getActivityDetail).toHaveBeenCalledWith('user-1', 'item-1');
    });
  });

  describe('addReaction', () => {
    it('calls service with reaction type', async () => {
      await controller.addReaction(mockUser, 'item-1', { reactionType: ActivityReactionType.FIRE });
      expect(service.addReaction).toHaveBeenCalledWith('user-1', 'item-1', ActivityReactionType.FIRE);
    });
  });

  describe('removeReaction', () => {
    it('calls service with reaction type', async () => {
      await controller.removeReaction(mockUser, 'item-1', ActivityReactionType.LIKE);
      expect(service.removeReaction).toHaveBeenCalledWith('user-1', 'item-1', ActivityReactionType.LIKE);
    });
  });

  describe('hideOwnActivity', () => {
    it('delegates to hideOwnActivity', async () => {
      await controller.hideOwnActivity(mockUser, 'item-1');
      expect(service.hideOwnActivity).toHaveBeenCalledWith('user-1', 'item-1');
    });
  });

  describe('getAdminFeed', () => {
    it('calls service with filters', async () => {
      await controller.getAdminFeed(undefined, undefined, undefined, '50', '0');
      expect(service.getAdminFeed).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 50, offset: 0 }),
      );
    });
  });

  describe('getAdminStats', () => {
    it('delegates to getAdminStats', async () => {
      const result = await controller.getAdminStats();
      expect(service.getAdminStats).toHaveBeenCalled();
      expect(result).toHaveProperty('total');
    });
  });

  describe('createSystemActivity', () => {
    it('delegates to createSystemActivity', async () => {
      await controller.createSystemActivity({ type: 'SYSTEM' as any, title: 'T', body: 'B' });
      expect(service.createSystemActivity).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'T', body: 'B' }),
      );
    });
  });

  describe('createLiveMatchAlert', () => {
    it('delegates to createLiveMatchAlertActivity', async () => {
      await controller.createLiveMatchAlert({ fixtureId: 'fix-1', title: 'GOAL!', body: 'Scored' });
      expect(service.createLiveMatchAlertActivity).toHaveBeenCalledWith(
        expect.objectContaining({ fixtureId: 'fix-1' }),
      );
    });
  });

  describe('adminHide', () => {
    it('calls adminHideActivity with reason', async () => {
      await controller.adminHide(mockAdminUser, 'item-1', { reason: 'spam' });
      expect(service.adminHideActivity).toHaveBeenCalledWith('admin-1', 'item-1', 'spam');
    });
  });

  describe('adminUnhide', () => {
    it('calls adminUnhideActivity', async () => {
      await controller.adminUnhide(mockAdminUser, 'item-1');
      expect(service.adminUnhideActivity).toHaveBeenCalledWith('admin-1', 'item-1');
    });
  });
});
