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
 * Parse psl.co.za API adapter for PSL One.
 * Source: Parse.bot wrapper over public psl.co.za data.
 * Not an official PSL developer API.
 * PARSE_API_KEY must be server-side only — never NEXT_PUBLIC_*.
 * No betting/odds endpoints are called.
 * If psl.co.za has not published new-season fixtures,
 * get_fixtures returns an empty array — this is a source-empty state,
 * not an adapter failure.
 */
@Injectable()
export class ParsePslAdapter implements ProviderAdapter {
  readonly name = 'parse-psl';
  private readonly logger = new Logger(ParsePslAdapter.name);
  private readonly apiKey: string | undefined;
  private readonly baseUrl =
    'https://api.parse.bot/scraper/0c2008df-2286-497a-a5cb-55dd56ec9a4e';

  private static readonly TOURNAMENT = 'betway-premiership';

  constructor() {
    this.apiKey = process.env['PARSE_API_KEY'] || undefined;
    if (!this.apiKey) {
      this.logger.warn({ action: 'provider.disabled', provider: this.name, requiredKey: 'PARSE_API_KEY' });
    }
  }

  private async fetch<T>(endpoint: string, params?: Record<string, string>): Promise<T | null> {
    if (!this.apiKey) return null;
    try {
      const url = new URL(`${this.baseUrl}/${endpoint}`);
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          url.searchParams.set(k, v);
        }
      }
      const res = await globalThis.fetch(url.toString(), {
        headers: { 'X-API-Key': this.apiKey },
        signal: AbortSignal.timeout(8000),
      });
      if (res.status === 401 || res.status === 403) {
        this.logger.warn({ action: 'provider.auth_error', provider: this.name, endpoint, statusCode: res.status });
        return null;
      }
      if (res.status === 429) {
        this.logger.warn({ action: 'provider.rate_limited', provider: this.name, endpoint });
        return null;
      }
      if (!res.ok) {
        this.logger.warn({ action: 'provider.http_error', provider: this.name, endpoint, statusCode: res.status });
        return null;
      }
      const data = (await res.json()) as T;
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn({ action: 'provider.fetch_failed', provider: this.name, endpoint, error: msg });
      return null;
    }
  }

  async health(): Promise<ProviderAdapterHealth> {
    if (!this.apiKey) {
      return { available: false, provider: this.name, message: 'API key not configured' };
    }
    const data = await this.fetch<PfFixturesResponse | PfFixture[]>('get_fixtures', {
      tournament: ParsePslAdapter.TOURNAMENT,
    });
    if (data !== null) {
      return { available: true, provider: this.name, message: 'Parse PSL health OK' };
    }
    return { available: false, provider: this.name, message: 'Parse PSL unreachable or auth error' };
  }

  async getSeasons(): Promise<ProviderSeason[]> {
    // Parse does not expose seasons — season discovery is not supported via this source.
    return [];
  }

  async getFixtures(seasonExternalId: string): Promise<ProviderFixture[]> {
    void seasonExternalId; // Parse uses tournament slug, not season ID
    const data = await this.fetch<PfFixturesResponse | PfFixture[]>('get_fixtures', {
      tournament: ParsePslAdapter.TOURNAMENT,
    });
    if (data === null) return [];
    // Response may be wrapped in { fixtures: [...] } or be the array directly
    const fixtures: PfFixture[] =
      (data as PfFixturesResponse).fixtures ?? (Array.isArray(data) ? (data as PfFixture[]) : []);
    return fixtures.map(f => ({
      externalId: f.id ?? '',
      homeTeamName: f.home_team ?? 'TBD',
      awayTeamName: f.away_team ?? 'TBD',
      kickoffAt: [f.date, f.time].filter(Boolean).join('T') || '',
      status: f.status ?? 'SCHEDULED',
    }));
  }

  async getTeams(seasonExternalId: string): Promise<ProviderTeam[]> {
    void seasonExternalId; // Parse uses tournament slug, not season ID
    const data = await this.fetch<PfClubsResponse | PfClub[]>('get_clubs_list', {
      tournament: ParsePslAdapter.TOURNAMENT,
    });
    if (data === null) return [];
    // Response may be wrapped in { clubs: [...] } or be the array directly
    const clubs: PfClub[] =
      (data as PfClubsResponse).clubs ?? (Array.isArray(data) ? (data as PfClub[]) : []);
    return clubs.map(c => ({
      externalId: c.id ?? c.name ?? '',
      name: c.name ?? 'Unknown',
      shortName: c.short_name ?? (c.name ?? '').slice(0, 8),
      countryCode: 'ZA',
    }));
  }

  async getPlayers(teamExternalId: string): Promise<ProviderPlayer[]> {
    void teamExternalId;
    // Parse provides limited player data — players available via match lineups in future
    this.logger.log({ action: 'provider.players_unavailable', provider: 'parse-psl', reason: 'use_match_lineups' });
    return [];
  }

  async getStandings(seasonExternalId: string): Promise<ProviderStandings[]> {
    void seasonExternalId; // Parse uses tournament slug, not season ID
    const data = await this.fetch<PfStandingsResponse | PfStandingRow[]>('get_standings', {
      tournament: ParsePslAdapter.TOURNAMENT,
    });
    if (data === null) return [];
    // Response may be wrapped in { standings: [...] } or be the array directly
    const standings: PfStandingRow[] =
      (data as PfStandingsResponse).standings ??
      (Array.isArray(data) ? (data as PfStandingRow[]) : []);
    return standings.map(s => ({
      externalId: s.team_id ?? s.team ?? '',
      teamName: s.team ?? 'Unknown',
      position: s.position ?? 0,
      points: s.points ?? 0,
      played: s.played ?? 0,
      won: s.won ?? 0,
      drawn: s.drawn ?? 0,
      lost: s.lost ?? 0,
      goalsFor: s.goals_for ?? 0,
      goalsAgainst: s.goals_against ?? 0,
    }));
  }

  /** Bonus: fetch recent match results (not part of ProviderAdapter interface). */
  async getResults(): Promise<unknown[]> {
    const data = await this.fetch<unknown>('get_results', {
      tournament: ParsePslAdapter.TOURNAMENT,
    });
    if (data === null) return [];
    return Array.isArray(data) ? data : [data];
  }
}

// ── Parse PSL raw response types ─────────────────────────────────────────────

interface PfFixturesResponse {
  fixtures?: PfFixture[];
}

interface PfFixture {
  id?: string;
  home_team?: string;
  away_team?: string;
  date?: string;
  time?: string;
  status?: string;
  venue?: string;
}

interface PfClubsResponse {
  clubs?: PfClub[];
}

interface PfClub {
  id?: string;
  name?: string;
  short_name?: string;
  badge_url?: string;
}

interface PfStandingsResponse {
  standings?: PfStandingRow[];
}

interface PfStandingRow {
  position?: number;
  team?: string;
  team_id?: string;
  played?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  goals_for?: number;
  goals_against?: number;
  points?: number;
}
