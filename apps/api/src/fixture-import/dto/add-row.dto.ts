import { IsISO8601, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AddRowDto {
  @IsNumber()
  @Min(1)
  @IsOptional()
  rowNumber?: number;

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
  kickoffAtRaw!: string;

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
