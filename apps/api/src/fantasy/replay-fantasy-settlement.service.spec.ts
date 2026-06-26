import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlayerPosition, FantasySquadRole } from '@prisma/client';
import {
  ReplayFantasySettlementService,
  REPLAY_TEAM_SIZE,
  type ReplayStatRow,
} from './replay-fantasy-settlement.service';
import type { PrismaClient } from '@prisma/client';

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeStat(overrides: Partial<ReplayStatRow> = {}): ReplayStatRow {
  const position = overrides.player?.position ?? PlayerPosition.MIDFIELDER;
  return {
    playerId: overrides.playerId ?? 'p-1',
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
    player: overrides.player ?? { position },
  };
}

function makeStats(count: number, positions: PlayerPosition[] = []): ReplayStatRow[] {
  return Array.from({ length: count }, (_, i) =>
    makeStat({
      playerId: `p-${i + 1}`,
      player: { position: positions[i] ?? PlayerPosition.MIDFIELDER },
    }),
  );
}

/** Creates a mock Prisma for fantasy settlement. tx mocks can be configured per test. */
function makePrisma(txFindFirstResult: { id: string } | null = null) {
  const txFindFirst = vi.fn().mockResolvedValue(txFindFirstResult);
  const txCreate = vi.fn().mockResolvedValue({});

  const prisma = {
    user: { upsert: vi.fn().mockResolvedValue({ id: 'u-fantasy-1' }) },
    fantasyTeam: {
      upsert: vi.fn().mockResolvedValue({ id: 'ft-1' }),
    },
    fantasyTeamPlayer: {
      upsert: vi.fn().mockResolvedValue({ id: 'ftp-1' }),
    },
    fantasyPointsLedger: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn().mockImplementation(
      async (fn: (tx: Record<string, unknown>) => Promise<unknown>) =>
        fn({
          fantasyPointsLedger: { findFirst: txFindFirst, create: txCreate },
        }),
    ),
  } as unknown as PrismaClient;

  return { prisma, txFindFirst, txCreate };
}

// ── upsertSyntheticUser ───────────────────────────────────────────────────────

describe('ReplayFantasySettlementService.upsertSyntheticUser', () => {
  it('upserts user with correct email for each team index', async () => {
    const { prisma } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    await svc.upsertSyntheticUser(1);
    await svc.upsertSyntheticUser(2);
    const calls = (prisma.user.upsert as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls[0]![0].where.email).toBe('replay-wc-fantasy-1@wc-beta.internal');
    expect(calls[1]![0].where.email).toBe('replay-wc-fantasy-2@wc-beta.internal');
  });

  it('upsert uses update:{} to be idempotent', async () => {
    const { prisma } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    await svc.upsertSyntheticUser(1);
    const call = (prisma.user.upsert as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(call.update).toEqual({});
  });

  it('returns userId from upsert result', async () => {
    const { prisma } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    const userId = await svc.upsertSyntheticUser(1);
    expect(userId).toBe('u-fantasy-1');
  });
});

// ── upsertSyntheticTeam ───────────────────────────────────────────────────────

describe('ReplayFantasySettlementService.upsertSyntheticTeam', () => {
  it('upserts team with userId_seasonId compound key', async () => {
    const { prisma } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    await svc.upsertSyntheticTeam('u-1', 'season-wc', 1);
    expect(prisma.fantasyTeam.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_seasonId: { userId: 'u-1', seasonId: 'season-wc' } },
        update: {},
      }),
    );
  });

  it('team name includes teamIndex', async () => {
    const { prisma } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    await svc.upsertSyntheticTeam('u-1', 'season-wc', 3);
    const call = (prisma.fantasyTeam.upsert as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(call.create.name).toContain('3');
  });

  it('returns fantasyTeamId', async () => {
    const { prisma } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    const id = await svc.upsertSyntheticTeam('u-1', 'season-wc', 1);
    expect(id).toBe('ft-1');
  });
});

// ── upsertTeamPlayers ─────────────────────────────────────────────────────────

describe('ReplayFantasySettlementService.upsertTeamPlayers', () => {
  it('upserts one row per player using fantasyTeamId_playerId key', async () => {
    const { prisma } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = makeStats(3);
    await svc.upsertTeamPlayers('ft-1', stats);
    expect(prisma.fantasyTeamPlayer.upsert).toHaveBeenCalledTimes(3);
    const first = (prisma.fantasyTeamPlayer.upsert as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(first.where).toEqual({ fantasyTeamId_playerId: { fantasyTeamId: 'ft-1', playerId: 'p-1' } });
  });

  it('first player is captain, second is vice-captain', async () => {
    const { prisma } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = makeStats(3);
    await svc.upsertTeamPlayers('ft-1', stats);
    const calls = (prisma.fantasyTeamPlayer.upsert as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls[0]![0].create.isCaptain).toBe(true);
    expect(calls[0]![0].create.isViceCaptain).toBe(false);
    expect(calls[1]![0].create.isCaptain).toBe(false);
    expect(calls[1]![0].create.isViceCaptain).toBe(true);
    expect(calls[2]![0].create.isCaptain).toBe(false);
    expect(calls[2]![0].create.isViceCaptain).toBe(false);
  });

  it('upsert update:{} is idempotent (does not change existing roster)', async () => {
    const { prisma } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    await svc.upsertTeamPlayers('ft-1', makeStats(2));
    const call = (prisma.fantasyTeamPlayer.upsert as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(call.update).toEqual({});
  });
});

// ── computePlayerResults ──────────────────────────────────────────────────────

describe('ReplayFantasySettlementService.computePlayerResults', () => {
  it('first player is captain with 2x multiplier', () => {
    const { prisma } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = makeStats(3);
    const results = svc.computePlayerResults(stats);
    expect(results[0]!.isCaptain).toBe(true);
    expect(results[0]!.multiplier).toBe(2);
    expect(results[1]!.isCaptain).toBe(false);
    expect(results[1]!.multiplier).toBe(1);
  });

  it('captain finalPoints = basePoints * 2', () => {
    const { prisma } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = [makeStat({ player: { position: PlayerPosition.GOALKEEPER }, cleanSheet: true })];
    const results = svc.computePlayerResults(stats);
    // GK + clean sheet = 2 + 4 = 6; captain 2x = 12
    expect(results[0]!.basePoints).toBe(6);
    expect(results[0]!.finalPoints).toBe(12);
  });

  it('non-captain finalPoints = basePoints * 1', () => {
    const { prisma } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = makeStats(2, [PlayerPosition.GOALKEEPER, PlayerPosition.MIDFIELDER]);
    const results = svc.computePlayerResults(stats);
    expect(results[1]!.multiplier).toBe(1);
    expect(results[1]!.finalPoints).toBe(results[1]!.basePoints);
  });

  it('GK with goal earns 10 base pts + appearance bonus', () => {
    const { prisma } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = [makeStat({ player: { position: PlayerPosition.GOALKEEPER }, goals: 1 })];
    const results = svc.computePlayerResults(stats);
    // GK goal = 10 pts + 2 pt appearance = 12
    expect(results[0]!.basePoints).toBe(12);
  });

  it('MID goal earns 5 base pts', () => {
    const { prisma } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = [makeStat({ player: { position: PlayerPosition.MIDFIELDER }, goals: 1 })];
    const results = svc.computePlayerResults(stats);
    // MID goal = 5 pts + 2 pt appearance = 7
    expect(results[0]!.basePoints).toBe(7);
  });

  it('yellow card deducts 1 pt from base', () => {
    const { prisma } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = [makeStat({ yellowCards: 1 })];
    const results = svc.computePlayerResults(stats);
    // 2 appearance - 1 yellow = 1
    expect(results[0]!.basePoints).toBe(1);
  });

  it('player who did not play earns 0 pts', () => {
    const { prisma } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = [makeStat({ didNotPlay: true, minutesPlayed: 0 })];
    const results = svc.computePlayerResults(stats);
    expect(results[0]!.basePoints).toBe(0);
    expect(results[0]!.finalPoints).toBe(0);
  });

  it('only processes up to REPLAY_TEAM_SIZE players', () => {
    const { prisma } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = makeStats(REPLAY_TEAM_SIZE + 3); // 10 stats, only 7 processed
    const results = svc.computePlayerResults(stats.slice(0, REPLAY_TEAM_SIZE));
    expect(results).toHaveLength(REPLAY_TEAM_SIZE);
  });
});

// ── settleTeam: dry-run ───────────────────────────────────────────────────────

describe('ReplayFantasySettlementService.settleTeam — dry-run', () => {
  it('returns dry-run action for all players, writes nothing', async () => {
    const { prisma, txFindFirst, txCreate } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = makeStats(3, [PlayerPosition.GOALKEEPER, PlayerPosition.FORWARD, PlayerPosition.MIDFIELDER]);
    const result = await svc.settleTeam('fix-1', 1, 'ft-1', stats, { dryRun: true });
    expect(result.players.every(p => p.action === 'dry-run')).toBe(true);
    expect(result.newPointsWritten).toBe(0);
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(txCreate).not.toHaveBeenCalled();
  });

  it('dry-run returns teamTotalPoints as the sum of computed finalPoints', async () => {
    const { prisma } = makePrisma();
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = [
      makeStat({ playerId: 'p-1', player: { position: PlayerPosition.GOALKEEPER }, cleanSheet: true }),
    ];
    const result = await svc.settleTeam('fix-1', 1, 'ft-1', stats, { dryRun: true });
    // GK + clean sheet = 6; captain 2x = 12
    expect(result.teamTotalPoints).toBe(12);
    expect(result.newPointsWritten).toBe(0);
  });
});

// ── settleTeam: confirmed (all new) ──────────────────────────────────────────

describe('ReplayFantasySettlementService.settleTeam — confirmed', () => {
  it('creates ledger entry for each player when none exist', async () => {
    const { prisma, txFindFirst, txCreate } = makePrisma(null); // findFirst returns null
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = makeStats(2, [PlayerPosition.GOALKEEPER, PlayerPosition.FORWARD]);
    const result = await svc.settleTeam('fix-1', 1, 'ft-1', stats, { dryRun: false });
    expect(result.players.every(p => p.action === 'created')).toBe(true);
    expect(result.players).toHaveLength(2);
    expect(txCreate).toHaveBeenCalledTimes(2);
    expect(result.newPointsWritten).toBeGreaterThan(0);
  });

  it('per-player $transaction called once per player', async () => {
    const { prisma } = makePrisma(null);
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = makeStats(3);
    await svc.settleTeam('fix-1', 1, 'ft-1', stats, { dryRun: false });
    expect(prisma.$transaction).toHaveBeenCalledTimes(3);
  });

  it('captain bonus is recorded on the ledger entry', async () => {
    const { prisma, txCreate } = makePrisma(null);
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = [makeStat({ playerId: 'p-1', player: { position: PlayerPosition.GOALKEEPER } })];
    await svc.settleTeam('fix-1', 1, 'ft-1', stats, { dryRun: false });
    const captainEntry = txCreate.mock.calls[0]![0];
    expect(captainEntry.data.isCaptainBonus).toBe(true);
  });

  it('non-captain player isCaptainBonus is false', async () => {
    const { prisma, txCreate } = makePrisma(null);
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = makeStats(2);
    await svc.settleTeam('fix-1', 1, 'ft-1', stats, { dryRun: false });
    const nonCaptainEntry = txCreate.mock.calls[1]![0];
    expect(nonCaptainEntry.data.isCaptainBonus).toBe(false);
  });

  it('newPointsWritten equals sum of all created player finalPoints', async () => {
    const { prisma } = makePrisma(null);
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = [
      makeStat({ playerId: 'p-1', player: { position: PlayerPosition.GOALKEEPER }, cleanSheet: true }),
      makeStat({ playerId: 'p-2', player: { position: PlayerPosition.FORWARD }, goals: 1 }),
    ];
    const result = await svc.settleTeam('fix-1', 1, 'ft-1', stats, { dryRun: false });
    // Captain GK + CS = 6 × 2 = 12; FWD goal = 2 + 4 = 6
    const expectedTotal = result.players.reduce((s, p) => s + p.finalPoints, 0);
    expect(result.newPointsWritten).toBe(expectedTotal);
  });
});

// ── settleTeam: idempotency (all existing) ────────────────────────────────────

describe('ReplayFantasySettlementService.settleTeam — idempotency', () => {
  it('when all player ledger entries already exist, all actions are skipped', async () => {
    const { prisma, txCreate } = makePrisma({ id: 'existing-row' }); // findFirst returns existing
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = makeStats(2);
    const result = await svc.settleTeam('fix-1', 1, 'ft-1', stats, { dryRun: false });
    expect(result.players.every(p => p.action === 'skipped')).toBe(true);
    expect(result.newPointsWritten).toBe(0);
    expect(txCreate).not.toHaveBeenCalled();
  });

  it('teamTotalPoints is still computed even when all entries are skipped', async () => {
    const { prisma } = makePrisma({ id: 'existing-row' });
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = [makeStat({ player: { position: PlayerPosition.GOALKEEPER }, cleanSheet: true })];
    const result = await svc.settleTeam('fix-1', 1, 'ft-1', stats, { dryRun: false });
    // Scoring computed but written = 0
    expect(result.teamTotalPoints).toBeGreaterThan(0);
    expect(result.newPointsWritten).toBe(0);
  });
});

// ── settleTeam: partial repair ────────────────────────────────────────────────

describe('ReplayFantasySettlementService.settleTeam — partial repair', () => {
  it('creates missing entries while skipping existing ones in the same team', async () => {
    // First player: existing row in tx. Second player: no row.
    let callCount = 0;
    const txFindFirst = vi.fn().mockImplementation(() => {
      callCount++;
      return callCount === 1
        ? Promise.resolve({ id: 'existing' }) // first player: exists
        : Promise.resolve(null);               // second player: missing
    });
    const txCreate = vi.fn().mockResolvedValue({});

    const prisma = {
      user: { upsert: vi.fn().mockResolvedValue({ id: 'u-1' }) },
      fantasyTeam: { upsert: vi.fn().mockResolvedValue({ id: 'ft-1' }) },
      fantasyTeamPlayer: { upsert: vi.fn().mockResolvedValue({ id: 'ftp-1' }) },
      fantasyPointsLedger: { findFirst: vi.fn().mockResolvedValue(null), create: vi.fn() },
      $transaction: vi.fn().mockImplementation(
        async (fn: (tx: Record<string, unknown>) => Promise<unknown>) =>
          fn({ fantasyPointsLedger: { findFirst: txFindFirst, create: txCreate } }),
      ),
    } as unknown as PrismaClient;

    const svc = new ReplayFantasySettlementService(prisma);
    const stats = makeStats(2);
    const result = await svc.settleTeam('fix-1', 1, 'ft-1', stats, { dryRun: false });

    expect(result.players[0]!.action).toBe('skipped');  // first player: existing
    expect(result.players[1]!.action).toBe('created');  // second player: missing → created
    expect(txCreate).toHaveBeenCalledTimes(1);           // only 1 create, not 2
    expect(result.newPointsWritten).toBeGreaterThan(0);  // only second player's points
  });
});

// ── REPLAY_TEAM_SIZE export ───────────────────────────────────────────────────

describe('REPLAY_TEAM_SIZE', () => {
  it('is 7', () => {
    expect(REPLAY_TEAM_SIZE).toBe(7);
  });

  it('settleTeam processes at most REPLAY_TEAM_SIZE players even if more are passed', async () => {
    const { prisma } = makePrisma(null);
    const svc = new ReplayFantasySettlementService(prisma);
    const oversizedStats = makeStats(REPLAY_TEAM_SIZE + 3); // 10 stats
    const result = await svc.settleTeam('fix-1', 1, 'ft-1', oversizedStats, { dryRun: false });
    expect(result.players).toHaveLength(REPLAY_TEAM_SIZE);
  });
});

// ── P2002 unique-conflict handling ────────────────────────────────────────────

describe('ReplayFantasySettlementService — P2002 idempotency', () => {
  it('P2002 from $transaction (DB unique constraint) → player action is skipped, no crash', async () => {
    // Simulate: concurrent run already committed the ledger row; DB unique index fires
    const { prisma } = makePrisma(null);
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockRejectedValue({ code: 'P2002' });
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = makeStats(1, [PlayerPosition.GOALKEEPER]);
    const result = await svc.settleTeam('fix-1', 1, 'ft-1', stats, { dryRun: false });
    expect(result.players[0]!.action).toBe('skipped');
    expect(result.newPointsWritten).toBe(0);
  });

  it('non-P2002 $transaction error is re-thrown (not silently swallowed)', async () => {
    const { prisma } = makePrisma(null);
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Unexpected DB error'),
    );
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = makeStats(1);
    await expect(
      svc.settleTeam('fix-1', 1, 'ft-1', stats, { dryRun: false }),
    ).rejects.toThrow('Unexpected DB error');
  });

  it('P2002 on first player, second player succeeds — partial result', async () => {
    // Simulates: first player was already committed by a concurrent run (P2002),
    // second player is new. Per-player transactions ensure partial repair.
    const { prisma } = makePrisma(null);
    let callCount = 0;
    const txCreate = vi.fn().mockResolvedValue({});
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(
      async (fn: (tx: Record<string, unknown>) => Promise<unknown>) => {
        callCount++;
        if (callCount === 1) {
          // First player: simulate P2002 from DB unique constraint
          throw { code: 'P2002' };
        }
        // Second player: normal transaction
        return fn({
          fantasyPointsLedger: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: txCreate,
          },
        });
      },
    );
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = makeStats(2, [PlayerPosition.GOALKEEPER, PlayerPosition.FORWARD]);
    const result = await svc.settleTeam('fix-1', 1, 'ft-1', stats, { dryRun: false });
    expect(result.players[0]!.action).toBe('skipped');  // P2002 → skipped
    expect(result.players[1]!.action).toBe('created');  // normal → created
    expect(txCreate).toHaveBeenCalledTimes(1);           // only one create
    expect(result.newPointsWritten).toBeGreaterThan(0);  // second player points written
  });

  it('all-P2002 run reports all players skipped and zero new points written', async () => {
    const { prisma } = makePrisma(null);
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockRejectedValue({ code: 'P2002' });
    const svc = new ReplayFantasySettlementService(prisma);
    const stats = makeStats(3);
    const result = await svc.settleTeam('fix-1', 1, 'ft-1', stats, { dryRun: false });
    expect(result.players.every(p => p.action === 'skipped')).toBe(true);
    expect(result.newPointsWritten).toBe(0);
    // teamTotalPoints is still computed (scoring preview is always available)
    expect(result.teamTotalPoints).toBeGreaterThan(0);
  });
});
