/**
 * Profile API — PSL One Experience app
 * Handles fan profile reads and updates.
 *
 * All requests route through apiFetch (from ./api) which resolves the correct
 * API base URL and attaches the Bearer token automatically.
 *
 * Backend routes (NestJS @Controller('profile')):
 *   GET    /profile/me          → getProfile()
 *   PATCH  /profile/me          → updateProfile()
 *   GET    /profile/summary     → getProfileSummary()
 */

import { apiFetch, apiPatch } from './api';

/* ── Types ────────────────────────────────────────────────────────────────── */

export interface PreferredTeam {
  id: string;
  name: string;
  shortName: string;
}

export interface FanProfile {
  id: string;
  displayName: string | null;
  city?: string | null;
  country?: string | null;
  preferredTeam?: PreferredTeam | null;
  // Fields below are not returned by /profile/me (backend FanProfile model) but
  // kept optional here so design-review mock objects in the account pages compile.
  email?: string;
  bio?: string | null;
  phone?: string | null;
  memberSince?: string;
}

export interface ProfileSummary {
  displayName: string | null;
  email: string;
  memberSince?: string;
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

/* ── API functions ───────────────────────────────────────────────────────── */

export function getProfile(): Promise<FanProfile> {
  return apiFetch<FanProfile>('/profile/me');
}

export function updateProfile(input: UpdateProfileInput): Promise<FanProfile> {
  return apiPatch<FanProfile>('/profile/me', input);
}

export function getProfileSummary(): Promise<ProfileSummary> {
  return apiFetch<ProfileSummary>('/profile/summary');
}
