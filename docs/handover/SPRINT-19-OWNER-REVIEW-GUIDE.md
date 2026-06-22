# Sprint 19 — Owner Review Guide

## What to Review

Sprint 19 is tooling-only — no new API routes, no new frontend pages, no schema changes. The review focuses on:

### 1. Tool Safety Properties

Verify each smoke tool has the correct safety defaults:

| Tool | DRY_RUN_ONLY default | ALLOW_WRITE_SMOKE default | PSL activation |
|------|---------------------|--------------------------|----------------|
| `staging-env-check.mjs` | N/A (read-only) | N/A | Never |
| `admin-smoke.mjs` | `true` | `false` | Never |
| `admin-rbac-smoke.mjs` | N/A (read-only) | N/A | Never |
| `parse-ingestion-smoke.mjs` | `true` | `false` | Never |
| `fixture-publication-smoke.mjs` | N/A (read-only) | `false` | Never |
| `psl-preflight-smoke.mjs` | N/A (read-only) | N/A | Never |
| `migration-status-check.mjs` | N/A (read-only) | N/A | Never |

Source: `tools/staging/*.mjs`

### 2. No Provider Keys in Tools

Verify no tool contains hardcoded provider key values:

```bash
grep -rn 'PARSE_API_KEY=\|FOOTBALL_DATA_API_KEY=\|API_FOOTBALL_KEY=' tools/staging/
```

Expected: empty (only `process.env[...]` references)

### 3. Write Smoke Guard

Verify `sprint-19-fixture-publication-smoke.mjs` skips write smoke by default:

Look for: `if (!ALLOW_WRITE_SMOKE) { skip('Publish write smoke', 'ALLOW_WRITE_SMOKE=false ...'`

### 4. Dry-Run Guard on Ingestion

Verify `sprint-19-parse-ingestion-smoke.mjs` refuses write ingestion by default:

Look for: `const DRY_RUN_ONLY = process.env['DRY_RUN_ONLY'] !== 'false';`

### 5. Migration Tool Does Not Apply

Verify `sprint-19-migration-status-check.mjs` only calls `prisma migrate status`, not `prisma migrate deploy`.

### 6. Experience Tests

Verify the Sprint 19 test block in `apps/experience/src/lib/experience.spec.ts` tests for:
- Tool file existence
- Write-guard behaviour assertions (source inspection)
- Dry-run default assertions (source inspection)
- No provider keys in tools
- No scheduler in tools
- No PSL activation in tools

---

## Owner Decision Points

### Do you authorize EC2 deployment?

If YES:
1. Follow `docs/staging/SPRINT-19-STAGING-DEPLOYMENT-RUNBOOK.md`
2. Target beta EC2 only (`i-0a5f16539c9626f90`)
3. Run smoke suite after deployment

If NO:
- Merge Sprint 19 as tooling-only
- Defer EC2 deployment to a future scheduled window

### Do you accept source-empty state as non-blocking?

Parse PSL has not published 2026/27 fixtures. All smoke tools are designed to treat source-empty as a WARN, not a FAIL. This is the expected state until ~July/August 2026.

---

## CI Checks Required

- [ ] build-and-test SUCCESS
- [ ] security-scan SUCCESS
- [ ] event-schema-validation SUCCESS
- [ ] Container Build SUCCESS (all 3)
- [ ] Vercel SUCCESS

---

## No Migrations

Sprint 19 adds zero Prisma migrations. Migration count remains 42.
