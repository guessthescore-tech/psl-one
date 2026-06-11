import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { SeasonStatus } from '@prisma/client';

export class CreateSeasonDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsEnum(SeasonStatus)
  status?: SeasonStatus;

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
