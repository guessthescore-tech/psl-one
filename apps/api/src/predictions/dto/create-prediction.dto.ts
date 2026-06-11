import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreatePredictionDto {
  @IsUUID()
  fixtureId!: string;

  @IsInt()
  @Min(0)
  @Max(20)
  predictedHomeScore!: number;

  @IsInt()
  @Min(0)
  @Max(20)
  predictedAwayScore!: number;
}
