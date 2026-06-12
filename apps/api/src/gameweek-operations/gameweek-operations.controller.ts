import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GameweekOperationsService } from './gameweek-operations.service';
import { DeriveDeadlinesDto } from './dto/derive-deadlines.dto';

@Controller('gameweeks/admin/operations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class GameweekOperationsController {
  constructor(private readonly svc: GameweekOperationsService) {}

  @Get('seasons')
  getOperationalSeasons() {
    return this.svc.getOperationalSeasons();
  }

  @Get(':seasonId/overview')
  getSeasonOperationsOverview(@Param('seasonId') seasonId: string) {
    return this.svc.getSeasonOperationsOverview(seasonId);
  }

  @Get(':seasonId/gameweeks')
  getGameweekOperations(@Param('seasonId') seasonId: string) {
    return this.svc.getGameweekOperations(seasonId);
  }

  @Get(':seasonId/gameweeks/:gameweekId')
  getGameweekOperationDetail(
    @Param('seasonId') seasonId: string,
    @Param('gameweekId') gameweekId: string,
  ) {
    return this.svc.getGameweekOperationDetail(seasonId, gameweekId);
  }

  @Get(':seasonId/readiness')
  getSeasonGameweekReadiness(@Param('seasonId') seasonId: string) {
    return this.svc.getSeasonGameweekReadiness(seasonId);
  }

  @Get(':seasonId/deadlines')
  getDeadlineReadiness(@Param('seasonId') seasonId: string) {
    return this.svc.getDeadlineReadiness(seasonId);
  }

  @Get(':seasonId/fixture-assignment')
  getFixtureAssignmentReadiness(@Param('seasonId') seasonId: string) {
    return this.svc.getFixtureAssignmentReadiness(seasonId);
  }

  @Get(':seasonId/fantasy-impact')
  getFantasyImpact(@Param('seasonId') seasonId: string) {
    return this.svc.getFantasyImpact(seasonId);
  }

  @Get(':seasonId/prediction-impact')
  getPredictionImpact(@Param('seasonId') seasonId: string) {
    return this.svc.getPredictionImpact(seasonId);
  }

  @Get(':seasonId/publication-readiness')
  getPublicationReadiness(@Param('seasonId') seasonId: string) {
    return this.svc.getPublicationReadiness(seasonId);
  }

  @Get(':seasonId/activation-impact')
  getActivationImpact(@Param('seasonId') seasonId: string) {
    return this.svc.getActivationImpact(seasonId);
  }

  @Get(':seasonId/matchday-control')
  getMatchdayControl(@Param('seasonId') seasonId: string) {
    return this.svc.getMatchdayControl(seasonId);
  }

  @Post(':seasonId/gameweeks/derive')
  deriveGameweeks(@Param('seasonId') seasonId: string) {
    return this.svc.deriveGameweeks(seasonId);
  }

  @Post(':seasonId/derive-deadlines')
  deriveDeadlines(@Param('seasonId') seasonId: string, @Body() dto: DeriveDeadlinesDto) {
    return this.svc.deriveDeadlines(seasonId, dto);
  }

  @Post(':seasonId/validate')
  validateSeasonGameweeks(@Param('seasonId') seasonId: string) {
    return this.svc.validateSeasonGameweeks(seasonId);
  }
}
