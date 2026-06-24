/**
 * ClubPortalService — Sprint 28
 *
 * PSL_INACTIVE - do not activate PSL season
 * WALLET_SANDBOX_ONLY - no production wallet
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_REAL_MONEY
 *
 * Sprint 28: GAP-27-01 RESOLVED — DB-backed club scoping via ClubMembership table.
 * CLUB_ADMIN scope derives from active ClubMembership (not query param alone).
 * PSL_ADMIN must provide explicit teamId param.
 * Cross-club access denied with CROSS_CLUB_ACCESS_DENIED (403).
 */

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PortalScopeService } from '../portal-scope/portal-scope.service';
import { ContentSubmissionDto } from './club-portal.dto';
import { ClubContentType } from '@prisma/client';

@Injectable()
export class ClubPortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly portalScopeService: PortalScopeService,
  ) {}

  /**
   * Resolve club scope from DB membership.
   * Throws appropriate HTTP exception on denial.
   */
  private async resolveScope(
    userId: string,
    role: string,
    requestedTeamId?: string,
  ): Promise<string> {
    const result = await this.portalScopeService.resolveClubScope(userId, role, requestedTeamId);
    if (!result.allowed) {
      if (result.statusCode === 400) throw new BadRequestException(result.reason);
      if (result.statusCode === 404) throw new NotFoundException(result.reason);
      throw new ForbiddenException(result.reason);
    }
    if (result.scopeType !== 'club') {
      throw new ForbiddenException('Expected club scope');
    }
    return result.teamId;
  }

  async getClubOverview(userId: string, role: string, requestedTeamId?: string) {
    const teamId = await this.resolveScope(userId, role, requestedTeamId);

    const team = await this.prisma.team.findFirst({
      where: { id: teamId },
      include: { clubProfile: true },
    });

    const playerCount = await this.prisma.player.count({ where: { teamId } });

    const recentFixtures = await this.prisma.fixture.findMany({
      where: { OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
      orderBy: { kickoffAt: 'desc' },
      take: 3,
    });

    return { team, playerCount, recentFixtures };
  }

  async getClubProfile(userId: string, role: string, requestedTeamId?: string) {
    const teamId = await this.resolveScope(userId, role, requestedTeamId);

    return this.prisma.team.findFirst({
      where: { id: teamId },
      include: { clubProfile: true },
    });
  }

  async getClubSquad(userId: string, role: string, requestedTeamId?: string) {
    const teamId = await this.resolveScope(userId, role, requestedTeamId);

    return this.prisma.player.findMany({
      where: { teamId },
      orderBy: { name: 'asc' },
    });
  }

  async getClubFixtures(userId: string, role: string, requestedTeamId?: string) {
    const teamId = await this.resolveScope(userId, role, requestedTeamId);

    return this.prisma.fixture.findMany({
      where: { OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
      orderBy: { kickoffAt: 'desc' },
      take: 20,
    });
  }

  getClubFans(_teamId?: string) {
    return {
      fanCount: 0,
      fans: [],
      note: 'Fan-club association future feature (post-Sprint 28)',
    };
  }

  async getClubAnalytics(userId: string, role: string, requestedTeamId?: string) {
    const teamId = await this.resolveScope(userId, role, requestedTeamId);

    const [playerCount, fixtureCount, contentCount] = await Promise.all([
      this.prisma.player.count({ where: { teamId } }),
      this.prisma.fixture.count({
        where: { OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
      }),
      this.prisma.clubContentItem.count({ where: { teamId } }),
    ]);

    return { playerCount, fixtureCount, contentCount };
  }

  async getClubCampaigns(userId: string, role: string, requestedTeamId?: string) {
    const teamId = await this.resolveScope(userId, role, requestedTeamId);

    return this.prisma.sponsorCampaign.findMany({
      where: { clubId: teamId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getClubSponsors(userId: string, role: string, requestedTeamId?: string) {
    const teamId = await this.resolveScope(userId, role, requestedTeamId);

    const campaigns = await this.prisma.sponsorCampaign.findMany({
      where: { clubId: teamId, sponsorId: { not: null } },
      select: { sponsorId: true },
      distinct: ['sponsorId'],
    });

    const sponsorIds = campaigns.map((c) => c.sponsorId).filter(Boolean) as string[];

    if (sponsorIds.length === 0) return [];

    return this.prisma.sponsor.findMany({
      where: { id: { in: sponsorIds } },
    });
  }

  async getClubContent(userId: string, role: string, requestedTeamId?: string) {
    const teamId = await this.resolveScope(userId, role, requestedTeamId);

    return this.prisma.clubContentItem.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitContent(
    dto: ContentSubmissionDto,
    userId: string,
    role: string,
    requestedTeamId?: string,
  ) {
    const teamId = await this.resolveScope(userId, role, requestedTeamId);

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
        teamId,
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
