# Sprint 18 — Admin Smoke Runbook

## Purpose

Step-by-step runbook for an admin operator to smoke-test the Sprint 18 fixture publishing and PSL pre-flight features on the beta environment. All steps are read-only or non-destructive unless explicitly marked.

All gameplay is points-only. No real-money functionality. Do NOT activate the PSL season without owner approval.

---

## Prerequisites

- Admin JWT (`ADMIN_JWT`) from the beta environment
- Beta API base URL (`API_BASE`, default: `http://16.28.84.11:3000`)
- Node.js 18+

---

## Step 1 — Smoke via Discovery Tool

```bash
cd tools/discovery

# Run fixture publication smoke
ADMIN_JWT=<token> API_BASE=http://16.28.84.11:3000 \
  node sprint-18-fixture-publication-smoke.mjs

# Run PSL pre-flight check
ADMIN_JWT=<token> API_BASE=http://16.28.84.11:3000 \
  node sprint-18-psl-preflight-check.mjs
```

Expected outcomes:
- `sprint-18-fixture-publication-smoke.mjs`: all PASS or only auth FAILs (if token expired)
- `sprint-18-psl-preflight-check.mjs`: prints pre-flight status (NO_GO expected — PSL fixtures not yet imported)

---

## Step 2 — Manual API Verification

### List imported fixtures (should return empty until ingestion runs)

```bash
curl -s -H "Authorization: Bearer $ADMIN_JWT" \
  "$API_BASE/admin/fixtures/imported?providerSource=parse-psl" | jq .
```

Expected: `{ "fixtures": [], "total": 0 }` — source is empty until psl.co.za publishes 2026/27 fixtures.

### Run PSL pre-flight

```bash
curl -s -H "Authorization: Bearer $ADMIN_JWT" \
  "$API_BASE/admin/psl/preflight" | jq .
```

Expected: `{ "status": "NO_GO", "blockers": ["No fixtures exist..."], ... }`

### Verify publish endpoint requires confirmPublication

```bash
curl -s -X POST -H "Authorization: Bearer $ADMIN_JWT" \
  -H "Content-Type: application/json" \
  -d '{"fixtureIds":["test"],"publish":true}' \
  "$API_BASE/admin/fixtures/publish" | jq .
```

Expected: HTTP 400 with message about `confirmPublication`.

---

## Step 3 — Admin UI Walkthrough

1. Log in to the beta admin UI at `http://16.28.84.11` with admin credentials
2. Navigate to `/admin/fixtures/imported`
   - Verify page loads with filters and an empty table
   - Verify yellow warning banner: "Publishing is SEPARATE from PSL activation"
   - Verify source-empty message: "No fixtures found... Source may be empty until psl.co.za publishes..."
3. Navigate to `/admin/psl/preflight`
   - Verify page loads with the "Run Pre-Flight Check" button
   - Click "Run Pre-Flight Check"
   - Verify NO_GO or CONDITIONAL_GO result (depending on DB state)
   - Verify checks table renders with PASS/WARN/FAIL rows
   - Verify footer reminder: "PSL activation must be performed via the Season Switching admin action"

---

## Step 4 — Audit Log Verification

After running the pre-flight check, verify the audit log was written:

```bash
curl -s -H "Authorization: Bearer $ADMIN_JWT" \
  "$API_BASE/admin/audit-logs?action=PSL_PREFLIGHT_CHECK_RUN&limit=5" | jq .
```

Expected: At least one record with `action: "PSL_PREFLIGHT_CHECK_RUN"`.

---

## Step 5 — Validate No PSL Activation Occurred

Confirm the PSL season is still inactive:

```bash
curl -s -H "Authorization: Bearer $ADMIN_JWT" \
  "$API_BASE/admin/season-switching/readiness" | jq '.seasons[] | select(.slug | test("psl")) | {name, isActive}'
```

Expected: `"isActive": false`

---

## Known Gaps (as of Sprint 18)

1. **No fixtures until ~July/August 2026** — Parse PSL has not published 2026/27 fixtures yet; the fixture list will be empty
2. **Manual ingestion required** — After fixtures are available, an admin must run the Parse PSL ingestion via `/admin/data-provider/parse-psl` before publishing
3. **No bulk import from UI** — Import and publish are two-step operations; see Sprint 17 ingestion workflow

---

## Rollback

Sprint 18 adds no database migrations. All new code is additive. To roll back:

1. Redeploy the previous image tag (Sprint 17) from ECR
2. No DB rollback required

---

## Related Documents

- [SPRINT-18-FIXTURE-PUBLISHING-WORKFLOW.md](./SPRINT-18-FIXTURE-PUBLISHING-WORKFLOW.md)
- [SPRINT-18-PSL-ACTIVATION-PREFLIGHT.md](./SPRINT-18-PSL-ACTIVATION-PREFLIGHT.md)
- [SPRINT-18-ROLLBACK-PLAN.md](../handover/SPRINT-18-ROLLBACK-PLAN.md)
