import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { FixtureStatus } from '@prisma/client';

export class UpdateLiveStateDto {
  @IsOptional()
  @IsEnum(FixtureStatus)
  status?: FixtureStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentMinute?: number;

  @IsOptional()
  @IsString()
  period?: string;
}
