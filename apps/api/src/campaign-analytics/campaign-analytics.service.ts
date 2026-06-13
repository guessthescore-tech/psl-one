import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MediaEngagementEventType, CampaignActionType, FanRewardStatus } from '@prisma/client';

@Injectable()
export class CampaignAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCampaignAnalytics(campaignId: string) {
    const campaign = await this.prisma.sponsorCampaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException(`Campaign '${campaignId}' not found`);

    const latestSnapshot = await this.prisma.campaignAnalyticsSnapshot.findFirst({
      where: { campaignId },
      orderBy: { snapshotDate: 'desc' },
    });

    const mediaAssetIds = await this.prisma.mediaAsset.findMany({
      where: { campaignId },
      select: { id: true },
    });
    const assetIds = mediaAssetIds.map(a => a.id);

    const [
      uniqueParticipants,
      completedParticipants,
      actionsCompleted,
      rewardsIssued,
      rewardsRedeemed,
      videoViews,
      videoCompletions,
      ctaClicks,
      walletLinksStarted,
      walletLinksCompleted,
    ] = await Promise.all([
      this.prisma.fanCampaignParticipation.count({ where: { campaignId } }),
      this.prisma.fanCampaignParticipation.count({
        where: { campaignId, status: { in: ['COMPLETED', 'REWARDED'] as never } },
      }),
      this.prisma.fanCampaignActionCompletion.count({
        where: { campaignAction: { campaignId } },
      }),
      this.prisma.fanReward.count({
        where: { campaignId, status: { not: FanRewardStatus.CANCELLED } },
      }),
      this.prisma.fanReward.count({
        where: { campaignId, status: FanRewardStatus.REDEEMED },
      }),
      assetIds.length > 0
        ? this.prisma.mediaEngagementEvent.count({
            where: { mediaAssetId: { in: assetIds }, eventType: MediaEngagementEventType.VIEW },
          })
        : Promise.resolve(0),
      assetIds.length > 0
        ? this.prisma.mediaEngagementEvent.count({
            where: {
              mediaAssetId: { in: assetIds },
              eventType: MediaEngagementEventType.COMPLETE,
            },
          })
        : Promise.resolve(0),
      this.prisma.fanCampaignActionCompletion.count({
        where: {
          campaignAction: { campaignId, actionType: CampaignActionType.CLICK_CTA },
        },
      }),
      this.prisma.walletTransaction.count({
        where: { transactionType: 'LINK_WALLET' as never },
      }),
      this.prisma.walletTransaction.count({
        where: { transactionType: 'LINK_WALLET' as never, status: 'SUCCESS' as never },
      }),
    ]);

    return {
      campaignId,
      latestSnapshot,
      liveAggregates: {
        uniqueParticipants,
        completedParticipants,
        actionsCompleted,
        rewardsIssued,
        rewardsRedeemed,
        videoViews,
        videoCompletions,
        ctaClicks,
        walletLinksStarted,
        walletLinksCompleted,
      },
    };
  }

  async recalculateDailySnapshot(
    campaignId: string,
    snapshotDate?: Date,
    actorUserId?: string,
  ) {
    const campaign = await this.prisma.sponsorCampaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException(`Campaign '${campaignId}' not found`);

    const targetDate = snapshotDate ?? new Date();
    const dateOnly = new Date(
      Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
    );

    const mediaAssetIds = await this.prisma.mediaAsset.findMany({
      where: { campaignId },
      select: { id: true },
    });
    const assetIds = mediaAssetIds.map(a => a.id);

    const [
      uniqueParticipants,
      completedParticipants,
      actionsCompleted,
      rewardsIssued,
      rewardsRedeemed,
      videoViews,
      videoCompletions,
      ctaClicks,
      walletLinksStarted,
      walletLinksCompleted,
    ] = await Promise.all([
      this.prisma.fanCampaignParticipation.count({ where: { campaignId } }),
      this.prisma.fanCampaignParticipation.count({
        where: { campaignId, status: { in: ['COMPLETED', 'REWARDED'] as never } },
      }),
      this.prisma.fanCampaignActionCompletion.count({
        where: { campaignAction: { campaignId } },
      }),
      this.prisma.fanReward.count({
        where: { campaignId, status: { not: FanRewardStatus.CANCELLED } },
      }),
      this.prisma.fanReward.count({
        where: { campaignId, status: FanRewardStatus.REDEEMED },
      }),
      assetIds.length > 0
        ? this.prisma.mediaEngagementEvent.count({
            where: { mediaAssetId: { in: assetIds }, eventType: MediaEngagementEventType.VIEW },
          })
        : Promise.resolve(0),
      assetIds.length > 0
        ? this.prisma.mediaEngagementEvent.count({
            where: {
              mediaAssetId: { in: assetIds },
              eventType: MediaEngagementEventType.COMPLETE,
            },
          })
        : Promise.resolve(0),
      this.prisma.fanCampaignActionCompletion.count({
        where: {
          campaignAction: { campaignId, actionType: CampaignActionType.CLICK_CTA },
        },
      }),
      this.prisma.walletTransaction.count({
        where: { transactionType: 'LINK_WALLET' as never },
      }),
      this.prisma.walletTransaction.count({
        where: { transactionType: 'LINK_WALLET' as never, status: 'SUCCESS' as never },
      }),
    ]);

    const snapshot = await this.prisma.campaignAnalyticsSnapshot.upsert({
      where: { campaignId_snapshotDate: { campaignId, snapshotDate: dateOnly } },
      create: {
        campaignId,
        snapshotDate: dateOnly,
        uniqueParticipants,
        completedParticipants,
        actionsCompleted,
        rewardsIssued,
        rewardsRedeemed,
        videoViews,
        videoCompletions,
        ctaClicks,
        walletLinksStarted,
        walletLinksCompleted,
      },
      update: {
        uniqueParticipants,
        completedParticipants,
        actionsCompleted,
        rewardsIssued,
        rewardsRedeemed,
        videoViews,
        videoCompletions,
        ctaClicks,
        walletLinksStarted,
        walletLinksCompleted,
      },
    });

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action: 'ANALYTICS_RECALCULATED',
        entityType: 'CampaignAnalyticsSnapshot',
        entityId: snapshot.id,
        route: `POST /admin/campaigns/${campaignId}/analytics/recalculate`,
        metadata: { campaignId, snapshotDate: dateOnly.toISOString() },
      },
    });

    return snapshot;
  }

  async getSponsorAnalytics(sponsorId: string) {
    const campaigns = await this.prisma.sponsorCampaign.findMany({
      where: { sponsorId },
      select: { id: true },
    });

    const campaignIds = campaigns.map(c => c.id);

    if (campaignIds.length === 0) {
      return {
        sponsorId,
        campaignCount: 0,
        totalUniqueParticipants: 0,
        totalRewardsIssued: 0,
        totalRewardsRedeemed: 0,
        totalVideoViews: 0,
        totalCtaClicks: 0,
      };
    }

    const snapshots = await this.prisma.campaignAnalyticsSnapshot.findMany({
      where: { campaignId: { in: campaignIds } },
      orderBy: [{ campaignId: 'asc' }, { snapshotDate: 'desc' }],
    });

    const latestByCampaign = new Map<string, typeof snapshots[0]>();
    for (const snap of snapshots) {
      if (!latestByCampaign.has(snap.campaignId)) {
        latestByCampaign.set(snap.campaignId, snap);
      }
    }

    const latestSnapshots = Array.from(latestByCampaign.values());

    const totalUniqueParticipants = latestSnapshots.reduce((sum, s) => sum + s.uniqueParticipants, 0);
    const totalRewardsIssued = latestSnapshots.reduce((sum, s) => sum + s.rewardsIssued, 0);
    const totalRewardsRedeemed = latestSnapshots.reduce((sum, s) => sum + s.rewardsRedeemed, 0);
    const totalVideoViews = latestSnapshots.reduce((sum, s) => sum + s.videoViews, 0);
    const totalCtaClicks = latestSnapshots.reduce((sum, s) => sum + s.ctaClicks, 0);

    return {
      sponsorId,
      campaignCount: campaignIds.length,
      totalUniqueParticipants,
      totalRewardsIssued,
      totalRewardsRedeemed,
      totalVideoViews,
      totalCtaClicks,
    };
  }

  async getClubAnalytics(clubId: string) {
    const campaigns = await this.prisma.sponsorCampaign.findMany({
      where: { clubId },
      select: { id: true },
    });

    const campaignIds = campaigns.map(c => c.id);

    if (campaignIds.length === 0) {
      return {
        clubId,
        campaignCount: 0,
        totalUniqueParticipants: 0,
        totalRewardsIssued: 0,
        totalVideoViews: 0,
      };
    }

    const snapshots = await this.prisma.campaignAnalyticsSnapshot.findMany({
      where: { campaignId: { in: campaignIds } },
      orderBy: [{ campaignId: 'asc' }, { snapshotDate: 'desc' }],
    });

    const latestByCampaign = new Map<string, typeof snapshots[0]>();
    for (const snap of snapshots) {
      if (!latestByCampaign.has(snap.campaignId)) {
        latestByCampaign.set(snap.campaignId, snap);
      }
    }

    const latestSnapshots = Array.from(latestByCampaign.values());

    const totalUniqueParticipants = latestSnapshots.reduce((sum, s) => sum + s.uniqueParticipants, 0);
    const totalRewardsIssued = latestSnapshots.reduce((sum, s) => sum + s.rewardsIssued, 0);
    const totalVideoViews = latestSnapshots.reduce((sum, s) => sum + s.videoViews, 0);

    return {
      clubId,
      campaignCount: campaignIds.length,
      totalUniqueParticipants,
      totalRewardsIssued,
      totalVideoViews,
    };
  }
}
