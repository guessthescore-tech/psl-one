# Sprint 27 — Non-Financial Sponsor Reward Boundary

**Date:** 2026-06-23  
**Status:** ENFORCED  

---

## Policy

All sponsor rewards on the PSL One platform are **non-financial**.

No cash prizes. No cash payouts. No real-money rewards. No no cash of any kind
is transferred through the platform to fans.

Reward types are limited to:
- Fan Points (in-platform currency, non-financial)
- Digital Badges
- Digital Experiences (exclusive content, virtual items)
- Fan Value Credits (non-financial engagement points)

---

## Enforcement Points

### API Layer

The `getSponsorRewards` endpoint in `SponsorPortalService` appends `isFinancial: false`
to every `RewardDefinition` object before returning it:

```typescript
return rewards.map((r) => ({ ...r, isFinancial: false }));
```

### Billing Boundary

The `getBillingPlaceholder` endpoint returns:
```json
{
  "billingStatus": "INVOICE_ONLY",
  "isFinancial": false,
  "paymentProvider": null
}
```

No payment processing exists in the codebase. No chargeCard, processPayment,
createPayment, or walletProduction operations are implemented.

### Frontend

`SponsorReward` interface in `sponsor-portal-api.ts` declares `isFinancial: false`
as a literal type, ensuring TypeScript prevents truthy financial flags.

---

## ADR Reference

ADR-031 documents the billing boundary decision:
- Option A (invoice-only) CHOSEN
- Option B (payment provider) DEFERRED pending legal/POPIA/security review
- Option C (credits ledger) FUTURE

---

## Compliance Notes

PSL One does not hold a payment service provider licence. Implementing financial
reward processing before regulatory clearance would violate compliance requirements.
All sponsor financial obligations are handled off-platform via invoice.
