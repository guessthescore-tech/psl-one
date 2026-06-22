/**
 * Admin-only API helpers for fixture publication and PSL pre-flight checks.
 *
 * These functions call the PSL One API with a Bearer token.
 * The caller must hold an ADMIN role JWT — the API rejects non-admin tokens.
 *
 * Publishing fixtures is separate from PSL season activation.
 * Fixtures remain points-only after publishing — no real-money functionality.
 * The PSL pre-flight check is read-only and does not activate anything.
 */

import { apiFetch } from './api';

export type ImportedFixtureRow = {
  id: string;
  seasonId: string;
  homeTeamName: string;
  awayTeamName: string;
  kickoffAt: string;
  status: string;
  isPublished: boolean;
  providerSource: string | null;
  providerFixtureId: string | null;
  externalId: string | null;
  sourceUrl: string | null;
  importedAt: string | null;
  lastSyncedAt: string | null;
};

export type ImportedFixturesResponse = {
  fixtures: ImportedFixtureRow[];
  total: number;
};

export type FixturePublishRequest = {
  fixtureIds: string[];
  publish: boolean;
  confirmPublication: true;
};

export type FixturePublishResult = {
  requested: number;
  changed: number;
  skipped: number;
  published: number;
  unpublished: number;
  errors: string[];
  warnings: string[];
};

export type PreflightCheck = {
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  detail: string;
};

export type PslActivationPreflightResult = {
  status: 'NO_GO' | 'CONDITIONAL_GO' | 'GO';
  blockers: string[];
  warnings: string[];
  checks: PreflightCheck[];
};

export function listImportedFixtures(opts: {
  providerSource?: string;
  isPublished?: boolean;
  seasonId?: string;
  limit?: number;
  offset?: number;
}): Promise<ImportedFixturesResponse> {
  const params = new URLSearchParams();
  if (opts.providerSource) params.set('providerSource', opts.providerSource);
  if (opts.isPublished !== undefined) params.set('isPublished', String(opts.isPublished));
  if (opts.seasonId) params.set('seasonId', opts.seasonId);
  if (opts.limit !== undefined) params.set('limit', String(opts.limit));
  if (opts.offset !== undefined) params.set('offset', String(opts.offset));
  const qs = params.toString();
  return apiFetch<ImportedFixturesResponse>(`/admin/fixtures/imported${qs ? `?${qs}` : ''}`);
}

export function publishFixtures(req: FixturePublishRequest): Promise<FixturePublishResult> {
  return apiFetch<FixturePublishResult>('/admin/fixtures/publish', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export function runPslPreflight(seasonId?: string): Promise<PslActivationPreflightResult> {
  const qs = seasonId ? `?seasonId=${encodeURIComponent(seasonId)}` : '';
  return apiFetch<PslActivationPreflightResult>(`/admin/psl/preflight${qs}`);
}
