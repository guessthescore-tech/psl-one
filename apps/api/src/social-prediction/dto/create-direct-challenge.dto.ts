import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDirectChallengeDto {
  @IsString()
  @IsNotEmpty()
  challengedUserId!: string;
}
