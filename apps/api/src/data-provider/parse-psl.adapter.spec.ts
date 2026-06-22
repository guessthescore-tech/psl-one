import 'reflect-metadata';
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('ParsePslAdapter', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
    vi.restoreAllMocks();
  });

  // ── no-key behaviour ──────────────────────────────────────────────────────

  describe('no-key behaviour', () => {
    it('health returns available:false when PARSE_API_KEY absent', async () => {
      delete process.env['PARSE_API_KEY'];
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      const result = await adapter.health();
      expect(result.available).toBe(false);
    });

    it('health message matches /not configured/i', async () => {
      delete process.env['PARSE_API_KEY'];
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      const result = await adapter.health();
      expect(result.message).toMatch(/not configured/i);
    });

    it('getSeasons returns []', async () => {
      delete process.env['PARSE_API_KEY'];
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      expect(await adapter.getSeasons()).toEqual([]);
    });

    it('getFixtures returns [] when no key', async () => {
      delete process.env['PARSE_API_KEY'];
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      expect(await adapter.getFixtures('2025')).toEqual([]);
    });

    it('getTeams returns [] when no key', async () => {
      delete process.env['PARSE_API_KEY'];
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      expect(await adapter.getTeams('2025')).toEqual([]);
    });

    it('getPlayers returns [] when no key', async () => {
      delete process.env['PARSE_API_KEY'];
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      expect(await adapter.getPlayers('team-1')).toEqual([]);
    });

    it('getStandings returns [] when no key', async () => {
      delete process.env['PARSE_API_KEY'];
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      expect(await adapter.getStandings('2025')).toEqual([]);
    });
  });

  // ── error handling ────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('401 response → getFixtures returns []', async () => {
      process.env['PARSE_API_KEY'] = 'test-key';
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(null, { status: 401 }),
      );
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      expect(await adapter.getFixtures('2025')).toEqual([]);
    });

    it('403 response → getTeams returns []', async () => {
      process.env['PARSE_API_KEY'] = 'test-key';
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(null, { status: 403 }),
      );
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      expect(await adapter.getTeams('2025')).toEqual([]);
    });

    it('429 response → health returns available:false', async () => {
      process.env['PARSE_API_KEY'] = 'test-key';
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(null, { status: 429 }),
      );
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      const result = await adapter.health();
      expect(result.available).toBe(false);
    });

    it('network error → getStandings returns []', async () => {
      process.env['PARSE_API_KEY'] = 'test-key';
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network failure'));
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      expect(await adapter.getStandings('2025')).toEqual([]);
    });

    it('empty fixtures array (HTTP 200, { fixtures: [] }) → getFixtures returns [] — source-empty, not failure', async () => {
      process.env['PARSE_API_KEY'] = 'test-key';
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ fixtures: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      expect(await adapter.getFixtures('2025')).toEqual([]);
    });
  });

  // ── response mapping ──────────────────────────────────────────────────────

  describe('response mapping', () => {
    it('health returns available:true when fixtures endpoint responds (even empty array)', async () => {
      process.env['PARSE_API_KEY'] = 'test-key';
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ fixtures: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      const result = await adapter.health();
      expect(result.available).toBe(true);
    });

    it('getFixtures maps home_team, away_team, date, time, id', async () => {
      process.env['PARSE_API_KEY'] = 'test-key';
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({
            fixtures: [
              {
                id: 'fix-001',
                home_team: 'Mamelodi Sundowns',
                away_team: 'Orlando Pirates',
                date: '2025-08-10',
                time: '15:00',
                status: 'SCHEDULED',
                venue: 'Loftus Versfeld',
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      const fixtures = await adapter.getFixtures('2025');
      expect(fixtures).toHaveLength(1);
      expect(fixtures[0]).toMatchObject({
        externalId: 'fix-001',
        homeTeamName: 'Mamelodi Sundowns',
        awayTeamName: 'Orlando Pirates',
        kickoffAt: '2025-08-10T15:00',
        status: 'SCHEDULED',
      });
    });

    it('getTeams maps club list: externalId, name, shortName, countryCode = ZA', async () => {
      process.env['PARSE_API_KEY'] = 'test-key';
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({
            clubs: [
              {
                id: 'club-1',
                name: 'Mamelodi Sundowns',
                short_name: 'Sundowns',
                badge_url: 'https://example.com/badge.png',
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      const teams = await adapter.getTeams('2025');
      expect(teams).toHaveLength(1);
      expect(teams[0]).toMatchObject({
        externalId: 'club-1',
        name: 'Mamelodi Sundowns',
        shortName: 'Sundowns',
        countryCode: 'ZA',
      });
    });

    it('getStandings maps position, points, played, won, drawn, lost', async () => {
      process.env['PARSE_API_KEY'] = 'test-key';
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({
            standings: [
              {
                position: 1,
                team: 'Mamelodi Sundowns',
                team_id: 'club-1',
                played: 10,
                won: 8,
                drawn: 1,
                lost: 1,
                goals_for: 22,
                goals_against: 7,
                points: 25,
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      const standings = await adapter.getStandings('2025');
      expect(standings).toHaveLength(1);
      expect(standings[0]).toMatchObject({
        externalId: 'club-1',
        teamName: 'Mamelodi Sundowns',
        position: 1,
        points: 25,
        played: 10,
        won: 8,
        drawn: 1,
        lost: 1,
      });
    });

    it('adapter.name === "parse-psl"', async () => {
      delete process.env['PARSE_API_KEY'];
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      expect(adapter.name).toBe('parse-psl');
    });

    it('getPlayers returns [] (graceful — not yet implemented)', async () => {
      process.env['PARSE_API_KEY'] = 'test-key';
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      expect(await adapter.getPlayers('club-1')).toEqual([]);
    });

    it('getFixtures with data wrapped directly (no fixtures key) still maps correctly', async () => {
      process.env['PARSE_API_KEY'] = 'test-key';
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify([
            {
              id: 'fix-002',
              home_team: 'Kaizer Chiefs',
              away_team: 'SuperSport United',
              date: '2025-09-01',
              time: '17:30',
              status: 'SCHEDULED',
            },
          ]),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );
      const { ParsePslAdapter } = await import('./parse-psl.adapter');
      const adapter = new ParsePslAdapter();
      const fixtures = await adapter.getFixtures('2025');
      expect(fixtures).toHaveLength(1);
      expect(fixtures[0]).toMatchObject({
        externalId: 'fix-002',
        homeTeamName: 'Kaizer Chiefs',
        awayTeamName: 'SuperSport United',
        kickoffAt: '2025-09-01T17:30',
      });
    });
  });

  // ── security ──────────────────────────────────────────────────────────────

  describe('security', () => {
    const src = require('fs').readFileSync(
      require('path').resolve(__dirname, 'parse-psl.adapter.ts'),
      'utf8',
    );

    it('uses X-API-Key header', () => {
      expect(src).toContain('X-API-Key');
    });

    it('does not use NEXT_PUBLIC_ env vars', () => {
      expect(src).not.toMatch(/process\.env\[.*NEXT_PUBLIC_/);
      expect(src).not.toMatch(/process\.env\.NEXT_PUBLIC_/);
    });

    it('does not call betting/odds endpoints', () => {
      expect(src).not.toMatch(/\/odds\/|\/bets\/|\/betting\//i);
    });

    it('source-empty fixtures handled without error: dual-shape response pattern is present', () => {
      // Actual pattern: (data as T).fixtures ?? (Array.isArray(data) ? data : [])
      expect(src).toMatch(/\.fixtures\s*\?\?/);
    });
  });
});
