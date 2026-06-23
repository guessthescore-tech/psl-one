# Sprint 27 — Portal RBAC Smoke Matrix

**Date:** 2026-06-23  
**Tool:** `tools/staging/sprint-27-club-sponsor-rbac-smoke.mjs`  

---

## RBAC Matrix

| Token Role | Endpoint | Expected | Notes |
|-----------|----------|----------|-------|
| FAN | /club-portal/* | 401/403 FORBIDDEN | Not a club admin |
| FAN | /sponsor-portal/* | 401/403 FORBIDDEN | Not a sponsor |
| CLUB_ADMIN | /club-portal/* | 200 PASS | Authorised |
| CLUB_ADMIN | /sponsor-portal/* | 403 FORBIDDEN | Cross-portal denied |
| SPONSOR | /sponsor-portal/* | 200 PASS | Authorised |
| SPONSOR | /club-portal/* | 403 FORBIDDEN | Cross-portal denied |
| PSL_ADMIN | /club-portal/* | 200 PASS | Super admin access |
| PSL_ADMIN | /sponsor-portal/* | 200 PASS | Super admin access |
| Unauthenticated | Any portal | 401 UNAUTHORIZED | No JWT |

---

## Staging Gaps

- GAP-27-05: CLUB_ADMIN staging JWT — PENDING_TOKEN (owner must provision)
- GAP-27-06: SPONSOR staging JWT — PENDING_TOKEN (owner must provision)

PSL_ADMIN token is available per Sprint 24 smoke protocol.

---

## Run Instructions

```bash
BASE_URL=http://16.28.84.11:3000 \
FAN_TOKEN=<fan-jwt> \
CLUB_ADMIN_TOKEN=<club-admin-jwt> \
SPONSOR_TOKEN=<sponsor-jwt> \
PSL_ADMIN_TOKEN=<psl-admin-jwt> \
node tools/staging/sprint-27-club-sponsor-rbac-smoke.mjs
```

Expected outcome: All FORBIDDEN_EXPECTED checks return 401/403, all PASS checks return 200.
