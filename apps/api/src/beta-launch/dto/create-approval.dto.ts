import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateApprovalDto {
  @IsBoolean()
  rollbackVerified!: boolean;

  @IsBoolean()
  betaCohortVerified!: boolean;

  @IsBoolean()
  frontendVerified!: boolean;

  @IsBoolean()
  dataVerified!: boolean;

  @IsBoolean()
  securityVerified!: boolean;

  @IsBoolean()
  operationsVerified!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
