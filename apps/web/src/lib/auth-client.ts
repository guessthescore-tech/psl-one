export class WebApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = 'WebApiError';
  }
}

function resolveApiBase(): string {
  if (process.env['NEXT_PUBLIC_API_BASE_URL']) return process.env['NEXT_PUBLIC_API_BASE_URL'];
  if (typeof window === 'undefined') return 'http://localhost:4000';
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000'
    : 'https://api.beta.pslone.co.za';
}

const AUTH_BASE = resolveApiBase();

function apiUrl(path: string) {
  return `${AUTH_BASE}${path}`;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('psl_access_token');
}

/** Beta-only: returns stored JWT or empty string. Unauthenticated requests correctly receive 401. Remove in Sprint 3 when full session management is implemented. */
export function getBetaToken(): string {
  return getToken() ?? '';
}

export function setToken(token: string): void {
  localStorage.setItem('psl_access_token', token);
  window.dispatchEvent(new Event('psl-auth-change'));
}

export function clearToken(): void {
  localStorage.removeItem('psl_access_token');
  window.dispatchEvent(new Event('psl-auth-change'));
}

function authedHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type AuthUser = { id: string; email: string; role: string };

export type RegisterResponse =
  | { accessToken: string; user: AuthUser; emailDeliveryStatus?: 'SENT' | 'FAILED' | 'SKIPPED' }
  | { message: string };

export type LoginResponse = { accessToken: string; user: AuthUser };

export type MeResponse = {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  dateOfBirth: string;
  isVerified: boolean;
  createdAt: string;
};

export async function register(data: {
  email: string;
  password: string;
  dateOfBirth: string;
  consentCoreService: boolean;
  phone?: string;
  saId?: string;
  consentMarketing?: boolean;
  consentAnalytics?: boolean;
}): Promise<RegisterResponse> {
  const res = await fetch(apiUrl('/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok && res.status !== 201) {
    const err = await res.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error((err as { message?: string }).message ?? 'Registration failed');
  }
  return res.json() as Promise<RegisterResponse>;
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const res = await fetch(apiUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Login failed' }));
    throw new Error((err as { message?: string }).message ?? 'Invalid credentials');
  }
  return res.json() as Promise<LoginResponse>;
}

export async function logout(): Promise<void> {
  const token = getToken();
  if (!token) return;
  await fetch(apiUrl('/auth/logout'), {
    method: 'POST',
    headers: authedHeaders(),
  });
  clearToken();
}

export async function me(): Promise<MeResponse> {
  const res = await fetch(apiUrl('/auth/me'), {
    headers: authedHeaders(),
  });
  if (!res.ok) throw new WebApiError(res.status, 'Not authenticated');
  return res.json() as Promise<MeResponse>;
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const res = await fetch(apiUrl('/auth/password-reset/request'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json() as Promise<{ message: string }>;
}

export async function confirmPasswordReset(data: {
  token: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const res = await fetch(apiUrl('/auth/password-reset/confirm'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Reset failed' }));
    throw new Error((err as { message?: string }).message ?? 'Reset failed');
  }
  return res.json() as Promise<{ message: string }>;
}
