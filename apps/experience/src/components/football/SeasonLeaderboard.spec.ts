import { describe, it, expect } from 'vitest';
import { buildLeaderboard, CATEGORY_LABELS } from './SeasonLeaderboard.helpers';
import { topPerformerToExpPlayer } from '../../lib/live-mappers';
import type { ExpPlayer } from '@/lib/data';
import type { TopPerformer } from '../../lib/players-api';

// ── SeasonLeaderboard.buildLeaderboard ────────────────────────────────────────
//
// These tests pin the product decisions for each LeaderboardCategory so that
// renaming or repurposing a category is caught immediately.
//
// Category semantics (locked):
//   goals       – sorts by goalsThisTournament; value = raw goal count
//   assists     – sorts by assistsThisTournament; value = raw assist count
//   ratings     – sorted and valued by FANTASY POINTS (settled scoring), NOT match
//                 ratings. The UI label must say "Fantasy Pts", not "Ratings" /
//                 "Best Ratings" / "Avg Rating". Value is the raw integer pt count.
//   cleanSheets – filtered to GK/DEF, sorted by fantasyPoints as a proxy; see note
//                 below on the known approximation.

function makePlayer(overrides: Partial<ExpPlayer> = {}): ExpPlayer {
  return {
    id: 'p1',
    name: 'Test Player',
    position: 'FWD',
    club: {
      id: 'c1', name: 'Test Club', shortName: 'TC', abbr: 'TC',
      city: '', country: '', primaryColor: '#000', secondaryColor: '#fff', textColor: '#fff', founded: 2000,
    },
    nationality: 'South African',
    imageKey: 'test-player',
    goalsThisTournament: 3,
    assistsThisTournament: 2,
    fantasyPoints: 94,
    fantasyPrice: 10.5,
    cleanSheets: 0,
    ...overrides,
  };
}

// ── goals ─────────────────────────────────────────────────────────────────────

describe('buildLeaderboard goals', () => {
  it('sorts by goalsThisTournament descending', () => {
    const players = [
      makePlayer({ id: 'p1', goalsThisTournament: 3 }),
      makePlayer({ id: 'p2', goalsThisTournament: 7 }),
    ];
    const entries = buildLeaderboard(players, 'goals');
    expect(entries[0]!.player.id).toBe('p2');
    expect(entries[1]!.player.id).toBe('p1');
  });

  it('value is the raw goal count', () => {
    const entries = buildLeaderboard([makePlayer({ goalsThisTournament: 5 })], 'goals');
    expect(entries[0]!.value).toBe(5);
  });

  it('rank starts at 1', () => {
    const entries = buildLeaderboard([makePlayer()], 'goals');
    expect(entries[0]!.rank).toBe(1);
  });
});

// ── assists ───────────────────────────────────────────────────────────────────

describe('buildLeaderboard assists', () => {
  it('sorts by assistsThisTournament descending', () => {
    const players = [
      makePlayer({ id: 'p1', assistsThisTournament: 1 }),
      makePlayer({ id: 'p2', assistsThisTournament: 4 }),
    ];
    const entries = buildLeaderboard(players, 'assists');
    expect(entries[0]!.player.id).toBe('p2');
  });

  it('value is the raw assist count', () => {
    const entries = buildLeaderboard([makePlayer({ assistsThisTournament: 6 })], 'assists');
    expect(entries[0]!.value).toBe(6);
  });
});

// ── ratings (= Fantasy Pts leaderboard) ───────────────────────────────────────
//
// PRODUCT DECISION: The 'ratings' category key is an internal identifier.
// The user-facing label must be "Fantasy Pts" because the sort and display
// value comes from settled fantasy scoring (FantasyGameweekScoringService),
// NOT from PlayerMatchStats.rating.
//
// Displaying fantasyPoints/10 as if it were a match rating (0–10 scale) was
// a mislabeling. The correct display is the raw integer fantasy point total.

describe('buildLeaderboard ratings (Fantasy Pts)', () => {
  it('CATEGORY_LABELS[ratings] is "Fantasy Pts" — not "Ratings", "Best Ratings", or "Avg Rating"', () => {
    expect(CATEGORY_LABELS['ratings']).toBe('Fantasy Pts');
    expect(CATEGORY_LABELS['ratings']).not.toMatch(/rating/i);
    expect(CATEGORY_LABELS['ratings']).not.toBe('Best Ratings');
    expect(CATEGORY_LABELS['ratings']).not.toBe('Avg Rating');
  });

  it('sorts by fantasyPoints descending', () => {
    const players = [
      makePlayer({ id: 'p1', fantasyPoints: 40 }),
      makePlayer({ id: 'p2', fantasyPoints: 90 }),
    ];
    const entries = buildLeaderboard(players, 'ratings');
    expect(entries[0]!.player.id).toBe('p2');
    expect(entries[1]!.player.id).toBe('p1');
  });

  it('value IS the raw fantasyPoints integer — not divided by 10', () => {
    // If value were fantasyPoints/10 (old rating proxy), player with 94 pts would
    // show 0.9 due to Math.round(94/10)/10 = 9/10 = 0.9.
    // Correct value is 94 pts displayed directly.
    const entries = buildLeaderboard([makePlayer({ fantasyPoints: 94 })], 'ratings');
    expect(entries[0]!.value).toBe(94);
    expect(entries[0]!.value).not.toBe(0.9);
    expect(entries[0]!.value).not.toBeCloseTo(9.4, 1);
  });

  it('unit is "pts"', () => {
    const entries = buildLeaderboard([makePlayer({ fantasyPoints: 72 })], 'ratings');
    expect(entries[0]!.unit).toBe('pts');
  });

  it('returns empty array when no players', () => {
    expect(buildLeaderboard([], 'ratings')).toEqual([]);
  });
});

// ── cleanSheets ───────────────────────────────────────────────────────────────
//
// PRODUCT DECISION: the cleanSheets tab must use the real cleanSheets count from
// ExpPlayer.cleanSheets (sourced from PlayerMatchStats.cleanSheet aggregated by
// the backend). Using Math.floor(fantasyPoints / 20) was a proxy that is now
// forbidden. The three regression tests below prove the proxy cannot return.

describe('buildLeaderboard cleanSheets', () => {
  it('filters to GK and DEF positions only', () => {
    const players = [
      makePlayer({ id: 'gk',  position: 'GK',  cleanSheets: 2, fantasyPoints: 80 }),
      makePlayer({ id: 'def', position: 'DEF', cleanSheets: 1, fantasyPoints: 60 }),
      makePlayer({ id: 'mid', position: 'MID', cleanSheets: 0, fantasyPoints: 100 }),
      makePlayer({ id: 'fwd', position: 'FWD', cleanSheets: 0, fantasyPoints: 90 }),
    ];
    const entries = buildLeaderboard(players, 'cleanSheets');
    const ids = entries.map((e) => e.player.id);
    expect(ids).toContain('gk');
    expect(ids).toContain('def');
    expect(ids).not.toContain('mid');
    expect(ids).not.toContain('fwd');
  });

  it('value is the real cleanSheets count — not Math.floor(fantasyPoints / 20)', () => {
    // GK with 3 real clean sheets but only 5 fantasy points.
    // Proxy would give Math.floor(5/20) = 0. Real value must be 3.
    const entries = buildLeaderboard(
      [makePlayer({ position: 'GK', cleanSheets: 3, fantasyPoints: 5 })],
      'cleanSheets',
    );
    expect(entries[0]!.value).toBe(3);
  });

  it('a player with 0 real clean sheets shows 0 even when fantasyPoints is high', () => {
    // Proxy would give Math.floor(100/20) = 5. Real value must be 0.
    const entries = buildLeaderboard(
      [makePlayer({ position: 'GK', cleanSheets: 0, fantasyPoints: 100 })],
      'cleanSheets',
    );
    expect(entries[0]!.value).toBe(0);
    expect(entries[0]!.value).not.toBe(5);
  });

  it('sorts GK/DEF by cleanSheets descending — not by fantasyPoints', () => {
    // The player with more real clean sheets ranks first, regardless of fantasy pts.
    const players = [
      makePlayer({ id: 'gk1', position: 'GK',  cleanSheets: 5, fantasyPoints: 20 }),
      makePlayer({ id: 'gk2', position: 'GK',  cleanSheets: 2, fantasyPoints: 80 }),
    ];
    const entries = buildLeaderboard(players, 'cleanSheets');
    expect(entries[0]!.player.id).toBe('gk1');
    expect(entries[1]!.player.id).toBe('gk2');
  });
});

// ── End-to-end contract: TopPerformer → topPerformerToExpPlayer → buildLeaderboard ──
//
// This test chains the actual mapper and leaderboard builder to prove that
// TopPerformer.cleanSheets reaches the leaderboard entry value unchanged.
// It fails if:
//   - topPerformerToExpPlayer does not thread cleanSheets through (returns 0 or undefined)
//   - buildLeaderboard('cleanSheets') uses Math.floor(fantasyPoints / 20) instead of p.cleanSheets
//
// cleanSheets: 7, fantasyPoints: 40 → proxy would give Math.floor(40/20) = 2, real value is 7.
// Any proxy reintroduction would produce 2 instead of 7.

describe('cleanSheets end-to-end: TopPerformer → leaderboard entry', () => {
  const topPerformer: TopPerformer = {
    playerId: 'gk-e2e',
    playerName: 'E2E Keeper',
    teamName: 'Test FC',
    position: 'GOALKEEPER',
    goals: 0,
    assists: 0,
    minutesPlayed: 900,
    cleanSheets: 7,
    fantasyPoints: 40,
  };

  it('topPerformerToExpPlayer preserves cleanSheets from the backend contract', () => {
    const expPlayer = topPerformerToExpPlayer(topPerformer);
    expect(expPlayer.cleanSheets).toBe(7);
    expect(expPlayer.cleanSheets).not.toBe(Math.floor(topPerformer.fantasyPoints / 20));
  });

  it('buildLeaderboard entry value equals TopPerformer.cleanSheets — not the fantasyPoints proxy', () => {
    const expPlayer = topPerformerToExpPlayer(topPerformer);
    const entries = buildLeaderboard([expPlayer], 'cleanSheets');
    expect(entries[0]!.value).toBe(7);
    expect(entries[0]!.value).not.toBe(Math.floor(topPerformer.fantasyPoints / 20));
  });
});
