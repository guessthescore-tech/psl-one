import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FantasyPlayerSlotDto } from './fantasy-player-slot.dto';

export class CreateFantasyTeamDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FantasyPlayerSlotDto)
  players!: FantasyPlayerSlotDto[];
}
