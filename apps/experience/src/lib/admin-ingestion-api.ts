/**
 * Admin-only API helpers for Parse PSL fixture ingestion.
 *
 * These functions call the PSL One API with a Bearer token.
 * The caller must hold an ADMIN role JWT — the API rejects non-admin tokens.
 *
 * SECURITY:
 * - The Parse PSL provider key is never accessed or passed from the frontend.
 * - All provider interactions happen server-side in the NestJS API.
 */

import { apiFetch } from './api';

export type TeamResolutionDto = {
  homeTeamMatched: boolean;
  awayTeamMatched: boolean;
  homeTeamId?: string;
  awayTeamId?: string;
  warnings: string[];
};

export type ParsePslFixtureCandidateDto = {
  externalId: string;
  homeTeamName: string;
  awayTeamName: string;
  kickoffAt: string;
  status: string;
  providerSource: 'parse-psl';
  providerFixtureId: string;
  sourceUrl: string;
  teamResolution: TeamResolutionDto;
};

export type ParsePslIngestionResult = {
  provider: 'parse-psl';
  competitionCode: string;
  dryRun: boolean;
  sourceStatus:
    | 'SOURCE_EMPTY'
    | 'SOURCE_AVAILABLE'
    | 'AUTH_FAILED'
    | 'RATE_LIMITED'
    | 'PROVIDER_ERROR'
    | 'SCHEMA_CHANGED';
  discovered: number;
  normalized: number;
  created: number;
  updated: number;
  skipped: number;
  candidates: ParsePslFixtureCandidateDto[];
  warnings: string[];
  errors: string[];
};

export type DryRunRequest = {
  competitionCode?: string;
  includeCandidates?: boolean;
};

export type WriteRunRequest = {
  competitionCode?: string;
  seasonId: string;
  confirmWrite: true;
};

/**
 * Run an ingestion dry-run. Returns normalized fixture candidates with
 * team resolution diagnostics. Does not write to the database.
 */
export function runDryRun(req: DryRunRequest = {}): Promise<ParsePslIngestionResult> {
  return apiFetch<ParsePslIngestionResult>('/admin/data-provider/parse-psl/fixtures/ingest', {
    method: 'POST',
    body: JSON.stringify({
      competitionCode: req.competitionCode ?? 'BETWAY_PREMIERSHIP',
      dryRun: true,
      includeCandidates: req.includeCandidates !== false,
    }),
  });
}

/**
 * Execute a write run. Creates fixtures as isPublished=false.
 * Requires explicit seasonId and confirmWrite=true.
 * The API rejects missing seasonId or missing confirmWrite.
 */
export function runWriteRun(req: WriteRunRequest): Promise<ParsePslIngestionResult> {
  return apiFetch<ParsePslIngestionResult>('/admin/data-provider/parse-psl/fixtures/ingest', {
    method: 'POST',
    body: JSON.stringify({
      competitionCode: req.competitionCode ?? 'BETWAY_PREMIERSHIP',
      dryRun: false,
      seasonId: req.seasonId,
      confirmWrite: true,
      includeCandidates: false,
    }),
  });
}
