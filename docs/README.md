# PSL One — Documentation

**Purpose:** Navigation hub for all PSL One documentation  
**Audience:** All contributors  
**Status:** Current as of Sprint 2 / STORY-39  
**Source of truth:** This file + linked documents  

---

## Start Here

New to the project? Follow this sequence:

1. [Root README](../README.md) — ten-minute project overview
2. [Current State](project/CURRENT-STATE.md) — what is built right now
3. [System Overview](architecture/SYSTEM-OVERVIEW.md) — how everything fits together
4. [Repository Guide](engineering/REPOSITORY-GUIDE.md) — code tour
5. [Local Development](engineering/LOCAL-DEVELOPMENT.md) — get running locally
6. [Bounded Context Map](architecture/BOUNDED-CONTEXT-MAP.md) — domain ownership
7. [Coding Standards](engineering/CODING-STANDARDS.md) — before writing code
8. [Testing Guide](engineering/TESTING-GUIDE.md) — before writing tests
9. [Adding a Feature](engineering/ADDING-A-NEW-FEATURE.md) — full walkthrough

---

## Product and Programme

| Document | Purpose |
|----------|---------|
| [Story Index](project/STORY-INDEX.md) | Every story from STORY-01 through STORY-39 |
| [Current State](project/CURRENT-STATE.md) | Verified totals, active/prepared seasons, test counts |
| [Roadmap](project/ROADMAP.md) | Completed, current, and future programme streams |
| [Delivery Timeline](project/DELIVERY-TIMELINE.md) | Sprint-by-sprint delivery record |
| [Glossary](project/GLOSSARY.md) | Product and technical term definitions |

---

## Architects

| Document | Purpose |
|----------|---------|
| [System Overview](architecture/SYSTEM-OVERVIEW.md) | Platform purpose, actors, containers, data flows |
| [Bounded Context Map](architecture/BOUNDED-CONTEXT-MAP.md) | 25 bounded contexts, ownership, dependencies |
| [Data Architecture](architecture/DATA-ARCHITECTURE.md) | Prisma, migrations, ledgers, season scoping |
| [Security Architecture](architecture/SECURITY-ARCHITECTURE.md) | Trust boundaries, RBAC, POPIA, threat areas |
| [Integration Architecture](architecture/INTEGRATION-ARCHITECTURE.md) | Provider-neutral adapters, sandbox mode |
| [Multi-Season Architecture](architecture/MULTI-SEASON-ARCHITECTURE.md) | Active/prepared/historical season model |
| [Frontend Architecture](architecture/FRONTEND-ARCHITECTURE.md) | Next.js App Router, client conventions |
| [Module Dependencies](architecture/MODULE-DEPENDENCIES.md) | NestJS module dependency graph |
| [Event and Side Effects](architecture/EVENT-AND-SIDE-EFFECTS.md) | Non-Kafka side effect patterns |
| [ADR Index](adr/README.md) | All Architecture Decision Records |

---

## Backend Developers

| Document | Purpose |
|----------|---------|
| [Repository Guide](engineering/REPOSITORY-GUIDE.md) | Guided code tour from bootstrap to test |
| [Backend Guide](engineering/BACKEND-GUIDE.md) | NestJS patterns, RBAC, Prisma, audit logging |
| [Database Guide](engineering/DATABASE-GUIDE.md) | Migrations, seed, Prisma commands |
| [Auth and RBAC](engineering/AUTH-AND-RBAC.md) | JWT, roles, guards, cross-user isolation |
| [Coding Standards](engineering/CODING-STANDARDS.md) | TypeScript strictness, naming, patterns |
| [Error Handling](engineering/ERROR-HANDLING.md) | Exception patterns, isolation, audit |
| [Adding a Feature](engineering/ADDING-A-NEW-FEATURE.md) | End-to-end feature walkthrough |
| [Adding a Season](engineering/ADDING-A-NEW-SEASON.md) | How to onboard a new competition season |
| [Adding a Provider Adapter](engineering/ADDING-A-PROVIDER-ADAPTER.md) | Provider-neutral integration guide |
| [API Routes](reference/API-ROUTES.md) | All routes by bounded context |
| [Database Models](reference/DATABASE-MODELS.md) | All Prisma models by domain |
| [Migrations](reference/MIGRATIONS.md) | All 38 migrations with purpose and story |
| [Testing Guide](engineering/TESTING-GUIDE.md) | Full test strategy and commands |
| [Test Inventory](reference/TEST-INVENTORY.md) | 54 test files, 1,560 tests |

---

## Frontend Developers

| Document | Purpose |
|----------|---------|
| [Frontend Architecture](architecture/FRONTEND-ARCHITECTURE.md) | App Router, client pattern, auth helper |
| [Frontend Guide](engineering/FRONTEND-GUIDE.md) | Creating pages, params, API calls |
| [Frontend Routes](reference/FRONTEND-ROUTES.md) | All 337 pages by area |
| [Auth and RBAC](engineering/AUTH-AND-RBAC.md) | Token helper, guard patterns |
| [Coding Standards](engineering/CODING-STANDARDS.md) | TypeScript strictness |

---

## DevOps and Operations

| Document | Purpose |
|----------|---------|
| [Production Readiness](operations/PRODUCTION-READINESS.md) | Current gaps and Sprint 3 infrastructure baseline |
| [Environment Strategy](operations/ENVIRONMENT-STRATEGY.md) | local / dev / staging / production |
| [Release Process](operations/RELEASE-PROCESS.md) | Story-driven release flow |
| [Migration Operations](operations/MIGRATION-OPERATIONS.md) | Safe migration deployment |
| [Observability Requirements](operations/OBSERVABILITY-REQUIREMENTS.md) | Logging, metrics, tracing |
| [Incident Management](operations/INCIDENT-MANAGEMENT.md) | Escalation and response |
| [Backup and Restore](operations/BACKUP-AND-RESTORE.md) | Data protection strategy |
| [Disaster Recovery](operations/DISASTER-RECOVERY.md) | Recovery objectives |
| [CI Workflow](../.github/workflows/ci.yml) | GitHub Actions CI configuration |

---

## QA

| Document | Purpose |
|----------|---------|
| [Testing Guide](engineering/TESTING-GUIDE.md) | Full test strategy and acceptance gates |
| [Test Inventory](reference/TEST-INVENTORY.md) | 54 files, 1,560 tests, coverage areas |
| [Feature Flags and Readiness](reference/FEATURE-FLAGS-AND-READINESS.md) | Module readiness states |
| [Beta Readiness Review](platform/BETA-READINESS-REVIEW.md) | Sprint 2 beta readiness audit |
| [Beta Smoke Test Plan](platform/PSL-BETA-SMOKE-TEST-PLAN.md) | 24-item smoke test registry |

---

## Domain References

| Document | Purpose |
|----------|---------|
| [Football Core](domain/FOOTBALL-CORE.md) | Competitions, seasons, fixtures, gameweeks |
| [Clubs and Players](domain/CLUBS-AND-PLAYERS.md) | Club profiles, rosters, player stats |
| [Fixtures and Matchday](domain/FIXTURES-AND-MATCHDAY.md) | Fixture lifecycle, live match, Match Centre |
| [Fantasy](domain/FANTASY.md) | Team selection, transfers, scoring, leagues |
| [Predictions](domain/PREDICTIONS.md) | Guess the Score lock/settle/void |
| [Social Prediction](domain/SOCIAL-PREDICTION.md) | Points-based challenges, compliance |
| [Fan Value and Leaderboards](domain/FAN-VALUE-AND-LEADERBOARDS.md) | Non-financial loyalty, season scope |
| [Media and Campaigns](domain/MEDIA-AND-CAMPAIGNS.md) | Media, sponsors, campaigns, rewards |
| [Wallet and Commerce Boundaries](domain/WALLET-AND-COMMERCE-BOUNDARIES.md) | Sandbox wallet, financial boundaries |
| [Beta Launch](domain/BETA-LAUNCH.md) | Readiness gate, cohorts, approval |

---

## Historical Implementation Records (docs/platform/)

These documents were created during Sprint 1 and Sprint 2 as implementation records. They remain authoritative for their specific topics but are supplemented by the new structured documentation above.

| Document | Topic |
|----------|-------|
| [Story-by-Story Code Walkthrough](platform/STORY-BY-STORY-CODE-WALKTHROUGH.md) | Detailed per-story implementation notes |
| [API Route Inventory](platform/API-ROUTE-INVENTORY.md) | Detailed route listing (Sprint 1-2) |
| [Frontend Route Inventory](platform/FRONTEND-ROUTE-INVENTORY.md) | Detailed page listing (Sprint 1-2) |
| [Database Migration Inventory](platform/DATABASE-MIGRATION-INVENTORY.md) | Per-migration details |
| [Platform Overview](platform/PLATFORM-OVERVIEW.md) | Sprint-by-sprint platform growth record |
| [Admin Capability Gap Review](platform/ADMIN-CAPABILITY-GAP-REVIEW.md) | Admin readiness per domain |
| [Beta Readiness Review](platform/BETA-READINESS-REVIEW.md) | GO/NO-GO assessment through STORY-39 |
| [Expert Review after Sprint 1](platform/EXPERT-REVIEW-AFTER-SPRINT-1.md) | Technical debt and quality review |
| [Live Match Data Architecture](platform/LIVE-MATCH-DATA-ARCHITECTURE.md) | Match Centre design (STORY-38) |
| [Social Prediction Matchmaking](platform/SOCIAL-PREDICTION-MATCHMAKING.md) | FIFO matching design (STORY-38) |
| [Player Performance Data Model](platform/PLAYER-PERFORMANCE-DATA-MODEL.md) | Stats model (STORY-34) |
| [Media Sponsor Wallet Foundation](platform/MEDIA-SPONSOR-WALLET-FOUNDATION.md) | STORY-37 design |
| [Sponsor Campaign Engine](platform/SPONSOR-CAMPAIGN-ENGINE.md) | Campaign lifecycle (STORY-37) |
| [Wallet Provider Integration](platform/WALLET-PROVIDER-INTEGRATION.md) | Sandbox wallet (STORY-37) |
| [PSL Beta Launch Runbook](platform/PSL-BETA-LAUNCH-RUNBOOK.md) | 7-phase launch checklist |
| [PSL Beta Rollback Runbook](platform/PSL-BETA-ROLLBACK-RUNBOOK.md) | Rollback procedure |
| [PSL Beta Hypercare Plan](platform/PSL-BETA-HYPERCARE-PLAN.md) | 14-day post-launch monitoring |
| [PSL Beta Frontend Walkthrough](platform/PSL-BETA-FRONTEND-WALKTHROUGH.md) | 19-domain sign-off matrix |
| [PSL Beta Smoke Test Plan](platform/PSL-BETA-SMOKE-TEST-PLAN.md) | 24-item smoke test registry |

---

## Handover Records

| Document | Purpose |
|----------|---------|
| [STORY-39 Handover](../STORY-39-HANDOVER.md) | Sprint 2 final handover |
| [STORY-38 Handover](../STORY-38-HANDOVER.md) | STORY-38 handover |
| [Sprint 1 Final Handover](../SPRINT-1-FINAL-HANDOVER.md) | Sprint 1 handover |
