# PSL One — Media, Sponsor Campaigns & Wallet Activation Foundation

**Story:** STORY-37  
**Sprint:** 2  
**Status:** Complete — sandbox-ready, rights-gated, non-financial

---

## Overview

STORY-37 adds three interconnected capability pillars to PSL One:

1. **Media Catalogue** — rights-aware asset library for video, audio, images, articles, livestreams, and podcasts tied to clubs and seasons
2. **Sponsor Campaigns** — lifecycle-managed campaigns from sponsors, with action completion, fan participation, and reward issuance
3. **Wallet Sandbox** — deterministic sandbox wallet integration (no real funds held or transferred)

All three are in **sandbox/foundation mode**. Fan-facing capabilities are live; production go-live requires rights contracts (media), sponsor onboarding (campaigns), and wallet provider production approval.

---

## Architecture

### Module Dependency Graph

```
MediaModule
  └─ PrismaModule

SponsorsModule
  └─ PrismaModule

CampaignsModule
  ├─ PrismaModule
  ├─ AuthModule
  └─ (emits Notification + ActivityFeed events)

CampaignRewardsModule
  ├─ PrismaModule
  ├─ AuthModule
  └─ (writes FanValueLedger entries)

WalletIntegrationModule
  ├─ PrismaModule
  └─ SiliconEnterpriseSandboxWalletAdapter (zero-outbound)

CampaignAnalyticsModule
  ├─ PrismaModule
  └─ (reads from campaigns + participations + completions)
```

### Request Flow — Fan Campaign Action Completion

```
Fan → POST /fan/campaigns/:campaignId/actions/:actionId/complete
  → JwtAuthGuard (validates JWT, extracts user.sub)
  → CampaignsController.completeAction(campaignId, actionId, user.sub, dto)
  → CampaignsService.completeAction(campaignId, actionId, fanUserId, dto)
    1. Find participation by @@unique([campaignId, fanUserId])
    2. Guard: participation exists and status is not terminal
    3. Find action by id; guard: action.campaignId === campaignId
    4. Idempotency check: dto.idempotencyKey → findUnique(idempotencyKey)
    5. Unique-pair check: @@unique([participationId, campaignActionId])
    6. Determine validationStatus: MANUAL_REVIEW for SCAN_QR/SHARE_CONTENT, VALID otherwise
    7. Create FanCampaignActionCompletion
    8. Check all required actions complete → update participation to COMPLETED or IN_PROGRESS
  → Return completion record
```

### Request Flow — Fan Reward Claim

```
Fan → POST /fan/rewards/:rewardId/claim  { idempotencyKey }
  → JwtAuthGuard
  → CampaignRewardsController.fanClaimReward(rewardId, user.sub, dto)
  → CampaignRewardsService.fanClaimReward(rewardId, fanUserId, dto)
    1. Find reward by id; guard: reward.fanUserId === fanUserId and status === ISSUED
    2. Idempotency check on dto.idempotencyKey
    3. $transaction: update reward status → CLAIMED, write FanValueLedger entry if FAN_VALUE_POINTS type
    4. Return updated reward with safety copy
  → Return reward with disclaimer
```

---

## Safety Architecture

### Media Rights Gate

```typescript
// media.service.ts — getPublicMediaList
where: {
  status: 'PUBLISHED',
  rightsStatus: { in: ['CLEARED', 'PUBLIC_DOMAIN'] },
}
```

Assets with `UNKNOWN`, `RIGHTS_REQUIRED`, `LICENSED`, or `EMBARGOED` rightsStatus are invisible to fan routes regardless of `status`. Admin routes see all assets.

Every fan-facing media response includes:
> "Media availability does not imply that PSL One owns streaming rights. Public availability requires an approved rights status."

### Wallet Sandbox Isolation

```typescript
// wallet-integration.service.ts
class SiliconEnterpriseSandboxWalletAdapter {
  generateRef(fanUserId: string, providerSlug: string): string {
    return `SANDBOX-${providerSlug.toUpperCase()}-${fanUserId.slice(0, 8)}-${Date.now()}`;
  }
  // Zero outbound HTTP calls. Deterministic. No real funds.
}
```

Every wallet API response includes:
> "Wallet integration is operating in sandbox mode. No real financial transactions are processed."
> "Wallet services are provided by an external wallet provider. PSL One does not hold customer funds directly."

### Fan Value Non-Financial Copy

Every campaign reward API response includes:
> "Fan Value points are non-cash loyalty points. They are not money, betting credits, or a withdrawable balance."

---

## Data Model Summary

| Table | Purpose | Key Constraints |
|-------|---------|----------------|
| `media_assets` | Rights-aware content library | slug unique; published only if CLEARED/PUBLIC_DOMAIN |
| `media_asset_engagements` | Per-fan view/completion tracking | unique(fan_user_id, media_asset_id) |
| `sponsor_profiles` | Sponsor CRM (admin-only contact fields) | slug unique |
| `sponsor_campaigns` | Campaign definition + lifecycle | slug unique |
| `campaign_actions` | Fan actions within a campaign | ordered by `order` field |
| `fan_campaign_participations` | Fan's participation state per campaign | @@unique([campaign_id, fan_user_id]) |
| `fan_campaign_action_completions` | Per-action completion events | @@unique([participation_id, campaign_action_id]); idempotencyKey unique |
| `campaign_reward_definitions` | Reward types available in a campaign | inventory_limit nullable (null = unlimited) |
| `fan_campaign_rewards` | Issued rewards per fan | idempotencyKey unique; status: ISSUED→CLAIMED→REDEEMED |
| `wallet_providers` | Registered wallet providers | slug unique |
| `fan_wallet_links` | Fan-to-provider link state | @@unique([fan_user_id, provider_id]) |
| `fan_wallet_transactions` | Sandbox transaction log | idempotencyKey unique |
| `campaign_analytics_snapshots` | Pre-computed campaign KPIs | @@unique([campaign_id]) |

---

## Campaign Lifecycle

```
DRAFT
  └─ submitForApproval → PENDING_APPROVAL
       ├─ approve → APPROVED
       │    └─ publish → PUBLISHED
       │         ├─ pause → PAUSED → resume → PUBLISHED
       │         └─ complete → COMPLETED
       │                  └─ archive → ARCHIVED
       └─ reject → DRAFT
```

Transitions not listed above are rejected with `BadRequestException('Invalid status transition: X → Y')`.

---

## Module Readiness Status

| Module | AdminOperations Status | Reason |
|--------|----------------------|--------|
| Media | `RIGHTS_REQUIRED` | Media rights contract not yet signed |
| Sponsors | `FOUNDATION_READY` | Onboarding pipeline not yet automated |
| Campaigns | `SANDBOX_READY` | Live when sponsors and media are ready |
| CampaignRewards | `SANDBOX_READY` | FV points live; physical/voucher rewards need fulfilment partner |
| WalletIntegration | `PRODUCTION_DISABLED` | Requires production provider contract + compliance |
| CampaignAnalytics | `SANDBOX_READY` | Analytics snapshots live |

---

## Production Go-Live Checklist

- [ ] Media: sign content rights agreement for at least one provider
- [ ] Media: configure CDN origin (CloudFront) for media asset delivery
- [ ] Sponsors: onboard at least one sponsor; set status → ACTIVE
- [ ] Campaigns: create and publish at least one PUBLISHED campaign
- [ ] Wallet: select production wallet provider (Silicon Enterprise or alternative)
- [ ] Wallet: complete KYC/AML compliance review
- [ ] Wallet: rotate sandbox config to production credentials
- [ ] Rewards: for physical prizes/vouchers — integrate fulfilment partner API
- [ ] Analytics: schedule nightly `recalculate` job via cron/EventBridge
