import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { FantasySquadRole } from '@prisma/client';

export class UpdatePlayerSlotDto {
  @IsOptional()
  @IsEnum(FantasySquadRole)
  squadRole?: FantasySquadRole;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  benchSlot?: number;

  @IsOptional()
  @IsBoolean()
  isCaptain?: boolean;

  @IsOptional()
  @IsBoolean()
  isViceCaptain?: boolean;
}
