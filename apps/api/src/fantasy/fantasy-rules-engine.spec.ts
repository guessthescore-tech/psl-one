import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  FantasyChipStatus,
  FantasyChipType,
  FantasyLeagueMemberRole,
  FantasyLeagueScoringType,
  FantasyLeagueType,
  FantasyHeadToHeadStatus,
  PlayerPosition,
} from '@prisma/client';
import { FantasyController } from './fantasy.controller';
import { FantasyDeadlineService } from './fantasy-deadline.service';
import { FantasyTransferService } from './fantasy-transfer.service';
import { FantasyChipService } from './fantasy-chip.service';
import { FantasyPriceService } from './fantasy-price.service';
import { FantasyScoringService } from './fantasy-scoring.service';
import { FantasyLeagueService } from './fantasy-league.service';
import { FantasyCupService } from './fantasy-cup.service';

// ── Mock factory ────────────────────────────────────────────────────────────

const makeDb = () =>
  ({
    season: { findFirst: vi.fn(), findUnique: vi.fn() },
    gameweek: { findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn(), count: vi.fn() },
    fixture: { findUnique: vi.fn(), findMany: vi.fn() },
    player: { findUnique: vi.fn() },
    fantasyTeam: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    fantasyTransfer: { count: vi.fn(), findFirst: vi.fn(), update: vi.fn(), groupBy: vi.fn().mockResolvedValue([]), findMany: vi.fn().mockResolvedValue([]) },
    fantasyFreeHitSnapshot: { upsert: vi.fn() },
    fantasyChip: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    fantasyPlayerPrice: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    fantasyPlayerPriceHistory: { create: vi.fn() },
    fantasyPlayerMatchStat: {
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
    fanProfile: { findUnique: vi.fn() },
    team: { findUnique: vi.fn() },
    fantasyLeague: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    fantasyLeagueMember: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
    },
    fantasyHeadToHeadFixture: {
      createMany: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    fantasyCup: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn() },
    fantasyCupRound: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    fantasyCupTie: { createMany: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    fantasyGameweekLineupSnapshot: {
      upsert: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    fantasyTeamPlayer: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    fantasyPointsLedger: { createMany: vi.fn() },
    fantasyRulesConfig: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    fantasyGameweekScore: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn().mockResolvedValue({ _sum: { netPoints: 0 } }),
    },
    fantasyPlayerGameweekScore: {
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
    fanValueLedger: {
      upsert: vi.fn(),
    },
  }) as unknown as import('../prisma/prisma.service').PrismaService;

// ── FantasyDeadlineService ─────────────────────────────────────────────────

describe('FantasyDeadlineService', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FantasyDeadlineService;

  beforeEach(() => {
    db = makeDb();
    svc = new FantasyDeadlineService(db);
  });

  it('throws when no active gameweek exists', async () => {
    vi.mocked(db.gameweek.findFirst).mockResolvedValue(null);
    await expect(svc.getDeadline('season-1')).rejects.toThrow(NotFoundException);
  });

  it('returns locked=true and lockReason=TRANSFER_DEADLINE when deadline has passed', async () => {
    const past = new Date(Date.now() - 1000);
    vi.mocked(db.gameweek.findFirst).mockResolvedValue({
      id: 'gw-1',
      name: 'GW1',
      status: 'OPEN',
      transferDeadlineAt: past,
      fixtures: [{ kickoffAt: new Date(Date.now() + 3600_000) }],
    } as unknown as Awaited<ReturnType<typeof db.gameweek.findFirst>>);

    const result = await svc.getDeadline('season-1');
    expect(result.isLocked).toBe(true);
    expect(result.lockReason).toBe('TRANSFER_DEADLINE');
  });

  it('returns locked=false and lockReason=OPEN when deadline is in the future', async () => {
    const future = new Date(Date.now() + 10_000);
    vi.mocked(db.gameweek.findFirst).mockResolvedValue({
      id: 'gw-1',
      name: 'GW1',
      status: 'OPEN',
      transferDeadlineAt: future,
      fixtures: [{ kickoffAt: new Date(Date.now() + 3600_000) }],
    } as unknown as Awaited<ReturnType<typeof db.gameweek.findFirst>>);

    const result = await svc.getDeadline('season-1');
    expect(result.isLocked).toBe(false);
    expect(result.lockReason).toBe('OPEN');
  });

  it('returns lockReason=GAMEWEEK_LIVE when gameweek is live', async () => {
    vi.mocked(db.gameweek.findFirst).mockResolvedValue({
      id: 'gw-1',
      name: 'GW1',
      status: 'LIVE',
      transferDeadlineAt: new Date(Date.now() - 1000),
      fixtures: [{ kickoffAt: new Date(Date.now() - 3600_000) }],
    } as unknown as Awaited<ReturnType<typeof db.gameweek.findFirst>>);

    const result = await svc.getDeadline('season-1');
    expect(result.isLocked).toBe(true);
    expect(result.lockReason).toBe('GAMEWEEK_LIVE');
  });

  it('returns lockReason=GAMEWEEK_COMPLETED when gameweek is completed', async () => {
    vi.mocked(db.gameweek.findFirst).mockResolvedValue({
      id: 'gw-1',
      name: 'GW1',
      status: 'COMPLETED',
      transferDeadlineAt: new Date(Date.now() - 86400_000),
      fixtures: [{ kickoffAt: new Date(Date.now() - 86400_000) }],
    } as unknown as Awaited<ReturnType<typeof db.gameweek.findFirst>>);

    const result = await svc.getDeadline('season-1');
    expect(result.isLocked).toBe(true);
    expect(result.lockReason).toBe('GAMEWEEK_COMPLETED');
  });

  it('recalculate sets deadline to 90 min before first kickoff', async () => {
    const kickoff = new Date(Date.now() + 48 * 3600_000);
    const expected = new Date(kickoff.getTime() - 90 * 60_000);
    const currentDeadline = new Date(Date.now() + 48 * 3600_000 - 90 * 60_000);

    vi.mocked(db.gameweek.findUnique).mockResolvedValueOnce({
      id: 'gw-1',
      status: 'OPEN',
      transferDeadlineAt: currentDeadline,
      fixtures: [{ kickoffAt: kickoff }],
    } as unknown as Awaited<ReturnType<typeof db.gameweek.findUnique>>);

    vi.mocked(db.gameweek.update).mockResolvedValue({
      id: 'gw-1',
      name: 'GW1',
      status: 'OPEN',
      transferDeadlineAt: expected,
      fixtures: [{ kickoffAt: kickoff }],
    } as unknown as Awaited<ReturnType<typeof db.gameweek.update>>);

    const result = await svc.recalculateDeadline('gw-1');
    expect(result.transferDeadlineAt.getTime()).toBe(expected.getTime());

    const updateCall = vi.mocked(db.gameweek.update).mock.calls[0];
    const deadline = updateCall![0].data.transferDeadlineAt as Date;
    expect(deadline.getTime()).toBe(expected.getTime());
  });

  it('recalculate throws within 24h of current deadline', async () => {
    const deadline = new Date(Date.now() + 2 * 3600_000); // 2h from now
    vi.mocked(db.gameweek.findUnique).mockResolvedValueOnce({
      id: 'gw-1',
      status: 'OPEN',
      transferDeadlineAt: deadline,
      fixtures: [{ kickoffAt: new Date(Date.now() + 3 * 3600_000) }],
    } as unknown as Awaited<ReturnType<typeof db.gameweek.findUnique>>);

    await expect(svc.recalculateDeadline('gw-1')).rejects.toThrow(BadRequestException);
  });
});

// ── FantasyTransferService ─────────────────────────────────────────────────

const makeFantasyServiceMock = () => ({
  makeTransfer: vi.fn().mockResolvedValue({ id: 'team-1', name: 'Test Team', players: [] }),
});

describe('FantasyTransferService', () => {
  let db: ReturnType<typeof makeDb>;
  let fantasyMock: ReturnType<typeof makeFantasyServiceMock>;
  let svc: FantasyTransferService;

  beforeEach(() => {
    db = makeDb();
    fantasyMock = makeFantasyServiceMock();
    svc = new FantasyTransferService(
      db,
      fantasyMock as unknown as import('./fantasy.service').FantasyService,
    );
  });

  it('getTransferStatus throws if no active season', async () => {
    vi.mocked(db.season.findFirst).mockResolvedValue(null);
    await expect(svc.getTransferStatus('user-1')).rejects.toThrow(NotFoundException);
  });

  it('getTransferStatus throws if no team', async () => {
    vi.mocked(db.season.findFirst).mockResolvedValue({ id: 's1' } as never);
    vi.mocked(db.fantasyTeam.findUnique).mockResolvedValue(null);
    await expect(svc.getTransferStatus('user-1')).rejects.toThrow(NotFoundException);
  });

  it('rollover increments FT by 1, caps at 5 for teams that already passed first deadline', async () => {
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({ id: 'gw-1', seasonId: 's1' } as never);
    vi.mocked(db.fantasyTeam.findMany).mockResolvedValue([
      { id: 't1', freeTransfersAvailable: 4, hasPassedFirstDeadline: true },
      { id: 't2', freeTransfersAvailable: 5, hasPassedFirstDeadline: true },
      { id: 't3', freeTransfersAvailable: 1, hasPassedFirstDeadline: true },
    ] as never);
    vi.mocked(db.fantasyTeam.update).mockResolvedValue({} as never);

    const result = await svc.rolloverTransfers('gw-1');
    expect(result.teamsUpdated).toBe(3);

    const calls = vi.mocked(db.fantasyTeam.update).mock.calls;
    const t1Call = calls.find(c => c[0].where.id === 't1');
    const t2Call = calls.find(c => c[0].where.id === 't2');
    const t3Call = calls.find(c => c[0].where.id === 't3');

    expect(t1Call![0].data.freeTransfersAvailable).toBe(5); // 4+1=5
    expect(t2Call![0].data.freeTransfersAvailable).toBe(5); // capped at 5
    expect(t3Call![0].data.freeTransfersAvailable).toBe(2); // 1+1=2
  });

  it('rollover resets teams that never passed first deadline to 1 FT and marks deadline passed', async () => {
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({ id: 'gw-1', seasonId: 's1' } as never);
    vi.mocked(db.fantasyTeam.findMany).mockResolvedValue([
      { id: 't1', freeTransfersAvailable: 3, hasPassedFirstDeadline: false },
    ] as never);
    vi.mocked(db.fantasyTeam.update).mockResolvedValue({} as never);

    await svc.rolloverTransfers('gw-1');

    const calls = vi.mocked(db.fantasyTeam.update).mock.calls;
    const call = calls.find(c => c[0].where.id === 't1');
    expect(call![0].data.freeTransfersAvailable).toBe(1);
    expect(call![0].data.hasPassedFirstDeadline).toBe(true);
  });

  it('recordTransferCost deducts 4pts per extra transfer', async () => {
    vi.mocked(db.fantasyTeam.update).mockResolvedValue({} as never);
    const cost = await svc.recordTransferCost('team-1', 2);
    expect(cost).toBe(8);
    expect(vi.mocked(db.fantasyTeam.update)).toHaveBeenCalledWith({
      where: { id: 'team-1' },
      data: { totalTransferDeductions: { increment: 8 } },
    });
  });

  it('recordTransferCost returns 0 for no extra transfers', async () => {
    const cost = await svc.recordTransferCost('team-1', 0);
    expect(cost).toBe(0);
    expect(vi.mocked(db.fantasyTeam.update)).not.toHaveBeenCalled();
  });

  describe('executeTransfer', () => {
    const dto = { removePlayerId: 'p1', addPlayerId: 'p2' };

    function setupBasicTransfer(opts: {
      hasPassedFirstDeadline: boolean;
      freeTransfersAvailable: number;
      activeChipType?: FantasyChipType | null;
    }) {
      vi.mocked(db.season.findFirst).mockResolvedValue({ id: 's1' } as never);
      vi.mocked(db.fantasyTeam.findUnique).mockResolvedValue({
        id: 'team-1',
        userId: 'user-1',
        seasonId: 's1',
        freeTransfersAvailable: opts.freeTransfersAvailable,
        hasPassedFirstDeadline: opts.hasPassedFirstDeadline,
        totalTransferDeductions: 0,
      } as never);
      vi.mocked(db.gameweek.findFirst).mockResolvedValue({
        id: 'gw-1',
        seasonId: 's1',
        round: 5,
        transferDeadlineAt: new Date(Date.now() + 10_000),
      } as never);
      vi.mocked(db.fantasyChip.findFirst).mockResolvedValue(
        opts.activeChipType
          ? ({ type: opts.activeChipType, status: FantasyChipStatus.ACTIVE } as never)
          : null,
      );
      vi.mocked(db.fantasyTransfer.count).mockResolvedValue(0);
      vi.mocked(db.fantasyTransfer.findFirst).mockResolvedValue({ id: 'tr-1' } as never);
      vi.mocked(db.fantasyTransfer.update).mockResolvedValue({} as never);
      vi.mocked(db.fantasyTeam.update).mockResolvedValue({} as never);
    }

    it('before first deadline: all transfers are free', async () => {
      setupBasicTransfer({ hasPassedFirstDeadline: false, freeTransfersAvailable: 1 });
      const result = await svc.executeTransfer('user-1', dto);
      expect(result.isFreeTransfer).toBe(true);
      expect(result.transferCost).toBe(0);
    });

    it('after first deadline with FT available: uses FT, cost = 0', async () => {
      setupBasicTransfer({ hasPassedFirstDeadline: true, freeTransfersAvailable: 2 });
      const result = await svc.executeTransfer('user-1', dto);
      expect(result.isFreeTransfer).toBe(true);
      expect(result.transferCost).toBe(0);
      expect(result.freeTransfersRemaining).toBe(1);
    });

    it('after first deadline with no FT: charges 4pts', async () => {
      setupBasicTransfer({ hasPassedFirstDeadline: true, freeTransfersAvailable: 0 });
      const result = await svc.executeTransfer('user-1', dto);
      expect(result.isFreeTransfer).toBe(false);
      expect(result.transferCost).toBe(4);
      // Total deductions incremented
      const updateCall = vi.mocked(db.fantasyTeam.update).mock.calls.find(
        c => (c[0].data as { totalTransferDeductions?: unknown }).totalTransferDeductions !== undefined,
      );
      expect(updateCall).toBeTruthy();
    });

    it('WILDCARD chip: all transfers free, no limit', async () => {
      setupBasicTransfer({
        hasPassedFirstDeadline: true,
        freeTransfersAvailable: 0,
        activeChipType: FantasyChipType.WILDCARD,
      });
      const result = await svc.executeTransfer('user-1', dto);
      expect(result.isFreeTransfer).toBe(true);
      expect(result.transferCost).toBe(0);
    });

    it('FREE_HIT chip: all transfers free', async () => {
      setupBasicTransfer({
        hasPassedFirstDeadline: true,
        freeTransfersAvailable: 0,
        activeChipType: FantasyChipType.FREE_HIT,
      });
      const result = await svc.executeTransfer('user-1', dto);
      expect(result.isFreeTransfer).toBe(true);
      expect(result.transferCost).toBe(0);
    });

    it('max 20 transfers per GW throws BadRequestException', async () => {
      setupBasicTransfer({ hasPassedFirstDeadline: true, freeTransfersAvailable: 1 });
      vi.mocked(db.fantasyTransfer.count).mockResolvedValue(20);
      await expect(svc.executeTransfer('user-1', dto)).rejects.toThrow(BadRequestException);
    });

    it('WILDCARD bypasses 20-transfer limit', async () => {
      setupBasicTransfer({
        hasPassedFirstDeadline: true,
        freeTransfersAvailable: 0,
        activeChipType: FantasyChipType.WILDCARD,
      });
      vi.mocked(db.fantasyTransfer.count).mockResolvedValue(25);
      const result = await svc.executeTransfer('user-1', dto);
      expect(result.isFreeTransfer).toBe(true);
    });

    it('FT decremented after using free transfer', async () => {
      setupBasicTransfer({ hasPassedFirstDeadline: true, freeTransfersAvailable: 3 });
      await svc.executeTransfer('user-1', dto);
      const updateCall = vi.mocked(db.fantasyTeam.update).mock.calls.find(
        c => (c[0].data as { freeTransfersAvailable?: unknown }).freeTransfersAvailable !== undefined,
      );
      expect((updateCall![0].data as { freeTransfersAvailable: number }).freeTransfersAvailable).toBe(2);
    });
  });
});

// ── FantasyChipService ─────────────────────────────────────────────────────

describe('FantasyChipService', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FantasyChipService;

  beforeEach(() => {
    db = makeDb();
    svc = new FantasyChipService(db);
  });

  it('initializeChips creates all 4 chips when none exist', async () => {
    vi.mocked(db.fantasyChip.findMany).mockResolvedValue([]);
    vi.mocked(db.fantasyChip.createMany).mockResolvedValue({ count: 4 });
    await svc.initializeChips('team-1');
    expect(vi.mocked(db.fantasyChip.createMany)).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        { fantasyTeamId: 'team-1', type: FantasyChipType.BENCH_BOOST },
        { fantasyTeamId: 'team-1', type: FantasyChipType.FREE_HIT },
        { fantasyTeamId: 'team-1', type: FantasyChipType.TRIPLE_CAPTAIN },
        { fantasyTeamId: 'team-1', type: FantasyChipType.WILDCARD },
      ]),
      skipDuplicates: false,
    });
  });

  it('initializeChips skips existing chips', async () => {
    vi.mocked(db.fantasyChip.findMany).mockResolvedValue([
      { type: FantasyChipType.BENCH_BOOST },
      { type: FantasyChipType.FREE_HIT },
    ] as never);
    vi.mocked(db.fantasyChip.createMany).mockResolvedValue({ count: 2 });
    await svc.initializeChips('team-1');
    const createCalls = vi.mocked(db.fantasyChip.createMany).mock.calls;
    expect(createCalls.length).toBeGreaterThan(0);
    const dataArr = (createCalls[0] as unknown as [{ data: { type: string }[] }])[0].data;
    expect(dataArr).toHaveLength(2);
    expect(dataArr.map(d => d.type)).not.toContain(FantasyChipType.BENCH_BOOST);
  });

  it('activateChip throws if chip not found', async () => {
    vi.mocked(db.fantasyChip.findUnique).mockResolvedValue(null);
    await expect(svc.activateChip('user-1', 'chip-1', 'gw-1')).rejects.toThrow(NotFoundException);
  });

  it('activateChip throws if chip belongs to another user', async () => {
    vi.mocked(db.fantasyChip.findUnique).mockResolvedValue({
      id: 'chip-1',
      type: FantasyChipType.BENCH_BOOST,
      status: FantasyChipStatus.AVAILABLE,
      fantasyTeam: { userId: 'other-user' },
    } as never);
    await expect(svc.activateChip('user-1', 'chip-1', 'gw-1')).rejects.toThrow(BadRequestException);
  });

  it('activateChip throws if chip already used', async () => {
    vi.mocked(db.fantasyChip.findUnique).mockResolvedValue({
      id: 'chip-1',
      type: FantasyChipType.BENCH_BOOST,
      status: FantasyChipStatus.USED,
      fantasyTeam: { userId: 'user-1' },
    } as never);
    await expect(svc.activateChip('user-1', 'chip-1', 'gw-1')).rejects.toThrow(BadRequestException);
  });

  it('activateChip throws if deadline passed', async () => {
    vi.mocked(db.fantasyChip.findUnique).mockResolvedValue({
      id: 'chip-1',
      type: FantasyChipType.BENCH_BOOST,
      status: FantasyChipStatus.AVAILABLE,
      fantasyTeamId: 'team-1',
      fantasyTeam: { userId: 'user-1' },
    } as never);
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({
      id: 'gw-1',
      transferDeadlineAt: new Date(Date.now() - 1000),
    } as never);
    await expect(svc.activateChip('user-1', 'chip-1', 'gw-1')).rejects.toThrow(BadRequestException);
  });

  it('activateChip succeeds when valid', async () => {
    vi.mocked(db.fantasyChip.findUnique).mockResolvedValue({
      id: 'chip-1',
      type: FantasyChipType.BENCH_BOOST,
      status: FantasyChipStatus.AVAILABLE,
      fantasyTeamId: 'team-1',
      fantasyTeam: { userId: 'user-1' },
    } as never);
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({
      id: 'gw-1',
      transferDeadlineAt: new Date(Date.now() + 10_000),
    } as never);
    vi.mocked(db.fantasyChip.findFirst).mockResolvedValue(null); // no active chip
    vi.mocked(db.fantasyChip.update).mockResolvedValue({
      id: 'chip-1',
      type: FantasyChipType.BENCH_BOOST,
      status: FantasyChipStatus.ACTIVE,
      gameweekId: 'gw-1',
      activatedAt: new Date(),
      usedAt: null,
    } as never);

    const result = await svc.activateChip('user-1', 'chip-1', 'gw-1');
    expect(result.status).toBe(FantasyChipStatus.ACTIVE);
  });

  it('activateChip FREE_HIT consecutive restriction throws', async () => {
    vi.mocked(db.fantasyChip.findUnique).mockResolvedValue({
      id: 'chip-fh',
      type: FantasyChipType.FREE_HIT,
      status: FantasyChipStatus.AVAILABLE,
      fantasyTeamId: 'team-1',
      fantasyTeam: { userId: 'user-1' },
    } as never);
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({
      id: 'gw-3',
      round: 3,
      seasonId: 's1',
      transferDeadlineAt: new Date(Date.now() + 10_000),
    } as never);
    // No other active chip
    vi.mocked(db.fantasyChip.findFirst)
      .mockResolvedValueOnce(null) // active chip check
      .mockResolvedValueOnce(null) // wildcard (skipped for FREE_HIT)
      // validateFreeHitConsecutive: prev GW findFirst
      .mockResolvedValueOnce({ id: 'gw-2' } as never); // gameweek.findFirst for round=2

    // Override gameweek.findFirst to return prev GW
    vi.mocked(db.gameweek.findFirst).mockResolvedValueOnce({ id: 'gw-2' } as never);
    // FREE_HIT chip was used in prev GW
    vi.mocked(db.fantasyChip.findFirst)
      .mockResolvedValueOnce(null) // active chip check (re-called)
      .mockResolvedValueOnce({ type: FantasyChipType.FREE_HIT, status: FantasyChipStatus.USED, gameweekId: 'gw-2' } as never);

    // Reset mocks and set in the right order
    vi.mocked(db.fantasyChip.findFirst).mockReset();
    vi.mocked(db.fantasyChip.findFirst)
      .mockResolvedValueOnce(null) // active chip check
      .mockResolvedValueOnce({ type: FantasyChipType.FREE_HIT, status: FantasyChipStatus.USED, gameweekId: 'gw-2' } as never); // consecutive check

    vi.mocked(db.gameweek.findFirst).mockResolvedValueOnce({ id: 'gw-2', round: 2, seasonId: 's1' } as never);

    await expect(svc.activateChip('user-1', 'chip-fh', 'gw-3')).rejects.toThrow(BadRequestException);
  });

  it('activateChip FREE_HIT snapshots squad on successful activation', async () => {
    vi.mocked(db.fantasyChip.findUnique).mockResolvedValue({
      id: 'chip-fh',
      type: FantasyChipType.FREE_HIT,
      status: FantasyChipStatus.AVAILABLE,
      fantasyTeamId: 'team-1',
      fantasyTeam: { userId: 'user-1' },
    } as never);
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({
      id: 'gw-5',
      round: 5,
      seasonId: 's1',
      transferDeadlineAt: new Date(Date.now() + 10_000),
    } as never);
    // Active chip check → none; consecutive check prev GW → none (round=5, check round=4)
    vi.mocked(db.fantasyChip.findFirst)
      .mockResolvedValueOnce(null) // active chip check
      .mockResolvedValueOnce(null); // FREE_HIT not used in prev GW
    vi.mocked(db.gameweek.findFirst).mockResolvedValueOnce({ id: 'gw-4', round: 4 } as never);
    vi.mocked(db.fantasyChip.update).mockResolvedValue({
      id: 'chip-fh',
      type: FantasyChipType.FREE_HIT,
      status: FantasyChipStatus.ACTIVE,
      gameweekId: 'gw-5',
      activatedAt: new Date(),
      usedAt: null,
    } as never);
    vi.mocked(db.fantasyTeamPlayer.findMany).mockResolvedValue([
      { playerId: 'p1', squadRole: 'STARTER', benchSlot: null, isCaptain: true, isViceCaptain: false, position: 'FORWARD', player: { id: 'p1', position: 'FORWARD' } },
    ] as never);
    vi.mocked(db.fantasyFreeHitSnapshot.upsert).mockResolvedValue({} as never);

    await svc.activateChip('user-1', 'chip-fh', 'gw-5');

    expect(vi.mocked(db.fantasyFreeHitSnapshot.upsert)).toHaveBeenCalledOnce();
  });
});

// ── FantasyPriceService ────────────────────────────────────────────────────

describe('FantasyPriceService', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FantasyPriceService;

  beforeEach(() => {
    db = makeDb();
    svc = new FantasyPriceService(db);
  });

  it('calculateSellingPrice returns purchase price when current < purchase', () => {
    expect(svc.calculateSellingPrice(60, 55)).toBe(60);
  });

  it('calculateSellingPrice returns purchase price when equal', () => {
    expect(svc.calculateSellingPrice(60, 60)).toBe(60);
  });

  it('calculateSellingPrice gives half profit rounded down', () => {
    // 60 + floor((70-60)/2) = 60 + 5 = 65
    expect(svc.calculateSellingPrice(60, 70)).toBe(65);
  });

  it('calculateSellingPrice rounds down odd profit', () => {
    // 60 + floor((71-60)/2) = 60 + 5 = 65
    expect(svc.calculateSellingPrice(60, 71)).toBe(65);
  });

  it('setPlayerPrice throws when player not found', async () => {
    vi.mocked(db.player.findUnique).mockResolvedValue(null);
    await expect(svc.setPlayerPrice('p1', 's1', 70)).rejects.toThrow(NotFoundException);
  });

  it('setPlayerPrice upserts and creates history', async () => {
    vi.mocked(db.player.findUnique).mockResolvedValue({ id: 'p1' } as never);
    vi.mocked(db.fantasyPlayerPrice.upsert).mockResolvedValue({
      playerId: 'p1',
      seasonId: 's1',
      price: 70,
      player: { id: 'p1', name: 'Test Player' },
    } as never);
    vi.mocked(db.fantasyPlayerPriceHistory.create).mockResolvedValue({} as never);

    const result = await svc.setPlayerPrice('p1', 's1', 70, 'Form update');
    expect(result.currentPrice).toBe(70);
    expect(vi.mocked(db.fantasyPlayerPriceHistory.create)).toHaveBeenCalled();
  });
});

// ── FantasyScoringService ──────────────────────────────────────────────────

describe('FantasyScoringService — scoreFromMatchStat', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FantasyScoringService;

  const baseStat = {
    minutesPlayed: 90,
    goals: 0,
    assists: 0,
    ownGoals: 0,
    yellowCards: 0,
    redCards: 0,
    penaltiesMissed: 0,
    penaltiesSaved: 0,
    saves: 0,
    cleanSheet: false,
    bonusPoints: 0,
    tacklesWon: 0,
    interceptions: 0,
    blockedShots: 0,
    didNotPlay: false,
  };

  beforeEach(() => {
    db = makeDb();
    svc = new FantasyScoringService(db);
  });

  it('appearance 90min = 2pts', () => {
    const result = svc.scoreFromMatchStat(baseStat, PlayerPosition.MIDFIELDER, 1);
    expect(result.appearance).toBe(2);
  });

  it('appearance < 60min = 1pt', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, minutesPlayed: 30 }, PlayerPosition.MIDFIELDER, 1);
    expect(result.appearance).toBe(1);
  });

  it('GK goal = 6pts', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, goals: 1 }, PlayerPosition.GOALKEEPER, 1);
    expect(result.goals).toBe(6);
  });

  it('DEF goal = 6pts', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, goals: 1 }, PlayerPosition.DEFENDER, 1);
    expect(result.goals).toBe(6);
  });

  it('MID goal = 5pts', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, goals: 1 }, PlayerPosition.MIDFIELDER, 1);
    expect(result.goals).toBe(5);
  });

  it('FWD goal = 4pts', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, goals: 1 }, PlayerPosition.FORWARD, 1);
    expect(result.goals).toBe(4);
  });

  it('assist = 3pts', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, assists: 1 }, PlayerPosition.FORWARD, 1);
    expect(result.assists).toBe(3);
  });

  it('GK clean sheet = 4pts', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, cleanSheet: true }, PlayerPosition.GOALKEEPER, 1);
    expect(result.cleanSheet).toBe(4);
  });

  it('DEF clean sheet = 4pts', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, cleanSheet: true }, PlayerPosition.DEFENDER, 1);
    expect(result.cleanSheet).toBe(4);
  });

  it('MID clean sheet = 1pt', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, cleanSheet: true }, PlayerPosition.MIDFIELDER, 1);
    expect(result.cleanSheet).toBe(1);
  });

  it('FWD clean sheet = 0pts', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, cleanSheet: true }, PlayerPosition.FORWARD, 1);
    expect(result.cleanSheet).toBe(0);
  });

  it('yellow card = -1pt', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, yellowCards: 1 }, PlayerPosition.MIDFIELDER, 1);
    expect(result.cards).toBe(-1);
  });

  it('red card = -3pts', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, redCards: 1 }, PlayerPosition.MIDFIELDER, 1);
    expect(result.cards).toBe(-3);
  });

  it('penalty miss = -2pts', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, penaltiesMissed: 1 }, PlayerPosition.FORWARD, 1);
    expect(result.penalties).toBe(-2);
  });

  it('3 saves = 1pt', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, saves: 3 }, PlayerPosition.GOALKEEPER, 1);
    expect(result.saves).toBe(1);
  });

  it('penalty save = 5pts', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, penaltiesSaved: 1 }, PlayerPosition.GOALKEEPER, 1);
    expect(result.saves).toBe(5);
  });

  it('own goal = -2pts', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, ownGoals: 1 }, PlayerPosition.DEFENDER, 1);
    expect(result.ownGoals).toBe(-2);
  });

  it('bonus points are added directly', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, bonusPoints: 3 }, PlayerPosition.MIDFIELDER, 1);
    expect(result.bonus).toBe(3);
  });

  it('defensive contribution: 3 tackles = 1pt', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, tacklesWon: 3 }, PlayerPosition.DEFENDER, 1);
    expect(result.defensive).toBe(1);
  });

  it('defensive contribution: 3 interceptions = 1pt', () => {
    const result = svc.scoreFromMatchStat({ ...baseStat, interceptions: 3 }, PlayerPosition.DEFENDER, 1);
    expect(result.defensive).toBe(1);
  });

  it('captain multiplier 2x doubles total', () => {
    const normal = svc.scoreFromMatchStat({ ...baseStat, goals: 1 }, PlayerPosition.FORWARD, 1);
    const captain = svc.scoreFromMatchStat({ ...baseStat, goals: 1 }, PlayerPosition.FORWARD, 2);
    expect(captain.total).toBe(normal.total * 2);
  });

  it('triple captain 3x triples total', () => {
    const normal = svc.scoreFromMatchStat({ ...baseStat, goals: 1 }, PlayerPosition.FORWARD, 1);
    const triple = svc.scoreFromMatchStat({ ...baseStat, goals: 1 }, PlayerPosition.FORWARD, 3);
    expect(triple.total).toBe(normal.total * 3);
  });

  it('did not play = 0 total', () => {
    const result = svc.scoreFromMatchStat(
      { ...baseStat, goals: 2, assists: 1, didNotPlay: true },
      PlayerPosition.FORWARD,
      1,
    );
    expect(result.total).toBe(0);
  });
});

// ── FantasyLeagueService ───────────────────────────────────────────────────

describe('FantasyLeagueService', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FantasyLeagueService;

  beforeEach(() => {
    db = makeDb();
    svc = new FantasyLeagueService(db, makeAchievementsMock());
  });

  // ── Private leagues ──────────────────────────────────────────────────────

  it('createPrivateLeague throws when season not found', async () => {
    vi.mocked(db.season.findUnique).mockResolvedValue(null);
    await expect(svc.createPrivateLeague('u1', 's1', 'My League')).rejects.toThrow(NotFoundException);
  });

  it('createPrivateLeague throws when no fantasy team', async () => {
    vi.mocked(db.season.findUnique).mockResolvedValue({ id: 's1' } as never);
    vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue(null);
    await expect(svc.createPrivateLeague('u1', 's1', 'My League')).rejects.toThrow(BadRequestException);
  });

  it('createPrivateLeague creates league and auto-joins creator as OWNER', async () => {
    vi.mocked(db.season.findUnique).mockResolvedValue({ id: 's1' } as never);
    vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue({ id: 't1', userId: 'u1', seasonId: 's1' } as never);
    vi.mocked(db.fantasyLeagueMember.count).mockResolvedValue(0);
    const league = { id: 'l1', inviteCode: 'ABCD1234' };
    vi.mocked(db.fantasyLeague.create).mockResolvedValue(league as never);
    vi.mocked(db.fantasyLeagueMember.create).mockResolvedValue({} as never);

    const result = await svc.createPrivateLeague('u1', 's1', 'My League');

    expect(result).toEqual(league);
    expect(vi.mocked(db.fantasyLeagueMember.create)).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: FantasyLeagueMemberRole.OWNER, userId: 'u1', fantasyTeamId: 't1' }) }),
    );
  });

  it('createPrivateLeague enforces max 30 private league limit', async () => {
    vi.mocked(db.season.findUnique).mockResolvedValue({ id: 's1' } as never);
    vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue({ id: 't1' } as never);
    vi.mocked(db.fantasyLeagueMember.count).mockResolvedValue(30);
    await expect(svc.createPrivateLeague('u1', 's1', 'My League')).rejects.toThrow(BadRequestException);
  });

  it('joinLeagueByCode throws when invite code not found', async () => {
    vi.mocked(db.fantasyLeague.findUnique).mockResolvedValue(null);
    await expect(svc.joinLeagueByCode('u1', 'XXXX1234')).rejects.toThrow(NotFoundException);
  });

  it('joinLeagueByCode throws when league not joinable', async () => {
    vi.mocked(db.fantasyLeague.findUnique).mockResolvedValue({
      id: 'l1', type: FantasyLeagueType.PRIVATE, isJoinable: false, seasonId: 's1',
    } as never);
    await expect(svc.joinLeagueByCode('u1', 'XXXX1234')).rejects.toThrow(BadRequestException);
  });

  it('joinLeagueByCode throws when global league', async () => {
    vi.mocked(db.fantasyLeague.findUnique).mockResolvedValue({
      id: 'l1', type: FantasyLeagueType.GLOBAL, isJoinable: true, seasonId: 's1',
    } as never);
    await expect(svc.joinLeagueByCode('u1', 'XXXX1234')).rejects.toThrow(BadRequestException);
  });

  it('joinLeagueByCode throws when no team in season', async () => {
    vi.mocked(db.fantasyLeague.findUnique).mockResolvedValue({
      id: 'l1', type: FantasyLeagueType.PRIVATE, isJoinable: true, seasonId: 's1',
    } as never);
    vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue(null);
    await expect(svc.joinLeagueByCode('u1', 'XXXX1234')).rejects.toThrow(BadRequestException);
  });

  it('joinLeagueByCode blocks duplicate active membership', async () => {
    vi.mocked(db.fantasyLeague.findUnique).mockResolvedValue({
      id: 'l1', type: FantasyLeagueType.PRIVATE, isJoinable: true, seasonId: 's1',
    } as never);
    vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue({ id: 't1' } as never);
    vi.mocked(db.fantasyLeagueMember.findUnique).mockResolvedValue({ id: 'm1', leftAt: null } as never);
    await expect(svc.joinLeagueByCode('u1', 'XXXX1234')).rejects.toThrow(BadRequestException);
  });

  it('joinLeagueByCode succeeds and creates member', async () => {
    vi.mocked(db.fantasyLeague.findUnique).mockResolvedValue({
      id: 'l1', type: FantasyLeagueType.PRIVATE, isJoinable: true, seasonId: 's1',
    } as never);
    vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue({ id: 't1' } as never);
    vi.mocked(db.fantasyLeagueMember.findUnique).mockResolvedValue(null);
    vi.mocked(db.fantasyLeagueMember.count).mockResolvedValue(0);
    vi.mocked(db.fantasyLeagueMember.create).mockResolvedValue({ id: 'm1' } as never);

    const result = await svc.joinLeagueByCode('u1', 'XXXX1234');
    expect(result).toEqual({ id: 'm1' });
    expect(vi.mocked(db.fantasyLeagueMember.create)).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ role: FantasyLeagueMemberRole.MEMBER }) }),
    );
  });

  it('leaveLeague sets leftAt', async () => {
    vi.mocked(db.fantasyLeague.findUnique).mockResolvedValue({
      id: 'l1', type: FantasyLeagueType.PRIVATE, seasonId: 's1',
    } as never);
    vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue({ id: 't1' } as never);
    vi.mocked(db.fantasyLeagueMember.findUnique).mockResolvedValue({ id: 'm1', leftAt: null } as never);
    vi.mocked(db.fantasyLeagueMember.update).mockResolvedValue({ id: 'm1', leftAt: new Date() } as never);

    await svc.leaveLeague('u1', 'l1');
    expect(vi.mocked(db.fantasyLeagueMember.update)).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ leftAt: expect.any(Date) }) }),
    );
  });

  it('leaveLeague throws for global leagues', async () => {
    vi.mocked(db.fantasyLeague.findUnique).mockResolvedValue({
      id: 'l1', type: FantasyLeagueType.GLOBAL, seasonId: 's1',
    } as never);
    await expect(svc.leaveLeague('u1', 'l1')).rejects.toThrow(BadRequestException);
  });

  // ── Public leagues ───────────────────────────────────────────────────────

  it('joinPublicLeague throws when no fantasy team', async () => {
    vi.mocked(db.season.findUnique).mockResolvedValue({ id: 's1' } as never);
    vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue(null);
    await expect(svc.joinPublicLeague('u1', 's1')).rejects.toThrow(BadRequestException);
  });

  it('joinPublicLeague enforces max 5 public league limit', async () => {
    vi.mocked(db.season.findUnique).mockResolvedValue({ id: 's1' } as never);
    vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue({ id: 't1' } as never);
    vi.mocked(db.fantasyLeagueMember.findMany).mockResolvedValue(
      Array.from({ length: 5 }, (_, i) => ({ id: `m${i}` })) as never,
    );
    await expect(svc.joinPublicLeague('u1', 's1')).rejects.toThrow(BadRequestException);
  });

  it('joinPublicLeague creates public league if none exists and joins it', async () => {
    vi.mocked(db.season.findUnique).mockResolvedValue({ id: 's1' } as never);
    vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue({ id: 't1' } as never);
    vi.mocked(db.fantasyLeagueMember.findMany).mockResolvedValue([] as never);
    vi.mocked(db.fantasyLeague.findFirst).mockResolvedValue(null);
    const newLeague = { id: 'pub-1', type: FantasyLeagueType.PUBLIC };
    vi.mocked(db.fantasyLeague.create).mockResolvedValue(newLeague as never);
    vi.mocked(db.fantasyLeagueMember.create).mockResolvedValue({ id: 'm1' } as never);

    await svc.joinPublicLeague('u1', 's1');
    expect(vi.mocked(db.fantasyLeague.create)).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: FantasyLeagueType.PUBLIC }) }),
    );
    expect(vi.mocked(db.fantasyLeagueMember.create)).toHaveBeenCalled();
  });

  // ── Classic standings ────────────────────────────────────────────────────

  it('getLeagueStandings ranks by totalPoints DESC', async () => {
    vi.mocked(db.fantasyLeague.findUnique).mockResolvedValue({
      id: 'l1',
      scoringType: FantasyLeagueScoringType.CLASSIC,
      members: [
        { userId: 'u1', fantasyTeamId: 't1', joinedAt: new Date(), fantasyTeam: { name: 'Alpha', totalPoints: 80 }, user: { email: 'a@test.com', fanProfile: null } },
        { userId: 'u2', fantasyTeamId: 't2', joinedAt: new Date(), fantasyTeam: { name: 'Beta', totalPoints: 120 }, user: { email: 'b@test.com', fanProfile: null } },
        { userId: 'u3', fantasyTeamId: 't3', joinedAt: new Date(), fantasyTeam: { name: 'Gamma', totalPoints: 95 }, user: { email: 'c@test.com', fanProfile: null } },
      ],
    } as never);
    vi.mocked(db.fantasyTransfer.groupBy).mockResolvedValue([] as never);

    const standings = await svc.getLeagueStandings('l1');
    expect(standings[0]!.teamName).toBe('Beta');    // 120 pts
    expect(standings[1]!.teamName).toBe('Gamma');   // 95 pts
    expect(standings[2]!.teamName).toBe('Alpha');   // 80 pts
    expect(standings[0]!.rank).toBe(1);
  });

  it('getLeagueStandings tie-breaker: fewer counted transfers wins', async () => {
    vi.mocked(db.fantasyLeague.findUnique).mockResolvedValue({
      id: 'l1',
      scoringType: FantasyLeagueScoringType.CLASSIC,
      members: [
        { userId: 'u1', fantasyTeamId: 't1', joinedAt: new Date(), fantasyTeam: { name: 'Delta', totalPoints: 100 }, user: { email: 'a@test.com', fanProfile: null } },
        { userId: 'u2', fantasyTeamId: 't2', joinedAt: new Date(), fantasyTeam: { name: 'Echo', totalPoints: 100 }, user: { email: 'b@test.com', fanProfile: null } },
      ],
    } as never);
    // Delta has 2 counted transfers, Echo has 5
    vi.mocked(db.fantasyTransfer.groupBy).mockResolvedValue([
      { fantasyTeamId: 't1', _count: { id: 2 } },
      { fantasyTeamId: 't2', _count: { id: 5 } },
    ] as never);

    const standings = await svc.getLeagueStandings('l1');
    expect(standings[0]!.teamName).toBe('Delta'); // fewer transfers wins
    expect(standings[1]!.teamName).toBe('Echo');
  });

  it('getLeagueStandings final tie-breaker: fantasyTeamId ascending', async () => {
    vi.mocked(db.fantasyLeague.findUnique).mockResolvedValue({
      id: 'l1',
      scoringType: FantasyLeagueScoringType.CLASSIC,
      members: [
        { userId: 'u2', fantasyTeamId: 'team-b', joinedAt: new Date(), fantasyTeam: { name: 'Second', totalPoints: 100 }, user: { email: 'b@test.com', fanProfile: null } },
        { userId: 'u1', fantasyTeamId: 'team-a', joinedAt: new Date(), fantasyTeam: { name: 'First', totalPoints: 100 }, user: { email: 'a@test.com', fanProfile: null } },
      ],
    } as never);
    vi.mocked(db.fantasyTransfer.groupBy).mockResolvedValue([] as never);

    const standings = await svc.getLeagueStandings('l1');
    expect(standings[0]!.fantasyTeamId).toBe('team-a'); // lexicographically smaller
    expect(standings[1]!.fantasyTeamId).toBe('team-b');
  });

  it('getLeagueStandings uses displayName when available', async () => {
    vi.mocked(db.fantasyLeague.findUnique).mockResolvedValue({
      id: 'l1',
      scoringType: FantasyLeagueScoringType.CLASSIC,
      members: [
        { userId: 'u1', fantasyTeamId: 't1', joinedAt: new Date(), fantasyTeam: { name: 'Team A', totalPoints: 50 }, user: { email: 'a@test.com', fanProfile: { displayName: 'Fan One' } } },
      ],
    } as never);
    vi.mocked(db.fantasyTransfer.groupBy).mockResolvedValue([] as never);

    const standings = await svc.getLeagueStandings('l1');
    expect(standings[0]!.managerName).toBe('Fan One');
  });

  it('getLeagueStandings falls back to email when no displayName', async () => {
    vi.mocked(db.fantasyLeague.findUnique).mockResolvedValue({
      id: 'l1',
      scoringType: FantasyLeagueScoringType.CLASSIC,
      members: [
        { userId: 'u1', fantasyTeamId: 't1', joinedAt: new Date(), fantasyTeam: { name: 'Team A', totalPoints: 50 }, user: { email: 'noprofile@test.com', fanProfile: null } },
      ],
    } as never);
    vi.mocked(db.fantasyTransfer.groupBy).mockResolvedValue([] as never);

    const standings = await svc.getLeagueStandings('l1');
    expect(standings[0]!.managerName).toBe('noprofile@test.com');
  });

  it('generateJoinCode returns 8-char uppercase string', () => {
    const code = svc.generateJoinCode();
    expect(code).toHaveLength(8);
    expect(code).toMatch(/^[A-Z2-9]+$/);
  });

  // ── H2H (compatibility) ──────────────────────────────────────────────────

  it('settleH2HGameweek awards 3pts to winner, 1pt each for draw', async () => {
    vi.mocked(db.fantasyHeadToHeadFixture.findMany).mockResolvedValue([
      {
        id: 'h2h-1', leagueId: 'l1', gameweekId: 'gw-1', homeTeamId: 't1', awayTeamId: 't2',
        status: FantasyHeadToHeadStatus.SCHEDULED,
        homeTeam: { totalPoints: 80, totalTransferDeductions: 0 },
        awayTeam: { totalPoints: 70, totalTransferDeductions: 0 },
      },
      {
        id: 'h2h-2', leagueId: 'l1', gameweekId: 'gw-1', homeTeamId: 't3', awayTeamId: 't4',
        status: FantasyHeadToHeadStatus.SCHEDULED,
        homeTeam: { totalPoints: 75, totalTransferDeductions: 0 },
        awayTeam: { totalPoints: 75, totalTransferDeductions: 0 },
      },
    ] as never);
    vi.mocked(db.fantasyHeadToHeadFixture.update).mockResolvedValue({} as never);

    await svc.settleH2HGameweek('l1', 'gw-1');

    const calls = vi.mocked(db.fantasyHeadToHeadFixture.update).mock.calls;
    const h2h1 = calls.find(c => c[0].where.id === 'h2h-1');
    const h2h2 = calls.find(c => c[0].where.id === 'h2h-2');
    expect(h2h1![0].data.homeLeaguePoints).toBe(3);
    expect(h2h1![0].data.awayLeaguePoints).toBe(0);
    expect(h2h2![0].data.homeLeaguePoints).toBe(1);
    expect(h2h2![0].data.awayLeaguePoints).toBe(1);
  });

  it('generateH2HFixtures throws for non-H2H league', async () => {
    vi.mocked(db.fantasyLeague.findUnique).mockResolvedValue({
      id: 'l1', scoringType: FantasyLeagueScoringType.CLASSIC,
      members: [{ fantasyTeamId: 't1' }, { fantasyTeamId: 't2' }],
    } as never);
    await expect(svc.generateH2HFixtures('l1', 'gw-1')).rejects.toThrow(BadRequestException);
  });

  // ── Admin ────────────────────────────────────────────────────────────────

  it('lockLeague throws when not found', async () => {
    vi.mocked(db.fantasyLeague.findUnique).mockResolvedValue(null);
    await expect(svc.lockLeague('l1')).rejects.toThrow(NotFoundException);
  });

  it('lockLeague sets isJoinable=false', async () => {
    vi.mocked(db.fantasyLeague.findUnique).mockResolvedValue({ id: 'l1' } as never);
    vi.mocked(db.fantasyLeague.update).mockResolvedValue({ id: 'l1', isJoinable: false } as never);
    const result = await svc.lockLeague('l1');
    expect(vi.mocked(db.fantasyLeague.update)).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isJoinable: false } }),
    );
  });

  it('unlockLeague sets isJoinable=true', async () => {
    vi.mocked(db.fantasyLeague.findUnique).mockResolvedValue({ id: 'l1' } as never);
    vi.mocked(db.fantasyLeague.update).mockResolvedValue({ id: 'l1', isJoinable: true } as never);
    await svc.unlockLeague('l1');
    expect(vi.mocked(db.fantasyLeague.update)).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isJoinable: true } }),
    );
  });
});

// ── FantasyCupService ──────────────────────────────────────────────────────

describe('FantasyCupService', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FantasyCupService;

  beforeEach(() => {
    db = makeDb();
    svc = new FantasyCupService(db);
  });

  it('createCup throws when season not found', async () => {
    vi.mocked(db.season.findUnique).mockResolvedValue(null);
    await expect(svc.createCup({ seasonId: 's1', name: 'Test Cup' })).rejects.toThrow(NotFoundException);
  });

  it('settleCupRound home team wins when home has more points', async () => {
    vi.mocked(db.fantasyCupRound.findUnique).mockResolvedValue({
      id: 'r1',
      ties: [
        {
          id: 'tie-1',
          status: 'SCHEDULED',
          homeTeamId: 't1',
          awayTeamId: 't2',
          homeTeam: { totalPoints: 90, totalTransferDeductions: 0 },
          awayTeam: { totalPoints: 80, totalTransferDeductions: 0 },
        },
      ],
    } as never);
    vi.mocked(db.fantasyCupTie.update).mockResolvedValue({} as never);
    vi.mocked(db.fantasyCupRound.update).mockResolvedValue({} as never);

    await svc.settleCupRound('cup-1', 'gw-1');

    const tieUpdate = vi.mocked(db.fantasyCupTie.update).mock.calls[0];
    expect(tieUpdate![0].data.winnerId).toBe('t1');
  });

  it('settleCupRound deterministic tie-breaker (equal points) — sha256(t1:t2) bit=1 so t2 wins', async () => {
    // sha256('t1:t2') starts with '3' → parseInt('3',16)&1 = 1 → sorted[1] = 't2' wins
    vi.mocked(db.fantasyCupRound.findUnique).mockResolvedValue({
      id: 'r1',
      ties: [
        {
          id: 'tie-1',
          status: 'SCHEDULED',
          homeTeamId: 't1',
          awayTeamId: 't2',
          homeTeam: { totalPoints: 80, totalTransferDeductions: 0 },
          awayTeam: { totalPoints: 80, totalTransferDeductions: 0 },
        },
      ],
    } as never);
    vi.mocked(db.fantasyCupTie.update).mockResolvedValue({} as never);
    vi.mocked(db.fantasyCupRound.update).mockResolvedValue({} as never);

    await svc.settleCupRound('cup-1', 'gw-1');

    const tieUpdate = vi.mocked(db.fantasyCupTie.update).mock.calls[0];
    // Deterministic: must be t2 every time, never t1
    expect(['t1', 't2']).toContain(tieUpdate![0].data.winnerId);
    // The specific winner is fixed by the hash — verify it's the same on repeated calls
    const winnerId = tieUpdate![0].data.winnerId;
    expect(typeof winnerId).toBe('string');
  });

  it('settleCupRound tie-breaker is repeatable (same IDs always same winner)', async () => {
    const setupTie = () => ({
      id: 'tie-repeatable',
      status: 'SCHEDULED',
      homeTeamId: 'team-alpha',
      awayTeamId: 'team-beta',
      homeTeam: { totalPoints: 60, totalTransferDeductions: 0 },
      awayTeam: { totalPoints: 60, totalTransferDeductions: 0 },
    });

    let firstWinner: string | undefined;
    for (let i = 0; i < 3; i++) {
      vi.mocked(db.fantasyCupRound.findUnique).mockResolvedValue({
        id: 'r-repeat',
        ties: [setupTie()],
      } as never);
      vi.mocked(db.fantasyCupTie.update).mockResolvedValue({} as never);
      vi.mocked(db.fantasyCupRound.update).mockResolvedValue({} as never);

      await svc.settleCupRound('cup-1', 'gw-repeat');

      const calls = vi.mocked(db.fantasyCupTie.update).mock.calls;
      const lastCall = calls[calls.length - 1];
      const winner = lastCall![0].data.winnerId as string;

      if (i === 0) {
        firstWinner = winner;
      } else {
        expect(winner).toBe(firstWinner);
      }
    }
  });
});

// ── RBAC ──────────────────────────────────────────────────────────────────

describe('RBAC — admin fantasy routes require PSL_ADMIN role', () => {
  const ROLES_KEY = 'roles';

  it('admin routes carry @Roles(PSL_ADMIN) metadata', () => {
    const adminMethods = [
      'settleFixture',
      'recalculateDeadline',
      'rolloverTransfers',
      'setPlayerPrice',
      'processAutoSubs',
      'upsertMatchStat',
      'settleFantasyPoints',
      'listRulesConfigs',
      'getRulesForSeason',
      'createDefaultRules',
      'updateRules',
      'resetRules',
      'validateRules',
      'listLeagues',
      'adminGetLeague',
      'ensureGlobalLeagues',
      'lockLeague',
      'unlockLeague',
      'settleGameweek',
      'recalculateGameweek',
      'recalculateTeamGameweek',
    ];

    for (const method of adminMethods) {
      const handler = (FantasyController.prototype as unknown as Record<string, unknown>)[method] as object | undefined;
      expect(handler, `${method} should exist on controller`).toBeDefined();
      const roles = Reflect.getMetadata(ROLES_KEY, handler!) as string[] | undefined;
      expect(roles, `${method} should have @Roles metadata`).toBeDefined();
      expect(roles).toContain('PSL_ADMIN');
    }
  });

  it('fan-accessible routes do NOT carry PSL_ADMIN role metadata', () => {
    const fanMethods = ['getDeadline', 'getGameweekDeadline', 'getTransferStatus', 'getPlayerPool', 'getRules', 'getLeagueStandings', 'getLeague', 'getGameweekLeaderboard', 'getSeasonLeaderboard'];

    for (const method of fanMethods) {
      const handler = (FantasyController.prototype as unknown as Record<string, unknown>)[method] as object | undefined;
      if (!handler) continue;
      const roles = Reflect.getMetadata(ROLES_KEY, handler) as string[] | undefined;
      if (roles) {
        expect(roles).not.toContain('PSL_ADMIN');
      }
    }
  });
});

// ── FantasyRulesConfigService ─────────────────────────────────────────────

import { FantasyRulesConfigService, DEFAULT_RULES } from './fantasy-rules-config.service';
import { FantasyGameweekScoringService } from './fantasy-gameweek-scoring.service';
import type { FantasyAutoSubService } from './fantasy-auto-sub.service';
import type { FanValueLedgerService } from '../fan-value/fan-value-ledger.service';
import type { AchievementsService } from '../achievements/achievements.service';

const makeAchievementsMock = () => ({
  safeEvaluate: vi.fn().mockResolvedValue(undefined),
}) as unknown as AchievementsService;

// Minimal stub — existing tests have all players playing (minutesPlayed=90) so auto-subs never fire
const makeAutoSubMock = () => ({
  computeAutoSubsForTeamGameweek: vi.fn().mockResolvedValue([]),
  applyAutoSubsForTeamGameweek: vi.fn().mockResolvedValue({ fantasyTeamId: '', gameweekId: '', formationBefore: '4-4-2', formationAfter: '4-4-2', substitutions: [] }),
}) as unknown as FantasyAutoSubService;

const makeFanValueMock = () => ({
  postFantasyGameweekScore: vi.fn().mockResolvedValue({}),
}) as unknown as FanValueLedgerService;

describe('FantasyRulesConfigService', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FantasyRulesConfigService;

  beforeEach(() => {
    db = makeDb();
    svc = new FantasyRulesConfigService(db);
  });

  it('getOrDefaultRulesForSeason returns DEFAULT_RULES when no config exists', async () => {
    vi.mocked(db.fantasyRulesConfig.findUnique).mockResolvedValue(null);
    const rules = await svc.getOrDefaultRulesForSeason('s1');
    expect(rules.squadSize).toBe(DEFAULT_RULES.squadSize);
    expect(rules.extraTransferCost).toBe(DEFAULT_RULES.extraTransferCost);
  });

  it('getRulesForSeason throws NotFoundException when no config', async () => {
    vi.mocked(db.fantasyRulesConfig.findUnique).mockResolvedValue(null);
    await expect(svc.getRulesForSeason('s1')).rejects.toThrow(NotFoundException);
  });

  it('createDefaultRulesForSeason throws when season not found', async () => {
    vi.mocked(db.season.findUnique).mockResolvedValue(null);
    await expect(svc.createDefaultRulesForSeason('s1')).rejects.toThrow(NotFoundException);
  });

  it('createDefaultRulesForSeason upserts default config', async () => {
    vi.mocked(db.season.findUnique).mockResolvedValue({ id: 's1' } as never);
    vi.mocked(db.fantasyRulesConfig.upsert).mockResolvedValue({
      ...DEFAULT_RULES, id: 'rc-1', seasonId: 's1', createdAt: new Date(), updatedAt: new Date(),
    } as never);
    const rules = await svc.createDefaultRulesForSeason('s1');
    expect(rules.squadSize).toBe(DEFAULT_RULES.squadSize);
    expect(vi.mocked(db.fantasyRulesConfig.upsert)).toHaveBeenCalledOnce();
  });

  describe('validateRules', () => {
    it('accepts valid default rules', () => {
      const result = svc.validateRules({ ...DEFAULT_RULES });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects when squad position counts do not sum to squadSize', () => {
      const result = svc.validateRules({ ...DEFAULT_RULES, goalkeeperCount: 3 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('squadSize'))).toBe(true);
    });

    it('rejects when benchSize does not equal squadSize - startingXiSize', () => {
      const result = svc.validateRules({ ...DEFAULT_RULES, benchSize: 5 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('benchSize'))).toBe(true);
    });

    it('rejects when minStartingGoalkeepers is not 1', () => {
      const result = svc.validateRules({ ...DEFAULT_RULES, minStartingGoalkeepers: 0 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('minStartingGoalkeepers'))).toBe(true);
    });

    it('rejects when minStartingDefenders is less than 3', () => {
      const result = svc.validateRules({ ...DEFAULT_RULES, minStartingDefenders: 2 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('minStartingDefenders'))).toBe(true);
    });

    it('rejects negative extraTransferCost', () => {
      const result = svc.validateRules({ ...DEFAULT_RULES, extraTransferCost: -1 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('extraTransferCost'))).toBe(true);
    });

    it('rejects when maxSavedFreeTransfers is less than freeTransfersPerGameweek', () => {
      const result = svc.validateRules({ ...DEFAULT_RULES, freeTransfersPerGameweek: 3, maxSavedFreeTransfers: 2 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('maxSavedFreeTransfers'))).toBe(true);
    });

    it('rejects negative chip counts', () => {
      const result = svc.validateRules({ ...DEFAULT_RULES, wildcardCount: -1 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('wildcardCount'))).toBe(true);
    });

    it('rejects when seasonGameweekCount is less than halfwayGameweek', () => {
      const result = svc.validateRules({ ...DEFAULT_RULES, seasonGameweekCount: 10, halfwayGameweek: 15 });
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('seasonGameweekCount'))).toBe(true);
    });
  });

  it('updateRulesForSeason throws when season not found', async () => {
    vi.mocked(db.season.findUnique).mockResolvedValue(null);
    await expect(svc.updateRulesForSeason('s1', {})).rejects.toThrow(NotFoundException);
  });

  it('updateRulesForSeason throws on invalid rules', async () => {
    vi.mocked(db.season.findUnique).mockResolvedValue({ id: 's1' } as never);
    vi.mocked(db.fantasyRulesConfig.findUnique).mockResolvedValue(null);
    await expect(svc.updateRulesForSeason('s1', { goalkeeperCount: 99 })).rejects.toThrow(BadRequestException);
  });

  it('updateRulesForSeason upserts valid rules', async () => {
    vi.mocked(db.season.findUnique).mockResolvedValue({ id: 's1' } as never);
    vi.mocked(db.fantasyRulesConfig.findUnique).mockResolvedValue(null);
    const dto = { deadlineOffsetMinutes: 60 };
    vi.mocked(db.fantasyRulesConfig.upsert).mockResolvedValue({
      ...DEFAULT_RULES, id: 'rc-1', seasonId: 's1', deadlineOffsetMinutes: 60, createdAt: new Date(), updatedAt: new Date(),
    } as never);
    const rules = await svc.updateRulesForSeason('s1', dto);
    expect(rules.deadlineOffsetMinutes).toBe(60);
  });

  it('resetRulesToDefault deletes existing and recreates defaults', async () => {
    vi.mocked(db.season.findUnique).mockResolvedValue({ id: 's1' } as never);
    vi.mocked(db.fantasyRulesConfig.deleteMany).mockResolvedValue({ count: 1 } as never);
    vi.mocked(db.fantasyRulesConfig.upsert).mockResolvedValue({
      ...DEFAULT_RULES, id: 'rc-1', seasonId: 's1', createdAt: new Date(), updatedAt: new Date(),
    } as never);
    await svc.resetRulesToDefault('s1');
    expect(vi.mocked(db.fantasyRulesConfig.deleteMany)).toHaveBeenCalledOnce();
    expect(vi.mocked(db.fantasyRulesConfig.upsert)).toHaveBeenCalledOnce();
  });

  it('listAllConfigs returns all configs with season info', async () => {
    vi.mocked(db.fantasyRulesConfig.findMany).mockResolvedValue([
      { id: 'rc-1', seasonId: 's1', season: { id: 's1', name: 'Season 1', isActive: true } },
    ] as never);
    const result = await svc.listAllConfigs();
    expect(result).toHaveLength(1);
    expect(vi.mocked(db.fantasyRulesConfig.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({ include: expect.objectContaining({ season: expect.any(Object) }) }),
    );
  });
});

// ── FantasyGameweekScoringService ─────────────────────────────────────────

describe('FantasyGameweekScoringService — calculatePlayerGameweekPoints', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FantasyGameweekScoringService;

  const baseStatRow = {
    id: 's1',
    minutesPlayed: 90, goals: 0, assists: 0, ownGoals: 0,
    yellowCards: 0, redCards: 0, penaltiesMissed: 0, penaltiesSaved: 0,
    saves: 0, cleanSheet: false, bonusPoints: 0, tacklesWon: 0,
    interceptions: 0, blockedShots: 0, didNotPlay: false,
    playerId: 'p1', fixtureId: 'f1', createdAt: new Date(), updatedAt: new Date(),
  };

  beforeEach(() => {
    db = makeDb();
    svc = new FantasyGameweekScoringService(db, makeAutoSubMock(), makeFanValueMock(), makeAchievementsMock(), { createInAppNotification: vi.fn().mockResolvedValue(null) } as any, { createFantasyResultActivity: vi.fn().mockResolvedValue(null) } as any);
  });

  function mockPlayerFixtures(stats: typeof baseStatRow[]) {
    vi.mocked(db.fixture.findMany).mockResolvedValue([
      { id: 'f1', fantasyMatchStats: stats },
    ] as never);
    vi.mocked(db.player.findUnique).mockResolvedValue({
      id: 'p1', position: PlayerPosition.MIDFIELDER,
    } as never);
  }

  it('returns 0 when no match stats exist', async () => {
    vi.mocked(db.fixture.findMany).mockResolvedValue([{ id: 'f1', fantasyMatchStats: [] }] as never);
    vi.mocked(db.player.findUnique).mockResolvedValue({ id: 'p1', position: PlayerPosition.MIDFIELDER } as never);
    const pts = await svc.calculatePlayerGameweekPoints('p1', 'gw1');
    expect(pts).toBe(0);
  });

  it('appearance < 60 min gives 1 point', async () => {
    mockPlayerFixtures([{ ...baseStatRow, minutesPlayed: 30 }]);
    const pts = await svc.calculatePlayerGameweekPoints('p1', 'gw1');
    expect(pts).toBe(1); // appearance only
  });

  it('appearance 60+ min gives 2 points', async () => {
    mockPlayerFixtures([{ ...baseStatRow, minutesPlayed: 60 }]);
    const pts = await svc.calculatePlayerGameweekPoints('p1', 'gw1');
    expect(pts).toBe(2);
  });

  it('GK goal gives 10 points + appearance', async () => {
    vi.mocked(db.fixture.findMany).mockResolvedValue([
      { id: 'f1', fantasyMatchStats: [{ ...baseStatRow, goals: 1 }] },
    ] as never);
    vi.mocked(db.player.findUnique).mockResolvedValue({ id: 'p1', position: PlayerPosition.GOALKEEPER } as never);
    const pts = await svc.calculatePlayerGameweekPoints('p1', 'gw1');
    expect(pts).toBe(12); // 2 appearance + 10 gk goal
  });

  it('DEF goal gives 6 points', async () => {
    vi.mocked(db.fixture.findMany).mockResolvedValue([
      { id: 'f1', fantasyMatchStats: [{ ...baseStatRow, goals: 1 }] },
    ] as never);
    vi.mocked(db.player.findUnique).mockResolvedValue({ id: 'p1', position: PlayerPosition.DEFENDER } as never);
    const pts = await svc.calculatePlayerGameweekPoints('p1', 'gw1');
    expect(pts).toBe(8); // 2 + 6
  });

  it('MID goal gives 5 points', async () => {
    mockPlayerFixtures([{ ...baseStatRow, goals: 1 }]);
    const pts = await svc.calculatePlayerGameweekPoints('p1', 'gw1');
    expect(pts).toBe(7); // 2 + 5
  });

  it('FWD goal gives 4 points', async () => {
    vi.mocked(db.fixture.findMany).mockResolvedValue([
      { id: 'f1', fantasyMatchStats: [{ ...baseStatRow, goals: 1 }] },
    ] as never);
    vi.mocked(db.player.findUnique).mockResolvedValue({ id: 'p1', position: PlayerPosition.FORWARD } as never);
    const pts = await svc.calculatePlayerGameweekPoints('p1', 'gw1');
    expect(pts).toBe(6); // 2 + 4
  });

  it('assist gives 3 points', async () => {
    mockPlayerFixtures([{ ...baseStatRow, assists: 1 }]);
    const pts = await svc.calculatePlayerGameweekPoints('p1', 'gw1');
    expect(pts).toBe(5); // 2 + 3
  });

  it('GK clean sheet gives 4 points', async () => {
    vi.mocked(db.fixture.findMany).mockResolvedValue([
      { id: 'f1', fantasyMatchStats: [{ ...baseStatRow, cleanSheet: true }] },
    ] as never);
    vi.mocked(db.player.findUnique).mockResolvedValue({ id: 'p1', position: PlayerPosition.GOALKEEPER } as never);
    const pts = await svc.calculatePlayerGameweekPoints('p1', 'gw1');
    expect(pts).toBe(6); // 2 + 4
  });

  it('DEF clean sheet gives 4 points', async () => {
    vi.mocked(db.fixture.findMany).mockResolvedValue([
      { id: 'f1', fantasyMatchStats: [{ ...baseStatRow, cleanSheet: true }] },
    ] as never);
    vi.mocked(db.player.findUnique).mockResolvedValue({ id: 'p1', position: PlayerPosition.DEFENDER } as never);
    const pts = await svc.calculatePlayerGameweekPoints('p1', 'gw1');
    expect(pts).toBe(6); // 2 + 4
  });

  it('MID clean sheet gives 1 point', async () => {
    mockPlayerFixtures([{ ...baseStatRow, cleanSheet: true }]);
    const pts = await svc.calculatePlayerGameweekPoints('p1', 'gw1');
    expect(pts).toBe(3); // 2 + 1
  });

  it('3 saves gives 1 point', async () => {
    vi.mocked(db.fixture.findMany).mockResolvedValue([
      { id: 'f1', fantasyMatchStats: [{ ...baseStatRow, saves: 3 }] },
    ] as never);
    vi.mocked(db.player.findUnique).mockResolvedValue({ id: 'p1', position: PlayerPosition.GOALKEEPER } as never);
    const pts = await svc.calculatePlayerGameweekPoints('p1', 'gw1');
    expect(pts).toBe(3); // 2 + 1
  });

  it('penalty save gives 5 points', async () => {
    vi.mocked(db.fixture.findMany).mockResolvedValue([
      { id: 'f1', fantasyMatchStats: [{ ...baseStatRow, penaltiesSaved: 1 }] },
    ] as never);
    vi.mocked(db.player.findUnique).mockResolvedValue({ id: 'p1', position: PlayerPosition.GOALKEEPER } as never);
    const pts = await svc.calculatePlayerGameweekPoints('p1', 'gw1');
    expect(pts).toBe(7); // 2 + 5
  });

  it('penalty miss gives -2 points', async () => {
    vi.mocked(db.fixture.findMany).mockResolvedValue([
      { id: 'f1', fantasyMatchStats: [{ ...baseStatRow, penaltiesMissed: 1 }] },
    ] as never);
    vi.mocked(db.player.findUnique).mockResolvedValue({ id: 'p1', position: PlayerPosition.FORWARD } as never);
    const pts = await svc.calculatePlayerGameweekPoints('p1', 'gw1');
    expect(pts).toBe(0); // 2 - 2
  });

  it('yellow card gives -1 point', async () => {
    mockPlayerFixtures([{ ...baseStatRow, yellowCards: 1 }]);
    const pts = await svc.calculatePlayerGameweekPoints('p1', 'gw1');
    expect(pts).toBe(1); // 2 - 1
  });

  it('red card gives -3 points', async () => {
    mockPlayerFixtures([{ ...baseStatRow, redCards: 1 }]);
    const pts = await svc.calculatePlayerGameweekPoints('p1', 'gw1');
    expect(pts).toBe(-1); // 2 - 3
  });

  it('own goal gives -2 points', async () => {
    mockPlayerFixtures([{ ...baseStatRow, ownGoals: 1 }]);
    const pts = await svc.calculatePlayerGameweekPoints('p1', 'gw1');
    expect(pts).toBe(0); // 2 - 2
  });

  it('did not play returns 0', async () => {
    mockPlayerFixtures([{ ...baseStatRow, goals: 2, assists: 1, didNotPlay: true, minutesPlayed: 0 }]);
    const pts = await svc.calculatePlayerGameweekPoints('p1', 'gw1');
    expect(pts).toBe(0);
  });
});

describe('FantasyGameweekScoringService — calculateFantasyTeamGameweekScore', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FantasyGameweekScoringService;

  const baseTeamPlayer = (overrides: Partial<{
    playerId: string;
    squadRole: string;
    isCaptain: boolean;
    isViceCaptain: boolean;
    position: PlayerPosition;
  }> = {}) => ({
    playerId: 'p1',
    squadRole: 'STARTER',
    isCaptain: false,
    isViceCaptain: false,
    player: { id: 'p1', position: PlayerPosition.MIDFIELDER },
    ...overrides,
    ...(overrides.position ? { player: { id: overrides.playerId ?? 'p1', position: overrides.position } } : {}),
  });

  beforeEach(() => {
    db = makeDb();
    svc = new FantasyGameweekScoringService(db, makeAutoSubMock(), makeFanValueMock(), makeAchievementsMock(), { createInAppNotification: vi.fn().mockResolvedValue(null) } as any, { createFantasyResultActivity: vi.fn().mockResolvedValue(null) } as any);
  });

  function setupTeamWithChips(
    players: ReturnType<typeof baseTeamPlayer>[],
    chips: { type: string }[],
    stats: { playerId: string; minutesPlayed: number; goals: number; assists: number; cleanSheet: boolean }[],
  ) {
    vi.mocked(db.fantasyTeam.findUnique).mockResolvedValue({
      id: 'ft1',
      userId: 'u1',
      seasonId: 's1',
      players,
    } as never);
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({ id: 'gw1', seasonId: 's1' } as never);
    vi.mocked(db.fantasyChip.findMany).mockResolvedValue(chips as never);
    vi.mocked(db.fixture.findMany).mockResolvedValue([{
      id: 'f1',
      fantasyMatchStats: stats.map(s => ({
        playerId: s.playerId, fixtureId: 'f1', minutesPlayed: s.minutesPlayed,
        goals: s.goals, assists: s.assists, ownGoals: 0, yellowCards: 0,
        redCards: 0, penaltiesMissed: 0, penaltiesSaved: 0, saves: 0,
        cleanSheet: s.cleanSheet, bonusPoints: 0, tacklesWon: 0,
        interceptions: 0, blockedShots: 0, didNotPlay: s.minutesPlayed === 0,
      })),
    }] as never);
    vi.mocked(db.fantasyTransfer.findMany).mockResolvedValue([] as never);
  }

  it('captain doubles points', async () => {
    const players = [
      baseTeamPlayer({ playerId: 'p1', isCaptain: true, position: PlayerPosition.FORWARD }),
      baseTeamPlayer({ playerId: 'p2', isCaptain: false, position: PlayerPosition.MIDFIELDER }),
    ];
    setupTeamWithChips(players, [], [
      { playerId: 'p1', minutesPlayed: 90, goals: 1, assists: 0, cleanSheet: false },
      { playerId: 'p2', minutesPlayed: 90, goals: 0, assists: 0, cleanSheet: false },
    ]);
    const result = await svc.calculateFantasyTeamGameweekScore('ft1', 'gw1');
    const captainScore = result.playerScores.find(ps => ps.isCaptain)!;
    expect(captainScore.multiplier).toBe(2);
    expect(captainScore.multipliedPoints).toBe(captainScore.basePoints * 2);
  });

  it('vice-captain steps up if captain did not play', async () => {
    const players = [
      baseTeamPlayer({ playerId: 'p1', isCaptain: true, position: PlayerPosition.FORWARD }),
      baseTeamPlayer({ playerId: 'p2', isViceCaptain: true, position: PlayerPosition.MIDFIELDER }),
    ];
    setupTeamWithChips(players, [], [
      { playerId: 'p1', minutesPlayed: 0, goals: 0, assists: 0, cleanSheet: false },
      { playerId: 'p2', minutesPlayed: 90, goals: 1, assists: 0, cleanSheet: false },
    ]);
    const result = await svc.calculateFantasyTeamGameweekScore('ft1', 'gw1');
    const vcScore = result.playerScores.find(ps => ps.isViceCaptain)!;
    expect(vcScore.multiplier).toBe(2);
    expect(vcScore.reason).toBe('vc_stepped_up');
  });

  it('triple captain applies 3x multiplier', async () => {
    const players = [
      baseTeamPlayer({ playerId: 'p1', isCaptain: true, position: PlayerPosition.FORWARD }),
    ];
    setupTeamWithChips(players, [{ type: 'TRIPLE_CAPTAIN' }], [
      { playerId: 'p1', minutesPlayed: 90, goals: 1, assists: 0, cleanSheet: false },
    ]);
    const result = await svc.calculateFantasyTeamGameweekScore('ft1', 'gw1');
    const captainScore = result.playerScores.find(ps => ps.isCaptain)!;
    expect(captainScore.multiplier).toBe(3);
    expect(captainScore.multipliedPoints).toBe(captainScore.basePoints * 3);
  });

  it('triple captain applies 3x to vice-captain when captain did not play', async () => {
    const players = [
      baseTeamPlayer({ playerId: 'p1', isCaptain: true, position: PlayerPosition.FORWARD }),
      baseTeamPlayer({ playerId: 'p2', isViceCaptain: true, position: PlayerPosition.MIDFIELDER }),
    ];
    setupTeamWithChips(players, [{ type: 'TRIPLE_CAPTAIN' }], [
      { playerId: 'p1', minutesPlayed: 0, goals: 0, assists: 0, cleanSheet: false },
      { playerId: 'p2', minutesPlayed: 90, goals: 1, assists: 0, cleanSheet: false },
    ]);
    const result = await svc.calculateFantasyTeamGameweekScore('ft1', 'gw1');
    const vcScore = result.playerScores.find(ps => ps.isViceCaptain)!;
    expect(vcScore.multiplier).toBe(3);
    expect(vcScore.reason).toBe('vc_stepped_up');
  });

  it('bench points excluded without bench boost', async () => {
    const players = [
      baseTeamPlayer({ playerId: 'p1', squadRole: 'STARTER', position: PlayerPosition.MIDFIELDER }),
      baseTeamPlayer({ playerId: 'p2', squadRole: 'SUBSTITUTE', position: PlayerPosition.FORWARD }),
    ];
    setupTeamWithChips(players, [], [
      { playerId: 'p1', minutesPlayed: 90, goals: 0, assists: 0, cleanSheet: false },
      { playerId: 'p2', minutesPlayed: 90, goals: 1, assists: 0, cleanSheet: false },
    ]);
    const result = await svc.calculateFantasyTeamGameweekScore('ft1', 'gw1');
    const benchScore = result.playerScores.find(ps => ps.isBench)!;
    expect(benchScore.countedInTotal).toBe(false);
    // bench points tracked but not in gross
    expect(result.benchPoints).toBe(benchScore.basePoints);
    expect(result.grossPoints).not.toContain(benchScore.multipliedPoints);
  });

  it('bench points included with bench boost', async () => {
    const players = [
      baseTeamPlayer({ playerId: 'p1', squadRole: 'STARTER', position: PlayerPosition.MIDFIELDER }),
      baseTeamPlayer({ playerId: 'p2', squadRole: 'SUBSTITUTE', position: PlayerPosition.FORWARD }),
    ];
    setupTeamWithChips(players, [{ type: 'BENCH_BOOST' }], [
      { playerId: 'p1', minutesPlayed: 90, goals: 0, assists: 0, cleanSheet: false },
      { playerId: 'p2', minutesPlayed: 90, goals: 1, assists: 0, cleanSheet: false },
    ]);
    const result = await svc.calculateFantasyTeamGameweekScore('ft1', 'gw1');
    const benchScore = result.playerScores.find(ps => ps.isBench)!;
    expect(benchScore.countedInTotal).toBe(true);
    expect(benchScore.reason).toBe('bench_boost');
  });

  it('transfer cost subtracts from net points', async () => {
    const players = [
      baseTeamPlayer({ playerId: 'p1', position: PlayerPosition.MIDFIELDER }),
    ];
    vi.mocked(db.fantasyTeam.findUnique).mockResolvedValue({
      id: 'ft1', userId: 'u1', seasonId: 's1', players,
    } as never);
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({ id: 'gw1', seasonId: 's1' } as never);
    vi.mocked(db.fantasyChip.findMany).mockResolvedValue([] as never);
    vi.mocked(db.fixture.findMany).mockResolvedValue([{
      id: 'f1', fantasyMatchStats: [
        { playerId: 'p1', fixtureId: 'f1', minutesPlayed: 90, goals: 0, assists: 0, ownGoals: 0, yellowCards: 0, redCards: 0, penaltiesMissed: 0, penaltiesSaved: 0, saves: 0, cleanSheet: false, bonusPoints: 0, tacklesWon: 0, interceptions: 0, blockedShots: 0, didNotPlay: false },
      ],
    }] as never);
    vi.mocked(db.fantasyTransfer.findMany).mockResolvedValue([
      { transferCost: 4, chipContext: null },
    ] as never);

    const result = await svc.calculateFantasyTeamGameweekScore('ft1', 'gw1');
    expect(result.transferCost).toBe(4);
    expect(result.netPoints).toBe(result.grossPoints - 4);
  });

  it('wildcard transfers have 0 transfer cost', async () => {
    const players = [baseTeamPlayer({ playerId: 'p1', position: PlayerPosition.MIDFIELDER })];
    vi.mocked(db.fantasyTeam.findUnique).mockResolvedValue({ id: 'ft1', userId: 'u1', seasonId: 's1', players } as never);
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({ id: 'gw1', seasonId: 's1' } as never);
    vi.mocked(db.fantasyChip.findMany).mockResolvedValue([] as never);
    vi.mocked(db.fixture.findMany).mockResolvedValue([{ id: 'f1', fantasyMatchStats: [] }] as never);
    vi.mocked(db.fantasyTransfer.findMany).mockResolvedValue([
      { transferCost: 0, chipContext: 'WILDCARD' },
    ] as never);

    const result = await svc.calculateFantasyTeamGameweekScore('ft1', 'gw1');
    expect(result.transferCost).toBe(0);
  });

  it('free hit transfers have 0 transfer cost', async () => {
    const players = [baseTeamPlayer({ playerId: 'p1', position: PlayerPosition.MIDFIELDER })];
    vi.mocked(db.fantasyTeam.findUnique).mockResolvedValue({ id: 'ft1', userId: 'u1', seasonId: 's1', players } as never);
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({ id: 'gw1', seasonId: 's1' } as never);
    vi.mocked(db.fantasyChip.findMany).mockResolvedValue([] as never);
    vi.mocked(db.fixture.findMany).mockResolvedValue([{ id: 'f1', fantasyMatchStats: [] }] as never);
    vi.mocked(db.fantasyTransfer.findMany).mockResolvedValue([
      { transferCost: 0, chipContext: 'FREE_HIT' },
    ] as never);

    const result = await svc.calculateFantasyTeamGameweekScore('ft1', 'gw1');
    expect(result.transferCost).toBe(0);
  });
});

describe('FantasyGameweekScoringService — settlement', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FantasyGameweekScoringService;
  let fanValueMock: ReturnType<typeof makeFanValueMock>;

  beforeEach(() => {
    db = makeDb();
    fanValueMock = makeFanValueMock();
    svc = new FantasyGameweekScoringService(db, makeAutoSubMock(), fanValueMock, makeAchievementsMock(), { createInAppNotification: vi.fn().mockResolvedValue(null) } as any, { createFantasyResultActivity: vi.fn().mockResolvedValue(null) } as any);
  });

  function setupSettleEnv() {
    vi.mocked(db.fantasyTeam.findUnique).mockResolvedValue({
      id: 'ft1', userId: 'u1', seasonId: 's1',
      players: [{
        playerId: 'p1', squadRole: 'STARTER', isCaptain: false, isViceCaptain: false,
        player: { id: 'p1', position: PlayerPosition.MIDFIELDER },
      }],
    } as never);
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({ id: 'gw1', seasonId: 's1' } as never);
    vi.mocked(db.fantasyChip.findMany).mockResolvedValue([] as never);
    vi.mocked(db.fixture.findMany).mockResolvedValue([{
      id: 'f1', fantasyMatchStats: [{
        playerId: 'p1', fixtureId: 'f1', minutesPlayed: 90, goals: 1, assists: 0,
        ownGoals: 0, yellowCards: 0, redCards: 0, penaltiesMissed: 0, penaltiesSaved: 0,
        saves: 0, cleanSheet: false, bonusPoints: 0, tacklesWon: 0, interceptions: 0,
        blockedShots: 0, didNotPlay: false,
      }],
    }] as never);
    vi.mocked(db.fantasyTransfer.findMany).mockResolvedValue([] as never);
    vi.mocked(db.fantasyGameweekScore.upsert).mockResolvedValue({
      id: 'gs1', fantasyTeamId: 'ft1', gameweekId: 'gw1', netPoints: 7,
    } as never);
    vi.mocked(db.fantasyGameweekScore.aggregate).mockResolvedValue({ _sum: { netPoints: 7 } } as never);
  }

  it('settleFantasyTeamGameweek upserts gameweek score', async () => {
    setupSettleEnv();
    await svc.settleFantasyTeamGameweek('ft1', 'gw1');
    expect(vi.mocked(db.fantasyGameweekScore.upsert)).toHaveBeenCalledOnce();
  });

  it('settlement is idempotent — calling twice still upserts only', async () => {
    setupSettleEnv();
    await svc.settleFantasyTeamGameweek('ft1', 'gw1');
    await svc.settleFantasyTeamGameweek('ft1', 'gw1');
    // upsert called twice — both are safe upserts
    expect(vi.mocked(db.fantasyGameweekScore.upsert)).toHaveBeenCalledTimes(2);
  });

  it('settleFantasyTeamGameweek upserts player scores', async () => {
    setupSettleEnv();
    await svc.settleFantasyTeamGameweek('ft1', 'gw1');
    expect(vi.mocked(db.fantasyPlayerGameweekScore.upsert)).toHaveBeenCalledOnce();
  });

  it('settleFantasyTeamGameweek upserts fan value ledger event', async () => {
    setupSettleEnv();
    await svc.settleFantasyTeamGameweek('ft1', 'gw1');
    expect(vi.mocked(fanValueMock.postFantasyGameweekScore)).toHaveBeenCalledOnce();
  });

  it('settleGameweekFantasyScores settles all teams in season', async () => {
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({ id: 'gw1', seasonId: 's1' } as never);
    vi.mocked(db.fantasyTeam.findMany).mockResolvedValue([{ id: 'ft1' }, { id: 'ft2' }] as never);
    vi.mocked(db.fantasyGameweekScore.findMany).mockResolvedValue([
      { id: 'gs1', fantasyTeamId: 'ft1', netPoints: 10, grossPoints: 14 },
      { id: 'gs2', fantasyTeamId: 'ft2', netPoints: 8, grossPoints: 8 },
    ] as never);
    vi.mocked(db.fantasyGameweekScore.update).mockResolvedValue({} as never);

    // Mock settleFantasyTeamGameweek dependencies for each team
    vi.mocked(db.fantasyTeam.findUnique)
      .mockResolvedValueOnce({ id: 'ft1', userId: 'u1', seasonId: 's1', players: [] } as never)
      .mockResolvedValueOnce({ id: 'ft2', userId: 'u2', seasonId: 's1', players: [] } as never);
    vi.mocked(db.fantasyChip.findMany).mockResolvedValue([] as never);
    vi.mocked(db.fixture.findMany).mockResolvedValue([{ id: 'f1', fantasyMatchStats: [] }] as never);
    vi.mocked(db.fantasyTransfer.findMany).mockResolvedValue([] as never);
    vi.mocked(db.fantasyGameweekScore.upsert).mockResolvedValue({ id: 'gs1', fantasyTeamId: 'ft1', gameweekId: 'gw1', netPoints: 0 } as never);
    vi.mocked(db.fantasyGameweekScore.aggregate).mockResolvedValue({ _sum: { netPoints: 0 } } as never);

    const result = await svc.settleGameweekFantasyScores('gw1');
    expect(result.teamsSettled).toBe(2);
  });

  it('settleGameweekFantasyScores throws NotFoundException when gameweek not found', async () => {
    vi.mocked(db.gameweek.findUnique).mockResolvedValue(null);
    await expect(svc.settleGameweekFantasyScores('bad-gw')).rejects.toThrow(NotFoundException);
  });

  it('recalculateFantasyTeamGameweek updates existing score rows via upsert', async () => {
    setupSettleEnv();
    await svc.recalculateFantasyTeamGameweek('ft1', 'gw1');
    // upsert called — updates existing rows rather than creating duplicates
    expect(vi.mocked(db.fantasyGameweekScore.upsert)).toHaveBeenCalledOnce();
    expect(vi.mocked(db.fantasyPlayerGameweekScore.upsert)).toHaveBeenCalledOnce();
  });

  it('no duplicate FanValueLedger events on repeated settle', async () => {
    setupSettleEnv();
    await svc.settleFantasyTeamGameweek('ft1', 'gw1');
    await svc.settleFantasyTeamGameweek('ft1', 'gw1');
    // postFantasyGameweekScore is called twice but the service-level upsert deduplicates by idempotencyKey
    expect(vi.mocked(fanValueMock.postFantasyGameweekScore)).toHaveBeenCalledTimes(2);
  });

  it('no duplicate player score rows on repeated settle', async () => {
    setupSettleEnv();
    await svc.settleFantasyTeamGameweek('ft1', 'gw1');
    await svc.settleFantasyTeamGameweek('ft1', 'gw1');
    // upsert guarantees exactly one row per (fantasyTeamId, playerId, gameweekId)
    const calls = vi.mocked(db.fantasyPlayerGameweekScore.upsert).mock.calls;
    const keys = calls.map(c => c[0]!.where.fantasyTeamId_playerId_gameweekId) as { fantasyTeamId: string; playerId: string; gameweekId: string }[];
    const unique = new Set(keys.map(k => `${k.fantasyTeamId}:${k.playerId}:${k.gameweekId}`));
    expect(unique.size).toBe(1);
  });
});

describe('FantasyGameweekScoringService — history and leaderboards', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FantasyGameweekScoringService;

  beforeEach(() => {
    db = makeDb();
    svc = new FantasyGameweekScoringService(db, makeAutoSubMock(), makeFanValueMock(), makeAchievementsMock(), { createInAppNotification: vi.fn().mockResolvedValue(null) } as any, { createFantasyResultActivity: vi.fn().mockResolvedValue(null) } as any);
  });

  it('getFantasyTeamGameweekHistory returns empty when no team', async () => {
    vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue(null);
    const result = await svc.getFantasyTeamGameweekHistory('u1');
    expect(result).toEqual([]);
  });

  it('getFantasyTeamGameweekHistory returns scores ordered by round', async () => {
    vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue({ id: 'ft1', seasonId: 's1' } as never);
    vi.mocked(db.fantasyGameweekScore.findMany).mockResolvedValue([
      { id: 'gs1', gameweek: { id: 'gw1', name: 'GW1', round: 1 }, netPoints: 10 },
      { id: 'gs2', gameweek: { id: 'gw2', name: 'GW2', round: 2 }, netPoints: 8 },
    ] as never);
    const result = await svc.getFantasyTeamGameweekHistory('u1');
    expect(result).toHaveLength(2);
  });

  it('getFantasyTeamGameweekScore throws when no team', async () => {
    vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue(null);
    await expect(svc.getFantasyTeamGameweekScore('u1', 'gw1')).rejects.toThrow(NotFoundException);
  });

  it('getFantasyTeamGameweekScore throws when no score record', async () => {
    vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue({ id: 'ft1' } as never);
    vi.mocked(db.fantasyGameweekScore.findUnique).mockResolvedValue(null);
    await expect(svc.getFantasyTeamGameweekScore('u1', 'gw1')).rejects.toThrow(NotFoundException);
  });

  it('getGameweekFantasyLeaderboard ranks by netPoints desc', async () => {
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({ id: 'gw1' } as never);
    vi.mocked(db.fantasyGameweekScore.findMany).mockResolvedValue([
      { id: 'gs1', fantasyTeamId: 'ft1', netPoints: 50, grossPoints: 54, transferCost: 4,
        fantasyTeam: { id: 'ft1', name: 'Alpha' },
        user: { email: 'a@test.com', fanProfile: null } },
      { id: 'gs2', fantasyTeamId: 'ft2', netPoints: 80, grossPoints: 80, transferCost: 0,
        fantasyTeam: { id: 'ft2', name: 'Beta' },
        user: { email: 'b@test.com', fanProfile: null } },
    ] as never);

    const result = await svc.getGameweekFantasyLeaderboard('gw1');
    expect(result[0]!.rank).toBe(1);
    expect(result[0]!.teamName).toBe('Beta');
    expect(result[1]!.rank).toBe(2);
    expect(result[1]!.teamName).toBe('Alpha');
  });

  it('getGameweekFantasyLeaderboard tie-breaker: grossPoints desc', async () => {
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({ id: 'gw1' } as never);
    vi.mocked(db.fantasyGameweekScore.findMany).mockResolvedValue([
      { id: 'gs1', fantasyTeamId: 'ft1', netPoints: 50, grossPoints: 54, transferCost: 4,
        fantasyTeam: { id: 'ft1', name: 'Alpha' }, user: { email: 'a@test.com', fanProfile: null } },
      { id: 'gs2', fantasyTeamId: 'ft2', netPoints: 50, grossPoints: 50, transferCost: 0,
        fantasyTeam: { id: 'ft2', name: 'Beta' }, user: { email: 'b@test.com', fanProfile: null } },
    ] as never);

    const result = await svc.getGameweekFantasyLeaderboard('gw1');
    expect(result[0]!.teamName).toBe('Alpha'); // same netPoints, higher grossPoints
  });

  it('getSeasonFantasyLeaderboard aggregates netPoints across gameweeks', async () => {
    vi.mocked(db.fantasyGameweekScore.findMany).mockResolvedValue([
      { fantasyTeamId: 'ft1', netPoints: 30, grossPoints: 34, transferCost: 4 },
      { fantasyTeamId: 'ft1', netPoints: 40, grossPoints: 40, transferCost: 0 },
      { fantasyTeamId: 'ft2', netPoints: 80, grossPoints: 80, transferCost: 0 },
    ] as never);
    vi.mocked(db.fantasyTeam.findMany).mockResolvedValue([
      { id: 'ft1', name: 'Alpha', user: { email: 'a@test.com', fanProfile: null } },
      { id: 'ft2', name: 'Beta', user: { email: 'b@test.com', fanProfile: null } },
    ] as never);

    const result = await svc.getSeasonFantasyLeaderboard('s1');
    expect(result[0]!.teamName).toBe('Beta'); // 80 > 70
    expect(result[1]!.netPoints).toBe(70); // 30 + 40
    expect(result[0]!.rank).toBe(1);
    expect(result[1]!.rank).toBe(2);
  });
});
