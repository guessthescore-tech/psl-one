const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function apiUrl(path: string) {
  return `${BASE}${path}`;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('psl_access_token');
}

export function setToken(token: string): void {
  localStorage.setItem('psl_access_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('psl_access_token');
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
  | { accessToken: string; user: AuthUser }
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
  if (!res.ok) throw new Error('Not authenticated');
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
