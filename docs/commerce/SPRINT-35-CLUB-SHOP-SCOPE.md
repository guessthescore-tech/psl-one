# Sprint 35 — Club Shop Scope

## Current State: CATALOGUE_ONLY

Club shops are live in catalogue-only mode. Fans can browse merchandise listings.
No checkout, no payment processing, no cart functionality.

## Model: ClubShopProduct

| Field               | Type             | Notes                                          |
|---------------------|------------------|------------------------------------------------|
| id                  | UUID             | Primary key                                    |
| teamId              | String           | FK → teams.id                                  |
| name                | String           | Product name                                   |
| slug                | String           | URL-friendly identifier (unique per team)      |
| description         | String?          | Product description                            |
| price               | Decimal          | Display price (no payment processing)          |
| currency            | String           | Default: ZAR                                   |
| status              | ShopProductStatus| PUBLISHED / DRAFT / ARCHIVED                   |
| shopCommerceStatus  | ShopCommerceStatus | CATALOGUE_ONLY at launch                     |
| imageUrl            | String?          | CDN URL (no blobs in DB)                       |
| stockCount          | Int?             | Display only — not enforced at purchase        |

## API Routes (Already Implemented)

| Method | Path                                      | Auth       | Description              |
|--------|-------------------------------------------|------------|--------------------------|
| GET    | /club-experience/:slug/shop               | Public     | Fan shop listing         |
| GET    | /club-experience/:slug/shop/:productSlug  | Public     | Fan product detail       |
| GET    | /club-experience/admin/:id/shop/readiness | PSL_ADMIN  | Admin shop readiness     |

## Experience Pages

| Page                              | Auth       | Description                       |
|-----------------------------------|------------|-----------------------------------|
| `/shop`                           | Public     | All-clubs shop discovery          |
| `/club/shop`                      | CLUB_ADMIN | Club portal shop management       |
| `/club/shop/[productSlug]`        | CLUB_ADMIN | Club portal product detail        |
| `/admin/shop`                     | PSL_ADMIN  | Admin shop overview               |

## Commerce Enforcement

All fan-facing shop routes return a `commerceNote` field:
```json
{
  "commerceNote": "Checkout not enabled in MVP. Club shopfront ready for Sprint 3 commerce integration."
}
```

No purchase buttons exist in the UI. No cart state. No basket API.

## Path to Live Checkout

1. Owner gate OG-35-COMMERCE must be authorised.
2. PCI DSS assessment completed.
3. Payment gateway integrated (Yoco recommended for SA market).
4. `ShopCommerceStatus` updated to `LIVE_CHECKOUT` per-product.
5. Basket, checkout, and order management implemented.
6. See ADR-033 for full commerce boundary decision.
