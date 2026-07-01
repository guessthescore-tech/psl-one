import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FantasyPlayerSlotDto } from './fantasy-player-slot.dto';

export class CreateFantasyTeamDto {
  @IsOptional()
  @IsString()
  name?: string;

  // Optional: omit or pass [] to register a team name without selecting players yet.
  // When provided and non-empty, full squad-composition validation is enforced.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FantasyPlayerSlotDto)
  players?: FantasyPlayerSlotDto[];
}
