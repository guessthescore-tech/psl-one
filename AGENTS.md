# PSL One — Codex Agent Instructions

**Version:** S3-INFRA-00 (2026-06-14)  
**Adapter:** Codex CLI 0.139.x  
**Authority:** This file governs all Codex agent behaviour in this repository. It is the Codex equivalent of `CLAUDE.md`.

---

## Project Identity

**Name:** PSL One  
**Vision:** The Digital Operating System of South African Football  
**Stack:** NestJS API · Next.js web · PostgreSQL/Prisma · Redis · pnpm monorepo  
**Scale target:** 2 million concurrent fans

---

## Repository Layout

```
psl-one/
  apps/
    api/                  NestJS API (port 4000)  @psl-one/api
      src/<domain>/       One directory per bounded context
      prisma/
        schema.prisma     Schema source of truth
        migrations/       39 additive migrations — never rewrite
        seed.ts           Reference data (idempotent)
    web/                  Next.js App Router (port 3001)  @psl-one/web
      src/app/            337 pages (fan + admin)
      src/lib/            API client functions only — no business logic
  docs/                   All documentation
    adr/                  27 Architecture Decision Records
    architecture/         System, security, data, integration views
    domain/               Domain concept references
    engineering/          Developer guides
    reference/            Routes, models, migrations inventory
    operations/           Ops runbooks
    project/              Story index, roadmap, current state
  .codex/                 Codex adapter (this directory)
    agents/               Agent role prompt files (Markdown)
    review-agents/        Inline review prompt files (legacy + current)
  .agents/skills/         Skill definitions for specialised agents
  scripts/                Tooling scripts
  .github/workflows/      CI/CD
  infra/                  Terraform stubs (not yet deployed)
  services/               Future microservice stubs (not yet deployed)
```

---

## Non-Negotiable Rules

These rules are encoded in `CLAUDE.md` and apply to every agent and every contribution:

1. **Never bypass RBAC** — every admin route requires `JwtAuthGuard + RolesGuard + @Roles('PSL_ADMIN')`
2. **Never bypass audit logs** — every admin mutation writes an `AdminAuditLog` record
3. **Never store business logic in frontend** — the API is authoritative; `apps/web/src/lib/` contains typed client wrappers only
4. **Always publish Kafka events** — currently implemented as direct calls; Kafka will be wired when measured triggers are met (see ADR-027)
5. **Always write tests** — every new service method requires a corresponding spec test
6. **Always use domain boundaries** — no module accesses another module's Prisma tables directly
7. **Always create ADRs for architecture decisions** — any decision affecting module dependencies, schema design, external integrations, or security boundaries requires an ADR in `docs/adr/`. Next ADR: ADR-028.
8. **Always assume scale to 2 million fans** — no full-table scans, no N+1 queries, cursor-based pagination for bulk operations

---

## Safety Constraints

The following constraints are absolute and apply to every task, every agent, and every code change:

### System integrity
- Do not activate the PSL season without explicit product instruction and all 13 readiness checks passing
- Do not delete or modify World Cup 2026 historical data
- Do not add a season activation API endpoint without a new ADR and explicit approval (ADR-026)

### Financial and legal
- Fantasy is **points-only** — no monetary value, no real-money prizes
- Guess the Score is **points-only** — same constraint
- Social prediction uses **system-issued, non-purchasable, non-transferable** points only
- Fan Value is **non-financial** — a loyalty metric, not a currency
- Wallet is **sandbox-only** — `SiliconEnterpriseSandboxWalletAdapter` only; no production money movement, no checkout, no ticket issuance

### External systems
- No production live-data provider calls
- No real KYC claims
- No production streaming, CDN, or DRM
- No provider secrets in source files or Prisma schema

### Database
- Never rewrite existing migrations — all migrations are additive
- Never use `migrate reset` in an environment with real data
- Never bypass `prisma migrate deploy` in favour of manual SQL on shared databases

### Commits and deployment
- Do not commit until explicitly instructed with "commit this"
- Do not push until explicitly instructed with "push it"
- Do not deploy infrastructure without explicit instruction
- Do not run AWS commands or Terraform without explicit instruction
- STORY-40 is RESERVED for Official PSL Data Finalisation — do not implement it

---

## Verified Platform State (2026-06-14)

| Metric | Value |
|--------|-------|
| API unit test files | 61 |
| API tests passing | 1,645 |
| Web pages | 337 |
| Prisma migrations | 39 |
| ADRs | 27 |
| Bounded contexts (modules) | 25+ |
| Web spec files | 3 |

Gate: all 1,645 tests pass before any commit is accepted.

---

## Architecture Patterns

### Backend (NestJS)
Every bounded context follows this structure:

```
<domain>/
  <domain>.module.ts          Registers service + controller; imports AuthModule
  <domain>.service.ts         Business logic; Prisma queries; throws HttpException on error
  <domain>.service.spec.ts    Unit tests (Jest); mock PrismaService; 100% service coverage target
  <domain>.controller.ts      HTTP routes; RBAC guards; @CurrentUser() for actor identity
  dto/                        Class-validator DTOs; @IsString(), @IsISO8601(), etc.
```

**RBAC pattern — admin routes:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PSL_ADMIN')
@Controller('admin/<domain>')
```

**Actor identity — write endpoints:**
```typescript
@Post()
async create(@CurrentUser() user: TokenPayload, @Body() dto: CreateDto) {
  return this.service.create(user.sub, dto);
}
```

**Admin audit log — every admin mutation:**
```typescript
await this.prisma.adminAuditLog.create({
  data: { action: 'DOMAIN_ACTION', performedBy: adminUserId, details: JSON.stringify(dto) }
});
```

**Pagination — bounded limit/offset:**
```typescript
import { parseBoundedLimit, parseBoundedOffset } from '../common/pagination';
const limit = parseBoundedLimit(query.limit, 50, 200);
const offset = parseBoundedOffset(query.offset);
```

**Large fanout — cursor-based pagination:**
```typescript
const batchSize = parseBoundedLimit(query.batchSize, 250, 500);
let cursor: number | undefined;
while (true) {
  const batch = await this.prisma.user.findMany({ take: batchSize, ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}) });
  if (!batch.length) break;
  cursor = batch[batch.length - 1].id;
}
```

**Season-scoped aggregation — use $queryRaw:**
```typescript
const rows = await this.prisma.$queryRaw<Row[]>`
  SELECT user_id, SUM(points) AS total_points
  FROM prediction_points_ledger
  WHERE season_id = ${seasonId}
  GROUP BY user_id
  ORDER BY total_points DESC, user_id ASC
  LIMIT ${limit}
`;
```

### Frontend (Next.js App Router)
- All pages in `apps/web/src/app/`
- All API calls in `apps/web/src/lib/<domain>-client.ts`
- No business logic in pages or components
- Fan routes: `app/(fan)/`; admin routes: `app/admin/`
- Use `getBetaToken()` from `apps/web/src/lib/auth.ts` for auth tokens

### Database
- Schema: `apps/api/prisma/schema.prisma`
- Migrations: `apps/api/prisma/migrations/` — additive only
- Seed: `apps/api/prisma/seed.ts` — idempotent `upsert` patterns
- Naming: camelCase in Prisma schema; snake_case in PostgreSQL columns

---

## Development Workflow

### Adding a feature

1. Create the Prisma migration if schema changes are needed (`prisma migrate dev --name <name>`)
2. Create the service with unit tests
3. Create the controller with RBAC guards
4. Register the module in `apps/api/src/app.module.ts`
5. Create typed client functions in `apps/web/src/lib/<domain>-client.ts`
6. Create the web pages in `apps/web/src/app/`
7. Run the full gate before committing

### Full acceptance gate

```bash
pnpm --filter @psl-one/api db:seed
pnpm --filter @psl-one/api db:seed
pnpm --filter @psl-one/api prisma validate
pnpm --filter @psl-one/api typecheck
pnpm --filter @psl-one/api test          # must show 1,645+ passing
pnpm --filter @psl-one/api build
pnpm --filter @psl-one/web typecheck
pnpm --filter @psl-one/web test
pnpm --filter @psl-one/web build
```

The second `db:seed` run confirms idempotency. Do NOT commit. Do NOT push.

---

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | All environments |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | All environments |
| `JWT_EXPIRES_IN` | Token TTL (e.g. `7d`) | All environments |
| `CORS_ORIGINS` | Comma-separated allowed origins | staging + prod (required) |
| `NODE_ENV` | `development` / `test` / `staging` / `production` | All environments |
| `REDIS_URL` | Redis connection | When Redis features active |

`CORS_ORIGINS` must not be `*` and must not be unset in staging/production — `parseCorsOrigins()` throws on either condition.

---

## Testing Conventions

- Framework: Jest with `@nestjs/testing`
- Location: Co-located with source (`.spec.ts` alongside `.ts`)
- Pattern: Mock `PrismaService` using `jest.fn()` on each Prisma method
- Assertion: All service methods tested; error paths tested; RBAC tested at controller level
- No database calls in unit tests
- Integration tests (if any): Use a separate test database

```typescript
const module = await Test.createTestingModule({
  providers: [
    MyService,
    { provide: PrismaService, useValue: { modelName: { findMany: jest.fn(), create: jest.fn() } } },
  ],
}).compile();
```

---

## Migration Rules

1. Every schema change requires a new migration directory: `apps/api/prisma/migrations/<timestamp>_<name>/migration.sql`
2. Migrations are additive — no `DROP COLUMN`, no `ALTER COLUMN ... SET NOT NULL` on existing populated columns without a data migration step
3. New required columns must have a `DEFAULT` or be added nullable then back-filled
4. All migrations must be idempotent where possible (use `IF NOT EXISTS`, `IF EXISTS`)
5. After writing a migration, run `prisma validate` and `prisma migrate status`
6. Never rewrite committed migration files

---

## ADR Process

1. Copy format from an existing ADR (e.g., `docs/adr/ADR-001.md`)
2. Number sequentially from the last ADR (next: ADR-028)
3. Sections: Status, Context, Decision, Consequences, Alternatives Considered
4. Link new ADR in `docs/adr/README.md`
5. Required for: new modules, provider integrations, security boundary changes, schema design decisions

---

## Domain Quick Reference

| Domain | Module | Key models |
|--------|--------|-----------|
| Auth & Identity | `AuthModule` | `User`, `PasswordResetToken` |
| Football Core | `FootballModule` | `Competition`, `Season`, `Fixture`, `Gameweek` |
| Fantasy | `FantasyModule` | `FantasyTeam`, `FantasyTeamPlayer`, `FantasyPointsLedger` |
| Predictions | `PredictionsModule` | `Prediction`, `PredictionPointsLedger`, `PredictionRulesConfig` |
| Social Prediction | `SocialPredictionModule` | `SocialPredictionChallenge`, `SocialPredictionEntry` |
| Fan Value | `FanValueModule` | `FanValueLedger` |
| Leaderboards | `LeaderboardsModule` / `EngagementModule` | `PredictionPointsLedger`, `FanValueLedger` |
| Club Experience | `ClubExperienceModule` | `ClubExperience`, `ClubContent` |
| Media & Campaigns | `MediaModule`, `CampaignModule` | `MediaItem`, `SponsorCampaign`, `CampaignTrigger` |
| Wallet | `WalletModule` | `WalletTransaction` (sandbox adapter only) |
| Beta Launch | `BetaLaunchModule` | `BetaCohort`, `SeasonActivationApproval` |
| Admin | `AdminDashboardModule`, `AdminAuditLog` | Aggregation-only reads + audit trail |

---

## Security Constraints

- Password reset tokens: stored as SHA-256 hashes only; raw token sent to notifier, never logged
- Auth throttle: 20 requests per 15 minutes per IP (`AuthThrottleGuard`)
- Trust proxy: enabled in staging/production only (`trustProxy = nodeEnv !== 'development' && nodeEnv !== 'test'`)
- CORS: validated by `parseCorsOrigins()` — rejects `*`, requires explicit origins in non-dev
- Security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, X-XSS-Protection, Permissions-Policy — all set via Fastify `onSend` hook; `x-powered-by` removed
- RBAC: `JwtAuthGuard + RolesGuard + @Roles('PSL_ADMIN')` on every admin route
- No secrets in source or schema

---

## Agent Roles

Agents operating in this repository should adopt one of the defined roles:

> **CLI limitation (0.139.0):** `codex exec --agent <file>` is not supported. The files
> in `.codex/agents/` are Markdown role prompt templates. Pass their content as a prompt:
> `codex exec "$(cat .codex/agents/independent-code-reviewer.md)"`

| Role | Prompt file | Purpose |
|------|------------|---------|
| Independent Code Reviewer | `.codex/agents/independent-code-reviewer.md` | Unbiased post-implementation review |
| Implementation Engineer | `.codex/agents/implementation-engineer.md` | Story delivery per acceptance gate |
| Test & Quality Reviewer | `.codex/agents/test-and-quality-reviewer.md` | Test coverage and quality audit |
| Security Reviewer | `.codex/agents/security-reviewer.md` | Security, RBAC, and compliance review |
| Architecture Reviewer | `.codex/agents/architecture-reviewer.md` | ADR and domain boundary review |

Skills available in `.agents/skills/`:

| Skill | Purpose |
|-------|---------|
| `psl-one-project-context` | Core project context for any agent |
| `psl-one-independent-review` | Review checklist, severity model, report template |
| `psl-one-story-implementation` | Story workflow and acceptance gate |
| `psl-one-database-change` | Prisma migration checklist |
| `psl-one-security-review` | Security review checklist |
| `psl-one-release-readiness` | Release readiness checklist |

---

## Source of Truth Hierarchy

When information conflicts, prefer in this order:

1. **Running tests** — `pnpm --filter @psl-one/api test`
2. **Prisma schema** — `apps/api/prisma/schema.prisma`
3. **Git history** — `git log --oneline`
4. **docs/reference/** — `API-ROUTES.md`, `DATABASE-MODELS.md`, `MIGRATIONS.md`
5. **docs/project/CURRENT-STATE.md** — verified counts
6. **ADRs** — architectural decisions
7. **AGENTS.md / CLAUDE.md** — agent instructions

Do not trust in-memory summaries or documentation over running code.

---

## What Not to Commit

- `.env` files
- `node_modules/`
- `.next/` or `dist/` build output
- Prisma generated client (`.prisma/`)
- Provider credentials or API keys
- Terraform state files (`.tfstate`, `.tfvars`)
- Temporary or scratch files
- `.claude/projects/` (gitignored — session memory with local absolute paths)
