import { IsDateString, IsOptional } from 'class-validator';

export class UpdateGameweekDeadlinesDto {
  @IsOptional()
  @IsDateString()
  transferDeadlineAt?: string;

  @IsOptional()
  @IsDateString()
  predictionDeadlineAt?: string;
}
