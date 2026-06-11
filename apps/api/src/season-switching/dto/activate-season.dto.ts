import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ActivateSeasonDto {
  @IsOptional()
  @IsBoolean()
  acknowledgeWarnings?: boolean;

  @IsOptional()
  @IsString()
  activationNote?: string;
}
