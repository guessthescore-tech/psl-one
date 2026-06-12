import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PlayerMatchStatsSource,
  PlayerMatchStatsStatus,
  Prisma,
} from '@prisma/client';

export interface UpsertPlayerStatsDto {
  playerId: string;
  fixtureId: string;
  teamId?: string;
  minutesPlayed?: number;
  goals?: number;
  assists?: number;
  ownGoals?: number;
  yellowCards?: number;
  redCards?: number;
  penaltiesMissed?: number;
  penaltiesSaved?: number;
  saves?: number;
  goalsConceded?: number;
  cleanSheet?: boolean;
  started?: boolean;
  cameOnMinute?: number;
  subbedOffMinute?: number;
  shotsOnTarget?: number;
  shotsTotal?: number;
  keyPasses?: number;
  tacklesWon?: number;
  interceptions?: number;
  blockedShots?: number;
  aerialDuelsWon?: number;
  distanceRun?: number;
  passAccuracy?: number;
  dribbleSuccess?: number;
  rating?: number;
  didNotPlay?: boolean;
  providerStatId?: string;
  notes?: string;
  source?: PlayerMatchStatsSource;
}

const PUBLISHED_STATUSES: PlayerMatchStatsStatus[] = [
  PlayerMatchStatsStatus.PUBLISHED,
  PlayerMatchStatsStatus.VERIFIED,
];

@Injectable()
export class PlayerStatsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Fan-facing helpers ────────────────────────────────────────────────

  async getPlayerSeasonStats(playerId: string, seasonId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: { id: true, name: true, position: true, number: true, team: { select: { id: true, name: true, slug: true } } },
    });
    if (!player) throw new NotFoundException(`Player '${playerId}' not found`);

    const stats = await this.prisma.playerMatchStats.findMany({
      where: { playerId, seasonId, status: { in: PUBLISHED_STATUSES } },
      include: {
        fixture: {
          select: {
            id: true, kickoffAt: true, homeScore: true, awayScore: true, status: true,
            homeTeam: { select: { id: true, name: true, shortName: true } },
            awayTeam: { select: { id: true, name: true, shortName: true } },
          },
        },
      },
      orderBy: { fixture: { kickoffAt: 'desc' } },
    });

    const totals = this._aggregateTotals(stats);
    return { player, seasonId, totals, matches: stats };
  }

  async getPlayerMatchStat(playerId: string, fixtureId: string) {
    const stat = await this.prisma.playerMatchStats.findUnique({
      where: { playerId_fixtureId: { playerId, fixtureId } },
      include: {
        player: { select: { id: true, name: true, position: true, number: true } },
        fixture: {
          select: {
            id: true, kickoffAt: true, homeScore: true, awayScore: true, status: true,
            homeTeam: { select: { id: true, name: true } },
            awayTeam: { select: { id: true, name: true } },
            season: { select: { id: true, name: true, slug: true } },
          },
        },
        team: { select: { id: true, name: true, shortName: true } },
      },
    });
    if (!stat || !PUBLISHED_STATUSES.includes(stat.status)) {
      throw new NotFoundException(`Stats not found for player '${playerId}' in fixture '${fixtureId}'`);
    }
    return stat;
  }

  async listFixtureStats(fixtureId: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      select: {
        id: true, kickoffAt: true, status: true,
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
      },
    });
    if (!fixture) throw new NotFoundException(`Fixture '${fixtureId}' not found`);

    const stats = await this.prisma.playerMatchStats.findMany({
      where: { fixtureId, status: { in: PUBLISHED_STATUSES } },
      include: {
        player: { select: { id: true, name: true, position: true, number: true } },
        team: { select: { id: true, name: true, shortName: true } },
      },
      orderBy: [{ team: { name: 'asc' } }, { player: { name: 'asc' } }],
    });

    return { fixture, stats };
  }

  async listSeasonTopPerformers(seasonId: string, limit = 10) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true, name: true, slug: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const stats = await this.prisma.playerMatchStats.findMany({
      where: { seasonId, status: { in: PUBLISHED_STATUSES } },
      include: {
        player: { select: { id: true, name: true, position: true, team: { select: { id: true, name: true, shortName: true } } } },
      },
    });

    const aggregated = this._groupByPlayer(stats);
    const sorted = aggregated.sort((a, b) => b.goals - a.goals || b.assists - a.assists);

    return { season, topScorers: sorted.slice(0, limit), topAssists: [...aggregated].sort((a, b) => b.assists - a.assists).slice(0, limit) };
  }

  async listGameweekStats(gameweekId: string) {
    const gameweek = await this.prisma.gameweek.findUnique({
      where: { id: gameweekId },
      select: { id: true, name: true, round: true, season: { select: { id: true, name: true } } },
    });
    if (!gameweek) throw new NotFoundException(`Gameweek '${gameweekId}' not found`);

    const stats = await this.prisma.playerMatchStats.findMany({
      where: { gameweekId, status: { in: PUBLISHED_STATUSES } },
      include: {
        player: { select: { id: true, name: true, position: true, number: true } },
        fixture: { select: { id: true, kickoffAt: true, homeTeam: { select: { id: true, name: true } }, awayTeam: { select: { id: true, name: true } } } },
        team: { select: { id: true, name: true, shortName: true } },
      },
      orderBy: [{ goals: 'desc' }, { assists: 'desc' }],
    });

    return { gameweek, stats };
  }

  async getPlayerProfile(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: {
        id: true, name: true, position: true, number: true, nationality: true, dateOfBirth: true,
        team: { select: { id: true, name: true, slug: true } },
        playerStats: {
          where: { status: { in: PUBLISHED_STATUSES } },
          select: { seasonId: true, goals: true, assists: true, minutesPlayed: true, yellowCards: true, redCards: true },
        },
      },
    });
    if (!player) throw new NotFoundException(`Player '${playerId}' not found`);
    return player;
  }

  async listSeasonSquadStats(seasonId: string, teamId: string) {
    const team = await this.prisma.team.findUnique({ where: { id: teamId }, select: { id: true, name: true, shortName: true, slug: true } });
    if (!team) throw new NotFoundException(`Team '${teamId}' not found`);

    const stats = await this.prisma.playerMatchStats.findMany({
      where: { seasonId, teamId, status: { in: PUBLISHED_STATUSES } },
      include: {
        player: { select: { id: true, name: true, position: true, number: true } },
      },
    });

    return { team, seasonId, squadStats: this._groupByPlayer(stats) };
  }

  // ── Admin helpers ─────────────────────────────────────────────────────

  async adminListStats(seasonId?: string, fixtureId?: string, status?: PlayerMatchStatsStatus) {
    const where: Prisma.PlayerMatchStatsWhereInput = {};
    if (seasonId) where.seasonId = seasonId;
    if (fixtureId) where.fixtureId = fixtureId;
    if (status) where.status = status;

    const stats = await this.prisma.playerMatchStats.findMany({
      where,
      include: {
        player: { select: { id: true, name: true, position: true } },
        fixture: { select: { id: true, kickoffAt: true, homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } } } },
        team: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });

    return { stats, total: stats.length };
  }

  async adminGetStat(id: string) {
    const stat = await this.prisma.playerMatchStats.findUnique({
      where: { id },
      include: {
        player: { select: { id: true, name: true, position: true, number: true } },
        fixture: { select: { id: true, kickoffAt: true, status: true, homeTeam: { select: { id: true, name: true } }, awayTeam: { select: { id: true, name: true } }, season: { select: { id: true, name: true } } } },
        team: { select: { id: true, name: true } },
        season: { select: { id: true, name: true, slug: true } },
        gameweek: { select: { id: true, name: true, round: true } },
      },
    });
    if (!stat) throw new NotFoundException(`PlayerMatchStats '${id}' not found`);
    return stat;
  }

  async adminUpsertStat(dto: UpsertPlayerStatsDto) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: dto.fixtureId },
      select: { id: true, seasonId: true, gameweekId: true },
    });
    if (!fixture) throw new NotFoundException(`Fixture '${dto.fixtureId}' not found`);

    const existing = await this.prisma.playerMatchStats.findUnique({
      where: { playerId_fixtureId: { playerId: dto.playerId, fixtureId: dto.fixtureId } },
    });

    if (existing?.status === PlayerMatchStatsStatus.LOCKED) {
      throw new ForbiddenException('Stats are LOCKED and cannot be modified');
    }

    const data: Prisma.PlayerMatchStatsUncheckedUpdateInput = {
      teamId: dto.teamId ?? null,
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
      cameOnMinute: dto.cameOnMinute ?? null,
      subbedOffMinute: dto.subbedOffMinute ?? null,
      shotsOnTarget: dto.shotsOnTarget ?? 0,
      shotsTotal: dto.shotsTotal ?? 0,
      keyPasses: dto.keyPasses ?? 0,
      tacklesWon: dto.tacklesWon ?? 0,
      interceptions: dto.interceptions ?? 0,
      blockedShots: dto.blockedShots ?? 0,
      aerialDuelsWon: dto.aerialDuelsWon ?? 0,
      distanceRun: dto.distanceRun ?? null,
      passAccuracy: dto.passAccuracy ?? null,
      dribbleSuccess: dto.dribbleSuccess ?? null,
      rating: dto.rating ?? null,
      didNotPlay: dto.didNotPlay ?? false,
      providerStatId: dto.providerStatId ?? null,
      notes: dto.notes ?? null,
      source: dto.source ?? PlayerMatchStatsSource.MANUAL,
    };

    return this.prisma.playerMatchStats.upsert({
      where: { playerId_fixtureId: { playerId: dto.playerId, fixtureId: dto.fixtureId } },
      create: {
        ...data,
        playerId: dto.playerId,
        fixtureId: dto.fixtureId,
        seasonId: fixture.seasonId,
        gameweekId: fixture.gameweekId ?? undefined,
        status: PlayerMatchStatsStatus.DRAFT,
      } as Prisma.PlayerMatchStatsUncheckedCreateInput,
      update: data,
    });
  }

  async adminVerifyStat(id: string, verifiedByUserId: string) {
    const stat = await this.prisma.playerMatchStats.findUnique({ where: { id } });
    if (!stat) throw new NotFoundException(`PlayerMatchStats '${id}' not found`);
    if (stat.status === PlayerMatchStatsStatus.LOCKED) {
      throw new ForbiddenException('LOCKED stats cannot be re-verified');
    }
    return this.prisma.playerMatchStats.update({
      where: { id },
      data: { status: PlayerMatchStatsStatus.VERIFIED, verifiedAt: new Date(), verifiedByUserId },
    });
  }

  async adminPublishStat(id: string, actorUserId?: string) {
    const stat = await this.prisma.playerMatchStats.findUnique({ where: { id } });
    if (!stat) throw new NotFoundException(`PlayerMatchStats '${id}' not found`);
    if (stat.status === PlayerMatchStatsStatus.LOCKED) {
      throw new ForbiddenException('LOCKED stats cannot be re-published');
    }
    if (stat.status === PlayerMatchStatsStatus.DRAFT) {
      throw new ForbiddenException('DRAFT stats must be VERIFIED before publishing');
    }
    const updated = await this.prisma.playerMatchStats.update({
      where: { id },
      data: { status: PlayerMatchStatsStatus.PUBLISHED, publishedAt: new Date() },
    });
    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action: 'PUBLISH_PLAYER_STAT',
        entityType: 'PlayerMatchStats',
        entityId: id,
        route: `POST /players/admin/stats/${id}/publish`,
        metadata: { playerId: stat.playerId, fixtureId: stat.fixtureId, seasonId: stat.seasonId },
      },
    });
    return updated;
  }

  async adminLockStat(id: string, actorUserId?: string) {
    const stat = await this.prisma.playerMatchStats.findUnique({ where: { id } });
    if (!stat) throw new NotFoundException(`PlayerMatchStats '${id}' not found`);
    const updated = await this.prisma.playerMatchStats.update({ where: { id }, data: { status: PlayerMatchStatsStatus.LOCKED } });
    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: actorUserId ?? null,
        actorRole: 'PSL_ADMIN',
        action: 'LOCK_PLAYER_STAT',
        entityType: 'PlayerMatchStats',
        entityId: id,
        route: `POST /players/admin/stats/${id}/lock`,
        metadata: { playerId: stat.playerId, fixtureId: stat.fixtureId, seasonId: stat.seasonId },
      },
    });
    return updated;
  }

  async adminBulkPublishFixture(fixtureId: string) {
    const fixture = await this.prisma.fixture.findUnique({ where: { id: fixtureId } });
    if (!fixture) throw new NotFoundException(`Fixture '${fixtureId}' not found`);

    const result = await this.prisma.playerMatchStats.updateMany({
      where: { fixtureId, status: PlayerMatchStatsStatus.VERIFIED },
      data: { status: PlayerMatchStatsStatus.PUBLISHED, publishedAt: new Date() },
    });

    return { fixtureId, published: result.count };
  }

  async adminDeleteStat(id: string) {
    const stat = await this.prisma.playerMatchStats.findUnique({ where: { id } });
    if (!stat) throw new NotFoundException(`PlayerMatchStats '${id}' not found`);
    if (stat.status === PlayerMatchStatsStatus.LOCKED) {
      throw new ForbiddenException('LOCKED stats cannot be deleted');
    }
    if (stat.status === PlayerMatchStatsStatus.PUBLISHED) {
      throw new ForbiddenException('PUBLISHED stats cannot be deleted — lock or archive instead');
    }
    await this.prisma.playerMatchStats.delete({ where: { id } });
    return { deleted: true, id };
  }

  async adminGetSeasonReadiness(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true, name: true, slug: true, status: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const [total, draft, verified, published, locked] = await Promise.all([
      this.prisma.playerMatchStats.count({ where: { seasonId } }),
      this.prisma.playerMatchStats.count({ where: { seasonId, status: PlayerMatchStatsStatus.DRAFT } }),
      this.prisma.playerMatchStats.count({ where: { seasonId, status: PlayerMatchStatsStatus.VERIFIED } }),
      this.prisma.playerMatchStats.count({ where: { seasonId, status: PlayerMatchStatsStatus.PUBLISHED } }),
      this.prisma.playerMatchStats.count({ where: { seasonId, status: PlayerMatchStatsStatus.LOCKED } }),
    ]);

    const fixtureCount = await this.prisma.fixture.count({ where: { seasonId, status: 'FINISHED' } });

    let readiness: 'NO_DATA' | 'PROVISIONAL' | 'PARTIAL' | 'VERIFIED' | 'PUBLISHED' = 'NO_DATA';
    if (total > 0) readiness = 'PROVISIONAL';
    if (verified + published + locked > 0) readiness = 'PARTIAL';
    if (draft === 0 && total > 0) readiness = 'VERIFIED';
    if (published + locked === total && total > 0) readiness = 'PUBLISHED';

    return {
      season,
      readiness,
      counts: { total, draft, verified, published, locked },
      finishedFixtures: fixtureCount,
      coveragePercent: fixtureCount > 0 ? Math.round((published + locked) / Math.max(fixtureCount * 22, 1) * 100) : 0,
    };
  }

  // ── Season switching check ────────────────────────────────────────────

  async checkPlayerStatsReadiness(seasonId: string) {
    const fixtureCount = await this.prisma.fixture.count({ where: { seasonId, status: 'FINISHED' } });
    if (fixtureCount === 0) {
      return {
        check: 'PLAYER_STATS_READINESS',
        status: 'OK' as const,
        message: 'No completed fixtures — player stats pipeline pre-configured',
        detail: null,
      };
    }

    const statsCount = await this.prisma.playerMatchStats.count({ where: { seasonId } });
    if (statsCount === 0) {
      return {
        check: 'PLAYER_STATS_READINESS',
        status: 'WARNING' as const,
        message: `${fixtureCount} completed fixture(s) have no player stats entries`,
        detail: { fixtureCount, statsCount },
      };
    }

    const draftCount = await this.prisma.playerMatchStats.count({ where: { seasonId, status: PlayerMatchStatsStatus.DRAFT } });
    if (draftCount > 0) {
      return {
        check: 'PLAYER_STATS_READINESS',
        status: 'WARNING' as const,
        message: `${draftCount} player stat entries still in DRAFT — consider verifying before activation`,
        detail: { fixtureCount, statsCount, draftCount },
      };
    }

    return {
      check: 'PLAYER_STATS_READINESS',
      status: 'OK' as const,
      message: `Player stats pipeline ready — ${statsCount} entries across ${fixtureCount} completed fixtures`,
      detail: { fixtureCount, statsCount },
    };
  }

  // ── Private helpers ───────────────────────────────────────────────────

  private _aggregateTotals(stats: Array<{
    minutesPlayed: number; goals: number; assists: number; ownGoals: number;
    yellowCards: number; redCards: number; saves: number; goalsConceded: number;
    cleanSheet: boolean; shotsOnTarget: number; tacklesWon: number;
  }>) {
    return stats.reduce(
      (acc, s) => ({
        appearances: acc.appearances + 1,
        minutesPlayed: acc.minutesPlayed + s.minutesPlayed,
        goals: acc.goals + s.goals,
        assists: acc.assists + s.assists,
        ownGoals: acc.ownGoals + s.ownGoals,
        yellowCards: acc.yellowCards + s.yellowCards,
        redCards: acc.redCards + s.redCards,
        saves: acc.saves + s.saves,
        goalsConceded: acc.goalsConceded + s.goalsConceded,
        cleanSheets: acc.cleanSheets + (s.cleanSheet ? 1 : 0),
        shotsOnTarget: acc.shotsOnTarget + s.shotsOnTarget,
        tacklesWon: acc.tacklesWon + s.tacklesWon,
      }),
      { appearances: 0, minutesPlayed: 0, goals: 0, assists: 0, ownGoals: 0, yellowCards: 0, redCards: 0, saves: 0, goalsConceded: 0, cleanSheets: 0, shotsOnTarget: 0, tacklesWon: 0 },
    );
  }

  private _groupByPlayer(stats: Array<{
    playerId: string; minutesPlayed: number; goals: number; assists: number;
    ownGoals: number; yellowCards: number; redCards: number; saves: number; goalsConceded: number;
    cleanSheet: boolean; shotsOnTarget: number; tacklesWon: number;
    player?: { id: string; name: string; position: string; team?: { id: string; name: string; shortName: string } };
  }>) {
    type Row = ReturnType<typeof this._aggregateTotals> & { playerId: string; player: typeof stats[0]['player'] };
    const map = new Map<string, Row>();

    for (const s of stats) {
      const existing = map.get(s.playerId);
      if (existing) {
        const t = this._aggregateTotals([s]);
        existing.appearances += t.appearances;
        existing.minutesPlayed += t.minutesPlayed;
        existing.goals += t.goals;
        existing.assists += t.assists;
        existing.ownGoals += t.ownGoals;
        existing.yellowCards += t.yellowCards;
        existing.redCards += t.redCards;
        existing.saves += t.saves;
        existing.goalsConceded += t.goalsConceded;
        existing.cleanSheets += t.cleanSheets;
        existing.shotsOnTarget += t.shotsOnTarget;
        existing.tacklesWon += t.tacklesWon;
      } else {
        map.set(s.playerId, { ...this._aggregateTotals([s]), playerId: s.playerId, player: s.player });
      }
    }

    return Array.from(map.values());
  }
}
