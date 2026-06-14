# Source of Truth Map

This map tells an agent where to find authoritative information on every topic in the PSL One repository.

## Code and Schema

| Question | Authoritative source |
|----------|---------------------|
| What Prisma models exist? | `apps/api/prisma/schema.prisma` |
| What columns does a model have? | `apps/api/prisma/schema.prisma` |
| What migrations have been applied? | `apps/api/prisma/migrations/` + `pnpm --filter @psl-one/api prisma migrate status` |
| What are the current seed values? | `apps/api/prisma/seed.ts` |
| What does a service method do? | `apps/api/src/<domain>/<domain>.service.ts` |
| What routes exist on a controller? | `apps/api/src/<domain>/<domain>.controller.ts` |
| What web pages exist? | `apps/web/src/app/` |
| What API client functions exist? | `apps/web/src/lib/` |

## Architecture

| Question | Authoritative source |
|----------|---------------------|
| Module dependency graph | `apps/api/src/app.module.ts` + `docs/architecture/MODULE-DEPENDENCIES.md` |
| Bounded context ownership | `docs/architecture/BOUNDED-CONTEXT-MAP.md` |
| System actors and data flows | `docs/architecture/SYSTEM-OVERVIEW.md` |
| Security trust boundaries | `docs/architecture/SECURITY-ARCHITECTURE.md` |
| Provider-neutral adapter pattern | `docs/architecture/INTEGRATION-ARCHITECTURE.md` |
| Season model | `docs/architecture/MULTI-SEASON-ARCHITECTURE.md` |
| Frontend conventions | `docs/architecture/FRONTEND-ARCHITECTURE.md` |
| Event and side-effect patterns | `docs/architecture/EVENT-AND-SIDE-EFFECTS.md` |

## Decisions

| Question | Authoritative source |
|----------|---------------------|
| Why was X decided? | `docs/adr/ADR-0XX.md` |
| What ADRs exist? | `docs/adr/README.md` |
| Next ADR number? | `docs/adr/README.md` (last entry + 1); currently ADR-028 |
| Why is Kafka deferred? | `docs/adr/ADR-027.md` |
| Why can't we activate PSL? | `docs/adr/ADR-026.md` + CLAUDE.md safety constraints |

## Reference counts

| Question | Authoritative source |
|----------|---------------------|
| How many API routes? | `docs/reference/API-ROUTES.md` |
| How many database models? | `docs/reference/DATABASE-MODELS.md` |
| How many migrations? | `docs/reference/MIGRATIONS.md` + `find apps/api/prisma/migrations -maxdepth 1 -type d | wc -l` |
| How many tests? | `pnpm --filter @psl-one/api test` output |
| How many web pages? | `find apps/web/src/app -name "page.tsx" | wc -l` |

## Domain concepts

| Question | Authoritative source |
|----------|---------------------|
| How does fantasy scoring work? | `docs/domain/FANTASY.md` |
| How do predictions lock/settle? | `docs/domain/PREDICTIONS.md` |
| How does social prediction work? | `docs/domain/SOCIAL-PREDICTION.md` |
| What is fan value? | `docs/domain/FAN-VALUE-AND-LEADERBOARDS.md` |
| What is the wallet? | `docs/domain/WALLET-AND-COMMERCE-BOUNDARIES.md` |
| How does beta launch work? | `docs/domain/BETA-LAUNCH.md` |

## Engineering guides

| Question | Authoritative source |
|----------|---------------------|
| How to add a feature? | `docs/engineering/ADDING-A-NEW-FEATURE.md` |
| How to add a season? | `docs/engineering/ADDING-A-NEW-SEASON.md` |
| How to add a provider? | `docs/engineering/ADDING-A-PROVIDER-ADAPTER.md` |
| What are the coding standards? | `docs/engineering/CODING-STANDARDS.md` |
| How does RBAC work? | `docs/engineering/AUTH-AND-RBAC.md` |
| How should I write tests? | `docs/engineering/TESTING-GUIDE.md` |
| How do migrations work? | `docs/engineering/DATABASE-GUIDE.md` |
| AI agent workflow? | `docs/engineering/AI-AGENT-WORKFLOW.md` |

## Project state

| Question | Authoritative source |
|----------|---------------------|
| What is built right now? | `docs/project/CURRENT-STATE.md` |
| What stories are complete? | `docs/project/STORY-INDEX.md` |
| What is the roadmap? | `docs/project/ROADMAP.md` |
| Historical sprint records? | `docs/history/handovers/` |

## Operations

| Question | Authoritative source |
|----------|---------------------|
| How to deploy? | `docs/operations/RELEASE-PROCESS.md` |
| Migration safety? | `docs/operations/MIGRATION-OPERATIONS.md` |
| Environment strategy? | `docs/operations/ENVIRONMENT-STRATEGY.md` |
| Beta launch runbook? | `docs/platform/PSL-BETA-LAUNCH-RUNBOOK.md` |
