/**
 * PSL One — Sponsor Portal API Client
 *
 * PSL_INACTIVE - do not activate PSL season
 * WALLET_SANDBOX_ONLY - no production wallet
 * FANTASY_POINTS_ONLY - no real-money fantasy
 * GTS_POINTS_ONLY - no real-money guess the score
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts. All sponsor rewards are
 *   non-financial (points, badges, digital experiences). No cash payouts.
 * NO_PRODUCTION_INGESTION
 * NO_SCHEDULED_INGESTION
 * NO_REAL_MONEY
 *
 * Security: Never expose ADMIN_TOKEN, PARSE_API_KEY, API_FOOTBALL_KEY,
 * or any provider key in frontend source. Never add NEXT_PUBLIC_* env vars
 * for secrets.
 */

import { apiFetch, apiPost } from './api';

// ── Types ──────────────────────────────────────────────────────────────────

export interface SponsorProfile {
  id: string;
  name: string;
  industry: string;
  logoUrl?: string;
  contactEmail?: string;
  status: 'active' | 'pending' | 'inactive';
}

export interface SponsorCampaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
  budget?: number; // internal tracking only — no real-money payouts
  impressions: number;
  engagements: number;
}

export interface SponsorReward {
  id: string;
  name: string;
  type: 'points' | 'badge' | 'experience';
  /** SPONSOR_REWARDS_NON_FINANCIAL: All rewards are non-financial points/badges/digital experiences */
  isFinancial: false;
  value: number; // points value, never cash
}

export interface SponsorAudience {
  id: string;
  name: string;
  size: number;
  criteria: string[];
}

export interface SponsorActivation {
  id: string;
  campaignId: string;
  type: string;
  status: string;
  triggeredAt?: string;
  fanCount: number;
}

export interface SponsorAnalytics {
  totalImpressions: number;
  totalEngagements: number;
  totalActivations: number;
  engagementRate: number;
  topCampaign?: string;
}

export interface CreateCampaignInput {
  name: string;
  startDate: string;
  endDate: string;
  audienceIds: string[];
  rewardIds: string[];
  clubIds: string[];
}

// ── API functions ──────────────────────────────────────────────────────────

/** GET /sponsors/:sponsorId — Sponsor profile */
export async function getSponsorProfile(sponsorId: string): Promise<SponsorProfile> {
  // API_PENDING: true — endpoint GET /sponsors/:sponsorId
  return apiFetch<SponsorProfile>(`/sponsors/${sponsorId}`);
}

/** GET /sponsors/:sponsorId/campaigns — Sponsor campaigns */
export async function getSponsorCampaigns(sponsorId: string): Promise<SponsorCampaign[]> {
  // API_PENDING: true — endpoint GET /sponsors/:sponsorId/campaigns
  return apiFetch<SponsorCampaign[]>(`/sponsors/${sponsorId}/campaigns`);
}

/** POST /sponsors/:sponsorId/campaigns — Create campaign */
export async function createSponsorCampaign(
  sponsorId: string,
  input: CreateCampaignInput,
): Promise<SponsorCampaign> {
  // API_PENDING: true — endpoint POST /sponsors/:sponsorId/campaigns
  return apiPost<SponsorCampaign>(`/sponsors/${sponsorId}/campaigns`, input);
}

/** GET /sponsors/:sponsorId/rewards — Sponsor rewards (NON-FINANCIAL only) */
export async function getSponsorRewards(sponsorId: string): Promise<SponsorReward[]> {
  // API_PENDING: true — endpoint GET /sponsors/:sponsorId/rewards
  // SPONSOR_REWARDS_NON_FINANCIAL: Only points, badges, digital experiences
  return apiFetch<SponsorReward[]>(`/sponsors/${sponsorId}/rewards`);
}

/** GET /sponsors/:sponsorId/audiences — Sponsor audiences */
export async function getSponsorAudiences(sponsorId: string): Promise<SponsorAudience[]> {
  // API_PENDING: true — endpoint GET /sponsors/:sponsorId/audiences
  return apiFetch<SponsorAudience[]>(`/sponsors/${sponsorId}/audiences`);
}

/** GET /sponsors/:sponsorId/activations — Campaign activations */
export async function getSponsorActivations(sponsorId: string): Promise<SponsorActivation[]> {
  // API_PENDING: true — endpoint GET /sponsors/:sponsorId/activations
  return apiFetch<SponsorActivation[]>(`/sponsors/${sponsorId}/activations`);
}

/** GET /sponsors/:sponsorId/analytics — Sponsor analytics */
export async function getSponsorAnalytics(sponsorId: string): Promise<SponsorAnalytics> {
  // API_PENDING: true — endpoint GET /sponsors/:sponsorId/analytics
  return apiFetch<SponsorAnalytics>(`/sponsors/${sponsorId}/analytics`);
}
