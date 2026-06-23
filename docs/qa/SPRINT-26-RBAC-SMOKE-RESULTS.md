# Sprint 26 — RBAC Smoke Results

**Date:** 2026-06-23
**Sprint:** 26 (Controlled User Testing)

---

## Summary

| Persona        | Method               | Result        | Source                              |
|----------------|----------------------|---------------|-------------------------------------|
| PSL_ADMIN      | Staging EC2 JWT      | 8/0 PASS      | Sprint 24 EC2 smoke (2026-06-23)    |
| CLUB_ADMIN     | Staging EC2 JWT      | PENDING_TOKEN | JWT not yet provisioned (GAP-26-03) |
| SPONSOR_ADMIN  | Staging EC2 JWT      | PENDING_TOKEN | JWT not yet provisioned (GAP-26-04) |
| FAN            | Vercel preview       | PASS          | Sprint 4 Vercel preview smoke       |
| ANONYMOUS      | Vercel preview       | PASS          | Public routes return 200            |

---

## PSL_ADMIN — CONFIRMED PASS (8/0)

**Source:** Sprint 24 EC2 RBAC smoke (commit `094b198`, run 28015195029)
**Method:** JWT issued for `PSL_ADMIN` role against staging EC2 API

### Results

| Route                               | Method | Expected | Actual | Status |
|-------------------------------------|--------|----------|--------|--------|
| `GET /auth/me`                      | GET    | 200      | 200    | PASS   |
| `GET /admin/competitions`           | GET    | 200      | 200    | PASS   |
| `GET /admin/seasons`                | GET    | 200      | 200    | PASS   |
| `GET /admin/fixtures`               | GET    | 200      | 200    | PASS   |
| `POST /admin/fixtures/import-write` | POST   | 403      | 403    | PASS   |
| `GET /admin/users`                  | GET    | 200      | 200    | PASS   |
| `GET /admin/audit`                  | GET    | 200      | 200    | PASS   |
| `GET /admin/roles`                  | GET    | 200      | 200    | PASS   |

**Passed: 8 / Failed: 0**

Note: `POST /admin/fixtures/import-write` returning 403 is CORRECT — write is owner-gated
and disabled. This is the expected behaviour, not a failure.

---

## CLUB_ADMIN — PENDING_TOKEN

**Status:** PENDING_TOKEN

The `CLUB_ADMIN` role exists in the RBAC system but no staging JWT has been issued yet.
Club portal smoke cannot be completed until the owner provisions a CLUB_ADMIN test account
on staging.

**Blocker:** Owner gate — JWT provisioning required (GAP-26-03)
**Sprint 27 action:** Provision CLUB_ADMIN JWT and run club portal RBAC smoke

---

## SPONSOR_ADMIN — PENDING_TOKEN

**Status:** PENDING_TOKEN

The `SPONSOR_ADMIN` role exists in the RBAC system but no staging JWT has been issued yet.
Sponsor portal smoke cannot be completed until the owner provisions a SPONSOR_ADMIN test
account on staging.

**Blocker:** Owner gate — JWT provisioning required (GAP-26-04)
**Sprint 27 action:** Provision SPONSOR_ADMIN JWT and run sponsor portal RBAC smoke

---

## FAN — PASS

**Source:** Sprint 4 Vercel preview smoke (https://psl-one-experience-preview-cxb5urftw-guess-the-score.vercel.app)
**Method:** Fan registration via experience app, authenticated fan session

Fan routes accessible: `/`, `/predict`, `/predict/challenge`, `/fantasy`, `/account`
Admin/club/sponsor routes blocked: 401/404 as expected

---

## ANONYMOUS — PASS

**Source:** Vercel preview — unauthenticated fetch
**Method:** No auth header, no session cookie

Public routes return 200: `/` (homepage)
Protected routes return 401/404: `/predict`, `/fantasy`, `/account`
Portal routes return 404: `/admin`, `/club`, `/sponsor` (RBAC guard — no auth)

---

## Notes

- Sprint 23 fix (`c731c49`): `@Roles('ADMIN')` → `@Roles('PSL_ADMIN')` in 3 guard files
  resolved GAP-22-01 where `PSL_ADMIN` JWT was getting 403 on admin endpoints.
- Sprint 24 EC2 re-deployment (`094b198`) confirmed fix on staging.
- 36 new guard tests added in Sprint 23 to prevent regression.

---

## Safety Confirmations

- No JWT token values are committed in this document.
- PSL remains inactive.
- Wallet remains sandbox-only.
- Fixture import write returned 403 (correct — owner-gated).
