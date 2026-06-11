import { IsString } from 'class-validator';

export class JoinByCodeDto {
  @IsString()
  inviteCode!: string;
}
