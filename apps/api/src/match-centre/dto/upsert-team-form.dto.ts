import { DataSourceType } from '@prisma/client';

export class UpsertTeamFormDto {
  seasonId!: string;
  formString!: string;
  recentFixtures!: unknown[];
  sourceType?: DataSourceType;
}
