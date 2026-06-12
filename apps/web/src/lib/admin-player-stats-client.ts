import { getToken } from './auth-client';

const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function authedHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { ...authedHeaders(), ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const listAdminStats = (params?: { seasonId?: string; fixtureId?: string; status?: string }) => {
  const qs = new URLSearchParams();
  if (params?.seasonId) qs.set('seasonId', params.seasonId);
  if (params?.fixtureId) qs.set('fixtureId', params.fixtureId);
  if (params?.status) qs.set('status', params.status);
  const q = qs.toString();
  return apiFetch(`/players/admin/stats${q ? `?${q}` : ''}`);
};

export const getAdminStatDetail = (id: string) =>
  apiFetch(`/players/admin/stats/${id}`);

export const getSeasonStatsReadiness = (seasonId: string) =>
  apiFetch(`/players/admin/stats/season/${seasonId}/readiness`);

export const upsertStat = (body: Record<string, unknown>) =>
  apiFetch('/players/admin/stats', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const verifyStat = (id: string) =>
  apiFetch(`/players/admin/stats/${id}/verify`, { method: 'POST' });

export const publishStat = (id: string) =>
  apiFetch(`/players/admin/stats/${id}/publish`, { method: 'POST' });

export const lockStat = (id: string) =>
  apiFetch(`/players/admin/stats/${id}/lock`, { method: 'POST' });

export const bulkPublishFixture = (fixtureId: string) =>
  apiFetch(`/players/admin/stats/fixture/${fixtureId}/bulk-publish`, { method: 'POST' });

export const deleteStat = (id: string) =>
  apiFetch(`/players/admin/stats/${id}`, { method: 'DELETE' });
