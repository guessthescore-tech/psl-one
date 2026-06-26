/**
 * WcFixtureReplayService — Orchestrator
 *
 * Historical replay harness for completed World Cup 2026 fixtures.
 *
 * Responsibilities of this class (orchestration only):
 *   - Load and validate completed fixture facts
 *   - Build synthetic GTS prediction cases via buildGtsCases()
 *   - Upsert synthetic users (GTS + Fantasy) — user-domain setup
 *   - In dry-run: compute preview with zero DB writes
 *   - In confirmed mode: delegate settlement writes to domain services:
 *       GTS   → ReplayPredictionSettlementService (predictions domain)
 *       Fantasy → ReplayFantasySettlementService (fantasy domain)
 *   - Aggregate and return a structured JSON summary
 *
 * This class does NOT directly write to:
 *   ScorePrediction, PredictionPointsLedger, FanValueLedger,
 *   FantasyTeam, FantasyTeamPlayer, FantasyPointsLedger.
 *   All such writes are owned by the respective domain services.
 *
 * Safety invariants:
 *   - Does NOT activate the PSL season
 *   - Does NOT modify or delete World Cup 2026 historical fixture data
 *   - Dry-run never writes to any DB table
 *   - Settlement is idempotent: re-running skips/repairs, never duplicates
 *   - Synthetic user emails use the @wc-beta.internal domain
 *
 * Usage:
 *   pnpm --filter @psl-one/api replay:world-cup-fixture -- --fixtureId=<id> --dry-run
 *   pnpm --filter @psl-one/api replay:world-cup-fixture -- --fixtureId=<id> --confirm=REPLAY_WORLD_CUP_BETA
 */

import { PrismaClient, FixtureStatus, PlayerPosition } from '@prisma/client';
import { calculatePoints } from '../predictions/scoring';
import {
  ReplayPredictionSettlementService,
  type ReplayGtsCaseInput,
  type ReplayGtsSettlementSummary,
} from '../predictions/replay-prediction-settlement.service';
import {
  ReplayFantasySettlementService,
  type ReplayStatRow,
  type ReplayFantasyTeamResult,
  REPLAY_TEAM_SIZE,
} from '../fantasy/replay-fantasy-settlement.service';
import { type StatInput } from '../fantasy/fantasy-scoring.utils';

/** Minimum FantasyPlayerMatchStat rows needed to attempt fantasy scoring. */
const MIN_STATS = 2;

// ── Public interfaces ──────────────────────────────────────────────────────────

export interface GtsPredictionCase {
  label: string;
  predictedHome: number;
  predictedAway: number;
  expectedPoints: number;
  late: boolean;
}

export interface WcGtsReplayResult {
  scenarios: Array<GtsPredictionCase & { predictionId?: string; pointsAwarded?: number }>;
  lateRejected: number;
  predictionsSettled: number;
  repairedLedgerEntries: number;
  totalPointsAwarded: number;
}

export interface WcFantasyPlayerResult {
  playerId: string;
  position: PlayerPosition;
  isCaptain: boolean;
  basePoints: number;
  multiplier: number;
  finalPoints: number;
}

export interface WcFantasyTeamResult {
  teamIndex: number;
  players: WcFantasyPlayerResult[];
  teamTotalPoints: number;
  newPointsWritten: number;
  alreadyScored: boolean;
}

export interface WcFantasyReplayResult {
  statsFound: number;
  skipped: boolean;
  skipReason?: string;
  teams: WcFantasyTeamResult[];
  teamsScored: number;
  totalPointsWritten: number;
}

export interface WcFixtureReplayResult {
  fixtureId: string;
  fixture: {
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    providerFixtureId: string | null;
    kickoffAt: string;
  };
  dryRun: boolean;
  gts: WcGtsReplayResult;
  fantasy: WcFantasyReplayResult;
}

type LoadedFixture = {
  id: string;
  seasonId: string;
  homeScore: number;
  awayScore: number;
  kickoffAt: Date;
  providerFixtureId: string | null;
  homeTeam: { name: string };
  awayTeam: { name: string };
};

// ── Case generation ────────────────────────────────────────────────────────────

/**
 * Build 4 on-time prediction cases + 1 late case from actual fixture scores.
 *
 * Cases:
 *   1. exact_match                — always 10 pts
 *   2. correct_diff               — same winner + margin, 5 pts
 *   3. correct_outcome_wrong_diff — same winner, different margin, 3 pts (non-draw)
 *      OR wrong_draw_prediction   — predicts home win when actual was a draw, 0 pts
 *   4. wrong_outcome              — wrong winner, 0 pts
 *   5. late_exact (late: true)    — not seeded; simulates production kickoff guard rejection
 */
export function buildGtsCases(actualHome: number, actualAway: number): GtsPredictionCase[] {
  const isDraw = actualHome === actualAway;
  const isHomeWin = actualHome > actualAway;
  const diff = actualHome - actualAway;

  const cases: GtsPredictionCase[] = [];

  // 1. Exact match → 10 pts
  cases.push({
    label: 'exact_match',
    predictedHome: actualHome,
    predictedAway: actualAway,
    expectedPoints: 10,
    late: false,
  });

  // 2. Same diff (shift both by +1) → 5 pts
  cases.push({
    label: 'correct_diff',
    predictedHome: actualHome + 1,
    predictedAway: actualAway + 1,
    expectedPoints: 5,
    late: false,
  });

  // 3. Correct outcome different diff → 3 pts / wrong draw prediction → 0 pts
  if (!isDraw) {
    if (isHomeWin) {
      const adjustedAway = diff > 1 ? actualAway + 1 : actualAway - 1;
      const ph = adjustedAway < 0 ? actualHome + 2 : actualHome;
      const pa = adjustedAway < 0 ? actualAway : adjustedAway;
      cases.push({
        label: 'correct_outcome_wrong_diff',
        predictedHome: ph,
        predictedAway: pa,
        expectedPoints: calculatePoints(actualHome, actualAway, ph, pa),
        late: false,
      });
    } else {
      const adjustedHome = Math.abs(diff) > 1 ? actualHome + 1 : actualHome - 1;
      const ph = adjustedHome < 0 ? actualHome : adjustedHome;
      const pa = adjustedHome < 0 ? actualAway + 2 : actualAway;
      cases.push({
        label: 'correct_outcome_wrong_diff',
        predictedHome: ph,
        predictedAway: pa,
        expectedPoints: calculatePoints(actualHome, actualAway, ph, pa),
        late: false,
      });
    }
  } else {
    // Draw: predict home win instead (0 pts)
    cases.push({
      label: 'wrong_draw_prediction',
      predictedHome: actualHome + 1,
      predictedAway: actualAway,
      expectedPoints: 0,
      late: false,
    });
  }

  // 4. Wrong outcome → 0 pts
  if (isHomeWin) {
    cases.push({ label: 'wrong_outcome', predictedHome: 0, predictedAway: 1, expectedPoints: 0, late: false });
  } else if (!isDraw) {
    cases.push({ label: 'wrong_outcome', predictedHome: 1, predictedAway: 0, expectedPoints: 0, late: false });
  } else {
    cases.push({ label: 'wrong_outcome', predictedHome: 1, predictedAway: 0, expectedPoints: 0, late: false });
  }

  // 5. Late (not seeded — simulates kickoff guard rejection)
  cases.push({
    label: 'late_exact',
    predictedHome: actualHome,
    predictedAway: actualAway,
    expectedPoints: 10,
    late: true,
  });

  return cases;
}

/** Split an array into n equal chunks (last chunk gets any remainder). */
function chunkStats<T>(arr: T[], n: number): T[][] {
  if (n <= 0 || arr.length === 0) return [];
  const size = Math.floor(arr.length / n);
  if (size === 0) return [arr];
  const chunks: T[][] = [];
  for (let i = 0; i < n; i++) {
    const start = i * size;
    const end = i === n - 1 ? arr.length : start + size;
    const chunk = arr.slice(start, end);
    if (chunk.length > 0) chunks.push(chunk);
  }
  return chunks;
}

// ── Orchestrator ───────────────────────────────────────────────────────────────

export class WcFixtureReplayService {
  private readonly gtsSettlement: ReplayPredictionSettlementService;
  private readonly fantasySettlement: ReplayFantasySettlementService;

  constructor(
    private readonly prisma: PrismaClient,
    gtsSettlement?: ReplayPredictionSettlementService,
    fantasySettlement?: ReplayFantasySettlementService,
  ) {
    this.gtsSettlement = gtsSettlement ?? new ReplayPredictionSettlementService(prisma);
    this.fantasySettlement = fantasySettlement ?? new ReplayFantasySettlementService(prisma);
  }

  async run(fixtureId: string, options: { dryRun: boolean }): Promise<WcFixtureReplayResult> {
    const { dryRun } = options;
    const fixture = await this.loadFixture(fixtureId);

    const [gts, fantasy] = await Promise.all([
      dryRun ? this.dryRunGts(fixture) : this.runGts(fixture),
      dryRun ? this.dryRunFantasy(fixture) : this.runFantasy(fixture),
    ]);

    return {
      fixtureId,
      fixture: {
        homeTeam: fixture.homeTeam.name,
        awayTeam: fixture.awayTeam.name,
        homeScore: fixture.homeScore,
        awayScore: fixture.awayScore,
        kickoffAt: fixture.kickoffAt.toISOString(),
        providerFixtureId: fixture.providerFixtureId,
      },
      dryRun,
      gts,
      fantasy,
    };
  }

  private async loadFixture(fixtureId: string): Promise<LoadedFixture> {
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      include: {
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
      },
    });
    if (!fixture) throw new Error(`Fixture '${fixtureId}' not found`);
    if (fixture.status !== FixtureStatus.FINISHED) {
      throw new Error(`Fixture must be FINISHED for replay (current: ${fixture.status})`);
    }
    if (fixture.homeScore === null || fixture.awayScore === null) {
      throw new Error('Fixture scores are not recorded — cannot replay');
    }
    return fixture as LoadedFixture;
  }

  private async loadStats(fixtureId: string) {
    return this.prisma.fantasyPlayerMatchStat.findMany({
      where: { fixtureId },
      take: 22,
      include: { player: { select: { id: true, position: true } } },
    });
  }

  // ── GTS: dry-run ────────────────────────────────────────────────────────────

  private async dryRunGts(fixture: LoadedFixture): Promise<WcGtsReplayResult> {
    const cases = buildGtsCases(fixture.homeScore, fixture.awayScore);
    const onTime = cases.filter(c => !c.late);
    return {
      scenarios: cases,
      lateRejected: 1,
      predictionsSettled: 0,
      repairedLedgerEntries: 0,
      totalPointsAwarded: onTime.reduce((s, c) => s + c.expectedPoints, 0),
    };
  }

  // ── GTS: confirmed ──────────────────────────────────────────────────────────

  private async runGts(fixture: LoadedFixture): Promise<WcGtsReplayResult> {
    const allCases = buildGtsCases(fixture.homeScore, fixture.awayScore);
    const onTimeCases: ReplayGtsCaseInput[] = allCases
      .filter(c => !c.late)
      .map(c => ({ label: c.label, predictedHome: c.predictedHome, predictedAway: c.predictedAway }));

    // Upsert synthetic users (predictions domain orchestration)
    const syntheticUsers = await this.gtsSettlement.upsertSyntheticUsers(onTimeCases.length);

    // Build user-case mapping
    const userCases = onTimeCases.map((c, i) => ({
      userId: syntheticUsers[i]?.id ?? (() => { throw new Error(`Synthetic user index ${i} missing`); })(),
      label: c.label,
      predictedHome: c.predictedHome,
      predictedAway: c.predictedAway,
    }));

    // Delegate all settlement writes to the predictions domain service
    const summary: ReplayGtsSettlementSummary = await this.gtsSettlement.settle(
      fixture.id,
      userCases,
      { homeScore: fixture.homeScore, awayScore: fixture.awayScore, seasonId: fixture.seasonId },
      { dryRun: false },
    );

    // Build a label→entry map for scenario enrichment
    const entryByLabel = Object.fromEntries(summary.entries.map(e => [e.label, e]));

    const scenarios = allCases.map(c => {
      if (c.late) return { ...c };
      const entry = entryByLabel[c.label];
      if (!entry?.predictionId) return { ...c };
      return { ...c, predictionId: entry.predictionId, pointsAwarded: entry.points };
    });

    return {
      scenarios,
      lateRejected: 1,
      predictionsSettled: summary.settled + summary.repaired,
      repairedLedgerEntries: summary.repaired,
      totalPointsAwarded: summary.entries.reduce((s, e) => s + e.points, 0),
    };
  }

  // ── Fantasy: dry-run ────────────────────────────────────────────────────────

  private async dryRunFantasy(fixture: LoadedFixture): Promise<WcFantasyReplayResult> {
    const stats = await this.loadStats(fixture.id);

    if (stats.length < MIN_STATS) {
      return {
        statsFound: stats.length,
        skipped: true,
        skipReason: `Need ≥${MIN_STATS} FantasyPlayerMatchStat records for '${fixture.id}'; found ${stats.length}.`,
        teams: [],
        teamsScored: 0,
        totalPointsWritten: 0,
      };
    }

    const numTeams = Math.min(3, Math.floor(stats.length / 2));
    const chunks = chunkStats(
      stats as unknown as ReplayStatRow[],
      numTeams,
    );

    const teams: WcFantasyTeamResult[] = await Promise.all(
      chunks.map(async (chunk, idx) => {
        const teamIndex = idx + 1;
        const result = await this.fantasySettlement.settleTeam(
          fixture.id, teamIndex, `dry-run-team-${teamIndex}`,
          chunk.slice(0, REPLAY_TEAM_SIZE),
          { dryRun: true },
        );
        return {
          teamIndex,
          players: result.players.map(p => ({
            playerId: p.playerId,
            position: p.position,
            isCaptain: p.isCaptain,
            basePoints: p.basePoints,
            multiplier: p.multiplier,
            finalPoints: p.finalPoints,
          })),
          teamTotalPoints: result.teamTotalPoints,
          newPointsWritten: 0,
          alreadyScored: false,
        };
      }),
    );

    return {
      statsFound: stats.length,
      skipped: false,
      teams,
      teamsScored: 0,
      totalPointsWritten: teams.reduce((s, t) => s + t.teamTotalPoints, 0),
    };
  }

  // ── Fantasy: confirmed ──────────────────────────────────────────────────────

  private async runFantasy(fixture: LoadedFixture): Promise<WcFantasyReplayResult> {
    const stats = await this.loadStats(fixture.id);

    if (stats.length < MIN_STATS) {
      return {
        statsFound: stats.length,
        skipped: true,
        skipReason: `Need ≥${MIN_STATS} FantasyPlayerMatchStat records for '${fixture.id}'; found ${stats.length}.`,
        teams: [],
        teamsScored: 0,
        totalPointsWritten: 0,
      };
    }

    const numTeams = Math.min(3, Math.floor(stats.length / 2));
    const chunks = chunkStats(stats as unknown as ReplayStatRow[], numTeams);

    let totalPointsWritten = 0;
    let teamsScored = 0;
    const teamResults: WcFantasyTeamResult[] = [];

    for (let t = 0; t < chunks.length; t++) {
      const chunk = chunks[t]!;
      const teamIndex = t + 1;

      // Upsert synthetic user + team (fantasy-domain setup via settlement service)
      const userId = await this.fantasySettlement.upsertSyntheticUser(teamIndex);
      const fantasyTeamId = await this.fantasySettlement.upsertSyntheticTeam(userId, fixture.seasonId, teamIndex);
      const statsSlice = chunk.slice(0, REPLAY_TEAM_SIZE);
      await this.fantasySettlement.upsertTeamPlayers(fantasyTeamId, statsSlice);

      // Delegate per-player ledger settlement to the fantasy domain service
      const result: ReplayFantasyTeamResult = await this.fantasySettlement.settleTeam(
        fixture.id,
        teamIndex,
        fantasyTeamId,
        statsSlice,
        { dryRun: false },
      );

      const alreadyScored = result.players.every(p => p.action === 'skipped');
      if (!alreadyScored || result.newPointsWritten > 0) teamsScored++;

      totalPointsWritten += result.newPointsWritten;

      teamResults.push({
        teamIndex,
        players: result.players.map(p => ({
          playerId: p.playerId,
          position: p.position,
          isCaptain: p.isCaptain,
          basePoints: p.basePoints,
          multiplier: p.multiplier,
          finalPoints: p.finalPoints,
        })),
        teamTotalPoints: result.teamTotalPoints,
        newPointsWritten: result.newPointsWritten,
        alreadyScored,
      });
    }

    return {
      statsFound: stats.length,
      skipped: false,
      teams: teamResults,
      teamsScored,
      totalPointsWritten,
    };
  }
}
