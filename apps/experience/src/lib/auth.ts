/**
 * Auth token management and auth API calls for PSL One Experience app.
 *
 * Tokens are stored in localStorage under the key `psl_access_token`.
 * This mirrors the contract used by the apps/web auth client so that a fan
 * authenticated in one PSL One surface can be treated as authenticated here
 * when the apps share the same origin.
 *
 * SECURITY: Never store the token in cookies accessible to JS (httpOnly is
 * preferred long-term) or in NEXT_PUBLIC_* env vars.
 */

export const TOKEN_KEY = 'psl_access_token';
export const AUTH_CHANGE_EVENT = 'psl-auth-change';

const AUTH_BASE =
  process.env['NEXT_PUBLIC_API_BASE_URL'] ??
  (typeof window === 'undefined'
    ? 'http://localhost:4000'
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:4000'
        : 'https://api.beta.pslone.co.za'));

function authUrl(path: string): string {
  return `${AUTH_BASE}${path}`;
}

// ── Token helpers ─────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function notifyAuthChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  notifyAuthChanged();
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  notifyAuthChanged();
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type RegisterResponse =
  | { accessToken: string; user: AuthUser; emailDeliveryStatus?: 'SENT' | 'FAILED' | 'SKIPPED' }
  | { message: string };

export type RegisterInput = {
  email: string;
  password: string;
  dateOfBirth: string;
  consentCoreService: boolean;
  phone?: string;
  saId?: string;
  consentMarketing?: boolean;
  consentAnalytics?: boolean;
};

// ── Auth API calls ────────────────────────────────────────────────────────────

/**
 * Log in with email and password. Stores the returned JWT automatically.
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(authUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Login failed' })) as { message?: string };
    throw new Error(err.message ?? 'Invalid credentials');
  }

  const data = await res.json() as LoginResponse;
  setToken(data.accessToken);
  return data;
}

/**
 * Register a new fan account. Stores the returned JWT automatically when
 * the server returns an accessToken.
 */
export async function register(input: RegisterInput): Promise<RegisterResponse> {
  const res = await fetch(authUrl('/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok && res.status !== 201) {
    const err = await res.json().catch(() => ({ message: 'Registration failed' })) as { message?: string };
    throw new Error(err.message ?? 'Registration failed');
  }

  const response = await res.json() as RegisterResponse;
  if ('accessToken' in response) {
    setToken(response.accessToken);
  }
  return response;
}

/**
 * Log out the current fan. Calls the server logout endpoint (to invalidate
 * the server-side session / revoke refresh tokens if applicable) and then
 * clears the local token.
 */
export async function logout(): Promise<void> {
  const token = getToken();
  if (token) {
    await fetch(authUrl('/auth/logout'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => {
      // Swallow network errors on logout — token is cleared locally regardless.
    });
  }
  clearToken();
}

/**
 * Fetch the authenticated fan's own user record from the server.
 */
export async function getMe(): Promise<AuthUser> {
  const token = getToken();
  const res = await fetch(authUrl('/auth/me'), {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error('Not authenticated');
  return res.json() as Promise<AuthUser>;
}

/**
 * Request a password-reset email to be sent to the given address.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await fetch(authUrl('/auth/password-reset/request'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  // Always resolves — do not leak whether the email address exists.
}

/**
 * Confirm a password reset using the token from the reset email.
 */
export async function confirmPasswordReset(
  token: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch(authUrl('/auth/password-reset/confirm'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Reset failed' })) as { message?: string };
    throw new Error(err.message ?? 'Password reset failed');
  }
}
