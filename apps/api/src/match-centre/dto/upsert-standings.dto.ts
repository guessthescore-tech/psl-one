import { DataSourceType, DataStatus } from '@prisma/client';

export class UpsertStandingEntryDto {
  clubId!: string;
  position!: number;
  played!: number;
  won!: number;
  drawn!: number;
  lost!: number;
  goalsFor!: number;
  goalsAgainst!: number;
  goalDifference!: number;
  points!: number;
  form?: string;
}

export class UpsertStandingsDto {
  seasonId!: string;
  entries!: UpsertStandingEntryDto[];
  sourceType?: DataSourceType;
  dataStatus?: DataStatus;
}
