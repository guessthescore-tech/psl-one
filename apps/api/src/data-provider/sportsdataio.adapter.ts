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
 * SportsDataIO Soccer v4 adapter — candidate provider, not yet wired into DataProviderService.
 * Authentication: Ocp-Apim-Subscription-Key request header (server-side only).
 * Free trial: limited to UEFA Champions League (Competition ID 3).
 * PSL One must only use football/scores endpoints — never price or gambling-adjacency endpoint categories.
 */
@Injectable()
export class SportsDataIoSoccerAdapter implements ProviderAdapter {
  readonly name = 'sportsdataio';
  private readonly logger = new Logger(SportsDataIoSoccerAdapter.name);
  private readonly apiKey: string | undefined;
  private readonly baseUrl = 'https://api.sportsdata.io/v4/soccer';

  constructor() {
    this.apiKey = process.env['SPORTSDATAIO_SOCCER_API_KEY'];
    if (!this.apiKey) {
      this.logger.warn({ action: 'provider.disabled', provider: this.name, requiredKey: 'SPORTSDATAIO_SOCCER_API_KEY' });
    }
  }

  private async fetchSafe<T>(url: string): Promise<T | null> {
    if (!this.apiKey) return null;
    try {
      const res = await fetch(url, {
        headers: { 'Ocp-Apim-Subscription-Key': this.apiKey },
        signal: AbortSignal.timeout(8000),
      });
      if (res.status === 401 || res.status === 403) {
        this.logger.warn({ action: 'provider.auth_error', provider: this.name, url, statusCode: res.status });
        return null;
      }
      if (res.status === 429) {
        this.logger.warn({ action: 'provider.rate_limited', provider: this.name, url });
        return null;
      }
      if (!res.ok) {
        this.logger.warn({ action: 'provider.http_error', provider: this.name, url, statusCode: res.status });
        return null;
      }
      return (await res.json()) as T;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn({ action: 'provider.fetch_failed', provider: this.name, url, error: msg });
      return null;
    }
  }

  async health(): Promise<ProviderAdapterHealth> {
    if (!this.apiKey) {
      return { available: false, provider: this.name, message: 'API key not configured — safe disabled mode' };
    }
    const data = await this.fetchSafe<unknown[]>(`${this.baseUrl}/scores/json/Competitions`);
    if (data) return { available: true, provider: this.name, message: 'Provider reachable — trial mode (UCL only)' };
    return { available: false, provider: this.name, message: 'Provider unreachable or auth failed' };
  }

  async getSeasons(): Promise<ProviderSeason[]> {
    // Trial tier: Competition ID 3 (UEFA Champions League) only.
    const data = await this.fetchSafe<SdioCompetition[]>(`${this.baseUrl}/scores/json/Competitions`);
    if (!data) return [];
    return data
      .filter(c => c.CompetitionId === TRIAL_COMPETITION_ID)
      .map(mapCompetitionToSeason);
  }

  async getFixtures(seasonExternalId: string): Promise<ProviderFixture[]> {
    const data = await this.fetchSafe<SdioGame[]>(
      `${this.baseUrl}/scores/json/SchedulesBasic/${TRIAL_COMPETITION_ID}/${encodeURIComponent(seasonExternalId)}`,
    );
    if (!data) return [];
    return data.map(mapGame);
  }

  async getTeams(seasonExternalId: string): Promise<ProviderTeam[]> {
    // SportsDataIO teams endpoint uses competition, not season
    const data = await this.fetchSafe<SdioTeam[]>(
      `${this.baseUrl}/scores/json/Teams/${TRIAL_COMPETITION_ID}`,
    );
    if (!data) return [];
    // seasonExternalId is accepted but SportsDataIO teams are competition-scoped on trial
    void seasonExternalId;
    return data.map(mapTeam);
  }

  async getPlayers(teamExternalId: string): Promise<ProviderPlayer[]> {
    const data = await this.fetchSafe<SdioPlayer[]>(
      `${this.baseUrl}/scores/json/PlayersByTeam/${encodeURIComponent(teamExternalId)}`,
    );
    if (!data) return [];
    return data.map(mapPlayer);
  }

  async getStandings(seasonExternalId: string): Promise<ProviderStandings[]> {
    const data = await this.fetchSafe<SdioStandingRow[]>(
      `${this.baseUrl}/scores/json/Standings/${TRIAL_COMPETITION_ID}/${encodeURIComponent(seasonExternalId)}`,
    );
    if (!data) return [];
    return data.map(mapStanding);
  }
}

// ── Trial restriction ─────────────────────────────────────────────────────────

const TRIAL_COMPETITION_ID = 3; // UEFA Champions League

// ── SportsDataIO raw v4 types (trial scope) ──────────────────────────────────

interface SdioCompetition {
  CompetitionId?: number;
  Name?: string;
  AreaName?: string;
  SeasonId?: number;
  SeasonName?: string;
  StartDate?: string;
  EndDate?: string;
}

interface SdioGame {
  GameId?: number;
  HomeTeamName?: string;
  AwayTeamName?: string;
  Day?: string;
  Status?: string;
  HomeTeamScore?: number | null;
  AwayTeamScore?: number | null;
}

interface SdioTeam {
  TeamId?: number;
  Name?: string;
  ShortName?: string;
  AreaId?: number;
  AreaName?: string;
}

interface SdioPlayer {
  PlayerId?: number;
  Name?: string;
  CommonName?: string;
  Position?: string;
  TeamId?: number;
}

interface SdioStandingRow {
  TeamId?: number;
  TeamName?: string;
  Order?: number;
  Points?: number;
  Wins?: number;
  Losses?: number;
  Draws?: number;
  GoalsScored?: number;
  GoalsAgainst?: number;
  Games?: number;
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapCompetitionToSeason(c: SdioCompetition): ProviderSeason {
  return {
    externalId: String(c.SeasonId ?? c.CompetitionId ?? ''),
    name: c.SeasonName ?? c.Name ?? 'Unknown',
    competitionName: c.Name ?? 'Unknown',
    startDate: c.StartDate ?? '',
    endDate: c.EndDate ?? '',
  };
}

function mapGame(g: SdioGame): ProviderFixture {
  return {
    externalId: String(g.GameId ?? ''),
    homeTeamName: g.HomeTeamName ?? 'TBD',
    awayTeamName: g.AwayTeamName ?? 'TBD',
    kickoffAt: g.Day ?? '',
    status: mapGameStatus(g.Status),
    ...(g.HomeTeamScore != null ? { homeScore: g.HomeTeamScore } : {}),
    ...(g.AwayTeamScore != null ? { awayScore: g.AwayTeamScore } : {}),
  };
}

function mapGameStatus(status?: string): string {
  switch (status) {
    case 'Final': return 'FINISHED';
    case 'InProgress': return 'LIVE';
    case 'Scheduled': return 'SCHEDULED';
    case 'Postponed': return 'POSTPONED';
    case 'Canceled': return 'CANCELLED';
    default: return status ?? 'UNKNOWN';
  }
}

function mapTeam(t: SdioTeam): ProviderTeam {
  return {
    externalId: String(t.TeamId ?? ''),
    name: t.Name ?? 'Unknown',
    shortName: t.ShortName ?? (t.Name?.slice(0, 3).toUpperCase() ?? 'UNK'),
    countryCode: String(t.AreaId ?? ''),
  };
}

function mapPlayer(p: SdioPlayer): ProviderPlayer {
  return {
    externalId: String(p.PlayerId ?? ''),
    name: p.CommonName ?? p.Name ?? 'Unknown',
    position: p.Position ?? 'UNKNOWN',
    teamExternalId: String(p.TeamId ?? ''),
  };
}

function mapStanding(s: SdioStandingRow): ProviderStandings {
  return {
    externalId: String(s.TeamId ?? ''),
    teamName: s.TeamName ?? 'Unknown',
    position: s.Order ?? 0,
    points: s.Points ?? 0,
    played: s.Games ?? 0,
    won: s.Wins ?? 0,
    drawn: s.Draws ?? 0,
    lost: s.Losses ?? 0,
    goalsFor: s.GoalsScored ?? 0,
    goalsAgainst: s.GoalsAgainst ?? 0,
  };
}
