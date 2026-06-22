# Sprint 20 — Beta Go/No-Go

## Summary

Sprint 20 executes the owner-authorised beta EC2 deployment and staging smoke validation for Sprint 18/19 admin workflow.

---

## Go Criteria

| Criterion | Status |
|-----------|--------|
| Owner authorised EC2 deployment | GO |
| Deploy workflow triggered with correct SHA | GO |
| API /health/ready PASS post-deployment | GO |
| Built-in smoke suite PASS | GO |
| Sprint 19 tools smoke PASS (or WARN for source-empty) | PENDING (requires ADMIN_TOKEN) |
| PSL pre-flight CONDITIONAL_GO or NO_GO (not ACTIVATED) | GO (workflow smoke PASS) |
| No provider key exposed | GO |
| No PSL activation | GO |
| No real-money functionality | GO |
| Migration count unchanged (42) | GO |
| Wallet sandbox-only | GO |

---

## No-Go Criteria

Any of the following would be a NO-GO:

- API /health/ready returns non-200 after retries
- Smoke suite detects 5xx on any admin route
- Pre-flight returns GO and PSL is activated (should never happen — pre-flight is read-only)
- Provider key appears in smoke output
- Unintended DB writes detected
- Migration fails on EC2

---

## Overall Status

**CONDITIONAL_GO** — EC2 deployment PASS, API readiness PASS, built-in smoke PASS. Manual Sprint 19 smoke tools pending ADMIN_TOKEN acquisition (see Known Gaps).

---

## Remaining Owner Gates

1. Manual smoke tools require ADMIN_TOKEN — owner must log in to beta API after deployment to obtain JWT
2. PSL fixtures unavailable until ~July/August 2026 — source-empty is expected on ingestion tools
3. Write smoke disabled by default — owner may opt in with `ALLOW_WRITE_SMOKE=true` at their discretion

---

## Platform Safety Reminders

- PSL remains **INACTIVE**. World Cup 2026 is the active context.
- Wallet remains **SANDBOX**. No real-money transactions.
- Fixture publishing is **SEPARATE** from PSL activation.
- No scheduled ingestion is active.
- No production ingestion is active.
