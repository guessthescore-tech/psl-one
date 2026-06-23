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

/** GET /club-portal/profile?clubId=... — Club profile */
export async function getClubProfile(clubId: string): Promise<ClubProfile> {
  return apiFetch<ClubProfile>(`/club-portal/profile?clubId=${clubId}`);
}

/** GET /club-portal/squad?clubId=... — Club squad */
export async function getClubSquad(clubId: string): Promise<ClubPlayer[]> {
  return apiFetch<ClubPlayer[]>(`/club-portal/squad?clubId=${clubId}`);
}

/** GET /club-portal/fixtures?clubId=... — Club fixtures */
export async function getClubFixtures(clubId: string): Promise<ClubFixture[]> {
  return apiFetch<ClubFixture[]>(`/club-portal/fixtures?clubId=${clubId}`);
}

/** GET /club-portal/fans?clubId=... — Club fans */
export async function getClubFans(clubId: string, params?: {
  limit?: number;
  offset?: number;
}): Promise<ClubFan[]> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  const query = qs.toString() ? `&${qs.toString()}` : '';
  return apiFetch<ClubFan[]>(`/club-portal/fans?clubId=${clubId}${query}`);
}

/** GET /club-portal/analytics?clubId=... — Club analytics */
export async function getClubAnalytics(clubId: string): Promise<ClubAnalytics> {
  return apiFetch<ClubAnalytics>(`/club-portal/analytics?clubId=${clubId}`);
}

/** GET /club-portal/content?clubId=... — Club content */
export async function getClubContent(clubId: string): Promise<ClubContent[]> {
  return apiFetch<ClubContent[]>(`/club-portal/content?clubId=${clubId}`);
}

/** GET /club-portal/overview?clubId=... — Club overview */
export async function getClubOverview(clubId: string) {
  return apiFetch(`/club-portal/overview?clubId=` + clubId);
}

/** GET /club-portal/campaigns?clubId=... — Club campaigns */
export async function getClubCampaigns(clubId: string) {
  return apiFetch(`/club-portal/campaigns?clubId=` + clubId);
}

/** GET /club-portal/sponsors?clubId=... — Club sponsors */
export async function getClubSponsors(clubId: string) {
  return apiFetch(`/club-portal/sponsors?clubId=` + clubId);
}
