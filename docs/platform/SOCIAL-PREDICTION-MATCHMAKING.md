# PSL One — Social Prediction Matchmaking

**Story:** STORY-38  
**Status:** BUILT_NOW  
**Compliance:** POINTS_BASED_SOCIAL_PREDICTION_COMPLIANCE = INTERNAL_REVIEW_REQUIRED

---

## Product Classification

PSL One social prediction challenges are a **points-based social gaming mechanic** — NOT sports betting:

| Attribute | PSL One Social Prediction | Regulated Sports Betting |
|-----------|--------------------------|--------------------------|
| Currency | System-issued gameplay points | Real money / cash |
| Purchase | Points granted by system — never sold | Funds deposited by user |
| Withdrawal | Not possible — closed-loop | Winnable / withdrawable |
| Odds | Points Return Rate (informational) | Financial odds |
| Regulatory | Points gaming, INTERNAL_REVIEW_REQUIRED | Gambling licence required |

**Required safety copy (include on all public-facing challenge pages):**

> PSL One social prediction challenges use system-issued gameplay points only. Gameplay points cannot be purchased, transferred, withdrawn or exchanged for money. Challenge results affect platform scoring and leaderboard positions only.

> Fan Value is a separate non-financial loyalty score and is not used to fund prediction challenges.

---

## Architecture

### Models

| Model | Purpose |
|-------|---------|
| `PredictionMarketConfig` | Defines a challenge type for a season (MATCH_RESULT, etc.) |
| `FixturePredictionMarket` | An active challenge market for a specific fixture |
| `GameweekPointsAllocation` | Admin-granted points per fan per gameweek |
| `ChallengeListing` | A fan's points commitment on a market outcome |
| `ChallengeMatch` | An accepted challenge (listing ↔ counter-fan pairing) |
| `ChallengeScore` | Fan's net score from a settled market |
| `SocialPredictionPointsEntry` | Immutable ledger entry (COMMITTED, AWARDED, FORGONE, VOID_RESTORED) |
| `ComplianceDomainConfig` | Domain-level compliance status record |

### Matching Engine (FIFO)

1. Fan creates `ChallengeListing` with `supportingSelection` and `committedPoints`
2. Engine computes `opposingSelection` (HOME → AWAY_OR_DRAW, etc.)
3. Scans existing OPEN listings in the same market with the OPPOSING supporting selection
4. Matches FIFO — earliest listing first — up to `committedPoints`
5. Each match creates a `ChallengeMatch` + `SocialPredictionPointsEntry(POINTS_COMMITTED)`
6. Listing transitions OPEN → PARTIALLY_MATCHED → FULLY_MATCHED

**Idempotency:** `idempotencyKey` on `ChallengeListing` and `ChallengeMatch` prevents duplicates on retry.

### Ledger (Immutable)

`SocialPredictionPointsEntry` is append-only:

| Entry Type | When |
|------------|------|
| `POINTS_COMMITTED` | Listing created (reserves points) |
| `POINTS_AWARDED` | Market settled, fan predicted correctly |
| `POINTS_FORGONE` | Market settled, fan predicted incorrectly |
| `VOID_RESTORED` | Market voided, committed points returned |

Corrections are made by appending new entries — no UPDATE or DELETE on this table.

---

## Lifecycle

```
Admin creates PredictionMarketConfig (season-level)
    ↓
Admin generates FixturePredictionMarket (per fixture)
    ↓
Admin opens market (CREATED → OPEN)
    ↓
Fans create ChallengeListing [OPEN window]
    ↓
Admin locks market at kickoff (OPEN → LOCKED)
    ↓
Admin settles market post-match (LOCKED → SETTLED) → awards POINTS_AWARDED/FORGONE
Admin voids market if abandoned (LOCKED → VOIDED) → restores VOID_RESTORED
```

---

## Key Rules

- **Self-match prevention:** A fan cannot accept their own listing
- **Volume cap:** `maxConcurrentChallenges` per gameweek (from allocation)
- **Commitment bounds:** `minCommitmentPct` / `maxCommitmentPct` per prediction
- **Multiplier whitelist:** `allowedMultipliersJson` — no arbitrary multiplier
- **Market must be OPEN** for listing creation or acceptance
- **Settlement requires LOCKED status** — cannot settle an OPEN market

---

## API Routes

### Fan Routes (`/social-predictions/`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/social-predictions/allocation?gameweekId=` | Get my points allocation |
| GET | `/social-predictions/marketplace/:fixtureId` | Get markets for a fixture |
| GET | `/social-predictions/markets/:marketId` | Get market detail |
| GET | `/social-predictions/markets/:marketId/listings` | Get open listings for a market |
| POST | `/social-predictions/listings` | Create challenge listing |
| GET | `/social-predictions/listings` | Get my listings |
| GET | `/social-predictions/listings/:id` | Get listing detail |
| DELETE | `/social-predictions/listings/:id` | Withdraw listing |
| POST | `/social-predictions/listings/:id/accept` | Accept a listing |
| GET | `/social-predictions/leaderboard?seasonId=` | Social prediction leaderboard |
| GET | `/social-predictions/ledger?seasonId=` | My points ledger |

### Admin Routes (`/admin/social-predictions/`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/admin/social-predictions/market-configs` | Create market config |
| GET | `/admin/social-predictions/market-configs?seasonId=` | List market configs |
| PATCH | `/admin/social-predictions/market-configs/:id/toggle` | Enable/disable config |
| POST | `/admin/social-predictions/fixtures/:fixtureId/markets` | Generate fixture markets |
| GET | `/admin/social-predictions/fixtures/:fixtureId/markets` | List fixture markets |
| PATCH | `/admin/social-predictions/markets/:id/open` | Open market |
| PATCH | `/admin/social-predictions/markets/:id/lock` | Lock market at kickoff |
| PATCH | `/admin/social-predictions/markets/:id/settle` | Settle market |
| PATCH | `/admin/social-predictions/markets/:id/void` | Void market |
| POST | `/admin/social-predictions/allocations/grant` | Grant allocation to all fans |
| PATCH | `/admin/social-predictions/allocations/:fanUserId/:gameweekId` | Adjust individual allocation |
| GET | `/admin/social-predictions/listings` | All listings (filterable) |
| GET | `/admin/social-predictions/listings/:id` | Listing detail |
| PATCH | `/admin/social-predictions/matches/:id/void` | Void a challenge match |
| GET | `/admin/social-predictions/compliance` | Compliance status |

---

## Compliance Readiness

Domain: `POINTS_BASED_SOCIAL_PREDICTION_COMPLIANCE`  
Status: `INTERNAL_REVIEW_REQUIRED`

Review checklist before public launch:
- [ ] Legal review: points-gaming vs gambling classification in ZA jurisdiction
- [ ] Points cannot be purchased, transferred, or exchanged for money (enforced in code)
- [ ] No odds displayed — only Points Return Rate (informational)
- [ ] Fan Value leaderboard separation documented
- [ ] Terms & Conditions updated to include points gaming disclosure
- [ ] Age verification: check ZA legal requirements for points-gaming platforms

---

## STORY-38: Direct Fan-to-Fan Challenges

### Challenge Lifecycle

```
Creator creates listing (challengeMode: DIRECT_USER, challengedUserId, invitationStatus: PENDING)
  ↓
Challenged fan receives in-app notification
  ↓
Fan accepts   → Atomic $transaction:
                  1. updateMany listing WHERE invitationStatus=PENDING AND availablePoints >= required (count check)
                  2. updateMany allocation WHERE remainingAllocation >= required (count check)
                  3. create ChallengeMatch
                  4. createMany SocialPredictionPointsEntry (immutable ledger)
Fan declines  → Sets invitationStatus: DECLINED only (no re-publish to PUBLIC_MARKETPLACE)
Fan withdraws → Sets invitationStatus: WITHDRAWN only (immutable history)
```

### Concurrency Protection

The acceptance path uses **conditional `updateMany`** (not `findUnique` + `update`) to prevent double-spend:

```typescript
const listingUpdate = await tx.challengeListing.updateMany({
  where: {
    id: listingId,
    status: OPEN,
    invitationStatus: PENDING,
    availablePoints: { gte: pointsToAccept },   // ← atomic guard
  },
  data: { availablePoints: { decrement: ... }, status: FULLY_MATCHED, invitationStatus: ACCEPTED },
});
if (listingUpdate.count !== 1) throw new ConflictException('...');
```

PostgreSQL serialises this at row level — two concurrent transactions cannot both satisfy the WHERE clause.

**Integration test:** `direct-challenge-concurrency.integration.spec.ts` — runs against real DB, two concurrent acceptors, only one wins.

### Idempotency

All acceptance paths use **deterministic idempotency keys** (no random UUIDs):

- Direct challenge: `direct-accept:${listingId}:${fanUserId}`
- Ledger entries: `commit-support:${idempotencyKey}`, `commit-oppose:${idempotencyKey}`

Retries are safe — existing `ChallengeMatch` is returned without re-executing the transaction body.

### New API Routes

| Route | Auth | Description |
|-------|------|-------------|
| `GET /social-prediction/challenges/incoming` | FAN | Pending direct challenges |
| `GET /social-prediction/challenges/outgoing` | FAN | Sent challenges |
| `POST /social-prediction/listings/:id/challenge` | FAN | Send direct challenge |
| `POST /social-prediction/listings/:id/challenge/accept` | FAN | Atomic accept |
| `POST /social-prediction/listings/:id/challenge/decline` | FAN | Immutable decline |
| `POST /social-prediction/listings/:id/challenge/withdraw` | FAN | Immutable withdraw |
| `GET /social-prediction/listings/:id/share-link` | FAN | Share link for invite |

### Compliance

Direct challenges are **points-only**. No real money, no peer-to-peer wagering. `POINTS_BASED_SOCIAL_PREDICTION_COMPLIANCE` status: `INTERNAL_REVIEW_REQUIRED`.
