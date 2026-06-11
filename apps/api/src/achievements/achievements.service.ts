import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  AchievementCategory,
  AchievementStatus,
  AchievementTriggerType,
  FanValueSourceType,
  FanValueType,
  FanValueStatus,
  NotificationType,
  NotificationPriority,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FanValueLedgerService } from '../fan-value/fan-value-ledger.service';
import { NotificationsService } from '../notifications/notifications.service';

export interface CreateAchievementDefinitionDto {
  slug: string;
  name: string;
  description: string;
  category: AchievementCategory;
  triggerType: AchievementTriggerType;
  threshold?: number;
  fanValuePoints?: number;
  isActive?: boolean;
  sortOrder?: number;
  metadataJson?: object;
}

export interface CreateBadgeDefinitionDto {
  slug: string;
  name: string;
  description: string;
  rarity: string;
  category: AchievementCategory;
  icon?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
  metadataJson?: object;
}

@Injectable()
export class AchievementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fanValueLedgerService: FanValueLedgerService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ── Definitions ──────────────────────────────────────────────────────────

  async getDefinitions(filters: { category?: AchievementCategory; isActive?: boolean } = {}) {
    return this.prisma.achievementDefinition.findMany({
      where: {
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
      },
      include: { badges: { include: { badge: true } } },
      orderBy: [{ sortOrder: 'asc' }, { category: 'asc' }],
    });
  }

  async getBadgeDefinitions(filters: { category?: AchievementCategory; isActive?: boolean } = {}) {
    return this.prisma.badgeDefinition.findMany({
      where: {
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
      },
      include: { achievements: { include: { achievement: true } } },
      orderBy: [{ sortOrder: 'asc' }, { rarity: 'asc' }],
    });
  }

  async createAchievementDefinition(dto: CreateAchievementDefinitionDto) {
    return this.prisma.achievementDefinition.create({ data: { ...dto } });
  }

  async updateAchievementDefinition(id: string, dto: Partial<CreateAchievementDefinitionDto>) {
    const exists = await this.prisma.achievementDefinition.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Achievement definition not found');
    return this.prisma.achievementDefinition.update({ where: { id }, data: dto });
  }

  async createBadgeDefinition(dto: CreateBadgeDefinitionDto) {
    return this.prisma.badgeDefinition.create({ data: { ...dto } as never });
  }

  async updateBadgeDefinition(id: string, dto: Partial<CreateBadgeDefinitionDto>) {
    const exists = await this.prisma.badgeDefinition.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Badge definition not found');
    return this.prisma.badgeDefinition.update({ where: { id }, data: dto as never });
  }

  async linkBadgeToAchievement(achievementDefinitionId: string, badgeDefinitionId: string) {
    return this.prisma.achievementBadge.upsert({
      where: { achievementDefinitionId_badgeDefinitionId: { achievementDefinitionId, badgeDefinitionId } },
      create: { achievementDefinitionId, badgeDefinitionId },
      update: {},
    });
  }

  // ── Fan read methods ─────────────────────────────────────────────────────

  async getFanAchievements(userId: string) {
    const [definitions, fanAchievements] = await Promise.all([
      this.prisma.achievementDefinition.findMany({
        where: { isActive: true },
        include: { badges: { include: { badge: true } } },
        orderBy: [{ sortOrder: 'asc' }],
      }),
      this.prisma.fanAchievement.findMany({
        where: { userId },
        include: { definition: { include: { badges: { include: { badge: true } } } } },
      }),
    ]);

    const fanAchMap = new Map(fanAchievements.map(fa => [fa.achievementDefinitionId, fa]));

    return {
      achievements: definitions.map(def => {
        const fa = fanAchMap.get(def.id);
        return {
          definitionId: def.id,
          slug: def.slug,
          name: def.name,
          description: def.description,
          category: def.category,
          triggerType: def.triggerType,
          threshold: def.threshold,
          fanValuePoints: def.fanValuePoints,
          status: fa?.status ?? AchievementStatus.LOCKED,
          progress: fa?.progress ?? 0,
          target: fa?.target ?? def.threshold,
          unlockedAt: fa?.unlockedAt ?? null,
          badges: def.badges.map(ab => ({
            badgeId: ab.badge.id,
            slug: ab.badge.slug,
            name: ab.badge.name,
            rarity: ab.badge.rarity,
            icon: ab.badge.icon,
          })),
        };
      }),
    };
  }

  async getFanBadges(userId: string) {
    const fanBadges = await this.prisma.fanBadge.findMany({
      where: { userId, revokedAt: null },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' },
    });

    return {
      badges: fanBadges.map(fb => ({
        badgeId: fb.id,
        badgeDefinitionId: fb.badgeDefinitionId,
        slug: fb.badge.slug,
        name: fb.badge.name,
        description: fb.badge.description,
        rarity: fb.badge.rarity,
        icon: fb.badge.icon,
        imageUrl: fb.badge.imageUrl,
        category: fb.badge.category,
        awardedAt: fb.awardedAt,
        isDisplayed: fb.isDisplayed,
      })),
    };
  }

  async getFanAchievementSummary(userId: string) {
    const [definitions, fanAchievements, fanBadges, fanValueTotal] = await Promise.all([
      this.prisma.achievementDefinition.count({ where: { isActive: true } }),
      this.prisma.fanAchievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: 'desc' },
        include: { definition: true },
      }),
      this.prisma.fanBadge.count({ where: { userId, revokedAt: null } }),
      this.prisma.fanValueLedger.aggregate({
        where: { userId, valueType: FanValueType.ACHIEVEMENT_POINTS, status: FanValueStatus.POSTED },
        _sum: { points: true },
      }),
    ]);

    const unlocked = fanAchievements.filter(fa => fa.status === AchievementStatus.UNLOCKED);
    const recentUnlocks = unlocked.slice(0, 5).map(fa => ({
      slug: fa.definition.slug,
      name: fa.definition.name,
      unlockedAt: fa.unlockedAt,
    }));

    const featuredBadgeFanBadges = await this.prisma.fanBadge.findMany({
      where: { userId, isDisplayed: true, revokedAt: null },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' },
      take: 3,
    });

    return {
      userId,
      unlockedCount: unlocked.length,
      totalCount: definitions,
      badgeCount: fanBadges,
      achievementPoints: fanValueTotal._sum.points ?? 0,
      recentUnlocks,
      featuredBadges: featuredBadgeFanBadges.map(fb => ({
        slug: fb.badge.slug,
        name: fb.badge.name,
        rarity: fb.badge.rarity,
        icon: fb.badge.icon,
      })),
    };
  }

  async getFanAchievementProgress(userId: string) {
    const fanAchievements = await this.prisma.fanAchievement.findMany({
      where: { userId, status: { in: [AchievementStatus.IN_PROGRESS, AchievementStatus.LOCKED] } },
      include: { definition: true },
      orderBy: [{ definition: { sortOrder: 'asc' } }],
    });

    return {
      inProgress: fanAchievements
        .filter(fa => fa.status === AchievementStatus.IN_PROGRESS)
        .map(fa => ({
          slug: fa.definition.slug,
          name: fa.definition.name,
          category: fa.definition.category,
          progress: fa.progress,
          target: fa.target ?? fa.definition.threshold,
          percent: fa.target ? Math.min(100, Math.round((fa.progress / fa.target) * 100)) : 0,
        })),
    };
  }

  // ── Core awarding ────────────────────────────────────────────────────────

  async awardAchievement(userId: string, slug: string, metadata?: object, awardedByUserId?: string) {
    const def = await this.prisma.achievementDefinition.findUnique({
      where: { slug },
      include: { badges: { include: { badge: true } } },
    });
    if (!def) throw new NotFoundException(`Achievement definition '${slug}' not found`);
    return this._awardByDefinition(userId, def, metadata, awardedByUserId);
  }

  async awardAchievementByDefinitionId(userId: string, definitionId: string, metadata?: object, awardedByUserId?: string) {
    const def = await this.prisma.achievementDefinition.findUnique({
      where: { id: definitionId },
      include: { badges: { include: { badge: true } } },
    });
    if (!def) throw new NotFoundException(`Achievement definition '${definitionId}' not found`);
    return this._awardByDefinition(userId, def, metadata, awardedByUserId);
  }

  private async _awardByDefinition(
    userId: string,
    def: Awaited<ReturnType<typeof this.prisma.achievementDefinition.findUniqueOrThrow>>,
    metadata?: object,
    awardedByUserId?: string,
  ) {
    // Idempotent upsert
    const existing = await this.prisma.fanAchievement.findUnique({
      where: { userId_achievementDefinitionId: { userId, achievementDefinitionId: def.id } },
    });

    if (existing?.status === AchievementStatus.UNLOCKED) {
      return existing; // already awarded, idempotent
    }

    const now = new Date();
    const fanAchievement = await this.prisma.fanAchievement.upsert({
      where: { userId_achievementDefinitionId: { userId, achievementDefinitionId: def.id } },
      create: {
        userId,
        achievementDefinitionId: def.id,
        status: AchievementStatus.UNLOCKED,
        progress: def.threshold ?? 1,
        target: def.threshold,
        unlockedAt: now,
        ...(awardedByUserId ? { awardedByUserId } : {}),
        ...(metadata ? { metadataJson: metadata } : {}),
      },
      update: {
        status: AchievementStatus.UNLOCKED,
        progress: def.threshold ?? 1,
        unlockedAt: now,
        ...(awardedByUserId ? { awardedByUserId } : {}),
        ...(metadata ? { metadataJson: metadata } : {}),
      },
    });

    // Award linked badges (idempotent)
    for (const ab of (def as unknown as { badges: { badge: { id: string } }[] }).badges) {
      await this.prisma.fanBadge.upsert({
        where: { userId_badgeDefinitionId: { userId, badgeDefinitionId: ab.badge.id } },
        create: {
          userId,
          badgeDefinitionId: ab.badge.id,
          fanAchievementId: fanAchievement.id,
          awardedAt: now,
        },
        update: {},
      });
    }

    // Post to FanValueLedger if points > 0 (idempotent)
    if (def.fanValuePoints > 0) {
      await this.fanValueLedgerService.postAchievementAward(
        def.id,
        userId,
        def.fanValuePoints,
        `Achievement unlocked: ${def.name}`,
      ).catch(() => null);
    }

    // In-app notification (safe — must not fail the award)
    this.notificationsService.createInAppNotification({
      userId,
      type: NotificationType.ACHIEVEMENT_UNLOCKED,
      title: 'Achievement unlocked!',
      body: `You unlocked: ${def.name}`,
      priority: NotificationPriority.NORMAL,
      sourceType: 'ACHIEVEMENT',
      sourceId: def.id,
      actionUrl: '/achievements',
    }).catch(() => null);

    return fanAchievement;
  }

  async updateProgress(userId: string, slug: string, progress: number, target?: number) {
    const def = await this.prisma.achievementDefinition.findUnique({ where: { slug } });
    if (!def) return;

    const effectiveTarget = target ?? def.threshold;
    const newStatus = effectiveTarget && progress >= effectiveTarget
      ? AchievementStatus.UNLOCKED
      : progress > 0
        ? AchievementStatus.IN_PROGRESS
        : AchievementStatus.LOCKED;

    const existing = await this.prisma.fanAchievement.findUnique({
      where: { userId_achievementDefinitionId: { userId, achievementDefinitionId: def.id } },
    });

    if (existing?.status === AchievementStatus.UNLOCKED) return existing; // already done

    if (newStatus === AchievementStatus.UNLOCKED) {
      return this.awardAchievement(userId, slug);
    }

    return this.prisma.fanAchievement.upsert({
      where: { userId_achievementDefinitionId: { userId, achievementDefinitionId: def.id } },
      create: { userId, achievementDefinitionId: def.id, progress, target: effectiveTarget, status: newStatus },
      update: { progress, ...(effectiveTarget ? { target: effectiveTarget } : {}), status: newStatus },
    });
  }

  // ── Revocation ───────────────────────────────────────────────────────────

  async revokeAchievement(userId: string, fanAchievementId: string, reason: string, adminUserId: string) {
    const fa = await this.prisma.fanAchievement.findUnique({ where: { id: fanAchievementId } });
    if (!fa) throw new NotFoundException('Fan achievement not found');
    if (fa.userId !== userId) throw new BadRequestException('Achievement does not belong to this user');

    return this.prisma.fanAchievement.update({
      where: { id: fanAchievementId },
      data: {
        status: AchievementStatus.REVOKED,
        revokedAt: new Date(),
        revokeReason: `[Admin ${adminUserId}] ${reason}`,
      },
    });
  }

  async revokeBadge(userId: string, fanBadgeId: string, reason: string, adminUserId: string) {
    const fb = await this.prisma.fanBadge.findUnique({ where: { id: fanBadgeId } });
    if (!fb) throw new NotFoundException('Fan badge not found');
    if (fb.userId !== userId) throw new BadRequestException('Badge does not belong to this user');

    return this.prisma.fanBadge.update({
      where: { id: fanBadgeId },
      data: {
        revokedAt: new Date(),
        revokeReason: `[Admin ${adminUserId}] ${reason}`,
        isDisplayed: false,
      },
    });
  }

  // ── Trigger evaluation ───────────────────────────────────────────────────

  async evaluateUserAchievements(userId: string) {
    const definitions = await this.prisma.achievementDefinition.findMany({
      where: { isActive: true, triggerType: { not: 'MANUAL' } },
    });

    const results: { slug: string; awarded: boolean }[] = [];
    for (const def of definitions) {
      const awarded = await this.evaluateAndAward(userId, def).catch(() => false);
      results.push({ slug: def.slug, awarded });
    }
    return { userId, evaluated: results.length, results };
  }

  async evaluateSingleAchievement(userId: string, slug: string) {
    return this.evaluateAchievement(userId, slug);
  }

  async evaluateAchievement(userId: string, slug: string) {
    const def = await this.prisma.achievementDefinition.findUnique({ where: { slug } });
    if (!def) throw new NotFoundException(`Achievement '${slug}' not found`);
    if (!def.isActive || def.triggerType === 'MANUAL') return { slug, awarded: false, reason: 'manual or inactive' };
    const awarded = await this.evaluateAndAward(userId, def).catch(() => false);
    return { slug, awarded };
  }

  private async evaluateAndAward(
    userId: string,
    def: { id: string; slug: string; triggerType: AchievementTriggerType; threshold: number | null; isActive: boolean },
  ): Promise<boolean> {
    const existing = await this.prisma.fanAchievement.findUnique({
      where: { userId_achievementDefinitionId: { userId, achievementDefinitionId: def.id } },
    });
    if (existing?.status === AchievementStatus.UNLOCKED) return false;

    const met = await this.checkTrigger(userId, def.triggerType, def.threshold);
    if (met) {
      await this.awardAchievementByDefinitionId(userId, def.id);
      return true;
    }

    // Update progress for threshold achievements
    if (def.threshold) {
      const progress = await this.getProgressForTrigger(userId, def.triggerType);
      if (progress > 0) {
        await this.updateProgress(userId, def.slug, progress, def.threshold);
      }
    }
    return false;
  }

  private async checkTrigger(userId: string, triggerType: AchievementTriggerType, threshold: number | null): Promise<boolean> {
    switch (triggerType) {
      case 'FIRST_FANTASY_TEAM':
        return (await this.prisma.fantasyTeam.count({ where: { userId } })) > 0;

      case 'FIRST_PREDICTION':
        return (await this.prisma.scorePrediction.count({ where: { userId } })) > 0;

      case 'FIRST_EXACT_PREDICTION':
        return (await this.prisma.scorePrediction.count({
          where: { userId, status: { in: ['WON', 'SETTLED', 'LOST'] }, pointsAwarded: 10 },
        })) > 0;

      case 'FIRST_LEAGUE_JOIN':
        return (await this.prisma.fantasyLeagueMember.count({ where: { userId } })) > 0;

      case 'FIRST_LEAGUE_CREATED':
        return (await this.prisma.fantasyLeague.count({ where: { createdByUserId: userId } })) > 0;

      case 'FIRST_CHALLENGE':
        return (await this.prisma.peerChallenge.count({
          where: { OR: [{ challengerUserId: userId }, { opponentUserId: userId }] },
        })) > 0;

      case 'FIRST_CHALLENGE_WIN':
        return (await this.prisma.peerChallenge.count({ where: { winnerUserId: userId } })) > 0;

      case 'FANTASY_GAMEWEEK_POINTS': {
        if (!threshold) return false;
        const max = await this.prisma.fantasyGameweekScore.aggregate({
          where: { userId },
          _max: { netPoints: true },
        });
        return (max._max.netPoints ?? 0) >= threshold;
      }

      case 'FANTASY_SEASON_POINTS': {
        if (!threshold) return false;
        const sum = await this.prisma.fantasyGameweekScore.aggregate({
          where: { userId },
          _sum: { netPoints: true },
        });
        return (sum._sum.netPoints ?? 0) >= threshold;
      }

      case 'PREDICTION_POINTS': {
        if (!threshold) return false;
        const sum = await this.prisma.predictionPointsLedger.aggregate({
          where: { userId },
          _sum: { points: true },
        });
        return (sum._sum.points ?? 0) >= threshold;
      }

      case 'FAN_VALUE_POINTS': {
        if (!threshold) return false;
        const sum = await this.prisma.fanValueLedger.aggregate({
          where: { userId, status: FanValueStatus.POSTED },
          _sum: { points: true },
        });
        return (sum._sum.points ?? 0) >= threshold;
      }

      case 'PROFILE_COMPLETED': {
        const profile = await this.prisma.fanProfile.findUnique({ where: { userId } });
        return !!(profile?.displayName && profile.displayName.trim().length > 0);
      }

      default:
        return false;
    }
  }

  private async getProgressForTrigger(userId: string, triggerType: AchievementTriggerType): Promise<number> {
    switch (triggerType) {
      case 'FANTASY_GAMEWEEK_POINTS': {
        const r = await this.prisma.fantasyGameweekScore.aggregate({ where: { userId }, _max: { netPoints: true } });
        return r._max.netPoints ?? 0;
      }
      case 'FANTASY_SEASON_POINTS': {
        const r = await this.prisma.fantasyGameweekScore.aggregate({ where: { userId }, _sum: { netPoints: true } });
        return r._sum.netPoints ?? 0;
      }
      case 'PREDICTION_POINTS': {
        const r = await this.prisma.predictionPointsLedger.aggregate({ where: { userId }, _sum: { points: true } });
        return r._sum.points ?? 0;
      }
      case 'FAN_VALUE_POINTS': {
        const r = await this.prisma.fanValueLedger.aggregate({
          where: { userId, status: FanValueStatus.POSTED },
          _sum: { points: true },
        });
        return r._sum.points ?? 0;
      }
      default:
        return 0;
    }
  }

  // ── Admin stats ──────────────────────────────────────────────────────────

  async getAdminAchievementStats() {
    const [totalDefinitions, totalFanAchievements, totalUnlocked, totalBadges, recentUnlocks] = await Promise.all([
      this.prisma.achievementDefinition.count(),
      this.prisma.fanAchievement.count(),
      this.prisma.fanAchievement.count({ where: { status: AchievementStatus.UNLOCKED } }),
      this.prisma.fanBadge.count({ where: { revokedAt: null } }),
      this.prisma.fanAchievement.findMany({
        where: { status: AchievementStatus.UNLOCKED },
        orderBy: { unlockedAt: 'desc' },
        take: 20,
        include: { definition: { select: { slug: true, name: true, category: true } } },
      }),
    ]);

    const byCategory = await this.prisma.fanAchievement.groupBy({
      by: ['status'],
      where: { status: AchievementStatus.UNLOCKED },
      _count: { id: true },
    });

    return {
      totalDefinitions,
      totalFanAchievements,
      totalUnlocked,
      totalBadges,
      unlockRate: totalFanAchievements > 0 ? Math.round((totalUnlocked / totalFanAchievements) * 100) : 0,
      byStatus: byCategory.map(r => ({ status: r.status, count: r._count.id })),
      recentUnlocks,
    };
  }

  // Public method for integration hooks
  async safeEvaluate(userId: string, slugs: string[]) {
    for (const slug of slugs) {
      await this.evaluateSingleAchievement(userId, slug).catch(() => null);
    }
  }
}
