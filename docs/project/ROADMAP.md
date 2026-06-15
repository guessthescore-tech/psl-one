# PSL One — Programme Roadmap

**Purpose:** Programme direction and delivery classification  
**Audience:** Product owners, programme management, architects  
**Status:** Current as of STORY-39  
**Last updated:** 2026-06-14  

> Items classified as PLANNED, PROVIDER_REQUIRED, CONTRACT_REQUIRED, etc. are not yet implemented. Do not present them as delivered.

---

## Completed

### Sprint 0 — Architecture & Bootstrap (June 2026)

| Story | Status | Delivered |
|-------|--------|-----------|
| STORY-00 | COMMITTED | Monorepo, ADRs, IAM planning, Docker Compose, CI skeleton |

### Sprint 1 — Fan Platform Foundation (June 2026)

| Story | Status | Delivered |
|-------|--------|-----------|
| STORY-01 | COMMITTED | Fan auth — register, login, JWT, password reset |
| STORY-02 | COMMITTED | Football core — competitions, seasons, teams, fixtures, venues, players |
| STORY-03 | COMMITTED | Fan profile, preferences, consent |
| STORY-04 | COMMITTED | Live fixture feed, match state (SCHEDULED/LIVE/FINISHED) |
| STORY-05 | COMMITTED | Guess the Score, peer challenges foundation |
| STORY-06 | COMMITTED | Fantasy team selection, player pool |
| STORY-07 | COMMITTED | Gameweek management, transfer deadlines |
| STORY-08 | COMMITTED | Competition and season management |
| STORY-09 | COMMITTED | Competition import, manual seeding |
| STORY-10 | COMMITTED | Fixture and gameweek assignment |
| STORY-11 | COMMITTED | Prediction lock/settle/void lifecycle |
| STORY-12 | COMMITTED | Fantasy transfer rules engine |
| STORY-13 | COMMITTED | Fantasy chips |
| STORY-14 | COMMITTED | Fantasy rules admin configuration |
| STORY-15 | COMMITTED | Fantasy leagues and cups |
| STORY-16 | COMMITTED | Gameweek-level Fantasy scoring and history |
| STORY-17 | COMMITTED | Live match dashboard |
| STORY-18 | COMMITTED | Fantasy auto-substitution |
| STORY-19 | COMMITTED | Fan Value ledger (non-financial) |
| STORY-20 | COMMITTED | Achievements and badges |
| STORY-21 | COMMITTED | Rewards readiness |
| STORY-22 | COMMITTED | Notifications and alerts (in-app) |
| STORY-23 | COMMITTED | Social activity feed |
| STORY-24 | COMMITTED | Admin command centre dashboard |
| STORY-25 | COMMITTED | Sprint 1 final handover and beta readiness review |

**Sprint 1 totals:** ~800 API tests, ~275 web pages, 28 migrations

### Sprint 2 — PSL Season Readiness (June 2026)

| Story | Status | Delivered |
|-------|--------|-----------|
| STORY-26 | COMMITTED | PSL clubs, squad seeding, club experience pages |
| STORY-27 | COMMITTED | Fixture import, validation, publishing |
| STORY-28 | COMMITTED | Season switching (World Cup → PSL), 7-check readiness gate |
| STORY-29 | COMMITTED | PSL Fantasy season calibration, provisional player prices |
| STORY-30 | COMMITTED | PSL Guess the Score season calibration, PredictionRulesConfig |
| STORY-31 | COMMITTED | Gameweek and matchday operations readiness |
| STORY-32 | COMMITTED | Admin operations control plane, IntegrationProviderConfig |
| STORY-33 | COMMITTED | Season-scoped leaderboards, Fan Value season scope |
| STORY-34 | COMMITTED | PSL player stats and match performance |
| STORY-35 | COMMITTED | Beta feedback, bug fixes, UX polish, AdminAuditLog |
| STORY-36 | COMMITTED | Squad import, price finalisation, 13-check gate, activation dry-run |
| STORY-37 | COMMITTED | Media, sponsors, campaigns, rewards, sandbox wallet |
| STORY-38 | COMMITTED | Live match intelligence, Match Centre, social prediction gaming |
| STORY-39 | COMMITTED | Beta launch readiness, cohort management, approval, 18 new web pages |

**Sprint 2 totals:** 1,560 API tests, 337 web pages, 38 migrations total

---

## Current — Sprint 3 Foundation (Production Infrastructure & Deployment)

### Sprint 3 Streams

| Stream | Classification | Description |
|--------|---------------|-------------|
| Cloud account and VPC | PLANNED | AWS af-south-1, networking, security groups |
| Container deployment | IMPLEMENTATION_AUTHORED | ECS Fargate for `apps/api` and `apps/web`; not deployed |
| Managed PostgreSQL | IMPLEMENTATION_AUTHORED | RDS PostgreSQL module authored; creation approval required |
| CDN | PLANNED_AFTER_INITIAL_STAGING | CloudFront optional after ALB-based staging |
| DNS and TLS | PLANNED | Route 53, ACM certificates |
| Secrets management | IMPLEMENTATION_AUTHORED | Secrets Manager references only; no secret values committed |
| CI/CD hardening | IMPLEMENTATION_AUTHORED | GitHub Actions → ECR → ECS deploy pipeline authored; no deploy run |
| Central logging | IMPLEMENTATION_AUTHORED | CloudWatch log groups authored in Terraform |
| Metrics and alerting | PLANNED | CloudWatch log groups authored in Terraform; ECS/ALB/RDS alarms not yet authored — planned for a later infrastructure increment |
| Distributed tracing | DECISION_REQUIRED | AWS X-Ray or equivalent |
| Production auth hardening | PLANNED | httpOnly cookies, session rotation, rate limiting |
| WAF and rate limiting | PLANNED | AWS WAF, API Gateway throttling |
| Database backups | PLANNED | RDS automated backups, point-in-time recovery |
| Restore testing | PLANNED | Monthly restore drill |
| Health checks | IMPLEMENTATION_AUTHORED | API/web health endpoints and ALB/ECS health checks authored |
| Deployment rollback | IMPLEMENTATION_AUTHORED | ECS rolling deployment circuit breaker; blue/green deferred |

---

## Reserved Next Product Story

### STORY-40 — Official PSL Data Finalisation

**Status:** RESERVED — not yet started  
**Classification:** PLANNED  
**Purpose:** Replace provisional PSL squad data with official 2026/27 player registrations; confirm official fixture schedule; promote Fantasy and Prediction rules from PROVISIONAL to ACTIVE; clear remaining season-switching blockers  
**Dependencies:** Official PSL player registration data received; official fixture schedule received  
**Unblocks:** PSL season activation  

> STORY-40 is not implemented. Do not treat any existing data as official PSL data.

---

## Future Streams

| Area | Classification | Notes |
|------|---------------|-------|
| Live sports data provider | CONTRACT_REQUIRED | Opta / Stats Perform / Sportradar / API-Football |
| Notification delivery (email/SMS/push) | PROVIDER_REQUIRED | SES, Twilio, Firebase Cloud Messaging |
| Production wallet / payments | CONTRACT_REQUIRED + COMPLIANCE_REQUIRED | Regulated provider, KYC, POPIA |
| Checkout and orders | CONTRACT_REQUIRED | Fan merchandise, tickets |
| Ticketing | CONTRACT_REQUIRED | Event ticketing provider |
| Production media delivery | CONTRACT_REQUIRED + RIGHTS_REQUIRED | CDN, DRM, broadcasting rights |
| Social OAuth | PROVIDER_REQUIRED | Google, Apple via Cognito |
| Production streaming (live video) | RIGHTS_REQUIRED + CONTRACT_REQUIRED | Broadcasting agreement required |
| Controlled PSL season activation | APPROVAL_REQUIRED | After STORY-40 and all 13 checks pass |
| Performance and load testing | PLANNED | 2 million fan capacity validation |
| Disaster recovery drill | PLANNED | Quarterly |
| POPIA compliance audit | COMPLIANCE_REQUIRED | Before fan data at scale |
| Kafka / event bus production | DECISION_REQUIRED | Requires load justification |
| Club portal | FUTURE | Club operators manage own squad/content |
| Sponsor portal | FUTURE | Sponsors manage own campaigns |
| Mobile apps | FUTURE | iOS/Android |
| Betting product integration | NOT_ALLOWED | PSL One is not a betting product |
