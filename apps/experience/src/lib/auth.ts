/**
 * Auth helpers for the experience app.
 * In DESIGN_REVIEW_DATA mode, isAuthenticated always returns true.
 * In LIVE_BETA_DATA mode, checks for a session token cookie.
 */

export function isAuthenticated(): boolean {
  // In the browser we check for a session cookie.
  // Server-side rendering always defers to client check.
  if (typeof document === 'undefined') return true;
  return document.cookie.includes('psl_session=');
}

export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/psl_session=([^;]+)/);
  return match ? (match[1] ?? null) : null;
}
