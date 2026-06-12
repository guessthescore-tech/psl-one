import { getToken } from './auth-client';

const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function authedHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function req<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: authedHeaders() });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${path}`);
  return res.json() as Promise<T>;
}

export const getBetaOverview = () => req('/admin/beta-feedback/overview');
export const getBetaKnownIssues = () => req('/admin/beta-feedback/known-issues');
export const getBetaUxChecklist = () => req('/admin/beta-feedback/ux-checklist');
export const getBetaReleaseNotes = () => req('/admin/beta-feedback/release-notes');
