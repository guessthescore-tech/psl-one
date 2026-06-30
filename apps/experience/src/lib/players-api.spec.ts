import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getBatchPlayerSeasonStats, getTopPerformers } from './players-api';

// ── getBatchPlayerSeasonStats ─────────────────────────────────────────────────
//
// The fantasy team page previously fetched season stats one-by-one using
// Promise.allSettled(players.map(...)) — an N+1 pattern for a 15-player squad.
// getBatchPlayerSeasonStats replaces that with a single request.
//
// These tests pin:
//   1. The URL shape (batch endpoint, not per-player endpoint)
//   2. That a single fetch is made regardless of player count
//   3. The response is mapped to { playerId, goals, assists, fantasyPoints }

describe('players-api getBatchPlayerSeasonStats', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls GET /players/season/:seasonId/stats/batch — not /players/:id/season/:id/stats', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        seasonId: 'season-1',
        players: [
          { playerId: 'p1', goals: 5, assists: 3, fantasyPoints: 0 },
          { playerId: 'p2', goals: 1, assists: 0, fantasyPoints: 0 },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getBatchPlayerSeasonStats(['p1', 'p2'], 'season-1');

    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain('/players/season/season-1/stats/batch');
    expect(url).not.toContain('/players/p1/season');
    expect(url).not.toContain('/players/p2/season');
    expect(result.players).toHaveLength(2);
    expect(result.players[0]!.goals).toBe(5);
    expect(result.players[1]!.assists).toBe(0);
  });

  it('makes exactly one request for a full 15-player squad (not one per player)', async () => {
    const playerIds = Array.from({ length: 15 }, (_, i) => `player-${i + 1}`);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        seasonId: 'season-1',
        players: playerIds.map((playerId) => ({ playerId, goals: 0, assists: 0, fantasyPoints: 0 })),
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getBatchPlayerSeasonStats(playerIds, 'season-1');

    // Regardless of squad size, exactly one HTTP request was made.
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(result.players).toHaveLength(15);
  });

  it('passes all player IDs as a comma-separated playerIds query parameter', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ seasonId: 'season-1', players: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await getBatchPlayerSeasonStats(['p1', 'p2', 'p3'], 'season-1');

    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    // The query string must encode all three IDs.
    expect(url).toContain('playerIds=');
    expect(url).toContain('p1');
    expect(url).toContain('p2');
    expect(url).toContain('p3');
  });

  it('throws when the API returns a non-2xx status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal('fetch', fetchMock);
    await expect(getBatchPlayerSeasonStats(['p1'], 'season-1')).rejects.toThrow();
  });

  it('passes non-zero fantasyPoints through from the API response without clamping to 0', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        seasonId: 'season-1',
        players: [{ playerId: 'p1', goals: 3, assists: 1, fantasyPoints: 72 }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const result = await getBatchPlayerSeasonStats(['p1'], 'season-1');
    expect(result.players[0]!.fantasyPoints).toBe(72);
    expect(result.players[0]!.fantasyPoints).not.toBe(0);
  });
});

// ── getTopPerformers ──────────────────────────────────────────────────────────
//
// These tests pin the TopPerformer[] contract so a shape regression on the
// backend (e.g. reverting to { season, topScorers, topAssists }) is caught at
// the client layer before it can blank the /players or /stats/season pages.

describe('players-api getTopPerformers', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  const TOP_PERFORMER = {
    playerId: 'p1',
    playerName: 'Kylian Mbappé',
    teamName: 'France',
    position: 'FORWARD',
    goals: 3,
    assists: 1,
    minutesPlayed: 270,
    fantasyPoints: 45,
    cleanSheets: 0,
  };

  it('calls GET /players/season/:seasonId/top-performers with the correct URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [TOP_PERFORMER] });
    vi.stubGlobal('fetch', fetchMock);

    await getTopPerformers('fifa-world-cup-2026', 50);

    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain('/players/season/');
    expect(url).toContain('fifa-world-cup-2026');
    expect(url).toContain('top-performers');
    expect(url).toContain('limit=50');
  });

  it('returns a flat array — not a nested object with topScorers/topAssists', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [TOP_PERFORMER] });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getTopPerformers('season-1', 10);

    expect(Array.isArray(result)).toBe(true);
    // Regression guard: the old nested shape would expose these keys at the
    // top level, which would cause .map() to throw inside the page's try/catch.
    expect(result).not.toHaveProperty('topScorers');
    expect(result).not.toHaveProperty('topAssists');
    expect(result).not.toHaveProperty('season');
  });

  it('each element has all TopPerformer fields including fantasyPoints', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [TOP_PERFORMER] });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getTopPerformers('season-1', 10);

    const row = result[0]!;
    expect(row).toHaveProperty('playerId');
    expect(row).toHaveProperty('playerName');
    expect(row).toHaveProperty('teamName');
    expect(row).toHaveProperty('position');
    expect(row).toHaveProperty('goals');
    expect(row).toHaveProperty('assists');
    expect(row).toHaveProperty('minutesPlayed');
    expect(row).toHaveProperty('fantasyPoints');
    expect(row).toHaveProperty('cleanSheets');
  });

  it('passes non-zero fantasyPoints through without clamping', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ ...TOP_PERFORMER, fantasyPoints: 45 }],
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getTopPerformers('season-1', 10);

    expect(result[0]!.fantasyPoints).toBe(45);
    expect(result[0]!.fantasyPoints).not.toBe(0);
  });

  it('returns an empty array when the endpoint returns []', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);

    const result = await getTopPerformers('season-1', 10);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('throws when the API returns a non-2xx status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getTopPerformers('season-1', 10)).rejects.toThrow();
  });
});
