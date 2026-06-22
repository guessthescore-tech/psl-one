import 'reflect-metadata';
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('ApiFootballAdapter', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
    vi.restoreAllMocks();
  });

  // ── No-key safety ──────────────────────────────────────────────────────────

  describe('no-key behaviour', () => {
    it('health returns available:false when key not configured', async () => {
      delete process.env['API_FOOTBALL_KEY'];
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      const adapter = new ApiFootballAdapter();
      const result = await adapter.health();
      expect(result.available).toBe(false);
      expect(result.message).toMatch(/not configured/i);
    });

    it('getSeasons returns empty array when no key', async () => {
      delete process.env['API_FOOTBALL_KEY'];
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      expect(await new ApiFootballAdapter().getSeasons()).toEqual([]);
    });

    it('getFixtures returns empty array when no key', async () => {
      delete process.env['API_FOOTBALL_KEY'];
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      expect(await new ApiFootballAdapter().getFixtures('2025')).toEqual([]);
    });

    it('getTeams returns empty array when no key', async () => {
      delete process.env['API_FOOTBALL_KEY'];
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      expect(await new ApiFootballAdapter().getTeams('2025')).toEqual([]);
    });

    it('getPlayers returns empty array when no key', async () => {
      delete process.env['API_FOOTBALL_KEY'];
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      expect(await new ApiFootballAdapter().getPlayers('1234')).toEqual([]);
    });

    it('getStandings returns empty array when no key', async () => {
      delete process.env['API_FOOTBALL_KEY'];
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      expect(await new ApiFootballAdapter().getStandings('2025')).toEqual([]);
    });

    it('adapter name is api-football', async () => {
      delete process.env['API_FOOTBALL_KEY'];
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      expect(new ApiFootballAdapter().name).toBe('api-football');
    });

    it('health response never exposes api key or auth header name', async () => {
      delete process.env['API_FOOTBALL_KEY'];
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      const health = await new ApiFootballAdapter().health();
      const serialised = JSON.stringify(health);
      expect(serialised).not.toMatch(/api_key|apiKey|x-apisports/i);
    });
  });

  // ── Error handling (mocked fetch) ─────────────────────────────────────────

  describe('error handling', () => {
    it('health returns false on 401', async () => {
      process.env['API_FOOTBALL_KEY'] = 'bad-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }));
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      const result = await new ApiFootballAdapter().health();
      expect(result.available).toBe(false);
    });

    it('health returns false on 403', async () => {
      process.env['API_FOOTBALL_KEY'] = 'key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403, json: async () => ({}) }));
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      const result = await new ApiFootballAdapter().health();
      expect(result.available).toBe(false);
    });

    it('getFixtures returns empty on 429 rate limit', async () => {
      process.env['API_FOOTBALL_KEY'] = 'key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) }));
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      expect(await new ApiFootballAdapter().getFixtures('2025')).toEqual([]);
    });

    it('health returns false on network error', async () => {
      process.env['API_FOOTBALL_KEY'] = 'key';
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      const result = await new ApiFootballAdapter().health();
      expect(result.available).toBe(false);
    });

    it('getFixtures returns [] when body contains errors.access (suspended account)', async () => {
      process.env['API_FOOTBALL_KEY'] = 'suspended-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          errors: { access: 'Your account is suspended, check on https://dashboard.api-football.com.' },
          response: [],
        }),
      }));
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      expect(await new ApiFootballAdapter().getFixtures('2025')).toEqual([]);
    });

    it('health returns available:false when body contains errors object', async () => {
      process.env['API_FOOTBALL_KEY'] = 'suspended-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          errors: { access: 'Your account is suspended.' },
          response: [],
        }),
      }));
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      const result = await new ApiFootballAdapter().health();
      expect(result.available).toBe(false);
    });
  });

  // ── Response mapping (mocked) ─────────────────────────────────────────────

  describe('response mapping', () => {
    it('maps fixture response to ProviderFixture', async () => {
      process.env['API_FOOTBALL_KEY'] = 'test-key';
      const mockFixture = {
        response: [{
          fixture: { id: 850001, date: '2025-09-14T15:00:00+00:00', status: { short: 'NS' } },
          teams: { home: { name: 'Kaizer Chiefs' }, away: { name: 'Orlando Pirates' } },
          goals: { home: null, away: null },
        }],
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true, status: 200, json: async () => mockFixture,
      }));
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      const fixtures = await new ApiFootballAdapter().getFixtures('2025');
      expect(fixtures).toHaveLength(1);
      expect(fixtures[0]!.externalId).toBe('850001');
      expect(fixtures[0]!.homeTeamName).toBe('Kaizer Chiefs');
      expect(fixtures[0]!.awayTeamName).toBe('Orlando Pirates');
      expect(fixtures[0]!.status).toBe('NS');
      expect(fixtures[0]!.homeScore).toBeUndefined();
    });

    it('maps finished fixture with scores', async () => {
      process.env['API_FOOTBALL_KEY'] = 'test-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true, status: 200, json: async () => ({
          response: [{
            fixture: { id: 850002, date: '2025-08-10T15:00:00+00:00', status: { short: 'FT' } },
            teams: { home: { name: 'Mamelodi Sundowns' }, away: { name: 'SuperSport United' } },
            goals: { home: 3, away: 1 },
          }],
        }),
      }));
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      const fixtures = await new ApiFootballAdapter().getFixtures('2025');
      expect(fixtures[0]!.status).toBe('FT');
      expect(fixtures[0]!.homeScore).toBe(3);
      expect(fixtures[0]!.awayScore).toBe(1);
    });

    it('maps team response to ProviderTeam with ZA country code', async () => {
      process.env['API_FOOTBALL_KEY'] = 'test-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true, status: 200, json: async () => ({
          response: [{ team: { id: 611, name: 'Kaizer Chiefs' } }],
        }),
      }));
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      const teams = await new ApiFootballAdapter().getTeams('2025');
      expect(teams[0]!.externalId).toBe('611');
      expect(teams[0]!.name).toBe('Kaizer Chiefs');
      expect(teams[0]!.shortName).toBe('Kaizer C');
      expect(teams[0]!.countryCode).toBe('ZA');
    });

    it('maps player response to ProviderPlayer', async () => {
      process.env['API_FOOTBALL_KEY'] = 'test-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true, status: 200, json: async () => ({
          response: [{
            player: { id: 50001, name: 'Khama Billiat' },
            statistics: [{ games: { position: 'Attacker' } }],
          }],
        }),
      }));
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      const players = await new ApiFootballAdapter().getPlayers('611');
      expect(players[0]!.externalId).toBe('50001');
      expect(players[0]!.name).toBe('Khama Billiat');
      expect(players[0]!.position).toBe('Attacker');
      expect(players[0]!.teamExternalId).toBe('611');
    });

    it('maps seasons response to ProviderSeason', async () => {
      process.env['API_FOOTBALL_KEY'] = 'test-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true, status: 200, json: async () => ({
          response: [{
            league: { id: 288, name: 'Premier Soccer League' },
            seasons: [
              { year: 2024, start: '2024-08-01', end: '2025-05-31', current: false },
              { year: 2025, start: '2025-08-01', end: '2026-05-31', current: true },
            ],
          }],
        }),
      }));
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      const seasons = await new ApiFootballAdapter().getSeasons();
      expect(seasons).toHaveLength(2);
      expect(seasons[0]!.externalId).toBe('2024');
      expect(seasons[0]!.competitionName).toBe('Premier Soccer League');
      expect(seasons[1]!.externalId).toBe('2025');
    });

    it('maps standings response to ProviderStandings', async () => {
      process.env['API_FOOTBALL_KEY'] = 'test-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true, status: 200, json: async () => ({
          response: [{
            league: {
              standings: [[{
                rank: 1,
                team: { id: 612, name: 'Mamelodi Sundowns' },
                points: 72,
                all: { played: 30, win: 23, draw: 3, lose: 4, goals: { for: 65, against: 22 } },
              }]],
            },
          }],
        }),
      }));
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      const standings = await new ApiFootballAdapter().getStandings('2025');
      expect(standings[0]!.externalId).toBe('612');
      expect(standings[0]!.teamName).toBe('Mamelodi Sundowns');
      expect(standings[0]!.position).toBe(1);
      expect(standings[0]!.points).toBe(72);
      expect(standings[0]!.goalsFor).toBe(65);
      expect(standings[0]!.goalsAgainst).toBe(22);
    });

    it('does not expose API key in fixture response data', async () => {
      process.env['API_FOOTBALL_KEY'] = 'super-secret-af-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true, status: 200, json: async () => ({ response: [] }),
      }));
      const { ApiFootballAdapter } = await import('./api-football.adapter');
      const fixtures = await new ApiFootballAdapter().getFixtures('2025');
      expect(JSON.stringify(fixtures)).not.toContain('super-secret-af-key');
    });
  });

  // ── Security ──────────────────────────────────────────────────────────────

  describe('security', () => {
    it('uses x-apisports-key header (server-side only) and not NEXT_PUBLIC_', async () => {
      const adapterSource = require('fs').readFileSync(
        require('path').resolve(__dirname, 'api-football.adapter.ts'), 'utf8',
      );
      expect(adapterSource).toContain('x-apisports-key');
      expect(adapterSource).not.toContain('NEXT_PUBLIC_');
    });

    it('does not call betting or odds endpoint paths', async () => {
      const adapterSource = require('fs').readFileSync(
        require('path').resolve(__dirname, 'api-football.adapter.ts'), 'utf8',
      );
      expect(adapterSource).not.toMatch(/\/odds\/|\/bets\/|\/betting\/|\/bookmakers\/|\/predictions\//i);
    });

    it('ApiFootballAdapter is wired into DataProviderService via DATA_PROVIDER flag', async () => {
      const serviceSource = require('fs').readFileSync(
        require('path').resolve(__dirname, 'data-provider.service.ts'), 'utf8',
      );
      // Sprint 11: wired via explicit DATA_PROVIDER=api-football flag, not auto-selected
      expect(serviceSource).toContain('ApiFootballAdapter');
      expect(serviceSource).toContain('DATA_PROVIDER');
      expect(serviceSource).toContain("provider === 'api-football'");
    });
  });
});
