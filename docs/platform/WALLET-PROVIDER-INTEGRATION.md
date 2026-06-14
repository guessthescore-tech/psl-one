# PSL One — Wallet Provider Integration Guide

> **Historical Implementation Record** — This document was created during Sprint delivery as a working reference. It may be superseded by content in `docs/architecture/`, `docs/engineering/`, `docs/reference/`, or `docs/domain/`. Do not use as the canonical source for system behaviour.


**Status:** Sandbox only — PRODUCTION_DISABLED  
**Sprint:** 2 (STORY-37)

> **Safety:** PSL One does not hold customer funds. The wallet integration layer connects fans to an external wallet provider. All current operations use a deterministic sandbox adapter that generates fake refs without making outbound calls.

---

## Current State

The wallet integration is deliberately minimal for Sprint 2:

- `SiliconEnterpriseSandboxWalletAdapter` — generates deterministic sandbox refs
- Zero HTTP calls to any external provider
- `WalletProvider` table holds provider configuration (sandbox + production configs stored separately)
- Fan wallet links tracked in `FanWalletLink` (unique per fan per provider)
- Transaction log in `FanWalletTransaction` (sandbox entries only)

---

## Architecture

### Adapter Pattern

```typescript
// The service wraps provider calls through an adapter interface.
// Only the sandbox adapter is implemented in Sprint 2.

class SiliconEnterpriseSandboxWalletAdapter {
  generateRef(fanUserId: string, providerSlug: string): string {
    // Deterministic: same inputs → same output (safe for test reproducibility)
    return `SANDBOX-${providerSlug.toUpperCase()}-${fanUserId.slice(0, 8)}-${Date.now()}`;
  }
  processWebhook(payload: unknown): { status: string; ref: string } {
    // Accepts any payload, returns a canned sandbox response
    return { status: 'SANDBOX_PROCESSED', ref: `WEBHOOK-${Date.now()}` };
  }
}
```

For Sprint 3, replace the adapter body with real HTTP calls to the chosen provider. The controller and service contracts do not change.

### Fan Wallet Flow

```
Fan → POST /fan/wallet/link/start  { providerSlug }
  → WalletIntegrationService.startWalletLink(fanUserId, providerSlug)
    1. Find provider by slug; guard: provider.status === SANDBOX|STAGING|PRODUCTION
    2. Find or create FanWalletLink (status: PENDING)
    3. Generate providerRef via adapter
    4. Return { linkId, providerRef, redirectUrl (null in sandbox) }

Fan → POST /fan/wallet/link/confirm  { providerSlug, providerToken }
  → WalletIntegrationService.confirmWalletLink(fanUserId, providerSlug, providerToken)
    1. Find link; guard: status === PENDING
    2. Adapter processes providerToken
    3. Update link status → LINKED, set linkedAt
    4. Return link with sandbox safety copy

Fan → POST /fan/wallet/unlink  { providerSlug }
  → WalletIntegrationService.unlinkWallet(fanUserId, providerSlug)
    1. Find link; guard: status === LINKED
    2. Update → UNLINKED, set unlinkedAt
    3. Return confirmation
```

### Admin Sandbox Webhook

```
Admin → POST /admin/wallet/webhooks/:providerSlug/sandbox  { payload }
  → WalletIntegrationService.processSandboxWebhook(providerSlug, payload)
    1. Find provider; create transaction log entry
    2. Adapter.processWebhook(payload)
    3. Return { processed: true, sandboxRef }
```

---

## Database Schema

```
WalletProvider
  id, slug (unique), name, status (SANDBOX|STAGING|PRODUCTION|DEPRECATED)
  configJson (production config — admin-only, never returned to fans)
  sandboxConfigJson (sandbox config)

FanWalletLink
  id, fanUserId, providerId (FK→WalletProvider)
  status (PENDING|LINKED|UNLINKED|SUSPENDED|FAILED)
  providerRef (unique per provider — the external provider's fan identifier)
  linkedAt, unlinkedAt
  @@unique([fanUserId, providerId]) — one link per fan per provider

FanWalletTransaction
  id, fanUserId, linkId (FK→FanWalletLink)
  transactionType (DEPOSIT|WITHDRAWAL|REWARD_CREDIT|REWARD_DEBIT|ADJUSTMENT|FEE)
  status (PENDING|COMPLETED|FAILED|REVERSED)
  amountPoints — points value (non-cash; for audit only)
  idempotencyKey (unique) — prevents duplicate transaction creation
  providerTxRef — external transaction reference (sandbox ref in MVP)
  metadataJson — raw provider payload
```

---

## Sprint 3 Production Upgrade Path

1. Choose a wallet provider (Silicon Enterprise or alternative)
2. Implement `ProductionWalletAdapter` implementing the same interface as `SiliconEnterpriseSandboxWalletAdapter`
3. Swap adapter in `WalletIntegrationModule` provider registration (or inject based on provider record's `status`)
4. Update provider record in DB: `status → PRODUCTION`, populate `configJson` with production credentials (never committed to git — stored in AWS Secrets Manager)
5. Enable `/fan/wallet` route on the production domain
6. Compliance gate: KYC/AML review must pass before enabling for real fans
7. Update AdminOperations capability status from `PRODUCTION_DISABLED` → `PRODUCTION_READY`

---

## Safety Requirements (must remain in code and UI)

All wallet API responses must include:

```json
{
  "safetyNote": "Wallet integration is operating in sandbox mode. No real financial transactions are processed.",
  "disclaimer": "Wallet services are provided by an external wallet provider. PSL One does not hold customer funds directly."
}
```

Fan Value points credited via `REWARD_CREDIT` transactions are non-cash. The `amountPoints` field is for audit/display only and has no monetary value.
