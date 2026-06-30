import { apiPost, apiUrl } from './api';
import { getToken } from './auth';

// The API model (ScorePrediction) uses createdAt, not submittedAt.
export interface ScorePrediction {
  id: string;
  fixtureId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  status: string;
  pointsAwarded: number | null;
  createdAt: string;
}

export function createScorePrediction(dto: {
  fixtureId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
}): Promise<ScorePrediction> {
  return apiPost<ScorePrediction>('/predictions', dto);
}

// GET /predictions/me/:fixtureId — returns the authenticated user's prediction
// for the given fixture, or null when they have not yet made one (API returns 404).
export async function getMyFixturePrediction(fixtureId: string): Promise<ScorePrediction | null> {
  const token = getToken();
  const res = await fetch(apiUrl(`/predictions/me/${encodeURIComponent(fixtureId)}`), {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<ScorePrediction>;
}
