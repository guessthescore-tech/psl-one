import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

const DEFAULT_NOTIFICATION_BATCH_SIZE = 250;
const MAX_NOTIFICATION_BATCH_SIZE = 500;
import {
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  priority?: NotificationPriority;
  sourceType?: string;
  sourceId?: string;
  actionUrl?: string;
  metadataJson?: object;
}

export interface UpdatePreferencesDto {
  inAppEnabled?: boolean;
  fantasyEnabled?: boolean;
  predictionsEnabled?: boolean;
  challengesEnabled?: boolean;
  achievementsEnabled?: boolean;
  rewardsEnabled?: boolean;
  systemEnabled?: boolean;
  marketingEnabled?: boolean;
}

export interface InboxFilters {
  type?: NotificationType;
  status?: NotificationStatus;
  limit?: number;
  offset?: number;
}

export interface AdminBroadcastDto {
  type: NotificationType;
  title: string;
  body: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  metadataJson?: object;
}

const PREFERENCE_TYPE_MAP: Record<NotificationType, keyof UpdatePreferencesDto | null> = {
  FANTASY_DEADLINE: 'fantasyEnabled',
  FANTASY_RESULT: 'fantasyEnabled',
  PREDICTION_LOCK: 'predictionsEnabled',
  PREDICTION_RESULT: 'predictionsEnabled',
  CHALLENGE_INVITE: 'challengesEnabled',
  CHALLENGE_RESULT: 'challengesEnabled',
  ACHIEVEMENT_UNLOCKED: 'achievementsEnabled',
  REWARD_ELIGIBLE: 'rewardsEnabled',
  SYSTEM: 'systemEnabled',
  LIVE_MATCH_ALERT: 'systemEnabled',
  ADMIN_BROADCAST: 'systemEnabled',
  CAMPAIGN_STARTED: null,
  CAMPAIGN_COMPLETED: null,
  REWARD_ISSUED: 'rewardsEnabled',
  WALLET_LINKED: null,
};

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Preferences ─────────────────────────────────────────────────────────────

  async getOrCreatePreferences(userId: string) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    await this.getOrCreatePreferences(userId);
    return this.prisma.notificationPreference.update({
      where: { userId },
      data: dto,
    });
  }

  // ── shouldNotify check ───────────────────────────────────────────────────────

  async shouldNotify(userId: string, type: NotificationType): Promise<boolean> {
    const prefs = await this.prisma.notificationPreference.findUnique({ where: { userId } });
    if (!prefs) return true; // defaults = all enabled

    if (!prefs.inAppEnabled) {
      // Only SYSTEM and URGENT override inAppEnabled=false
      return type === NotificationType.SYSTEM;
    }

    const prefKey = PREFERENCE_TYPE_MAP[type];
    if (!prefKey) return true;
    return prefs[prefKey as keyof typeof prefs] as boolean ?? true;
  }

  // ── Create notifications ─────────────────────────────────────────────────────

  async createInAppNotification(dto: CreateNotificationDto) {
    const ok = await this.shouldNotify(dto.userId, dto.type);
    if (!ok) return null;

    return this._createNotification(dto);
  }

  async createManyInAppNotifications(userIds: string[], dto: Omit<CreateNotificationDto, 'userId'>) {
    const results: Awaited<ReturnType<typeof this._createNotification>>[] = [];
    for (const userId of userIds) {
      const ok = await this.shouldNotify(userId, dto.type);
      if (!ok) continue;
      const n = await this._createNotification({ ...dto, userId }).catch(() => null);
      if (n) results.push(n);
    }
    return results;
  }

  private async _createNotification(dto: CreateNotificationDto) {
    const data = {
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      body: dto.body,
      priority: dto.priority ?? NotificationPriority.NORMAL,
      ...(dto.sourceType !== undefined ? { sourceType: dto.sourceType } : {}),
      ...(dto.sourceId !== undefined ? { sourceId: dto.sourceId } : {}),
      ...(dto.actionUrl !== undefined ? { actionUrl: dto.actionUrl } : {}),
      ...(dto.metadataJson !== undefined ? { metadataJson: dto.metadataJson } : {}),
    };

    // Idempotent: skip if this source event already has a notification for this user
    if (dto.sourceType && dto.sourceId) {
      const existing = await this.prisma.notification.findUnique({
        where: { userId_sourceType_sourceId: { userId: dto.userId, sourceType: dto.sourceType, sourceId: dto.sourceId } },
      });
      if (existing) return existing;
    }

    const notification = await this.prisma.notification.create({ data });

    // Log delivery as DELIVERED (in-app = immediate)
    await this.prisma.notificationDeliveryLog.create({
      data: {
        notificationId: notification.id,
        userId: dto.userId,
        channel: NotificationChannel.IN_APP,
        provider: 'LOCAL_IN_APP',
        status: NotificationDeliveryStatus.DELIVERED,
        attemptedAt: new Date(),
      },
    });

    return notification;
  }

  // ── Admin notification methods ───────────────────────────────────────────────

  async createAdminNotification(targetUserId: string, dto: Omit<CreateNotificationDto, 'userId'>) {
    return this._createNotification({ ...dto, userId: targetUserId });
  }

  async createAdminBroadcast(dto: AdminBroadcastDto, batchSize = DEFAULT_NOTIFICATION_BATCH_SIZE) {
    if (batchSize < 1 || batchSize > MAX_NOTIFICATION_BATCH_SIZE) {
      throw new BadRequestException(
        `batchSize must be between 1 and ${MAX_NOTIFICATION_BATCH_SIZE}`,
      );
    }
    const payload: Omit<CreateNotificationDto, 'userId'> = {
      type: dto.type,
      title: dto.title,
      body: dto.body,
      ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      ...(dto.actionUrl !== undefined ? { actionUrl: dto.actionUrl } : {}),
      ...(dto.metadataJson !== undefined ? { metadataJson: dto.metadataJson } : {}),
    };

    let totalBroadcastTo = 0;
    let totalDelivered = 0;
    let cursor: string | undefined;

    do {
      const batch = await this.prisma.user.findMany({
        select: { id: true },
        where: { isActive: true },
        take: batchSize,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: 'asc' },
      });

      if (batch.length === 0) break;

      const userIds = batch.map(u => u.id);
      const results = await this.createManyInAppNotifications(userIds, payload);
      totalBroadcastTo += batch.length;
      totalDelivered += results.length;

      cursor = batch[batch.length - 1]!.id;
      if (batch.length < batchSize) break;
    } while (true);

    return { broadcastTo: totalBroadcastTo, delivered: totalDelivered };
  }

  async createFantasyDeadlineAlert(dto: { gameweekId: string; deadlineAt: Date; gameweekName: string }) {
    const users = await this.prisma.fantasyTeam.findMany({
      select: { userId: true },
      distinct: ['userId'],
    });
    const userIds = [...new Set(users.map(u => u.userId))];
    const results = await this.createManyInAppNotifications(userIds, {
      type: NotificationType.FANTASY_DEADLINE,
      title: 'Fantasy Deadline Approaching',
      body: `The transfer deadline for ${dto.gameweekName} is ${dto.deadlineAt.toLocaleString()}.`,
      priority: NotificationPriority.HIGH,
      sourceType: 'GAMEWEEK',
      sourceId: dto.gameweekId,
      actionUrl: `/fantasy`,
    });
    return { notified: results.length, gameweekId: dto.gameweekId };
  }

  async createLiveMatchAlert(dto: { fixtureId: string; title: string; body: string }, batchSize = DEFAULT_NOTIFICATION_BATCH_SIZE) {
    if (batchSize < 1 || batchSize > MAX_NOTIFICATION_BATCH_SIZE) {
      throw new BadRequestException(
        `batchSize must be between 1 and ${MAX_NOTIFICATION_BATCH_SIZE}`,
      );
    }
    const payload: Omit<CreateNotificationDto, 'userId'> = {
      type: NotificationType.LIVE_MATCH_ALERT,
      title: dto.title,
      body: dto.body,
      priority: NotificationPriority.HIGH,
      sourceType: 'FIXTURE',
      sourceId: dto.fixtureId,
      actionUrl: `/football/match-centre`,
    };

    let totalNotified = 0;
    let cursor: string | undefined;

    do {
      const batch = await this.prisma.user.findMany({
        select: { id: true },
        where: { isActive: true },
        take: batchSize,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: 'asc' },
      });

      if (batch.length === 0) break;

      const userIds = batch.map(u => u.id);
      const results = await this.createManyInAppNotifications(userIds, payload);
      totalNotified += results.length;

      cursor = batch[batch.length - 1]!.id;
      if (batch.length < batchSize) break;
    } while (true);

    return { notified: totalNotified, fixtureId: dto.fixtureId };
  }

  // ── Fan inbox ────────────────────────────────────────────────────────────────

  async getInbox(userId: string, filters: InboxFilters = {}) {
    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const where = {
      userId,
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    };

    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          type: true,
          title: true,
          body: true,
          status: true,
          priority: true,
          actionUrl: true,
          sourceType: true,
          sourceId: true,
          readAt: true,
          createdAt: true,
        },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, status: NotificationStatus.UNREAD } }),
    ]);

    return { items, total, unreadCount, limit, offset };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, status: NotificationStatus.UNREAD },
    });
    return { userId, unreadCount: count };
  }

  async getNotificationDetail(userId: string, notificationId: string) {
    const n = await this.prisma.notification.findUnique({ where: { id: notificationId } });
    if (!n) throw new NotFoundException('Notification not found');
    if (n.userId !== userId) throw new ForbiddenException();
    return n;
  }

  // ── Fan actions ───────────────────────────────────────────────────────────────

  async markRead(userId: string, notificationId: string) {
    const n = await this.prisma.notification.findUnique({ where: { id: notificationId } });
    if (!n) throw new NotFoundException('Notification not found');
    if (n.userId !== userId) throw new ForbiddenException();
    if (n.status === NotificationStatus.READ) return n;
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { status: NotificationStatus.READ, readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, status: NotificationStatus.UNREAD },
      data: { status: NotificationStatus.READ, readAt: new Date() },
    });
    return { userId, updated: result.count };
  }

  async archiveNotification(userId: string, notificationId: string) {
    const n = await this.prisma.notification.findUnique({ where: { id: notificationId } });
    if (!n) throw new NotFoundException('Notification not found');
    if (n.userId !== userId) throw new ForbiddenException();
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { status: NotificationStatus.ARCHIVED },
    });
  }

  // ── Admin stats ───────────────────────────────────────────────────────────────

  async getAdminStats() {
    const [total, unread, read, archived, byType, byPriority, deliveryTotal, deliveryDelivered, deliveryFailed] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.count({ where: { status: NotificationStatus.UNREAD } }),
      this.prisma.notification.count({ where: { status: NotificationStatus.READ } }),
      this.prisma.notification.count({ where: { status: NotificationStatus.ARCHIVED } }),
      this.prisma.notification.groupBy({ by: ['type'], _count: { id: true } }),
      this.prisma.notification.groupBy({ by: ['priority'], _count: { id: true } }),
      this.prisma.notificationDeliveryLog.count(),
      this.prisma.notificationDeliveryLog.count({ where: { status: NotificationDeliveryStatus.DELIVERED } }),
      this.prisma.notificationDeliveryLog.count({ where: { status: NotificationDeliveryStatus.FAILED } }),
    ]);

    return {
      total,
      unread,
      read,
      archived,
      byType: Object.fromEntries(byType.map(r => [r.type, r._count.id])),
      byPriority: Object.fromEntries(byPriority.map(r => [r.priority, r._count.id])),
      delivery: {
        total: deliveryTotal,
        delivered: deliveryDelivered,
        failed: deliveryFailed,
        activeProviders: ['LOCAL_IN_APP'],
        externalProvidersActive: false,
        note: 'Only IN_APP delivery is active. PUSH_READY, EMAIL_READY, SMS_READY are provider-ready placeholders only.',
      },
    };
  }

  async getAdminRecentNotifications(limit = 50) {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        readAt: true,
      },
    });
  }

  // ── Delivery log ──────────────────────────────────────────────────────────────

  async logDeliveryAttempt(dto: {
    notificationId?: string;
    userId: string;
    channel: NotificationChannel;
    provider: string;
    status: NotificationDeliveryStatus;
    errorMessage?: string;
    metadataJson?: object;
  }) {
    return this.prisma.notificationDeliveryLog.create({
      data: {
        ...(dto.notificationId ? { notificationId: dto.notificationId } : {}),
        userId: dto.userId,
        channel: dto.channel,
        provider: dto.provider,
        status: dto.status,
        ...(dto.errorMessage ? { errorMessage: dto.errorMessage } : {}),
        ...(dto.metadataJson ? { metadataJson: dto.metadataJson } : {}),
      },
    });
  }
}
