import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PredictionStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import {
  ReplayPredictionSettlementService,
} from './replay-prediction-settlement.service';
import type { PrismaClient } from '@prisma/client';

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeFixture(overrides: { homeScore?: number; awayScore?: number; seasonId?: string } = {}) {
  return { homeScore: 2, awayScore: 1, seasonId: 'season-wc', ...overrides };
}

function makeUserCase(overrides: {
  userId?: string;
  label?: string;
  predictedHome?: number;
  predictedAway?: number;
} = {}) {
  return {
    userId: overrides.userId ?? 'u-1',
    label: overrides.label ?? 'exact_match',
    predictedHome: overrides.predictedHome ?? 2,
    predictedAway: overrides.predictedAway ?? 1,
  };
}

interface TxMocks {
  txFindFirst: ReturnType<typeof vi.fn>;
  txUpdate: ReturnType<typeof vi.fn>;
  txCreate: ReturnType<typeof vi.fn>;
}

function makePrismaAndTx(
  predictionUpsertResult: {
    id: string;
    status: PredictionStatus | null;
    pointsAwarded: number | null;
  } = { id: 'pred-1', status: PredictionStatus.LOCKED, pointsAwarded: null },
  txFindFirstResult: { id: string } | null = null,
  outermostFindFirstResult: { id: string } | null = null,
) {
  const txFindFirst = vi.fn().mockResolvedValue(txFindFirstResult);
  const txUpdate = vi.fn().mockResolvedValue({});
  const txCreate = vi.fn().mockResolvedValue({});

  const prisma = {
    user: { upsert: vi.fn().mockResolvedValue({ id: 'u-1' }) },
    scorePrediction: {
      upsert: vi.fn().mockResolvedValue(predictionUpsertResult),
    },
    predictionPointsLedger: {
      findFirst: vi.fn().mockResolvedValue(outermostFindFirstResult),
      create: vi.fn().mockResolvedValue({}),
    },
    fanValueLedger: { upsert: vi.fn().mockResolvedValue({}) },
    $transaction: vi.fn().mockImplementation(
      async (fn: (tx: TxMocks) => Promise<unknown>) =>
        fn({ txFindFirst, txUpdate, txCreate } as unknown as TxMocks),
    ),
  } as unknown as PrismaClient;

  // Wire $transaction so it passes a proper prisma-like tx object
  (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(
    async (fn: (tx: Record<string, unknown>) => Promise<unknown>) =>
      fn({
        scorePrediction: { update: txUpdate },
        predictionPointsLedger: { findFirst: txFindFirst, create: txCreate },
      }),
  );

  return { prisma, txFindFirst, txUpdate, txCreate };
}

// ── upsertSyntheticUsers ──────────────────────────────────────────────────────

describe('ReplayPredictionSettlementService.upsertSyntheticUsers', () => {
  it('creates n synthetic GTS users with correct email pattern', async () => {
    const { prisma } = makePrismaAndTx();
    const svc = new ReplayPredictionSettlementService(prisma);
    const users = await svc.upsertSyntheticUsers(3);
    expect(users).toHaveLength(3);
    expect(users.map(u => u.index)).toEqual([1, 2, 3]);
    const calls = (prisma.user.upsert as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls[0]![0].where.email).toBe('replay-wc-gts-1@wc-beta.internal');
    expect(calls[1]![0].where.email).toBe('replay-wc-gts-2@wc-beta.internal');
    expect(calls[2]![0].where.email).toBe('replay-wc-gts-3@wc-beta.internal');
  });

  it('upsert uses update:{} to be idempotent (never overwrites existing users)', async () => {
    const { prisma } = makePrismaAndTx();
    const svc = new ReplayPredictionSettlementService(prisma);
    await svc.upsertSyntheticUsers(1);
    const call = (prisma.user.upsert as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(call.update).toEqual({});
  });
});

// ── settle: dry-run ───────────────────────────────────────────────────────────

describe('ReplayPredictionSettlementService.settle — dry-run', () => {
  it('returns dry-run action for every case and writes nothing', async () => {
    const { prisma } = makePrismaAndTx();
    const svc = new ReplayPredictionSettlementService(prisma);
    const summary = await svc.settle(
      'fix-1',
      [makeUserCase()],
      makeFixture(),
      { dryRun: true },
    );
    expect(summary.entries).toHaveLength(1);
    expect(summary.entries[0]!.action).toBe('dry-run');
    expect(summary.settled).toBe(0);
    expect(prisma.scorePrediction.upsert).not.toHaveBeenCalled();
    expect(prisma.predictionPointsLedger.create).not.toHaveBeenCalled();
    expect(prisma.fanValueLedger.upsert).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('calculates correct expected points in dry-run without writing them', async () => {
    const { prisma } = makePrismaAndTx();
    const svc = new ReplayPredictionSettlementService(prisma);
    const summary = await svc.settle(
      'fix-1',
      [makeUserCase({ predictedHome: 2, predictedAway: 1 })],
      makeFixture({ homeScore: 2, awayScore: 1 }),
      { dryRun: true },
    );
    // Exact match → 10 pts
    expect(summary.entries[0]!.points).toBe(10);
  });
});

// ── settle: happy path (PENDING/LOCKED) ───────────────────────────────────────

describe('ReplayPredictionSettlementService.settle — happy path', () => {
  it('exact match: settles WON status with 10 pts via $transaction', async () => {
    const { prisma, txUpdate, txCreate } = makePrismaAndTx(
      { id: 'pred-1', status: PredictionStatus.LOCKED, pointsAwarded: null },
    );
    const svc = new ReplayPredictionSettlementService(prisma);
    const summary = await svc.settle(
      'fix-1',
      [makeUserCase({ predictedHome: 2, predictedAway: 1 })],
      makeFixture({ homeScore: 2, awayScore: 1 }),
      { dryRun: false },
    );
    expect(summary.settled).toBe(1);
    expect(summary.entries[0]!.action).toBe('settled');
    expect(summary.entries[0]!.points).toBe(10);
    // update called inside transaction
    expect(txUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'pred-1' },
      data: expect.objectContaining({ pointsAwarded: 10, status: PredictionStatus.WON }),
    }));
    // ledger created inside transaction
    expect(txCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ predictionId: 'pred-1', points: 10, userId: 'u-1' }),
    }));
  });

  it('wrong outcome: settles LOST status with 0 pts', async () => {
    const { prisma, txUpdate, txCreate } = makePrismaAndTx(
      { id: 'pred-1', status: PredictionStatus.LOCKED, pointsAwarded: null },
    );
    const svc = new ReplayPredictionSettlementService(prisma);
    const summary = await svc.settle(
      'fix-1',
      [makeUserCase({ predictedHome: 0, predictedAway: 1 })], // wrong outcome
      makeFixture({ homeScore: 2, awayScore: 1 }),
      { dryRun: false },
    );
    expect(summary.settled).toBe(1);
    expect(summary.entries[0]!.points).toBe(0);
    expect(txUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: PredictionStatus.LOST }),
    }));
  });

  it('FanValueLedger is posted after transaction with correct idempotencyKey', async () => {
    const { prisma } = makePrismaAndTx(
      { id: 'pred-1', status: PredictionStatus.LOCKED, pointsAwarded: null },
    );
    const svc = new ReplayPredictionSettlementService(prisma);
    await svc.settle('fix-1', [makeUserCase()], makeFixture(), { dryRun: false });
    expect(prisma.fanValueLedger.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { idempotencyKey: 'PREDICTION_SETTLEMENT:pred-1' },
      }),
    );
  });

  it('concurrent rerun: $transaction re-check prevents duplicate ledger (returns early)', async () => {
    const { prisma, txCreate } = makePrismaAndTx(
      { id: 'pred-1', status: PredictionStatus.LOCKED, pointsAwarded: null },
      { id: 'existing-ledger' }, // tx findFirst returns an existing ledger
    );
    const svc = new ReplayPredictionSettlementService(prisma);
    await svc.settle('fix-1', [makeUserCase()], makeFixture(), { dryRun: false });
    // Even though outer check found nothing, tx inner check found existing → no create
    expect(txCreate).not.toHaveBeenCalled();
  });
});

// ── settle: skip path (already WON/LOST + ledger exists) ─────────────────────

describe('ReplayPredictionSettlementService.settle — skip path', () => {
  it('prediction already WON with existing ledger → skipped, no new prediction/ledger writes', async () => {
    const { prisma } = makePrismaAndTx(
      { id: 'pred-1', status: PredictionStatus.WON, pointsAwarded: 10 },
      null,
      { id: 'existing-ledger' }, // outermost findFirst has ledger
    );
    const svc = new ReplayPredictionSettlementService(prisma);
    const summary = await svc.settle('fix-1', [makeUserCase()], makeFixture(), { dryRun: false });
    expect(summary.skipped).toBe(1);
    expect(summary.entries[0]!.action).toBe('skipped');
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.predictionPointsLedger.create).not.toHaveBeenCalled();
  });

  it('skip path: fanValueLedger upsert is called to repair any missed fan-value write', async () => {
    // Scenario: prediction ledger exists (prior run committed) but fan-value may have
    // failed. Skip path must ensure fan-value is repaired on every rerun.
    const { prisma } = makePrismaAndTx(
      { id: 'pred-1', status: PredictionStatus.WON, pointsAwarded: 10 },
      null,
      { id: 'existing-ledger' },
    );
    const svc = new ReplayPredictionSettlementService(prisma);
    await svc.settle('fix-1', [makeUserCase()], makeFixture(), { dryRun: false });
    expect(prisma.fanValueLedger.upsert).toHaveBeenCalledOnce();
    expect(prisma.fanValueLedger.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { idempotencyKey: 'PREDICTION_SETTLEMENT:pred-1' },
        update: {},
      }),
    );
  });

  it('skip path: fanValueLedger upsert uses update:{} so it is idempotent when fan-value already exists', async () => {
    const { prisma } = makePrismaAndTx(
      { id: 'pred-1', status: PredictionStatus.WON, pointsAwarded: 10 },
      null,
      { id: 'existing-ledger' },
    );
    // Fan-value already exists — upsert with update:{} is safe to call again
    (prisma.fanValueLedger.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'fvl-existing' });
    const svc = new ReplayPredictionSettlementService(prisma);
    const summary = await svc.settle('fix-1', [makeUserCase()], makeFixture(), { dryRun: false });
    expect(summary.skipped).toBe(1);
    expect(prisma.fanValueLedger.upsert).toHaveBeenCalledOnce(); // called exactly once, no duplicate
  });

  it('prediction already LOST with existing ledger → skipped, fan-value ensured', async () => {
    const { prisma } = makePrismaAndTx(
      { id: 'pred-1', status: PredictionStatus.LOST, pointsAwarded: 0 },
      null,
      { id: 'existing-ledger' },
    );
    const svc = new ReplayPredictionSettlementService(prisma);
    const summary = await svc.settle('fix-1', [makeUserCase()], makeFixture(), { dryRun: false });
    expect(summary.skipped).toBe(1);
    expect(summary.settled).toBe(0);
    expect(summary.repaired).toBe(0);
    expect(prisma.fanValueLedger.upsert).toHaveBeenCalledOnce();
  });
});

// ── settle: repair path (already WON/LOST but ledger missing) ─────────────────

describe('ReplayPredictionSettlementService.settle — repair path', () => {
  it('WON status with no ledger → repaired: creates ledger only, no prediction update', async () => {
    const { prisma } = makePrismaAndTx(
      { id: 'pred-1', status: PredictionStatus.WON, pointsAwarded: 10 },
      null,
      null, // outermost findFirst returns null → ledger is missing
    );
    const svc = new ReplayPredictionSettlementService(prisma);
    const summary = await svc.settle('fix-1', [makeUserCase()], makeFixture(), { dryRun: false });
    expect(summary.repaired).toBe(1);
    expect(summary.entries[0]!.action).toBe('repaired');
    // Creates ledger directly (no $transaction for repair path)
    expect(prisma.predictionPointsLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ predictionId: 'pred-1', userId: 'u-1' }),
      }),
    );
    // Does NOT update scorePrediction (status is already correct)
    expect(prisma.$transaction).not.toHaveBeenCalled();
    // FanValueLedger is also repaired
    expect(prisma.fanValueLedger.upsert).toHaveBeenCalled();
  });

  it('LOST status with no ledger → repaired: uses pointsAwarded from existing record', async () => {
    const { prisma } = makePrismaAndTx(
      { id: 'pred-1', status: PredictionStatus.LOST, pointsAwarded: 0 },
      null,
      null,
    );
    const svc = new ReplayPredictionSettlementService(prisma);
    const summary = await svc.settle(
      'fix-1',
      [makeUserCase({ predictedHome: 0, predictedAway: 1 })], // wrong prediction
      makeFixture(),
      { dryRun: false },
    );
    expect(summary.repaired).toBe(1);
    // Points from existing pointsAwarded (0) used in ledger repair
    expect(prisma.predictionPointsLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ points: 0 }),
      }),
    );
  });
});

// ── settle: multiple cases ─────────────────────────────────────────────────────

describe('ReplayPredictionSettlementService.settle — multiple cases', () => {
  it('processes all on-time cases independently', async () => {
    const { prisma } = makePrismaAndTx(
      { id: 'pred-1', status: PredictionStatus.LOCKED, pointsAwarded: null },
    );
    // 4 on-time cases
    const userCases = [
      makeUserCase({ userId: 'u-1', label: 'exact_match', predictedHome: 2, predictedAway: 1 }),
      makeUserCase({ userId: 'u-2', label: 'correct_diff', predictedHome: 3, predictedAway: 2 }),
      makeUserCase({ userId: 'u-3', label: 'correct_outcome', predictedHome: 2, predictedAway: 0 }),
      makeUserCase({ userId: 'u-4', label: 'wrong_outcome', predictedHome: 0, predictedAway: 1 }),
    ];
    const svc = new ReplayPredictionSettlementService(prisma);
    const summary = await svc.settle('fix-1', userCases, makeFixture(), { dryRun: false });
    expect(summary.entries).toHaveLength(4);
    // Exact match earns 10pts
    const exact = summary.entries.find(e => e.label === 'exact_match')!;
    expect(exact.points).toBe(10);
    // Wrong outcome earns 0pts
    const wrong = summary.entries.find(e => e.label === 'wrong_outcome')!;
    expect(wrong.points).toBe(0);
  });
});

// ── P2002 unique-conflict handling ────────────────────────────────────────────

describe('ReplayPredictionSettlementService — P2002 idempotency', () => {
  it('P2002 from $transaction (DB unique constraint) → skipped, fan-value still written', async () => {
    // Simulate: DB unique index on prediction_id fires because concurrent run committed first
    const { prisma } = makePrismaAndTx(
      { id: 'pred-1', status: PredictionStatus.LOCKED, pointsAwarded: null },
    );
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockRejectedValue({ code: 'P2002' });
    const svc = new ReplayPredictionSettlementService(prisma);
    const summary = await svc.settle('fix-1', [makeUserCase()], makeFixture(), { dryRun: false });
    // Treated as concurrent-skipped, not a crash
    expect(summary.skipped).toBe(1);
    expect(summary.settled).toBe(0);
    expect(summary.entries[0]!.action).toBe('skipped');
    // Fan-value is still ensured even when the transaction failed due to P2002
    expect(prisma.fanValueLedger.upsert).toHaveBeenCalledOnce();
  });

  it('non-P2002 transaction error is re-thrown (not silently swallowed)', async () => {
    const { prisma } = makePrismaAndTx(
      { id: 'pred-1', status: PredictionStatus.LOCKED, pointsAwarded: null },
    );
    (prisma.$transaction as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Unexpected DB error'),
    );
    const svc = new ReplayPredictionSettlementService(prisma);
    await expect(
      svc.settle('fix-1', [makeUserCase()], makeFixture(), { dryRun: false }),
    ).rejects.toThrow('Unexpected DB error');
  });

  it('P2002 on repair path create → repaired, fan-value still written, no crash', async () => {
    // Scenario: status = WON, outer findFirst = null (ledger missing), but concurrent
    // run already created it between our check and our create → P2002 on create
    const { prisma } = makePrismaAndTx(
      { id: 'pred-1', status: PredictionStatus.WON, pointsAwarded: 10 },
      null,
      null, // outer findFirst: no ledger → repair path
    );
    (prisma.predictionPointsLedger.create as ReturnType<typeof vi.fn>).mockRejectedValue(
      { code: 'P2002' },
    );
    const svc = new ReplayPredictionSettlementService(prisma);
    const summary = await svc.settle('fix-1', [makeUserCase()], makeFixture(), { dryRun: false });
    // Repair path still counts as 'repaired' (we detected the missing ledger and tried to create)
    expect(summary.repaired).toBe(1);
    expect(summary.entries[0]!.action).toBe('repaired');
    // Fan-value must still be ensured
    expect(prisma.fanValueLedger.upsert).toHaveBeenCalledOnce();
  });

  it('P2002 on repair path does not re-throw', async () => {
    const { prisma } = makePrismaAndTx(
      { id: 'pred-1', status: PredictionStatus.WON, pointsAwarded: 10 },
      null,
      null,
    );
    (prisma.predictionPointsLedger.create as ReturnType<typeof vi.fn>).mockRejectedValue(
      { code: 'P2002' },
    );
    const svc = new ReplayPredictionSettlementService(prisma);
    await expect(
      svc.settle('fix-1', [makeUserCase()], makeFixture(), { dryRun: false }),
    ).resolves.toBeDefined(); // no throw
  });
});

// ── Schema / migration validation ─────────────────────────────────────────────

describe('migration 20260626000001_replay_ledger_idempotency', () => {
  const migrationPath = path.resolve(
    __dirname,
    '../../prisma/migrations/20260626000001_replay_ledger_idempotency/migration.sql',
  );
  let sql: string;

  beforeEach(() => {
    sql = fs.readFileSync(migrationPath, 'utf8');
  });

  it('contains duplicate audit DO block for prediction_points_ledger', () => {
    expect(sql).toContain('prediction_points_ledger');
    expect(sql).toContain('prediction_id IS NOT NULL');
    expect(sql).toContain('RAISE EXCEPTION');
  });

  it('contains duplicate audit DO block for fantasy_points_ledger', () => {
    expect(sql).toContain('fantasy_points_ledger');
    expect(sql).toContain('fantasy_team_id, player_id, fixture_id');
    expect(sql).toContain('RAISE EXCEPTION');
  });

  it('creates partial unique index on prediction_points_ledger.prediction_id WHERE NOT NULL', () => {
    expect(sql).toContain('prediction_points_ledger_prediction_id_unique');
    expect(sql).toContain('WHERE prediction_id IS NOT NULL');
  });

  it('creates composite unique index on fantasy_points_ledger(fantasy_team_id, player_id, fixture_id)', () => {
    expect(sql).toContain('fantasy_points_ledger_team_player_fixture_unique');
    expect(sql).toContain('fantasy_team_id, player_id, fixture_id');
  });

  it('both CREATE UNIQUE INDEX statements use IF NOT EXISTS for re-runnability', () => {
    const matches = sql.match(/CREATE UNIQUE INDEX IF NOT EXISTS/g);
    expect(matches).toHaveLength(2);
  });
});

describe('Prisma schema — FantasyPointsLedger uniqueness', () => {
  const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
  let schema: string;

  beforeEach(() => {
    schema = fs.readFileSync(schemaPath, 'utf8');
  });

  it('FantasyPointsLedger has @@unique([fantasyTeamId, playerId, fixtureId])', () => {
    expect(schema).toContain('fantasy_points_ledger_team_player_fixture_unique');
  });

  it('PredictionPointsLedger does not have a Prisma @@unique on predictionId (partial index only)', () => {
    // Prisma cannot express partial indexes; the partial unique constraint lives
    // only in the migration SQL. Verify no @@unique on predictionId in the model block.
    const modelMatch = schema.match(/model PredictionPointsLedger \{[\s\S]*?(?=\nmodel |\Z)/)?.[0] ?? '';
    expect(modelMatch).not.toMatch(/@@unique\(\[predictionId\]/);
  });
});
