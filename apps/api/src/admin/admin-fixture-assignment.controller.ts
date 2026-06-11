import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { IsArray, IsString, IsUUID } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FixtureAssignmentService } from './fixture-assignment.service';

class AssignGameweekDto {
  @IsUUID()
  gameweekId!: string;
}

class AssignStageDto {
  @IsUUID()
  stageId!: string;
}

class BulkAssignGameweekDto {
  @IsArray()
  @IsUUID('all', { each: true })
  fixtureIds!: string[];

  @IsUUID()
  gameweekId!: string;
}

class BulkAssignStageDto {
  @IsArray()
  @IsUUID('all', { each: true })
  fixtureIds!: string[];

  @IsUUID()
  stageId!: string;
}

class AutoAssignDto {
  @IsString()
  seasonId!: string;
}

@Controller('admin/fixtures')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class AdminFixtureAssignmentController {
  constructor(private readonly assignmentService: FixtureAssignmentService) {}

  // Static routes must come before :id routes to avoid NestJS matching "unassigned" as an id

  @Get('unassigned')
  getUnassigned(@Query('seasonId') seasonId: string) {
    return this.assignmentService.getUnassignedFixtures(seasonId);
  }

  @Get('assignment-summary')
  getAssignmentSummary(@Query('seasonId') seasonId: string) {
    return this.assignmentService.getAssignmentSummary(seasonId);
  }

  @Post('bulk-assign-gameweek')
  bulkAssignGameweek(@Body() dto: BulkAssignGameweekDto) {
    return this.assignmentService.bulkAssignFixturesToGameweek(dto.fixtureIds, dto.gameweekId);
  }

  @Post('bulk-assign-stage')
  bulkAssignStage(@Body() dto: BulkAssignStageDto) {
    return this.assignmentService.bulkAssignFixturesToStage(dto.fixtureIds, dto.stageId);
  }

  @Post('auto-assign')
  autoAssign(@Body() dto: AutoAssignDto) {
    return this.assignmentService.autoAssignFixturesForSeason(dto.seasonId);
  }

  @Post(':id/assign-gameweek')
  assignGameweek(@Param('id') id: string, @Body() dto: AssignGameweekDto) {
    return this.assignmentService.assignFixtureToGameweek(id, dto.gameweekId);
  }

  @Post(':id/assign-stage')
  assignStage(@Param('id') id: string, @Body() dto: AssignStageDto) {
    return this.assignmentService.assignFixtureToStage(id, dto.stageId);
  }
}
