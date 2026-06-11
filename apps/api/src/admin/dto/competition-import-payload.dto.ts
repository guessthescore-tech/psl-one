import { CompetitionFormat, FixtureStatus, GameweekStatus, PlayerPosition, SeasonStatus } from '@prisma/client';

export interface ImportCompetitionDto {
  externalId?: string;
  name: string;
  slug: string;
  format?: CompetitionFormat;
  teamCount?: number;
  hasGroups?: boolean;
  hasKnockouts?: boolean;
  hasHomeAway?: boolean;
  usesNeutralVenues?: boolean;
  pointsForWin?: number;
  pointsForDraw?: number;
  pointsForLoss?: number;
  logoUrl?: string;
  sourceUrl?: string;
}

export interface ImportSeasonDto {
  externalId?: string;
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
  status?: SeasonStatus;
  isActive?: boolean;
  sourceUrl?: string;
}

export interface ImportTeamDto {
  externalId?: string;
  name: string;
  slug: string;
  shortName: string;
  country: string;
  logoUrl?: string;
  sourceUrl?: string;
}

export interface ImportVenueDto {
  externalId?: string;
  name: string;
  city: string;
  country: string;
  capacity?: number;
  sourceUrl?: string;
}

export interface ImportPlayerDto {
  externalId?: string;
  teamExternalId?: string;
  teamSlug?: string;
  name: string;
  position: PlayerPosition;
  nationality: string;
  dateOfBirth?: string;
  number?: number;
  sourceUrl?: string;
}

export interface ImportFixtureDto {
  externalId?: string;
  homeTeamExternalId?: string;
  homeTeamSlug?: string;
  awayTeamExternalId?: string;
  awayTeamSlug?: string;
  venueExternalId?: string;
  venueName?: string;
  groupName?: string;
  gameweekSlug?: string;
  stageSlug?: string;
  kickoffAt: string;
  status?: FixtureStatus;
  round?: string;
  isNeutralVenue?: boolean;
  legNumber?: number;
  sourceUrl?: string;
}

export interface ImportGroupDto {
  externalId?: string;
  name: string;
  teamSlugs?: string[];
  teamExternalIds?: string[];
}

export interface ImportGameweekDto {
  externalId?: string;
  name: string;
  slug: string;
  round: number;
  startsAt: string;
  endsAt: string;
  transferDeadlineAt: string;
  predictionDeadlineAt: string;
  status?: GameweekStatus;
  sourceUrl?: string;
}

export interface CompetitionImportPayload {
  source: string;
  sourceType: string;
  replaceMode?: boolean;
  activateSeason?: boolean;
  autoAssignFixtures?: boolean;
  competitionSlug?: string;
  seasonSlug?: string;
  competition?: ImportCompetitionDto;
  season?: ImportSeasonDto;
  teams?: ImportTeamDto[];
  venues?: ImportVenueDto[];
  players?: ImportPlayerDto[];
  fixtures?: ImportFixtureDto[];
  groups?: ImportGroupDto[];
  gameweeks?: ImportGameweekDto[];
}

export interface ImportPreviewCounts {
  competitions: number;
  seasons: number;
  teams: number;
  venues: number;
  players: number;
  fixtures: number;
  groups: number;
  gameweeks: number;
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  previewCounts: ImportPreviewCounts;
  detectedFormat: string;
  willActivateSeason: boolean;
  replaceMode: boolean;
}

export interface ImportCommitResult {
  jobId: string;
  counts: ImportPreviewCounts;
  errors: string[];
  status: string;
  assignmentSummary?: { total: number; assigned: number; skipped: number };
}
