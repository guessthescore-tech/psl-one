# Repository Artefact Reconciliation

**Date:** 2026-06-14  
**Purpose:** Classify every local path against the committed history to confirm no legitimate work is untracked and no unwanted artefacts are staged.  
**Baseline commit:** `ee1b4ed — fix: harden security and high-volume query paths`  
**Performed after:** S3-INFRA-00 Security & Performance Hardening Gate accepted and pushed.

---

## Git state at reconciliation time

| Item | Value |
|---|---|
| Branch | `main` |
| Local HEAD | `ee1b4ed6169ca6bae5a2452e065eae1fc5c40371` |
| Remote HEAD (`origin/main`) | `ee1b4ed6169ca6bae5a2452e065eae1fc5c40371` |
| Divergence | None |
| Interrupted git operations | None |
| Modified files | None |
| Untracked files | `.claude/projects/` only |

---

## S3-INFRA-00 files — already in ee1b4ed

The screenshot shared before this reconciliation showed the following files as untracked. They were committed in `ee1b4ed` and must not be recommitted.

| Path | Committed in |
|---|---|
| `apps/api/prisma/schema.prisma` | `ee1b4ed` |
| `apps/api/prisma/migrations/20260615000001_security_performance_hardening/migration.sql` | `ee1b4ed` |
| `apps/api/src/auth/auth.controller.ts` | `ee1b4ed` |
| `apps/api/src/auth/auth.module.ts` | `ee1b4ed` |
| `apps/api/src/auth/auth.service.spec.ts` | `ee1b4ed` |
| `apps/api/src/auth/auth.service.ts` | `ee1b4ed` |
| `apps/api/src/auth/guards/auth-throttle.guard.ts` | `ee1b4ed` |
| `apps/api/src/auth/guards/auth-throttle.guard.spec.ts` | `ee1b4ed` |
| `apps/api/src/auth/providers/password-reset-notifier.ts` | `ee1b4ed` |
| `apps/api/src/auth/providers/password-reset-notifier.spec.ts` | `ee1b4ed` |
| `apps/api/src/campaign-analytics/campaign-analytics.controller.ts` | `ee1b4ed` |
| `apps/api/src/campaign-analytics/dto/recalculate-snapshot.dto.ts` | `ee1b4ed` |
| `apps/api/src/common/pagination.ts` | `ee1b4ed` |
| `apps/api/src/common/pagination.spec.ts` | `ee1b4ed` |
| `apps/api/src/env.ts` | `ee1b4ed` |
| `apps/api/src/env.spec.ts` | `ee1b4ed` |
| `apps/api/src/env-cors.spec.ts` | `ee1b4ed` |
| `apps/api/src/leaderboards/leaderboards.controller.ts` | `ee1b4ed` |
| `apps/api/src/leaderboards/leaderboards.service.spec.ts` | `ee1b4ed` |
| `apps/api/src/leaderboards/leaderboards.service.ts` | `ee1b4ed` |
| `apps/api/src/main.ts` | `ee1b4ed` |
| `apps/api/src/notifications/notifications.service.spec.ts` | `ee1b4ed` |
| `apps/api/src/notifications/notifications.service.ts` | `ee1b4ed` |
| `apps/api/src/predictions/predictions-admin-guards.spec.ts` | `ee1b4ed` |
| `apps/api/src/predictions/predictions-admin-http.spec.ts` | `ee1b4ed` |
| `apps/api/src/squad-import/squad-import.controller.ts` | `ee1b4ed` |
| `docs/adr/ADR-027.md` | `ee1b4ed` |
| `docs/adr/README.md` | `ee1b4ed` |
| `docs/performance/CACHE-READINESS.md` | `ee1b4ed` |
| `docs/performance/MATCHDAY-LOAD-MODEL.md` | `ee1b4ed` |
| `docs/project/CURRENT-STATE.md` | `ee1b4ed` |
| `docs/reference/MIGRATIONS.md` | `ee1b4ed` |
| `docs/reviews/SPRINT-3-HARDENING-TRIAGE.md` | `ee1b4ed` |
| `docs/reviews/SPRINT-3-SECURITY-PERFORMANCE-RISK-REGISTER.md` | `ee1b4ed` |

---

## Full artefact classification table

| Path | Git state | Origin / story | Purpose | Duplicates committed source? | Sensitive? | Generated? | Decision | Reason |
|---|---|---|---|---|---|---|---|---|
| `SPRINT-1-HANDOVER.md` (root) | Tracked → moved | Sprint 1 (committed `26a4c03`) | Sprint 1 completion record | No — unique traceability | No (local dev DB URL only) | No | HISTORICAL_DOCUMENT_COMMIT — moved to `docs/history/handovers/` | Useful sprint summary; root is wrong location |
| `SPRINT-1-FINAL-HANDOVER.md` (root) | Tracked → moved | Sprint 1 final (`26a4c03`) | Full Sprint 1 platform summary | No | No | No | HISTORICAL_DOCUMENT_COMMIT — moved | Same as above; includes test counts at acceptance |
| `STORY-38-HANDOVER.md` (root) | Tracked → moved | STORY-38 (`d0cc591`) | Pre-commit state record | No — describes working tree before commit | No | No | HISTORICAL_DOCUMENT_COMMIT — moved | Work is now in `d0cc591`; handover retains traceability |
| `STORY-39-HANDOVER.md` (root) | Tracked → moved | STORY-39 (`08e3852`) | Pre-commit state record | No | No | No | HISTORICAL_DOCUMENT_COMMIT — moved | Work is now in `08e3852` and `d0cc591` |
| `.claude/projects/` | Untracked | Claude Code auto-memory (this session) | Session memory: story completion records, local absolute paths | No | Contains local paths | No | KEEP_LOCAL_ONLY | Session context; contains local absolute path (`-Users-user-Projects-psl-one`); not repo source. Added to `.gitignore`. |
| `.claude/agents/` | Tracked (`04035d5`) | Platform design | Claude Code agent role definitions | No | No | No | ALREADY_COMMITTED | Intentional repository tooling; committed in agent operating model commit |
| `.claude/skills/` | Tracked (`354c5d0`) | Platform design | Claude Code skill definitions for specialist roles | No | No | No | ALREADY_COMMITTED | Expert skill definitions for development workflow |
| `.claude/tasks/` | Tracked (`04035d5`) | Platform design | Claude Code task templates | No | No | No | ALREADY_COMMITTED | Task orchestration definitions |
| `.claude/operations/` | Tracked (`04035d5`) | Platform design | Autonomous agent operation definitions | No | No | No | ALREADY_COMMITTED | Nightly and release-readiness agent specs |
| `.claude/review-agents/` | Tracked (`04035d5`) | Platform design | PR review agent definition | No | No | No | ALREADY_COMMITTED | Automated review tooling |
| `.claude/settings.json` | Tracked | Platform config | Project-level Claude Code settings | No | No | No | ALREADY_COMMITTED | Repository-scoped tool configuration |
| `.claude/settings.local.json` | Ignored (`.gitignore`) | Local session | User-local Claude Code overrides | N/A | Potentially sensitive | No | KEEP_LOCAL_ONLY | Already correctly ignored |
| `.codex/review-agents/security-review.md` | Tracked (`0a251fd`) | Sprint 3 docs gate | Security review prompt definitions | No | No | No | ALREADY_COMMITTED | Repository review tooling |
| `.codex/review-agents/performance-review.md` | Tracked (`0a251fd`) | Sprint 3 docs gate | Performance review prompt | No | No | No | ALREADY_COMMITTED | Same |
| `.codex/review-agents/technical-review-board.md` | Tracked (`0a251fd`) | Sprint 3 docs gate | TRB review prompt | No | No | No | ALREADY_COMMITTED | Same |
| `CLAUDE.md` | Tracked (`1d48fa8`) | Monorepo foundation | Project engineering instructions for Claude Code | No | No | No | ALREADY_COMMITTED | Repository-level tool instructions |
| `docker-compose.yml` | Tracked (`1d48fa8`) | Monorepo foundation | Local dev infrastructure (Postgres, Redis, Kafka) | No | No | No | ALREADY_COMMITTED — LOCAL DEVELOPMENT | Correctly labelled local dev in file header |
| `.github/workflows/ci.yml` | Tracked (`1d48fa8`) | Monorepo foundation | CI pipeline (pnpm, Postgres service, test/build/typecheck) | No | No | No | ALREADY_COMMITTED | Active CI pipeline |
| `.github/workflows/deploy.yml` | Tracked (`1d48fa8`) | Monorepo foundation | Deployment pipeline skeleton | No | No | No | ALREADY_COMMITTED — NOT DEPLOYED | Uses `secrets.AWS_DEPLOY_ROLE_ARN`; no secret in tracked files; status: PROPOSED, not active |
| `infra/iam/` (7 JSON files) | Tracked (`1d48fa8`) | Sprint 0 bootstrap | AWS IAM policy definitions for sprint 0 | No | No — JSON policy documents | No | ALREADY_COMMITTED — NOT APPLIED | Policy documents; no credentials; status: PROPOSED |
| `infra/terraform/` | Tracked (`1d48fa8`) | Sprint 0 bootstrap | Terraform module stubs | No | No | No | ALREADY_COMMITTED — NOT DEPLOYED | Scaffolding only; `.tfstate` and `.tfvars` correctly gitignored |
| `services/identity/` | Tracked (`1d48fa8`) | GraphQL federation scaffold | Dockerfile + package.json stub for future identity microservice | No — distinct from `apps/api/` | No | No | ALREADY_COMMITTED — PROPOSED | Service stub; `services/identity/Dockerfile` is the only Dockerfile; status: NOT DEPLOYED |
| `services/*/` (14 service stubs) | Tracked (`1d48fa8`) | GraphQL federation scaffold | `package.json` + `tsconfig.json` stubs for planned microservices | No | No | No | ALREADY_COMMITTED — PROPOSED | Future federation architecture stubs (ADR-002); not duplicate of `apps/api/` |
| `packages/*/` (8 packages) | Tracked (`1d48fa8`) | Monorepo shared libraries | Auth guards, errors, event schemas, Kafka client, logger, shared types, testing, UI | No — distinct shared libraries | No | No | ALREADY_COMMITTED | Used or intended to be used by services; `kafka-client` is scaffolding only (ADR-027) |
| `node_modules/` | Ignored | pnpm install | Dependency tree | N/A | No | Yes | GENERATED_IGNORE | Correctly gitignored |
| `apps/api/dist/` | Ignored | tsc build | Compiled API output | N/A | No | Yes | GENERATED_IGNORE | Correctly gitignored |
| `apps/web/.next/` | Ignored | Next.js build | Next.js build output | N/A | No | Yes | GENERATED_IGNORE | Correctly gitignored |
| `apps/api/.env` | Ignored | Local config | Local development environment variables | N/A | Yes — contains `DATABASE_URL`, `JWT_SECRET` | No | SENSITIVE_REMOVE_FROM_TRACKING — already not tracked | Correctly gitignored via `.env` pattern |
| `packages/shared-types/dist/` | Ignored | tsc build | Compiled shared-types output | N/A | No | Yes | GENERATED_IGNORE | Correctly gitignored |

---

## Secret scan results

Scanned all tracked non-generated files for: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `BEGIN PRIVATE KEY`, `DATABASE_URL=`, `JWT_SECRET=`.

Findings — all safe:

| Location | Finding | Classification |
|---|---|---|
| `README.md:92-93` | `DATABASE_URL=postgresql://user@localhost:5432/psl_identity_dev`, `JWT_SECRET=local-dev-secret-at-least-32-characters-long` | Local dev example values. Not real credentials. |
| `SPRINT-1-HANDOVER.md:228-229` | Same DATABASE_URL + `JWT_SECRET=<minimum-32-char secret>` placeholder | Local dev example + placeholder. Safe. |
| `docs/architecture/CONTAINER-ARCHITECTURE.md:52-53` | `DATABASE_URL=postgresql://postgres:postgres@...`, `JWT_SECRET=your-jwt-secret` | Template values in documentation. Safe. |
| `docs/engineering/LOCAL-DEVELOPMENT.md:52-53` | Same pattern | Local dev guide examples. Safe. |
| `infra/terraform/modules/...` | `password = var.db_password` | Terraform variable reference, not a literal password. Safe. |

No real credentials found. No `.pem`, `.key`, `.tfstate`, `.tfvars`, or `kubeconfig` files tracked.

---

## .gitignore updates

Added `.claude/projects/` to prevent the auto-memory directory from appearing as untracked. Existing entries for `.env`, `.claude/settings.local.json`, `node_modules/`, `dist/`, `.next/` etc. already correct.

---

## Actions taken by this reconciliation

1. `git mv SPRINT-1-HANDOVER.md docs/history/handovers/SPRINT-1-HANDOVER.md`
2. `git mv SPRINT-1-FINAL-HANDOVER.md docs/history/handovers/SPRINT-1-FINAL-HANDOVER.md`
3. `git mv STORY-38-HANDOVER.md docs/history/handovers/STORY-38-HANDOVER.md`
4. `git mv STORY-39-HANDOVER.md docs/history/handovers/STORY-39-HANDOVER.md`
5. Added historical notice to top of each moved file.
6. Created `docs/history/README.md`.
7. Added `.claude/projects/` to `.gitignore`.
8. Created this document.

No source files modified. No product behaviour changed.
