# Sprint 27 — Owner Review Guide

**Date:** 2026-06-23  

---

## Before You Review

**PSL remains INACTIVE** — do not activate the PSL season during review.
**Wallet is SANDBOX** — no wallet production has been enabled.
All rewards are **NON-FINANCIAL** — no real-money operations.
No billing implementation — sponsor billing is **INVOICE_ONLY** per ADR-031.

---

## What to Review

### 1. RBAC Correctness

- `/club-portal/*` routes must return 403 for FAN and SPONSOR tokens
- `/sponsor-portal/*` routes must return 403 for FAN and CLUB_ADMIN tokens
- PSL_ADMIN must access both portals

Run: `node tools/staging/sprint-27-club-sponsor-rbac-smoke.mjs`

### 2. API Endpoint Coverage

Verify 10 club-portal + 11 sponsor-portal endpoints respond (not 5xx):

Run:
```bash
node tools/staging/sprint-27-club-portal-api-smoke.mjs
node tools/staging/sprint-27-sponsor-portal-api-smoke.mjs
```

Expected responses: `PASS`, `API_SCOPE_PENDING`, `PENDING_TOKEN` (no UNEXPECTED_5XX).

### 3. Billing Placeholder

GET `/sponsor-portal/billing-placeholder` must return:
```json
{ "billingStatus": "INVOICE_ONLY", "isFinancial": false, "paymentProvider": null }
```
No payment processing must exist.

### 4. API_PENDING Closure

Verify no `API_PENDING: true` comments remain in:
- `apps/experience/src/lib/club-portal-api.ts`
- `apps/experience/src/lib/sponsor-portal-api.ts`

### 5. Test Gates

All CI checks must be green. Check PR CI status.

---

## Owner Decision Gate

**CONDITIONAL_GO** — approve when:
- [ ] CI all green
- [ ] RBAC smoke confirms forbidden responses
- [ ] No UNEXPECTED_5XX on either portal
- [ ] ADR-031 reviewed and accepted
- [ ] PR approved

**HOLD** if:
- Any 5xx on portal endpoints
- RBAC bypass (wrong role gets 200)
- API_PENDING comments still present
- CI failures
