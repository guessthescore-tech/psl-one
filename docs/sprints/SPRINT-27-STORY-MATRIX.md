# Sprint 27 — Story Matrix

**Date:** 2026-06-23  
**Status:** COMPLETE  

---

## Stories

| Story | Title | Status |
|-------|-------|--------|
| S27-01 | ClubPortalModule backend (10 endpoints) | DONE |
| S27-02 | SponsorPortalModule backend (11 endpoints) | DONE |
| S27-03 | ADR-031 sponsor billing boundary | DONE |
| S27-04 | Close 13 API_PENDING items in portal clients | DONE |
| S27-05 | 3 staging smoke tools | DONE |
| S27-06 | 12 documentation files | DONE |
| S27-07 | Experience test suite additions | DONE |

---

## Deliverable Count

| Category | Count |
|----------|-------|
| Backend modules | 2 (ClubPortalModule, SponsorPortalModule) |
| API endpoints | 21 (10 club + 11 sponsor) |
| ADRs | 1 (ADR-031) |
| API_PENDING items resolved | 13 |
| Smoke tools | 3 |
| Documentation files | 12 |
| Database migrations | 0 |

---

## Safety Matrix

| Constraint | Status |
|-----------|--------|
| PSL INACTIVE | CONFIRMED — PSL has NOT been activated |
| Wallet SANDBOX | CONFIRMED — no wallet production |
| NON-FINANCIAL rewards | CONFIRMED — isFinancial: false enforced |
| INVOICE_ONLY billing | CONFIRMED — ADR-031 |
| No cron/scheduler | CONFIRMED — no @Cron decorators added |
| No real-money | CONFIRMED |
| No production ingestion | CONFIRMED |

---

## Test Coverage

- `apps/api/src/club-portal/club-portal.service.spec.ts` — 13+ test cases
- `apps/api/src/club-portal/club-portal.controller.spec.ts` — 9+ test cases
- `apps/api/src/sponsor-portal/sponsor-portal.service.spec.ts` — 15+ test cases
- `apps/api/src/sponsor-portal/sponsor-portal.controller.spec.ts` — 9+ test cases
- `apps/experience/src/lib/experience.spec.ts` — Sprint 27 describe blocks added

---

## Known Gaps Register

GAP-27-01 through GAP-27-08 documented in SPRINT-27-KNOWN-GAPS.md.
