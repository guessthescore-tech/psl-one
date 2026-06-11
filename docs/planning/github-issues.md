# PSL One — GitHub Issues (Bootstrap MVP)

**Version:** 2.0 (Bootstrap)  
**Date:** 2026-06-08  
**Replaces:** `initial-github-issues.md`, `github-issues-next-100.md`  
**Format:** Ready for `gh issue create` or manual GitHub import

---

## How to Create These Issues

```bash
# Create milestones first
gh milestone create "Sprint 0: Foundation" --due-date 2026-06-15
gh milestone create "Sprint 1: Football + Identity" --due-date 2026-06-22
gh milestone create "Sprint 2: Predictions + Loyalty" --due-date 2026-06-30
gh milestone create "Sprint 3: Fantasy" --due-date 2026-07-11
gh milestone create "Sprint 4: Match Centre + Notifications" --due-date 2026-07-23
gh milestone create "Sprint 5: Demo Day" --due-date 2026-08-10

# Create labels
gh label create "infra" --color "0075ca" --description "Infrastructure, Terraform, CI/CD"
gh label create "backend" --color "e4e669" --description "NestJS, API, database"
gh label create "frontend" --color "d93f0b" --description "Next.js, UI components"
gh label create "auth" --color "0e8a16" --description "Authentication, RBAC, POPIA"
gh label create "football" --color "1d76db" --description "Football data, fixtures, clubs"
gh label create "fantasy" --color "5319e7" --description "Fantasy football"
gh label create "gts" --color "b60205" --description "Guess the Score predictions"
gh label create "loyalty" --color "fbca04" --description "Points, tiers, rewards"
gh label create "notifications" --color "0052cc" --description "Email, push, SMS"
gh label create "blocking" --color "b60205" --description "Blocks other work"
gh label create "popia" --color "c5def5" --description "POPIA compliance requirement"
```

---

## Sprint 0: Foundation

**Milestone:** Sprint 0: Foundation  
**Target:** 2026-06-15

---

### INFRA-001: Bootstrap Terraform (EC2 + RDS + S3)

**Labels:** infra, blocking  
**Milestone:** Sprint 0

```
Create infra/terraform/bootstrap/ with:
- EC2 t2.micro (free tier)
- RDS db.t3.micro PostgreSQL 16 (free tier)
- S3 media bucket
- ECR repository for psl-one/api
- Security groups (api-sg, rds-sg)
- IAM instance profile (EC2 → S3, SES, Secrets Manager, ECR)
- AWS Budgets alert at $80/month

Reference: docs/architecture/infrastructure-bootstrap.md

Definition of Done:
- [ ] terraform plan runs clean
- [ ] terraform apply succeeds in dev account
- [ ] EC2 instance running, RDS instance reachable from EC2
- [ ] `curl http://<ec2-ip>/health` returns connection refused (no app yet)
- [ ] Budget alert configured
```

---

### INFRA-002: EC2 Application Setup (Docker + Nginx + TLS)

**Labels:** infra  
**Milestone:** Sprint 0  
**Depends on:** INFRA-001

```
Configure the EC2 instance for production-like operation:
- Docker Engine + Docker Compose v2 (via user_data.sh)
- Nginx reverse proxy config for api.pslone.co.za
- Let's Encrypt TLS certificate via certbot
- Deploy directory at /opt/psl-one/
- Set DNS A record: api.pslone.co.za → EC2 Elastic IP

Definition of Done:
- [ ] https://api.pslone.co.za accessible (503 until app deployed is OK)
- [ ] TLS certificate valid (no browser warning)
- [ ] Nginx returns 502 (app not running) not 404
```

---

### INFRA-003: GitHub Actions — CI Pipeline

**Labels:** infra, blocking  
**Milestone:** Sprint 0

```
Create/update .github/workflows/ci.yml for the monolith:
- Trigger: PR to main
- Jobs: typecheck, lint, test (Vitest), build
- PostgreSQL service container for integration tests
- Filter: changes in services/api/** or packages/**
- Block merge on any failure

Definition of Done:
- [ ] CI runs on a test PR
- [ ] Failing test blocks merge
- [ ] Passing test allows merge
- [ ] CI time < 5 minutes
```

---

### INFRA-004: GitHub Actions — Deploy Pipeline

**Labels:** infra  
**Milestone:** Sprint 0  
**Depends on:** INFRA-001, INFRA-002

```
Create/update .github/workflows/deploy.yml:
- Trigger: push to main (services/api or packages changed)
- Build Docker image, push to ECR
- SSH to EC2, pull latest image, restart docker compose
- Post-deploy health check: curl https://api.pslone.co.za/health

Required GitHub Secrets:
- EC2_HOST (Elastic IP)
- EC2_SSH_PRIVATE_KEY
- AWS_ROLE_TO_ASSUME (IAM role for GitHub OIDC)

Reference: docs/architecture/infrastructure-bootstrap.md (Deploy Workflow section)

Definition of Done:
- [ ] Push to main triggers deploy
- [ ] New Docker image is live on EC2 after deploy
- [ ] Health check passes after deploy
- [ ] Failed health check rolls back (docker compose up previous tag)
```

---

### INFRA-005: Vercel Deployment for apps/web

**Labels:** infra, frontend  
**Milestone:** Sprint 0

```
Connect apps/web to Vercel:
- Connect GitHub repo to Vercel project
- Set root directory: apps/web
- Set build command: pnpm build
- Set environment variable: NEXT_PUBLIC_API_URL=https://api.pslone.co.za
- Connect domain pslone.co.za to Vercel production

Definition of Done:
- [ ] Vercel deploys on every push to main
- [ ] Preview deployment URL created on every PR
- [ ] pslone.co.za loads the Next.js app
- [ ] NEXT_PUBLIC_API_URL is set correctly
```

---

### BACKEND-001: NestJS Monolith Scaffold

**Labels:** backend, blocking  
**Milestone:** Sprint 0

```
Create services/api/ — the single NestJS application for all of Phase 1.

Structure:
  services/api/
    src/
      modules/identity/, fan/, football/, fantasy/, gts/,
               loyalty/, wallet/, content/, notifications/, admin/,
               outbox/, health/
    prisma/schema.prisma (multi-schema)
    Dockerfile

Rules (enforced by code review):
- Modules MUST NOT import each other's Service classes
- Cross-module events via EventEmitter2 only
- All modules have module.ts, service.ts, controller.ts

Reference: docs/planning/sprint-0-bootstrap.md Workstream B

Definition of Done:
- [ ] docker-compose up starts full stack in < 60 seconds
- [ ] GET /health returns 200
- [ ] GET /health/ready returns 200 with db: connected
- [ ] All 11 domain schemas exist in PostgreSQL
- [ ] Vitest runs with > 0 tests
```

---

### BACKEND-002: Prisma Multi-Schema + Outbox + Audit Models

**Labels:** backend, blocking  
**Milestone:** Sprint 0  
**Depends on:** BACKEND-001

```
Configure Prisma with multiSchema preview feature.
Write the shared infrastructure models:
- outbox.OutboxEvent (id, topic, payload, status, attempts, createdAt, publishedAt, errorMessage)
- audit.AuditLog (id, timestamp, userId, tenantId, action, resourceType, resourceId, changes, ipAddress, correlationId)

Note: AuditLog MUST include tenantId — see ARB-001 finding 010-C.

Run initial migration: pnpm prisma migrate dev --name init

Definition of Done:
- [ ] pnpm prisma migrate deploy runs without error
- [ ] outbox_events table exists in outbox schema
- [ ] audit_log table exists in audit schema
- [ ] All 11 PostgreSQL schemas created
```

---

### BACKEND-003: Outbox Worker

**Labels:** backend  
**Milestone:** Sprint 0  
**Depends on:** BACKEND-002

```
Implement OutboxWorker in services/api/src/modules/outbox/:
- @Cron('*/5 * * * * *') — poll every 5 seconds
- Query: OutboxEvent WHERE status=PENDING AND attempts < 5 LIMIT 100
- Dispatch: EventEmitter2.emit(event.topic, event.payload)
- On success: status=PUBLISHED, publishedAt=NOW()
- On failure: status=FAILED, attempts++, errorMessage=error.message
- After 5 failed attempts: status=DEAD + log.error (alert will fire)

Definition of Done:
- [ ] OutboxWorker starts with the application
- [ ] Logs "outbox: 0 pending events" every 5 seconds (or processes if events exist)
- [ ] Writing a PENDING OutboxEvent manually causes it to be dispatched within 5s
- [ ] After 5 failures, status=DEAD and error is logged
```

---

## Sprint 1: Football + Identity

**Milestone:** Sprint 1: Football + Identity  
**Target:** 2026-06-22

---

### AUTH-001: Cognito User Pool Setup

**Labels:** auth, blocking  
**Milestone:** Sprint 1  
**Depends on:** INFRA-001

```
Create AWS Cognito User Pool for PSL One:
- Pool name: psl-one-users-dev
- Region: af-south-1
- Sign-in: email + password
- Auto-verify: email
- Password policy: 8+ chars, uppercase, number, symbol
- App client: psl-one-api (no client secret, USER_PASSWORD_AUTH flow)
- Custom attributes: custom:pslRole (string, mutable)

Output required: COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID
Add to GitHub Secrets and Secrets Manager.

Definition of Done:
- [ ] User pool exists in af-south-1
- [ ] Test user can be created via AWS CLI
- [ ] COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID in .env.example
```

---

### AUTH-002: Fan Registration Endpoint

**Labels:** auth, backend, popia  
**Milestone:** Sprint 1  
**Depends on:** AUTH-001, BACKEND-002

```
POST /api/v1/auth/register

Input: { email, password, mobile, dateOfBirth, province?, primaryClubId?,
         consentTerms: true, consentMarketing: boolean, consentAnalytics: boolean }

Flow:
1. Validate input with Zod (reject if dateOfBirth indicates under 18)
2. adminCreateUser in Cognito
3. Prisma transaction:
   - identity.User (id, email, mobile, cognitoId)
   - identity.ConsentRecord (userId, consentTerms=true, consentMarketing, consentAnalytics, ipAddress)
   - outbox.OutboxEvent (topic=identity.user.registered, payload=UserRegisteredEvent)
4. EventEmitter2.emit('identity.user.registered', payload)
5. Return: { userId, message: 'Check your email for verification' }

Age gate: If dateOfBirth indicates age < 18, return 400 with clear message.
(See ARB-001 finding 010-A — no under-18 processing without guardian consent)

Definition of Done:
- [ ] Registration creates User + ConsentRecord + OutboxEvent in one transaction
- [ ] Under-18 registration rejected with clear error
- [ ] Cognito user created
- [ ] Verification email sent by Cognito
- [ ] POST /api/v1/auth/register with valid data → 201
- [ ] Unit tests for age gate, duplicate email, missing consent
```

---

### AUTH-003: Login, Refresh, Logout

**Labels:** auth, backend  
**Milestone:** Sprint 1  
**Depends on:** AUTH-001

```
POST /api/v1/auth/login
  Input: { email, password }
  Flow: initiateAuth (USER_PASSWORD_AUTH) → return access token
  Response: { accessToken } + Set-Cookie: refreshToken (httpOnly, SameSite=Lax, Secure)
  Note: SameSite=Lax (NOT Strict) — see ARB-001 finding 010-B

POST /api/v1/auth/refresh
  Input: refreshToken cookie
  Flow: initiateAuth (REFRESH_TOKEN_AUTH) → return new access token

POST /api/v1/auth/logout
  Input: refreshToken cookie
  Flow: revokeToken + clear cookie

Definition of Done:
- [ ] Login returns access token
- [ ] Refresh token in httpOnly cookie
- [ ] Cookie is SameSite=Lax (verify in browser devtools)
- [ ] Refresh endpoint works
- [ ] Logout clears cookie
- [ ] Integration tests for all 3 endpoints
```

---

### AUTH-004: JWT Auth Guard Integration

**Labels:** auth, backend, blocking  
**Milestone:** Sprint 1  
**Depends on:** AUTH-001

```
Apply JwtAuthGuard globally in AppModule.
Configure exemptions: /health, /health/ready, /api/v1/auth/*

Using packages/auth-guards/src/jwt.guard.ts (already scaffolded).
Verify COGNITO_USER_POOL_ID + COGNITO_CLIENT_ID env vars are set.

Definition of Done:
- [ ] GET /api/v1/me with no token → 401
- [ ] GET /api/v1/me with valid Cognito JWT → 200
- [ ] GET /health with no token → 200 (exempt)
- [ ] Invalid/expired JWT → 401
```

---

### AUTH-005: POPIA Compliance Endpoints

**Labels:** auth, backend, popia  
**Milestone:** Sprint 1

```
Implement POPIA right-of-access and erasure endpoints:

GET /api/v1/me/data
  Returns all personal data for the authenticated fan
  (User, ConsentRecord, Profile, predictions count, points balance)

GET /api/v1/me/data/export
  Returns downloadable JSON of all personal data
  AuditLog entry written on every access

POST /api/v1/me/consent
  Update marketing/analytics consent flags
  Writes new ConsentRecord (append-only, NEVER update existing)

DELETE /api/v1/me/account
  Anonymise account: null email, null mobile, name="Deleted User"
  Retain aggregate data (points totals) for leaderboard integrity
  Write AuditLog entry

Reference: ADR-010, ARB-001 finding 010-A

Definition of Done:
- [ ] All 4 endpoints working
- [ ] ConsentRecord is append-only (no UPDATE query on consent_records)
- [ ] AuditLog written on data access and deletion
- [ ] Account deletion anonymises PII, does not delete row
```

---

### FOOTBALL-001: API-Football Data Quality Audit

**Labels:** football, blocking  
**Milestone:** Sprint 1

```
BEFORE writing any sync code, validate API-Football's PSL data coverage.

Use the API-Football RapidAPI sandbox to check:
1. All 16 PSL clubs present with correct names?
2. Current season (2025/26) fixture list complete?
3. Player data: all registered players per club?
4. Player statistics fields available: goals, assists, clean sheets, saves, cards?
5. Live match data: is af-south-1 timezone/kickoff times correct?

Document findings in docs/planning/api-football-data-audit.md

If coverage < 80% on any critical field: escalate to Programme Director before Sprint 2.

Definition of Done:
- [ ] Audit document written
- [ ] All critical fields verified (or gaps documented)
- [ ] Go/no-go recommendation for API-Football as primary provider
```

---

### FOOTBALL-002: Football Data Sync (API-Football Adapter)

**Labels:** football, backend  
**Milestone:** Sprint 1  
**Depends on:** FOOTBALL-001, BACKEND-001

```
Implement FootballDataProviderPort interface and API-Football adapter.

Port interface: IFootballDataProvider {
  getCompetitions(): Promise<CompetitionDto[]>
  getFixtures(competitionId, season): Promise<FixtureDto[]>
  getLiveFixtures(competitionId): Promise<LiveFixtureDto[]>
  getPlayerStats(fixtureId): Promise<PlayerStatsDto[]>
}

Adapter: ApiFootballAdapter (calls api-football.com RapidAPI)
ACL (Anti-Corruption Layer): maps API-Football response shape → internal DTOs

Sync job (NestJS @Cron):
- Every 15 minutes during match windows: sync live fixtures
- Daily at 02:00 SA time: sync completed fixture results
- Startup: sync competitions + current season clubs + players

Manual override rule: if fixture has manualOverride=true, skip provider sync for that fixture.

Definition of Done:
- [ ] Competitions sync: PSL + MTN8 in DB
- [ ] 16 PSL clubs in DB with correct names
- [ ] All registered players in DB
- [ ] Current season fixtures in DB
- [ ] Sync job runs on schedule, logs results
- [ ] Zero cross-schema JOINs in football module
```

---

### FOOTBALL-003: Football GraphQL API

**Labels:** football, backend  
**Milestone:** Sprint 1  
**Depends on:** FOOTBALL-002

```
Expose football data via GraphQL resolvers:

Queries:
- competitions: [Competition]
- fixtures(competitionId, season, status): [Fixture]
- fixture(id): Fixture
- standings(competitionId, season): [StandingEntry]
- clubs: [Club]
- club(id): Club
- players(clubId, position): [Player]
- player(id): Player

Types: Competition, Fixture, Club, Player, StandingEntry, MatchEvent

All queries require authentication (JwtAuthGuard applied globally).
Admin mutation: updateFixtureScore(fixtureId, homeScore, awayScore) @Roles(PSL_ADMIN)

Definition of Done:
- [ ] All queries return real data
- [ ] Unauthenticated request → 401
- [ ] updateFixtureScore requires PSL_ADMIN role
- [ ] AuditLog written on manual score override
```

---

### FRONTEND-001: Registration + Login Flow

**Labels:** frontend, auth  
**Milestone:** Sprint 1  
**Depends on:** AUTH-002, AUTH-003

```
Implement registration and login flows in apps/web:

Registration page (/register):
- Fields: email, password, confirm password, mobile (SA format validation),
          date of birth (required — age gate check), province (select),
          primary club (optional select)
- POPIA consent section: three separate checkboxes
  ✓ I agree to the Terms and Privacy Policy (required)
  □ I consent to marketing communications (optional)
  □ I consent to analytics data use (optional)
- Submit → POST /api/v1/auth/register
- Success: redirect to /register/verify (check email page)

Login page (/login):
- Fields: email, password
- Submit → POST /api/v1/auth/login
- Success: redirect to /
- Error: "Invalid email or password" (generic, no enumeration)

Design: PSL colours (#1B3A6B, #FFD700), mobile-first.
No business logic in frontend — all validation server-side.
Client-side validation for UX only (required fields, email format).

Definition of Done:
- [ ] Registration form submits correctly
- [ ] POPIA consent checkboxes present and required=true for Terms
- [ ] Under-18 date of birth shows clear error
- [ ] Login flow works
- [ ] Redirect after login correct
- [ ] Mobile layout at 375px usable
- [ ] Playwright E2E: register → verify email → login
```

---

### FRONTEND-002: Fixture List + Competition Filter

**Labels:** frontend, football  
**Milestone:** Sprint 1  
**Depends on:** FOOTBALL-003, FRONTEND-001

```
Implement fixture list page in apps/web:

/fixtures page:
- Competition tab filter: PSL | MTN8 | All
- Fixture card: home team logo + name, score/time, away team logo + name
- Status badge: SCHEDULED (with time) | LIVE (animated) | FINISHED
- Sorted by date ascending for upcoming, descending for recent
- Group by matchday/round label

Query: useQuery(queryKeys.football.fixtures('psl')) → GET /api/v1/football/fixtures

Home page widget: "Upcoming Fixtures" — next 3 fixtures only.

Definition of Done:
- [ ] Fixture list loads with real PSL data
- [ ] Competition filter works (PSL shows only PSL, MTN8 shows only MTN8)
- [ ] LIVE badge visible + animated for live matches
- [ ] Mobile layout clean at 375px
- [ ] Query cached for 60 seconds (staleTime)
```

---

## Sprint 2: Predictions + Loyalty

**Milestone:** Sprint 2: Predictions + Loyalty  
**Target:** 2026-06-30

---

### GTS-001: GTS Prediction Core

**Labels:** gts, backend  
**Milestone:** Sprint 2  
**Depends on:** FOOTBALL-002, AUTH-004

```
Implement GTS module in services/api/src/modules/gts/:

POST /api/v1/gts/predictions
  Input: { fixtureId, predictedHomeScore, predictedAwayScore }
  Rules:
  - Fixture must be in SCHEDULED status (not yet kicked off)
  - One prediction per fan per fixture (duplicate → 409)
  - Scores must be 0–20 (validate with Zod)
  OutboxEvent: gts.prediction.created

GET /api/v1/gts/predictions
  Returns fan's predictions (paginated, sorted newest first)
  Include: fixture data, predicted score, actual score (if finished), status, points

GET /api/v1/gts/predictions/:fixtureId
  Single prediction for a specific fixture

Definition of Done:
- [ ] Fan can submit prediction on upcoming fixture
- [ ] Duplicate prediction → 409 with clear message
- [ ] Prediction after kickoff → 400 with "Predictions are locked"
- [ ] OutboxEvent written on prediction creation
- [ ] Unit tests: duplicate, locked fixture, invalid scores
```

---

### GTS-002: GTS Settlement Engine

**Labels:** gts, backend  
**Milestone:** Sprint 2  
**Depends on:** GTS-001, FOOTBALL-002

```
Settlement engine triggered by football.match.finished event:

@OnEvent('football.match.finished')
async settlePredictions(event: MatchFinishedEvent)
  1. Find all PENDING predictions for this fixture
  2. Compare predicted score vs actual score:
     - EXACT_SCORE: both home and away correct → 10 points
     - CORRECT_RESULT: right winner/draw but wrong score → 5 points
     - INCORRECT: wrong result → 0 points
  3. Update prediction: status=SETTLED, outcome, pointsEarned
  4. OutboxEvent: gts.prediction.settled (per prediction)

Idempotency: If fixture already settled, skip (check existing SETTLED predictions).

Admin endpoint: POST /admin/gts/settle/:fixtureId (manual trigger for testing)
  @Roles(PSL_ADMIN) required.

Definition of Done:
- [ ] Settlement fires when football.match.finished event received
- [ ] EXACT_SCORE prediction → 10 points, CORRECT_RESULT → 5 points, INCORRECT → 0
- [ ] All predictions for the fixture settled
- [ ] gts.prediction.settled OutboxEvent written per prediction
- [ ] Admin can manually trigger settlement
- [ ] Unit tests for all three outcome types + idempotency
```

---

### GTS-003: GTS Leaderboard

**Labels:** gts, backend  
**Milestone:** Sprint 2

```
GET /api/v1/gts/leaderboard
  Query params: ?type=weekly|overall&limit=50
  Returns: [{ rank, fanId, displayName, tier, pointsThisWeek, pointsTotal, predictions }]

Computed from gts.prediction_settlements table.
Cache result for 5 minutes (in-memory Map with TTL — no Redis needed).

Definition of Done:
- [ ] Leaderboard returns correct ranking
- [ ] Weekly leaderboard scoped to current gameweek
- [ ] Ties broken by number of exact scores
```

---

### LOYALTY-001: Loyalty Account + Points Engine

**Labels:** loyalty, backend  
**Milestone:** Sprint 2  
**Depends on:** AUTH-002

```
Loyalty module:

On identity.user.registered event:
  - Create loyalty.Account { fanId, tier=BRONZE, totalPoints=0 }
  - Award 100 welcome points (REGISTRATION action)
  - Write loyalty.Transaction (ledger entry)
  - OutboxEvent: loyalty.points.awarded

On gts.prediction.settled event:
  - Award points based on outcome (EXACT_SCORE=10, CORRECT_RESULT=5)
  - Write loyalty.Transaction
  - Recalculate tier
  - If tier changed: OutboxEvent: loyalty.tier.changed
  - OutboxEvent: loyalty.points.awarded

Tier thresholds (example — confirm with product):
  BRONZE: 0–999 pts
  SILVER: 1000–4999 pts
  GOLD: 5000–19999 pts
  PLATINUM: 20000–49999 pts
  SUPERFAN: 50000+ pts

GET /api/v1/loyalty/account → { tier, totalPoints, tierProgressPercent }
GET /api/v1/loyalty/transactions → paginated list of earning events

Definition of Done:
- [ ] Loyalty account created on registration
- [ ] 100 welcome points awarded
- [ ] GTS settlement awards correct points
- [ ] Tier updates when threshold crossed
- [ ] tier.changed OutboxEvent fires on tier promotion
- [ ] Unit tests for tier thresholds
```

---

### WALLET-001: Wallet Ledger

**Labels:** loyalty, backend  
**Milestone:** Sprint 2  
**Depends on:** AUTH-002

```
Wallet module — separate from Loyalty (different purposes):
  Loyalty points = engagement/gamification currency
  Wallet balance = monetary/redeemable value (Phase 2 feature, scaffold only)

Phase 1 scope (scaffold only — no real money):
  - wallet.Account { fanId, balance=0, currency='ZAR' }
  - wallet.Transaction { id, accountId, type, amount, reference, createdAt }
  - DB constraint: wallet_transactions is immutable (see ARB-001 finding 005-B)
    Add PostgreSQL rule: CREATE RULE no_update AS ON UPDATE TO wallet.transactions DO INSTEAD NOTHING;

GET /api/v1/wallet/balance → { balance, currency }
GET /api/v1/wallet/transactions → paginated ledger

Definition of Done:
- [ ] Wallet account created on registration
- [ ] Wallet transactions table has DB-level immutability constraint
- [ ] Balance endpoint works
- [ ] No UPDATE possible on transactions (test this with a unit test)
```

---

### FRONTEND-003: Predictions UI

**Labels:** frontend, gts  
**Milestone:** Sprint 2  
**Depends on:** GTS-001, GTS-002, FRONTEND-002

```
Add GTS prediction UI to the fixture experience:

Fixture card (on /fixtures list):
  - If fixture SCHEDULED and fan logged in: show "Predict" button
  - If fan has prediction: show their prediction (2-1) + status badge

/gts/predict/:fixtureId page:
  - Score prediction widget: [home team] [ 0 ] - [ 0 ] [away team]
  - Submit button
  - "Predictions lock at kickoff" timestamp shown

/gts/predictions page:
  - List of all my predictions
  - Status: PENDING (green clock), EXACT_SCORE (gold star), CORRECT_RESULT (silver), INCORRECT (grey)
  - Points earned shown

/gts/leaderboard page:
  - Weekly tab + Overall tab
  - Top 50 fans with rank, name, tier badge, points

Definition of Done:
- [ ] Fan can predict score from fixture list
- [ ] Prediction shows on fixture card after submitting
- [ ] LOCKED state shown after kickoff
- [ ] Leaderboard renders correctly
- [ ] Mobile layout clean
```

---

### FRONTEND-004: Profile Page + Points Display

**Labels:** frontend, loyalty  
**Milestone:** Sprint 2  
**Depends on:** LOYALTY-001

```
Profile page /profile:
  - Avatar (initials fallback)
  - Display name, province, primary club badge
  - Current tier badge (Bronze/Silver/Gold/Platinum/Superfan) with tier colour
  - Total loyalty points + progress bar to next tier
  - Edit profile button

Navigation header:
  - Tier badge + points balance shown for logged-in fans
  - Tap → /profile

Registration success screen:
  - Celebration: "Welcome to PSL One! You've earned 100 welcome points."
  - Bronze tier badge shown

Definition of Done:
- [ ] Profile page shows correct tier and points
- [ ] Tier badge correct colour from design tokens
- [ ] Progress bar shows % to next tier
- [ ] Navigation shows tier badge
- [ ] Registration success shows welcome points
```

---

## Sprint 3: Fantasy Football

**Milestone:** Sprint 3: Fantasy  
**Target:** 2026-07-11

---

### FANTASY-001: Fantasy Squad Builder (API)

**Labels:** fantasy, backend  
**Milestone:** Sprint 3  
**Depends on:** FOOTBALL-002

```
Implement Fantasy module squad builder:

POST /api/v1/fantasy/squad
  Input: { picks: [{ playerId, position, isCaptain, isViceCaptain }] }
  Validation:
  - Exactly 15 players (2 GK, 5 DEF, 5 MID, 3 FWD)
  - Total cost ≤ R100,000,000
  - Max 3 players from same club
  - Exactly 1 captain, 1 vice-captain
  - Captain ≠ vice-captain
  OutboxEvent: fantasy.squad.created

GET /api/v1/fantasy/squad → current squad with player details

PUT /api/v1/fantasy/squad/captain
  Input: { captainPlayerId, viceCaptainPlayerId }

PUT /api/v1/fantasy/squad/transfers
  Input: { playersOut: [playerId], playersIn: [playerId] }
  Rules: 1 free transfer per gameweek, additional cost -4 points
  Transfer window open/closed check

Definition of Done:
- [ ] Valid 15-player squad saves correctly
- [ ] All validation rules enforced (formation, budget, club limit)
- [ ] Captain/VC selectable
- [ ] Transfer deduction applied for > 1 transfer
- [ ] Unit tests for all validation paths
```

---

### FANTASY-002: Player Pricing + Seeding

**Labels:** fantasy, backend  
**Milestone:** Sprint 3  
**Depends on:** FOOTBALL-002

```
Assign prices to all PSL players for Phase 1:

Pricing tiers (set manually — not algorithmic in Phase 1):
  Premium (R12-15M): top strikers and creative midfielders (~10 players)
  Mid-range (R8-11M): regular starters (~50 players)
  Budget (R4-7M): squad players, young talent (~100 players)
  Cheap (R3.5M): bench options, rarely play (~remaining)

Create seed file: services/api/prisma/seeds/fantasy-prices.ts
Run with: pnpm prisma db seed

Admin endpoint: PUT /admin/fantasy/players/:id/price @Roles(PSL_ADMIN)
  Allows price adjustment mid-season with audit log.

Definition of Done:
- [ ] All PSL players have a fantasy price
- [ ] A valid 15-player squad within R100M can be constructed
- [ ] Seed script runs without error
```

---

### FANTASY-003: Gameweek Scoring Engine

**Labels:** fantasy, backend  
**Milestone:** Sprint 3  
**Depends on:** FANTASY-001, FOOTBALL-002 (player stats)

```
Scoring engine triggered by football.match.finished event:

Point calculations:
  Playing < 60 min: +1, Playing ≥ 60 min: +2
  Goal (GK/DEF): +6, Goal (MID): +5, Goal (FWD): +4
  Assist: +3
  Clean sheet (GK/DEF): +4, Clean sheet (MID): +1
  Penalty save (GK): +5
  Yellow card: -1, Red card: -3
  Saves (GK, per 3): +1
  Own goal: -2

Captain: score × 2, Vice-captain (if captain didn't play): score × 2

Bench auto-fill: if starting player has 0 minutes, replace with bench player
  (in bench order, by position)

Gameweek total = sum of all player scores

POST /api/v1/fantasy/gameweek/:gameweekId/score triggers scoring (admin only)
GET /api/v1/fantasy/gameweek/:id/scores → detailed breakdown per player

OutboxEvent: fantasy.gameweek.scored
Loyalty: fantasy.gameweek.scored → award 1 loyalty point per fantasy point earned

Definition of Done:
- [ ] Scoring engine calculates correct totals for all position/event combinations
- [ ] Captain multiplier applied
- [ ] Bench auto-fill works
- [ ] Unit tests: goal scorer, clean sheet, captain, bench fill
- [ ] Loyalty points awarded correctly
```

---

### FANTASY-004: Fantasy Leaderboard

**Labels:** fantasy, backend  
**Milestone:** Sprint 3

```
GET /api/v1/fantasy/leaderboard
  Query params: ?gameweek=N|overall&limit=50
  Returns: [{ rank, rankChange, fanId, displayName, tier, teamName, 
              gameweekPoints, totalPoints }]

Rank change: compare current rank to previous gameweek.

Definition of Done:
- [ ] Leaderboard returns correct ranking
- [ ] Rank change shows + or - vs previous gameweek
```

---

### FRONTEND-005: Fantasy Squad Builder UI

**Labels:** frontend, fantasy  
**Milestone:** Sprint 3  
**Depends on:** FANTASY-001, FANTASY-002

```
/fantasy/squad page — Squad builder interface:

Pitch view (top half):
  - Visual pitch with player positions (4-4-2 or 4-3-3 formation)
  - Each position slot shows player name, club badge, price, points
  - C / VC badges on captain/vice-captain

Player selection panel (bottom half / drawer on mobile):
  - Search + filter by position + filter by club
  - Player list: name, club, position, price, avg points
  - Tap to add to squad / tap again to remove
  - Budget remaining counter (e.g. "R18.5M remaining")

Validation UI:
  - Red badge on position if over club limit
  - Red counter if over budget
  - Submit button disabled until squad is valid

Captain selection: long-press or button on placed player → pick C or VC

Definition of Done:
- [ ] Fan can browse all PSL players by position/club
- [ ] Tap to add/remove from squad
- [ ] Budget remaining updates live
- [ ] Club limit warning shown
- [ ] Valid squad can be submitted
- [ ] Captain + VC selectable on pitch
- [ ] Mobile usable at 375px (key UX priority)
```

---

### FRONTEND-006: Gameweek Scoring UI

**Labels:** frontend, fantasy  
**Milestone:** Sprint 3  
**Depends on:** FANTASY-003

```
/fantasy/gameweek page:

Gameweek selector (previous / current)
Points total: large number, "X points this gameweek"

Player breakdown list:
  Each player shows: name, position, club badge
  Points breakdown: e.g. "Played (2) + Goal (4) + Assist (3) = 9 pts"
  Captain bonus shown separately

Leaderboard widget: fan's rank + rank change

/fantasy/leaderboard page:
  Tab: Gameweek | Overall
  Paginated list, fan's own position highlighted

Definition of Done:
- [ ] Gameweek points total shown correctly
- [ ] Per-player breakdown readable
- [ ] Captain bonus displayed
- [ ] Leaderboard renders with rank change arrows
```

---

## Sprint 4: Match Centre + Notifications

**Milestone:** Sprint 4: Match Centre + Notifications  
**Target:** 2026-07-23

---

### FOOTBALL-004: Match Centre API

**Labels:** football, backend  
**Milestone:** Sprint 4  
**Depends on:** FOOTBALL-002

```
Add match centre data to football module:

Enhanced live sync (during LIVE status):
  - Sync every 60 seconds (API-Football rate limit aware)
  - Fetch: current score, minute, match events (goals, cards, substitutions)

GET /api/v1/football/fixtures/:id/live
  Returns: { fixture, homeScore, awayScore, minute, status, events: [...] }

GET /api/v1/football/fixtures/:id/events
  Returns match event timeline: [{ minute, type, playerId, playerName, teamId }]
  Types: GOAL, OWN_GOAL, YELLOW_CARD, RED_CARD, SUBSTITUTION, PENALTY

Definition of Done:
- [ ] Match centre endpoint returns complete data for a live fixture
- [ ] For a finished fixture, returns final data + all events
- [ ] Sync frequency increases to 60s when fixture status=LIVE
```

---

### FRONTEND-007: Match Centre Page

**Labels:** frontend, football  
**Milestone:** Sprint 4  
**Depends on:** FOOTBALL-004

```
/fixtures/:id page — Match centre:

Score section:
  - Home team crest, name, score | Away team crest, name, score
  - Match status: minute (if live) or full time
  - LIVE badge (animated red dot + pulse)

Match events timeline:
  - Chronological list of goals, cards, substitutions
  - Goal events show scorer name
  - Club badge next to each event

My prediction widget:
  - Shows fan's prediction (if made)
  - Shows outcome badge after match: EXACT_SCORE / CORRECT_RESULT / INCORRECT
  - Points earned shown

My fantasy players section:
  - List of fan's fantasy players appearing in this match
  - Their current fantasy points for this fixture

Auto-refresh: every 60 seconds during LIVE status (TanStack Query refetchInterval)
Manual refresh button (for after final whistle — user-triggered)

Definition of Done:
- [ ] Match centre loads for any fixture
- [ ] LIVE match auto-refreshes every 60s
- [ ] My prediction shown with outcome
- [ ] My fantasy players shown
- [ ] Mobile layout clean and readable
```

---

### NOTIF-001: Transactional Email Notifications

**Labels:** notifications, backend  
**Milestone:** Sprint 4  
**Depends on:** AUTH-002, LOYALTY-001, GTS-002, FANTASY-003

```
Implement notifications module:

Email templates (React Email):
  1. welcome.tsx — Sent on identity.user.registered
     Subject: "Welcome to PSL One, [name]!"
     Body: welcome message, "You've earned 100 points", CTA to explore fixtures

  2. gts-result.tsx — Sent on gts.prediction.settled
     Subject: "[Club A] [X]-[Y] [Club B] — Your prediction result"
     Body: prediction vs actual, outcome badge, points earned, current total

  3. tier-promoted.tsx — Sent on loyalty.tier.changed
     Subject: "You've reached [Tier] status!"
     Body: new tier name + colour, benefits, next tier target

  4. gameweek-score.tsx — Sent on fantasy.gameweek.scored
     Subject: "GW[N] score: [X] points ([rank] place)"
     Body: top performers in squad, total points, leaderboard rank

Rules:
  - Check fan's consentMarketing before sending emails 2, 3, 4
  - Welcome email (1) always sent (part of service, not marketing)
  - All emails have unsubscribe link (POPIA + CAN-SPAM)
  - Record in notifications.notification_deliveries

SES integration: AWS SES in af-south-1, from noreply@pslone.co.za

Definition of Done:
- [ ] Welcome email sent on registration (verify in Mailpit locally, SES in staging)
- [ ] GTS result email sent after settlement
- [ ] Marketing emails suppressed for fans with consentMarketing=false
- [ ] Unsubscribe link in every email
- [ ] Delivery log written for every send attempt
```

---

### ADMIN-001: Admin Override Tools

**Labels:** backend, football  
**Milestone:** Sprint 4

```
Admin endpoints for PSL staff (all require @Roles(Role.PSL_ADMIN)):

Football overrides:
  PUT /admin/football/fixtures/:id/score
    Input: { homeScore, awayScore }
    Sets manualOverride=true on the fixture
    Writes AuditLog entry
    Fires football.match.finished if fixture status becomes FINISHED

  PUT /admin/football/fixtures/:id/status
    Input: { status: SCHEDULED|LIVE|FINISHED|POSTPONED|CANCELLED }

  POST /admin/football/players
    Create a player manually (for players missing from API-Football)

Outbox management (for recovery):
  GET /admin/outbox/dead
    Returns dead-lettered outbox events

  POST /admin/outbox/:id/retry
    Resets status=PENDING, attempts=0 for manual retry
    AuditLog entry required

Basic admin UI (apps/admin):
  /admin/fixtures — fixture list with score entry form
  /admin/outbox — dead letter queue viewer

Definition of Done:
- [ ] Admin can enter final score via API
- [ ] Score entry triggers settlement cascade (GTS, Fantasy)
- [ ] Dead events visible and retryable
- [ ] Admin UI usable (not polished — functional)
- [ ] All admin actions logged in AuditLog
```

---

## Sprint 5: Demo Day

**Milestone:** Sprint 5: Demo Day  
**Target:** 2026-08-10

---

### DEMO-001: Seed Data for Demo

**Labels:** backend  
**Milestone:** Sprint 5

```
Create comprehensive seed data for stakeholder demonstrations:

PSL data (real):
  - All 16 PSL clubs with logos (stored in S3)
  - Current season player roster per club
  - 2025/26 season fixture list

Demo fan accounts:
  - superfan@demo.pslone.co.za — Platinum tier, high GTS accuracy, top 10 fantasy
  - casual@demo.pslone.co.za — Bronze tier, made a few predictions
  - newbie@demo.pslone.co.za — just registered, no predictions yet

Historical data for demo:
  - 3 completed gameweeks with real-ish scores
  - GTS predictions for demo fans with mixed outcomes
  - Fantasy scores for completed gameweeks

Seed script: services/api/prisma/seeds/demo-seed.ts
Run: pnpm tsx prisma/seeds/demo-seed.ts

Definition of Done:
- [ ] Demo accounts can log in
- [ ] superfan account shows compelling points history + tier
- [ ] Completed gameweeks show in fantasy history
- [ ] Fixture list has real upcoming PSL fixtures
```

---

### QA-001: End-to-End Playwright Tests

**Labels:** frontend, backend  
**Milestone:** Sprint 5

```
Playwright E2E tests covering the core fan journey:

tests/e2e/registration.spec.ts:
  - Register with valid data → verify email message shown
  - Register under-18 → error message shown
  - Register with existing email → error shown

tests/e2e/gts-prediction.spec.ts:
  - Login → navigate to fixture → submit prediction → prediction shown on card
  - Attempt prediction after kickoff → locked message shown

tests/e2e/fantasy-squad.spec.ts:
  - Login → go to squad builder → select 15 valid players → submit
  - Submit with > 3 from same club → validation error

tests/e2e/match-centre.spec.ts:
  - Navigate to finished fixture → score shown → events shown
  - Navigate to match centre → my prediction shown

Run: pnpm playwright test
Target: all tests passing before Demo Day.

Definition of Done:
- [ ] All 4 test suites passing
- [ ] Tests run in CI (chromium + mobile viewport)
- [ ] No hardcoded test data — use demo seed accounts
```

---

### QA-002: Performance + Lighthouse Audit

**Labels:** frontend  
**Milestone:** Sprint 5

```
Lighthouse audit on all key pages before Demo Day:

Target: LCP < 2.5s, FID < 100ms, CLS < 0.1 on mobile preset

Pages to audit:
  / (home), /fixtures, /fixtures/:id, /profile,
  /gts/predictions, /gts/leaderboard,
  /fantasy/squad, /fantasy/gameweek

Run: npx lighthouse https://pslone.co.za --preset=mobile --output=json

For any page scoring < 80:
  - Identify failing metrics
  - Fix (image optimization, bundle size, render-blocking scripts)
  - Re-audit

Definition of Done:
- [ ] All pages ≥ 80 Lighthouse mobile performance score
- [ ] No axe-core accessibility violations on registration, login, fixtures
```

---

### QA-003: Security Pre-Launch Checklist

**Labels:** auth, backend  
**Milestone:** Sprint 5

```
Manual security check before Demo Day:

Authentication:
  [ ] JWT RS256 validation correct (aws-jwt-verify in use)
  [ ] Expired token → 401 (not 500)
  [ ] Invalid token → 401
  [ ] Missing token → 401

RBAC:
  [ ] Admin endpoints with FAN role → 403
  [ ] Admin endpoints with no role → 401

Input validation:
  [ ] SQL injection attempt on search/filter params → 400 or no result
  [ ] XSS payload in profile name → stored safely, rendered escaped

POPIA:
  [ ] ConsentRecord written on registration
  [ ] Data export endpoint returns all personal data
  [ ] Account deletion anonymises PII
  [ ] Under-18 registration blocked

Cookies:
  [ ] Refresh token cookie: httpOnly=true, SameSite=Lax, Secure=true
  [ ] No sensitive data in localStorage

Rate limiting:
  [ ] POST /auth/login throttled to 10 requests/15 min per IP

Definition of Done:
- [ ] All checklist items verified and documented
- [ ] Any failures fixed before Demo Day
```

---

## Total Issue Count by Sprint

| Sprint | Issues | Labels |
|---|---|---|
| Sprint 0 | 5 (INFRA-001–005) + 3 (BACKEND-001–003) = **8** | infra, backend |
| Sprint 1 | 5 (AUTH) + 3 (FOOTBALL) + 2 (FRONTEND) = **10** | auth, football, frontend |
| Sprint 2 | 3 (GTS) + 2 (LOYALTY/WALLET) + 2 (FRONTEND) = **7** | gts, loyalty, frontend |
| Sprint 3 | 4 (FANTASY) + 2 (FRONTEND) = **6** | fantasy, frontend |
| Sprint 4 | 2 (FOOTBALL/FRONTEND) + 1 (NOTIF) + 1 (ADMIN) = **4** | football, notifications |
| Sprint 5 | 1 (DEMO) + 3 (QA) = **4** | all |
| **Total** | **39 issues** | |
