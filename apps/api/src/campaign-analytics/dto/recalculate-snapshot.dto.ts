import { IsISO8601, IsOptional } from 'class-validator';

export class RecalculateSnapshotDto {
  @IsOptional()
  @IsISO8601()
  snapshotDate?: string;
}
