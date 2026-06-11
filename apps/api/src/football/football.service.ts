import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FixtureStatus, MatchEventType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FixtureEventPublisher } from './fixture-event.publisher';
import { UpdateFixtureStatusDto } from './dto/update-fixture-status.dto';
import { UpdateFixtureScoreDto } from './dto/update-fixture-score.dto';
import { CreateMatchEventDto } from './dto/create-match-event.dto';
import { CreateLineupDto } from './dto/create-lineup.dto';

const EVENT_INCLUDE = {
  team: { select: { id: true, name: true, slug: true, shortName: true } },
  player: { select: { id: true, name: true, position: true, number: true } },
} as const;

const LINEUP_INCLUDE = {
  team: { select: { id: true, name: true, slug: true, shortName: true } },
  player: { select: { id: true, name: true, position: true, number: true } },
} as const;

@Injectable()
export class FootballService {
  constructor(
    private prisma: PrismaService,
    private publisher: FixtureEventPublisher,
  ) {}

  listCompetitions() {
    return this.prisma.competition.findMany({ orderBy: { name: 'asc' } });
  }

  async getCompetition(slug: string) {
    const competition = await this.prisma.competition.findUnique({
      where: { slug },
      include: {
        seasons: { orderBy: { startDate: 'desc' } },
        stages: { orderBy: { order: 'asc' } },
      },
    });
    if (!competition) throw new NotFoundException(`Competition '${slug}' not found`);
    return competition;
  }

  listSeasons() {
    return this.prisma.season.findMany({
      include: { competition: true },
      orderBy: { startDate: 'desc' },
    });
  }

  listSeasonsByCompetition(competitionSlug: string) {
    return this.prisma.season.findMany({
      where: { competition: { slug: competitionSlug } },
      include: { competition: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async getActiveSeason() {
    const season = await this.prisma.season.findFirst({
      where: { isActive: true },
      include: { competition: true },
    });
    if (!season) throw new NotFoundException('No active season found');
    return season;
  }

  listTeams(filters: { competitionSlug?: string; seasonSlug?: string }) {
    return this.prisma.team.findMany({
      ...(filters.seasonSlug
        ? {
            where: {
              OR: [
                { homeFixtures: { some: { season: { slug: filters.seasonSlug } } } },
                { awayFixtures: { some: { season: { slug: filters.seasonSlug } } } },
              ],
            },
          }
        : {}),
      orderBy: { name: 'asc' },
    });
  }

  async getTeam(slug: string) {
    const team = await this.prisma.team.findUnique({ where: { slug } });
    if (!team) throw new NotFoundException(`Team '${slug}' not found`);
    return team;
  }

  async getTeamPlayers(slug: string) {
    const team = await this.prisma.team.findUnique({
      where: { slug },
      include: { players: { orderBy: [{ position: 'asc' }, { name: 'asc' }] } },
    });
    if (!team) throw new NotFoundException(`Team '${slug}' not found`);
    return team.players;
  }

  listPlayers(filters: { teamSlug?: string }) {
    return this.prisma.player.findMany({
      include: { team: { select: { id: true, name: true, slug: true } } },
      ...(filters.teamSlug ? { where: { team: { slug: filters.teamSlug } } } : {}),
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
    });
  }

  async getPlayer(id: string) {
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: { team: true },
    });
    if (!player) throw new NotFoundException(`Player '${id}' not found`);
    return player;
  }

  listFixtures(filters: {
    competitionSlug?: string;
    seasonSlug?: string;
    teamSlug?: string;
    status?: string;
    group?: string;
  }) {
    return this.prisma.fixture.findMany({
      where: {
        isPublished: true,
        ...(filters.seasonSlug ? { season: { slug: filters.seasonSlug } } : {}),
        ...(filters.status ? { status: filters.status as FixtureStatus } : {}),
        ...(filters.group ? { group: { name: filters.group } } : {}),
        ...(filters.teamSlug
          ? {
              OR: [
                { homeTeam: { slug: filters.teamSlug } },
                { awayTeam: { slug: filters.teamSlug } },
              ],
            }
          : {}),
      },
      include: {
        homeTeam: { select: { id: true, name: true, slug: true, shortName: true } },
        awayTeam: { select: { id: true, name: true, slug: true, shortName: true } },
        venue: true,
        group: true,
        stage: { select: { id: true, name: true, slug: true, type: true, order: true } },
        gameweek: { select: { id: true, name: true, slug: true, round: true, status: true } },
        season: { include: { competition: true } },
      },
      orderBy: { kickoffAt: 'asc' },
    });
  }

  async getFixture(id: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        venue: true,
        group: true,
        stage: { select: { id: true, name: true, slug: true, type: true, order: true } },
        gameweek: { select: { id: true, name: true, slug: true, round: true, status: true } },
        season: { include: { competition: true } },
      },
    });
    if (!fixture) throw new NotFoundException(`Fixture '${id}' not found`);
    return fixture;
  }

  async getFixtureLive(id: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        homeScore: true,
        awayScore: true,
        currentMinute: true,
        period: true,
        lastUpdatedAt: true,
        kickoffAt: true,
        homeTeam: { select: { id: true, name: true, slug: true, shortName: true } },
        awayTeam: { select: { id: true, name: true, slug: true, shortName: true } },
      },
    });
    if (!fixture) throw new NotFoundException(`Fixture '${id}' not found`);
    return fixture;
  }

  async getFixtureEvents(id: string) {
    const exists = await this.prisma.fixture.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException(`Fixture '${id}' not found`);
    return this.prisma.matchEvent.findMany({
      where: { fixtureId: id },
      include: EVENT_INCLUDE,
      orderBy: [{ minute: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async getFixtureLineups(id: string) {
    const exists = await this.prisma.fixture.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException(`Fixture '${id}' not found`);
    return this.prisma.fixtureLineup.findMany({
      where: { fixtureId: id, status: { in: ['STARTING', 'SUBSTITUTE'] } },
      include: LINEUP_INCLUDE,
      orderBy: [{ status: 'asc' }, { shirtNumber: 'asc' }],
    });
  }

  async getFixtureAvailability(id: string) {
    const exists = await this.prisma.fixture.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException(`Fixture '${id}' not found`);
    return this.prisma.fixtureLineup.findMany({
      where: { fixtureId: id },
      include: LINEUP_INCLUDE,
      orderBy: [{ status: 'asc' }, { shirtNumber: 'asc' }],
    });
  }

  async listStandings(filters: {
    competitionSlug?: string;
    seasonSlug?: string;
    group?: string;
  }) {
    const rows = await this.prisma.groupStanding.findMany({
      where: {
        ...(filters.seasonSlug
          ? { group: { season: { slug: filters.seasonSlug } } }
          : {}),
        ...(filters.group ? { group: { name: filters.group } } : {}),
      },
      include: {
        team: { select: { id: true, name: true, slug: true, shortName: true } },
        group: true,
      },
      orderBy: [{ group: { name: 'asc' } }, { points: 'desc' }, { goalsFor: 'desc' }],
    });

    const byGroup = new Map<string, { groupName: string; standings: typeof rows }>();
    for (const row of rows) {
      const key = row.group.name;
      if (!byGroup.has(key)) byGroup.set(key, { groupName: key, standings: [] });
      byGroup.get(key)!.standings.push(row);
    }
    return Array.from(byGroup.values());
  }

  async getMatchCentre(fixtureId: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeTeam: true,
        awayTeam: true,
        venue: true,
        group: true,
        stage: { select: { id: true, name: true, slug: true, type: true, order: true } },
        season: { include: { competition: true } },
        events: {
          include: EVENT_INCLUDE,
          orderBy: [{ minute: 'asc' }, { createdAt: 'asc' }],
        },
        lineups: {
          include: LINEUP_INCLUDE,
          orderBy: [{ status: 'asc' }, { shirtNumber: 'asc' }],
        },
      },
    });
    if (!fixture) throw new NotFoundException(`Fixture '${fixtureId}' not found`);

    return {
      fixture,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      venue: fixture.venue,
      events: fixture.events,
      lineups: fixture.lineups,
    };
  }

  // ── Admin ────────────────────────────────────────────────────────────────────

  async adminUpdateFixtureStatus(id: string, dto: UpdateFixtureStatusDto) {
    const exists = await this.prisma.fixture.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException(`Fixture '${id}' not found`);

    const updated = await this.prisma.fixture.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.currentMinute !== undefined ? { currentMinute: dto.currentMinute } : {}),
        ...(dto.period !== undefined ? { period: dto.period } : {}),
        lastUpdatedAt: new Date(),
      },
      include: {
        homeTeam: { select: { id: true, name: true, slug: true, shortName: true } },
        awayTeam: { select: { id: true, name: true, slug: true, shortName: true } },
      },
    });

    this.publisher.publishFixtureStatusChanged(id, dto.status);
    return updated;
  }

  async adminUpdateFixtureScore(id: string, dto: UpdateFixtureScoreDto) {
    const exists = await this.prisma.fixture.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException(`Fixture '${id}' not found`);

    const updated = await this.prisma.fixture.update({
      where: { id },
      data: {
        homeScore: dto.homeScore,
        awayScore: dto.awayScore,
        ...(dto.currentMinute !== undefined ? { currentMinute: dto.currentMinute } : {}),
        lastUpdatedAt: new Date(),
      },
      include: {
        homeTeam: { select: { id: true, name: true, slug: true, shortName: true } },
        awayTeam: { select: { id: true, name: true, slug: true, shortName: true } },
      },
    });

    this.publisher.publishFixtureScoreChanged(id, dto.homeScore, dto.awayScore);
    return updated;
  }

  async adminCreateMatchEvent(fixtureId: string, dto: CreateMatchEventDto) {
    const exists = await this.prisma.fixture.findUnique({ where: { id: fixtureId }, select: { id: true } });
    if (!exists) throw new NotFoundException(`Fixture '${fixtureId}' not found`);

    if (dto.teamId) {
      const team = await this.prisma.team.findUnique({ where: { id: dto.teamId }, select: { id: true } });
      if (!team) throw new BadRequestException(`teamId '${dto.teamId}' not found`);
    }

    if (dto.playerId) {
      const player = await this.prisma.player.findUnique({ where: { id: dto.playerId }, select: { id: true } });
      if (!player) throw new BadRequestException(`playerId '${dto.playerId}' not found`);
    }

    const event = await this.prisma.matchEvent.create({
      data: {
        fixtureId,
        minute: dto.minute,
        eventType: dto.eventType as MatchEventType,
        ...(dto.teamId ? { teamId: dto.teamId } : {}),
        ...(dto.playerId ? { playerId: dto.playerId } : {}),
        ...(dto.description ? { description: dto.description } : {}),
        ...(dto.metadata ? { metadata: dto.metadata as Prisma.InputJsonValue } : {}),
      },
      include: EVENT_INCLUDE,
    });

    this.publisher.publishMatchEventCreated(fixtureId, dto.eventType, dto.minute);
    return event;
  }

  async adminAddLineupEntry(fixtureId: string, dto: CreateLineupDto) {
    const exists = await this.prisma.fixture.findUnique({ where: { id: fixtureId }, select: { id: true } });
    if (!exists) throw new NotFoundException(`Fixture '${fixtureId}' not found`);

    const team = await this.prisma.team.findUnique({ where: { id: dto.teamId }, select: { id: true } });
    if (!team) throw new BadRequestException(`teamId '${dto.teamId}' not found`);

    const player = await this.prisma.player.findUnique({ where: { id: dto.playerId }, select: { id: true } });
    if (!player) throw new BadRequestException(`playerId '${dto.playerId}' not found`);

    return this.prisma.fixtureLineup.upsert({
      where: { fixtureId_teamId_playerId: { fixtureId, teamId: dto.teamId, playerId: dto.playerId } },
      create: {
        fixtureId,
        teamId: dto.teamId,
        playerId: dto.playerId,
        status: dto.status,
        ...(dto.shirtNumber !== undefined ? { shirtNumber: dto.shirtNumber } : {}),
        ...(dto.position ? { position: dto.position } : {}),
      },
      update: {
        status: dto.status,
        ...(dto.shirtNumber !== undefined ? { shirtNumber: dto.shirtNumber } : {}),
        ...(dto.position ? { position: dto.position } : {}),
      },
      include: LINEUP_INCLUDE,
    });
  }
}
