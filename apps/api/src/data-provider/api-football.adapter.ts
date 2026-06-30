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
 * API-Football (api-sports.io) adapter — candidate provider for PSL One.
 * PSL = league ID 288 (Premier Soccer League, South Africa).
 * Authentication: x-apisports-key header (server-side only — key must never be exposed to the browser).
 * Safe no-key mode: all methods return empty arrays / disabled health when key is absent.
 * No betting/odds endpoints are called.
 */
@Injectable()
export class ApiFootballAdapter implements ProviderAdapter {
  readonly name = 'api-football';
  private readonly logger = new Logger(ApiFootballAdapter.name);
  private readonly apiKey: string | undefined;
  private readonly baseUrl = 'https://v3.football.api-sports.io';

  private static readonly PSL_LEAGUE_ID = 288;

  constructor() {
    this.apiKey = process.env['API_FOOTBALL_KEY'] || undefined;
    if (!this.apiKey) {
      this.logger.warn({ action: 'provider.disabled', provider: this.name, requiredKey: 'API_FOOTBALL_KEY' });
    }
  }

  private async fetch<T>(path: string): Promise<T | null> {
    if (!this.apiKey) return null;
    try {
      const res = await globalThis.fetch(`${this.baseUrl}${path}`, {
        headers: { 'x-apisports-key': this.apiKey },
        signal: AbortSignal.timeout(8000),
      });
      if (res.status === 401 || res.status === 403) {
        this.logger.warn({ action: 'provider.auth_error', provider: this.name, path, statusCode: res.status });
        return null;
      }
      if (res.status === 429) {
        this.logger.warn({ action: 'provider.rate_limited', provider: this.name, path });
        return null;
      }
      if (!res.ok) {
        this.logger.warn({ action: 'provider.http_error', provider: this.name, path, statusCode: res.status });
        return null;
      }
      const data = (await res.json()) as { response: T; errors?: Record<string, string> };
      if (data.errors && Object.keys(data.errors).length > 0) {
        this.logger.warn({ action: 'provider.body_error', provider: this.name, path, errors: data.errors });
        return null;
      }
      return data.response ?? null;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn({ action: 'provider.fetch_failed', provider: this.name, path, error: msg });
      return null;
    }
  }

  async health(): Promise<ProviderAdapterHealth> {
    if (!this.apiKey) {
      return { available: false, provider: this.name, message: 'API key not configured — safe disabled mode' };
    }
    const data = await this.fetch<AfLeagueEntry[]>(
      `/leagues?id=${ApiFootballAdapter.PSL_LEAGUE_ID}&current=true`,
    );
    if (data && data.length > 0) {
      return { available: true, provider: this.name, message: 'API-Football health OK' };
    }
    return { available: false, provider: this.name, message: 'API-Football unreachable or no results' };
  }

  async getSeasons(): Promise<ProviderSeason[]> {
    const data = await this.fetch<AfLeagueEntry[]>(
      `/leagues?id=${ApiFootballAdapter.PSL_LEAGUE_ID}`,
    );
    if (!data) return [];
    const result: ProviderSeason[] = [];
    for (const entry of data) {
      for (const season of entry.seasons ?? []) {
        result.push({
          externalId: String(season.year),
          name: String(season.year),
          competitionName: entry.league?.name ?? 'Unknown',
          startDate: season.start ?? '',
          endDate: season.end ?? '',
        });
      }
    }
    return result;
  }

  async getFixtures(seasonExternalId: string): Promise<ProviderFixture[]> {
    const data = await this.fetch<AfFixtureEntry[]>(
      `/fixtures?league=${ApiFootballAdapter.PSL_LEAGUE_ID}&season=${encodeURIComponent(seasonExternalId)}`,
    );
    if (!data) return [];
    return data.map(f => ({
      externalId: String(f.fixture?.id ?? ''),
      homeTeamName: f.teams?.home?.name ?? 'TBD',
      awayTeamName: f.teams?.away?.name ?? 'TBD',
      kickoffAt: f.fixture?.date ?? '',
      status: f.fixture?.status?.short ?? 'NS',
      ...(f.goals?.home != null ? { homeScore: f.goals.home } : {}),
      ...(f.goals?.away != null ? { awayScore: f.goals.away } : {}),
    }));
  }

  async getTeams(seasonExternalId: string): Promise<ProviderTeam[]> {
    const data = await this.fetch<AfTeamEntry[]>(
      `/teams?league=${ApiFootballAdapter.PSL_LEAGUE_ID}&season=${encodeURIComponent(seasonExternalId)}`,
    );
    if (!data) return [];
    return data.map(t => ({
      externalId: String(t.team?.id ?? ''),
      name: t.team?.name ?? 'Unknown',
      shortName: (t.team?.name ?? '').slice(0, 8),
      countryCode: 'ZA',
    }));
  }

  async getPlayers(teamExternalId: string): Promise<ProviderPlayer[]> {
    const data = await this.fetch<AfPlayerEntry[]>(
      `/players?team=${encodeURIComponent(teamExternalId)}&season=2025&page=1`,
    );
    if (!data) return [];
    return data.map(p => ({
      externalId: String(p.player?.id ?? ''),
      name: p.player?.name ?? 'Unknown',
      position: p.statistics?.[0]?.games?.position ?? 'Unknown',
      teamExternalId: teamExternalId,
    }));
  }

  async getStandings(seasonExternalId: string): Promise<ProviderStandings[]> {
    const data = await this.fetch<AfStandingsWrapper[]>(
      `/standings?league=${ApiFootballAdapter.PSL_LEAGUE_ID}&season=${encodeURIComponent(seasonExternalId)}`,
    );
    if (!data) return [];
    // response[0].league.standings[0] is the array of standing entries
    const standings = data[0]?.league?.standings?.[0];
    if (!standings) return [];
    return standings.map(s => ({
      externalId: String(s.team?.id ?? ''),
      teamName: s.team?.name ?? 'Unknown',
      position: s.rank ?? 0,
      points: s.points ?? 0,
      played: s.all?.played ?? 0,
      won: s.all?.win ?? 0,
      drawn: s.all?.draw ?? 0,
      lost: s.all?.lose ?? 0,
      goalsFor: s.all?.goals?.for ?? 0,
      goalsAgainst: s.all?.goals?.against ?? 0,
    }));
  }
}

// ── API-Football raw response types ──────────────────────────────────────────

interface AfLeagueEntry {
  league?: {
    id?: number;
    name?: string;
  };
  seasons?: AfSeason[];
}

interface AfSeason {
  year?: number;
  start?: string;
  end?: string;
  current?: boolean;
}

interface AfFixtureEntry {
  fixture?: {
    id?: number;
    date?: string;
    status?: {
      short?: string;
    };
  };
  teams?: {
    home?: { name?: string };
    away?: { name?: string };
  };
  goals?: {
    home?: number | null;
    away?: number | null;
  };
}

interface AfTeamEntry {
  team?: {
    id?: number;
    name?: string;
  };
}

interface AfPlayerEntry {
  player?: {
    id?: number;
    name?: string;
  };
  statistics?: Array<{
    games?: {
      position?: string;
    };
  }>;
}

interface AfStandingsWrapper {
  league?: {
    standings?: AfStandingEntry[][];
  };
}

interface AfStandingEntry {
  rank?: number;
  team?: {
    id?: number;
    name?: string;
  };
  points?: number;
  all?: {
    played?: number;
    win?: number;
    draw?: number;
    lose?: number;
    goals?: {
      for?: number;
      against?: number;
    };
  };
}
