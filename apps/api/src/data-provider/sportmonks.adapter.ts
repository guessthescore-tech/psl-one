/**
 * @deprecated Sportmonks was removed from the active provider strategy (Sprint 10 amendment).
 * This adapter is retained for reference only. Primary provider is UNDECIDED.
 * See docs/data/SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md before re-wiring.
 */
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

@Injectable()
export class SportmonksAdapter implements ProviderAdapter {
  readonly name = 'sportmonks';
  private readonly logger = new Logger(SportmonksAdapter.name);
  private readonly apiKey: string | undefined;
  private readonly baseUrl = 'https://api.sportmonks.com/v3/football';

  constructor() {
    this.apiKey = process.env['SPORTMONKS_API_KEY'];
    if (!this.apiKey) {
      this.logger.warn('SPORTMONKS_API_KEY not set — provider in disabled/safe mode');
    }
  }

  private async fetchSafe<T>(url: string): Promise<T | null> {
    if (!this.apiKey) return null;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: AbortSignal.timeout(8000),
      });
      if (res.status === 401 || res.status === 403) {
        this.logger.warn(`Sportmonks auth error ${res.status}`);
        return null;
      }
      if (res.status === 429) {
        this.logger.warn('Sportmonks rate limit hit');
        return null;
      }
      if (!res.ok) {
        this.logger.warn(`Sportmonks returned ${res.status}`);
        return null;
      }
      return (await res.json()) as T;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Sportmonks fetch error: ${msg}`);
      return null;
    }
  }

  async health(): Promise<ProviderAdapterHealth> {
    if (!this.apiKey) {
      return { available: false, provider: this.name, message: 'API key not configured — safe disabled mode' };
    }
    const data = await this.fetchSafe<{ data: unknown[] }>(`${this.baseUrl}/leagues?per_page=1`);
    if (data) return { available: true, provider: this.name, message: 'Provider reachable — trial mode' };
    return { available: false, provider: this.name, message: 'Provider unreachable or auth failed' };
  }

  async getSeasons(): Promise<ProviderSeason[]> {
    const data = await this.fetchSafe<{ data: SportmonksSeason[] }>(`${this.baseUrl}/seasons?per_page=25`);
    if (!data?.data) return [];
    return data.data.map(mapSeason);
  }

  async getFixtures(seasonExternalId: string): Promise<ProviderFixture[]> {
    const data = await this.fetchSafe<{ data: SportmonksFixture[] }>(
      `${this.baseUrl}/fixtures/seasons/${seasonExternalId}?per_page=50`,
    );
    if (!data?.data) return [];
    return data.data.map(mapFixture);
  }

  async getTeams(seasonExternalId: string): Promise<ProviderTeam[]> {
    const data = await this.fetchSafe<{ data: SportmonksTeam[] }>(
      `${this.baseUrl}/teams/seasons/${seasonExternalId}?per_page=50`,
    );
    if (!data?.data) return [];
    return data.data.map(mapTeam);
  }

  async getPlayers(teamExternalId: string): Promise<ProviderPlayer[]> {
    const data = await this.fetchSafe<{ data: SportmonksPlayer[] }>(
      `${this.baseUrl}/players/teams/${teamExternalId}?per_page=50`,
    );
    if (!data?.data) return [];
    return data.data.map(mapPlayer);
  }

  async getStandings(seasonExternalId: string): Promise<ProviderStandings[]> {
    const data = await this.fetchSafe<{ data: SportmonksStanding[] }>(
      `${this.baseUrl}/standings/seasons/${seasonExternalId}`,
    );
    if (!data?.data) return [];
    return data.data.map(mapStanding);
  }
}

// ── Sportmonks raw types (trial v3) ──────────────────────────────────────────

interface SportmonksSeason {
  id: number;
  name: string;
  league?: { name?: string };
  starting_at?: string;
  ending_at?: string;
}

interface SportmonksFixture {
  id: number;
  name?: string;
  starting_at?: string;
  state?: { short_name?: string };
  scores?: { score?: { goals?: number }; description?: string }[];
  participants?: { name?: string; short_code?: string; location?: string; meta?: { location?: string } }[];
}

interface SportmonksTeam {
  id: number;
  name: string;
  short_code?: string;
  country?: { iso2?: string };
}

interface SportmonksPlayer {
  id: number;
  display_name?: string;
  common_name?: string;
  position_id?: number;
  team_id?: number;
}

interface SportmonksStanding {
  participant_id?: number;
  participant?: { name?: string };
  position?: number;
  points?: number;
  details?: { type_id?: number; value?: number }[];
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapSeason(s: SportmonksSeason): ProviderSeason {
  return {
    externalId: String(s.id),
    name: s.name,
    competitionName: s.league?.name ?? 'Unknown',
    startDate: s.starting_at ?? '',
    endDate: s.ending_at ?? '',
  };
}

function mapFixture(f: SportmonksFixture): ProviderFixture {
  const home = f.participants?.find(p => p.meta?.location === 'home' || p.location === 'home');
  const away = f.participants?.find(p => p.meta?.location === 'away' || p.location === 'away');
  const homeGoals = f.scores?.find(s => s.description === 'CURRENT' && s.score)?.score?.goals;
  const awayGoals = f.scores?.find(s => s.description === 'CURRENT' && s.score)?.score?.goals;
  const fixture: ProviderFixture = {
    externalId: String(f.id),
    homeTeamName: home?.name ?? 'TBD',
    awayTeamName: away?.name ?? 'TBD',
    kickoffAt: f.starting_at ?? '',
    status: f.state?.short_name ?? 'UNKNOWN',
  };
  if (homeGoals !== undefined) fixture.homeScore = homeGoals;
  if (awayGoals !== undefined) fixture.awayScore = awayGoals;
  return fixture;
}

function mapTeam(t: SportmonksTeam): ProviderTeam {
  return {
    externalId: String(t.id),
    name: t.name,
    shortName: t.short_code ?? t.name.slice(0, 3).toUpperCase(),
    countryCode: t.country?.iso2 ?? '',
  };
}

function mapPlayer(p: SportmonksPlayer): ProviderPlayer {
  return {
    externalId: String(p.id),
    name: p.display_name ?? p.common_name ?? 'Unknown',
    position: mapPosition(p.position_id),
    teamExternalId: String(p.team_id ?? ''),
  };
}

function mapPosition(positionId?: number): string {
  const map: Record<number, string> = { 24: 'GK', 25: 'CB', 26: 'RB', 27: 'LB', 28: 'MF', 29: 'WF', 30: 'AT' };
  return map[positionId ?? 0] ?? 'UNKNOWN';
}

function mapStanding(s: SportmonksStanding): ProviderStandings {
  return {
    externalId: String(s.participant_id ?? ''),
    teamName: s.participant?.name ?? 'Unknown',
    position: s.position ?? 0,
    points: s.points ?? 0,
    played: s.details?.find(d => d.type_id === 129)?.value ?? 0,
    won: s.details?.find(d => d.type_id === 130)?.value ?? 0,
    drawn: s.details?.find(d => d.type_id === 131)?.value ?? 0,
    lost: s.details?.find(d => d.type_id === 132)?.value ?? 0,
    goalsFor: s.details?.find(d => d.type_id === 133)?.value ?? 0,
    goalsAgainst: s.details?.find(d => d.type_id === 134)?.value ?? 0,
  };
}
