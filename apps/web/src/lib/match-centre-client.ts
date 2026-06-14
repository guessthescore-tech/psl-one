import { getToken } from './auth-client';

const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function authedHeaders(): HeadersInit {
  const token = getToken();
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: authedHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${path}`);
  return res.json() as Promise<T>;
}

export const getFixtureMatchCentre = (fixtureId: string) => req(`/match-centre/fixture/${fixtureId}`);
export const getFixtureLineups = (fixtureId: string) => req(`/match-centre/fixture/${fixtureId}/line-ups`);
export const getFixtureStats = (fixtureId: string) => req(`/match-centre/fixture/${fixtureId}/stats`);
export const getFixturePlayerRatings = (fixtureId: string) => req(`/match-centre/fixture/${fixtureId}/player-ratings`);
export const getSeasonStandings = (seasonId: string) => req(`/match-centre/standings/${seasonId}`);
export const getTeamForm = (clubId: string, seasonId: string) =>
  req(`/match-centre/team-form/${clubId}?seasonId=${seasonId}`);
export const getPlayerProfile = (playerId: string, seasonId: string) =>
  req(`/match-centre/player/${playerId}?seasonId=${seasonId}`);
