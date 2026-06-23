# Sprint 27 — API Contract Implementation Plan

**Date:** 2026-06-23  
**Sprint:** 27  
**Status:** COMPLETED  

---

## Objective

Implement ClubPortalModule and SponsorPortalModule backend API contracts, closing all
13 API_PENDING items identified in the Sprint 26 portal frontend build.

---

## Safety Constraints

- PSL season remains INACTIVE — no production activation
- Wallet remains in SANDBOX only — no wallet production
- All rewards are NON-FINANCIAL — no cash payouts, no real-money
- Billing is INVOICE_ONLY — no payment processing (ADR-031)
- Campaign creation is DRAFT only — never ACTIVE automatically
- No scheduled ingestion, no production data provider activation

---

## Modules Implemented

### ClubPortalModule

- Controller: `apps/api/src/club-portal/club-portal.controller.ts`
- Service: `apps/api/src/club-portal/club-portal.service.ts`
- Module: `apps/api/src/club-portal/club-portal.module.ts`
- DTO: `apps/api/src/club-portal/club-portal.dto.ts`
- Roles: `CLUB_ADMIN`, `PSL_ADMIN`
- Endpoints: 10 (9 GET + 1 POST)

### SponsorPortalModule

- Controller: `apps/api/src/sponsor-portal/sponsor-portal.controller.ts`
- Service: `apps/api/src/sponsor-portal/sponsor-portal.service.ts`
- Module: `apps/api/src/sponsor-portal/sponsor-portal.module.ts`
- DTO: `apps/api/src/sponsor-portal/sponsor-portal.dto.ts`
- Roles: `SPONSOR`, `PSL_ADMIN`
- Endpoints: 11 (10 GET + 1 POST)

---

## Known Gaps

| Gap | Description | Target |
|-----|-------------|--------|
| GAP-27-01 | No user-to-club DB FK | Sprint 28 |
| GAP-27-02 | No user-to-sponsor DB FK | Sprint 28 |
| GAP-27-03 | Audience segmentation PLANNED | Sprint 28 |
| GAP-27-04 | Asset management PLANNED | Sprint 28 |
| GAP-27-05 | CLUB_ADMIN staging JWT PENDING_TOKEN | Owner action |
| GAP-27-06 | SPONSOR staging JWT PENDING_TOKEN | Owner action |
| GAP-27-07 | Billing off-platform (invoice-only) | ADR-031 |
| GAP-27-08 | PSL fixture schedule SOURCE_EMPTY | ~July/August 2026 |

---

## Architecture Decision

ADR-031 governs sponsor billing boundary: invoice-only, no payment processing.
