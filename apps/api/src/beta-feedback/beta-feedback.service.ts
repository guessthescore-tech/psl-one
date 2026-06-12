import { Injectable } from '@nestjs/common';

export interface KnownIssue {
  id: string;
  title: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: string;
  description: string;
  status: 'OPEN' | 'TRACKED' | 'DEFERRED' | 'RESOLVED';
  sprint: string;
  resolution: string;
}

export interface UxCheckItem {
  area: string;
  check: string;
  status: 'PASS' | 'WARN' | 'FAIL' | 'PENDING';
  notes: string;
}

export interface ReleaseNote {
  story: string;
  commit: string;
  title: string;
  summary: string;
  keyDeliverables: string[];
  safetyBoundaries: string[];
}

export interface BetaOverview {
  betaStatus: string;
  totalKnownIssues: number;
  highPriorityCount: number;
  uxChecklistPasses: number;
  uxChecklistWarnings: number;
  uxChecklistFails: number;
  releaseReadiness: string;
  completedStories: number;
  apiTestCount: number;
  webPageCount: number;
  recommendedNextActions: string[];
  safetyStatus: string;
  generatedAt: string;
}

@Injectable()
export class BetaFeedbackService {
  getOverview(): BetaOverview {
    const issues = this.getKnownIssuesList();
    const checklist = this.getUxChecklistItems();
    return {
      betaStatus: 'BETA_READY',
      totalKnownIssues: issues.length,
      highPriorityCount: issues.filter((i) => i.severity === 'HIGH').length,
      uxChecklistPasses: checklist.filter((c) => c.status === 'PASS').length,
      uxChecklistWarnings: checklist.filter((c) => c.status === 'WARN').length,
      uxChecklistFails: checklist.filter((c) => c.status === 'FAIL').length,
      releaseReadiness: 'WORLD_CUP_BETA_READY_PSL_PENDING',
      completedStories: 10,
      apiTestCount: 1270,
      webPageCount: 165,
      recommendedNextActions: [
        'Import official PSL 2026/27 fixture schedule via /admin/fixtures/imports',
        'Promote PSL fantasy rules from PROVISIONAL to ACTIVE',
        'Promote PSL prediction rules from PROVISIONAL to ACTIVE',
        'Resolve all 11 season-switching readiness checks before PSL activation',
        'Wire real auth session — admin users must log in at /login before accessing admin pages',
        'Sprint 3: live sports data provider contract',
        'Sprint 3: production deployment to AWS ECS',
        'Sprint 3: email/SMS/push notification provider',
      ],
      safetyStatus: 'COMPLIANT',
      generatedAt: new Date().toISOString(),
    };
  }

  getKnownIssues(): { issues: KnownIssue[]; total: number; note: string } {
    const issues = this.getKnownIssuesList();
    return {
      issues,
      total: issues.length,
      note: 'Known issues are tracked here for beta planning. Not a substitute for a production issue tracker.',
    };
  }

  getUxChecklist(): { checks: UxCheckItem[]; summary: Record<string, number>; note: string } {
    const checks = this.getUxChecklistItems();
    return {
      checks,
      summary: {
        PASS: checks.filter((c) => c.status === 'PASS').length,
        WARN: checks.filter((c) => c.status === 'WARN').length,
        FAIL: checks.filter((c) => c.status === 'FAIL').length,
        PENDING: checks.filter((c) => c.status === 'PENDING').length,
      },
      note: 'UX checklist reflects beta readiness. WARN items are known limitations for Sprint 3.',
    };
  }

  getReleaseNotes(): { notes: ReleaseNote[]; currentVersion: string; note: string } {
    return {
      currentVersion: 'Sprint 2 — STORY-35',
      notes: this.getReleaseNotesList(),
      note: 'Release notes cover Sprint 2 stories. Sprint 1 foundation committed in feat: complete sprint 1 fan platform foundation.',
    };
  }

  private getKnownIssuesList(): KnownIssue[] {
    return [
      {
        id: 'KI-001',
        title: 'Admin pages require manual login — no persistent session UI',
        severity: 'HIGH',
        category: 'Auth / Session',
        description:
          'Admin web pages read JWT from localStorage (set by POST /auth/login). No dedicated admin login page or session persistence UI exists yet. Admin users must login via /login and store the token before admin pages will function.',
        status: 'TRACKED',
        sprint: 'Sprint 3',
        resolution: 'Full admin login page + session management in Sprint 3 pre-production hardening.',
      },
      {
        id: 'KI-002',
        title: 'Official PSL fixture data not yet imported',
        severity: 'HIGH',
        category: 'Data Readiness',
        description:
          'The platform is seeded with 96 provisional placeholder players and has the import pipeline ready, but official PSL 2026/27 squad and fixture data has not been imported. PSL season cannot be activated until official data is available.',
        status: 'TRACKED',
        sprint: 'Sprint 2 — post World Cup',
        resolution: 'Use /admin/fixtures/imports to import official PSL fixture schedule when released.',
      },
      {
        id: 'KI-003',
        title: 'Live sports data ingestion is production-disabled',
        severity: 'HIGH',
        category: 'Integration',
        description:
          'LiveMatchProviderInterface is implemented as a stub/mock. No live sports data provider (Opta, Stats Perform, Sportradar) is connected. Live match state, events, and lineups must be entered manually by admins during beta.',
        status: 'DEFERRED',
        sprint: 'Sprint 3+',
        resolution: 'Provider contract + wiring in Sprint 3. LiveMatchProviderInterface adapter ready for injection.',
      },
      {
        id: 'KI-004',
        title: 'Payment, checkout, and ticketing are production-disabled',
        severity: 'MEDIUM',
        category: 'Commerce',
        description:
          'All commerce modules are PRODUCTION_DISABLED or PROVIDER_REQUIRED. No real-money wallet, payments, checkout, or ticketing exists. Fantasy and Guess the Score are points-only. Fan Value is non-financial.',
        status: 'DEFERRED',
        sprint: 'Sprint 3+',
        resolution: 'Provider contracts + compliance approval required before enabling any commerce capability.',
      },
      {
        id: 'KI-005',
        title: 'Player images and media library not implemented',
        severity: 'MEDIUM',
        category: 'Content',
        description:
          'No player or club images are stored. Player and club data uses text-only display. A full media library and CMS are planned for Sprint 3. No copyrighted images should be added without rights clearance.',
        status: 'DEFERRED',
        sprint: 'Sprint 3+',
        resolution: 'Media module + CDN in Sprint 3. Rights clearance required before using official player photos.',
      },
      {
        id: 'KI-006',
        title: 'Email, SMS, and push notifications not wired to production provider',
        severity: 'MEDIUM',
        category: 'Notifications',
        description:
          'In-app notification inbox is built and functional. Email/SMS/push delivery requires a provider contract (SendGrid, Firebase, etc.) which is deferred to Sprint 3.',
        status: 'DEFERRED',
        sprint: 'Sprint 3',
        resolution: 'Wire notification delivery provider in Sprint 3.',
      },
      {
        id: 'KI-007',
        title: 'POPIA DSAR automation not implemented',
        severity: 'MEDIUM',
        category: 'Compliance',
        description:
          'POPIA data subject access request (DSAR) handling is manual. The compliance section in the admin command centre is a readiness stub. Automated DSAR workflows are Sprint 3.',
        status: 'DEFERRED',
        sprint: 'Sprint 3',
        resolution: 'POPIA compliance workflow engine in Sprint 3.',
      },
      {
        id: 'KI-008',
        title: 'No CI/CD pipeline — manual deployment process',
        severity: 'MEDIUM',
        category: 'DevOps',
        description:
          'There is no automated CI/CD pipeline. Deployment to production (AWS ECS, CloudFront, RDS) is a manual process described in platform docs. Sprint 3 will introduce automated quality gates and deployment.',
        status: 'DEFERRED',
        sprint: 'Sprint 3',
        resolution: 'CI/CD pipeline in Sprint 3 pre-production work.',
      },
      {
        id: 'KI-009',
        title: 'Advanced observability (DataDog/Amplitude) not wired',
        severity: 'LOW',
        category: 'Observability',
        description:
          'Platform analytics and APM are SANDBOX_READY but not connected to production providers. No real-time dashboards or alerting in beta.',
        status: 'DEFERRED',
        sprint: 'Sprint 3',
        resolution: 'Wire DataDog/Amplitude in Sprint 3.',
      },
      {
        id: 'KI-010',
        title: 'Prediction settlement is admin-triggered — no automation',
        severity: 'LOW',
        category: 'Operations',
        description:
          'Prediction settlement requires an admin to manually trigger via the admin API or UI. Automated settlement based on match result ingestion requires the live data provider (KI-003).',
        status: 'TRACKED',
        sprint: 'Sprint 3',
        resolution: 'Wire settlement to live provider match result events in Sprint 3.',
      },
      {
        id: 'KI-011',
        title: 'Fantasy auto-substitutions are admin-triggered — no automation',
        severity: 'LOW',
        category: 'Operations',
        description:
          'Fantasy auto-substitution processing requires an admin trigger. Automation requires the live data provider (KI-003).',
        status: 'TRACKED',
        sprint: 'Sprint 3',
        resolution: 'Wire auto-sub to live provider match events in Sprint 3.',
      },
      {
        id: 'KI-012',
        title: 'Admin performance indexes now added; production query plan verification pending',
        severity: 'INFO',
        category: 'Performance',
        description:
          'Performance indexes added in STORY-35 for fixtures, predictions, fan value, fantasy gameweek scores, and player stats. Index effectiveness should be verified via EXPLAIN ANALYZE on RDS before production launch.',
        status: 'TRACKED',
        sprint: 'Sprint 3',
        resolution: 'Run query plan analysis on production RDS before launch.',
      },
    ];
  }

  private getUxChecklistItems(): UxCheckItem[] {
    return [
      // Auth / RBAC
      { area: 'Auth / RBAC', check: 'PSL_ADMIN JWT gating on all admin routes', status: 'PASS', notes: 'JwtAuthGuard + RolesGuard on all admin controllers' },
      { area: 'Auth / RBAC', check: 'FAN receives 403 on admin routes', status: 'PASS', notes: 'Verified in all admin spec tests' },
      { area: 'Auth / RBAC', check: 'Unauthenticated receives 401 on guarded routes', status: 'PASS', notes: 'Verified in all admin spec tests' },
      { area: 'Auth / RBAC', check: 'Admin web pages read real JWT from localStorage', status: 'WARN', notes: 'getBetaToken() reads real stored JWT. No login UI on admin pages yet. Requires manual login via /login.' },

      // World Cup
      { area: 'World Cup Preservation', check: 'WC2026 season data intact', status: 'PASS', notes: 'WC season is preserved; activation-controlled' },
      { area: 'World Cup Preservation', check: 'WC fixtures browsable', status: 'PASS', notes: 'isPublished=true on all seeded WC fixtures' },
      { area: 'World Cup Preservation', check: 'WC leaderboards accessible by slug', status: 'PASS', notes: 'Season-scoped leaderboards with ?seasonSlug= param' },
      { area: 'World Cup Preservation', check: 'WC fantasy history accessible', status: 'PASS', notes: 'FantasyGameweekScore season-scoped' },

      // PSL Prepared Season
      { area: 'PSL Season', check: 'PSL season not accidentally active', status: 'PASS', notes: 'PSL season requires explicit activation through 11-check readiness gate' },
      { area: 'PSL Season', check: 'PSL fixtures unpublished by default', status: 'PASS', notes: 'Import pipeline sets isPublished=false; admin must publish explicitly' },
      { area: 'PSL Season', check: 'PSL leaderboards start clean', status: 'PASS', notes: 'Season-scoped; PSL season has no entries until activated' },
      { area: 'PSL Season', check: 'PSL 11-check readiness gate enforced', status: 'PASS', notes: '11 checks including player_stats readiness' },

      // Fantasy
      { area: 'Fantasy', check: 'Fantasy is points-only — no paid entry', status: 'PASS', notes: 'No real-money mechanics anywhere in fantasy module' },
      { area: 'Fantasy', check: 'Fantasy rules calibrated for PSL (30 rounds)', status: 'PASS', notes: 'PROVISIONAL config seeded; must be promoted to ACTIVE before launch' },
      { area: 'Fantasy', check: 'Player prices seeded for PSL players', status: 'PASS', notes: '96 provisional prices seeded' },
      { area: 'Fantasy', check: 'Transfer limits enforced', status: 'PASS', notes: 'FantasyRulesConfig controls free transfers + wildcard' },
      { area: 'Fantasy', check: 'Fantasy chip rules enforced', status: 'PASS', notes: 'One chip active at a time, one per type per season' },

      // Predictions
      { area: 'Guess the Score', check: 'Predictions are points-only — no wagering', status: 'PASS', notes: 'No betting, odds, stakes, or wagers in predictions module' },
      { area: 'Guess the Score', check: 'Prediction rules calibrated for PSL', status: 'PASS', notes: 'PROVISIONAL PredictionRulesConfig seeded; must be promoted to ACTIVE' },
      { area: 'Guess the Score', check: 'Lock/settle/void lifecycle works', status: 'PASS', notes: 'Tested in STORY-11 and STORY-30' },
      { area: 'Guess the Score', check: 'Published-only fixtures eligible', status: 'PASS', notes: 'createPrediction filters isPublished=true' },

      // Fan Value
      { area: 'Fan Value', check: 'Fan Value is non-financial', status: 'PASS', notes: 'No cash value, no withdrawal, no exchange rate' },
      { area: 'Fan Value', check: 'Fan Value is season-scoped', status: 'PASS', notes: 'FanValueLedger has nullable seasonId; scoped queries work' },
      { area: 'Fan Value', check: 'Fan Value leaderboard accessible', status: 'PASS', notes: '7 season-aware routes under /leaderboards' },

      // Leaderboards
      { area: 'Leaderboards', check: 'Season-scoped leaderboards work', status: 'PASS', notes: '?seasonSlug= historical access; active season default' },
      { area: 'Leaderboards', check: 'WC and PSL data isolated', status: 'PASS', notes: 'Confirmed in STORY-33 acceptance' },

      // Player Stats
      { area: 'Player Stats', check: 'DRAFT stats are admin-only', status: 'PASS', notes: 'Fan routes filter to PUBLISHED/VERIFIED only' },
      { area: 'Player Stats', check: 'LOCKED stats are immutable', status: 'PASS', notes: 'Lifecycle protection enforced in PlayerStatsService' },
      { area: 'Player Stats', check: 'Admin lifecycle pipeline works', status: 'PASS', notes: 'DRAFT→VERIFIED→PUBLISHED→LOCKED tested live' },
      { area: 'Player Stats', check: 'Season readiness check active', status: 'PASS', notes: '11th season-switching check; WARNING when finished fixtures have no/draft stats' },

      // Fixture Import
      { area: 'Fixture Import', check: 'Import pipeline validates before commit', status: 'PASS', notes: 'ERROR/WARNING/INFO validation per row before commit' },
      { area: 'Fixture Import', check: 'Fan-facing routes filter isPublished=true', status: 'PASS', notes: 'FootballService and ClubExperienceService filter published fixtures' },
      { area: 'Fixture Import', check: 'Conflict detection (duplicate, overlap)', status: 'PASS', notes: 'DUPLICATE_FIXTURE, TEAM_SCHEDULE_OVERLAP, VENUE_OVERLAP checks' },

      // Gameweek Operations
      { area: 'Gameweek Operations', check: 'Operational status computed at request time', status: 'PASS', notes: 'No persisted operational status — derived from Gameweek + Fixture data' },
      { area: 'Gameweek Operations', check: 'Deadline derivation works', status: 'PASS', notes: 'MISSING_ONLY and OVERWRITE_DERIVED_ONLY modes' },

      // Club Experience
      { area: 'Club Experience', check: '16 PSL clubs seeded', status: 'PASS', notes: 'All 16 clubs with SeasonTeam, Venue, ClubProfile, ClubContentItem seeded' },
      { area: 'Club Experience', check: 'Club shop is CATALOGUE_ONLY', status: 'PASS', notes: 'No real checkout, orders, or payments. Commerce deferred to Sprint 3.' },

      // Admin Control Plane
      { area: 'Admin Control Plane', check: 'All 11 season-switching checks visible', status: 'PASS', notes: 'AdminOperationsService + SeasonSwitchingService' },
      { area: 'Admin Control Plane', check: 'Module readiness covers all Sprint 2 modules', status: 'PASS', notes: 'Including PLAYER_STATS, LEADERBOARDS, ENGAGEMENT_METRICS' },
      { area: 'Admin Control Plane', check: 'Launch readiness checklist accurate', status: 'PASS', notes: 'All commercial modules PRODUCTION_DISABLED or PROVIDER_REQUIRED' },

      // Integration Readiness
      { area: 'Integration Readiness', check: 'No live provider credentials in codebase', status: 'PASS', notes: 'IntegrationProviderConfig stores no secrets' },
      { area: 'Integration Readiness', check: 'Live data provider is stub-only', status: 'PASS', notes: 'LiveMatchProviderInterface ready for injection; no real provider' },
      { area: 'Integration Readiness', check: 'Commerce providers are production-disabled', status: 'PASS', notes: 'Wallet, payments, checkout, ticketing all explicitly disabled' },

      // Mobile / Responsive
      { area: 'Mobile / Responsive', check: 'Grid layouts use responsive classes', status: 'WARN', notes: 'Most pages use grid-cols-1 md:grid-cols-2 but not all pages audited for mobile' },
      { area: 'Mobile / Responsive', check: 'Tables have overflow-x-auto', status: 'WARN', notes: 'Some admin tables may lack overflow wrapper on mobile' },

      // Safety Copy
      { area: 'Safety Copy', check: 'No product-facing gambling/wagering language', status: 'PASS', notes: 'Peer challenges use "fan points" not "wager/bet/stake". Safety notes use appropriate disclaimers.' },
      { area: 'Safety Copy', check: 'PRODUCTION_DISABLED labels visible on commerce', status: 'PASS', notes: 'All integration provider configs show production-disabled status' },
    ];
  }

  private getReleaseNotesList(): ReleaseNote[] {
    return [
      {
        story: 'STORY-26',
        commit: '94e577d',
        title: 'PSL Club Experience & Season Readiness',
        summary: '16 PSL clubs seeded; club experience module with fan hub, squad, fixtures, stadium, shop (catalogue only); admin club management.',
        keyDeliverables: ['16 clubs + venues seeded', 'ClubExperienceModule', '11 fan + 8 admin pages', '883 API tests'],
        safetyBoundaries: ['Club shop is CATALOGUE_ONLY — no checkout, orders, or payments'],
      },
      {
        story: 'STORY-27',
        commit: '1f826ea',
        title: 'PSL Fixture Import, Validation & Publishing',
        summary: 'Fixture import pipeline: create batches, add rows, validate (ERROR/WARNING/INFO), commit provisional fixtures, publish with fan-visibility control.',
        keyDeliverables: ['FixtureImportModule', '21 admin routes', '10 admin pages', '922 API tests', 'isPublished field on Fixture'],
        safetyBoundaries: ['No betting, odds, stakes, or commerce mechanics in fixture data'],
      },
      {
        story: 'STORY-28',
        commit: '0e5fc51',
        title: 'Season Switching — World Cup to PSL Mode',
        summary: 'Transactional season activation with 7-check readiness gate; rollback; WC2026 data preservation; SeasonSwitchAudit trail.',
        keyDeliverables: ['SeasonSwitchingModule', '7 admin routes', '5 admin pages', '954 API tests'],
        safetyBoundaries: ['Season switching requires explicit admin action; WC data never deleted'],
      },
      {
        story: 'STORY-29',
        commit: 'c207c35',
        title: 'PSL Fantasy Season Calibration',
        summary: '96 provisional placeholder players; FantasyCalibrationModule; provisional rules, prices, and gameweek deadlines.',
        keyDeliverables: ['FantasyCalibrationModule', '13 admin routes', '7 admin pages', '975 API tests'],
        safetyBoundaries: ['Fantasy is points-only. No paid entry, no real-money mechanics. All values PROVISIONAL.'],
      },
      {
        story: 'STORY-30',
        commit: '88ffc09',
        title: 'PSL Prediction Season Calibration',
        summary: 'PredictionRulesConfig; 8th season-switching check; published-only fixture eligibility; prediction calibration admin pipeline.',
        keyDeliverables: ['PredictionCalibrationModule', '11 admin routes', '9 admin pages', '998 API tests'],
        safetyBoundaries: ['Guess the Score is points-only. No betting, wagering, or gambling mechanics.'],
      },
      {
        story: 'STORY-31',
        commit: 'a3bedbd',
        title: 'PSL Gameweek & Matchday Operations Readiness',
        summary: 'GameweekOperationsModule; computed operational status (not persisted); 9th season-switching check; derive deadlines with configurable buffers.',
        keyDeliverables: ['GameweekOperationsModule', '15 admin routes', '12 admin pages', '1037 API tests'],
        safetyBoundaries: ['No new schema; status derived at request time'],
      },
      {
        story: 'STORY-32',
        commit: 'f59bf21',
        title: 'Admin Operations Control Plane',
        summary: 'IntegrationProviderConfig model; 9 provider placeholders seeded (all production-disabled); capability gap review; launch readiness checklist; 17 admin routes.',
        keyDeliverables: ['AdminOperationsModule', '17 admin routes', '12 admin pages', '1088 API tests'],
        safetyBoundaries: ['All commercial provider configs are PRODUCTION_DISABLED or PROVIDER_REQUIRED. No credentials stored.'],
      },
      {
        story: 'STORY-33',
        commit: '2f43344',
        title: 'Season-Scoped Leaderboards & Fan Value',
        summary: 'Season-aware leaderboards (7 fan routes); EngagementModule with admin metrics; 10th season-switching check; WC/PSL data isolation confirmed.',
        keyDeliverables: ['LeaderboardsModule rewritten', 'EngagementModule', '6 fan + 10 admin pages', '1170 API tests'],
        safetyBoundaries: ['Fan Value is non-financial. No cash value, no withdrawal mechanism.'],
      },
      {
        story: 'STORY-34',
        commit: '1b06a00',
        title: 'PSL Player Stats & Match Performance',
        summary: 'PlayerMatchStats model; DRAFT→VERIFIED→PUBLISHED→LOCKED lifecycle; 11th season-switching check; 7 fan routes + 10 admin routes; provider-neutral design.',
        keyDeliverables: ['PlayerStatsModule', '17 API routes', '8 fan + 6 admin pages', '1188 API tests'],
        safetyBoundaries: ['No live provider calls. PROVIDER enum reserved for Sprint 3+. No copyrighted player images.'],
      },
      {
        story: 'STORY-35',
        commit: 'pending',
        title: 'Beta Feedback, Bug Fixes & UX Polish',
        summary: 'Auth session cleanup (getBetaToken centralised); AdminAuditLog model; performance indexes; BetaFeedbackModule; port bug fixes; league-management JSON fix; BETA-READINESS review updated.',
        keyDeliverables: [
          'AdminAuditLog model + migration 20260612000005',
          'Performance indexes: Fixture, ScorePrediction, FantasyGameweekScore, FanValueLedger, PlayerMatchStats',
          'BetaFeedbackModule: 4 routes — overview, known-issues, ux-checklist, release-notes',
          'getBetaToken() centralised in auth-client.ts',
          'Port bug fixes: admin-operations, players, admin-player-stats, notifications, prediction-calibration clients',
          'auth headers added to admin-player-stats-client',
          '4 admin beta feedback web pages',
          'All dev-token pages updated to use getBetaToken()',
        ],
        safetyBoundaries: [
          'No new product scope. No production commercial integrations. No real-money mechanics. No live provider ingestion.',
        ],
      },
    ];
  }
}
