import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { FanValueSourceType, FanValueType, FanValueStatus } from '@prisma/client';
import { FanValueLedgerService } from './fan-value-ledger.service';
import { FanValueController } from './fan-value.controller';
import type { PrismaService } from '../prisma/prisma.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeDb = () =>
  ({
    fanValueLedger: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
      count: vi.fn(),
    },
  }) as unknown as PrismaService;

const postedEntry = (overrides: object = {}) => ({
  id: 'entry1',
  userId: 'u1',
  sourceType: FanValueSourceType.FANTASY_GAMEWEEK_SCORE,
  sourceId: 'score1',
  points: 52,
  valueType: FanValueType.FANTASY_POINTS,
  status: FanValueStatus.POSTED,
  idempotencyKey: 'FANTASY_GAMEWEEK_SCORE:score1',
  description: 'Gameweek score',
  createdAt: new Date(),
  updatedAt: new Date(),
  occurredAt: new Date(),
  ...overrides,
});

// ── postEntry ─────────────────────────────────────────────────────────────────

describe('FanValueLedgerService — postEntry', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FanValueLedgerService;

  beforeEach(() => {
    db = makeDb();
    svc = new FanValueLedgerService(db as unknown as PrismaService);
    vi.resetAllMocks();
    db = makeDb();
    svc = new FanValueLedgerService(db as unknown as PrismaService);
  });

  it('creates a ledger row', async () => {
    vi.mocked(db.fanValueLedger.upsert).mockResolvedValue(postedEntry() as never);
    const result = await svc.postEntry({
      userId: 'u1',
      sourceType: FanValueSourceType.FANTASY_GAMEWEEK_SCORE,
      sourceId: 'score1',
      points: 52,
    });
    expect(vi.mocked(db.fanValueLedger.upsert)).toHaveBeenCalledOnce();
    expect(result.status).toBe(FanValueStatus.POSTED);
  });

  it('is idempotent by idempotencyKey', async () => {
    vi.mocked(db.fanValueLedger.upsert).mockResolvedValue(postedEntry() as never);
    await svc.postEntry({ userId: 'u1', sourceType: FanValueSourceType.FANTASY_GAMEWEEK_SCORE, sourceId: 's1', idempotencyKey: 'k1', points: 10 });
    await svc.postEntry({ userId: 'u1', sourceType: FanValueSourceType.FANTASY_GAMEWEEK_SCORE, sourceId: 's1', idempotencyKey: 'k1', points: 10 });
    // Both use upsert — idempotent by key
    expect(vi.mocked(db.fanValueLedger.upsert)).toHaveBeenCalledTimes(2);
    const callKey = vi.mocked(db.fanValueLedger.upsert).mock.calls[0]?.[0]?.where?.idempotencyKey;
    expect(callKey).toBe('k1');
  });

  it('derives idempotencyKey from sourceType:sourceId when not provided', async () => {
    vi.mocked(db.fanValueLedger.upsert).mockResolvedValue(postedEntry() as never);
    await svc.postEntry({ userId: 'u1', sourceType: FanValueSourceType.PREDICTION_SETTLEMENT, sourceId: 'pred1', points: 5 });
    const key = vi.mocked(db.fanValueLedger.upsert).mock.calls[0]?.[0]?.where?.idempotencyKey;
    expect(key).toBe('PREDICTION_SETTLEMENT:pred1');
  });

  it('uses FANTASY_POINTS as default valueType', async () => {
    vi.mocked(db.fanValueLedger.upsert).mockResolvedValue(postedEntry() as never);
    await svc.postEntry({ userId: 'u1', sourceType: FanValueSourceType.FANTASY_GAMEWEEK_SCORE, sourceId: 's1', points: 10 });
    const createData = vi.mocked(db.fanValueLedger.upsert).mock.calls[0]?.[0]?.create;
    expect(createData?.valueType).toBe(FanValueType.FANTASY_POINTS);
  });
});

// ── postFantasyGameweekScore ───────────────────────────────────────────────────

describe('FanValueLedgerService — postFantasyGameweekScore', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FanValueLedgerService;

  beforeEach(() => {
    db = makeDb();
    svc = new FanValueLedgerService(db as unknown as PrismaService);
    vi.resetAllMocks();
    db = makeDb();
    svc = new FanValueLedgerService(db as unknown as PrismaService);
  });

  it('posts with FANTASY_GAMEWEEK_SCORE source type and FANTASY_POINTS value type', async () => {
    vi.mocked(db.fanValueLedger.upsert).mockResolvedValue(postedEntry() as never);
    await svc.postFantasyGameweekScore('s1', 'u1', 42, 50, 8, 'season1', 'gw1', 'ft1');
    const create = vi.mocked(db.fanValueLedger.upsert).mock.calls[0]?.[0]?.create;
    expect(create?.sourceType).toBe(FanValueSourceType.FANTASY_GAMEWEEK_SCORE);
    expect(create?.valueType).toBe(FanValueType.FANTASY_POINTS);
    expect(create?.points).toBe(42);
    expect(create?.idempotencyKey).toBe('FANTASY_GAMEWEEK_SCORE:s1');
  });

  it('is idempotent — re-running uses upsert', async () => {
    vi.mocked(db.fanValueLedger.upsert).mockResolvedValue(postedEntry() as never);
    await svc.postFantasyGameweekScore('s1', 'u1', 42, 50, 8, 'season1', 'gw1', 'ft1');
    await svc.postFantasyGameweekScore('s1', 'u1', 42, 50, 8, 'season1', 'gw1', 'ft1');
    expect(vi.mocked(db.fanValueLedger.upsert)).toHaveBeenCalledTimes(2);
    // Both calls use the same idempotencyKey → upsert dedups at DB level
    const calls = vi.mocked(db.fanValueLedger.upsert).mock.calls;
    expect(calls[0]?.[0]?.where?.idempotencyKey).toBe(calls[1]?.[0]?.where?.idempotencyKey);
  });
});

// ── postPredictionSettlement ───────────────────────────────────────────────────

describe('FanValueLedgerService — postPredictionSettlement', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FanValueLedgerService;

  beforeEach(() => {
    db = makeDb();
    svc = new FanValueLedgerService(db as unknown as PrismaService);
    vi.resetAllMocks();
    db = makeDb();
    svc = new FanValueLedgerService(db as unknown as PrismaService);
  });

  it('posts PREDICTION_SETTLEMENT with PREDICTION_POINTS', async () => {
    vi.mocked(db.fanValueLedger.upsert).mockResolvedValue(postedEntry({ sourceType: FanValueSourceType.PREDICTION_SETTLEMENT }) as never);
    await svc.postPredictionSettlement('pred1', 'u1', 10, 'fix1');
    const create = vi.mocked(db.fanValueLedger.upsert).mock.calls[0]?.[0]?.create;
    expect(create?.sourceType).toBe(FanValueSourceType.PREDICTION_SETTLEMENT);
    expect(create?.valueType).toBe(FanValueType.PREDICTION_POINTS);
    expect(create?.points).toBe(10);
    expect(create?.idempotencyKey).toBe('PREDICTION_SETTLEMENT:pred1');
  });

  it('is idempotent — re-settling does not duplicate entry', async () => {
    vi.mocked(db.fanValueLedger.upsert).mockResolvedValue(postedEntry() as never);
    await svc.postPredictionSettlement('pred1', 'u1', 10, 'fix1');
    await svc.postPredictionSettlement('pred1', 'u1', 10, 'fix1');
    const keys = vi.mocked(db.fanValueLedger.upsert).mock.calls.map(c => c[0]?.where?.idempotencyKey);
    expect(keys[0]).toBe(keys[1]); // same key → upsert pattern
  });
});

// ── postPeerChallenge ─────────────────────────────────────────────────────────

describe('FanValueLedgerService — postPeerChallenge', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FanValueLedgerService;

  beforeEach(() => {
    db = makeDb();
    svc = new FanValueLedgerService(db as unknown as PrismaService);
    vi.resetAllMocks();
    db = makeDb();
    svc = new FanValueLedgerService(db as unknown as PrismaService);
  });

  it('posts PEER_CHALLENGE with CHALLENGE_POINTS', async () => {
    vi.mocked(db.fanValueLedger.upsert).mockResolvedValue(postedEntry() as never);
    await svc.postPeerChallenge('ch1', 'u1', 8, 'challenger');
    const create = vi.mocked(db.fanValueLedger.upsert).mock.calls[0]?.[0]?.create;
    expect(create?.sourceType).toBe(FanValueSourceType.PEER_CHALLENGE);
    expect(create?.valueType).toBe(FanValueType.CHALLENGE_POINTS);
  });

  it('challenger and opponent get separate idempotencyKeys', async () => {
    vi.mocked(db.fanValueLedger.upsert).mockResolvedValue(postedEntry() as never);
    await svc.postPeerChallenge('ch1', 'u1', 8, 'challenger');
    await svc.postPeerChallenge('ch1', 'u2', 6, 'opponent');
    const keys = vi.mocked(db.fanValueLedger.upsert).mock.calls.map(c => c[0]?.where?.idempotencyKey);
    expect(keys[0]).not.toBe(keys[1]);
    expect(keys[0]).toContain('challenger');
    expect(keys[1]).toContain('opponent');
  });

  it('posting is idempotent — re-running does not duplicate', async () => {
    vi.mocked(db.fanValueLedger.upsert).mockResolvedValue(postedEntry() as never);
    await svc.postPeerChallenge('ch1', 'u1', 8, 'challenger');
    await svc.postPeerChallenge('ch1', 'u1', 8, 'challenger');
    const keys = vi.mocked(db.fanValueLedger.upsert).mock.calls.map(c => c[0]?.where?.idempotencyKey);
    expect(keys[0]).toBe(keys[1]);
  });
});

// ── Sponsor engagement placeholder ────────────────────────────────────────────

describe('FanValueLedgerService — postSponsorEngagementReadyEvent', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FanValueLedgerService;

  beforeEach(() => {
    db = makeDb();
    svc = new FanValueLedgerService(db as unknown as PrismaService);
    vi.resetAllMocks();
    db = makeDb();
    svc = new FanValueLedgerService(db as unknown as PrismaService);
  });

  it('posts SPONSOR_ENGAGEMENT_READY with LOYALTY_POINTS', async () => {
    vi.mocked(db.fanValueLedger.upsert).mockResolvedValue(postedEntry() as never);
    await svc.postSponsorEngagementReadyEvent({ userId: 'u1', points: 100, idempotencyKey: 'sponsor-mission-1' });
    const create = vi.mocked(db.fanValueLedger.upsert).mock.calls[0]?.[0]?.create;
    expect(create?.sourceType).toBe(FanValueSourceType.SPONSOR_ENGAGEMENT_READY);
    expect(create?.valueType).toBe(FanValueType.LOYALTY_POINTS);
  });
});

// ── getFanValueSummary ────────────────────────────────────────────────────────

describe('FanValueLedgerService — getFanValueSummary', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FanValueLedgerService;

  beforeEach(() => {
    db = makeDb();
    svc = new FanValueLedgerService(db as unknown as PrismaService);
    vi.resetAllMocks();
    db = makeDb();
    svc = new FanValueLedgerService(db as unknown as PrismaService);
  });

  it('returns total points derived from posted rows', async () => {
    vi.mocked(db.fanValueLedger.aggregate).mockResolvedValue({ _sum: { points: 150 }, _count: { id: 3 } } as never);
    vi.mocked(db.fanValueLedger.groupBy).mockResolvedValue([] as never);
    vi.mocked(db.fanValueLedger.findMany).mockResolvedValue([] as never);
    const result = await svc.getFanValueSummary('u1');
    expect(result.totalPoints).toBe(150);
    expect(result.totalEntries).toBe(3);
  });

  it('excludes voided entries — where clause includes status POSTED', async () => {
    vi.mocked(db.fanValueLedger.aggregate).mockResolvedValue({ _sum: { points: 0 }, _count: { id: 0 } } as never);
    vi.mocked(db.fanValueLedger.groupBy).mockResolvedValue([] as never);
    vi.mocked(db.fanValueLedger.findMany).mockResolvedValue([] as never);
    await svc.getFanValueSummary('u1');
    const whereArg = vi.mocked(db.fanValueLedger.aggregate).mock.calls[0]?.[0]?.where;
    expect(whereArg?.status).toBe(FanValueStatus.POSTED);
  });

  it('includes non-financial disclaimer', async () => {
    vi.mocked(db.fanValueLedger.aggregate).mockResolvedValue({ _sum: { points: 0 }, _count: { id: 0 } } as never);
    vi.mocked(db.fanValueLedger.groupBy).mockResolvedValue([] as never);
    vi.mocked(db.fanValueLedger.findMany).mockResolvedValue([] as never);
    const result = await svc.getFanValueSummary('u1');
    expect(result.nonFinancialDisclaimer).toContain('non-financial');
  });
});

// ── voidEntry ─────────────────────────────────────────────────────────────────

describe('FanValueLedgerService — voidEntry', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FanValueLedgerService;

  beforeEach(() => {
    db = makeDb();
    svc = new FanValueLedgerService(db as unknown as PrismaService);
    vi.resetAllMocks();
    db = makeDb();
    svc = new FanValueLedgerService(db as unknown as PrismaService);
  });

  it('sets status to VOIDED', async () => {
    vi.mocked(db.fanValueLedger.findUnique).mockResolvedValue(postedEntry() as never);
    vi.mocked(db.fanValueLedger.update).mockResolvedValue(postedEntry({ status: FanValueStatus.VOIDED }) as never);
    const result = await svc.voidEntry('entry1', 'test reason');
    expect(vi.mocked(db.fanValueLedger.update)).toHaveBeenCalledOnce();
    expect(vi.mocked(db.fanValueLedger.update).mock.calls[0]?.[0]?.data?.status).toBe(FanValueStatus.VOIDED);
  });

  it('throws NotFoundException for missing entry', async () => {
    vi.mocked(db.fanValueLedger.findUnique).mockResolvedValue(null as never);
    await expect(svc.voidEntry('missing', 'reason')).rejects.toThrow(NotFoundException);
  });

  it('is idempotent — voiding already-voided entry returns without update', async () => {
    vi.mocked(db.fanValueLedger.findUnique).mockResolvedValue(postedEntry({ status: FanValueStatus.VOIDED }) as never);
    const result = await svc.voidEntry('entry1', 'already voided');
    expect(vi.mocked(db.fanValueLedger.update)).not.toHaveBeenCalled();
    expect(result.status).toBe(FanValueStatus.VOIDED);
  });
});

// ── adminPostEntry ────────────────────────────────────────────────────────────

describe('FanValueLedgerService — adminPostEntry', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FanValueLedgerService;

  beforeEach(() => {
    db = makeDb();
    svc = new FanValueLedgerService(db as unknown as PrismaService);
    vi.resetAllMocks();
    db = makeDb();
    svc = new FanValueLedgerService(db as unknown as PrismaService);
  });

  it('posts ADMIN_ADJUSTMENT entry', async () => {
    vi.mocked(db.fanValueLedger.upsert).mockResolvedValue(postedEntry({ sourceType: FanValueSourceType.ADMIN_ADJUSTMENT }) as never);
    await svc.adminPostEntry({
      userId: 'u1',
      sourceType: FanValueSourceType.ADMIN_ADJUSTMENT,
      sourceId: 'adj-1',
      idempotencyKey: 'admin-adj-1',
      points: 50,
    });
    const create = vi.mocked(db.fanValueLedger.upsert).mock.calls[0]?.[0]?.create;
    expect(create?.sourceType).toBe(FanValueSourceType.ADMIN_ADJUSTMENT);
  });

  it('allows negative points because adminPostEntry always forces ADMIN_ADJUSTMENT', async () => {
    vi.mocked(db.fanValueLedger.upsert).mockResolvedValue(postedEntry() as never);
    await expect(
      svc.adminPostEntry({
        userId: 'u1',
        sourceType: FanValueSourceType.FANTASY_GAMEWEEK_SCORE,
        sourceId: 'x',
        idempotencyKey: 'k',
        points: -5,
      }),
    ).resolves.toBeDefined();
  });
});

// ── RBAC metadata ─────────────────────────────────────────────────────────────

describe('FanValueController — RBAC', () => {
  it('admin routes require PSL_ADMIN role', () => {
    const ctrl = FanValueController.prototype;
    const adminRoutes = ['adminSummary', 'adminUserLedger', 'adminPostEntry', 'adminVoidEntry', 'adminSponsorEngagement'];
    for (const method of adminRoutes) {
      const descriptor = Object.getOwnPropertyDescriptor(ctrl, method);
      const roles = Reflect.getMetadata('roles', descriptor?.value ?? ctrl[method as keyof typeof ctrl]);
      expect(roles, `${method} should require PSL_ADMIN`).toEqual(['PSL_ADMIN']);
    }
  });

  it('fan routes do not require PSL_ADMIN', () => {
    const ctrl = FanValueController.prototype;
    const fanRoutes = ['getSummary', 'getLedger', 'getByType', 'getBySource'];
    for (const method of fanRoutes) {
      const descriptor = Object.getOwnPropertyDescriptor(ctrl, method);
      const roles = Reflect.getMetadata('roles', descriptor?.value);
      expect(roles, `${method} should not require PSL_ADMIN`).toBeUndefined();
    }
  });
});
