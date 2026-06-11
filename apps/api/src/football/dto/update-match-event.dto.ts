import { IsEnum, IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { MatchEventType } from '@prisma/client';

export class UpdateMatchEventDto {
  @IsOptional()
  @IsEnum(MatchEventType)
  eventType?: MatchEventType;

  @IsOptional()
  @IsInt()
  @Min(0)
  minute?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stoppageMinute?: number;

  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsString()
  playerId?: string;

  @IsOptional()
  @IsString()
  relatedPlayerId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
