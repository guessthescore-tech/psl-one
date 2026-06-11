import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  ActivityFeedType,
  ActivityVisibility,
  ActivityStatus,
  ActivityReactionType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface CreateActivityItemDto {
  userId?: string;
  type: ActivityFeedType;
  title: string;
  body: string;
  visibility?: ActivityVisibility;
  sourceType?: string;
  sourceId?: string;
  actionUrl?: string;
  metadataJson?: object;
  occurredAt?: Date;
}

export interface FeedFilters {
  type?: ActivityFeedType;
  status?: ActivityStatus;
  visibility?: ActivityVisibility;
  limit?: number;
  offset?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const FEED_ITEM_SELECT = {
  id: true,
  userId: true,
  type: true,
  title: true,
  body: true,
  visibility: true,
  status: true,
  actionUrl: true,
  sourceType: true,
  sourceId: true,
  occurredAt: true,
  createdAt: true,
  hiddenAt: true,
  hiddenReason: true,
} as const;

function buildReactionCounts(reactions: { reactionType: ActivityReactionType }[]) {
  const counts: Partial<Record<ActivityReactionType, number>> = {};
  for (const r of reactions) {
    counts[r.reactionType] = (counts[r.reactionType] ?? 0) + 1;
  }
  return counts;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class ActivityFeedService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Create ────────────────────────────────────────────────────────────────

  async createActivityItem(dto: CreateActivityItemDto) {
    // Idempotent: skip if sourceType + sourceId + type + userId already exists
    if (dto.sourceType && dto.sourceId) {
      const existing = await this.prisma.activityFeedItem.findFirst({
        where: {
          type: dto.type,
          sourceType: dto.sourceType,
          sourceId: dto.sourceId,
          ...(dto.userId ? { userId: dto.userId } : {}),
        },
      });
      if (existing) return existing;
    }

    return this.prisma.activityFeedItem.create({
      data: {
        ...(dto.userId ? { userId: dto.userId } : {}),
        type: dto.type,
        title: dto.title,
        body: dto.body,
        visibility: dto.visibility ?? ActivityVisibility.PUBLIC,
        ...(dto.sourceType ? { sourceType: dto.sourceType } : {}),
        ...(dto.sourceId ? { sourceId: dto.sourceId } : {}),
        ...(dto.actionUrl ? { actionUrl: dto.actionUrl } : {}),
        ...(dto.metadataJson ? { metadataJson: dto.metadataJson } : {}),
        occurredAt: dto.occurredAt ?? new Date(),
      },
    });
  }

  async createSystemActivity(dto: Omit<CreateActivityItemDto, 'userId'>) {
    return this.createActivityItem({ ...dto, visibility: ActivityVisibility.PUBLIC });
  }

  async createUserActivity(userId: string, dto: Omit<CreateActivityItemDto, 'userId'>) {
    return this.createActivityItem({ ...dto, userId });
  }

  // ── Domain-specific creators ──────────────────────────────────────────────

  async createAchievementActivity(userId: string, achievement: { id: string; name: string }) {
    return this.createActivityItem({
      userId,
      type: ActivityFeedType.ACHIEVEMENT_UNLOCKED,
      title: 'Achievement unlocked!',
      body: `Unlocked: ${achievement.name}`,
      visibility: ActivityVisibility.PUBLIC,
      sourceType: 'ACHIEVEMENT',
      sourceId: achievement.id,
      actionUrl: '/achievements',
    });
  }

  async createBadgeActivity(userId: string, badge: { id: string; name: string }) {
    return this.createActivityItem({
      userId,
      type: ActivityFeedType.BADGE_EARNED,
      title: 'Badge earned!',
      body: `Earned: ${badge.name}`,
      visibility: ActivityVisibility.PUBLIC,
      sourceType: 'BADGE',
      sourceId: badge.id,
      actionUrl: '/achievements',
    });
  }

  async createFantasyResultActivity(userId: string, score: { id: string; netPoints: number; gameweekId: string }) {
    return this.createActivityItem({
      userId,
      type: ActivityFeedType.FANTASY_RESULT,
      title: 'Fantasy gameweek result',
      body: `Scored ${score.netPoints} net points this gameweek.`,
      visibility: ActivityVisibility.PUBLIC,
      sourceType: 'FANTASY_GAMEWEEK_SCORE',
      sourceId: score.id,
      actionUrl: `/fantasy/gameweeks/${score.gameweekId}/score`,
    });
  }

  async createPredictionResultActivity(userId: string, prediction: { id: string; pointsAwarded: number }) {
    return this.createActivityItem({
      userId,
      type: ActivityFeedType.PREDICTION_RESULT,
      title: prediction.pointsAwarded > 0 ? `Prediction scored ${prediction.pointsAwarded} pts!` : 'Prediction result in',
      body: prediction.pointsAwarded > 0
        ? `Earned ${prediction.pointsAwarded} Fan Value points from a correct prediction.`
        : 'Better luck next time!',
      visibility: ActivityVisibility.PUBLIC,
      sourceType: 'PREDICTION',
      sourceId: prediction.id,
      actionUrl: '/predictions',
    });
  }

  async createChallengeActivity(
    userId: string,
    challenge: { id: string },
    variant: 'CREATED' | 'RESULT',
    extra?: { winnerUserId?: string | null; challengerUserId?: string },
  ) {
    const type = variant === 'CREATED' ? ActivityFeedType.CHALLENGE_CREATED : ActivityFeedType.CHALLENGE_RESULT;
    const title = variant === 'CREATED' ? 'Challenge issued!' : 'Challenge settled!';
    const body = variant === 'CREATED'
      ? 'Issued a peer prediction challenge.'
      : extra?.winnerUserId === userId
        ? 'Won the peer challenge!'
        : extra?.winnerUserId
          ? 'Peer challenge settled.'
          : 'Peer challenge ended in a draw.';
    return this.createActivityItem({
      userId,
      type,
      title,
      body,
      visibility: ActivityVisibility.PUBLIC,
      sourceType: 'CHALLENGE',
      sourceId: challenge.id,
      actionUrl: '/predictions',
    });
  }

  async createRewardEligibleActivity(userId: string, reward: { id: string; name: string }) {
    return this.createActivityItem({
      userId,
      type: ActivityFeedType.REWARD_ELIGIBLE,
      title: 'Reward opportunity available!',
      body: `Now eligible for: ${reward.name}`,
      visibility: ActivityVisibility.PUBLIC,
      sourceType: 'REWARD_READINESS',
      sourceId: reward.id,
      actionUrl: '/rewards',
    });
  }

  async createLiveMatchAlertActivity(dto: { fixtureId: string; title: string; body: string }) {
    return this.createActivityItem({
      type: ActivityFeedType.LIVE_MATCH_ALERT,
      title: dto.title,
      body: dto.body,
      visibility: ActivityVisibility.PUBLIC,
      sourceType: 'FIXTURE',
      sourceId: dto.fixtureId,
      actionUrl: '/football/match-centre',
    });
  }

  // ── Feed reads ────────────────────────────────────────────────────────────

  async getGlobalFeed(filters: FeedFilters = {}, requestingUserId?: string) {
    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const where = {
      visibility: ActivityVisibility.PUBLIC,
      status: ActivityStatus.ACTIVE,
      ...(filters.type ? { type: filters.type } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.activityFeedItem.findMany({
        where,
        select: { ...FEED_ITEM_SELECT, reactions: { select: { reactionType: true, userId: true } } },
        orderBy: { occurredAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.activityFeedItem.count({ where }),
    ]);

    return {
      items: items.map(item => this._attachReactions(item, requestingUserId)),
      total,
      limit,
      offset,
    };
  }

  async getMyFeed(userId: string, filters: FeedFilters = {}) {
    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const where = {
      userId,
      status: ActivityStatus.ACTIVE,
      visibility: { in: [ActivityVisibility.PUBLIC, ActivityVisibility.PRIVATE] as ActivityVisibility[] },
      ...(filters.type ? { type: filters.type } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.activityFeedItem.findMany({
        where,
        select: { ...FEED_ITEM_SELECT, reactions: { select: { reactionType: true, userId: true } } },
        orderBy: { occurredAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.activityFeedItem.count({ where }),
    ]);

    return {
      items: items.map(item => this._attachReactions(item, userId)),
      total,
      limit,
      offset,
    };
  }

  async getActivityDetail(requestingUserId: string | undefined, activityId: string) {
    const item = await this.prisma.activityFeedItem.findUnique({
      where: { id: activityId },
      include: { reactions: { select: { reactionType: true, userId: true } } },
    });
    if (!item) throw new NotFoundException('Activity not found');

    // Private items are only visible to owner or admin (admin check done at controller level)
    if (item.visibility === ActivityVisibility.PRIVATE && item.userId !== requestingUserId) {
      throw new ForbiddenException('This activity is private');
    }
    if (item.status === ActivityStatus.HIDDEN && item.userId !== requestingUserId) {
      throw new ForbiddenException('This activity is not available');
    }

    return this._attachReactions(item, requestingUserId);
  }

  async getAdminFeed(filters: FeedFilters = {}) {
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    const where = {
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.visibility ? { visibility: filters.visibility } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.activityFeedItem.findMany({
        where,
        select: { ...FEED_ITEM_SELECT, reactions: { select: { reactionType: true, userId: true } } },
        orderBy: { occurredAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.activityFeedItem.count({ where }),
    ]);

    return {
      items: items.map(item => this._attachReactions(item, undefined)),
      total,
      limit,
      offset,
    };
  }

  async getAdminStats() {
    const [total, active, hidden, archived, byType, byVisibility, reactionTotals] = await Promise.all([
      this.prisma.activityFeedItem.count(),
      this.prisma.activityFeedItem.count({ where: { status: ActivityStatus.ACTIVE } }),
      this.prisma.activityFeedItem.count({ where: { status: ActivityStatus.HIDDEN } }),
      this.prisma.activityFeedItem.count({ where: { status: ActivityStatus.ARCHIVED } }),
      this.prisma.activityFeedItem.groupBy({ by: ['type'], _count: { id: true } }),
      this.prisma.activityFeedItem.groupBy({ by: ['visibility'], _count: { id: true } }),
      this.prisma.activityReaction.groupBy({ by: ['reactionType'], _count: { id: true } }),
    ]);

    return {
      total,
      active,
      hidden,
      archived,
      byType: Object.fromEntries(byType.map(r => [r.type, r._count.id])),
      byVisibility: Object.fromEntries(byVisibility.map(r => [r.visibility, r._count.id])),
      reactionTotals: Object.fromEntries(reactionTotals.map(r => [r.reactionType, r._count.id])),
    };
  }

  // ── Fan moderation ────────────────────────────────────────────────────────

  async hideOwnActivity(userId: string, activityId: string) {
    const item = await this.prisma.activityFeedItem.findUnique({ where: { id: activityId } });
    if (!item) throw new NotFoundException('Activity not found');
    if (item.userId !== userId) throw new ForbiddenException('You can only hide your own activity');
    if (item.status !== ActivityStatus.ACTIVE) {
      throw new BadRequestException('Activity is already hidden or archived');
    }

    return this.prisma.activityFeedItem.update({
      where: { id: activityId },
      data: {
        status: ActivityStatus.HIDDEN,
        hiddenAt: new Date(),
        hiddenByUserId: userId,
        hiddenReason: 'Hidden by owner',
      },
    });
  }

  // ── Admin moderation ───────────────────────────────────────────────────────

  async adminHideActivity(adminUserId: string, activityId: string, reason?: string) {
    const item = await this.prisma.activityFeedItem.findUnique({ where: { id: activityId } });
    if (!item) throw new NotFoundException('Activity not found');

    return this.prisma.activityFeedItem.update({
      where: { id: activityId },
      data: {
        status: ActivityStatus.HIDDEN,
        hiddenAt: new Date(),
        hiddenByUserId: adminUserId,
        ...(reason ? { hiddenReason: reason } : {}),
      },
    });
  }

  async adminUnhideActivity(_adminUserId: string, activityId: string) {
    const item = await this.prisma.activityFeedItem.findUnique({ where: { id: activityId } });
    if (!item) throw new NotFoundException('Activity not found');

    return this.prisma.activityFeedItem.update({
      where: { id: activityId },
      data: {
        status: ActivityStatus.ACTIVE,
        hiddenAt: null,
        hiddenByUserId: null,
        hiddenReason: null,
      },
    });
  }

  // ── Reactions ──────────────────────────────────────────────────────────────

  async addReaction(userId: string, activityId: string, reactionType: ActivityReactionType) {
    const item = await this.prisma.activityFeedItem.findUnique({ where: { id: activityId } });
    if (!item) throw new NotFoundException('Activity not found');
    if (item.status !== ActivityStatus.ACTIVE) {
      throw new BadRequestException('Cannot react to a hidden or archived activity');
    }
    if (item.visibility !== ActivityVisibility.PUBLIC) {
      throw new BadRequestException('Cannot react to a non-public activity');
    }

    // Idempotent upsert
    return this.prisma.activityReaction.upsert({
      where: { activityFeedItemId_userId_reactionType: { activityFeedItemId: activityId, userId, reactionType } },
      create: { activityFeedItemId: activityId, userId, reactionType },
      update: {},
    });
  }

  async removeReaction(userId: string, activityId: string, reactionType: ActivityReactionType) {
    const reaction = await this.prisma.activityReaction.findUnique({
      where: { activityFeedItemId_userId_reactionType: { activityFeedItemId: activityId, userId, reactionType } },
    });
    if (!reaction) throw new NotFoundException('Reaction not found');
    if (reaction.userId !== userId) throw new ForbiddenException();

    return this.prisma.activityReaction.delete({
      where: { activityFeedItemId_userId_reactionType: { activityFeedItemId: activityId, userId, reactionType } },
    });
  }

  async getReactionSummary(activityId: string) {
    const reactions = await this.prisma.activityReaction.findMany({
      where: { activityFeedItemId: activityId },
      select: { reactionType: true, userId: true },
    });
    return buildReactionCounts(reactions);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _attachReactions(item: any, requestingUserId?: string) {
    const { reactions, ...rest } = item as { reactions: { reactionType: ActivityReactionType; userId: string }[] } & Record<string, unknown>;
    const reactionCounts = buildReactionCounts(reactions);
    const myReactions = requestingUserId
      ? reactions.filter(r => r.userId === requestingUserId).map(r => r.reactionType)
      : [];
    return { ...rest, reactionCounts, myReactions };
  }
}
