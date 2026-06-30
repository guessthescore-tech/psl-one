import { Logger } from '@nestjs/common';
import { FixtureStatus, MatchEventType, LineupStatus } from '@prisma/client';
import type {
  LiveMatchProviderAdapter,
  ProviderFixtureState,
  ProviderMatchEvent,
  ProviderLineupEntry,
  ProviderPlayerStat,
} from './live-match-provider.interface';

/**
 * Sportmonks v3 live-match provider for World Cup 2026 beta.
 *
 * PSL production use is not authorised — see ADR-037.
 * Set WC_LIVE_PROVIDER=sportmonks + SPORTMONKS_API_KEY to activate.
 * Falls back gracefully to null/empty arrays when key is absent.
 * Provider keys are never returned in API responses.
 */
export class SportmonksLiveMatchAdapter implements LiveMatchProviderAdapter {
  readonly providerName = 'sportmonks';
  private readonly logger = new Logger(SportmonksLiveMatchAdapter.name);
  private readonly apiKey: string | undefined;
  private readonly baseUrl = 'https://api.sportmonks.com/v3/football';

  constructor() {
    this.apiKey = process.env['SPORTMONKS_API_KEY'];
    if (!this.apiKey) {
      this.logger.warn({ action: 'provider.disabled', provider: this.providerName, requiredKey: 'SPORTMONKS_API_KEY' });
    }
  }

  async fetchFixtureState(providerFixtureId: string): Promise<ProviderFixtureState | null> {
    const data = await this.fetchSafe<{ data: SmFixture }>(
      `${this.baseUrl}/fixtures/${providerFixtureId}?include=state;scores`,
    );
    if (!data?.data) return null;
    return mapFixtureState(data.data, providerFixtureId);
  }

  async fetchFixtureEvents(providerFixtureId: string): Promise<ProviderMatchEvent[]> {
    const data = await this.fetchSafe<{ data: SmEvent[] }>(
      `${this.baseUrl}/fixtures/${providerFixtureId}/events`,
    );
    if (!data?.data) return [];
    return data.data.flatMap(e => {
      const mapped = mapEvent(e);
      return mapped ? [mapped] : [];
    });
  }

  async fetchFixtureLineups(providerFixtureId: string): Promise<ProviderLineupEntry[]> {
    const data = await this.fetchSafe<{ data: SmLineup[] }>(
      `${this.baseUrl}/fixtures/${providerFixtureId}/lineups`,
    );
    if (!data?.data) return [];
    return data.data.map(mapLineup);
  }

  async fetchFixturePlayerStats(providerFixtureId: string): Promise<ProviderPlayerStat[]> {
    const data = await this.fetchSafe<{ data: SmPlayerStat[] }>(
      `${this.baseUrl}/fixtures/${providerFixtureId}/statistics`,
    );
    if (!data?.data) return [];
    return data.data.flatMap(s => {
      const mapped = mapPlayerStat(s);
      return mapped ? [mapped] : [];
    });
  }

  // ── Internal ─────────────────────────────────────────────────────────────

  private async fetchSafe<T>(url: string): Promise<T | null> {
    if (!this.apiKey) return null;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: AbortSignal.timeout(8000),
      });
      if (res.status === 401 || res.status === 403) {
        this.logger.warn({ action: 'provider.auth_error', provider: this.providerName, url, statusCode: res.status });
        return null;
      }
      if (res.status === 429) {
        this.logger.warn({ action: 'provider.rate_limited', provider: this.providerName, url });
        return null;
      }
      if (!res.ok) {
        this.logger.warn({ action: 'provider.http_error', provider: this.providerName, url, statusCode: res.status });
        return null;
      }
      return (await res.json()) as T;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn({ action: 'provider.fetch_failed', provider: this.providerName, url, error: msg });
      return null;
    }
  }
}

// ── Sportmonks raw types (v3 trial) ───────────────────────────────────────────

interface SmFixture {
  id: number;
  starting_at?: string;
  state?: {
    state?: string;     // e.g. "live", "HT", "FT", "NS"
    short_name?: string;
    developer_name?: string;
  };
  scores?: SmScore[];
  periods?: SmPeriod[];
}

interface SmScore {
  description?: string;   // "CURRENT", "1ST_HALF", "2ND_HALF", "EXTRA_TIME", "PENALTIES"
  score?: {
    participant?: 'home' | 'away';
    goals?: number;
  };
}

interface SmPeriod {
  description?: string;   // "1ST_HALF", "2ND_HALF", "EXTRA_TIME"
  started?: string;
  ended?: string;
}

interface SmEvent {
  id: number;
  type_id?: number;       // Sportmonks event type numeric ID
  fixture_id?: number;
  participant_id?: number;
  player_id?: number;
  related_player_id?: number;
  minute?: number;
  extra_minute?: number;
  addition?: string;
  result?: string;
  info?: string;
  player_name?: string;
  related_player_name?: string;
  section?: string;       // "1ST_HALF", "2ND_HALF"
}

interface SmLineup {
  player_id?: number;
  team_id?: number;
  type_id?: number;       // 11=starting, 12=bench, 13=coach
  jersey_number?: number;
  position?: { developer_name?: string };
}

interface SmPlayerStat {
  player_id?: number;
  team_id?: number;
  data?: SmStatDetail[];
}

interface SmStatDetail {
  type_id?: number;
  value?: { total?: number; header?: string } | number;
}

// ── Sportmonks event type_id → MatchEventType mapping ─────────────────────────
// Reference: https://docs.sportmonks.com/football/extras/event-type-ids

const SM_EVENT_MAP: Record<number, MatchEventType> = {
  14: MatchEventType.GOAL,
  15: MatchEventType.OWN_GOAL,
  17: MatchEventType.YELLOW_CARD,
  18: MatchEventType.RED_CARD,
  19: MatchEventType.SECOND_YELLOW,
  20: MatchEventType.SUBSTITUTION,
  45: MatchEventType.PENALTY_SCORED,
  46: MatchEventType.PENALTY_MISSED,
  73: MatchEventType.KICKOFF,
  74: MatchEventType.HALF_TIME,
  75: MatchEventType.FULL_TIME,
  76: MatchEventType.SECOND_HALF,
  107: MatchEventType.VAR,
};

// ── Sportmonks stat type_id constants ─────────────────────────────────────────
const SM_STAT = {
  MINUTES_PLAYED: 119,
  GOALS: 52,
  ASSISTS: 79,
  YELLOW_CARDS: 84,
  RED_CARDS: 83,
  SAVES: 57,
  GOALS_CONCEDED: 88,
  OWN_GOALS: 68,
};

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapFixtureState(f: SmFixture, providerFixtureId: string): ProviderFixtureState {
  const stateStr = (f.state?.state ?? f.state?.developer_name ?? 'NS').toLowerCase();

  const currentScore = f.scores?.find(s => s.description === 'CURRENT');
  const homeScore = f.scores?.find(
    s => s.score?.participant === 'home' && s.description === 'CURRENT',
  )?.score?.goals ?? 0;
  const awayScore = f.scores?.find(
    s => s.score?.participant === 'away' && s.description === 'CURRENT',
  )?.score?.goals ?? 0;

  const halfPeriod = f.periods?.find(p => p.description === '1ST_HALF');
  const secondPeriod = f.periods?.find(p => p.description === '2ND_HALF');

  return {
    providerFixtureId,
    status: mapStatus(stateStr),
    homeScore,
    awayScore,
    currentMinute: null,
    period: mapPeriod(stateStr),
    startedAt: halfPeriod?.started ? new Date(halfPeriod.started) : null,
    halfTimeAt: halfPeriod?.ended ? new Date(halfPeriod.ended) : null,
    resumedAt: secondPeriod?.started ? new Date(secondPeriod.started) : null,
    finishedAt: secondPeriod?.ended ? new Date(secondPeriod.ended) : null,
  };
}

function mapStatus(state: string): FixtureStatus {
  if (state === 'live' || state === 'inplay' || state === 'in_play') return FixtureStatus.LIVE;
  if (state === 'ht' || state === 'half_time') return FixtureStatus.HALF_TIME;
  if (state === 'ft' || state === 'finished' || state === 'ended' || state === 'aet' || state === 'pen') return FixtureStatus.FINISHED;
  if (state === 'postponed') return FixtureStatus.POSTPONED;
  if (state === 'cancelled') return FixtureStatus.CANCELLED;
  return FixtureStatus.SCHEDULED;
}

function mapPeriod(state: string): string | null {
  if (state === 'live' || state === 'inplay') return '1ST_HALF';
  if (state === 'ht') return 'HALF_TIME';
  if (state === 'ft') return '2ND_HALF';
  return null;
}

function mapEvent(e: SmEvent): ProviderMatchEvent | null {
  if (!e.type_id) return null;
  const eventType = SM_EVENT_MAP[e.type_id];
  if (!eventType) return null;

  return {
    providerEventId: String(e.id),
    eventType,
    minute: e.minute ?? 0,
    stoppageMinute: e.extra_minute ?? null,
    period: e.section ?? null,
    teamProviderRef: e.participant_id != null ? String(e.participant_id) : null,
    playerProviderRef: e.player_id != null ? String(e.player_id) : null,
    relatedPlayerProviderRef: e.related_player_id != null ? String(e.related_player_id) : null,
    description: e.player_name ?? e.info ?? null,
  };
}

function mapLineup(l: SmLineup): ProviderLineupEntry {
  const typeId = l.type_id ?? 0;
  let status: ProviderLineupEntry['status'] = 'UNAVAILABLE';
  if (typeId === 11) status = 'STARTING';
  else if (typeId === 12) status = 'SUBSTITUTE';

  return {
    playerProviderRef: String(l.player_id ?? ''),
    teamProviderRef: String(l.team_id ?? ''),
    status,
    shirtNumber: l.jersey_number ?? null,
    position: l.position?.developer_name ?? null,
  };
}

function getStatValue(data: SmStatDetail[], typeId: number): number {
  const entry = data.find(d => d.type_id === typeId);
  if (!entry) return 0;
  const v = entry.value;
  if (typeof v === 'number') return v;
  if (typeof v === 'object' && v !== null && 'total' in v) return v.total ?? 0;
  return 0;
}

function mapPlayerStat(s: SmPlayerStat): ProviderPlayerStat | null {
  if (!s.player_id || !s.team_id) return null;
  const data = s.data ?? [];
  const minutes = getStatValue(data, SM_STAT.MINUTES_PLAYED);

  return {
    playerProviderRef: String(s.player_id),
    teamProviderRef: String(s.team_id),
    minutesPlayed: minutes,
    goals: getStatValue(data, SM_STAT.GOALS),
    assists: getStatValue(data, SM_STAT.ASSISTS),
    ownGoals: getStatValue(data, SM_STAT.OWN_GOALS),
    yellowCards: getStatValue(data, SM_STAT.YELLOW_CARDS),
    redCards: getStatValue(data, SM_STAT.RED_CARDS),
    saves: getStatValue(data, SM_STAT.SAVES),
    goalsConceded: getStatValue(data, SM_STAT.GOALS_CONCEDED),
    cleanSheet: getStatValue(data, SM_STAT.GOALS_CONCEDED) === 0 && minutes >= 60,
    started: true,
    cameOnMinute: null,
    subbedOffMinute: null,
  };
}
