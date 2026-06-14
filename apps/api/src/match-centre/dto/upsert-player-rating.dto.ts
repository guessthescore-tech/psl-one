import { DataSourceType } from '@prisma/client';

export class UpsertPlayerRatingDto {
  playerId!: string;
  fixtureId!: string;
  performanceRating!: number;
  minutesPlayed?: number;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  sourceType?: DataSourceType;
  ratingSource?: string;
  providerKey?: string;
}
