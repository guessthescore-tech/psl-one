import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getGameweekScore, getPlayerPool, getPlayerPrices, getTransferStatus, getPublicLeagues, joinPublicLeague, validateSquad } from './fantasy-api';

describe('fantasy-api getPlayerPrices', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes API price values from tenths to millions', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          playerId: 'p1',
          playerName: 'Player One',
          seasonId: 'season-1',
          currentPrice: 55,
        },
      ],
    });

    vi.stubGlobal('fetch', fetchMock);

    const prices = await getPlayerPrices('season-1');

    expect(fetchMock).toHaveBeenCalled();
    expect(prices[0]!.currentPrice).toBe(5.5);
  });
});

// ── getGameweekScore ──────────────────────────────────────────────────────────
//
// WC gameweeks are seeded as UPCOMING. getTransferStatus() returns a non-null
// gameweekId for UPCOMING gameweeks, so team/page.tsx always attempts to fetch
// the score. The backend throws 404 when no FantasyGameweekScore row exists yet
// (i.e. scoring has not been settled for that gameweek). The page's .catch()
// relies on getGameweekScore() throwing in that case — if it stops throwing,
// the catch branch never runs and the UI shows an error instead of falling back
// to 0. These tests pin that contract.
describe('fantasy-api getGameweekScore', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws when the API returns 404 (no score row for an UPCOMING gameweek)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Gameweek score not found' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    // This throw is what the page's .catch() depends on to show gameweekPoints: 0.
    await expect(getGameweekScore('gw-upcoming')).rejects.toThrow('Gameweek score not found');
  });

  it('calls GET /fantasy/gameweeks/:id/score with the correct path', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'score-1', fantasyTeamId: 'team-1', gameweekId: 'gw-1',
        grossPoints: 55, transferCost: 4, chipPoints: 0, benchPoints: 3,
        captainPoints: 12, netPoints: 51, playerScores: [],
        gameweek: { id: 'gw-1', name: 'Group Stage – Matchday 1', round: 1 },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const score = await getGameweekScore('gw-1');

    const [url] = fetchMock.mock.calls[0] as [string, ...unknown[]];
    expect(url).toContain('/fantasy/gameweeks/gw-1/score');
    expect(score.netPoints).toBe(51);
  });

  it('returns real netPoints when a settled score exists', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'score-2', fantasyTeamId: 'team-1', gameweekId: 'gw-2',
        grossPoints: 70, transferCost: 0, chipPoints: 0, benchPoints: 5,
        captainPoints: 18, netPoints: 70, playerScores: [],
        gameweek: { id: 'gw-2', name: 'Group Stage – Matchday 2', round: 2 },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const score = await getGameweekScore('gw-2');
    expect(score.netPoints).toBe(70);
  });
});

// ── getTransferStatus ─────────────────────────────────────────────────────────
//
// WC UPCOMING gameweeks are included in the transfer-status query, so
// gameweekId is non-null in WC mode even before any fixtures have started.
// The UI uses this to decide whether to attempt fetching a gameweek score.
describe('fantasy-api getTransferStatus', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('surfaces a non-null gameweekId when the active season has an UPCOMING gameweek', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        fantasyTeamId: 'team-1',
        freeTransfersAvailable: 1,
        hasPassedFirstDeadline: false,
        totalTransferDeductions: 0,
        isDeadlineLocked: false,
        lockReason: 'OPEN',
        // Non-null: the UPCOMING GW-1 row was found by the status query.
        gameweekId: 'gw-upcoming-1',
        gameweekTransferCount: 0,
        nextTransferCost: 0,
        maxTransfersPerGameweek: 3,
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const status = await getTransferStatus();
    expect(status.gameweekId).toBe('gw-upcoming-1');
    expect(status.freeTransfersAvailable).toBe(1);
  });

  it('gameweekId is null when no gameweek rows exist for the active season', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        fantasyTeamId: 'team-1',
        freeTransfersAvailable: 1,
        hasPassedFirstDeadline: false,
        totalTransferDeductions: 0,
        isDeadlineLocked: true,
        lockReason: 'TRANSFER_DEADLINE',
        gameweekId: null,
        gameweekTransferCount: 0,
        nextTransferCost: 4,
        maxTransfersPerGameweek: 3,
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const status = await getTransferStatus();
    expect(status.gameweekId).toBeNull();
  });
});

// ── WC pre-settlement contract ────────────────────────────────────────────────
//
// Documents the complete expected state in WC mode before any operator
// settlement action has run.
//
// Settlement chain (3 operator steps):
//   1. pnpm --filter @psl-one/api sync:world-cup-player-stats \
//        -- --confirm=SYNC_PROVIDER_PLAYER_STATS
//      (only processes FINISHED fixtures with providerFixtureId set)
//   2. PATCH /admin/gameweeks/:id/status  { "status": "COMPLETED" }
//      (optional but semantically correct; settlement does not require it)
//   3. POST /fantasy/admin/scoring/gameweeks/:id/settle  (PSL_ADMIN)
//      (writes FantasyGameweekScore rows; after this, getGameweekScore returns
//      real netPoints and the UI's .then() path fires instead of .catch())
//
// Risk: calling step 3 before step 1 writes zero-point score rows.
// Those zeros propagate to the UI via .then() (not .catch()), making it
// look like settlement ran but players scored 0. Recalculate via
// POST /fantasy/admin/scoring/gameweeks/:id/recalculate to fix.
describe('WC pre-settlement contract: non-null gameweekId ≠ score exists', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('getTransferStatus returns non-null gameweekId + getGameweekScore throws: both expected pre-settlement', async () => {
    // Simulate what the page sees in WC mode before settlement:
    // transfer status has a gameweekId (UPCOMING GW exists) but
    // getGameweekScore throws because no FantasyGameweekScore row exists.
    const transferFetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        fantasyTeamId: 'team-1', freeTransfersAvailable: 1,
        hasPassedFirstDeadline: false, totalTransferDeductions: 0,
        isDeadlineLocked: false, lockReason: 'OPEN',
        gameweekId: 'wc-gw-group-matchday-1',  // non-null even for UPCOMING
        gameweekTransferCount: 0, nextTransferCost: 0, maxTransfersPerGameweek: 3,
      }),
    });
    vi.stubGlobal('fetch', transferFetchMock);
    const status = await getTransferStatus();
    expect(status.gameweekId).not.toBeNull();

    // Now simulate the score fetch that team/page.tsx makes with that id.
    const scoreFetchMock = vi.fn().mockResolvedValue({
      ok: false, status: 404,
      json: async () => ({ message: 'Gameweek score not found' }),
    });
    vi.stubGlobal('fetch', scoreFetchMock);

    // This throw is caught by team/page.tsx .catch() → gameweekPoints: 0.
    // When settlement runs (step 3 above), this resolves instead of rejecting.
    await expect(getGameweekScore(status.gameweekId!)).rejects.toThrow('Gameweek score not found');
  });

  it('getGameweekScore resolves with real netPoints once settlement has run', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'score-settled', fantasyTeamId: 'team-1', gameweekId: 'wc-gw-group-matchday-1',
        grossPoints: 48, transferCost: 0, chipPoints: 0, benchPoints: 6,
        captainPoints: 10, netPoints: 48, playerScores: [],
        gameweek: { id: 'wc-gw-group-matchday-1', name: 'Group Stage – Matchday 1', round: 1 },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const score = await getGameweekScore('wc-gw-group-matchday-1');
    // After settlement, .then() fires and the UI shows this value.
    expect(score.netPoints).toBe(48);
    expect(score.gameweek.name).toBe('Group Stage – Matchday 1');
  });
});

describe('fantasy-api getPlayerPool', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('passes seasonId through to the player-pool endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    vi.stubGlobal('fetch', fetchMock);

    await getPlayerPool(undefined, 'season-1');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/fantasy/player-pool?seasonId=season-1'),
      expect.any(Object),
    );
  });
});

describe('fantasy-api getPublicLeagues', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches joinable public leagues scoped to the season', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 'pub-1', name: 'Public League', memberCount: 42 }],
    });
    vi.stubGlobal('fetch', fetchMock);

    const leagues = await getPublicLeagues('season-1');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/fantasy/leagues/public?seasonId=season-1'),
      expect.any(Object),
    );
    expect(leagues[0]!.memberCount).toBe(42);
  });
});

describe('fantasy-api joinPublicLeague', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends leagueId in the body when joining a specific browsed league', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'member-1', leagueId: 'pub-specific' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await joinPublicLeague('season-1', 'pub-specific');

    const [, options] = fetchMock.mock.calls[0]!;
    expect(JSON.parse((options as RequestInit).body as string)).toEqual({
      seasonId: 'season-1',
      leagueId: 'pub-specific',
    });
  });

  it('omits a specific league (round-robin assignment) when leagueId is not given', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'member-1', leagueId: 'pub-auto' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await joinPublicLeague('season-1');

    const [, options] = fetchMock.mock.calls[0]!;
    expect(JSON.parse((options as RequestInit).body as string)).toEqual({
      seasonId: 'season-1',
      leagueId: undefined,
    });
  });
});

describe('fantasy-api validateSquad', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts to the validate endpoint and returns the composition result', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ isValid: false, errors: ['Captain not assigned'] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await validateSquad();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/fantasy/team/me/validate'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Captain not assigned');
  });
});
