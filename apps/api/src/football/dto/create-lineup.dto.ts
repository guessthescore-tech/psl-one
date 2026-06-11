import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { LineupStatus } from '@prisma/client';

export class CreateLineupDto {
  @IsString()
  teamId!: string;

  @IsString()
  playerId!: string;

  @IsEnum(LineupStatus)
  status!: LineupStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  shirtNumber?: number;

  @IsOptional()
  @IsString()
  position?: string;
}
