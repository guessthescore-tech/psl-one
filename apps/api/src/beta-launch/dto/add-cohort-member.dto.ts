import { IsString, IsOptional } from 'class-validator';

export class AddCohortMemberDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
