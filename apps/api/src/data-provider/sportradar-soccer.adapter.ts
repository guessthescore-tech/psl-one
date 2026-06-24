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
 * SportRadar Soccer API v4 adapter for PSL One.
 *
 * Targets FIFA World Cup 2026 data: fixtures, teams, squads, standings.
 * Authentication: API key as query param (server-side only — key must never be
 * exposed to the browser or via NEXT_PUBLIC_ prefixes).
 * Safe no-key mode: all methods return empty arrays / disabled health when key is absent.
 * No betting/odds endpoints are called. No PSL data via this adapter.
 * Trial key endpoint: api.sportradar.com/soccer/trial/v4/en/
 */
@Injectable()
export class SportRadarSoccerAdapter implements ProviderAdapter {
  readonly name = 'sportradar-soccer';
  private readonly logger = new Logger(SportRadarSoccerAdapter.name);
  private readonly apiKey: string | undefined;
  private readonly baseUrl = 'https://api.sportradar.com/soccer/trial/v4/en';

  constructor() {
    this.apiKey = process.env['SPORTSRADAR_SOCCER_API_KEY'] || undefined;
    if (!this.apiKey) {
      this.logger.warn('SPORTSRADAR_SOCCER_API_KEY not set — adapter in disabled/safe mode');
    }
  }

  private buildUrl(path: string): string {
    const sep = path.includes('?') ? '&' : '?';
    return `${this.baseUrl}${path}${sep}api_key=${this.apiKey}`;
  }

  private async fetch<T>(path: string): Promise<T | null> {
    if (!this.apiKey) return null;
    try {
      const res = await globalThis.fetch(this.buildUrl(path), {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10000),
      });
      if (res.status === 401 || res.status === 403) {
        this.logger.warn(`SportRadar auth error ${res.status} — check SPORTSRADAR_SOCCER_API_KEY`);
        return null;
      }
      if (res.status === 429) {
        this.logger.warn('SportRadar rate limit hit — backoff required');
        return null;
      }
      if (!res.ok) {
        this.logger.warn(`SportRadar returned ${res.status} for ${path}`);
        return null;
      }
      return (await res.json()) as T;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`SportRadar fetch error: ${msg}`);
      return null;
    }
  }

  async health(): Promise<ProviderAdapterHealth> {
    if (!this.apiKey) {
      return {
        available: false,
        provider: this.name,
        message: 'SPORTSRADAR_SOCCER_API_KEY not configured — safe disabled mode',
      };
    }
    const data = await this.fetch<SrCompetitionsResponse>('/competitions.json');
    if (data && Array.isArray(data.competitions) && data.competitions.length > 0) {
      return {
        available: true,
        provider: this.name,
        message: `SportRadar health OK — ${data.competitions.length} competitions available`,
      };
    }
    return {
      available: false,
      provider: this.name,
      message: 'SportRadar unreachable or empty response',
    };
  }

  async getSeasons(): Promise<ProviderSeason[]> {
    const data = await this.fetch<SrCompetitionsResponse>('/competitions.json');
    if (!data) return [];
    const wc = (data.competitions ?? []).find(
      c => c.name?.toLowerCase().includes('world cup') || c.id?.includes('world_cup'),
    );
    if (!wc) {
      this.logger.warn('SportRadar: FIFA World Cup competition not found in competitions list');
      return [];
    }
    const seasonsData = await this.fetch<SrSeasonsResponse>(`/competitions/${wc.id}/seasons.json`);
    if (!seasonsData) return [];
    return (seasonsData.seasons ?? []).map(s => ({
      externalId: s.id ?? '',
      name: s.name ?? wc.name ?? 'FIFA World Cup',
      competitionName: wc.name ?? 'FIFA World Cup',
      startDate: s.start_date ?? '',
      endDate: s.end_date ?? '',
    }));
  }

  async getFixtures(seasonExternalId: string): Promise<ProviderFixture[]> {
    // SportRadar uses summaries endpoint for match schedules
    const data = await this.fetch<SrSummariesResponse>(
      `/seasons/${encodeURIComponent(seasonExternalId)}/summaries.json`,
    );
    if (!data) return [];
    return (data.summaries ?? []).map(s => {
      const m = s.sport_event;
      const result = s.sport_event_status;
      return {
        externalId: m?.id ?? '',
        homeTeamName: m?.competitors?.find(c => c.qualifier === 'home')?.name ?? 'TBD',
        awayTeamName: m?.competitors?.find(c => c.qualifier === 'away')?.name ?? 'TBD',
        kickoffAt: m?.start_time ?? '',
        status: result?.status ?? 'not_started',
        ...(result?.home_score != null ? { homeScore: result.home_score } : {}),
        ...(result?.away_score != null ? { awayScore: result.away_score } : {}),
      };
    }).filter(f => f.externalId);
  }

  async getTeams(seasonExternalId: string): Promise<ProviderTeam[]> {
    const data = await this.fetch<SrCompetitorsResponse>(
      `/seasons/${encodeURIComponent(seasonExternalId)}/competitors.json`,
    );
    if (!data) return [];
    return (data.season_competitors ?? []).map(c => ({
      externalId: c.id ?? '',
      name: c.name ?? 'Unknown',
      shortName: c.abbreviation ?? (c.name ?? '').slice(0, 8),
      countryCode: c.country_code ?? '',
    })).filter(t => t.externalId);
  }

  async getPlayers(teamExternalId: string): Promise<ProviderPlayer[]> {
    const data = await this.fetch<SrCompetitorProfileResponse>(
      `/competitors/${encodeURIComponent(teamExternalId)}/profile.json`,
    );
    if (!data) return [];
    return (data.players ?? []).map(p => ({
      externalId: p.id ?? '',
      name: p.name ?? 'Unknown',
      position: p.type ?? 'Unknown',
      teamExternalId,
    })).filter(p => p.externalId);
  }

  async getStandings(seasonExternalId: string): Promise<ProviderStandings[]> {
    // Try to find tournament URN from season ID and fetch standings
    // SportRadar standings are under tournament context; use season-level endpoint
    const data = await this.fetch<SrStandingsResponse>(
      `/seasons/${encodeURIComponent(seasonExternalId)}/standings.json`,
    );
    if (!data) return [];
    const group = (data.standings ?? [])[0];
    if (!group) return [];
    const rows = group.groups?.flatMap(g => g.standings ?? []) ?? group.standings ?? [];
    return rows.map(row => ({
      externalId: row.competitor?.id ?? '',
      teamName: row.competitor?.name ?? 'Unknown',
      position: row.rank ?? 0,
      points: row.points ?? 0,
      played: row.played ?? 0,
      won: row.wins ?? 0,
      drawn: row.draws ?? 0,
      lost: row.losses ?? 0,
      goalsFor: row.goals_for ?? 0,
      goalsAgainst: row.goals_against ?? 0,
    })).filter(s => s.externalId);
  }

  /**
   * Bonus utility — not part of ProviderAdapter interface.
   * Lists all competitions available to the configured API key.
   */
  async getCompetitions(): Promise<{ id: string; name: string }[]> {
    const data = await this.fetch<SrCompetitionsResponse>('/competitions.json');
    if (!data) return [];
    return (data.competitions ?? []).map(c => ({ id: c.id ?? '', name: c.name ?? 'Unknown' }));
  }
}

// ── SportRadar raw response types ────────────────────────────────────────────

interface SrCompetitionsResponse {
  competitions: { id: string; name: string; category?: { id: string; name: string } }[];
}

interface SrSeasonsResponse {
  seasons: { id: string; name: string; start_date: string; end_date: string }[];
}

interface SrSummariesResponse {
  summaries: {
    sport_event: {
      id: string;
      start_time: string;
      competitors: { id: string; name: string; qualifier: 'home' | 'away' }[];
    };
    sport_event_status: {
      status: string;
      home_score: number | null;
      away_score: number | null;
    };
  }[];
}

interface SrCompetitorsResponse {
  season_competitors: {
    id: string;
    name: string;
    abbreviation: string;
    country_code: string;
  }[];
}

interface SrCompetitorProfileResponse {
  players: { id: string; name: string; type: string }[];
}

interface SrStandingsResponse {
  standings: {
    standings?: SrStandingRow[];
    groups?: { standings: SrStandingRow[] }[];
  }[];
}

interface SrStandingRow {
  rank: number;
  competitor: { id: string; name: string };
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
}
