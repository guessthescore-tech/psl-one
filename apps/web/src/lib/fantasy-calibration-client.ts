const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

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

export function getCalibrationSeasons() {
  return request('/fantasy/admin/calibration');
}

export function getCalibrationReadiness(seasonId: string) {
  return request(`/fantasy/admin/calibration/${seasonId}`);
}

export function getReadinessDetail(seasonId: string) {
  return request(`/fantasy/admin/calibration/${seasonId}/readiness`);
}

export function getFantasyRules(seasonId: string) {
  return request(`/fantasy/admin/calibration/${seasonId}/rules`);
}

export function createProvisionalRules(seasonId: string) {
  return request(`/fantasy/admin/calibration/${seasonId}/rules`, 'POST');
}

export function updateFantasyRules(seasonId: string, dto: Record<string, unknown>) {
  return request(`/fantasy/admin/calibration/${seasonId}/rules`, 'PATCH', dto);
}

export function getPlayerPriceReadiness(seasonId: string) {
  return request(`/fantasy/admin/calibration/${seasonId}/players`);
}

export function generateProvisionalPrices(seasonId: string) {
  return request(`/fantasy/admin/calibration/${seasonId}/players/generate-prices`, 'POST');
}

export function updatePlayerPrice(seasonId: string, playerId: string, price: number) {
  return request(`/fantasy/admin/calibration/${seasonId}/players/${playerId}/price`, 'PATCH', { price });
}

export function getSquadReadiness(seasonId: string) {
  return request(`/fantasy/admin/calibration/${seasonId}/squads`);
}

export function getGameweekReadiness(seasonId: string) {
  return request(`/fantasy/admin/calibration/${seasonId}/gameweeks`);
}

export function deriveGameweekDeadlines(seasonId: string) {
  return request(`/fantasy/admin/calibration/${seasonId}/gameweeks/derive-deadlines`, 'POST');
}

export function getActivationImpact(seasonId: string) {
  return request(`/fantasy/admin/calibration/${seasonId}/activation-impact`);
}
