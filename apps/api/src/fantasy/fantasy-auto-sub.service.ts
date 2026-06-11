import { Injectable, NotFoundException } from '@nestjs/common';
import { FantasyAutoSubstitutionStatus, FantasySquadRole, PlayerPosition } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_RULES } from './fantasy-rules-config.service';

// ── Interfaces ────────────────────────────────────────────────────────────────

interface FormationConfig {
  startingXiSize: number;
  minStartingGoalkeepers: number;
  maxStartingGoalkeepers: number;
  minStartingDefenders: number;
  minStartingMidfielders: number;
  minStartingForwards: number;
}

export interface ComputedAutoSub {
  outPlayerId: string;
  outPlayerName: string;
  outPosition: PlayerPosition;
  inPlayerId: string | null;
  inPlayerName: string | null;
  inPosition: PlayerPosition | null;
  outFantasyTeamPlayerId: string | null;
  inFantasyTeamPlayerId: string | null;
  status: FantasyAutoSubstitutionStatus;
  reason: string;
  benchPriority: number | null;
  formationBefore: string | null;
  formationAfter: string | null;
}

export interface AutoSubResult {
  fantasyTeamId: string;
  gameweekId: string;
  formationBefore: string;
  formationAfter: string;
  substitutions: ComputedAutoSub[];
}

export interface FinalCountedPlayer {
  playerId: string;
  playerName: string;
  position: PlayerPosition;
  originalRole: 'STARTER' | 'SUBSTITUTE';
  finalRole: 'STARTER' | 'SUBSTITUTE';
  played: boolean;
  countedInTotal: boolean;
  reason: string;
  benchPriority: number | null;
}

export interface FinalXiResult {
  fantasyTeamId: string;
  gameweekId: string;
  formation: string;
  players: FinalCountedPlayer[];
}

interface TeamPlayerSlot {
  id: string;
  playerId: string;
  position: PlayerPosition;
  squadRole: FantasySquadRole;
  benchSlot: number | null;
  isCaptain: boolean;
  isViceCaptain: boolean;
  playerName: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function benchPrioritySort(a: TeamPlayerSlot, b: TeamPlayerSlot): number {
  // GK goes to slot 0 (first bench slot reserved for GK)
  const aIsGk = a.position === PlayerPosition.GOALKEEPER;
  const bIsGk = b.position === PlayerPosition.GOALKEEPER;
  if (aIsGk && !bIsGk) return -1;
  if (!aIsGk && bIsGk) return 1;
  // Then by benchSlot ascending (nulls last)
  const aSlot = a.benchSlot ?? 999;
  const bSlot = b.benchSlot ?? 999;
  if (aSlot !== bSlot) return aSlot - bSlot;
  // Then by playerId for stable sort
  return a.playerId.localeCompare(b.playerId);
}

function deriveFormation(starterIds: string[], positionMap: Map<string, PlayerPosition>): string {
  let def = 0, mid = 0, fwd = 0;
  for (const id of starterIds) {
    const pos = positionMap.get(id);
    if (pos === PlayerPosition.DEFENDER) def++;
    else if (pos === PlayerPosition.MIDFIELDER) mid++;
    else if (pos === PlayerPosition.FORWARD) fwd++;
  }
  return `${def}-${mid}-${fwd}`;
}

function wouldFormationRemainValid(
  currentStarterIds: string[],
  outPlayerId: string,
  inPlayerId: string,
  positionMap: Map<string, PlayerPosition>,
  config: FormationConfig,
): boolean {
  const newStarters = currentStarterIds.filter(id => id !== outPlayerId).concat(inPlayerId);
  if (newStarters.length !== config.startingXiSize) return false;

  let gk = 0, def = 0, mid = 0, fwd = 0;
  for (const id of newStarters) {
    const pos = positionMap.get(id);
    if (pos === PlayerPosition.GOALKEEPER) gk++;
    else if (pos === PlayerPosition.DEFENDER) def++;
    else if (pos === PlayerPosition.MIDFIELDER) mid++;
    else if (pos === PlayerPosition.FORWARD) fwd++;
    else return false; // unknown position
  }
  return (
    gk >= config.minStartingGoalkeepers &&
    gk <= config.maxStartingGoalkeepers &&
    def >= config.minStartingDefenders &&
    mid >= config.minStartingMidfielders &&
    fwd >= config.minStartingForwards
  );
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class FantasyAutoSubService {
  constructor(private readonly prisma: PrismaService) {}

  // Pure computation — no DB writes. Used by scoring service for in-memory calculation.
  async computeAutoSubsForTeamGameweek(fantasyTeamId: string, gameweekId: string): Promise<ComputedAutoSub[]> {
    const team = await this.prisma.fantasyTeam.findUnique({
      where: { id: fantasyTeamId },
      include: {
        players: {
          include: { player: { select: { id: true, name: true, position: true } } },
        },
      },
    });
    if (!team) throw new NotFoundException('Fantasy team not found');

    const gameweek = await this.prisma.gameweek.findUnique({
      where: { id: gameweekId },
      select: { id: true, seasonId: true },
    });
    if (!gameweek) throw new NotFoundException('Gameweek not found');

    // Load formation config
    const rulesRow = await this.prisma.fantasyRulesConfig.findUnique({
      where: { seasonId: team.seasonId },
    });
    const config: FormationConfig = rulesRow ?? DEFAULT_RULES;

    // Build player slots
    const allSlots: TeamPlayerSlot[] = team.players.map(tp => ({
      id: tp.id,
      playerId: tp.playerId,
      position: tp.player.position,
      squadRole: tp.squadRole,
      benchSlot: tp.benchSlot,
      isCaptain: tp.isCaptain,
      isViceCaptain: tp.isViceCaptain,
      playerName: tp.player.name,
    }));

    const positionMap = new Map(allSlots.map(s => [s.playerId, s.position]));
    const nameMap = new Map(allSlots.map(s => [s.playerId, s.playerName]));
    const slotIdMap = new Map(allSlots.map(s => [s.playerId, s.id]));

    const starters = allSlots.filter(s => s.squadRole === FantasySquadRole.STARTER);
    const bench = allSlots
      .filter(s => s.squadRole === FantasySquadRole.SUBSTITUTE)
      .sort(benchPrioritySort);

    // Build played map
    const playedMap = await this.buildPlayedMap(gameweekId, allSlots.map(s => s.playerId));

    // Track mutable starting state
    let currentStarters = starters.map(s => s.playerId);
    const remainingBench = [...bench];
    const substitutions: ComputedAutoSub[] = [];

    const formationBefore = deriveFormation(currentStarters, positionMap);

    // ── GK substitution ──────────────────────────────────────────────────────
    const gkStarter = starters.find(s => s.position === PlayerPosition.GOALKEEPER);
    if (gkStarter) {
      if (!playedMap.has(gkStarter.playerId)) {
        // Starter GK did not play — find bench GK
        const benchGkIdx = remainingBench.findIndex(b => b.position === PlayerPosition.GOALKEEPER);
        const benchGk = benchGkIdx >= 0 ? remainingBench[benchGkIdx] : undefined;

        if (!benchGk) {
          substitutions.push({
            outPlayerId: gkStarter.playerId,
            outPlayerName: gkStarter.playerName,
            outPosition: PlayerPosition.GOALKEEPER,
            inPlayerId: null,
            inPlayerName: null,
            inPosition: null,
            outFantasyTeamPlayerId: slotIdMap.get(gkStarter.playerId) ?? null,
            inFantasyTeamPlayerId: null,
            status: FantasyAutoSubstitutionStatus.SKIPPED_GOALKEEPER_ONLY,
            reason: 'no_bench_goalkeeper',
            benchPriority: null,
            formationBefore,
            formationAfter: null,
          });
        } else if (!playedMap.has(benchGk.playerId)) {
          substitutions.push({
            outPlayerId: gkStarter.playerId,
            outPlayerName: gkStarter.playerName,
            outPosition: PlayerPosition.GOALKEEPER,
            inPlayerId: null,
            inPlayerName: null,
            inPosition: null,
            outFantasyTeamPlayerId: slotIdMap.get(gkStarter.playerId) ?? null,
            inFantasyTeamPlayerId: null,
            status: FantasyAutoSubstitutionStatus.SKIPPED_BENCH_PLAYER_DID_NOT_PLAY,
            reason: 'bench_goalkeeper_did_not_play',
            benchPriority: benchGk.benchSlot,
            formationBefore,
            formationAfter: null,
          });
        } else {
          // Apply GK sub
          const fBefore = deriveFormation(currentStarters, positionMap);
          currentStarters = currentStarters.filter(id => id !== gkStarter.playerId).concat(benchGk.playerId);
          const fAfter = deriveFormation(currentStarters, positionMap);
          remainingBench.splice(benchGkIdx, 1);

          substitutions.push({
            outPlayerId: gkStarter.playerId,
            outPlayerName: gkStarter.playerName,
            outPosition: PlayerPosition.GOALKEEPER,
            inPlayerId: benchGk.playerId,
            inPlayerName: benchGk.playerName,
            inPosition: PlayerPosition.GOALKEEPER,
            outFantasyTeamPlayerId: slotIdMap.get(gkStarter.playerId) ?? null,
            inFantasyTeamPlayerId: slotIdMap.get(benchGk.playerId) ?? null,
            status: FantasyAutoSubstitutionStatus.APPLIED,
            reason: 'starter_did_not_play',
            benchPriority: benchGk.benchSlot,
            formationBefore: fBefore,
            formationAfter: fAfter,
          });
        }
      }
      // If GK played: no record (implicit SKIPPED_STARTER_PLAYED — we only emit records for non-players)
    }

    // ── Outfield substitutions ────────────────────────────────────────────────
    const outfieldStarters = starters.filter(s => s.position !== PlayerPosition.GOALKEEPER);

    for (const starter of outfieldStarters) {
      if (playedMap.has(starter.playerId)) {
        // Starter played — no substitution record needed
        continue;
      }

      // Find eligible outfield bench candidates (skip GKs)
      const outfieldBench = remainingBench.filter(b => b.position !== PlayerPosition.GOALKEEPER);

      if (outfieldBench.length === 0) {
        substitutions.push({
          outPlayerId: starter.playerId,
          outPlayerName: starter.playerName,
          outPosition: starter.position,
          inPlayerId: null,
          inPlayerName: null,
          inPosition: null,
          outFantasyTeamPlayerId: slotIdMap.get(starter.playerId) ?? null,
          inFantasyTeamPlayerId: null,
          status: FantasyAutoSubstitutionStatus.SKIPPED_NO_ELIGIBLE_SUB,
          reason: 'bench_exhausted',
          benchPriority: null,
          formationBefore: deriveFormation(currentStarters, positionMap),
          formationAfter: null,
        });
        continue;
      }

      let substituted = false;
      let allPlayedFailed = true; // track if any played bench player was tried

      for (const benchPlayer of outfieldBench) {
        if (!playedMap.has(benchPlayer.playerId)) {
          // Bench player didn't play — skip but keep trying in bench order
          allPlayedFailed = allPlayedFailed && true;
          continue;
        }
        allPlayedFailed = false;

        const fBefore = deriveFormation(currentStarters, positionMap);
        if (wouldFormationRemainValid(currentStarters, starter.playerId, benchPlayer.playerId, positionMap, config)) {
          currentStarters = currentStarters.filter(id => id !== starter.playerId).concat(benchPlayer.playerId);
          const fAfter = deriveFormation(currentStarters, positionMap);
          const bIdx = remainingBench.indexOf(benchPlayer);
          remainingBench.splice(bIdx, 1);

          substitutions.push({
            outPlayerId: starter.playerId,
            outPlayerName: starter.playerName,
            outPosition: starter.position,
            inPlayerId: benchPlayer.playerId,
            inPlayerName: benchPlayer.playerName,
            inPosition: benchPlayer.position,
            outFantasyTeamPlayerId: slotIdMap.get(starter.playerId) ?? null,
            inFantasyTeamPlayerId: slotIdMap.get(benchPlayer.playerId) ?? null,
            status: FantasyAutoSubstitutionStatus.APPLIED,
            reason: 'starter_did_not_play',
            benchPriority: benchPlayer.benchSlot,
            formationBefore: fBefore,
            formationAfter: fAfter,
          });
          substituted = true;
          break;
        }
        // Formation would break — try next bench player
      }

      if (!substituted) {
        const fBefore = deriveFormation(currentStarters, positionMap);
        const status = allPlayedFailed
          ? FantasyAutoSubstitutionStatus.SKIPPED_BENCH_PLAYER_DID_NOT_PLAY
          : FantasyAutoSubstitutionStatus.SKIPPED_FORMATION_INVALID;
        const reason = allPlayedFailed ? 'no_bench_player_played' : 'formation_constraint_violated';

        substitutions.push({
          outPlayerId: starter.playerId,
          outPlayerName: starter.playerName,
          outPosition: starter.position,
          inPlayerId: null,
          inPlayerName: null,
          inPosition: null,
          outFantasyTeamPlayerId: slotIdMap.get(starter.playerId) ?? null,
          inFantasyTeamPlayerId: null,
          status,
          reason,
          benchPriority: null,
          formationBefore: fBefore,
          formationAfter: null,
        });
      }
    }

    return substitutions;
  }

  // ── Played detection ─────────────────────────────────────────────────────────

  async buildPlayedMap(gameweekId: string, playerIds: string[]): Promise<Set<string>> {
    const fixtures = await this.prisma.fixture.findMany({
      where: { gameweekId },
      select: { id: true },
    });
    const fixtureIds = fixtures.map(f => f.id);
    if (fixtureIds.length === 0) return new Set();

    const stats = await this.prisma.fantasyPlayerMatchStat.findMany({
      where: {
        fixtureId: { in: fixtureIds },
        playerId: { in: playerIds },
      },
      select: { playerId: true, minutesPlayed: true, didNotPlay: true },
    });

    const played = new Set<string>();
    for (const s of stats) {
      if (!s.didNotPlay && s.minutesPlayed > 0) {
        played.add(s.playerId);
      }
    }
    return played;
  }

  async getPlayedStatus(playerId: string, gameweekId: string): Promise<boolean> {
    const played = await this.buildPlayedMap(gameweekId, [playerId]);
    return played.has(playerId);
  }

  // ── DB persistence ────────────────────────────────────────────────────────────

  async applyAutoSubsForTeamGameweek(fantasyTeamId: string, gameweekId: string): Promise<AutoSubResult> {
    const team = await this.prisma.fantasyTeam.findUnique({
      where: { id: fantasyTeamId },
      select: { id: true, userId: true, seasonId: true },
    });
    if (!team) throw new NotFoundException('Fantasy team not found');

    const computed = await this.computeAutoSubsForTeamGameweek(fantasyTeamId, gameweekId);
    const formationBefore = computed[0]?.formationBefore ?? '4-4-2';
    const formationAfter = computed.filter(s => s.status === FantasyAutoSubstitutionStatus.APPLIED).slice(-1)[0]?.formationAfter ?? formationBefore;

    // Upsert each auto-sub row (idempotent on fantasyTeamId + gameweekId + outPlayerId)
    for (const sub of computed) {
      await this.prisma.fantasyAutoSubstitution.upsert({
        where: { fantasyTeamId_gameweekId_outPlayerId: { fantasyTeamId, gameweekId, outPlayerId: sub.outPlayerId } },
        create: {
          fantasyTeamId,
          userId: team.userId,
          seasonId: team.seasonId,
          gameweekId,
          outPlayerId: sub.outPlayerId,
          ...(sub.inPlayerId !== null ? { inPlayerId: sub.inPlayerId } : {}),
          ...(sub.outFantasyTeamPlayerId !== null ? { outFantasyTeamPlayerId: sub.outFantasyTeamPlayerId } : {}),
          ...(sub.inFantasyTeamPlayerId !== null ? { inFantasyTeamPlayerId: sub.inFantasyTeamPlayerId } : {}),
          reason: sub.reason,
          status: sub.status,
          ...(sub.benchPriority !== null ? { benchPriority: sub.benchPriority } : {}),
          ...(sub.formationBefore !== null ? { formationBefore: sub.formationBefore } : {}),
          ...(sub.formationAfter !== null ? { formationAfter: sub.formationAfter } : {}),
          ...(sub.status === FantasyAutoSubstitutionStatus.APPLIED ? { appliedAt: new Date() } : {}),
        },
        update: {
          ...(sub.inPlayerId !== null ? { inPlayerId: sub.inPlayerId } : { inPlayerId: null }),
          reason: sub.reason,
          status: sub.status,
          ...(sub.benchPriority !== null ? { benchPriority: sub.benchPriority } : { benchPriority: null }),
          ...(sub.formationBefore !== null ? { formationBefore: sub.formationBefore } : { formationBefore: null }),
          ...(sub.formationAfter !== null ? { formationAfter: sub.formationAfter } : { formationAfter: null }),
          appliedAt: sub.status === FantasyAutoSubstitutionStatus.APPLIED ? new Date() : null,
        },
      });
    }

    return { fantasyTeamId, gameweekId, formationBefore, formationAfter, substitutions: computed };
  }

  async recalculateAutoSubsForTeamGameweek(fantasyTeamId: string, gameweekId: string): Promise<AutoSubResult> {
    return this.applyAutoSubsForTeamGameweek(fantasyTeamId, gameweekId);
  }

  async applyAutoSubsForGameweek(gameweekId: string): Promise<{ gameweekId: string; teamsProcessed: number; totalApplied: number; errors: string[] }> {
    const gameweek = await this.prisma.gameweek.findUnique({
      where: { id: gameweekId },
      select: { id: true, seasonId: true },
    });
    if (!gameweek) throw new NotFoundException('Gameweek not found');

    const teams = await this.prisma.fantasyTeam.findMany({
      where: { seasonId: gameweek.seasonId },
      select: { id: true },
    });

    let teamsProcessed = 0;
    let totalApplied = 0;
    const errors: string[] = [];

    for (const team of teams) {
      try {
        const result = await this.applyAutoSubsForTeamGameweek(team.id, gameweekId);
        totalApplied += result.substitutions.filter(s => s.status === FantasyAutoSubstitutionStatus.APPLIED).length;
        teamsProcessed++;
      } catch (err) {
        errors.push(`${team.id}: ${(err as Error).message}`);
      }
    }

    return { gameweekId, teamsProcessed, totalApplied, errors };
  }

  // ── Fan read endpoints ────────────────────────────────────────────────────────

  async getAutoSubsForTeamGameweek(userId: string, gameweekId: string): Promise<AutoSubResult> {
    const team = await this.prisma.fantasyTeam.findFirst({
      where: { userId },
      select: { id: true },
    });
    if (!team) throw new NotFoundException('Fantasy team not found');

    const rows = await this.prisma.fantasyAutoSubstitution.findMany({
      where: { fantasyTeamId: team.id, gameweekId },
      include: {
        outPlayer: { select: { id: true, name: true, position: true } },
        inPlayer: { select: { id: true, name: true, position: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formationBefore = rows[0]?.formationBefore ?? '';
    const appliedRows = rows.filter(r => r.status === FantasyAutoSubstitutionStatus.APPLIED);
    const formationAfter = appliedRows.slice(-1)[0]?.formationAfter ?? formationBefore;

    return {
      fantasyTeamId: team.id,
      gameweekId,
      formationBefore,
      formationAfter,
      substitutions: rows.map(r => ({
        outPlayerId: r.outPlayerId,
        outPlayerName: r.outPlayer.name,
        outPosition: r.outPlayer.position,
        inPlayerId: r.inPlayerId,
        inPlayerName: r.inPlayer?.name ?? null,
        inPosition: r.inPlayer?.position ?? null,
        outFantasyTeamPlayerId: r.outFantasyTeamPlayerId,
        inFantasyTeamPlayerId: r.inFantasyTeamPlayerId,
        status: r.status,
        reason: r.reason,
        benchPriority: r.benchPriority,
        formationBefore: r.formationBefore,
        formationAfter: r.formationAfter,
      })),
    };
  }

  async adminGetAutoSubsForGameweek(gameweekId: string) {
    const rows = await this.prisma.fantasyAutoSubstitution.findMany({
      where: { gameweekId },
      include: {
        outPlayer: { select: { id: true, name: true, position: true } },
        inPlayer: { select: { id: true, name: true, position: true } },
        fantasyTeam: { select: { id: true, name: true } },
      },
      orderBy: [{ fantasyTeamId: 'asc' }, { createdAt: 'asc' }],
    });
    return rows;
  }

  async getFinalCountedPlayers(userId: string, gameweekId: string): Promise<FinalXiResult> {
    const team = await this.prisma.fantasyTeam.findFirst({
      where: { userId },
      include: {
        players: {
          include: { player: { select: { id: true, name: true, position: true } } },
        },
      },
    });
    if (!team) throw new NotFoundException('Fantasy team not found');

    const autoSubs = await this.prisma.fantasyAutoSubstitution.findMany({
      where: { fantasyTeamId: team.id, gameweekId },
    });

    const playedMap = await this.buildPlayedMap(gameweekId, team.players.map(p => p.playerId));

    const autoSubbedOutSet = new Set(
      autoSubs.filter(s => s.status === FantasyAutoSubstitutionStatus.APPLIED).map(s => s.outPlayerId),
    );
    const autoSubbedInSet = new Set(
      autoSubs
        .filter(s => s.status === FantasyAutoSubstitutionStatus.APPLIED && s.inPlayerId)
        .map(s => s.inPlayerId!),
    );

    const positionMap = new Map(team.players.map(p => [p.playerId, p.player.position]));
    const finalStarterIds = [
      ...team.players
        .filter(p => p.squadRole === FantasySquadRole.STARTER && !autoSubbedOutSet.has(p.playerId))
        .map(p => p.playerId),
      ...team.players
        .filter(p => p.squadRole === FantasySquadRole.SUBSTITUTE && autoSubbedInSet.has(p.playerId))
        .map(p => p.playerId),
    ];
    const formation = deriveFormation(finalStarterIds, positionMap);

    const sortedBench = team.players
      .filter(p => p.squadRole === FantasySquadRole.SUBSTITUTE)
      .sort((a, b) => (a.benchSlot ?? 999) - (b.benchSlot ?? 999));

    const players: FinalCountedPlayer[] = [];

    for (const tp of team.players) {
      const isStarter = tp.squadRole === FantasySquadRole.STARTER;
      const isBench = tp.squadRole === FantasySquadRole.SUBSTITUTE;
      const isAutoSubOut = autoSubbedOutSet.has(tp.playerId);
      const isAutoSubIn = autoSubbedInSet.has(tp.playerId);
      const played = playedMap.has(tp.playerId);

      const countedInTotal = (isStarter && !isAutoSubOut) || isAutoSubIn;

      let reason: string;
      if (isAutoSubOut) reason = 'auto_sub_out';
      else if (isAutoSubIn) reason = 'auto_sub_in';
      else if (isStarter && played) reason = 'starter';
      else if (isStarter && !played) reason = 'did_not_play';
      else reason = 'bench_not_counted';

      const benchPriorityEntry = isBench
        ? sortedBench.findIndex(b => b.playerId === tp.playerId)
        : null;

      players.push({
        playerId: tp.playerId,
        playerName: tp.player.name,
        position: tp.player.position,
        originalRole: isStarter ? 'STARTER' : 'SUBSTITUTE',
        finalRole: countedInTotal ? 'STARTER' : 'SUBSTITUTE',
        played,
        countedInTotal,
        reason,
        benchPriority: benchPriorityEntry !== null && benchPriorityEntry >= 0 ? benchPriorityEntry : null,
      });
    }

    return { fantasyTeamId: team.id, gameweekId, formation, players };
  }

  // ── Legacy compat ─────────────────────────────────────────────────────────────

  async createLineupSnapshot(fantasyTeamId: string, gameweekId: string): Promise<void> {
    const gw = await this.prisma.gameweek.findUnique({ where: { id: gameweekId } });
    if (!gw) throw new NotFoundException('Gameweek not found');
    const team = await this.prisma.fantasyTeam.findUnique({
      where: { id: fantasyTeamId },
      include: { players: { include: { player: true } } },
    });
    if (!team) throw new NotFoundException('Team not found');
    const snapshot = team.players.map(p => ({
      playerId: p.playerId,
      squadRole: p.squadRole,
      benchSlot: p.benchSlot,
      isCaptain: p.isCaptain,
      isViceCaptain: p.isViceCaptain,
      position: p.position,
    }));
    await this.prisma.fantasyGameweekLineupSnapshot.upsert({
      where: { fantasyTeamId_gameweekId: { fantasyTeamId, gameweekId } },
      create: { fantasyTeamId, gameweekId, snapshotJson: snapshot },
      update: { snapshotJson: snapshot },
    });
  }

  // Legacy admin method — now delegates to new implementation
  async processAutoSubs(gameweekId: string) {
    return this.applyAutoSubsForGameweek(gameweekId);
  }
}
