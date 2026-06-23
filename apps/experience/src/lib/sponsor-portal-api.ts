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

/** GET /sponsor-portal/profile?sponsorId=... — Sponsor profile */
export async function getSponsorProfile(sponsorId: string): Promise<SponsorProfile> {
  return apiFetch<SponsorProfile>(`/sponsor-portal/profile?sponsorId=${sponsorId}`);
}

/** GET /sponsor-portal/campaigns?sponsorId=... — Sponsor campaigns */
export async function getSponsorCampaigns(sponsorId: string): Promise<SponsorCampaign[]> {
  return apiFetch<SponsorCampaign[]>(`/sponsor-portal/campaigns?sponsorId=${sponsorId}`);
}

/** POST /sponsor-portal/campaigns/drafts?sponsorId=... — Create campaign draft (DRAFT only, never ACTIVE) */
export async function createSponsorCampaign(
  sponsorId: string,
  input: CreateCampaignInput,
): Promise<SponsorCampaign> {
  return apiPost<SponsorCampaign>(`/sponsor-portal/campaigns/drafts?sponsorId=${sponsorId}`, input);
}

/** GET /sponsor-portal/rewards?sponsorId=... — Sponsor rewards (NON-FINANCIAL only) */
export async function getSponsorRewards(sponsorId: string): Promise<SponsorReward[]> {
  // SPONSOR_REWARDS_NON_FINANCIAL: Only points, badges, digital experiences
  return apiFetch<SponsorReward[]>(`/sponsor-portal/rewards?sponsorId=${sponsorId}`);
}

/** GET /sponsor-portal/audiences?sponsorId=... — Sponsor audiences */
export async function getSponsorAudiences(sponsorId: string): Promise<SponsorAudience[]> {
  return apiFetch<SponsorAudience[]>(`/sponsor-portal/audiences?sponsorId=${sponsorId}`);
}

/** GET /sponsor-portal/activations?sponsorId=... — Campaign activations */
export async function getSponsorActivations(sponsorId: string): Promise<SponsorActivation[]> {
  return apiFetch<SponsorActivation[]>(`/sponsor-portal/activations?sponsorId=${sponsorId}`);
}

/** GET /sponsor-portal/analytics?sponsorId=... — Sponsor analytics */
export async function getSponsorAnalytics(sponsorId: string): Promise<SponsorAnalytics> {
  return apiFetch<SponsorAnalytics>(`/sponsor-portal/analytics?sponsorId=${sponsorId}`);
}

/** GET /sponsor-portal/overview?sponsorId=... — Sponsor overview */
export async function getSponsorOverview(sponsorId: string) {
  return apiFetch(`/sponsor-portal/overview?sponsorId=` + sponsorId);
}

/** GET /sponsor-portal/clubs?sponsorId=... — Clubs associated with sponsor */
export async function getSponsorClubs(sponsorId: string) {
  return apiFetch(`/sponsor-portal/clubs?sponsorId=` + sponsorId);
}

/** GET /sponsor-portal/assets?sponsorId=... — Sponsor assets (PLANNED Sprint 28) */
export async function getSponsorAssets(sponsorId: string) {
  return apiFetch(`/sponsor-portal/assets?sponsorId=` + sponsorId);
}

/** GET /sponsor-portal/billing-placeholder — Billing info (INVOICE_ONLY per ADR-031, no payment processing) */
export async function getSponsorBillingPlaceholder() {
  return apiFetch(`/sponsor-portal/billing-placeholder`);
}
