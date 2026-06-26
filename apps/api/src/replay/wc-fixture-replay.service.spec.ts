import 'reflect-metadata';
import { describe, it, expect, vi } from 'vitest';
import { PlayerPosition, FixtureStatus, PredictionStatus } from '@prisma/client';
import {
  buildGtsCases,
  WcFixtureReplayService,
} from './wc-fixture-replay.service';
import { calculatePoints } from '../predictions/scoring';
import { computePlayerBasePoints } from '../fantasy/fantasy-scoring.utils';
import type { PrismaClient } from '@prisma/client';
import type { ReplayPredictionSettlementService } from '../predictions/replay-prediction-settlement.service';
import type { ReplayFantasySettlementService } from '../fantasy/replay-fantasy-settlement.service';
import { PlayerPosition as PP } from '@prisma/client';

// ── Fixture helpers ────────────────────────────────────────────────────────────

function finishedFixture(homeScore = 2, awayScore = 1) {
  return {
    id: 'fix-1',
    seasonId: 'season-wc',
    status: FixtureStatus.FINISHED,
    homeScore,
    awayScore,
    kickoffAt: new Date('2026-06-14T15:00:00Z'),
    providerFixtureId: 'sm-12345',
    homeTeam: { name: 'Home FC' },
    awayTeam: { name: 'Away FC' },
  };
}

function makePlayerStat(overrides: {
  playerId?: string;
  position?: PlayerPosition;
  minutesPlayed?: number;
  goals?: number;
  assists?: number;
  ownGoals?: number;
  yellowCards?: number;
  redCards?: number;
  penaltiesMissed?: number;
  penaltiesSaved?: number;
  saves?: number;
  cleanSheet?: boolean;
  bonusPoints?: number;
  tacklesWon?: number;
  interceptions?: number;
  blockedShots?: number;
  didNotPlay?: boolean;
} = {}) {
  const position = overrides.position ?? PlayerPosition.MIDFIELDER;
  return {
    playerId: overrides.playerId ?? 'player-1',
    minutesPlayed: overrides.minutesPlayed ?? 90,
    goals: overrides.goals ?? 0,
    assists: overrides.assists ?? 0,
    ownGoals: overrides.ownGoals ?? 0,
    yellowCards: overrides.yellowCards ?? 0,
    redCards: overrides.redCards ?? 0,
    penaltiesMissed: overrides.penaltiesMissed ?? 0,
    penaltiesSaved: overrides.penaltiesSaved ?? 0,
    saves: overrides.saves ?? 0,
    cleanSheet: overrides.cleanSheet ?? false,
    bonusPoints: overrides.bonusPoints ?? 0,
    tacklesWon: overrides.tacklesWon ?? 0,
    interceptions: overrides.interceptions ?? 0,
    blockedShots: overrides.blockedShots ?? 0,
    didNotPlay: overrides.didNotPlay ?? false,
    player: { id: overrides.playerId ?? 'player-1', position },
  };
}

const SIX_STATS = [
  makePlayerStat({ playerId: 'p1', position: PP.GOALKEEPER, cleanSheet: true }),
  makePlayerStat({ playerId: 'p2', position: PP.FORWARD, goals: 1 }),
  makePlayerStat({ playerId: 'p3', position: PP.MIDFIELDER, yellowCards: 1 }),
  makePlayerStat({ playerId: 'p4', position: PP.DEFENDER, cleanSheet: true }),
  makePlayerStat({ playerId: 'p5', position: PP.MIDFIELDER, redCards: 1, minutesPlayed: 50 }),
  makePlayerStat({ playerId: 'p6', position: PP.FORWARD, goals: 2 }),
];

/** Base Prisma mock — only contains what the orchestrator itself needs (fixture + stats). */
function makeBasePrisma(
  statsRows = SIX_STATS,
  fixtureOverride?: Record<string, unknown>,
): PrismaClient {
  return {
    fixture: {
      findUnique: vi.fn().mockResolvedValue(
        fixtureOverride ? { ...finishedFixture(), ...fixtureOverride } : finishedFixture(),
      ),
    },
    fantasyPlayerMatchStat: {
      findMany: vi.fn().mockResolvedValue(statsRows),
    },
  } as unknown as PrismaClient;
}

// ── Domain service mocks ───────────────────────────────────────────────────────

const ON_TIME_CASES = buildGtsCases(2, 1).filter(c => !c.late);

function makeGtsSettlementMock(
  settled = 4,
): ReplayPredictionSettlementService {
  const entries = ON_TIME_CASES.map((c, i) => ({
    label: c.label,
    userId: `u-synth-${i + 1}`,
    predictionId: `pred-${i + 1}`,
    points: c.expectedPoints,
    action: 'settled' as const,
  }));
  return {
    upsertSyntheticUsers: vi.fn().mockResolvedValue(
      ON_TIME_CASES.map((_, i) => ({ id: `u-synth-${i + 1}`, index: i + 1 })),
    ),
    settle: vi.fn().mockResolvedValue({ settled, repaired: 0, skipped: 0, entries }),
  } as unknown as ReplayPredictionSettlementService;
}

function makeFantasySettlementMock(
  options: { allSkipped?: boolean; newPointsWritten?: number } = {},
): ReplayFantasySettlementService {
  const action = options.allSkipped ? ('skipped' as const) : ('created' as const);
  const newPts = options.allSkipped ? 0 : (options.newPointsWritten ?? 12);

  const mockTeamResult = (teamIndex: number) => ({
    teamIndex,
    fantasyTeamId: `ft-${teamIndex}`,
    players: [
      { playerId: 'p1', position: PP.GOALKEEPER, isCaptain: true, basePoints: 6, multiplier: 2, finalPoints: 12, action },
    ],
    teamTotalPoints: 12,
    newPointsWritten: newPts,
  });

  return {
    upsertSyntheticUser: vi.fn().mockResolvedValue('u-fantasy-1'),
    upsertSyntheticTeam: vi.fn().mockResolvedValue('ft-1'),
    upsertTeamPlayers: vi.fn().mockResolvedValue(undefined),
    settleTeam: vi.fn().mockImplementation(async (_fid: string, teamIndex: number) => mockTeamResult(teamIndex)),
  } as unknown as ReplayFantasySettlementService;
}

// ── calculatePoints (pure function) ───────────────────────────────────────────

describe('calculatePoints (GTS scoring)', () => {
  it('exact score prediction earns 10 points', () => {
    expect(calculatePoints(2, 1, 2, 1)).toBe(10);
    expect(calculatePoints(0, 0, 0, 0)).toBe(10);
    expect(calculatePoints(3, 2, 3, 2)).toBe(10);
  });

  it('correct outcome wrong diff earns 3 points', () => {
    expect(calculatePoints(2, 1, 3, 1)).toBe(3);
    expect(calculatePoints(3, 0, 2, 0)).toBe(3);
    expect(calculatePoints(0, 2, 0, 1)).toBe(3);
  });

  it('same diff earns 5 points', () => {
    expect(calculatePoints(2, 1, 3, 2)).toBe(5);
    expect(calculatePoints(0, 2, 1, 3)).toBe(5);
  });

  it('wrong result earns 0 points', () => {
    expect(calculatePoints(2, 1, 0, 1)).toBe(0);
    expect(calculatePoints(2, 1, 1, 1)).toBe(0);
    expect(calculatePoints(0, 0, 1, 0)).toBe(0);
  });
});

// ── buildGtsCases (pure function) ─────────────────────────────────────────────

describe('buildGtsCases', () => {
  it('generates exactly 5 cases (4 on-time + 1 late) for a home win', () => {
    const cases = buildGtsCases(2, 1);
    expect(cases).toHaveLength(5);
    expect(cases.filter(c => c.late)).toHaveLength(1);
    expect(cases.filter(c => !c.late)).toHaveLength(4);
  });

  it('late prediction is marked with late: true and label late_exact', () => {
    const cases = buildGtsCases(2, 1);
    const late = cases.filter(c => c.late);
    expect(late).toHaveLength(1);
    expect(late[0]!.label).toBe('late_exact');
  });

  it('exact_match case earns expectedPoints 10 for all score combinations', () => {
    for (const [h, a] of [[2, 1], [0, 0], [3, 2], [0, 3]] as [number, number][]) {
      const exact = buildGtsCases(h, a).find(c => c.label === 'exact_match')!;
      expect(exact.expectedPoints).toBe(10);
      expect(calculatePoints(h, a, exact.predictedHome, exact.predictedAway)).toBe(10);
    }
  });

  it('correct_diff case earns 5 pts', () => {
    const correctDiff = buildGtsCases(2, 1).find(c => c.label === 'correct_diff')!;
    expect(correctDiff.expectedPoints).toBe(5);
    expect(calculatePoints(2, 1, correctDiff.predictedHome, correctDiff.predictedAway)).toBe(5);
  });

  it('wrong_outcome case always earns 0 points', () => {
    const wrong = buildGtsCases(2, 1).find(c => c.label === 'wrong_outcome')!;
    expect(wrong.expectedPoints).toBe(0);
    expect(calculatePoints(2, 1, wrong.predictedHome, wrong.predictedAway)).toBe(0);
  });

  it('dry-run result reports lateRejected: 1 and predictionsSettled: 0', async () => {
    const svc = new WcFixtureReplayService(makeBasePrisma());
    const result = await svc.run('fix-1', { dryRun: true });
    expect(result.gts.lateRejected).toBe(1);
    expect(result.gts.predictionsSettled).toBe(0);
  });
});

// ── computePlayerBasePoints (canonical scoring function) ──────────────────────

describe('computePlayerBasePoints (canonical function used by replay)', () => {
  it('player who did not play earns 0 pts, played=false', () => {
    const stat = makePlayerStat({ minutesPlayed: 0, didNotPlay: true });
    const result = computePlayerBasePoints(stat, PlayerPosition.FORWARD);
    expect(result.basePoints).toBe(0);
    expect(result.played).toBe(false);
  });

  it('GK with 90 min appearance earns 2 pts', () => {
    const stat = makePlayerStat({ position: PlayerPosition.GOALKEEPER });
    const result = computePlayerBasePoints(stat, PlayerPosition.GOALKEEPER);
    expect(result.basePoints).toBe(2);
    expect(result.played).toBe(true);
  });

  it('captain 2x multiplier applied by caller doubles base points', () => {
    const stat = makePlayerStat({ position: PlayerPosition.GOALKEEPER, cleanSheet: true });
    const { basePoints } = computePlayerBasePoints(stat, PlayerPosition.GOALKEEPER);
    // GK + clean sheet = 2 + 4 = 6; with captain 2x = 12
    expect(basePoints).toBe(6);
    expect(basePoints * 2).toBe(12);
  });

  it('yellow card deducts 1 pt', () => {
    const stat = makePlayerStat({ yellowCards: 1 });
    const { basePoints, breakdown } = computePlayerBasePoints(stat, PlayerPosition.MIDFIELDER);
    expect(breakdown.yellowCards).toBe(-1);
    expect(basePoints).toBe(2 - 1);
  });

  it('red card deducts 3 pts', () => {
    const stat = makePlayerStat({ redCards: 1, minutesPlayed: 50 });
    const { basePoints, breakdown } = computePlayerBasePoints(stat, PlayerPosition.MIDFIELDER);
    expect(breakdown.redCards).toBe(-3);
    expect(basePoints).toBe(1 - 3);
  });

  it('GK clean sheet earns +4 pts bonus', () => {
    const stat = makePlayerStat({ cleanSheet: true });
    const { basePoints, breakdown } = computePlayerBasePoints(stat, PlayerPosition.GOALKEEPER);
    expect(breakdown.cleanSheet).toBe(4);
    expect(basePoints).toBe(2 + 4);
  });

  it('FWD clean sheet earns 0 bonus (position rule)', () => {
    const stat = makePlayerStat({ cleanSheet: true });
    const { basePoints, breakdown } = computePlayerBasePoints(stat, PlayerPosition.FORWARD);
    expect(breakdown.cleanSheet).toBe(0);
    expect(basePoints).toBe(2);
  });

  it('goals conceded deduction is 0 — clean sheet bonus is binary (domain rule)', () => {
    const stat = makePlayerStat({ cleanSheet: false });
    const { breakdown } = computePlayerBasePoints(stat, PlayerPosition.GOALKEEPER);
    expect(breakdown.goalsConcededDeduction).toBe(0);
    expect(breakdown.cleanSheet).toBe(0);
  });
});

// ── GTS orchestration ─────────────────────────────────────────────────────────

describe('WcFixtureReplayService GTS orchestration', () => {
  it('dry-run does not call gtsSettlement.upsertSyntheticUsers or settle', async () => {
    const gts = makeGtsSettlementMock();
    const svc = new WcFixtureReplayService(makeBasePrisma(), gts, makeFantasySettlementMock());
    await svc.run('fix-1', { dryRun: true });
    expect(gts.upsertSyntheticUsers).not.toHaveBeenCalled();
    expect(gts.settle).not.toHaveBeenCalled();
  });

  it('confirmed: upsertSyntheticUsers called with on-time case count (4)', async () => {
    const gts = makeGtsSettlementMock();
    const svc = new WcFixtureReplayService(makeBasePrisma(), gts, makeFantasySettlementMock());
    await svc.run('fix-1', { dryRun: false });
    expect(gts.upsertSyntheticUsers).toHaveBeenCalledWith(4);
  });

  it('confirmed: settle called with fixtureId, userCases, fixture scores, dryRun: false', async () => {
    const gts = makeGtsSettlementMock();
    const svc = new WcFixtureReplayService(makeBasePrisma(), gts, makeFantasySettlementMock());
    await svc.run('fix-1', { dryRun: false });
    expect(gts.settle).toHaveBeenCalledWith(
      'fix-1',
      expect.arrayContaining([
        expect.objectContaining({ label: 'exact_match', predictedHome: 2, predictedAway: 1 }),
      ]),
      expect.objectContaining({ homeScore: 2, awayScore: 1, seasonId: 'season-wc' }),
      { dryRun: false },
    );
  });

  it('predictionsSettled equals settled + repaired from domain service', async () => {
    const gts = {
      upsertSyntheticUsers: vi.fn().mockResolvedValue(
        [1, 2, 3, 4].map(i => ({ id: `u-${i}`, index: i })),
      ),
      settle: vi.fn().mockResolvedValue({
        settled: 2,
        repaired: 1,
        skipped: 1,
        entries: ON_TIME_CASES.map((c, i) => ({
          label: c.label, userId: `u-${i + 1}`, predictionId: `pred-${i}`,
          points: c.expectedPoints, action: i < 2 ? 'settled' : i === 2 ? 'repaired' : 'skipped',
        })),
      }),
    } as unknown as ReplayPredictionSettlementService;
    const svc = new WcFixtureReplayService(makeBasePrisma(), gts, makeFantasySettlementMock());
    const result = await svc.run('fix-1', { dryRun: false });
    expect(result.gts.predictionsSettled).toBe(3); // settled + repaired
    expect(result.gts.repairedLedgerEntries).toBe(1);
  });

  it('when domain service reports all skipped, predictionsSettled is 0', async () => {
    const gts = {
      upsertSyntheticUsers: vi.fn().mockResolvedValue(
        [1, 2, 3, 4].map(i => ({ id: `u-${i}`, index: i })),
      ),
      settle: vi.fn().mockResolvedValue({
        settled: 0, repaired: 0, skipped: 4,
        entries: ON_TIME_CASES.map((c, i) => ({
          label: c.label, userId: `u-${i + 1}`, predictionId: `pred-${i}`,
          points: c.expectedPoints, action: 'skipped',
        })),
      }),
    } as unknown as ReplayPredictionSettlementService;
    const svc = new WcFixtureReplayService(makeBasePrisma(), gts, makeFantasySettlementMock());
    const result = await svc.run('fix-1', { dryRun: false });
    expect(result.gts.predictionsSettled).toBe(0);
  });
});

// ── Fantasy orchestration ─────────────────────────────────────────────────────

describe('WcFixtureReplayService fantasy orchestration', () => {
  it('dry-run: settleTeam called with dryRun: true; upsert methods not called', async () => {
    const fantasy = makeFantasySettlementMock();
    const svc = new WcFixtureReplayService(makeBasePrisma(), makeGtsSettlementMock(), fantasy);
    const result = await svc.run('fix-1', { dryRun: true });
    expect(fantasy.upsertSyntheticUser).not.toHaveBeenCalled();
    expect(fantasy.upsertSyntheticTeam).not.toHaveBeenCalled();
    expect(fantasy.upsertTeamPlayers).not.toHaveBeenCalled();
    expect(fantasy.settleTeam).toHaveBeenCalled();
    const calls = (fantasy.settleTeam as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.every((call: unknown[]) => (call[4] as { dryRun: boolean }).dryRun === true)).toBe(true);
    expect(result.fantasy.teamsScored).toBe(0);
  });

  it('confirmed: upsertSyntheticUser, upsertSyntheticTeam, upsertTeamPlayers, settleTeam called per team', async () => {
    const fantasy = makeFantasySettlementMock();
    const svc = new WcFixtureReplayService(makeBasePrisma(), makeGtsSettlementMock(), fantasy);
    await svc.run('fix-1', { dryRun: false });
    // 6 stats → 3 teams
    expect(fantasy.upsertSyntheticUser).toHaveBeenCalledTimes(3);
    expect(fantasy.upsertSyntheticTeam).toHaveBeenCalledTimes(3);
    expect(fantasy.upsertTeamPlayers).toHaveBeenCalledTimes(3);
    expect(fantasy.settleTeam).toHaveBeenCalledTimes(3);
  });

  it('confirmed: first player in each team is captain with 2x multiplier', async () => {
    const svc = new WcFixtureReplayService(makeBasePrisma(), makeGtsSettlementMock(), makeFantasySettlementMock());
    const result = await svc.run('fix-1', { dryRun: true });
    expect(result.fantasy.skipped).toBe(false);
    for (const team of result.fantasy.teams) {
      const captain = team.players.find(p => p.isCaptain);
      expect(captain).toBeDefined();
      expect(captain!.multiplier).toBe(2);
    }
  });

  it('confirmed: teamsScored and totalPointsWritten reflect domain service results', async () => {
    const fantasy = makeFantasySettlementMock({ newPointsWritten: 20 });
    const svc = new WcFixtureReplayService(makeBasePrisma(), makeGtsSettlementMock(), fantasy);
    const result = await svc.run('fix-1', { dryRun: false });
    expect(result.fantasy.teamsScored).toBe(3); // 3 teams, each has created actions
    expect(result.fantasy.totalPointsWritten).toBe(60); // 3 × 20
  });

  it('when all players are skipped, teamsScored is 0 and totalPointsWritten is 0', async () => {
    const fantasy = makeFantasySettlementMock({ allSkipped: true });
    const svc = new WcFixtureReplayService(makeBasePrisma(), makeGtsSettlementMock(), fantasy);
    const result = await svc.run('fix-1', { dryRun: false });
    expect(result.fantasy.teamsScored).toBe(0);
    expect(result.fantasy.totalPointsWritten).toBe(0);
  });
});

// ── Error handling ─────────────────────────────────────────────────────────────

describe('WcFixtureReplayService error handling', () => {
  it('throws when fixture not found', async () => {
    const prisma = makeBasePrisma(SIX_STATS, undefined);
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const svc = new WcFixtureReplayService(prisma);
    await expect(svc.run('missing', { dryRun: true })).rejects.toThrow("Fixture 'missing' not found");
  });

  it('throws when fixture is not FINISHED', async () => {
    const prisma = makeBasePrisma(SIX_STATS, { status: FixtureStatus.SCHEDULED });
    const svc = new WcFixtureReplayService(prisma);
    await expect(svc.run('fix-1', { dryRun: true })).rejects.toThrow('must be FINISHED');
  });

  it('throws when fixture scores are null', async () => {
    const prisma = makeBasePrisma(SIX_STATS, { homeScore: null, awayScore: null });
    const svc = new WcFixtureReplayService(prisma);
    await expect(svc.run('fix-1', { dryRun: true })).rejects.toThrow('scores are not recorded');
  });

  it('skips fantasy if fewer than 2 player stats exist', async () => {
    const prisma = makeBasePrisma([makePlayerStat({ playerId: 'only-one' })]);
    const svc = new WcFixtureReplayService(prisma);
    const result = await svc.run('fix-1', { dryRun: true });
    expect(result.fantasy.skipped).toBe(true);
    expect(result.fantasy.statsFound).toBe(1);
  });

  it('fixture metadata is included in result', async () => {
    const svc = new WcFixtureReplayService(makeBasePrisma());
    const result = await svc.run('fix-1', { dryRun: true });
    expect(result.fixture.homeTeam).toBe('Home FC');
    expect(result.fixture.awayTeam).toBe('Away FC');
    expect(result.fixture.homeScore).toBe(2);
    expect(result.fixture.awayScore).toBe(1);
    expect(result.fixture.providerFixtureId).toBe('sm-12345');
    expect(result.fixture.kickoffAt).toBeTruthy();
  });
});
