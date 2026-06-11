import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpsertPlayerStatDto } from './upsert-player-stat.dto';

export class BulkUpsertPlayerStatsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertPlayerStatDto)
  stats!: UpsertPlayerStatDto[];
}
