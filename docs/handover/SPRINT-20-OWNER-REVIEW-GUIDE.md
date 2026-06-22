# Sprint 20 — Owner Review Guide

## What to Review

Sprint 20 executes owner-authorised beta EC2 deployment and documents smoke readiness.

### 1. Verify Deployment Workflow Result

Check the GitHub Actions workflow run:

```bash
gh run list --repo guessthescore-tech/psl-one --branch main --limit 5
```

Look for `Deploy — Beta EC2` workflow. Verify:
- Status: `completed / success`
- SHA deployed: `81d3c391ffb69b9217caf0847aa9b4402493c83d`
- Migration result: success or skipped (no pending migrations)
- Readiness: pass
- Smoke: pass

### 2. Verify API Readiness

```bash
curl -s http://api.staging.pslone.co.za/health/ready
```

Expected: HTTP 200 with `{"status":"ok"}` or `{"status":"up"}`.

### 3. Run Manual Sprint 19 Smoke Tools

After obtaining an admin JWT:

```bash
export BASE_URL="http://api.staging.pslone.co.za"
export ADMIN_TOKEN="<your-admin-jwt>"
export DRY_RUN_ONLY=true
export ALLOW_WRITE_SMOKE=false

node tools/staging/sprint-19-admin-rbac-smoke.mjs
node tools/staging/sprint-19-parse-ingestion-smoke.mjs
node tools/staging/sprint-19-fixture-publication-smoke.mjs
node tools/staging/sprint-19-psl-preflight-smoke.mjs
node tools/staging/sprint-19-admin-smoke.mjs
```

### 4. Verify PSL Pre-Flight Is Read-Only

The pre-flight tool at `/admin/psl/preflight` must return NO_GO or CONDITIONAL_GO.
It must NOT activate PSL. PSL activation requires a separate Season Switching admin action.

### 5. Verify No Real-Money Language in UI

Browse:
- `http://staging.pslone.co.za/` — must show "Points only" disclaimer
- `http://staging.pslone.co.za/predict` — must show "Points only" disclaimer with no gambling or real-money language
- `http://staging.pslone.co.za/admin/psl/preflight` — must show read-only banner

---

## Owner Decision Points

### Should write smoke be enabled?

Default: `ALLOW_WRITE_SMOKE=false`. If you wish to test fixture publication (non-destructive but writes records):

```bash
ALLOW_WRITE_SMOKE=true node tools/staging/sprint-19-fixture-publication-smoke.mjs
```

This will attempt to publish a fixture to the beta database. **This does NOT activate PSL.**

### Should PSL be activated on beta?

**No action required this sprint.** PSL activation must wait for:
1. PSL 2026/27 fixture schedule published on psl.co.za
2. Admin ingestion + publication complete
3. Pre-flight returning GO
4. Separate owner-instruction via Season Switching

---

## CI Checks Required

- [ ] build-and-test SUCCESS
- [ ] security-scan SUCCESS
- [ ] event-schema-validation SUCCESS
- [ ] Container Build SUCCESS (all 3)
- [ ] Vercel SUCCESS

---

## No Migrations Added

Sprint 20 adds 0 Prisma migrations. Migration count remains 42.
