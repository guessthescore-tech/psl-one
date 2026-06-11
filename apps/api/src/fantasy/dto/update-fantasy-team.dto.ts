import { IsOptional, IsString } from 'class-validator';

export class UpdateFantasyTeamDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  formation?: string;
}
