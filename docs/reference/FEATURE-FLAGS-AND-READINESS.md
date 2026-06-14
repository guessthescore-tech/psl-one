# PSL One — Feature Flags and Production Readiness States

**Purpose:** Reference of all production-disabled features and their enablement conditions  
**Audience:** Engineers, product, delivery team  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Production Readiness States

| State | Meaning |
|-------|---------|
| `COMMITTED` | Built, tested, active in local dev |
| `SANDBOX_ONLY` | Built, works locally, requires provider for production |
| `PROVIDER_REQUIRED` | Interface built, no real provider wired |
| `CONTRACT_REQUIRED` | Requires signed external agreement |
| `COMPLIANCE_REQUIRED` | Requires legal/regulatory review |
| `PLANNED` | Not yet built |
| `DECISION_REQUIRED` | Needs an architectural decision before proceeding |
| `RESERVED` | Slot held but not started |
| `PRODUCTION_DISABLED` | Deliberately disabled for production |

---

## Feature Readiness Table

### Core Platform

| Feature | Status | Enablement condition |
|---------|--------|---------------------|
| Fan registration and login | COMMITTED | — |
| Guess the Score predictions | COMMITTED | — |
| Fantasy Football | COMMITTED | Official PSL data (STORY-40) |
| Social Prediction Challenges | COMMITTED | — |
| Fan Value and leaderboards | COMMITTED | — |
| Achievements and badges | COMMITTED | — |
| In-app notifications | COMMITTED | Provider for email/SMS delivery |
| Activity feed | COMMITTED | — |
| Club experience | COMMITTED | — |
| Live match intelligence | COMMITTED | Official data provider (PROVIDER_REQUIRED) |
| Player stats | COMMITTED | Official data provider for live stats |
| Media content | COMMITTED | CDN provider (PROVIDER_REQUIRED) |
| Admin dashboard | COMMITTED | — |
| Beta launch management | COMMITTED | — |

### PSL Season

| Feature | Status | Enablement condition |
|---------|--------|---------------------|
| PSL season activation | PRODUCTION_DISABLED | STORY-40 + 13 checks + explicit trigger |
| Official PSL squad data | PENDING (STORY-40) | PSL provide official registrations |
| Official PSL fixture schedule | PENDING (STORY-40) | PSL provide official schedule |

### External Integrations

| Integration | Status | Enablement condition |
|------------|--------|---------------------|
| Production wallet | SANDBOX_ONLY | Contract + KYC + POPIA compliance |
| Football data provider | PROVIDER_REQUIRED | Contract with Opta/Sportradar/API-Football |
| Email delivery | PROVIDER_REQUIRED | AWS SES configuration |
| SMS delivery | PROVIDER_REQUIRED | Twilio or AWS SNS contract |
| Push notifications | PROVIDER_REQUIRED | Firebase Cloud Messaging setup |
| Social OAuth (Google) | PROVIDER_REQUIRED | Google OAuth app registration |
| Social OAuth (Apple) | PROVIDER_REQUIRED | Apple Developer OAuth setup |
| Media CDN | PROVIDER_REQUIRED | CloudFront or CDN provider config |

### Infrastructure

| Component | Status | Enablement condition |
|----------|--------|---------------------|
| ECS Fargate deployment | PLANNED | Sprint 3 infra work |
| RDS production database | PLANNED | Sprint 3 infra work |
| CloudFront CDN | PLANNED | Sprint 3 infra work |
| AWS WAF | PLANNED | Sprint 3 security work |
| Kafka event bus | DECISION_REQUIRED | Load justification needed |

---

## `IntegrationProviderConfig` Table

The `IntegrationProviderConfig` model tracks provider state in the database. Viewable at `/admin/operations/providers`.

9 seeded configs:

| Key | Provider | Current Status |
|-----|----------|----------------|
| `wallet_primary` | Silicon Enterprise (sandbox) | SANDBOX |
| `live_match_data` | API-Football | NOT_CONFIGURED |
| `email_transactional` | — | NOT_CONFIGURED |
| `sms_delivery` | — | NOT_CONFIGURED |
| `push_notifications` | — | NOT_CONFIGURED |
| `media_cdn` | — | NOT_CONFIGURED |
| `social_oauth_google` | — | NOT_CONFIGURED |
| `social_oauth_apple` | — | NOT_CONFIGURED |
| `data_export` | — | NOT_CONFIGURED |

---

## Season Switching Readiness Checks

13 checks must pass for season activation. Current state:

| # | Check | Status |
|---|-------|--------|
| 1 | clubs | PASS (16 clubs seeded) |
| 2 | fixtures_published | PASS (provisional fixtures published) |
| 3 | gameweeks_configured | PASS (gameweeks with deadlines) |
| 4 | fantasy_rules | PASS (FantasyRulesConfig present) |
| 5 | prediction_rules | PASS (PredictionRulesConfig present) |
| 6 | squad_import | PENDING (requires official PSL registrations) |
| 7 | player_prices | PASS (provisional prices set) |
| 8 | prediction_calibration | PASS (config promoted) |
| 9 | gameweek_ops | PASS (operational readiness confirmed) |
| 10 | leaderboards | PASS (season-scoped config present) |
| 11 | player_stats | PASS (module operational) |
| 12 | media_campaigns | PASS (campaign definitions available) |
| 13 | beta_cohort | PASS (cohort defined) |

**Blocker:** Check 6 (`squad_import`) requires official PSL player registration data (STORY-40).
