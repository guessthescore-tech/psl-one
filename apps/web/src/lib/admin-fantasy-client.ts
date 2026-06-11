const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function token() {
  return typeof window !== 'undefined' ? localStorage.getItem('psl_access_token') : null;
}

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function recalculateDeadline(gameweekId: string) {
  return request(`/fantasy/admin/gameweeks/${gameweekId}/recalculate-deadline`, 'POST');
}

export function rolloverTransfers(gameweekId: string) {
  return request(`/fantasy/admin/gameweeks/${gameweekId}/rollover-transfers`, 'POST');
}

export function setPlayerPrice(playerId: string, seasonId: string, price: number, reason?: string) {
  return request(`/fantasy/admin/players/${playerId}/price`, 'POST', { seasonId, price, ...(reason ? { reason } : {}) });
}

export function processAutoSubs(gameweekId: string) {
  return request(`/fantasy/admin/gameweeks/${gameweekId}/process-auto-subs`, 'POST');
}

export function upsertMatchStat(fixtureId: string, data: {
  playerId: string;
  minutesPlayed?: number;
  goals?: number;
  assists?: number;
  ownGoals?: number;
  yellowCards?: number;
  redCards?: number;
  cleanSheet?: boolean;
  saves?: number;
  penaltiesSaved?: number;
  penaltiesMissed?: number;
  bonusPoints?: number;
  tacklesWon?: number;
  interceptions?: number;
  blockedShots?: number;
  didNotPlay?: boolean;
}) {
  return request(`/fantasy/admin/fixtures/${fixtureId}/match-stats`, 'POST', data);
}

export function settleFantasyPoints(fixtureId: string) {
  return request(`/fantasy/admin/fixtures/${fixtureId}/settle-fantasy-points`, 'POST');
}

export function generateH2HFixtures(leagueId: string, gameweekId: string) {
  return request(`/fantasy/admin/leagues/${leagueId}/generate-head-to-head-fixtures?gameweekId=${gameweekId}`, 'POST');
}

export function settleH2HGameweek(leagueId: string, gameweekId: string) {
  return request(`/fantasy/admin/leagues/${leagueId}/settle-head-to-head-gameweek/${gameweekId}`, 'POST');
}

export function createCup(seasonId: string, name: string) {
  return request('/fantasy/admin/cups', 'POST', { seasonId, name });
}

export function generateCupRound(cupId: string, gameweekId: string, roundName: string, teamIds: string[]) {
  return request(`/fantasy/admin/cups/${cupId}/generate-round`, 'POST', { gameweekId, roundName, teamIds });
}

export function settleCupRound(cupId: string, gameweekId: string) {
  return request(`/fantasy/admin/cups/${cupId}/settle-round/${gameweekId}`, 'POST');
}
