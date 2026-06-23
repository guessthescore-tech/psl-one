# Sprint 27 — Handover Document

**Date:** 2026-06-23  
**Status:** COMPLETE  
**Outcome:** CONDITIONAL_GO  

---

## What Was Built

- **ClubPortalModule** — 10 endpoints (9 GET + 1 POST), CLUB_ADMIN + PSL_ADMIN roles
- **SponsorPortalModule** — 11 endpoints (10 GET + 1 POST), SPONSOR + PSL_ADMIN roles
- **ADR-031** — Sponsor billing boundary (invoice-only, no payment processing)
- **13 API_PENDING items** closed → 0 remaining in portal clients
- **3 smoke tools** for staging validation
- **12 documentation files**

---

## Safety Status

- **PSL INACTIVE** — PSL season has NOT been activated. Do not activate.
- **Wallet SANDBOX** — Wallet integration remains in sandbox mode. No wallet production.
- **NON-FINANCIAL** — All rewards are non-financial (points, badges, digital experiences). No cash payouts.
- **DRAFT campaigns only** — Campaigns are never auto-activated
- **No real-money** — No financial transactions implemented
- **No scheduled ingestion** — Parse PSL ingestion is manual-only
- **No cron jobs added**

---

## Known Gaps

| Gap | Description | Status | Target |
|-----|-------------|--------|--------|
| GAP-27-01 | No user-to-club DB scoping | OPEN | Sprint 28 |
| GAP-27-02 | No user-to-sponsor DB scoping | OPEN | Sprint 28 |
| GAP-27-03 | Audience segmentation | PLANNED | Sprint 28 |
| GAP-27-04 | Asset management | PLANNED | Sprint 28 |
| GAP-27-05 | CLUB_ADMIN staging JWT | PENDING_TOKEN | Owner action |
| GAP-27-06 | SPONSOR staging JWT | PENDING_TOKEN | Owner action |
| GAP-27-07 | Billing off-platform | ADR-031 | Permanent boundary |
| GAP-27-08 | PSL SOURCE_EMPTY | EXPECTED | ~July/August 2026 |

---

## Test Counts

- API tests: Previous count + new club-portal and sponsor-portal spec files
- Experience tests: Sprint 27 describe blocks added to experience.spec.ts
- All previous tests must remain green

---

## Next Steps

1. Owner review of PR
2. CI gates pass
3. Merge to main
4. Sprint 28: User-club/sponsor DB scoping, audience segmentation, asset management
