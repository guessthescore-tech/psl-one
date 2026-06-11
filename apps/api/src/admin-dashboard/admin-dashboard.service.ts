import { Injectable } from '@nestjs/common';
import {
  ActivityStatus,
  ActivityVisibility,
  ChallengeStatus,
  FantasyAutoSubstitutionStatus,
  FantasyChipStatus,
  FantasyLeagueType,
  FixtureStatus,
  GameweekStatus,
  NotificationDeliveryStatus,
  NotificationStatus,
  PredictionStatus,
  RewardReadinessStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const QUICK_LINKS_MAIN = [
  { label: 'Guess the Score', href: '/admin/predictions' },
  { label: 'Peer Challenges', href: '/admin/challenges', status: 'PLANNED_IF_ROUTE_MISSING' },
  { label: 'Fantasy Rules', href: '/admin/fantasy/rules' },
  { label: 'Fantasy Leagues', href: '/admin/fantasy/leagues' },
  { label: 'Fixtures', href: '/admin/fixtures' },
  { label: 'Gameweeks', href: '/admin/gameweeks' },
  { label: 'Competitions', href: '/admin/competitions' },
  { label: 'Imports', href: '/admin/imports' },
  { label: 'Fan Value', href: '/admin/fan-value' },
  { label: 'Achievements', href: '/admin/achievements' },
  { label: 'Reward Readiness', href: '/admin/rewards' },
  { label: 'Notifications', href: '/admin/notifications' },
  { label: 'Activity Feed', href: '/admin/activity' },
  { label: 'Reporting Centre', href: '/admin/dashboard/reporting' },
  { label: 'Compliance', href: '/admin/dashboard/compliance' },
  { label: 'Sponsor Management', href: '/admin/dashboard/sponsor-management' },
];

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getFullDashboard() {
    const [overview, health, actionRequired, sections, recentEvents, quickLinks] = await Promise.all([
      this.getOverview(),
      this.getPlatformHealth(),
      this.getActionRequired(),
      this._getAllSections(),
      this.getRecentOperationalEvents(),
      this.getQuickLinks(),
    ]);
    return {
      generatedAt: new Date().toISOString(),
      overview,
      health,
      actionRequired,
      sections,
      recentEvents,
      quickLinks,
    };
  }

  async getOverview() {
    const [
      users, fans, competitions, activeSeasons, fixtures, fantasyTeams,
      guessTheScorePredictions, peerChallenges, fanValuePoints,
      achievementsUnlocked, rewardEligible, notificationsUnread, activityItems,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.fanProfile.count(),
      this.prisma.competition.count(),
      this.prisma.season.count({ where: { status: 'ACTIVE' } }),
      this.prisma.fixture.count(),
      this.prisma.fantasyTeam.count(),
      this.prisma.scorePrediction.count(),
      this.prisma.peerChallenge.count(),
      this.prisma.fanValueLedger.aggregate({ _sum: { points: true } }).then(r => r._sum.points ?? 0),
      this.prisma.fanAchievement.count(),
      this.prisma.fanRewardReadiness.count({ where: { status: RewardReadinessStatus.ELIGIBLE } }),
      this.prisma.notification.count({ where: { status: NotificationStatus.UNREAD } }),
      this.prisma.activityFeedItem.count(),
    ]);

    const actionRequired = await this.getActionRequired();

    return {
      users,
      fans,
      competitions,
      activeSeasons,
      fixtures,
      fantasyTeams,
      guessTheScorePredictions,
      peerChallenges,
      fanValuePoints,
      achievementsUnlocked,
      rewardEligible,
      notificationsUnread,
      activityItems,
      actionRequiredCount: actionRequired.length,
    };
  }

  getPlatformHealth() {
    return {
      database: 'LOCAL_POSTGRESQL',
      externalServices: 'NOT_USED',
      awsTouched: false,
      terraformTouched: false,
      sportsDataProvider: 'SEEDED_LOCAL_DATA',
      notificationsProvider: 'LOCAL_IN_APP_ONLY',
      paymentsProvider: 'NOT_ENABLED',
      sponsorMarketplace: 'NOT_ENABLED',
    };
  }

  async getActionRequired() {
    const actions: { domain: string; message: string; severity: string; href?: string }[] = [];

    const [
      unsettledFixtures,
      openPredictionsOnFinishedFixtures,
      failedDeliveries,
      hiddenActivityCount,
    ] = await Promise.all([
      this.prisma.fixture.count({ where: { status: FixtureStatus.FINISHED } }),
      this.prisma.scorePrediction.count({
        where: {
          status: PredictionStatus.LOCKED,
          fixture: { status: FixtureStatus.FINISHED },
        },
      }),
      this.prisma.notificationDeliveryLog.count({
        where: { status: NotificationDeliveryStatus.FAILED },
      }),
      this.prisma.activityFeedItem.count({ where: { status: ActivityStatus.HIDDEN } }),
    ]);

    if (openPredictionsOnFinishedFixtures > 0) {
      actions.push({
        domain: 'guess-the-score',
        message: `${openPredictionsOnFinishedFixtures} predictions pending settlement on finished fixtures`,
        severity: 'WARNING',
        href: '/admin/predictions',
      });
    }
    if (unsettledFixtures > 0) {
      actions.push({
        domain: 'fixture-management',
        message: `${unsettledFixtures} finished fixtures — verify results`,
        severity: 'INFO',
        href: '/admin/fixtures',
      });
    }
    if (failedDeliveries > 0) {
      actions.push({
        domain: 'notifications',
        message: `${failedDeliveries} failed notification deliveries`,
        severity: 'WARNING',
        href: '/admin/notifications',
      });
    }
    if (hiddenActivityCount > 0) {
      actions.push({
        domain: 'content-moderation',
        message: `${hiddenActivityCount} activity items are hidden`,
        severity: 'INFO',
        href: '/admin/activity/moderation',
      });
    }

    return actions;
  }

  async getRecentOperationalEvents() {
    const [recentPredictions, recentAchievements, recentActivity] = await Promise.all([
      this.prisma.scorePrediction.findMany({
        select: { id: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.fanAchievement.findMany({
        select: { id: true, achievementDefinitionId: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.activityFeedItem.findMany({
        select: { id: true, type: true, title: true, occurredAt: true },
        where: { status: ActivityStatus.ACTIVE },
        orderBy: { occurredAt: 'desc' },
        take: 5,
      }),
    ]);

    return [
      ...recentPredictions.map(p => ({ domain: 'guess-the-score', type: 'PREDICTION', id: p.id, status: p.status, at: p.createdAt })),
      ...recentAchievements.map(a => ({ domain: 'achievements', type: 'ACHIEVEMENT_UNLOCKED', id: a.id, at: a.createdAt })),
      ...recentActivity.map(a => ({ domain: 'activity', type: a.type, id: a.id, title: a.title, at: a.occurredAt })),
    ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 10);
  }

  getQuickLinks() {
    return QUICK_LINKS_MAIN;
  }

  // ── Command Centre Sections ──────────────────────────────────────────────────

  async getGuessTheScoreManagementSummary() {
    const [
      totalPredictions, byStatusRaw, totalPointsResult,
      exactScoreCount, resultOnlyCount,
      challengeTotal, activeChallenges, settledChallenges,
      challengePointsResult,
      topUsers, upcomingFixtures,
    ] = await Promise.all([
      this.prisma.scorePrediction.count(),
      this.prisma.scorePrediction.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.predictionPointsLedger.aggregate({ _sum: { points: true } }),
      this.prisma.scorePrediction.count({ where: { pointsAwarded: 10 } }),
      this.prisma.scorePrediction.count({ where: { pointsAwarded: { in: [3, 5] } } }),
      this.prisma.peerChallenge.count(),
      this.prisma.peerChallenge.count({ where: { status: { in: [ChallengeStatus.PENDING, ChallengeStatus.ACCEPTED] } } }),
      this.prisma.peerChallenge.count({ where: { status: ChallengeStatus.SETTLED } }),
      this.prisma.peerChallenge.aggregate({ _sum: { pointsAwardedChallenger: true, pointsAwardedOpponent: true } }),
      this.prisma.predictionPointsLedger.groupBy({
        by: ['userId'], _sum: { points: true },
        orderBy: { _sum: { points: 'desc' } }, take: 5,
      }),
      this.prisma.fixture.findMany({
        where: { status: FixtureStatus.SCHEDULED },
        select: { id: true, homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } }, kickoffAt: true, gameweekId: true },
        orderBy: { kickoffAt: 'asc' },
        take: 5,
      }),
    ]);

    const byStatus = Object.fromEntries(byStatusRaw.map(r => [r.status, r._count.id]));
    const pendingSettlementFixtures = await this.prisma.fixture.findMany({
      where: { status: FixtureStatus.FINISHED, predictions: { some: { status: PredictionStatus.LOCKED } } },
      select: { id: true, homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } }, kickoffAt: true },
      take: 10,
    });

    const totalPredictionPoints = totalPointsResult._sum.points ?? 0;
    const total = (byStatus[PredictionStatus.WON] ?? 0) + (byStatus[PredictionStatus.LOST] ?? 0);
    const exactScoreRate = total > 0 ? Math.round((exactScoreCount / total) * 100) / 100 : 0;
    const resultAccuracyRate = total > 0 ? Math.round(((exactScoreCount + resultOnlyCount) / total) * 100) / 100 : 0;

    return {
      label: 'Guess the Score',
      totalPredictions,
      byStatus,
      pendingSettlementFixtures,
      predictionPointsAwarded: totalPredictionPoints,
      exactScoreCount,
      resultOnlyCount,
      accuracy: { exactScoreRate, resultAccuracyRate },
      peerChallenges: {
        total: challengeTotal,
        active: activeChallenges,
        settled: settledChallenges,
        pointsAwarded: (challengePointsResult._sum.pointsAwardedChallenger ?? 0) +
          (challengePointsResult._sum.pointsAwardedOpponent ?? 0),
      },
      topUsersByPredictionPoints: topUsers.map(u => ({ userId: u.userId, totalPoints: u._sum.points ?? 0 })),
      recentPredictionActivity: await this.prisma.scorePrediction.findMany({
        select: { id: true, status: true, pointsAwarded: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      nextFixtures: upcomingFixtures,
      participationRates: [],
      anomalyFlags: [],
      actionRequired: [],
      quickLinks: [
        { label: 'Prediction Settlement', href: '/admin/predictions' },
        { label: 'Fixture Management', href: '/admin/fixtures' },
        { label: 'Peer Challenges', href: '/admin/challenges', status: 'PLANNED_IF_ROUTE_MISSING' },
      ],
      exportReady: true,
    };
  }

  async getFantasyRulesManagementSummary() {
    const latestConfig = await this.prisma.fantasyRulesConfig.findFirst({
      orderBy: { id: 'desc' },
    });

    const rulesStatus = latestConfig ? 'ACTIVE' : 'NOT_CONFIGURED';

    return {
      label: 'Fantasy Rules',
      currentRulesConfig: latestConfig ?? null,
      rulesStatus,
      transferRules: latestConfig ? {
        freeTransfersPerGameweek: latestConfig.freeTransfersPerGameweek,
        maxSavedFreeTransfers: latestConfig.maxSavedFreeTransfers,
        extraTransferCost: latestConfig.extraTransferCost,
        maxTransfersPerGameweek: latestConfig.maxTransfersPerGameweek,
      } : {},
      scoringRules: latestConfig ? {
        squadSize: latestConfig.squadSize,
        startingXiSize: latestConfig.startingXiSize,
        benchSize: latestConfig.benchSize,
      } : {},
      chipRules: latestConfig ? {
        chipsEnabled: latestConfig.chipsEnabled,
        wildcardCount: latestConfig.wildcardCount,
        wildcardEnabled: latestConfig.wildcardEnabled,
        freeHitCount: latestConfig.freeHitCount,
        freeHitEnabled: latestConfig.freeHitEnabled,
        benchBoostCount: latestConfig.benchBoostCount,
        benchBoostEnabled: latestConfig.benchBoostEnabled,
        tripleCaptainCount: latestConfig.tripleCaptainCount,
        tripleCaptainEnabled: latestConfig.tripleCaptainEnabled,
      } : {},
      captaincyRules: latestConfig ? {
        minStartingGoalkeepers: latestConfig.minStartingGoalkeepers,
        maxStartingGoalkeepers: latestConfig.maxStartingGoalkeepers,
        minStartingDefenders: latestConfig.minStartingDefenders,
        minStartingMidfielders: latestConfig.minStartingMidfielders,
        minStartingForwards: latestConfig.minStartingForwards,
      } : {},
      deadlineRules: latestConfig ? {
        deadlineOffsetMinutes: latestConfig.deadlineOffsetMinutes,
      } : {},
      gameweekRulesImpact: {},
      ruleViolationFlags: [],
      quickLinks: [
        { label: 'Fantasy Rules Config', href: '/admin/fantasy/rules' },
        { label: 'Gameweek Management', href: '/admin/gameweeks' },
      ],
      exportReady: true,
    };
  }

  async getFantasyLeagueManagementSummary() {
    const [
      totalFantasyTeams, activeSeasonTeams,
      gwCounts, transferStats, chipStats,
      leagues, leagueMemberships, publicLeagues, privateLeagues,
      gwScoreTotal, teamTotalPoints,
      topByTotal, topByGw,
      autoSubs, successfulSubs,
      captainPoints,
      recentScoring,
    ] = await Promise.all([
      this.prisma.fantasyTeam.count(),
      this.prisma.fantasyTeam.count({ where: { season: { status: 'ACTIVE' } } }),
      this.prisma.gameweek.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.fantasyTransfer.aggregate({ _count: { id: true }, _sum: { transferCost: true } }),
      this.prisma.fantasyChip.groupBy({ by: ['type', 'status'], _count: { id: true } }),
      this.prisma.fantasyLeague.count(),
      this.prisma.fantasyLeagueMember.count(),
      this.prisma.fantasyLeague.count({ where: { type: FantasyLeagueType.PUBLIC } }),
      this.prisma.fantasyLeague.count({ where: { type: FantasyLeagueType.PRIVATE } }),
      this.prisma.fantasyGameweekScore.aggregate({ _sum: { netPoints: true } }),
      this.prisma.fantasyTeam.aggregate({ _sum: { totalPoints: true } }),
      this.prisma.fantasyTeam.findMany({
        select: { id: true, name: true, totalPoints: true, userId: true },
        orderBy: { totalPoints: 'desc' },
        take: 5,
      }),
      this.prisma.fantasyGameweekScore.findMany({
        select: { fantasyTeamId: true, netPoints: true, gameweekId: true },
        orderBy: { netPoints: 'desc' },
        take: 5,
      }),
      this.prisma.fantasyAutoSubstitution.count(),
      this.prisma.fantasyAutoSubstitution.count({ where: { status: FantasyAutoSubstitutionStatus.APPLIED } }),
      this.prisma.fantasyGameweekScore.aggregate({ _sum: { captainPoints: true } }),
      this.prisma.fantasyGameweekScore.findMany({
        select: { fantasyTeamId: true, netPoints: true, grossPoints: true, gameweekId: true, settledAt: true },
        where: { settledAt: { not: null } },
        orderBy: { settledAt: 'desc' },
        take: 5,
      }),
    ]);

    const gwByStatus = Object.fromEntries(gwCounts.map(g => [g.status, g._count.id]));
    const chipUsage: Record<string, Record<string, number>> = {};
    for (const c of chipStats) {
      chipUsage[c.type] = chipUsage[c.type] ?? {};
      chipUsage[c.type]![c.status] = c._count.id;
    }

    return {
      label: 'Fantasy League',
      totalFantasyTeams,
      activeSeasonTeams,
      gameweeks: {
        total: Object.values(gwByStatus).reduce((a, b) => a + b, 0),
        open: gwByStatus[GameweekStatus.OPEN] ?? 0,
        locked: gwByStatus[GameweekStatus.LOCKED] ?? 0,
        settled: gwByStatus[GameweekStatus.COMPLETED] ?? 0,
      },
      transfers: {
        total: transferStats._count.id,
        deductions: transferStats._sum.transferCost ?? 0,
      },
      chipsUsage: chipUsage,
      leagues: {
        total: leagues,
        memberships: leagueMemberships,
        public: publicLeagues,
        private: privateLeagues,
      },
      scoring: {
        gameweekPoints: gwScoreTotal._sum.netPoints ?? 0,
        overallPoints: teamTotalPoints._sum.totalPoints ?? 0,
      },
      topUsersByFantasyPoints: topByTotal,
      topUsersByGameweekPoints: topByGw,
      autoSubstitutions: {
        total: autoSubs,
        successful: successfulSubs,
        failed: autoSubs - successfulSubs,
      },
      captaincyImpact: {
        captainPoints: captainPoints._sum.captainPoints ?? 0,
        viceCaptainPoints: 0,
      },
      playerScoringHighlights: [],
      leagueHealthMetrics: {
        averageTeamSize: 0,
        activeParticipationRate: 0,
        dropOffFlags: [],
      },
      transferWindowStatus: {},
      recentScoringActivity: recentScoring,
      actionRequired: [],
      quickLinks: [
        { label: 'Fantasy Leagues', href: '/admin/fantasy/leagues' },
        { label: 'Fantasy Scoring', href: '/admin/fantasy/scoring', status: 'PLANNED_IF_ROUTE_MISSING' },
        { label: 'Gameweek Management', href: '/admin/gameweeks' },
      ],
      exportReady: true,
    };
  }

  async getLeagueManagementSummary() {
    const [
      totalCompetitions, activeCompetitions,
      totalSeasons, activeSeasons,
      teams, players, venues,
      activeCompetition, activeSeason,
      recentImports,
    ] = await Promise.all([
      this.prisma.competition.count(),
      this.prisma.competition.count({ where: { seasons: { some: { status: 'ACTIVE' } } } }),
      this.prisma.season.count(),
      this.prisma.season.count({ where: { status: 'ACTIVE' } }),
      this.prisma.team.count(),
      this.prisma.player.count(),
      this.prisma.venue.count(),
      this.prisma.competition.findFirst({
        where: { seasons: { some: { status: 'ACTIVE' } } },
        select: { id: true, name: true, format: true },
      }),
      this.prisma.season.findFirst({
        where: { status: 'ACTIVE' },
        select: { id: true, name: true, competitionId: true },
      }),
      this.prisma.competitionImportJob.findMany({
        select: { id: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      label: 'League Management',
      competitions: { total: totalCompetitions, active: activeCompetitions },
      seasons: { total: totalSeasons, active: activeSeasons },
      teams,
      players,
      venues,
      activeCompetition,
      activeSeason,
      importJobs: { recent: recentImports },
      fixtureAssignment: {},
      multiLeagueReadiness: {
        enabled: true,
        currentScope: 'WORLD_CUP_2026_BETA_AND_PSL_READY',
      },
      actionRequired: [],
      quickLinks: [
        { label: 'Competitions', href: '/admin/competitions' },
        { label: 'Seasons', href: '/admin/seasons', status: 'PLANNED_IF_ROUTE_MISSING' },
        { label: 'Imports', href: '/admin/imports' },
        { label: 'Teams', href: '/admin/teams', status: 'PLANNED_IF_ROUTE_MISSING' },
        { label: 'Players', href: '/admin/players', status: 'PLANNED_IF_ROUTE_MISSING' },
      ],
    };
  }

  async getFixtureManagementSummary() {
    const [byStatusRaw, liveFixtures, upcomingFixtures, pendingPredictionSettlement, crossDomain] = await Promise.all([
      this.prisma.fixture.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.fixture.findMany({
        where: { status: { in: [FixtureStatus.LIVE, FixtureStatus.HALF_TIME] } },
        select: { id: true, homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } }, kickoffAt: true, status: true },
        take: 10,
      }),
      this.prisma.fixture.findMany({
        where: { status: FixtureStatus.SCHEDULED },
        select: { id: true, homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } }, kickoffAt: true, gameweekId: true },
        orderBy: { kickoffAt: 'asc' },
        take: 10,
      }),
      this.prisma.fixture.findMany({
        where: { status: FixtureStatus.FINISHED, predictions: { some: { status: PredictionStatus.LOCKED } } },
        select: { id: true, homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } }, kickoffAt: true },
        take: 10,
      }),
      Promise.all([
        this.prisma.scorePrediction.count({ where: { fixture: { status: FixtureStatus.LIVE } } }),
        this.prisma.fantasyTeam.count(),
        this.prisma.matchEvent.count(),
      ]),
    ]);

    const byStatus = Object.fromEntries(byStatusRaw.map(r => [r.status, r._count.id]));
    const totalFixtures = Object.values(byStatus).reduce((a, b) => a + b, 0);

    return {
      label: 'Fixture Management',
      fixtures: {
        total: totalFixtures,
        byStatus,
        upcoming: byStatus[FixtureStatus.SCHEDULED] ?? 0,
        live: (byStatus[FixtureStatus.LIVE] ?? 0) + (byStatus[FixtureStatus.HALF_TIME] ?? 0),
        completed: byStatus[FixtureStatus.FINISHED] ?? 0,
      },
      upcomingFixtures,
      liveFixtures,
      fixturesNeedingResultVerification: await this.prisma.fixture.findMany({
        where: { status: FixtureStatus.FINISHED },
        select: { id: true, homeTeam: { select: { name: true } }, awayTeam: { select: { name: true } }, kickoffAt: true },
        orderBy: { kickoffAt: 'desc' },
        take: 5,
      }),
      pendingPredictionSettlementFixtures: pendingPredictionSettlement,
      fantasyGameweekLinkage: {},
      importSyncReadiness: {},
      crossDomainImpact: {
        predictionsAffected: crossDomain[0],
        fantasyTeamsAffected: crossDomain[1],
        liveMatchEvents: crossDomain[2],
      },
      actionRequired: [],
      quickLinks: [
        { label: 'Fixture Management', href: '/admin/fixtures' },
        { label: 'Gameweeks', href: '/admin/gameweeks' },
        { label: 'Live Match Dashboard', href: '/admin/live', status: 'PLANNED_IF_ROUTE_MISSING' },
        { label: 'Fixture Imports', href: '/admin/imports' },
      ],
    };
  }

  async getSponsorManagementSummary() {
    const [rewardDefs, sponsorEligible, sponsorActivity, sponsorNotifications] = await Promise.all([
      this.prisma.rewardReadinessDefinition.count(),
      this.prisma.fanRewardReadiness.count({ where: { status: RewardReadinessStatus.ELIGIBLE } }),
      this.prisma.activityFeedItem.count({
        where: { type: { in: ['REWARD_ELIGIBLE', 'ACHIEVEMENT_UNLOCKED', 'BADGE_EARNED'] } },
      }),
      this.prisma.notification.count({
        where: { type: { in: ['REWARD_ELIGIBLE', 'ACHIEVEMENT_UNLOCKED'] } },
      }),
    ]);

    return {
      label: 'Sponsor Management',
      sponsorReadinessStatus: 'READY_FOR_SPONSOR_ACTIVATION_MVP',
      marketplaceStatus: 'NOT_ENABLED',
      fulfilmentStatus: 'NOT_ENABLED',
      activeRewardReadinessDefinitions: rewardDefs,
      sponsorReadyRewardDefinitions: rewardDefs,
      sponsorEngagementActivityFeedCount: sponsorActivity,
      sponsorRelatedNotificationsCount: sponsorNotifications,
      sponsorRelatedActivityCount: sponsorActivity,
      betwayTitleSponsorReadiness: {
        status: 'READY_FOR_CONFIGURATION',
        namingRightsVisibility: 'PLANNED',
        fantasySponsorshipReadiness: 'READY_FOR_RULES_AND_REWARDS_LINKAGE',
        guessTheScoreSponsorshipReadiness: 'READY_FOR_PREDICTION_ACTIVITY_REPORTING',
        loyaltyReadiness: 'READY_VIA_FAN_VALUE_AND_REWARD_READINESS',
      },
      activationPerformance: {
        reach: sponsorEligible,
        engagement: sponsorActivity,
        conversions: 0,
        rewardEligibility: sponsorEligible,
        status: 'READY_FOR_FUTURE_CAMPAIGN_DATA',
      },
      approvalQueue: {
        pending: 0,
        status: 'PLACEHOLDER_FOR_SPONSOR_APPROVAL_WORKFLOW',
      },
      actionRequired: [],
      quickLinks: [
        { label: 'Reward Readiness', href: '/admin/rewards' },
        { label: 'Fan Value', href: '/admin/fan-value' },
        { label: 'Activity Feed', href: '/admin/activity' },
        { label: 'Notifications', href: '/admin/notifications' },
      ],
    };
  }

  async getContentModerationSummary() {
    const [total, active, hidden, archived, reactionStats, manualPosts] = await Promise.all([
      this.prisma.activityFeedItem.count(),
      this.prisma.activityFeedItem.count({ where: { status: ActivityStatus.ACTIVE } }),
      this.prisma.activityFeedItem.count({ where: { status: ActivityStatus.HIDDEN } }),
      this.prisma.activityFeedItem.count({ where: { status: ActivityStatus.ARCHIVED } }),
      this.prisma.activityReaction.groupBy({ by: ['reactionType'], _count: { id: true } }),
      this.prisma.activityFeedItem.count({ where: { type: 'ADMIN_POST' } }),
    ]);

    const recentHiddenItems = await this.prisma.activityFeedItem.findMany({
      where: { status: ActivityStatus.HIDDEN },
      select: { id: true, type: true, title: true, hiddenAt: true, hiddenReason: true },
      orderBy: { hiddenAt: 'desc' },
      take: 5,
    });

    return {
      label: 'Content Moderation',
      activityItems: { total, active, hidden, archived },
      pendingModeration: {
        count: 0,
        status: 'PLACEHOLDER_UNTIL_REPORTING_QUEUE_EXISTS',
      },
      recentHiddenItems,
      reactionStats: Object.fromEntries(reactionStats.map(r => [r.reactionType, r._count.id])),
      manualSystemPosts: manualPosts,
      communityGuidelinesStatus: 'READY_FOR_POLICY_CONFIGURATION',
      commentsModeration: 'NOT_ENABLED',
      mediaModeration: 'NOT_ENABLED',
      actionRequired: hidden > 0 ? [{ message: `${hidden} items currently hidden`, severity: 'INFO' }] : [],
      quickLinks: [
        { label: 'Activity Feed', href: '/admin/activity' },
        { label: 'Moderation Queue', href: '/admin/activity/moderation' },
        { label: 'Create System Activity', href: '/admin/activity/system' },
      ],
    };
  }

  async getReportingSummary() {
    return {
      label: 'Reporting Centre',
      reportReadinessStatus: 'READY_FOR_EXPORT_AND_REPORT_BUILDER_MVP',
      exportableDomains: [
        'fans', 'competitions', 'fixtures', 'guess-the-score',
        'fantasy-rules', 'fantasy-league', 'fan-value',
        'achievements', 'rewards-readiness', 'notifications', 'activity',
      ],
      availableExports: [],
      scheduledReports: { enabled: false, status: 'PLANNED' },
      sponsorReportReadiness: {
        status: 'READY_FOR_SPONSOR_SUMMARY_TEMPLATES',
        domains: ['fan-value', 'reward-readiness', 'guess-the-score', 'fantasy-league', 'activity'],
      },
      auditReportReadiness: {
        status: 'READY_FOR_AUDIT_EXPORTS',
        domains: ['consent', 'auth-audit', 'admin-actions', 'moderation'],
      },
      actionRequired: [],
      quickLinks: [
        { label: 'Guess the Score Report Data', href: '/admin/dashboard/guess-the-score' },
        { label: 'Fantasy League Report Data', href: '/admin/dashboard/fantasy-league' },
        { label: 'Sponsor Readiness', href: '/admin/dashboard/sponsor-management' },
        { label: 'Compliance', href: '/admin/dashboard/compliance' },
      ],
    };
  }

  async getComplianceSummary() {
    const [totalUsers, consentRecords, authAuditLogCount, passwordResetTokenCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.consentRecord.count(),
      this.prisma.authAuditLog.count(),
      this.prisma.passwordResetToken.count({ where: { usedAt: null, expiresAt: { gt: new Date() } } }),
    ]);

    const usersMissingRequiredConsent = Math.max(0, totalUsers - consentRecords);

    return {
      label: 'Compliance & POPIA Governance',
      totalUsers,
      consentRecordsCount: consentRecords,
      usersMissingRequiredConsent,
      authAuditLogCount,
      passwordResetTokenCount,
      dataRetentionFlags: [],
      breachIncidentCount: 0,
      dataSubjectRequests: { count: 0, status: 'PLANNED' },
      privacyPolicyVersion: 'MVP_PLACEHOLDER',
      termsVersion: 'MVP_PLACEHOLDER',
      nonFinancialCompliance: {
        gamblingMechanicsEnabled: false,
        realMoneyWalletEnabled: false,
        externalPaymentsEnabled: false,
        rewardRedemptionEnabled: false,
      },
      auditReadiness: {
        adminActionAuditLog: 'PLANNED',
        authAuditLog: authAuditLogCount > 0 ? 'AVAILABLE' : 'EMPTY',
        consentAudit: consentRecords > 0 ? 'AVAILABLE' : 'EMPTY',
      },
      actionRequired: usersMissingRequiredConsent > 0 ? [{
        message: `${usersMissingRequiredConsent} users may be missing consent records`,
        severity: 'INFO',
      }] : [],
      quickLinks: [
        { label: 'User Administration', href: '/admin/users', status: 'PLANNED_IF_ROUTE_MISSING' },
        { label: 'Reporting Centre', href: '/admin/dashboard/reporting' },
        { label: 'Audit Logs', href: '/admin/audit', status: 'PLANNED_IF_ROUTE_MISSING' },
      ],
    };
  }

  async getUserAudienceSummary() {
    const [
      users, fanProfiles,
      withDisplayName, withCity, withPreferredTeam,
      fantasyParticipants, predictionParticipants,
      challengeParticipants, highFanValue, achievementCollectors, rewardEligibleUsers,
      teamDistributionRaw,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.fanProfile.count(),
      this.prisma.fanProfile.count({ where: { displayName: { not: null } } }),
      this.prisma.fanProfile.count({ where: { city: { not: null } } }),
      this.prisma.fanProfile.count({ where: { preferredTeamId: { not: null } } }),
      this.prisma.fantasyTeam.count(),
      this.prisma.scorePrediction.groupBy({ by: ['userId'] }).then(r => r.length),
      this.prisma.peerChallenge.groupBy({ by: ['challengerUserId'] }).then(r => r.length),
      this.prisma.fanValueLedger.groupBy({
        by: ['userId'], _sum: { points: true },
        having: { points: { _sum: { gt: 100 } } },
      }).then(r => r.length),
      this.prisma.fanAchievement.groupBy({ by: ['userId'] }).then(r => r.length),
      this.prisma.fanRewardReadiness.count({ where: { status: RewardReadinessStatus.ELIGIBLE } }),
      this.prisma.fanProfile.groupBy({ by: ['preferredTeamId'], _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 5 }),
    ]);

    return {
      label: 'User & Audience Intelligence',
      users,
      fanProfiles,
      profileCompletion: {
        withDisplayName,
        withCity,
        withPreferredTeam,
        completionRate: fanProfiles > 0 ? Math.round((withDisplayName / fanProfiles) * 100) : 0,
      },
      preferredTeamDistribution: teamDistributionRaw.map(t => ({ teamId: t.preferredTeamId, count: t._count.id })),
      engagementSegments: {
        fantasyParticipants,
        guessTheScoreParticipants: predictionParticipants,
        challengeParticipants,
        highFanValueUsers: highFanValue,
        achievementCollectors,
        rewardEligibleUsers,
      },
      provinceDistribution: { status: 'NOT_CAPTURED' },
      countryDistribution: { status: 'NOT_CAPTURED' },
      superfanCandidates: [],
      actionRequired: [],
      quickLinks: [
        { label: 'Fan Value', href: '/admin/fan-value' },
        { label: 'Achievements', href: '/admin/achievements' },
        { label: 'Reward Readiness', href: '/admin/rewards' },
      ],
    };
  }

  async getSystemOperationsSummary() {
    const [failedDeliveries, recentImports, pendingResets] = await Promise.all([
      this.prisma.notificationDeliveryLog.count({ where: { status: NotificationDeliveryStatus.FAILED } }),
      this.prisma.competitionImportJob.findMany({
        select: { id: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.passwordResetToken.count({ where: { usedAt: null, expiresAt: { gt: new Date() } } }),
    ]);

    return {
      label: 'System & Operational Management',
      database: 'LOCAL_POSTGRESQL',
      externalServices: 'NOT_USED',
      awsTouched: false,
      terraformTouched: false,
      providerIntegrations: {
        sportsData: 'SEEDED_LOCAL_DATA',
        notifications: 'LOCAL_IN_APP_ONLY',
        payments: 'NOT_ENABLED',
        sponsorMarketplace: 'NOT_ENABLED',
        pushNotifications: 'NOT_ENABLED',
        email: 'NOT_ENABLED',
        sms: 'NOT_ENABLED',
      },
      recentImportJobs: recentImports,
      failedNotifications: failedDeliveries,
      failedDeliveryLogs: failedDeliveries,
      pendingPasswordResets: pendingResets,
      pendingAdminActions: [],
      backupStatus: 'LOCAL_DEV_ONLY',
      featureFlags: { status: 'PLANNED' },
      actionRequired: failedDeliveries > 0 ? [{ message: `${failedDeliveries} failed delivery logs`, severity: 'WARNING' }] : [],
      quickLinks: [
        { label: 'Imports', href: '/admin/imports' },
        { label: 'Notifications', href: '/admin/notifications' },
        { label: 'Activity', href: '/admin/activity' },
        { label: 'Compliance', href: '/admin/dashboard/compliance' },
      ],
    };
  }

  // ── Existing Domain Summaries ─────────────────────────────────────────────

  async getFootballSummary() {
    const [competitions, seasons, teams, players, fixtures, venues] = await Promise.all([
      this.prisma.competition.count(),
      this.prisma.season.count(),
      this.prisma.team.count(),
      this.prisma.player.count(),
      this.prisma.fixture.count(),
      this.prisma.venue.count(),
    ]);
    return { competitions, seasons, teams, players, fixtures, venues };
  }

  async getFanSummary() {
    const [users, fanProfiles, withConsent, withPreferredTeam] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.fanProfile.count(),
      this.prisma.consentRecord.groupBy({ by: ['userId'] }).then(r => r.length),
      this.prisma.fanProfile.count({ where: { preferredTeamId: { not: null } } }),
    ]);
    return { users, fanProfiles, withConsent, withPreferredTeam };
  }

  async getFantasySummary() {
    const [teams, transfers, chips, leagues, memberships, gwScores] = await Promise.all([
      this.prisma.fantasyTeam.count(),
      this.prisma.fantasyTransfer.count(),
      this.prisma.fantasyChip.groupBy({ by: ['type', 'status'], _count: { id: true } }),
      this.prisma.fantasyLeague.count(),
      this.prisma.fantasyLeagueMember.count(),
      this.prisma.fantasyGameweekScore.aggregate({ _sum: { netPoints: true }, _count: { id: true } }),
    ]);
    return {
      teams, transfers,
      chips: Object.fromEntries(chips.map(c => [`${c.type}_${c.status}`, c._count.id])),
      leagues, memberships,
      settledGameweekScores: gwScores._count.id,
      totalNetPoints: gwScores._sum.netPoints ?? 0,
    };
  }

  async getPredictionsSummary() {
    const [total, byStatus] = await Promise.all([
      this.prisma.scorePrediction.count(),
      this.prisma.scorePrediction.groupBy({ by: ['status'], _count: { id: true } }),
    ]);
    return { total, byStatus: Object.fromEntries(byStatus.map(r => [r.status, r._count.id])) };
  }

  async getChallengesSummary() {
    const [total, byStatus, points] = await Promise.all([
      this.prisma.peerChallenge.count(),
      this.prisma.peerChallenge.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.peerChallenge.aggregate({ _sum: { pointsAwardedChallenger: true, pointsAwardedOpponent: true } }),
    ]);
    return {
      total,
      byStatus: Object.fromEntries(byStatus.map(r => [r.status, r._count.id])),
      totalPointsAwarded: (points._sum.pointsAwardedChallenger ?? 0) + (points._sum.pointsAwardedOpponent ?? 0),
    };
  }

  async getFanValueSummary() {
    const [total, byType, recent] = await Promise.all([
      this.prisma.fanValueLedger.aggregate({ _sum: { points: true }, _count: { id: true } }),
      this.prisma.fanValueLedger.groupBy({ by: ['valueType'], _sum: { points: true } }),
      this.prisma.fanValueLedger.findMany({
        select: { id: true, userId: true, valueType: true, points: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);
    return {
      totalEntries: total._count.id,
      totalPoints: total._sum.points ?? 0,
      byType: Object.fromEntries(byType.map(r => [r.valueType, r._sum.points ?? 0])),
      recentEntries: recent,
    };
  }

  async getAchievementsSummary() {
    const [definitions, badges, unlocked, fanBadges, recent] = await Promise.all([
      this.prisma.achievementDefinition.count(),
      this.prisma.badgeDefinition.count(),
      this.prisma.fanAchievement.count(),
      this.prisma.fanBadge.count(),
      this.prisma.fanAchievement.findMany({
        select: { id: true, userId: true, achievementDefinitionId: true, unlockedAt: true },
        orderBy: { unlockedAt: 'desc' },
        take: 5,
      }),
    ]);
    return { definitions, badges, unlocked, fanBadgesAwarded: fanBadges, recentUnlocks: recent };
  }

  async getRewardsReadinessSummary() {
    const [definitions, byStatus] = await Promise.all([
      this.prisma.rewardReadinessDefinition.count(),
      this.prisma.fanRewardReadiness.groupBy({ by: ['status'], _count: { id: true } }),
    ]);
    return {
      definitions,
      byStatus: Object.fromEntries(byStatus.map(r => [r.status, r._count.id])),
    };
  }

  async getNotificationsSummary() {
    const [total, byStatus, byType, failedDeliveries] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.notification.groupBy({ by: ['type'], _count: { id: true } }),
      this.prisma.notificationDeliveryLog.count({ where: { status: NotificationDeliveryStatus.FAILED } }),
    ]);
    return {
      total,
      byStatus: Object.fromEntries(byStatus.map(r => [r.status, r._count.id])),
      byType: Object.fromEntries(byType.map(r => [r.type, r._count.id])),
      failedDeliveries,
    };
  }

  async getActivitySummary() {
    const [total, byStatus, byVisibility, reactionCount] = await Promise.all([
      this.prisma.activityFeedItem.count(),
      this.prisma.activityFeedItem.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.activityFeedItem.groupBy({ by: ['visibility'], _count: { id: true } }),
      this.prisma.activityReaction.count(),
    ]);
    return {
      total,
      byStatus: Object.fromEntries(byStatus.map(r => [r.status, r._count.id])),
      byVisibility: Object.fromEntries(byVisibility.map(r => [r.visibility, r._count.id])),
      totalReactions: reactionCount,
    };
  }

  // ── Private aggregator for getFullDashboard ────────────────────────────────

  private async _getAllSections() {
    const [
      guessTheScore, fantasyRules, fantasyLeague,
      leagueManagement, fixtureManagement, sponsorManagement,
      contentModeration, reporting, compliance,
      userAudience, systemOperations,
      football, fans, fantasy, fanValue, achievements, rewards, notifications, activity,
    ] = await Promise.all([
      this.getGuessTheScoreManagementSummary(),
      this.getFantasyRulesManagementSummary(),
      this.getFantasyLeagueManagementSummary(),
      this.getLeagueManagementSummary(),
      this.getFixtureManagementSummary(),
      this.getSponsorManagementSummary(),
      this.getContentModerationSummary(),
      this.getReportingSummary(),
      this.getComplianceSummary(),
      this.getUserAudienceSummary(),
      this.getSystemOperationsSummary(),
      this.getFootballSummary(),
      this.getFanSummary(),
      this.getFantasySummary(),
      this.getFanValueSummary(),
      this.getAchievementsSummary(),
      this.getRewardsReadinessSummary(),
      this.getNotificationsSummary(),
      this.getActivitySummary(),
    ]);
    return {
      guessTheScore, fantasyRules, fantasyLeague,
      leagueManagement, fixtureManagement, sponsorManagement,
      contentModeration, reporting, compliance,
      userAudience, systemOperations,
      football, fans, fantasy, fanValue, achievements, rewards, notifications, activity,
    };
  }
}
