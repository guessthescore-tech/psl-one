import { getToken } from './auth-client';

const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function url(path: string) {
  return `${BASE}/leaderboards${path}`;
}

function authedHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function req<T>(u: string, init?: RequestInit): Promise<T> {
  const res = await fetch(u, { ...init, headers: { ...authedHeaders(), ...init?.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string | null;
  totalPoints: number;
}

export interface LeaderboardResult {
  leaderboardType: string;
  seasonId: string | null;
  seasonName: string | null;
  seasonSlug: string | null;
  scope: 'SEASON' | 'ALL_TIME';
  pointsOnly: boolean;
  nonFinancial: boolean;
  entries: LeaderboardEntry[];
  limit: number;
}

export interface LeaderboardOverview {
  seasonId: string | null;
  seasonName: string | null;
  seasonSlug: string | null;
  scope: 'SEASON' | 'ALL_TIME';
  pointsOnly: boolean;
  nonFinancial: boolean;
  leaderboards: {
    fanValue: LeaderboardResult;
    fantasy: LeaderboardResult;
    predictions: LeaderboardResult;
    achievements: LeaderboardResult;
  };
  note: string;
}

export interface LeaderboardSeason {
  id: string;
  name: string;
  slug: string;
  status: string;
  isActive: boolean;
  startDate: string;
  leaderboardUrl: string;
}

export function getLeaderboardOverview(seasonSlug?: string): Promise<LeaderboardOverview> {
  const qs = seasonSlug ? `?seasonSlug=${encodeURIComponent(seasonSlug)}` : '';
  return req<LeaderboardOverview>(url(`/${qs}`));
}

export function getLeaderboardSeasons(): Promise<LeaderboardSeason[]> {
  return req<LeaderboardSeason[]>(url('/seasons'));
}

export function getOverallLeaderboard(seasonSlug?: string, limit?: number): Promise<LeaderboardResult> {
  const params = new URLSearchParams();
  if (seasonSlug) params.set('seasonSlug', seasonSlug);
  if (limit) params.set('limit', String(limit));
  const qs = params.toString() ? `?${params}` : '';
  return req<LeaderboardResult>(url(`/overall${qs}`));
}

export function getFanValueLeaderboard(seasonSlug?: string, limit?: number): Promise<LeaderboardResult> {
  const params = new URLSearchParams();
  if (seasonSlug) params.set('seasonSlug', seasonSlug);
  if (limit) params.set('limit', String(limit));
  const qs = params.toString() ? `?${params}` : '';
  return req<LeaderboardResult>(url(`/fan-value${qs}`));
}

export function getFantasyLeaderboard(seasonSlug?: string, limit?: number): Promise<LeaderboardResult> {
  const params = new URLSearchParams();
  if (seasonSlug) params.set('seasonSlug', seasonSlug);
  if (limit) params.set('limit', String(limit));
  const qs = params.toString() ? `?${params}` : '';
  return req<LeaderboardResult>(url(`/fantasy${qs}`));
}

export function getPredictionsLeaderboard(seasonSlug?: string, limit?: number): Promise<LeaderboardResult> {
  const params = new URLSearchParams();
  if (seasonSlug) params.set('seasonSlug', seasonSlug);
  if (limit) params.set('limit', String(limit));
  const qs = params.toString() ? `?${params}` : '';
  return req<LeaderboardResult>(url(`/predictions${qs}`));
}

export function getAchievementsLeaderboard(limit?: number): Promise<LeaderboardResult> {
  const qs = limit ? `?limit=${limit}` : '';
  return req<LeaderboardResult>(url(`/achievements${qs}`));
}
