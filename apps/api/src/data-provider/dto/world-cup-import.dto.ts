export interface WorldCupImportRequestDto {
  /** Source: 'football-data-org' | 'sportradar-soccer' | 'auto' (default: auto = football-data-org first) */
  source?: string;
  /** Dry-run mode — no DB writes. Defaults to true. */
  dryRun?: boolean;
  /**
   * Required in write mode: confirms write intent.
   * Must be exactly 'IMPORT_WORLD_CUP_BETA'.
   */
  confirmWorldCupWrite?: string;
  /** Optional — DB Season.id to link fixtures to. Auto-detected from WC competition if omitted. */
  seasonId?: string;
  /** Include full candidate list in response (default true in dry-run, optional in write). */
  includeCandidates?: boolean;
}

export interface WorldCupImportCandidateDto {
  externalId: string;
  homeTeamName: string;
  awayTeamName: string;
  kickoffAt: string;
  status: string;
  providerSource: string;
  teamResolution: {
    homeTeamMatched: boolean;
    awayTeamMatched: boolean;
    homeTeamId?: string;
    awayTeamId?: string;
    warnings: string[];
  };
}

export interface WorldCupImportResponseDto {
  provider: string;
  competitionCode: 'WC2026';
  dryRun: boolean;
  sourceStatus:
    | 'SOURCE_AVAILABLE'
    | 'SOURCE_EMPTY'
    | 'AUTH_FAILED'
    | 'RATE_LIMITED'
    | 'PROVIDER_ERROR'
    | 'WRITE_BLOCKED_MISSING_FLAGS'
    | 'WRITE_BLOCKED_ENV_FLAG';
  discovered: number;
  normalized: number;
  created: number;
  updated: number;
  skipped: number;
  candidates: WorldCupImportCandidateDto[];
  errors: string[];
  warnings: string[];
  safety: {
    noRealMoney: true;
    noPslActivation: true;
    worldCupBetaContext: true;
    writeRequiresFlags: string[];
  };
}
