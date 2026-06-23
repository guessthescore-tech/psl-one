/**
 * SponsorPortalService
 *
 * PSL_INACTIVE - do not activate PSL season
 * WALLET_SANDBOX_ONLY - no production wallet, no wallet production
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts, no real-money
 * BILLING_INVOICE_ONLY - see ADR-031
 *
 * GAP-27-02: No user-to-sponsor DB FK on User model.
 * Sponsor scoping via sponsorId query param until Sprint 28.
 * GAP-27-03: Audience segmentation PLANNED Sprint 28.
 * GAP-27-04: Asset management PLANNED Sprint 28.
 * GAP-27-07: Billing off-platform (invoice-only per ADR-031).
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDraftDto } from './sponsor-portal.dto';
import { CampaignType } from '@prisma/client';

const SCOPE_PENDING = (label: string) => ({
  scopeStatus: 'API_SCOPE_PENDING',
  reason: `Provide ${label}Id query param. GAP-27-02: No user-sponsor FK.`,
});

@Injectable()
export class SponsorPortalService {
  constructor(private readonly prisma: PrismaService) {}

  async getSponsorOverview(sponsorId?: string) {
    if (!sponsorId) return SCOPE_PENDING('sponsor');

    const sponsor = await this.prisma.sponsor.findFirst({ where: { id: sponsorId } });
    const campaignCount = await this.prisma.sponsorCampaign.count({ where: { sponsorId } });
    const rewardCount = await this.prisma.rewardDefinition.count({ where: { sponsorId } });

    return { sponsor, campaignCount, rewardCount };
  }

  async getSponsorProfile(sponsorId?: string) {
    if (!sponsorId) return SCOPE_PENDING('sponsor');

    return this.prisma.sponsor.findFirst({ where: { id: sponsorId } });
  }

  async getSponsorCampaigns(sponsorId?: string) {
    if (!sponsorId) return SCOPE_PENDING('sponsor');

    return this.prisma.sponsorCampaign.findMany({
      where: { sponsorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCampaignDraft(dto: CreateCampaignDraftDto, sponsorId?: string, _userId?: string) {
    if (!sponsorId) return SCOPE_PENDING('sponsor');

    // Map campaignType string to CampaignType enum (default to OTHER)
    const typeMap: Record<string, CampaignType> = {
      prediction: CampaignType.PREDICTION,
      quiz: CampaignType.QUIZ,
      poll: CampaignType.POLL,
      watch_and_win: CampaignType.WATCH_AND_WIN,
      sponsor_offer: CampaignType.SPONSOR_OFFER,
    };
    const resolvedType =
      typeMap[dto.campaignType?.toLowerCase() ?? ''] ?? CampaignType.OTHER;

    const slug = `${dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    return this.prisma.sponsorCampaign.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description ?? '',
        sponsorId,
        clubId: dto.clubIds?.[0] ?? null,
        campaignType: resolvedType,
        status: 'DRAFT',
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  getSponsorAudiences(_sponsorId?: string) {
    return {
      audienceStatus: 'PLANNED',
      message: 'Audience segmentation planned Sprint 28',
      segments: [],
    };
  }

  async getSponsorActivations(sponsorId?: string) {
    if (!sponsorId) return SCOPE_PENDING('sponsor');

    // Get analytics snapshots for this sponsor's campaigns
    const campaigns = await this.prisma.sponsorCampaign.findMany({
      where: { sponsorId },
      select: { id: true },
    });

    const campaignIds = campaigns.map((c) => c.id);
    if (campaignIds.length === 0) return [];

    return this.prisma.campaignAnalyticsSnapshot.findMany({
      where: { campaignId: { in: campaignIds } },
      orderBy: { snapshotDate: 'desc' },
      take: 50,
    });
  }

  async getSponsorRewards(sponsorId?: string) {
    if (!sponsorId) return SCOPE_PENDING('sponsor');

    const rewards = await this.prisma.rewardDefinition.findMany({
      where: { sponsorId },
      orderBy: { createdAt: 'desc' },
    });

    // SPONSOR_REWARDS_NON_FINANCIAL: enforce isFinancial false on every reward
    return rewards.map((r) => ({ ...r, isFinancial: false }));
  }

  async getSponsorAnalytics(sponsorId?: string) {
    if (!sponsorId) return SCOPE_PENDING('sponsor');

    const campaigns = await this.prisma.sponsorCampaign.findMany({
      where: { sponsorId },
      select: { id: true },
    });

    const campaignIds = campaigns.map((c) => c.id);
    if (campaignIds.length === 0) {
      return { totalImpressions: 0, totalEngagements: 0, totalRewardsIssued: 0, campaignCount: 0 };
    }

    const snapshots = await this.prisma.campaignAnalyticsSnapshot.findMany({
      where: { campaignId: { in: campaignIds } },
    });

    const totals = snapshots.reduce(
      (acc, s) => ({
        totalImpressions: acc.totalImpressions + s.impressions,
        totalEngagements: acc.totalEngagements + s.uniqueParticipants,
        totalRewardsIssued: acc.totalRewardsIssued + s.rewardsIssued,
      }),
      { totalImpressions: 0, totalEngagements: 0, totalRewardsIssued: 0 },
    );

    return { ...totals, campaignCount: campaigns.length };
  }

  async getSponsorClubs(sponsorId?: string) {
    if (!sponsorId) return SCOPE_PENDING('sponsor');

    const campaigns = await this.prisma.sponsorCampaign.findMany({
      where: { sponsorId, clubId: { not: null } },
      select: { clubId: true },
      distinct: ['clubId'],
    });

    const clubIds = campaigns.map((c) => c.clubId).filter(Boolean) as string[];
    if (clubIds.length === 0) return [];

    return this.prisma.team.findMany({ where: { id: { in: clubIds } } });
  }

  getSponsorAssets(_sponsorId?: string) {
    return {
      assetsStatus: 'PLANNED',
      message: 'Asset management planned Sprint 28',
      assets: [],
    };
  }

  getBillingPlaceholder() {
    // ADR-031: INVOICE_ONLY — No payment processing. No wallet production.
    // Sponsor billing is off-platform. No real-money.
    return {
      billingStatus: 'INVOICE_ONLY',
      message: 'No payment processing. Invoice-only. See ADR-031.',
      adr: 'ADR-031',
      isFinancial: false,
      paymentProvider: null,
    };
  }
}
