import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpsertPlayerStatDto {
  @IsString()
  playerId!: string;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  minutesPlayed?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  goals?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  assists?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  ownGoals?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  yellowCards?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  redCards?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  penaltiesMissed?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  penaltiesSaved?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  saves?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  goalsConceded?: number;

  @IsOptional()
  @IsBoolean()
  cleanSheet?: boolean;

  @IsOptional()
  @IsBoolean()
  started?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  cameOnMinute?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  subbedOffMinute?: number;

  @IsOptional()
  @IsBoolean()
  didNotPlay?: boolean;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  providerStatId?: string;
}
