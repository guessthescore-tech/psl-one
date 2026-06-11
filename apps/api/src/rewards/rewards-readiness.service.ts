import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationPriority, NotificationType, RewardReadinessCategory, RewardReadinessStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityFeedService } from '../activity-feed/activity-feed.service';

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface CreateRewardDefinitionDto {
  slug: string;
  name: string;
  description: string;
  category: RewardReadinessCategory;
  isEnabled?: boolean;
  sortOrder?: number;
  minFanValuePoints?: number;
  requiredAchievementSlugs?: string[];
  requiredBadgeSlugs?: string[];
  requiresFantasyTeam?: boolean;
  requiresPredictionActivity?: boolean;
  requiresChallengeActivity?: boolean;
  unlockHint?: string;
  sponsorName?: string;
  notRedeemableNote?: string;
  metadataJson?: object;
}

export interface EligibilityResult {
  definitionId: string;
  slug: string;
  name: string;
  status: RewardReadinessStatus;
  metRequirements: string[];
  unmetRequirements: string[];
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class RewardsReadinessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly activityFeedService: ActivityFeedService,
  ) {}

  // ── Definitions ────────────────────────────────────────────────────────────

  async getDefinitions(filters: { isEnabled?: boolean; category?: RewardReadinessCategory } = {}) {
    return this.prisma.rewardReadinessDefinition.findMany({
      where: {
        ...(filters.isEnabled !== undefined ? { isEnabled: filters.isEnabled } : {}),
        ...(filters.category ? { category: filters.category } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async createDefinition(dto: CreateRewardDefinitionDto) {
    return this.prisma.rewardReadinessDefinition.create({
      data: {
        ...dto,
        requiredAchievementSlugs: dto.requiredAchievementSlugs ?? [],
        requiredBadgeSlugs: dto.requiredBadgeSlugs ?? [],
      },
    });
  }

  async updateDefinition(id: string, dto: Partial<CreateRewardDefinitionDto>) {
    const exists = await this.prisma.rewardReadinessDefinition.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Reward readiness definition not found');
    return this.prisma.rewardReadinessDefinition.update({ where: { id }, data: dto });
  }

  async toggleDefinition(id: string) {
    const def = await this.prisma.rewardReadinessDefinition.findUnique({ where: { id } });
    if (!def) throw new NotFoundException('Reward readiness definition not found');
    return this.prisma.rewardReadinessDefinition.update({
      where: { id },
      data: { isEnabled: !def.isEnabled },
    });
  }

  // ── Eligibility evaluation ─────────────────────────────────────────────────

  async evaluateFanEligibility(userId: string): Promise<EligibilityResult[]> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const definitions = await this.prisma.rewardReadinessDefinition.findMany({
      where: { isEnabled: true },
      orderBy: { sortOrder: 'asc' },
    });

    const results: EligibilityResult[] = [];

    for (const def of definitions) {
      const { met, unmet } = await this.checkRequirements(userId, def);

      const status: RewardReadinessStatus = unmet.length === 0
        ? RewardReadinessStatus.ELIGIBLE
        : RewardReadinessStatus.INELIGIBLE;

      // Check previous status before upsert to detect newly eligible
      const prev = await this.prisma.fanRewardReadiness.findUnique({
        where: { userId_definitionId: { userId, definitionId: def.id } },
      });

      await this.prisma.fanRewardReadiness.upsert({
        where: { userId_definitionId: { userId, definitionId: def.id } },
        create: {
          userId,
          definitionId: def.id,
          status,
          evaluatedAt: new Date(),
          metRequirementsJson: met,
          unmetRequirementsJson: unmet,
        },
        update: {
          status,
          evaluatedAt: new Date(),
          metRequirementsJson: met,
          unmetRequirementsJson: unmet,
        },
      });

      // Notify fan on newly becoming ELIGIBLE (safe hook)
      if (status === RewardReadinessStatus.ELIGIBLE && (!prev || prev.status !== RewardReadinessStatus.ELIGIBLE)) {
        this.notificationsService.createInAppNotification({
          userId,
          type: NotificationType.REWARD_ELIGIBLE,
          title: 'Reward opportunity available!',
          body: `You are now eligible for: ${def.name}`,
          priority: NotificationPriority.NORMAL,
          sourceType: 'REWARD_READINESS',
          sourceId: def.id,
          actionUrl: '/rewards',
        }).catch(() => null);

        // Activity feed (safe)
        this.activityFeedService.createRewardEligibleActivity(userId, { id: def.id, name: def.name }).catch(() => null);
      }

      results.push({ definitionId: def.id, slug: def.slug, name: def.name, status, metRequirements: met, unmetRequirements: unmet });
    }

    return results;
  }

  async evaluateAllFans(): Promise<{ evaluated: number; results: { userId: string; eligibleCount: number }[] }> {
    const users = await this.prisma.user.findMany({ select: { id: true }, where: { isActive: true } });
    const results: { userId: string; eligibleCount: number }[] = [];

    for (const { id: userId } of users) {
      const fanResults = await this.evaluateFanEligibility(userId);
      const eligibleCount = fanResults.filter(r => r.status === RewardReadinessStatus.ELIGIBLE).length;
      results.push({ userId, eligibleCount });
    }

    return { evaluated: users.length, results };
  }

  // ── Fan-facing reads ───────────────────────────────────────────────────────

  async getFanReadinessOverview(userId: string) {
    const rows = await this.prisma.fanRewardReadiness.findMany({
      where: { userId },
      include: { definition: true },
      orderBy: [{ definition: { sortOrder: 'asc' } }],
    });

    const eligible = rows.filter(r => r.status === RewardReadinessStatus.ELIGIBLE);
    const ineligible = rows.filter(r => r.status === RewardReadinessStatus.INELIGIBLE);
    const pending = rows.filter(r => r.status === RewardReadinessStatus.PENDING_EVALUATION);

    return {
      userId,
      totalDefinitions: rows.length,
      eligibleCount: eligible.length,
      ineligibleCount: ineligible.length,
      pendingCount: pending.length,
      nonFinancialDisclaimer: 'Fan Value points have no cash value and are not redeemable for money.',
      notYetRedeemableNote: 'Reward opportunities shown here are not yet redeemable. This section shows your future eligibility status only.',
      rows: rows.map(r => this.formatReadinessRow(r)),
    };
  }

  async getFanEligibleRewards(userId: string) {
    const rows = await this.prisma.fanRewardReadiness.findMany({
      where: { userId, status: RewardReadinessStatus.ELIGIBLE },
      include: { definition: true },
      orderBy: [{ definition: { sortOrder: 'asc' } }],
    });

    return {
      userId,
      eligibleCount: rows.length,
      nonFinancialDisclaimer: 'Fan Value points have no cash value and are not redeemable for money.',
      notYetRedeemableNote: 'These reward opportunities are not yet redeemable. Eligibility does not guarantee a reward.',
      rewards: rows.map(r => this.formatReadinessRow(r)),
    };
  }

  async getFanLockedRewards(userId: string) {
    const enabledDefs = await this.prisma.rewardReadinessDefinition.findMany({
      where: { isEnabled: true },
      orderBy: { sortOrder: 'asc' },
    });

    const rows = await this.prisma.fanRewardReadiness.findMany({
      where: { userId, status: RewardReadinessStatus.INELIGIBLE },
      include: { definition: true },
    });

    // Definitions not yet evaluated for this fan also count as locked
    const evaluatedDefIds = new Set([
      ...rows.map(r => r.definitionId),
      ...(await this.prisma.fanRewardReadiness.findMany({
        where: { userId, status: RewardReadinessStatus.ELIGIBLE },
        select: { definitionId: true },
      })).map(r => r.definitionId),
    ]);

    const unevaluatedDefs = enabledDefs.filter(d => !evaluatedDefIds.has(d.id));

    return {
      userId,
      lockedCount: rows.length + unevaluatedDefs.length,
      nonFinancialDisclaimer: 'Fan Value points have no cash value and are not redeemable for money.',
      locked: [
        ...rows.map(r => ({
          definitionId: r.definitionId,
          slug: r.definition.slug,
          name: r.definition.name,
          description: r.definition.description,
          category: r.definition.category,
          unlockHint: r.definition.unlockHint,
          notRedeemableNote: r.definition.notRedeemableNote,
          sponsorName: r.definition.sponsorName,
          unmetRequirements: (r.unmetRequirementsJson as string[] | null) ?? [],
          metRequirements: (r.metRequirementsJson as string[] | null) ?? [],
          evaluatedAt: r.evaluatedAt,
        })),
        ...unevaluatedDefs.map(d => ({
          definitionId: d.id,
          slug: d.slug,
          name: d.name,
          description: d.description,
          category: d.category,
          unlockHint: d.unlockHint,
          notRedeemableNote: d.notRedeemableNote,
          sponsorName: d.sponsorName,
          unmetRequirements: ['Not yet evaluated — use the Evaluate button to check your eligibility.'],
          metRequirements: [],
          evaluatedAt: null,
        })),
      ],
    };
  }

  // ── Admin reads ────────────────────────────────────────────────────────────

  async getAdminStats() {
    const [totalDefs, enabledDefs, totalEvaluations, eligibleCount, ineligibleCount, pendingCount] = await Promise.all([
      this.prisma.rewardReadinessDefinition.count(),
      this.prisma.rewardReadinessDefinition.count({ where: { isEnabled: true } }),
      this.prisma.fanRewardReadiness.count(),
      this.prisma.fanRewardReadiness.count({ where: { status: RewardReadinessStatus.ELIGIBLE } }),
      this.prisma.fanRewardReadiness.count({ where: { status: RewardReadinessStatus.INELIGIBLE } }),
      this.prisma.fanRewardReadiness.count({ where: { status: RewardReadinessStatus.PENDING_EVALUATION } }),
    ]);

    const byCategory = await this.prisma.rewardReadinessDefinition.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    return {
      totalDefinitions: totalDefs,
      enabledDefinitions: enabledDefs,
      totalEvaluations,
      eligibleCount,
      ineligibleCount,
      pendingCount,
      eligibilityRate: totalEvaluations > 0 ? Math.round((eligibleCount / totalEvaluations) * 100) : 0,
      byCategory: byCategory.map(r => ({ category: r.category, count: r._count.id })),
      nonFinancialConfirmation: 'No financial instruments. No redemption flow. Fan Value points are non-financial.',
    };
  }

  async getEligibleFansForDefinition(definitionId: string, limit = 50, offset = 0) {
    const def = await this.prisma.rewardReadinessDefinition.findUnique({ where: { id: definitionId } });
    if (!def) throw new NotFoundException('Reward readiness definition not found');

    const [rows, total] = await Promise.all([
      this.prisma.fanRewardReadiness.findMany({
        where: { definitionId, status: RewardReadinessStatus.ELIGIBLE },
        include: { user: { select: { id: true, email: true, role: true, createdAt: true } } },
        orderBy: { evaluatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.fanRewardReadiness.count({ where: { definitionId, status: RewardReadinessStatus.ELIGIBLE } }),
    ]);

    return {
      definitionId,
      definitionSlug: def.slug,
      definitionName: def.name,
      total,
      limit,
      offset,
      fans: rows.map(r => ({
        fanRewardReadinessId: r.id,
        userId: r.userId,
        email: r.user.email,
        evaluatedAt: r.evaluatedAt,
        metRequirements: (r.metRequirementsJson as string[] | null) ?? [],
      })),
    };
  }

  // ── Internal helpers ───────────────────────────────────────────────────────

  private async checkRequirements(
    userId: string,
    def: {
      id: string;
      minFanValuePoints: number | null;
      requiredAchievementSlugs: string[];
      requiredBadgeSlugs: string[];
      requiresFantasyTeam: boolean;
      requiresPredictionActivity: boolean;
      requiresChallengeActivity: boolean;
    },
  ): Promise<{ met: string[]; unmet: string[] }> {
    const met: string[] = [];
    const unmet: string[] = [];

    // Fan Value points threshold
    if (def.minFanValuePoints !== null && def.minFanValuePoints > 0) {
      const agg = await this.prisma.fanValueLedger.aggregate({
        where: { userId, status: 'POSTED' },
        _sum: { points: true },
      });
      const total = agg._sum.points ?? 0;
      if (total >= def.minFanValuePoints) {
        met.push(`Fan Value points: ${total} / ${def.minFanValuePoints} required`);
      } else {
        unmet.push(`Fan Value points: ${total} / ${def.minFanValuePoints} required`);
      }
    }

    // Required achievements
    for (const slug of def.requiredAchievementSlugs) {
      const achDef = await this.prisma.achievementDefinition.findUnique({ where: { slug } });
      if (!achDef) { unmet.push(`Achievement not found: ${slug}`); continue; }
      const fa = await this.prisma.fanAchievement.findUnique({
        where: { userId_achievementDefinitionId: { userId, achievementDefinitionId: achDef.id } },
      });
      if (fa?.status === 'UNLOCKED') {
        met.push(`Achievement unlocked: ${slug}`);
      } else {
        unmet.push(`Achievement required: ${slug}`);
      }
    }

    // Required badges
    for (const slug of def.requiredBadgeSlugs) {
      const badgeDef = await this.prisma.badgeDefinition.findUnique({ where: { slug } });
      if (!badgeDef) { unmet.push(`Badge not found: ${slug}`); continue; }
      const fb = await this.prisma.fanBadge.findUnique({
        where: { userId_badgeDefinitionId: { userId, badgeDefinitionId: badgeDef.id } },
      });
      if (fb && !fb.revokedAt) {
        met.push(`Badge earned: ${slug}`);
      } else {
        unmet.push(`Badge required: ${slug}`);
      }
    }

    // Fantasy team
    if (def.requiresFantasyTeam) {
      const count = await this.prisma.fantasyTeam.count({ where: { userId } });
      if (count > 0) {
        met.push('Fantasy team created');
      } else {
        unmet.push('Fantasy team required — build your fantasy team');
      }
    }

    // Prediction activity
    if (def.requiresPredictionActivity) {
      const count = await this.prisma.scorePrediction.count({ where: { userId } });
      if (count > 0) {
        met.push('Prediction activity: at least one prediction made');
      } else {
        unmet.push('Prediction activity required — make at least one match prediction');
      }
    }

    // Challenge activity
    if (def.requiresChallengeActivity) {
      const count = await this.prisma.peerChallenge.count({
        where: { OR: [{ challengerUserId: userId }, { opponentUserId: userId }] },
      });
      if (count > 0) {
        met.push('Challenge activity: participated in at least one peer challenge');
      } else {
        unmet.push('Challenge activity required — issue or accept a peer challenge');
      }
    }

    // If no requirements configured, fan is always eligible
    if (met.length === 0 && unmet.length === 0) {
      met.push('No specific requirements — open to all fans');
    }

    return { met, unmet };
  }

  private formatReadinessRow(r: {
    id: string;
    definitionId: string;
    status: RewardReadinessStatus;
    evaluatedAt: Date | null;
    metRequirementsJson: unknown;
    unmetRequirementsJson: unknown;
    definition: {
      slug: string;
      name: string;
      description: string;
      category: RewardReadinessCategory;
      unlockHint: string | null;
      sponsorName: string | null;
      notRedeemableNote: string;
    };
  }) {
    return {
      fanRewardReadinessId: r.id,
      definitionId: r.definitionId,
      slug: r.definition.slug,
      name: r.definition.name,
      description: r.definition.description,
      category: r.definition.category,
      status: r.status,
      unlockHint: r.definition.unlockHint,
      sponsorName: r.definition.sponsorName,
      notRedeemableNote: r.definition.notRedeemableNote,
      evaluatedAt: r.evaluatedAt,
      metRequirements: (r.metRequirementsJson as string[] | null) ?? [],
      unmetRequirements: (r.unmetRequirementsJson as string[] | null) ?? [],
    };
  }
}
