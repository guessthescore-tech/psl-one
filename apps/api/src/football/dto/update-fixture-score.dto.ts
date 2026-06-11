import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateFixtureScoreDto {
  @IsInt()
  @Min(0)
  homeScore!: number;

  @IsInt()
  @Min(0)
  awayScore!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentMinute?: number;
}
