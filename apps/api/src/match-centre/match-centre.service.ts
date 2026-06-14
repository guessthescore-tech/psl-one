import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSourceType, DataStatus, FreshnessStatus, LineupStatus, MatchEventType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CampaignTriggerService } from '../campaigns/campaign-trigger.service';
import { IngestMatchDataDto } from './dto/ingest-match-data.dto';
import { UpsertPlayerRatingDto } from './dto/upsert-player-rating.dto';
import { UpsertStandingsDto, UpsertStandingEntryDto } from './dto/upsert-standings.dto';
import { UpsertTeamFormDto } from './dto/upsert-team-form.dto';

const DEFAULT_PROVENANCE = {
  sourceType: DataSourceType.MANUAL,
  dataStatus: DataStatus.PROVISIONAL,
  freshnessStatus: FreshnessStatus.MANUAL,
  lastUpdatedAt: new Date().toISOString(),
  providerKey: null,
  note: 'Data sourced from manual entry or seeded sandbox data. Official provider integration is INTEGRATION_READY.',
};

@Injectable()
export class MatchCentreService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly campaignTrigger: CampaignTriggerService,
  ) {}

  // ── Private: Data Ingestion Log ───────────────────────────────────────────

  private async _logIngestion(
    entityType: string,
    entityId: string,
    sourceType: DataSourceType,
    dataStatus: DataStatus,
    operatorUserId?: string,
    notes?: string,
  ) {
    return this.prisma.dataIngestionLog.create({
      data: {
        sourceType,
        entityType,
        entityId,
        dataStatus,
        ingestedAt: new Date(),
        processedAt: new Date(),
        ...(operatorUserId !== undefined ? { operatorUserId } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });
  }

  // ── Fan: Fixture Match Centre ─────────────────────────────────────────────

  async getFixtureMatchCentre(fixtureId: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true, slug: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, shortName: true, slug: true, logoUrl: true } },
        venue: { select: { id: true, name: true, city: true, capacity: true } },
        gameweek: { select: { id: true, name: true, slug: true } },
        season: { include: { competition: { select: { id: true, name: true } } } },
        events: {
          orderBy: [{ minute: 'asc' }, { stoppageMinute: 'asc' }],
          include: {
            player: { select: { id: true, name: true, position: true } },
            relatedPlayer: { select: { id: true, name: true } },
            team: { select: { id: true, shortName: true } },
          },
        },
        lineups: {
          include: { player: { select: { id: true, name: true, position: true, number: true } } },
          orderBy: [{ status: 'asc' }, { shirtNumber: 'asc' }],
        },
        playerMatchStats: {
          include: { player: { select: { id: true, name: true, position: true } }, team: { select: { id: true, shortName: true } } },
        },
        playerRatings: {
          include: { player: { select: { id: true, name: true, position: true } } },
        },
      },
    });
    if (!fixture) throw new NotFoundException(`Fixture not found: ${fixtureId}`);

    const homeLineups = fixture.lineups.filter(l => l.teamId === fixture.homeTeamId);
    const awayLineups = fixture.lineups.filter(l => l.teamId === fixture.awayTeamId);

    return {
      fixture: {
        id: fixture.id,
        kickoffAt: fixture.kickoffAt,
        status: fixture.status,
        homeScore: fixture.homeScore,
        awayScore: fixture.awayScore,
        currentMinute: fixture.currentMinute,
        period: fixture.period,
        startedAt: fixture.startedAt,
        finishedAt: fixture.finishedAt,
        venue: fixture.venue,
        gameweek: fixture.gameweek,
        season: { id: fixture.season.id, name: fixture.season.name, competition: fixture.season.competition },
      },
      homeTeam: fixture.homeTeam,
      awayTeam: fixture.awayTeam,
      events: fixture.events,
      lineups: {
        home: homeLineups.map(l => ({
          ...l,
          isStarter: l.status === LineupStatus.STARTING,
          isSubstitute: l.status === LineupStatus.SUBSTITUTE,
        })),
        away: awayLineups.map(l => ({
          ...l,
          isStarter: l.status === LineupStatus.STARTING,
          isSubstitute: l.status === LineupStatus.SUBSTITUTE,
        })),
      },
      playerStats: fixture.playerMatchStats,
      playerRatings: fixture.playerRatings.map(r => ({
        ...r,
        provenanceNote: 'Performance rating is provisional. Source: MANUAL. Official provider rating: PROVIDER_REQUIRED.',
      })),
      dataProvenance: {
        sourceType: fixture.providerSource ?? DataSourceType.MANUAL,
        dataStatus: DataStatus.PROVISIONAL,
        freshnessStatus: fixture.lastSyncedAt ? FreshnessStatus.FRESH : FreshnessStatus.MANUAL,
        lastUpdatedAt: fixture.lastUpdatedAt ?? fixture.startedAt,
        providerKey: fixture.providerFixtureId,
        officialFeed: 'PROVIDER_REQUIRED',
      },
    };
  }

  async getFixtureLineups(fixtureId: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      select: { id: true, homeTeamId: true, awayTeamId: true, status: true },
    });
    if (!fixture) throw new NotFoundException(`Fixture not found: ${fixtureId}`);

    const lineups = await this.prisma.fixtureLineup.findMany({
      where: { fixtureId },
      include: {
        player: { select: { id: true, name: true, position: true, number: true } },
        team: { select: { id: true, name: true, shortName: true } },
      },
      orderBy: [{ teamId: 'asc' }, { status: 'asc' }, { shirtNumber: 'asc' }],
    });

    return {
      fixtureId,
      home: lineups.filter(l => l.teamId === fixture.homeTeamId),
      away: lineups.filter(l => l.teamId === fixture.awayTeamId),
      dataProvenance: DEFAULT_PROVENANCE,
    };
  }

  async getFixtureStats(fixtureId: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      select: { id: true, homeTeamId: true, awayTeamId: true },
    });
    if (!fixture) throw new NotFoundException(`Fixture not found: ${fixtureId}`);

    const stats = await this.prisma.playerMatchStats.findMany({
      where: { fixtureId },
      include: {
        player: { select: { id: true, name: true, position: true } },
        team: { select: { id: true, name: true, shortName: true } },
      },
    });

    return {
      fixtureId,
      homeStats: stats.filter(s => s.teamId === fixture.homeTeamId),
      awayStats: stats.filter(s => s.teamId === fixture.awayTeamId),
      dataProvenance: DEFAULT_PROVENANCE,
    };
  }

  async getFixturePlayerRatings(fixtureId: string) {
    const ratings = await this.prisma.playerRating.findMany({
      where: { fixtureId },
      include: { player: { select: { id: true, name: true, position: true } } },
      orderBy: { performanceRating: 'desc' },
    });

    return {
      fixtureId,
      ratings: ratings.map(r => ({
        ...r,
        provenanceNote: 'Performance rating is provisional and PSL One-assigned. Rater: MANUAL or SANDBOX_PROVIDER. Official provider rating: PROVIDER_REQUIRED.',
      })),
      dataProvenance: { ...DEFAULT_PROVENANCE, sourceType: ratings[0]?.sourceType ?? DataSourceType.MANUAL },
    };
  }

  // ── Fan: Standings ────────────────────────────────────────────────────────

  async getSeasonStandings(seasonId: string) {
    const standings = await this.prisma.leagueStanding.findMany({
      where: { seasonId },
      include: {
        club: { select: { id: true, name: true, shortName: true, slug: true, logoUrl: true } },
      },
      orderBy: { position: 'asc' },
    });

    const provenance = standings[0]
      ? {
          sourceType: standings[0].sourceType,
          dataStatus: standings[0].dataStatus,
          freshnessStatus: standings[0].freshnessStatus,
          lastUpdatedAt: standings[0].lastUpdatedAt,
          providerKey: standings[0].providerKey,
        }
      : DEFAULT_PROVENANCE;

    return { seasonId, standings, dataProvenance: provenance };
  }

  // ── Fan: Team Form ────────────────────────────────────────────────────────

  async getTeamForm(clubId: string, seasonId: string) {
    const form = await this.prisma.teamFormRecord.findUnique({
      where: { clubId_seasonId: { clubId, seasonId } },
      include: { club: { select: { id: true, name: true, shortName: true } } },
    });
    return {
      clubId,
      seasonId,
      form,
      dataProvenance: form
        ? { sourceType: form.sourceType, dataStatus: form.dataStatus, lastUpdatedAt: form.lastUpdatedAt }
        : DEFAULT_PROVENANCE,
    };
  }

  // ── Fan: Player Profile ───────────────────────────────────────────────────

  async getPlayerProfile(playerId: string, seasonId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: { team: { select: { id: true, name: true, shortName: true, slug: true } } },
    });
    if (!player) throw new NotFoundException(`Player not found: ${playerId}`);

    const [seasonStats, ratings] = await Promise.all([
      this.prisma.playerMatchStats.findMany({
        where: { playerId, seasonId },
        orderBy: { createdAt: 'desc' },
        take: 38,
      }),
      this.prisma.playerRating.findMany({
        where: { playerId, fixture: { seasonId } },
        include: { fixture: { select: { id: true, kickoffAt: true, homeTeam: { select: { shortName: true } }, awayTeam: { select: { shortName: true } } } } },
        orderBy: { lastUpdatedAt: 'desc' },
        take: 10,
      }),
    ]);

    // Aggregate season stats
    const aggregate = seasonStats.reduce(
      (acc, s) => ({
        appearances: acc.appearances + 1,
        goals: acc.goals + (s.goals ?? 0),
        assists: acc.assists + (s.assists ?? 0),
        minutesPlayed: acc.minutesPlayed + (s.minutesPlayed ?? 0),
        yellowCards: acc.yellowCards + (s.yellowCards ?? 0),
        redCards: acc.redCards + (s.redCards ?? 0),
        saves: acc.saves + (s.saves ?? 0),
        cleanSheets: acc.cleanSheets + ((s.cleanSheet ?? false) ? 1 : 0),
      }),
      { appearances: 0, goals: 0, assists: 0, minutesPlayed: 0, yellowCards: 0, redCards: 0, saves: 0, cleanSheets: 0 },
    );

    const avgRating =
      ratings.length > 0 ? ratings.reduce((s, r) => s + r.performanceRating, 0) / ratings.length : null;

    return {
      player: {
        id: player.id,
        name: player.name,
        position: player.position,
        nationality: player.nationality,
        dateOfBirth: player.dateOfBirth,
        number: player.number,
        team: player.team,
      },
      seasonId,
      seasonAggregate: aggregate,
      averageRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      recentRatings: ratings.map(r => ({
        fixture: r.fixture,
        performanceRating: r.performanceRating,
        ratingStatus: r.ratingStatus,
        sourceType: r.sourceType,
        provenanceNote: 'PSL One performance rating. Provisional until FINAL status.',
      })),
      dataProvenance: DEFAULT_PROVENANCE,
    };
  }

  // ── Admin: Standings ──────────────────────────────────────────────────────

  async adminUpsertStandings(operatorUserId: string, dto: UpsertStandingsDto) {
    let updated = 0;
    const src = dto.sourceType ?? DataSourceType.MANUAL;
    const status = dto.dataStatus ?? DataStatus.PROVISIONAL;

    for (const entry of dto.entries) {
      const gd = entry.goalDifference ?? entry.goalsFor - entry.goalsAgainst;
      const baseFields = {
        position: entry.position,
        played: entry.played,
        won: entry.won,
        drawn: entry.drawn,
        lost: entry.lost,
        goalsFor: entry.goalsFor,
        goalsAgainst: entry.goalsAgainst,
        goalDifference: gd,
        points: entry.points,
        ...(entry.form !== undefined ? { form: entry.form } : {}),
        sourceType: src,
        dataStatus: status,
        freshnessStatus: FreshnessStatus.FRESH,
        lastUpdatedAt: new Date(),
      } satisfies Prisma.LeagueStandingUpdateInput;
      await this.prisma.leagueStanding.upsert({
        where: { seasonId_clubId: { seasonId: dto.seasonId, clubId: entry.clubId } },
        create: { seasonId: dto.seasonId, clubId: entry.clubId, ...baseFields },
        update: baseFields,
      });
      updated++;
    }

    await this._logIngestion('STANDING', dto.seasonId, src, status, operatorUserId, `Batch upsert ${updated} standings`);
    return { updated, seasonId: dto.seasonId };
  }

  async adminUpsertStanding(operatorUserId: string, seasonId: string, entry: UpsertStandingEntryDto) {
    const gd = entry.goalDifference ?? entry.goalsFor - entry.goalsAgainst;
    const result = await this.prisma.leagueStanding.upsert({
      where: { seasonId_clubId: { seasonId, clubId: entry.clubId } },
      create: {
        seasonId,
        clubId: entry.clubId,
        position: entry.position,
        played: entry.played,
        won: entry.won,
        drawn: entry.drawn,
        lost: entry.lost,
        goalsFor: entry.goalsFor,
        goalsAgainst: entry.goalsAgainst,
        goalDifference: gd,
        points: entry.points,
        ...(entry.form !== undefined ? { form: entry.form } : {}),
        sourceType: DataSourceType.MANUAL,
        dataStatus: DataStatus.PROVISIONAL,
        freshnessStatus: FreshnessStatus.FRESH,
        lastUpdatedAt: new Date(),
      },
      update: {
        position: entry.position,
        played: entry.played,
        won: entry.won,
        drawn: entry.drawn,
        lost: entry.lost,
        goalsFor: entry.goalsFor,
        goalsAgainst: entry.goalsAgainst,
        goalDifference: gd,
        points: entry.points,
        ...(entry.form !== undefined ? { form: entry.form } : {}),
        freshnessStatus: FreshnessStatus.FRESH,
        lastUpdatedAt: new Date(),
      },
    });
    await this._logIngestion('STANDING', `${seasonId}:${entry.clubId}`, DataSourceType.MANUAL, DataStatus.PROVISIONAL, operatorUserId);
    return result;
  }

  // ── Admin: Team Form ──────────────────────────────────────────────────────

  async adminUpsertTeamForm(operatorUserId: string, clubId: string, dto: UpsertTeamFormDto) {
    const src = dto.sourceType ?? DataSourceType.MANUAL;
    const result = await this.prisma.teamFormRecord.upsert({
      where: { clubId_seasonId: { clubId, seasonId: dto.seasonId } },
      create: {
        clubId,
        seasonId: dto.seasonId,
        formString: dto.formString,
        recentFixtures: dto.recentFixtures as Prisma.InputJsonValue,
        sourceType: src,
        dataStatus: DataStatus.PROVISIONAL,
        lastUpdatedAt: new Date(),
      },
      update: {
        formString: dto.formString,
        recentFixtures: dto.recentFixtures as Prisma.InputJsonValue,
        sourceType: src,
        lastUpdatedAt: new Date(),
      },
    });
    await this._logIngestion('TEAM_FORM', clubId, src, DataStatus.PROVISIONAL, operatorUserId);
    return result;
  }

  // ── Admin: Player Ratings ─────────────────────────────────────────────────

  async adminUpsertPlayerRating(operatorUserId: string, dto: UpsertPlayerRatingDto) {
    if (dto.performanceRating < 0 || dto.performanceRating > 10)
      throw new Error('performanceRating must be 0–10');

    const src = dto.sourceType ?? DataSourceType.MANUAL;
    const existing = await this.prisma.playerRating.findUnique({
      where: { playerId_fixtureId: { playerId: dto.playerId, fixtureId: dto.fixtureId } },
    });

    const result = await this.prisma.playerRating.upsert({
      where: { playerId_fixtureId: { playerId: dto.playerId, fixtureId: dto.fixtureId } },
      create: {
        playerId: dto.playerId,
        fixtureId: dto.fixtureId,
        performanceRating: dto.performanceRating,
        minutesPlayed: dto.minutesPlayed ?? 0,
        goals: dto.goals ?? 0,
        assists: dto.assists ?? 0,
        yellowCards: dto.yellowCards ?? 0,
        redCards: dto.redCards ?? 0,
        sourceType: src,
        ratingSource: dto.ratingSource ?? 'MANUAL',
        providerKey: dto.providerKey ?? null,
        ratingStatus: DataStatus.PROVISIONAL,
        ratingVersion: 1,
        lastUpdatedAt: new Date(),
      },
      update: {
        performanceRating: dto.performanceRating,
        ...(dto.minutesPlayed !== undefined ? { minutesPlayed: dto.minutesPlayed } : {}),
        ...(dto.goals !== undefined ? { goals: dto.goals } : {}),
        ...(dto.assists !== undefined ? { assists: dto.assists } : {}),
        ...(dto.yellowCards !== undefined ? { yellowCards: dto.yellowCards } : {}),
        ...(dto.redCards !== undefined ? { redCards: dto.redCards } : {}),
        sourceType: src,
        ...(dto.ratingSource !== undefined ? { ratingSource: dto.ratingSource } : {}),
        providerKey: dto.providerKey ?? null,
        ratingVersion: { increment: existing ? 1 : 0 },
        lastUpdatedAt: new Date(),
      },
    });

    await this._logIngestion('PLAYER_RATING', `${dto.playerId}:${dto.fixtureId}`, src, DataStatus.PROVISIONAL, operatorUserId);
    return result;
  }

  // ── Admin: Sandbox Ingestion ──────────────────────────────────────────────

  async adminIngestSandboxData(operatorUserId: string, dto: IngestMatchDataDto) {
    const src = dto.sourceType ?? DataSourceType.SANDBOX_PROVIDER;

    switch (dto.entityType) {
      case 'LINEUP': {
        const players = dto.data.players as Array<{ playerId: string; teamId: string; shirtNumber?: number; position?: string; status?: string }>;
        for (const p of players) {
          const exists = await this.prisma.fixtureLineup.findFirst({
            where: { fixtureId: dto.fixtureId, playerId: p.playerId },
          });
          if (!exists) {
            await this.prisma.fixtureLineup.create({
              data: {
                fixtureId: dto.fixtureId,
                teamId: p.teamId,
                playerId: p.playerId,
                shirtNumber: p.shirtNumber ?? null,
                position: p.position ?? null,
                status: (p.status as LineupStatus) ?? LineupStatus.STARTING,
              },
            });
          }
        }
        // Fire campaign trigger — failure must not break ingestion
        void this.campaignTrigger.fireLineupConfirmed(dto.fixtureId);
        break;
      }
      case 'MATCH_EVENT': {
        const e = dto.data as { teamId?: string; playerId?: string; relatedPlayerId?: string; minute: number; stoppageMinute?: number; eventType: string; description?: string };
        const event = await this.prisma.matchEvent.create({
          data: {
            fixtureId: dto.fixtureId,
            teamId: e.teamId ?? null,
            playerId: e.playerId ?? null,
            relatedPlayerId: e.relatedPlayerId ?? null,
            minute: e.minute,
            stoppageMinute: e.stoppageMinute ?? null,
            eventType: e.eventType as never,
            description: e.description ?? null,
            source: src,
          },
        });
        // Fire campaign triggers based on event type
        if (e.eventType === MatchEventType.GOAL || e.eventType === MatchEventType.PENALTY_SCORED) {
          void this.campaignTrigger.fireGoalScored(dto.fixtureId, event.id);
        } else if (e.eventType === MatchEventType.KICKOFF) {
          void this.campaignTrigger.fireMatchStarted(dto.fixtureId);
        } else if (e.eventType === MatchEventType.HALF_TIME) {
          void this.campaignTrigger.fireHalfTime(dto.fixtureId);
        } else if (e.eventType === MatchEventType.FULL_TIME) {
          void this.campaignTrigger.fireFullTime(dto.fixtureId);
          void this.campaignTrigger.firePredictionResultAvailable(dto.fixtureId);
        }
        break;
      }
      case 'PLAYER_RATING': {
        await this.adminUpsertPlayerRating(operatorUserId, {
          ...dto.data as UpsertPlayerRatingDto,
          fixtureId: dto.fixtureId,
          sourceType: src,
        });
        break;
      }
      case 'STANDING': {
        const s = dto.data as { seasonId: string; entries: UpsertStandingEntryDto[] };
        await this.adminUpsertStandings(operatorUserId, { ...s, sourceType: src });
        break;
      }
      default:
        break;
    }

    await this._logIngestion(dto.entityType, dto.fixtureId, src, DataStatus.PROVISIONAL, operatorUserId, dto.notes);
    return { entityType: dto.entityType, entityId: dto.fixtureId, processed: true, sourceType: src };
  }

  // ── Admin: Ingestion Log ──────────────────────────────────────────────────

  async adminGetIngestionLog(filters: { entityType?: string; entityId?: string; sourceType?: DataSourceType; limit?: number }) {
    return this.prisma.dataIngestionLog.findMany({
      where: {
        ...(filters.entityType ? { entityType: filters.entityType } : {}),
        ...(filters.entityId ? { entityId: filters.entityId } : {}),
        ...(filters.sourceType ? { sourceType: filters.sourceType } : {}),
      },
      orderBy: { ingestedAt: 'desc' },
      take: filters.limit ?? 50,
    });
  }

  async adminGetDataProvenance(entityType: string, entityId: string) {
    return this.prisma.dataIngestionLog.findMany({
      where: { entityType, entityId },
      orderBy: { ingestedAt: 'desc' },
    });
  }

  async adminGetCapabilityStatus() {
    return {
      richUI: 'ENABLED',
      dataSource: 'MANUAL_AND_SEEDED',
      adminIngestion: 'SANDBOX_READY',
      providerAbstraction: 'INTEGRATION_READY',
      officialProviderFeed: 'PROVIDER_REQUIRED',
      productionDataRights: 'APPROVAL_REQUIRED',
      productionCredentials: 'CONFIGURATION_REQUIRED',
      productionIngestion: 'DISABLED',
      availableSourceTypes: [DataSourceType.MANUAL, DataSourceType.SEEDED, DataSourceType.SANDBOX_PROVIDER],
      pendingSourceTypes: [DataSourceType.OFFICIAL_PROVIDER],
      officialProviderSwapStrategy: [
        'Implement a new provider adapter implementing the MatchDataAdapter interface',
        'Configure provider mappings (team ID, player ID, fixture ID)',
        'Supply credentials through environment/vault configuration only',
        'Run mapping validation in sandbox mode first',
        'Enable ingestion through admin controls',
        'Do NOT change fan route contracts',
        'Do NOT replace domain models',
        'Do NOT rebuild the Match Centre UI',
      ],
    };
  }
}
