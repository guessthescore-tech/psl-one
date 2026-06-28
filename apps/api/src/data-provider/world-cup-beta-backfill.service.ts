import { Logger } from '@nestjs/common';
import {
  CompetitionFormat,
  PlayerPosition,
  PrismaClient,
  PredictionRulesStatus,
  SeasonStatus,
  SeasonTeamSource,
  SeasonTeamStatus,
  SquadRegistrationSource,
  SquadRegistrationStatus,
} from '@prisma/client';
import type { ProviderAdapter, ProviderPlayer, ProviderSeason, ProviderTeam } from './provider-adapter.interface';
import { SportmonksAdapter } from './sportmonks.adapter';
import { TEAMS } from './world-cup-beta-teams';
import { PLAYERS } from './world-cup-beta-players';

const BACKFILL_CONFIRM = 'BACKFILL_WORLD_CUP_BETA';
const WC_COMPETITION_SLUG = 'fifa-world-cup';
const WC_SEASON_SLUG = 'fifa-world-cup-2026';

const WC_PRICE: Record<PlayerPosition, number> = {
  GOALKEEPER: 55,
  DEFENDER: 50,
  MIDFIELDER: 70,
  FORWARD: 85,
};

const WC_FANTASY_RULES = {
  squadSize: 15,
  goalkeeperCount: 2,
  defenderCount: 5,
  midfielderCount: 5,
  forwardCount: 3,
  startingXiSize: 11,
  minStartingGoalkeepers: 1,
  maxStartingGoalkeepers: 1,
  minStartingDefenders: 3,
  minStartingMidfielders: 2,
  minStartingForwards: 1,
  benchSize: 4,
  freeTransfersPerGameweek: 1,
  maxSavedFreeTransfers: 5,
  extraTransferCost: 4,
  maxTransfersPerGameweek: 20,
  deadlineOffsetMinutes: 90,
  wildcardCount: 2,
  freeHitCount: 2,
  benchBoostCount: 2,
  tripleCaptainCount: 2,
  chipsEnabled: true,
  wildcardEnabled: true,
  freeHitEnabled: true,
  benchBoostEnabled: true,
  tripleCaptainEnabled: true,
  freeHitConsecutiveGameweekBlocked: true,
  halfwayGameweek: 5,
  seasonGameweekCount: 9,
  minPrice: 40,
  maxPrice: 200,
  defaultPrice: 55,
} as const;

const WC_PREDICTION_RULES = {
  correctScorePoints: 10,
  correctGoalDifferencePoints: 5,
  correctResultPoints: 3,
  participationPoints: 0,
  challengeWinPoints: 0,
  challengeDrawPoints: 0,
  lockMinutesBeforeKickoff: 0,
  status: PredictionRulesStatus.PROVISIONAL,
} as const;

export interface WorldCupBetaBackfillResult {
  dryRun: boolean;
  provider: string;
  seasonId: string;
  competitionId: string;
  providerSeasonId: string | null;
  teamsPlanned: number;
  teamsMatchedToProvider: number;
  playersPlanned: number;
  playersMatchedToProvider: number;
  playersExternalIdsBackfilled: number;
  seasonTeamsUpserted: number;
  fantasyPricesUpserted: number;
  fantasyRulesUpserted: number;
  predictionRulesUpserted: number;
  squadRegistrationsUpserted: number;
  fallbackToSeedData: boolean;
  unmappedTeams: Array<{ seedTeam: string; reason: string }>;
  unmappedPlayers: Array<{ team: string; player: string; reason: string }>;
}

export interface WorldCupBetaBackfillOptions {
  dryRun: boolean;
  confirm?: string;
}

type TeamSeed = (typeof TEAMS)[number];
type PlayerSeed = (typeof PLAYERS)[number];

export class WorldCupBetaBackfillService {
  private readonly logger = new Logger(WorldCupBetaBackfillService.name);
  private readonly provider: ProviderAdapter | null;

  constructor(
    private readonly prisma: PrismaClient,
    provider?: ProviderAdapter | null,
  ) {
    this.provider = provider ?? (process.env['SPORTMONKS_API_KEY'] ? new SportmonksAdapter() : null);
  }

  static confirmToken = BACKFILL_CONFIRM;

  async run(options: WorldCupBetaBackfillOptions): Promise<WorldCupBetaBackfillResult> {
    const dryRun = options.dryRun;
    if (!dryRun) {
      if (options.confirm !== BACKFILL_CONFIRM) {
        throw new Error(`Confirmed backfill requires --confirm=${BACKFILL_CONFIRM}`);
      }
      if (process.env['ALLOW_WORLD_CUP_WRITE'] !== 'true') {
        throw new Error('ALLOW_WORLD_CUP_WRITE=true is required for World Cup beta backfill');
      }
    }

    const { competition, season } = await this.ensureCompetitionAndSeason(dryRun);
    const providerContext = await this.loadProviderContext();
    const rulesSummary = await this.upsertRules(season.id, dryRun);

    const teamSummary = await this.upsertTeams(competition.id, season.id, providerContext, dryRun);
    const playerSummary = await this.upsertPlayers(season.id, teamSummary.teamMap, providerContext, dryRun);
    const priceSummary = await this.upsertFantasyPrices(season.id, playerSummary.playerIds, dryRun);

    return {
      dryRun,
      provider: providerContext.providerName,
      seasonId: season.id,
      competitionId: competition.id,
      providerSeasonId: providerContext.providerSeasonId,
      teamsPlanned: TEAMS.length,
      teamsMatchedToProvider: teamSummary.teamsMatchedToProvider,
      playersPlanned: PLAYERS.length,
      playersMatchedToProvider: playerSummary.playersMatchedToProvider,
      playersExternalIdsBackfilled: playerSummary.playersExternalIdsBackfilled,
      seasonTeamsUpserted: teamSummary.seasonTeamsUpserted,
      fantasyPricesUpserted: priceSummary.fantasyPricesUpserted,
      fantasyRulesUpserted: rulesSummary.fantasyRulesUpserted,
      predictionRulesUpserted: rulesSummary.predictionRulesUpserted,
      squadRegistrationsUpserted: playerSummary.squadRegistrationsUpserted,
      fallbackToSeedData: providerContext.fallbackToSeedData,
      unmappedTeams: teamSummary.unmappedTeams,
      unmappedPlayers: playerSummary.unmappedPlayers,
    };
  }

  private async upsertRules(
    seasonId: string,
    dryRun: boolean,
  ): Promise<{ fantasyRulesUpserted: number; predictionRulesUpserted: number }> {
    if (dryRun) {
      const [fantasyRules, predictionRules] = await Promise.all([
        this.prisma.fantasyRulesConfig.findUnique({ where: { seasonId }, select: { id: true } }),
        this.prisma.predictionRulesConfig.findUnique({ where: { seasonId }, select: { id: true } }),
      ]);
      return {
        fantasyRulesUpserted: fantasyRules ? 0 : 1,
        predictionRulesUpserted: predictionRules ? 0 : 1,
      };
    }

    await this.prisma.fantasyRulesConfig.upsert({
      where: { seasonId },
      create: { seasonId, ...WC_FANTASY_RULES },
      update: { ...WC_FANTASY_RULES },
    });
    await this.prisma.predictionRulesConfig.upsert({
      where: { seasonId },
      create: { seasonId, ...WC_PREDICTION_RULES },
      update: { ...WC_PREDICTION_RULES },
    });

    return {
      fantasyRulesUpserted: 1,
      predictionRulesUpserted: 1,
    };
  }

  private async loadProviderContext(): Promise<{
    providerName: string;
    providerSeasonId: string | null;
    providerTeams: ProviderTeam[];
    providerPlayersByTeamId: Map<string, ProviderPlayer[]>;
    fallbackToSeedData: boolean;
  }> {
    if (!this.provider) {
      return {
        providerName: 'seed-only',
        providerSeasonId: null,
        providerTeams: [],
        providerPlayersByTeamId: new Map(),
        fallbackToSeedData: true,
      };
    }

    const seasons = await this.provider.getSeasons();
    const providerSeason = this.pickWorldCupSeason(seasons);
    if (!providerSeason) {
      this.logger.warn('World Cup backfill: provider season not found — using seed data only');
      return {
        providerName: this.provider.name,
        providerSeasonId: null,
        providerTeams: [],
        providerPlayersByTeamId: new Map(),
        fallbackToSeedData: true,
      };
    }

    const providerTeams = await this.provider.getTeams(providerSeason.externalId);
    const providerPlayersByTeamId = new Map<string, ProviderPlayer[]>();
    for (const providerTeam of providerTeams) {
      const players = await this.provider.getPlayers(providerTeam.externalId);
      providerPlayersByTeamId.set(providerTeam.externalId, players);
    }

    return {
      providerName: this.provider.name,
      providerSeasonId: providerSeason.externalId,
      providerTeams,
      providerPlayersByTeamId,
      fallbackToSeedData: false,
    };
  }

  private pickWorldCupSeason(seasons: ProviderSeason[]): ProviderSeason | null {
    const normalised = seasons.find((s) => {
      const text = `${s.name} ${s.competitionName}`.toLowerCase();
      return text.includes('world cup') && text.includes('2026');
    });
    return normalised ?? seasons.find((s) => s.name.toLowerCase().includes('world cup')) ?? seasons[0] ?? null;
  }

  private async ensureCompetitionAndSeason(dryRun: boolean): Promise<{
    competition: { id: string };
    season: { id: string };
  }> {
    const competitionData = {
      name: 'FIFA World Cup',
      slug: WC_COMPETITION_SLUG,
      format: CompetitionFormat.HYBRID,
      teamCount: 48,
      hasGroups: true,
      hasKnockouts: true,
      hasHomeAway: true,
      usesNeutralVenues: true,
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
    };

    const seasonData = {
      competitionId: '',
      name: 'FIFA World Cup 2026',
      slug: WC_SEASON_SLUG,
      startDate: new Date('2026-06-11'),
      endDate: new Date('2026-07-19'),
      isActive: true,
      status: SeasonStatus.ACTIVE,
    };

    if (dryRun) {
      const competition = await this.prisma.competition.findFirst({
        where: { slug: WC_COMPETITION_SLUG },
        select: { id: true },
      });
      const season = await this.prisma.season.findFirst({
        where: { slug: WC_SEASON_SLUG },
        select: { id: true },
      });
      return {
        competition: { id: competition?.id ?? 'dry-run-competition' },
        season: { id: season?.id ?? 'dry-run-season' },
      };
    }

    const competition = await this.prisma.competition.upsert({
      where: { slug: WC_COMPETITION_SLUG },
      create: competitionData,
      update: competitionData,
      select: { id: true },
    });

    const season = await this.prisma.season.upsert({
      where: { slug: WC_SEASON_SLUG },
      create: { ...seasonData, competitionId: competition.id },
      update: { ...seasonData, competitionId: competition.id },
      select: { id: true },
    });

    return { competition, season };
  }

  private async upsertTeams(
    competitionId: string,
    seasonId: string,
    providerContext: Awaited<ReturnType<typeof this.loadProviderContext>>,
    dryRun: boolean,
  ): Promise<{
    teamMap: Map<string, { id: string; providerTeamId: string | null }>;
    seasonTeamsUpserted: number;
    teamsMatchedToProvider: number;
    unmappedTeams: Array<{ seedTeam: string; reason: string }>;
  }> {
    const teamMap = new Map<string, { id: string; providerTeamId: string | null }>();
    const unmappedTeams: Array<{ seedTeam: string; reason: string }> = [];
    let seasonTeamsUpserted = 0;
    let teamsMatchedToProvider = 0;

    const providerTeamsByCode = new Map(
      providerContext.providerTeams.map((team) => [normalise(team.shortName), team] as const),
    );
    const providerTeamsByName = new Map(
      providerContext.providerTeams.map((team) => [normalise(team.name), team] as const),
    );

    for (const seedTeam of TEAMS) {
      const providerTeam = this.resolveProviderTeam(seedTeam, providerTeamsByCode, providerTeamsByName);
      if (providerTeam) teamsMatchedToProvider++;
      else if (!providerContext.fallbackToSeedData) {
        unmappedTeams.push({
          seedTeam: seedTeam.name,
          reason: 'No matching provider team found — seed data only row will be used',
        });
      }

      const sourceUrl = providerContext.providerSeasonId
        ? `https://api.sportmonks.com/v3/football/seasons/${providerContext.providerSeasonId}`
        : null;
      const teamData = {
        name: providerTeam?.name ?? seedTeam.name,
        slug: seedTeam.slug,
        shortName: providerTeam?.shortName ?? seedTeam.shortName,
        country: seedTeam.country,
        externalId: providerTeam?.externalId ?? seedTeam.externalId,
        source: seedTeam.source,
        importedAt: new Date(),
        ...(sourceUrl ? { sourceUrl } : {}),
      };

      if (dryRun) {
        const existing = await this.prisma.team.findFirst({
          where: {
            OR: [
              { slug: seedTeam.slug },
              { name: seedTeam.name },
              { shortName: seedTeam.shortName },
              providerTeam?.externalId ? { externalId: providerTeam.externalId } : { id: '__never__' },
            ],
          },
          select: { id: true, externalId: true },
        });
        teamMap.set(seedTeam.externalId, {
          id: existing?.id ?? `dry-run-team:${seedTeam.externalId}`,
          providerTeamId: providerTeam?.externalId ?? null,
        });
        continue;
      }

      const existing = await this.prisma.team.findFirst({
        where: {
          OR: [
            { slug: seedTeam.slug },
            { name: seedTeam.name },
            { shortName: seedTeam.shortName },
            providerTeam?.externalId ? { externalId: providerTeam.externalId } : { id: '__never__' },
          ],
        },
        select: { id: true },
      });

      const team = existing
        ? await this.prisma.team.update({
            where: { id: existing.id },
            data: teamData,
            select: { id: true },
          })
        : await this.prisma.team.create({
            data: teamData,
            select: { id: true },
          });

      await this.prisma.seasonTeam.upsert({
        where: { seasonId_teamId: { seasonId, teamId: team.id } },
        create: {
          seasonId,
          teamId: team.id,
          status: SeasonTeamStatus.ACTIVE,
          source: SeasonTeamSource.IMPORT,
        },
        update: {
          status: SeasonTeamStatus.ACTIVE,
          source: SeasonTeamSource.IMPORT,
        },
      });
      seasonTeamsUpserted++;
      teamMap.set(seedTeam.externalId, {
        id: team.id,
        providerTeamId: providerTeam?.externalId ?? null,
      });
    }

    return { teamMap, seasonTeamsUpserted, teamsMatchedToProvider, unmappedTeams };
  }

  private resolveProviderTeam(
    seedTeam: TeamSeed,
    providerTeamsByCode: Map<string, ProviderTeam>,
    providerTeamsByName: Map<string, ProviderTeam>,
  ): ProviderTeam | null {
    const codeMatch = providerTeamsByCode.get(normalise(seedTeam.externalId));
    if (codeMatch) return codeMatch;
    const nameMatch = providerTeamsByName.get(normalise(seedTeam.name));
    if (nameMatch) return nameMatch;
    return null;
  }

  private async upsertPlayers(
    seasonId: string,
    teamMap: Map<string, { id: string; providerTeamId: string | null }>,
    providerContext: Awaited<ReturnType<typeof this.loadProviderContext>>,
    dryRun: boolean,
  ): Promise<{
    playerIds: string[];
    playersMatchedToProvider: number;
    playersExternalIdsBackfilled: number;
    squadRegistrationsUpserted: number;
    unmappedPlayers: Array<{ team: string; player: string; reason: string }>;
  }> {
    const playersByTeam = new Map<string, PlayerSeed[]>();
    for (const player of PLAYERS) {
      const list = playersByTeam.get(player.teamExternalId) ?? [];
      list.push(player);
      playersByTeam.set(player.teamExternalId, list);
    }

    const playerIds: string[] = [];
    const unmappedPlayers: Array<{ team: string; player: string; reason: string }> = [];
    let playersMatchedToProvider = 0;
    let playersExternalIdsBackfilled = 0;
    let squadRegistrationsUpserted = 0;

    for (const [seedTeamCode, seedPlayers] of playersByTeam.entries()) {
      const team = teamMap.get(seedTeamCode);
      if (!team) {
        unmappedPlayers.push({
          team: seedTeamCode,
          player: '*',
          reason: 'No team row available for player backfill',
        });
        continue;
      }

      const providerPlayers = team.providerTeamId
        ? providerContext.providerPlayersByTeamId.get(team.providerTeamId) ?? []
        : [];
      const providerPlayersByName = new Map(providerPlayers.map((player) => [normalise(player.name), player] as const));

      for (const seedPlayer of seedPlayers) {
        const matchedProviderPlayer = providerPlayersByName.get(normalise(seedPlayer.name)) ?? null;
        if (matchedProviderPlayer) playersMatchedToProvider++;
        squadRegistrationsUpserted++;

        const playerPosition = seedPlayer.position as PlayerPosition;
        const existing = dryRun
          ? await this.prisma.player.findFirst({
              where: {
                teamId: team.id,
                name: seedPlayer.name,
                position: playerPosition,
              },
              select: { id: true, externalId: true },
            })
          : await this.prisma.player.findFirst({
              where: {
                teamId: team.id,
                name: seedPlayer.name,
                position: playerPosition,
              },
              select: { id: true, externalId: true },
            });

        if (!existing && dryRun) {
          playerIds.push(`dry-run-player:${seedTeamCode}:${seedPlayer.name}`);
          continue;
        }

        const baseData = {
          teamId: team.id,
          name: seedPlayer.name,
          position: playerPosition,
          nationality: seedPlayer.nationality,
          source: seedPlayer.source,
          importedAt: new Date(),
          ...(seedPlayer.number !== undefined ? { number: seedPlayer.number } : {}),
        };

        if (dryRun) {
          if (matchedProviderPlayer?.externalId && !existing?.externalId) {
            playersExternalIdsBackfilled++;
          }
          playerIds.push(existing?.id ?? `dry-run-player:${seedTeamCode}:${seedPlayer.name}`);
          continue;
        }

        let playerId: string;
        if (existing) {
          const updated = await this.prisma.player.update({
            where: { id: existing.id },
            data: {
              ...baseData,
              ...(matchedProviderPlayer?.externalId ? { externalId: matchedProviderPlayer.externalId } : {}),
            },
            select: { id: true },
          });
          playerId = updated.id;
          if (matchedProviderPlayer?.externalId && !existing.externalId) {
            playersExternalIdsBackfilled++;
          }
        } else {
          const created = await this.prisma.player.create({
            data: {
              ...baseData,
              ...(matchedProviderPlayer?.externalId ? { externalId: matchedProviderPlayer.externalId } : {}),
            },
            select: { id: true },
          });
          playerId = created.id;
          if (matchedProviderPlayer?.externalId) {
            playersExternalIdsBackfilled++;
          }
        }

        await this.prisma.seasonSquadRegistration.upsert({
          where: { seasonId_playerId: { seasonId, playerId } },
          create: {
            seasonId,
            teamId: team.id,
            playerId,
            status: SquadRegistrationStatus.PROVISIONAL,
            source: SquadRegistrationSource.IMPORT,
            registeredAt: new Date(),
            ...(seedPlayer.number !== undefined ? { shirtNumber: seedPlayer.number } : {}),
          },
          update: {
            teamId: team.id,
            ...(seedPlayer.number !== undefined ? { shirtNumber: seedPlayer.number } : {}),
          },
        });

        playerIds.push(playerId);
      }
    }

    return {
      playerIds,
      playersMatchedToProvider,
      playersExternalIdsBackfilled,
      squadRegistrationsUpserted,
      unmappedPlayers,
    };
  }

  private async upsertFantasyPrices(
    seasonId: string,
    playerIds: string[],
    dryRun: boolean,
  ): Promise<{ fantasyPricesUpserted: number }> {
    if (dryRun) {
      return { fantasyPricesUpserted: playerIds.length };
    }

    const players = await this.prisma.player.findMany({
      where: { id: { in: playerIds } },
      select: { id: true, position: true },
    });

    let fantasyPricesUpserted = 0;
    for (const player of players) {
      const price = WC_PRICE[player.position];
      await this.prisma.fantasyPlayerPrice.upsert({
        where: { playerId_seasonId: { playerId: player.id, seasonId } },
        create: { playerId: player.id, seasonId, price },
        update: {},
      });
      fantasyPricesUpserted++;
    }

    return { fantasyPricesUpserted };
  }
}

function normalise(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase();
}
