import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdatePredictionDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  predictedHomeScore?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  predictedAwayScore?: number;
}
