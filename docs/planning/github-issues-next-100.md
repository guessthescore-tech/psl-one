# PSL One — GitHub Issues 51–150

**Generated:** 2026-06-08  
**Author:** PSL One Chief Architecture Agent  
**Scope:** Sprint 0 and Sprint 1 issues (continuing from initial-github-issues.md which covers 1–50)

---

## Label Reference

```
domain: identity | football | fantasy | loyalty | wallet | fan | notifications | content | sponsor | admin
type: epic | feature | story | task | chore | bug
priority: p0 | p1 | p2 | p3
track: infra | backend | frontend | docs | ci | security | testing | agent
sprint: sprint-0 | sprint-1 | sprint-2
```

---

## Sprint 0 Issues (Infrastructure, Tooling, Documentation)

---

### Issue 051 — Create New Agent Config: DevOps Agent
**Type:** Task | **Priority:** P0 | **Labels:** agent, sprint-0  
**Owner Agent:** Programme Director  
**Review Agent:** None

**Description:**
Create `.claude/agents/devops.md` defining the DevOps Agent's mission, inputs, outputs and standards. The DevOps Agent builds all Terraform infrastructure and GitHub Actions CI/CD pipelines.

**Acceptance Criteria:**
- [ ] File created at `.claude/agents/devops.md`
- [ ] Mission clearly scoped to infra and CI/CD
- [ ] Inputs (ADRs, EAB) and outputs (Terraform, workflows) specified
- [ ] TDAP reference included

**Dependencies:** None

---

### Issue 052 — Create New Agent Config: Frontend Agent
**Type:** Task | **Priority:** P0 | **Labels:** agent, sprint-0  
**Owner Agent:** Programme Director  
**Review Agent:** None

**Description:**
Create `.claude/agents/frontend.md` for the Next.js 15 web app and admin portal. Must reference design skills and design system standards.

**Acceptance Criteria:**
- [ ] File created at `.claude/agents/frontend.md`
- [ ] References design skills (`.claude/skills/psl-design-director.md`)
- [ ] Tech stack (Next.js 15, TanStack Query, Zustand, ShadCN) specified
- [ ] ADR-008 reference included

**Dependencies:** ADR-008

---

### Issue 053 — Create New Agent Config: Notifications Agent
**Type:** Task | **Priority:** P1 | **Labels:** agent, sprint-0  
**Owner Agent:** Programme Director  
**Review Agent:** None

**Description:**
Create `.claude/agents/notifications.md`. Multi-channel delivery engine. Consumes events. No business logic.

**Acceptance Criteria:**
- [ ] File created at `.claude/agents/notifications.md`
- [ ] Event subscriptions listed
- [ ] Channels (Push, Email, SMS) specified

**Dependencies:** None

---

### Issue 054 — Create New Agent Config: Content Agent
**Type:** Task | **Priority:** P2 | **Labels:** agent, sprint-0  
**Owner Agent:** Programme Director

**Description:**
Create `.claude/agents/content.md` for the Content Service (articles, videos, media).

**Acceptance Criteria:**
- [ ] File created
- [ ] Scope limited to Content bounded context

**Dependencies:** None

---

### Issue 055 — Create New Agent Config: Sponsor Agent
**Type:** Task | **Priority:** P2 | **Labels:** agent, sprint-0

**Description:**
Create `.claude/agents/sponsor.md` for the Sponsor Service (campaign management, audience segments).

**Acceptance Criteria:**
- [ ] File created
- [ ] Privacy rules (no PII to sponsors) explicitly stated

**Dependencies:** None

---

### Issue 056 — Update PR Review Agent to Trigger Design Review for Frontend Changes
**Type:** Chore | **Priority:** P1 | **Labels:** agent, sprint-0

**Description:**
Update `.claude/review-agents/pr-review-agent.md` to invoke `.claude/skills/psl-design-director.md` and `.claude/skills/design-taste-frontend.md` for PRs touching `apps/web/` or `apps/admin/`.

**Acceptance Criteria:**
- [ ] PR review agent config updated
- [ ] Design review triggered for UI changes

**Dependencies:** Issue 052

---

### Issue 057 — Write Kafka Event Catalogue
**Type:** Task | **Priority:** P0 | **Labels:** docs, sprint-0  
**Owner Agent:** Programme Director  
**Review Agent:** Technical Review Board

**Description:**
Document all 45+ Kafka events with JSON schema, topic name, producer service and consumer services. Save to `docs/architecture/event-catalogue.md`.

Format per event:
```yaml
event: identity.user.registered
topic: identity.user.registered
producer: identity-service
consumers: [fan-service, wallet-service, loyalty-service, notifications-service]
schema:
  eventId: string (UUID)
  eventType: "identity.user.registered"
  version: "1.0.0"
  timestamp: string (ISO 8601)
  tenantId: string
  correlationId: string
  payload:
    userId: string
    email: string
    mobile: string
    fanName: string
    timestamp: string
```

**Acceptance Criteria:**
- [ ] All 45+ events documented
- [ ] Every event has: topic, producer, consumers, schema
- [ ] Reviewed by Technical Review Board
- [ ] Used as source of truth for `packages/event-schemas`

**Dependencies:** ADR-004

---

### Issue 058 — Write Environment Strategy Document
**Type:** Task | **Priority:** P0 | **Labels:** docs, infra, sprint-0  
**Owner Agent:** Programme Director + DevOps Agent

**Description:**
Document the 3-environment strategy (dev, staging, production) including:
- AWS account per environment
- Environment variable naming
- Secret management strategy
- DNS strategy (dev.pslone.co.za, staging.pslone.co.za, pslone.co.za)
- Deployment rules (what triggers each environment)

**Acceptance Criteria:**
- [ ] `docs/architecture/environment-strategy.md` created
- [ ] 3 environments documented
- [ ] DNS strategy defined
- [ ] Deployment triggers documented

**Dependencies:** ADR-006

---

### Issue 059 — Complete TDAP (Add All Missing Sections)
**Type:** Task | **Priority:** P0 | **Labels:** docs, sprint-0  
**Owner Agent:** Programme Director

**Description:**
The current `docs/architecture/TDAP.md` is 127 lines and truncated. Add the following missing sections:
- Technology stack per service
- NestJS module structure standards
- Prisma naming conventions
- Kafka producer/consumer patterns
- GraphQL schema conventions
- Test standards (Vitest, coverage thresholds)
- Error handling standards
- Logging standards (structured JSON, log levels)
- API versioning strategy
- Environment variable naming (`PSL_<SERVICE>_<KEY>`)
- Docker standards (multi-stage builds, non-root user)
- Performance requirements per endpoint type
- Security standards per service type

**Acceptance Criteria:**
- [ ] TDAP has all listed sections
- [ ] All agents have read TDAP before Sprint 1
- [ ] Technical Review Board has approved

**Dependencies:** ADRs 001-010

---

### Issue 060 — Complete PRD Phase 1
**Type:** Task | **Priority:** CRITICAL | **Labels:** docs, sprint-0  
**Owner Agent:** Programme Director + Product Owner

**Description:**
The current `docs/product/PRD.md` is empty (1 line). Write Phase 1 product requirements covering the following features:
1. Fan registration and identity verification
2. Fan profile and club affiliation
3. Fixture list and standings
4. Match centre (live scores)
5. Fantasy football (squad, transfers, scoring)
6. Guess The Score (predictions, settlement)
7. Loyalty points and tier display
8. Wallet balance display
9. Content feed (articles)
10. Admin portal (user management, rewards)

For each: user story format, acceptance criteria, out-of-scope statements.

**Acceptance Criteria:**
- [ ] ≥30 user stories in PRD
- [ ] Each story: "As a [role], I want [feature], so that [benefit]"
- [ ] Each story has ≥3 acceptance criteria
- [ ] Non-functional requirements defined (response times, accessibility)
- [ ] Out-of-scope list (what is NOT in Phase 1)
- [ ] Product Owner approval documented

**Dependencies:** BRD, EAB

---

### Issue 061 — Rewrite Implementation Programme (Real Delivery Plan)
**Type:** Task | **Priority:** HIGH | **Labels:** docs, sprint-0  
**Owner Agent:** Programme Director

**Description:**
The current `docs/delivery/implementation-programme.md` is a duplicate of `docs/business/BRD.md`. Overwrite it with a real delivery programme containing:
- 12-week sprint schedule
- Milestones (Identity MVP, Football Live, Fantasy Live, GTS Live, Wallet Live, Soft Launch)
- Agent assignments per sprint
- Resource requirements
- Go/no-go criteria per phase
- Risk register
- Phase 1 scope boundaries

**Acceptance Criteria:**
- [ ] Real sprint plan (not BRD duplicate)
- [ ] 12-week schedule with milestones
- [ ] Risk register with owners
- [ ] Agent assignments documented

**Dependencies:** PRD (Issue 060), ADRs, build-sequence.md

---

### Issue 062 — Create `docker-compose.yml` Local Development Stack
**Type:** Task | **Priority:** P0 | **Labels:** infra, dev-experience, sprint-0  
**Owner Agent:** DevOps Agent

**Description:**
Create `docker-compose.yml` at repository root for local development. Must include:
- PostgreSQL 16 (one container, multiple schemas)
- Redis 7
- Apache Kafka (KRaft mode, no Zookeeper)
- Kafka UI (for local event inspection)
- AWS LocalStack (for local S3, SES, Secrets Manager testing)

**Acceptance Criteria:**
- [ ] `docker-compose up` starts all services
- [ ] PostgreSQL accessible on port 5432
- [ ] Redis accessible on port 6379
- [ ] Kafka accessible on port 9092
- [ ] Kafka UI accessible on port 8080
- [ ] LocalStack accessible on port 4566
- [ ] `docker-compose down -v` cleans up cleanly
- [ ] `scripts/seed-local.sh` runs seed data

**Dependencies:** Issue 001 (monorepo)

---

### Issue 063 — Create GitHub Issue Templates
**Type:** Chore | **Priority:** P1 | **Labels:** ci, sprint-0  
**Owner Agent:** Programme Director

**Description:**
Create GitHub Issue templates in `.github/ISSUE_TEMPLATE/`:
- `epic.yml` — Epic with business value, success metrics
- `feature.yml` — Feature with user story, acceptance criteria, domain
- `story.yml` — Story with user story, acceptance criteria, agent assignment
- `task.yml` — Technical task with acceptance criteria
- `bug.yml` — Bug with reproduction steps, expected vs actual

**Acceptance Criteria:**
- [ ] 5 templates created
- [ ] Templates used for all new issues
- [ ] Templates include labels and assignee fields

**Dependencies:** None

---

### Issue 064 — Create .github/CODEOWNERS
**Type:** Chore | **Priority:** HIGH | **Labels:** ci, sprint-0

**Description:**
Create `.github/CODEOWNERS` to enforce domain boundary ownership:
```
# Default owners
*                          @psl-one/platform-team

# Service ownership
services/identity/         @psl-one/platform-team
services/football/         @psl-one/football-team
services/fantasy/          @psl-one/fantasy-team
services/loyalty/          @psl-one/gts-team
services/wallet/           @psl-one/wallet-team
services/notifications/    @psl-one/platform-team
apps/web/                  @psl-one/frontend-team
apps/admin/                @psl-one/frontend-team
infra/                     @psl-one/devops-team
packages/event-schemas/    @psl-one/platform-team   # Changes require Technical Review Board
docs/adr/                  @psl-one/architecture-team
```

**Acceptance Criteria:**
- [ ] CODEOWNERS file created
- [ ] All service directories have owners
- [ ] `packages/event-schemas` requires Technical Review Board sign-off

**Dependencies:** Issue 001

---

### Issue 065 — Bootstrap `packages/shared-types`
**Type:** Task | **Priority:** P0 | **Labels:** backend, sprint-0  
**Owner Agent:** Platform Agent  
**Review Agent:** Technical Review Board

**Description:**
Create `packages/shared-types` containing all cross-service TypeScript interfaces:
```typescript
// Pagination
interface PaginatedResult<T> { data: T[]; total: number; cursor?: string }

// Tenant context
interface TenantContext { tenantId: string; tenantType: 'PSL' | 'CLUB' | 'SPONSOR' }

// User reference (lightweight, for cross-service use)
interface UserRef { id: string; email: string; mobile: string; roles: UserRole[] }
enum UserRole { FAN, CLUB_ADMIN, SPONSOR_ADMIN, PSL_ADMIN, SUPER_ADMIN }

// Competition / Season references
interface CompetitionRef { id: string; name: string; code: string }
interface SeasonRef { id: string; competitionId: string; label: string }

// Club / Player references
interface ClubRef { id: string; name: string; shortName: string; logoUrl?: string }
interface PlayerRef { id: string; name: string; position: PlayerPosition; clubId: string }
enum PlayerPosition { GK, DEF, MID, FWD }

// Common value objects
type UUID = string
type ISODateString = string
type Currency = 'POINTS' | 'ZAR'
```

**Acceptance Criteria:**
- [ ] Package compiles with zero errors
- [ ] All enums and interfaces exported
- [ ] Used by at least 2 services before Sprint 1 end
- [ ] Semantic versioned

**Dependencies:** Issue 001 (monorepo)

---

### Issue 066 — Bootstrap `packages/event-schemas`
**Type:** Task | **Priority:** P0 | **Labels:** backend, sprint-0  
**Owner Agent:** Platform Agent  
**Review Agent:** Technical Review Board

**Description:**
Create `packages/event-schemas` with Zod schemas for all Kafka events. Include:
- Base `KafkaEvent<T>` envelope (Issue 057)
- Identity events: `UserRegistered`, `UserVerified`, `UserLoggedIn`, `UserDeleted`, `ConsentGranted`, `ConsentWithdrawn`
- Fan events: `FanProfileCreated`, `FanProfileUpdated`, `ClubAffiliationSet`
- Football events: `FixtureCreated`, `FixtureUpdated`, `MatchStarted`, `MatchFinished`, `GoalScored`
- Loyalty events: `PointsAwarded`, `PointsDeducted`, `TierUpgraded`, `RewardRedeemed`
- GTS events: `PredictionCreated`, `PredictionSettled`
- Wallet events: `WalletCreated`, `WalletCredited`, `WalletDebited`, `WalletFrozen`
- Fantasy events: `FantasyTeamCreated`, `FantasyTransferMade`, `FantasyPointsAwarded`
- Notification events: `NotificationSent`, `NotificationFailed`

**Acceptance Criteria:**
- [ ] All schemas defined with Zod
- [ ] TypeScript types inferred from Zod schemas (`z.infer<typeof ...>`)
- [ ] Compile with zero errors
- [ ] Validate correctly (unit tests for valid + invalid payloads)
- [ ] Version in package name: `@psl-one/event-schemas@1.0.0`

**Dependencies:** Issues 057, 065

---

### Issue 067 — Bootstrap `packages/kafka-client`
**Type:** Task | **Priority:** P0 | **Labels:** backend, sprint-0  
**Owner Agent:** Platform Agent  
**Review Agent:** Technical Review Board

**Description:**
Create `packages/kafka-client` — a NestJS module that wraps KafkaJS with:
- Schema validation on publish (using `packages/event-schemas`)
- Automatic event envelope injection (eventId, timestamp, correlationId)
- Dead letter queue (DLQ) for failed consumers
- Outbox pattern helper (for transactional publishing)
- Topic name constants (prevents typos)

**Acceptance Criteria:**
- [ ] `KafkaModule.forRoot()` and `KafkaModule.forFeature()` patterns
- [ ] Publishing validates schema before sending
- [ ] Consumer automatically logs + sends to DLQ on processing error
- [ ] Outbox helper works with Prisma transactions
- [ ] Unit tests pass

**Dependencies:** Issues 065, 066

---

### Issue 068 — Bootstrap `packages/auth-guards`
**Type:** Task | **Priority:** P0 | **Labels:** backend, sprint-0  
**Owner Agent:** Platform Agent  
**Review Agent:** Security Review Agent

**Description:**
Create `packages/auth-guards` — shared NestJS auth utilities:
- `JwtAuthGuard` — validates JWT RS256 signature
- `RolesGuard` — enforces `@Roles()` decorator
- `@Roles(...roles)` decorator
- `@CurrentUser()` parameter decorator (extracts user from JWT)
- `TenantGuard` — ensures tenantId is present on every request
- JWT public key configuration

**Acceptance Criteria:**
- [ ] Guards protect endpoints correctly
- [ ] `@Roles(UserRole.PSL_ADMIN)` blocks non-admin users
- [ ] `@CurrentUser()` returns typed UserRef
- [ ] Unit tests cover all guard scenarios
- [ ] Security Review Agent signed off

**Dependencies:** Issue 065, ADR-001

---

### Issue 069 — Bootstrap `packages/testing`
**Type:** Task | **Priority:** HIGH | **Labels:** testing, sprint-0  
**Owner Agent:** Platform Agent

**Description:**
Create `packages/testing` with test utilities:
- `TestDatabaseModule` — sets up isolated test PostgreSQL database (test containers)
- `TestKafkaModule` — in-memory Kafka mock
- `createUser()` factory — creates test user with all required relations
- `createFixture()` factory — creates test football fixture
- `jwtFactory.create()` — creates valid test JWT
- `mockKafkaConsumer()` — captures published events for assertions

**Acceptance Criteria:**
- [ ] Test DB setup/teardown works in ≤2 seconds
- [ ] All factories produce valid objects
- [ ] Used by at least 2 service test suites before Sprint 1 end

**Dependencies:** Issues 065, 066, ADR-005, ADR-009

---

### Issue 070 — Bootstrap `packages/ui` with PSL Design System
**Type:** Task | **Priority:** HIGH | **Labels:** frontend, sprint-0  
**Owner Agent:** Frontend Agent  
**Review Agent:** Design Skill review

**Description:**
Create `packages/ui` with:
- ShadCN component installation (`Button`, `Input`, `Card`, `Dialog`, `Table`, `Badge`, `Avatar`)
- PSL brand design tokens (colours, typography, spacing)
- Tailwind preset with PSL token extensions
- `PslThemeProvider` component
- Basic icon set (lucide-react)

**PSL Brand Colours (placeholder — update with official):**
- Primary: `#1B4332` (PSL green)
- Accent: `#FFD700` (gold)
- Background: `#0A0A0A` (dark) / `#FFFFFF` (light)
- Text: `#F5F5F5` (dark mode) / `#111111` (light mode)

**Acceptance Criteria:**
- [ ] `@psl-one/ui` importable in apps/web
- [ ] All ShadCN components styled with PSL tokens
- [ ] Dark mode supported
- [ ] Storybook (or equivalent) documents all components
- [ ] Design skill review passed

**Dependencies:** Issues 001, 052

---

### Issue 071 — Create `packages/logger`
**Type:** Task | **Priority:** HIGH | **Labels:** backend, sprint-0  
**Owner Agent:** Platform Agent

**Description:**
Shared structured logger for all NestJS services:
- Wraps `pino` (high-performance JSON logger)
- Automatic request context injection (correlationId, tenantId, userId)
- Log level: DEBUG in dev, INFO in production
- OpenTelemetry trace injection (traceId, spanId in log lines)
- `@PslLogger()` decorator for NestJS injection

**Acceptance Criteria:**
- [ ] All log output is JSON (machine-parseable by CloudWatch)
- [ ] Every log line includes: service, level, message, correlationId, timestamp
- [ ] Unit tests verify log format

**Dependencies:** Issue 001

---

### Issue 072 — Terraform: Monorepo Structure and State Backend
**Type:** Task | **Priority:** P0 | **Labels:** infra, sprint-0  
**Owner Agent:** DevOps Agent

**Description:**
Create Terraform directory structure and configure remote state:
```
infra/
  terraform/
    modules/          # reusable modules
    environments/
      dev/
      staging/
      production/
    scripts/          # helper scripts
```
Configure S3 backend for Terraform state (one state file per environment).
Configure DynamoDB state locking.
Configure Terragrunt for DRY environment configs.

**Acceptance Criteria:**
- [ ] `terraform init` succeeds in all 3 environments
- [ ] State stored in S3 with locking via DynamoDB
- [ ] `terraform plan` produces clean output (no errors)
- [ ] README documents how to apply each environment

**Dependencies:** ADR-006, Issue 003 (networking)

---

### Issue 073 — Terraform: IAM Roles and Policies
**Type:** Task | **Priority:** P0 | **Labels:** infra, security, sprint-0  
**Owner Agent:** DevOps Agent  
**Review Agent:** Security Review Agent

**Description:**
Create IAM roles and policies following least-privilege principle:
- ECS Task Execution Role (ECR pull, Secrets Manager read, CloudWatch logs)
- ECS Task Role per service (only resources that service needs)
- GitHub Actions OIDC role (for CI/CD without access keys)
- Terraform execution role
- MSK Producer/Consumer roles
- S3 read/write roles per service

**Acceptance Criteria:**
- [ ] No wildcard `*` permissions in any policy
- [ ] GitHub Actions uses OIDC (no long-lived access keys)
- [ ] Security Review Agent approved
- [ ] All roles documented

**Dependencies:** ADR-006, Issues 003-006

---

### Issue 074 — Terraform: AWS WAF Rules
**Type:** Task | **Priority:** HIGH | **Labels:** infra, security, sprint-0  
**Owner Agent:** DevOps Agent  
**Review Agent:** Security Review Agent

**Description:**
Configure AWS WAF for CloudFront and API Gateway:
- AWS Managed Rules (CommonRuleSet, KnownBadInputsRuleSet)
- Rate limiting: 1000 requests/5 min per IP (API), 10 requests/15 min (auth endpoints)
- SQL injection protection
- XSS protection
- Bot control (basic)
- Geo-blocking: allow only ZA + relevant African countries

**Acceptance Criteria:**
- [ ] WAF associated with CloudFront and API Gateway
- [ ] Rate limiting tested (returns 429 on breach)
- [ ] SQL injection test blocked
- [ ] Security Review Agent approved

**Dependencies:** Issue 003

---

### Issue 075 — GitHub Actions: Terraform Pipeline
**Type:** Task | **Priority:** HIGH | **Labels:** ci, infra, sprint-0  
**Owner Agent:** DevOps Agent

**Description:**
Create `.github/workflows/terraform.yml`:
- Trigger: PR changes to `infra/terraform/`
- `terraform fmt -check` — formatting
- `terraform validate`
- `terraform plan` (for target environment based on branch)
- Post plan diff as PR comment
- `terraform apply` on merge (manual approval for staging/prod)

**Acceptance Criteria:**
- [ ] Plan output posted to PR as comment
- [ ] Apply requires manual approval for staging/prod
- [ ] Terraform state never modified without PR + review
- [ ] Failed plans block PR merge

**Dependencies:** Issues 007, 072

---

### Issue 076 — Set Up Repository Secrets for CI/CD
**Type:** Task | **Priority:** P0 | **Labels:** ci, security, sprint-0  
**Owner Agent:** DevOps Agent

**Description:**
Configure GitHub repository secrets and environment secrets:
- `AWS_ACCOUNT_ID_DEV`
- `AWS_ACCOUNT_ID_STAGING`
- `AWS_ACCOUNT_ID_PROD`
- `AWS_REGION` = `af-south-1`
- OIDC role ARNs per environment
- No long-lived AWS access keys in GitHub

**Acceptance Criteria:**
- [ ] All secrets configured
- [ ] CI/CD pipelines use OIDC roles
- [ ] No AWS access keys in repository or environment variables
- [ ] Secrets rotatable without code change

**Dependencies:** Issue 073

---

## Sprint 1 Issues (Feature Development)

---

### Issue 077 — Identity Service: Prisma Schema (Users, Sessions, Consent)
**Type:** Story | **Priority:** P0 | **Labels:** backend, identity, sprint-1  
**Owner Agent:** Platform Agent  
**Review Agent:** PR Review Agent + Technical Review Board

**Description:**
Write the Identity Service Prisma schema:
```prisma
model User {
  id              String   @id @default(uuid())
  email           String   @unique
  mobile          String   @unique
  name            String
  passwordHash    String
  roles           UserRole[]
  isVerified      Boolean  @default(false)
  isActive        Boolean  @default(true)
  provider        AuthProvider @default(LOCAL)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  sessions        Session[]
  consentRecords  ConsentRecord[]
  verificationTokens VerificationToken[]
}

model Session {
  id            String   @id @default(uuid())
  userId        String
  refreshToken  String   @unique
  ipAddress     String
  userAgent     String?
  expiresAt     DateTime
  revokedAt     DateTime?
  createdAt     DateTime @default(now())
  user          User     @relation(...)
}

model ConsentRecord {
  id          String          @id @default(uuid())
  userId      String
  purpose     ConsentPurpose
  granted     Boolean
  ipAddress   String
  userAgent   String?
  timestamp   DateTime        @default(now())
  user        User            @relation(...)
  @@index([userId, purpose])
}

enum UserRole { FAN CLUB_ADMIN SPONSOR_ADMIN PSL_ADMIN SUPER_ADMIN COMPLIANCE_OFFICER }
enum AuthProvider { LOCAL GOOGLE FACEBOOK APPLE }
enum ConsentPurpose { REGISTRATION MARKETING ANALYTICS THIRD_PARTY_SHARING }
```

**Acceptance Criteria:**
- [ ] Prisma schema compiles
- [ ] Migration runs against Aurora Serverless v2
- [ ] All indexes defined
- [ ] No nullable fields that should be required

**Dependencies:** ADR-005, Issue 069

---

### Issue 078 — Identity Service: Registration Endpoint
**Type:** Story | **Priority:** P0 | **Labels:** backend, identity, sprint-1  
**Owner Agent:** Platform Agent  
**Review Agent:** PR Review Agent + Security Review Agent

**Description:**
`POST /auth/register` with:
- Request body: `{ name, email, mobile, password, favouriteClubId, consent: { marketing, analytics } }`
- Validation: Zod schema at controller level
- Password: bcrypt hash (cost 12)
- Duplicate check: 409 on existing email or mobile
- POPIA: create ConsentRecord for REGISTRATION (always), MARKETING, ANALYTICS (based on consent object)
- Mobile OTP: generate 6-digit OTP, store hashed, send via SMS provider
- Publish `identity.user.registered` Kafka event (via Outbox)
- Response: `{ userId, message: "Verification OTP sent to mobile" }`

**Acceptance Criteria:**
- [ ] Registration creates User record
- [ ] ConsentRecord created for each consent purpose
- [ ] OTP sent to mobile
- [ ] `identity.user.registered` published to Kafka
- [ ] Duplicate email returns 409
- [ ] Duplicate mobile returns 409
- [ ] Invalid email format returns 422
- [ ] Weak password returns 422 (min 8 chars, 1 uppercase, 1 number)
- [ ] Unit tests: 10 test cases minimum
- [ ] Integration test: full registration flow against test DB
- [ ] Security Review: no PII in logs

**Dependencies:** Issues 077, 067, 068

---

### Issue 079 — Identity Service: OTP Verification
**Type:** Story | **Priority:** P0 | **Labels:** backend, identity, sprint-1  
**Owner Agent:** Platform Agent  
**Review Agent:** PR Review Agent + Security Review Agent

**Description:**
`POST /auth/verify-mobile` with:
- Request: `{ userId, otp }`
- OTP expiry: 10 minutes
- Max attempts: 3 (account locked on 3rd failure, requires re-send)
- On success: set `user.isVerified = true`, publish `identity.user.verified`
- Resend OTP: `POST /auth/resend-otp` (rate limited: 3 per hour)

**Acceptance Criteria:**
- [ ] Valid OTP sets isVerified = true
- [ ] Expired OTP returns 410
- [ ] Wrong OTP after 3 attempts locks verification
- [ ] `identity.user.verified` event published
- [ ] Resend rate limited

**Dependencies:** Issue 078

---

### Issue 080 — Identity Service: Login + JWT Issuance
**Type:** Story | **Priority:** P0 | **Labels:** backend, identity, sprint-1  
**Owner Agent:** Platform Agent  
**Review Agent:** PR Review Agent + Security Review Agent

**Description:**
`POST /auth/login`:
- Request: `{ identifier, password }` (identifier = email or mobile)
- Validation: user must be verified
- JWT: RS256 signed, 15-minute access token
- Refresh token: cryptographically random 64-byte hex, stored hashed, 30 days
- Rate limiting: 10 failed attempts per 15 min per IP → 429 lockout
- Publish `identity.user.logged_in` event
- Response: `{ accessToken, refreshToken, expiresIn: 900 }`

**Acceptance Criteria:**
- [ ] Valid credentials return JWT pair
- [ ] Unverified user returns 403 with clear message
- [ ] Wrong password returns 401 (no user existence leak)
- [ ] Rate limiting blocks after 10 failures
- [ ] Token contains: sub (userId), email, roles, tenantId, iat, exp
- [ ] Refresh token stored as hash (not plaintext)
- [ ] `identity.user.logged_in` published

**Dependencies:** Issues 077, 079

---

### Issue 081 — Identity Service: Refresh Token + Logout
**Type:** Story | **Priority:** P0 | **Labels:** backend, identity, sprint-1  
**Owner Agent:** Platform Agent  
**Review Agent:** PR Review Agent

**Description:**
`POST /auth/refresh` — issue new access + refresh token pair (rotation)  
`POST /auth/logout` — revoke refresh token  

Refresh token rotation: old token revoked, new token issued in same request.  
Detect refresh token reuse: if revoked token presented, revoke entire session family.

**Acceptance Criteria:**
- [ ] Refresh returns new token pair
- [ ] Old refresh token revoked on rotation
- [ ] Reused refresh token triggers session family revocation
- [ ] Logout revokes session in database
- [ ] Tests cover token rotation and reuse scenarios

**Dependencies:** Issue 080

---

### Issue 082 — Identity Service: Password Reset Flow
**Type:** Story | **Priority:** P1 | **Labels:** backend, identity, sprint-1  
**Owner Agent:** Platform Agent  
**Review Agent:** PR Review Agent

**Description:**
`POST /auth/forgot-password` — send password reset email (token, 1-hour expiry)  
`POST /auth/reset-password` — validate token, update password, revoke all active sessions  
Email via AWS SES.

**Acceptance Criteria:**
- [ ] Reset email sent via SES
- [ ] Token expires after 1 hour
- [ ] Token can only be used once
- [ ] All sessions revoked on password change
- [ ] Old password rejected after reset

**Dependencies:** Issues 080, 081

---

### Issue 083 — Identity Service: GraphQL Subgraph Registration
**Type:** Story | **Priority:** P0 | **Labels:** backend, identity, sprint-1  
**Owner Agent:** Platform Agent  
**Review Agent:** PR Review Agent + Technical Review Board

**Description:**
Register Identity Service as Apollo Federation v2 subgraph:
- `type User @key(fields: "id")` — federated entity
- `Query.me: User` — returns current authenticated user
- `Mutation.updateConsent(purposes: [ConsentInput!]!): ConsentResult`
- `Mutation.deleteAccount(reason: String): Boolean`

**Acceptance Criteria:**
- [ ] Subgraph schema compiles without errors
- [ ] Registers with federation gateway
- [ ] `Query.me` returns authenticated user's data
- [ ] `User` entity extendable by other subgraphs

**Dependencies:** Issues 077-082, Issue 033

---

### Issue 084 — Football Service: Complete Prisma Schema + Seed Data
**Type:** Story | **Priority:** P0 | **Labels:** backend, football, sprint-1  
**Owner Agent:** Football Core Agent  
**Review Agent:** PR Review Agent + Technical Review Board

**Description:**
Write Football Service Prisma schema with full seed data for PSL 2025/26 and MTN8 2025.

Schema must include: `Competition`, `Season`, `Club`, `Player`, `Fixture`, `Result`, `Standing`, `MatchEvent`, `Group`

Seed data: All 16 PSL clubs, full 2025/26 season fixture list (if available), MTN8 2025 bracket.

**Acceptance Criteria:**
- [ ] Schema compiles and migrates cleanly
- [ ] 16 PSL clubs seeded with correct names, logos
- [ ] ≥30 PSL 2025/26 fixtures seeded
- [ ] MTN8 2025 structure seeded
- [ ] NO hardcoded "PSL" strings in code (grep check)
- [ ] `competition.code` used everywhere (not name)

**Dependencies:** Issues 065, 069, ADR-005

---

### Issue 085 — Football Service: GraphQL Subgraph (All Football Queries)
**Type:** Story | **Priority:** P0 | **Labels:** backend, football, sprint-1  
**Owner Agent:** Football Core Agent  
**Review Agent:** PR Review Agent

**Description:**
Implement Football GraphQL subgraph with all queries:
- `competitions: [Competition!]!`
- `competition(id: ID!): Competition`
- `currentSeason(competitionId: ID!): Season`
- `fixtures(seasonId: ID!, gameweekId: ID, status: FixtureStatus): [Fixture!]!`
- `fixture(id: ID!): Fixture`
- `standings(seasonId: ID!): [Standing!]!`
- `clubs(competitionId: ID): [Club!]!`
- `club(id: ID!): Club`
- `players(clubId: ID, position: PlayerPosition): [Player!]!`
- `player(id: ID!): Player`

Caching: Redis for standings (invalidated on MatchFinished), fixtures list (5-min TTL).

**Acceptance Criteria:**
- [ ] All queries return correct data
- [ ] Fixtures list response < 100ms (cached)
- [ ] Standings cached, invalidated on MatchFinished event
- [ ] Integration tests for all queries

**Dependencies:** Issue 084

---

### Issue 086 — Football Service: Kafka Event Publishing with Outbox Pattern
**Type:** Story | **Priority:** P0 | **Labels:** backend, football, sprint-1  
**Owner Agent:** Football Core Agent  
**Review Agent:** PR Review Agent + Technical Review Board

**Description:**
Implement Outbox Pattern for reliable Kafka event publishing from Football Service.

Events to publish: `fixture.created`, `fixture.updated`, `match.started`, `match.finished`, `goal.scored`

Outbox table in PostgreSQL: `outbox_events { id, topic, key, payload, publishedAt, attempts }`  
Worker: Polls outbox every 1 second, publishes unpublished events, marks as published.

**Acceptance Criteria:**
- [ ] All 5 events published with correct envelope
- [ ] Outbox prevents event loss on service restart
- [ ] Events validated against Zod schemas before publishing
- [ ] Dead letter queue for events that fail after 3 attempts
- [ ] Integration tests verify consumer receives events

**Dependencies:** Issues 066, 067, 084

---

### Issue 087 — Football Service: Admin REST API (Manual Data Entry)
**Type:** Story | **Priority:** P1 | **Labels:** backend, football, sprint-1  
**Owner Agent:** Football Core Agent  
**Review Agent:** PR Review Agent

**Description:**
REST API for manual football data entry (PSL admin use):
- `POST /admin/fixtures` — create fixture
- `PUT /admin/fixtures/:id` — update fixture (status, kickoff time)
- `POST /admin/results` — enter match result (triggers `match.finished`)
- `POST /admin/match-events` — add goal, card, substitution

All endpoints require `PSL_ADMIN` role.

**Acceptance Criteria:**
- [ ] All endpoints require auth + PSL_ADMIN role
- [ ] Result entry triggers `match.finished` Kafka event
- [ ] OpenAPI spec generated (`/docs`)
- [ ] Audit log entry created for every admin action

**Dependencies:** Issues 084, 086

---

### Issue 088 — Fan Service: Complete Implementation
**Type:** Story | **Priority:** P0 | **Labels:** backend, fan, sprint-1  
**Owner Agent:** Platform Agent  
**Review Agent:** PR Review Agent

**Description:**
Complete Fan Service:
1. Consume `identity.user.registered` → create FanProfile
2. Consume `loyalty.tier.upgraded` → update FanProfile tier field
3. GraphQL subgraph: `Query.myProfile`, `Mutation.updateProfile`, `Mutation.setClubAffiliation`
4. Extend `User` federation entity with fan profile fields

**Acceptance Criteria:**
- [ ] FanProfile created within 500ms of UserRegistered event
- [ ] `FanProfileCreated` Kafka event published
- [ ] Club affiliation persisted and queryable
- [ ] Preferences (notifications, content) persisted
- [ ] Tests passing including event consumer test

**Dependencies:** Issues 066, 067, 078

---

### Issue 089 — GraphQL Federation Gateway: Full Configuration
**Type:** Story | **Priority:** P0 | **Labels:** backend, gateway, sprint-1  
**Owner Agent:** Platform Agent  
**Review Agent:** PR Review Agent + Technical Review Board

**Description:**
Configure Apollo Router as production-grade federation gateway:
- Compose subgraphs: Identity, Fan, Football
- Auth header forwarding to all subgraphs
- JWT validation at gateway level (reject before forwarding)
- Rate limiting at gateway (Apollo Router native)
- Request tracing (correlationId propagation)
- Health check endpoint
- Subscription support (for live match events — scaffold only)

**Acceptance Criteria:**
- [ ] All 3 subgraphs composing without schema errors
- [ ] Cross-service query works (e.g. `me { fanProfile { primaryClub { fixtures } } }`)
- [ ] Unauthenticated requests rejected for protected fields
- [ ] Rate limiting returns 429 on breach
- [ ] Router deployed to ECS Fargate

**Dependencies:** Issues 083, 085, 088

---

### Issue 090 — Web App: Complete Registration and Login Flow
**Type:** Story | **Priority:** P0 | **Labels:** frontend, sprint-1  
**Owner Agent:** Frontend Agent  
**Review Agent:** PR Review Agent + Design Review

**Description:**
Implement complete fan registration and login UX in `apps/web`:

Screens:
1. Landing page with "Join PSL One" CTA
2. Registration form (name, email, mobile, password, club selection, consent)
3. OTP verification screen (6-digit input, resend option)
4. Login form (email/mobile + password, forgot password link)
5. Password reset (email entry + success confirmation)

**UX Requirements:**
- Mobile-first (375px minimum)
- OTP input: 6 separate boxes, auto-advance, paste support
- Club selection: scrollable list with club crests
- Consent: explicit checkboxes (not pre-checked) with links to privacy policy
- Error messages: specific and actionable (not generic "something went wrong")

**Acceptance Criteria:**
- [ ] Registration completes in ≤3 steps on mobile
- [ ] OTP paste works on iOS and Android browsers
- [ ] Error states handled for: network error, duplicate email, invalid OTP
- [ ] Lighthouse accessibility score ≥ 90
- [ ] E2E test: full registration → verification → login journey

**Dependencies:** Issues 080, 037 (scaffold), 070 (UI package)

---

### Issue 091 — Web App: Fixture List and Match Centre
**Type:** Story | **Priority:** P1 | **Labels:** frontend, sprint-1  
**Owner Agent:** Frontend Agent  
**Review Agent:** PR Review Agent + Design Review

**Description:**
Fan-facing fixture list and basic match centre:

Screens:
1. Home/Fixtures tab — fixture list with competition selector (PSL, MTN8)
2. Fixture card — home team, away team, kickoff time/score, status badge
3. Standings table — league table for current season
4. Match centre — live/finished match detail with goals, cards, lineups

**Acceptance Criteria:**
- [ ] Fixtures load within 500ms (CloudFront cached)
- [ ] Competition selector switches between PSL and MTN8
- [ ] Live scores update every 60 seconds (polling)
- [ ] Standings table shows all 16 clubs
- [ ] Works on 3G connection (tested via Chrome DevTools)

**Dependencies:** Issues 085, 089, 090

---

### Issue 092 — Notifications Service: Core Infrastructure
**Type:** Story | **Priority:** P1 | **Labels:** backend, notifications, sprint-1  
**Owner Agent:** Notifications Agent  
**Review Agent:** PR Review Agent

**Description:**
Bootstrap Notifications Service with event-driven architecture:
- Kafka consumers for: `FanProfileCreated` (→ welcome email), `FantasyPointsAwarded` (→ gameweek result), `PredictionSettled` (→ GTS result)
- Email channel: AWS SES with Handlebars templates
- Push channel: FCM (Android) + APNS (iOS) via HTTP v1 API
- Delivery log: `notification_logs` table (status, channel, attempts, timestamps)
- Preference check: respect fan `NotificationPreference` record
- Rate limiting: max 10 notifications per fan per day

**Acceptance Criteria:**
- [ ] Welcome email sent within 5 seconds of FanProfileCreated
- [ ] Push notification sent within 5 seconds of FantasyPointsAwarded
- [ ] Fan can opt out of notifications (preference respected)
- [ ] Delivery log created for every notification attempt
- [ ] Rate limiting prevents >10/day

**Dependencies:** Issues 066, 067, 088

---

### Issue 093 — Performance: Redis Caching Strategy Implementation
**Type:** Task | **Priority:** P1 | **Labels:** backend, performance, sprint-1  
**Owner Agent:** All service agents  
**Review Agent:** Performance Review Agent

**Description:**
Implement Redis caching for high-read, low-write data:
- Football standings: cache 5 minutes, invalidate on `match.finished`
- Fixture list: cache 1 hour, invalidate on `fixture.updated`
- Fantasy leaderboard: cache 5 minutes, invalidate on `FantasyPointsAwarded`
- GTS leaderboard: cache 5 minutes, invalidate on gameweek close
- Club list: cache 24 hours (rarely changes)
- Player list: cache 1 hour, invalidate on `player.transferred`

Use `@nestjs/cache-manager` with Redis adapter.

**Acceptance Criteria:**
- [ ] Cache hit rate > 80% for fixture list in load test
- [ ] Standings returned from cache < 20ms
- [ ] Cache invalidation tested (stale data not returned after event)
- [ ] Cache TTLs documented in TDAP

**Dependencies:** Issues 085, 086

---

### Issue 094 — Security: Rate Limiting Middleware (All Services)
**Type:** Task | **Priority:** P0 | **Labels:** backend, security, sprint-1  
**Owner Agent:** Platform Agent  
**Review Agent:** Security Review Agent

**Description:**
Implement rate limiting across all services using `@nestjs/throttler` with Redis store:
- Auth endpoints: 10 requests per 15 minutes per IP
- General API: 100 requests per minute per IP
- Write endpoints (predictions, transfers): 30 per minute per user
- Admin endpoints: 50 per minute per user

**Acceptance Criteria:**
- [ ] Rate limits enforced on all endpoint categories
- [ ] 429 response includes `Retry-After` header
- [ ] Rate limit counters stored in Redis (reset on Redis flush)
- [ ] Tests verify rate limiting is applied

**Dependencies:** Issues 078, 068

---

### Issue 095 — POPIA: Data Access and Deletion Endpoints
**Type:** Story | **Priority:** P0 | **Labels:** backend, security, compliance, sprint-1  
**Owner Agent:** Platform Agent  
**Review Agent:** PR Review Agent + Security Review Agent

**Description:**
POPIA-required endpoints:
- `GET /my/data` — returns all personal data held (structured JSON export within 24 hours)
- `GET /my/consent` — returns current consent preferences
- `PUT /my/consent` — update consent preferences (immutable old record, new record created)
- `DELETE /my/account` — initiates account deletion (30-day process, anonymises PII)

**Acceptance Criteria:**
- [ ] Data export includes all tables where userId is present
- [ ] Consent change creates new ConsentRecord (old not modified)
- [ ] Account deletion publishes `UserDeleted` event consumed by all services
- [ ] PII replaced with `[DELETED]` tokens after 30 days
- [ ] POPIA practitioner review completed

**Dependencies:** Issue 077

---

### Issue 096 — OpenTelemetry: Instrumentation Bootstrap
**Type:** Task | **Priority:** P1 | **Labels:** backend, observability, sprint-1  
**Owner Agent:** Platform Agent

**Description:**
Add OpenTelemetry SDK to all NestJS services. Configure trace export to AWS X-Ray.

Add custom spans for:
- All database queries (auto-instrumented by Prisma plugin)
- All Kafka produce/consume operations
- External HTTP calls
- Custom business events (e.g. "fantasy.scoring.gameweek_start")

**Acceptance Criteria:**
- [ ] All services emit traces to X-Ray
- [ ] Distributed trace visible across Identity → Fan → Gateway
- [ ] p95 latency measurable per endpoint
- [ ] Trace sampling: 100% in dev, 10% in staging/prod

**Dependencies:** Issue 071

---

### Issue 097 — Vitest Configuration for All Services
**Type:** Task | **Priority:** P0 | **Labels:** testing, sprint-1  
**Owner Agent:** Platform Agent  
**Review Agent:** None (standard tooling)

**Description:**
Configure Vitest in all NestJS services and packages:
- `vitest.config.ts` per service
- Coverage enabled: V8 provider
- Minimum coverage threshold: 80% (lines, functions, branches)
- CI integration: coverage report posted to PR
- Test database: Testcontainers PostgreSQL
- Snapshot testing disabled (prefer explicit assertions)

**Acceptance Criteria:**
- [ ] `turbo test` runs all tests
- [ ] Coverage threshold enforced in CI (fail if < 80%)
- [ ] Coverage report in PR comments
- [ ] Tests run in < 30 seconds per service (parallel)

**Dependencies:** Issues 001, 069

---

### Issue 098 — Pact Contract Tests: Identity → Fan
**Type:** Task | **Priority:** P1 | **Labels:** testing, sprint-1  
**Owner Agent:** Platform Agent  
**Review Agent:** Technical Review Board

**Description:**
First Pact consumer-driven contract test:
- Consumer: Fan Service (expects `identity.user.registered` schema)
- Provider: Identity Service (must satisfy Fan's contract)

Test: Fan Service defines what it expects from `identity.user.registered`. Identity Service runs Pact verification to prove it satisfies the contract. Breaking schema change in Identity blocks merge.

**Acceptance Criteria:**
- [ ] Pact contract file generated by Fan Service tests
- [ ] Identity Service Pact verification passes
- [ ] Contract test runs in CI
- [ ] Breaking schema change in Identity fails Pact verification

**Dependencies:** Issues 066, 067, 078, 088

---

### Issue 099 — Pact Contract Tests: Football → Fantasy
**Type:** Task | **Priority:** P1 | **Labels:** testing, sprint-1  
**Owner Agent:** Football Core Agent + Fantasy Agent  
**Review Agent:** Technical Review Board

**Description:**
Pact contract test for `football.match.finished`:
- Consumer: Fantasy Service (expects match result + player stats)
- Provider: Football Service (must satisfy contract)

**Acceptance Criteria:**
- [ ] Contract file generated
- [ ] Football Service verification passes
- [ ] CI blocks merge on contract failure

**Dependencies:** Issues 066, 085, 086

---

### Issue 100 — End-to-End Test: Full Fan Registration → Fixture → Fantasy Journey
**Type:** Task | **Priority:** P0 | **Labels:** testing, e2e, sprint-1  
**Owner Agent:** Platform Agent (QA)  
**Review Agent:** PR Review Agent

**Description:**
Playwright E2E test covering the complete Sprint 1 happy path:
1. Navigate to web app
2. Click "Join PSL One"
3. Register with test user (name, email, mobile, club, consent)
4. Enter OTP verification code
5. View fixture list for PSL 2025/26
6. Navigate to Fantasy section
7. Create fantasy team (15 players)
8. Submit GTS prediction for upcoming fixture
9. View loyalty points dashboard

**Acceptance Criteria:**
- [ ] Full journey completes in < 60 seconds
- [ ] No console errors during journey
- [ ] Test runs in CI on every PR to main
- [ ] Test uses test data that auto-cleans after run
- [ ] Test passes in both Chrome and Firefox

**Dependencies:** Issues 080-095 (all Sprint 1 features complete)

---

### Issue 101 — Monitoring: Grafana Dashboards for Phase 1
**Type:** Task | **Priority:** P1 | **Labels:** observability, sprint-1  
**Owner Agent:** DevOps Agent

**Description:**
Create Grafana Cloud dashboards:
1. **Platform Overview:** MAU/DAU, registrations, API error rate, p95 latency
2. **Service Health:** ECS CPU/memory per service, error rates, request counts
3. **Kafka Health:** Consumer lag per consumer group, message throughput
4. **Database Health:** Query latency, connection pool utilisation, storage
5. **Business Metrics:** Fantasy teams created, GTS predictions, loyalty points awarded

**Acceptance Criteria:**
- [ ] All 5 dashboards live in Grafana Cloud
- [ ] Alerts configured (error rate >1%, consumer lag >10K, API p95 >500ms)
- [ ] Dashboard access shared with PSL stakeholders
- [ ] Data retention: 30 days for metrics, 7 days for logs

**Dependencies:** Issues 044, 096

---

### Issue 102 — Load Test: Registration Surge (1,000 Concurrent)
**Type:** Task | **Priority:** P1 | **Labels:** testing, performance, sprint-1  
**Owner Agent:** DevOps Agent  
**Review Agent:** Performance Review Agent

**Description:**
K6 load test simulating 1,000 concurrent fan registrations (club launch scenario):
- Ramp up: 0→1000 users over 2 minutes
- Hold: 1000 users for 5 minutes
- Ramp down: 1000→0 over 1 minute
- Metrics: p95 registration latency, error rate, OTP SMS delivery rate

**Acceptance Criteria:**
- [ ] p95 registration response < 500ms at 1000 concurrent
- [ ] Error rate < 0.1%
- [ ] OTP delivery rate > 99%
- [ ] Database connection pool not exhausted
- [ ] Results documented and baselined for regression comparison

**Dependencies:** Issues 078, 079, dev environment deployed

---

_Issues 103-150 to be generated in Sprint 2 planning based on Sprint 1 velocity and learnings._
