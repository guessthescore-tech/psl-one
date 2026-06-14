# PSL One — Social Prediction Gaming Domain

**Purpose:** Challenge listings, marketplace, direct challenges, and gameplay points  
**Audience:** Backend engineers, product  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Domain Overview

Social Prediction Gaming (also called "Social Prediction Challenges") allows fans to bet non-financial gameplay points on fixture outcomes against each other.

Modules: `SocialPredictionModule`, `MatchCentreModule`

---

## Core Concepts

**Gameplay Points** — System-issued non-financial points. Admins allocate them per gameweek. Fans use them as stakes in challenges. Cannot be purchased, withdrawn, or transferred directly.

**Challenge Listing** — A fan posts an offer to compete. Includes:
- Which fixture
- Position: `SUPPORTING` (home team wins) or `OPPOSING` (away team wins) or `DRAW`
- Stake amount (gameplay points)
- Capacity (how many opponents can accept)

**Direct Challenge** — Listing sent to a specific `challengedUserId`. Only that fan can accept.

**Marketplace Listing** — Public challenge open to any fan.

---

## Challenge Acceptance (FIFO)

When a fan accepts a marketplace challenge:

1. System checks `ChallengeIdempotency` (key: `direct-accept:{listingId}:{fanUserId}`) — prevents duplicate acceptance
2. Atomically in a transaction:
   - Write `SocialPredictionMatch`
   - Write `SocialPredictionPointsEntry` (type: `POINTS_COMMITTED`) for challenger
   - Write idempotency key
3. If any step fails, full rollback

FIFO order: listings are matched in creation order. No randomness or hidden weighting.

---

## Challenge Result

When a fixture result is entered by admin:

1. Admin calls `POST /admin/match-centre/:fixtureId/result`
2. `MatchCentreModule` triggers `SocialPredictionModule.settleMatchChallenges(fixtureId)`
3. For each `SocialPredictionMatch` on that fixture:
   - Winners: `SocialPredictionPointsEntry` type `POINTS_AWARDED`
   - Losers: `SocialPredictionPointsEntry` type `POINTS_FORGONE`
   - Voided (cancelled fixture): `VOID_RESTORED`

---

## SocialPredictionPointsEntry (Immutable)

```
Types: POINTS_COMMITTED | POINTS_AWARDED | POINTS_FORGONE | VOID_RESTORED
```

Never updated. Corrections are new entries. Fan's effective balance = sum of all entries.

---

## Campaign Trigger Integration

`CampaignTriggerService` is called after:
- Challenge acceptance
- Challenge result settlement

If an active campaign has a matching trigger rule, a `CampaignTriggerLog` is written and optional reward processing begins (wallet integration — currently PROVIDER_REQUIRED).

---

## Gameplay Points Allocation

Admins allocate points to fans per gameweek:

```
POST /admin/social-predictions/allocate
{
  "userId": "...",
  "gameweekId": "...",
  "amount": 500
}
```

`SocialPredictionGameplayPointsAllocation` record created.

---

## Key Rules

1. **No user-to-user transfer**: Gameplay points from one fan cannot be sent directly to another — only through challenge result flow
2. **No real money**: Gameplay points have no monetary value
3. **Immutable ledger**: `SocialPredictionPointsEntry` rows are never updated
4. **Idempotency**: Duplicate acceptance attempts are blocked by `ChallengeIdempotency`
5. **Direct challenge exclusivity**: Only the `challengedUserId` can accept a direct challenge
6. **Atomic acceptance**: All steps of challenge acceptance are in a single transaction

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/social-predictions/listings` | Fan | Browse marketplace |
| POST | `/social-predictions/listings` | Fan | Create challenge listing |
| POST | `/social-predictions/listings/:id/accept` | Fan | Accept marketplace challenge |
| POST | `/social-predictions/challenges/direct` | Fan | Send direct challenge |
| POST | `/social-predictions/challenges/:id/accept` | Fan | Accept direct challenge |
| GET | `/social-predictions/my-challenges` | Fan | My challenges |
| GET | `/admin/social-predictions/listings` | Admin | All listings |
| POST | `/admin/social-predictions/allocate` | Admin | Allocate gameplay points |
| POST | `/admin/match-centre/:fixtureId/result` | Admin | Enter match result (triggers settlement) |
