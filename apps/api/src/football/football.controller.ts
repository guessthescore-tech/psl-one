import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { TokenPayload } from '../auth/providers/auth.provider.interface';
import { FootballService } from './football.service';
import { LiveMatchService } from './live-match.service';
import { UpdateFixtureStatusDto } from './dto/update-fixture-status.dto';
import { UpdateFixtureScoreDto } from './dto/update-fixture-score.dto';
import { CreateLineupDto } from './dto/create-lineup.dto';
import { UpdateLiveStateDto } from './dto/update-live-state.dto';
import { AddMatchEventDto } from './dto/add-match-event.dto';
import { UpdateMatchEventDto } from './dto/update-match-event.dto';
import { UpsertPlayerStatDto } from './dto/upsert-player-stat.dto';
import { BulkUpsertPlayerStatsDto } from './dto/bulk-upsert-player-stats.dto';
import { SyncProviderPlayerStatsDto } from './dto/sync-provider-player-stats.dto';
import { ScoreBatWidgetAdapter } from '../data-provider/scorebat-widget.adapter';

@Controller('football')
export class FootballController {
  constructor(
    private footballService: FootballService,
    private liveMatchService: LiveMatchService,
  ) {}

  @Get('competitions')
  listCompetitions() {
    return this.footballService.listCompetitions();
  }

  @Get('competitions/:slug')
  getCompetition(@Param('slug') slug: string) {
    return this.footballService.getCompetition(slug);
  }

  @Get('seasons')
  listSeasons(@Query('competitionSlug') competitionSlug?: string) {
    if (competitionSlug) return this.footballService.listSeasonsByCompetition(competitionSlug);
    return this.footballService.listSeasons();
  }

  @Get('seasons/active')
  getActiveSeason() {
    return this.footballService.getActiveSeason();
  }

  @Get('context')
  getSeasonContext() {
    return this.footballService.getSeasonContext();
  }

  @Get('seasons/:slug')
  getSeasonBySlug(@Param('slug') slug: string) {
    return this.footballService.getSeasonBySlug(slug);
  }

  @Get('teams')
  listTeams(@Query('seasonSlug') seasonSlug?: string) {
    return this.footballService.listTeams(seasonSlug ? { seasonSlug } : {});
  }

  @Get('teams/:slug/players')
  getTeamPlayers(@Param('slug') slug: string) {
    return this.footballService.getTeamPlayers(slug);
  }

  @Get('teams/:slug')
  getTeam(@Param('slug') slug: string) {
    return this.footballService.getTeam(slug);
  }

  @Get('players')
  listPlayers(
    @Query('teamSlug') teamSlug?: string,
    @Query('seasonSlug') seasonSlug?: string,
  ) {
    const filters: { teamSlug?: string; seasonSlug?: string } = {};
    if (teamSlug) filters.teamSlug = teamSlug;
    if (seasonSlug) filters.seasonSlug = seasonSlug;
    return this.footballService.listPlayers(filters);
  }

  @Get('players/:id')
  getPlayer(@Param('id') id: string) {
    return this.footballService.getPlayer(id);
  }

  @Get('fixtures')
  listFixtures(
    @Query('seasonSlug') seasonSlug?: string,
    @Query('teamSlug') teamSlug?: string,
    @Query('status') status?: string,
    @Query('group') group?: string,
  ) {
    const filters: { seasonSlug?: string; teamSlug?: string; status?: string; group?: string } = {};
    if (seasonSlug) filters.seasonSlug = seasonSlug;
    if (teamSlug) filters.teamSlug = teamSlug;
    if (status) filters.status = status;
    if (group) filters.group = group;
    return this.footballService.listFixtures(filters);
  }

  @Get('fixtures/:id/live-dashboard')
  getLiveMatchDashboard(@Param('id') id: string) {
    return this.liveMatchService.getLiveMatchDashboard(id);
  }

  @Get('fixtures/:id/live-state')
  getFixtureLiveState(@Param('id') id: string) {
    return this.liveMatchService.getFixtureLiveState(id);
  }

  @Get('fixtures/:id/timeline')
  getFixtureTimeline(@Param('id') id: string) {
    return this.liveMatchService.getFixtureTimeline(id);
  }

  @Get('fixtures/:id/player-stats')
  getFixturePlayerStats(@Param('id') id: string) {
    return this.liveMatchService.getFixturePlayerStats(id);
  }

  @Get('fixtures/:id/live-fantasy-preview')
  getLiveFantasyPreview(@Param('id') id: string) {
    return this.liveMatchService.getLiveFantasyPreview(id);
  }

  @Get('fixtures/:id/live')
  getFixtureLive(@Param('id') id: string) {
    return this.footballService.getFixtureLive(id);
  }

  @Get('fixtures/:id/events')
  getFixtureEvents(@Param('id') id: string) {
    return this.footballService.getFixtureEvents(id);
  }

  @Get('fixtures/:id/lineups')
  getFixtureLineups(@Param('id') id: string) {
    return this.footballService.getFixtureLineups(id);
  }

  @Get('fixtures/:id/availability')
  getFixtureAvailability(@Param('id') id: string) {
    return this.footballService.getFixtureAvailability(id);
  }

  @Get('fixtures/:id')
  getFixture(@Param('id') id: string) {
    return this.footballService.getFixture(id);
  }

  @Get('standings')
  listStandings(
    @Query('seasonSlug') seasonSlug?: string,
    @Query('group') group?: string,
  ) {
    const filters: { seasonSlug?: string; group?: string } = {};
    if (seasonSlug) filters.seasonSlug = seasonSlug;
    if (group) filters.group = group;
    return this.footballService.listStandings(filters);
  }

  @Get('match-centre/:fixtureId')
  getMatchCentre(@Param('fixtureId') fixtureId: string) {
    return this.footballService.getMatchCentre(fixtureId);
  }

  /** Public ScoreBat widget embed config — no auth, token never exposed to client. */
  @Get('world-cup/scorebat-widget')
  getWorldCupScoreBatWidget() {
    const adapter = new ScoreBatWidgetAdapter();
    return adapter.getWidgetEmbedConfig('world-cup');
  }

  // ── Admin ──────────────────────────────────────────────────────────────────

  @Patch('admin/fixtures/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminUpdateStatus(@Param('id') id: string, @Body() dto: UpdateFixtureStatusDto) {
    return this.footballService.adminUpdateFixtureStatus(id, dto);
  }

  @Patch('admin/fixtures/:id/score')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminUpdateScore(@Param('id') id: string, @Body() dto: UpdateFixtureScoreDto) {
    return this.footballService.adminUpdateFixtureScore(id, dto);
  }

  @Post('admin/fixtures/:id/events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminCreateEvent(@Param('id') id: string, @Body() dto: AddMatchEventDto) {
    return this.liveMatchService.addMatchEvent(id, dto);
  }

  @Post('admin/fixtures/:id/lineups')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminAddLineup(@Param('id') id: string, @Body() dto: CreateLineupDto) {
    return this.footballService.adminAddLineupEntry(id, dto);
  }

  @Patch('admin/fixtures/:id/live-state')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminUpdateLiveState(@Param('id') id: string, @Body() dto: UpdateLiveStateDto) {
    return this.liveMatchService.updateFixtureLiveState(id, dto);
  }

  @Post('admin/fixtures/:id/match-events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminAddMatchEvent(@Param('id') id: string, @Body() dto: AddMatchEventDto) {
    return this.liveMatchService.addMatchEvent(id, dto);
  }

  @Patch('admin/events/:eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminUpdateMatchEvent(@Param('eventId') eventId: string, @Body() dto: UpdateMatchEventDto) {
    return this.liveMatchService.updateMatchEvent(eventId, dto);
  }

  @Delete('admin/events/:eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminDeleteMatchEvent(@Param('eventId') eventId: string) {
    return this.liveMatchService.deleteMatchEvent(eventId);
  }

  @Post('admin/fixtures/:id/player-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminUpsertPlayerStat(@Param('id') id: string, @Body() dto: UpsertPlayerStatDto) {
    return this.liveMatchService.upsertPlayerStat(id, dto);
  }

  @Post('admin/fixtures/:id/player-stats/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminBulkUpsertPlayerStats(@Param('id') id: string, @Body() dto: BulkUpsertPlayerStatsDto) {
    return this.liveMatchService.bulkUpsertPlayerStats(id, dto);
  }

  @Post('admin/fixtures/:id/player-stats/sync-provider')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminSyncProviderPlayerStats(
    @Param('id') id: string,
    @Body() dto: SyncProviderPlayerStatsDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.liveMatchService.syncProviderPlayerStats(id, dto, user.sub);
  }

  @Post('admin/fixtures/:id/recalculate-state')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminRecalculateState(@Param('id') id: string) {
    return this.liveMatchService.recalculateFixtureStateFromEvents(id);
  }

  @Post('admin/fixtures/:id/finalise')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminFinaliseFixture(@Param('id') id: string) {
    return this.liveMatchService.finaliseFixture(id);
  }

  @Post('admin/fixtures/:id/reopen')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminReopenFixture(@Param('id') id: string) {
    return this.liveMatchService.reopenFixture(id);
  }

  @Post('admin/fixtures/:id/sync-provider')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminSyncProvider(@Param('id') id: string) {
    return this.liveMatchService.syncFixtureFromProvider(id);
  }
}
