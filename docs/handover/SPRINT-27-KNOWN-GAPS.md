# Sprint 27 — Known Gaps

**Date:** 2026-06-23  

---

## Safety Status

PSL remains INACTIVE — the PSL season has not been activated.
Wallet remains in sandbox mode — no wallet production.
All rewards are non-financial — no real-money, no cash payouts.

---

## Gap Register

### GAP-27-01: No User-to-Club Database Scoping

**Impact:** Club-portal endpoints require `?clubId=` query param manually.
No automatic scoping from authenticated user to their club.
**Root Cause:** `User` model has no club FK in schema.
**Workaround:** `clubId` query param with `API_SCOPE_PENDING` response when absent.
**Resolution Target:** Sprint 28 — Add user-club association table.

---

### GAP-27-02: No User-to-Sponsor Database Scoping

**Impact:** Sponsor-portal endpoints require `?sponsorId=` query param manually.
No automatic scoping from authenticated user to their sponsor organisation.
**Root Cause:** `User` model has no sponsor FK in schema.
**Workaround:** `sponsorId` query param with `API_SCOPE_PENDING` response when absent.
**Resolution Target:** Sprint 28 — Add user-sponsor association table.

---

### GAP-27-03: Audience Segmentation Not Implemented

**Impact:** `/sponsor-portal/audiences` returns `PLANNED` placeholder.
No fan audience segments are computable yet.
**Resolution Target:** Sprint 28 — Fan behaviour data aggregation.

---

### GAP-27-04: Asset Management Not Implemented

**Impact:** `/sponsor-portal/assets` returns `PLANNED` placeholder.
No sponsor creative asset storage implemented.
**Resolution Target:** Sprint 28 — S3 asset upload integration.

---

### GAP-27-05: CLUB_ADMIN Staging JWT PENDING_TOKEN

**Impact:** Cannot smoke-test CLUB_ADMIN role on staging EC2.
**Resolution Target:** Owner must provision a CLUB_ADMIN user and generate JWT.

---

### GAP-27-06: SPONSOR Staging JWT PENDING_TOKEN

**Impact:** Cannot smoke-test SPONSOR role on staging EC2.
**Resolution Target:** Owner must provision a SPONSOR user and generate JWT.

---

### GAP-27-07: Sponsor Billing Off-Platform (Invoice-Only)

**Impact:** No in-platform billing or payment processing.
Sponsor financial settlement handled via traditional invoice.
**Governance:** ADR-031 — invoice-only billing is a deliberate boundary.
**Resolution:** No resolution — permanent boundary pending legal/regulatory clearance.

---

### GAP-27-08: PSL Fixture Schedule SOURCE_EMPTY

**Impact:** PSL fixture ingestion returns empty result (SOURCE_EMPTY).
This is expected — PSL 2026/27 season fixtures not yet available from data sources.
**Expected Resolution:** ~July/August 2026 when PSL publishes season schedule.
