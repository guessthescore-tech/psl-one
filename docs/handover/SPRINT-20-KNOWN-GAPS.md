# Sprint 20 — Known Gaps

## Gap 1: ADMIN_TOKEN Must Be Obtained Manually

**Status:** MANUAL STEP REQUIRED

Admin JWT required by Sprint 19 smoke tools cannot be automated without a credentials management system. Owner must:

1. Wait for deployment to complete
2. Call `POST /auth/login` with an admin account on `api.staging.pslone.co.za`
3. Extract the `accessToken` from the response
4. Set `export ADMIN_TOKEN=<token>` before running Sprint 19 tools

This is by design for the beta phase. Automated token provisioning is a future sprint item.

---

## Gap 2: PSL Fixtures Unavailable Until ~July/August 2026

**Status:** External dependency — non-blocking

Parse PSL (psl.co.za) has not published the 2026/27 fixture schedule. All ingestion and pre-flight tools will return:

- `sourceEmpty: true` (WARN, not FAIL)
- PSL pre-flight: likely NO_GO due to `fixtures_exist` check failing

This is expected until:
1. psl.co.za publishes the 2026/27 schedule
2. Admin runs Parse PSL ingestion via `/admin/data-provider/parse-psl`
3. Admin publishes fixtures via `/admin/fixtures/imported`

---

## Gap 3: Write Smoke Disabled by Default

**Status:** By design

All Sprint 19 smoke tools default to `ALLOW_WRITE_SMOKE=false`. The owner may opt in with:

```bash
export ALLOW_WRITE_SMOKE=true
```

This enables fixture publication smoke only (not PSL activation, never automated).

---

## Gap 4: PARSE_API_KEY SSM Presence Unverified

**Status:** Assumed from Sprint 17 deployment

`PARSE_API_KEY` was set in SSM during Sprint 17 runbook. Has not been reverified since Sprint 18 merge. Post-deployment env check should confirm its presence (redacted output only).

---

## Gap 5: No Automated Staging Smoke in CI

**Status:** Deferred

Sprint 19/20 smoke tools are manual-only. Full CI integration with staging smoke is a future sprint item.
