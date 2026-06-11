import { IsString } from 'class-validator';

export class JoinPublicLeagueDto {
  @IsString()
  seasonId!: string;
}
