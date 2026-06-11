import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ClubAdminService } from './club-admin.service';
import { ClubExperienceService } from './club-experience.service';
import { AssignPlayerDto } from './dto/assign-player.dto';
import { CreateSeasonTeamDto } from './dto/create-season-team.dto';
import {
  UpdateFixtureAssignmentStatusDto,
  UpdateFixtureGameweekDto,
  UpdateFixtureTeamsDto,
  UpdateFixtureVenueDto,
} from './dto/update-fixture-assignment.dto';
import { UpdatePlayerAssignmentDto } from './dto/update-player-assignment.dto';
import { UpdateSeasonTeamDto } from './dto/update-season-team.dto';

// IMPORTANT: All static admin routes must be declared BEFORE any /:slug routes
// to prevent NestJS route capture of "admin" as a slug param.

@Controller('clubs')
export class ClubExperienceController {
  constructor(
    private readonly fanService: ClubExperienceService,
    private readonly adminService: ClubAdminService,
  ) {}

  // ── Fan: list (no dynamic param) ──────────────────────────────────────────

  @Get()
  getClubs(@Query('season') season?: string) {
    return this.fanService.getClubs(season);
  }

  // ── Admin: static routes (all declared before any :slug route) ────────────

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getAdminClubList() {
    return this.adminService.getAdminClubList();
  }

  @Get('admin/readiness')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getClubReadiness() {
    return this.adminService.getClubReadiness();
  }

  @Get('admin/fixtures/unassigned')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getUnassignedFixtures() {
    return this.adminService.getUnassignedFixtures();
  }

  @Get('admin/players/unassigned')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getUnassignedPlayers(@Query('seasonId') seasonId?: string) {
    return this.adminService.getUnassignedPlayers(seasonId);
  }

  // ── Admin: fixture assignment (static prefix, no team id ambiguity) ───────

  @Patch('admin/fixtures/:fixtureId/teams')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  assignFixtureTeams(
    @Param('fixtureId') fixtureId: string,
    @Body() dto: UpdateFixtureTeamsDto,
  ) {
    return this.adminService.assignFixtureTeams(fixtureId, dto);
  }

  @Patch('admin/fixtures/:fixtureId/venue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  assignFixtureVenue(
    @Param('fixtureId') fixtureId: string,
    @Body() dto: UpdateFixtureVenueDto,
  ) {
    return this.adminService.assignFixtureVenue(fixtureId, dto);
  }

  @Patch('admin/fixtures/:fixtureId/gameweek')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  assignFixtureGameweek(
    @Param('fixtureId') fixtureId: string,
    @Body() dto: UpdateFixtureGameweekDto,
  ) {
    return this.adminService.assignFixtureGameweek(fixtureId, dto);
  }

  @Patch('admin/fixtures/:fixtureId/assignment-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  updateFixtureAssignmentStatus(
    @Param('fixtureId') fixtureId: string,
    @Body() dto: UpdateFixtureAssignmentStatusDto,
  ) {
    return this.adminService.updateFixtureAssignmentStatus(fixtureId, dto);
  }

  // ── Admin: season team management ─────────────────────────────────────────

  @Get('admin/seasons/:seasonId/teams')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getSeasonTeams(@Param('seasonId') seasonId: string) {
    return this.adminService.getSeasonTeams(seasonId);
  }

  @Post('admin/seasons/:seasonId/teams')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  addTeamToSeason(@Param('seasonId') seasonId: string, @Body() dto: CreateSeasonTeamDto) {
    return this.adminService.addTeamToSeason(seasonId, dto);
  }

  @Patch('admin/seasons/:seasonId/teams/:teamId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  updateSeasonTeamStatus(
    @Param('seasonId') seasonId: string,
    @Param('teamId') teamId: string,
    @Body() dto: UpdateSeasonTeamDto,
  ) {
    return this.adminService.updateSeasonTeamStatus(seasonId, teamId, dto);
  }

  @Delete('admin/seasons/:seasonId/teams/:teamId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  removeTeamFromSeason(
    @Param('seasonId') seasonId: string,
    @Param('teamId') teamId: string,
  ) {
    return this.adminService.removeTeamFromSeason(seasonId, teamId);
  }

  @Get('admin/seasons/:seasonId/validate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  validateSeasonParticipation(@Param('seasonId') seasonId: string) {
    return this.adminService.validateSeasonParticipation(seasonId);
  }

  @Get('admin/seasons/:seasonId/fixtures/validate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  validateFixtureReadiness(@Param('seasonId') seasonId: string) {
    return this.adminService.validateFixtureReadiness(seasonId);
  }

  // ── Admin: club detail + experience (static :id sub-paths) ───────────────

  @Get('admin/:id/experience')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getAdminClubExperience(@Param('id') id: string) {
    return this.adminService.getAdminClubExperience(id);
  }

  @Get('admin/:id/players')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getClubPlayers(@Param('id') id: string) {
    return this.adminService.getClubPlayers(id);
  }

  @Get('admin/:id/shop/readiness')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getAdminClubShopReadiness(@Param('id') id: string) {
    return this.adminService.getAdminClubShopReadiness(id);
  }

  @Get('admin/:id/fixtures')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getClubFixturesForAdmin(@Param('id') id: string) {
    return this.adminService.getClubFixturesForAdmin(id);
  }

  @Post('admin/:id/validate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  validateClubDataQuality(@Param('id') id: string) {
    return this.adminService.validateClubDataQuality(id);
  }

  // ── Admin: player assignment ───────────────────────────────────────────────

  @Post('admin/:id/seasons/:seasonId/players')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  assignPlayerToClub(
    @Param('id') teamId: string,
    @Param('seasonId') seasonId: string,
    @Body() dto: AssignPlayerDto,
  ) {
    return this.adminService.assignPlayerToClub(teamId, seasonId, dto);
  }

  @Patch('admin/:id/seasons/:seasonId/players/:playerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  updatePlayerAssignment(
    @Param('id') teamId: string,
    @Param('seasonId') seasonId: string,
    @Param('playerId') playerId: string,
    @Body() dto: UpdatePlayerAssignmentDto,
  ) {
    return this.adminService.updatePlayerAssignment(teamId, seasonId, playerId, dto);
  }

  @Delete('admin/:id/seasons/:seasonId/players/:playerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  removePlayerFromClub(
    @Param('id') teamId: string,
    @Param('seasonId') seasonId: string,
    @Param('playerId') playerId: string,
  ) {
    return this.adminService.removePlayerFromClub(teamId, seasonId, playerId);
  }

  @Post('admin/:id/seasons/:seasonId/players/:playerId/move')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  @HttpCode(HttpStatus.OK)
  movePlayerToClub(
    @Param('id') fromTeamId: string,
    @Param('seasonId') seasonId: string,
    @Param('playerId') playerId: string,
    @Body('toTeamId') toTeamId: string,
  ) {
    return this.adminService.movePlayerToClub(playerId, fromTeamId, toTeamId, seasonId);
  }

  @Get('admin/:id/seasons/:seasonId/squad/validate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  validateSquadCompleteness(
    @Param('id') teamId: string,
    @Param('seasonId') seasonId: string,
  ) {
    return this.adminService.validateSquadCompleteness(teamId, seasonId);
  }

  // ── Admin: club detail (bare :id — AFTER all sub-path routes) ────────────

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getAdminClubDetail(@Param('id') id: string) {
    return this.adminService.getAdminClubDetail(id);
  }

  // ── Fan: club detail routes — ALL after admin static routes ──────────────

  @Get(':slug/overview')
  getClubOverview(@Param('slug') slug: string) {
    return this.fanService.getClubOverview(slug);
  }

  @Get(':slug/fixtures')
  getClubFixtures(@Param('slug') slug: string) {
    return this.fanService.getClubFixtures(slug);
  }

  @Get(':slug/results')
  getClubResults(@Param('slug') slug: string) {
    return this.fanService.getClubResults(slug);
  }

  @Get(':slug/squad')
  getClubSquad(@Param('slug') slug: string) {
    return this.fanService.getClubSquad(slug);
  }

  @Get(':slug/stats')
  getClubStats(@Param('slug') slug: string) {
    return this.fanService.getClubStats(slug);
  }

  @Get(':slug/stadium')
  getClubStadium(@Param('slug') slug: string) {
    return this.fanService.getClubStadium(slug);
  }

  @Get(':slug/tickets')
  getClubTickets(@Param('slug') slug: string) {
    return this.fanService.getClubTickets(slug);
  }

  @Get(':slug/shop/:productSlug')
  getClubShopProduct(@Param('slug') slug: string, @Param('productSlug') productSlug: string) {
    return this.fanService.getClubShopProduct(slug, productSlug);
  }

  @Get(':slug/shop')
  getClubShop(@Param('slug') slug: string) {
    return this.fanService.getClubShop(slug);
  }

  // ── Fan: bare slug — MUST be last to avoid capturing static paths ─────────

  @Get(':slug')
  getClubBySlug(@Param('slug') slug: string) {
    return this.fanService.getClubBySlug(slug);
  }
}
