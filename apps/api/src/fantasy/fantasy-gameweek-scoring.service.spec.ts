import 'reflect-metadata';
import { describe, it, expect, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { PlayerPosition } from '@prisma/client';
import { FantasyGameweekScoringService } from './fantasy-gameweek-scoring.service';
import type { PrismaService } from '../prisma/prisma.service';

function makeStat(overrides: Partial<{
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
}> = {}) {
  return {
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
    ...overrides,
  };
}

function makeService(playerResult: any, statResult: any) {
  const mockPrisma = {
    player: { findUnique: vi.fn().mockResolvedValue(playerResult) },
    fantasyPlayerMatchStat: { findFirst: vi.fn().mockResolvedValue(statResult) },
  } as unknown as PrismaService;

  return new FantasyGameweekScoringService(
    mockPrisma,
    null as any, // autoSubService — not used by computePlayerFixturePoints
    null as any, // fanValueLedgerService
    null as any, // achievementsService
    null as any, // notificationsService
    null as any, // activityFeedService
  );
}

describe('FantasyGameweekScoringService.computePlayerFixturePoints', () => {
  it('returns 0 pts when player not found', async () => {
    const svc = makeService(null, makeStat());
    const result = await svc.computePlayerFixturePoints('unknown-player', 'fix-1');
    expect(result.basePoints).toBe(0);
    expect(result.played).toBe(false);
  });

  it('returns 0 pts when stat not found', async () => {
    const svc = makeService({ position: PlayerPosition.FORWARD }, null);
    const result = await svc.computePlayerFixturePoints('p1', 'fix-1');
    expect(result.basePoints).toBe(0);
    expect(result.played).toBe(false);
  });

  it('returns 0 pts and played=false when didNotPlay', async () => {
    const svc = makeService({ position: PlayerPosition.FORWARD }, makeStat({ minutesPlayed: 0, didNotPlay: true }));
    const result = await svc.computePlayerFixturePoints('p1', 'fix-1');
    expect(result.basePoints).toBe(0);
    expect(result.played).toBe(false);
  });

  it('GK with 90 min play earns appearance points (2)', async () => {
    const svc = makeService({ position: PlayerPosition.GOALKEEPER }, makeStat());
    const result = await svc.computePlayerFixturePoints('p1', 'fix-1');
    expect(result.basePoints).toBe(2);
    expect(result.played).toBe(true);
    expect(result.breakdown.appearance).toBe(2);
  });

  it('GK with clean sheet earns 4 bonus pts (total 6)', async () => {
    const svc = makeService({ position: PlayerPosition.GOALKEEPER }, makeStat({ cleanSheet: true }));
    const result = await svc.computePlayerFixturePoints('p1', 'fix-1');
    expect(result.breakdown.cleanSheet).toBe(4);
    expect(result.basePoints).toBe(6);
  });

  it('DEF with clean sheet earns 4 bonus pts (total 6)', async () => {
    const svc = makeService({ position: PlayerPosition.DEFENDER }, makeStat({ cleanSheet: true }));
    const result = await svc.computePlayerFixturePoints('p1', 'fix-1');
    expect(result.breakdown.cleanSheet).toBe(4);
    expect(result.basePoints).toBe(6);
  });

  it('MID with clean sheet earns 1 bonus pt', async () => {
    const svc = makeService({ position: PlayerPosition.MIDFIELDER }, makeStat({ cleanSheet: true }));
    const result = await svc.computePlayerFixturePoints('p1', 'fix-1');
    expect(result.breakdown.cleanSheet).toBe(1);
  });

  it('FWD with clean sheet earns 0 clean sheet pts', async () => {
    const svc = makeService({ position: PlayerPosition.FORWARD }, makeStat({ cleanSheet: true }));
    const result = await svc.computePlayerFixturePoints('p1', 'fix-1');
    expect(result.breakdown.cleanSheet).toBe(0);
  });

  it('yellow card deducts 1 pt', async () => {
    const svc = makeService({ position: PlayerPosition.MIDFIELDER }, makeStat({ yellowCards: 1 }));
    const result = await svc.computePlayerFixturePoints('p1', 'fix-1');
    expect(result.breakdown.yellowCards).toBe(-1);
    expect(result.basePoints).toBe(2 - 1); // appearance - yellow
  });

  it('red card deducts 3 pts', async () => {
    const svc = makeService({ position: PlayerPosition.MIDFIELDER }, makeStat({ redCards: 1, minutesPlayed: 45 }));
    const result = await svc.computePlayerFixturePoints('p1', 'fix-1');
    expect(result.breakdown.redCards).toBe(-3);
    expect(result.basePoints).toBe(1 - 3); // appearance(1, <60min) - red
  });

  it('FWD goal worth 4 pts', async () => {
    const svc = makeService({ position: PlayerPosition.FORWARD }, makeStat({ goals: 1 }));
    const result = await svc.computePlayerFixturePoints('p1', 'fix-1');
    expect(result.breakdown.goals).toBe(4);
    expect(result.basePoints).toBe(2 + 4);
  });

  it('GK goal worth 10 pts', async () => {
    const svc = makeService({ position: PlayerPosition.GOALKEEPER }, makeStat({ goals: 1 }));
    const result = await svc.computePlayerFixturePoints('p1', 'fix-1');
    expect(result.breakdown.goals).toBe(10);
  });

  it('assist worth 3 pts', async () => {
    const svc = makeService({ position: PlayerPosition.FORWARD }, makeStat({ assists: 1 }));
    const result = await svc.computePlayerFixturePoints('p1', 'fix-1');
    expect(result.breakdown.assists).toBe(3);
  });

  it('goals conceded deduction is not implemented (clean sheet is binary)', async () => {
    // Domain choice: deducts 0 for goals conceded; only clean sheet bonus is binary
    const svc = makeService({ position: PlayerPosition.GOALKEEPER }, makeStat({ cleanSheet: false }));
    const result = await svc.computePlayerFixturePoints('p1', 'fix-1');
    expect(result.breakdown.goalsConcededDeduction).toBe(0);
    expect(result.breakdown.cleanSheet).toBe(0);
  });
});

// ── settleGameweekFantasyScores preflight guard ───────────────────────────────
//
// Settlement must be refused when any FINISHED fixture in the gameweek has no
// FantasyPlayerMatchStat rows. A count-based check was too permissive: one
// synced fixture passed the guard, leaving every other fixture at zero points.
// The per-fixture check ensures ALL FINISHED fixtures are covered before writing
// FantasyGameweekScore rows.
//
// Calling settle before sync creates FantasyGameweekScore rows with netPoints: 0
// that surface via the UI .then() path (not .catch()), making it look correct.

function makeSettleService({
  finishedFixtureIds,
  coveredFixtureIds,
  gameweekExists = true,
  teamIds = [] as string[],
}: {
  finishedFixtureIds: string[];
  coveredFixtureIds: string[];
  gameweekExists?: boolean;
  teamIds?: string[];
}) {
  const mockPrisma = {
    gameweek: {
      findUnique: vi.fn().mockResolvedValue(
        gameweekExists ? { id: 'gw-1', seasonId: 'season-1' } : null,
      ),
    },
    fixture: {
      findMany: vi.fn().mockResolvedValue(finishedFixtureIds.map(id => ({ id }))),
    },
    fantasyPlayerMatchStat: {
      findMany: vi.fn().mockResolvedValue(coveredFixtureIds.map(id => ({ fixtureId: id }))),
    },
    fantasyTeam: {
      findMany: vi.fn().mockResolvedValue(teamIds.map(id => ({ id }))),
    },
    fantasyGameweekScore: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  } as unknown as PrismaService;

  return new FantasyGameweekScoringService(
    mockPrisma,
    null as any,
    null as any,
    null as any,
    null as any,
    null as any,
  );
}

describe('FantasyGameweekScoringService.settleGameweekFantasyScores preflight', () => {
  it('throws BadRequestException when there are no FINISHED fixtures', async () => {
    const svc = makeSettleService({ finishedFixtureIds: [], coveredFixtureIds: [] });
    await expect(svc.settleGameweekFantasyScores('gw-1'))
      .rejects.toThrow(BadRequestException);
    await expect(svc.settleGameweekFantasyScores('gw-1'))
      .rejects.toThrow(/no FINISHED fixtures/i);
  });

  it('throws BadRequestException when FINISHED fixtures exist but none have been stat-synced', async () => {
    // Premature-settlement scenario: gameweek has finished matches but
    // sync:world-cup-player-stats has not been run at all.
    const svc = makeSettleService({ finishedFixtureIds: ['f1', 'f2', 'f3'], coveredFixtureIds: [] });
    await expect(svc.settleGameweekFantasyScores('gw-1'))
      .rejects.toThrow(BadRequestException);
    await expect(svc.settleGameweekFantasyScores('gw-1'))
      .rejects.toThrow(/FantasyPlayerMatchStat rows/i);
  });

  it('throws BadRequestException when only some FINISHED fixtures have stats (partial sync)', async () => {
    // f1 is synced but f2 is not — partial sync must be blocked.
    // A count-based guard (statCount > 0) would wrongly allow this through.
    const svc = makeSettleService({
      finishedFixtureIds: ['f1', 'f2'],
      coveredFixtureIds: ['f1'],
    });
    await expect(svc.settleGameweekFantasyScores('gw-1'))
      .rejects.toThrow(BadRequestException);
    await expect(svc.settleGameweekFantasyScores('gw-1'))
      .rejects.toThrow(/f2/);
  });

  it('proceeds when every FINISHED fixture has at least one stat row', async () => {
    // Full coverage: both f1 and f2 are synced → guard passes.
    const svc = makeSettleService({
      finishedFixtureIds: ['f1', 'f2'],
      coveredFixtureIds: ['f1', 'f2'],
      teamIds: [],
    });
    // No teams → teamsSettled: 0, but no exception.
    const result = await svc.settleGameweekFantasyScores('gw-1');
    expect(result.teamsSettled).toBe(0);
    expect(result.errors).toHaveLength(0);
  });
});
