/**
 * SponsorPortalService — Sprint 28
 *
 * PSL_INACTIVE - do not activate PSL season
 * WALLET_SANDBOX_ONLY - no production wallet, no wallet production
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts, no real-money
 * BILLING_INVOICE_ONLY - see ADR-031
 *
 * Sprint 28: GAP-27-02 RESOLVED — DB-backed sponsor scoping via SponsorMembership table.
 * SPONSOR scope derives from active SponsorMembership (not query param alone).
 * PSL_ADMIN must provide explicit sponsorId param.
 * Cross-sponsor access denied with CROSS_SPONSOR_ACCESS_DENIED (403).
 * GAP-27-03: Audience segmentation PLANNED post-Sprint 28.
 * GAP-27-04: Asset management PLANNED post-Sprint 28.
 * GAP-27-07: Billing off-platform (invoice-only per ADR-031).
 */

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PortalScopeService } from '../portal-scope/portal-scope.service';
import { CreateCampaignDraftDto } from './sponsor-portal.dto';
import { CampaignType } from '@prisma/client';

@Injectable()
export class SponsorPortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly portalScopeService: PortalScopeService,
  ) {}

  /**
   * Resolve sponsor scope from DB membership.
   * Throws appropriate HTTP exception on denial.
   */
  private async resolveScope(
    userId: string,
    role: string,
    requestedSponsorId?: string,
  ): Promise<string> {
    const result = await this.portalScopeService.resolveSponsorScope(userId, role, requestedSponsorId);
    if (!result.allowed) {
      if (result.statusCode === 400) throw new BadRequestException(result.reason);
      if (result.statusCode === 404) throw new NotFoundException(result.reason);
      throw new ForbiddenException(result.reason);
    }
    if (result.scopeType !== 'sponsor') {
      throw new ForbiddenException('Expected sponsor scope');
    }
    return result.sponsorId;
  }

  async getSponsorOverview(userId: string, role: string, requestedSponsorId?: string) {
    const sponsorId = await this.resolveScope(userId, role, requestedSponsorId);

    const sponsor = await this.prisma.sponsor.findFirst({ where: { id: sponsorId } });
    const campaignCount = await this.prisma.sponsorCampaign.count({ where: { sponsorId } });
    const rewardCount = await this.prisma.rewardDefinition.count({ where: { sponsorId } });

    return { sponsor, campaignCount, rewardCount };
  }

  async getSponsorProfile(userId: string, role: string, requestedSponsorId?: string) {
    const sponsorId = await this.resolveScope(userId, role, requestedSponsorId);

    return this.prisma.sponsor.findFirst({ where: { id: sponsorId } });
  }

  async getSponsorCampaigns(userId: string, role: string, requestedSponsorId?: string) {
    const sponsorId = await this.resolveScope(userId, role, requestedSponsorId);

    return this.prisma.sponsorCampaign.findMany({
      where: { sponsorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCampaignDraft(
    dto: CreateCampaignDraftDto,
    userId: string,
    role: string,
    requestedSponsorId?: string,
  ) {
    const sponsorId = await this.resolveScope(userId, role, requestedSponsorId);

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
      message: 'Audience segmentation planned post-Sprint 28',
      segments: [],
    };
  }

  async getSponsorActivations(userId: string, role: string, requestedSponsorId?: string) {
    const sponsorId = await this.resolveScope(userId, role, requestedSponsorId);

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

  async getSponsorRewards(userId: string, role: string, requestedSponsorId?: string) {
    const sponsorId = await this.resolveScope(userId, role, requestedSponsorId);

    const rewards = await this.prisma.rewardDefinition.findMany({
      where: { sponsorId },
      orderBy: { createdAt: 'desc' },
    });

    // SPONSOR_REWARDS_NON_FINANCIAL: enforce isFinancial false on every reward
    return rewards.map((r) => ({ ...r, isFinancial: false }));
  }

  async getSponsorAnalytics(userId: string, role: string, requestedSponsorId?: string) {
    const sponsorId = await this.resolveScope(userId, role, requestedSponsorId);

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

  async getSponsorClubs(userId: string, role: string, requestedSponsorId?: string) {
    const sponsorId = await this.resolveScope(userId, role, requestedSponsorId);

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
      message: 'Asset management planned post-Sprint 28',
      assets: [],
    };
  }

  getBillingPlaceholder() {
    // ADR-031: INVOICE_ONLY — No payment processing. No wallet production.
    // Sponsor billing is off-platform. No real-money. Non-financial.
    return {
      billingStatus: 'INVOICE_ONLY',
      message: 'No payment processing. Invoice-only. See ADR-031.',
      adr: 'ADR-031',
      isFinancial: false,
      paymentProvider: null,
    };
  }
}
