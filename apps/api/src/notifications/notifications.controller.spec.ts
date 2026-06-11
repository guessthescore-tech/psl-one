import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationStatus, NotificationType } from '@prisma/client';
import { NotificationsController } from './notifications.controller';
import type { NotificationsService } from './notifications.service';

const mockUser = { sub: 'user-1' };

const makeServiceMock = (): Record<string, ReturnType<typeof vi.fn>> => ({
  getInbox: vi.fn().mockResolvedValue({ items: [], total: 0, unreadCount: 0, limit: 20, offset: 0 }),
  getUnreadCount: vi.fn().mockResolvedValue({ userId: 'user-1', unreadCount: 0 }),
  getOrCreatePreferences: vi.fn().mockResolvedValue({ userId: 'user-1', fantasyEnabled: true }),
  updatePreferences: vi.fn().mockResolvedValue({ userId: 'user-1', fantasyEnabled: false }),
  getNotificationDetail: vi.fn().mockResolvedValue({ id: 'n-1', title: 'Test' }),
  markRead: vi.fn().mockResolvedValue({ id: 'n-1', status: 'READ' }),
  markAllRead: vi.fn().mockResolvedValue({ userId: 'user-1', updated: 3 }),
  archiveNotification: vi.fn().mockResolvedValue({ id: 'n-1', status: 'ARCHIVED' }),
  getAdminStats: vi.fn().mockResolvedValue({ total: 0 }),
  getAdminRecentNotifications: vi.fn().mockResolvedValue([]),
  createAdminNotification: vi.fn().mockResolvedValue({ id: 'n-2' }),
  createAdminBroadcast: vi.fn().mockResolvedValue({ broadcastTo: 10, delivered: 10 }),
  createFantasyDeadlineAlert: vi.fn().mockResolvedValue({ notified: 5, gameweekId: 'gw-1' }),
  createLiveMatchAlert: vi.fn().mockResolvedValue({ notified: 100, fixtureId: 'fix-1' }),
});

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: ReturnType<typeof makeServiceMock>;

  beforeEach(() => {
    service = makeServiceMock();
    controller = new NotificationsController(service as unknown as NotificationsService);
  });

  // ── Fan inbox ────────────────────────────────────────────────────────────────

  describe('getInbox', () => {
    it('calls service.getInbox with userId and defaults', async () => {
      await controller.getInbox(mockUser);
      expect(service.getInbox).toHaveBeenCalledWith('user-1', {
        type: undefined,
        status: undefined,
        limit: 20,
        offset: 0,
      });
    });

    it('parses limit and offset query params', async () => {
      await controller.getInbox(mockUser, NotificationType.FANTASY_RESULT, NotificationStatus.UNREAD, '5', '10');
      expect(service.getInbox).toHaveBeenCalledWith('user-1', {
        type: NotificationType.FANTASY_RESULT,
        status: NotificationStatus.UNREAD,
        limit: 5,
        offset: 10,
      });
    });
  });

  describe('getUnreadCount', () => {
    it('returns unread count', async () => {
      const result = await controller.getUnreadCount(mockUser);
      expect(service.getUnreadCount).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ userId: 'user-1', unreadCount: 0 });
    });
  });

  describe('getPreferences', () => {
    it('returns user preferences', async () => {
      await controller.getPreferences(mockUser);
      expect(service.getOrCreatePreferences).toHaveBeenCalledWith('user-1');
    });
  });

  describe('updatePreferences', () => {
    it('updates preferences', async () => {
      await controller.updatePreferences(mockUser, { fantasyEnabled: false });
      expect(service.updatePreferences).toHaveBeenCalledWith('user-1', { fantasyEnabled: false });
    });
  });

  describe('getDetail', () => {
    it('returns notification detail', async () => {
      await controller.getDetail(mockUser, 'n-1');
      expect(service.getNotificationDetail).toHaveBeenCalledWith('user-1', 'n-1');
    });
  });

  describe('markRead', () => {
    it('marks notification as read', async () => {
      const result = await controller.markRead(mockUser, 'n-1');
      expect(service.markRead).toHaveBeenCalledWith('user-1', 'n-1');
      expect(result).toMatchObject({ status: 'READ' });
    });
  });

  describe('markAllRead', () => {
    it('marks all notifications as read', async () => {
      const result = await controller.markAllRead(mockUser);
      expect(service.markAllRead).toHaveBeenCalledWith('user-1');
      expect(result).toMatchObject({ updated: 3 });
    });
  });

  describe('archive', () => {
    it('archives notification', async () => {
      const result = await controller.archive(mockUser, 'n-1');
      expect(service.archiveNotification).toHaveBeenCalledWith('user-1', 'n-1');
      expect(result).toMatchObject({ status: 'ARCHIVED' });
    });
  });

  // ── Admin ─────────────────────────────────────────────────────────────────────

  describe('getAdminStats', () => {
    it('returns admin stats', async () => {
      const result = await controller.getAdminStats();
      expect(service.getAdminStats).toHaveBeenCalled();
      expect(result).toMatchObject({ total: 0 });
    });
  });

  describe('getAdminRecent', () => {
    it('uses default limit 50', async () => {
      await controller.getAdminRecent();
      expect(service.getAdminRecentNotifications).toHaveBeenCalledWith(50);
    });

    it('parses limit query param', async () => {
      await controller.getAdminRecent('10');
      expect(service.getAdminRecentNotifications).toHaveBeenCalledWith(10);
    });
  });

  describe('createForUser', () => {
    it('calls createAdminNotification', async () => {
      await controller.createForUser('user-99', {
        type: NotificationType.SYSTEM,
        title: 'Admin message',
        body: 'Please update your profile',
      });
      expect(service.createAdminNotification).toHaveBeenCalledWith('user-99', expect.objectContaining({
        type: NotificationType.SYSTEM,
        title: 'Admin message',
      }));
    });
  });

  describe('broadcast', () => {
    it('calls createAdminBroadcast', async () => {
      const result = await controller.broadcast({
        type: NotificationType.ADMIN_BROADCAST,
        title: 'Platform update',
        body: 'New features available',
      });
      expect(service.createAdminBroadcast).toHaveBeenCalled();
      expect(result).toMatchObject({ broadcastTo: 10, delivered: 10 });
    });
  });

  describe('createFantasyDeadline', () => {
    it('parses deadlineAt string and calls service', async () => {
      await controller.createFantasyDeadline({
        gameweekId: 'gw-1',
        deadlineAt: '2026-07-01T12:00:00Z',
        gameweekName: 'Gameweek 1',
      });
      expect(service.createFantasyDeadlineAlert).toHaveBeenCalledWith({
        gameweekId: 'gw-1',
        deadlineAt: new Date('2026-07-01T12:00:00Z'),
        gameweekName: 'Gameweek 1',
      });
    });
  });

  describe('createLiveMatchAlert', () => {
    it('forwards dto to service', async () => {
      const result = await controller.createLiveMatchAlert({
        fixtureId: 'fix-1',
        title: 'GOAL!',
        body: 'Pirates 1-0',
      });
      expect(service.createLiveMatchAlert).toHaveBeenCalledWith({
        fixtureId: 'fix-1',
        title: 'GOAL!',
        body: 'Pirates 1-0',
      });
      expect(result).toMatchObject({ notified: 100, fixtureId: 'fix-1' });
    });
  });
});
