# PSL One — Agent Workstream Map

**Version:** 1.0  
**Date:** 2026-06-08  
**Author:** PSL One Chief Architecture Agent

This document maps every Claude agent and Codex review agent to its delivery workstream, inputs, outputs, owned files and review requirements.

---

## Agent Hierarchy

```
PROGRAMME DIRECTOR
│
├── BUILD AGENTS (produce code)
│   ├── Platform Agent (Identity, Fan, Gateway, Infra)
│   ├── Football Core Agent
│   ├── Fantasy Platform Agent
│   ├── GTS Rewards Engine Agent
│   ├── Wallet Agent
│   ├── Frontend Agent [NEW — must be created]
│   ├── DevOps Agent [NEW — must be created]
│   └── Notifications Agent [NEW — must be created]
│
├── REVIEW AGENTS (gate quality)
│   ├── PR Review Agent (first pass)
│   ├── Technical Review Board (architecture compliance)
│   ├── Security Review Agent (OWASP + POPIA)
│   └── Performance Review Agent (benchmarks)
│
└── OPERATIONS AGENTS (run continuously)
    ├── Nightly Autonomous Agent (4-hour checks)
    └── Release Readiness Agent (pre-deployment gate)
```

---

## BUILD AGENTS

### Programme Director Agent

**File:** `.claude/agents/programme-director.md`  
**Mission:** Coordinate all specialist agents. Ensure no architectural drift. Act as CTO + Chief Architect + Delivery Director.

**Inputs:**
- All planning documents in `docs/planning/`
- All ADRs in `docs/adr/`
- BRD, PRD, EAB, TDAP
- Sprint velocity data
- PR status

**Outputs:**
- Work packages for each agent
- Sprint plans
- Architecture decisions (ADRs)
- Risk register updates
- `docs/planning/` document updates
- GitHub Issues (via task-generator)

**Files / Folders Owned:**
- `docs/planning/`
- `docs/adr/`
- `docs/delivery/`
- `.claude/agents/` (manages agent configs)

**Dependencies:** None — coordinates all others

**Review Agent Required:** Self-reviewing role. Technical Review Board validates major architectural decisions.

**Definition of Done:**
- All specialist agents have active work packages
- No ADRs pending decision for more than 48 hours
- Sprint plan published before each sprint
- Risk register reviewed weekly

---

### Platform Agent (Identity + Fan + Gateway + Admin)

**Mission:** Build the Identity Service, Fan Service, GraphQL Federation Gateway and Admin Service. These are the foundational services every other agent depends on.

**Inputs:**
- ADR-001 (auth), ADR-003 (API), ADR-005 (DB), ADR-010 (security/POPIA)
- `docs/planning/bounded-contexts.md` (Identity, Fan, Admin sections)
- `packages/shared-types`, `packages/event-schemas`
- PRD Phase 1 user stories for Identity and Fan

**Outputs:**
- `services/identity/` — complete Identity Service
- `services/fan/` — complete Fan Service
- `services/admin/` — Admin Service
- `services/gateway/` — Apollo Router federation gateway
- `packages/auth-guards/` — shared RBAC guards
- `packages/shared-types/` — all TypeScript interfaces
- GitHub Actions workflows
- `docs/adr/ADR-001.md` through `ADR-003.md` (writes first drafts)

**Files / Folders Owned:**
```
services/identity/
services/fan/
services/admin/
services/gateway/
packages/shared-types/
packages/auth-guards/
packages/event-schemas/
packages/logger/
packages/errors/
packages/testing/
.github/CODEOWNERS
```

**Dependencies:**
- ADR-001 signed off before writing Identity code
- ADR-005 signed off before writing any database schemas
- `packages/config` must exist (Workstream C)

**Review Agent Required:** PR Review Agent + Security Review Agent (mandatory for Identity)

**Definition of Done:**
- Identity Service: registration, OTP verification, login, JWT, RBAC working
- Fan Service: profile created on UserRegistered event
- Gateway: all subgraphs composing without errors
- Test coverage ≥ 80%
- Security review passed

---

### Football Core Agent

**File:** `.claude/agents/football-core.md`  
**Mission:** Build the authoritative Football Service. Multi-competition. Never hardcode PSL.

**Inputs:**
- ADR-004 (Kafka), ADR-005 (DB), ADR-007 (football data provider)
- `docs/planning/bounded-contexts.md` (Football section)
- `packages/event-schemas` (football.* event schemas)
- `packages/kafka-client`
- Football data provider API documentation

**Outputs:**
- `services/football/` — complete Football Service
  - Prisma schema (competitions, seasons, clubs, players, fixtures, results, standings)
  - GraphQL subgraph (competitions, fixtures, standings, clubs, players)
  - Kafka producers (fixture.created, match.started, match.finished, goal.scored)
  - External data provider ACL
  - Admin REST API (manual data entry)
- OpenAPI spec for admin endpoints
- Kafka event schemas for all football.* events
- Seed data (PSL 2025/26, MTN8 2025)

**Files / Folders Owned:**
```
services/football/
docs/api/football-service.openapi.yaml
```

**Dependencies:**
- ADR-004 (Kafka format) before writing producers
- ADR-007 (data provider) before writing ACL
- `packages/event-schemas` must exist
- `packages/kafka-client` must exist

**Review Agent Required:** PR Review Agent + Technical Review Board

**Definition of Done:**
- All competitions queryable
- All fixtures queryable with live status
- Standings calculated from results
- All 5 Kafka events publishing with correct schema
- External data provider ACL working (or mock in place)
- Test coverage ≥ 80%
- No hardcoded PSL references in code (grep check in CI)

---

### Fantasy Platform Agent

**File:** `.claude/agents/fantasy-platform.md`  
**Mission:** Build the full fantasy football engine — squad creation, transfers, chips, scoring, leaderboards.

**Inputs:**
- ADR-004 (Kafka), ADR-005 (DB)
- `docs/planning/bounded-contexts.md` (Fantasy section)
- Football Service GraphQL schema (for player data)
- `packages/event-schemas` (fantasy.* events, football.* events consumed)
- PRD Phase 1 user stories for Fantasy

**Outputs:**
- `services/fantasy/` — complete Fantasy Service
  - Squad validation engine (server-side, all rules enforced)
  - Transfer system with deadline enforcement
  - Chip management (Wildcard, Triple Captain, Bench Boost, Free Hit)
  - Gameweek scoring engine (consumes football events)
  - Leaderboard (cached in Redis)
  - GraphQL subgraph

**Files / Folders Owned:**
```
services/fantasy/
```

**Dependencies:**
- Football Service must be running (player data)
- `football.match.finished` event schema finalised
- `football.goal.scored` event schema finalised
- ADR-005 (DB) before writing Prisma schema

**Review Agent Required:** PR Review Agent + Technical Review Board

**Definition of Done:**
- Squad creation validates all 9 rules (server-side only)
- Transfer system enforces deadlines
- Gameweek scoring correct for all positions
- Captain/Triple Captain multipliers correct
- Bench logic covers all absence scenarios
- All 5 chips working, one-use enforced
- Leaderboard returns within 100ms (Redis)
- Test coverage ≥ 80%
- Scoring unit tests cover all edge cases

---

### GTS Rewards Engine Agent

**File:** `.claude/agents/gts-rewards-engine.md`  
**Mission:** Build the Guess The Score prediction engine and Loyalty rewards engine.

**Inputs:**
- ADR-004 (Kafka), ADR-005 (DB)
- `docs/planning/bounded-contexts.md` (Loyalty/GTS section)
- `packages/event-schemas` (gts.* events, loyalty.* events)
- Football Service (fixture data for predictions)
- PRD Phase 1 user stories for GTS and Loyalty

**Outputs:**
- `services/loyalty/` — Loyalty + GTS Service
  - LoyaltyAccount management
  - PointsTransaction ledger (immutable)
  - Earning rules engine (configurable)
  - GTS prediction engine
  - GTS settlement engine
  - Leaderboards (GTS + loyalty tier)
  - GraphQL subgraph

**Files / Folders Owned:**
```
services/loyalty/
```

**Key Rules Enforced:**
- One prediction per fan per fixture
- Predictions locked at kickoff (server-validated against fixture kick-off time)
- No real money. No sportsbook. Points only.
- Earning rules configurable by admin without code change
- Settlement is idempotent

**Dependencies:**
- `football.match.finished` event (settlement trigger)
- `identity.user.registered` event (account creation trigger)
- ADR-004 and ADR-005 signed off

**Review Agent Required:** PR Review Agent + Technical Review Board + Security Review (GTS cannot become a sportsbook)

**Definition of Done:**
- Predictions locked at kickoff (tested with mock clock)
- Duplicate predictions rejected (409)
- Settlement correct for exact score, correct result, wrong result
- Settlement idempotent (running twice = same result)
- Earning rules configurable via admin API
- Loyalty account created for every new user
- Tier computation correct
- Test coverage ≥ 80%
- Security review passed (confirm no sportsbook characteristics)

---

### Wallet Agent

**File:** `.claude/agents/wallet.md`  
**Mission:** Build the PSL digital wallet with double-entry ledger design. Phase 1: loyalty points. Phase 3: ZAR financial wallet.

**Inputs:**
- ADR-005 (DB)
- `docs/planning/bounded-contexts.md` (Wallet section)
- `packages/event-schemas` (wallet.* events)
- Loyalty events (loyalty.points.awarded consumed)

**Outputs:**
- `services/wallet/` — Wallet Service
  - Double-entry ledger (balance computed, never stored)
  - Immutable transaction log
  - Wallet created on UserRegistered
  - Credit/debit on loyalty events
  - GraphQL subgraph

**Files / Folders Owned:**
```
services/wallet/
```

**Key Rules Enforced:**
- Balance is NEVER stored directly — always computed from ledger sum
- Every transaction is immutable after creation
- Balance cannot go negative
- Every state change publishes a Kafka event

**Dependencies:**
- `identity.user.registered` event
- `loyalty.points.awarded` event
- ADR-005 signed off

**Review Agent Required:** PR Review Agent + Technical Review Board

**Definition of Done:**
- Wallet created within 1s of UserRegistered
- Balance computed correctly from ledger
- Balance cannot go negative (tested)
- All transactions immutable
- Full audit trail queryable
- Test coverage ≥ 80%

---

### Frontend Agent [MUST BE CREATED]

**File to create:** `.claude/agents/frontend.md`  
**Mission:** Build the PSL One fan-facing web app (Next.js 15) and Admin Portal.

**Inputs:**
- ADR-008 (frontend state management)
- PRD Phase 1 user stories
- GraphQL schema from federation gateway
- `packages/ui` (design system)
- `docs/planning/bounded-contexts.md`

**Outputs:**
- `apps/web/` — fan web app
  - Registration + login flow
  - Fixture list + match centre
  - Fantasy team management
  - GTS predictions
  - Profile + wallet display
  - Loyalty tier display
- `apps/admin/` — admin portal
  - User management
  - Content management
  - Rewards management

**Files / Folders Owned:**
```
apps/web/
apps/admin/
packages/ui/
```

**Design Skills to Invoke:**
- `.claude/skills/psl-design-director.md` — for design direction
- `.claude/skills/design-taste-frontend.md` — for taste review
- `.claude/skills/impeccable.md` — for quality bar

**Dependencies:**
- GraphQL Gateway operational
- `packages/ui` scaffolded
- ADR-008 signed off

**Review Agent Required:** PR Review Agent + design skill review for all UI changes

**Definition of Done:**
- All Phase 1 user journeys completeable end-to-end
- Mobile responsive (375px minimum)
- Lighthouse score ≥ 90 (performance, accessibility)
- WCAG 2.1 AA accessibility
- Test coverage: E2E happy path per feature, unit tests for utilities

---

### DevOps Agent [MUST BE CREATED]

**File to create:** `.claude/agents/devops.md`  
**Mission:** Build and maintain all infrastructure (Terraform), CI/CD pipelines, and developer tooling.

**Inputs:**
- ADR-006 (AWS deployment strategy)
- `docs/planning/sprint-0-execution-plan.md`
- EAB AWS architecture diagram

**Outputs:**
- `infra/terraform/` — all Terraform modules and environments
- `.github/workflows/` — all GitHub Actions pipelines
- `docker-compose.yml` — local dev stack
- `scripts/` — developer utilities

**Files / Folders Owned:**
```
infra/
.github/workflows/
docker-compose.yml
scripts/
```

**Dependencies:**
- ADR-006 signed off
- AWS accounts provisioned

**Review Agent Required:** PR Review Agent + Security Review (for IAM/WAF changes)

**Definition of Done:**
- `terraform apply` succeeds in dev
- All services deployable via CI/CD
- Local dev stack starts with `docker-compose up`
- Rollback mechanism documented and tested

---

### Notifications Agent [MUST BE CREATED]

**File to create:** `.claude/agents/notifications.md`  
**Mission:** Build the multi-channel notification delivery engine.

**Inputs:**
- `docs/planning/bounded-contexts.md` (Notifications section)
- `packages/event-schemas` (events that trigger notifications)

**Outputs:**
- `services/notifications/` — Notification Service
  - Event consumer (subscribes to all notification-triggering events)
  - Template engine
  - Multi-channel dispatcher (Push, Email, SMS)
  - Preference management
  - Delivery log

**Files / Folders Owned:**
```
services/notifications/
```

**Dependencies:**
- All upstream event schemas finalised
- SES configured, FCM keys available
- `packages/event-schemas` complete

**Review Agent Required:** PR Review Agent

---

## REVIEW AGENTS

### PR Review Agent

**File:** `.claude/review-agents/pr-review-agent.md`  
**Mission:** First-pass review on every PR before merge.

**Triggers:** Every PR opened or updated  
**Verdict:** APPROVE / REQUEST_CHANGES  

**Checks:**
- Requirements met against linked issue
- Tests present and passing
- No architectural drift (cross-context DB access, wrong event topics)
- No security issues (secrets, SQL injection, broken auth)
- No duplicated logic
- No breaking changes without version bump
- Coverage ≥ 80%

---

### Technical Review Board

**File:** `.codex/review-agents/technical-review-board.md`  
**Mission:** Architecture compliance review. Invoked on PRs touching domain boundaries, Kafka schemas, GraphQL schemas, database schemas.

**Verdict:** PASS / PASS WITH COMMENTS / FAIL  
**Automatic triggers:** Changes to `packages/event-schemas`, `prisma/schema.prisma`, `*.graphql` files

---

### Security Review Agent

**File:** `.codex/review-agents/security-review.md`  
**Mission:** OWASP + POPIA compliance review.

**Mandatory for:** Identity Service, Wallet Service, all auth-touching code, all payment-touching code  
**Invoked by:** PR Review Agent when `services/identity`, `services/wallet`, or auth-related files change

---

### Performance Review Agent

**File:** `.codex/review-agents/performance-review.md`  
**Mission:** Validate performance against benchmarks.

**Invoked on:** PRs touching query-heavy endpoints, leaderboards, match centre, search

---

## OPERATIONS AGENTS

### Nightly Autonomous Agent

**File:** `.claude/operations/nightly-autonomous-agent.md`  
**Cadence:** Every 4 hours  
**Outputs:** Daily Engineering Report, remediation tasks, safe automated PRs

**Checks:**
- Failed CI jobs
- Open PRs > 48 hours
- Code coverage drift
- GitHub security alerts
- Dependency vulnerabilities
- Performance regressions vs baseline

---

### Release Readiness Agent

**File:** `.claude/operations/release-readiness-agent.md`  
**Triggered by:** Pre-deployment to staging / production

**Output:** GO / NO-GO with full risk report

**Gates checked:**
- All tests pass, coverage ≥ 80%
- Security review complete
- Performance benchmarks met
- Terraform infrastructure deployed
- Monitoring active
- Audit logging active
- RBAC active
- Kafka healthy
- Database migrations complete

---

## New Agent Files Required

The following agent config files must be created in Sprint 0:

| File | Priority |
|---|---|
| `.claude/agents/frontend.md` | HIGH |
| `.claude/agents/devops.md` | CRITICAL |
| `.claude/agents/notifications.md` | HIGH |
| `.claude/agents/content.md` | MEDIUM |
| `.claude/agents/sponsor.md` | MEDIUM |

---

## Agent Coordination Protocol

```
SPRINT CYCLE (2 weeks):
Day 1:  Programme Director publishes work packages for all agents
Day 1:  Agents begin parallel execution
Day 3:  First PR from each agent — PR Review Agent runs
Day 5:  Technical Review Board runs on architecture-touching PRs
Day 7:  Security Review on Identity/Wallet PRs
Day 10: Programme Director checks progress, adjusts work packages
Day 14: Release Readiness Agent runs on staging
Day 14: Sprint retrospective — update agent configs based on learnings
```

**Merge rules:**
1. PR Review Agent: APPROVE required before merge
2. Technical Review Board: Required for schema/architecture changes
3. Security Review: Required for Identity, Wallet, auth changes
4. 1 human review: Required for all PRs in production
5. CI green: Non-negotiable, always required
