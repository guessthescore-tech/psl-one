import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePrivateLeagueDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name!: string;

  @IsString()
  seasonId!: string;
}
