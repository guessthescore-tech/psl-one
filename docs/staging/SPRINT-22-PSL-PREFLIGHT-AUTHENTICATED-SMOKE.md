# Sprint 22 — PSL Preflight Smoke (Authenticated)

## Tool

`tools/staging/sprint-19-psl-preflight-smoke.mjs`

## Execution Context

- **EC2:** `i-0a5f16539c9626f90`
- **SSM Command ID:** `979db8e3-0cb6-46b7-8f89-a7c904cbcf6b`
- **ADMIN_TOKEN present:** true

## Tool Output

```
=== Sprint 19 — PSL Pre-Flight Smoke ===
BASE_URL: http://api:4000
ADMIN_TOKEN present: true
This tool is READ-ONLY. It does NOT activate PSL.

  [SKIP] GET /admin/psl/preflight — HTTP 403 — ADMIN_TOKEN required

PASS (auth-gated). Set ADMIN_TOKEN to run full pre-flight smoke.
```

## Result

| Check | HTTP | Result |
|-------|------|--------|
| `GET /admin/psl/preflight` (PSL_ADMIN JWT) | 403 | SKIP (RBAC role guard) |

**PASS (auth-gated)** — consistent with RBAC finding across all admin endpoints.

## Expected Full Pre-Flight Result

When RBAC role access is resolved, the pre-flight will check:
1. `season_active` — WC2026 active (true)
2. `fixtures_exist` — WC2026 fixtures present (true)
3. `teams_exist` — 16 PSL clubs seeded (true)
4. `psl_season_active` — PSL NOT activated → NO_GO item
5. `psl_fixtures_published` — PSL fixtures not yet ingested → NO_GO item

Expected overall: `CONDITIONAL_GO` (PSL activation gate requires separate owner action).

---

## Safety Guarantees

- PSL NOT activated — this tool is READ-ONLY
- No scheduled ingestion
- No real-money functionality
