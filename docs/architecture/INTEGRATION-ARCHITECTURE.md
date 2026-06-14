# PSL One — Integration Architecture

**Purpose:** External provider integration patterns, adapter design, and readiness state  
**Audience:** Backend engineers, architects  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Integration Philosophy

All external provider integrations use an **adapter pattern**:

1. Define a TypeScript interface for the provider contract
2. Implement a sandbox adapter (local, no real API calls)
3. Production adapter is a separate implementation registered at startup via environment config
4. The application service depends on the interface only — never on a concrete provider class

This means the platform is built and tested without any real external API keys.

---

## Current Integration State

| Integration | Interface | Adapter | State |
|------------|-----------|---------|-------|
| Wallet / Payments | `WalletAdapter` | `SiliconEnterpriseSandboxWalletAdapter` | SANDBOX_ONLY |
| Football Data (live match) | `LiveMatchDataProvider` | Internal seed only | CONTRACT_REQUIRED |
| Notification delivery | `NotificationDeliveryAdapter` | Stub (DB-only) | PROVIDER_REQUIRED |
| Media CDN | `MediaCdnAdapter` | URL placeholder | PROVIDER_REQUIRED |
| Social OAuth | `OAuthAdapter` | Not started | PROVIDER_REQUIRED |
| Email (transactional) | Not defined | Not started | PROVIDER_REQUIRED |
| SMS | Not defined | Not started | PROVIDER_REQUIRED |

---

## Wallet Integration

### Interface

`WalletAdapter` (defined in `apps/api/src/wallet/wallet.adapter.ts`):

```typescript
interface WalletAdapter {
  linkWallet(userId: string, providerRef: string): Promise<WalletLink>;
  getBalance(userId: string): Promise<number>;
  // ... additional methods
}
```

### Sandbox Adapter

`SiliconEnterpriseSandboxWalletAdapter` — returns mock responses. Zero HTTP calls. Safe to call in any environment.

### Production Adapter

Not implemented. Requires:
- Signed contract with a regulated South African financial services provider
- KYC/AML integration
- POPIA compliance
- Sandbox → production provider credential swap

### `IntegrationProviderConfig`

Admin-managed table of provider configuration records. 9 entries seeded:

| Key | Provider | Status |
|-----|----------|--------|
| `wallet_primary` | Silicon Enterprise (sandbox) | SANDBOX |
| `live_match_data` | API-Football | NOT_CONFIGURED |
| `email_transactional` | — | NOT_CONFIGURED |
| `sms_delivery` | — | NOT_CONFIGURED |
| `push_notifications` | — | NOT_CONFIGURED |
| `media_cdn` | — | NOT_CONFIGURED |
| `social_oauth_google` | — | NOT_CONFIGURED |
| `social_oauth_apple` | — | NOT_CONFIGURED |
| `data_export` | — | NOT_CONFIGURED |

Viewable at `/admin/operations/providers`.

---

## Football Data Integration

### Current State

Live match data is entered manually by admins via:

- `POST /admin/match-centre/:sessionId/events` — add match events
- `POST /admin/match-centre/:sessionId/commentary` — add commentary
- `PUT /admin/fixtures/:id/status` — update fixture lifecycle state

### Planned Provider Integration

Target providers (decision not made):
- **Opta / Stats Perform** — primary choice for official PSL data
- **Sportradar** — alternative
- **API-Football** — lower-cost alternative

Integration would require:
1. Signed data agreement with PSL and the provider
2. Implementing a `LiveMatchDataProvider` adapter
3. Registering as the active provider via `IntegrationProviderConfig`
4. Webhook endpoint or polling job for live event ingestion

### `LiveMatchService`

`LiveMatchService` in `MatchCentreModule` provides 16 methods for live match state management. It currently works with admin-entered data and is ready to accept a data provider adapter.

---

## Notification Integration

### Current State

`NotificationsService` writes `Notification` records to the database only. Fans read notifications via API polling. No delivery.

### Planned Providers

| Channel | Provider options |
|---------|----------------|
| Email | AWS SES |
| SMS | Twilio, AWS SNS |
| Push | Firebase Cloud Messaging |

Each channel needs its own adapter implementing a `NotificationDeliveryAdapter` interface.

---

## Media Integration

Media URLs in `MediaItem` records are placeholders. A CDN integration (CloudFront or third-party) is required for:
- Video streaming (RIGHTS_REQUIRED — broadcasting agreement)
- Image delivery
- DRM-protected content

---

## Adapter Registration Pattern

Adapters are injected via NestJS module providers with a token:

```typescript
// Module registration
{
  provide: WALLET_ADAPTER_TOKEN,
  useClass: process.env.WALLET_PROVIDER === 'production'
    ? ProductionWalletAdapter
    : SiliconEnterpriseSandboxWalletAdapter,
}

// Service consumption
constructor(
  @Inject(WALLET_ADAPTER_TOKEN) private readonly wallet: WalletAdapter
) {}
```

This pattern means production adapters can be swapped without changing service code.

---

## Provider Readiness

Provider readiness is tracked via `IntegrationProviderConfig.status` and surfaced in the Admin Operations control plane at `/admin/operations`.

A provider can be in status:
- `SANDBOX` — sandbox adapter active
- `NOT_CONFIGURED` — no adapter
- `CONFIGURED` — production adapter credentials present (PLANNED)
- `ACTIVE` — production adapter verified and in use (PLANNED)
