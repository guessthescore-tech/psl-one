import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { CompetitionFormat } from '@prisma/client';

export class CreateCompetitionDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsEnum(CompetitionFormat)
  format!: CompetitionFormat;

  @IsOptional()
  @IsInt()
  @Min(2)
  teamCount?: number;

  @IsBoolean()
  hasGroups!: boolean;

  @IsBoolean()
  hasKnockouts!: boolean;

  @IsBoolean()
  hasHomeAway!: boolean;

  @IsBoolean()
  usesNeutralVenues!: boolean;

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
