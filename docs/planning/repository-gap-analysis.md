# PSL One — Repository Gap Analysis

**Version:** 1.0  
**Date:** 2026-06-08  
**Author:** PSL One Chief Architecture Agent  
**Based on:** Full repository discovery, 2026-06-08

---

## Summary

| Category | Count | Status |
|---|---|---|
| Files/directories that exist and are correct | 12 | ✓ Keep |
| Files that exist but are incomplete | 3 | ⚠ Must complete |
| Files that exist but are duplicates/wrong | 1 | ✗ Must fix |
| Directories that exist but are empty | 8 | ✗ Must fill |
| Major components entirely missing | 47 | ✗ Must create |

The repository is **12% complete** against programme intent. The strategic documentation layer is strong. Everything below it is missing.

---

## What Exists (and is correct)

| File | Assessment |
|---|---|
| `CLAUDE.md` | Good. Contains correct tech stack, rules, architecture decisions. |
| `docs/executive-summary.md` | Good. Clear strategic narrative. |
| `docs/business/BRD.md` | Good. Comprehensive business requirements v1.3. |
| `docs/architecture/EAB.md` | Good. Sound architecture blueprint. Core reference. |
| `.claude/agents/programme-director.md` | Good. Clear mandate. |
| `.claude/agents/football-core.md` | Good. Correct domain scope. |
| `.claude/agents/fantasy-platform.md` | Good. Squad rules correctly specified. |
| `.claude/agents/gts-rewards-engine.md` | Good. GTS clearly scoped. |
| `.claude/agents/wallet.md` | Good. Phased wallet model correct. |
| `.claude/operations/nightly-autonomous-agent.md` | Good. Correct cadence. |
| `.claude/operations/release-readiness-agent.md` | Good. Correct release gates. |
| `.claude/review-agents/pr-review-agent.md` | Good. Correct review criteria. |
| `.codex/review-agents/technical-review-board.md` | Good. Strong review criteria. |
| `.codex/review-agents/security-review.md` | Good. Correct OWASP scope. |
| `.codex/review-agents/performance-review.md` | Good. |
| `.claude/tasks/task-generator.md` | Good. |
| `docs/planning/project-inventory.md` | Good. Just created. |
| `docs/planning/domain-model.md` | Good. Just created. |
| `docs/planning/context-map.md` | Good. Just created. |
| `docs/planning/bounded-contexts.md` | Good. Just created. |
| `docs/planning/platform-architecture.md` | Good. Just created. |
| `docs/planning/initial-github-issues.md` | Good. Just created. |
| `docs/planning/architecture-readiness-report.md` | Good. Just created. |

---

## What Exists But Is Incomplete

### 1. `docs/architecture/TDAP.md` — INCOMPLETE

**Problem:** File is 127 lines. Stops mid-sentence after listing 6 engineering principles. Missing:
- Technology stack specifications
- Service naming conventions
- Kafka topic naming conventions
- Database naming conventions
- Test requirements (coverage thresholds, test types)
- Security standards per service
- Logging standards
- Error handling standards
- API versioning strategy
- Performance requirements per endpoint
- Docker/containerisation standards
- Environment variable naming
- Deployment standards

**Action:** Complete TDAP before Sprint 1. Add all missing sections. This is the build authority document every agent reads.

**Priority:** CRITICAL

---

### 2. `docs/product/PRD.md` — EMPTY

**Problem:** File exists with 1 line of content. Zero product requirements.

**What's needed:**
- Phase 1 user stories (min 30) with acceptance criteria
- User journey flows (registration, fantasy, GTS, profile)
- Basic wireframe descriptions or screen inventories
- Non-functional requirements (performance, accessibility)
- Out-of-scope statements (explicit)

**Action:** Complete PRD for Phase 1 scope before Sprint 1. This is the most critical missing document.

**Priority:** CRITICAL

---

### 3. `docs/architecture/TDAP.md` contains duplicate content — WRONG FILE

**Problem:** `docs/delivery/implementation-programme.md` is an exact byte-for-byte duplicate of `docs/business/BRD.md`. This is not a delivery programme — it is a copy of the business requirements.

**What's needed:** A real implementation programme with:
- Sprint-by-sprint scope
- Milestone dates
- Team/agent assignments
- Resource requirements
- Risk register with owners
- Go/no-go criteria per phase

**Action:** Delete the duplicate. Write a real implementation programme.

**Priority:** HIGH

---

## What Is Duplicated

| Source File | Duplicate | Action |
|---|---|---|
| `docs/business/BRD.md` | `docs/delivery/implementation-programme.md` (exact copy) | Overwrite `implementation-programme.md` with real delivery plan |

---

## What Directories Exist But Are Empty

| Directory | What Should Be Here | Priority |
|---|---|---|
| `.github/workflows/` | CI/CD pipeline YAMLs (ci.yml, deploy-dev.yml, deploy-staging.yml, security-scan.yml) | CRITICAL |
| `.github/ISSUE_TEMPLATE/` | Issue templates (epic, feature, story, task, bug) | HIGH |
| `docs/adr/` | ADR-001 through ADR-010 | CRITICAL |
| `docs/work-packages/` | Sprint work packages per agent | MEDIUM |
| `scripts/` | Local dev scripts, seed scripts, migration runner | HIGH |
| `src/` | Should be removed — use `services/` and `apps/` at root | MEDIUM |
| `tests/` | Should be removed — tests live alongside services | MEDIUM |

**Note:** `src/` and `tests/` directories at root are inconsistent with a Turborepo monorepo pattern. They should be removed and replaced with `services/` and `apps/` at root level.

---

## What Must Be Created Before Coding

### Repository Root Files

| File | Purpose | Priority |
|---|---|---|
| `turbo.json` | Turborepo pipeline config | CRITICAL |
| `pnpm-workspace.yaml` | pnpm workspace definition | CRITICAL |
| `package.json` (root) | Root package.json with workspace scripts | CRITICAL |
| `.nvmrc` | Node version pin | HIGH |
| `.node-version` | Node version pin (alternative) | HIGH |
| `docker-compose.yml` | Local dev: Kafka, PostgreSQL, Redis | CRITICAL |
| `.github/CODEOWNERS` | Domain boundary enforcement | HIGH |
| `README.md` | Developer onboarding (30-min setup) | HIGH |
| `.env.example` | All required env vars documented | HIGH |

### TypeScript Configuration

| File | Purpose | Priority |
|---|---|---|
| `tsconfig.base.json` | Base TypeScript config | CRITICAL |
| `packages/config/tsconfig.json` | Shared TS config package | CRITICAL |
| `packages/config/eslint.js` | Shared ESLint config | HIGH |
| `packages/config/prettier.js` | Shared Prettier config | HIGH |

### Shared Packages (must exist before services)

| Package | Key Contents | Priority |
|---|---|---|
| `packages/shared-types` | Cross-service TypeScript interfaces | CRITICAL |
| `packages/event-schemas` | Kafka event interfaces + Zod validation schemas | CRITICAL |
| `packages/kafka-client` | NestJS Kafka module wrapper with schema validation | CRITICAL |
| `packages/auth-guards` | JWT validation, RBAC guards, role decorators | CRITICAL |
| `packages/testing` | Test utilities, mock factories, DB setup helpers | HIGH |
| `packages/ui` | ShadCN base components + PSL design tokens | HIGH |
| `packages/logger` | Structured logging with OpenTelemetry integration | HIGH |
| `packages/errors` | Shared error classes and HTTP error mapping | MEDIUM |

### Service Scaffolds (NestJS — no feature code yet)

| Service | Health Endpoint | Connects To | Priority |
|---|---|---|---|
| `services/identity` | `GET /health` | PostgreSQL, Redis, Kafka, SES | CRITICAL |
| `services/fan` | `GET /health` | PostgreSQL, Kafka | CRITICAL |
| `services/football` | `GET /health` | PostgreSQL, Redis, Kafka | CRITICAL |
| `services/fantasy` | `GET /health` | PostgreSQL, Redis, Kafka | HIGH |
| `services/loyalty` | `GET /health` | PostgreSQL, Kafka | HIGH |
| `services/wallet` | `GET /health` | PostgreSQL, Kafka | HIGH |
| `services/content` | `GET /health` | PostgreSQL, S3, Kafka | HIGH |
| `services/notifications` | `GET /health` | PostgreSQL, Kafka, SES, FCM | HIGH |
| `services/sponsor` | `GET /health` | PostgreSQL, Kafka | MEDIUM |
| `services/ticketing` | `GET /health` | PostgreSQL, Kafka | MEDIUM |
| `services/marketplace` | `GET /health` | PostgreSQL, Kafka | MEDIUM |
| `services/analytics` | `GET /health` | PostgreSQL, Kafka | MEDIUM |
| `services/search` | `GET /health` | OpenSearch | MEDIUM |
| `services/admin` | `GET /health` | PostgreSQL, Kafka | HIGH |
| `services/gateway` | `GET /health` | All subgraph services | CRITICAL |

### Application Scaffolds (Next.js — no feature code yet)

| App | Route | Priority |
|---|---|---|
| `apps/web` | `/` fan-facing web app | CRITICAL |
| `apps/admin` | `/admin` PSL admin portal | HIGH |
| `apps/club-portal` | Club management | MEDIUM |
| `apps/sponsor-portal` | Sponsor campaign management | MEDIUM |

### Infrastructure (Terraform)

| Module | Priority |
|---|---|
| `infra/terraform/modules/networking/` | CRITICAL |
| `infra/terraform/modules/kafka/` | CRITICAL |
| `infra/terraform/modules/database/` | CRITICAL |
| `infra/terraform/modules/cache/` | CRITICAL |
| `infra/terraform/modules/ecs/` | CRITICAL |
| `infra/terraform/modules/ecr/` | CRITICAL |
| `infra/terraform/modules/storage/` | CRITICAL |
| `infra/terraform/modules/cdn/` | HIGH |
| `infra/terraform/modules/waf/` | HIGH |
| `infra/terraform/modules/secrets/` | CRITICAL |
| `infra/terraform/modules/monitoring/` | HIGH |
| `infra/terraform/environments/dev/` | CRITICAL |
| `infra/terraform/environments/staging/` | HIGH |
| `infra/terraform/environments/production/` | HIGH |

### CI/CD

| File | Priority |
|---|---|
| `.github/workflows/ci.yml` | CRITICAL |
| `.github/workflows/deploy-dev.yml` | CRITICAL |
| `.github/workflows/deploy-staging.yml` | HIGH |
| `.github/workflows/deploy-production.yml` | HIGH |
| `.github/workflows/security-scan.yml` | HIGH |
| `.github/workflows/terraform.yml` | HIGH |
| `.github/ISSUE_TEMPLATE/epic.yml` | HIGH |
| `.github/ISSUE_TEMPLATE/feature.yml` | HIGH |
| `.github/ISSUE_TEMPLATE/story.yml` | HIGH |
| `.github/ISSUE_TEMPLATE/task.yml` | MEDIUM |
| `.github/ISSUE_TEMPLATE/bug.yml` | MEDIUM |
| `.github/CODEOWNERS` | HIGH |

### Architecture Documents

| File | Priority |
|---|---|
| `docs/adr/ADR-001.md` through `ADR-010.md` | CRITICAL |
| `docs/architecture/event-catalogue.md` | CRITICAL |
| `docs/architecture/environment-strategy.md` | HIGH |
| `docs/architecture/service-contracts.md` | HIGH |
| `docs/architecture/database-naming-conventions.md` | HIGH |

---

## What Can Be Deferred (Post Sprint 0)

These are real requirements but do not block Sprint 0 or Sprint 1:

| Item | Defer To |
|---|---|
| Snowflake data warehouse | Phase 2 |
| Full sponsor portal UI | Phase 2 |
| Native ticketing engine | Phase 3 |
| Financial wallet (ZAR) | Phase 3 |
| WhatsApp Business integration | Phase 2 |
| AI recommendation engine | Phase 3 |
| Africa expansion multi-tenancy | Phase 4 |
| Fan tokens / digital collectibles | Phase 4 |
| Mobile native app (React Native) | Phase 2 |
| Club portal full features | Phase 2 |
| Marketplace | Phase 3 |
| Travel / hospitality packages | Phase 3 |
| PCI DSS full certification | Phase 2 |
| SOC 2 compliance | Phase 3 |

---

## Agent Files Assessment

### `.claude/skills/` — Not Yet Used in Delivery

The design skills (`design-taste-frontend.md`, `emil-design-eng.md`, `impeccable.md`, `psl-design-director.md`) are present but have no integration with the delivery pipeline yet. These should be invoked during frontend development.

**Gap:** No agent currently triggers design review on frontend PRs. The PR review agent should be updated to invoke design skills for `apps/web` changes.

### `.claude/tasks/vscode-task-agent.md` — Not Read Yet

This file was present but not read during discovery. Should be reviewed.

---

## Gap Score

```
Category                     Exists   Missing   % Complete
─────────────────────────────────────────────────────────
Strategic Documents:          5/5      0/5         100%
Architecture Documents:       2/4      2/4          50%
Product Documents:            0/1      1/1           0%
ADRs:                         0/10    10/10          0%
Application Code:             0/15    15/15          0%
Infrastructure Code:          0/13    13/13          0%
CI/CD Pipelines:              0/5      5/5           0%
Shared Packages:              0/8      8/8           0%
Tests:                        0/∞      ∞             0%
Agent Configs:               15/20     5/20          75%
─────────────────────────────────────────────────────────
OVERALL:                                            ~12%
```
