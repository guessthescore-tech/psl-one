import { IsString, IsNotEmpty } from 'class-validator';

export class EmailVerifyDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}
