import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { SeasonTeamSource, SeasonTeamStatus } from '@prisma/client';

export class CreateSeasonTeamDto {
  @IsUUID()
  teamId!: string;

  @IsOptional()
  @IsEnum(SeasonTeamStatus)
  status?: SeasonTeamStatus;

  @IsOptional()
  @IsEnum(SeasonTeamSource)
  source?: SeasonTeamSource;
}
