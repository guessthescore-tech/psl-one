const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const getPlayerProfile = (playerId: string) =>
  apiFetch(`/players/${playerId}/profile`);

export const getPlayerSeasonStats = (playerId: string, seasonId: string) =>
  apiFetch(`/players/${playerId}/season/${seasonId}/stats`);

export const getPlayerMatchStat = (playerId: string, fixtureId: string) =>
  apiFetch(`/players/${playerId}/fixture/${fixtureId}/stats`);

export const listFixtureStats = (fixtureId: string) =>
  apiFetch(`/players/fixtures/${fixtureId}/stats`);

export const listSeasonTopPerformers = (seasonId: string, limit = 10) =>
  apiFetch(`/players/season/${seasonId}/top-performers?limit=${limit}`);

export const listGameweekStats = (gameweekId: string) =>
  apiFetch(`/players/gameweek/${gameweekId}/stats`);

export const listSeasonSquadStats = (seasonId: string, teamId: string) =>
  apiFetch(`/players/season/${seasonId}/team/${teamId}/squad-stats`);
