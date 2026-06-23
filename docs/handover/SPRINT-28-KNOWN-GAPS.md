# Sprint 28: Known Gaps

**Date:** 2026-06-23
**Sprint:** 28

PSL remains INACTIVE. PSL not activated. Wallet SANDBOX. NON-FINANCIAL. No real-money.

---

## Resolved Gaps

| ID | Description | Status |
|---|---|---|
| GAP-27-01 | No user-to-club DB FK | RESOLVED — ClubMembership table |
| GAP-27-02 | No user-to-sponsor DB FK | RESOLVED — SponsorMembership table |

---

## Active Gaps (Carry-forward)

| ID | Description | Impact | Next Sprint |
|---|---|---|---|
| GAP-28-01 | Staging migration PENDING_OWNER_AUTHORIZATION — no prod deployment | Staging does not yet enforce DB scoping (old version still running) | Next deploy cycle |
| GAP-28-02 | No admin UI for membership assignment | Memberships must be inserted via SQL | Post-Sprint 28 |
| GAP-28-03 | Fan-club association not implemented | Fan count placeholder in club portal | Post-Sprint 28 |
| GAP-28-04 | Audience segmentation still PLANNED | `audienceStatus: 'PLANNED'` returned | Post-Sprint 28 |
| GAP-28-05 | Asset management still PLANNED | `assetsStatus: 'PLANNED'` returned | Post-Sprint 28 |
| GAP-28-06 | Multi-club admin (one CLUB_ADMIN → multiple clubs) | ClubMembership table supports it but service uses `findFirst` | Post-Sprint 28 |

---

## Not Gaps (By Design)

- `getBillingPlaceholder()` always returns INVOICE_ONLY — **by design** (ADR-031). No wallet production. Non-financial.
- `getSponsorRewards()` always returns `isFinancial: false` — **by design** (non-financial constraint).
- No real-money flows — **by design**.
- PSL season not activated — **by design** (safety constraint).

---

## Deferred

- Staging smoke: PENDING_OWNER_AUTHORIZATION (no staging deployment performed in Sprint 28)
- No production deployment
