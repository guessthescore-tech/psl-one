import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ClubContentStatus,
  ClubProfileStatus,
  FixtureStatus,
  SeasonTeamSource,
  SeasonTeamStatus,
  ShopProductStatus,
  SquadRegistrationStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AssignPlayerDto } from './dto/assign-player.dto';
import { CreateSeasonTeamDto } from './dto/create-season-team.dto';
import {
  UpdateFixtureAssignmentStatusDto,
  UpdateFixtureGameweekDto,
  UpdateFixtureTeamsDto,
  UpdateFixtureVenueDto,
} from './dto/update-fixture-assignment.dto';
import { UpdatePlayerAssignmentDto } from './dto/update-player-assignment.dto';
import { UpdateSeasonTeamDto } from './dto/update-season-team.dto';

@Injectable()
export class ClubAdminService {
  constructor(private prisma: PrismaService) {}

  // ---------- Season Team Management ----------

  async getSeasonTeams(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);
    return this.prisma.seasonTeam.findMany({
      where: { seasonId },
      include: {
        team: {
          select: { id: true, name: true, slug: true, shortName: true, logoUrl: true },
        },
      },
      orderBy: { team: { name: 'asc' } },
    });
  }

  async addTeamToSeason(seasonId: string, dto: CreateSeasonTeamDto) {
    const [season, team] = await Promise.all([
      this.prisma.season.findUnique({ where: { id: seasonId } }),
      this.prisma.team.findUnique({ where: { id: dto.teamId } }),
    ]);
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);
    if (!team) throw new NotFoundException(`Team '${dto.teamId}' not found`);

    const existing = await this.prisma.seasonTeam.findUnique({
      where: { seasonId_teamId: { seasonId, teamId: dto.teamId } },
    });
    if (existing) {
      throw new BadRequestException(`Team '${team.name}' is already registered for this season`);
    }

    return this.prisma.seasonTeam.create({
      data: {
        seasonId,
        teamId: dto.teamId,
        status: dto.status ?? SeasonTeamStatus.PROVISIONAL,
        source: dto.source ?? SeasonTeamSource.MANUAL,
      },
      include: { team: { select: { id: true, name: true, slug: true } } },
    });
  }

  async updateSeasonTeamStatus(seasonId: string, teamId: string, dto: UpdateSeasonTeamDto) {
    const record = await this.prisma.seasonTeam.findUnique({
      where: { seasonId_teamId: { seasonId, teamId } },
    });
    if (!record) throw new NotFoundException(`Team '${teamId}' not found in season '${seasonId}'`);
    return this.prisma.seasonTeam.update({
      where: { seasonId_teamId: { seasonId, teamId } },
      data: { ...(dto.status !== undefined && { status: dto.status }), ...(dto.source !== undefined && { source: dto.source }) },
      include: { team: { select: { id: true, name: true, slug: true } } },
    });
  }

  async removeTeamFromSeason(seasonId: string, teamId: string) {
    const record = await this.prisma.seasonTeam.findUnique({
      where: { seasonId_teamId: { seasonId, teamId } },
    });
    if (!record) throw new NotFoundException(`Team '${teamId}' not found in season '${seasonId}'`);
    await this.prisma.seasonTeam.delete({
      where: { seasonId_teamId: { seasonId, teamId } },
    });
    return { removed: true, seasonId, teamId };
  }

  async validateSeasonParticipation(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const teams = await this.prisma.seasonTeam.findMany({
      where: { seasonId },
      include: { team: { select: { id: true, name: true, slug: true } } },
    });

    const active = teams.filter((t) => t.status === SeasonTeamStatus.ACTIVE);
    const provisional = teams.filter((t) => t.status === SeasonTeamStatus.PROVISIONAL);
    const issues: string[] = [];

    if (active.length < 16) {
      issues.push(`Only ${active.length} active teams (PSL requires 16)`);
    }
    if (provisional.length > 0) {
      issues.push(`${provisional.length} team(s) still provisional: ${provisional.map((t) => t.team.name).join(', ')}`);
    }

    return {
      seasonId,
      seasonName: season.name,
      totalTeams: teams.length,
      activeTeams: active.length,
      provisionalTeams: provisional.length,
      issues,
      readiness: issues.length === 0 ? 'READY' : 'NOT_READY',
    };
  }

  // ---------- Player Assignment ----------

  async getClubPlayers(teamId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException(`Team '${teamId}' not found`);
    return this.prisma.player.findMany({
      where: { teamId },
      select: {
        id: true, name: true, position: true, number: true,
        nationality: true, dateOfBirth: true,
      },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
    });
  }

  async getUnassignedPlayers(seasonId?: string) {
    if (seasonId) {
      const registered = await this.prisma.seasonSquadRegistration.findMany({
        where: { seasonId, status: { not: SquadRegistrationStatus.REMOVED } },
        select: { playerId: true },
      });
      const registeredIds = registered.map((r) => r.playerId);
      return this.prisma.player.findMany({
        where: registeredIds.length > 0 ? { id: { notIn: registeredIds } } : {},
        select: { id: true, name: true, position: true, nationality: true, team: { select: { id: true, name: true } } },
        orderBy: { name: 'asc' },
        take: 100,
      });
    }
    return this.prisma.player.findMany({
      where: { seasonRegistrations: { none: {} } },
      select: { id: true, name: true, position: true, nationality: true, team: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
      take: 100,
    });
  }

  async assignPlayerToClub(teamId: string, seasonId: string, dto: AssignPlayerDto) {
    const [team, season, player] = await Promise.all([
      this.prisma.team.findUnique({ where: { id: teamId } }),
      this.prisma.season.findUnique({ where: { id: seasonId } }),
      this.prisma.player.findUnique({ where: { id: dto.playerId } }),
    ]);
    if (!team) throw new NotFoundException(`Team '${teamId}' not found`);
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);
    if (!player) throw new NotFoundException(`Player '${dto.playerId}' not found`);

    const existing = await this.prisma.seasonSquadRegistration.findUnique({
      where: { seasonId_playerId: { seasonId, playerId: dto.playerId } },
    });
    if (existing) {
      throw new BadRequestException(`Player '${player.name}' already has a season registration`);
    }

    const [registration] = await this.prisma.$transaction([
      this.prisma.seasonSquadRegistration.create({
        data: {
          seasonId,
          teamId,
          playerId: dto.playerId,
          status: dto.status ?? SquadRegistrationStatus.PROVISIONAL,
          ...(dto.shirtNumber !== undefined ? { shirtNumber: dto.shirtNumber } : {}),
          ...(dto.source !== undefined ? { source: dto.source } : {}),
        },
      }),
      this.prisma.player.update({
        where: { id: dto.playerId },
        data: { teamId },
      }),
    ]);
    return registration;
  }

  async updatePlayerAssignment(teamId: string, seasonId: string, playerId: string, dto: UpdatePlayerAssignmentDto) {
    const reg = await this.prisma.seasonSquadRegistration.findUnique({
      where: { seasonId_playerId: { seasonId, playerId } },
    });
    if (!reg || reg.teamId !== teamId) {
      throw new NotFoundException(`Player registration not found for team '${teamId}'`);
    }
    return this.prisma.seasonSquadRegistration.update({
      where: { seasonId_playerId: { seasonId, playerId } },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.shirtNumber !== undefined && { shirtNumber: dto.shirtNumber }),
        ...(dto.source !== undefined && { source: dto.source }),
      },
    });
  }

  async movePlayerToClub(playerId: string, fromTeamId: string, toTeamId: string, seasonId: string) {
    const [player, toTeam] = await Promise.all([
      this.prisma.player.findUnique({ where: { id: playerId } }),
      this.prisma.team.findUnique({ where: { id: toTeamId } }),
    ]);
    if (!player) throw new NotFoundException(`Player '${playerId}' not found`);
    if (!toTeam) throw new NotFoundException(`Team '${toTeamId}' not found`);
    if (player.teamId !== fromTeamId) {
      throw new BadRequestException(`Player '${playerId}' does not belong to team '${fromTeamId}'`);
    }

    await this.prisma.$transaction([
      this.prisma.player.update({ where: { id: playerId }, data: { teamId: toTeamId } }),
      this.prisma.seasonSquadRegistration.updateMany({
        where: { playerId, seasonId, teamId: fromTeamId },
        data: { teamId: toTeamId, status: SquadRegistrationStatus.NEEDS_REVIEW },
      }),
    ]);
    return { playerId, fromTeamId, toTeamId, seasonId, moved: true };
  }

  async removePlayerFromClub(teamId: string, seasonId: string, playerId: string) {
    const reg = await this.prisma.seasonSquadRegistration.findUnique({
      where: { seasonId_playerId: { seasonId, playerId } },
    });
    if (!reg || reg.teamId !== teamId) {
      throw new NotFoundException(`Player registration not found for team '${teamId}'`);
    }
    await this.prisma.seasonSquadRegistration.update({
      where: { seasonId_playerId: { seasonId, playerId } },
      data: { status: SquadRegistrationStatus.REMOVED, removedAt: new Date() },
    });
    return { removed: true, playerId, teamId, seasonId };
  }

  async validateSquadCompleteness(teamId: string, seasonId: string) {
    const [team, registrations] = await Promise.all([
      this.prisma.team.findUnique({ where: { id: teamId } }),
      this.prisma.seasonSquadRegistration.findMany({
        where: { teamId, seasonId, status: { not: SquadRegistrationStatus.REMOVED } },
        include: {
          player: { select: { id: true, name: true, position: true } },
        },
      }),
    ]);
    if (!team) throw new NotFoundException(`Team '${teamId}' not found`);

    const byPosition: Record<string, number> = {
      GOALKEEPER: 0, DEFENDER: 0, MIDFIELDER: 0, FORWARD: 0,
    };
    for (const reg of registrations) {
      const pos = reg.player.position as string;
      if (pos in byPosition) byPosition[pos] = (byPosition[pos] ?? 0) + 1;
    }

    const issues: string[] = [];
    if ((byPosition['GOALKEEPER'] ?? 0) < 2) issues.push('Fewer than 2 goalkeepers');
    if ((byPosition['DEFENDER'] ?? 0) < 4) issues.push('Fewer than 4 defenders');
    if ((byPosition['MIDFIELDER'] ?? 0) < 4) issues.push('Fewer than 4 midfielders');
    if ((byPosition['FORWARD'] ?? 0) < 2) issues.push('Fewer than 2 forwards');
    if (registrations.length < 22) issues.push(`Only ${registrations.length} registered players (minimum 22)`);

    return {
      teamId,
      teamName: team.name,
      seasonId,
      totalRegistered: registrations.length,
      byPosition,
      issues,
      readiness: issues.length === 0 ? 'READY' : 'NOT_READY',
    };
  }

  // ---------- Fixture Assignment ----------

  async getClubFixturesForAdmin(teamId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException(`Team '${teamId}' not found`);
    return this.prisma.fixture.findMany({
      where: { OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }] },
      include: {
        homeTeam: { select: { id: true, name: true, slug: true } },
        awayTeam: { select: { id: true, name: true, slug: true } },
        venue: { select: { id: true, name: true, city: true } },
        gameweek: { select: { id: true, name: true, transferDeadlineAt: true } },
      },
      orderBy: { kickoffAt: 'asc' },
    });
  }

  async getUnassignedFixtures() {
    return this.prisma.fixture.findMany({
      where: {
        OR: [{ gameweekId: null }, { assignmentStatus: 'UNASSIGNED' }],
        status: FixtureStatus.SCHEDULED,
      },
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        gameweek: { select: { id: true, name: true } },
      },
      orderBy: { kickoffAt: 'asc' },
    });
  }

  async assignFixtureTeams(fixtureId: string, dto: UpdateFixtureTeamsDto) {
    const fixture = await this.prisma.fixture.findUnique({ where: { id: fixtureId } });
    if (!fixture) throw new NotFoundException(`Fixture '${fixtureId}' not found`);
    return this.prisma.fixture.update({
      where: { id: fixtureId },
      data: {
        ...(dto.homeTeamId !== undefined && { homeTeamId: dto.homeTeamId }),
        ...(dto.awayTeamId !== undefined && { awayTeamId: dto.awayTeamId }),
      },
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
      },
    });
  }

  async assignFixtureVenue(fixtureId: string, dto: UpdateFixtureVenueDto) {
    const [fixture, venue] = await Promise.all([
      this.prisma.fixture.findUnique({ where: { id: fixtureId } }),
      this.prisma.venue.findUnique({ where: { id: dto.venueId } }),
    ]);
    if (!fixture) throw new NotFoundException(`Fixture '${fixtureId}' not found`);
    if (!venue) throw new NotFoundException(`Venue '${dto.venueId}' not found`);
    return this.prisma.fixture.update({
      where: { id: fixtureId },
      data: { venueId: dto.venueId },
      include: { venue: { select: { id: true, name: true, city: true } } },
    });
  }

  async assignFixtureGameweek(fixtureId: string, dto: UpdateFixtureGameweekDto) {
    const [fixture, gameweek] = await Promise.all([
      this.prisma.fixture.findUnique({ where: { id: fixtureId } }),
      this.prisma.gameweek.findUnique({ where: { id: dto.gameweekId } }),
    ]);
    if (!fixture) throw new NotFoundException(`Fixture '${fixtureId}' not found`);
    if (!gameweek) throw new NotFoundException(`Gameweek '${dto.gameweekId}' not found`);
    return this.prisma.fixture.update({
      where: { id: fixtureId },
      data: { gameweekId: dto.gameweekId },
      include: { gameweek: { select: { id: true, name: true } } },
    });
  }

  async updateFixtureAssignmentStatus(fixtureId: string, dto: UpdateFixtureAssignmentStatusDto) {
    const fixture = await this.prisma.fixture.findUnique({ where: { id: fixtureId } });
    if (!fixture) throw new NotFoundException(`Fixture '${fixtureId}' not found`);
    const valid = Object.values(FixtureStatus) as string[];
    if (!valid.includes(dto.assignmentStatus)) {
      throw new BadRequestException(`Invalid status '${dto.assignmentStatus}'. Must be one of: ${valid.join(', ')}`);
    }
    return this.prisma.fixture.update({
      where: { id: fixtureId },
      data: { status: dto.assignmentStatus as FixtureStatus },
    });
  }

  async validateFixtureReadiness(seasonId: string) {
    const season = await this.prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const fixtures = await this.prisma.fixture.findMany({
      where: { gameweek: { seasonId } },
      select: {
        id: true, status: true, kickoffAt: true,
        homeTeamId: true, awayTeamId: true,
        venueId: true, gameweekId: true,
      },
    });

    const issues: string[] = [];
    const missingTeam = fixtures.filter((f) => !f.homeTeamId || !f.awayTeamId);
    const missingVenue = fixtures.filter((f) => !f.venueId);
    const missingGameweek = fixtures.filter((f) => !f.gameweekId);

    if (missingTeam.length > 0) issues.push(`${missingTeam.length} fixture(s) missing team assignment`);
    if (missingVenue.length > 0) issues.push(`${missingVenue.length} fixture(s) missing venue`);
    if (missingGameweek.length > 0) issues.push(`${missingGameweek.length} fixture(s) missing gameweek`);
    if (fixtures.length === 0) issues.push('No fixtures found for this season');

    return {
      seasonId,
      seasonName: season.name,
      totalFixtures: fixtures.length,
      missingTeamAssignment: missingTeam.length,
      missingVenue: missingVenue.length,
      missingGameweek: missingGameweek.length,
      issues,
      readiness: issues.length === 0 ? 'READY' : 'NOT_READY',
    };
  }

  // ---------- Admin Club Readiness ----------

  async getAdminClubList() {
    return this.prisma.team.findMany({
      include: {
        clubProfile: { select: { profileStatus: true, primaryColor: true, secondaryColor: true } },
        experienceStatus: { select: { profileReady: true, squadReady: true, shopfrontReady: true, catalogueReady: true, fixturesReady: true, venueReady: true, ticketsReady: true } },
        _count: { select: { players: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getAdminClubDetail(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        clubProfile: true,
        experienceStatus: true,
        _count: { select: { players: true, contentItems: true, shopProducts: true } },
      },
    });
    if (!team) throw new NotFoundException(`Team '${teamId}' not found`);
    return team;
  }

  async getAdminClubExperience(teamId: string) {
    const status = await this.prisma.clubExperienceStatus.findUnique({ where: { teamId } });
    if (!status) throw new NotFoundException(`Experience status not found for team '${teamId}'`);
    return status;
  }

  async getClubReadiness() {
    const teams = await this.prisma.team.findMany({
      include: {
        experienceStatus: true,
        clubProfile: { select: { profileStatus: true } },
        _count: { select: { players: true, contentItems: true, shopProducts: true } },
      },
      orderBy: { name: 'asc' },
    });

    const summary = teams.map((t) => {
      const exp = t.experienceStatus;
      const isReady = !!(exp?.profileReady && exp?.squadReady && exp?.fixturesReady && exp?.shopfrontReady);
      const isStarted = !!(exp);
      return {
        teamId: t.id,
        name: t.name,
        slug: t.slug,
        profileStatus: t.clubProfile?.profileStatus ?? ClubProfileStatus.DRAFT,
        overallReadiness: isReady ? 'READY' : isStarted ? 'IN_PROGRESS' : 'NOT_STARTED',
        profileReady: exp?.profileReady ?? false,
        squadReady: exp?.squadReady ?? false,
        shopfrontReady: exp?.shopfrontReady ?? false,
        catalogueReady: exp?.catalogueReady ?? false,
        fixturesReady: exp?.fixturesReady ?? false,
        venueReady: exp?.venueReady ?? false,
        ticketsReady: exp?.ticketsReady ?? false,
        playerCount: t._count.players,
        contentCount: t._count.contentItems,
        productCount: t._count.shopProducts,
      };
    });

    const ready = summary.filter((t) => t.overallReadiness === 'READY').length;
    const notStarted = summary.filter((t) => t.overallReadiness === 'NOT_STARTED').length;

    return {
      totalClubs: teams.length,
      readyCount: ready,
      notStartedCount: notStarted,
      clubs: summary,
    };
  }

  async validateClubDataQuality(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        clubProfile: true,
        players: { select: { id: true, name: true, position: true, number: true } },
        contentItems: { where: { status: ClubContentStatus.PUBLISHED }, select: { id: true } },
        shopProducts: { where: { status: ShopProductStatus.PUBLISHED }, select: { id: true } },
      },
    });
    if (!team) throw new NotFoundException(`Team '${teamId}' not found`);

    const issues: string[] = [];
    if (!team.logoUrl) issues.push('Missing club logo');
    if (!team.shortName) issues.push('Missing short name');
    if (!team.clubProfile) issues.push('No club profile created');
    if (team.clubProfile?.profileStatus === ClubProfileStatus.DRAFT) issues.push('Club profile is still in DRAFT status');
    if (!team.clubProfile?.primaryColor) issues.push('Missing primary colour');
    if (!team.clubProfile?.websiteUrl && !team.clubProfile?.description) issues.push('Club profile missing description or website');
    if (team.players.length < 11) issues.push(`Only ${team.players.length} players assigned (minimum 11 for selection)`);
    if (team.contentItems.length === 0) issues.push('No published content items');

    const profileReady = issues.filter((i) => i.includes('profile') || i.includes('logo') || i.includes('colour') || i.includes('name')).length === 0;
    const squadReady = team.players.length >= 11;
    const shopfrontReady = team.shopProducts.length > 0;
    const catalogueReady = team.contentItems.length > 0;

    await this.prisma.clubExperienceStatus.upsert({
      where: { teamId },
      create: {
        teamId,
        profileReady,
        squadReady,
        shopfrontReady,
        catalogueReady,
        fixturesReady: false,
        venueReady: false,
        lastReviewedAt: new Date(),
        reviewNotes: issues.length > 0 ? issues.join('; ') : null,
      },
      update: {
        profileReady,
        squadReady,
        shopfrontReady,
        catalogueReady,
        venueReady: false,
        lastReviewedAt: new Date(),
        reviewNotes: issues.length > 0 ? issues.join('; ') : null,
      },
    });

    return {
      teamId,
      name: team.name,
      issues,
      readiness: issues.length === 0 ? 'READY' : 'NOT_READY',
    };
  }

  async getAdminClubShopReadiness(teamId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new NotFoundException(`Team '${teamId}' not found`);

    const products = await this.prisma.clubShopProduct.findMany({
      where: { teamId },
      select: { id: true, name: true, status: true, category: true, featured: true, priceDisplay: true, currencyCode: true, imageUrl: true },
      orderBy: [{ featured: 'desc' }, { category: 'asc' }],
    });

    const published = products.filter((p) => p.status === ShopProductStatus.PUBLISHED);
    const issues: string[] = [];
    if (published.length === 0) issues.push('No published products in shop');
    if (products.filter((p) => p.featured).length === 0) issues.push('No featured product set');
    if (products.filter((p) => !p.imageUrl).length > 0) issues.push('Some products missing images');

    return {
      teamId,
      name: team.name,
      totalProducts: products.length,
      publishedProducts: published.length,
      products,
      issues,
      commerceStatus: 'CATALOGUE_ONLY',
      checkoutEnabled: false,
      readiness: issues.length === 0 ? 'READY' : 'NOT_READY',
    };
  }

  async validateShopfrontReadiness(teamId: string) {
    return this.getAdminClubShopReadiness(teamId);
  }
}
