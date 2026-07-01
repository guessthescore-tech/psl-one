import { describe, it, expect } from 'vitest';
import {
  FootballDataOrgLiveMatchAdapter,
  computePlayerStats,
  type FdMatchDetail,
} from './football-data-org-live-match.adapter';

// ── computePlayerStats unit tests ─────────────────────────────────────────────
//
// These tests pin the ID-namespace contract: playerProviderRef and teamProviderRef
// must be football-data.org numeric IDs (stringified). This is the invariant that
// lets syncProviderPlayerStats map provider stats to local players via externalId,
// since all beta WC fixtures carry football-data.org providerFixtureId values.

function makeMatch(overrides: Partial<FdMatchDetail> = {}): FdMatchDetail {
  return {
    id: 537336,
    status: 'FINISHED',
    homeTeam: { id: 773, name: 'Morocco' },
    awayTeam: { id: 770, name: 'England' },
    score: { fullTime: { home: 2, away: 1 } },
    goals: [],
    bookings: [],
    substitutions: [],
    lineups: [],
    ...overrides,
  };
}

describe('computePlayerStats — provider namespace contract', () => {
  it('playerProviderRef is the FDO numeric player ID as a string', () => {
    const match = makeMatch({
      goals: [
        {
          minute: 23,
          type: 'REGULAR',
          scorer: { id: 2472, name: 'En-Nesyri' },
          assist: null,
          team: { id: 773, name: 'Morocco' },
        },
      ],
    });
    const stats = computePlayerStats(match);
    expect(stats[0]!.playerProviderRef).toBe('2472');
  });

  it('teamProviderRef is the FDO numeric team ID as a string', () => {
    const match = makeMatch({
      goals: [
        {
          minute: 23,
          type: 'REGULAR',
          scorer: { id: 2472, name: 'En-Nesyri' },
          assist: null,
          team: { id: 773, name: 'Morocco' },
        },
      ],
    });
    const stats = computePlayerStats(match);
    expect(stats[0]!.teamProviderRef).toBe('773');
  });
});

describe('computePlayerStats — goals', () => {
  it('counts regular goals per player', () => {
    const match = makeMatch({
      goals: [
        { minute: 10, type: 'REGULAR', scorer: { id: 1, name: 'A' }, assist: null, team: { id: 773, name: 'Morocco' } },
        { minute: 20, type: 'REGULAR', scorer: { id: 1, name: 'A' }, assist: null, team: { id: 773, name: 'Morocco' } },
        { minute: 30, type: 'REGULAR', scorer: { id: 2, name: 'B' }, assist: null, team: { id: 770, name: 'England' } },
      ],
    });
    const stats = computePlayerStats(match);
    const p1 = stats.find((s) => s.playerProviderRef === '1');
    const p2 = stats.find((s) => s.playerProviderRef === '2');
    expect(p1?.goals).toBe(2);
    expect(p2?.goals).toBe(1);
  });

  it('own goals count as ownGoals not goals', () => {
    const match = makeMatch({
      goals: [
        { minute: 15, type: 'OWN_GOAL', scorer: { id: 99, name: 'Unlucky' }, assist: null, team: { id: 770, name: 'England' } },
      ],
    });
    const stats = computePlayerStats(match);
    const p = stats.find((s) => s.playerProviderRef === '99');
    expect(p?.ownGoals).toBe(1);
    expect(p?.goals).toBe(0);
  });

  it('penalty goals count as regular goals', () => {
    const match = makeMatch({
      goals: [
        { minute: 60, type: 'PENALTY', scorer: { id: 7, name: 'Kane' }, assist: null, team: { id: 770, name: 'England' } },
      ],
    });
    const stats = computePlayerStats(match);
    const p = stats.find((s) => s.playerProviderRef === '7');
    expect(p?.goals).toBe(1);
    expect(p?.ownGoals).toBe(0);
  });
});

describe('computePlayerStats — assists', () => {
  it('counts assist from goal.assist.id', () => {
    const match = makeMatch({
      goals: [
        {
          minute: 30,
          type: 'REGULAR',
          scorer: { id: 10, name: 'Scorer' },
          assist: { id: 8, name: 'Assister' },
          team: { id: 773, name: 'Morocco' },
        },
      ],
    });
    const stats = computePlayerStats(match);
    const assister = stats.find((s) => s.playerProviderRef === '8');
    expect(assister?.assists).toBe(1);
    expect(assister?.goals).toBe(0);
  });

  it('null assist is silently skipped', () => {
    const match = makeMatch({
      goals: [
        {
          minute: 30,
          type: 'REGULAR',
          scorer: { id: 10, name: 'Scorer' },
          assist: null,
          team: { id: 773, name: 'Morocco' },
        },
      ],
    });
    const stats = computePlayerStats(match);
    expect(stats.find((s) => s.assists > 0)).toBeUndefined();
  });
});

describe('computePlayerStats — bookings', () => {
  it('YELLOW_CARD increments yellowCards', () => {
    const match = makeMatch({
      bookings: [{ minute: 44, player: { id: 5, name: 'Dirty' }, team: { id: 773, name: 'Morocco' }, card: 'YELLOW_CARD' }],
    });
    const stats = computePlayerStats(match);
    expect(stats.find((s) => s.playerProviderRef === '5')?.yellowCards).toBe(1);
  });

  it('RED_CARD increments redCards', () => {
    const match = makeMatch({
      bookings: [{ minute: 80, player: { id: 6, name: 'Sent Off' }, team: { id: 773, name: 'Morocco' }, card: 'RED_CARD' }],
    });
    const stats = computePlayerStats(match);
    expect(stats.find((s) => s.playerProviderRef === '6')?.redCards).toBe(1);
  });
});

describe('computePlayerStats — minutesPlayed', () => {
  it('starting XI player not substituted off plays 90 minutes', () => {
    const match = makeMatch({
      lineups: [
        {
          team: { id: 773, name: 'Morocco' },
          startXI: [{ player: { id: 1, name: 'GK', position: 'G' } }],
          bench: [],
        },
      ],
    });
    const stats = computePlayerStats(match);
    expect(stats.find((s) => s.playerProviderRef === '1')?.minutesPlayed).toBe(90);
  });

  it('substituted-off player has minutesPlayed = substitution minute', () => {
    const match = makeMatch({
      lineups: [
        {
          team: { id: 773, name: 'Morocco' },
          startXI: [{ player: { id: 10, name: 'Starter', position: 'F' } }],
          bench: [{ player: { id: 20, name: 'Sub', position: 'M' } }],
        },
      ],
      substitutions: [
        { minute: 65, player: { id: 10, name: 'Starter' }, replacedBy: { id: 20, name: 'Sub' }, team: { id: 773, name: 'Morocco' } },
      ],
    });
    const stats = computePlayerStats(match);
    expect(stats.find((s) => s.playerProviderRef === '10')?.minutesPlayed).toBe(65);
    expect(stats.find((s) => s.playerProviderRef === '20')?.minutesPlayed).toBe(25);
  });

  it('substitute who comes on has cameOnMinute set', () => {
    const match = makeMatch({
      substitutions: [
        { minute: 70, player: { id: 9, name: 'Out' }, replacedBy: { id: 11, name: 'In' }, team: { id: 770, name: 'England' } },
      ],
    });
    const stats = computePlayerStats(match);
    expect(stats.find((s) => s.playerProviderRef === '11')?.cameOnMinute).toBe(70);
  });
});

describe('computePlayerStats — cleanSheet and goalsConceded', () => {
  it('home team player gets goalsConceded = away score', () => {
    // home=2, away=1 → home team conceded 1
    const match = makeMatch({
      score: { fullTime: { home: 2, away: 1 } },
      goals: [
        { minute: 5, type: 'REGULAR', scorer: { id: 50, name: 'HomeScorer' }, assist: null, team: { id: 773, name: 'Morocco' } },
      ],
    });
    const stats = computePlayerStats(match);
    expect(stats.find((s) => s.playerProviderRef === '50')?.goalsConceded).toBe(1);
  });

  it('cleanSheet is true for a player who played ≥60 min and team conceded 0', () => {
    // Morocco 2-0 England → Morocco players who played 90 min have cleanSheet
    const match = makeMatch({
      score: { fullTime: { home: 2, away: 0 } },
      lineups: [
        {
          team: { id: 773, name: 'Morocco' },
          startXI: [{ player: { id: 1, name: 'GK', position: 'G' } }],
          bench: [],
        },
      ],
      goals: [
        { minute: 23, type: 'REGULAR', scorer: { id: 2, name: 'Scorer' }, assist: null, team: { id: 773, name: 'Morocco' } },
        { minute: 67, type: 'REGULAR', scorer: { id: 2, name: 'Scorer' }, assist: null, team: { id: 773, name: 'Morocco' } },
      ],
    });
    const stats = computePlayerStats(match);
    expect(stats.find((s) => s.playerProviderRef === '1')?.cleanSheet).toBe(true);
    expect(stats.find((s) => s.playerProviderRef === '1')?.goalsConceded).toBe(0);
  });

  it('cleanSheet is false when team conceded ≥1 goal', () => {
    // home=0 → England concedes 2 (away score)
    const match = makeMatch({
      score: { fullTime: { home: 2, away: 0 } },
      lineups: [
        {
          team: { id: 770, name: 'England' },
          startXI: [{ player: { id: 99, name: 'England GK', position: 'G' } }],
          bench: [],
        },
      ],
    });
    const stats = computePlayerStats(match);
    expect(stats.find((s) => s.playerProviderRef === '99')?.cleanSheet).toBe(false);
    expect(stats.find((s) => s.playerProviderRef === '99')?.goalsConceded).toBe(2);
  });

  it('player who played <60 min does not get cleanSheet even if team conceded 0', () => {
    const match = makeMatch({
      score: { fullTime: { home: 1, away: 0 } },
      substitutions: [
        { minute: 45, player: { id: 99, name: 'Sub Off' }, replacedBy: { id: 88, name: 'Sub On' }, team: { id: 773, name: 'Morocco' } },
      ],
    });
    const stats = computePlayerStats(match);
    // player 99 subbed off at 45 → minutesPlayed=45 → no clean sheet
    expect(stats.find((s) => s.playerProviderRef === '99')?.cleanSheet).toBe(false);
    // player 88 came on at 45 → minutesPlayed=45 → no clean sheet
    expect(stats.find((s) => s.playerProviderRef === '88')?.cleanSheet).toBe(false);
  });
});

describe('computePlayerStats — empty match', () => {
  it('returns [] for a 0-0 draw with no events and no lineups', () => {
    const match = makeMatch({
      score: { fullTime: { home: 0, away: 0 } },
    });
    expect(computePlayerStats(match)).toEqual([]);
  });
});

// ── Provider namespace end-to-end ─────────────────────────────────────────────
//
// This test proves that the fixture ID used to call the adapter (a football-data.org
// numeric ID like "537336") is the same namespace as the providerFixtureId stored in
// the beta DB. No cross-provider ID translation is needed.
//
// Contrast with SportmonksLiveMatchAdapter: calling it with "537336" sends an FDO ID
// to Sportmonks, which knows nothing about FDO fixture IDs → always returns [].
// This adapter stays in the same namespace: FDO in → FDO out.

describe('FootballDataOrgLiveMatchAdapter — provider name and no-key safe mode', () => {
  it('providerName is "football-data-org"', () => {
    const adapter = new FootballDataOrgLiveMatchAdapter();
    expect(adapter.providerName).toBe('football-data-org');
  });

  it('fetchFixturePlayerStats returns [] when no API key is configured', async () => {
    const original = process.env['FOOTBALL_DATA_API_KEY'];
    delete process.env['FOOTBALL_DATA_API_KEY'];
    try {
      const adapter = new FootballDataOrgLiveMatchAdapter();
      const stats = await adapter.fetchFixturePlayerStats('537336');
      expect(stats).toEqual([]);
    } finally {
      if (original !== undefined) process.env['FOOTBALL_DATA_API_KEY'] = original;
    }
  });

  it('fetchFixtureEvents always returns [] (not available on free tier)', async () => {
    const adapter = new FootballDataOrgLiveMatchAdapter();
    const events = await adapter.fetchFixtureEvents('any-id');
    expect(events).toEqual([]);
  });
});
