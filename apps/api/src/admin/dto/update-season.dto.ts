import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { SeasonStatus } from '@prisma/client';

export class UpdateSeasonDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(SeasonStatus)
  status?: SeasonStatus;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  sourceUrl?: string;
}
