# Sprint 25 — Fixture Import Write Runbook

> **STATUS: NOT AUTHORISED**
>
> This runbook documents the procedure for when fixture import write is eventually authorised.
> None of these steps may be executed during Sprint 25.
> All write steps require explicit owner authorisation gate (see `SPRINT-25-OWNER-APPROVAL-GATES.md`).

---

## 10-Gate Pre-Write Checklist

All 10 gates must be checked and signed off by the owner before `dryRun:false` is used.

| Gate | Description | Status |
|------|-------------|--------|
| G01 | Dry-run returns `PSL_FIXTURE_CANDIDATES_FOUND` (not SOURCE_EMPTY) | NOT YET |
| G02 | Team resolution check returns `TEAM_RESOLUTION_READY` | NOT YET |
| G03 | Owner has reviewed all candidates in dry-run output | NOT YET |
| G04 | No duplicate fixtures exist in DB for the season | NOT YET |
| G05 | Target seasonId is confirmed (PSL 2026/27 season ID) | NOT YET |
| G06 | Season is in PRE_SEASON state (not ACTIVE) | NOT YET |
| G07 | EC2 has latest code deployed (run_migrations=true if needed) | NOT YET |
| G08 | No scheduled ingestion is enabled | NOT YET |
| G09 | Rollback plan reviewed and confirmed | NOT YET |
| G10 | Owner explicitly authorises `dryRun:false` + `confirmWrite:true` | NOT YET |

---

## Import Write Procedure (Owner-Authorised Only)

### Step 1: Final dry-run confirmation

```bash
BASE_URL=http://localhost:4000 \
ADMIN_TOKEN=<psl-admin-jwt> \
node tools/staging/sprint-25-psl-fixture-availability-check.mjs
```

Expected: `PSL_FIXTURE_CANDIDATES_FOUND` with candidateCount > 0.

### Step 2: Team resolution confirmation

```bash
BASE_URL=http://localhost:4000 \
ADMIN_TOKEN=<psl-admin-jwt> \
node tools/staging/sprint-25-team-resolution-readiness.mjs
```

Expected: `TEAM_RESOLUTION_READY`

### Step 3: Owner review

Owner reviews all candidates from dry-run output. Written sign-off required.

### Step 4: Fixture import write (OWNER AUTHORISED ONLY)

```bash
# This command is BLOCKED until owner authorises it
curl -s -X POST http://localhost:4000/admin/data-provider/parse-psl/fixtures/ingest \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false, "confirmWrite": true, "seasonId": "<PSL_2026_27_SEASON_ID>"}'
```

Expected response:
```json
{
  "status": "IMPORT_COMPLETE",
  "imported": <N>,
  "skipped": 0,
  "failed": 0
}
```

### Step 5: Verify import

```bash
curl -s http://localhost:4000/admin/fixtures/imported \
  -H "Authorization: Bearer ${ADMIN_TOKEN}"
```

Confirm fixture count matches candidate count from dry-run.

### Step 6: DO NOT publish fixtures yet

Fixture publication (`isPublished = true`) is a separate step requiring another owner gate.
See `SPRINT-25-FIXTURE-PUBLICATION-RUNBOOK.md`.

---

## Rollback (Import Write)

If import write produces unexpected results:

1. Imported fixtures can be deleted via admin endpoint: `DELETE /admin/fixtures/:id`
2. All imported fixtures for a batch are linked via `FixtureImportBatch.id`
3. Delete the batch to cascade-delete all imported fixtures

No migration rollback needed — import is a data operation, not a schema change.

---

## Safety Constraints (Immutable)

- `isPublished = false` on all imported fixtures — not visible to fans
- PSL season remains INACTIVE after import
- No fantasy team selection can reference unpublished fixtures
- No prediction can be created against unpublished fixtures
- Scheduled ingestion remains DISABLED
