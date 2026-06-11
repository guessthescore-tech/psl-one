/**
 * Integration tests that verify FIFA World Cup 2026 seed data shape.
 * These tests run against the local development database (psl_identity_dev).
 * Run `pnpm --filter @psl-one/api db:seed` before running these tests.
 */
import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

afterAll(() => prisma.$disconnect());

describe('WC2026 seed — competition format', () => {
  let competition: Awaited<ReturnType<typeof prisma.competition.findUnique>>;

  beforeAll(async () => {
    competition = await prisma.competition.findUnique({
      where: { slug: 'fifa-world-cup' },
      include: { stages: { orderBy: { order: 'asc' } } },
    });
  });

  it('competition exists', () => {
    expect(competition).not.toBeNull();
  });

  it('format is HYBRID', () => {
    expect(competition!.format).toBe('HYBRID');
  });

  it('hasHomeAway is true', () => {
    expect(competition!.hasHomeAway).toBe(true);
  });

  it('usesNeutralVenues is true', () => {
    expect(competition!.usesNeutralVenues).toBe(true);
  });

  it('hasGroups is true', () => {
    expect(competition!.hasGroups).toBe(true);
  });

  it('hasKnockouts is true', () => {
    expect(competition!.hasKnockouts).toBe(true);
  });

  it('teamCount is 48', () => {
    expect(competition!.teamCount).toBe(48);
  });

  it('pointsForWin is 3', () => {
    expect(competition!.pointsForWin).toBe(3);
  });

  it('pointsForDraw is 1', () => {
    expect(competition!.pointsForDraw).toBe(1);
  });

  it('pointsForLoss is 0', () => {
    expect(competition!.pointsForLoss).toBe(0);
  });

  it('has 7 stages', () => {
    expect((competition as any)!.stages).toHaveLength(7);
  });

  it('stage types are correct', () => {
    const stageTypes = (competition as any)!.stages.map((s: any) => s.type);
    expect(stageTypes).toContain('GROUP');
    expect(stageTypes).toContain('KNOCKOUT');
    expect(stageTypes).toContain('PLAYOFF');
    expect(stageTypes).toContain('FINAL');
  });
});

describe('WC2026 seed — teams', () => {
  it('has exactly 48 real (non-TBD) teams', async () => {
    const count = await prisma.team.count({
      where: { NOT: { slug: 'tbd' } },
    });
    expect(count).toBe(48);
  });

  it('has 1200 real players (no TBD team players)', async () => {
    const count = await prisma.player.count({
      where: { team: { NOT: { slug: 'tbd' } } },
    });
    expect(count).toBe(1200);
  });
});

describe('WC2026 seed — groups', () => {
  it('has exactly 12 groups', async () => {
    const season = await prisma.season.findFirst({ where: { isActive: true } });
    const count = await prisma.group.count({ where: { seasonId: season!.id } });
    expect(count).toBe(12);
  });

  it('each group has exactly 4 teams in standings', async () => {
    const season = await prisma.season.findFirst({ where: { isActive: true } });
    const groups = await prisma.group.findMany({
      where: { seasonId: season!.id },
      include: { _count: { select: { standings: true } } },
    });
    for (const g of groups) {
      expect((g as any)._count.standings).toBe(4);
    }
  });

  it('each group has exactly 6 group-stage fixtures', async () => {
    const season = await prisma.season.findFirst({ where: { isActive: true } });
    const groups = await prisma.group.findMany({
      where: { seasonId: season!.id },
      include: { _count: { select: { fixtures: true } } },
    });
    for (const g of groups) {
      expect((g as any)._count.fixtures).toBe(6);
    }
  });
});

describe('WC2026 seed — fixtures', () => {
  let season: { id: string } | null;

  beforeAll(async () => {
    season = await prisma.season.findFirst({ where: { isActive: true }, select: { id: true } });
  });

  it('total fixtures = 104', async () => {
    const count = await prisma.fixture.count({ where: { seasonId: season!.id } });
    expect(count).toBe(104);
  });

  it('group stage has 72 fixtures', async () => {
    const count = await prisma.fixture.count({
      where: { seasonId: season!.id, round: 'GROUP' },
    });
    expect(count).toBe(72);
  });

  it('Round of 32 has 16 fixtures', async () => {
    const count = await prisma.fixture.count({
      where: { seasonId: season!.id, round: 'ROUND_OF_32' },
    });
    expect(count).toBe(16);
  });

  it('Round of 16 has 8 fixtures', async () => {
    const count = await prisma.fixture.count({
      where: { seasonId: season!.id, round: 'ROUND_OF_16' },
    });
    expect(count).toBe(8);
  });

  it('Quarter-finals have 4 fixtures', async () => {
    const count = await prisma.fixture.count({
      where: { seasonId: season!.id, round: 'QUARTER_FINAL' },
    });
    expect(count).toBe(4);
  });

  it('Semi-finals have 2 fixtures', async () => {
    const count = await prisma.fixture.count({
      where: { seasonId: season!.id, round: 'SEMI_FINAL' },
    });
    expect(count).toBe(2);
  });

  it('knockout total = 32 fixtures', async () => {
    const count = await prisma.fixture.count({
      where: {
        seasonId: season!.id,
        round: { in: ['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'THIRD_PLACE', 'FINAL'] },
      },
    });
    expect(count).toBe(32);
  });

  it('all fixtures have isNeutralVenue = true', async () => {
    const nonNeutral = await prisma.fixture.count({
      where: { seasonId: season!.id, isNeutralVenue: false },
    });
    expect(nonNeutral).toBe(0);
  });

  it('all 72 group-stage fixtures have real (non-TBD) home teams', async () => {
    const tbd = await prisma.team.findFirst({ where: { slug: 'tbd' } });
    const count = await prisma.fixture.count({
      where: { seasonId: season!.id, round: 'GROUP', NOT: { homeTeamId: tbd!.id } },
    });
    expect(count).toBe(72);
  });

  it('knockout fixtures use TBD as placeholder teams', async () => {
    const tbd = await prisma.team.findFirst({ where: { slug: 'tbd' } });
    const tbdFixtures = await prisma.fixture.count({
      where: {
        seasonId: season!.id,
        OR: [{ homeTeamId: tbd!.id }, { awayTeamId: tbd!.id }],
      },
    });
    expect(tbdFixtures).toBe(32);
  });

  it('all fixtures are assigned to a stage', async () => {
    const unassigned = await prisma.fixture.count({
      where: { seasonId: season!.id, stageId: null },
    });
    expect(unassigned).toBe(0);
  });

  it('all fixtures are assigned to a gameweek', async () => {
    const unassigned = await prisma.fixture.count({
      where: { seasonId: season!.id, gameweekId: null },
    });
    expect(unassigned).toBe(0);
  });
});

describe('WC2026 seed — gameweeks', () => {
  it('has exactly 9 gameweeks', async () => {
    const season = await prisma.season.findFirst({ where: { isActive: true } });
    const count = await prisma.gameweek.count({ where: { seasonId: season!.id } });
    expect(count).toBe(9);
  });
});

describe('WC2026 seed — fantasy player pool', () => {
  it('fantasy player pool excludes TBD team (1200 real players)', async () => {
    // The TBD team's players should not exist; seed only creates players for real teams
    const tbdTeam = await prisma.team.findFirst({ where: { slug: 'tbd' } });
    if (!tbdTeam) {
      // No TBD players — expected
      return;
    }
    const tbdPlayerCount = await prisma.player.count({ where: { teamId: tbdTeam.id } });
    expect(tbdPlayerCount).toBe(0);
  });

  it('player pool count is exactly 1200', async () => {
    const count = await prisma.player.count();
    expect(count).toBe(1200);
  });
});
