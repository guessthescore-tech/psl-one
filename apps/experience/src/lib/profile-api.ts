/**
 * Profile API — PSL One Experience app
 * Handles fan profile reads and updates.
 */

import { getToken } from './auth';

/* ── Types ────────────────────────────────────────────────────────────────── */

export interface PreferredTeam {
  id: string;
  name: string;
  shortName: string;
}

export interface FanProfile {
  id: string;
  email: string;
  displayName: string;
  bio?: string;
  phone?: string;
  preferredTeam?: PreferredTeam;
  memberSince: string;
}

export interface ProfileSummary {
  displayName: string;
  email: string;
  memberSince: string;
  fantasyTeamName?: string;
  fantasyTotalPoints?: number;
  fantasyGlobalRank?: number;
}

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  phone?: string;
  preferredTeamId?: string;
}

/* ── API base URL ────────────────────────────────────────────────────────── */

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000';

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* ── API functions ───────────────────────────────────────────────────────── */

export async function getProfile(): Promise<FanProfile> {
  const res = await fetch(`${API_BASE}/api/profile`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error('Failed to load profile');
  return (await res.json()) as FanProfile;
}

export async function updateProfile(input: UpdateProfileInput): Promise<FanProfile> {
  const res = await fetch(`${API_BASE}/api/profile`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(input),
  });

  if (!res.ok) throw new Error('Failed to update profile');
  return (await res.json()) as FanProfile;
}

export async function getProfileSummary(): Promise<ProfileSummary> {
  const res = await fetch(`${API_BASE}/api/profile/summary`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error('Failed to load profile summary');
  return (await res.json()) as ProfileSummary;
}
