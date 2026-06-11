import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminDashboardService } from './admin-dashboard.service';
import type { PrismaService } from '../prisma/prisma.service';

const makePrismaMock = () => ({
  user: { count: vi.fn().mockResolvedValue(5) },
  fanProfile: {
    count: vi.fn().mockResolvedValue(4),
    groupBy: vi.fn().mockResolvedValue([]),
  },
  competition: {
    count: vi.fn().mockResolvedValue(1),
    findFirst: vi.fn().mockResolvedValue(null),
  },
  season: {
    count: vi.fn().mockResolvedValue(1),
    findFirst: vi.fn().mockResolvedValue(null),
  },
  fixture: {
    count: vi.fn().mockResolvedValue(10),
    groupBy: vi.fn().mockResolvedValue([]),
    findMany: vi.fn().mockResolvedValue([]),
  },
  team: { count: vi.fn().mockResolvedValue(20) },
  player: { count: vi.fn().mockResolvedValue(100) },
  venue: { count: vi.fn().mockResolvedValue(5) },
  fantasyTeam: {
    count: vi.fn().mockResolvedValue(3),
    findMany: vi.fn().mockResolvedValue([]),
    aggregate: vi.fn().mockResolvedValue({ _sum: { totalPoints: 0 } }),
  },
  scorePrediction: {
    count: vi.fn().mockResolvedValue(7),
    groupBy: vi.fn().mockResolvedValue([]),
    findMany: vi.fn().mockResolvedValue([]),
  },
  peerChallenge: {
    count: vi.fn().mockResolvedValue(2),
    groupBy: vi.fn().mockResolvedValue([]),
    aggregate: vi.fn().mockResolvedValue({ _sum: { pointsAwardedChallenger: 0, pointsAwardedOpponent: 0 } }),
  },
  fanValueLedger: {
    aggregate: vi.fn().mockResolvedValue({ _sum: { points: 100 }, _count: { id: 5 } }),
    groupBy: vi.fn().mockResolvedValue([]),
    findMany: vi.fn().mockResolvedValue([]),
  },
  fanAchievement: {
    count: vi.fn().mockResolvedValue(8),
    findMany: vi.fn().mockResolvedValue([]),
    groupBy: vi.fn().mockResolvedValue([]),
  },
  fanBadge: { count: vi.fn().mockResolvedValue(3) },
  achievementDefinition: { count: vi.fn().mockResolvedValue(17) },
  badgeDefinition: { count: vi.fn().mockResolvedValue(17) },
  rewardReadinessDefinition: { count: vi.fn().mockResolvedValue(6) },
  fanRewardReadiness: {
    count: vi.fn().mockResolvedValue(2),
    groupBy: vi.fn().mockResolvedValue([]),
  },
  notification: {
    count: vi.fn().mockResolvedValue(5),
    groupBy: vi.fn().mockResolvedValue([]),
  },
  notificationDeliveryLog: {
    count: vi.fn().mockResolvedValue(0),
  },
  activityFeedItem: {
    count: vi.fn().mockResolvedValue(3),
    groupBy: vi.fn().mockResolvedValue([]),
    findMany: vi.fn().mockResolvedValue([]),
  },
  activityReaction: {
    count: vi.fn().mockResolvedValue(0),
    groupBy: vi.fn().mockResolvedValue([]),
  },
  gameweek: { groupBy: vi.fn().mockResolvedValue([]) },
  fantasyTransfer: {
    count: vi.fn().mockResolvedValue(0),
    aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { transferCost: 0 } }),
  },
  fantasyChip: {
    groupBy: vi.fn().mockResolvedValue([]),
  },
  fantasyLeague: { count: vi.fn().mockResolvedValue(1) },
  fantasyLeagueMember: { count: vi.fn().mockResolvedValue(3) },
  fantasyGameweekScore: {
    aggregate: vi.fn().mockResolvedValue({ _sum: { netPoints: 0, captainPoints: 0 }, _count: { id: 0 } }),
    findMany: vi.fn().mockResolvedValue([]),
  },
  fantasyAutoSubstitution: { count: vi.fn().mockResolvedValue(0) },
  fantasyRulesConfig: { findFirst: vi.fn().mockResolvedValue(null) },
  competitionImportJob: { findMany: vi.fn().mockResolvedValue([]) },
  consentRecord: {
    count: vi.fn().mockResolvedValue(3),
    groupBy: vi.fn().mockResolvedValue([]),
  },
  authAuditLog: { count: vi.fn().mockResolvedValue(10) },
  passwordResetToken: { count: vi.fn().mockResolvedValue(0) },
  predictionPointsLedger: {
    aggregate: vi.fn().mockResolvedValue({ _sum: { points: 0 } }),
    groupBy: vi.fn().mockResolvedValue([]),
  },
  matchEvent: { count: vi.fn().mockResolvedValue(0) },
});

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(() => {
    prisma = makePrismaMock();
    service = new AdminDashboardService(prisma as unknown as PrismaService);
  });

  // ── Core ───────────────────────────────────────────────────────────────────

  describe('getPlatformHealth', () => {
    it('returns LOCAL_POSTGRESQL database', () => {
      const h = service.getPlatformHealth();
      expect(h.database).toBe('LOCAL_POSTGRESQL');
    });

    it('returns awsTouched false', () => {
      expect(service.getPlatformHealth().awsTouched).toBe(false);
    });

    it('returns terraformTouched false', () => {
      expect(service.getPlatformHealth().terraformTouched).toBe(false);
    });

    it('returns paymentsProvider NOT_ENABLED', () => {
      expect(service.getPlatformHealth().paymentsProvider).toBe('NOT_ENABLED');
    });

    it('returns sponsorMarketplace NOT_ENABLED', () => {
      expect(service.getPlatformHealth().sponsorMarketplace).toBe('NOT_ENABLED');
    });
  });

  describe('getOverview', () => {
    it('returns core entity counts', async () => {
      const result = await service.getOverview();
      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('fans');
      expect(result).toHaveProperty('competitions');
      expect(result).toHaveProperty('fixtures');
      expect(result).toHaveProperty('fantasyTeams');
      expect(result).toHaveProperty('guessTheScorePredictions');
      expect(result).toHaveProperty('peerChallenges');
    });

    it('does not expose passwords or auth secrets', async () => {
      const result = await service.getOverview() as Record<string, unknown>;
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('tokenHash');
    });
  });

  describe('getActionRequired', () => {
    it('returns an array', async () => {
      const result = await service.getActionRequired();
      expect(Array.isArray(result)).toBe(true);
    });

    it('includes domain and message fields when items returned', async () => {
      prisma.scorePrediction.count.mockResolvedValue(3);
      prisma.fixture.count.mockResolvedValue(2);
      const result = await service.getActionRequired();
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('domain');
        expect(result[0]).toHaveProperty('message');
        expect(result[0]).toHaveProperty('severity');
      }
    });
  });

  describe('getFullDashboard', () => {
    it('returns generatedAt, overview, health, sections, recentEvents, quickLinks', async () => {
      const result = await service.getFullDashboard();
      expect(result).toHaveProperty('generatedAt');
      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('health');
      expect(result).toHaveProperty('sections');
      expect(result).toHaveProperty('recentEvents');
      expect(result).toHaveProperty('quickLinks');
    });

    it('sections includes all required command centre keys', async () => {
      const result = await service.getFullDashboard();
      const s = result.sections as Record<string, unknown>;
      expect(s).toHaveProperty('guessTheScore');
      expect(s).toHaveProperty('fantasyRules');
      expect(s).toHaveProperty('fantasyLeague');
      expect(s).toHaveProperty('leagueManagement');
      expect(s).toHaveProperty('fixtureManagement');
      expect(s).toHaveProperty('sponsorManagement');
      expect(s).toHaveProperty('contentModeration');
      expect(s).toHaveProperty('reporting');
      expect(s).toHaveProperty('compliance');
      expect(s).toHaveProperty('userAudience');
      expect(s).toHaveProperty('systemOperations');
      expect(s).toHaveProperty('football');
      expect(s).toHaveProperty('fans');
      expect(s).toHaveProperty('fantasy');
    });

    it('does not include sensitive fields', async () => {
      const result = await service.getFullDashboard();
      const json = JSON.stringify(result);
      expect(json).not.toContain('passwordHash');
      expect(json).not.toContain('tokenHash');
      expect(json).not.toContain('"password"');
    });
  });

  // ── Guess the Score ─────────────────────────────────────────────────────

  describe('getGuessTheScoreManagementSummary', () => {
    it('label is exactly "Guess the Score"', async () => {
      const result = await service.getGuessTheScoreManagementSummary();
      expect(result.label).toBe('Guess the Score');
    });

    it('returns totalPredictions', async () => {
      const result = await service.getGuessTheScoreManagementSummary();
      expect(result).toHaveProperty('totalPredictions');
    });

    it('returns peerChallenges object', async () => {
      const result = await service.getGuessTheScoreManagementSummary();
      expect(result).toHaveProperty('peerChallenges');
      expect(result.peerChallenges).toHaveProperty('total');
      expect(result.peerChallenges).toHaveProperty('active');
      expect(result.peerChallenges).toHaveProperty('settled');
    });

    it('returns accuracy object', async () => {
      const result = await service.getGuessTheScoreManagementSummary();
      expect(result.accuracy).toHaveProperty('exactScoreRate');
      expect(result.accuracy).toHaveProperty('resultAccuracyRate');
    });

    it('returns topUsersByPredictionPoints', async () => {
      const result = await service.getGuessTheScoreManagementSummary();
      expect(Array.isArray(result.topUsersByPredictionPoints)).toBe(true);
    });

    it('returns pendingSettlementFixtures', async () => {
      const result = await service.getGuessTheScoreManagementSummary();
      expect(Array.isArray(result.pendingSettlementFixtures)).toBe(true);
    });

    it('exportReady is true', async () => {
      const result = await service.getGuessTheScoreManagementSummary();
      expect(result.exportReady).toBe(true);
    });
  });

  // ── Fantasy Rules ─────────────────────────────────────────────────────────

  describe('getFantasyRulesManagementSummary', () => {
    it('label is exactly "Fantasy Rules"', async () => {
      const result = await service.getFantasyRulesManagementSummary();
      expect(result.label).toBe('Fantasy Rules');
    });

    it('returns rulesStatus NOT_CONFIGURED when no config', async () => {
      const result = await service.getFantasyRulesManagementSummary();
      expect(result.rulesStatus).toBe('NOT_CONFIGURED');
    });

    it('returns rulesStatus ACTIVE when config present', async () => {
      prisma.fantasyRulesConfig.findFirst.mockResolvedValue({
        id: 'cfg-1', seasonId: 's-1',
        freeTransfersPerGameweek: 1, maxSavedFreeTransfers: 5,
        extraTransferCost: 4, maxTransfersPerGameweek: 20,
        squadSize: 15, startingXiSize: 11, benchSize: 4,
        chipsEnabled: true, wildcardCount: 2, wildcardEnabled: true,
        freeHitCount: 2, freeHitEnabled: true,
        benchBoostCount: 2, benchBoostEnabled: true,
        tripleCaptainCount: 2, tripleCaptainEnabled: true,
        deadlineOffsetMinutes: 90,
        minStartingGoalkeepers: 1, maxStartingGoalkeepers: 1,
        minStartingDefenders: 3, minStartingMidfielders: 2, minStartingForwards: 1,
      });
      const result = await service.getFantasyRulesManagementSummary();
      expect(result.rulesStatus).toBe('ACTIVE');
    });

    it('returns transferRules', async () => {
      const result = await service.getFantasyRulesManagementSummary();
      expect(result).toHaveProperty('transferRules');
    });

    it('exportReady is true', async () => {
      const result = await service.getFantasyRulesManagementSummary();
      expect(result.exportReady).toBe(true);
    });
  });

  // ── Fantasy League ─────────────────────────────────────────────────────────

  describe('getFantasyLeagueManagementSummary', () => {
    it('label is exactly "Fantasy League"', async () => {
      const result = await service.getFantasyLeagueManagementSummary();
      expect(result.label).toBe('Fantasy League');
    });

    it('returns totalFantasyTeams', async () => {
      const result = await service.getFantasyLeagueManagementSummary();
      expect(result).toHaveProperty('totalFantasyTeams');
    });

    it('returns gameweeks object', async () => {
      const result = await service.getFantasyLeagueManagementSummary();
      expect(result.gameweeks).toHaveProperty('total');
      expect(result.gameweeks).toHaveProperty('open');
      expect(result.gameweeks).toHaveProperty('settled');
    });

    it('returns autoSubstitutions totals', async () => {
      const result = await service.getFantasyLeagueManagementSummary();
      expect(result.autoSubstitutions).toHaveProperty('total');
      expect(result.autoSubstitutions).toHaveProperty('successful');
      expect(result.autoSubstitutions).toHaveProperty('failed');
    });

    it('returns leagues object with type counts', async () => {
      const result = await service.getFantasyLeagueManagementSummary();
      expect(result.leagues).toHaveProperty('public');
      expect(result.leagues).toHaveProperty('private');
    });

    it('exportReady is true', async () => {
      const result = await service.getFantasyLeagueManagementSummary();
      expect(result.exportReady).toBe(true);
    });
  });

  // ── Management Sections ────────────────────────────────────────────────────

  describe('getLeagueManagementSummary', () => {
    it('returns competitions and seasons', async () => {
      const result = await service.getLeagueManagementSummary();
      expect(result.competitions).toHaveProperty('total');
      expect(result.seasons).toHaveProperty('total');
    });

    it('returns multiLeagueReadiness enabled', async () => {
      const result = await service.getLeagueManagementSummary();
      expect(result.multiLeagueReadiness.enabled).toBe(true);
    });
  });

  describe('getFixtureManagementSummary', () => {
    it('returns fixture counts by status', async () => {
      const result = await service.getFixtureManagementSummary();
      expect(result.fixtures).toHaveProperty('total');
      expect(result.fixtures).toHaveProperty('byStatus');
    });

    it('returns crossDomainImpact', async () => {
      const result = await service.getFixtureManagementSummary();
      expect(result.crossDomainImpact).toHaveProperty('predictionsAffected');
      expect(result.crossDomainImpact).toHaveProperty('fantasyTeamsAffected');
    });
  });

  describe('getSponsorManagementSummary', () => {
    it('marketplaceStatus is NOT_ENABLED', async () => {
      const result = await service.getSponsorManagementSummary();
      expect(result.marketplaceStatus).toBe('NOT_ENABLED');
    });

    it('fulfilmentStatus is NOT_ENABLED', async () => {
      const result = await service.getSponsorManagementSummary();
      expect(result.fulfilmentStatus).toBe('NOT_ENABLED');
    });

    it('returns betwayTitleSponsorReadiness', async () => {
      const result = await service.getSponsorManagementSummary();
      expect(result.betwayTitleSponsorReadiness).toBeDefined();
    });
  });

  describe('getContentModerationSummary', () => {
    it('returns activityItems with total/active/hidden/archived', async () => {
      const result = await service.getContentModerationSummary();
      expect(result.activityItems).toHaveProperty('total');
      expect(result.activityItems).toHaveProperty('active');
      expect(result.activityItems).toHaveProperty('hidden');
      expect(result.activityItems).toHaveProperty('archived');
    });

    it('commentsModeration is NOT_ENABLED', async () => {
      const result = await service.getContentModerationSummary();
      expect(result.commentsModeration).toBe('NOT_ENABLED');
    });

    it('mediaModeration is NOT_ENABLED', async () => {
      const result = await service.getContentModerationSummary();
      expect(result.mediaModeration).toBe('NOT_ENABLED');
    });
  });

  describe('getReportingSummary', () => {
    it('returns exportableDomains array including guess-the-score', async () => {
      const result = await service.getReportingSummary();
      expect(Array.isArray(result.exportableDomains)).toBe(true);
      expect(result.exportableDomains).toContain('guess-the-score');
      expect(result.exportableDomains).toContain('fantasy-league');
    });

    it('scheduledReports.enabled is false', async () => {
      const result = await service.getReportingSummary();
      expect(result.scheduledReports.enabled).toBe(false);
    });
  });

  describe('getComplianceSummary', () => {
    it('nonFinancialCompliance fields are all false', async () => {
      const result = await service.getComplianceSummary();
      expect(result.nonFinancialCompliance.gamblingMechanicsEnabled).toBe(false);
      expect(result.nonFinancialCompliance.realMoneyWalletEnabled).toBe(false);
      expect(result.nonFinancialCompliance.externalPaymentsEnabled).toBe(false);
      expect(result.nonFinancialCompliance.rewardRedemptionEnabled).toBe(false);
    });

    it('returns consentRecordsCount', async () => {
      const result = await service.getComplianceSummary();
      expect(result).toHaveProperty('consentRecordsCount');
    });

    it('does not expose raw auth records or tokens', async () => {
      const result = await service.getComplianceSummary() as Record<string, unknown>;
      expect(result).not.toHaveProperty('passwordHashes');
      expect(result).not.toHaveProperty('resetTokens');
    });
  });

  describe('getUserAudienceSummary', () => {
    it('returns engagementSegments', async () => {
      const result = await service.getUserAudienceSummary();
      expect(result.engagementSegments).toHaveProperty('fantasyParticipants');
      expect(result.engagementSegments).toHaveProperty('guessTheScoreParticipants');
    });

    it('returns profileCompletion', async () => {
      const result = await service.getUserAudienceSummary();
      expect(result.profileCompletion).toHaveProperty('withDisplayName');
    });
  });

  describe('getSystemOperationsSummary', () => {
    it('awsTouched is false', async () => {
      const result = await service.getSystemOperationsSummary();
      expect(result.awsTouched).toBe(false);
    });

    it('terraformTouched is false', async () => {
      const result = await service.getSystemOperationsSummary();
      expect(result.terraformTouched).toBe(false);
    });

    it('payments and push notifications NOT_ENABLED', async () => {
      const result = await service.getSystemOperationsSummary();
      expect(result.providerIntegrations.payments).toBe('NOT_ENABLED');
      expect(result.providerIntegrations.pushNotifications).toBe('NOT_ENABLED');
    });
  });

  // ── RBAC check (controller-level, tested via service mock)─────────────────

  describe('getQuickLinks', () => {
    it('returns an array of quick links', () => {
      const result = service.getQuickLinks();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('label');
      expect(result[0]).toHaveProperty('href');
    });
  });

  // ── Existing domain summaries ──────────────────────────────────────────────

  describe('getFootballSummary', () => {
    it('returns competitions, seasons, teams, players, fixtures, venues', async () => {
      const result = await service.getFootballSummary();
      expect(result).toHaveProperty('competitions');
      expect(result).toHaveProperty('teams');
      expect(result).toHaveProperty('fixtures');
    });
  });

  describe('getFanSummary', () => {
    it('returns users and fanProfiles', async () => {
      const result = await service.getFanSummary();
      expect(result).toHaveProperty('users');
      expect(result).toHaveProperty('fanProfiles');
    });
  });

  describe('getAchievementsSummary', () => {
    it('returns definitions, badges, unlocked', async () => {
      const result = await service.getAchievementsSummary();
      expect(result).toHaveProperty('definitions');
      expect(result).toHaveProperty('badges');
      expect(result).toHaveProperty('unlocked');
    });
  });

  describe('getNotificationsSummary', () => {
    it('returns total and failedDeliveries', async () => {
      const result = await service.getNotificationsSummary();
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('failedDeliveries');
    });
  });

  describe('getActivitySummary', () => {
    it('returns total with byStatus', async () => {
      const result = await service.getActivitySummary();
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('byStatus');
    });
  });
});
