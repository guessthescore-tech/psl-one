import 'reflect-metadata';
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('SportmonksAdapter', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
    vi.restoreAllMocks();
  });

  describe('no-key behaviour', () => {
    it('health returns disabled state when no API key', async () => {
      delete process.env['SPORTMONKS_API_KEY'];
      const { SportmonksAdapter } = await import('./sportmonks.adapter');
      const adapter = new SportmonksAdapter();
      const health = await adapter.health();
      expect(health.available).toBe(false);
      expect(health.message).toMatch(/not configured|disabled/i);
    });

    it('getSeasons returns empty array when no key', async () => {
      delete process.env['SPORTMONKS_API_KEY'];
      const { SportmonksAdapter } = await import('./sportmonks.adapter');
      const adapter = new SportmonksAdapter();
      expect(await adapter.getSeasons()).toEqual([]);
    });

    it('getFixtures returns empty array when no key', async () => {
      delete process.env['SPORTMONKS_API_KEY'];
      const { SportmonksAdapter } = await import('./sportmonks.adapter');
      const adapter = new SportmonksAdapter();
      expect(await adapter.getFixtures('1234')).toEqual([]);
    });

    it('getTeams returns empty array when no key', async () => {
      delete process.env['SPORTMONKS_API_KEY'];
      const { SportmonksAdapter } = await import('./sportmonks.adapter');
      const adapter = new SportmonksAdapter();
      expect(await adapter.getTeams('1234')).toEqual([]);
    });

    it('getPlayers returns empty array when no key', async () => {
      delete process.env['SPORTMONKS_API_KEY'];
      const { SportmonksAdapter } = await import('./sportmonks.adapter');
      const adapter = new SportmonksAdapter();
      expect(await adapter.getPlayers('1234')).toEqual([]);
    });

    it('getStandings returns empty array when no key', async () => {
      delete process.env['SPORTMONKS_API_KEY'];
      const { SportmonksAdapter } = await import('./sportmonks.adapter');
      const adapter = new SportmonksAdapter();
      expect(await adapter.getStandings('1234')).toEqual([]);
    });

    it('health response does not include API key', async () => {
      delete process.env['SPORTMONKS_API_KEY'];
      const { SportmonksAdapter } = await import('./sportmonks.adapter');
      const adapter = new SportmonksAdapter();
      const health = await adapter.health();
      expect(JSON.stringify(health)).not.toMatch(/api_token|SPORTMONKS_API_KEY|Bearer/i);
    });
  });

  describe('response mapping (mocked fetch)', () => {
    it('maps fixture response to ProviderFixture', async () => {
      process.env['SPORTMONKS_API_KEY'] = 'test-key';
      const mockResponse = {
        data: [{
          id: 1001,
          name: 'Home vs Away',
          starting_at: '2026-07-01T15:00:00Z',
          state: { short_name: 'FT' },
          participants: [
            { name: 'Home FC', short_code: 'HFC', meta: { location: 'home' } },
            { name: 'Away United', short_code: 'AUN', meta: { location: 'away' } },
          ],
          scores: [{ description: 'CURRENT', score: { goals: 2 } }],
        }],
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      }));

      const { SportmonksAdapter } = await import('./sportmonks.adapter');
      const adapter = new SportmonksAdapter();
      const fixtures = await adapter.getFixtures('season-1');

      expect(fixtures).toHaveLength(1);
      expect(fixtures[0]!.externalId).toBe('1001');
      expect(fixtures[0]!.homeTeamName).toBe('Home FC');
      expect(fixtures[0]!.awayTeamName).toBe('Away United');
      expect(fixtures[0]!.kickoffAt).toBe('2026-07-01T15:00:00Z');
    });

    it('maps team response to ProviderTeam', async () => {
      process.env['SPORTMONKS_API_KEY'] = 'test-key';
      const mockResponse = {
        data: [{
          id: 501,
          name: 'Mamelodi Sundowns',
          short_code: 'SUN',
          country: { iso2: 'ZA' },
        }],
      };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true, status: 200, json: async () => mockResponse,
      }));

      const { SportmonksAdapter } = await import('./sportmonks.adapter');
      const adapter = new SportmonksAdapter();
      const teams = await adapter.getTeams('season-1');

      expect(teams).toHaveLength(1);
      expect(teams[0]!.externalId).toBe('501');
      expect(teams[0]!.name).toBe('Mamelodi Sundowns');
      expect(teams[0]!.countryCode).toBe('ZA');
    });

    it('handles 401 gracefully', async () => {
      process.env['SPORTMONKS_API_KEY'] = 'bad-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }));

      const { SportmonksAdapter } = await import('./sportmonks.adapter');
      const adapter = new SportmonksAdapter();
      const result = await adapter.getSeasons();
      expect(result).toEqual([]);
    });

    it('handles 429 gracefully', async () => {
      process.env['SPORTMONKS_API_KEY'] = 'key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) }));

      const { SportmonksAdapter } = await import('./sportmonks.adapter');
      const adapter = new SportmonksAdapter();
      const result = await adapter.getFixtures('s-1');
      expect(result).toEqual([]);
    });

    it('handles network error gracefully', async () => {
      process.env['SPORTMONKS_API_KEY'] = 'key';
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

      const { SportmonksAdapter } = await import('./sportmonks.adapter');
      const adapter = new SportmonksAdapter();
      const result = await adapter.health();
      expect(result.available).toBe(false);
    });

    it('fetch does not leak API key in response', async () => {
      process.env['SPORTMONKS_API_KEY'] = 'super-secret-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: [] }) }));

      const { SportmonksAdapter } = await import('./sportmonks.adapter');
      const adapter = new SportmonksAdapter();
      const seasons = await adapter.getSeasons();
      expect(JSON.stringify(seasons)).not.toContain('super-secret-key');
    });
  });
});
