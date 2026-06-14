# PSL One — Sponsor Campaign Engine

> **Historical Implementation Record** — This document was created during Sprint delivery as a working reference. It may be superseded by content in `docs/architecture/`, `docs/engineering/`, `docs/reference/`, or `docs/domain/`. Do not use as the canonical source for system behaviour.


**Story:** STORY-37  
**Sprint:** 2  
**Status:** Sandbox-ready; production requires sponsor onboarding and media rights

---

## Overview

The Sponsor Campaign Engine enables PSL One to run sponsor-funded engagement campaigns for fans. A campaign has:

- A **sponsor** (the funding organisation)
- **Actions** fans must complete (watch video, click CTA, answer quiz, scan QR, etc.)
- **Rewards** issued on completion (Fan Value points, vouchers, badges, experiences)
- A **lifecycle** from draft to completion enforced by the API

---

## Campaign Lifecycle

```
DRAFT ──────────────────────────────────────────── [admin edits campaign, adds actions]
  │
  └─ submitForApproval ──► PENDING_APPROVAL ────── [compliance/legal review]
                              │         │
                        approve        reject
                              │         │
                              ▼         └──────────────────► DRAFT
                           APPROVED
                              │
                           publish
                              │
                              ▼
                          PUBLISHED ◄──── resume ◄── PAUSED
                              │                         ▲
                              ├────── pause ────────────┘
                              │
                           complete
                              │
                              ▼
                          COMPLETED
                              │
                           archive
                              │
                              ▼
                           ARCHIVED
```

Invalid transitions throw `BadRequestException('Invalid status transition: X → Y')`.

---

## Fan Campaign Journey

```
1. Discovery
   Fan → GET /fan/campaigns
         Filtered: status=PUBLISHED, visible audience type includes this fan
         Returns: title, slug, sponsor name, FV points on offer, action count

2. Detail
   Fan → GET /fan/campaigns/:slug
         Returns: campaign detail + actions list + current participation status

3. Start
   Fan → POST /fan/campaigns/:campaignId/start
         Idempotent: returns existing participation if already started
         Creates FanCampaignParticipation { status: STARTED }

4. Complete Actions (one per call, idempotent)
   Fan → POST /fan/campaigns/:campaignId/actions/:actionId/complete
         { idempotencyKey, evidenceUrl?, evidenceText? }
         validationStatus = MANUAL_REVIEW for SCAN_QR and SHARE_CONTENT
         validationStatus = VALID for all other action types
         After all required actions completed → participation.status = COMPLETED

5. Reward Issued (async hook or triggered by completion)
   CampaignRewardsService.issueReward(participationId)
   → FanCampaignReward { status: ISSUED }
   → FanValueLedger entry if rewardType = FAN_VALUE_POINTS

6. Claim
   Fan → POST /fan/rewards/:rewardId/claim { idempotencyKey }
   → FanCampaignReward { status: CLAIMED }

7. Redeem
   Fan → POST /fan/rewards/:rewardId/redeem
   → FanCampaignReward { status: REDEEMED, redemptionRef }
```

---

## Action Types

| Action Type | Validation | Notes |
|-------------|-----------|-------|
| `WATCH_VIDEO` | VALID (auto) | Triggered by `recordMediaCompletion` — client calls complete action after media completion event |
| `CLICK_CTA` | VALID (auto) | Simplest action; just needs a click |
| `ANSWER_QUIZ` | VALID (auto) | Answer payload stored in metadataJson |
| `PREDICT_MATCH` | VALID (auto) | Client submits prediction then marks action complete |
| `REGISTER` | VALID (auto) | Fan already authenticated; completion = confirmation |
| `FOLLOW_CLUB` | VALID (auto) | Club follow event triggers completion |
| `SHARE_CONTENT` | MANUAL_REVIEW | Cannot be programmatically verified; requires admin review |
| `SCAN_QR` | MANUAL_REVIEW | QR code evidence submitted in metadataJson; requires admin review |

MANUAL_REVIEW actions do not block participation completion — they are excluded from the "all required actions complete" check until validated by admin.

---

## Reward Types

| Reward Type | Lifecycle | Notes |
|-------------|-----------|-------|
| `FAN_VALUE_POINTS` | ISSUED → CLAIMED (auto) → REDEEMED | Non-cash loyalty points; credited to FanValueLedger |
| `BADGE` | ISSUED → CLAIMED → REDEEMED | Links to AchievementsModule badge grant |
| `DIGITAL_VOUCHER` | ISSUED → CLAIMED → REDEEMED | redemptionRef = voucher code; fulfilment partner Sprint 3 |
| `PHYSICAL_PRIZE` | ISSUED → CLAIMED → REDEEMED | Address capture Sprint 3; fulfilment partner required |
| `EXPERIENCE` | ISSUED → CLAIMED → REDEEMED | Stadium access, meet-and-greet; operations team Sprint 3 |
| `EXCLUSIVE_CONTENT` | ISSUED → CLAIMED → REDEEMED | Unlocks gated media asset; media CDN Sprint 3 |

**Inventory management:** `inventoryLimit` (nullable) on `CampaignRewardDefinition`. `inventoryUsed` incremented atomically in `$transaction` during `issueReward`. When `inventoryUsed >= inventoryLimit`, further claims return `BadRequestException('Reward inventory exhausted')`. `null` inventory = unlimited.

---

## Analytics

`CampaignAnalyticsSnapshot` is updated via `POST /admin/campaigns/:id/analytics/recalculate`.

**KPIs computed:**
- `participantCount` — distinct fans who started participation
- `completionCount` — participants with status COMPLETED or REWARDED
- `rewardCount` — rewards in ISSUED, CLAIMED, or REDEEMED status
- `conversionRate` — completionCount / participantCount (0 if no participants)
- `avgActionsPerFan` — total completions / participants (0 if no participants)

Sprint 3: schedule nightly recalculation via AWS EventBridge cron.

---

## RBAC Summary

| Route Pattern | Guard | Role |
|---------------|-------|------|
| `GET /fan/campaigns*` | JwtAuthGuard | Any authenticated fan |
| `POST /fan/campaigns/:id/start` | JwtAuthGuard | Any authenticated fan |
| `POST /fan/campaigns/:id/actions/:actionId/complete` | JwtAuthGuard | Any authenticated fan |
| `GET /fan/campaigns/:id/progress` | JwtAuthGuard | Any authenticated fan |
| `POST /admin/campaigns*` | JwtAuthGuard + RolesGuard | PSL_ADMIN |
| `GET /admin/campaigns*` | JwtAuthGuard + RolesGuard | PSL_ADMIN |
| `PATCH /admin/campaigns*` | JwtAuthGuard + RolesGuard | PSL_ADMIN |
| `GET /admin/sponsors*` | JwtAuthGuard + RolesGuard | PSL_ADMIN |
| `POST /admin/sponsors*` | JwtAuthGuard + RolesGuard | PSL_ADMIN |
| `PATCH /admin/sponsors*` | JwtAuthGuard + RolesGuard | PSL_ADMIN |

Fan identity is always sourced from `req.user.sub` (JWT). Never from request body.

---

## Data Isolation — Fan-Safe Selects

```typescript
const FAN_SAFE_SELECT = {
  id: true, title: true, slug: true, status: true,
  startsAt: true, endsAt: true, fanValuePointsPerCompletion: true,
  requiresWalletLinked: true, requiresAgeConfirmation: true,
  // EXCLUDED: targetingRulesJson, createdByUserId, approvedByUserId
};

const PUBLIC_SPONSOR_SELECT = {
  id: true, name: true, slug: true, logoUrl: true, websiteUrl: true,
  // EXCLUDED: primaryContactName, primaryContactEmail, notes
};
```

---

## AdminAuditLog Coverage

All admin mutations on campaigns, sponsors, and media write to `AdminAuditLog`:

| Action | entity_type | entity_id |
|--------|-------------|-----------|
| CAMPAIGN_CREATED | SponsorCampaign | campaignId |
| CAMPAIGN_STATUS_CHANGED | SponsorCampaign | campaignId |
| CAMPAIGN_ACTION_ADDED | CampaignAction | actionId |
| SPONSOR_CREATED | SponsorProfile | sponsorId |
| SPONSOR_UPDATED | SponsorProfile | sponsorId |
| MEDIA_ASSET_CREATED | MediaAsset | assetId |
| MEDIA_ASSET_PUBLISHED | MediaAsset | assetId |
| MEDIA_ASSET_ARCHIVED | MediaAsset | assetId |
| REWARD_DEFINITION_CREATED | CampaignRewardDefinition | defId |
