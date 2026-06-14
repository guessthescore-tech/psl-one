---
name: psl-one-story-implementation
description: Complete story delivery workflow for the PSL One repository — 14-step implementation guide, acceptance gate commands, and safety invariants.
---

# Skill: PSL One Story Implementation

**Skill ID:** psl-one-story-implementation  
**Purpose:** Provides an implementation engineer agent with the complete workflow for delivering a PSL One story from specification to acceptance gate.  
**Audience:** Implementation engineer agents

---

## What this skill provides

1. The canonical story delivery workflow (14 steps)
2. The acceptance gate — the commands that must pass before the story is considered complete
3. The patterns and rules that govern every story

---

## Story delivery workflow

See [story-workflow.md](references/story-workflow.md) for the full 14-step workflow.

See [acceptance-gate.md](references/acceptance-gate.md) for the exact commands and pass criteria.

---

## Quick reference

### Before writing any code

1. Read the story specification carefully
2. Identify the bounded context (one NestJS module)
3. Check whether schema changes are needed
4. Check `docs/adr/` to see if an ADR is required

### The delivery order

```
Schema migration → Seed → Service + Tests → Controller → Module registration → Web client → Web pages → Docs
```

### The minimum viable test set

For every service method, write at minimum:
- One test for the happy path
- One test for the primary error path (record not found, invalid input, etc.)

### The acceptance gate (must all pass)

```bash
pnpm --filter @psl-one/api db:seed
pnpm --filter @psl-one/api db:seed
pnpm --filter @psl-one/api prisma validate
pnpm --filter @psl-one/api typecheck
pnpm --filter @psl-one/api test
pnpm --filter @psl-one/api build
pnpm --filter @psl-one/web typecheck
pnpm --filter @psl-one/web test
pnpm --filter @psl-one/web build
```

### Safety invariants (absolute)

- Do not activate the PSL season
- Do not add a season activation endpoint
- Do not move real money
- Fantasy, predictions, social prediction: points-only
- Wallet: sandbox adapter only (`SiliconEnterpriseSandboxWalletAdapter`)
- No production API calls
- No provider secrets in source

---

## References

- [Story workflow](references/story-workflow.md) — 14-step implementation workflow
- [Acceptance gate](references/acceptance-gate.md) — exact gate commands and criteria
