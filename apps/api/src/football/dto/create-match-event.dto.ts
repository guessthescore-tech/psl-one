import { IsEnum, IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { MatchEventType } from '@prisma/client';

export class CreateMatchEventDto {
  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsString()
  playerId?: string;

  @IsInt()
  @Min(0)
  minute!: number;

  @IsEnum(MatchEventType)
  eventType!: MatchEventType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
