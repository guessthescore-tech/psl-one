import { IsOptional, IsInt, IsIn, Min } from 'class-validator';

export class DeriveDeadlinesDto {
  @IsOptional()
  @IsIn(['MISSING_ONLY', 'OVERWRITE_DERIVED_ONLY'])
  mode?: 'MISSING_ONLY' | 'OVERWRITE_DERIVED_ONLY';

  @IsOptional()
  @IsInt()
  @Min(0)
  fantasyBufferMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  predictionBufferMinutes?: number;
}
