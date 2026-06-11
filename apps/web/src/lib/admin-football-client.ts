import type { FixtureStatus, MatchEvent, MatchEventType, PlayerMatchStat } from './football-client';

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('psl_access_token');
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface UpdateLiveStatePayload {
  status?: FixtureStatus;
  currentMinute?: number;
  period?: string;
}

export interface AddMatchEventPayload {
  eventType: MatchEventType;
  minute: number;
  stoppageMinute?: number;
  period?: string;
  teamId?: string;
  playerId?: string;
  relatedPlayerId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  providerEventId?: string;
  updateScore?: boolean;
}

export interface UpdateMatchEventPayload {
  eventType?: MatchEventType;
  minute?: number;
  stoppageMinute?: number;
  period?: string;
  teamId?: string;
  playerId?: string;
  relatedPlayerId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface UpsertPlayerStatPayload {
  playerId: string;
  teamId?: string;
  minutesPlayed?: number;
  goals?: number;
  assists?: number;
  ownGoals?: number;
  yellowCards?: number;
  redCards?: number;
  penaltiesMissed?: number;
  penaltiesSaved?: number;
  saves?: number;
  goalsConceded?: number;
  cleanSheet?: boolean;
  started?: boolean;
  cameOnMinute?: number;
  subbedOffMinute?: number;
  didNotPlay?: boolean;
  source?: string;
  providerStatId?: string;
}

export interface BulkUpsertResult {
  fixtureId: string;
  succeeded: number;
  errors: string[];
}

const adminFootballClient = {
  updateScore: (fixtureId: string, payload: { homeScore: number; awayScore: number }) =>
    apiRequest<{ id: string; homeScore: number | null; awayScore: number | null }>(
      `/football/admin/fixtures/${fixtureId}/score`,
      { method: 'PATCH', body: JSON.stringify(payload) },
    ),

  updateLiveState: (fixtureId: string, payload: UpdateLiveStatePayload) =>
    apiRequest<{ id: string; status: FixtureStatus; currentMinute: number | null; period: string | null }>(
      `/football/admin/fixtures/${fixtureId}/live-state`,
      { method: 'PATCH', body: JSON.stringify(payload) },
    ),

  addMatchEvent: (fixtureId: string, payload: AddMatchEventPayload) =>
    apiRequest<MatchEvent>(
      `/football/admin/fixtures/${fixtureId}/events`,
      { method: 'POST', body: JSON.stringify(payload) },
    ),

  updateMatchEvent: (eventId: string, payload: UpdateMatchEventPayload) =>
    apiRequest<MatchEvent>(
      `/football/admin/events/${eventId}`,
      { method: 'PATCH', body: JSON.stringify(payload) },
    ),

  deleteMatchEvent: (eventId: string) =>
    apiRequest<{ deleted: boolean; id: string }>(
      `/football/admin/events/${eventId}`,
      { method: 'DELETE' },
    ),

  upsertPlayerStat: (fixtureId: string, payload: UpsertPlayerStatPayload) =>
    apiRequest<PlayerMatchStat>(
      `/football/admin/fixtures/${fixtureId}/player-stats`,
      { method: 'POST', body: JSON.stringify(payload) },
    ),

  bulkUpsertPlayerStats: (fixtureId: string, stats: UpsertPlayerStatPayload[]) =>
    apiRequest<BulkUpsertResult>(
      `/football/admin/fixtures/${fixtureId}/player-stats/bulk`,
      { method: 'POST', body: JSON.stringify({ stats }) },
    ),

  recalculateState: (fixtureId: string) =>
    apiRequest<{ id: string; homeScore: number; awayScore: number; status: FixtureStatus; currentMinute: number | null }>(
      `/football/admin/fixtures/${fixtureId}/recalculate-state`,
      { method: 'POST' },
    ),

  finaliseFixture: (fixtureId: string) =>
    apiRequest<{ id: string; status: FixtureStatus; finishedAt: string }>(
      `/football/admin/fixtures/${fixtureId}/finalise`,
      { method: 'POST' },
    ),

  reopenFixture: (fixtureId: string) =>
    apiRequest<{ id: string; status: FixtureStatus; lastUpdatedAt: string }>(
      `/football/admin/fixtures/${fixtureId}/reopen`,
      { method: 'POST' },
    ),

  syncProvider: (fixtureId: string) =>
    apiRequest<{ synced: boolean; reason?: string; fixtureId?: string; provider?: string }>(
      `/football/admin/fixtures/${fixtureId}/sync-provider`,
      { method: 'POST' },
    ),
};

export default adminFootballClient;
