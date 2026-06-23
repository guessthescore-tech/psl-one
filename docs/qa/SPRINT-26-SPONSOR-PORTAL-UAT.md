# Sprint 26 — Sponsor Portal UAT

**Date:** 2026-06-23
**Sprint:** 26 (Controlled User Testing)
**Overall Status:** CONDITIONAL_PASS (pending SPONSOR_ADMIN staging smoke)

PSL: INACTIVE | Wallet: SANDBOX | Sponsor rewards: NON_FINANCIAL | Billing: ADR pending

---

## Important Notes

- **SPONSOR_ADMIN role not yet provisioned on staging (PENDING_TOKEN).** All results below are
  based on local/preview visual review. Staging RBAC smoke requires SPONSOR_ADMIN JWT (GAP-26-04).
- Sponsor portal API contracts are frontend-only — 13 API endpoints are API_PENDING (GAP-26-02).
  Pages render with mock/static data until backend implementation is complete.
- **Billing page is a placeholder.** A Sponsor Billing ADR must be written before implementation
  begins (GAP-26-06). The billing page URL is `/sponsor/billing-placeholder` to make this
  explicit.

---

## Validation Checklist

| Check                                              | Result         | Notes                                        |
|----------------------------------------------------|----------------|----------------------------------------------|
| Sponsor rewards are non-financial                  | PASS           | NON_FINANCIAL label; no cash payout language |
| No cash payout language                            | PASS           | Confirmed in spec and portal source          |
| No betting/odds/wager language                     | PASS           | Confirmed in spec and portal source          |
| Billing placeholder clearly labelled ADR pending   | PASS           | `/sponsor/billing-placeholder` URL; ADR note |
| No admin JWT tokens exposed                        | PASS           | No tokens in frontend source                 |
| No provider keys exposed                           | PASS           | API keys are backend-only                    |
| SPONSOR_ADMIN staging smoke                        | PENDING_TOKEN  | JWT not yet provisioned (GAP-26-04)          |

---

## Route Matrix

| Route                          | Expected Behaviour                                | Status         | Notes                              |
|--------------------------------|---------------------------------------------------|----------------|------------------------------------|
| `/sponsor`                     | Root; redirect to overview or show sponsor dash   | PASS           | Shell renders                      |
| `/sponsor/overview`            | Campaign metrics, active audiences, recent stats  | PASS           | Renders with mock data             |
| `/sponsor/profile`             | Sponsor company profile and branding              | PASS           | Profile UI renders                 |
| `/sponsor/campaigns`           | Campaign list (active, draft, completed)          | API_PENDING    | Backend not yet implemented        |
| `/sponsor/campaigns/new`       | New campaign creation form                        | API_PENDING    | Backend not yet implemented        |
| `/sponsor/audiences`           | Fan audience segments for targeting               | API_PENDING    | Backend not yet implemented        |
| `/sponsor/activations`         | Campaign activation management                    | API_PENDING    | Backend not yet implemented        |
| `/sponsor/rewards`             | NON_FINANCIAL reward definitions and status       | PASS           | Non-financial copy confirmed       |
| `/sponsor/analytics`           | Campaign performance analytics                    | API_PENDING    | Backend not yet implemented        |
| `/sponsor/clubs`               | Sponsor-club partnership management               | API_PENDING    | Backend not yet implemented        |
| `/sponsor/assets`              | Creative asset management (logos, banners)        | API_PENDING    | Backend not yet implemented        |
| `/sponsor/billing-placeholder` | Billing placeholder — ADR required before impl    | PASS           | Placeholder clearly labelled       |
| `/sponsor/settings`            | Sponsor account settings                          | PASS           | Settings UI renders                |

**Total routes:** 13

---

## Key Safety Verifications

### NON_FINANCIAL Sponsor Rewards
- Sponsor rewards are `NON_FINANCIAL` — no cash payouts, no monetary prizes.
- Reward language on `/sponsor/rewards` uses points, digital goods, and experiences only.
- No language suggesting betting, wagering, odds, or stakes appears in the sponsor portal.

### Billing Placeholder
- The billing page is intentionally a placeholder with a clear "ADR Required" notice.
- URL path `/sponsor/billing-placeholder` signals its incomplete status.
- A Sponsor Billing ADR must be authored and reviewed before implementation proceeds (GAP-26-06).

### Non-Financial Language Confirmation
Tested phrases that must NOT appear:
- "cash payout" — NOT present
- "betting" — NOT present
- "wager" — NOT present
- "odds" — NOT present
- "stake" — NOT present (in financial sense)
- "bookmaker" — NOT present

---

## Overall Status: CONDITIONAL_PASS

**Conditions for full PASS:**
1. SPONSOR_ADMIN JWT provisioned on staging (OWNER_GATE — GAP-26-04)
2. Sponsor portal API contracts backed by backend endpoints (Sprint 27 — GAP-26-02)
3. Sponsor Billing ADR authored and reviewed (GAP-26-06)
4. RBAC staging smoke completed for SPONSOR_ADMIN persona

**No blocker issues found. Sponsor portal is safe for controlled review.**
