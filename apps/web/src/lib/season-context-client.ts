const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

async function apiFetch<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...init, headers: { ...headers, ...init?.headers } });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export const getActiveSeasonContext = (token?: string) =>
  apiFetch<unknown>('/football/context', {}, token);

export const getActiveSeason = (token?: string) =>
  apiFetch<unknown>('/football/seasons/active', {}, token);

export const getSeasonBySlug = (slug: string, token?: string) =>
  apiFetch<unknown>(`/football/seasons/${slug}`, {}, token);

export const getAdminSeasonContext = (token?: string) =>
  apiFetch<unknown>('/seasons/admin/context', {}, token);

export const getSwitchReadiness = (seasonId: string, token?: string) =>
  apiFetch<unknown>(`/seasons/admin/switching/readiness/${seasonId}`, {}, token);

export const getSwitchPreview = (seasonId: string, token?: string) =>
  apiFetch<unknown>(`/seasons/admin/switching/preview/${seasonId}`, {}, token);

export const activateSeason = (
  seasonId: string,
  body: { acknowledgeWarnings?: boolean; activationNote?: string },
  token?: string,
) =>
  apiFetch<unknown>(`/seasons/admin/switching/activate/${seasonId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, token);

export const completeSeason = (seasonId: string, token?: string) =>
  apiFetch<unknown>(`/seasons/admin/switching/complete/${seasonId}`, { method: 'POST' }, token);

export const rollbackSeason = (seasonId: string, token?: string) =>
  apiFetch<unknown>(`/seasons/admin/switching/rollback/${seasonId}`, { method: 'POST' }, token);

export const getSwitchHistory = (seasonId?: string, token?: string) => {
  const qs = seasonId ? `?seasonId=${seasonId}` : '';
  return apiFetch<unknown>(`/seasons/admin/switching/history${qs}`, {}, token);
};
