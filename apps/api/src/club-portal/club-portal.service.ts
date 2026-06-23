/**
 * ClubPortalService
 *
 * PSL_INACTIVE - do not activate PSL season
 * WALLET_SANDBOX_ONLY - no production wallet
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_REAL_MONEY
 *
 * GAP-27-01: No user-to-club DB FK on User model.
 * Club scoping via clubId query param until Sprint 28 user-club association.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContentSubmissionDto } from './club-portal.dto';
import { ClubContentType } from '@prisma/client';

const SCOPE_PENDING = {
  scopeStatus: 'API_SCOPE_PENDING',
  reason: 'Provide clubId query param. GAP-27-01: No user-club FK.',
};

@Injectable()
export class ClubPortalService {
  constructor(private readonly prisma: PrismaService) {}

  async getClubOverview(clubId?: string) {
    if (!clubId) return SCOPE_PENDING;

    const team = await this.prisma.team.findFirst({
      where: { id: clubId },
      include: { clubProfile: true },
    });

    const playerCount = await this.prisma.player.count({ where: { teamId: clubId } });

    const recentFixtures = await this.prisma.fixture.findMany({
      where: { OR: [{ homeTeamId: clubId }, { awayTeamId: clubId }] },
      orderBy: { kickoffAt: 'desc' },
      take: 3,
    });

    return { team, playerCount, recentFixtures };
  }

  async getClubProfile(clubId?: string) {
    if (!clubId) return SCOPE_PENDING;

    return this.prisma.team.findFirst({
      where: { id: clubId },
      include: { clubProfile: true },
    });
  }

  async getClubSquad(clubId?: string) {
    if (!clubId) return SCOPE_PENDING;

    const players = await this.prisma.player.findMany({
      where: { teamId: clubId },
      orderBy: { name: 'asc' },
    });

    return players;
  }

  async getClubFixtures(clubId?: string) {
    if (!clubId) return SCOPE_PENDING;

    return this.prisma.fixture.findMany({
      where: { OR: [{ homeTeamId: clubId }, { awayTeamId: clubId }] },
      orderBy: { kickoffAt: 'desc' },
      take: 20,
    });
  }

  getClubFans(_clubId?: string) {
    return {
      fanCount: 0,
      fans: [],
      note: 'Fan-club association pending Sprint 28 (GAP-27-01)',
    };
  }

  async getClubAnalytics(clubId?: string) {
    if (!clubId) return SCOPE_PENDING;

    const [playerCount, fixtureCount, contentCount] = await Promise.all([
      this.prisma.player.count({ where: { teamId: clubId } }),
      this.prisma.fixture.count({
        where: { OR: [{ homeTeamId: clubId }, { awayTeamId: clubId }] },
      }),
      this.prisma.clubContentItem.count({ where: { teamId: clubId } }),
    ]);

    return { playerCount, fixtureCount, contentCount };
  }

  async getClubCampaigns(clubId?: string) {
    if (!clubId) return SCOPE_PENDING;

    return this.prisma.sponsorCampaign.findMany({
      where: { clubId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getClubSponsors(clubId?: string) {
    if (!clubId) return SCOPE_PENDING;

    const campaigns = await this.prisma.sponsorCampaign.findMany({
      where: { clubId, sponsorId: { not: null } },
      select: { sponsorId: true },
      distinct: ['sponsorId'],
    });

    const sponsorIds = campaigns.map((c) => c.sponsorId).filter(Boolean) as string[];

    if (sponsorIds.length === 0) return [];

    return this.prisma.sponsor.findMany({
      where: { id: { in: sponsorIds } },
    });
  }

  async getClubContent(clubId?: string) {
    if (!clubId) return SCOPE_PENDING;

    return this.prisma.clubContentItem.findMany({
      where: { teamId: clubId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitContent(dto: ContentSubmissionDto, clubId?: string, userId?: string) {
    if (!clubId) return SCOPE_PENDING;

    // Map contentType string to ClubContentType enum (default to NEWS if unknown)
    const typeMap: Record<string, ClubContentType> = {
      news: ClubContentType.NEWS,
      article: ClubContentType.NEWS,
      video: ClubContentType.VIDEO,
      announcement: ClubContentType.ANNOUNCEMENT,
    };
    const resolvedType = typeMap[dto.contentType?.toLowerCase()] ?? ClubContentType.NEWS;

    return this.prisma.clubContentItem.create({
      data: {
        teamId: clubId,
        title: dto.title,
        type: resolvedType,
        summary: dto.body ?? null,
        imageUrl: dto.mediaUrl ?? null,
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
}
