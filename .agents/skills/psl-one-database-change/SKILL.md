---
name: psl-one-database-change
description: Safe Prisma migration authoring and deployment rules for the PSL One repository — additive-only changes, naming conventions, verification steps.
---

# Skill: PSL One Database Change

**Skill ID:** psl-one-database-change  
**Purpose:** Provides an agent with the checklist and rules for safe Prisma migration authoring and deployment in PSL One.  
**Audience:** Implementation engineer agents, any agent touching schema

---

## What this skill provides

1. The Prisma migration checklist — what to verify before and after every migration
2. Migration naming and ordering conventions
3. Rollback and recovery guidance

---

## Core migration rules

1. **Additive only** — never DROP COLUMN, never DROP TABLE, never ALTER COLUMN to remove a DEFAULT on a populated column
2. **Idempotent where possible** — use `IF NOT EXISTS` for indexes; use `CREATE TABLE IF NOT EXISTS` for new tables
3. **New NOT NULL columns must have a DEFAULT** or be added nullable first and back-filled before adding the constraint
4. **Never rewrite a committed migration** — create a new one instead
5. **Never run `migrate reset` on a shared or production database**
6. **All migrations deployed via `prisma migrate deploy`** in non-dev environments

---

## Quick checklist

Before writing the migration SQL:
- [ ] Identified which tables will change
- [ ] Confirmed the change is additive (no drops)
- [ ] Checked that any new NOT NULL column has a DEFAULT or nullable path
- [ ] Named the migration descriptively

After writing the migration SQL:
- [ ] Ran `pnpm --filter @psl-one/api prisma validate`
- [ ] Ran `pnpm --filter @psl-one/api prisma migrate status` to verify applied/pending count
- [ ] Tested migration on local dev database
- [ ] Confirmed `pnpm --filter @psl-one/api test` still passes

---

## References

- [Prisma migration checklist](references/prisma-migration-checklist.md) — full checklist with SQL patterns
