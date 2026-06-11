import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class UpdateRowDto {
  @IsString()
  @IsOptional()
  homeTeamRaw?: string;

  @IsString()
  @IsOptional()
  awayTeamRaw?: string;

  @IsString()
  @IsOptional()
  venueRaw?: string;

  @IsISO8601()
  @IsOptional()
  kickoffAtRaw?: string;

  @IsString()
  @IsOptional()
  roundRaw?: string;

  @IsString()
  @IsOptional()
  homeTeamId?: string;

  @IsString()
  @IsOptional()
  awayTeamId?: string;

  @IsString()
  @IsOptional()
  venueId?: string;

  @IsString()
  @IsOptional()
  gameweekId?: string;
}
