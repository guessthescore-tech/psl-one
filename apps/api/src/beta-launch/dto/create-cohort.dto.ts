import { IsString, IsOptional, IsInt, IsDateString, MinLength, MaxLength, Min } from 'class-validator';

export class CreateCohortDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  slug!: string;

  @IsString()
  seasonId!: string;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsers?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
