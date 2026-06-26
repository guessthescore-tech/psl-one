import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FixtureStatus, MatchEventType } from '@prisma/client';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function json(body: unknown, status = 200) {
  return Promise.resolve({ ok: status >= 200 && status < 300, status, json: async () => body });
}

async function loadAdapter(apiKey?: string) {
  vi.stubEnv('SPORTMONKS_API_KEY', apiKey ?? '');
  vi.resetModules();
  const { SportmonksLiveMatchAdapter } = await import('./sportmonks-live-match.adapter');
  return new SportmonksLiveMatchAdapter();
}

describe('SportmonksLiveMatchAdapter', () => {

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  // ── providerName ─────────────────────────────────────────────────────────

  it('has providerName "sportmonks"', async () => {
    const adapter = await loadAdapter('test-key');
    expect(adapter.providerName).toBe('sportmonks');
  });

  // ── no-key safe mode ─────────────────────────────────────────────────────

  it('fetchFixtureState returns null when API key not set', async () => {
    const adapter = await loadAdapter('');
    const result = await adapter.fetchFixtureState('123');
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetchFixtureEvents returns [] when API key not set', async () => {
    const adapter = await loadAdapter('');
    const result = await adapter.fetchFixtureEvents('123');
    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetchFixtureLineups returns [] when API key not set', async () => {
    const adapter = await loadAdapter('');
    const result = await adapter.fetchFixtureLineups('123');
    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetchFixturePlayerStats returns [] when API key not set', async () => {
    const adapter = await loadAdapter('');
    const result = await adapter.fetchFixturePlayerStats('123');
    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // ── fetchFixtureState ─────────────────────────────────────────────────────

  it('fetchFixtureState returns null when API returns 401', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });
    const adapter = await loadAdapter('test-key');
    const result = await adapter.fetchFixtureState('123');
    expect(result).toBeNull();
  });

  it('fetchFixtureState maps a live fixture state correctly', async () => {
    const smFixture = {
      data: {
        id: 123,
        state: { state: 'live', short_name: 'LIVE' },
        scores: [
          { description: 'CURRENT', score: { participant: 'home', goals: 2 } },
          { description: 'CURRENT', score: { participant: 'away', goals: 1 } },
        ],
        periods: [
          { description: '1ST_HALF', started: '2026-06-15T14:00:00Z', ended: '2026-06-15T14:45:00Z' },
          { description: '2ND_HALF', started: '2026-06-15T15:00:00Z' },
        ],
      },
    };
    mockFetch.mockResolvedValueOnce(json(smFixture));
    const adapter = await loadAdapter('test-key');
    const result = await adapter.fetchFixtureState('123');

    expect(result).not.toBeNull();
    expect(result!.status).toBe(FixtureStatus.LIVE);
    expect(result!.homeScore).toBe(2);
    expect(result!.awayScore).toBe(1);
    expect(result!.providerFixtureId).toBe('123');
    expect(result!.halfTimeAt).toBeInstanceOf(Date);
    expect(result!.resumedAt).toBeInstanceOf(Date);
  });

  it('fetchFixtureState maps a finished fixture correctly', async () => {
    const smFixture = {
      data: {
        id: 456,
        state: { state: 'ft' },
        scores: [
          { description: 'CURRENT', score: { participant: 'home', goals: 3 } },
          { description: 'CURRENT', score: { participant: 'away', goals: 0 } },
        ],
        periods: [],
      },
    };
    mockFetch.mockResolvedValueOnce(json(smFixture));
    const adapter = await loadAdapter('test-key');
    const result = await adapter.fetchFixtureState('456');

    expect(result!.status).toBe(FixtureStatus.FINISHED);
    expect(result!.homeScore).toBe(3);
    expect(result!.awayScore).toBe(0);
  });

  it('fetchFixtureState returns null when data is missing', async () => {
    mockFetch.mockResolvedValueOnce(json({ data: null }));
    const adapter = await loadAdapter('test-key');
    const result = await adapter.fetchFixtureState('789');
    expect(result).toBeNull();
  });

  // ── fetchFixtureEvents ────────────────────────────────────────────────────

  it('fetchFixtureEvents maps goal events correctly', async () => {
    const smEvents = {
      data: [
        {
          id: 1001,
          type_id: 14,  // GOAL
          participant_id: 9,
          player_id: 55,
          minute: 34,
          extra_minute: null,
          section: '1ST_HALF',
          player_name: 'Test Scorer',
        },
        {
          id: 1002,
          type_id: 17,  // YELLOW_CARD
          participant_id: 9,
          player_id: 66,
          minute: 78,
          extra_minute: 2,
          section: '2ND_HALF',
        },
      ],
    };
    mockFetch.mockResolvedValueOnce(json(smEvents));
    const adapter = await loadAdapter('test-key');
    const result = await adapter.fetchFixtureEvents('123');

    expect(result).toHaveLength(2);
    expect(result[0]!.eventType).toBe(MatchEventType.GOAL);
    expect(result[0]!.minute).toBe(34);
    expect(result[0]!.providerEventId).toBe('1001');
    expect(result[0]!.teamProviderRef).toBe('9');
    expect(result[0]!.playerProviderRef).toBe('55');
    expect(result[0]!.description).toBe('Test Scorer');
    expect(result[1]!.eventType).toBe(MatchEventType.YELLOW_CARD);
    expect(result[1]!.stoppageMinute).toBe(2);
  });

  it('fetchFixtureEvents skips events with unknown type_id', async () => {
    const smEvents = {
      data: [
        { id: 2000, type_id: 14, participant_id: 1, player_id: 10, minute: 10 },
        { id: 2001, type_id: 999, participant_id: 1, player_id: 11, minute: 20 },  // unknown
      ],
    };
    mockFetch.mockResolvedValueOnce(json(smEvents));
    const adapter = await loadAdapter('test-key');
    const result = await adapter.fetchFixtureEvents('123');
    expect(result).toHaveLength(1);
    expect(result[0]!.eventType).toBe(MatchEventType.GOAL);
  });

  it('fetchFixtureEvents returns [] when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    const adapter = await loadAdapter('test-key');
    const result = await adapter.fetchFixtureEvents('123');
    expect(result).toEqual([]);
  });

  // ── fetchFixtureLineups ───────────────────────────────────────────────────

  it('fetchFixtureLineups maps starting and substitute entries', async () => {
    const smLineups = {
      data: [
        { player_id: 100, team_id: 9, type_id: 11, jersey_number: 1, position: { developer_name: 'Goalkeeper' } },
        { player_id: 200, team_id: 9, type_id: 12, jersey_number: 7, position: { developer_name: 'Forward' } },
        { player_id: 300, team_id: 10, type_id: 11, jersey_number: 4 },
      ],
    };
    mockFetch.mockResolvedValueOnce(json(smLineups));
    const adapter = await loadAdapter('test-key');
    const result = await adapter.fetchFixtureLineups('123');

    expect(result).toHaveLength(3);
    expect(result[0]!.status).toBe('STARTING');
    expect(result[0]!.playerProviderRef).toBe('100');
    expect(result[0]!.teamProviderRef).toBe('9');
    expect(result[0]!.shirtNumber).toBe(1);
    expect(result[0]!.position).toBe('Goalkeeper');
    expect(result[1]!.status).toBe('SUBSTITUTE');
    expect(result[2]!.status).toBe('STARTING');
    expect(result[2]!.position).toBeNull();
  });

  // ── fetchFixturePlayerStats ───────────────────────────────────────────────

  it('fetchFixturePlayerStats maps stat entries correctly', async () => {
    const smStats = {
      data: [
        {
          player_id: 55,
          team_id: 9,
          data: [
            { type_id: 119, value: { total: 90 } },  // MINUTES_PLAYED
            { type_id: 52, value: { total: 1 } },    // GOALS
            { type_id: 79, value: { total: 1 } },    // ASSISTS
            { type_id: 84, value: { total: 0 } },    // YELLOW_CARDS
            { type_id: 83, value: { total: 0 } },    // RED_CARDS
          ],
        },
      ],
    };
    mockFetch.mockResolvedValueOnce(json(smStats));
    const adapter = await loadAdapter('test-key');
    const result = await adapter.fetchFixturePlayerStats('123');

    expect(result).toHaveLength(1);
    expect(result[0]!.playerProviderRef).toBe('55');
    expect(result[0]!.teamProviderRef).toBe('9');
    expect(result[0]!.minutesPlayed).toBe(90);
    expect(result[0]!.goals).toBe(1);
    expect(result[0]!.assists).toBe(1);
    expect(result[0]!.cleanSheet).toBe(true);
  });

  it('fetchFixturePlayerStats skips entries without player_id or team_id', async () => {
    const smStats = {
      data: [
        { player_id: null, team_id: 9, data: [] },
        { player_id: 55, team_id: null, data: [] },
        { player_id: 66, team_id: 9, data: [{ type_id: 119, value: { total: 45 } }] },
      ],
    };
    mockFetch.mockResolvedValueOnce(json(smStats));
    const adapter = await loadAdapter('test-key');
    const result = await adapter.fetchFixturePlayerStats('123');
    expect(result).toHaveLength(1);
    expect(result[0]!.playerProviderRef).toBe('66');
  });

  it('fetchFixturePlayerStats handles numeric stat values', async () => {
    const smStats = {
      data: [
        {
          player_id: 77,
          team_id: 10,
          data: [
            { type_id: 119, value: 60 },  // numeric (not object)
            { type_id: 57, value: 3 },    // SAVES numeric
          ],
        },
      ],
    };
    mockFetch.mockResolvedValueOnce(json(smStats));
    const adapter = await loadAdapter('test-key');
    const result = await adapter.fetchFixturePlayerStats('123');
    expect(result[0]!.minutesPlayed).toBe(60);
    expect(result[0]!.saves).toBe(3);
  });
});
