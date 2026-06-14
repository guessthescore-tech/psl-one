import { getToken } from './auth-client';

const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function authedHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authedHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${path}`);
  return res.json() as Promise<T>;
}

export const adminUpsertStandings = (dto: unknown) => req('PUT', '/admin/match-centre/standings', dto);
export const adminUpsertStanding = (seasonId: string, clubId: string, dto: unknown) =>
  req('PATCH', `/admin/match-centre/standings/${seasonId}/${clubId}`, dto);
export const adminUpsertTeamForm = (clubId: string, dto: unknown) =>
  req('PUT', `/admin/match-centre/team-form/${clubId}`, dto);
export const adminUpsertPlayerRating = (dto: unknown) => req('POST', '/admin/match-centre/player-ratings', dto);
export const adminIngestSandboxData = (dto: unknown) => req('POST', '/admin/match-centre/ingest', dto);
export const adminGetIngestionLog = (params?: {
  entityType?: string;
  entityId?: string;
  sourceType?: string;
  limit?: number;
}) => {
  const qs = new URLSearchParams();
  if (params?.entityType) qs.set('entityType', params.entityType);
  if (params?.entityId) qs.set('entityId', params.entityId);
  if (params?.sourceType) qs.set('sourceType', params.sourceType);
  if (params?.limit !== undefined) qs.set('limit', String(params.limit));
  return req('GET', `/admin/match-centre/ingestion-log?${qs}`);
};
export const adminGetCapabilityStatus = () => req('GET', '/admin/match-centre/capability-status');
