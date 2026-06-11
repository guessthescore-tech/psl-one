import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { SquadRegistrationSource, SquadRegistrationStatus } from '@prisma/client';

export class UpdatePlayerAssignmentDto {
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
