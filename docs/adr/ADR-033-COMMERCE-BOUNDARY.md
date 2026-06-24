# ADR-033 — Commerce & Ticketing Boundary

**Status:** Accepted  
**Date:** 2026-06-24  
**Sprint:** Sprint 35

## Context

PSL One includes `ClubShopProduct` and `Ticket` models in the schema. Fans have shown
interest in purchasing club merchandise and match tickets through the platform. However,
introducing real money commerce requires:

1. Payment gateway integration (Yoco, Peach, Stripe, etc.)
2. PCI DSS compliance for cardholder data
3. South African consumer protection compliance (NCA, ECT Act)
4. Tax and invoicing infrastructure (VAT, SARS)
5. Fulfilment integration (delivery, inventory management)
6. Fraud risk and chargeback handling

None of these are in scope for the current sprint delivery phase.

## Decision

We adopt a **CATALOGUE_ONLY** commerce model at launch:

- `ClubShopProduct.shopCommerceStatus = CATALOGUE_ONLY` for all products.
- Fans can browse merchandise catalogues — no add-to-cart, no checkout.
- Ticket pages are informational — no seat selection, no payment.
- All shop and ticket pages display a clear "Catalogue Only — Checkout Coming Soon" notice.
- Commerce integration is explicitly deferred to a post-launch phase.

## Consequences

### Positive

- Platform can launch with full merchandise catalogue without payment compliance overhead.
- Club shops provide value (browsability, brand visibility) with zero commerce risk.
- Catalogue-first approach validates fan interest before committing to payment infrastructure.
- Clear boundary: no accidental commerce activation via misconfiguration.

### Negative

- Fans cannot purchase merchandise at launch — reduces perceived platform completeness.
- Must communicate clearly to clubs that checkout is not yet available.
- `ShopCommerceStatus.CATALOGUE_ONLY` must be enforced everywhere — no accidental ACTIVE status.

## Rejected Alternatives

### A — Full commerce at launch

**Rejected.** PCI DSS, NCA compliance, and fulfilment integration cannot be delivered
within the current sprint timeline. Scope creep risk is unacceptable.

### B — Redirect to club's own website for purchase

**Partially accepted for future.** External purchase links can be added to product cards
without any payment processing on PSL One. This is a low-risk enhancement for Sprint 36+.

### C — No shop at all

**Rejected.** `ClubShopProduct` model exists, clubs have content to showcase. Catalogue-only
provides value without compliance burden.

## Implementation Notes

- Model: `ClubShopProduct` with `ShopProductStatus.PUBLISHED` / `DRAFT` / `ARCHIVED`.
- Commerce status: `ShopCommerceStatus.CATALOGUE_ONLY` (default, enforced).
- Routes: `GET /club-experience/:slug/shop`, `GET /club-experience/:slug/shop/:productSlug`.
- Pages: `/shop`, `/club/shop`, `/admin/shop` — all display CATALOGUE_ONLY notice.
- Future: `ShopCommerceStatus.LIVE_CHECKOUT` requires owner gate OG-35-COMMERCE.

## Owner Gate Required Before Commerce Activation

- OG-35-COMMERCE: Owner must explicitly authorise commerce enablement.
- PCI DSS assessment must be complete.
- Payment gateway contract must be signed.
- Legal review of consumer protection obligations.
