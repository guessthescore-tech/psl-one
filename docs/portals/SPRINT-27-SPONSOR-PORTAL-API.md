# Sprint 27 — Sponsor Portal API

**Status:** IMPLEMENTED  
**Date:** 2026-06-23  

---

## Overview

SponsorPortalModule provides authenticated API endpoints for sponsor organisations.
Role access: `SPONSOR`, `PSL_ADMIN`.

PSL remains INACTIVE. Wallet is SANDBOX only. All sponsor rewards are NON-FINANCIAL.
Billing is INVOICE_ONLY per ADR-031. No payment processing.

---

## Non-Financial Enforcement

All rewards returned by the API include `isFinancial: false`:
```json
{ "id": "...", "title": "...", "rewardType": "FAN_POINTS", "isFinancial": false }
```

No cash payouts. No real-money. Points, badges, and digital experiences only.

---

## RBAC Table

| Role | Access |
|------|--------|
| `PSL_ADMIN` | Full access to all sponsor-portal endpoints |
| `SPONSOR` | Full access to all sponsor-portal endpoints |
| `CLUB_ADMIN` | FORBIDDEN (403) |
| `FAN` | FORBIDDEN (401/403) |
| Unauthenticated | FORBIDDEN (401) |

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/sponsor-portal/overview` | Sponsor overview: profile, campaign count, reward count |
| GET | `/sponsor-portal/profile` | Sponsor profile |
| GET | `/sponsor-portal/campaigns` | All sponsor campaigns |
| POST | `/sponsor-portal/campaigns/drafts` | Create campaign draft (DRAFT status only, never ACTIVE) |
| GET | `/sponsor-portal/audiences` | Audience placeholder (PLANNED Sprint 28) |
| GET | `/sponsor-portal/activations` | Campaign analytics snapshots |
| GET | `/sponsor-portal/rewards` | Reward definitions (all isFinancial: false) |
| GET | `/sponsor-portal/analytics` | Aggregate analytics totals |
| GET | `/sponsor-portal/clubs` | Clubs associated via campaigns |
| GET | `/sponsor-portal/assets` | Asset placeholder (PLANNED Sprint 28) |
| GET | `/sponsor-portal/billing-placeholder` | INVOICE_ONLY billing info (ADR-031) |

---

## Billing Placeholder Response

```json
{
  "billingStatus": "INVOICE_ONLY",
  "message": "No payment processing. Invoice-only. See ADR-031.",
  "adr": "ADR-031",
  "isFinancial": false,
  "paymentProvider": null
}
```

See ADR-031 for full billing boundary decision.

---

## Campaign Draft Creation

POST `/sponsor-portal/campaigns/drafts` always creates with `status: 'DRAFT'`.
Campaigns are never set to ACTIVE or PUBLISHED automatically.
Manual approval by PSL_ADMIN is required for any status change.
