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

const BASE = '/gameweeks/admin/operations';

export function getOperationalSeasons() {
  return request(`${BASE}/seasons`);
}

export function getSeasonOperationsOverview(seasonId: string) {
  return request(`${BASE}/${seasonId}/overview`);
}

export function getGameweekOperations(seasonId: string) {
  return request(`${BASE}/${seasonId}/gameweeks`);
}

export function getGameweekOperationDetail(seasonId: string, gameweekId: string) {
  return request(`${BASE}/${seasonId}/gameweeks/${gameweekId}`);
}

export function getSeasonGameweekReadiness(seasonId: string) {
  return request(`${BASE}/${seasonId}/readiness`);
}

export function getDeadlineReadiness(seasonId: string) {
  return request(`${BASE}/${seasonId}/deadlines`);
}

export function getFixtureAssignmentReadiness(seasonId: string) {
  return request(`${BASE}/${seasonId}/fixture-assignment`);
}

export function getFantasyImpact(seasonId: string) {
  return request(`${BASE}/${seasonId}/fantasy-impact`);
}

export function getPredictionImpact(seasonId: string) {
  return request(`${BASE}/${seasonId}/prediction-impact`);
}

export function getPublicationReadiness(seasonId: string) {
  return request(`${BASE}/${seasonId}/publication-readiness`);
}

export function getActivationImpact(seasonId: string) {
  return request(`${BASE}/${seasonId}/activation-impact`);
}

export function getMatchdayControl(seasonId: string) {
  return request(`${BASE}/${seasonId}/matchday-control`);
}

export function deriveGameweeks(seasonId: string, overwriteExisting = false) {
  return request(`${BASE}/${seasonId}/gameweeks/derive`, 'POST', { overwriteExisting });
}

export function deriveDeadlines(
  seasonId: string,
  opts?: { mode?: 'MISSING_ONLY' | 'OVERWRITE_DERIVED_ONLY'; fantasyBufferMinutes?: number; predictionBufferMinutes?: number },
) {
  return request(`${BASE}/${seasonId}/derive-deadlines`, 'POST', opts ?? {});
}

export function validateSeasonGameweeks(seasonId: string) {
  return request(`${BASE}/${seasonId}/validate`, 'POST');
}
