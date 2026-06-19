/**
 * Fantasy API client — LIVE_BETA_DATA only.
 * All functions are no-ops that throw when called in DESIGN_REVIEW_DATA mode.
 * Components should guard with getDataMode() before calling these.
 */

export interface League {
  id: string;
  name: string;
  type: 'PRIVATE' | 'PUBLIC' | 'GLOBAL';
  memberCount: number;
  inviteCode?: string;
  managedBy: string;
  seasonId: string;
  createdAt: string;
  scoringType: string;
}

export interface LeagueMembership {
  leagueId: string;
  userId: string;
  rank: number;
  previousRank: number;
  totalPoints: number;
  gwPoints: number;
  joinedAt: string;
}

export interface ClassicStandingsRow {
  rank: number;
  previousRank: number;
  managerId: string;
  managerName: string;
  teamName: string;
  gwPoints: number;
  totalPoints: number;
}

export interface FantasyHistoryEntry {
  gameweekId: string;
  gameweekName: string;
  points: number;
  rank: number;
  overallRank: number;
  transfersMade: number;
  chipUsed?: string;
}

export interface FantasyGameweekScore {
  gameweekId: string;
  gameweekName: string;
  points: number;
  rank: number;
  overallRank: number;
  transfersMade: number;
  transferCost: number;
  chipUsed?: string;
}

const BASE = '/api/fantasy';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function getMyLeagues(): Promise<League[]> {
  return apiFetch<League[]>('/leagues/my');
}

export async function getLeague(leagueId: string): Promise<League> {
  return apiFetch<League>(`/leagues/${leagueId}`);
}

export async function getLeagueStandings(leagueId: string): Promise<ClassicStandingsRow[]> {
  return apiFetch<ClassicStandingsRow[]>(`/leagues/${leagueId}/standings`);
}

export async function joinLeagueByCode(code: string): Promise<League> {
  return apiFetch<League>('/leagues/join', {
    method: 'POST',
    body: JSON.stringify({ inviteCode: code }),
  });
}

export async function joinPublicLeague(leagueId: string): Promise<LeagueMembership> {
  return apiFetch<LeagueMembership>(`/leagues/${leagueId}/join`, {
    method: 'POST',
  });
}

export async function createLeague(name: string, type: 'PRIVATE' | 'PUBLIC'): Promise<League> {
  return apiFetch<League>('/leagues', {
    method: 'POST',
    body: JSON.stringify({ name, type }),
  });
}

export async function leaveLeague(leagueId: string): Promise<void> {
  await apiFetch<void>(`/leagues/${leagueId}/leave`, { method: 'DELETE' });
}

export async function getHistory(): Promise<FantasyHistoryEntry[]> {
  return apiFetch<FantasyHistoryEntry[]>('/history');
}

export async function getGameweekHistory(gameweekId: string): Promise<FantasyGameweekScore> {
  return apiFetch<FantasyGameweekScore>(`/history/${gameweekId}`);
}

export async function getGameweekScore(gameweekId: string): Promise<FantasyGameweekScore> {
  return apiFetch<FantasyGameweekScore>(`/scores/${gameweekId}`);
}
