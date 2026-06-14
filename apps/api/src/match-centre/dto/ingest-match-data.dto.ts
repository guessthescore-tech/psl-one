import { DataSourceType } from '@prisma/client';

export class IngestMatchDataDto {
  fixtureId!: string;
  entityType!: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data!: any;
  sourceType?: DataSourceType;
  notes?: string;
}
