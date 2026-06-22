import 'reflect-metadata';
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('FootballDataOrgAdapter', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
    vi.restoreAllMocks();
  });

  // ── No-key safety ──────────────────────────────────────────────────────────

  describe('no-key behaviour', () => {
    it('health returns available:false when key not configured', async () => {
      delete process.env['FOOTBALL_DATA_API_KEY'];
      const { FootballDataOrgAdapter } = await import('./football-data-org.adapter');
      const adapter = new FootballDataOrgAdapter();
      const result = await adapter.health();
      expect(result.available).toBe(false);
      expect(result.message).toMatch(/not configured/i);
    });

    it('getSeasons returns empty array when no key', async () => {
      delete process.env['FOOTBALL_DATA_API_KEY'];
      const { FootballDataOrgAdapter } = await import('./football-data-org.adapter');
      expect(await new FootballDataOrgAdapter().getSeasons()).toEqual([]);
    });

    it('getFixtures returns empty array when no key', async () => {
      delete process.env['FOOTBALL_DATA_API_KEY'];
      const { FootballDataOrgAdapter } = await import('./football-data-org.adapter');
      expect(await new FootballDataOrgAdapter().getFixtures('2026')).toEqual([]);
    });

    it('getTeams returns empty array when no key', async () => {
      delete process.env['FOOTBALL_DATA_API_KEY'];
      const { FootballDataOrgAdapter } = await import('./football-data-org.adapter');
      expect(await new FootballDataOrgAdapter().getTeams('2026')).toEqual([]);
    });

    it('getPlayers returns empty array when no key', async () => {
      delete process.env['FOOTBALL_DATA_API_KEY'];
      const { FootballDataOrgAdapter } = await import('./football-data-org.adapter');
      expect(await new FootballDataOrgAdapter().getPlayers('1234')).toEqual([]);
    });

    it('getStandings returns empty array when no key', async () => {
      delete process.env['FOOTBALL_DATA_API_KEY'];
      const { FootballDataOrgAdapter } = await import('./football-data-org.adapter');
      expect(await new FootballDataOrgAdapter().getStandings('2026')).toEqual([]);
    });

    it("adapter name is 'football-data-org'", async () => {
      delete process.env['FOOTBALL_DATA_API_KEY'];
      const { FootballDataOrgAdapter } = await import('./football-data-org.adapter');
      expect(new FootballDataOrgAdapter().name).toBe('football-data-org');
    });
  });

  // ── Error handling (mocked fetch) ─────────────────────────────────────────

  describe('error handling', () => {
    it('handles 401 gracefully (getFixtures returns [])', async () => {
      process.env['FOOTBALL_DATA_API_KEY'] = 'bad-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }));
      const { FootballDataOrgAdapter } = await import('./football-data-org.adapter');
      expect(await new FootballDataOrgAdapter().getFixtures('2026')).toEqual([]);
    });

    it('handles 403 gracefully (getTeams returns [])', async () => {
      process.env['FOOTBALL_DATA_API_KEY'] = 'bad-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403, json: async () => ({}) }));
      const { FootballDataOrgAdapter } = await import('./football-data-org.adapter');
      expect(await new FootballDataOrgAdapter().getTeams('2026')).toEqual([]);
    });

    it('handles 429 gracefully (health returns available:false)', async () => {
      process.env['FOOTBALL_DATA_API_KEY'] = 'rate-limited-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) }));
      const { FootballDataOrgAdapter } = await import('./football-data-org.adapter');
      const result = await new FootballDataOrgAdapter().health();
      expect(result.available).toBe(false);
    });

    it('handles network error gracefully (getSeasons returns [])', async () => {
      process.env['FOOTBALL_DATA_API_KEY'] = 'some-key';
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));
      const { FootballDataOrgAdapter } = await import('./football-data-org.adapter');
      expect(await new FootballDataOrgAdapter().getSeasons()).toEqual([]);
    });
  });

  // ── Response mapping (mocked) ─────────────────────────────────────────────

  describe('response mapping', () => {
    it('health returns available:true when competition endpoint returns 200 with name', async () => {
      process.env['FOOTBALL_DATA_API_KEY'] = 'test-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          name: 'FIFA World Cup',
          seasons: [],
        }),
      }));
      const { FootballDataOrgAdapter } = await import('./football-data-org.adapter');
      const result = await new FootballDataOrgAdapter().health();
      expect(result.available).toBe(true);
      expect(result.provider).toBe('football-data-org');
    });

    it('getFixtures maps homeTeamName, awayTeamName, externalId, kickoffAt', async () => {
      process.env['FOOTBALL_DATA_API_KEY'] = 'test-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          matches: [{
            id: 417406,
            homeTeam: { id: 764, name: 'Brazil' },
            awayTeam: { id: 762, name: 'Argentina' },
            utcDate: '2026-07-19T20:00:00Z',
            status: 'SCHEDULED',
            score: { fullTime: { home: null, away: null } },
          }],
        }),
      }));
      const { FootballDataOrgAdapter } = await import('./football-data-org.adapter');
      const fixtures = await new FootballDataOrgAdapter().getFixtures('2026');
      expect(fixtures).toHaveLength(1);
      expect(fixtures[0]!.externalId).toBe('417406');
      expect(fixtures[0]!.homeTeamName).toBe('Brazil');
      expect(fixtures[0]!.awayTeamName).toBe('Argentina');
      expect(fixtures[0]!.kickoffAt).toBe('2026-07-19T20:00:00Z');
      expect(fixtures[0]!.homeScore).toBeUndefined();
      expect(fixtures[0]!.awayScore).toBeUndefined();
    });

    it('getTeams maps externalId, name, shortName, countryCode from area.code', async () => {
      process.env['FOOTBALL_DATA_API_KEY'] = 'test-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          teams: [{
            id: 764,
            name: 'Brazil',
            shortName: 'Brazil',
            tla: 'BRA',
            area: { code: 'BRA' },
          }],
        }),
      }));
      const { FootballDataOrgAdapter } = await import('./football-data-org.adapter');
      const teams = await new FootballDataOrgAdapter().getTeams('2026');
      expect(teams).toHaveLength(1);
      expect(teams[0]!.externalId).toBe('764');
      expect(teams[0]!.name).toBe('Brazil');
      expect(teams[0]!.shortName).toBe('Brazil');
      expect(teams[0]!.countryCode).toBe('BRA');
    });

    it('getPlayers maps externalId, name, position from squad', async () => {
      process.env['FOOTBALL_DATA_API_KEY'] = 'test-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          squad: [
            { id: 44321, name: 'Vinicius Jr.', position: 'Left Winger' },
          ],
        }),
      }));
      const { FootballDataOrgAdapter } = await import('./football-data-org.adapter');
      const players = await new FootballDataOrgAdapter().getPlayers('764');
      expect(players).toHaveLength(1);
      expect(players[0]!.externalId).toBe('44321');
      expect(players[0]!.name).toBe('Vinicius Jr.');
      expect(players[0]!.position).toBe('Left Winger');
      expect(players[0]!.teamExternalId).toBe('764');
    });

    it('getStandings maps position, points, played, won, drawn, lost from first standings group', async () => {
      process.env['FOOTBALL_DATA_API_KEY'] = 'test-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          standings: [{
            type: 'GROUP',
            table: [{
              position: 1,
              team: { id: 764, name: 'Brazil' },
              points: 9,
              playedGames: 3,
              won: 3,
              draw: 0,
              lost: 0,
              goalsFor: 8,
              goalsAgainst: 2,
            }],
          }],
        }),
      }));
      const { FootballDataOrgAdapter } = await import('./football-data-org.adapter');
      const standings = await new FootballDataOrgAdapter().getStandings('2026');
      expect(standings).toHaveLength(1);
      expect(standings[0]!.externalId).toBe('764');
      expect(standings[0]!.teamName).toBe('Brazil');
      expect(standings[0]!.position).toBe(1);
      expect(standings[0]!.points).toBe(9);
      expect(standings[0]!.played).toBe(3);
      expect(standings[0]!.won).toBe(3);
      expect(standings[0]!.drawn).toBe(0);
      expect(standings[0]!.lost).toBe(0);
      expect(standings[0]!.goalsFor).toBe(8);
      expect(standings[0]!.goalsAgainst).toBe(2);
    });

    it('getSeasons maps externalId and competitionName', async () => {
      process.env['FOOTBALL_DATA_API_KEY'] = 'test-key';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          name: 'FIFA World Cup',
          seasons: [
            { id: 1861, startDate: '2026-06-11', endDate: '2026-07-19', currentMatchday: 1 },
            { id: 509, startDate: '2022-11-20', endDate: '2022-12-18' },
          ],
        }),
      }));
      const { FootballDataOrgAdapter } = await import('./football-data-org.adapter');
      const seasons = await new FootballDataOrgAdapter().getSeasons();
      expect(seasons).toHaveLength(2);
      expect(seasons[0]!.externalId).toBe('1861');
      expect(seasons[0]!.competitionName).toBe('FIFA World Cup');
      expect(seasons[0]!.startDate).toBe('2026-06-11');
      expect(seasons[1]!.externalId).toBe('509');
    });
  });

  // ── Security ──────────────────────────────────────────────────────────────

  describe('security', () => {
    it('adapter does not read NEXT_PUBLIC_ env vars', () => {
      const src = require('fs').readFileSync(
        require('path').resolve(__dirname, 'football-data-org.adapter.ts'),
        'utf8',
      );
      // Must not access process.env['NEXT_PUBLIC_*'] — comments mentioning NEXT_PUBLIC_ as a prohibition are OK
      expect(src).not.toMatch(/process\.env\[['"]NEXT_PUBLIC_/);
      expect(src).not.toMatch(/process\.env\.NEXT_PUBLIC_/);
    });

    it('adapter uses X-Auth-Token header', () => {
      const src = require('fs').readFileSync(
        require('path').resolve(__dirname, 'football-data-org.adapter.ts'),
        'utf8',
      );
      expect(src).toContain('X-Auth-Token');
    });

    it('adapter source is wired in DataProviderService', () => {
      const src = require('fs').readFileSync(
        require('path').resolve(__dirname, 'data-provider.service.ts'),
        'utf8',
      );
      expect(src).toContain('FootballDataOrgAdapter');
      expect(src).toContain('football-data-org');
    });
  });
});
