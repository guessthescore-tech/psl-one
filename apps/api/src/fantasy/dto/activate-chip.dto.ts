import { IsString } from 'class-validator';

export class ActivateChipDto {
  @IsString()
  gameweekId!: string;
}
