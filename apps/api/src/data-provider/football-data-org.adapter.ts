import { Injectable, Logger } from '@nestjs/common';
import type {
  ProviderAdapter,
  ProviderAdapterHealth,
  ProviderFixture,
  ProviderPlayer,
  ProviderSeason,
  ProviderStandings,
  ProviderTeam,
} from './provider-adapter.interface';

/**
 * football-data.org v4 adapter for PSL One.
 *
 * NOTE: PSL (Premier Soccer League) is NOT available on football-data.org — it
 * is not listed in their competition catalogue on the free tier or any paid tier
 * as of 2026. This adapter targets the FIFA World Cup (code: WC) which IS
 * available on the free tier. For PSL data, use the api-football adapter instead.
 *
 * Authentication: X-Auth-Token header (server-side only — key must never be
 * exposed to the browser; never use NEXT_PUBLIC_ prefixes with this key).
 * Safe no-key mode: all methods return empty arrays / disabled health when key
 * is absent.
 * No betting/odds endpoints are called.
 */
@Injectable()
export class FootballDataOrgAdapter implements ProviderAdapter {
  readonly name = 'football-data-org';
  private readonly logger = new Logger(FootballDataOrgAdapter.name);
  private readonly apiKey: string | undefined;
  private readonly baseUrl = 'https://api.football-data.org';

  /** FIFA World Cup — available on the free tier of football-data.org */
  private static readonly WC_CODE = 'WC';

  constructor() {
    this.apiKey = process.env['FOOTBALL_DATA_API_KEY'] || undefined;
    if (!this.apiKey) {
      this.logger.warn({ action: 'provider.disabled', provider: this.name, requiredKey: 'FOOTBALL_DATA_API_KEY' });
    }
  }

  private async fetch<T>(path: string): Promise<T | null> {
    if (!this.apiKey) return null;
    try {
      const res = await globalThis.fetch(`${this.baseUrl}${path}`, {
        headers: { 'X-Auth-Token': this.apiKey },
        signal: AbortSignal.timeout(8000),
      });
      if (res.status === 401 || res.status === 403) {
        this.logger.warn({ action: 'provider.auth_error', provider: this.name, path, statusCode: res.status });
        return null;
      }
      if (res.status === 429) {
        this.logger.warn({ action: 'provider.rate_limited', provider: this.name, path, statusCode: res.status });
        return null;
      }
      if (!res.ok) {
        this.logger.warn({ action: 'provider.http_error', provider: this.name, path, statusCode: res.status });
        return null;
      }
      return (await res.json()) as T;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn({ action: 'provider.fetch_failed', provider: this.name, path, error: msg });
      return null;
    }
  }

  async health(): Promise<ProviderAdapterHealth> {
    if (!this.apiKey) {
      return {
        available: false,
        provider: this.name,
        message: 'API key not configured — safe disabled mode',
      };
    }
    const data = await this.fetch<FdCompetitionResponse>(
      `/v4/competitions/${FootballDataOrgAdapter.WC_CODE}`,
    );
    if (data && data.name) {
      return { available: true, provider: this.name, message: 'football-data.org health OK' };
    }
    return {
      available: false,
      provider: this.name,
      message: 'football-data.org unreachable or no results',
    };
  }

  async getSeasons(): Promise<ProviderSeason[]> {
    const data = await this.fetch<FdCompetitionResponse>(
      `/v4/competitions/${FootballDataOrgAdapter.WC_CODE}`,
    );
    if (!data) return [];
    return (data.seasons ?? []).map(s => ({
      externalId: String(s.id),
      name: `${data.name} ${s.startDate?.slice(0, 4) ?? ''}`,
      competitionName: data.name ?? 'Unknown',
      startDate: s.startDate ?? '',
      endDate: s.endDate ?? '',
    }));
  }

  async getFixtures(seasonExternalId: string): Promise<ProviderFixture[]> {
    void seasonExternalId; // football-data.org uses competition code, not season ID for matches
    const data = await this.fetch<FdMatchesResponse>(
      `/v4/competitions/${FootballDataOrgAdapter.WC_CODE}/matches`,
    );
    if (!data) return [];
    return (data.matches ?? []).map(m => ({
      externalId: String(m.id),
      homeTeamName: m.homeTeam?.name ?? 'TBD',
      awayTeamName: m.awayTeam?.name ?? 'TBD',
      kickoffAt: m.utcDate ?? '',
      status: m.status ?? 'SCHEDULED',
      ...(m.score?.fullTime?.home != null ? { homeScore: m.score.fullTime.home } : {}),
      ...(m.score?.fullTime?.away != null ? { awayScore: m.score.fullTime.away } : {}),
    }));
  }

  async getTeams(seasonExternalId: string): Promise<ProviderTeam[]> {
    void seasonExternalId; // football-data.org uses competition code, not season ID for teams
    const data = await this.fetch<FdTeamsResponse>(
      `/v4/competitions/${FootballDataOrgAdapter.WC_CODE}/teams`,
    );
    if (!data) return [];
    return (data.teams ?? []).map(t => ({
      externalId: String(t.id),
      name: t.name ?? 'Unknown',
      shortName: t.shortName ?? t.tla ?? (t.name ?? '').slice(0, 8),
      countryCode: t.area?.code ?? '',
    }));
  }

  async getPlayers(teamExternalId: string): Promise<ProviderPlayer[]> {
    // /v4/teams/{id}/squad returns 404 on the free tier; /v4/teams/{id} returns
    // the same squad array embedded in the team detail response.
    const data = await this.fetch<FdSquadResponse>(
      `/v4/teams/${encodeURIComponent(teamExternalId)}`,
    );
    if (!data) return [];
    return (data.squad ?? []).map(p => ({
      externalId: String(p.id),
      name: p.name ?? 'Unknown',
      position: p.position ?? 'Unknown',
      teamExternalId: teamExternalId,
    }));
  }

  async getStandings(seasonExternalId: string): Promise<ProviderStandings[]> {
    void seasonExternalId; // football-data.org uses competition code, not season ID for standings
    const data = await this.fetch<FdStandingsResponse>(
      `/v4/competitions/${FootballDataOrgAdapter.WC_CODE}/standings`,
    );
    if (!data) return [];

    // Prefer the first GROUP type standings block (World Cup group stage); fall
    // back to the first block available.
    const block =
      (data.standings ?? []).find(s => s.type === 'GROUP') ?? data.standings?.[0];
    if (!block) return [];

    return (block.table ?? []).map(row => ({
      externalId: String(row.team?.id ?? ''),
      teamName: row.team?.name ?? 'Unknown',
      position: row.position ?? 0,
      points: row.points ?? 0,
      played: row.playedGames ?? 0,
      won: row.won ?? 0,
      drawn: row.draw ?? 0,
      lost: row.lost ?? 0,
      goalsFor: row.goalsFor ?? 0,
      goalsAgainst: row.goalsAgainst ?? 0,
    }));
  }

  /**
   * Bonus utility — not part of ProviderAdapter interface.
   * Lists all competitions available to the configured API key.
   * Useful for discovering competition codes during integration.
   */
  async getCompetitions(): Promise<{ code: string; name: string }[]> {
    const data = await this.fetch<FdCompetitionsListResponse>('/v4/competitions');
    if (!data) return [];
    return (data.competitions ?? []).map(c => ({
      code: c.code ?? '',
      name: c.name ?? 'Unknown',
    }));
  }
}

// ── football-data.org raw response types ─────────────────────────────────────

interface FdCompetitionResponse {
  seasons: FdSeason[];
  name: string;
}

interface FdSeason {
  id: number;
  startDate: string;
  endDate: string;
  currentMatchday?: number;
}

interface FdMatchesResponse {
  matches: FdMatch[];
}

interface FdMatch {
  id: number;
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  utcDate: string;
  status: string;
  score: { fullTime: { home: number | null; away: number | null } };
}

interface FdTeamsResponse {
  teams: FdTeam[];
}

interface FdTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  area: { code: string };
}

interface FdSquadResponse {
  squad: FdPlayer[];
}

interface FdPlayer {
  id: number;
  name: string;
  position: string | null;
}

interface FdStandingsResponse {
  standings: FdStandingGroup[];
}

interface FdStandingGroup {
  type: string;
  table: FdStandingRow[];
}

interface FdStandingRow {
  position: number;
  team: { id: number; name: string };
  points: number;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
}

interface FdCompetitionsListResponse {
  competitions: { id: number; name: string; code: string; area: { name: string } }[];
}
