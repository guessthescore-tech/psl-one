import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  FantasySquadRole,
  FixtureStatus,
  LineupStatus,
  MatchEventType,
  PlayerPosition,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AchievementsService } from '../achievements/achievements.service';
import { FantasyLeagueService } from './fantasy-league.service';
import { CreateFantasyTeamDto } from './dto/create-fantasy-team.dto';
import { FantasyPlayerSlotDto } from './dto/fantasy-player-slot.dto';
import { TransferDto } from './dto/transfer.dto';
import { UpdateFantasyTeamDto } from './dto/update-fantasy-team.dto';
import { UpdatePlayerSlotDto } from './dto/update-player-slot.dto';

// ── Validation ────────────────────────────────────────────────────────────────

const ALLOWED_FORMATIONS = ['3-4-3', '3-5-2', '4-3-3', '4-4-2', '4-5-1', '5-3-2', '5-4-1'] as const;
const WC_SEASON_SLUG = 'fifa-world-cup-2026';
const WC_PLAYER_SOURCE = 'fifa-wc2026';

export interface SquadValidationResult {
  isValid: boolean;
  errors: string[];
  squadCounts: { goalkeepers: number; defenders: number; midfielders: number; forwards: number };
  starterCounts: { goalkeepers: number; defenders: number; midfielders: number; forwards: number };
  formation: string | null;
  benchSummary: string;
  captainValid: boolean;
  viceCaptainValid: boolean;
  maxPerTeamValid: boolean;
  budgetValid: boolean;
}

interface PlayerDetail {
  id: string;
  position: PlayerPosition;
  teamId: string;
  name: string;
  price: number;
}

// Squad value cap in millions — fantasy points only, no cash value.
const BUDGET_CAP_MILLIONS = 100;

function deriveFormation(defCount: number, midCount: number, fwdCount: number): string {
  return `${defCount}-${midCount}-${fwdCount}`;
}

interface SquadConfig {
  squadSize: number;
  startingXiSize: number;
  benchSize: number;
  goalkeeperCount: number;
  defenderCount: number;
  midfielderCount: number;
  forwardCount: number;
  minStartingGoalkeepers: number;
  maxStartingGoalkeepers: number;
  minStartingDefenders: number;
  minStartingMidfielders: number;
  minStartingForwards: number;
}

const DEFAULT_SQUAD_CONFIG: SquadConfig = {
  squadSize: 15,
  startingXiSize: 11,
  benchSize: 4,
  goalkeeperCount: 2,
  defenderCount: 5,
  midfielderCount: 5,
  forwardCount: 3,
  minStartingGoalkeepers: 1,
  maxStartingGoalkeepers: 1,
  minStartingDefenders: 3,
  minStartingMidfielders: 2,
  minStartingForwards: 1,
};

function validateSquadComposition(
  slots: FantasyPlayerSlotDto[],
  playerDetails: PlayerDetail[],
  config: SquadConfig = DEFAULT_SQUAD_CONFIG,
): SquadValidationResult {
  const errors: string[] = [];
  const playerById = new Map(playerDetails.map(p => [p.id, p]));

  if (slots.length !== config.squadSize) errors.push(`Squad must have exactly ${config.squadSize} players (got ${slots.length})`);

  const starters = slots.filter(s => s.squadRole === FantasySquadRole.STARTER);
  const subs = slots.filter(s => s.squadRole === FantasySquadRole.SUBSTITUTE);

  if (starters.length !== config.startingXiSize) errors.push(`Starting XI must have exactly ${config.startingXiSize} players (got ${starters.length})`);
  if (subs.length !== config.benchSize) errors.push(`Bench must have exactly ${config.benchSize} players (got ${subs.length})`);

  // Count positions in full squad
  const posCount = (pos: PlayerPosition) =>
    slots.filter(s => playerById.get(s.playerId)?.position === pos).length;

  const squadCounts = {
    goalkeepers: posCount(PlayerPosition.GOALKEEPER),
    defenders: posCount(PlayerPosition.DEFENDER),
    midfielders: posCount(PlayerPosition.MIDFIELDER),
    forwards: posCount(PlayerPosition.FORWARD),
  };

  if (squadCounts.goalkeepers !== config.goalkeeperCount) errors.push(`Squad must have exactly ${config.goalkeeperCount} goalkeepers (got ${squadCounts.goalkeepers})`);
  if (squadCounts.defenders !== config.defenderCount) errors.push(`Squad must have exactly ${config.defenderCount} defenders (got ${squadCounts.defenders})`);
  if (squadCounts.midfielders !== config.midfielderCount) errors.push(`Squad must have exactly ${config.midfielderCount} midfielders (got ${squadCounts.midfielders})`);
  if (squadCounts.forwards !== config.forwardCount) errors.push(`Squad must have exactly ${config.forwardCount} forwards (got ${squadCounts.forwards})`);

  // Starting XI formation rules
  const starterPos = (pos: PlayerPosition) =>
    starters.filter(s => playerById.get(s.playerId)?.position === pos).length;

  const starterCounts = {
    goalkeepers: starterPos(PlayerPosition.GOALKEEPER),
    defenders: starterPos(PlayerPosition.DEFENDER),
    midfielders: starterPos(PlayerPosition.MIDFIELDER),
    forwards: starterPos(PlayerPosition.FORWARD),
  };

  if (starterCounts.goalkeepers < config.minStartingGoalkeepers) errors.push(`Starting XI must have at least ${config.minStartingGoalkeepers} goalkeeper (got ${starterCounts.goalkeepers})`);
  if (starterCounts.goalkeepers > config.maxStartingGoalkeepers) errors.push(`Starting XI must have at most ${config.maxStartingGoalkeepers} goalkeeper (got ${starterCounts.goalkeepers})`);
  if (starterCounts.defenders < config.minStartingDefenders) errors.push(`Starting XI must have at least ${config.minStartingDefenders} defenders (got ${starterCounts.defenders})`);
  if (starterCounts.midfielders < config.minStartingMidfielders) errors.push(`Starting XI must have at least ${config.minStartingMidfielders} midfielders (got ${starterCounts.midfielders})`);
  if (starterCounts.forwards < config.minStartingForwards) errors.push(`Starting XI must have at least ${config.minStartingForwards} forward (got ${starterCounts.forwards})`);

  const formationStr = deriveFormation(starterCounts.defenders, starterCounts.midfielders, starterCounts.forwards);
  const formationValid = (ALLOWED_FORMATIONS as readonly string[]).includes(formationStr);
  if (starters.length === 11 && !formationValid) {
    errors.push(`Formation ${formationStr} is not allowed. Allowed: ${ALLOWED_FORMATIONS.join(', ')}`);
  }

  // Captain / vice-captain
  const captainSlot = slots.find(s => s.isCaptain);
  const viceCaptainSlot = slots.find(s => s.isViceCaptain);
  const captainValid = !!(captainSlot && starters.some(s => s.playerId === captainSlot.playerId));
  const viceCaptainValid = !!(viceCaptainSlot && starters.some(s => s.playerId === viceCaptainSlot.playerId));

  if (!captainSlot) errors.push('Captain not assigned');
  else if (!captainValid) errors.push('Captain must be in the starting XI');

  if (!viceCaptainSlot) errors.push('Vice-captain not assigned');
  else if (!viceCaptainValid) errors.push('Vice-captain must be in the starting XI');

  if (captainSlot && viceCaptainSlot && captainSlot.playerId === viceCaptainSlot.playerId) {
    errors.push('Captain and vice-captain must be different players');
  }

  // Max 3 per real team
  const teamCounts = new Map<string, number>();
  let maxPerTeamValid = true;
  for (const slot of slots) {
    const p = playerById.get(slot.playerId);
    if (!p) continue;
    const count = (teamCounts.get(p.teamId) ?? 0) + 1;
    teamCounts.set(p.teamId, count);
    if (count > 3) {
      maxPerTeamValid = false;
    }
  }
  if (!maxPerTeamValid) errors.push('Maximum 3 players from the same real team');

  // Budget cap
  const totalPrice = slots.reduce((sum, s) => sum + (playerById.get(s.playerId)?.price ?? 0), 0);
  const budgetValid = totalPrice <= BUDGET_CAP_MILLIONS;
  if (!budgetValid) {
    errors.push(`Squad value £${totalPrice.toFixed(1)}m exceeds budget of £${BUDGET_CAP_MILLIONS}m`);
  }

  // Bench summary
  const subGK = subs.find(s => playerById.get(s.playerId)?.position === PlayerPosition.GOALKEEPER);
  const benchSummary = `GK sub: ${subGK ? 'yes' : 'no'}, outfield subs: ${subs.length - (subGK ? 1 : 0)}`;

  return {
    isValid: errors.length === 0,
    errors,
    squadCounts,
    starterCounts,
    formation: formationValid ? formationStr : null,
    benchSummary,
    captainValid,
    viceCaptainValid,
    maxPerTeamValid,
    budgetValid,
  };
}

// ── FPL Scoring Engine ───────────────────────────────────────────────────────

interface ScoringEntry {
  reason: string;
  points: number;
}

function scorePlayer(
  position: PlayerPosition,
  lineupStatus: LineupStatus | null,
  events: { eventType: MatchEventType; playerId: string | null }[],
  playerDbId: string,
  playerTeamId: string,
  homeTeamId: string,
  homeScore: number,
  awayScore: number,
): { total: number; breakdown: ScoringEntry[] } {
  const breakdown: ScoringEntry[] = [];

  const didPlay = lineupStatus === LineupStatus.STARTING || lineupStatus === LineupStatus.SUBSTITUTE;
  if (!didPlay) return { total: 0, breakdown };

  // Appearance points
  if (lineupStatus === LineupStatus.STARTING) {
    breakdown.push({ reason: 'APPEARANCE_60_PLUS', points: 2 });
  } else {
    breakdown.push({ reason: 'APPEARANCE_UNDER_60', points: 1 });
  }

  // Player's own events
  const myEvents = events.filter(e => e.playerId === playerDbId);

  for (const evt of myEvents) {
    switch (evt.eventType) {
      case MatchEventType.GOAL: {
        const reason =
          position === PlayerPosition.GOALKEEPER ? 'GOAL_GOALKEEPER' :
          position === PlayerPosition.DEFENDER ? 'GOAL_DEFENDER' :
          position === PlayerPosition.MIDFIELDER ? 'GOAL_MIDFIELDER' :
          'GOAL_FORWARD';
        const pts =
          position === PlayerPosition.GOALKEEPER ? 6 :
          position === PlayerPosition.DEFENDER ? 6 :
          position === PlayerPosition.MIDFIELDER ? 5 : 4;
        breakdown.push({ reason, points: pts });
        break;
      }
      case MatchEventType.ASSIST:
        breakdown.push({ reason: 'ASSIST', points: 3 });
        break;
      case MatchEventType.YELLOW_CARD:
        breakdown.push({ reason: 'YELLOW_CARD', points: -1 });
        break;
      case MatchEventType.RED_CARD:
        breakdown.push({ reason: 'RED_CARD', points: -3 });
        break;
      case MatchEventType.OWN_GOAL:
        breakdown.push({ reason: 'OWN_GOAL', points: -2 });
        break;
      case MatchEventType.PENALTY_MISSED:
        breakdown.push({ reason: 'PENALTY_MISSED', points: -2 });
        break;
      case MatchEventType.PENALTY_SAVE:
        if (position === PlayerPosition.GOALKEEPER) {
          breakdown.push({ reason: 'PENALTY_SAVE', points: 5 });
        }
        break;
    }
  }

  // Saves: every 3 SAVE events for this GK = 1 point
  if (position === PlayerPosition.GOALKEEPER) {
    const saveCount = myEvents.filter(e => e.eventType === MatchEventType.SAVE).length;
    const saveBonus = Math.floor(saveCount / 3);
    if (saveBonus > 0) breakdown.push({ reason: 'SAVES', points: saveBonus });
  }

  // Goals conceded
  const isPlayerTeamHome = playerTeamId === homeTeamId;
  const conceded = isPlayerTeamHome ? awayScore : homeScore;

  if (position === PlayerPosition.GOALKEEPER || position === PlayerPosition.DEFENDER) {
    // Clean sheet (STARTING only for MVP)
    if (conceded === 0 && lineupStatus === LineupStatus.STARTING) {
      const reason = position === PlayerPosition.GOALKEEPER ? 'CLEAN_SHEET_GOALKEEPER' : 'CLEAN_SHEET_DEFENDER';
      breakdown.push({ reason, points: 4 });
    }
    // Goals conceded deduction
    const deduction = Math.floor(conceded / 2);
    if (deduction > 0) breakdown.push({ reason: 'GOALS_CONCEDED', points: -deduction });
  }

  if (position === PlayerPosition.MIDFIELDER && conceded === 0 && lineupStatus === LineupStatus.STARTING) {
    breakdown.push({ reason: 'CLEAN_SHEET_MIDFIELDER', points: 1 });
  }

  const total = breakdown.reduce((sum, e) => sum + e.points, 0);
  return { total, breakdown };
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class FantasyService {
  constructor(
    private prisma: PrismaService,
    private achievementsService: AchievementsService,
    private fantasyLeagueService: FantasyLeagueService,
  ) {}

  // ── Player pool ───────────────────────────────────────────────────────────

  async getPlayerPool(position?: PlayerPosition, seasonId?: string) {
    const season = seasonId
      ? await this.prisma.season.findUnique({
          where: { id: seasonId },
          include: {
            competition: { select: { id: true, name: true, slug: true } },
          },
        })
      : await this.getActiveSeason();
    if (!season) throw new NotFoundException('Season not found');
    const competitionName = season.competition?.name?.toLowerCase() ?? '';
    const competitionSlug = season.competition?.slug ?? '';
    const isWorldCupSeason =
      season.slug === WC_SEASON_SLUG ||
      (season.name?.toLowerCase() ?? '').includes('world cup') ||
      competitionSlug === WC_SEASON_SLUG ||
      competitionName.includes('world cup');
    const seasonScopedFilter = isWorldCupSeason
      ? {
          OR: [
            { source: WC_PLAYER_SOURCE },
            { prices: { some: { seasonId: season.id } } },
            { team: { seasonTeams: { some: { seasonId: season.id } } } },
          ],
        }
      : {
          prices: { some: { seasonId: season.id } },
        };
    const teamFilter = isWorldCupSeason
      ? {
          externalId: { not: 'TBD' },
          seasonTeams: { some: { seasonId: season.id } },
          OR: [
            {
              homeFixtures: {
                some: {
                  seasonId: season.id,
                  status: { in: [FixtureStatus.SCHEDULED, FixtureStatus.LIVE, FixtureStatus.HALF_TIME] },
                },
              },
            },
            {
              awayFixtures: {
                some: {
                  seasonId: season.id,
                  status: { in: [FixtureStatus.SCHEDULED, FixtureStatus.LIVE, FixtureStatus.HALF_TIME] },
                },
              },
            },
          ],
        }
      : {
          externalId: { not: 'TBD' },
        };

    return this.prisma.player.findMany({
      where: {
        ...(position ? { position } : {}),
        team: teamFilter,
        ...seasonScopedFilter,
      },
      include: {
        team: { select: { id: true, name: true, shortName: true, externalId: true } },
      },
      orderBy: [{ team: { name: 'asc' } }, { position: 'asc' }, { name: 'asc' }],
    });
  }

  async getPlayerPoolForFixture(fixtureId: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        lineups: {
          include: { player: { include: { team: true } } },
        },
        homeTeam: true,
        awayTeam: true,
      },
    });
    if (!fixture) throw new NotFoundException('Fixture not found');

    if (fixture.lineups.length > 0) {
      return {
        source: 'CONFIRMED_LINEUP' as const,
        players: fixture.lineups.map(l => ({
          ...l.player,
          lineupStatus: l.status,
          shirtNumber: l.shirtNumber,
          position: l.position,
        })),
      };
    }

    // PROVISIONAL — return all squad players for both teams
    const players = await this.prisma.player.findMany({
      where: { teamId: { in: [fixture.homeTeamId, fixture.awayTeamId] } },
      include: { team: { select: { id: true, name: true, shortName: true } } },
      orderBy: [{ team: { name: 'asc' } }, { position: 'asc' }],
    });

    return { source: 'PROVISIONAL' as const, players };
  }

  // ── My team ───────────────────────────────────────────────────────────────

  async getMyTeam(userId: string) {
    const season = await this.getActiveSeason();
    const team = await this.prisma.fantasyTeam.findUnique({
      where: { userId_seasonId: { userId, seasonId: season.id } },
      include: {
        players: {
          include: {
            player: { include: { team: { select: { id: true, name: true, shortName: true } } } },
          },
          orderBy: [{ squadRole: 'asc' }, { benchSlot: 'asc' }],
        },
      },
    });
    if (!team) throw new NotFoundException('Fantasy team not found. Create one first.');
    return team;
  }

  async createTeam(userId: string, dto: CreateFantasyTeamDto) {
    const season = await this.getActiveSeason();

    const existing = await this.prisma.fantasyTeam.findUnique({
      where: { userId_seasonId: { userId, seasonId: season.id } },
    });
    if (existing) throw new ConflictException('Fantasy team already exists. Use PATCH to update.');

    const slots = dto.players ?? [];
    const isWorldCup = this.isWorldCupSeason(season);

    // Name-only registration: skip squad validation, create an empty team.
    // Players are added later via POST /fantasy/team/me/players.
    if (slots.length === 0) {
      const team = await this.prisma.fantasyTeam.create({
        data: {
          userId,
          seasonId: season.id,
          name: dto.name ?? 'My Fantasy Team',
        },
        include: { players: { include: { player: true } } },
      });
      this.achievementsService.safeEvaluate(userId, ['first-fantasy-team']).catch(() => null);
      return team;
    }

    // Full squad submission: validate composition and eligibility.
    if (isWorldCup) {
      await this.assertPlayersFromActiveTeams(slots.map(p => p.playerId), season.id);
    }

    const rulesConfig = await this.loadSquadConfig(season.id);
    const playerDetails = await this.resolvePlayerDetails(slots.map(p => p.playerId), season.id);
    const validation = validateSquadComposition(slots, playerDetails, rulesConfig);
    if (!validation.isValid) {
      throw new BadRequestException({ message: 'Invalid squad', errors: validation.errors });
    }

    const team = await this.prisma.fantasyTeam.create({
      data: {
        userId,
        seasonId: season.id,
        name: dto.name ?? 'My Fantasy Team',
        ...(validation.formation ? { formation: validation.formation } : {}),
        players: {
          create: slots.map(slot => {
            const pd = playerDetails.find(p => p.id === slot.playerId)!;
            return {
              playerId: slot.playerId,
              squadRole: slot.squadRole,
              position: pd.position,
              ...(slot.benchSlot !== undefined ? { benchSlot: slot.benchSlot } : {}),
              isCaptain: slot.isCaptain ?? false,
              isViceCaptain: slot.isViceCaptain ?? false,
            };
          }),
        },
      },
      include: { players: { include: { player: true } } },
    });

    await this.fantasyLeagueService.ensureGlobalLeagueMemberships(userId, team.id);
    this.achievementsService.safeEvaluate(userId, ['first-fantasy-team']).catch(() => null);
    return team;
  }

  async makeTransfer(userId: string, dto: TransferDto) {
    const season = await this.getActiveSeason();
    const team = await this.prisma.fantasyTeam.findUnique({
      where: { userId_seasonId: { userId, seasonId: season.id } },
      include: { players: { include: { player: true } } },
    });
    if (!team) throw new NotFoundException('Fantasy team not found');

    const removing = team.players.find(p => p.playerId === dto.removePlayerId);
    if (!removing) throw new BadRequestException('Player to remove is not in your squad');

    // Gameweek transfer deadline guard
    await this.assertTransferOpen(season.id);

    // Locked player guard
    if (removing.lockedAt && removing.lockedAt <= new Date()) {
      throw new BadRequestException('Player is locked and cannot be transferred');
    }

    const adding = await this.prisma.player.findUnique({ where: { id: dto.addPlayerId } });
    if (!adding) throw new NotFoundException('Player to add not found');
    if (adding.position !== removing.position) {
      throw new BadRequestException(
        `Transfer must be same position. Removing ${removing.position}, adding ${adding.position}`,
      );
    }

    // Build new squad slots after swap
    const newSlots: FantasyPlayerSlotDto[] = team.players.map(p => ({
      playerId: p.playerId === dto.removePlayerId ? dto.addPlayerId : p.playerId,
      squadRole: p.squadRole,
      ...(p.benchSlot !== null ? { benchSlot: p.benchSlot } : {}),
      isCaptain: p.isCaptain,
      isViceCaptain: p.isViceCaptain,
    }));

    const rulesConfig = await this.loadSquadConfig(season.id);
    const playerDetails = await this.resolvePlayerDetails(newSlots.map(s => s.playerId), season.id);
    const validation = validateSquadComposition(newSlots, playerDetails, rulesConfig);
    if (!validation.isValid) {
      throw new BadRequestException({ message: 'Transfer creates invalid squad', errors: validation.errors });
    }

    await this.prisma.fantasyTeamPlayer.delete({ where: { id: removing.id } });
    await this.prisma.fantasyTeamPlayer.create({
      data: {
        fantasyTeamId: team.id,
        playerId: dto.addPlayerId,
        squadRole: removing.squadRole,
        position: adding.position,
        ...(removing.benchSlot !== null ? { benchSlot: removing.benchSlot } : {}),
        isCaptain: removing.isCaptain,
        isViceCaptain: removing.isViceCaptain,
      },
    });

    await this.prisma.fantasyTransfer.create({
      data: {
        fantasyTeamId: team.id,
        removedPlayerId: dto.removePlayerId,
        addedPlayerId: dto.addPlayerId,
      },
    });

    return this.getMyTeam(userId);
  }

  async validateMySquad(userId: string) {
    const season = await this.getActiveSeason();
    const team = await this.prisma.fantasyTeam.findUnique({
      where: { userId_seasonId: { userId, seasonId: season.id } },
      include: { players: { include: { player: { include: { team: true } } } } },
    });
    if (!team) throw new NotFoundException('Fantasy team not found');

    const slots: FantasyPlayerSlotDto[] = team.players.map(p => ({
      playerId: p.playerId,
      squadRole: p.squadRole,
      ...(p.benchSlot !== null ? { benchSlot: p.benchSlot } : {}),
      isCaptain: p.isCaptain,
      isViceCaptain: p.isViceCaptain,
    }));

    const priceMap = await this.resolvePlayerPrices(team.players.map(p => p.playerId), season.id);

    const playerDetails: PlayerDetail[] = team.players.map(p => ({
      id: p.playerId,
      position: p.player.position,
      teamId: p.player.teamId,
      name: p.player.name,
      price: priceMap.get(p.playerId) ?? 0,
    }));

    const rulesConfig = await this.loadSquadConfig(season.id);
    return validateSquadComposition(slots, playerDetails, rulesConfig);
  }

  // ── Fantasy settle ────────────────────────────────────────────────────────

  async settleFixture(fixtureId: string) {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        lineups: true,
        events: true,
      },
    });
    if (!fixture) throw new NotFoundException('Fixture not found');
    if (fixture.status !== FixtureStatus.FINISHED) {
      throw new BadRequestException('Fixture is not FINISHED');
    }
    if (fixture.homeScore === null || fixture.awayScore === null) {
      throw new BadRequestException('Fixture has no score');
    }

    // Find all fantasy teams that have players from this fixture
    const fixtureTeamIds = [fixture.homeTeamId, fixture.awayTeamId];
    const fantasyTeamsWithPlayers = await this.prisma.fantasyTeam.findMany({
      include: {
        players: {
          where: { player: { teamId: { in: fixtureTeamIds } } },
          include: { player: true },
        },
      },
    });

    const lineupMap = new Map(fixture.lineups.map(l => [l.playerId, l]));
    const events = fixture.events;

    let totalLedgerEntries = 0;

    for (const fantasyTeam of fantasyTeamsWithPlayers) {
      if (fantasyTeam.players.length === 0) continue;

      const captainSlot = fantasyTeam.players.find(p => p.isCaptain);
      const vcSlot = fantasyTeam.players.find(p => p.isViceCaptain);

      // Determine if captain played
      const captainLineup = captainSlot ? lineupMap.get(captainSlot.playerId) : null;
      const captainPlayed =
        captainLineup?.status === LineupStatus.STARTING ||
        captainLineup?.status === LineupStatus.SUBSTITUTE ||
        events.some(e => e.playerId === captainSlot?.playerId);

      let teamPointsDelta = 0;
      const ledgerEntries: {
        fantasyTeamId: string;
        playerId: string;
        fixtureId: string;
        points: number;
        reason: string;
        isCaptainBonus: boolean;
      }[] = [];

      for (const slot of fantasyTeam.players) {
        if (slot.squadRole !== FantasySquadRole.STARTER) continue;

        const lineup = lineupMap.get(slot.playerId);
        const lineupStatus = lineup?.status ?? null;

        const { total, breakdown } = scorePlayer(
          slot.player.position,
          lineupStatus,
          events,
          slot.playerId,
          slot.player.teamId,
          fixture.homeTeamId,
          fixture.homeScore,
          fixture.awayScore,
        );

        for (const entry of breakdown) {
          ledgerEntries.push({
            fantasyTeamId: fantasyTeam.id,
            playerId: slot.playerId,
            fixtureId,
            points: entry.points,
            reason: entry.reason,
            isCaptainBonus: false,
          });
        }

        let finalPoints = total;

        // Captain multiplier
        const isCaptain = slot.isCaptain;
        const isViceCaptain = slot.isViceCaptain;

        if (isCaptain && captainPlayed) {
          ledgerEntries.push({
            fantasyTeamId: fantasyTeam.id,
            playerId: slot.playerId,
            fixtureId,
            points: total,
            reason: 'CAPTAIN_MULTIPLIER',
            isCaptainBonus: true,
          });
          finalPoints = total * 2;
        } else if (isViceCaptain && !captainPlayed) {
          ledgerEntries.push({
            fantasyTeamId: fantasyTeam.id,
            playerId: slot.playerId,
            fixtureId,
            points: total,
            reason: 'VICE_CAPTAIN_MULTIPLIER',
            isCaptainBonus: true,
          });
          finalPoints = total * 2;
        }

        teamPointsDelta += finalPoints;
      }

      if (ledgerEntries.length > 0) {
        await this.prisma.fantasyPointsLedger.createMany({ data: ledgerEntries });
        await this.prisma.fantasyTeam.update({
          where: { id: fantasyTeam.id },
          data: { totalPoints: { increment: teamPointsDelta } },
        });
        totalLedgerEntries += ledgerEntries.length;
      }
    }

    return { settled: true, fixtureId, ledgerEntries: totalLedgerEntries };
  }

  // ── Leaderboard ───────────────────────────────────────────────────────────

  async getLeaderboard(limit = 50) {
    const season = await this.getActiveSeason();
    return this.prisma.fantasyTeam.findMany({
      where: { seasonId: season.id },
      orderBy: { totalPoints: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true } },
        _count: { select: { players: true } },
      },
    });
  }

  // ── Validate squad (public / unauthenticated) ─────────────────────────────

  async validateSlots(slots: FantasyPlayerSlotDto[]) {
    const season = await this.prisma.season.findFirst({ where: { isActive: true } });
    const rulesConfig = season ? await this.loadSquadConfig(season.id) : DEFAULT_SQUAD_CONFIG;
    const playerDetails = await this.resolvePlayerDetails(slots.map(s => s.playerId), season?.id);
    return validateSquadComposition(slots, playerDetails, rulesConfig);
  }

  // ── Team meta & granular player management ───────────────────────────────

  async updateTeamMeta(userId: string, dto: UpdateFantasyTeamDto) {
    const season = await this.getActiveSeason();
    const team = await this.prisma.fantasyTeam.findUnique({
      where: { userId_seasonId: { userId, seasonId: season.id } },
      include: { _count: { select: { players: true } } },
    });
    if (!team) throw new NotFoundException('Fantasy team not found');

    // Formation changes touch squad structure → require transfer window open,
    // but only for established teams. An empty team (players === 0) is still
    // in the onboarding phase and must be allowed to set its formation.
    // Pure name renames are cosmetic and are always allowed.
    if (dto.formation !== undefined && team._count.players > 0) {
      await this.assertTransferOpen(season.id);
    }

    return this.prisma.fantasyTeam.update({
      where: { id: team.id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.formation !== undefined ? { formation: dto.formation } : {}),
      },
      include: {
        players: {
          include: {
            player: { include: { team: { select: { id: true, name: true, shortName: true } } } },
          },
          orderBy: [{ squadRole: 'asc' }, { benchSlot: 'asc' }],
        },
      },
    });
  }

  async addPlayerToSquad(userId: string, slot: FantasyPlayerSlotDto) {
    const season = await this.getActiveSeason();
    const rulesConfig = await this.loadSquadConfig(season.id);
    const team = await this.prisma.fantasyTeam.findUnique({
      where: { userId_seasonId: { userId, seasonId: season.id } },
      include: { players: true },
    });
    if (!team) throw new NotFoundException('Fantasy team not found. Create one first via POST /fantasy/team/me');

    // Transfer window only gates established teams. A squad below its configured
    // size is still being built (onboarding), so all additions are allowed
    // regardless of the deadline. A full squad would hit the guard below and
    // throw "Squad is already full" before reaching this point, so real
    // post-onboarding player changes must go through makeTransfer.
    if (team.players.length >= rulesConfig.squadSize) {
      await this.assertTransferOpen(season.id);
    }

    if (team.players.length >= rulesConfig.squadSize) throw new BadRequestException(`Squad is already full (max ${rulesConfig.squadSize} players)`);

    const existing = team.players.find(p => p.playerId === slot.playerId);
    if (existing) throw new ConflictException('Player is already in your squad');

    // For WC seasons: reject players from eliminated teams before hitting the DB create
    if (this.isWorldCupSeason(season)) {
      await this.assertPlayersFromActiveTeams([slot.playerId], season.id);
    }

    const player = await this.prisma.player.findUnique({ where: { id: slot.playerId } });
    if (!player) throw new NotFoundException('Player not found');

    await this.prisma.fantasyTeamPlayer.create({
      data: {
        fantasyTeamId: team.id,
        playerId: slot.playerId,
        squadRole: slot.squadRole,
        position: player.position,
        ...(slot.benchSlot !== undefined ? { benchSlot: slot.benchSlot } : {}),
        isCaptain: slot.isCaptain ?? false,
        isViceCaptain: slot.isViceCaptain ?? false,
      },
    });

    // Squad just reached full size — auto-enter the fan's team into the global leagues.
    if (team.players.length + 1 === rulesConfig.squadSize) {
      await this.fantasyLeagueService.ensureGlobalLeagueMemberships(userId, team.id);
    }

    return this.getMyTeam(userId);
  }

  async removePlayerFromSquad(userId: string, playerId: string) {
    const season = await this.getActiveSeason();
    await this.assertTransferOpen(season.id);
    const team = await this.prisma.fantasyTeam.findUnique({
      where: { userId_seasonId: { userId, seasonId: season.id } },
      include: { players: true },
    });
    if (!team) throw new NotFoundException('Fantasy team not found');

    const slot = team.players.find(p => p.playerId === playerId);
    if (!slot) throw new NotFoundException('Player not in squad');

    if (slot.lockedAt && slot.lockedAt <= new Date()) {
      throw new BadRequestException('Player is locked and cannot be removed');
    }

    await this.prisma.fantasyTeamPlayer.delete({ where: { id: slot.id } });
    return this.getMyTeam(userId);
  }

  async updatePlayerSlot(userId: string, playerId: string, dto: UpdatePlayerSlotDto) {
    const season = await this.getActiveSeason();
    await this.assertTransferOpen(season.id);
    const team = await this.prisma.fantasyTeam.findUnique({
      where: { userId_seasonId: { userId, seasonId: season.id } },
      include: { players: true },
    });
    if (!team) throw new NotFoundException('Fantasy team not found');

    const slot = team.players.find(p => p.playerId === playerId);
    if (!slot) throw new NotFoundException('Player not in squad');

    await this.prisma.fantasyTeamPlayer.update({
      where: { id: slot.id },
      data: {
        ...(dto.squadRole !== undefined ? { squadRole: dto.squadRole } : {}),
        ...(dto.benchSlot !== undefined ? { benchSlot: dto.benchSlot } : {}),
        ...(dto.isCaptain !== undefined ? { isCaptain: dto.isCaptain } : {}),
        ...(dto.isViceCaptain !== undefined ? { isViceCaptain: dto.isViceCaptain } : {}),
      },
    });

    return this.getMyTeam(userId);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async getActiveSeason() {
    const season = await this.prisma.season.findFirst({
      where: { isActive: true },
      include: {
        competition: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!season) throw new NotFoundException('No active season found');
    return season;
  }

  private async assertTransferOpen(seasonId: string): Promise<void> {
    const now = new Date();
    const gw = await this.prisma.gameweek.findFirst({
      where: {
        seasonId,
        status: { in: ['UPCOMING', 'OPEN'] },
      },
      select: { transferDeadlineAt: true },
      orderBy: { round: 'asc' },
    });
    if (!gw || gw.transferDeadlineAt <= now) {
      throw new BadRequestException('Fantasy changes are locked for this Gameweek');
    }
  }

  private async loadSquadConfig(seasonId: string): Promise<SquadConfig> {
    const config = await this.prisma.fantasyRulesConfig.findUnique({ where: { seasonId } });
    return config ?? DEFAULT_SQUAD_CONFIG;
  }

  private async resolvePlayerDetails(playerIds: string[], seasonId?: string): Promise<PlayerDetail[]> {
    const players = await this.prisma.player.findMany({
      where: { id: { in: playerIds } },
      select: { id: true, position: true, teamId: true, name: true },
    });
    const priceMap = seasonId ? await this.resolvePlayerPrices(playerIds, seasonId) : new Map<string, number>();
    return players.map(p => ({ ...p, price: priceMap.get(p.id) ?? 0 }));
  }

  // Prices are stored in tenths of a million; this returns whole millions.
  private async resolvePlayerPrices(playerIds: string[], seasonId: string): Promise<Map<string, number>> {
    const prices = await this.prisma.fantasyPlayerPrice.findMany({
      where: { seasonId, playerId: { in: playerIds } },
      select: { playerId: true, price: true },
    });
    return new Map(prices.map(p => [p.playerId, p.price / 10]));
  }

  private isWorldCupSeason(season: { slug?: string | null; name?: string | null; competition?: { slug?: string | null; name?: string | null } | null }): boolean {
    return (
      season.slug === WC_SEASON_SLUG ||
      (season.name?.toLowerCase() ?? '').includes('world cup') ||
      season.competition?.slug === WC_SEASON_SLUG ||
      (season.competition?.name?.toLowerCase() ?? '').includes('world cup')
    );
  }

  private async assertPlayersFromActiveTeams(playerIds: string[], seasonId: string): Promise<void> {
    // A player is ineligible if their team has NO remaining SCHEDULED/LIVE/HALF_TIME
    // fixtures in this season (i.e., the team is eliminated).
    const ineligible = await this.prisma.player.findMany({
      where: {
        id: { in: playerIds },
        team: {
          homeFixtures: {
            none: {
              seasonId,
              status: { in: [FixtureStatus.SCHEDULED, FixtureStatus.LIVE, FixtureStatus.HALF_TIME] },
            },
          },
          awayFixtures: {
            none: {
              seasonId,
              status: { in: [FixtureStatus.SCHEDULED, FixtureStatus.LIVE, FixtureStatus.HALF_TIME] },
            },
          },
        },
      },
      select: { id: true, name: true, team: { select: { name: true } } },
    });

    if (ineligible.length > 0) {
      const names = ineligible.map(p => `${p.name} (${p.team?.name ?? 'unknown team'})`).join(', ');
      throw new BadRequestException(
        `Cannot select players from eliminated teams: ${names}`,
      );
    }
  }
}
