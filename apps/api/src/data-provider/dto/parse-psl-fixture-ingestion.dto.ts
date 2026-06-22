export type ParsePslIngestionRequestDto = {
  competitionCode?: string;
  dryRun?: boolean;
  seasonId?: string;
  includeCandidates?: boolean;
  confirmWrite?: boolean;
};

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

export type ParsePslIngestionPreviewResponseDto = {
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
