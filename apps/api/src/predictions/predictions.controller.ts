import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TokenPayload } from '../auth/providers/auth.provider.interface';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';

@Controller('predictions')
@UseGuards(JwtAuthGuard)
export class PredictionsController {
  constructor(private predictionsService: PredictionsService) {}

  @Post()
  create(@CurrentUser() user: TokenPayload, @Body() dto: CreatePredictionDto) {
    return this.predictionsService.createPrediction(user.sub, dto);
  }

  @Get('me')
  getMyPredictions(@CurrentUser() user: TokenPayload, @Query('seasonSlug') seasonSlug?: string) {
    return this.predictionsService.getMyPredictions(user.sub, seasonSlug);
  }

  @Get('me/:fixtureId')
  getMyPredictionForFixture(
    @CurrentUser() user: TokenPayload,
    @Param('fixtureId') fixtureId: string,
  ) {
    return this.predictionsService.getMyPredictionForFixture(user.sub, fixtureId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdatePredictionDto,
  ) {
    return this.predictionsService.updatePrediction(user.sub, id, dto);
  }

  // Static prefix routes before :id to avoid NestJS route conflicts

  @Get('fixtures')
  listEligibleFixtures(@Query('seasonSlug') seasonSlug?: string) {
    return this.predictionsService.listEligibleFixtures(seasonSlug);
  }

  @Get('fixtures/:fixtureId/lock-state')
  getFixtureLockState(@Param('fixtureId') fixtureId: string) {
    return this.predictionsService.getFixtureLockState(fixtureId);
  }

  @Get('fixtures/:fixtureId/eligibility')
  getFixtureEligibility(@Param('fixtureId') fixtureId: string) {
    return this.predictionsService.getSingleFixtureEligibility(fixtureId);
  }

  @Get('gameweek/:gameweekId')
  getGameweekPredictions(
    @CurrentUser() user: TokenPayload,
    @Param('gameweekId') gameweekId: string,
  ) {
    return this.predictionsService.getGameweekPredictions(user.sub, gameweekId);
  }

  @Post('admin/settle-fixture/:fixtureId')
  @UseGuards(RolesGuard)
  @Roles('PSL_ADMIN')
  settleFixture(@Param('fixtureId') fixtureId: string) {
    return this.predictionsService.settleFixture(fixtureId);
  }

  @Post('admin/lock-fixture/:fixtureId')
  @UseGuards(RolesGuard)
  @Roles('PSL_ADMIN')
  lockFixture(@Param('fixtureId') fixtureId: string) {
    return this.predictionsService.lockFixture(fixtureId);
  }

  @Post('admin/void-fixture/:fixtureId')
  @UseGuards(RolesGuard)
  @Roles('PSL_ADMIN')
  voidFixture(@Param('fixtureId') fixtureId: string) {
    return this.predictionsService.voidFixture(fixtureId);
  }

  @Post('admin/lock-gameweek/:gameweekId')
  @UseGuards(RolesGuard)
  @Roles('PSL_ADMIN')
  lockGameweek(@Param('gameweekId') gameweekId: string) {
    return this.predictionsService.lockGameweekPredictions(gameweekId);
  }

  @Post('admin/lock-gameweek/:gameweekId/force')
  @UseGuards(RolesGuard)
  @Roles('PSL_ADMIN')
  lockGameweekForce(@Param('gameweekId') gameweekId: string) {
    return this.predictionsService.lockGameweekPredictions(gameweekId, true);
  }

  @Post('admin/settle-gameweek/:gameweekId')
  @UseGuards(RolesGuard)
  @Roles('PSL_ADMIN')
  settleGameweek(@Param('gameweekId') gameweekId: string) {
    return this.predictionsService.settleGameweek(gameweekId);
  }
}
