import { IsEmail, IsUUID } from 'class-validator';

export class CreateChallengeDto {
  @IsUUID()
  fixtureId!: string;

  @IsEmail()
  opponentEmail!: string;
}
