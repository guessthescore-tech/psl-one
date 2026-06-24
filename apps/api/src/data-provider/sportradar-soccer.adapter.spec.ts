import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SportRadarSoccerAdapter } from './sportradar-soccer.adapter';

describe('SportRadarSoccerAdapter — safe mode (no key)', () => {
  beforeEach(() => { delete process.env['SPORTSRADAR_SOCCER_API_KEY']; });
  afterEach(() => { delete process.env['SPORTSRADAR_SOCCER_API_KEY']; });

  it('health returns available=false when key absent', async () => {
    const adapter = new SportRadarSoccerAdapter();
    const h = await adapter.health();
    expect(h.available).toBe(false);
    expect(h.provider).toBe('sportradar-soccer');
    expect(h.message).toContain('not configured');
  });

  it('getSeasons returns empty array when key absent', async () => {
    const adapter = new SportRadarSoccerAdapter();
    const seasons = await adapter.getSeasons();
    expect(seasons).toEqual([]);
  });

  it('getFixtures returns empty array when key absent', async () => {
    const adapter = new SportRadarSoccerAdapter();
    const fixtures = await adapter.getFixtures('sr:season:99');
    expect(fixtures).toEqual([]);
  });

  it('getTeams returns empty array when key absent', async () => {
    const adapter = new SportRadarSoccerAdapter();
    const teams = await adapter.getTeams('sr:season:99');
    expect(teams).toEqual([]);
  });

  it('getPlayers returns empty array when key absent', async () => {
    const adapter = new SportRadarSoccerAdapter();
    const players = await adapter.getPlayers('sr:competitor:99');
    expect(players).toEqual([]);
  });

  it('getStandings returns empty array when key absent', async () => {
    const adapter = new SportRadarSoccerAdapter();
    const standings = await adapter.getStandings('sr:season:99');
    expect(standings).toEqual([]);
  });

  it('getCompetitions returns empty array when key absent', async () => {
    const adapter = new SportRadarSoccerAdapter();
    const comps = await adapter.getCompetitions();
    expect(comps).toEqual([]);
  });

  it('name is sportradar-soccer', () => {
    const adapter = new SportRadarSoccerAdapter();
    expect(adapter.name).toBe('sportradar-soccer');
  });
});

describe('SportRadarSoccerAdapter — fetch error handling', () => {
  beforeEach(() => { process.env['SPORTSRADAR_SOCCER_API_KEY'] = 'test-sr-key'; });
  afterEach(() => { delete process.env['SPORTSRADAR_SOCCER_API_KEY']; vi.restoreAllMocks(); });

  it('health returns available=false on network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('connection refused'));
    const adapter = new SportRadarSoccerAdapter();
    const h = await adapter.health();
    expect(h.available).toBe(false);
  });

  it('health returns available=false on 401', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 401, json: async () => ({}) } as Response);
    const adapter = new SportRadarSoccerAdapter();
    const h = await adapter.health();
    expect(h.available).toBe(false);
  });

  it('health returns available=false on 429', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 429, json: async () => ({}) } as Response);
    const adapter = new SportRadarSoccerAdapter();
    const h = await adapter.health();
    expect(h.available).toBe(false);
  });

  it('health returns available=true on valid competitions response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true, status: 200,
      json: async () => ({ competitions: [{ id: 'sr:competition:1', name: 'FIFA World Cup' }] }),
    } as Response);
    const adapter = new SportRadarSoccerAdapter();
    const h = await adapter.health();
    expect(h.available).toBe(true);
    expect(h.message).toContain('OK');
  });

  it('getFixtures maps home and away team names', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true, status: 200,
      json: async () => ({
        summaries: [{
          sport_event: {
            id: 'sr:match:1',
            start_time: '2026-06-14T18:00:00Z',
            competitors: [
              { id: 'sr:c:1', name: 'Brazil', qualifier: 'home' },
              { id: 'sr:c:2', name: 'Germany', qualifier: 'away' },
            ],
          },
          sport_event_status: { status: 'not_started', home_score: null, away_score: null },
        }],
      }),
    } as Response);
    const adapter = new SportRadarSoccerAdapter();
    const fixtures = await adapter.getFixtures('sr:season:99');
    expect(fixtures).toHaveLength(1);
    expect(fixtures[0]?.homeTeamName).toBe('Brazil');
    expect(fixtures[0]?.awayTeamName).toBe('Germany');
    expect(fixtures[0]?.externalId).toBe('sr:match:1');
  });

  it('getTeams maps team data correctly', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true, status: 200,
      json: async () => ({
        season_competitors: [
          { id: 'sr:c:1', name: 'Brazil', abbreviation: 'BRA', country_code: 'BRA' },
        ],
      }),
    } as Response);
    const adapter = new SportRadarSoccerAdapter();
    const teams = await adapter.getTeams('sr:season:99');
    expect(teams).toHaveLength(1);
    expect(teams[0]?.name).toBe('Brazil');
    expect(teams[0]?.externalId).toBe('sr:c:1');
  });

  it('adapter URL never exposes API key in health check result', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('test'));
    const adapter = new SportRadarSoccerAdapter();
    const h = await adapter.health();
    const json = JSON.stringify(h);
    expect(json).not.toContain('test-sr-key');
    expect(json).not.toContain('SPORTSRADAR_SOCCER_API_KEY=');
  });
});
