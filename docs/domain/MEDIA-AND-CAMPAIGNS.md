# PSL One — Media and Campaigns Domain

**Purpose:** Media content, sponsor campaigns, and wallet commerce boundaries  
**Audience:** Backend engineers, product  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Domain Overview

Modules: `MediaModule`, `CampaignsModule`, `WalletModule`

---

## Media

`MediaModule` manages editorial and sponsor content items.

### MediaItem Model

| Field | Description |
|-------|-------------|
| `type` | `EDITORIAL`, `SPONSOR`, `VIDEO`, `IMAGE` |
| `title` | Content title |
| `url` | Content URL (placeholder — no CDN wired) |
| `seasonId?` | Optional season scope |
| `teamId?` | Optional club scope |
| `publishedAt?` | Publish date |

### Media CDN Status

Media URLs are placeholders. A CDN integration (CloudFront or third-party) is PROVIDER_REQUIRED. Video content with DRM is RIGHTS_REQUIRED (broadcasting agreement needed).

### API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/media` | Fan | List published media |
| GET | `/media/:id` | Fan | Get media item |
| POST | `/admin/media` | Admin | Create media item |
| PATCH | `/admin/media/:id` | Admin | Update media item |
| DELETE | `/admin/media/:id` | Admin | Remove media item |

---

## Sponsor Campaigns

`CampaignsModule` manages campaign definitions, rules, and trigger logging.

### Campaign Model

| Field | Description |
|-------|-------------|
| `sponsorName` | Campaign sponsor |
| `status` | `DRAFT`, `ACTIVE`, `PAUSED`, `COMPLETED` |
| `budget` | Campaign budget (informational — no payment wired) |

### Campaign Rules

Each campaign has one or more `CampaignRule`:

| Field | Description |
|-------|-------------|
| `triggerType` | `CHALLENGE_ACCEPTED`, `CHALLENGE_WON`, `PREDICTION_CORRECT`, etc. |
| `rewardType` | `FAN_VALUE_BONUS`, `ACHIEVEMENT`, `WALLET_CREDIT` (last one requires provider) |
| `rewardAmount` | Reward quantity |

### CampaignTriggerService

`CampaignTriggerService` is called from `SocialPredictionModule` on:
- Challenge acceptance
- Challenge result settlement

Checks all active campaigns for matching trigger rules. Writes `CampaignTriggerLog`. Wallet reward delivery is PROVIDER_REQUIRED.

### API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/admin/campaigns` | Admin | List campaigns |
| POST | `/admin/campaigns` | Admin | Create campaign |
| PATCH | `/admin/campaigns/:id` | Admin | Update campaign |
| POST | `/admin/campaigns/:id/activate` | Admin | Activate campaign |
| POST | `/admin/campaigns/:id/pause` | Admin | Pause campaign |
| GET | `/admin/campaigns/:id/triggers` | Admin | View trigger log |

---

## Wallet and Commerce

`WalletModule` provides the wallet adapter pattern.

### What PSL One Is

- A fan engagement platform with non-financial scoring
- Gameplay points, Fan Value, and prediction points have no monetary value

### What PSL One Is Not

- A betting or gambling product
- A money transfer service
- A custodian of customer funds

### Wallet Integration Status

`SiliconEnterpriseSandboxWalletAdapter` — makes zero outbound HTTP calls. Returns mock responses. No real wallet provider is wired.

`WalletLink` records store only an external reference ID — no balance or funds are held.

### API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/wallet/link` | Fan | Link wallet account (sandbox — no real call) |
| GET | `/wallet/balance` | Fan | Get wallet balance (sandbox mock) |
| GET | `/admin/wallet/config` | Admin | View wallet adapter config |
| POST | `/admin/operations/providers/wallet_primary` | Admin | Update provider config |

---

## Financial Safety Statement

No route in PSL One moves real money. No route creates real financial obligations. The sandbox adapter ensures this is enforced at the code level. Production wallet integration requires a regulated provider contract, KYC compliance, and explicit POPIA review before enablement.
