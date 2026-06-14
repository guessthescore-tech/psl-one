import { IsString, IsOptional, IsInt, IsDateString, MaxLength, Min } from 'class-validator';

export class UpdateCohortDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

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
