import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FixtureImportSource } from '@prisma/client';

export class CreateBatchDto {
  @IsString()
  seasonId!: string;

  @IsEnum(FixtureImportSource)
  @IsOptional()
  source?: FixtureImportSource;

  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsString()
  @IsOptional()
  sourceReference?: string;
}
