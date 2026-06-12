import { getToken } from './auth-client';

const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function url(path: string) {
  return `${BASE}/admin/engagement${path}`;
}

function authedHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function req<T>(u: string, init?: RequestInit): Promise<T> {
  const res = await fetch(u, { ...init, headers: { ...authedHeaders(), ...init?.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function listEngagementSeasons(): Promise<unknown> {
  return req<unknown>(url('/seasons'));
}

export function getEngagementOverview(seasonId: string): Promise<unknown> {
  return req<unknown>(url(`/${seasonId}/overview`));
}

export function getEngagementLeaderboards(seasonId: string): Promise<unknown> {
  return req<unknown>(url(`/${seasonId}/leaderboards`));
}

export function getEngagementFanValue(seasonId: string): Promise<unknown> {
  return req<unknown>(url(`/${seasonId}/fan-value`));
}

export function getEngagementFantasy(seasonId: string): Promise<unknown> {
  return req<unknown>(url(`/${seasonId}/fantasy`));
}

export function getEngagementPredictions(seasonId: string): Promise<unknown> {
  return req<unknown>(url(`/${seasonId}/predictions`));
}

export function getEngagementAchievements(seasonId: string): Promise<unknown> {
  return req<unknown>(url(`/${seasonId}/achievements`));
}

export function getUnscopedLedger(seasonId: string): Promise<unknown> {
  return req<unknown>(url(`/${seasonId}/unscoped-ledger`));
}

export function getSeasonScopeAudit(seasonId: string): Promise<unknown> {
  return req<unknown>(url(`/${seasonId}/season-scope-audit`));
}

export function getActivationImpact(seasonId: string): Promise<unknown> {
  return req<unknown>(url(`/${seasonId}/activation-impact`));
}
