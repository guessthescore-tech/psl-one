import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { SquadRegistrationSource, SquadRegistrationStatus } from '@prisma/client';

export class AssignPlayerDto {
  @IsUUID()
  playerId!: string;

  @IsOptional()
  @IsEnum(SquadRegistrationStatus)
  status?: SquadRegistrationStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  shirtNumber?: number;

  @IsOptional()
  @IsEnum(SquadRegistrationSource)
  source?: SquadRegistrationSource;
}
