import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FixtureStatus, MatchEventType, Prisma, PlayerPosition } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ManualLiveMatchProviderAdapter } from './live-match-provider.interface';
import { UpdateLiveStateDto } from './dto/update-live-state.dto';
import { AddMatchEventDto } from './dto/add-match-event.dto';
import { UpdateMatchEventDto } from './dto/update-match-event.dto';
import { UpsertPlayerStatDto } from './dto/upsert-player-stat.dto';
import { BulkUpsertPlayerStatsDto } from './dto/bulk-upsert-player-stats.dto';

const EVENT_INCLUDE = {
  team: { select: { id: true, name: true, slug: true, shortName: true } },
  player: { select: { id: true, name: true, position: true, number: true } },
  relatedPlayer: { select: { id: true, name: true, position: true, number: true } },
} as const;

const STAT_INCLUDE = {
  player: { select: { id: true, name: true, position: true, number: true } },
  team: { select: { id: true, name: true, slug: true, shortName: true } },
} as const;

const LINEUP_INCLUDE = {
  team: { select: { id: true, name: true, slug: true, shortName: true } },
  player: { select: { id: true, name: true, position: true, number: true } },
} as const;

const SCORE_EVENTS = new Set<MatchEventType>([
  MatchEventType.GOAL, MatchEventType.PENALTY_SCORED, MatchEventType.OWN_GOAL,
]);

@Injectable()
export class LiveMatchService {
  private readonly provider = new ManualLiveMatchProviderAdapter();

  constructor(private readonly prisma: PrismaService) {}

  private async requireFixture(fixtureId: string) {
    const fixture = await this.prisma.fixture.findUnique({ where: { id: fixtureId }, select: { id: true } });
    if (!fixture) throw new NotFoundException(`Fixture '${fixtureId}' not found`);
    return fixture;
  }

  // ── Fan routes ────────────────────────────────────────────────────────────

  async getLiveMatchDashboard(fixtureId: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeTeam: true,
        awayTeam: true,
        venue: true,
        group: true,
        stage: { select: { id: true, name: true, slug: true, type: true, order: true } },
        season: { include: { competition: true } },
        gameweek: { select: { id: true, name: true, slug: true, round: true, status: true } },
        events: {
          include: EVENT_INCLUDE,
          orderBy: [{ minute: 'asc' }, { stoppageMinute: 'asc' }, { createdAt: 'asc' }],
        },
        lineups: {
          include: LINEUP_INCLUDE,
          orderBy: [{ status: 'asc' }, { shirtNumber: 'asc' }],
        },
        fantasyMatchStats: {
          include: STAT_INCLUDE,
        },
      },
    });
    if (!fixture) throw new NotFoundException(`Fixture '${fixtureId}' not found`);

    const liveFantasyPreview = this.computeLiveFantasyPreview(fixture.fantasyMatchStats as FantasyStatRow[]);

    return {
      fixture,
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      venue: fixture.venue,
      events: fixture.events,
      lineups: fixture.lineups,
      playerStats: fixture.fantasyMatchStats,
      liveFantasyPreview,
    };
  }

  async getFixtureLiveState(fixtureId: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      select: {
        id: true,
        status: true,
        homeScore: true,
        awayScore: true,
        currentMinute: true,
        period: true,
        lastUpdatedAt: true,
        lastSyncedAt: true,
        startedAt: true,
        halfTimeAt: true,
        resumedAt: true,
        finishedAt: true,
        kickoffAt: true,
        homeTeam: { select: { id: true, name: true, slug: true, shortName: true } },
        awayTeam: { select: { id: true, name: true, slug: true, shortName: true } },
      },
    });
    if (!fixture) throw new NotFoundException(`Fixture '${fixtureId}' not found`);
    return fixture;
  }

  async getFixtureTimeline(fixtureId: string) {
    await this.requireFixture(fixtureId);
    return this.prisma.matchEvent.findMany({
      where: { fixtureId },
      include: EVENT_INCLUDE,
      orderBy: [{ minute: 'asc' }, { stoppageMinute: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async getFixturePlayerStats(fixtureId: string) {
    await this.requireFixture(fixtureId);
    return this.prisma.fantasyPlayerMatchStat.findMany({
      where: { fixtureId },
      include: STAT_INCLUDE,
      orderBy: [{ minutesPlayed: 'desc' }],
    });
  }

  async getLiveFantasyPreview(fixtureId: string) {
    await this.requireFixture(fixtureId);
    const stats = await this.prisma.fantasyPlayerMatchStat.findMany({
      where: { fixtureId },
      include: STAT_INCLUDE,
    });
    return {
      provisional: true,
      fixtureId,
      players: this.computeLiveFantasyPreview(stats as FantasyStatRow[]),
    };
  }

  // ── Admin routes ──────────────────────────────────────────────────────────

  async updateFixtureLiveState(fixtureId: string, dto: UpdateLiveStateDto) {
    await this.requireFixture(fixtureId);
    const now = new Date();
    const data: Prisma.FixtureUpdateInput = { lastUpdatedAt: now };
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.currentMinute !== undefined) data.currentMinute = dto.currentMinute;
    if (dto.period !== undefined) data.period = dto.period;

    if (dto.status === FixtureStatus.LIVE) data.startedAt = now;
    if (dto.status === FixtureStatus.HALF_TIME) data.halfTimeAt = now;
    if (dto.status === FixtureStatus.FINISHED) data.finishedAt = now;

    return this.prisma.fixture.update({
      where: { id: fixtureId },
      data,
      select: {
        id: true, status: true, homeScore: true, awayScore: true,
        currentMinute: true, period: true, lastUpdatedAt: true,
        startedAt: true, halfTimeAt: true, finishedAt: true,
      },
    });
  }

  async addMatchEvent(fixtureId: string, dto: AddMatchEventDto) {
    await this.requireFixture(fixtureId);

    if (dto.teamId) {
      const team = await this.prisma.team.findUnique({ where: { id: dto.teamId }, select: { id: true } });
      if (!team) throw new BadRequestException(`teamId '${dto.teamId}' not found`);
    }
    if (dto.playerId) {
      const player = await this.prisma.player.findUnique({ where: { id: dto.playerId }, select: { id: true } });
      if (!player) throw new BadRequestException(`playerId '${dto.playerId}' not found`);
    }
    if (dto.relatedPlayerId) {
      const rp = await this.prisma.player.findUnique({ where: { id: dto.relatedPlayerId }, select: { id: true } });
      if (!rp) throw new BadRequestException(`relatedPlayerId '${dto.relatedPlayerId}' not found`);
    }

    // Idempotent by providerEventId
    if (dto.providerEventId) {
      const existing = await this.prisma.matchEvent.findFirst({
        where: { fixtureId, providerEventId: dto.providerEventId },
        include: EVENT_INCLUDE,
      });
      if (existing) return existing;
    }

    const event = await this.prisma.matchEvent.create({
      data: {
        fixtureId,
        minute: dto.minute,
        eventType: dto.eventType,
        ...(dto.stoppageMinute !== undefined ? { stoppageMinute: dto.stoppageMinute } : {}),
        ...(dto.period ? { period: dto.period } : {}),
        ...(dto.teamId ? { teamId: dto.teamId } : {}),
        ...(dto.playerId ? { playerId: dto.playerId } : {}),
        ...(dto.relatedPlayerId ? { relatedPlayerId: dto.relatedPlayerId } : {}),
        ...(dto.description ? { description: dto.description } : {}),
        ...(dto.metadata ? { metadata: dto.metadata as Prisma.InputJsonValue } : {}),
        ...(dto.providerEventId ? { providerEventId: dto.providerEventId } : {}),
      },
      include: EVENT_INCLUDE,
    });

    // Optionally update score on goal events
    if (dto.updateScore && SCORE_EVENTS.has(dto.eventType) && dto.teamId) {
      await this.updateScoreFromEvent(fixtureId, dto.eventType, dto.teamId);
    }

    // Optionally finalise on FULL_TIME
    if (dto.eventType === MatchEventType.FULL_TIME) {
      await this.prisma.fixture.update({
        where: { id: fixtureId },
        data: { status: FixtureStatus.FINISHED, finishedAt: new Date(), lastUpdatedAt: new Date() },
      });
    }

    return event;
  }

  async updateMatchEvent(eventId: string, dto: UpdateMatchEventDto) {
    const existing = await this.prisma.matchEvent.findUnique({ where: { id: eventId } });
    if (!existing) throw new NotFoundException(`Event '${eventId}' not found`);

    return this.prisma.matchEvent.update({
      where: { id: eventId },
      data: {
        ...(dto.eventType !== undefined ? { eventType: dto.eventType } : {}),
        ...(dto.minute !== undefined ? { minute: dto.minute } : {}),
        ...(dto.stoppageMinute !== undefined ? { stoppageMinute: dto.stoppageMinute } : {}),
        ...(dto.period !== undefined ? { period: dto.period } : {}),
        ...(dto.teamId !== undefined ? { teamId: dto.teamId } : {}),
        ...(dto.playerId !== undefined ? { playerId: dto.playerId } : {}),
        ...(dto.relatedPlayerId !== undefined ? { relatedPlayerId: dto.relatedPlayerId } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.metadata !== undefined ? { metadata: dto.metadata as Prisma.InputJsonValue } : {}),
      },
      include: EVENT_INCLUDE,
    });
  }

  async deleteMatchEvent(eventId: string) {
    const existing = await this.prisma.matchEvent.findUnique({ where: { id: eventId } });
    if (!existing) throw new NotFoundException(`Event '${eventId}' not found`);
    await this.prisma.matchEvent.delete({ where: { id: eventId } });
    return { deleted: true, id: eventId };
  }

  async upsertPlayerStat(fixtureId: string, dto: UpsertPlayerStatDto) {
    await this.requireFixture(fixtureId);
    const player = await this.prisma.player.findUnique({ where: { id: dto.playerId }, select: { id: true } });
    if (!player) throw new BadRequestException(`playerId '${dto.playerId}' not found`);

    return this.prisma.fantasyPlayerMatchStat.upsert({
      where: { playerId_fixtureId: { playerId: dto.playerId, fixtureId } },
      create: {
        playerId: dto.playerId,
        fixtureId,
        ...(dto.teamId ? { teamId: dto.teamId } : {}),
        minutesPlayed: dto.minutesPlayed ?? 0,
        goals: dto.goals ?? 0,
        assists: dto.assists ?? 0,
        ownGoals: dto.ownGoals ?? 0,
        yellowCards: dto.yellowCards ?? 0,
        redCards: dto.redCards ?? 0,
        penaltiesMissed: dto.penaltiesMissed ?? 0,
        penaltiesSaved: dto.penaltiesSaved ?? 0,
        saves: dto.saves ?? 0,
        goalsConceded: dto.goalsConceded ?? 0,
        cleanSheet: dto.cleanSheet ?? false,
        started: dto.started ?? false,
        ...(dto.cameOnMinute !== undefined ? { cameOnMinute: dto.cameOnMinute } : {}),
        ...(dto.subbedOffMinute !== undefined ? { subbedOffMinute: dto.subbedOffMinute } : {}),
        didNotPlay: dto.didNotPlay ?? false,
        ...(dto.source ? { source: dto.source } : {}),
        ...(dto.providerStatId ? { providerStatId: dto.providerStatId } : {}),
      },
      update: {
        ...(dto.teamId !== undefined ? { teamId: dto.teamId } : {}),
        ...(dto.minutesPlayed !== undefined ? { minutesPlayed: dto.minutesPlayed } : {}),
        ...(dto.goals !== undefined ? { goals: dto.goals } : {}),
        ...(dto.assists !== undefined ? { assists: dto.assists } : {}),
        ...(dto.ownGoals !== undefined ? { ownGoals: dto.ownGoals } : {}),
        ...(dto.yellowCards !== undefined ? { yellowCards: dto.yellowCards } : {}),
        ...(dto.redCards !== undefined ? { redCards: dto.redCards } : {}),
        ...(dto.penaltiesMissed !== undefined ? { penaltiesMissed: dto.penaltiesMissed } : {}),
        ...(dto.penaltiesSaved !== undefined ? { penaltiesSaved: dto.penaltiesSaved } : {}),
        ...(dto.saves !== undefined ? { saves: dto.saves } : {}),
        ...(dto.goalsConceded !== undefined ? { goalsConceded: dto.goalsConceded } : {}),
        ...(dto.cleanSheet !== undefined ? { cleanSheet: dto.cleanSheet } : {}),
        ...(dto.started !== undefined ? { started: dto.started } : {}),
        ...(dto.cameOnMinute !== undefined ? { cameOnMinute: dto.cameOnMinute } : {}),
        ...(dto.subbedOffMinute !== undefined ? { subbedOffMinute: dto.subbedOffMinute } : {}),
        ...(dto.didNotPlay !== undefined ? { didNotPlay: dto.didNotPlay } : {}),
        ...(dto.source !== undefined ? { source: dto.source } : {}),
        ...(dto.providerStatId !== undefined ? { providerStatId: dto.providerStatId } : {}),
      },
      include: STAT_INCLUDE,
    });
  }

  async bulkUpsertPlayerStats(fixtureId: string, dto: BulkUpsertPlayerStatsDto) {
    const results = await Promise.allSettled(
      dto.stats.map(stat => this.upsertPlayerStat(fixtureId, stat)),
    );
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const errors = results
      .map((r, i) => r.status === 'rejected' ? `${dto.stats[i]!.playerId}: ${r.reason as string}` : null)
      .filter(Boolean) as string[];
    return { fixtureId, succeeded, errors };
  }

  async recalculateFixtureStateFromEvents(fixtureId: string) {
    await this.requireFixture(fixtureId);
    const events = await this.prisma.matchEvent.findMany({
      where: { fixtureId },
      orderBy: [{ minute: 'asc' }, { stoppageMinute: 'asc' }, { createdAt: 'asc' }],
    });

    let homeScore = 0;
    let awayScore = 0;
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      select: { homeTeamId: true, awayTeamId: true },
    });
    if (!fixture) throw new NotFoundException(`Fixture '${fixtureId}' not found`);

    for (const e of events) {
      if (!e.teamId) continue;
      if (e.eventType === MatchEventType.GOAL || e.eventType === MatchEventType.PENALTY_SCORED) {
        if (e.teamId === fixture.homeTeamId) homeScore++;
        else if (e.teamId === fixture.awayTeamId) awayScore++;
      } else if (e.eventType === MatchEventType.OWN_GOAL) {
        // Own goal counts for the OTHER team
        if (e.teamId === fixture.homeTeamId) awayScore++;
        else if (e.teamId === fixture.awayTeamId) homeScore++;
      }
    }

    const lastMin = events.length > 0 ? events[events.length - 1]!.minute : null;
    const hasFullTime = events.some(e => e.eventType === MatchEventType.FULL_TIME);
    const hasHalfTime = events.some(e => e.eventType === MatchEventType.HALF_TIME);
    const hasKickoff = events.some(e => e.eventType === MatchEventType.KICKOFF);

    let status: FixtureStatus = FixtureStatus.SCHEDULED;
    if (hasFullTime) status = FixtureStatus.FINISHED;
    else if (hasHalfTime) status = FixtureStatus.HALF_TIME;
    else if (hasKickoff) status = FixtureStatus.LIVE;

    return this.prisma.fixture.update({
      where: { id: fixtureId },
      data: {
        homeScore,
        awayScore,
        ...(lastMin !== null ? { currentMinute: lastMin } : {}),
        status,
        lastUpdatedAt: new Date(),
      },
      select: { id: true, homeScore: true, awayScore: true, status: true, currentMinute: true, lastUpdatedAt: true },
    });
  }

  async finaliseFixture(fixtureId: string) {
    await this.requireFixture(fixtureId);
    return this.prisma.fixture.update({
      where: { id: fixtureId },
      data: {
        status: FixtureStatus.FINISHED,
        finishedAt: new Date(),
        lastUpdatedAt: new Date(),
      },
      select: { id: true, status: true, finishedAt: true, homeScore: true, awayScore: true },
    });
  }

  async reopenFixture(fixtureId: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      select: { id: true, status: true },
    });
    if (!fixture) throw new NotFoundException(`Fixture '${fixtureId}' not found`);
    if (fixture.status !== FixtureStatus.FINISHED) {
      throw new BadRequestException('Only FINISHED fixtures can be reopened');
    }
    return this.prisma.fixture.update({
      where: { id: fixtureId },
      data: {
        status: FixtureStatus.LIVE,
        finishedAt: null,
        lastUpdatedAt: new Date(),
      },
      select: { id: true, status: true, lastUpdatedAt: true },
    });
  }

  async syncFixtureFromProvider(fixtureId: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      select: { id: true, providerSource: true, providerFixtureId: true },
    });
    if (!fixture) throw new NotFoundException(`Fixture '${fixtureId}' not found`);

    if (!fixture.providerFixtureId) {
      return { synced: false, reason: 'No providerFixtureId configured for this fixture' };
    }

    const state = await this.provider.fetchFixtureState(fixture.providerFixtureId);
    if (!state) {
      return { synced: false, reason: 'Provider returned no data' };
    }

    await this.prisma.fixture.update({
      where: { id: fixtureId },
      data: { lastSyncedAt: new Date(), lastUpdatedAt: new Date() },
    });

    return { synced: true, fixtureId, provider: this.provider.providerName };
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  private async updateScoreFromEvent(fixtureId: string, eventType: MatchEventType, teamId: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      select: { homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true },
    });
    if (!fixture) return;

    const homeScore = fixture.homeScore ?? 0;
    const awayScore = fixture.awayScore ?? 0;
    let newHome = homeScore;
    let newAway = awayScore;

    if (eventType === MatchEventType.OWN_GOAL) {
      if (teamId === fixture.homeTeamId) newAway++;
      else if (teamId === fixture.awayTeamId) newHome++;
    } else {
      if (teamId === fixture.homeTeamId) newHome++;
      else if (teamId === fixture.awayTeamId) newAway++;
    }

    await this.prisma.fixture.update({
      where: { id: fixtureId },
      data: { homeScore: newHome, awayScore: newAway, lastUpdatedAt: new Date() },
    });
  }

  private computeLiveFantasyPreview(stats: FantasyStatRow[]) {
    return stats.map(s => {
      const pts = computeLivePoints(s);
      return {
        playerId: s.playerId,
        playerName: s.player?.name ?? null,
        teamName: s.team?.name ?? null,
        position: s.player?.position ?? null,
        minutesPlayed: s.minutesPlayed,
        goals: s.goals,
        assists: s.assists,
        yellowCards: s.yellowCards,
        redCards: s.redCards,
        saves: s.saves,
        cleanSheet: s.cleanSheet,
        estimatedPoints: pts,
        provisional: true,
      };
    });
  }
}

interface FantasyStatRow {
  playerId: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  ownGoals: number;
  yellowCards: number;
  redCards: number;
  penaltiesMissed: number;
  penaltiesSaved: number;
  saves: number;
  cleanSheet: boolean;
  didNotPlay: boolean;
  player?: { name: string; position: PlayerPosition } | null;
  team?: { name: string } | null;
}

function computeLivePoints(s: FantasyStatRow): number {
  if (s.didNotPlay || s.minutesPlayed === 0) return 0;
  const pos = s.player?.position ?? PlayerPosition.MIDFIELDER;
  const appearance = s.minutesPlayed >= 60 ? 2 : 1;
  const goals =
    pos === PlayerPosition.GOALKEEPER ? s.goals * 10
    : pos === PlayerPosition.DEFENDER ? s.goals * 6
    : pos === PlayerPosition.MIDFIELDER ? s.goals * 5
    : s.goals * 4;
  const assists = s.assists * 3;
  const cleanSheet = s.cleanSheet && s.minutesPlayed >= 60
    ? (pos === PlayerPosition.GOALKEEPER || pos === PlayerPosition.DEFENDER ? 4
       : pos === PlayerPosition.MIDFIELDER ? 1 : 0)
    : 0;
  const saves = Math.floor(s.saves / 3);
  const penaltySaves = s.penaltiesSaved * 5;
  const penaltyMisses = s.penaltiesMissed * -2;
  const yellows = s.yellowCards * -1;
  const reds = s.redCards * -3;
  const ownGoals = s.ownGoals * -2;
  return appearance + goals + assists + cleanSheet + saves + penaltySaves + penaltyMisses + yellows + reds + ownGoals;
}
