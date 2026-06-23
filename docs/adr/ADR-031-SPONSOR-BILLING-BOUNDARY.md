# ADR-031 — Sponsor Billing Boundary

**Status:** ACCEPTED  
**Date:** 2026-06-23  
**Author:** PSL One Principal Backend Lead  
**Sprint:** 27  

---

## Context

SponsorPortalModule introduces sponsor-facing API endpoints including a billing information
endpoint. The platform must define an explicit boundary around sponsor billing to ensure:

1. No payment processing is implemented in the platform at this stage.
2. No wallet production flows are triggered.
3. Sponsor financial obligations remain off-platform (invoice-only).
4. All rewards are non-financial (points, badges, digital experiences).
5. The system is safe for beta operations without engaging financial infrastructure.

PSL One does not currently hold a payment service provider licence or financial services
regulatory clearance. Implementing payment processing before legal and security review
would violate compliance requirements.

---

## Decision

**Option A — Invoice-Only Billing (CHOSEN)**

The `/sponsor-portal/billing-placeholder` endpoint returns a static response:

```json
{
  "billingStatus": "INVOICE_ONLY",
  "message": "No payment processing. Invoice-only. See ADR-031.",
  "adr": "ADR-031",
  "isFinancial": false,
  "paymentProvider": null
}
```

- **No payment processing** is implemented anywhere in the platform.
- **No wallet production** integration — wallet remains in sandbox mode only.
- Billing between sponsors and PSL is handled entirely **off-platform** via traditional invoice.
- The `isFinancial: false` flag is enforced on all `RewardDefinition` objects returned by the API.
- **No real-money** transactions occur.
- Campaign creation is DRAFT status only — no automatic activation.

**Option B — Payment Provider Integration (DEFERRED)**

Integration with a payment provider (e.g. Peach Payments, PayFast, Stripe) is deferred.
This requires:
- Legal review and financial services licensing
- POPIA compliance for payment data
- Security penetration testing of payment flows
- PCI-DSS scoping
- Signed commercial agreements with payment providers

This option is **deferred** pending owner authorisation and regulatory clearance.

**Option C — Credits Ledger (FUTURE)**

A sponsor credits ledger for pre-paid campaign budgets is a future consideration.
This would require the same legal and compliance prerequisites as Option B, plus
accounting integration. Planned for a future sprint post-licensing.

---

## Consequences

- Sponsors interact with the platform via DRAFT campaigns only.
- All sponsor rewards are non-financial: points, badges, digital experiences.
- Billing for sponsorship contracts occurs via invoice outside the platform.
- The billing placeholder endpoint is clearly labelled as non-financial.
- No chargeCard, processPayment, walletProduction, or createPayment operations exist.
- Sprint 28 may introduce a credits tracking model (non-transactional ledger only).
- Any move to payment processing requires a new ADR, legal sign-off, and security review.

---

## Safety Constraints (NON-NEGOTIABLE)

- PSL season remains inactive (PSL INACTIVE) — no production activation.
- Wallet remains in sandbox mode — no wallet production.
- All sponsor rewards are non-financial — no cash payouts, no real-money.
- Campaign status on creation is DRAFT — never ACTIVE, never PUBLISHED automatically.
- Sponsor billing is invoice-only — no payment processing, no financial settlement.

---

## References

- [ADR-030 — Sports Data Provider Boundary](ADR-030-SPORTS-DATA-PROVIDER-BOUNDARY.md)
- [SPRINT-27-NON-FINANCIAL-SPONSOR-REWARD-BOUNDARY.md](../portals/SPRINT-27-NON-FINANCIAL-SPONSOR-REWARD-BOUNDARY.md)
- [SPRINT-27-API-CONTRACT-CLOSURE.md](../portals/SPRINT-27-API-CONTRACT-CLOSURE.md)
