import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { FantasyAutoSubstitutionStatus, FantasySquadRole, PlayerPosition } from '@prisma/client';
import { FantasyAutoSubService } from './fantasy-auto-sub.service';
import { FantasyController } from './fantasy.controller';
import type { PrismaService } from '../prisma/prisma.service';

// ── Helpers ───────────────────────────────────────────────────────────────────

const uuid = () => Math.random().toString(36).slice(2, 18);

function makePlayer(id: string, position: PlayerPosition, name = `Player ${id}`) {
  return { id, position, name };
}

function makeTeamPlayer(
  playerId: string,
  squadRole: FantasySquadRole,
  opts: { benchSlot?: number; isCaptain?: boolean; isViceCaptain?: boolean; position?: PlayerPosition; name?: string } = {},
) {
  const position = opts.position ?? PlayerPosition.MIDFIELDER;
  return {
    id: `slot-${playerId}`,
    playerId,
    squadRole,
    benchSlot: opts.benchSlot ?? null,
    isCaptain: opts.isCaptain ?? false,
    isViceCaptain: opts.isViceCaptain ?? false,
    position,
    player: makePlayer(playerId, position, opts.name ?? `Player ${playerId}`),
  };
}

function makeStat(playerId: string, minutesPlayed: number, fixtureId = 'fix1') {
  return {
    playerId,
    fixtureId,
    minutesPlayed,
    didNotPlay: minutesPlayed === 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ── Mock DB factory ───────────────────────────────────────────────────────────

const makeDb = () =>
  ({
    fantasyTeam: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn() },
    gameweek: { findUnique: vi.fn() },
    fixture: { findMany: vi.fn() },
    fantasyPlayerMatchStat: { findMany: vi.fn() },
    fantasyRulesConfig: { findUnique: vi.fn() },
    fantasyAutoSubstitution: {
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
    fantasyGameweekLineupSnapshot: { upsert: vi.fn(), findUnique: vi.fn() },
    player: { findMany: vi.fn() },
  }) as unknown as PrismaService;

// ── Standard test squad: 4-4-2 formation ─────────────────────────────────────
// Starters: GK, 4 DEF, 4 MID, 2 FWD
// Bench: 1 GK (slot 0), 1 DEF (slot 1), 1 MID (slot 2), 1 FWD (slot 3)

function buildSquad442() {
  const gkS = makeTeamPlayer('gk1', FantasySquadRole.STARTER, { position: PlayerPosition.GOALKEEPER, isCaptain: true });
  const d1 = makeTeamPlayer('d1', FantasySquadRole.STARTER, { position: PlayerPosition.DEFENDER });
  const d2 = makeTeamPlayer('d2', FantasySquadRole.STARTER, { position: PlayerPosition.DEFENDER });
  const d3 = makeTeamPlayer('d3', FantasySquadRole.STARTER, { position: PlayerPosition.DEFENDER });
  const d4 = makeTeamPlayer('d4', FantasySquadRole.STARTER, { position: PlayerPosition.DEFENDER });
  const m1 = makeTeamPlayer('m1', FantasySquadRole.STARTER, { position: PlayerPosition.MIDFIELDER });
  const m2 = makeTeamPlayer('m2', FantasySquadRole.STARTER, { position: PlayerPosition.MIDFIELDER, isViceCaptain: true });
  const m3 = makeTeamPlayer('m3', FantasySquadRole.STARTER, { position: PlayerPosition.MIDFIELDER });
  const m4 = makeTeamPlayer('m4', FantasySquadRole.STARTER, { position: PlayerPosition.MIDFIELDER });
  const f1 = makeTeamPlayer('f1', FantasySquadRole.STARTER, { position: PlayerPosition.FORWARD });
  const f2 = makeTeamPlayer('f2', FantasySquadRole.STARTER, { position: PlayerPosition.FORWARD });
  // Bench
  const gkB = makeTeamPlayer('gk2', FantasySquadRole.SUBSTITUTE, { position: PlayerPosition.GOALKEEPER, benchSlot: 0 });
  const dB = makeTeamPlayer('dB', FantasySquadRole.SUBSTITUTE, { position: PlayerPosition.DEFENDER, benchSlot: 1 });
  const mB = makeTeamPlayer('mB', FantasySquadRole.SUBSTITUTE, { position: PlayerPosition.MIDFIELDER, benchSlot: 2 });
  const fB = makeTeamPlayer('fB', FantasySquadRole.SUBSTITUTE, { position: PlayerPosition.FORWARD, benchSlot: 3 });
  return [gkS, d1, d2, d3, d4, m1, m2, m3, m4, f1, f2, gkB, dB, mB, fB];
}

function mockTeam(db: ReturnType<typeof makeDb>, players: ReturnType<typeof makeTeamPlayer>[], opts: { teamId?: string; userId?: string; seasonId?: string } = {}) {
  const teamId = opts.teamId ?? 'ft1';
  const userId = opts.userId ?? 'u1';
  const seasonId = opts.seasonId ?? 's1';
  vi.mocked(db.fantasyTeam.findUnique).mockResolvedValue({
    id: teamId, userId, seasonId, players,
  } as never);
  vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue({
    id: teamId, userId, seasonId, players,
  } as never);
  vi.mocked(db.gameweek.findUnique).mockResolvedValue({ id: 'gw1', seasonId } as never);
  vi.mocked(db.fixture.findMany).mockResolvedValue([{ id: 'fix1' }] as never);
  vi.mocked(db.fantasyRulesConfig.findUnique).mockResolvedValue(null as never); // uses DEFAULT_RULES
  vi.mocked(db.fantasyAutoSubstitution.upsert).mockResolvedValue({} as never);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('FantasyAutoSubService — computeAutoSubsForTeamGameweek', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FantasyAutoSubService;

  beforeEach(() => {
    db = makeDb();
    svc = new FantasyAutoSubService(db as unknown as PrismaService);
    vi.resetAllMocks();
    db = makeDb();
    svc = new FantasyAutoSubService(db as unknown as PrismaService);
  });

  // ── SKIPPED_STARTER_PLAYED ────────────────────────────────────────────────

  it('emits no records when all starters played', async () => {
    const squad = buildSquad442();
    mockTeam(db, squad);
    const allPlayed = squad.map(p => makeStat(p.playerId, 90));
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(allPlayed as never);

    const result = await svc.computeAutoSubsForTeamGameweek('ft1', 'gw1');
    expect(result).toHaveLength(0);
  });

  // ── Played detection ──────────────────────────────────────────────────────

  it('minutesPlayed > 0 means played', async () => {
    const squad = buildSquad442();
    mockTeam(db, squad);
    const stats = squad.map(p => makeStat(p.playerId, 1));
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(stats as never);
    const result = await svc.computeAutoSubsForTeamGameweek('ft1', 'gw1');
    expect(result).toHaveLength(0); // all played, no subs
  });

  it('minutesPlayed = 0 means did not play', async () => {
    const squad = buildSquad442();
    mockTeam(db, squad);
    // f2 didn't play, fB played
    const stats = squad
      .filter(p => p.playerId !== 'f2')
      .map(p => makeStat(p.playerId, 90));
    stats.push(makeStat('f2', 0));
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(stats as never);

    const result = await svc.computeAutoSubsForTeamGameweek('ft1', 'gw1');
    const applied = result.filter(s => s.status === FantasyAutoSubstitutionStatus.APPLIED);
    expect(applied).toHaveLength(1);
    expect(applied[0]!.outPlayerId).toBe('f2');
  });

  // ── Goalkeeper substitution ───────────────────────────────────────────────

  it('non-playing starter GK is replaced by bench GK who played', async () => {
    const squad = buildSquad442();
    mockTeam(db, squad);
    const stats = squad.filter(p => p.playerId !== 'gk1').map(p => makeStat(p.playerId, 90));
    stats.push(makeStat('gk1', 0));
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(stats as never);

    const result = await svc.computeAutoSubsForTeamGameweek('ft1', 'gw1');
    const applied = result.find(s => s.status === FantasyAutoSubstitutionStatus.APPLIED);
    expect(applied).toBeDefined();
    expect(applied!.outPlayerId).toBe('gk1');
    expect(applied!.inPlayerId).toBe('gk2');
  });

  it('starter GK not replaced by outfield player', async () => {
    const squad = buildSquad442().map(p =>
      p.playerId === 'gk2' ? makeTeamPlayer('gk2', FantasySquadRole.SUBSTITUTE, { position: PlayerPosition.MIDFIELDER, benchSlot: 0 }) : p,
    );
    mockTeam(db, squad);
    const stats = squad.filter(p => p.playerId !== 'gk1').map(p => makeStat(p.playerId, 90));
    stats.push(makeStat('gk1', 0));
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(stats as never);

    const result = await svc.computeAutoSubsForTeamGameweek('ft1', 'gw1');
    const gkRecord = result.find(s => s.outPlayerId === 'gk1');
    expect(gkRecord).toBeDefined();
    expect(gkRecord!.status).toBe(FantasyAutoSubstitutionStatus.SKIPPED_GOALKEEPER_ONLY);
    expect(gkRecord!.inPlayerId).toBeNull();
  });

  it('no GK sub if bench GK did not play', async () => {
    const squad = buildSquad442();
    mockTeam(db, squad);
    const stats = squad
      .filter(p => p.playerId !== 'gk1' && p.playerId !== 'gk2')
      .map(p => makeStat(p.playerId, 90));
    stats.push(makeStat('gk1', 0));
    stats.push(makeStat('gk2', 0));
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(stats as never);

    const result = await svc.computeAutoSubsForTeamGameweek('ft1', 'gw1');
    const gkRecord = result.find(s => s.outPlayerId === 'gk1');
    expect(gkRecord!.status).toBe(FantasyAutoSubstitutionStatus.SKIPPED_BENCH_PLAYER_DID_NOT_PLAY);
  });

  // ── Outfield substitution ─────────────────────────────────────────────────

  it('non-playing DEF replaced by first eligible outfield bench player who played', async () => {
    const squad = buildSquad442();
    mockTeam(db, squad);
    const stats = squad.filter(p => p.playerId !== 'd1').map(p => makeStat(p.playerId, 90));
    stats.push(makeStat('d1', 0));
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(stats as never);

    const result = await svc.computeAutoSubsForTeamGameweek('ft1', 'gw1');
    const applied = result.find(s => s.status === FantasyAutoSubstitutionStatus.APPLIED);
    expect(applied!.outPlayerId).toBe('d1');
    expect(applied!.inPlayerId).toBe('dB'); // bench slot 1, first outfield bench player
  });

  it('non-playing MID replaced by eligible bench player', async () => {
    const squad = buildSquad442();
    mockTeam(db, squad);
    const stats = squad.filter(p => p.playerId !== 'm1').map(p => makeStat(p.playerId, 90));
    stats.push(makeStat('m1', 0));
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(stats as never);

    const result = await svc.computeAutoSubsForTeamGameweek('ft1', 'gw1');
    const applied = result.find(s => s.status === FantasyAutoSubstitutionStatus.APPLIED);
    expect(applied!.outPlayerId).toBe('m1');
    expect(['dB', 'mB', 'fB']).toContain(applied!.inPlayerId);
  });

  it('non-playing FWD replaced by eligible bench player', async () => {
    const squad = buildSquad442();
    mockTeam(db, squad);
    const stats = squad.filter(p => p.playerId !== 'f1').map(p => makeStat(p.playerId, 90));
    stats.push(makeStat('f1', 0));
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(stats as never);

    const result = await svc.computeAutoSubsForTeamGameweek('ft1', 'gw1');
    const applied = result.find(s => s.status === FantasyAutoSubstitutionStatus.APPLIED);
    expect(applied!.outPlayerId).toBe('f1');
    expect(applied!.inPlayerId).not.toBeNull();
  });

  it('skips if bench player did not play', async () => {
    const squad = buildSquad442();
    mockTeam(db, squad);
    // d1 didn't play; all bench players didn't play either
    const stats = squad
      .filter(p => p.squadRole === FantasySquadRole.STARTER && p.playerId !== 'd1')
      .map(p => makeStat(p.playerId, 90));
    stats.push(makeStat('d1', 0));
    // bench players: 0 minutes
    stats.push(makeStat('gk2', 0));
    stats.push(makeStat('dB', 0));
    stats.push(makeStat('mB', 0));
    stats.push(makeStat('fB', 0));
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(stats as never);

    const result = await svc.computeAutoSubsForTeamGameweek('ft1', 'gw1');
    const rec = result.find(s => s.outPlayerId === 'd1');
    expect(rec!.status).toBe(FantasyAutoSubstitutionStatus.SKIPPED_BENCH_PLAYER_DID_NOT_PLAY);
    expect(rec!.inPlayerId).toBeNull();
  });

  // ── Formation rules ───────────────────────────────────────────────────────

  it('maintains minimum defenders — skips if sub would break formation', async () => {
    // Formation: 3-4-3. Replacing a DEF with a FWD would go to 2-4-4 — invalid (min 3 DEF)
    // Squad: 1GK, 3DEF, 4MID, 3FWD starters; bench: 1GK, 0DEF, 1MID, 1FWD
    const gkS = makeTeamPlayer('gk1', FantasySquadRole.STARTER, { position: PlayerPosition.GOALKEEPER });
    const d1 = makeTeamPlayer('d1', FantasySquadRole.STARTER, { position: PlayerPosition.DEFENDER });
    const d2 = makeTeamPlayer('d2', FantasySquadRole.STARTER, { position: PlayerPosition.DEFENDER });
    const d3 = makeTeamPlayer('d3', FantasySquadRole.STARTER, { position: PlayerPosition.DEFENDER });
    const m1 = makeTeamPlayer('m1', FantasySquadRole.STARTER, { position: PlayerPosition.MIDFIELDER });
    const m2 = makeTeamPlayer('m2', FantasySquadRole.STARTER, { position: PlayerPosition.MIDFIELDER });
    const m3 = makeTeamPlayer('m3', FantasySquadRole.STARTER, { position: PlayerPosition.MIDFIELDER });
    const m4 = makeTeamPlayer('m4', FantasySquadRole.STARTER, { position: PlayerPosition.MIDFIELDER });
    const f1 = makeTeamPlayer('f1', FantasySquadRole.STARTER, { position: PlayerPosition.FORWARD });
    const f2 = makeTeamPlayer('f2', FantasySquadRole.STARTER, { position: PlayerPosition.FORWARD });
    const f3 = makeTeamPlayer('f3', FantasySquadRole.STARTER, { position: PlayerPosition.FORWARD });
    // Bench — no DEF bench player available
    const gkB = makeTeamPlayer('gk2', FantasySquadRole.SUBSTITUTE, { position: PlayerPosition.GOALKEEPER, benchSlot: 0 });
    const mB = makeTeamPlayer('mB', FantasySquadRole.SUBSTITUTE, { position: PlayerPosition.MIDFIELDER, benchSlot: 1 });
    const fB1 = makeTeamPlayer('fB1', FantasySquadRole.SUBSTITUTE, { position: PlayerPosition.FORWARD, benchSlot: 2 });
    const fB2 = makeTeamPlayer('fB2', FantasySquadRole.SUBSTITUTE, { position: PlayerPosition.FORWARD, benchSlot: 3 });

    const squad = [gkS, d1, d2, d3, m1, m2, m3, m4, f1, f2, f3, gkB, mB, fB1, fB2];
    mockTeam(db, squad);
    // d1 didn't play; bench options: mB (MID), fB1 (FWD), fB2 (FWD) all played
    // But adding a MID → 3DEF-5MID-3FWD = valid? 5MID valid? Min MID is 2, max not explicitly set, XI size = 11. 1+3+5+3=12 ≠ 11. That's wrong.
    // Actually with 1GK+3DEF+4MID+3FWD = 11 starting. Removing d1 and adding mB → 1+2+5+3=11. Min DEF = 3. 2 < 3 → INVALID.
    // Adding fB1 → 1+2+4+4=11. Min DEF = 3. 2 < 3 → INVALID.
    const stats = squad
      .filter(p => p.playerId !== 'd1')
      .map(p => makeStat(p.playerId, 90));
    stats.push(makeStat('d1', 0));
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(stats as never);

    const result = await svc.computeAutoSubsForTeamGameweek('ft1', 'gw1');
    const rec = result.find(s => s.outPlayerId === 'd1');
    expect(rec!.status).toBe(FantasyAutoSubstitutionStatus.SKIPPED_FORMATION_INVALID);
    expect(rec!.inPlayerId).toBeNull();
  });

  it('maintains minimum midfielders', async () => {
    // Removing a mid where only forward bench players are available would break min 2 mid
    // Starting: 1GK 5DEF 2MID 3FWD — bench: GK, no MID, 2FWD
    const squad = [
      makeTeamPlayer('gk1', FantasySquadRole.STARTER, { position: PlayerPosition.GOALKEEPER }),
      makeTeamPlayer('d1', FantasySquadRole.STARTER, { position: PlayerPosition.DEFENDER }),
      makeTeamPlayer('d2', FantasySquadRole.STARTER, { position: PlayerPosition.DEFENDER }),
      makeTeamPlayer('d3', FantasySquadRole.STARTER, { position: PlayerPosition.DEFENDER }),
      makeTeamPlayer('d4', FantasySquadRole.STARTER, { position: PlayerPosition.DEFENDER }),
      makeTeamPlayer('d5', FantasySquadRole.STARTER, { position: PlayerPosition.DEFENDER }),
      makeTeamPlayer('m1', FantasySquadRole.STARTER, { position: PlayerPosition.MIDFIELDER }),
      makeTeamPlayer('m2', FantasySquadRole.STARTER, { position: PlayerPosition.MIDFIELDER }),
      makeTeamPlayer('f1', FantasySquadRole.STARTER, { position: PlayerPosition.FORWARD }),
      makeTeamPlayer('f2', FantasySquadRole.STARTER, { position: PlayerPosition.FORWARD }),
      makeTeamPlayer('f3', FantasySquadRole.STARTER, { position: PlayerPosition.FORWARD }),
      makeTeamPlayer('gk2', FantasySquadRole.SUBSTITUTE, { position: PlayerPosition.GOALKEEPER, benchSlot: 0 }),
      makeTeamPlayer('fB1', FantasySquadRole.SUBSTITUTE, { position: PlayerPosition.FORWARD, benchSlot: 1 }),
      makeTeamPlayer('fB2', FantasySquadRole.SUBSTITUTE, { position: PlayerPosition.FORWARD, benchSlot: 2 }),
      makeTeamPlayer('dB', FantasySquadRole.SUBSTITUTE, { position: PlayerPosition.DEFENDER, benchSlot: 3 }),
    ];
    mockTeam(db, squad);
    // m1 didn't play; bench: fB1, fB2, dB all played. Adding fwd → 1+5+1+4=11 but min mid=2 violated
    // Adding dB → 1+6+1+3=11, min mid=2 still violated (only 1 mid)
    const stats = squad.filter(p => p.playerId !== 'm1').map(p => makeStat(p.playerId, 90));
    stats.push(makeStat('m1', 0));
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(stats as never);

    const result = await svc.computeAutoSubsForTeamGameweek('ft1', 'gw1');
    const rec = result.find(s => s.outPlayerId === 'm1');
    expect(rec!.status).toBe(FantasyAutoSubstitutionStatus.SKIPPED_FORMATION_INVALID);
  });

  it('maintains exactly one goalkeeper', async () => {
    // Replacing GK out with an outfield player would give 0 GKs → invalid
    const squad = buildSquad442().map(p =>
      p.playerId === 'gk2' ? makeTeamPlayer('gk2', FantasySquadRole.SUBSTITUTE, { position: PlayerPosition.MIDFIELDER, benchSlot: 0 }) : p,
    );
    mockTeam(db, squad);
    const stats = squad.filter(p => p.playerId !== 'gk1').map(p => makeStat(p.playerId, 90));
    stats.push(makeStat('gk1', 0));
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(stats as never);

    const result = await svc.computeAutoSubsForTeamGameweek('ft1', 'gw1');
    const rec = result.find(s => s.outPlayerId === 'gk1');
    expect(rec!.status).toBe(FantasyAutoSubstitutionStatus.SKIPPED_GOALKEEPER_ONLY);
  });

  it('maintains starting XI size (does not substitute if bench exhausted)', async () => {
    const squad = buildSquad442();
    mockTeam(db, squad);
    // Both forwards didn't play, bench exhausted after first sub
    const stats = squad
      .filter(p => p.playerId !== 'f1' && p.playerId !== 'f2')
      .map(p => makeStat(p.playerId, 90));
    stats.push(makeStat('f1', 0));
    stats.push(makeStat('f2', 0));
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(stats as never);

    const result = await svc.computeAutoSubsForTeamGameweek('ft1', 'gw1');
    const applied = result.filter(s => s.status === FantasyAutoSubstitutionStatus.APPLIED);
    // At most 3 outfield bench players available (dB, mB, fB)
    expect(applied.length).toBeLessThanOrEqual(2);
  });

  // ── Bench priority order ──────────────────────────────────────────────────

  it('respects bench priority order — lower benchSlot substituted first', async () => {
    const squad = buildSquad442();
    mockTeam(db, squad);
    // Both d1 and f1 didn't play. Bench: dB (slot1), mB (slot2), fB (slot3)
    const stats = squad
      .filter(p => p.playerId !== 'd1' && p.playerId !== 'f1')
      .map(p => makeStat(p.playerId, 90));
    stats.push(makeStat('d1', 0));
    stats.push(makeStat('f1', 0));
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(stats as never);

    const result = await svc.computeAutoSubsForTeamGameweek('ft1', 'gw1');
    const applied = result.filter(s => s.status === FantasyAutoSubstitutionStatus.APPLIED);
    expect(applied).toHaveLength(2);
    // dB (slot 1) should be first substitution
    const sub1 = applied.find(s => s.outPlayerId === 'd1');
    const sub2 = applied.find(s => s.outPlayerId === 'f1');
    expect(sub1).toBeDefined();
    expect(sub2).toBeDefined();
    // dB has lowest outfield slot, so it goes first
    expect(sub1!.inPlayerId).toBe('dB');
  });

  // ── Formation strings ─────────────────────────────────────────────────────

  it('includes formationBefore and formationAfter in applied sub', async () => {
    const squad = buildSquad442();
    mockTeam(db, squad);
    const stats = squad.filter(p => p.playerId !== 'f1').map(p => makeStat(p.playerId, 90));
    stats.push(makeStat('f1', 0));
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(stats as never);

    const result = await svc.computeAutoSubsForTeamGameweek('ft1', 'gw1');
    const applied = result.find(s => s.status === FantasyAutoSubstitutionStatus.APPLIED);
    expect(applied!.formationBefore).toBeTruthy();
    expect(applied!.formationAfter).toBeTruthy();
    // formationBefore for 4-4-2 is "4-4-2"
    expect(applied!.formationBefore).toBe('4-4-2');
  });

  // ── RBAC metadata ─────────────────────────────────────────────────────────

  it('admin auto-sub routes require PSL_ADMIN role', () => {
    const roles = (method: string) => {
      const ctrl = FantasyController.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(ctrl, method);
      return Reflect.getMetadata('roles', descriptor?.value ?? ctrl[method as keyof typeof ctrl]);
    };
    expect(roles('applyAutoSubsForGameweek')).toEqual(['PSL_ADMIN']);
    expect(roles('recalculateTeamAutoSubs')).toEqual(['PSL_ADMIN']);
    expect(roles('adminGetAutoSubsForGameweek')).toEqual(['PSL_ADMIN']);
  });

  it('fan auto-sub routes do not require PSL_ADMIN role', () => {
    const ctrl = FantasyController.prototype;
    const getFinalXiDesc = Object.getOwnPropertyDescriptor(ctrl, 'getFinalXi');
    const adminRoles = Reflect.getMetadata('roles', getFinalXiDesc?.value);
    expect(adminRoles).toBeUndefined();
  });
});

// ── applyAutoSubsForTeamGameweek (DB persistence) ─────────────────────────────

describe('FantasyAutoSubService — applyAutoSubsForTeamGameweek', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FantasyAutoSubService;

  beforeEach(() => {
    db = makeDb();
    svc = new FantasyAutoSubService(db as unknown as PrismaService);
    vi.resetAllMocks();
    db = makeDb();
    svc = new FantasyAutoSubService(db as unknown as PrismaService);
  });

  it('upserts auto-sub rows idempotently', async () => {
    const squad = buildSquad442();
    mockTeam(db, squad);
    const stats = squad.filter(p => p.playerId !== 'f1').map(p => makeStat(p.playerId, 90));
    stats.push(makeStat('f1', 0));
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(stats as never);
    vi.mocked(db.fantasyAutoSubstitution.upsert).mockResolvedValue({} as never);

    const result = await svc.applyAutoSubsForTeamGameweek('ft1', 'gw1');
    expect(result.fantasyTeamId).toBe('ft1');
    expect(result.gameweekId).toBe('gw1');
    expect(result.substitutions.length).toBeGreaterThan(0);
    // Should have called upsert for the applied substitution
    expect(vi.mocked(db.fantasyAutoSubstitution.upsert)).toHaveBeenCalled();
  });

  it('running twice does not duplicate rows (upsert pattern)', async () => {
    const squad = buildSquad442();
    mockTeam(db, squad);
    const stats = squad.filter(p => p.playerId !== 'f1').map(p => makeStat(p.playerId, 90));
    stats.push(makeStat('f1', 0));
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(stats as never);
    vi.mocked(db.fantasyAutoSubstitution.upsert).mockResolvedValue({} as never);

    await svc.applyAutoSubsForTeamGameweek('ft1', 'gw1');
    const firstCallCount = vi.mocked(db.fantasyAutoSubstitution.upsert).mock.calls.length;

    // Reset team mock for second run
    mockTeam(db, squad);
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(stats as never);
    await svc.applyAutoSubsForTeamGameweek('ft1', 'gw1');
    const secondCallCount = vi.mocked(db.fantasyAutoSubstitution.upsert).mock.calls.length - firstCallCount;

    // Both runs call upsert the same number of times (idempotent pattern)
    expect(secondCallCount).toBe(firstCallCount);
  });

  it('throws NotFoundException for missing team', async () => {
    vi.mocked(db.fantasyTeam.findUnique).mockResolvedValue(null as never);
    await expect(svc.applyAutoSubsForTeamGameweek('missing', 'gw1')).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException for missing gameweek', async () => {
    const squad = buildSquad442();
    vi.mocked(db.fantasyTeam.findUnique).mockResolvedValue({ id: 'ft1', userId: 'u1', seasonId: 's1', players: squad } as never);
    vi.mocked(db.gameweek.findUnique).mockResolvedValue(null as never);
    await expect(svc.applyAutoSubsForTeamGameweek('ft1', 'missing-gw')).rejects.toThrow(NotFoundException);
  });
});

// ── applyAutoSubsForGameweek ──────────────────────────────────────────────────

describe('FantasyAutoSubService — applyAutoSubsForGameweek', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FantasyAutoSubService;

  beforeEach(() => {
    db = makeDb();
    svc = new FantasyAutoSubService(db as unknown as PrismaService);
    vi.resetAllMocks();
    db = makeDb();
    svc = new FantasyAutoSubService(db as unknown as PrismaService);
  });

  it('processes all teams in season', async () => {
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({ id: 'gw1', seasonId: 's1' } as never);
    vi.mocked(db.fantasyTeam.findMany).mockResolvedValue([
      { id: 'ft1' },
      { id: 'ft2' },
    ] as never);

    const squad = buildSquad442();
    vi.mocked(db.fantasyTeam.findUnique).mockResolvedValue({ id: 'ft1', userId: 'u1', seasonId: 's1', players: squad } as never);
    vi.mocked(db.fixture.findMany).mockResolvedValue([{ id: 'fix1' }] as never);
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(squad.map(p => makeStat(p.playerId, 90)) as never);
    vi.mocked(db.fantasyRulesConfig.findUnique).mockResolvedValue(null as never);
    vi.mocked(db.fantasyAutoSubstitution.upsert).mockResolvedValue({} as never);

    const result = await svc.applyAutoSubsForGameweek('gw1');
    expect(result.gameweekId).toBe('gw1');
    expect(result.teamsProcessed).toBeGreaterThan(0);
    expect(result.errors).toHaveLength(0);
  });

  it('records errors per team without aborting the whole run', async () => {
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({ id: 'gw1', seasonId: 's1' } as never);
    vi.mocked(db.fantasyTeam.findMany).mockResolvedValue([{ id: 'ft-bad' }] as never);
    vi.mocked(db.fantasyTeam.findUnique).mockResolvedValue(null as never); // triggers NotFoundException

    const result = await svc.applyAutoSubsForGameweek('gw1');
    expect(result.errors).toHaveLength(1);
    expect(result.teamsProcessed).toBe(0);
  });
});

// ── getFinalCountedPlayers ────────────────────────────────────────────────────

describe('FantasyAutoSubService — getFinalCountedPlayers', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FantasyAutoSubService;

  beforeEach(() => {
    db = makeDb();
    svc = new FantasyAutoSubService(db as unknown as PrismaService);
    vi.resetAllMocks();
    db = makeDb();
    svc = new FantasyAutoSubService(db as unknown as PrismaService);
  });

  it('starter who played is countedInTotal', async () => {
    const squad = buildSquad442();
    vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue({ id: 'ft1', userId: 'u1', seasonId: 's1', players: squad } as never);
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({ id: 'gw1', seasonId: 's1' } as never);
    vi.mocked(db.fixture.findMany).mockResolvedValue([{ id: 'fix1' }] as never);
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(squad.map(p => makeStat(p.playerId, 90)) as never);
    vi.mocked(db.fantasyAutoSubstitution.findMany).mockResolvedValue([] as never);

    const result = await svc.getFinalCountedPlayers('u1', 'gw1');
    const gkS = result.players.find(p => p.playerId === 'gk1');
    expect(gkS!.countedInTotal).toBe(true);
    expect(gkS!.reason).toBe('starter');
  });

  it('auto-subbed-in player is countedInTotal with reason auto_sub_in', async () => {
    const squad = buildSquad442();
    vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue({ id: 'ft1', userId: 'u1', seasonId: 's1', players: squad } as never);
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({ id: 'gw1', seasonId: 's1' } as never);
    vi.mocked(db.fixture.findMany).mockResolvedValue([{ id: 'fix1' }] as never);
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(squad.map(p => makeStat(p.playerId, 90)) as never);
    vi.mocked(db.fantasyAutoSubstitution.findMany).mockResolvedValue([
      {
        status: FantasyAutoSubstitutionStatus.APPLIED,
        outPlayerId: 'f1',
        inPlayerId: 'fB',
        fantasyTeamId: 'ft1',
        gameweekId: 'gw1',
      },
    ] as never);

    const result = await svc.getFinalCountedPlayers('u1', 'gw1');
    const inPlayer = result.players.find(p => p.playerId === 'fB');
    expect(inPlayer!.countedInTotal).toBe(true);
    expect(inPlayer!.reason).toBe('auto_sub_in');
    expect(inPlayer!.originalRole).toBe('SUBSTITUTE');
    expect(inPlayer!.finalRole).toBe('STARTER');
  });

  it('auto-subbed-out starter is not countedInTotal with reason auto_sub_out', async () => {
    const squad = buildSquad442();
    vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue({ id: 'ft1', userId: 'u1', seasonId: 's1', players: squad } as never);
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({ id: 'gw1', seasonId: 's1' } as never);
    vi.mocked(db.fixture.findMany).mockResolvedValue([{ id: 'fix1' }] as never);
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(squad.map(p => makeStat(p.playerId, 90)) as never);
    vi.mocked(db.fantasyAutoSubstitution.findMany).mockResolvedValue([
      {
        status: FantasyAutoSubstitutionStatus.APPLIED,
        outPlayerId: 'f1',
        inPlayerId: 'fB',
        fantasyTeamId: 'ft1',
        gameweekId: 'gw1',
      },
    ] as never);

    const result = await svc.getFinalCountedPlayers('u1', 'gw1');
    const outPlayer = result.players.find(p => p.playerId === 'f1');
    expect(outPlayer!.countedInTotal).toBe(false);
    expect(outPlayer!.reason).toBe('auto_sub_out');
    expect(outPlayer!.finalRole).toBe('SUBSTITUTE');
  });

  it('bench player not auto-subbed-in is not countedInTotal', async () => {
    const squad = buildSquad442();
    vi.mocked(db.fantasyTeam.findFirst).mockResolvedValue({ id: 'ft1', userId: 'u1', seasonId: 's1', players: squad } as never);
    vi.mocked(db.gameweek.findUnique).mockResolvedValue({ id: 'gw1', seasonId: 's1' } as never);
    vi.mocked(db.fixture.findMany).mockResolvedValue([{ id: 'fix1' }] as never);
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue(squad.map(p => makeStat(p.playerId, 90)) as never);
    vi.mocked(db.fantasyAutoSubstitution.findMany).mockResolvedValue([] as never);

    const result = await svc.getFinalCountedPlayers('u1', 'gw1');
    const benchPlayer = result.players.find(p => p.playerId === 'mB');
    expect(benchPlayer!.countedInTotal).toBe(false);
    expect(benchPlayer!.reason).toBe('bench_not_counted');
  });
});

// ── getPlayedStatus ───────────────────────────────────────────────────────────

describe('FantasyAutoSubService — getPlayedStatus', () => {
  let db: ReturnType<typeof makeDb>;
  let svc: FantasyAutoSubService;

  beforeEach(() => {
    db = makeDb();
    svc = new FantasyAutoSubService(db as unknown as PrismaService);
    vi.resetAllMocks();
    db = makeDb();
    svc = new FantasyAutoSubService(db as unknown as PrismaService);
  });

  it('returns true when minutesPlayed > 0 and didNotPlay = false', async () => {
    vi.mocked(db.fixture.findMany).mockResolvedValue([{ id: 'fix1' }] as never);
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue([
      makeStat('p1', 45),
    ] as never);
    expect(await svc.getPlayedStatus('p1', 'gw1')).toBe(true);
  });

  it('returns false when minutesPlayed = 0', async () => {
    vi.mocked(db.fixture.findMany).mockResolvedValue([{ id: 'fix1' }] as never);
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue([
      makeStat('p1', 0),
    ] as never);
    expect(await svc.getPlayedStatus('p1', 'gw1')).toBe(false);
  });

  it('returns false when no stat record exists', async () => {
    vi.mocked(db.fixture.findMany).mockResolvedValue([{ id: 'fix1' }] as never);
    vi.mocked(db.fantasyPlayerMatchStat.findMany).mockResolvedValue([] as never);
    expect(await svc.getPlayedStatus('p1', 'gw1')).toBe(false);
  });

  it('returns false when no fixtures in gameweek', async () => {
    vi.mocked(db.fixture.findMany).mockResolvedValue([] as never);
    expect(await svc.getPlayedStatus('p1', 'gw1')).toBe(false);
  });
});
