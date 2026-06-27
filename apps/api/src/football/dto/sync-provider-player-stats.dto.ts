import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SyncProviderPlayerStatsDto {
  /**
   * Safe default: preview provider rows and mapping only.
   * Writes require dryRun=false plus confirm=SYNC_PROVIDER_PLAYER_STATS.
   */
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;

  @IsOptional()
  @IsString()
  confirm?: string;
}
