import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PlayerPosition } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TokenPayload } from '../auth/providers/auth.provider.interface';
import { FantasyService } from './fantasy.service';
import { FantasyDeadlineService } from './fantasy-deadline.service';
import { FantasyTransferService } from './fantasy-transfer.service';
import { FantasyChipService } from './fantasy-chip.service';
import { FantasyPriceService } from './fantasy-price.service';
import { FantasyScoringService } from './fantasy-scoring.service';
import { FantasyAutoSubService } from './fantasy-auto-sub.service';
import { FantasyLeagueService } from './fantasy-league.service';
import { FantasyCupService } from './fantasy-cup.service';
import { FantasyRulesConfigService, UpdateRulesDto } from './fantasy-rules-config.service';
import { FantasyGameweekScoringService } from './fantasy-gameweek-scoring.service';
import { CreateFantasyTeamDto } from './dto/create-fantasy-team.dto';
import { SaveFantasySquadDto } from './dto/save-fantasy-squad.dto';
import { UpdateFantasyTeamDto } from './dto/update-fantasy-team.dto';
import { FantasyPlayerSlotDto } from './dto/fantasy-player-slot.dto';
import { UpdatePlayerSlotDto } from './dto/update-player-slot.dto';
import { TransferDto } from './dto/transfer.dto';
import { ActivateChipDto } from './dto/activate-chip.dto';
import { CreateLeagueDto } from './dto/create-league.dto';
import { JoinLeagueDto } from './dto/join-league.dto';
import { CreatePrivateLeagueDto } from './dto/create-private-league.dto';
import { JoinByCodeDto } from './dto/join-by-code.dto';
import { JoinPublicLeagueDto } from './dto/join-public-league.dto';
import { SetPlayerPriceDto } from './dto/set-player-price.dto';
import { UpsertMatchStatDto } from './dto/upsert-match-stat.dto';
import { CreateCupDto } from './dto/create-cup.dto';
import { GenerateCupRoundDto } from './dto/generate-cup-round.dto';

@Controller('fantasy')
export class FantasyController {
  constructor(
    private readonly fantasy: FantasyService,
    private readonly deadlineService: FantasyDeadlineService,
    private readonly transferService: FantasyTransferService,
    private readonly chipService: FantasyChipService,
    private readonly priceService: FantasyPriceService,
    private readonly scoringService: FantasyScoringService,
    private readonly autoSubService: FantasyAutoSubService,
    private readonly leagueService: FantasyLeagueService,
    private readonly cupService: FantasyCupService,
    private readonly rulesConfigService: FantasyRulesConfigService,
    private readonly gwScoringService: FantasyGameweekScoringService,
  ) {}

  // ── Player pool ───────────────────────────────────────────────────────────

  @Get('player-pool')
  getPlayerPool(@Query('position') position?: string, @Query('seasonId') seasonId?: string) {
    return this.fantasy.getPlayerPool(position as PlayerPosition | undefined, seasonId);
  }

  @Get('player-pool/:fixtureId')
  getPlayerPoolForFixture(@Param('fixtureId') fixtureId: string) {
    return this.fantasy.getPlayerPoolForFixture(fixtureId);
  }

  // ── Deadline ──────────────────────────────────────────────────────────────

  @Get('deadline')
  getDeadline(@Query('seasonId') seasonId: string) {
    return this.deadlineService.getDeadline(seasonId);
  }

  @Get('gameweeks/:gameweekId/deadline')
  getGameweekDeadline(@Param('gameweekId') gameweekId: string) {
    return this.deadlineService.getGameweekDeadline(gameweekId);
  }

  @Get('gameweeks/:gameweekId/score')
  @UseGuards(JwtAuthGuard)
  getGameweekScore(
    @CurrentUser() user: TokenPayload,
    @Param('gameweekId') gameweekId: string,
  ) {
    return this.gwScoringService.getFantasyTeamGameweekScore(user.sub, gameweekId);
  }

  @Get('gameweeks/:gameweekId/players')
  @UseGuards(JwtAuthGuard)
  getGameweekPlayers(
    @CurrentUser() user: TokenPayload,
    @Param('gameweekId') gameweekId: string,
  ) {
    return this.gwScoringService.getFantasyTeamGameweekScore(user.sub, gameweekId);
  }

  // ── Transfer status ───────────────────────────────────────────────────────

  @Get('transfers/status')
  @UseGuards(JwtAuthGuard)
  getTransferStatus(@CurrentUser() user: TokenPayload) {
    return this.transferService.getTransferStatus(user.sub);
  }

  // ── Team CRUD ─────────────────────────────────────────────────────────────

  @Post('team')
  @UseGuards(JwtAuthGuard)
  createTeamAlt(@CurrentUser() user: TokenPayload, @Body() dto: CreateFantasyTeamDto) {
    return this.fantasy.createTeam(user.sub, dto);
  }

  @Get('team/me')
  @UseGuards(JwtAuthGuard)
  getMyTeam(@CurrentUser() user: TokenPayload) {
    return this.fantasy.getMyTeam(user.sub);
  }

  @Post('team/me')
  @UseGuards(JwtAuthGuard)
  createTeam(@CurrentUser() user: TokenPayload, @Body() dto: CreateFantasyTeamDto) {
    return this.fantasy.createTeam(user.sub, dto);
  }

  @Patch('team/me')
  @UseGuards(JwtAuthGuard)
  updateTeam(@CurrentUser() user: TokenPayload, @Body() dto: UpdateFantasyTeamDto) {
    return this.fantasy.updateTeamMeta(user.sub, dto);
  }

  @Put('team/me/squad')
  @UseGuards(JwtAuthGuard)
  saveCompleteSquad(@CurrentUser() user: TokenPayload, @Body() dto: SaveFantasySquadDto) {
    return this.fantasy.saveCompleteSquad(user.sub, dto);
  }

  // ── Granular player management ────────────────────────────────────────────

  @Post('team/me/players')
  @UseGuards(JwtAuthGuard)
  addPlayer(@CurrentUser() user: TokenPayload, @Body() dto: FantasyPlayerSlotDto) {
    return this.fantasy.addPlayerToSquad(user.sub, dto);
  }

  @Delete('team/me/players/:playerId')
  @UseGuards(JwtAuthGuard)
  removePlayer(@CurrentUser() user: TokenPayload, @Param('playerId') playerId: string) {
    return this.fantasy.removePlayerFromSquad(user.sub, playerId);
  }

  @Patch('team/me/players/:playerId')
  @UseGuards(JwtAuthGuard)
  updatePlayer(
    @CurrentUser() user: TokenPayload,
    @Param('playerId') playerId: string,
    @Body() dto: UpdatePlayerSlotDto,
  ) {
    return this.fantasy.updatePlayerSlot(user.sub, playerId, dto);
  }

  // ── Transfers ─────────────────────────────────────────────────────────────

  @Post('team/me/transfers')
  @UseGuards(JwtAuthGuard)
  makeTransfer(@CurrentUser() user: TokenPayload, @Body() dto: TransferDto) {
    return this.transferService.executeTransfer(user.sub, dto);
  }

  // ── Validation ────────────────────────────────────────────────────────────

  @Post('team/me/validate')
  @UseGuards(JwtAuthGuard)
  validateMySquad(@CurrentUser() user: TokenPayload) {
    return this.fantasy.validateMySquad(user.sub);
  }

  @Post('validate')
  validateSlots(@Body() body: { players: FantasyPlayerSlotDto[] }) {
    return this.fantasy.validateSlots(body.players);
  }

  // ── Chips ─────────────────────────────────────────────────────────────────

  @Get('chips')
  @UseGuards(JwtAuthGuard)
  getChips(@CurrentUser() user: TokenPayload) {
    return this.chipService.getChipsForUser(user.sub);
  }

  @Post('chips/:chipId/activate')
  @UseGuards(JwtAuthGuard)
  activateChip(
    @CurrentUser() user: TokenPayload,
    @Param('chipId') chipId: string,
    @Body() dto: ActivateChipDto,
  ) {
    return this.chipService.activateChip(user.sub, chipId, dto.gameweekId);
  }

  @Post('chips/:chipId/cancel')
  @UseGuards(JwtAuthGuard)
  cancelChip(@CurrentUser() user: TokenPayload, @Param('chipId') chipId: string) {
    return this.chipService.cancelChip(user.sub, chipId);
  }

  // ── Player prices ─────────────────────────────────────────────────────────

  @Get('player-prices')
  getPlayerPrices(@Query('seasonId') seasonId?: string) {
    return this.priceService.getPlayerPrices(seasonId);
  }

  // ── Leagues (fan) ────────────────────────────────────────────────────────

  @Get('leagues/me')
  @UseGuards(JwtAuthGuard)
  getMyLeagues(@CurrentUser() user: TokenPayload) {
    return this.leagueService.getMyLeagues(user.sub);
  }

  @Post('leagues/private')
  @UseGuards(JwtAuthGuard)
  createPrivateLeague(@CurrentUser() user: TokenPayload, @Body() dto: CreatePrivateLeagueDto) {
    return this.leagueService.createPrivateLeague(user.sub, dto.seasonId, dto.name);
  }

  @Post('leagues/join')
  @UseGuards(JwtAuthGuard)
  joinLeagueByCode(@CurrentUser() user: TokenPayload, @Body() dto: JoinByCodeDto) {
    return this.leagueService.joinLeagueByCode(user.sub, dto.inviteCode);
  }

  @Get('leagues/public')
  listPublicLeagues(@Query('seasonId') seasonId: string) {
    return this.leagueService.listPublicLeagues(seasonId);
  }

  @Post('leagues/public/join')
  @UseGuards(JwtAuthGuard)
  joinPublicLeague(@CurrentUser() user: TokenPayload, @Body() dto: JoinPublicLeagueDto) {
    return this.leagueService.joinPublicLeague(user.sub, dto.seasonId, dto.leagueId);
  }

  @Get('leagues/:leagueId')
  getLeague(@Param('leagueId') leagueId: string) {
    return this.leagueService.getLeague(leagueId);
  }

  @Get('leagues/:leagueId/standings')
  getLeagueStandings(@Param('leagueId') leagueId: string, @Query('type') type?: string) {
    if (type === 'h2h') return this.leagueService.getH2HStandings(leagueId);
    return this.leagueService.getLeagueStandings(leagueId);
  }

  @Post('leagues/:leagueId/leave')
  @UseGuards(JwtAuthGuard)
  leaveLeague(@CurrentUser() user: TokenPayload, @Param('leagueId') leagueId: string) {
    return this.leagueService.leaveLeague(user.sub, leagueId);
  }

  // ── Cups ──────────────────────────────────────────────────────────────────

  @Get('cups/me')
  @UseGuards(JwtAuthGuard)
  getMyCups(@CurrentUser() user: TokenPayload) {
    return this.cupService.getMyCups(user.sub);
  }

  @Get('cups/:id')
  getCup(@Param('id') id: string) {
    return this.cupService.getCup(id);
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  @Post('admin/settle-fixture/:fixtureId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  settleFixture(@Param('fixtureId') fixtureId: string) {
    return this.fantasy.settleFixture(fixtureId);
  }

  @Post('admin/gameweeks/:gameweekId/recalculate-deadline')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  recalculateDeadline(@Param('gameweekId') gameweekId: string) {
    return this.deadlineService.recalculateDeadline(gameweekId);
  }

  @Post('admin/gameweeks/:gameweekId/rollover-transfers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  rolloverTransfers(@Param('gameweekId') gameweekId: string) {
    return this.transferService.rolloverTransfers(gameweekId);
  }

  @Post('admin/players/:playerId/price')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  setPlayerPrice(@Param('playerId') playerId: string, @Body() dto: SetPlayerPriceDto) {
    return this.priceService.setPlayerPrice(playerId, dto.seasonId, dto.price, dto.reason);
  }

  @Post('admin/gameweeks/:gameweekId/process-auto-subs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  processAutoSubs(@Param('gameweekId') gameweekId: string) {
    return this.autoSubService.processAutoSubs(gameweekId);
  }

  @Post('admin/fixtures/:fixtureId/match-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  upsertMatchStat(@Param('fixtureId') fixtureId: string, @Body() dto: UpsertMatchStatDto) {
    return this.scoringService.upsertMatchStat(fixtureId, dto);
  }

  @Post('admin/fixtures/:fixtureId/settle-fantasy-points')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  settleFantasyPoints(@Param('fixtureId') fixtureId: string) {
    return this.scoringService.settleFixtureFromStats(fixtureId);
  }

  // ── Admin: gameweek scoring ───────────────────────────────────────────────

  @Post('admin/scoring/gameweeks/:gameweekId/settle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  settleGameweek(@Param('gameweekId') gameweekId: string) {
    return this.gwScoringService.settleGameweekFantasyScores(gameweekId);
  }

  @Post('admin/scoring/gameweeks/:gameweekId/recalculate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  recalculateGameweek(@Param('gameweekId') gameweekId: string) {
    return this.gwScoringService.settleGameweekFantasyScores(gameweekId);
  }

  @Post('admin/scoring/teams/:fantasyTeamId/gameweeks/:gameweekId/recalculate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  recalculateTeamGameweek(
    @Param('fantasyTeamId') fantasyTeamId: string,
    @Param('gameweekId') gameweekId: string,
  ) {
    return this.gwScoringService.recalculateFantasyTeamGameweek(fantasyTeamId, gameweekId);
  }

  @Get('admin/leagues')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  listLeagues(@Query('seasonId') seasonId?: string, @Query('type') type?: string) {
    return this.leagueService.listLeagues(seasonId, type as import('@prisma/client').FantasyLeagueType | undefined);
  }

  @Post('admin/leagues/global/ensure/:seasonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  ensureGlobalLeagues(@Param('seasonId') seasonId: string) {
    return this.leagueService.ensureGlobalLeaguesForSeason(seasonId);
  }

  @Get('admin/leagues/:leagueId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminGetLeague(@Param('leagueId') leagueId: string) {
    return this.leagueService.getLeague(leagueId);
  }

  @Post('admin/leagues/:leagueId/lock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  lockLeague(@Param('leagueId') leagueId: string) {
    return this.leagueService.lockLeague(leagueId);
  }

  @Post('admin/leagues/:leagueId/unlock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  unlockLeague(@Param('leagueId') leagueId: string) {
    return this.leagueService.unlockLeague(leagueId);
  }

  @Post('admin/leagues/:id/generate-head-to-head-fixtures')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  generateH2HFixtures(
    @Param('id') id: string,
    @Query('gameweekId') gameweekId: string,
  ) {
    return this.leagueService.generateH2HFixtures(id, gameweekId);
  }

  @Post('admin/leagues/:id/settle-head-to-head-gameweek/:gameweekId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  settleH2HGameweek(
    @Param('id') id: string,
    @Param('gameweekId') gameweekId: string,
  ) {
    return this.leagueService.settleH2HGameweek(id, gameweekId);
  }

  @Post('admin/cups')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  createCup(@Body() dto: CreateCupDto) {
    return this.cupService.createCup(dto);
  }

  @Post('admin/cups/:id/generate-round')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  generateCupRound(@Param('id') id: string, @Body() dto: GenerateCupRoundDto) {
    return this.cupService.generateCupRound(id, dto.gameweekId, dto.roundName, dto.teamIds);
  }

  @Post('admin/cups/:id/settle-round/:gameweekId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  settleCupRound(@Param('id') id: string, @Param('gameweekId') gameweekId: string) {
    return this.cupService.settleCupRound(id, gameweekId);
  }

  // ── Auto-substitutions (fan) ──────────────────────────────────────────────

  @Get('gameweeks/:gameweekId/auto-subs')
  @UseGuards(JwtAuthGuard)
  getAutoSubs(
    @CurrentUser() user: TokenPayload,
    @Param('gameweekId') gameweekId: string,
  ) {
    return this.autoSubService.getAutoSubsForTeamGameweek(user.sub, gameweekId);
  }

  @Get('gameweeks/:gameweekId/final-xi')
  @UseGuards(JwtAuthGuard)
  getFinalXi(
    @CurrentUser() user: TokenPayload,
    @Param('gameweekId') gameweekId: string,
  ) {
    return this.autoSubService.getFinalCountedPlayers(user.sub, gameweekId);
  }

  // ── Admin: auto-substitutions ─────────────────────────────────────────────

  @Post('admin/auto-subs/gameweeks/:gameweekId/apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  applyAutoSubsForGameweek(@Param('gameweekId') gameweekId: string) {
    return this.autoSubService.applyAutoSubsForGameweek(gameweekId);
  }

  @Post('admin/auto-subs/teams/:fantasyTeamId/gameweeks/:gameweekId/recalculate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  recalculateTeamAutoSubs(
    @Param('fantasyTeamId') fantasyTeamId: string,
    @Param('gameweekId') gameweekId: string,
  ) {
    return this.autoSubService.recalculateAutoSubsForTeamGameweek(fantasyTeamId, gameweekId);
  }

  @Get('admin/auto-subs/gameweeks/:gameweekId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  adminGetAutoSubsForGameweek(@Param('gameweekId') gameweekId: string) {
    return this.autoSubService.adminGetAutoSubsForGameweek(gameweekId);
  }

  // ── Gameweek history ─────────────────────────────────────────────────────

  @Get('history')
  @UseGuards(JwtAuthGuard)
  getGameweekHistory(@CurrentUser() user: TokenPayload) {
    return this.gwScoringService.getFantasyTeamGameweekHistory(user.sub);
  }

  @Get('history/:gameweekId')
  @UseGuards(JwtAuthGuard)
  getGameweekHistoryDetail(
    @CurrentUser() user: TokenPayload,
    @Param('gameweekId') gameweekId: string,
  ) {
    return this.gwScoringService.getFantasyTeamGameweekScore(user.sub, gameweekId);
  }

  // ── Leaderboard ───────────────────────────────────────────────────────────

  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit?: string) {
    return this.fantasy.getLeaderboard(limit ? parseInt(limit, 10) : 50);
  }

  @Get('leaderboard/gameweek/:gameweekId')
  getGameweekLeaderboard(@Param('gameweekId') gameweekId: string) {
    return this.gwScoringService.getGameweekFantasyLeaderboard(gameweekId);
  }

  @Get('leaderboard/season/:seasonId')
  getSeasonLeaderboard(@Param('seasonId') seasonId: string) {
    return this.gwScoringService.getSeasonFantasyLeaderboard(seasonId);
  }

  // ── Rules (fan read) ──────────────────────────────────────────────────────

  @Get('rules')
  getRules() {
    return this.rulesConfigService.getRulesForActiveSeason();
  }

  // ── Admin: rules config ───────────────────────────────────────────────────

  @Get('admin/rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  listRulesConfigs() {
    return this.rulesConfigService.listAllConfigs();
  }

  @Post('admin/validate-rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  validateRules(@Body() dto: UpdateRulesDto) {
    return this.rulesConfigService.validateRules(dto);
  }

  @Get('admin/rules/:seasonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  getRulesForSeason(@Param('seasonId') seasonId: string) {
    return this.rulesConfigService.getRulesForSeason(seasonId);
  }

  @Post('admin/rules/:seasonId/default')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  createDefaultRules(@Param('seasonId') seasonId: string) {
    return this.rulesConfigService.createDefaultRulesForSeason(seasonId);
  }

  @Patch('admin/rules/:seasonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  updateRules(@Param('seasonId') seasonId: string, @Body() dto: UpdateRulesDto) {
    return this.rulesConfigService.updateRulesForSeason(seasonId, dto);
  }

  @Post('admin/rules/:seasonId/reset-defaults')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PSL_ADMIN')
  resetRules(@Param('seasonId') seasonId: string) {
    return this.rulesConfigService.resetRulesToDefault(seasonId);
  }
}
