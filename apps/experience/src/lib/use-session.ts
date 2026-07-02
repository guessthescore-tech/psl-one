import { useState, useEffect } from 'react';
import { AUTH_CHANGE_EVENT, TOKEN_KEY, getToken, clearToken } from './auth';
import type { AuthUser } from './auth';
import { apiFetch, ApiError } from './api';

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous' | 'network-error';

export interface SessionResult {
  sessionState: SessionStatus;
  user: AuthUser | null;
}

/**
 * Validates the stored JWT against /auth/me.
 *
 * Return values:
 *   'authenticated'  — server confirmed the token is valid
 *   'anonymous'      — no token, or server rejected it (401); token cleared on reject
 *   'network-error'  — fetch failed (offline, 5xx, CORS); token NOT cleared because it
 *                      may still be valid — caller should decide whether to show
 *                      authenticated or degrade gracefully
 *
 * This function is pure async so it can be unit-tested without React.
 */
export async function validateSession(): Promise<{ status: Exclude<SessionStatus, 'loading'>; user: AuthUser | null }> {
  if (!getToken()) {
    return { status: 'anonymous', user: null };
  }

  try {
    const user = await apiFetch<AuthUser>('/auth/me');
    return { status: 'authenticated', user };
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      // Token definitively rejected — remove it so subsequent checks are fast
      clearToken();
      return { status: 'anonymous', user: null };
    }
    // Network failure or unexpected server error — do not clear the token
    return { status: 'network-error', user: null };
  }
}

export function subscribeToSessionChanges(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const handleAuthChange = () => onChange();
  const handleStorage = (event: StorageEvent) => {
    if (event.key === TOKEN_KEY) onChange();
  };
  const handleFocus = () => onChange();

  window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
  window.addEventListener('storage', handleStorage);
  window.addEventListener('focus', handleFocus);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('focus', handleFocus);
  };
}

/**
 * React hook that resolves auth state on client mount by validating the stored
 * token with the server. Starts in 'loading' so SSR and the initial client render
 * both produce an identical placeholder — no hydration mismatch.
 *
 * sessionState transitions:
 *   'loading'       → stable placeholder (same as before hydration)
 *   'authenticated' → token confirmed valid by /auth/me
 *   'anonymous'     → no token or 401 response; token cleared
 *   'network-error' → server unreachable; token preserved, treat as signed-in
 */
export function useSession(): SessionResult {
  const [sessionState, setSessionState] = useState<SessionStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    let validationRequest = 0;

    const revalidate = () => {
      const request = ++validationRequest;
      validateSession().then(({ status, user: me }) => {
        if (cancelled || request !== validationRequest) return;
        setSessionState(status);
        setUser(me);
      });
    };

    revalidate();
    const unsubscribe = subscribeToSessionChanges(revalidate);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return { sessionState, user };
}
