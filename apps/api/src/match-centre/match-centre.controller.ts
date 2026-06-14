import { Body, Controller, Get, Param, Patch, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { DataSourceType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { IngestMatchDataDto } from './dto/ingest-match-data.dto';
import { UpsertPlayerRatingDto } from './dto/upsert-player-rating.dto';
import { UpsertStandingEntryDto, UpsertStandingsDto } from './dto/upsert-standings.dto';
import { UpsertTeamFormDto } from './dto/upsert-team-form.dto';
import { MatchCentreService } from './match-centre.service';

// ── Fan Routes ───────────────────────────────────────────────────────────────

@Controller('match-centre')
@UseGuards(JwtAuthGuard)
export class MatchCentreFanController {
  constructor(private readonly svc: MatchCentreService) {}

  @Get('fixture/:fixtureId')
  getFixtureMatchCentre(@Param('fixtureId') fixtureId: string) {
    return this.svc.getFixtureMatchCentre(fixtureId);
  }

  @Get('fixture/:fixtureId/line-ups')
  getFixtureLineups(@Param('fixtureId') fixtureId: string) {
    return this.svc.getFixtureLineups(fixtureId);
  }

  @Get('fixture/:fixtureId/stats')
  getFixtureStats(@Param('fixtureId') fixtureId: string) {
    return this.svc.getFixtureStats(fixtureId);
  }

  @Get('fixture/:fixtureId/player-ratings')
  getFixturePlayerRatings(@Param('fixtureId') fixtureId: string) {
    return this.svc.getFixturePlayerRatings(fixtureId);
  }

  @Get('standings/:seasonId')
  getSeasonStandings(@Param('seasonId') seasonId: string) {
    return this.svc.getSeasonStandings(seasonId);
  }

  @Get('team-form/:clubId')
  getTeamForm(@Param('clubId') clubId: string, @Query('seasonId') seasonId: string) {
    return this.svc.getTeamForm(clubId, seasonId);
  }

  @Get('player/:playerId')
  getPlayerProfile(@Param('playerId') playerId: string, @Query('seasonId') seasonId: string) {
    return this.svc.getPlayerProfile(playerId, seasonId);
  }
}

// ── Admin Routes ─────────────────────────────────────────────────────────────

@Controller('admin/match-centre')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class MatchCentreAdminController {
  constructor(private readonly svc: MatchCentreService) {}

  @Put('standings')
  adminUpsertStandings(@Request() req: { user: { sub: string } }, @Body() dto: UpsertStandingsDto) {
    return this.svc.adminUpsertStandings(req.user.sub, dto);
  }

  @Patch('standings/:seasonId/:clubId')
  adminUpsertStanding(
    @Request() req: { user: { sub: string } },
    @Param('seasonId') seasonId: string,
    @Body() dto: UpsertStandingEntryDto,
  ) {
    return this.svc.adminUpsertStanding(req.user.sub, seasonId, dto);
  }

  @Put('team-form/:clubId')
  adminUpsertTeamForm(
    @Request() req: { user: { sub: string } },
    @Param('clubId') clubId: string,
    @Body() dto: UpsertTeamFormDto,
  ) {
    return this.svc.adminUpsertTeamForm(req.user.sub, clubId, dto);
  }

  @Post('player-ratings')
  adminUpsertPlayerRating(@Request() req: { user: { sub: string } }, @Body() dto: UpsertPlayerRatingDto) {
    return this.svc.adminUpsertPlayerRating(req.user.sub, dto);
  }

  @Post('ingest')
  adminIngestSandboxData(@Request() req: { user: { sub: string } }, @Body() dto: IngestMatchDataDto) {
    return this.svc.adminIngestSandboxData(req.user.sub, dto);
  }

  @Get('ingestion-log')
  adminGetIngestionLog(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('sourceType') sourceType?: DataSourceType,
    @Query('limit') limit?: string,
  ) {
    return this.svc.adminGetIngestionLog({
      ...(entityType !== undefined ? { entityType } : {}),
      ...(entityId !== undefined ? { entityId } : {}),
      ...(sourceType !== undefined ? { sourceType } : {}),
      ...(limit !== undefined ? { limit: parseInt(limit, 10) } : {}),
    });
  }

  @Get('provenance/:entityType/:entityId')
  adminGetDataProvenance(@Param('entityType') entityType: string, @Param('entityId') entityId: string) {
    return this.svc.adminGetDataProvenance(entityType, entityId);
  }

  @Get('capability-status')
  adminGetCapabilityStatus() {
    return this.svc.adminGetCapabilityStatus();
  }
}
