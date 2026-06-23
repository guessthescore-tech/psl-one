/**
 * PSL One — Points Rules API Client
 *
 * PSL_INACTIVE - do not activate PSL season
 * WALLET_SANDBOX_ONLY - no production wallet
 * FANTASY_POINTS_ONLY - Fantasy is points-only, no real-money
 * GTS_POINTS_ONLY - Guess the Score is points-only, no real-money
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 * NO_REAL_MONEY
 *
 * Security: Never expose ADMIN_TOKEN, PARSE_API_KEY, API_FOOTBALL_KEY,
 * or any provider key in frontend source. Never add NEXT_PUBLIC_* env vars
 * for secrets.
 */

import { apiFetch, apiPatch } from './api';

// ── GTS (Guess the Score) Types ────────────────────────────────────────────

/** GTS_POINTS_ONLY — all scoring is points-based, no financial value */
export interface GtsRulesConfig {
  exactScorePoints: number;      // Points for exact scoreline
  correctResultPoints: number;   // Points for correct result (W/D/L)
  correctGoalDiffPoints: number; // Points for correct goal difference
  zeroZeroBonus: number;         // Bonus for predicting 0-0 correctly
  lateEntryPenalty: number;      // Points deducted for late entry
  streakBonusEnabled: boolean;
  streakBonusMultiplier: number;
  /** GTS_POINTS_ONLY: These are PSL points, not currency */
  currency: 'POINTS';
}

/** GTS_POINTS_ONLY — simulation row for points projection */
export interface GtsSimulationRow {
  scenario: string;
  pointsAwarded: number;
  examplePrediction: string;
  exampleResult: string;
}

// ── Fantasy Types ──────────────────────────────────────────────────────────

/** FANTASY_POINTS_ONLY — all fantasy scoring is points-based, no real money */
export interface FantasyRulesConfig {
  goalPoints: Record<string, number>;       // Points per goal by position
  assistPoints: number;                     // Points per assist
  cleanSheetPoints: Record<string, number>; // Clean sheet points by position
  yellowCardPenalty: number;                // Points deducted per yellow card
  redCardPenalty: number;                   // Points deducted per red card
  transferLimit: number;                    // Free transfers per gameweek
  transferPenalty: number;                  // Points deducted per extra transfer
  captainMultiplier: number;                // Captain points multiplier
  /** FANTASY_POINTS_ONLY: These are PSL fantasy points, not currency */
  currency: 'POINTS';
}

export interface FantasySimulationRow {
  event: string;
  position: string;
  pointsAwarded: number;
  notes: string;
}

// ── API functions ──────────────────────────────────────────────────────────

/** GET /admin/rules/prediction — GTS rules config (POINTS ONLY) */
export async function getGtsRules(): Promise<GtsRulesConfig> {
  // API_PENDING: true — endpoint GET /admin/rules/prediction
  return apiFetch<GtsRulesConfig>('/admin/rules/prediction');
}

/** PATCH /admin/rules/prediction — Update GTS rules (POINTS ONLY, PSL_ADMIN required) */
export async function updateGtsRules(
  updates: Partial<Omit<GtsRulesConfig, 'currency'>>,
): Promise<GtsRulesConfig> {
  // API_PENDING: true — endpoint PATCH /admin/rules/prediction
  return apiPatch<GtsRulesConfig>('/admin/rules/prediction', updates);
}

/** GET /admin/rules/prediction/simulation — GTS simulation table */
export async function getGtsSimulation(): Promise<GtsSimulationRow[]> {
  // API_PENDING: true — endpoint GET /admin/rules/prediction/simulation
  return apiFetch<GtsSimulationRow[]>('/admin/rules/prediction/simulation');
}

/** GET /admin/fantasy/rules — Fantasy rules config (POINTS ONLY) */
export async function getFantasyRules(): Promise<FantasyRulesConfig> {
  // API_PENDING: true — endpoint GET /admin/fantasy/rules
  return apiFetch<FantasyRulesConfig>('/admin/fantasy/rules');
}

/** PATCH /admin/fantasy/rules — Update fantasy rules (POINTS ONLY, PSL_ADMIN required) */
export async function updateFantasyRules(
  updates: Partial<Omit<FantasyRulesConfig, 'currency'>>,
): Promise<FantasyRulesConfig> {
  // API_PENDING: true — endpoint PATCH /admin/fantasy/rules
  return apiPatch<FantasyRulesConfig>('/admin/fantasy/rules', updates);
}

/** GET /admin/fantasy/rules/simulation — Fantasy simulation table */
export async function getFantasySimulation(): Promise<FantasySimulationRow[]> {
  // API_PENDING: true — endpoint GET /admin/fantasy/rules/simulation
  return apiFetch<FantasySimulationRow[]>('/admin/fantasy/rules/simulation');
}

/** GET /admin/points — Points overview across GTS and Fantasy */
export async function getPointsOverview(): Promise<{
  gtsConfig: GtsRulesConfig;
  fantasyConfig: FantasyRulesConfig;
  lastUpdated: string;
}> {
  // API_PENDING: true — endpoint GET /admin/points
  return apiFetch('/admin/points');
}
