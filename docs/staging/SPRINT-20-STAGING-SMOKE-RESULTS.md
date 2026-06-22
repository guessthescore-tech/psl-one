# Sprint 20 — Staging Smoke Results

## Deployment Context

- **Deployed SHA:** `81d3c391ffb69b9217caf0847aa9b4402493c83d`
- **Sprint:** 19 merge commit (staging admin smoke readiness)
- **Target:** Beta EC2 `i-0a5f16539c9626f90`
- **API base:** `http://api.staging.pslone.co.za`
- **Web base:** `http://staging.pslone.co.za`

---

## Deployment Workflow Smoke (Automated via deploy-beta-ec2.yml)

**Run ID:** `27977306374` — Completed `2026-06-22T19:20:28Z`

| Check | Result |
|-------|--------|
| SHA validation | PASS |
| Image build + push | PASS (3 images) |
| Prisma migration | PASS (success — 42 migrations, no pending) |
| API readiness (`/health/ready`) | PASS |
| Structured smoke suite | PASS |

---

## Sprint 19 Tool Smoke (Post-deployment, requires ADMIN_TOKEN)

These tools must be run manually after deployment with a valid admin JWT:

```bash
export BASE_URL="http://api.staging.pslone.co.za"
export ADMIN_TOKEN="<obtain-via-login-endpoint>"
export DRY_RUN_ONLY=true
export ALLOW_WRITE_SMOKE=false

node tools/staging/sprint-19-admin-rbac-smoke.mjs
node tools/staging/sprint-19-parse-ingestion-smoke.mjs
node tools/staging/sprint-19-fixture-publication-smoke.mjs
node tools/staging/sprint-19-psl-preflight-smoke.mjs
node tools/staging/sprint-19-admin-smoke.mjs
```

**Token acquisition:**
```bash
curl -X POST http://api.staging.pslone.co.za/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"<admin-email>","password":"<admin-password>"}'
```

### Expected Smoke Results

| Tool | Expected Result |
|------|----------------|
| admin-rbac-smoke | Unauthenticated: 401/403; authenticated: non-5xx |
| parse-ingestion-smoke | `sourceEmpty: true` WARN (fixtures ~July/August) |
| fixture-publication-smoke | Write smoke SKIPPED (ALLOW_WRITE_SMOKE=false) |
| psl-preflight-smoke | NO_GO or CONDITIONAL_GO (no PSL activation) |
| admin-smoke | Source-empty WARN; PSL preflight CONDITIONAL_GO or NO_GO |

---

## Safety Guarantees During Smoke

- `DRY_RUN_ONLY=true` — no ingestion writes
- `ALLOW_WRITE_SMOKE=false` — no fixture publication
- PSL pre-flight is read-only (returns status only, never activates)
- No provider keys printed
- No DB writes except AdminAuditLog (from pre-flight check — expected)

---

## PSL Status After Smoke

PSL remains **INACTIVE**. World Cup 2026 remains active.

The PSL pre-flight returning NO_GO or CONDITIONAL_GO is the **expected result**:
- Fixtures not yet published (no 2026/27 schedule from psl.co.za)
- Pre-flight is informational only — it does not activate PSL

Fixture publishing is **SEPARATE** from PSL activation.
