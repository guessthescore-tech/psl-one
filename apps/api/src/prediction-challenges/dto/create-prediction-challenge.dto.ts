import { IsString, IsInt, Min, Max } from 'class-validator';

export class CreatePredictionChallengeDto {
  @IsString()
  fixtureId!: string;

  @IsInt()
  @Min(0)
  @Max(20)
  homeScore!: number;

  @IsInt()
  @Min(0)
  @Max(20)
  awayScore!: number;
}
