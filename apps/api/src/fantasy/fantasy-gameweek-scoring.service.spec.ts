import 'reflect-metadata';
import { describe, it, expect, vi } from 'vitest';
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
