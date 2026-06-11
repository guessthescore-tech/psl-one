import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { FantasyLeagueScoringType, FantasyLeagueType } from '@prisma/client';

export class CreateLeagueDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name!: string;

  @IsEnum(FantasyLeagueType)
  @IsOptional()
  type?: FantasyLeagueType;

  @IsEnum(FantasyLeagueScoringType)
  @IsOptional()
  scoringType?: FantasyLeagueScoringType;

  @IsString()
  seasonId!: string;
}
