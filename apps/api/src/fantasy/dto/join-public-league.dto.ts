import { IsOptional, IsString } from 'class-validator';

export class JoinPublicLeagueDto {
  @IsString()
  seasonId!: string;

  @IsOptional()
  @IsString()
  leagueId?: string;
}
