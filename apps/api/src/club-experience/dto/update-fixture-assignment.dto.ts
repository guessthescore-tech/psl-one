import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateFixtureTeamsDto {
  @IsOptional()
  @IsUUID()
  homeTeamId?: string;

  @IsOptional()
  @IsUUID()
  awayTeamId?: string;
}

export class UpdateFixtureVenueDto {
  @IsUUID()
  venueId!: string;
}

export class UpdateFixtureGameweekDto {
  @IsUUID()
  gameweekId!: string;
}

export class UpdateFixtureAssignmentStatusDto {
  @IsString()
  assignmentStatus!: string;
}
