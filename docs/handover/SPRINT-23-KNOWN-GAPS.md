# Sprint 23 — Known Gaps

## GAP-23-01: RBAC Fix Not Yet Deployed to Beta EC2

**Severity:** Medium — code is fixed; deployment is pending owner authorisation

**Finding:** The `@Roles('ADMIN')` → `@Roles('PSL_ADMIN')` fix is committed but not yet deployed to beta EC2. Until deployed, the staging instance still returns 403 for PSL_ADMIN on admin endpoints.

**Next step:** Owner authorises beta EC2 re-deployment in Sprint 24.

---

## GAP-23-02: Authenticated Admin Smoke Not Yet Re-Run

The Sprint 22 smoke showed 403s for all admin endpoints. Sprint 23 fixes the code but does not re-run the smoke against the live EC2 (pending deployment). The smoke result will be verified in Sprint 24.

---

## GAP-23-03: PSL Fixtures Not Yet Available

PSL fixtures are not expected until ~July/August 2026. Parse PSL ingestion will return `sourceEmpty: true`. No action required until fixtures are available.

---

## GAP-23-04: Provider Keys Should Be Rotated

`apps/api/.env` contains trial/discovery API keys used during Sprints 10–14. The file is not tracked in git. Keys should be rotated if they were ever shared outside local development.

**Owner action:** Rotate provider keys if any were shared in Slack/email/issues.

---

## Resolved from Sprint 22

- **GAP-22-01:** `@Roles('ADMIN')` causing 403 for PSL_ADMIN — FIXED in Sprint 23
- **Pre-existing `.env` tracking concern** — CLEARED (file not tracked, correctly gitignored)
