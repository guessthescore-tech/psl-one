import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminDashboardService } from './admin-dashboard.service';

@Controller('admin-dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
export class AdminDashboardController {
  constructor(private readonly service: AdminDashboardService) {}

  // ── Main ───────────────────────────────────────────────────────────────────

  @Get()
  getFullDashboard() {
    return this.service.getFullDashboard();
  }

  @Get('overview')
  getOverview() {
    return this.service.getOverview();
  }

  @Get('health')
  getPlatformHealth() {
    return this.service.getPlatformHealth();
  }

  @Get('action-required')
  getActionRequired() {
    return this.service.getActionRequired();
  }

  @Get('recent-events')
  getRecentEvents() {
    return this.service.getRecentOperationalEvents();
  }

  @Get('quick-links')
  getQuickLinks() {
    return this.service.getQuickLinks();
  }

  // ── Existing Domain Summaries ──────────────────────────────────────────────

  @Get('football')
  getFootball() {
    return this.service.getFootballSummary();
  }

  @Get('fans')
  getFans() {
    return this.service.getFanSummary();
  }

  @Get('fantasy')
  getFantasy() {
    return this.service.getFantasySummary();
  }

  @Get('predictions')
  getPredictions() {
    return this.service.getPredictionsSummary();
  }

  @Get('challenges')
  getChallenges() {
    return this.service.getChallengesSummary();
  }

  @Get('fan-value')
  getFanValue() {
    return this.service.getFanValueSummary();
  }

  @Get('achievements')
  getAchievements() {
    return this.service.getAchievementsSummary();
  }

  @Get('rewards')
  getRewards() {
    return this.service.getRewardsReadinessSummary();
  }

  @Get('notifications')
  getNotifications() {
    return this.service.getNotificationsSummary();
  }

  @Get('activity')
  getActivity() {
    return this.service.getActivitySummary();
  }

  // ── Command Centre Sections ────────────────────────────────────────────────

  @Get('guess-the-score')
  getGuessTheScore() {
    return this.service.getGuessTheScoreManagementSummary();
  }

  @Get('fantasy-rules')
  getFantasyRules() {
    return this.service.getFantasyRulesManagementSummary();
  }

  @Get('fantasy-league')
  getFantasyLeague() {
    return this.service.getFantasyLeagueManagementSummary();
  }

  @Get('league-management')
  getLeagueManagement() {
    return this.service.getLeagueManagementSummary();
  }

  @Get('fixture-management')
  getFixtureManagement() {
    return this.service.getFixtureManagementSummary();
  }

  @Get('sponsor-management')
  getSponsorManagement() {
    return this.service.getSponsorManagementSummary();
  }

  @Get('content-moderation')
  getContentModeration() {
    return this.service.getContentModerationSummary();
  }

  @Get('reporting')
  getReporting() {
    return this.service.getReportingSummary();
  }

  @Get('compliance')
  getCompliance() {
    return this.service.getComplianceSummary();
  }

  @Get('user-audience')
  getUserAudience() {
    return this.service.getUserAudienceSummary();
  }

  @Get('system-operations')
  getSystemOperations() {
    return this.service.getSystemOperationsSummary();
  }
}
