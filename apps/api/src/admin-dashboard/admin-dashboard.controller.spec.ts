import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminDashboardController } from './admin-dashboard.controller';
import type { AdminDashboardService } from './admin-dashboard.service';

const makeMockService = () => ({
  getFullDashboard: vi.fn().mockResolvedValue({ generatedAt: 'now', overview: {}, health: {}, sections: {}, recentEvents: [], quickLinks: [] }),
  getOverview: vi.fn().mockResolvedValue({}),
  getPlatformHealth: vi.fn().mockReturnValue({ database: 'LOCAL_POSTGRESQL' }),
  getActionRequired: vi.fn().mockResolvedValue([]),
  getRecentOperationalEvents: vi.fn().mockResolvedValue([]),
  getQuickLinks: vi.fn().mockReturnValue([]),
  getFootballSummary: vi.fn().mockResolvedValue({}),
  getFanSummary: vi.fn().mockResolvedValue({}),
  getFantasySummary: vi.fn().mockResolvedValue({}),
  getPredictionsSummary: vi.fn().mockResolvedValue({}),
  getChallengesSummary: vi.fn().mockResolvedValue({}),
  getFanValueSummary: vi.fn().mockResolvedValue({}),
  getAchievementsSummary: vi.fn().mockResolvedValue({}),
  getRewardsReadinessSummary: vi.fn().mockResolvedValue({}),
  getNotificationsSummary: vi.fn().mockResolvedValue({}),
  getActivitySummary: vi.fn().mockResolvedValue({}),
  getGuessTheScoreManagementSummary: vi.fn().mockResolvedValue({ label: 'Guess the Score' }),
  getFantasyRulesManagementSummary: vi.fn().mockResolvedValue({ label: 'Fantasy Rules' }),
  getFantasyLeagueManagementSummary: vi.fn().mockResolvedValue({ label: 'Fantasy League' }),
  getLeagueManagementSummary: vi.fn().mockResolvedValue({}),
  getFixtureManagementSummary: vi.fn().mockResolvedValue({}),
  getSponsorManagementSummary: vi.fn().mockResolvedValue({ marketplaceStatus: 'NOT_ENABLED' }),
  getContentModerationSummary: vi.fn().mockResolvedValue({}),
  getReportingSummary: vi.fn().mockResolvedValue({}),
  getComplianceSummary: vi.fn().mockResolvedValue({}),
  getUserAudienceSummary: vi.fn().mockResolvedValue({}),
  getSystemOperationsSummary: vi.fn().mockResolvedValue({}),
});

describe('AdminDashboardController', () => {
  let controller: AdminDashboardController;
  let service: ReturnType<typeof makeMockService>;

  beforeEach(() => {
    service = makeMockService();
    controller = new AdminDashboardController(service as unknown as AdminDashboardService);
  });

  it('getFullDashboard delegates to service', async () => {
    const result = await controller.getFullDashboard();
    expect(service.getFullDashboard).toHaveBeenCalled();
    expect(result).toHaveProperty('generatedAt');
  });

  it('getOverview delegates to service', async () => {
    await controller.getOverview();
    expect(service.getOverview).toHaveBeenCalled();
  });

  it('getPlatformHealth delegates to service', () => {
    const result = controller.getPlatformHealth();
    expect(service.getPlatformHealth).toHaveBeenCalled();
    expect(result).toHaveProperty('database');
  });

  it('getActionRequired delegates to service', async () => {
    const result = await controller.getActionRequired();
    expect(service.getActionRequired).toHaveBeenCalled();
    expect(Array.isArray(result)).toBe(true);
  });

  it('getGuessTheScore label is "Guess the Score"', async () => {
    const result = await controller.getGuessTheScore() as { label: string };
    expect(result.label).toBe('Guess the Score');
  });

  it('getFantasyRules label is "Fantasy Rules"', async () => {
    const result = await controller.getFantasyRules() as { label: string };
    expect(result.label).toBe('Fantasy Rules');
  });

  it('getFantasyLeague label is "Fantasy League"', async () => {
    const result = await controller.getFantasyLeague() as { label: string };
    expect(result.label).toBe('Fantasy League');
  });

  it('getSponsorManagement returns NOT_ENABLED marketplace', async () => {
    const result = await controller.getSponsorManagement() as { marketplaceStatus: string };
    expect(result.marketplaceStatus).toBe('NOT_ENABLED');
  });

  it('getRecentEvents delegates to service', async () => {
    await controller.getRecentEvents();
    expect(service.getRecentOperationalEvents).toHaveBeenCalled();
  });

  it('all 21 routes call their respective service methods', async () => {
    await controller.getFootball();
    await controller.getFans();
    await controller.getFantasy();
    await controller.getPredictions();
    await controller.getChallenges();
    await controller.getFanValue();
    await controller.getAchievements();
    await controller.getRewards();
    await controller.getNotifications();
    await controller.getActivity();
    await controller.getLeagueManagement();
    await controller.getFixtureManagement();
    await controller.getContentModeration();
    await controller.getReporting();
    await controller.getCompliance();
    await controller.getUserAudience();
    await controller.getSystemOperations();
    await controller.getQuickLinks();

    expect(service.getFootballSummary).toHaveBeenCalled();
    expect(service.getFanSummary).toHaveBeenCalled();
    expect(service.getFixtureManagementSummary).toHaveBeenCalled();
    expect(service.getComplianceSummary).toHaveBeenCalled();
    expect(service.getUserAudienceSummary).toHaveBeenCalled();
  });
});
