import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CompetitionFormat } from '@prisma/client';

export class UpdateCompetitionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsEnum(CompetitionFormat)
  format?: CompetitionFormat;

  @IsOptional()
  @IsInt()
  @Min(2)
  teamCount?: number;

  @IsOptional()
  @IsBoolean()
  hasGroups?: boolean;

  @IsOptional()
  @IsBoolean()
  hasKnockouts?: boolean;

  @IsOptional()
  @IsBoolean()
  hasHomeAway?: boolean;

  @IsOptional()
  @IsBoolean()
  usesNeutralVenues?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsForWin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsForDraw?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsForLoss?: number;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsString()
  sourceUrl?: string;
}
