import 'reflect-metadata';
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('SportsDataIoSoccerAdapter', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
    vi.restoreAllMocks();
  });

  // ── No-key safety ──────────────────────────────────────────────────────────

  describe('no-key behaviour', () => {
    it('health returns disabled when no key configured', async () => {
      delete process.env['SPORTSDATAIO_SOCCER_API_KEY'];
      const { SportsDataIoSoccerAdapter } = await import('./sportsdataio.adapter');
      const adapter = new SportsDataIoSoccerAdapter();
      const result = await adapter.health();
      expect(result.available).toBe(false);
      expect(result.message).toMatch(/not configured|disabled/i);
    });

    it('getSeasons returns empty array when no key', async () => {
      delete process.env['SPORTSDATAIO_SOCCER_API_KEY'];
      const { SportsDataIoSoccerAdapter } = await import('./sportsdataio.adapter');
      expect(await new SportsDataIoSoccerAdapter().getSeasons()).toEqual([]);
    });

    it('getFixtures returns empty array when no key', async () => {
      delete process.env['SPORTSDATAIO_SOCCER_API_KEY'];
      const { SportsDataIoSoccerAdapter } = await import('./sportsdataio.adapter');
      expect(await new SportsDataIoSoccerAdapter().getFixtures('2024')).toEqual([]);
    });

    it('getTeams returns empty array when no key', async () => {
      delete process.env['SPORTSDATAIO_SOCCER_API_KEY'];
      const { SportsDataIoSoccerAdapter } = await import('./sportsdataio.adapter');
      expect(await new SportsDataIoSoccerAdapter().getTeams('2024')).toEqual([]);
    });

    it('getPlayers returns empty array when no key', async () => {
      delete process.env['SPORTSDATAIO_SOCCER_API_KEY'];
      const { SportsDataIoSoccerAdapter } = await import('./sportsdataio.adapter');
      expect(await new SportsDataIoSoccerAdapter().getPlayers('501')).toEqual([]);
    });

    it('getStandings returns empty array when no key', async () => {
      delete process.env['SPORTSDATAIO_SOCCER_API_KEY'];
      const { SportsDataIoSoccerAdapter } = await import('./sportsdataio.adapter');
      expect(await new SportsDataIoSoccerAdapter().getStandings('2024')).toEqual([]);
    });

    it('adapter name is sportsdataio', async () => {
      delete process.env['SPORTSDATAIO_SOCCER_API_KEY'];
      const { SportsDataIoSoccerAdapter } = await import('./sportsdataio.adapter');
      expect(new SportsDataIoSoccerAdapter().name).toBe('sportsdataio');
    });

    it('health response does not include API key', async () => {
      delete process.env['SPORTSDATAIO_SOCCER_API_KEY'];
      const { SportsDataIoSoccerAdapter } = await import('./sportsdataio.adapter');
      const health = await new SportsDataIoSoccerAdapter().health();
      const serialised = JSON.stringify(health);
      expect(serialised).not.toMatch(/Ocp-Apim-Subscription-Key|SPORTSDATAIO_SOCCER_API_KEY/i);
    });
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  describe('error handling (mocked fetch)', () => {
    it('health returns false on 401', async () => {
      process.env['SPORTSDATAIO_SOCCER_API_KEY'] = 'bad-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }));
      const { SportsDataIoSoccerAdapter } = await import('./sportsdataio.adapter');
      const result = await new SportsDataIoSoccerAdapter().health();
      expect(result.available).toBe(false);
    });

    it('health returns false on 403', async () => {
      process.env['SPORTSDATAIO_SOCCER_API_KEY'] = 'key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403, json: async () => ({}) }));
      const { SportsDataIoSoccerAdapter } = await import('./sportsdataio.adapter');
      const result = await new SportsDataIoSoccerAdapter().health();
      expect(result.available).toBe(false);
    });

    it('getFixtures returns empty on 429 rate limit', async () => {
      process.env['SPORTSDATAIO_SOCCER_API_KEY'] = 'key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) }));
      const { SportsDataIoSoccerAdapter } = await import('./sportsdataio.adapter');
      expect(await new SportsDataIoSoccerAdapter().getFixtures('2024')).toEqual([]);
    });

    it('health returns false on network error', async () => {
      process.env['SPORTSDATAIO_SOCCER_API_KEY'] = 'key';
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));
      const { SportsDataIoSoccerAdapter } = await import('./sportsdataio.adapter');
      const result = await new SportsDataIoSoccerAdapter().health();
      expect(result.available).toBe(false);
    });
  });

  // ── Response mapping (mocked) ─────────────────────────────────────────────

  describe('response mapping', () => {
    it('maps game response to ProviderFixture', async () => {
      process.env['SPORTSDATAIO_SOCCER_API_KEY'] = 'test-key';
      const mockGame = [{
        GameId: 9001,
        HomeTeamName: 'Man City',
        AwayTeamName: 'Real Madrid',
        Day: '2026-04-15T19:00:00',
        Status: 'Scheduled',
        HomeTeamScore: null,
        AwayTeamScore: null,
      }];
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true, status: 200, json: async () => mockGame,
      }));
      const { SportsDataIoSoccerAdapter } = await import('./sportsdataio.adapter');
      const fixtures = await new SportsDataIoSoccerAdapter().getFixtures('2024');
      expect(fixtures).toHaveLength(1);
      expect(fixtures[0]!.externalId).toBe('9001');
      expect(fixtures[0]!.homeTeamName).toBe('Man City');
      expect(fixtures[0]!.status).toBe('SCHEDULED');
    });

    it('maps Final status to FINISHED', async () => {
      process.env['SPORTSDATAIO_SOCCER_API_KEY'] = 'test-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true, status: 200, json: async () => [{ GameId: 1, Status: 'Final', HomeTeamScore: 2, AwayTeamScore: 1 }],
      }));
      const { SportsDataIoSoccerAdapter } = await import('./sportsdataio.adapter');
      const fixtures = await new SportsDataIoSoccerAdapter().getFixtures('2024');
      expect(fixtures[0]!.status).toBe('FINISHED');
      expect(fixtures[0]!.homeScore).toBe(2);
    });

    it('maps team response to ProviderTeam', async () => {
      process.env['SPORTSDATAIO_SOCCER_API_KEY'] = 'test-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true, status: 200, json: async () => [{ TeamId: 501, Name: 'Arsenal', ShortName: 'ARS', AreaId: 44 }],
      }));
      const { SportsDataIoSoccerAdapter } = await import('./sportsdataio.adapter');
      const teams = await new SportsDataIoSoccerAdapter().getTeams('2024');
      expect(teams[0]!.externalId).toBe('501');
      expect(teams[0]!.shortName).toBe('ARS');
    });

    it('maps standings response to ProviderStandings', async () => {
      process.env['SPORTSDATAIO_SOCCER_API_KEY'] = 'test-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true, status: 200, json: async () => [{
          TeamId: 501, TeamName: 'Arsenal', Order: 1, Points: 70,
          Games: 30, Wins: 22, Draws: 4, Losses: 4, GoalsScored: 68, GoalsAgainst: 22,
        }],
      }));
      const { SportsDataIoSoccerAdapter } = await import('./sportsdataio.adapter');
      const standings = await new SportsDataIoSoccerAdapter().getStandings('2024');
      expect(standings[0]!.position).toBe(1);
      expect(standings[0]!.points).toBe(70);
      expect(standings[0]!.goalsFor).toBe(68);
    });

    it('does not expose API key in response data', async () => {
      process.env['SPORTSDATAIO_SOCCER_API_KEY'] = 'super-secret-sdio-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true, status: 200, json: async () => [],
      }));
      const { SportsDataIoSoccerAdapter } = await import('./sportsdataio.adapter');
      const seasons = await new SportsDataIoSoccerAdapter().getSeasons();
      expect(JSON.stringify(seasons)).not.toContain('super-secret-sdio-key');
    });
  });

  // ── Security ──────────────────────────────────────────────────────────────

  describe('security', () => {
    it('uses Ocp-Apim-Subscription-Key header (server-side only)', async () => {
      const adapterSource = require('fs').readFileSync(
        require('path').resolve(__dirname, 'sportsdataio.adapter.ts'), 'utf8'
      );
      expect(adapterSource).toContain('Ocp-Apim-Subscription-Key');
      expect(adapterSource).not.toContain('NEXT_PUBLIC_');
    });

    it('does not call gambling-adjacency URL paths', async () => {
      const adapterSource = require('fs').readFileSync(
        require('path').resolve(__dirname, 'sportsdataio.adapter.ts'), 'utf8'
      );
      // No URL path segments for prohibited endpoint categories
      expect(adapterSource).not.toMatch(/\/odds\/|\/betting\/|\/wager\/|\/gambling\/|BettingMarket|OddsLine/i);
    });

    it('adapter not yet wired into DataProviderService (candidate only)', async () => {
      const serviceSource = require('fs').readFileSync(
        require('path').resolve(__dirname, 'data-provider.service.ts'), 'utf8'
      );
      expect(serviceSource).not.toContain('SportsDataIo');
    });
  });
});
