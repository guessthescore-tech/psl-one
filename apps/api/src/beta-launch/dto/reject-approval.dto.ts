import { IsString, MinLength, MaxLength } from 'class-validator';

export class RejectApprovalDto {
  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  reason!: string;
}
