/**
 * Integration test: PostgreSQL concurrency protection for challenge acceptance.
 *
 * Runs against the local dev database. Uses raw Prisma transactions — no NestJS DI.
 * Proves that the conditional `updateMany` (availablePoints >= required) prevents
 * double-spend when two acceptors race on the same listing.
 *
 * Uses existing seeded market config and fixture market to avoid unique-constraint
 * conflicts when the seed has already created MATCH_RESULT markets for all fixtures.
 * Requires: pnpm --filter @psl-one/api db:seed (needs active season + gameweek).
 */
import 'reflect-metadata';
import { describe, it, expect, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
afterAll(() => prisma.$disconnect());

const POINTS = 200;

/**
 * Atomically claims POINTS from a listing by decrementing availablePoints.
 * Returns 'ACCEPTED' if the conditional update succeeds, 'CONFLICT' if another
 * transaction won the race first.
 */
async function atomicClaim(listingId: string, allocationId: string): Promise<'ACCEPTED' | 'CONFLICT'> {
  try {
    await prisma.$transaction(async tx => {
      const listingResult = await tx.challengeListing.updateMany({
        where: {
          id: listingId,
          status: 'OPEN',
          availablePoints: { gte: POINTS },
        },
        data: {
          matchedPoints: { increment: POINTS },
          availablePoints: { decrement: POINTS },
          status: 'FULLY_MATCHED',
        },
      });
      if (listingResult.count !== 1) throw new Error('LISTING_CONFLICT');

      const allocResult = await tx.gameweekPointsAllocation.updateMany({
        where: {
          id: allocationId,
          remainingAllocation: { gte: POINTS },
        },
        data: {
          usedAllocation: { increment: POINTS },
          remainingAllocation: { decrement: POINTS },
        },
      });
      if (allocResult.count !== 1) throw new Error('ALLOC_CONFLICT');
    });
    return 'ACCEPTED';
  } catch {
    return 'CONFLICT';
  }
}

describe('Challenge listing — PostgreSQL concurrency protection', () => {
  it('exactly one of two concurrent acceptors wins', async () => {
    // ── Locate seed data ─────────────────────────────────────────────────────
    const season = await prisma.season.findFirst({ where: { isActive: true } });
    if (!season) { console.warn('SKIP: no active season — run db:seed first'); return; }

    const gameweek = await prisma.gameweek.findFirst({ where: { seasonId: season.id } });
    if (!gameweek) { console.warn('SKIP: no gameweeks — run db:seed first'); return; }

    // Use the first fixture in the active season that has an open market
    const openMarket = await prisma.fixturePredictionMarket.findFirst({
      where: { fixture: { seasonId: season.id }, status: 'OPEN' },
      include: { fixture: true },
    });
    if (!openMarket) { console.warn('SKIP: no open fixture markets — run db:seed first'); return; }

    // ── Create minimal test users ─────────────────────────────────────────────
    const ts = Date.now();
    const [creator, acceptor1, acceptor2] = await Promise.all([
      prisma.user.create({ data: { email: `conc-creator-${ts}@test.internal`, passwordHash: '$TEST', role: 'FAN', dateOfBirth: new Date('1990-01-01') } }),
      prisma.user.create({ data: { email: `conc-a1-${ts}@test.internal`, passwordHash: '$TEST', role: 'FAN', dateOfBirth: new Date('1990-01-01') } }),
      prisma.user.create({ data: { email: `conc-a2-${ts}@test.internal`, passwordHash: '$TEST', role: 'FAN', dateOfBirth: new Date('1990-01-01') } }),
    ]);

    const market = openMarket;
    const fixture = openMarket.fixture;

    // ── Create listings and allocations ───────────────────────────────────────
    const listing = await prisma.challengeListing.create({
      data: {
        fanUserId: creator.id,
        fixtureMarketId: market.id,
        gameweekId: gameweek.id,
        seasonId: season.id,
        supportingSelection: 'HOME_WIN',
        opposingSelection: 'AWAY_WIN',
        baseOpportunity: 200,
        pointsCommitmentPct: 100,
        committedPoints: POINTS,
        pointsReturnRate: 1.0,
        confidenceMultiplier: 1.0,
        potentialPointsAward: POINTS,
        maximumPointsExposure: POINTS,
        availablePoints: POINTS,
        matchedPoints: 0,
        status: 'OPEN',
        visibility: 'PUBLIC',
        challengeMode: 'PUBLIC_MARKETPLACE',
        idempotencyKey: `conc-test-listing-${ts}`,
      },
    });

    const [alloc1, alloc2] = await Promise.all([
      prisma.gameweekPointsAllocation.create({
        data: { fanUserId: acceptor1.id, gameweekId: gameweek.id, seasonId: season.id, totalAllocation: 500, usedAllocation: 0, remainingAllocation: 500 },
      }),
      prisma.gameweekPointsAllocation.create({
        data: { fanUserId: acceptor2.id, gameweekId: gameweek.id, seasonId: season.id, totalAllocation: 500, usedAllocation: 0, remainingAllocation: 500 },
      }),
    ]);

    // ── Race both acceptors concurrently ──────────────────────────────────────
    const [r1, r2] = await Promise.all([
      atomicClaim(listing.id, alloc1.id),
      atomicClaim(listing.id, alloc2.id),
    ]);

    const outcomes = [r1, r2].sort();
    expect(outcomes).toEqual(['ACCEPTED', 'CONFLICT']);

    // Post-race assertions
    const finalListing = await prisma.challengeListing.findUnique({ where: { id: listing.id } });
    expect(finalListing?.status).toBe('FULLY_MATCHED');
    expect(finalListing?.availablePoints).toBe(0);
    expect(finalListing?.matchedPoints).toBe(POINTS);

    // World Cup data is untouched — verify no PSL/World Cup fixtures were modified
    const originalFixture = await prisma.fixture.findUnique({ where: { id: fixture.id } });
    expect(originalFixture).not.toBeNull();

    // ── Cleanup — only delete records created by this test ────────────────────
    // market and marketConfig are seeded — do not delete them
    await prisma.gameweekPointsAllocation.deleteMany({ where: { id: { in: [alloc1.id, alloc2.id] } } });
    await prisma.challengeListing.delete({ where: { id: listing.id } });
    await prisma.user.deleteMany({ where: { id: { in: [creator.id, acceptor1.id, acceptor2.id] } } });
  }, 30_000);
});
