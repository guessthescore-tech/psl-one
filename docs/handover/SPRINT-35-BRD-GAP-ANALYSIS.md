# Sprint 35 — BRD Gap Analysis

## Summary

This document maps PSL One's Business Requirements Document (BRD) against the current
platform implementation to identify gaps before production launch.

## BRD Categories & Coverage

### 1. Fan Engagement ✅ COMPLETE

| Requirement             | Status    | Implementation                          |
|-------------------------|-----------|-----------------------------------------|
| User registration/login | COMPLETE  | AuthModule, JwtAuthGuard, RolesGuard    |
| Fantasy football        | COMPLETE  | FantasyModule, 17 tables, full lifecycle|
| Predictions (GTS)       | COMPLETE  | PredictionModule, lock/settle/void      |
| Social feed             | COMPLETE  | SocialActivityFeedModule                |
| Achievements/badges     | COMPLETE  | AchievementsModule, 17 badge defs       |
| Fan value / rewards     | COMPLETE  | FanValueLedgerModule, RewardReadiness   |
| Notifications           | COMPLETE  | NotificationsModule, 5 event types      |
| Leaderboards            | COMPLETE  | EngagementModule, fan + admin views     |

### 2. Club Experience ✅ COMPLETE (Catalogue-only)

| Requirement             | Status    | Notes                                   |
|-------------------------|-----------|-----------------------------------------|
| Club profiles           | COMPLETE  | ClubExperienceModule, 16 clubs seeded   |
| Club portal (admin)     | COMPLETE  | ClubPortalModule, CLUB_ADMIN RBAC       |
| Club merchandise        | CATALOGUE | CATALOGUE_ONLY per ADR-033              |
| Club ticketing          | PLACEHOLDER| Informational only — see ADR-033       |
| Club news / media       | COMPLETE  | MediaModule, news + video routes        |

### 3. Sponsor Platform ✅ COMPLETE (Non-financial)

| Requirement             | Status    | Notes                                   |
|-------------------------|-----------|-----------------------------------------|
| Sponsor portal          | COMPLETE  | SponsorPortalModule, SPONSOR RBAC       |
| Sponsor campaigns       | COMPLETE  | SponsorCampaign model + routes          |
| Audience segmentation   | COMPLETE  | AudienceSegment model + POPIA-safe      |
| Asset management        | COMPLETE  | MediaAsset.sponsorId + routes           |
| Sponsor rewards         | NON-FINANCIAL | No cash payouts — digital only      |
| Sponsor billing         | INVOICE_ONLY | Off-platform — ADR-031               |

### 4. Admin Operations ✅ COMPLETE

| Requirement             | Status    | Notes                                   |
|-------------------------|-----------|-----------------------------------------|
| Admin dashboard         | COMPLETE  | AdminDashboardModule, 27 routes         |
| Season management       | COMPLETE  | SeasonSwitchAudit, 13+ pre-flight checks|
| Fixture management      | COMPLETE  | FixtureImportModule, PublicationService |
| Data provider           | COMPLETE  | DataProviderModule, 4 adapters          |
| RBAC enforcement        | COMPLETE  | RolesGuard, PSL_ADMIN / role boundary   |
| Audit logs              | COMPLETE  | AdminAuditLog, AuditEvent enum          |

### 5. Infrastructure ✅ READY (Staging)

| Requirement             | Status    | Notes                                   |
|-------------------------|-----------|-----------------------------------------|
| Cloud deployment        | STAGING   | EC2 + Docker Compose, af-south-1        |
| CI/CD                   | COMPLETE  | GitHub Actions 7/7 checks               |
| HTTPS                   | COMPLETE  | Caddy auto-cert on beta EC2             |
| Object storage          | SKELETON  | LocalDiskAdapter; S3 adapter pending    |
| CDN                     | PARTIAL   | Vercel for frontend; API CDN pending    |
| Caching                 | COMPLETE  | ApiCacheModule, in-memory (Redis pending)|

## Key Gaps Before Production Launch

| Gap ID     | Description                          | Priority | Owner Gate     |
|------------|--------------------------------------|----------|----------------|
| GAP-35-01  | Redis distributed cache              | HIGH     | none needed    |
| GAP-35-02  | S3 media storage + CloudFront        | HIGH     | none needed    |
| GAP-35-03  | Load testing (k6/Artillery)          | HIGH     | none needed    |
| GAP-35-04  | Production APM (Datadog/X-Ray)       | HIGH     | none needed    |
| GAP-35-05  | Live fixture data (valid API key)    | HIGH     | OG-35-DATA     |
| GAP-35-06  | PSL season activation                | HIGH     | OG-35-PSL-ACT  |
| GAP-35-07  | DNS cutover (psl.co.za)              | HIGH     | OG-35-DNS      |
| GAP-35-08  | Commerce/checkout                    | DEFERRED | OG-35-COMMERCE |
| GAP-35-09  | Match ticketing                      | DEFERRED | OG-35-TICKET   |
| GAP-35-10  | Wallet production                    | DEFERRED | OG-35-WALLET   |

## Conclusion

The PSL One platform is **CONDITIONAL_GO** for beta launch with WC2026 data.
Production launch with PSL data requires resolution of GAP-35-05 through GAP-35-07.
Commerce and ticketing are explicitly deferred per ADR-033.
