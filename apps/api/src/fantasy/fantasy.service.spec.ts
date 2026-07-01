import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { FantasySquadRole, LineupStatus, MatchEventType, PlayerPosition, FixtureStatus } from '@prisma/client';
import { FantasyService } from './fantasy.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { AchievementsService } from '../achievements/achievements.service';

const makeAchievementsMock = () => ({
  safeEvaluate: vi.fn().mockResolvedValue(undefined),
}) as unknown as AchievementsService;

// ── Helpers ──────────────────────────────────────────────────────────────────

const uuid = () => Math.random().toString(36).slice(2);

function makePlayer(
  id: string,
  position: PlayerPosition,
  teamId = 'team-1',
  name = `Player ${id}`,
) {
  return { id, position, teamId, name };
}

function makeSlot(
  playerId: string,
  squadRole: FantasySquadRole,
  opts: { benchSlot?: number; isCaptain?: boolean; isViceCaptain?: boolean } = {},
) {
  return { playerId, squadRole, ...opts };
}

// Build a valid 15-player squad: 2GK 5DEF 5MID 3FWD, 11 starters (1GK 4DEF 4MID 2FWD), 4 subs
function buildValidSquad() {
  const teams = ['t1', 't2', 't3', 't4', 't5', 't6'];
  let ti = 0;
  const nextTeam = () => teams[ti++ % teams.length];

  const gk1 = makePlayer('gk1', PlayerPosition.GOALKEEPER, nextTeam());
  const gk2 = makePlayer('gk2', PlayerPosition.GOALKEEPER, nextTeam());
  const defs = Array.from({ length: 5 }, (_, i) => makePlayer(`d${i}`, PlayerPosition.DEFENDER, nextTeam()));
  const mids = Array.from({ length: 5 }, (_, i) => makePlayer(`m${i}`, PlayerPosition.MIDFIELDER, nextTeam()));
  const fwds = Array.from({ length: 3 }, (_, i) => makePlayer(`f${i}`, PlayerPosition.FORWARD, nextTeam()));

  const players = [gk1, gk2, ...defs, ...mids, ...fwds];

  // Formation 4-4-2: 1GK 4DEF 4MID 2FWD starters
  const slots = [
    makeSlot('gk1', FantasySquadRole.STARTER, { isCaptain: true }),
    ...defs.slice(0, 4).map(d => makeSlot(d.id, FantasySquadRole.STARTER)),
    makeSlot('d4', FantasySquadRole.SUBSTITUTE, { benchSlot: 1 }),
    ...mids.slice(0, 4).map(m => makeSlot(m.id, FantasySquadRole.STARTER)),
    makeSlot('m4', FantasySquadRole.SUBSTITUTE, { benchSlot: 2 }),
    makeSlot('f0', FantasySquadRole.STARTER, { isViceCaptain: true }),
    makeSlot('f1', FantasySquadRole.STARTER),
    makeSlot('f2', FantasySquadRole.SUBSTITUTE, { benchSlot: 3 }),
    makeSlot('gk2', FantasySquadRole.SUBSTITUTE, { benchSlot: 0 }),
  ];

  return { players, slots };
}

// ── Squad validation tests ────────────────────────────────────────────────────

describe('Fantasy squad validation (via FantasyService.validateSlots)', () => {
  const makePrismaMock = () =>
    ({
      season: { findFirst: vi.fn() },
      player: { findMany: vi.fn(), findUnique: vi.fn() },
      fantasyTeam: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), update: vi.fn() },
      fantasyTeamPlayer: { delete: vi.fn(), create: vi.fn() },
      fantasyPointsLedger: { createMany: vi.fn() },
      fixture: { findUnique: vi.fn() },
      fantasyRulesConfig: { findUnique: vi.fn() },
    }) as unknown as PrismaService;

  let service: FantasyService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new FantasyService(prisma as unknown as PrismaService, makeAchievementsMock());
  });

  it('accepts a valid 15-player squad: 2GK 5DEF 5MID 3FWD', async () => {
    const { players, slots } = buildValidSquad();
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(players);
    const result = await service.validateSlots(slots);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.squadCounts).toEqual({ goalkeepers: 2, defenders: 5, midfielders: 5, forwards: 3 });
  });

  it('rejects wrong position counts (3GK instead of 2)', async () => {
    const { players, slots } = buildValidSquad();
    // Replace one DEF with a GK in the details
    players[2]!.position = PlayerPosition.GOALKEEPER;
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(players);
    const result = await service.validateSlots(slots);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('goalkeeper'))).toBe(true);
  });

  it('accepts formation 4-4-2', async () => {
    const { players, slots } = buildValidSquad();
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(players);
    const result = await service.validateSlots(slots);
    expect(result.formation).toBe('4-4-2');
  });

  it('accepts formation 3-4-3', async () => {
    const gk1 = makePlayer('gk1', PlayerPosition.GOALKEEPER, 't1');
    const gk2 = makePlayer('gk2', PlayerPosition.GOALKEEPER, 't2');
    const defs = Array.from({ length: 5 }, (_, i) => makePlayer(`d${i}`, PlayerPosition.DEFENDER, `td${i}`));
    const mids = Array.from({ length: 5 }, (_, i) => makePlayer(`m${i}`, PlayerPosition.MIDFIELDER, `tm${i}`));
    const fwds = Array.from({ length: 3 }, (_, i) => makePlayer(`f${i}`, PlayerPosition.FORWARD, `tf${i}`));
    const players = [gk1, gk2, ...defs, ...mids, ...fwds];

    // Formation 3-4-3: 1GK 3DEF 4MID 3FWD starters, 2DEF+1MID+1GK bench
    const slots = [
      makeSlot('gk1', FantasySquadRole.STARTER, { isCaptain: true }),
      makeSlot('d0', FantasySquadRole.STARTER),
      makeSlot('d1', FantasySquadRole.STARTER),
      makeSlot('d2', FantasySquadRole.STARTER),
      makeSlot('d3', FantasySquadRole.SUBSTITUTE, { benchSlot: 1 }),
      makeSlot('d4', FantasySquadRole.SUBSTITUTE, { benchSlot: 2 }),
      makeSlot('m0', FantasySquadRole.STARTER),
      makeSlot('m1', FantasySquadRole.STARTER),
      makeSlot('m2', FantasySquadRole.STARTER),
      makeSlot('m3', FantasySquadRole.STARTER),
      makeSlot('m4', FantasySquadRole.SUBSTITUTE, { benchSlot: 3 }),
      makeSlot('f0', FantasySquadRole.STARTER, { isViceCaptain: true }),
      makeSlot('f1', FantasySquadRole.STARTER),
      makeSlot('f2', FantasySquadRole.STARTER),
      makeSlot('gk2', FantasySquadRole.SUBSTITUTE, { benchSlot: 0 }),
    ];

    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(players);
    const result = await service.validateSlots(slots);
    expect(result.formation).toBe('3-4-3');
  });

  it('rejects fewer than 3 defenders in starting XI', async () => {
    const { players, slots } = buildValidSquad();
    // Move 2 more DEFs to bench (only 2 DEF starters left)
    const defSlots = slots.filter(s => {
      const p = players.find(pl => pl.id === s.playerId);
      return p?.position === PlayerPosition.DEFENDER && s.squadRole === FantasySquadRole.STARTER;
    });
    defSlots[0]!.squadRole = FantasySquadRole.SUBSTITUTE;
    defSlots[0]!.benchSlot = 3;
    defSlots[1]!.squadRole = FantasySquadRole.STARTER; // Already starter — move a sub to keep count

    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(players);
    // Actually rebuild with only 2 DEF starters
    const gk1 = makePlayer('gk1', PlayerPosition.GOALKEEPER, 't1');
    const gk2 = makePlayer('gk2', PlayerPosition.GOALKEEPER, 't2');
    const defs = Array.from({ length: 5 }, (_, i) => makePlayer(`d${i}`, PlayerPosition.DEFENDER, `td${i}`));
    const mids = Array.from({ length: 5 }, (_, i) => makePlayer(`m${i}`, PlayerPosition.MIDFIELDER, `tm${i}`));
    const fwds = Array.from({ length: 3 }, (_, i) => makePlayer(`f${i}`, PlayerPosition.FORWARD, `tf${i}`));
    const p2 = [gk1, gk2, ...defs, ...mids, ...fwds];

    // 2 DEF starters → invalid formation
    const s2 = [
      makeSlot('gk1', FantasySquadRole.STARTER, { isCaptain: true }),
      makeSlot('d0', FantasySquadRole.STARTER),
      makeSlot('d1', FantasySquadRole.STARTER),
      makeSlot('d2', FantasySquadRole.SUBSTITUTE, { benchSlot: 1 }),
      makeSlot('d3', FantasySquadRole.SUBSTITUTE, { benchSlot: 2 }),
      makeSlot('d4', FantasySquadRole.SUBSTITUTE, { benchSlot: 3 }),
      ...mids.slice(0, 5).map((m, i) => makeSlot(m.id, FantasySquadRole.STARTER)),
      makeSlot('f0', FantasySquadRole.STARTER, { isViceCaptain: true }),
      makeSlot('f1', FantasySquadRole.STARTER),
      makeSlot('f2', FantasySquadRole.STARTER),
      makeSlot('gk2', FantasySquadRole.SUBSTITUTE, { benchSlot: 0 }),
    ];
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(p2);
    const result = await service.validateSlots(s2);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('defender') || e.includes('formation'))).toBe(true);
  });

  it('rejects no forward in starting XI', async () => {
    const gk1 = makePlayer('gk1', PlayerPosition.GOALKEEPER, 't1');
    const gk2 = makePlayer('gk2', PlayerPosition.GOALKEEPER, 't2');
    const defs = Array.from({ length: 5 }, (_, i) => makePlayer(`d${i}`, PlayerPosition.DEFENDER, `td${i}`));
    const mids = Array.from({ length: 5 }, (_, i) => makePlayer(`m${i}`, PlayerPosition.MIDFIELDER, `tm${i}`));
    const fwds = Array.from({ length: 3 }, (_, i) => makePlayer(`f${i}`, PlayerPosition.FORWARD, `tf${i}`));
    const p = [gk1, gk2, ...defs, ...mids, ...fwds];

    // No FWD in starters (5-5-0) — invalid
    const slots = [
      makeSlot('gk1', FantasySquadRole.STARTER, { isCaptain: true }),
      ...defs.slice(0, 5).map(d => makeSlot(d.id, FantasySquadRole.STARTER)),
      ...mids.slice(0, 5).map(m => makeSlot(m.id, FantasySquadRole.STARTER)),
      makeSlot('f0', FantasySquadRole.SUBSTITUTE, { benchSlot: 1 }),
      makeSlot('f1', FantasySquadRole.SUBSTITUTE, { benchSlot: 2, isViceCaptain: true }),
      makeSlot('f2', FantasySquadRole.SUBSTITUTE, { benchSlot: 3 }),
      makeSlot('gk2', FantasySquadRole.SUBSTITUTE, { benchSlot: 0 }),
    ];
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(p);
    const result = await service.validateSlots(slots);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('forward') || e.includes('formation'))).toBe(true);
  });

  it('rejects squad with fewer than 11 starters', async () => {
    const { players, slots } = buildValidSquad();
    // Move one starter to substitute
    const firstStarter = slots.find(s => s.squadRole === FantasySquadRole.STARTER)!;
    firstStarter.squadRole = FantasySquadRole.SUBSTITUTE;
    firstStarter.benchSlot = 5;
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(players);
    const result = await service.validateSlots(slots);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('11'))).toBe(true);
  });

  it('rejects squad with fewer than 4 substitutes', async () => {
    const { players, slots } = buildValidSquad();
    const firstSub = slots.find(s => s.squadRole === FantasySquadRole.SUBSTITUTE)!;
    firstSub.squadRole = FantasySquadRole.STARTER;
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(players);
    const result = await service.validateSlots(slots);
    expect(result.isValid).toBe(false);
  });

  it('rejects missing captain', async () => {
    const { players, slots } = buildValidSquad();
    slots.forEach(s => { s.isCaptain = false; });
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(players);
    const result = await service.validateSlots(slots);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.toLowerCase().includes('captain'))).toBe(true);
  });

  it('rejects captain on the bench', async () => {
    const { players, slots } = buildValidSquad();
    slots.forEach(s => { s.isCaptain = false; });
    const subSlot = slots.find(s => s.squadRole === FantasySquadRole.SUBSTITUTE)!;
    subSlot.isCaptain = true;
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(players);
    const result = await service.validateSlots(slots);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Captain must be in the starting XI'))).toBe(true);
  });

  it('rejects vice-captain on the bench', async () => {
    const { players, slots } = buildValidSquad();
    slots.forEach(s => { s.isViceCaptain = false; });
    const subSlot = slots.find(s => s.squadRole === FantasySquadRole.SUBSTITUTE)!;
    subSlot.isViceCaptain = true;
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(players);
    const result = await service.validateSlots(slots);
    expect(result.isValid).toBe(false);
  });

  it('rejects same player as captain and vice-captain', async () => {
    const { players, slots } = buildValidSquad();
    const capSlot = slots.find(s => s.isCaptain)!;
    capSlot.isViceCaptain = true;
    slots.forEach(s => { if (s.playerId !== capSlot.playerId) s.isViceCaptain = false; });
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(players);
    const result = await service.validateSlots(slots);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('different players'))).toBe(true);
  });

  it('rejects more than 3 players from same team', async () => {
    const { players, slots } = buildValidSquad();
    // Set 4 players to team 'SAME'
    players[0]!.teamId = 'SAME';
    players[1]!.teamId = 'SAME';
    players[2]!.teamId = 'SAME';
    players[3]!.teamId = 'SAME';
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(players);
    const result = await service.validateSlots(slots);
    expect(result.isValid).toBe(false);
    expect(result.maxPerTeamValid).toBe(false);
  });
});

// ── FPL Scoring tests ─────────────────────────────────────────────────────────

describe('Fantasy scoring (scorePlayer via settleFixture)', () => {
  const makePrismaMock = () =>
    ({
      season: { findFirst: vi.fn() },
      gameweek: { findFirst: vi.fn() },
      player: { findMany: vi.fn(), findUnique: vi.fn() },
      fantasyTeam: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), update: vi.fn() },
      fantasyTeamPlayer: { delete: vi.fn(), create: vi.fn() },
      fantasyPointsLedger: { createMany: vi.fn() },
      fixture: { findUnique: vi.fn() },
      fantasyRulesConfig: { findUnique: vi.fn() },
    }) as unknown as PrismaService;

  // We test the internal scorePlayer function indirectly via settleFixture.
  // For unit tests of the pure scoring logic, import via module-level exposure.
  // Here we test the FPL scoring rules by calling settleFixture with a controlled fixture.

  let service: FantasyService;
  let prisma: ReturnType<typeof makePrismaMock>;

  const FIXTURE_ID = 'fix-1';
  const HOME_TEAM_ID = 'home-team';
  const AWAY_TEAM_ID = 'away-team';

  function makeFixture(homeScore: number, awayScore: number, events: object[] = []) {
    return {
      id: FIXTURE_ID,
      status: FixtureStatus.FINISHED,
      homeScore,
      awayScore,
      homeTeamId: HOME_TEAM_ID,
      awayTeamId: AWAY_TEAM_ID,
      lineups: [],
      events,
    };
  }

  function makeLineup(playerId: string, status: LineupStatus) {
    return { playerId, status, shirtNumber: null, position: null };
  }

  function makeFantasyTeam(playerId: string, position: PlayerPosition, teamId: string, isCaptain = false, isViceCaptain = false) {
    return {
      id: 'fteam-1',
      totalPoints: 0,
      players: [
        {
          id: 'ftp-1',
          playerId,
          squadRole: FantasySquadRole.STARTER,
          isCaptain,
          isViceCaptain,
          player: { id: playerId, position, teamId, name: 'Test' },
        },
      ],
    };
  }

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new FantasyService(prisma as unknown as PrismaService, makeAchievementsMock());
    (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 1 });
    (prisma.fantasyTeam.update as ReturnType<typeof vi.fn>).mockResolvedValue({});
  });

  it('STARTING player gets 2 appearance points', async () => {
    const pId = 'p1';
    const fixture = makeFixture(1, 0);
    fixture.lineups = [makeLineup(pId, LineupStatus.STARTING)] as typeof fixture.lineups;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeFantasyTeam(pId, PlayerPosition.MIDFIELDER, AWAY_TEAM_ID),
    ]);
    const result = await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'APPEARANCE_60_PLUS' && e.points === 2)).toBe(true);
  });

  it('SUBSTITUTE player gets 1 appearance point', async () => {
    const pId = 'p1';
    const fixture = makeFixture(1, 0);
    fixture.lineups = [makeLineup(pId, LineupStatus.SUBSTITUTE)] as typeof fixture.lineups;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeFantasyTeam(pId, PlayerPosition.MIDFIELDER, AWAY_TEAM_ID),
    ]);
    await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'APPEARANCE_UNDER_60' && e.points === 1)).toBe(true);
  });

  it('goalkeeper goal = 6 points', async () => {
    const pId = 'p-gk';
    const fixture = makeFixture(1, 0);
    fixture.lineups = [makeLineup(pId, LineupStatus.STARTING)] as typeof fixture.lineups;
    fixture.events = [{ eventType: MatchEventType.GOAL, playerId: pId }] as typeof fixture.events;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeFantasyTeam(pId, PlayerPosition.GOALKEEPER, HOME_TEAM_ID),
    ]);
    await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'GOAL_GOALKEEPER' && e.points === 6)).toBe(true);
  });

  it('defender goal = 6 points', async () => {
    const pId = 'p-df';
    const fixture = makeFixture(1, 0);
    fixture.lineups = [makeLineup(pId, LineupStatus.STARTING)] as typeof fixture.lineups;
    fixture.events = [{ eventType: MatchEventType.GOAL, playerId: pId }] as typeof fixture.events;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeFantasyTeam(pId, PlayerPosition.DEFENDER, HOME_TEAM_ID),
    ]);
    await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'GOAL_DEFENDER' && e.points === 6)).toBe(true);
  });

  it('midfielder goal = 5 points', async () => {
    const pId = 'p-mf';
    const fixture = makeFixture(1, 0);
    fixture.lineups = [makeLineup(pId, LineupStatus.STARTING)] as typeof fixture.lineups;
    fixture.events = [{ eventType: MatchEventType.GOAL, playerId: pId }] as typeof fixture.events;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeFantasyTeam(pId, PlayerPosition.MIDFIELDER, HOME_TEAM_ID),
    ]);
    await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'GOAL_MIDFIELDER' && e.points === 5)).toBe(true);
  });

  it('forward goal = 4 points', async () => {
    const pId = 'p-fw';
    const fixture = makeFixture(1, 0);
    fixture.lineups = [makeLineup(pId, LineupStatus.STARTING)] as typeof fixture.lineups;
    fixture.events = [{ eventType: MatchEventType.GOAL, playerId: pId }] as typeof fixture.events;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeFantasyTeam(pId, PlayerPosition.FORWARD, HOME_TEAM_ID),
    ]);
    await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'GOAL_FORWARD' && e.points === 4)).toBe(true);
  });

  it('assist = 3 points', async () => {
    const pId = 'p-mid';
    const fixture = makeFixture(1, 0);
    fixture.lineups = [makeLineup(pId, LineupStatus.STARTING)] as typeof fixture.lineups;
    fixture.events = [{ eventType: MatchEventType.ASSIST, playerId: pId }] as typeof fixture.events;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeFantasyTeam(pId, PlayerPosition.MIDFIELDER, HOME_TEAM_ID),
    ]);
    await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'ASSIST' && e.points === 3)).toBe(true);
  });

  it('goalkeeper clean sheet = 4 points', async () => {
    const pId = 'p-gk';
    const fixture = makeFixture(0, 0);
    fixture.lineups = [makeLineup(pId, LineupStatus.STARTING)] as typeof fixture.lineups;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeFantasyTeam(pId, PlayerPosition.GOALKEEPER, HOME_TEAM_ID),
    ]);
    await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'CLEAN_SHEET_GOALKEEPER' && e.points === 4)).toBe(true);
  });

  it('defender clean sheet = 4 points', async () => {
    const pId = 'p-df';
    const fixture = makeFixture(0, 0);
    fixture.lineups = [makeLineup(pId, LineupStatus.STARTING)] as typeof fixture.lineups;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeFantasyTeam(pId, PlayerPosition.DEFENDER, HOME_TEAM_ID),
    ]);
    await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'CLEAN_SHEET_DEFENDER' && e.points === 4)).toBe(true);
  });

  it('midfielder clean sheet = 1 point', async () => {
    const pId = 'p-mf';
    const fixture = makeFixture(0, 0);
    fixture.lineups = [makeLineup(pId, LineupStatus.STARTING)] as typeof fixture.lineups;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeFantasyTeam(pId, PlayerPosition.MIDFIELDER, HOME_TEAM_ID),
    ]);
    await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'CLEAN_SHEET_MIDFIELDER' && e.points === 1)).toBe(true);
  });

  it('goalkeeper concedes 2 goals = -1 point deduction', async () => {
    const pId = 'p-gk';
    const fixture = makeFixture(0, 2); // GK is home team, concedes 2
    fixture.lineups = [makeLineup(pId, LineupStatus.STARTING)] as typeof fixture.lineups;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeFantasyTeam(pId, PlayerPosition.GOALKEEPER, HOME_TEAM_ID),
    ]);
    await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'GOALS_CONCEDED' && e.points === -1)).toBe(true);
  });

  it('yellow card = -1 point', async () => {
    const pId = 'p1';
    const fixture = makeFixture(1, 0);
    fixture.lineups = [makeLineup(pId, LineupStatus.STARTING)] as typeof fixture.lineups;
    fixture.events = [{ eventType: MatchEventType.YELLOW_CARD, playerId: pId }] as typeof fixture.events;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeFantasyTeam(pId, PlayerPosition.MIDFIELDER, HOME_TEAM_ID),
    ]);
    await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'YELLOW_CARD' && e.points === -1)).toBe(true);
  });

  it('red card = -3 points', async () => {
    const pId = 'p1';
    const fixture = makeFixture(1, 0);
    fixture.lineups = [makeLineup(pId, LineupStatus.STARTING)] as typeof fixture.lineups;
    fixture.events = [{ eventType: MatchEventType.RED_CARD, playerId: pId }] as typeof fixture.events;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeFantasyTeam(pId, PlayerPosition.MIDFIELDER, HOME_TEAM_ID),
    ]);
    await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'RED_CARD' && e.points === -3)).toBe(true);
  });

  it('own goal = -2 points', async () => {
    const pId = 'p1';
    const fixture = makeFixture(1, 0);
    fixture.lineups = [makeLineup(pId, LineupStatus.STARTING)] as typeof fixture.lineups;
    fixture.events = [{ eventType: MatchEventType.OWN_GOAL, playerId: pId }] as typeof fixture.events;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeFantasyTeam(pId, PlayerPosition.DEFENDER, HOME_TEAM_ID),
    ]);
    await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'OWN_GOAL' && e.points === -2)).toBe(true);
  });

  it('penalty missed = -2 points', async () => {
    const pId = 'p1';
    const fixture = makeFixture(1, 0);
    fixture.lineups = [makeLineup(pId, LineupStatus.STARTING)] as typeof fixture.lineups;
    fixture.events = [{ eventType: MatchEventType.PENALTY_MISSED, playerId: pId }] as typeof fixture.events;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeFantasyTeam(pId, PlayerPosition.FORWARD, HOME_TEAM_ID),
    ]);
    await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'PENALTY_MISSED' && e.points === -2)).toBe(true);
  });

  it('penalty save = 5 points for GK', async () => {
    const pId = 'p-gk';
    const fixture = makeFixture(0, 0);
    fixture.lineups = [makeLineup(pId, LineupStatus.STARTING)] as typeof fixture.lineups;
    fixture.events = [{ eventType: MatchEventType.PENALTY_SAVE, playerId: pId }] as typeof fixture.events;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeFantasyTeam(pId, PlayerPosition.GOALKEEPER, HOME_TEAM_ID),
    ]);
    await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'PENALTY_SAVE' && e.points === 5)).toBe(true);
  });

  it('3 saves = 1 bonus point for GK', async () => {
    const pId = 'p-gk';
    const fixture = makeFixture(0, 0);
    fixture.lineups = [makeLineup(pId, LineupStatus.STARTING)] as typeof fixture.lineups;
    fixture.events = [
      { eventType: MatchEventType.SAVE, playerId: pId },
      { eventType: MatchEventType.SAVE, playerId: pId },
      { eventType: MatchEventType.SAVE, playerId: pId },
    ] as typeof fixture.events;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeFantasyTeam(pId, PlayerPosition.GOALKEEPER, HOME_TEAM_ID),
    ]);
    await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'SAVES' && e.points === 1)).toBe(true);
  });

  it('captain doubles final score', async () => {
    const pId = 'p-cap';
    const fixture = makeFixture(1, 0);
    fixture.lineups = [makeLineup(pId, LineupStatus.STARTING)] as typeof fixture.lineups;
    fixture.events = [{ eventType: MatchEventType.GOAL, playerId: pId }] as typeof fixture.events;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeFantasyTeam(pId, PlayerPosition.FORWARD, HOME_TEAM_ID, true, false),
    ]);
    await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'CAPTAIN_MULTIPLIER')).toBe(true);
  });

  it('vice-captain doubles only if captain did not play', async () => {
    const vcId = 'p-vc';
    const fixture = makeFixture(1, 0);
    fixture.lineups = [makeLineup(vcId, LineupStatus.STARTING)] as typeof fixture.lineups;
    fixture.events = [{ eventType: MatchEventType.GOAL, playerId: vcId }] as typeof fixture.events;
    (prisma.fixture.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(fixture);
    // Captain is 'p-cap' but has no lineup/events → did not play
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 'fteam-1',
        totalPoints: 0,
        players: [
          {
            id: 'ftp-cap',
            playerId: 'p-cap',
            squadRole: FantasySquadRole.STARTER,
            isCaptain: true,
            isViceCaptain: false,
            player: { id: 'p-cap', position: PlayerPosition.FORWARD, teamId: HOME_TEAM_ID, name: 'Cap' },
          },
          {
            id: 'ftp-vc',
            playerId: vcId,
            squadRole: FantasySquadRole.STARTER,
            isCaptain: false,
            isViceCaptain: true,
            player: { id: vcId, position: PlayerPosition.FORWARD, teamId: HOME_TEAM_ID, name: 'VC' },
          },
        ],
      },
    ]);
    await service.settleFixture(FIXTURE_ID);
    const entries = (prisma.fantasyPointsLedger.createMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data as { reason: string; points: number }[];
    expect(entries.some(e => e.reason === 'VICE_CAPTAIN_MULTIPLIER')).toBe(true);
  });

  it('leaderboard ranks teams by total points', async () => {
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'season-1' });
    (prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: 'ft1', name: 'Team A', totalPoints: 120, user: { id: 'u1' }, _count: { players: 15 } },
      { id: 'ft2', name: 'Team B', totalPoints: 90, user: { id: 'u2' }, _count: { players: 15 } },
    ]);
    const result = await service.getLeaderboard();
    expect((prisma.fantasyTeam.findMany as ReturnType<typeof vi.fn>).mock.calls[0]![0]!).toMatchObject({
      orderBy: { totalPoints: 'desc' },
    });
  });

  it('throws NotFoundException for missing fantasy team', async () => {
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 's1' });
    (prisma.fantasyTeam.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(service.getMyTeam('user-1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws ConflictException when creating a second team for same season', async () => {
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 's1' });
    (prisma.fantasyTeam.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'existing' });
    const { slots } = buildValidSquad();
    await expect(service.createTeam('u1', { players: slots })).rejects.toBeInstanceOf(ConflictException);
  });

  it('creates an empty team (name-only registration) when players is omitted', async () => {
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 's1', slug: 'psl', name: 'PSL', competition: { slug: 'psl', name: 'PSL' } });
    (prisma.fantasyTeam.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.fantasyTeam.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'ft-new', name: 'My Crew', players: [] });
    const result = await service.createTeam('u1', { name: 'My Crew' });
    expect(result).toBeDefined();
    expect((prisma.fantasyTeam.create as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data.name).toBe('My Crew');
    // No players array in the create call — name-only registration
    expect((prisma.fantasyTeam.create as ReturnType<typeof vi.fn>).mock.calls[0]![0]!.data.players).toBeUndefined();
  });

  it('creates an empty team when players is explicitly []', async () => {
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 's1', slug: 'psl', name: 'PSL', competition: { slug: 'psl', name: 'PSL' } });
    (prisma.fantasyTeam.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.fantasyTeam.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'ft-new', name: 'My Fantasy Team', players: [] });
    const result = await service.createTeam('u1', { players: [] });
    expect(result).toBeDefined();
  });

  it('throws BadRequestException for invalid squad composition when players are provided (non-empty)', async () => {
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 's1', slug: 'psl', name: 'PSL', competition: { slug: 'psl', name: 'PSL' } });
    (prisma.fantasyTeam.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.fantasyRulesConfig.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    // Provide 3 players but squad requires 15 → validation fails
    const badSlots = [
      { playerId: 'p1', squadRole: FantasySquadRole.STARTER, isCaptain: true, isViceCaptain: false },
      { playerId: 'p2', squadRole: FantasySquadRole.STARTER, isCaptain: false, isViceCaptain: true },
      { playerId: 'p3', squadRole: FantasySquadRole.SUBSTITUTE, isCaptain: false, isViceCaptain: false },
    ];
    await expect(service.createTeam('u1', { players: badSlots })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('transfer cannot break squad composition', async () => {
    const { players, slots } = buildValidSquad();
    const defPlayer = players.find(p => p.position === PlayerPosition.DEFENDER)!;
    const gkPlayer = players.find(p => p.position === PlayerPosition.GOALKEEPER)!;

    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 's1' });
    (prisma.gameweek.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (prisma.fantasyTeam.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'ft1',
      players: slots.map(s => ({
        id: `ftp-${s.playerId}`,
        playerId: s.playerId,
        squadRole: s.squadRole,
        benchSlot: s.benchSlot ?? null,
        isCaptain: s.isCaptain ?? false,
        isViceCaptain: s.isViceCaptain ?? false,
        lockedAt: null,
        player: players.find(p => p.id === s.playerId) ?? null,
      })),
    });
    // Mock player.findUnique to return the GK (different position from DEF being removed)
    (prisma.player.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: gkPlayer.id,
      position: PlayerPosition.GOALKEEPER,
      teamId: gkPlayer.teamId,
      name: gkPlayer.name,
    });
    // Try to swap a DEF for a GK → different position → BadRequestException
    await expect(
      service.makeTransfer('u1', { removePlayerId: defPlayer.id, addPlayerId: gkPlayer.id }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

// ── Team-management deadline locks ────────────────────────────────────────────

describe('Fantasy team management — deadline locks', () => {
  const makePrismaMock = () =>
    ({
      season: { findFirst: vi.fn() },
      gameweek: { findFirst: vi.fn() },
      player: { findMany: vi.fn(), findUnique: vi.fn() },
      fantasyTeam: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn(), update: vi.fn() },
      fantasyTeamPlayer: { delete: vi.fn(), create: vi.fn(), update: vi.fn() },
      fantasyPointsLedger: { createMany: vi.fn() },
      fantasyTransfer: { create: vi.fn() },
      fixture: { findUnique: vi.fn() },
      fantasyRulesConfig: { findUnique: vi.fn() },
    }) as unknown as PrismaService;

  let service: FantasyService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new FantasyService(prisma as unknown as PrismaService, makeAchievementsMock());
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 's1' });
  });

  function lockDeadline() {
    // No UPCOMING/OPEN gameweek → assertTransferOpen throws
    (prisma.gameweek.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
  }

  function openDeadline() {
    (prisma.gameweek.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'gw-1',
      status: 'OPEN',
      transferDeadlineAt: new Date(Date.now() + 60_000),
    });
  }

  it('updateTeamMeta allows name rename after deadline (name-only = no window needed)', async () => {
    lockDeadline();
    (prisma.fantasyTeam.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'ft1' });
    (prisma.fantasyTeam.update as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'ft1', name: 'New Name', players: [] });
    const result = await service.updateTeamMeta('u1', { name: 'New Name' });
    expect(result).toBeDefined();
  });

  it('updateTeamMeta throws when formation change is requested after deadline (established team)', async () => {
    lockDeadline();
    // Established team (15 players) → formation change IS gated by the window
    (prisma.fantasyTeam.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'ft1',
      _count: { players: 15 },
    });
    await expect(service.updateTeamMeta('u1', { formation: '4-3-3' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updateTeamMeta allows formation change for empty team (onboarding) even when deadline is locked', async () => {
    lockDeadline();
    // Empty team (just registered name, 0 players) → onboarding, window bypassed
    (prisma.fantasyTeam.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'ft1',
      _count: { players: 0 },
    });
    (prisma.fantasyTeam.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'ft1', name: 'My Team', formation: '4-3-3', players: [],
    });
    const result = await service.updateTeamMeta('u1', { formation: '4-3-3' });
    expect(result).toBeDefined();
  });

  it('addPlayerToSquad allows adding to an incomplete squad regardless of deadline (sequential onboarding)', async () => {
    lockDeadline();
    (prisma.fantasyRulesConfig.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    // Squad has 1 player (< squadSize=15) — still onboarding, window NOT enforced
    (prisma.fantasyTeam.findUnique as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        id: 'ft1',
        players: [{ playerId: 'existing-p1', squadRole: 'STARTER', benchSlot: null, isCaptain: false, isViceCaptain: false }],
      })
      .mockResolvedValueOnce({ id: 'ft1', name: 'My Team', formation: null, players: [] });
    (prisma.player.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'p1', position: PlayerPosition.MIDFIELDER, teamId: 't1', name: 'Test Player',
    });
    (prisma.fantasyTeamPlayer.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'ftp2' });
    const result = await service.addPlayerToSquad('u1', { playerId: 'p1', squadRole: 'STARTER' as FantasySquadRole });
    expect(result).toBeDefined();
  });

  it('addPlayerToSquad skips deadline check for initial squad setup (0 existing players)', async () => {
    lockDeadline(); // deadline is passed — should NOT block initial setup
    (prisma.fantasyRulesConfig.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    // Empty squad → initial setup, transfer window skipped
    (prisma.fantasyTeam.findUnique as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ id: 'ft1', players: [] })
      .mockResolvedValueOnce({ id: 'ft1', name: 'My Team', formation: null, players: [] });
    (prisma.player.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'p1', position: PlayerPosition.MIDFIELDER, teamId: 't1', name: 'Test Player',
    });
    (prisma.fantasyTeamPlayer.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'ftp1' });

    const result = await service.addPlayerToSquad('u1', { playerId: 'p1', squadRole: 'STARTER' as FantasySquadRole });
    expect(result).toBeDefined();
  });

  it('makeTransfer is always gated by transfer window for established teams', async () => {
    lockDeadline();
    const { players, slots } = buildValidSquad();
    (prisma.fantasyTeam.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'ft1',
      players: slots.map(s => ({
        id: `ftp-${s.playerId}`,
        playerId: s.playerId,
        squadRole: s.squadRole,
        benchSlot: s.benchSlot ?? null,
        isCaptain: s.isCaptain ?? false,
        isViceCaptain: s.isViceCaptain ?? false,
        lockedAt: null,
        player: players.find(p => p.id === s.playerId) ?? null,
      })),
    });
    const defPlayer = players.find(p => p.position === PlayerPosition.DEFENDER)!;
    const otherDef = { id: 'new-def', position: PlayerPosition.DEFENDER, teamId: 't-new', name: 'New Defender' };
    (prisma.player.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(otherDef);
    await expect(
      service.makeTransfer('u1', { removePlayerId: defPlayer.id, addPlayerId: otherDef.id }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('removePlayerFromSquad throws when deadline has passed', async () => {
    lockDeadline();
    await expect(service.removePlayerFromSquad('u1', 'p1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updatePlayerSlot (captain change) throws when deadline has passed', async () => {
    lockDeadline();
    await expect(service.updatePlayerSlot('u1', 'p1', { isCaptain: true })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updatePlayerSlot (vice-captain change) throws when deadline has passed', async () => {
    lockDeadline();
    await expect(service.updatePlayerSlot('u1', 'p1', { isViceCaptain: true })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updatePlayerSlot (starting XI change) throws when deadline has passed', async () => {
    lockDeadline();
    await expect(
      service.updatePlayerSlot('u1', 'p1', { squadRole: 'STARTER' as FantasySquadRole }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updatePlayerSlot (bench slot / substitution priority) throws when deadline has passed', async () => {
    lockDeadline();
    await expect(service.updatePlayerSlot('u1', 'p1', { benchSlot: 1 })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updateTeamMeta succeeds before deadline', async () => {
    openDeadline();
    (prisma.fantasyTeam.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'ft1' });
    (prisma.fantasyTeam.update as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'ft1', name: 'New Name', players: [] });
    const result = await service.updateTeamMeta('u1', { name: 'New Name' });
    expect(result).toBeDefined();
  });

  it('error message contains "locked" when deadline passed', async () => {
    lockDeadline();
    try {
      await service.updatePlayerSlot('u1', 'p1', { isCaptain: true });
      expect.fail('Should have thrown');
    } catch (e) {
      expect((e as BadRequestException).message).toMatch(/locked/i);
    }
  });
});

// ── getPlayerPool — active season scope ─────────────────────────────────────

describe('FantasyService.getPlayerPool — active season scope', () => {
  const makePrismaMock = () =>
    ({
      season: { findFirst: vi.fn(), findUnique: vi.fn() },
      player: { findMany: vi.fn() },
    }) as unknown as PrismaService;

  let service: FantasyService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new FantasyService(prisma as unknown as PrismaService, makeAchievementsMock());
  });

  it('queries players with prices scoped to active season', async () => {
    const seasonId = 'wc-season-123';
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: seasonId });
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await service.getPlayerPool();

    expect(prisma.player.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          prices: { some: { seasonId } },
        }),
      }),
    );
  });

  it('returns only players priced in active season — excludes PSL placeholders', async () => {
    const wcSeasonId = 'wc-season-456';
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: wcSeasonId });

    const wcPlayer = { id: 'wc-p1', name: 'WC Player', source: 'fifa-wc2026', team: { externalId: 'mexico', name: 'Mexico' } };
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([wcPlayer]);

    const result = await service.getPlayerPool();

    // The filter must include prices scope
    const call = (prisma.player.findMany as ReturnType<typeof vi.fn>).mock.calls[0]![0] as {
      where: {
        prices?: { some?: { seasonId?: string } };
        team?: { externalId?: unknown; seasonTeams?: { some?: { seasonId?: string } }; OR?: Array<Record<string, unknown>> };
      };
    };
    expect(call.where.prices?.some?.seasonId).toBe(wcSeasonId);
    expect(call.where.team?.externalId).toEqual({ not: 'TBD' });
    expect(call.where.team?.seasonTeams).toBeUndefined();
    expect(call.where.team?.OR).toBeUndefined();
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('WC Player');
  });

  it('returns World Cup players even when price rows are missing', async () => {
    const wcSeasonId = 'wc-season-789';
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: wcSeasonId,
      slug: 'fifa-world-cup-2026',
      name: 'FIFA World Cup 2026',
      competition: { slug: 'fifa-world-cup-2026', name: 'FIFA World Cup 2026' },
    });

    const wcPlayer = {
      id: 'wc-p2',
      name: 'WC Player Two',
      position: PlayerPosition.FORWARD,
      team: { id: 'team-2', name: 'Mexico', shortName: 'MEX', externalId: 'mexico' },
      source: 'fifa-wc2026',
    };
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([wcPlayer]);

    const result = await service.getPlayerPool();

    const call = (prisma.player.findMany as ReturnType<typeof vi.fn>).mock.calls[0]![0] as {
      where: {
        team: {
          externalId: { not: string };
          seasonTeams?: { some: { seasonId: string } };
          OR?: Array<Record<string, unknown>>;
        };
        OR: Array<Record<string, unknown>>;
      };
    };
    expect(call.where.team?.externalId).toEqual({ not: 'TBD' });
    expect(call.where.team?.seasonTeams?.some?.seasonId).toBe(wcSeasonId);
    expect(call.where.team?.OR).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ homeFixtures: expect.anything() }),
        expect.objectContaining({ awayFixtures: expect.anything() }),
      ]),
    );
    expect(call.where.OR).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: 'fifa-wc2026' }),
        expect.objectContaining({ prices: { some: { seasonId: wcSeasonId } } }),
      ]),
    );
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('WC Player Two');
  });

  it('uses explicit seasonId when provided and keeps the World Cup source fallback', async () => {
    const wcSeasonId = 'wc-season-999';
    (prisma.season.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: wcSeasonId,
      slug: 'fifa-world-cup-2026',
      name: 'FIFA World Cup 2026',
      competition: { slug: 'fifa-world-cup-2026', name: 'FIFA World Cup 2026' },
    });

    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await service.getPlayerPool(undefined, wcSeasonId);

    expect(prisma.season.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: wcSeasonId },
      }),
    );
    expect(prisma.player.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          team: expect.objectContaining({
            externalId: { not: 'TBD' },
            seasonTeams: { some: { seasonId: wcSeasonId } },
            OR: expect.arrayContaining([
              expect.objectContaining({ homeFixtures: expect.anything() }),
              expect.objectContaining({ awayFixtures: expect.anything() }),
            ]),
          }),
          OR: expect.arrayContaining([
            expect.objectContaining({ source: 'fifa-wc2026' }),
            expect.objectContaining({ prices: { some: { seasonId: wcSeasonId } } }),
          ]),
        }),
      }),
    );
  });

  it('includes position filter when provided', async () => {
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'season-789' });
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await service.getPlayerPool('FORWARD' as never);

    const call = (prisma.player.findMany as ReturnType<typeof vi.fn>).mock.calls[0]![0] as {
      where: { position?: string };
    };
    expect(call.where.position).toBe('FORWARD');
  });

  // ── Regression: eliminated WC team exclusion ──────────────────────────────

  it('[regression] WC pool query allows only SCHEDULED/LIVE/HALF_TIME — FINISHED is not in the status list', async () => {
    const wcSeasonId = 'wc-season-elim-001';
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: wcSeasonId,
      slug: 'fifa-world-cup-2026',
      name: 'FIFA World Cup 2026',
      competition: { slug: 'fifa-world-cup-2026', name: 'FIFA World Cup 2026' },
    });
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await service.getPlayerPool();

    type TeamOR = Array<{
      homeFixtures?: { some: { seasonId: string; status: { in: FixtureStatus[] } } };
      awayFixtures?: { some: { seasonId: string; status: { in: FixtureStatus[] } } };
    }>;
    const call = (prisma.player.findMany as ReturnType<typeof vi.fn>).mock.calls[0]![0] as {
      where: { team: { OR: TeamOR } };
    };

    const teamOR = call.where.team.OR;
    const homeClause = teamOR.find(c => c.homeFixtures);
    const awayClause = teamOR.find(c => c.awayFixtures);

    expect(homeClause).toBeDefined();
    expect(awayClause).toBeDefined();

    const homeStatuses = homeClause!.homeFixtures!.some.status.in;
    const awayStatuses = awayClause!.awayFixtures!.some.status.in;

    // Active statuses must be present — teams still in the tournament have these
    expect(homeStatuses).toContain(FixtureStatus.SCHEDULED);
    expect(homeStatuses).toContain(FixtureStatus.LIVE);
    expect(homeStatuses).toContain(FixtureStatus.HALF_TIME);
    expect(awayStatuses).toContain(FixtureStatus.SCHEDULED);
    expect(awayStatuses).toContain(FixtureStatus.LIVE);
    expect(awayStatuses).toContain(FixtureStatus.HALF_TIME);

    // FINISHED must not be allowed — a team whose only remaining fixture is FINISHED
    // will match neither homeFixtures nor awayFixtures and will be excluded by the DB
    expect(homeStatuses).not.toContain(FixtureStatus.FINISHED);
    expect(awayStatuses).not.toContain(FixtureStatus.FINISHED);

    // Fixture conditions must be scoped to the active season, not all seasons
    expect(homeClause!.homeFixtures!.some.seasonId).toBe(wcSeasonId);
    expect(awayClause!.awayFixtures!.some.seasonId).toBe(wcSeasonId);
  });

  it('[regression] query construction excludes a team whose only fixture is FINISHED', async () => {
    // This is the fixture-aware test. Unlike the query-shape test above, it wires
    // a mock that applies the service's WHERE clause to test players with known fixture
    // state — so the exclusion is proved by construction, not by a pre-canned result.
    const wcSeasonId = 'wc-season-elim-002';
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: wcSeasonId,
      slug: 'fifa-world-cup-2026',
      name: 'FIFA World Cup 2026',
      competition: { slug: 'fifa-world-cup-2026', name: 'FIFA World Cup 2026' },
    });

    type TestFixture = { seasonId: string; status: FixtureStatus };
    type TestTeam = {
      externalId: string;
      homeFixtures: TestFixture[];
      awayFixtures: TestFixture[];
    };
    type TestPlayer = { id: string; name: string; team: TestTeam & { id: string; name: string; shortName: string } };

    // Brazil: last fixture is FINISHED — eliminated
    const eliminatedPlayer: TestPlayer = {
      id: 'p-bra-1',
      name: 'Neymar',
      team: {
        id: 'team-bra', name: 'Brazil', shortName: 'BRA', externalId: 'brazil',
        homeFixtures: [{ seasonId: wcSeasonId, status: FixtureStatus.FINISHED }],
        awayFixtures: [],
      },
    };

    // Argentina: still has a SCHEDULED fixture — active
    const activePlayer: TestPlayer = {
      id: 'p-arg-1',
      name: 'Lionel Messi',
      team: {
        id: 'team-arg', name: 'Argentina', shortName: 'ARG', externalId: 'argentina',
        homeFixtures: [{ seasonId: wcSeasonId, status: FixtureStatus.SCHEDULED }],
        awayFixtures: [],
      },
    };

    // Fixture-aware mock: reads the team.OR clause the service constructs and applies
    // it to the test players — the same logic the database would execute.
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockImplementation(
      (args: { where?: { team?: { OR?: Array<{
        homeFixtures?: { some: { seasonId: string; status: { in: FixtureStatus[] } } };
        awayFixtures?: { some: { seasonId: string; status: { in: FixtureStatus[] } } };
      }> } } }) => {
        const teamOR = args.where?.team?.OR ?? [];
        const allowedStatuses = teamOR.flatMap(c => [
          ...(c.homeFixtures?.some.status.in ?? []),
          ...(c.awayFixtures?.some.status.in ?? []),
        ]);
        const seasonId = teamOR[0]?.homeFixtures?.some.seasonId
          ?? teamOR[0]?.awayFixtures?.some.seasonId;

        return [eliminatedPlayer, activePlayer].filter(p => {
          const hasActiveHome = p.team.homeFixtures.some(
            f => f.seasonId === seasonId && allowedStatuses.includes(f.status),
          );
          const hasActiveAway = p.team.awayFixtures.some(
            f => f.seasonId === seasonId && allowedStatuses.includes(f.status),
          );
          return hasActiveHome || hasActiveAway;
        });
      },
    );

    const result = await service.getPlayerPool();

    const typedResult = result as unknown as TestPlayer[];
    // Argentina has a SCHEDULED fixture → included
    expect(typedResult.find(p => p.team.externalId === 'argentina')).toBeDefined();
    // Brazil's only fixture is FINISHED → excluded by the filter
    expect(typedResult.find(p => p.team.externalId === 'brazil')).toBeUndefined();
    expect(result).toHaveLength(1);
  });

  it('[regression] non-WC (PSL) seasons do not apply the active-fixture team filter', async () => {
    const pslSeasonId = 'psl-season-2025';
    (prisma.season.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: pslSeasonId,
      slug: 'psl-2025-26',
      name: 'Premier Soccer League 2025/26',
      competition: { slug: 'premier-soccer-league', name: 'Premier Soccer League' },
    });
    (prisma.player.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await service.getPlayerPool();

    const call = (prisma.player.findMany as ReturnType<typeof vi.fn>).mock.calls[0]![0] as {
      where: { team: { OR?: unknown } };
    };

    // PSL teams are always available regardless of fixture status —
    // the active-fixture filter is WC-only and must not be applied here
    expect(call.where.team.OR).toBeUndefined();
  });
});
