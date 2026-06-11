# PSL One — Initial 50 GitHub Issues

**Generated:** 2026-06-08  
**Author:** PSL One Chief Architecture Agent

---

## Priority Legend
- **P0** — Blocks everything. Must be done first.
- **P1** — Core product. Required for MVP launch.
- **P2** — Important. Required before full launch.
- **P3** — Valuable. Can defer post-launch.

---

## EPIC 1: Platform Foundations

### Issue 001 — Bootstrap Monorepo with Turborepo
**Type:** Task | **Priority:** P0 | **Complexity:** Medium | **Agent:** Platform Team

**Description:**
Initialise the PSL One monorepo using Turborepo with the following package structure:
```
apps/web          # Next.js 15 fan web app
apps/admin        # Next.js 15 admin portal
apps/club-portal  # Next.js 15 club portal
apps/sponsor-portal
services/identity
services/fan
services/football
services/fantasy
services/loyalty
services/wallet
services/content
services/notifications
services/sponsor
services/analytics
packages/shared-types
packages/event-schemas
packages/ui
packages/config
```

**Acceptance Criteria:**
- [ ] `pnpm install` succeeds at root
- [ ] `turbo build` builds all packages
- [ ] `turbo test` runs all test suites
- [ ] `turbo lint` lints all packages
- [ ] README documents setup process

**Dependencies:** None

---

### Issue 002 — Define Kafka Topic Naming Convention and Schema Registry
**Type:** Task | **Priority:** P0 | **Complexity:** Low | **Agent:** Platform Team

**Description:**
Document and enforce the Kafka topic naming convention:
`<domain>.<entity>.<action>` (e.g. `identity.user.registered`)

Set up Confluent Schema Registry (or AWS Glue Schema Registry). Define base JSON Schema for all events including envelope: `{ eventId, timestamp, version, tenantId, payload }`.

Write ADR-004.

**Acceptance Criteria:**
- [ ] ADR-004 written and merged
- [ ] Topic naming convention documented in TDAP
- [ ] Base event envelope schema defined
- [ ] Schema Registry configured in dev environment

**Dependencies:** Issue 001

---

### Issue 003 — Terraform: Core AWS Infrastructure (Networking)
**Type:** Task | **Priority:** P0 | **Complexity:** High | **Agent:** Platform Team (DevOps)

**Description:**
Provision core AWS networking infrastructure:
- VPC with public/private subnets across 2 AZs
- Internet Gateway + NAT Gateway
- Security Groups (API, services, database, cache, Kafka)
- Route53 hosted zone
- AWS Certificate Manager (SSL wildcard)

**Acceptance Criteria:**
- [ ] `terraform plan` runs without errors
- [ ] `terraform apply` creates all resources
- [ ] Services can communicate within VPC
- [ ] No public exposure of database/cache/Kafka

**Dependencies:** Issue 001

---

### Issue 004 — Terraform: AWS MSK Serverless (Kafka)
**Type:** Task | **Priority:** P0 | **Complexity:** Medium | **Agent:** Platform Team (DevOps)

**Description:**
Provision AWS MSK Serverless Kafka cluster for development. Configure:
- MSK Serverless cluster
- Security Group rules
- IAM authentication
- Initial topic creation script

**Acceptance Criteria:**
- [ ] MSK cluster created and accessible from ECS
- [ ] Topics created per naming convention
- [ ] Producer/consumer test passes

**Dependencies:** Issue 003

---

### Issue 005 — Terraform: Aurora Serverless v2 PostgreSQL
**Type:** Task | **Priority:** P0 | **Complexity:** Medium | **Agent:** Platform Team (DevOps)

**Description:**
Provision Aurora Serverless v2 PostgreSQL clusters. One cluster per bounded context (or shared dev cluster with separate schemas). Configure:
- Cluster per service
- Secrets Manager rotation
- Parameter groups
- Backup retention (7 days dev, 35 days prod)

**Acceptance Criteria:**
- [ ] Database clusters provisioned
- [ ] Secrets Manager integration working
- [ ] Migrations can be run from CI

**Dependencies:** Issue 003

---

### Issue 006 — Terraform: Redis ElastiCache and Supporting Services
**Type:** Task | **Priority:** P0 | **Complexity:** Medium | **Agent:** Platform Team (DevOps)

**Description:**
Provision ElastiCache Redis Serverless. Configure S3 buckets (media, event archive, terraform state). Set up ECR repositories for all service images.

**Acceptance Criteria:**
- [ ] Redis accessible from ECS services
- [ ] S3 buckets created with correct policies
- [ ] ECR repos created for all services

**Dependencies:** Issue 003

---

### Issue 007 — GitHub Actions: CI Pipeline (Test + Build + Lint)
**Type:** Task | **Priority:** P0 | **Complexity:** Medium | **Agent:** Platform Team (DevOps)

**Description:**
Create GitHub Actions workflow for CI:
- Trigger: PR to main + push to main
- Steps: checkout, install, lint, test, build
- Turborepo cache with GitHub Actions cache
- Test coverage reporting

**Acceptance Criteria:**
- [ ] All PRs run CI before merge
- [ ] Failed tests block merge
- [ ] Coverage report posted to PR
- [ ] Build time < 5 minutes

**Dependencies:** Issue 001

---

### Issue 008 — GitHub Actions: CD Pipeline (Deploy to Dev/Staging/Prod)
**Type:** Task | **Priority:** P0 | **Complexity:** High | **Agent:** Platform Team (DevOps)

**Description:**
Create deployment pipelines:
- Dev: auto-deploy on merge to main
- Staging: manual trigger
- Production: manual trigger with approval gate

**Acceptance Criteria:**
- [ ] New service image built and pushed to ECR
- [ ] ECS task definition updated
- [ ] ECS service redeployed with zero downtime
- [ ] Rollback mechanism documented

**Dependencies:** Issue 007

---

### Issue 009 — Write and Merge ADR-001: Authentication Provider
**Type:** Task | **Priority:** P0 | **Complexity:** Low | **Agent:** Platform Team (Architecture)

**Description:**
Evaluate and document the decision on authentication provider (AWS Cognito vs Auth0 vs Keycloak). Include:
- Cost analysis at 50K, 200K, 400K MAU
- POPIA compliance capabilities
- Social login support
- Custom consent flow feasibility
- SA data residency

**Acceptance Criteria:**
- [ ] ADR-001 written with context, decision, consequences
- [ ] Decision approved by architecture team
- [ ] Merged to main

**Dependencies:** None

---

### Issue 010 — Write and Merge ADR-002: ORM Selection
**Type:** Task | **Priority:** P0 | **Complexity:** Low | **Agent:** Platform Team (Architecture)

**Description:**
Evaluate and document ORM selection (Prisma vs TypeORM vs Drizzle ORM) for NestJS services.

**Recommendation to evaluate:** Prisma (TypeScript-first, excellent migration tooling, schema-as-code).

**Acceptance Criteria:**
- [ ] ADR-002 written and merged
- [ ] Example schema defined for Identity service

**Dependencies:** None

---

## EPIC 2: Identity Service

### Issue 011 — Identity Service: Project Scaffold
**Type:** Story | **Priority:** P0 | **Complexity:** Medium | **Agent:** Platform Team

**Description:**
Bootstrap NestJS Identity Service with:
- Module structure (AuthModule, UsersModule, ConsentModule)
- Prisma schema: users, sessions, consent_records, verification_tokens
- Kafka module (NestJS Microservices)
- Health check endpoint
- Docker + Dockerfile

**Acceptance Criteria:**
- [ ] Service starts locally
- [ ] Health check returns 200
- [ ] Database migrations run
- [ ] Connects to Kafka

**Dependencies:** Issue 001, Issue 002, Issue 010

---

### Issue 012 — Identity Service: User Registration Flow
**Type:** Story | **Priority:** P0 | **Complexity:** High | **Agent:** Platform Team

**Description:**
Implement fan registration:
- `POST /auth/register` (name, mobile, email, password, favouriteClub, consentGranted)
- Password hashing (bcrypt, 12 rounds)
- Duplicate email/mobile validation
- Mobile OTP generation via SMS provider
- Publish `UserRegistered` event to Kafka
- POPIA consent record creation

**Acceptance Criteria:**
- [ ] Registration creates user record
- [ ] Mobile OTP sent
- [ ] `UserRegistered` event published
- [ ] ConsentRecord created with POPIA_REGISTRATION purpose
- [ ] Duplicate email returns 409
- [ ] Unit tests with >80% coverage

**Dependencies:** Issue 011

---

### Issue 013 — Identity Service: Authentication (Login + JWT + Refresh)
**Type:** Story | **Priority:** P0 | **Complexity:** High | **Agent:** Platform Team

**Description:**
Implement authentication:
- `POST /auth/login` (email/mobile + password)
- JWT access token (15 min) + refresh token (30 days)
- `POST /auth/refresh-token`
- `POST /auth/logout` (revoke refresh token)
- Publish `UserLoggedIn` event
- Rate limiting: 10 attempts per 15 min per IP

**Acceptance Criteria:**
- [ ] Login returns JWT pair
- [ ] Refresh token rotates on use
- [ ] Logout revokes session
- [ ] Rate limiting blocks brute force
- [ ] Tests passing

**Dependencies:** Issue 012

---

### Issue 014 — Identity Service: Mobile Verification
**Type:** Story | **Priority:** P0 | **Complexity:** Medium | **Agent:** Platform Team

**Description:**
Implement mobile OTP verification:
- `POST /auth/verify-mobile` (OTP code)
- OTP expiry: 10 minutes
- Max 3 attempts per OTP
- Publish `UserVerified` event on success

**Acceptance Criteria:**
- [ ] Verified users can access protected endpoints
- [ ] Expired OTP rejected
- [ ] `UserVerified` event published
- [ ] Tests passing

**Dependencies:** Issue 012

---

### Issue 015 — Identity Service: RBAC Guard + Role Assignment
**Type:** Story | **Priority:** P0 | **Complexity:** Medium | **Agent:** Platform Team

**Description:**
Implement NestJS RBAC guard:
- Roles: FAN, CLUB_ADMIN, SPONSOR_ADMIN, PSL_ADMIN, SUPER_ADMIN
- `@Roles()` decorator
- JWT claims include roles array
- Shared guard package exported from `packages/auth-guards`

**Acceptance Criteria:**
- [ ] Endpoints protected by role
- [ ] 403 returned for insufficient role
- [ ] Auth guard used in at least 2 services
- [ ] Tests passing

**Dependencies:** Issue 013

---

### Issue 016 — Identity Service: GraphQL Subgraph
**Type:** Story | **Priority:** P0 | **Complexity:** Medium | **Agent:** Platform Team

**Description:**
Expose Identity data via GraphQL Federation subgraph:
- `Query.me` — current authenticated user
- Federated `User` entity (extended by other services)
- Apollo Federation v2 directives

**Acceptance Criteria:**
- [ ] Subgraph registers with federation gateway
- [ ] `Query.me` returns authenticated user data
- [ ] Other services can extend `User` entity
- [ ] Tests passing

**Dependencies:** Issue 013

---

## EPIC 3: Football Core

### Issue 017 — Football Service: Project Scaffold + Data Model
**Type:** Story | **Priority:** P0 | **Complexity:** High | **Agent:** Football Core Agent

**Description:**
Bootstrap Football Service with Prisma schema:
- competitions, seasons, clubs, players, fixtures, results, standings, match_events
- Multi-competition support (no PSL hardcoding)
- Seed data for PSL 2025/26 season, MTN8 2025

**Acceptance Criteria:**
- [ ] Prisma schema covers all football entities
- [ ] Migrations run successfully
- [ ] Seed data loaded for 2 competitions
- [ ] No hardcoded PSL references in code

**Dependencies:** Issue 001, Issue 005

---

### Issue 018 — Football Service: GraphQL API (Competitions, Fixtures, Standings)
**Type:** Story | **Priority:** P0 | **Complexity:** High | **Agent:** Football Core Agent

**Description:**
Implement Football GraphQL subgraph:
- `Query.competitions`
- `Query.currentSeason(competitionId)`
- `Query.fixtures(seasonId)`
- `Query.fixture(id)`
- `Query.standings(seasonId)`
- `Query.clubs`
- `Query.players`

**Acceptance Criteria:**
- [ ] All queries return correct data
- [ ] Performance: <100ms for fixtures query (cached)
- [ ] Tests passing (unit + integration)

**Dependencies:** Issue 017

---

### Issue 019 — Football Service: Kafka Event Publishing
**Type:** Story | **Priority:** P0 | **Complexity:** Medium | **Agent:** Football Core Agent

**Description:**
Publish Kafka events:
- `football.fixture.created`
- `football.fixture.updated`
- `football.match.started`
- `football.match.finished`
- `football.goal.scored`

Use Outbox Pattern to ensure at-least-once delivery.

**Acceptance Criteria:**
- [ ] All events published with correct schema
- [ ] Outbox pattern prevents data loss on service crash
- [ ] Event schema validated against registry
- [ ] Integration tests verify consumer receives events

**Dependencies:** Issue 017, Issue 002

---

### Issue 020 — Football Service: External Data Provider ACL
**Type:** Story | **Priority:** P1 | **Complexity:** High | **Agent:** Football Core Agent

**Description:**
Implement Anti-Corruption Layer for external football data provider. Abstract behind `FootballDataProviderPort` interface. Implement:
- Fixture sync (daily cron)
- Live match event ingestion (webhook / polling)
- Player data sync

**Acceptance Criteria:**
- [ ] Provider can be swapped without changing domain model
- [ ] Sync runs daily at 02:00
- [ ] Live events ingested within 30 seconds of occurrence
- [ ] Fallback to manual entry if provider unavailable

**Dependencies:** Issue 019

---

## EPIC 4: Fan Profile

### Issue 021 — Fan Service: Profile Creation (Consumes UserRegistered)
**Type:** Story | **Priority:** P0 | **Complexity:** Medium | **Agent:** Platform Team

**Description:**
Fan Service subscribes to `identity.user.registered`. Creates FanProfile. Publishes `fan.profile.created`.

**Acceptance Criteria:**
- [ ] FanProfile created within 1 second of UserRegistered
- [ ] FanProfileCreated event published
- [ ] Profile queryable via GraphQL

**Dependencies:** Issue 012, Issue 016

---

### Issue 022 — Fan Service: Club Affiliation and Preferences
**Type:** Story | **Priority:** P1 | **Complexity:** Medium | **Agent:** Platform Team

**Description:**
Allow fans to set club affiliation, player favourites and content/notification preferences.

**Acceptance Criteria:**
- [ ] Fan can set primary club
- [ ] Fan can add up to 5 favourite players
- [ ] Preferences saved and returned on `Query.myProfile`
- [ ] `ClubAffiliationSet` event published

**Dependencies:** Issue 021

---

## EPIC 5: Fantasy Platform

### Issue 023 — Fantasy Service: Scaffold + Squad Rules Engine
**Type:** Epic | **Priority:** P1 | **Complexity:** High | **Agent:** Fantasy Platform Agent

**Description:**
Bootstrap Fantasy Service. Implement squad validation engine (server-side only):
- 15 players: 2 GK, 5 DEF, 5 MID, 3 FWD
- Max 3 from same club
- Transfer deadline enforcement

**Acceptance Criteria:**
- [ ] Squad validation rejects invalid formations
- [ ] Server-side enforcement — no client bypass possible
- [ ] Unit tests cover all validation scenarios
- [ ] 100% coverage on squad rules

**Dependencies:** Issue 017

---

### Issue 024 — Fantasy Service: Team Creation and Transfer System
**Type:** Story | **Priority:** P1 | **Complexity:** High | **Agent:** Fantasy Platform Agent

**Description:**
`Mutation.createFantasyTeam`, `Mutation.makeTransfer`.
Transfer cost logic: free transfer bank, deduction for extra transfers.

**Acceptance Criteria:**
- [ ] Team creation validates squad rules
- [ ] Transfer cost calculated correctly
- [ ] `FantasyTransferMade` event published
- [ ] Integration tests pass

**Dependencies:** Issue 023

---

### Issue 025 — Fantasy Service: Gameweek Scoring Engine
**Type:** Story | **Priority:** P1 | **Complexity:** Very High | **Agent:** Fantasy Platform Agent

**Description:**
Implement scoring engine that consumes `football.match.finished` and `football.goal.scored` events. Calculate player points based on goals, assists, clean sheets, cards, appearances. Apply captain multipliers.

**Acceptance Criteria:**
- [ ] Scores calculated correctly for all positions
- [ ] Captain/Triple Captain multipliers applied
- [ ] Bench players fill in if starter absent
- [ ] `FantasyPointsAwarded` event published per gameweek
- [ ] Unit tests for all scoring scenarios

**Dependencies:** Issue 019, Issue 023

---

### Issue 026 — Fantasy Service: Leaderboard
**Type:** Story | **Priority:** P1 | **Complexity:** Medium | **Agent:** Fantasy Platform Agent

**Description:**
Overall and mini-league leaderboards. Cached in Redis. Updated after each gameweek.

**Acceptance Criteria:**
- [ ] Leaderboard returns within 100ms (Redis cache)
- [ ] Cache invalidated after FantasyPointsAwarded
- [ ] Pagination supported

**Dependencies:** Issue 025

---

## EPIC 6: GTS Rewards Engine

### Issue 027 — Loyalty Service: Scaffold + LoyaltyAccount Creation
**Type:** Story | **Priority:** P1 | **Complexity:** Medium | **Agent:** GTS Rewards Agent

**Description:**
Loyalty Service subscribes to `identity.user.registered`. Creates LoyaltyAccount. Awards registration bonus (100 points).

**Acceptance Criteria:**
- [ ] LoyaltyAccount created for every new user
- [ ] Registration bonus awarded and logged
- [ ] `PointsAwarded` event published
- [ ] Immutable transaction log

**Dependencies:** Issue 012

---

### Issue 028 — GTS: Prediction Engine
**Type:** Story | **Priority:** P1 | **Complexity:** High | **Agent:** GTS Rewards Agent

**Description:**
Implement Guess The Score:
- `Mutation.createPrediction(fixtureId, homeScore, awayScore)`
- Deadline: fixture kickoff time
- One prediction per fixture per fan
- `gts.prediction.created` event

**Acceptance Criteria:**
- [ ] Late predictions rejected
- [ ] Duplicate predictions rejected
- [ ] Invalid scores rejected (negative, > 20)
- [ ] Event published with correct schema
- [ ] Tests passing

**Dependencies:** Issue 027, Issue 017

---

### Issue 029 — GTS: Settlement Engine
**Type:** Story | **Priority:** P1 | **Complexity:** High | **Agent:** GTS Rewards Agent

**Description:**
Settle predictions after `football.match.finished`:
- Exact score: 500 points
- Correct result: 100 points
- Wrong: 0 points
- Publish `gts.prediction.settled` per settled prediction
- Idempotent (re-running settlement produces same result)

**Acceptance Criteria:**
- [ ] All predictions settled within 60 seconds of match.finished
- [ ] Settlement is idempotent
- [ ] `gts.prediction.settled` published
- [ ] Audit log entry created
- [ ] Tests covering all outcome scenarios

**Dependencies:** Issue 028, Issue 019

---

### Issue 030 — Loyalty Service: Points Earning Rules Engine
**Type:** Story | **Priority:** P1 | **Complexity:** High | **Agent:** GTS Rewards Agent

**Description:**
Implement configurable earning rules engine. Subscribe to all qualifying events and award points per earning rule table. Earning rules should be admin-configurable.

**Acceptance Criteria:**
- [ ] Points awarded for all 10 qualifying actions
- [ ] Rules configurable via admin API
- [ ] Each award creates immutable PointsTransaction
- [ ] Double-award prevention (idempotency key per event)
- [ ] Tests passing

**Dependencies:** Issue 027

---

## EPIC 7: Wallet

### Issue 031 — Wallet Service: Scaffold + Ledger Design
**Type:** Story | **Priority:** P1 | **Complexity:** High | **Agent:** Wallet Agent

**Description:**
Bootstrap Wallet Service with double-entry ledger design. Schema: wallets, wallet_transactions. Balance = sum of all transactions (never stored). Wallet created on `identity.user.registered`.

**Acceptance Criteria:**
- [ ] Wallet created for every new fan
- [ ] Balance computed from ledger (no stored balance column)
- [ ] Transactions are immutable
- [ ] `WalletCreated` event published
- [ ] Tests passing

**Dependencies:** Issue 012

---

### Issue 032 — Wallet Service: Credit/Debit on Loyalty Events
**Type:** Story | **Priority:** P1 | **Complexity:** Medium | **Agent:** Wallet Agent

**Description:**
Subscribe to `loyalty.points.awarded` and `loyalty.reward.redeemed`. Credit/debit wallet accordingly. Publish `WalletCredited` / `WalletDebited` events.

**Acceptance Criteria:**
- [ ] Every PointsAwarded event results in WalletCredited
- [ ] Every RewardRedeemed event results in WalletDebited
- [ ] Wallet cannot go negative
- [ ] Full audit trail

**Dependencies:** Issue 031, Issue 030

---

## EPIC 8: API Gateway + GraphQL Federation

### Issue 033 — GraphQL Federation Gateway
**Type:** Task | **Priority:** P0 | **Complexity:** High | **Agent:** Platform Team

**Description:**
Set up Apollo Router as GraphQL Federation gateway. Configure subgraph composition. All NestJS services register as subgraphs.

**Acceptance Criteria:**
- [ ] Gateway starts and composes all subgraphs
- [ ] Query spanning multiple services resolves correctly
- [ ] Authentication forwarded to all subgraphs
- [ ] Rate limiting at gateway level

**Dependencies:** Issue 016, Issue 018

---

### Issue 034 — AWS API Gateway + CloudFront Configuration
**Type:** Task | **Priority:** P0 | **Complexity:** Medium | **Agent:** Platform Team (DevOps)

**Description:**
Configure AWS API Gateway routing to ECS services. CloudFront distribution for web app and API. WAF rules: rate limiting, SQL injection, XSS protection.

**Acceptance Criteria:**
- [ ] CloudFront serves web app globally
- [ ] API routed through API Gateway
- [ ] WAF blocking common attack vectors
- [ ] SSL certificates configured

**Dependencies:** Issue 003

---

## EPIC 9: Content

### Issue 035 — Content Service: Article + Video Management
**Type:** Story | **Priority:** P1 | **Complexity:** Medium | **Agent:** Platform Team

**Description:**
Content service with article/video CRUD. Club-admin can create. PSL-admin can approve. GraphQL queries for fan consumption.

**Acceptance Criteria:**
- [ ] Articles created and published via admin
- [ ] Content scoped by club and competition
- [ ] Rich text content supported (Tiptap / Slate)
- [ ] Video assets uploaded to S3

**Dependencies:** Issue 016, Issue 015

---

## EPIC 10: Notifications

### Issue 036 — Notification Service: Multi-Channel Delivery Engine
**Type:** Story | **Priority:** P1 | **Complexity:** High | **Agent:** Platform Team

**Description:**
Notification service consuming domain events. Supports: Push (FCM/APNS), Email (SES), SMS. Template-based. Fan preference respecting.

**Acceptance Criteria:**
- [ ] Push notification delivered within 5 seconds of event
- [ ] Fan can opt out per channel
- [ ] Templates support variable substitution
- [ ] Delivery log created per notification
- [ ] Rate limiting: max 10 notifications/day per fan

**Dependencies:** Issue 021

---

## EPIC 11: Web Application

### Issue 037 — Web App: Next.js 15 Scaffold + Design System
**Type:** Task | **Priority:** P0 | **Complexity:** Medium | **Agent:** Platform Team (Frontend)

**Description:**
Bootstrap Next.js 15 app with App Router. Configure Tailwind + ShadCN. Create design tokens (PSL brand colours, typography). Set up TanStack Query for data fetching. Configure Apollo Client for GraphQL.

**Acceptance Criteria:**
- [ ] App starts locally
- [ ] Design tokens reflect PSL brand
- [ ] GraphQL client configured with auth
- [ ] Storybook (or equivalent) for component documentation

**Dependencies:** Issue 001

---

### Issue 038 — Web App: Registration + Login Flow
**Type:** Story | **Priority:** P0 | **Complexity:** Medium | **Agent:** Platform Team (Frontend)

**Description:**
Fan registration and login UI. Includes: registration form, OTP verification, login form, forgot password, token refresh.

**Acceptance Criteria:**
- [ ] Registration completes in < 3 steps
- [ ] OTP entry UX is mobile-optimised
- [ ] Error states handled gracefully
- [ ] Accessibility: WCAG 2.1 AA

**Dependencies:** Issue 013, Issue 037

---

### Issue 039 — Web App: Fixture List + Match Centre
**Type:** Story | **Priority:** P1 | **Complexity:** Medium | **Agent:** Platform Team (Frontend)

**Description:**
Fixture list, standings table, match centre with live scores. Powered by Football GraphQL queries.

**Acceptance Criteria:**
- [ ] Fixtures load within 500ms (cached)
- [ ] Live scores update in real-time (WebSocket / polling)
- [ ] Competition selector works (PSL, MTN8)
- [ ] Mobile responsive

**Dependencies:** Issue 018, Issue 037

---

### Issue 040 — Web App: Fantasy Team Management UI
**Type:** Story | **Priority:** P1 | **Complexity:** Very High | **Agent:** Platform Team (Frontend)

**Description:**
Fantasy team pitch view, player selection, transfer modal, captain selection, chip activation.

**Acceptance Criteria:**
- [ ] Pitch view renders 11 starters + 4 bench
- [ ] Transfer modal filters by position
- [ ] Transfer cost shown before confirmation
- [ ] Chips UI indicates availability
- [ ] Mobile responsive

**Dependencies:** Issue 024, Issue 037

---

## EPIC 12: Security + Compliance

### Issue 041 — POPIA Consent Management Implementation
**Type:** Story | **Priority:** P0 | **Complexity:** High | **Agent:** Platform Team

**Description:**
Implement POPIA-compliant consent management:
- Consent purposes: MARKETING, ANALYTICS, THIRD_PARTY_SHARING
- Granular opt-in/out per purpose
- Consent change history (immutable log)
- `GET /my/consent`, `PUT /my/consent`
- Data deletion workflow

**Acceptance Criteria:**
- [ ] Fans can view and change consent at any time
- [ ] Consent history is immutable
- [ ] Data deletion request removes PII within 30 days
- [ ] POPIA review sign-off obtained

**Dependencies:** Issue 012

---

### Issue 042 — Security: OWASP Hardening Checklist
**Type:** Task | **Priority:** P0 | **Complexity:** Medium | **Agent:** Platform Team (Security)

**Description:**
Implement OWASP Top 10 mitigations:
- SQL injection: parameterised queries via Prisma (automatic)
- XSS: CSP headers, output sanitisation
- CSRF: SameSite cookies, CSRF tokens
- Rate limiting: per IP per endpoint
- Secrets: no secrets in code (AWS Secrets Manager only)
- Dependency scanning: Dependabot

**Acceptance Criteria:**
- [ ] OWASP checklist reviewed and signed off
- [ ] No secrets in git history
- [ ] CSP headers configured
- [ ] Rate limiting active
- [ ] Dependabot configured

**Dependencies:** Issue 003

---

### Issue 043 — AWS GuardDuty + CloudTrail + Security Hub
**Type:** Task | **Priority:** P1 | **Complexity:** Medium | **Agent:** Platform Team (DevOps)

**Description:**
Enable AWS security services:
- GuardDuty (threat detection)
- CloudTrail (API audit log)
- Security Hub (centralised findings)
- SNS alerts for critical findings

**Acceptance Criteria:**
- [ ] GuardDuty enabled in all AWS accounts
- [ ] CloudTrail logging all API calls
- [ ] Security Hub findings reviewed weekly
- [ ] Alerts configured for critical severity

**Dependencies:** Issue 003

---

## EPIC 13: Observability

### Issue 044 — OpenTelemetry Instrumentation Across All Services
**Type:** Task | **Priority:** P1 | **Complexity:** High | **Agent:** Platform Team

**Description:**
Instrument all NestJS services with OpenTelemetry SDK. Configure trace export to AWS X-Ray. Add custom spans for key operations (DB query, Kafka publish, external API call).

**Acceptance Criteria:**
- [ ] Distributed traces visible in X-Ray
- [ ] All services emit traces
- [ ] p95 latency dashboards created
- [ ] Trace sampling: 10% in prod, 100% in dev

**Dependencies:** Issue 011

---

### Issue 045 — Grafana Cloud Dashboards (Phase 1 KPIs)
**Type:** Task | **Priority:** P1 | **Complexity:** Medium | **Agent:** Platform Team

**Description:**
Create Grafana dashboards for:
- Registered fans (total + daily)
- MAU / DAU
- API error rates
- Service health
- Kafka consumer lag
- Database connection pool usage

**Acceptance Criteria:**
- [ ] All dashboards live in Grafana Cloud
- [ ] Alerts configured for error rate > 1%
- [ ] Kafka lag alert > 10,000 messages
- [ ] Shared with PSL stakeholders

**Dependencies:** Issue 044

---

## EPIC 14: Testing + Quality

### Issue 046 — Contract Testing Setup (Pact)
**Type:** Task | **Priority:** P1 | **Complexity:** High | **Agent:** Platform Team

**Description:**
Implement Pact consumer-driven contract tests for Kafka event contracts. Priority: Identity → Fan, Football → Fantasy, Loyalty → Wallet.

**Acceptance Criteria:**
- [ ] Pact broker configured
- [ ] 3 provider/consumer pairs tested
- [ ] Contract tests run in CI
- [ ] Breaking changes blocked by failing contracts

**Dependencies:** Issue 002, Issue 019

---

### Issue 047 — Load Testing: Peak Matchday Simulation
**Type:** Task | **Priority:** P2 | **Complexity:** High | **Agent:** Platform Team

**Description:**
K6 load tests simulating peak matchday load (50,000 concurrent users). Test scenarios: browse fixtures, submit GTS prediction, check fantasy team. Target: <300ms p95 API response.

**Acceptance Criteria:**
- [ ] K6 scripts cover 3 key user journeys
- [ ] System stable at 50K concurrent
- [ ] p95 API response < 300ms under load
- [ ] No data corruption under load

**Dependencies:** Issues 017–035

---

## EPIC 15: Admin Portal

### Issue 048 — Admin Portal: User Management + RBAC
**Type:** Story | **Priority:** P1 | **Complexity:** Medium | **Agent:** Platform Team

**Description:**
Admin portal for PSL_ADMIN and SUPER_ADMIN. Features: user search, view profile, suspend/reinstate, role assignment.

**Acceptance Criteria:**
- [ ] Search by name/email/mobile
- [ ] Suspend/reinstate with audit log
- [ ] Role assignment restricted to SUPER_ADMIN
- [ ] All actions logged to CloudTrail

**Dependencies:** Issue 015, Issue 037

---

### Issue 049 — Admin Portal: Loyalty + Rewards Management
**Type:** Story | **Priority:** P1 | **Complexity:** Medium | **Agent:** Platform Team

**Description:**
Admin UI for:
- Earning rule configuration
- Reward catalogue management
- Manual point adjustments (with justification)
- Redemption order management

**Acceptance Criteria:**
- [ ] Rules configurable without code change
- [ ] Manual adjustments create audit log
- [ ] Redemption orders viewable and updatable

**Dependencies:** Issue 030, Issue 048

---

### Issue 050 — Write Architecture Decision Records (ADR-001 through ADR-006)
**Type:** Task | **Priority:** P0 | **Complexity:** Low | **Agent:** Platform Team (Architecture)

**Description:**
Write the following ADRs before Sprint 1 begins:
- ADR-001: Authentication Provider
- ADR-002: ORM Selection
- ADR-003: Monorepo Tool (Turborepo)
- ADR-004: Kafka Schema Format
- ADR-005: GraphQL vs REST strategy
- ADR-006: Frontend state management

**Acceptance Criteria:**
- [ ] All 6 ADRs written following template
- [ ] Each ADR: Context, Decision, Consequences, Alternatives Considered
- [ ] Reviewed by at least 2 team members
- [ ] Merged to `docs/adr/`

**Dependencies:** None

---

## Sprint 0 Recommended Issues (First 2 Weeks)

| Issue | Title | Owner | Days |
|---|---|---|---|
| 050 | Write ADRs | Architecture | 2 |
| 009 | ADR-001: Auth Provider | Architecture | 1 |
| 010 | ADR-002: ORM | Architecture | 1 |
| 002 | Kafka naming convention | Architecture | 1 |
| 001 | Bootstrap Monorepo | Platform | 3 |
| 003 | Terraform Networking | DevOps | 3 |
| 004 | Terraform MSK Kafka | DevOps | 2 |
| 005 | Terraform PostgreSQL | DevOps | 2 |
| 006 | Terraform Redis + S3 + ECR | DevOps | 2 |
| 007 | CI Pipeline | DevOps | 2 |
| 037 | Web App Scaffold | Frontend | 3 |

**Sprint 0 Goal:** All infrastructure provisioned. Monorepo running. ADRs written. CI pipeline green. No service code yet.
