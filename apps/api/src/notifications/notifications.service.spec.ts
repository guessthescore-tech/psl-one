import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from '@prisma/client';
import { NotificationsService } from './notifications.service';
import type { PrismaService } from '../prisma/prisma.service';

const mockNotification = (overrides = {}) => ({
  id: 'notif-1',
  userId: 'user-1',
  type: NotificationType.SYSTEM,
  title: 'Test',
  body: 'Test body',
  status: NotificationStatus.UNREAD,
  priority: NotificationPriority.NORMAL,
  sourceType: null,
  sourceId: null,
  actionUrl: null,
  metadataJson: null,
  readAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockPrefs = (overrides = {}) => ({
  id: 'pref-1',
  userId: 'user-1',
  inAppEnabled: true,
  fantasyEnabled: true,
  predictionsEnabled: true,
  challengesEnabled: true,
  achievementsEnabled: true,
  rewardsEnabled: true,
  systemEnabled: true,
  marketingEnabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makePrismaMock = () => ({
  notification: {
    create: vi.fn().mockResolvedValue(mockNotification()),
    findUnique: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue(mockNotification()),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    count: vi.fn().mockResolvedValue(0),
    groupBy: vi.fn().mockResolvedValue([]),
  },
  notificationPreference: {
    upsert: vi.fn().mockResolvedValue(mockPrefs()),
    findUnique: vi.fn().mockResolvedValue(null),
    update: vi.fn().mockResolvedValue(mockPrefs()),
  },
  notificationDeliveryLog: {
    create: vi.fn().mockResolvedValue({ id: 'log-1' }),
    count: vi.fn().mockResolvedValue(0),
  },
  user: {
    findMany: vi.fn().mockResolvedValue([]),
  },
  fantasyTeam: {
    findMany: vi.fn().mockResolvedValue([]),
  },
});

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new NotificationsService(prisma as unknown as PrismaService);
  });

  // ── Preferences ──────────────────────────────────────────────────────────────

  describe('getOrCreatePreferences', () => {
    it('upserts preferences for user', async () => {
      const prefs = mockPrefs();
      prisma.notificationPreference.upsert.mockResolvedValue(prefs);
      const result = await service.getOrCreatePreferences('user-1');
      expect(result).toBe(prefs);
      expect(prisma.notificationPreference.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        create: { userId: 'user-1' },
        update: {},
      });
    });
  });

  describe('updatePreferences', () => {
    it('updates preferences', async () => {
      const updated = mockPrefs({ fantasyEnabled: false });
      prisma.notificationPreference.update.mockResolvedValue(updated);
      const result = await service.updatePreferences('user-1', { fantasyEnabled: false });
      expect(result.fantasyEnabled).toBe(false);
    });
  });

  // ── shouldNotify ──────────────────────────────────────────────────────────────

  describe('shouldNotify', () => {
    it('returns true when no prefs exist', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValue(null);
      const result = await service.shouldNotify('user-1', NotificationType.SYSTEM);
      expect(result).toBe(true);
    });

    it('returns false when inAppEnabled is false and type is not SYSTEM', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValue(mockPrefs({ inAppEnabled: false }));
      const result = await service.shouldNotify('user-1', NotificationType.FANTASY_RESULT);
      expect(result).toBe(false);
    });

    it('returns true when inAppEnabled is false but type is SYSTEM', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValue(mockPrefs({ inAppEnabled: false }));
      const result = await service.shouldNotify('user-1', NotificationType.SYSTEM);
      expect(result).toBe(true);
    });

    it('returns false when fantasyEnabled is false for FANTASY_RESULT', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValue(mockPrefs({ fantasyEnabled: false }));
      const result = await service.shouldNotify('user-1', NotificationType.FANTASY_RESULT);
      expect(result).toBe(false);
    });

    it('returns false when achievementsEnabled is false for ACHIEVEMENT_UNLOCKED', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValue(mockPrefs({ achievementsEnabled: false }));
      const result = await service.shouldNotify('user-1', NotificationType.ACHIEVEMENT_UNLOCKED);
      expect(result).toBe(false);
    });

    it('returns false when rewardsEnabled is false for REWARD_ELIGIBLE', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValue(mockPrefs({ rewardsEnabled: false }));
      const result = await service.shouldNotify('user-1', NotificationType.REWARD_ELIGIBLE);
      expect(result).toBe(false);
    });

    it('returns false when challengesEnabled is false for CHALLENGE_INVITE', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValue(mockPrefs({ challengesEnabled: false }));
      const result = await service.shouldNotify('user-1', NotificationType.CHALLENGE_INVITE);
      expect(result).toBe(false);
    });
  });

  // ── createInAppNotification ───────────────────────────────────────────────────

  describe('createInAppNotification', () => {
    it('creates notification and delivery log', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValue(null); // shouldNotify = true
      const notif = mockNotification();
      prisma.notification.create.mockResolvedValue(notif);
      const result = await service.createInAppNotification({
        userId: 'user-1',
        type: NotificationType.SYSTEM,
        title: 'Test',
        body: 'Body',
      });
      expect(result).toBe(notif);
      expect(prisma.notification.create).toHaveBeenCalled();
      expect(prisma.notificationDeliveryLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            channel: NotificationChannel.IN_APP,
            provider: 'LOCAL_IN_APP',
            status: NotificationDeliveryStatus.DELIVERED,
          }),
        }),
      );
    });

    it('returns null when preference disables notification type', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValue(mockPrefs({ fantasyEnabled: false }));
      const result = await service.createInAppNotification({
        userId: 'user-1',
        type: NotificationType.FANTASY_RESULT,
        title: 'GW result',
        body: 'You scored 50 pts',
      });
      expect(result).toBeNull();
      expect(prisma.notification.create).not.toHaveBeenCalled();
    });

    it('returns existing notification when idempotent source matches', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValue(null);
      const existing = mockNotification({ sourceType: 'ACHIEVEMENT', sourceId: 'ach-1' });
      prisma.notification.findUnique.mockResolvedValue(existing);
      const result = await service.createInAppNotification({
        userId: 'user-1',
        type: NotificationType.ACHIEVEMENT_UNLOCKED,
        title: 'Badge',
        body: 'You unlocked a badge',
        sourceType: 'ACHIEVEMENT',
        sourceId: 'ach-1',
      });
      expect(result).toBe(existing);
      expect(prisma.notification.create).not.toHaveBeenCalled();
    });
  });

  // ── createManyInAppNotifications ──────────────────────────────────────────────

  describe('createManyInAppNotifications', () => {
    it('creates notifications for each user', async () => {
      prisma.notificationPreference.findUnique.mockResolvedValue(null);
      prisma.notification.findUnique.mockResolvedValue(null);
      prisma.notification.create
        .mockResolvedValueOnce(mockNotification({ id: 'n1', userId: 'u1' }))
        .mockResolvedValueOnce(mockNotification({ id: 'n2', userId: 'u2' }));
      const results = await service.createManyInAppNotifications(['u1', 'u2'], {
        type: NotificationType.SYSTEM,
        title: 'Broadcast',
        body: 'Message',
      });
      expect(results).toHaveLength(2);
    });

    it('skips users that have disabled the notification type', async () => {
      prisma.notificationPreference.findUnique
        .mockResolvedValueOnce(null) // u1: enabled
        .mockResolvedValueOnce(mockPrefs({ systemEnabled: false })); // u2: disabled
      prisma.notification.findUnique.mockResolvedValue(null);
      prisma.notification.create.mockResolvedValue(mockNotification({ id: 'n1', userId: 'u1' }));
      const results = await service.createManyInAppNotifications(['u1', 'u2'], {
        type: NotificationType.SYSTEM,
        title: 'Broadcast',
        body: 'Message',
      });
      expect(results).toHaveLength(1);
    });
  });

  // ── Admin broadcast ───────────────────────────────────────────────────────────

  describe('createAdminBroadcast', () => {
    it('broadcasts to all active users', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }]);
      prisma.notificationPreference.findUnique.mockResolvedValue(null);
      prisma.notification.findUnique.mockResolvedValue(null);
      prisma.notification.create.mockResolvedValue(mockNotification());
      const result = await service.createAdminBroadcast({
        type: NotificationType.ADMIN_BROADCAST,
        title: 'Important',
        body: 'Read this',
      });
      expect(result.broadcastTo).toBe(3);
      expect(result.delivered).toBe(3);
    });
  });

  // ── Fan inbox ────────────────────────────────────────────────────────────────

  describe('getInbox', () => {
    it('returns paginated inbox with counts', async () => {
      const notifs = [mockNotification()];
      prisma.notification.findMany.mockResolvedValue(notifs);
      prisma.notification.count
        .mockResolvedValueOnce(1) // total
        .mockResolvedValueOnce(1); // unreadCount
      const result = await service.getInbox('user-1');
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.unreadCount).toBe(1);
    });

    it('applies type and status filters', async () => {
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.notification.count.mockResolvedValue(0);
      await service.getInbox('user-1', { type: NotificationType.FANTASY_RESULT, status: NotificationStatus.UNREAD });
      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: NotificationType.FANTASY_RESULT,
            status: NotificationStatus.UNREAD,
          }),
        }),
      );
    });
  });

  describe('getUnreadCount', () => {
    it('returns unread count for user', async () => {
      prisma.notification.count.mockResolvedValue(5);
      const result = await service.getUnreadCount('user-1');
      expect(result.unreadCount).toBe(5);
    });
  });

  // ── Read / archive ────────────────────────────────────────────────────────────

  describe('getNotificationDetail', () => {
    it('returns notification for correct user', async () => {
      const notif = mockNotification({ userId: 'user-1' });
      prisma.notification.findUnique.mockResolvedValue(notif);
      const result = await service.getNotificationDetail('user-1', 'notif-1');
      expect(result).toBe(notif);
    });

    it('throws NotFoundException when not found', async () => {
      prisma.notification.findUnique.mockResolvedValue(null);
      await expect(service.getNotificationDetail('user-1', 'notif-x')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when userId does not match', async () => {
      prisma.notification.findUnique.mockResolvedValue(mockNotification({ userId: 'other-user' }));
      await expect(service.getNotificationDetail('user-1', 'notif-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markRead', () => {
    it('marks notification as read', async () => {
      const notif = mockNotification({ userId: 'user-1', status: NotificationStatus.UNREAD });
      prisma.notification.findUnique.mockResolvedValue(notif);
      const updated = { ...notif, status: NotificationStatus.READ };
      prisma.notification.update.mockResolvedValue(updated);
      const result = await service.markRead('user-1', 'notif-1');
      expect(result.status).toBe(NotificationStatus.READ);
    });

    it('returns unchanged notification if already read', async () => {
      const notif = mockNotification({ userId: 'user-1', status: NotificationStatus.READ });
      prisma.notification.findUnique.mockResolvedValue(notif);
      const result = await service.markRead('user-1', 'notif-1');
      expect(prisma.notification.update).not.toHaveBeenCalled();
      expect(result).toBe(notif);
    });

    it('throws ForbiddenException when user does not own notification', async () => {
      prisma.notification.findUnique.mockResolvedValue(mockNotification({ userId: 'other' }));
      await expect(service.markRead('user-1', 'notif-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markAllRead', () => {
    it('marks all unread as read', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 3 });
      const result = await service.markAllRead('user-1');
      expect(result.updated).toBe(3);
    });
  });

  describe('archiveNotification', () => {
    it('archives notification', async () => {
      const notif = mockNotification({ userId: 'user-1' });
      prisma.notification.findUnique.mockResolvedValue(notif);
      const archived = { ...notif, status: NotificationStatus.ARCHIVED };
      prisma.notification.update.mockResolvedValue(archived);
      const result = await service.archiveNotification('user-1', 'notif-1');
      expect(result.status).toBe(NotificationStatus.ARCHIVED);
    });

    it('throws ForbiddenException when user does not own notification', async () => {
      prisma.notification.findUnique.mockResolvedValue(mockNotification({ userId: 'other' }));
      await expect(service.archiveNotification('user-1', 'notif-1')).rejects.toThrow(ForbiddenException);
    });
  });

  // ── Admin stats ───────────────────────────────────────────────────────────────

  describe('getAdminStats', () => {
    it('returns aggregated stats', async () => {
      prisma.notification.count.mockResolvedValue(10);
      prisma.notification.groupBy.mockResolvedValue([]);
      prisma.notificationDeliveryLog.count.mockResolvedValue(10);
      const result = await service.getAdminStats();
      expect(result.total).toBe(10);
      expect(result.delivery.externalProvidersActive).toBe(false);
      expect(result.delivery.activeProviders).toContain('LOCAL_IN_APP');
    });
  });

  describe('getAdminRecentNotifications', () => {
    it('returns recent notifications', async () => {
      const notifs = [mockNotification(), mockNotification({ id: 'n2' })];
      prisma.notification.findMany.mockResolvedValue(notifs);
      const result = await service.getAdminRecentNotifications(2);
      expect(result).toHaveLength(2);
    });
  });

  // ── Fantasy deadline alert ────────────────────────────────────────────────────

  describe('createFantasyDeadlineAlert', () => {
    it('notifies fantasy team managers', async () => {
      prisma.fantasyTeam.findMany.mockResolvedValue([{ userId: 'u1' }, { userId: 'u2' }]);
      prisma.notificationPreference.findUnique.mockResolvedValue(null);
      prisma.notification.findUnique.mockResolvedValue(null);
      prisma.notification.create.mockResolvedValue(mockNotification());
      const result = await service.createFantasyDeadlineAlert({
        gameweekId: 'gw-1',
        deadlineAt: new Date('2026-07-01T12:00:00Z'),
        gameweekName: 'Gameweek 1',
      });
      expect(result.gameweekId).toBe('gw-1');
      expect(result.notified).toBe(2);
    });
  });

  // ── Live match alert ──────────────────────────────────────────────────────────

  describe('createLiveMatchAlert', () => {
    it('notifies all active users', async () => {
      prisma.user.findMany.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);
      prisma.notificationPreference.findUnique.mockResolvedValue(null);
      prisma.notification.findUnique.mockResolvedValue(null);
      prisma.notification.create.mockResolvedValue(mockNotification());
      const result = await service.createLiveMatchAlert({
        fixtureId: 'fix-1',
        title: 'GOAL! Pirates 1-0',
        body: 'Orlando Pirates score in the 23rd minute',
      });
      expect(result.fixtureId).toBe('fix-1');
      expect(result.notified).toBe(2);
    });
  });
});
