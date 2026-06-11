import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpsertMatchStatDto {
  @IsString()
  playerId!: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  minutesPlayed?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  goals?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  assists?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  ownGoals?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  yellowCards?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  redCards?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  penaltiesMissed?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  penaltiesSaved?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  saves?: number;

  @IsBoolean()
  @IsOptional()
  cleanSheet?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  bonusPoints?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  tacklesWon?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  interceptions?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  blockedShots?: number;

  @IsBoolean()
  @IsOptional()
  didNotPlay?: boolean;
}
