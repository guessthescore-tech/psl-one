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

const BASE_URL = 'https://wheniskickoff.com/data/v1';

type WhenIsKickoffMatch = {
  id?: string | number;
  externalId?: string | number;
  matchId?: string | number;
  num?: number;
  slug?: string;
  date?: string;
  time_utc?: string;
  datetime_utc?: string;
  homeTeam?: unknown;
  awayTeam?: unknown;
  home?: string;
  away?: string;
  home_name?: string;
  away_name?: string;
  kickoffAt?: string;
  utcDate?: string;
  startTime?: string;
  status?: string;
  score_home?: number | null;
  score_away?: number | null;
  homeScore?: number | null;
  awayScore?: number | null;
  score?: {
    fullTime?: { home?: number | null; away?: number | null };
    home?: number | null;
    away?: number | null;
  };
};

type WhenIsKickoffTeam = {
  id?: string | number;
  name?: string;
  shortName?: string;
  code?: string;
  country?: string;
  countryCode?: string;
};

type WhenIsKickoffSeason = {
  id?: string | number;
  name?: string;
  competition?: string;
  competitionName?: string;
  startDate?: string;
  endDate?: string;
};

@Injectable()
export class WhenIsKickoffAdapter implements ProviderAdapter {
  readonly name = 'wheniskickoff';
  private readonly logger = new Logger(WhenIsKickoffAdapter.name);

  private async fetchJson<T>(path: string): Promise<T | null> {
    try {
      const res = await globalThis.fetch(`${BASE_URL}${path}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        this.logger.warn(`wheniskickoff returned ${res.status} for ${path}`);
        return null;
      }
      return (await res.json()) as T;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`wheniskickoff fetch error: ${msg}`);
      return null;
    }
  }

  private unwrapArray<T>(payload: unknown, keys: string[]): T[] {
    if (Array.isArray(payload)) return payload as T[];
    if (!payload || typeof payload !== 'object') return [];
    for (const key of keys) {
      const value = (payload as Record<string, unknown>)[key];
      if (Array.isArray(value)) return value as T[];
    }
    return [];
  }

  private pickTeamName(value: unknown): string {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object') return 'TBD';
    const record = value as Record<string, unknown>;
    return (
      (typeof record['name'] === 'string' && record['name']) ||
      (typeof record['shortName'] === 'string' && record['shortName']) ||
      (typeof record['teamName'] === 'string' && record['teamName']) ||
      'TBD'
    );
  }

  private pickMatchId(match: WhenIsKickoffMatch, index: number): string {
    const id = match.id ?? match.externalId ?? match.matchId ?? match.slug ?? match.num;
    return id != null ? String(id) : `wheniskickoff-${index + 1}`;
  }

  async health(): Promise<ProviderAdapterHealth> {
    const matches = await this.fetchJson<unknown>('/matches.json');
    const list = this.unwrapArray<unknown>(matches, ['matches', 'data', 'fixtures']);
    if (list.length > 0) {
      return {
        available: true,
        provider: this.name,
        message: `wheniskickoff public schedule feed available (${list.length} matches)`,
      };
    }
    return {
      available: false,
      provider: this.name,
      message: 'wheniskickoff schedule feed returned no matches',
    };
  }

  async getSeasons(): Promise<ProviderSeason[]> {
    const matches = await this.fetchJson<unknown>('/matches.json');
    const list = this.unwrapArray<WhenIsKickoffMatch>(matches, ['matches', 'data', 'fixtures']);
    if (list.length === 0) {
      return [
        {
          externalId: 'wheniskickoff-world-cup-2026',
          name: 'FIFA World Cup 2026',
          competitionName: 'FIFA World Cup',
          startDate: '2026-06-11',
          endDate: '2026-07-19',
        },
      ];
    }
    return [
      {
        externalId: 'wheniskickoff-world-cup-2026',
        name: 'FIFA World Cup 2026',
        competitionName: 'FIFA World Cup',
        startDate: list[0]?.kickoffAt ?? list[0]?.utcDate ?? '2026-06-11',
        endDate: list[list.length - 1]?.kickoffAt ?? list[list.length - 1]?.utcDate ?? '2026-07-19',
      },
    ];
  }

  async getFixtures(_seasonExternalId: string): Promise<ProviderFixture[]> {
    const matches = await this.fetchJson<unknown>('/matches.json');
    const list = this.unwrapArray<WhenIsKickoffMatch>(matches, ['matches', 'data', 'fixtures']);
    return list
      .map((match, index) => {
        let kickoffAt = match.kickoffAt ?? match.datetime_utc ?? match.utcDate ?? match.startTime ?? '';
        if (!kickoffAt && match.date && match.time_utc) {
          kickoffAt = `${match.date}T${match.time_utc}:00Z`;
        }
        const homeTeamName = match.home_name ?? match.home ?? this.pickTeamName(match.homeTeam);
        const awayTeamName = match.away_name ?? match.away ?? this.pickTeamName(match.awayTeam);
        const fullTime = match.score?.fullTime;
        const homeScore = match.homeScore ?? match.score_home ?? fullTime?.home ?? match.score?.home ?? undefined;
        const awayScore = match.awayScore ?? match.score_away ?? fullTime?.away ?? match.score?.away ?? undefined;
        return {
          externalId: this.pickMatchId(match, index),
          homeTeamName,
          awayTeamName,
          kickoffAt,
          status: match.status ?? 'SCHEDULED',
          ...(homeScore != null ? { homeScore } : {}),
          ...(awayScore != null ? { awayScore } : {}),
        };
      })
      .filter((fixture) => fixture.homeTeamName !== 'TBD' && fixture.awayTeamName !== 'TBD');
  }

  async getTeams(_seasonExternalId: string): Promise<ProviderTeam[]> {
    const teams = await this.fetchJson<unknown>('/teams.json');
    const list = this.unwrapArray<WhenIsKickoffTeam>(teams, ['teams', 'data']);
    return list.map((team, index) => ({
      externalId: String(team.id ?? team.code ?? `wheniskickoff-team-${index + 1}`),
      name: team.name ?? team.shortName ?? team.code ?? 'Unknown',
      shortName: team.shortName ?? team.code ?? team.name ?? 'Unknown',
      countryCode: team.countryCode ?? team.country ?? '',
    }));
  }

  async getPlayers(_teamExternalId: string): Promise<ProviderPlayer[]> {
    return [];
  }

  async getStandings(_seasonExternalId: string): Promise<ProviderStandings[]> {
    return [];
  }
}
