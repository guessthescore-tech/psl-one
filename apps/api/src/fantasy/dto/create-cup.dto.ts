import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCupDto {
  @IsString()
  seasonId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;
}
