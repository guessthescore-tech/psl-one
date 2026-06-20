/**
 * Base API utilities for PSL One Experience app.
 * All API calls go through the PSL One NestJS backend — never directly to
 * third-party sports data providers from the browser.
 *
 * Security: NEXT_PUBLIC_API_BASE_URL is the only public env var (it is just a
 * hostname, not a secret). Never add NEXT_PUBLIC_* keys for secrets here.
 */

import { getToken } from './auth';

const API_BASE =
  typeof window === 'undefined'
    ? (process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000')
    : (process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000');

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

function authedHeaders(extra?: HeadersInit): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra ?? {}),
  };
}

/**
 * Generic authenticated fetch. Adds Bearer token when present and throws on
 * non-2xx responses with a descriptive error message.
 */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: authedHeaders(options?.headers),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    const body = await res.json().catch(() => ({})) as { message?: string; errors?: string[] };
    const msg = Array.isArray(body.errors)
      ? body.errors.join(', ')
      : (body.message ?? `HTTP ${res.status}`);
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

/**
 * POST with JSON body. Returns parsed response body.
 */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * PATCH with JSON body. Returns parsed response body.
 */
export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/**
 * DELETE. Resolves when the server responds 2xx. Throws otherwise.
 */
export async function apiDelete(path: string): Promise<void> {
  await apiFetch<unknown>(path, { method: 'DELETE' });
}

/**
 * Unauthenticated GET — for public endpoints that don't require a token.
 */
export async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path), {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
