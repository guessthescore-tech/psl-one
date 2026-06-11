import { getToken } from './auth-client';

const BASE = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000';

function profileUrl(path: string) {
  return `${BASE}/profile${path}`;
}

function authedHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: authedHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

async function patch<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: authedHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error((err as { message?: string }).message ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

export type PreferredTeam = {
  id: string;
  name: string;
  slug: string;
  shortName: string;
};

export type FanProfile = {
  id: string;
  userId: string;
  displayName: string | null;
  city: string | null;
  country: string | null;
  preferredTeamId: string | null;
  preferredTeam: PreferredTeam | null;
  preferences: NotificationPreferences | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationPreferences = {
  id: string;
  profileId: string;
  matchReminders: boolean;
  teamNews: boolean;
  fantasyUpdates: boolean;
  rewardsUpdates: boolean;
};

export type ProfileSummary = {
  email: string;
  role: string;
  displayName: string | null;
  city: string | null;
  country: string | null;
  preferredTeam: PreferredTeam | null;
  completionPercent: number;
};

export type UpdateProfileInput = {
  displayName?: string;
  city?: string;
  country?: string;
  preferredTeamId?: string | null;
};

export type UpdatePreferencesInput = {
  matchReminders?: boolean;
  teamNews?: boolean;
  fantasyUpdates?: boolean;
  rewardsUpdates?: boolean;
};

export const profileClient = {
  getProfile: () => get<FanProfile>(profileUrl('/me')),
  updateProfile: (data: UpdateProfileInput) => patch<FanProfile>(profileUrl('/me'), data),
  getPreferences: () => get<NotificationPreferences>(profileUrl('/preferences')),
  updatePreferences: (data: UpdatePreferencesInput) =>
    patch<NotificationPreferences>(profileUrl('/preferences'), data),
  getSummary: () => get<ProfileSummary>(profileUrl('/summary')),
};
