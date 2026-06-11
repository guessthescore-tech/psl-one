import { IsEnum } from 'class-validator';
import { GameweekStatus } from '@prisma/client';

export class UpdateGameweekStatusDto {
  @IsEnum(GameweekStatus)
  status!: GameweekStatus;
}
