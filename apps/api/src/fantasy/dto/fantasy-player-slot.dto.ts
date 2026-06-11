import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { FantasySquadRole } from '@prisma/client';

export class FantasyPlayerSlotDto {
  @IsUUID()
  playerId!: string;

  @IsEnum(FantasySquadRole)
  squadRole!: FantasySquadRole;

  @IsOptional()
  @IsNumber()
  benchSlot?: number;

  @IsOptional()
  @IsBoolean()
  isCaptain?: boolean;

  @IsOptional()
  @IsBoolean()
  isViceCaptain?: boolean;
}
