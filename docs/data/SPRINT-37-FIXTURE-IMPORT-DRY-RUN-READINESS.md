# Sprint 37 — Fixture Import Dry-Run Readiness

## Purpose

Documents the prerequisites and process for running a fixture import dry-run, and the gates before a write import is approved.

## Key Principle

**Dry-run import ≠ Write import. Write import ≠ Fixture publication. Fixture publication ≠ PSL activation.**

Each of these is a separate, independently owner-gated action.

## Dry-Run Import Readiness Checklist

Before running a dry-run import:

- [ ] `DATA_PROVIDER` env var set to `parse-psl` or `api-football`
- [ ] Corresponding key set server-side
- [ ] `GET /admin/data-provider/psl-fixture-readiness` returns `dryRunEligible=true`
- [ ] `readinessStatus` is not `SOURCE_EMPTY` (fixtures must be available from provider)
- [ ] PSL_ADMIN JWT obtained
- [ ] beta EC2 API is reachable
- [ ] No pending migration blockers

## Dry-Run Import — What Happens

1. `POST /admin/data-provider/parse-psl/fixtures/ingest` with `dryRun=true` (default)
2. ParsePslFixtureIngestionService fetches fixtures from Parse PSL adapter
3. Normalises fixtures (strips incomplete records)
4. Resolves home/away teams against DB (fuzzy match)
5. Returns candidate list with team resolution results
6. **No DB writes occur** — `created=0`, `updated=0`
7. Audit log entry `PARSE_PSL_FIXTURE_INGESTION_DRY_RUN` written (this is the only DB write)

## Dry-Run Tool

```bash
BASE_URL=http://api:4000 ADMIN_TOKEN=<psl-admin-jwt> RUN_DRY_RUN=true \
  node tools/staging/sprint-37-fixture-import-dry-run-readiness.mjs
```

The tool always sets `dryRun=true`. `confirmWrite` is never set.

## Write Import Gates (not approved in Sprint 37)

All of the following must be true before a write import is authorised:

| Gate | Who approves |
|------|-------------|
| Dry-run candidate list reviewed | Owner |
| Team resolution >90% (all 16 clubs matched) | Owner |
| No duplicate detection flags | Owner |
| seasonId for PSL 2026/27 confirmed | Owner |
| Rollback plan confirmed | Owner |
| Owner explicitly sets `dryRun=false` + `confirmWrite=true` | Owner only |

## Write Import Command Template (owner reference — NOT approved in Sprint 37)

```bash
# DO NOT run without separate owner approval
# seasonId must be the actual PSL 2026/27 season ID from the DB
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false, "confirmWrite": true, "seasonId": "<psl-2026-27-season-id>", "competitionCode": "BETWAY_PREMIERSHIP"}' \
  http://api:4000/admin/data-provider/parse-psl/fixtures/ingest
```

## Post-Write Verification (for when write import is approved)

- [ ] Fixture count matches dry-run candidate count
- [ ] All fixtures have `isPublished=false`
- [ ] All fixtures have correct `seasonId`
- [ ] `GET /admin/fixtures` returns new fixtures
- [ ] Team resolution matches expected 16 clubs
- [ ] No duplicate fixtures (check by `providerFixtureId`)
- [ ] Audit log shows `PARSE_PSL_FIXTURE_INGESTION_WRITE_COMPLETED`

## Fixture Publication (separate from write import — NOT approved in Sprint 37)

After write import is verified, fixture publication is a separate admin action:

```
POST /admin/fixtures/:id/publish   (per-fixture)
```

Fixture publication does NOT activate PSL.

## PSL Activation (separate from fixture publication — NOT approved in Sprint 37)

PSL activation requires the 13-check preflight:

```
GET /admin/season-switching/readiness
```

And separate owner approval.

## Current State

```
readinessStatus     = SOURCE_EMPTY (expected)
dryRunEligible      = false (no provider configured on beta EC2)
writeImportForbidden = true
Expected change     = July/August 2026 when psl.co.za publishes 2026/27 schedule
```
