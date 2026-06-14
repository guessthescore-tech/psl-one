---
name: psl-one-project-context
description: Core project context for any agent operating in the PSL One repository — rules, safety constraints, architecture overview, and source-of-truth hierarchy.
---

# Skill: PSL One Project Context

**Skill ID:** psl-one-project-context  
**Purpose:** Provides any agent with the core project context needed to operate effectively in this repository.  
**Audience:** All agents

---

## What this skill provides

Loading this skill gives an agent:

1. Project identity and vision
2. Repository structure map
3. Non-negotiable rules (the 8 CLAUDE.md rules)
4. Safety constraints (PSL activation, financial, external systems)
5. Current verified platform state
6. Source of truth hierarchy
7. Pointer to the full source-of-truth map

---

## Core context

**Project:** PSL One — The Digital Operating System of South African Football  
**Architecture:** NestJS API + Next.js web + PostgreSQL/Prisma + Redis + pnpm monorepo  
**Scale target:** 2 million concurrent fans

**Verified state (2026-06-14):**
- 1,645 API unit tests passing
- 61 spec files
- 337 web pages
- 39 migrations
- 27 ADRs
- 25+ bounded context modules

---

## Non-negotiable rules

1. Never bypass RBAC
2. Never bypass audit logs
3. Never store business logic in frontend
4. Always publish Kafka events (deferred per ADR-027; use direct calls until measured trigger)
5. Always write tests
6. Always use domain boundaries
7. Always create ADRs for architecture decisions (next: ADR-028)
8. Always assume scale to 2 million fans

---

## Absolute safety constraints

- No PSL season activation
- No deletion of World Cup 2026 data
- No real money movement
- Fantasy, predictions, social prediction: points-only
- Wallet: sandbox adapter only
- No production API calls
- No provider secrets in source
- No migration rewrites
- No commit without "commit this" instruction
- No push without "push it" instruction

---

## Source of truth hierarchy

When in doubt, prefer in this order:

1. Running tests (`pnpm --filter @psl-one/api test`)
2. Prisma schema (`apps/api/prisma/schema.prisma`)
3. Git history (`git log --oneline`)
4. `docs/reference/` (API-ROUTES.md, DATABASE-MODELS.md, MIGRATIONS.md)
5. `docs/project/CURRENT-STATE.md`
6. ADRs (`docs/adr/`)
7. `AGENTS.md` / `CLAUDE.md`

---

## References

- [Source of truth map](references/source-of-truth-map.md) — where to find authoritative information on every topic
- [AGENTS.md](../../../AGENTS.md) — full project instructions
- [docs/project/CURRENT-STATE.md](../../../docs/project/CURRENT-STATE.md) — verified counts
- [docs/adr/README.md](../../../docs/adr/README.md) — all architectural decisions
