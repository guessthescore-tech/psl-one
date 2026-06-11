import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SetPlayerPriceDto {
  @IsString()
  seasonId!: string;

  @IsInt()
  @Min(1)
  price!: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
