import { IsEnum, IsOptional } from 'class-validator';
import { SeasonTeamSource, SeasonTeamStatus } from '@prisma/client';

export class UpdateSeasonTeamDto {
  @IsOptional()
  @IsEnum(SeasonTeamStatus)
  status?: SeasonTeamStatus;

  @IsOptional()
  @IsEnum(SeasonTeamSource)
  source?: SeasonTeamSource;
}
