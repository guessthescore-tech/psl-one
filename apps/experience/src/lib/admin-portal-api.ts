/**
 * PSL One — Admin Portal API Client
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

export interface AdminOverview {
  pslStatus: 'INACTIVE' | 'ACTIVE';
  wcStatus: 'ACTIVE' | 'INACTIVE';
  walletMode: 'SANDBOX' | 'PRODUCTION';
  ingestionSource: string;
  providerHealth: string;
  openOwnerGates: string[];
}

export interface Competition {
  id: string;
  name: string;
  country: string;
  status: string;
  isActive: boolean;
}

export interface SeasonAdmin {
  id: string;
  name: string;
  competitionId: string;
  status: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface FixtureAdmin {
  id: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
  isPublished: boolean;
  kickoffAt: string;
}

export interface TeamAdmin {
  id: string;
  name: string;
  shortName: string;
  country: string;
}

export interface PlayerAdmin {
  id: string;
  name: string;
  position: string;
  teamId: string;
  teamName: string;
}

export interface UserAdmin {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// ── API functions ──────────────────────────────────────────────────────────

/** GET /admin/overview — Platform status summary */
export async function getAdminOverview(): Promise<AdminOverview> {
  // API_PENDING: true — endpoint GET /admin/overview not yet implemented
  // Expected: returns { pslStatus, wcStatus, walletMode, ingestionSource, providerHealth, openOwnerGates }
  return apiFetch<AdminOverview>('/admin/overview');
}

/** GET /admin/competitions — List all competitions */
export async function getAdminCompetitions(): Promise<Competition[]> {
  // API_PENDING: true — endpoint GET /admin/competitions
  return apiFetch<Competition[]>('/admin/competitions');
}

/** GET /admin/seasons — List all seasons */
export async function getAdminSeasons(): Promise<SeasonAdmin[]> {
  // API_PENDING: true — endpoint GET /admin/seasons
  return apiFetch<SeasonAdmin[]>('/admin/seasons');
}

/** GET /admin/fixtures — List fixtures with publish status */
export async function getAdminFixtures(params?: {
  published?: boolean;
  seasonId?: string;
  limit?: number;
}): Promise<FixtureAdmin[]> {
  const qs = new URLSearchParams();
  if (params?.published !== undefined) qs.set('published', String(params.published));
  if (params?.seasonId) qs.set('seasonId', params.seasonId);
  if (params?.limit) qs.set('limit', String(params.limit));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<FixtureAdmin[]>(`/admin/fixtures${query}`);
}

/** GET /admin/teams — List teams */
export async function getAdminTeams(): Promise<TeamAdmin[]> {
  // API_PENDING: true — endpoint GET /admin/teams
  return apiFetch<TeamAdmin[]>('/admin/teams');
}

/** GET /admin/players — List players */
export async function getAdminPlayers(params?: {
  teamId?: string;
  position?: string;
}): Promise<PlayerAdmin[]> {
  const qs = new URLSearchParams();
  if (params?.teamId) qs.set('teamId', params.teamId);
  if (params?.position) qs.set('position', params.position);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<PlayerAdmin[]>(`/admin/players${query}`);
}

/** GET /admin/users — List users */
export async function getAdminUsers(): Promise<UserAdmin[]> {
  // API_PENDING: true — endpoint GET /admin/users
  return apiFetch<UserAdmin[]>('/admin/users');
}

/** GET /admin/audit — Audit log */
export async function getAdminAuditLog(params?: {
  limit?: number;
  offset?: number;
}): Promise<AuditLogEntry[]> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.offset) qs.set('offset', String(params.offset));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return apiFetch<AuditLogEntry[]>(`/admin/audit${query}`);
}

/** GET /admin/readiness — Launch readiness checklist */
export async function getAdminReadiness(): Promise<Record<string, boolean>> {
  // API_PENDING: true — endpoint GET /admin/readiness
  return apiFetch<Record<string, boolean>>('/admin/readiness');
}
