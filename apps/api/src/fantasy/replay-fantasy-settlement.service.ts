/**
 * ReplayFantasySettlementService
 *
 * Fantasy-domain settlement for World Cup beta historical replay.
 * Owns all FantasyTeam / FantasyTeamPlayer / FantasyPointsLedger writes
 * during replay confirmed mode.
 *
 * Plain class (no NestJS): takes PrismaClient directly so it can be used
 * from the CLI script without a NestJS bootstrap.
 *
 * Transaction strategy:
 *   Per-player: $transaction wraps findFirst + create so no duplicate
 *   FantasyPointsLedger row can be created for the same
 *   (fantasyTeamId, playerId, fixtureId) triple, even on concurrent reruns.
 *
 *   Partial-write repair: because each player entry is checked individually,
 *   a partial team (some players written, some not) is repaired on rerun —
 *   missing entries are created, existing ones are skipped.
 *
 *   FantasyTeam / FantasyTeamPlayer upserts use update:{} to preserve existing
 *   records (idempotent by DB-level @@unique constraints).
 *
 * Scoring uses computePlayerBasePoints from fantasy-scoring.utils — the
 * single canonical scoring function shared with FantasyGameweekScoringService.
 * Captain is the first player in the stats slice (2× multiplier).
 *
 * No betting, no gambling, no real-money mechanics. Points only.
 */

import { PrismaClient, FantasySquadRole, PlayerPosition } from '@prisma/client';

function isPrismaUniqueError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === 'P2002'
  );
}
import { computePlayerBasePoints, type StatInput } from './fantasy-scoring.utils';

const SYNTHETIC_FANTASY_EMAIL = (n: number) => `replay-wc-fantasy-${n}@wc-beta.internal`;
const SYNTHETIC_PASSWORD_HASH = '$2b$10$replay.wc.synthetic.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

export const REPLAY_TEAM_SIZE = 7;

export interface ReplayStatRow {
  playerId: string;
  player: { position: PlayerPosition };
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
  bonusPoints: number;
  tacklesWon: number;
  interceptions: number;
  blockedShots: number;
  didNotPlay: boolean;
}

export interface ReplayFantasyPlayerResult {
  playerId: string;
  position: PlayerPosition;
  isCaptain: boolean;
  basePoints: number;
  multiplier: number;
  finalPoints: number;
  /** 'created' = new row written; 'skipped' = already existed (idempotent); 'dry-run' = no write */
  action: 'created' | 'skipped' | 'dry-run';
}

export interface ReplayFantasyTeamResult {
  teamIndex: number;
  fantasyTeamId: string | null;
  players: ReplayFantasyPlayerResult[];
  teamTotalPoints: number;
  newPointsWritten: number;
}

export class ReplayFantasySettlementService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Upsert one synthetic fantasy user for a given team slot. Idempotent.
   * teamIndex is 1-based (team 1, team 2, team 3).
   */
  async upsertSyntheticUser(teamIndex: number): Promise<string> {
    const user = await this.prisma.user.upsert({
      where: { email: SYNTHETIC_FANTASY_EMAIL(teamIndex) },
      create: {
        email: SYNTHETIC_FANTASY_EMAIL(teamIndex),
        passwordHash: SYNTHETIC_PASSWORD_HASH,
        dateOfBirth: new Date('2000-01-01'),
      },
      update: {},
      select: { id: true },
    });
    return user.id;
  }

  /**
   * Upsert a FantasyTeam for a synthetic user in the fixture's season. Idempotent.
   * Uses @@unique([userId, seasonId]) constraint.
   */
  async upsertSyntheticTeam(userId: string, seasonId: string, teamIndex: number): Promise<string> {
    const team = await this.prisma.fantasyTeam.upsert({
      where: { userId_seasonId: { userId, seasonId } },
      create: {
        userId,
        seasonId,
        name: `[WC-REPLAY] Synthetic Team ${teamIndex}`,
      },
      update: {},
      select: { id: true },
    });
    return team.id;
  }

  /**
   * Upsert FantasyTeamPlayer rows for each player in the stats slice. Idempotent.
   * First player = captain, second = vice-captain.
   * Uses @@unique([fantasyTeamId, playerId]) constraint.
   */
  async upsertTeamPlayers(fantasyTeamId: string, statsSlice: ReplayStatRow[]): Promise<void> {
    await Promise.all(
      statsSlice.map((s, i) =>
        this.prisma.fantasyTeamPlayer.upsert({
          where: { fantasyTeamId_playerId: { fantasyTeamId, playerId: s.playerId } },
          create: {
            fantasyTeamId,
            playerId: s.playerId,
            squadRole: FantasySquadRole.STARTER,
            position: s.player.position,
            isCaptain: i === 0,
            isViceCaptain: i === 1,
          },
          update: {},
          select: { id: true },
        }),
      ),
    );
  }

  /**
   * Score one synthetic team for a fixture.
   *
   * Dry-run: computes preview, zero DB writes.
   * Confirmed: per-player $transaction check+create — partial teams are repaired,
   *   fully scored teams are skipped.
   *
   * @param fixtureId   The completed fixture being replayed
   * @param teamIndex   1-based index (used in log labels)
   * @param fantasyTeamId  The team's DB id
   * @param statsSlice  Up to REPLAY_TEAM_SIZE stat rows (first = captain)
   * @param options     dryRun: true → compute only, zero writes
   */
  async settleTeam(
    fixtureId: string,
    teamIndex: number,
    fantasyTeamId: string,
    statsSlice: ReplayStatRow[],
    options: { dryRun: boolean },
  ): Promise<ReplayFantasyTeamResult> {
    const slice = statsSlice.slice(0, REPLAY_TEAM_SIZE);
    const playerPreviews = this.computePlayerResults(slice);
    const teamTotalPoints = playerPreviews.reduce((s, p) => s + p.finalPoints, 0);

    if (options.dryRun) {
      return {
        teamIndex,
        fantasyTeamId,
        players: playerPreviews.map(p => ({ ...p, action: 'dry-run' as const })),
        teamTotalPoints,
        newPointsWritten: 0,
      };
    }

    const players: ReplayFantasyPlayerResult[] = [];
    let newPointsWritten = 0;

    for (const pr of playerPreviews) {
      // Per-player $transaction: check for existing entry, create if absent.
      // The inner findFirst handles the common idempotent case. The DB-level unique
      // index on (fantasyTeamId, playerId, fixtureId) is the final safety net;
      // P2002 from concurrent runs is caught and treated as 'skipped'.
      const action = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.fantasyPointsLedger.findFirst({
          where: { fantasyTeamId, playerId: pr.playerId, fixtureId },
          select: { id: true },
        });
        if (existing) return 'skipped' as const;

        await tx.fantasyPointsLedger.create({
          data: {
            fantasyTeamId,
            playerId: pr.playerId,
            fixtureId,
            points: pr.finalPoints,
            reason: `[WC-REPLAY] Team ${teamIndex}${pr.isCaptain ? ' Captain' : ''} ${pr.finalPoints} pts`,
            isCaptainBonus: pr.isCaptain,
          },
        });
        return 'created' as const;
      }).catch((err) => {
        if (isPrismaUniqueError(err)) return 'skipped' as const;
        throw err;
      });

      if (action === 'created') newPointsWritten += pr.finalPoints;
      players.push({ ...pr, action });
    }

    return { teamIndex, fantasyTeamId, players, teamTotalPoints, newPointsWritten };
  }

  /** Compute per-player fantasy points using the canonical scoring function. */
  computePlayerResults(
    statsSlice: ReplayStatRow[],
  ): Array<Omit<ReplayFantasyPlayerResult, 'action'>> {
    return statsSlice.map((s, i) => {
      const isCaptain = i === 0;
      const { basePoints } = computePlayerBasePoints(s as StatInput, s.player.position);
      const multiplier = isCaptain ? 2 : 1;
      return {
        playerId: s.playerId,
        position: s.player.position,
        isCaptain,
        basePoints,
        multiplier,
        finalPoints: basePoints * multiplier,
      };
    });
  }
}
