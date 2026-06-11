import { IsOptional, IsBoolean } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  matchReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  teamNews?: boolean;

  @IsOptional()
  @IsBoolean()
  fantasyUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  rewardsUpdates?: boolean;
}
