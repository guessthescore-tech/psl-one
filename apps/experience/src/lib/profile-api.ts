/**
 * Fan profile API client for PSL One Experience app.
 *
 * Covers: profile read/write and summary endpoint. All calls require auth.
 */

import { apiFetch, apiPatch } from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PreferredTeam = {
  id: string;
  name: string;
  slug: string;
  shortName: string;
};

export type NotificationPreferences = {
  id: string;
  profileId: string;
  matchReminders: boolean;
  teamNews: boolean;
  fantasyUpdates: boolean;
  rewardsUpdates: boolean;
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

// ── Functions ─────────────────────────────────────────────────────────────────

export function getProfile(): Promise<FanProfile> {
  return apiFetch<FanProfile>('/profile/me');
}

export function updateProfile(dto: UpdateProfileInput): Promise<FanProfile> {
  return apiPatch<FanProfile>('/profile/me', dto);
}

export function getProfileSummary(): Promise<ProfileSummary> {
  return apiFetch<ProfileSummary>('/profile/summary');
}
