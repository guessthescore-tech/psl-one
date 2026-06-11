import { IsArray, IsString, MinLength } from 'class-validator';

export class GenerateCupRoundDto {
  @IsString()
  gameweekId!: string;

  @IsString()
  @MinLength(2)
  roundName!: string;

  @IsArray()
  @IsString({ each: true })
  teamIds!: string[];
}
