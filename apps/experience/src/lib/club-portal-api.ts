/**
 * PSL One — Club Portal API Client
 *
 * PSL_INACTIVE - do not activate PSL season
 * WALLET_SANDBOX_ONLY - no production wallet
 * FANTASY_POINTS_ONLY - no real-money fantasy
 * GTS_POINTS_ONLY - no real-money guess the score
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_PRODUCTION_INGESTION
 * NO_SCHEDULED_INGESTION
 * NO_REAL_MONEY
 *
 * Security: Never expose ADMIN_TOKEN, PARSE_API_KEY, API_FOOTBALL_KEY,
 * or any provider key in frontend source. Never add NEXT_PUBLIC_* env vars
 * for secrets. All auth is via Bearer JWT from localStorage (getToken()).
 */

import { apiFetch } from './api';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ClubProfile {
  id: string;
  name: string;
  shortName: string;
  crestUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  founded?: number;
  city?: string;
  stadium?: string;
}

export interface ClubPlayer {
  id: string;
  name: string;
  position: string;
  jerseyNumber?: number;
  nationality?: string;
  age?: number;
}

export interface ClubFixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  isPublished: boolean;
}

export interface ClubFan {
  id: string;
  displayName: string;
  joinedAt: string;
  points: number;
}

export interface ClubAnalytics {
  totalFans: number;
  activeThisWeek: number;
  predictionsPlaced: number;
  avgEngagement: number;
}

export interface ClubContent {
  id: string;
  title: string;
  type: 'article' | 'video' | 'social';
  publishedAt?: string;
  status: 'draft' | 'published' | 'archived';
}

// ── API functions ──────────────────────────────────────────────────────────

/** GET /club/:clubId/profile — Club profile */
export async function getClubProfile(clubId: string): Promise<ClubProfile> {
  // API_PENDING: true — endpoint GET /club/:clubId/profile
  return apiFetch<ClubProfile>(`/clubs/${clubId}`);
}

/** GET /club/:clubId/squad — Club squad */
export async function getClubSquad(clubId: string): Promise<ClubPlayer[]> {
  // API_PENDING: true — endpoint GET /club/:clubId/squad
  return apiFetch<ClubPlayer[]>(`/clubs/${clubId}/players`);
}

/** GET /club/:clubId/fixtures — Club fixtures */
export async function getClubFixtures(clubId: string): Promise<ClubFixture[]> {
  // API_PENDING: true — endpoint GET /club/:clubId/fixtures
  return apiFetch<ClubFixture[]>(`/clubs/${clubId}/fixtures`);
}

/** GET /club/:clubId/fans — Club fans */
export async function getClubFans(clubId: string, params?: {
  limit?: number;
  offset?: number;
}): Promise<ClubFan[]> {
  // API_PENDING: true — endpoint GET /club/:clubId/fans
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<ClubFan[]>(`/clubs/${clubId}/fans${query}`);
}

/** GET /club/:clubId/analytics — Club analytics */
export async function getClubAnalytics(clubId: string): Promise<ClubAnalytics> {
  // API_PENDING: true — endpoint GET /club/:clubId/analytics
  return apiFetch<ClubAnalytics>(`/clubs/${clubId}/analytics`);
}

/** GET /club/:clubId/content — Club content */
export async function getClubContent(clubId: string): Promise<ClubContent[]> {
  // API_PENDING: true — endpoint GET /club/:clubId/content
  return apiFetch<ClubContent[]>(`/clubs/${clubId}/content`);
}
