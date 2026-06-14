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
      completedStories: 13,
      apiTestCount: 1528,
      webPageCount: 319,
      recommendedNextActions: [
        'Import official PSL 2026/27 squad data via /admin/squad-import',
        'Import official PSL 2026/27 fixture schedule via /admin/fixtures/imports',
        'Publish fantasy price calibration batch after reviewing player prices',
        'Promote PSL fantasy rules from PROVISIONAL to ACTIVE',
        'Promote PSL prediction rules from PROVISIONAL to ACTIVE',
        'Resolve all 13 season-switching readiness checks before PSL activation',
        'Create sponsors and publish campaigns via /admin/sponsors and /admin/campaigns',
        'Set rightsStatus=CLEAR on media assets before publishing to fans',
        'Wire real auth session — admin users must log in at /login before accessing admin pages',
        'Sprint 3: live sports data provider contract',
        'Sprint 3: production deployment to AWS ECS',
        'Sprint 3: email/SMS/push notification provider',
        'Sprint 3: wallet provider production contract and compliance approval',
        'Sprint 3: media rights contract and CDN provider',
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
      currentVersion: 'Sprint 2 — STORY-38',
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
      {
        id: 'KI-013',
        title: 'Official PSL squad data not yet available',
        severity: 'HIGH',
        category: 'Data Readiness',
        description:
          'The squad import pipeline (STORY-36) is live but official PSL 2026/27 player registration data has not been received. 96 provisional placeholder registrations are seeded. Season activation is blocked until confirmed squad registrations exist.',
        status: 'TRACKED',
        sprint: 'Sprint 2 — post World Cup',
        resolution: 'Use /admin/squad-import to import official PSL squad data once received from the league.',
      },
      {
        id: 'KI-014',
        title: 'Unresolved squad import duplicates may block season readiness',
        severity: 'MEDIUM',
        category: 'Data Quality',
        description:
          'Squad import duplicate detection uses normalised name matching within a team. When official data arrives, duplicate candidates must be reviewed at /admin/squad-import/:seasonId/duplicates before proceeding with publish.',
        status: 'TRACKED',
        sprint: 'Sprint 2 — post World Cup',
        resolution: 'Review /admin/squad-import/:seasonId/duplicates and resolve all BLOCKER rows before publishing import batch.',
      },
      {
        id: 'KI-015',
        title: 'Missing or invalid fantasy prices will block price calibration batch publish',
        severity: 'MEDIUM',
        category: 'Data Quality',
        description:
          'Fantasy prices must be set for all registered players within minPrice/maxPrice bounds before the calibration batch can be published. Players with missing prices show at /admin/fantasy-price-calibration/:seasonId/missing-prices; invalid prices at /admin/fantasy-price-calibration/:seasonId/invalid-prices.',
        status: 'TRACKED',
        sprint: 'Sprint 2 — post World Cup',
        resolution: 'Use bulk-apply-defaults to seed prices, then review and adjust. Publish calibration batch once all prices are valid.',
      },
      {
        id: 'KI-016',
        title: 'Production media streaming and CDN not configured',
        severity: 'HIGH',
        category: 'Infrastructure',
        description:
          'The media catalogue is FOUNDATION_READY. Media assets can be created and managed. However, production video streaming, CDN delivery, and DRM are not configured. LIVE_STREAM assets are metadata-only. playbackUrl is a local/test placeholder. Media availability does not imply that PSL One owns streaming rights.',
        status: 'TRACKED',
        sprint: 'Sprint 3',
        resolution: 'Secure media rights contract, configure CDN provider, implement DRM Sprint 3+.',
      },
      {
        id: 'KI-017',
        title: 'Wallet production contract and credentials not configured',
        severity: 'HIGH',
        category: 'Integration',
        description:
          'The wallet integration is SANDBOX_READY. Silicon Enterprise Wallet adapter is a deterministic sandbox — no outbound calls, no real financial transactions. Production wallet linking requires: provider contract, production credentials (stored outside database), KYC implementation, and compliance approval. PSL One does not hold customer funds.',
        status: 'TRACKED',
        sprint: 'Sprint 3',
        resolution: 'Wallet provider contract and compliance Sprint 3+. Credentials must be stored in secrets manager (not PostgreSQL).',
      },
      {
        id: 'KI-018',
        title: 'Webhook signature verification not production-ready',
        severity: 'HIGH',
        category: 'Security',
        description:
          'The sandbox webhook route (/admin/wallet/webhooks/:providerSlug/sandbox) is admin-protected and idempotent. Production webhooks require: HMAC/signature verification, replay protection, timestamp validation, IP controls, secret storage outside PostgreSQL, and a dead-letter/retry strategy. None of these are implemented in STORY-37.',
        status: 'TRACKED',
        sprint: 'Sprint 3',
        resolution: 'Implement production webhook security controls before enabling live provider callbacks Sprint 3+.',
      },
      {
        id: 'KI-019',
        title: 'Financial settlement, KYC, and production fraud controls not implemented',
        severity: 'HIGH',
        category: 'Compliance',
        description:
          'STORY-37 does not implement: regulated KYC, financial settlement, real money movement, production fraud scoring, customer balance custody, or production reversal mechanics. All STORY-37 wallet transactions are sandbox records. Fan Value remains non-financial. Campaign rewards of type WALLET_CREDIT_PENDING_PROVIDER remain PROVIDER_PENDING.',
        status: 'TRACKED',
        sprint: 'Sprint 3',
        resolution: 'Implement full compliance and financial controls Sprint 3+ under legal/compliance guidance.',
      },
      {
        id: 'KI-020',
        title: 'Domain event outbox/transactional event bus not implemented',
        severity: 'MEDIUM',
        category: 'Architecture',
        description:
          'STORY-37 uses direct service calls and .catch(() => null) for optional side-effects (notifications, activity feed). A transactional outbox pattern with Kafka or a reliable event bus is required for production-grade domain event delivery. Campaign completion, reward issuance, and wallet link events may not reliably reach all consumers under load.',
        status: 'TRACKED',
        sprint: 'Sprint 3',
        resolution: 'Implement Kafka transactional outbox for cross-context domain events Sprint 3+.',
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
      { area: 'PSL Season', check: 'PSL 13-check readiness gate enforced', status: 'PASS', notes: '13 checks including squad_import and fantasy_price_calibration readiness (STORY-36)' },

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
      { area: 'Admin Control Plane', check: 'All 13 season-switching checks visible', status: 'PASS', notes: 'AdminOperationsService + SeasonSwitchingService; 2 new checks added in STORY-36' },
      { area: 'Admin Control Plane', check: 'Module readiness covers all Sprint 2 modules', status: 'PASS', notes: 'Including SQUAD_IMPORT, FANTASY_PRICE_CALIBRATION, PLAYER_STATS, LEADERBOARDS' },
      { area: 'Admin Control Plane', check: 'Launch readiness checklist accurate', status: 'PASS', notes: 'All commercial modules PRODUCTION_DISABLED or PROVIDER_REQUIRED' },

      // Integration Readiness
      { area: 'Integration Readiness', check: 'No live provider credentials in codebase', status: 'PASS', notes: 'IntegrationProviderConfig stores no secrets' },
      { area: 'Integration Readiness', check: 'Live data provider is stub-only', status: 'PASS', notes: 'LiveMatchProviderInterface ready for injection; no real provider' },
      { area: 'Integration Readiness', check: 'Commerce providers are production-disabled', status: 'PASS', notes: 'Wallet, payments, checkout, ticketing all explicitly disabled' },

      // Squad Import
      { area: 'Squad Import', check: 'Import lifecycle DRAFT→VALIDATED→IMPORTED→PUBLISHED enforced', status: 'PASS', notes: 'Each state transition validated in SquadImportService' },
      { area: 'Squad Import', check: 'BLOCKER rows prevent batch import', status: 'PASS', notes: 'validateBatch sets status=BLOCKED if any row has BLOCKER-severity issues' },
      { area: 'Squad Import', check: 'Duplicate detection active within team', status: 'PASS', notes: 'Normalised name match; BLOCKER for active duplicate, WARNING for possible duplicate' },
      { area: 'Squad Import', check: 'Activation dry-run is read-only', status: 'PASS', notes: 'dryRunOnly: true, activationWillNotBePerformed: true always set' },
      { area: 'Squad Import', check: 'Squad import writes audit logs', status: 'PASS', notes: 'All mutations write to AdminAuditLog via writeAuditLog helper' },
      { area: 'Squad Import', check: 'Official PSL squad data pending (KI-013)', status: 'WARN', notes: 'Only provisional placeholder registrations seeded; official data awaited post-WC' },

      // Fantasy Price Calibration
      { area: 'Fantasy Price Calibration', check: 'Price bounds enforced from FantasyRulesConfig', status: 'PASS', notes: 'minPrice=40, maxPrice=200, defaultPrice=55 by default; configurable per season' },
      { area: 'Fantasy Price Calibration', check: 'Prices are fantasy-game values only — no cash value', status: 'PASS', notes: 'pricesHaveNoCashValue: true declared in activation dry-run response' },
      { area: 'Fantasy Price Calibration', check: 'Bulk default application skips priced players', status: 'PASS', notes: 'bulkApplyDefaults is idempotent — will not overwrite existing prices' },
      { area: 'Fantasy Price Calibration', check: 'Calibration batch publish requires prior validation', status: 'PASS', notes: 'publishCalibration throws if no VALIDATED/HAS_WARNINGS batch exists' },
      { area: 'Fantasy Price Calibration', check: 'Price calibration writes audit logs', status: 'PASS', notes: 'updatePlayerPrice and bulkApplyDefaults write AdminAuditLog entries' },
      { area: 'Fantasy Price Calibration', check: 'Missing/invalid prices surfaced in readiness check', status: 'PASS', notes: '13th season-switching check; WARNING for missing prices, invalid prices, unpublished calibration' },

      // Media Catalogue
      { area: 'Media Catalogue', check: 'Fan media list filters to PUBLIC + CLEAR rights only', status: 'PASS', notes: 'listPublicMedia enforces visibility=PUBLIC and rightsStatus=CLEAR' },
      { area: 'Media Catalogue', check: 'Rights notice shown on all media assets', status: 'PASS', notes: 'mediaRightsNotice returned on adminPublishMedia: availability does not imply streaming rights' },
      { area: 'Media Catalogue', check: 'Admin publish blocked if rights not CLEAR', status: 'PASS', notes: 'adminPublishMedia throws BadRequestException if rightsStatus !== CLEAR' },
      { area: 'Media Catalogue', check: 'No copyrighted player images served', status: 'PASS', notes: 'Seed uses placeholder/generic URLs only; no Opta/Stats Perform images' },
      { area: 'Media Catalogue', check: 'Media engagement events deduplicated by idempotency key', status: 'PASS', notes: 'P2002 caught silently on duplicate idempotencyKey; returns recorded:false' },

      // Campaign Discovery & Participation
      { area: 'Campaign Discovery', check: 'Fan sees only PUBLISHED campaigns', status: 'PASS', notes: 'listPublicCampaigns filters to status=PUBLISHED; targetingRulesJson excluded from fan response' },
      { area: 'Campaign Discovery', check: 'Campaign lifecycle enforced (DRAFT→PENDING_APPROVAL→APPROVED→PUBLISHED→PAUSED→COMPLETED→ARCHIVED)', status: 'PASS', notes: 'assertTransition() throws BadRequestException on invalid transitions' },
      { area: 'Campaign Discovery', check: 'Fan identity always from JWT, never from request body', status: 'PASS', notes: 'All fan campaign routes use req.user.sub for fanUserId' },
      { area: 'Campaign Discovery', check: 'Participation is idempotent (safe to re-call)', status: 'PASS', notes: 'startParticipation returns existing participation if already started' },
      { area: 'Campaign Discovery', check: 'Max participations per fan enforced', status: 'PASS', notes: 'maxParticipationsPerFan counted excluding DISQUALIFIED entries' },
      { area: 'Campaign Discovery', check: 'SCAN_QR and SHARE_CONTENT actions route to MANUAL_REVIEW', status: 'PASS', notes: 'completeAction assigns MANUAL_REVIEW status for those action types' },

      // Reward Claim
      { area: 'Reward Claim', check: 'Reward issuance is atomic (inventory decrement + fan reward)', status: 'PASS', notes: 'issueReward uses $transaction to increment inventoryIssued with create' },
      { area: 'Reward Claim', check: 'Duplicate reward issuance blocked by idempotency key', status: 'PASS', notes: 'Unique constraint on fanReward.idempotencyKey; P2002 caught silently' },
      { area: 'Reward Claim', check: 'FAN_VALUE_POINTS rewards post to FanValueLedger', status: 'PASS', notes: 'sourceType=CAMPAIGN_REWARD, valueType=CAMPAIGN_POINTS, metadataJson has nonFinancial:true' },
      { area: 'Reward Claim', check: 'Fan Value reward safety copy present in all issuance metadata', status: 'PASS', notes: 'noCashValue:true and fanValuePointsAreNotMoney:true in reward metadataJson' },

      // Wallet Sandbox Linking
      { area: 'Wallet Sandbox', check: 'Wallet integration operates in sandbox mode only', status: 'PASS', notes: 'WalletProviderStatus.SANDBOX; all adapter methods return sandboxOnly:true' },
      { area: 'Wallet Sandbox', check: 'No real-money transactions in sandbox mode', status: 'PASS', notes: 'SiliconEnterpriseSandboxWalletAdapter has zero outbound HTTP calls; deterministic only' },
      { area: 'Wallet Sandbox', check: 'KYC disclaimer present on wallet link confirmation', status: 'PASS', notes: 'kycDisclaimer: "Sandbox KYC is not regulated verification. No real identity check performed."' },
      { area: 'Wallet Sandbox', check: 'PSL One does not hold customer funds disclaimer shown', status: 'PASS', notes: 'safetyNote on fanGetWalletStatus; disclaimer on wallet reward issuance' },
      { area: 'Wallet Sandbox', check: 'Provider customer refs masked in fan response', status: 'PASS', notes: 'fanGetWalletStatus masks providerCustomerRef and providerWalletRef to null' },
      { area: 'Wallet Sandbox', check: 'Wallet unlink preserves audit trail (update not delete)', status: 'PASS', notes: 'fanUnlinkWallet sets status=UNLINKED, never deletes WalletLink row' },
      { area: 'Wallet Sandbox', check: 'Production wallet integration disabled', status: 'PASS', notes: 'WALLET_TRANSACTIONS readiness: isProductionEnabled:false, isCommercial:true — separate production gate required' },

      // Admin Campaign Lifecycle
      { area: 'Admin Campaign Lifecycle', check: 'All campaign mutations write audit logs', status: 'PASS', notes: 'createCampaign, updateCampaign, all lifecycle transitions write AdminAuditLog' },
      { area: 'Admin Campaign Lifecycle', check: 'Campaign approval fields not visible to fans', status: 'PASS', notes: 'FAN_SAFE_SELECT excludes targetingRulesJson, createdByUserId, approvedByUserId' },
      { area: 'Admin Campaign Lifecycle', check: 'Sponsor contact details not exposed to fans', status: 'PASS', notes: 'PUBLIC_SPONSOR_SELECT excludes primaryContactName, primaryContactEmail, notes' },

      // Campaign Analytics
      { area: 'Campaign Analytics', check: 'Analytics aggregation does not expose fan identity', status: 'PASS', notes: 'getCampaignAnalytics uses count queries only; no individual fan rows returned' },
      { area: 'Campaign Analytics', check: 'Daily snapshot is idempotent (safe to recalculate)', status: 'PASS', notes: 'recalculateDailySnapshot upserts on unique (campaignId, snapshotDate)' },
      { area: 'Campaign Analytics', check: 'Media engagement count short-circuits when no assets', status: 'PASS', notes: 'Returns 0 immediately if campaign has no linked media assets' },

      // Mobile / Responsive
      { area: 'Mobile / Responsive', check: 'Grid layouts use responsive classes', status: 'WARN', notes: 'Most pages use grid-cols-1 md:grid-cols-2 but not all pages audited for mobile' },
      { area: 'Mobile / Responsive', check: 'Tables have overflow-x-auto', status: 'WARN', notes: 'Some admin tables may lack overflow wrapper on mobile' },

      // Safety Copy
      { area: 'Safety Copy', check: 'No product-facing gambling/wagering language', status: 'PASS', notes: 'Peer challenges use "fan points" not "wager/bet/stake". Safety notes use appropriate disclaimers.' },
      { area: 'Safety Copy', check: 'PRODUCTION_DISABLED labels visible on commerce', status: 'PASS', notes: 'All integration provider configs show production-disabled status' },
      { area: 'Safety Copy', check: 'Fan Value non-financial disclaimer present in campaign rewards', status: 'PASS', notes: '"Fan Value points are non-cash loyalty points" copy enforced in reward metadata and service responses' },
      { area: 'Safety Copy', check: 'Wallet sandbox disclaimer shown to fans', status: 'PASS', notes: '"Wallet integration is operating in sandbox mode. No real financial transactions are processed."' },
      { area: 'Safety Copy', check: 'Wallet provider disclaimer shown (PSL does not hold funds)', status: 'PASS', notes: '"Wallet services are provided by an external wallet provider. PSL One does not hold customer funds directly."' },
      { area: 'Safety Copy', check: 'Media rights notice shown on asset publish', status: 'PASS', notes: '"Media availability does not imply that PSL One owns streaming rights." returned on publish' },
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
        commit: 'b5d7f6b',
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
          '1216 API tests passing',
        ],
        safetyBoundaries: [
          'No new product scope. No production commercial integrations. No real-money mechanics. No live provider ingestion.',
        ],
      },
      {
        story: 'STORY-36',
        commit: '6b04435',
        title: 'Squad Import, Player Price Finalisation & Activation Dry Run',
        summary: 'SquadImportModule with full import lifecycle (DRAFT→VALIDATED→IMPORTED→PUBLISHED→CANCELLED); FantasyPriceCalibrationModule with price bounds from FantasyRulesConfig; activation dry-run endpoints; 2 new season-switching readiness checks (13 total); SQUAD_IMPORT + FANTASY_PRICE_CALIBRATION in AdminOperations.',
        keyDeliverables: [
          'SquadImportModule: 14 admin routes; batch/row lifecycle; BLOCKER/WARNING validation; duplicate detection; idempotent import',
          'FantasyPriceCalibrationModule: 12 admin routes; price bounds enforcement; bulk defaults; calibration batch publish',
          'FantasyRulesConfig extended: minPrice (40), maxPrice (200), defaultPrice (55)',
          'SquadImportBatch, SquadImportRow, FantasyPriceCalibrationBatch models — migration 20260612000006',
          '2 new season-switching readiness checks (squad_import, fantasy_price_calibration) — 13 total',
          'SQUAD_IMPORT + FANTASY_PRICE_CALIBRATION modules added to AdminOperationsService',
          '17 admin web pages (9 squad import + 8 price calibration)',
          '2 new web clients (squad-import-client.ts, fantasy-price-calibration-client.ts)',
          'All squad/price mutations write to AdminAuditLog',
          'Activation dry-run: dryRunOnly + activationWillNotBePerformed + pricesHaveNoCashValue safety confirmations',
        ],
        safetyBoundaries: [
          'Fantasy prices are game-value only — no cash value, market value, transfer fee, or betting odds.',
          'Squad import is manual/admin-triggered only — no external PSL data provider calls.',
          'Activation dry-run is strictly read-only — no state mutations.',
          'No paid entry, no real-money mechanics, no live provider ingestion.',
        ],
      },
      {
        story: 'STORY-38',
        commit: 'pending',
        title: 'PSL Live Match Intelligence, Rich Football Data & Points-Based Social Prediction Gaming',
        summary: 'Two new bounded contexts: SocialPredictionModule (points-based challenge marketplace — FIFO matching, immutable ledger, compliance readiness) and MatchCentreModule (rich football data — standings, form, player ratings, sandbox ingestion, provider-neutral data provenance). 11 new enums, 13 new tables, migration 20260613000001. 1528 API tests passing.',
        keyDeliverables: [
          'SocialPredictionModule: 14 fan routes + 13 admin routes; FIFO deterministic matching; idempotency keys on all mutations',
          'GameweekPointsAllocation: admin grants system-issued points per gameweek; no real money',
          'ChallengeListing/ChallengeMatch: fan-vs-fan points marketplace; self-match prevention; volume cap enforcement',
          'SocialPredictionPointsEntry: immutable ledger (POINTS_COMMITTED/AWARDED/FORGONE/VOID_RESTORED); corrections via new entries only',
          'ComplianceDomainConfig: POINTS_BASED_SOCIAL_PREDICTION_COMPLIANCE = INTERNAL_REVIEW_REQUIRED',
          'MatchCentreModule: 7 fan routes + 8 admin routes; provider-neutral DataSourceType contract',
          'LeagueStanding: season-scoped standings with provenance; MANUAL/SEEDED/SANDBOX_PROVIDER/OFFICIAL_PROVIDER',
          'TeamFormRecord: form string + recentFixtures JSON; provenance tracked',
          'PlayerRating: performance rating 0–10; version tracking; official provider swap strategy documented',
          'DataIngestionLog: immutable audit of every ingest operation with sourceType + dataStatus',
          '4 admin match-centre pages + 5 fan social prediction pages + 7 admin social prediction pages',
          '2 new module readiness entries in AdminOperationsService (SOCIAL_PREDICTION_MATCHING, LIVE_MATCH_INTELLIGENCE)',
        ],
        safetyBoundaries: [
          'PSL One social prediction challenges use system-issued gameplay points only. Gameplay points cannot be purchased, transferred, withdrawn or exchanged for money.',
          'Challenge results affect platform scoring and leaderboard positions only. No betting, wagers, odds, stakes, or payouts.',
          'Fan Value is a separate non-financial loyalty score and is not used to fund prediction challenges.',
          'FIFO matching engine is fully deterministic and idempotent — no random number generation, no hidden weighting.',
          'Official match data provider integration is INTEGRATION_READY but NOT wired. Do NOT call Opta, Stats Perform, Sportradar, or any external provider.',
          'Sandbox ingestion only in STORY-38. No production ingestion. No copyrighted player images.',
          'Fantasy and Guess the Score remain points-only. No paid entry.',
          'No real-money wallet, payments, checkout, orders, or production rewards redemption.',
        ],
      },
      {
        story: 'STORY-37',
        commit: 'pending',
        title: 'Media, Sponsor Campaigns & Wallet Activation Foundation',
        summary: 'Six new bounded contexts: MediaModule (catalogue, rights, engagement), SponsorsModule, CampaignsModule (full lifecycle + approval), CampaignRewardsModule (atomic issuance + FanValue integration), WalletIntegrationModule (sandbox only — SiliconEnterpriseSandboxWalletAdapter), CampaignAnalyticsModule. 22 new enums, 13 new tables, migration 20260612000007.',
        keyDeliverables: [
          'MediaModule: 12 routes (5 fan + 7 admin); rights-gate on publish; engagement deduplication',
          'SponsorsModule: 4 admin routes; PUBLIC_SPONSOR_SELECT hides contact fields',
          'CampaignsModule: 19 routes (5 fan + 14 admin); full DRAFT→ARCHIVED lifecycle; MANUAL_REVIEW for SCAN_QR/SHARE_CONTENT',
          'CampaignRewardsModule: 8 fan routes + 4 admin routes; $transaction for atomic issuance; FanValueLedger integration',
          'WalletIntegrationModule: 4 fan + 6 admin routes; SiliconEnterpriseSandboxWalletAdapter (zero outbound calls)',
          'CampaignAnalyticsModule: 3 admin routes; aggregate-only queries; idempotent daily snapshots',
          'PREFERENCE_TYPE_MAP extended: CAMPAIGN_STARTED, CAMPAIGN_COMPLETED, REWARD_ISSUED, WALLET_LINKED',
          '7 new module readiness entries in AdminOperationsService',
          '152 new API tests; 1452 total passing',
        ],
        safetyBoundaries: [
          'Fan Value is non-financial. Campaign reward points carry noCashValue:true and fanValuePointsAreNotMoney:true.',
          'Wallet integration is SANDBOX mode only. No real financial transactions. No production credentials.',
          'SiliconEnterpriseSandboxWalletAdapter makes zero outbound HTTP calls — fully deterministic.',
          'No real-money wallet, payments, checkout, orders, fulfilment, refunds, or production rewards redemption.',
          'Fantasy and Guess the Score remain points-only. No paid entry.',
          'Media rights notice enforced: availability does not imply PSL One owns streaming rights.',
          'LIVE_MEDIA module readiness: RIGHTS_REQUIRED — production CDN/DRM not configured.',
          'No external provider calls (Opta, Stats Perform, Sportradar, API-Football, FIFA, PSL).',
        ],
      },
    ];
  }
}
