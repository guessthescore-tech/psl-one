import { IsInt, Min, Max } from 'class-validator';

export class AcceptPredictionChallengeDto {
  @IsInt()
  @Min(0)
  @Max(20)
  homeScore!: number;

  @IsInt()
  @Min(0)
  @Max(20)
  awayScore!: number;
}
