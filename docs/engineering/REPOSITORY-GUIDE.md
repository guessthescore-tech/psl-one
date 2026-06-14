# PSL One — Repository Guide

**Purpose:** Monorepo structure, package management, and contribution workflow  
**Audience:** All engineers  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Monorepo Structure

```
psl-one/
  apps/
    api/                  # NestJS API (port 4000)
      src/
        <domain>/         # One directory per bounded context
      prisma/
        schema.prisma     # Database schema
        migrations/       # 38 migration files
        seed.ts           # Reference data seed
      package.json        # @psl-one/api
    web/                  # Next.js web (port 3001)
      src/
        app/              # Next.js App Router pages
        lib/              # API client functions
        components/       # Shared UI components
      package.json        # @psl-one/web
  docs/                   # All documentation
    architecture/
    engineering/
    domain/
    operations/
    reference/
    adr/
    project/
    platform/             # Legacy Sprint 1/2 platform docs
  .github/
    workflows/            # CI/CD (stale — needs Sprint 3 update)
  docker-compose.yml      # Local infrastructure
  turbo.json              # Turbo build pipeline
  pnpm-workspace.yaml     # pnpm workspace config
  package.json            # Root package.json
  README.md               # Getting started
```

---

## Package Management

pnpm 9.x with workspaces. All dependencies managed at workspace level.

```bash
# Install all dependencies
pnpm install

# Add a dependency to a specific package
pnpm --filter @psl-one/api add <package>
pnpm --filter @psl-one/web add <package>

# Add a dev dependency
pnpm --filter @psl-one/api add -D <package>
```

---

## Build System

Turbo 2.x for incremental builds. `turbo.json` defines task pipelines.

```bash
# Build everything
pnpm build

# Run dev for everything
pnpm dev

# Test everything
pnpm test

# Typecheck everything
pnpm typecheck
```

Or target a specific package:

```bash
pnpm --filter @psl-one/api build
pnpm --filter @psl-one/web dev
```

---

## Branch Strategy

- `main` — primary branch, always deployable (when production exists)
- All Sprint 2 work committed directly to `main`
- Sprint 3 will introduce feature branches + PR review

---

## Commit Messages

Format: `feat: description of what was delivered`

Examples from git history:
```
feat: add psl beta launch readiness and frontend showcase
feat: add live match intelligence and social prediction gaming
feat: add media sponsor campaigns and wallet activation foundation
feat: add psl squad import price finalisation and activation dry run
```

---

## Pre-Commit Checks

Before any commit, verify:

```bash
pnpm --filter @psl-one/api typecheck
pnpm --filter @psl-one/api test
pnpm --filter @psl-one/api build
pnpm --filter @psl-one/web typecheck
pnpm --filter @psl-one/web build
```

All must pass. No type errors. No test failures.

---

## What Not to Commit

- `.env` files (secrets)
- `node_modules/`
- `.next/` build output
- `dist/` build output
- Prisma Client generated files (`.prisma/`)
- Temporary or scratch files

---

## Documentation

All documentation lives in `docs/`. When adding a new feature:

1. If it's a new architectural decision → create an ADR in `docs/adr/`
2. If it's a new domain concept → add to the relevant `docs/domain/` file
3. If it's a new operation → document in `docs/operations/`
4. Update `docs/README.md` navigation index if adding a new doc file

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `apps/api/src/app.module.ts` | Root module — all domain modules registered here |
| `apps/api/prisma/schema.prisma` | Database schema source of truth |
| `apps/api/prisma/seed.ts` | Reference data — clubs, seasons, fixtures, configs |
| `apps/web/src/lib/` | All API client functions |
| `apps/web/src/app/` | All Next.js pages |
| `docker-compose.yml` | Local infrastructure (DB, Kafka, Redis, Mailpit) |
| `turbo.json` | Turbo task pipeline |
| `pnpm-workspace.yaml` | Workspace package paths |
