# PSL One — Current State

**Purpose:** Verified point-in-time platform state  
**Audience:** Product owners, programme managers, architects, QA leads  
**Status:** Current  
**Last verified:** 2026-06-14 (STORY-39 commit `08e3852`)  
**Source of truth:** git log, test output, prisma migrate status  

---

## Latest Commit

```
08e3852  feat: add psl beta launch readiness and frontend showcase
```

Full recent history (newest first):

| Hash | Story | Title |
|------|-------|-------|
| `08e3852` | STORY-39 | Beta launch readiness and frontend showcase |
| `d0cc591` | STORY-38 | Live match intelligence and points-based social prediction gaming |
| `b083014` | STORY-37 | Media, sponsor campaigns and wallet activation foundation |
| `6b04435` | STORY-36 | Squad import, price finalisation and activation dry run |
| `b5d7f6b` | STORY-35 | Beta feedback, bug fixes and UX polish |
| `1b06a00` | STORY-34 | PSL player stats and match performance |
| `2f43344` | STORY-33 | Season-scoped leaderboards and fan value |
| `f59bf21` | STORY-32 | Admin operations control plane readiness |
| `a3bedbd` | STORY-31 | PSL matchday operations readiness |
| `88ffc09` | STORY-30 | PSL prediction season calibration |
| `c207c35` | STORY-29 | PSL fantasy season calibration |
| `0e5fc51` | STORY-28 | Season switching and PSL activation readiness |
| `1f826ea` | STORY-27 | PSL fixture import, validation and publishing |
| `94e577d` | STORY-26 | PSL club experience and season readiness |
| `5f4eebb` | STORY-24 | Admin command centre dashboard |
| `1d832fb` | docs | Sprint 1 handover docs |
| `1d48fa8` | STORY-25 | Sprint 1 fan platform foundation (merged stories 01-25) |

---

## Verified Counts

| Metric | Count | Source |
|--------|-------|--------|
| API unit test files | 54 | `find apps/api/src -name "*.spec.ts" \| wc -l` |
| API tests passing | 1,560 | `pnpm --filter @psl-one/api test` |
| Web spec files | 3 | `find apps/web/src -name "*.spec.ts" \| wc -l` |
| Web pages (`page.tsx`) | 337 | `find apps/web/src/app -name "page.tsx" \| wc -l` |
| Prisma migrations | 38 | `find apps/api/prisma/migrations -maxdepth 1 -type d \| wc -l` minus root |
| NestJS modules | 25+ | `find apps/api/src -name "*.module.ts" \| wc -l` |

---

## Current Seasons

| Season | Status | Notes |
|--------|--------|-------|
| FIFA World Cup 2026 | **ACTIVE** (`isActive: true`) | Beta reference data; preserved historical |
| PSL Premiership 2026/27 | **UPCOMING** (`isActive: false`) | All 13 readiness checks prepared; not yet activated |

> PSL activation requires explicit PSL_ADMIN trigger after all 13 checks pass. See [Beta Launch Readiness](../domain/BETA-LAUNCH.md).

---

## Completed Bounded Contexts

| Context | Module | Status |
|---------|--------|--------|
| Auth & Identity | `AuthModule` | BUILT |
| Football Core | `FootballModule` | BUILT |
| Club Experience | `ClubExperienceModule` | BUILT |
| Fixture Import | `FixtureImportModule` | BUILT |
| Squad Import | `SquadImportModule` | BUILT |
| Season Switching | `SeasonSwitchingModule` | BUILT |
| Gameweek Operations | `GameweekOperationsModule` | BUILT |
| Fantasy | `FantasyModule` | BUILT |
| Fantasy Calibration | `FantasyCalibrationModule` | BUILT |
| Fantasy Price Calibration | `FantasyPriceCalibrationModule` | BUILT |
| Predictions | `PredictionsModule` | BUILT |
| Prediction Calibration | `PredictionCalibrationModule` | BUILT |
| Social Prediction | `SocialPredictionModule` | BUILT |
| Match Centre | `MatchCentreModule` | BUILT |
| Player Stats | `PlayerStatsModule` | BUILT |
| Engagement | `EngagementModule` | BUILT |
| Fan Value | `FanValueModule` | BUILT |
| Achievements | `AchievementsModule` | BUILT |
| Rewards | `RewardsReadinessModule` | BUILT |
| Notifications | `NotificationsModule` | BUILT |
| Activity Feed | `ActivityFeedModule` | BUILT |
| Media | `MediaModule` | BUILT |
| Sponsors | `SponsorsModule` | BUILT |
| Campaigns | `CampaignsModule` | BUILT |
| Campaign Rewards | `CampaignRewardsModule` | BUILT |
| Wallet Integration | `WalletIntegrationModule` | SANDBOX_ONLY |
| Campaign Analytics | `CampaignAnalyticsModule` | BUILT |
| Admin Dashboard | `AdminDashboardModule` | BUILT |
| Admin Operations | `AdminOperationsModule` | BUILT |
| Beta Feedback | `BetaFeedbackModule` | BUILT |
| Beta Launch | `BetaLaunchModule` | BUILT |

---

## Production-Disabled Capabilities

| Capability | Reason | Route to Enable |
|-----------|--------|-----------------|
| Real wallet transactions | No provider contract | PROVIDER_REQUIRED + compliance |
| Email/SMS notifications | No provider configured | PROVIDER_REQUIRED |
| Live sports data provider | No contract | CONTRACT_REQUIRED |
| Production media CDN | No provider | PROVIDER_REQUIRED |
| Production AWS deployment | Not yet provisioned | Sprint 3 |
| PSL season activation | All 13 checks not yet met | Data finalisation (STORY-40) |
| Payments / checkout / ticketing | Deferred | CONTRACT_REQUIRED |
| Social login (Google/Apple) | Cognito not wired | PROVIDER_REQUIRED |
| Production streaming (live video) | Rights and CDN required | RIGHTS_REQUIRED + CONTRACT_REQUIRED |

---

## Current Technical Debt

| Item | Severity | Story |
|------|----------|-------|
| localStorage JWT (no httpOnly cookies) | HIGH | Sprint 3 auth hardening |
| No rate limiting | HIGH | Sprint 3 WAF/API Gateway |
| No production secret management | HIGH | Sprint 3 (AWS Secrets Manager) |
| `getBetaToken()` still returns empty string as fallback | MEDIUM | Sprint 3 session management |
| No E2E test suite | MEDIUM | Sprint 3 QA |
| Seed data uses provisional PSL players (96 placeholders) | MEDIUM | STORY-40 |
| No database backup strategy | HIGH | Sprint 3 |
| Deploy workflow targets old microservices (services/) not apps/api | MEDIUM | Sprint 3 CI/CD |
| No structured logging in API | MEDIUM | Sprint 3 observability |

---

## Current Launch Blockers (PSL Season)

All 13 season-switching readiness checks must pass before activation:

1. `clubs` — 16 PSL clubs seeded ✅
2. `fixtures_published` — PSL fixtures imported and published ⚠️ WARN (pending STORY-40)
3. `fantasy_rules` — Fantasy rules configured ✅
4. `predictions_rules` — Prediction rules configured ✅
5. `player_prices` — Player prices calibrated ✅ (provisional)
6. `gameweeks` — Gameweeks created ✅
7. `matchday_ops` — Matchday operations ready ⚠️ WARN
8. `prediction_calibration` — Prediction calibration done ✅
9. `gameweek_operations` — Gameweek ops readiness ✅
10. `squad_import` — Official squad registered ⚠️ (provisional only)
11. `fantasy_price_calibration` — Prices calibrated ✅
12. `beta_feedback` — Feedback module active ✅
13. `activation_approval` — Approval record created ✅ (APPROVED, not ACTIVATED)

---

## Next Stories

| Story | Title | Status |
|-------|-------|--------|
| STORY-40 | Official PSL Data Finalisation | RESERVED — do not implement |
| Sprint 3 | Production Infrastructure & Deployment | PLANNED |
