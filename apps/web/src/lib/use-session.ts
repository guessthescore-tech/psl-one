import { useState, useEffect } from 'react';
import { getToken, clearToken, me, WebApiError } from './auth-client';

export type WebSessionStatus = 'loading' | 'authenticated' | 'anonymous' | 'network-error';

export interface WebSessionResult {
  sessionState: WebSessionStatus;
}

/**
 * Validates the stored JWT against /auth/me.
 *
 * Return values:
 *   'authenticated'  — server confirmed the token is valid
 *   'anonymous'      — no token, or server rejected it (401); token cleared on reject
 *   'network-error'  — fetch failed (offline, 5xx); token NOT cleared because it
 *                      may still be valid — caller should degrade gracefully
 *
 * Pure async function — testable without React.
 */
export async function validateWebSession(): Promise<{ status: Exclude<WebSessionStatus, 'loading'> }> {
  if (!getToken()) {
    return { status: 'anonymous' };
  }

  try {
    await me();
    return { status: 'authenticated' };
  } catch (err: unknown) {
    if (err instanceof WebApiError && err.status === 401) {
      // Token definitively rejected by the server — clear it
      clearToken();
      return { status: 'anonymous' };
    }
    // Network failure or unexpected server error — preserve the token
    return { status: 'network-error' };
  }
}

/**
 * React hook that validates the stored token on client mount and keeps the
 * result in sync via storage, focus, and psl-auth-change events.
 *
 * sessionState transitions:
 *   'loading'        → stable placeholder until the first /auth/me response
 *   'authenticated'  → token confirmed valid
 *   'anonymous'      → no token or 401; token cleared if it was 401
 *   'network-error'  → server unreachable; token preserved; treat as signed-in
 */
export function useWebSession(): WebSessionResult {
  const [sessionState, setSessionState] = useState<WebSessionStatus>('loading');

  useEffect(() => {
    const sync = () => {
      validateWebSession().then(({ status }) => setSessionState(status));
    };

    sync(); // Initial validation on mount

    // Re-validate when the token changes in another tab, when the user focuses
    // the tab (catches expiry since the last visit), or on sign-in/out events.
    window.addEventListener('storage', sync as EventListener);
    window.addEventListener('focus', sync as EventListener);
    window.addEventListener('psl-auth-change', sync as EventListener);

    return () => {
      window.removeEventListener('storage', sync as EventListener);
      window.removeEventListener('focus', sync as EventListener);
      window.removeEventListener('psl-auth-change', sync as EventListener);
    };
  }, []);

  return { sessionState };
}
