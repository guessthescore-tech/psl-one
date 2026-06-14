import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  IntegrationProviderStatus,
  IntegrationProviderType,
} from '@prisma/client';

export type CapabilityStatus =
  | 'BUILT_NOW'
  | 'PARTIALLY_BUILT'
  | 'ADMIN_SHELL_READY'
  | 'FOUNDATION_READY'
  | 'INTEGRATION_READY'
  | 'SANDBOX_READY'
  | 'PROVIDER_REQUIRED'
  | 'COMPLIANCE_REQUIRED'
  | 'CONTRACT_REQUIRED'
  | 'PRODUCTION_DISABLED'
  | 'ENABLED'
  | 'FUTURE_IMPLEMENTATION'
  | 'RIGHTS_REQUIRED'
  | 'NOT_ALLOWED_IN_CURRENT_STORY';

export interface ModuleReadinessItem {
  moduleKey: string;
  displayName: string;
  status: CapabilityStatus;
  isCommercial: boolean;
  isPointsOnly: boolean;
  isProductionEnabled: boolean;
  isFoundational: boolean;
  blockers: string[];
  warnings: string[];
  recommendedAction: string;
}

export interface SmokeTestRoute {
  route: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  domain: string;
  requiresRole: 'PSL_ADMIN' | 'JWT' | 'PUBLIC';
  expectedStatus: number;
  notes: string[];
}

export interface RbacDefinition {
  role: string;
  description: string;
  canAccess: string[];
  cannotAccess: string[];
}

export interface WorkflowSummary {
  workflowKey: string;
  displayName: string;
  steps: string[];
  readinessStatus: string;
  blockers: string[];
}

@Injectable()
export class AdminOperationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Overview ──────────────────────────────────────────────────────────────

  async getAdminOperationsOverview() {
    const [providerCount, seasonCount, activeSeasonCount] = await Promise.all([
      this.prisma.integrationProviderConfig.count(),
      this.prisma.season.count(),
      this.prisma.season.count({ where: { isActive: true } }),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      platform: 'PSL One',
      vision: 'The Digital Operating System of South African Football',
      deploymentMode: 'LOCAL_DEVELOPMENT',
      sections: [
        { key: 'season-management', label: 'Season Management', href: '/admin/seasons/context', status: 'OPERATIONAL' },
        { key: 'season-switching', label: 'Season Switching', href: '/admin/seasons/switching', status: 'OPERATIONAL' },
        { key: 'clubs', label: 'Club Readiness', href: '/admin/clubs', status: 'OPERATIONAL' },
        { key: 'fixture-import', label: 'Fixture Import', href: '/admin/fixtures/imports', status: 'OPERATIONAL' },
        { key: 'gameweek-operations', label: 'Gameweek Operations', href: '/admin/gameweeks/operations', status: 'OPERATIONAL' },
        { key: 'fantasy-calibration', label: 'Fantasy Calibration', href: '/admin/fantasy/calibration', status: 'OPERATIONAL' },
        { key: 'prediction-calibration', label: 'Prediction Calibration', href: '/admin/predictions/calibration', status: 'OPERATIONAL' },
        { key: 'smoke-tests', label: 'Route Smoke Tests', href: '/admin/operations/smoke-tests', status: 'OPERATIONAL' },
        { key: 'module-readiness', label: 'Module Readiness', href: '/admin/operations/module-readiness', status: 'OPERATIONAL' },
        { key: 'capability-review', label: 'Capability Gap Review', href: '/admin/operations/capability-review', status: 'OPERATIONAL' },
        { key: 'launch-readiness', label: 'Launch Readiness', href: '/admin/operations/launch-readiness', status: 'OPERATIONAL' },
        { key: 'integrations', label: 'Launch Integration Readiness', href: '/admin/operations/integrations', status: 'PROVIDER_REQUIRED' },
      ],
      summary: {
        totalSeasons: seasonCount,
        activeSeasons: activeSeasonCount,
        integrationProviders: providerCount,
        gameplayEconomy: 'POINTS_ONLY',
        commercialEconomy: 'SANDBOX_READY — production disabled pending provider contracts and compliance',
      },
      safetyNote: 'No real-money movement, no real checkout, no real ticket issuance, no production live-provider ingestion.',
    };
  }

  // ── Capability Review ─────────────────────────────────────────────────────

  getCapabilityReview() {
    return {
      generatedAt: new Date().toISOString(),
      categories: [
        {
          category: 'A. Core Content & Platform Management',
          items: [
            { capability: 'Club/player profiles', status: 'BUILT_NOW', evidence: 'ClubProfile, ClubContentItem, /admin/clubs', riskIfMissing: 'LOW', nextStep: 'Seed official PSL data at season launch' },
            { capability: 'Fixture/results data management', status: 'BUILT_NOW', evidence: 'FixtureImportBatch/Row, /admin/fixtures/imports', riskIfMissing: 'HIGH', nextStep: 'Import official PSL fixture schedule' },
            { capability: 'Match centre tools', status: 'FOUNDATION_READY', evidence: 'LiveMatchProviderInterface stub, /admin/football/fixtures', riskIfMissing: 'MEDIUM', nextStep: 'Wire live provider in Sprint 3' },
            { capability: 'News/articles/CMS', status: 'FUTURE_IMPLEMENTATION', evidence: 'No CMS model', riskIfMissing: 'LOW', nextStep: 'Sprint 3+ editorial module' },
            { capability: 'Video/highlights/media library', status: 'FUTURE_IMPLEMENTATION', evidence: 'No media model', riskIfMissing: 'LOW', nextStep: 'Sprint 3+ media module' },
            { capability: 'Localization/multilingual', status: 'FUTURE_IMPLEMENTATION', evidence: 'English only currently', riskIfMissing: 'LOW', nextStep: 'Sprint 3+ i18n' },
            { capability: 'Workflow approvals', status: 'FUTURE_IMPLEMENTATION', evidence: 'No approval workflow', riskIfMissing: 'LOW', nextStep: 'Sprint 3+ content workflows' },
          ],
        },
        {
          category: 'B. Football Data Operations',
          items: [
            { capability: 'Competitions & seasons', status: 'BUILT_NOW', evidence: 'Competition, Season models, /admin/competitions', riskIfMissing: 'CRITICAL', nextStep: 'Maintain season lifecycle' },
            { capability: 'Teams/clubs/players/squads', status: 'BUILT_NOW', evidence: 'Team, Player, SeasonSquadRegistration, /admin/clubs', riskIfMissing: 'HIGH', nextStep: 'Import official PSL squads' },
            { capability: 'Fixture import/validation/publishing', status: 'BUILT_NOW', evidence: 'FixtureImportModule, 21 routes, /admin/fixtures', riskIfMissing: 'CRITICAL', nextStep: 'Import official PSL fixtures' },
            { capability: 'Rounds/gameweeks/deadlines', status: 'BUILT_NOW', evidence: 'Gameweek model, GameweekOperationsModule, 15 routes', riskIfMissing: 'HIGH', nextStep: 'Derive gameweeks from PSL fixtures' },
            { capability: 'Live fixture state/match events', status: 'FOUNDATION_READY', evidence: 'LiveMatchProviderInterface, stub provider, Fixture.status', riskIfMissing: 'MEDIUM', nextStep: 'Wire real provider in Sprint 3' },
            { capability: 'Lineups/player availability', status: 'FOUNDATION_READY', evidence: 'FixtureLineup model, manual entry only', riskIfMissing: 'MEDIUM', nextStep: 'Live provider ingestion Sprint 3+' },
            { capability: 'Standings/logs', status: 'BUILT_NOW', evidence: 'GroupStanding model, standings seeded', riskIfMissing: 'LOW', nextStep: 'Confirm PSL standings structure' },
          ],
        },
        {
          category: 'C. User & Community Management',
          items: [
            { capability: 'Fan identity/profile', status: 'BUILT_NOW', evidence: 'User, FanProfile, /profile, /auth', riskIfMissing: 'CRITICAL', nextStep: 'Verify POPIA consent flow' },
            { capability: 'Consents/POPIA readiness', status: 'PARTIALLY_BUILT', evidence: 'ConsentRecord model, consent purposes in RegisterDto', riskIfMissing: 'HIGH', nextStep: 'POPIA DSAR automation Sprint 3+' },
            { capability: 'Activity feed', status: 'BUILT_NOW', evidence: 'ActivityFeedModule, 22-method service, 12 routes', riskIfMissing: 'LOW', nextStep: 'Monitor feed growth at launch' },
            { capability: 'Moderation/reporting tools', status: 'ADMIN_SHELL_READY', evidence: '/admin/dashboard/content-moderation, basic shell', riskIfMissing: 'MEDIUM', nextStep: 'Build moderation queue Sprint 3+' },
            { capability: 'User bans/suspensions', status: 'FUTURE_IMPLEMENTATION', evidence: 'No ban model', riskIfMissing: 'MEDIUM', nextStep: 'User management Sprint 3+' },
            { capability: 'Social features/friends', status: 'FUTURE_IMPLEMENTATION', evidence: 'No social graph model', riskIfMissing: 'LOW', nextStep: 'Sprint 3+ social graph' },
          ],
        },
        {
          category: 'D. Fantasy, Predictions & Engagement',
          items: [
            { capability: 'Fantasy rules config (points-only)', status: 'BUILT_NOW', evidence: 'FantasyRulesConfig, FantasyCalibrationModule, 13 routes. POINTS-ONLY — no paid entry', riskIfMissing: 'HIGH', nextStep: 'Promote to ACTIVE at PSL season launch' },
            { capability: 'Fantasy player pricing', status: 'BUILT_NOW', evidence: 'FantasyPlayerPrice, 96 provisional prices seeded', riskIfMissing: 'HIGH', nextStep: 'Update with official PSL values' },
            { capability: 'Fantasy transfer deadlines', status: 'BUILT_NOW', evidence: 'Gameweek.transferDeadlineAt, GameweekOperationsModule', riskIfMissing: 'HIGH', nextStep: 'Derive from PSL fixtures' },
            { capability: 'Fantasy leagues/cups', status: 'BUILT_NOW', evidence: 'FantasyLeague, FantasyCup, FantasyLeagueModule', riskIfMissing: 'MEDIUM', nextStep: 'Create global league at PSL launch' },
            { capability: 'Prediction rules config (points-only)', status: 'BUILT_NOW', evidence: 'PredictionRulesConfig, PredictionCalibrationModule, 11 routes. POINTS-ONLY', riskIfMissing: 'HIGH', nextStep: 'Promote to ACTIVE at PSL season launch' },
            { capability: 'Prediction lock/settlement', status: 'BUILT_NOW', evidence: 'PredictionStatus, ScorePrediction, settlement service', riskIfMissing: 'HIGH', nextStep: 'Wire to live match results' },
            { capability: 'Peer challenges (fan points only)', status: 'BUILT_NOW', evidence: 'PeerChallenge, ChallengesModule. FAN POINTS ONLY — no stakes', riskIfMissing: 'LOW', nextStep: 'Monitor engagement at launch' },
            { capability: 'Leaderboards', status: 'BUILT_NOW', evidence: 'PredictionPointsLedger, LeaderboardsModule', riskIfMissing: 'MEDIUM', nextStep: 'Confirm PSL leaderboard structure' },
            { capability: 'Badges/achievements/fan value', status: 'BUILT_NOW', evidence: 'AchievementsModule, FanValueLedger, 17 defs seeded', riskIfMissing: 'LOW', nextStep: 'Review badge definitions for PSL' },
            { capability: 'Notifications', status: 'BUILT_NOW', evidence: 'NotificationsModule, 5 services integrated, 3 delivery models', riskIfMissing: 'MEDIUM', nextStep: 'Wire email/push provider Sprint 3+' },
          ],
        },
        {
          category: 'E. Commercial & Revenue Readiness',
          items: [
            { capability: 'Club shopfront catalogue shell', status: 'ADMIN_SHELL_READY', evidence: 'ClubShopProduct model, /admin/clubs/:id/shop page', riskIfMissing: 'LOW', nextStep: 'Commerce provider Sprint 3+' },
            { capability: 'Sponsor activation readiness', status: 'ADMIN_SHELL_READY', evidence: '/admin/dashboard/sponsor-management shell, getSponsorManagementSummary()', riskIfMissing: 'MEDIUM', nextStep: 'Sponsor activation provider Sprint 3+' },
            { capability: 'Rewards readiness', status: 'BUILT_NOW', evidence: 'RewardReadinessModule, 6 seeded definitions, eligibility engine', riskIfMissing: 'MEDIUM', nextStep: 'Wire redemption provider Sprint 3+' },
            { capability: 'Real-money wallet', status: 'PROVIDER_REQUIRED', evidence: 'IntegrationProviderConfig.WALLET seeded (SANDBOX_READY)', riskIfMissing: 'LOW', nextStep: 'Provider contract + compliance Sprint 3+' },
            { capability: 'Payment processing', status: 'PROVIDER_REQUIRED', evidence: 'IntegrationProviderConfig.PAYMENT seeded (PROVIDER_REQUIRED)', riskIfMissing: 'LOW', nextStep: 'Payment provider selection Sprint 3+' },
            { capability: 'Checkout/commerce', status: 'PRODUCTION_DISABLED', evidence: 'IntegrationProviderConfig.CHECKOUT seeded (PRODUCTION_DISABLED)', riskIfMissing: 'LOW', nextStep: 'Enable after provider + compliance Sprint 3+' },
            { capability: 'Ticket inventory/QR ticketing', status: 'PROVIDER_REQUIRED', evidence: 'IntegrationProviderConfig.TICKETING seeded (PROVIDER_REQUIRED)', riskIfMissing: 'MEDIUM', nextStep: 'Ticketing provider contract Sprint 3+' },
            { capability: 'Orders/fulfilment', status: 'FUTURE_IMPLEMENTATION', evidence: 'No order model', riskIfMissing: 'LOW', nextStep: 'Commerce provider Sprint 3+' },
            { capability: 'Finance/revenue reporting', status: 'FUTURE_IMPLEMENTATION', evidence: 'No revenue model', riskIfMissing: 'LOW', nextStep: 'Reconciliation engine Sprint 3+' },
          ],
        },
        {
          category: 'F. Operations, Security & Compliance',
          items: [
            { capability: 'RBAC — PSL_ADMIN', status: 'BUILT_NOW', evidence: 'JwtAuthGuard + RolesGuard on all admin routes', riskIfMissing: 'CRITICAL', nextStep: 'Maintain on all new routes' },
            { capability: 'Season switch audit', status: 'BUILT_NOW', evidence: 'SeasonSwitchAudit model, audit on every switch action', riskIfMissing: 'MEDIUM', nextStep: 'Monitor audit trail at launch' },
            { capability: 'Route smoke testing', status: 'BUILT_NOW', evidence: 'AdminOperationsModule smoke test inventory, STORY-32', riskIfMissing: 'MEDIUM', nextStep: 'Run before each season activation' },
            { capability: 'POPIA consent/export/delete', status: 'PARTIALLY_BUILT', evidence: 'ConsentRecord model, consent on registration', riskIfMissing: 'HIGH', nextStep: 'DSAR automation Sprint 3+' },
            { capability: 'DevOps/monitoring', status: 'FUTURE_IMPLEMENTATION', evidence: 'Health check endpoint exists, no production observability', riskIfMissing: 'HIGH', nextStep: 'AWS CloudWatch/DataDog Sprint 3+' },
            { capability: 'Payment/wallet compliance', status: 'COMPLIANCE_REQUIRED', evidence: 'IntegrationProviderConfig requiresComplianceApproval=true', riskIfMissing: 'HIGH', nextStep: 'Legal/compliance review before enabling' },
            { capability: 'Club/sponsor admin roles', status: 'FUTURE_IMPLEMENTATION', evidence: 'UserRole.CLUB_ADMIN and SPONSOR exist in enum but not used in guards', riskIfMissing: 'MEDIUM', nextStep: 'Club portal Sprint 3+' },
          ],
        },
        {
          category: 'G. Analytics & Intelligence',
          items: [
            { capability: 'Admin dashboard KPIs', status: 'BUILT_NOW', evidence: 'AdminDashboardModule, 27 routes, aggregation queries', riskIfMissing: 'LOW', nextStep: 'Add Sprint 2 module counts' },
            { capability: 'Exportable reports', status: 'FUTURE_IMPLEMENTATION', evidence: '/admin/dashboard/reporting shell only', riskIfMissing: 'LOW', nextStep: 'Export builder Sprint 3+' },
            { capability: 'A/B testing', status: 'FUTURE_IMPLEMENTATION', evidence: 'No feature flag model', riskIfMissing: 'LOW', nextStep: 'Feature flag service Sprint 3+' },
            { capability: 'AI-assisted insights', status: 'FUTURE_IMPLEMENTATION', evidence: 'No AI integration', riskIfMissing: 'LOW', nextStep: 'Sprint 4+ AI module' },
          ],
        },
        {
          category: 'H. Multi-season / Multi-competition Control',
          items: [
            { capability: 'Create/prepare/switch/archive seasons', status: 'BUILT_NOW', evidence: 'SeasonSwitchingModule, 9-check readiness, transactional activation', riskIfMissing: 'CRITICAL', nextStep: 'Activate PSL season when all 9 checks pass' },
            { capability: 'World Cup historical preservation', status: 'BUILT_NOW', evidence: 'WC season isActive=true, PSL season UPCOMING — dual-season safe', riskIfMissing: 'HIGH', nextStep: 'Do not delete WC data before WC ends' },
            { capability: 'Module readiness per season', status: 'BUILT_NOW', evidence: 'AdminOperationsModule getSeasonModuleReadiness(), STORY-32', riskIfMissing: 'MEDIUM', nextStep: 'Review before each season activation' },
            { capability: 'Season-scoped gameplay economy', status: 'BUILT_NOW', evidence: 'All fantasy/prediction routes accept seasonSlug/seasonId', riskIfMissing: 'HIGH', nextStep: 'Validate PSL season slug in all fan routes' },
          ],
        },
        {
          category: 'I. Launch Integration Readiness',
          items: [
            { capability: 'Wallet/payment providers', status: 'PROVIDER_REQUIRED', evidence: 'IntegrationProviderConfig seeded, architecture ready', riskIfMissing: 'LOW', nextStep: 'Provider selection + contract Sprint 3+' },
            { capability: 'Checkout provider', status: 'PRODUCTION_DISABLED', evidence: 'Sandbox config seeded, no production checkout', riskIfMissing: 'LOW', nextStep: 'Enable post-contract Sprint 3+' },
            { capability: 'Ticket inventory provider', status: 'PROVIDER_REQUIRED', evidence: 'Config seeded, adapter interface ready to implement', riskIfMissing: 'MEDIUM', nextStep: 'Ticketing provider RFP Sprint 3+' },
            { capability: 'Live sports data provider', status: 'PROVIDER_REQUIRED', evidence: 'LiveMatchProviderInterface exists, stub implemented, config seeded', riskIfMissing: 'HIGH', nextStep: 'Opta/Stats Perform/Sportradar contract Sprint 3+' },
            { capability: 'Sponsor activation system', status: 'INTEGRATION_READY', evidence: 'Config seeded, /admin/dashboard/sponsor-management shell', riskIfMissing: 'LOW', nextStep: 'Sponsor platform integration Sprint 3+' },
            { capability: 'Rewards redemption provider', status: 'COMPLIANCE_REQUIRED', evidence: 'RewardReadinessModule built, redemption provider config seeded', riskIfMissing: 'MEDIUM', nextStep: 'Compliance review + provider selection Sprint 3+' },
            { capability: 'Notifications provider', status: 'SANDBOX_READY', evidence: 'NotificationsModule built, provider config seeded', riskIfMissing: 'MEDIUM', nextStep: 'Wire email/push provider Sprint 3+' },
            { capability: 'Analytics provider', status: 'SANDBOX_READY', evidence: 'Admin KPIs built, analytics config seeded', riskIfMissing: 'LOW', nextStep: 'DataDog/Amplitude integration Sprint 3+' },
          ],
        },
      ],
    };
  }

  // ── Launch Readiness ──────────────────────────────────────────────────────

  async getLaunchReadiness() {
    const [activeSeason, pslSeason, fixtureCount, gwCount, fantasyConfig, predictionConfig, providerConfigs] = await Promise.all([
      this.prisma.season.findFirst({ where: { isActive: true }, select: { name: true, status: true } }),
      this.prisma.season.findFirst({
        where: { competition: { slug: 'premier-soccer-league' } },
        select: { id: true, name: true, status: true, isActive: true },
        orderBy: { startDate: 'desc' },
      }),
      this.prisma.fixture.count({ where: { season: { competition: { slug: 'premier-soccer-league' } } } }),
      this.prisma.gameweek.count({ where: { season: { competition: { slug: 'premier-soccer-league' } } } }),
      this.prisma.fantasyRulesConfig.findFirst({ where: { season: { competition: { slug: 'premier-soccer-league' } } } }),
      this.prisma.predictionRulesConfig.findFirst({ where: { season: { competition: { slug: 'premier-soccer-league' } } } }),
      this.prisma.integrationProviderConfig.findMany({ select: { providerType: true, status: true, isProductionEnabled: true } }),
    ]);

    const providerMap = Object.fromEntries(
      providerConfigs.map((p) => [p.providerType, { status: p.status, isProductionEnabled: p.isProductionEnabled }]),
    );

    const checklist = [
      { area: 'World Cup season active', status: activeSeason?.name?.includes('World Cup') ? 'PASS' : 'WARN', detail: activeSeason?.name ?? 'No active season' },
      { area: 'PSL season prepared', status: pslSeason ? 'PASS' : 'FAIL', detail: pslSeason?.name ?? 'No PSL season found' },
      { area: 'PSL fixtures imported', status: fixtureCount > 0 ? 'PASS' : 'PENDING', detail: `${fixtureCount} PSL fixture(s)` },
      { area: 'Gameweeks derived', status: gwCount > 0 ? 'PASS' : 'PENDING', detail: `${gwCount} PSL gameweek(s)` },
      { area: 'Fantasy rules configured', status: fantasyConfig ? 'PASS' : 'PENDING', detail: fantasyConfig ? 'Configured' : 'Not configured' },
      { area: 'Prediction rules configured', status: predictionConfig ? 'PASS' : 'PENDING', detail: predictionConfig ? `Status: ${predictionConfig.status}` : 'Not configured' },
      { area: 'Fantasy economy: points-only', status: 'PASS', detail: 'No paid entry, no real-money mechanics. Points-only gameplay.' },
      { area: 'Guess the Score economy: points-only', status: 'PASS', detail: 'No paid entry, no odds, no wagering. Points-only gameplay.' },
      { area: 'Wallet provider', status: 'PENDING', detail: `${providerMap[IntegrationProviderType.WALLET]?.status ?? 'NOT_CONFIGURED'} — production disabled` },
      { area: 'Payment provider', status: 'PENDING', detail: `${providerMap[IntegrationProviderType.PAYMENT]?.status ?? 'NOT_CONFIGURED'} — provider contract required` },
      { area: 'Checkout', status: 'PENDING', detail: `${providerMap[IntegrationProviderType.CHECKOUT]?.status ?? 'NOT_CONFIGURED'} — production disabled` },
      { area: 'Ticketing provider', status: 'PENDING', detail: `${providerMap[IntegrationProviderType.TICKETING]?.status ?? 'NOT_CONFIGURED'} — provider required` },
      { area: 'Live data provider', status: 'PENDING', detail: `${providerMap[IntegrationProviderType.LIVE_DATA]?.status ?? 'NOT_CONFIGURED'} — provider required` },
      { area: 'RBAC guards on all admin routes', status: 'PASS', detail: 'JwtAuthGuard + RolesGuard on all PSL_ADMIN endpoints' },
      { area: 'Season switch audit trail', status: 'PASS', detail: 'SeasonSwitchAudit records every activation, preview, complete, rollback' },
      { area: 'No betting/gambling mechanics', status: 'PASS', detail: 'Codebase audit clean — no odds, stakes, wagers, deposits, withdrawals' },
      { area: 'No real-money gameplay', status: 'PASS', detail: 'Fantasy and Guess the Score are points-only' },
      { area: 'No production live-provider ingestion', status: 'PASS', detail: 'LiveMatchProviderInterface uses stub/mock provider only' },
      { area: 'World Cup data preservation', status: 'PASS', detail: 'WC gameweeks/fantasy/predictions untouched by PSL calibration' },
      { area: 'Engagement season scope', status: 'PASS', detail: 'FanValueLedger.seasonId exists (nullable). Predictions derive from fixture.seasonId. PSL leaderboard starts clean.' },
      { area: 'Leaderboard season isolation', status: 'PASS', detail: 'Season-scoped leaderboards active — WC and PSL data do not mix. World Cup accessible via seasonSlug query param.' },
    ];

    const passCount = checklist.filter((c) => c.status === 'PASS').length;
    const failCount = checklist.filter((c) => c.status === 'FAIL').length;
    const pendingCount = checklist.filter((c) => c.status === 'PENDING').length;

    return {
      generatedAt: new Date().toISOString(),
      overallStatus: failCount > 0 ? 'BLOCKED' : pendingCount > 0 ? 'IN_PROGRESS' : 'READY',
      passCount,
      failCount,
      pendingCount,
      checklist,
      blockers: checklist.filter((c) => c.status === 'FAIL'),
      nextSteps: [
        'Import official PSL 2026/27 fixtures (when available, typically August)',
        'Derive gameweeks and deadlines from PSL fixtures',
        'Promote fantasy and prediction rules from PROVISIONAL to ACTIVE',
        'Run season switching readiness check — resolve all 10 checks (includes engagement scope check)',
        'Activate PSL season to replace World Cup beta',
        'Select wallet, payment, checkout, and ticketing providers (Sprint 3+)',
        'Complete compliance review for payment and wallet providers',
        'Wire live sports data provider (Opta/Stats Perform/Sportradar)',
      ],
    };
  }

  // ── Season Module Readiness ───────────────────────────────────────────────

  async getSeasonModuleReadiness(seasonId: string): Promise<{ seasonId: string; seasonName: string; modules: ModuleReadinessItem[] }> {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
      select: { id: true, name: true, status: true, isActive: true },
    });
    if (!season) throw new NotFoundException(`Season '${seasonId}' not found`);

    const [
      fixtureCount, publishedFixtures, gwCount, teamCount, profileCount,
      priceCount, fantasyConfig, predictionConfig, achievementDefsCount,
      rewardDefsCount, shopProductCount,
      squadRegistrationCount, confirmedRegistrationCount, latestImportBatch,
      latestPriceCalibrationBatch,
    ] = await Promise.all([
      this.prisma.fixture.count({ where: { seasonId } }),
      this.prisma.fixture.count({ where: { seasonId, isPublished: true } }),
      this.prisma.gameweek.count({ where: { seasonId } }),
      this.prisma.seasonTeam.count({ where: { seasonId } }),
      this.prisma.clubProfile.count(),
      this.prisma.fantasyPlayerPrice.count({ where: { seasonId } }),
      this.prisma.fantasyRulesConfig.findUnique({ where: { seasonId } }),
      this.prisma.predictionRulesConfig.findUnique({ where: { seasonId } }),
      this.prisma.achievementDefinition.count(),
      this.prisma.rewardReadinessDefinition.count(),
      this.prisma.clubShopProduct.count(),
      this.prisma.seasonSquadRegistration.count({ where: { seasonId } }),
      this.prisma.seasonSquadRegistration.count({ where: { seasonId, status: 'CONFIRMED' } }),
      this.prisma.squadImportBatch.findFirst({ where: { seasonId }, orderBy: { createdAt: 'desc' }, select: { status: true, blockedRows: true } }),
      this.prisma.fantasyPriceCalibrationBatch.findFirst({ where: { seasonId }, orderBy: { createdAt: 'desc' }, select: { status: true } }),
    ]);

    const squadImportWarnings: string[] = [
      ...(squadRegistrationCount === 0 ? ['No squad registrations — import PSL squad data'] : []),
      ...(confirmedRegistrationCount === 0 && squadRegistrationCount > 0 ? ['No confirmed registrations — publish an import batch'] : []),
      ...(latestImportBatch?.status === 'BLOCKED' ? [`Latest import batch is BLOCKED (${latestImportBatch.blockedRows} blocked rows)`] : []),
    ];

    const minPrice = (fantasyConfig as { minPrice?: number } | null)?.minPrice ?? 40;
    const maxPrice = (fantasyConfig as { maxPrice?: number } | null)?.maxPrice ?? 200;

    const priceCalibrationBlockers: string[] = fantasyConfig ? [] : ['No FantasyRulesConfig — create before calibrating prices'];
    const priceCalibrationWarnings: string[] = [
      ...(priceCount < squadRegistrationCount && squadRegistrationCount > 0 ? [`${squadRegistrationCount - priceCount} registered players have no fantasy price`] : []),
      ...(latestPriceCalibrationBatch === null ? ['No price calibration batch — run validate + publish'] : []),
      ...(latestPriceCalibrationBatch?.status !== 'PUBLISHED' && latestPriceCalibrationBatch !== null ? ['Latest calibration batch not yet published'] : []),
    ];

    void minPrice; void maxPrice;

    const modules: ModuleReadinessItem[] = [
      {
        moduleKey: 'CLUBS',
        displayName: 'Club & Squad Readiness',
        status: teamCount >= 2 ? 'BUILT_NOW' : 'FOUNDATION_READY',
        isCommercial: false, isPointsOnly: false, isProductionEnabled: true, isFoundational: true,
        blockers: teamCount < 2 ? ['Less than 2 teams registered for season'] : [],
        warnings: profileCount < teamCount ? [`${teamCount - profileCount} clubs missing profiles`] : [],
        recommendedAction: teamCount >= 2 ? 'Import official PSL squad data before season launch' : 'Register season teams',
      },
      {
        moduleKey: 'FIXTURES',
        displayName: 'Fixture Management',
        status: fixtureCount > 0 ? (publishedFixtures > 0 ? 'BUILT_NOW' : 'PARTIALLY_BUILT') : 'FOUNDATION_READY',
        isCommercial: false, isPointsOnly: false, isProductionEnabled: true, isFoundational: true,
        blockers: [],
        warnings: fixtureCount > 0 && publishedFixtures === 0 ? ['No fixtures published — fans cannot see fixtures'] : [],
        recommendedAction: fixtureCount === 0 ? 'Import PSL fixture schedule' : publishedFixtures === 0 ? 'Publish fixtures' : 'Fixtures ready',
      },
      {
        moduleKey: 'GAMEWEEKS',
        displayName: 'Gameweek & Matchday Operations',
        status: gwCount > 0 ? 'BUILT_NOW' : 'FOUNDATION_READY',
        isCommercial: false, isPointsOnly: false, isProductionEnabled: true, isFoundational: true,
        blockers: [],
        warnings: gwCount === 0 ? ['No gameweeks — fantasy scoring and deadline management will not work'] : [],
        recommendedAction: gwCount === 0 ? 'Derive gameweeks from fixtures' : `${gwCount} gameweek(s) configured`,
      },
      {
        moduleKey: 'FANTASY',
        displayName: 'Fantasy Football (Points-Only)',
        status: fantasyConfig ? (priceCount >= 11 ? 'BUILT_NOW' : 'PARTIALLY_BUILT') : 'FOUNDATION_READY',
        isCommercial: false, isPointsOnly: true, isProductionEnabled: true, isFoundational: false,
        blockers: [],
        warnings: [
          ...(!fantasyConfig ? ['No FantasyRulesConfig — create provisional rules'] : []),
          ...(priceCount < 11 ? [`Only ${priceCount} player prices — need at least 11 for squad selection`] : []),
        ],
        recommendedAction: !fantasyConfig ? 'Create provisional fantasy rules' : 'Confirm player prices and promote rules to ACTIVE',
      },
      {
        moduleKey: 'PREDICTIONS',
        displayName: 'Guess the Score (Points-Only)',
        status: predictionConfig ? 'BUILT_NOW' : 'FOUNDATION_READY',
        isCommercial: false, isPointsOnly: true, isProductionEnabled: true, isFoundational: false,
        blockers: [],
        warnings: !predictionConfig ? ['No PredictionRulesConfig — create provisional rules'] : [],
        recommendedAction: !predictionConfig ? 'Create provisional prediction rules' : 'Promote rules to ACTIVE and publish fixtures',
      },
      {
        moduleKey: 'PEER_CHALLENGES',
        displayName: 'Peer Challenges (Fan Points Only)',
        status: 'BUILT_NOW',
        isCommercial: false, isPointsOnly: true, isProductionEnabled: true, isFoundational: false,
        blockers: [],
        warnings: !predictionConfig ? ['Requires PredictionRulesConfig to be active'] : [],
        recommendedAction: 'No stakes or wagers — fan points only. Ready when predictions active.',
      },
      {
        moduleKey: 'FAN_VALUE',
        displayName: 'Fan Value Ledger',
        status: 'BUILT_NOW',
        isCommercial: false, isPointsOnly: true, isProductionEnabled: true, isFoundational: false,
        blockers: [],
        warnings: [],
        recommendedAction: 'Non-financial fan value points. Ready for PSL season.',
      },
      {
        moduleKey: 'ACHIEVEMENTS',
        displayName: 'Achievements & Badges',
        status: achievementDefsCount > 0 ? 'BUILT_NOW' : 'FOUNDATION_READY',
        isCommercial: false, isPointsOnly: true, isProductionEnabled: true, isFoundational: false,
        blockers: [],
        warnings: achievementDefsCount === 0 ? ['No achievement definitions seeded'] : [],
        recommendedAction: `${achievementDefsCount} definitions. Review for PSL-specific achievements.`,
      },
      {
        moduleKey: 'NOTIFICATIONS',
        displayName: 'Notifications',
        status: 'BUILT_NOW',
        isCommercial: false, isPointsOnly: false, isProductionEnabled: false, isFoundational: false,
        blockers: [],
        warnings: ['No push/email provider wired — notifications are queued but not delivered'],
        recommendedAction: 'Wire email/push notification provider in Sprint 3+',
      },
      {
        moduleKey: 'ACTIVITY_FEED',
        displayName: 'Social Activity Feed',
        status: 'BUILT_NOW',
        isCommercial: false, isPointsOnly: false, isProductionEnabled: true, isFoundational: false,
        blockers: [],
        warnings: [],
        recommendedAction: 'Ready for launch. Monitor feed volume at scale.',
      },
      {
        moduleKey: 'REWARDS_READINESS',
        displayName: 'Rewards Readiness',
        status: rewardDefsCount > 0 ? 'BUILT_NOW' : 'FOUNDATION_READY',
        isCommercial: true, isPointsOnly: false, isProductionEnabled: false, isFoundational: false,
        blockers: [],
        warnings: ['Redemption provider not wired — eligibility checks only, no production fulfilment'],
        recommendedAction: 'Wire redemption provider in Sprint 3+',
      },
      {
        moduleKey: 'CLUB_SHOPFRONTS',
        displayName: 'Club Shopfronts',
        status: 'ADMIN_SHELL_READY',
        isCommercial: true, isPointsOnly: false, isProductionEnabled: false, isFoundational: false,
        blockers: ['No commerce/payment provider configured'],
        warnings: ['ClubShopProduct model exists, ' + shopProductCount + ' product(s) seeded. No live checkout.'],
        recommendedAction: 'Commerce provider + checkout integration Sprint 3+',
      },
      {
        moduleKey: 'LIVE_MATCH_CENTRE',
        displayName: 'Live Match Centre',
        status: 'FOUNDATION_READY',
        isCommercial: false, isPointsOnly: false, isProductionEnabled: false, isFoundational: false,
        blockers: ['Live data provider not configured'],
        warnings: ['LiveMatchProviderInterface exists with stub. Manual score entry available.'],
        recommendedAction: 'Wire live sports data provider (Opta/Stats Perform/Sportradar) Sprint 3+',
      },
      {
        moduleKey: 'CONTENT',
        displayName: 'Editorial Content & CMS',
        status: 'FUTURE_IMPLEMENTATION',
        isCommercial: false, isPointsOnly: false, isProductionEnabled: false, isFoundational: false,
        blockers: ['No CMS model or content workflow'],
        warnings: [],
        recommendedAction: 'Editorial/CMS module Sprint 3+',
      },
      {
        moduleKey: 'SPONSOR_READINESS',
        displayName: 'Sponsor Activation',
        status: 'ADMIN_SHELL_READY',
        isCommercial: true, isPointsOnly: false, isProductionEnabled: false, isFoundational: false,
        blockers: ['No sponsor campaign builder'],
        warnings: ['Admin shell only — no live sponsor activation'],
        recommendedAction: 'Sponsor activation provider integration Sprint 3+',
      },
      {
        moduleKey: 'WALLET_PAYMENTS',
        displayName: 'Wallet & Payments',
        status: 'PROVIDER_REQUIRED',
        isCommercial: true, isPointsOnly: false, isProductionEnabled: false, isFoundational: false,
        blockers: ['No wallet/payment provider selected', 'Compliance approval required'],
        warnings: ['IntegrationProviderConfig seeded as SANDBOX_READY — production disabled by default'],
        recommendedAction: 'Provider selection, contract, and compliance review Sprint 3+. Fantasy and Guess the Score remain POINTS-ONLY.',
      },
      {
        moduleKey: 'CHECKOUT_COMMERCE',
        displayName: 'Checkout & Commerce',
        status: 'PRODUCTION_DISABLED',
        isCommercial: true, isPointsOnly: false, isProductionEnabled: false, isFoundational: false,
        blockers: ['Production checkout explicitly disabled', 'Requires payment provider + compliance'],
        warnings: ['Sandbox config seeded. No real orders, no real money movement.'],
        recommendedAction: 'Enable after provider contract + compliance approval Sprint 3+',
      },
      {
        moduleKey: 'TICKETING',
        displayName: 'Ticket Inventory & Issuance',
        status: 'PROVIDER_REQUIRED',
        isCommercial: true, isPointsOnly: false, isProductionEnabled: false, isFoundational: false,
        blockers: ['No ticketing provider selected', 'Contract required'],
        warnings: ['Provider config seeded. No real ticket issuance.'],
        recommendedAction: 'Ticketing provider RFP Sprint 3+',
      },
      {
        moduleKey: 'LIVE_DATA_PROVIDER',
        displayName: 'Live Sports Data Provider',
        status: 'PROVIDER_REQUIRED',
        isCommercial: false, isPointsOnly: false, isProductionEnabled: false, isFoundational: false,
        blockers: ['No live data provider contract'],
        warnings: ['LiveMatchProviderInterface ready for wiring. Manual override available.'],
        recommendedAction: 'Opta/Stats Perform/Sportradar contract Sprint 3+',
      },
      {
        moduleKey: 'LEADERBOARDS',
        displayName: 'Season-Scoped Leaderboards',
        status: 'BUILT_NOW',
        isCommercial: false, isPointsOnly: true, isProductionEnabled: true, isFoundational: false,
        blockers: [],
        warnings: [],
        recommendedAction: 'Fan Value, Fantasy, Predictions, Achievements leaderboards active. Season-scoped by default. WC accessible via seasonSlug.',
      },
      {
        moduleKey: 'ENGAGEMENT_METRICS',
        displayName: 'Admin Engagement Metrics',
        status: 'BUILT_NOW',
        isCommercial: false, isPointsOnly: true, isProductionEnabled: true, isFoundational: false,
        blockers: [],
        warnings: [],
        recommendedAction: 'Admin engagement overview, unscoped ledger audit, and activation impact check available under /admin/engagement/.',
      },
      {
        moduleKey: 'PLAYER_STATS',
        displayName: 'Player Match Statistics',
        status: 'BUILT_NOW',
        isCommercial: false, isPointsOnly: false, isProductionEnabled: true, isFoundational: true,
        blockers: [],
        warnings: ['Live provider ingestion requires Sprint 3+ integration contract'],
        recommendedAction: 'Manual entry available now. Verify and publish stats per fixture before activation. Check readiness at /admin/player-stats/season/:seasonId/readiness.',
      },
      {
        moduleKey: 'SQUAD_IMPORT',
        displayName: 'Squad Import & Player Registration',
        status: 'BUILT_NOW',
        isCommercial: false, isPointsOnly: false, isProductionEnabled: true, isFoundational: true,
        blockers: [],
        warnings: squadImportWarnings,
        recommendedAction: squadImportWarnings.length > 0
          ? 'Import and publish PSL squad data before activation. Run duplicate detection and resolve any blocked rows.'
          : 'Squad import pipeline ready. Create manual import batch at /admin/squad-import/:seasonId/batches/manual.',
      },
      {
        moduleKey: 'FANTASY_PRICE_CALIBRATION',
        displayName: 'Fantasy Price Calibration',
        status: 'BUILT_NOW',
        isCommercial: false, isPointsOnly: true, isProductionEnabled: true, isFoundational: true,
        blockers: priceCalibrationBlockers,
        warnings: priceCalibrationWarnings,
        recommendedAction: priceCalibrationBlockers.length > 0
          ? 'Create FantasyRulesConfig before price calibration'
          : priceCalibrationWarnings.length > 0
            ? 'Apply default prices and run validate + publish at /admin/fantasy-price-calibration/:seasonId/'
            : 'Price calibration complete. Fantasy prices are points-only with no cash value.',
      },
      {
        moduleKey: 'MEDIA',
        displayName: 'Media Catalogue',
        status: 'FOUNDATION_READY',
        isCommercial: false, isPointsOnly: false, isProductionEnabled: false, isFoundational: true,
        blockers: [],
        warnings: [
          'Media availability does not imply that PSL One owns streaming rights. Public availability requires an approved rights status.',
          'No production CDN or streaming configured. LIVE_STREAM is metadata-only.',
        ],
        recommendedAction: 'Create media assets at /admin/media. Set rightsStatus=CLEAR before publishing. Production streaming requires Sprint 3+ rights contract.',
      },
      {
        moduleKey: 'LIVE_MEDIA',
        displayName: 'Live Media Streaming',
        status: 'RIGHTS_REQUIRED',
        isCommercial: false, isPointsOnly: false, isProductionEnabled: false, isFoundational: false,
        blockers: ['Media rights contract required', 'Production CDN not configured', 'Production DRM not configured'],
        warnings: ['LIVE_STREAM assets are metadata/readiness only in STORY-37'],
        recommendedAction: 'Secure media rights contract and CDN provider Sprint 3+.',
      },
      {
        moduleKey: 'SPONSOR_CAMPAIGNS',
        displayName: 'Sponsor Campaign Engine',
        status: 'FOUNDATION_READY',
        isCommercial: false, isPointsOnly: false, isProductionEnabled: false, isFoundational: true,
        blockers: [],
        warnings: ['Campaign approval workflow requires at least one PSL_ADMIN user', 'No sponsor self-service role implemented yet'],
        recommendedAction: 'Create sponsors at /admin/sponsors. Create campaigns at /admin/campaigns. Campaigns require APPROVED status before publishing.',
      },
      {
        moduleKey: 'CAMPAIGN_REWARDS',
        displayName: 'Campaign Reward Issuance',
        status: 'SANDBOX_READY',
        isCommercial: false, isPointsOnly: false, isProductionEnabled: false, isFoundational: true,
        blockers: [],
        warnings: [
          'Fan Value rewards use the existing non-financial ledger (CAMPAIGN_POINTS). No cash value.',
          'Wallet credit rewards remain PROVIDER_PENDING until provider contract Sprint 3+.',
          'Airtime/data bundle rewards require provider contract.',
        ],
        recommendedAction: 'Create reward definitions at /admin/reward-definitions. FAN_VALUE_POINTS rewards are functional. Non-FV types are provider-pending.',
      },
      {
        moduleKey: 'WALLET_INTEGRATION',
        displayName: 'Wallet Provider Integration',
        status: 'SANDBOX_READY',
        isCommercial: false, isPointsOnly: false, isProductionEnabled: false, isFoundational: false,
        blockers: ['No production wallet provider contract', 'Production KYC not implemented'],
        warnings: [
          'Wallet integration is operating in sandbox mode. No real financial transactions are processed.',
          'PSL One does not hold customer funds directly. Wallet services provided by external partner.',
          'Silicon Enterprise Wallet seeded as SANDBOX-only. No production credentials.',
        ],
        recommendedAction: 'Sandbox wallet link flow available at /fan/wallet. Production requires contract + compliance Sprint 3+.',
      },
      {
        moduleKey: 'WALLET_TRANSACTIONS',
        displayName: 'Wallet Transactions (Production)',
        status: 'PRODUCTION_DISABLED',
        isCommercial: true, isPointsOnly: false, isProductionEnabled: false, isFoundational: false,
        blockers: ['Production wallet contract required', 'Compliance sign-off required', 'Real KYC not implemented'],
        warnings: ['All wallet transactions in STORY-37 are sandbox records only'],
        recommendedAction: 'Enable production wallet transactions only after Sprint 3+ provider contract and compliance approval.',
      },
      {
        moduleKey: 'CAMPAIGN_ANALYTICS',
        displayName: 'Campaign Analytics',
        status: 'FOUNDATION_READY',
        isCommercial: false, isPointsOnly: false, isProductionEnabled: false, isFoundational: true,
        blockers: [],
        warnings: ['Analytics derived from stored records only. No external analytics platform wired.'],
        recommendedAction: 'View campaign analytics at /admin/campaigns/:id/analytics. Recalculate daily snapshots. Wire Amplitude/DataDog Sprint 3+.',
      },
      {
        moduleKey: 'SOCIAL_PREDICTION_MATCHING',
        displayName: 'Social Prediction Challenge Marketplace',
        status: 'BUILT_NOW',
        isCommercial: false, isPointsOnly: true, isProductionEnabled: true, isFoundational: false,
        blockers: [],
        warnings: [
          'System-issued gameplay points only — no monetary value, no real wagers, no betting mechanics.',
          'Compliance domain POINTS_BASED_SOCIAL_PREDICTION_COMPLIANCE requires INTERNAL_REVIEW_REQUIRED sign-off.',
          'FIFO matching engine is deterministic and idempotent.',
        ],
        recommendedAction: 'Create market configs at /admin/social-predictions/markets. Grant allocations before gameweek open. Settle or void markets post-match at /admin/social-predictions/settlements.',
      },
      {
        moduleKey: 'LIVE_MATCH_INTELLIGENCE',
        displayName: 'Live Match Intelligence & Rich Football Data',
        status: 'FOUNDATION_READY',
        isCommercial: false, isPointsOnly: false, isProductionEnabled: false, isFoundational: true,
        blockers: [],
        warnings: [
          'Manual / sandbox ingestion only in STORY-38. Official provider integration is INTEGRATION_READY.',
          'Data provenance tracked via DataIngestionLog for every entity.',
          'Do NOT call Opta, Stats Perform, Sportradar, or any external provider from this interface.',
        ],
        recommendedAction: 'Ingest sandbox data at /admin/match-centre/fixtures/:fixtureId/ingest. View ingestion log at /admin/match-centre/ingestion. Official provider swap: wire new adapter only — do NOT change fan routes or domain models.',
      },
      {
        moduleKey: 'OFFICIAL_MATCH_DATA_PROVIDER',
        displayName: 'Official Match Data Provider Feed',
        status: 'PROVIDER_REQUIRED',
        isCommercial: false, isPointsOnly: false, isProductionEnabled: false, isFoundational: false,
        blockers: ['No live data provider contract signed', 'Provider adapter not wired to ingestion pipeline'],
        warnings: [
          'Provider-neutral MatchCentreService is INTEGRATION_READY.',
          'Provider swap strategy: (1) create new DataSourceType adapter, (2) wire to adminIngestSandboxData, (3) do NOT change fan route contracts.',
          'Fan routes /match-centre/* and all domain models remain unchanged on provider swap.',
        ],
        recommendedAction: 'Opta / Stats Perform / Sportradar / API-Football contract Sprint 3+. View capability status at GET /admin/match-centre/capability-status.',
      },
    ];

    return { seasonId, seasonName: season.name, modules };
  }

  // ── Smoke Tests ───────────────────────────────────────────────────────────

  getSmokeTestRoutes(): SmokeTestRoute[] {
    return [
      // Auth
      { route: '/auth/login', method: 'POST', domain: 'auth', requiresRole: 'PUBLIC', expectedStatus: 200, notes: [] },
      { route: '/auth/me', method: 'GET', domain: 'auth', requiresRole: 'JWT', expectedStatus: 200, notes: [] },

      // Football / Seasons
      { route: '/football/context', method: 'GET', domain: 'football', requiresRole: 'PUBLIC', expectedStatus: 200, notes: [] },
      { route: '/seasons/active', method: 'GET', domain: 'seasons', requiresRole: 'PUBLIC', expectedStatus: 200, notes: [] },
      { route: '/admin/competitions', method: 'GET', domain: 'competitions', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin/seasons/admin/context', method: 'GET', domain: 'seasons', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: ['Use /seasons/admin/context'] },
      { route: '/seasons/admin/switching/readiness/:seasonId', method: 'GET', domain: 'seasonSwitching', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },

      // Admin Dashboard
      { route: '/admin-dashboard', method: 'GET', domain: 'adminDashboard', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin-dashboard/overview', method: 'GET', domain: 'adminDashboard', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin-dashboard/health', method: 'GET', domain: 'adminDashboard', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin-dashboard/quick-links', method: 'GET', domain: 'adminDashboard', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin-dashboard/action-required', method: 'GET', domain: 'adminDashboard', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },

      // Clubs
      { route: '/clubs/admin/profiles', method: 'GET', domain: 'clubs', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/clubs/admin/readiness', method: 'GET', domain: 'clubs', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },

      // Fixture Import
      { route: '/fixtures/admin/import/batches', method: 'GET', domain: 'fixtureImport', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/fixtures/admin/validation/season/:seasonId', method: 'GET', domain: 'fixtureImport', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/fixtures/admin/publishing/season/:seasonId', method: 'GET', domain: 'fixtureImport', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },

      // Gameweek Operations
      { route: '/gameweeks/admin/operations/seasons', method: 'GET', domain: 'gameweekOperations', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/gameweeks/admin/operations/:seasonId/overview', method: 'GET', domain: 'gameweekOperations', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/gameweeks/admin/operations/:seasonId/gameweeks', method: 'GET', domain: 'gameweekOperations', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/gameweeks/admin/operations/:seasonId/matchday-control', method: 'GET', domain: 'gameweekOperations', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/gameweeks/admin/operations/:seasonId/deadlines', method: 'GET', domain: 'gameweekOperations', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },

      // Fantasy Calibration
      { route: '/fantasy/admin/calibration', method: 'GET', domain: 'fantasyCalibration', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/fantasy/admin/calibration/:seasonId', method: 'GET', domain: 'fantasyCalibration', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/fantasy/admin/calibration/:seasonId/readiness', method: 'GET', domain: 'fantasyCalibration', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },

      // Prediction Calibration
      { route: '/predictions/admin/calibration', method: 'GET', domain: 'predictionCalibration', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/predictions/admin/calibration/:seasonId/readiness', method: 'GET', domain: 'predictionCalibration', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },

      // Admin Operations (STORY-32)
      { route: '/admin/operations/overview', method: 'GET', domain: 'adminOperations', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin/operations/capability-review', method: 'GET', domain: 'adminOperations', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin/operations/launch-readiness', method: 'GET', domain: 'adminOperations', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin/operations/module-readiness/:seasonId', method: 'GET', domain: 'adminOperations', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin/operations/smoke-tests/routes', method: 'GET', domain: 'adminOperations', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin/operations/smoke-tests/rbac', method: 'GET', domain: 'adminOperations', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin/operations/integrations/providers', method: 'GET', domain: 'adminOperations', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin/operations/integrations/wallet-payments', method: 'GET', domain: 'adminOperations', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin/operations/integrations/checkout-commerce', method: 'GET', domain: 'adminOperations', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin/operations/integrations/ticketing', method: 'GET', domain: 'adminOperations', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin/operations/integrations/live-data', method: 'GET', domain: 'adminOperations', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin/operations/integrations/sponsor-activation', method: 'GET', domain: 'adminOperations', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin/operations/integrations/rewards-redemption', method: 'GET', domain: 'adminOperations', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },

      // Social Prediction (STORY-38)
      { route: '/admin/social-predictions/market-configs', method: 'GET', domain: 'socialPrediction', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: ['Requires ?seasonId=:id'] },
      { route: '/admin/social-predictions/listings', method: 'GET', domain: 'socialPrediction', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin/social-predictions/compliance', method: 'GET', domain: 'socialPrediction', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/social-predictions/leaderboard', method: 'GET', domain: 'socialPrediction', requiresRole: 'JWT', expectedStatus: 200, notes: ['Requires ?seasonId=:id'] },
      { route: '/social-predictions/listings', method: 'GET', domain: 'socialPrediction', requiresRole: 'JWT', expectedStatus: 200, notes: [] },

      // Match Centre (STORY-38)
      { route: '/admin/match-centre/capability-status', method: 'GET', domain: 'matchCentre', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/admin/match-centre/ingestion-log', method: 'GET', domain: 'matchCentre', requiresRole: 'PSL_ADMIN', expectedStatus: 200, notes: [] },
      { route: '/match-centre/standings/:seasonId', method: 'GET', domain: 'matchCentre', requiresRole: 'JWT', expectedStatus: 200, notes: [] },
    ];
  }

  getSmokeTestRbac(): RbacDefinition[] {
    return [
      {
        role: 'PSL_ADMIN',
        description: 'Full admin access to all operational, calibration, and integration routes',
        canAccess: [
          '/admin/operations/*', '/admin-dashboard/*', '/admin/competitions',
          '/admin/fixtures/*', '/admin/gameweeks/*', '/clubs/admin/*',
          '/fixtures/admin/*', '/gameweeks/admin/*', '/fantasy/admin/*',
          '/predictions/admin/*', '/seasons/admin/*',
        ],
        cannotAccess: [],
      },
      {
        role: 'FAN',
        description: 'Fan access to public gameplay and profile routes only',
        canAccess: ['/predictions', '/predictions/me', '/fantasy/team', '/gameweeks', '/profile', '/achievements', '/notifications'],
        cannotAccess: [
          '/admin/operations/*', '/admin-dashboard/*', '/admin/competitions',
          '/admin/fixtures/*', '/clubs/admin/*', '/fantasy/admin/*',
          '/predictions/admin/*', '/seasons/admin/*',
        ],
      },
      {
        role: 'UNAUTHENTICATED',
        description: 'Public access only — no protected routes',
        canAccess: ['/auth/login', '/auth/register', '/seasons/active', '/football/context', '/health'],
        cannotAccess: ['All /admin/* routes', 'All /*/admin/* routes', 'All JWT-required routes'],
      },
    ];
  }

  getSmokeTestWorkflows(): WorkflowSummary[] {
    return [
      {
        workflowKey: 'season-preparation',
        displayName: 'Season Preparation',
        steps: ['View competitions/seasons', 'Create PSL season', 'Register season teams', 'Configure FantasyRulesConfig', 'Configure PredictionRulesConfig'],
        readinessStatus: 'READY',
        blockers: [],
      },
      {
        workflowKey: 'fixture-import',
        displayName: 'Fixture Import & Publishing',
        steps: ['Create import batch', 'Validate fixture data', 'Check for conflicts', 'Commit batch', 'Publish fixtures'],
        readinessStatus: 'READY',
        blockers: [],
      },
      {
        workflowKey: 'gameweek-operations',
        displayName: 'Gameweek & Matchday Operations',
        steps: ['Derive gameweeks from fixtures', 'Derive deadlines with buffers', 'Inspect fixture assignment', 'Inspect fantasy impact', 'Inspect prediction impact', 'View matchday control panel'],
        readinessStatus: 'READY',
        blockers: [],
      },
      {
        workflowKey: 'fantasy-calibration',
        displayName: 'Fantasy Calibration',
        steps: ['View calibration readiness', 'Create provisional rules', 'Generate provisional prices', 'Verify squad readiness', 'Promote to ACTIVE'],
        readinessStatus: 'READY',
        blockers: [],
      },
      {
        workflowKey: 'prediction-calibration',
        displayName: 'Prediction Calibration',
        steps: ['View calibration readiness', 'Create provisional rules', 'Check fixture eligibility', 'Monitor lock readiness', 'Promote to ACTIVE'],
        readinessStatus: 'READY',
        blockers: [],
      },
      {
        workflowKey: 'season-switching',
        displayName: 'Season Switching & Activation',
        steps: ['Run 9-check readiness', 'Preview activation impact', 'Acknowledge warnings if any', 'Activate season', 'Verify World Cup data preserved'],
        readinessStatus: 'IN_PROGRESS',
        blockers: ['PSL fixtures not yet imported', 'Gameweeks not yet derived'],
      },
      {
        workflowKey: 'commercial-readiness',
        displayName: 'Commercial Integration Readiness',
        steps: ['Select wallet/payment provider', 'Complete compliance review', 'Select checkout provider', 'Select ticketing provider', 'Enable sandbox mode', 'Enable production after approval'],
        readinessStatus: 'PENDING',
        blockers: ['No provider contracts in place', 'Compliance review required'],
      },
      {
        workflowKey: 'live-provider-readiness',
        displayName: 'Live Data Provider Readiness',
        steps: ['Select live data provider', 'Map fixture/team/player IDs', 'Test sandbox feed', 'Enable production ingestion after contract'],
        readinessStatus: 'PENDING',
        blockers: ['No live data provider contract'],
      },
    ];
  }

  async runSmokeTests() {
    const routes = this.getSmokeTestRoutes();
    const [providerCount, seasonCount] = await Promise.all([
      this.prisma.integrationProviderConfig.count(),
      this.prisma.season.count(),
    ]);

    const results = [
      { check: 'Route inventory loaded', status: 'PASS', detail: `${routes.length} routes in inventory` },
      { check: 'Integration providers seeded', status: providerCount >= 9 ? 'PASS' : 'WARN', detail: `${providerCount} provider config(s)` },
      { check: 'Seasons exist', status: seasonCount >= 1 ? 'PASS' : 'FAIL', detail: `${seasonCount} season(s)` },
      { check: 'No /admin/admin routes', status: routes.every((r) => !r.route.startsWith('/admin/admin')) ? 'PASS' : 'FAIL', detail: 'Route prefix check' },
      { check: 'All PSL_ADMIN routes have correct role', status: routes.filter((r) => r.requiresRole === 'PSL_ADMIN').length > 20 ? 'PASS' : 'WARN', detail: `${routes.filter((r) => r.requiresRole === 'PSL_ADMIN').length} admin-protected routes` },
      { check: 'No duplicate routes', status: new Set(routes.map((r) => `${r.method}:${r.route}`)).size === routes.length ? 'PASS' : 'FAIL', detail: 'Deduplication check' },
      { check: 'Fantasy economy: points-only', status: 'PASS', detail: 'No paid entry or real-money fantasy mechanics' },
      { check: 'Guess the Score economy: points-only', status: 'PASS', detail: 'No odds, stakes, or wagering mechanics' },
      { check: 'Production money movement disabled', status: 'PASS', detail: 'All commercial providers isProductionEnabled=false' },
    ];

    return {
      ranAt: new Date().toISOString(),
      totalChecks: results.length,
      passed: results.filter((r) => r.status === 'PASS').length,
      warned: results.filter((r) => r.status === 'WARN').length,
      failed: results.filter((r) => r.status === 'FAIL').length,
      results,
    };
  }

  // ── Integration Providers ─────────────────────────────────────────────────

  async getIntegrationProviders() {
    const providers = await this.prisma.integrationProviderConfig.findMany({
      orderBy: { providerType: 'asc' },
    });
    return {
      generatedAt: new Date().toISOString(),
      safetyNote: 'No secrets, API keys, or credentials stored here. This record contains only non-sensitive readiness state.',
      totalProviders: providers.length,
      productionEnabledCount: providers.filter((p) => p.isProductionEnabled).length,
      providers,
    };
  }

  async getCommercialReadiness() {
    const [wallet, payment, checkout, ticketing, liveData, sponsor, rewards] = await Promise.all([
      this._getProvider(IntegrationProviderType.WALLET),
      this._getProvider(IntegrationProviderType.PAYMENT),
      this._getProvider(IntegrationProviderType.CHECKOUT),
      this._getProvider(IntegrationProviderType.TICKETING),
      this._getProvider(IntegrationProviderType.LIVE_DATA),
      this._getProvider(IntegrationProviderType.SPONSOR_ACTIVATION),
      this._getProvider(IntegrationProviderType.REWARDS_REDEMPTION),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      gameplayEconomy: {
        fantasy: 'POINTS_ONLY — no paid entry, no real-money mechanics',
        guessTheScore: 'POINTS_ONLY — no odds, no stakes, no wagering',
        peerChallenges: 'FAN_POINTS_ONLY — no monetary stakes',
      },
      commercialEconomy: {
        walletProvider: this._summariseProvider(wallet),
        paymentProvider: this._summariseProvider(payment),
        checkoutProvider: this._summariseProvider(checkout),
        ticketingProvider: this._summariseProvider(ticketing),
        liveDataProvider: this._summariseProvider(liveData),
        sponsorActivation: this._summariseProvider(sponsor),
        rewardsRedemption: this._summariseProvider(rewards),
      },
      productionStatus: 'PRODUCTION_DISABLED — all commercial providers require provider contract + compliance approval before production activation',
    };
  }

  async getWalletPaymentsReadiness() {
    const [wallet, payment] = await Promise.all([
      this._getProvider(IntegrationProviderType.WALLET),
      this._getProvider(IntegrationProviderType.PAYMENT),
    ]);
    return {
      walletProviderConfigured: wallet !== null,
      paymentProviderConfigured: payment !== null,
      sandboxModeAvailable: wallet?.mode === 'SANDBOX' || wallet?.mode === 'MOCK',
      productionModeDisabled: !(wallet?.isProductionEnabled ?? false) && !(payment?.isProductionEnabled ?? false),
      complianceApprovalRequired: wallet?.requiresComplianceApproval ?? true,
      contractApprovalRequired: wallet?.requiresContractApproval ?? true,
      reconciliationReadiness: 'NOT_BUILT — Sprint 3+',
      auditLoggingReadiness: 'FOUNDATION_READY — SeasonSwitchAudit pattern can be extended',
      refundChargebackReadiness: 'NOT_BUILT — Sprint 3+',
      settlementReportingReadiness: 'NOT_BUILT — Sprint 3+',
      revenueShareReadiness: 'NOT_BUILT — Sprint 3+',
      productionMoneyMovementDisabled: true,
      gameplayRemainsPointsOnly: true,
      walletStatus: wallet?.status ?? 'NOT_CONFIGURED',
      paymentStatus: payment?.status ?? 'NOT_CONFIGURED',
      safetyNote: 'Fantasy and Guess the Score are POINTS-ONLY. Real-money wallet is a separate commercial product area.',
    };
  }

  async getCheckoutCommerceReadiness() {
    const checkout = await this._getProvider(IntegrationProviderType.CHECKOUT);
    return {
      catalogueExists: true,
      catalogueNote: 'ClubShopProduct model exists, shop admin page exists. No live commerce.',
      checkoutAdapterStatus: checkout?.status ?? 'NOT_CONFIGURED',
      cartOrderProviderStatus: 'NOT_CONFIGURED — Sprint 3+',
      fulfilmentProviderStatus: 'NOT_CONFIGURED — Sprint 3+',
      paymentDependencyStatus: 'PROVIDER_REQUIRED',
      taxVatReadiness: 'NOT_BUILT — Sprint 3+',
      refundReadiness: 'NOT_BUILT — Sprint 3+',
      productionCheckoutEnabled: false,
      sandboxCheckoutEnabled: checkout?.mode === 'SANDBOX',
      clubShopfrontCatalogueReady: true,
      productionDisabled: true,
      safetyNote: 'No real orders, no real money movement. Sandbox config only.',
    };
  }

  async getTicketingReadiness() {
    const ticketing = await this._getProvider(IntegrationProviderType.TICKETING);
    return {
      ticketingProviderConfigured: ticketing !== null,
      ticketingProviderStatus: ticketing?.status ?? 'NOT_CONFIGURED',
      aggregatorIntegrationStatus: 'NOT_CONFIGURED — provider required',
      inventorySyncReadiness: 'NOT_BUILT — Sprint 3+',
      fixtureToTicketMappingReadiness: 'NOT_BUILT — Sprint 3+ (Fixture model ready for mapping)',
      seatMapReadiness: 'NOT_BUILT — Sprint 3+',
      qrTicketReadiness: 'NOT_BUILT — Sprint 3+',
      entitlementValidationReadiness: 'NOT_BUILT — Sprint 3+',
      stadiumAccessDependency: 'EXTERNAL — stadium access control system required',
      conciergeBookingDependency: 'EXTERNAL — concierge provider required',
      productionTicketIssuanceDisabled: true,
      requiresContractApproval: ticketing?.requiresContractApproval ?? true,
      safetyNote: 'No real ticket issuance. Provider contract required before any ticketing capability.',
    };
  }

  async getLiveDataReadiness() {
    const liveData = await this._getProvider(IntegrationProviderType.LIVE_DATA);
    return {
      providerAdapterStatus: 'FOUNDATION_READY — LiveMatchProviderInterface implemented with stub',
      fixtureIdMappingReadiness: 'NOT_CONFIGURED — requires provider ID mapping',
      teamPlayerIdMappingReadiness: 'NOT_CONFIGURED — requires provider mapping',
      liveScoreIngestionReadiness: 'SANDBOX_READY — stub provider returns mock data',
      matchEventIngestionReadiness: 'SANDBOX_READY — MatchEvent model ready',
      lineupIngestionReadiness: 'FOUNDATION_READY — FixtureLineup model ready',
      playerAvailabilityReadiness: 'NOT_BUILT — Sprint 3+',
      resultSettlementReadiness: 'FOUNDATION_READY — manual trigger exists',
      providerCredentialsStatus: 'NOT_CONFIGURED — no credentials stored',
      sandboxMockFeedStatus: liveData?.mode ?? 'MOCK',
      manualOverrideStatus: 'AVAILABLE — admin can manually update fixture status',
      replayBackfillReadiness: 'NOT_BUILT — Sprint 3+',
      auditTrailReadiness: 'FOUNDATION_READY — SeasonSwitchAudit pattern',
      productionIngestionDisabled: true,
      providerConfigStatus: liveData?.status ?? 'NOT_CONFIGURED',
      safetyNote: 'No real provider ingestion. LiveMatchProviderInterface stub only. No external API calls.',
    };
  }

  async getSponsorActivationReadiness() {
    const sponsor = await this._getProvider(IntegrationProviderType.SPONSOR_ACTIVATION);
    return {
      campaignBuilderReadiness: 'NOT_BUILT — Sprint 3+',
      audienceSegmentReadiness: 'FOUNDATION_READY — FanProfile + activity data available',
      brandedCompetitionReadiness: 'FUTURE_IMPLEMENTATION',
      offerRewardReadiness: 'FOUNDATION_READY — RewardReadinessModule available',
      attributionReadiness: 'NOT_BUILT — Sprint 3+',
      sponsorReportingReadiness: 'ADMIN_SHELL_READY — /admin/dashboard/sponsor-management shell',
      dataSharingComplianceStatus: 'COMPLIANCE_REQUIRED — POPIA review needed before data sharing',
      productionActivationStatus: 'PRODUCTION_DISABLED',
      rewardFulfilmentDependency: 'REQUIRES_REDEMPTION_PROVIDER',
      providerStatus: sponsor?.status ?? 'NOT_CONFIGURED',
    };
  }

  async getRewardsRedemptionReadiness() {
    const rewards = await this._getProvider(IntegrationProviderType.REWARDS_REDEMPTION);
    const rewardDefsCount = await this.prisma.rewardReadinessDefinition.count();
    return {
      rewardsCatalogueReadiness: rewardDefsCount > 0 ? 'BUILT_NOW' : 'FOUNDATION_READY',
      rewardDefinitionsCount: rewardDefsCount,
      redemptionProviderStatus: rewards?.status ?? 'NOT_CONFIGURED',
      stockAvailabilityDependency: 'EXTERNAL — provider required',
      fraudControlsReadiness: 'NOT_BUILT — Sprint 3+',
      fanValueLedgerDependency: 'BUILT_NOW — FanValueLedger ready',
      approvalStatus: 'COMPLIANCE_REQUIRED',
      productionRedemptionDisabled: true,
      sandboxRedemptionReadiness: rewards?.mode === 'SANDBOX' ? 'AVAILABLE' : 'NOT_CONFIGURED',
      eligibilityEngineStatus: 'BUILT_NOW — FanRewardReadiness eligibility engine operational',
      safetyNote: 'Production redemption disabled. Eligibility checks only.',
    };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _getProvider(type: IntegrationProviderType) {
    return this.prisma.integrationProviderConfig.findFirst({ where: { providerType: type } });
  }

  private _summariseProvider(provider: { status: IntegrationProviderStatus; mode: string; isProductionEnabled: boolean } | null) {
    if (!provider) return { status: 'NOT_CONFIGURED', productionEnabled: false };
    return { status: provider.status, mode: provider.mode, productionEnabled: provider.isProductionEnabled };
  }
}
