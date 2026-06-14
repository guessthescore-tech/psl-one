> **Documentation status:** Historical implementation record.
> This file is retained for traceability and is not the current source of architectural guidance.
> Current documentation starts at [Documentation Home](../../README.md).

# STORY-38 Handover — PSL Live Match Intelligence & Social Prediction Gaming

**Created:** 2026-06-14  
**Status:** COMPLETE — all code written, all gates passing, NOT YET COMMITTED  
**Last commit before STORY-38:** `b083014 feat: add media sponsor campaigns and wallet activation foundation`

---

## A. Branch & Working Tree State

**Current branch:** `main`

**Working tree:** DIRTY — all STORY-38 work is uncommitted. Confirmed via `git status --short`:

**14 modified files:**
```
 M apps/api/prisma/schema.prisma
 M apps/api/prisma/seed.ts
 M apps/api/src/admin-operations/admin-operations.service.ts
 M apps/api/src/app.module.ts
 M apps/api/src/beta-feedback/beta-feedback.service.spec.ts
 M apps/api/src/beta-feedback/beta-feedback.service.ts
 M apps/api/src/campaigns/campaigns.module.ts
 M docs/platform/ADMIN-CAPABILITY-GAP-REVIEW.md
 M docs/platform/API-ROUTE-INVENTORY.md
 M docs/platform/BETA-READINESS-REVIEW.md
 M docs/platform/DATABASE-MIGRATION-INVENTORY.md
 M docs/platform/FRONTEND-ROUTE-INVENTORY.md
 M docs/platform/PLATFORM-OVERVIEW.md
 M docs/platform/STORY-BY-STORY-CODE-WALKTHROUGH.md
```

**21 untracked file groups (all new STORY-38 work):**
```
?? apps/api/prisma/migrations/20260609063038_drop_old_notification_prefs/
?? apps/api/prisma/migrations/20260613000001_social_prediction_match_centre/
?? apps/api/prisma/migrations/20260613000002_direct_challenges_campaign_triggers/
?? apps/api/src/campaigns/campaign-trigger.service.spec.ts
?? apps/api/src/campaigns/campaign-trigger.service.ts
?? apps/api/src/match-centre/
?? apps/api/src/social-prediction/
?? apps/web/src/app/admin/live-match/
?? apps/web/src/app/admin/match-centre/
?? apps/web/src/app/admin/social-predictions/
?? apps/web/src/app/match-centre/
?? apps/web/src/app/matches/
?? apps/web/src/app/social-challenges/
?? apps/web/src/app/social-predictions/
?? apps/web/src/lib/admin-match-centre-client.ts
?? apps/web/src/lib/admin-social-prediction-client.ts
?? apps/web/src/lib/match-centre-client.ts
?? apps/web/src/lib/social-prediction-client.ts
?? docs/platform/LIVE-MATCH-DATA-ARCHITECTURE.md
?? docs/platform/PLAYER-PERFORMANCE-DATA-MODEL.md
?? docs/platform/SOCIAL-PREDICTION-MATCHMAKING.md
```

**Do NOT run `git add -A` / `git commit` until the user says "commit this".**

---

## B. Verified Acceptance Gate

All gates were positively verified in the previous session.

| Gate | Result |
|------|--------|
| `prisma validate` | ✓ PASS |
| `tsc --noEmit` (API) | ✓ PASS (clean, 0 errors) |
| `tsc --noEmit` (web) | ✓ PASS (clean, 0 errors) |
| `vitest run` | ✓ 1528 tests, 53 files, 0 failures |
| `prisma migrate status` | ✓ "Database schema is up to date!" |
| `prisma db seed` | ✓ PASS |
| Web page count | 319 pages |

Run these gates in order before doing anything else:
```bash
cd apps/api && npx prisma validate
cd apps/api && npx tsc --noEmit
cd apps/web && npx tsc --noEmit
cd apps/api && npx vitest run 2>&1 | tail -10
cd apps/api && npx prisma migrate status
cd apps/api && npx prisma db seed
```

---

## C. Database State (dev)

### Applied Migrations (37 total, all tracked)

The 3 STORY-38 migrations are **untracked by git** but ARE applied to the local dev DB and recorded in `_prisma_migrations`.

| Migration | Status |
|-----------|--------|
| `20260609063038_drop_old_notification_prefs` | Applied (`applied_steps_count: 1`) |
| `20260613000001_social_prediction_match_centre` | Applied (`applied_steps_count: 0`, resolved via `migrate resolve --applied`) |
| `20260613000002_direct_challenges_campaign_triggers` | Applied |

### Migration Risk — RESOLVED (2026-06-14)

**`20260609063038_drop_old_notification_prefs` was rewritten as a state-aware compatibility migration.**

#### Why the original SQL was unsafe

The original `DROP TABLE IF EXISTS "notification_preferences" CASCADE` would destroy the user-scoped table on any database where the user-scoped shape was already present but `20260609063038` had not yet been recorded in `_prisma_migrations`.

#### Discriminator columns

- **Legacy shape** (from `20260609063037_add_fan_profile`): table has `profile_id` FK → `fan_profiles`
- **Current shape** (from `20260611000002_notifications`): table has `user_id` FK → `users`

#### Final migration SQL

```sql
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'notification_preferences'
      AND column_name  = 'profile_id'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'notification_preferences'
      AND column_name  = 'user_id'
  )
  THEN
    DROP TABLE "notification_preferences";
  END IF;
END
$$;
```

`CASCADE` removed: no committed migration creates a FK referencing `notification_preferences`, so a plain DROP is sufficient and avoids silently removing unrelated objects.

#### Checksum updated

After rewriting the SQL, `_prisma_migrations` was updated:
```sql
UPDATE _prisma_migrations
SET checksum = 'f671592886b1ec17896147e4833e238f7a8ca55180606b7634f39de7fe411ec2'
WHERE migration_name = '20260609063038_drop_old_notification_prefs';
```
Confirmed: `prisma migrate status` reports "Database schema is up to date!" after the update.

#### Path A — Empty database replay ✓ PASSED

Created `psl_story38_empty_replay`, ran `prisma migrate deploy` with all 37 migrations.

- All 37 migrations applied in order
- `20260609063037` created legacy profile-scoped table
- `20260609063038` DO block: `profile_id` found, `user_id` absent → legacy table dropped
- `20260611000002` created user-scoped table
- Final `notification_preferences`: has `user_id`, PKs, UNIQUE on `user_id`, FK to `users` — no `profile_id`
- All STORY-38 tables present: `challenge_listings`, `challenge_matches`, `gameweek_points_allocations`, `social_prediction_points_entries`, `campaign_trigger_events`, `data_ingestion_logs`

Test database dropped.

#### Path B — Existing database upgrade (late migration application) ✓ PASSED

Created `psl_story38_upgrade_test`, applied all 37 migrations (user-scoped table now exists).
Inserted test row `{ id: 'np-test-1', user_id: 'test-uid-1' }` into `notification_preferences`.

Ran the DO block directly against the upgraded database.

Result:
- DO block is a no-op: `profile_id` column absent → condition FALSE → no DROP executed
- Test row `np-test-1` preserved
- All 12 columns preserved (`user_id` present, `profile_id` absent)
- Indexes preserved: `notification_preferences_pkey`, `notification_preferences_user_id_key`
- Constraints preserved: `notification_preferences_pkey`, `notification_preferences_user_id_fkey`

Test database dropped.

#### Migration ordering accepted by Prisma

`prisma migrate status` on dev DB: "37 migrations found … Database schema is up to date!" — no out-of-order error. The `063038` timestamp (2026-06-09 06:30:38) is correctly interleaved between `063037` and `070826`.

#### Remaining risk

None. The migration is state-aware, upgrade-safe and drop-safe. `CASCADE` has been removed.

### Duplicate Row in `_prisma_migrations`

Migration `20260613000001_social_prediction_match_centre` has two rows in the tracking table:
- One failed row (`finished_at IS NULL`) from an earlier `migrate deploy` attempt
- One resolved row with `finished_at` set (from `migrate resolve --applied`)

`migrate status` reports "up to date" — Prisma uses the latest completed record. This is harmless but be aware if querying `_prisma_migrations` directly.

### STORY-38 Schema Tables

All 12 new tables exist in the dev DB:
- `prediction_market_configs` — season-scoped market configuration
- `fixture_prediction_markets` — per-fixture market instances
- `gameweek_points_allocations` — fan point budget per gameweek
- `challenge_listings` — public marketplace + direct challenge listings
- `challenge_matches` — accepted challenge pairs
- `challenge_scores` — settled scores
- `social_prediction_points_entries` — ledger entries
- `league_standings` — live standings
- `team_form_records` — rolling form data
- `player_ratings` — match ratings
- `data_ingestion_logs` — sandbox ingest audit
- `compliance_domain_configs` — compliance rules
- `campaign_trigger_events` — idempotent trigger log

---

## D. New Schema Models & Enums

### New Enums Added in STORY-38

```prisma
enum ChallengeMode {
  PUBLIC_MARKETPLACE
  DIRECT_USER
  FRIEND
  PRIVATE_LEAGUE
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  DECLINED
  WITHDRAWN
  EXPIRED
}

enum CampaignTriggerType {
  LINEUP_CONFIRMED
  MATCH_STARTED
  GOAL_SCORED
  HALF_TIME
  FULL_TIME
  PLAYER_OF_MATCH_VOTE_OPEN
  CLEAN_SHEET_COMPLETED
  FANTASY_MILESTONE
  PREDICTION_RESULT_AVAILABLE
}
```

### Critical Schema Facts (trip wires from this story)

- `ChallengeListing` uses `fanUserId` (not `creatorId`) and `fixtureMarketId` (not `marketId`)
- `PredictionMarketConfig` has `seasonId` (NOT `gameweekId`) — market config is season-scoped
- `CampaignType` does NOT have `MATCH_DAY_ACTIVATION` — use `'OTHER'`
- `CampaignStatus.PUBLISHED` (not `ACTIVE`) for active campaigns
- `SocialPredictionPointsEntry` has NO `role` field — store role in `metadataJson: { role: 'SUPPORTER' }`
- `ChallengeMatch` uses `supportingListingId` / `opposingListingId` (not `listingId`)
- `GameweekPointsAllocation` fields: `remainingAllocation` / `usedAllocation` (NOT `availablePoints`)
- `ChallengeListing` required fields include: `supportingSelection`, `opposingSelection`, `baseOpportunity`, `pointsCommitmentPct`, `committedPoints`, `pointsReturnRate`, `confidenceMultiplier`, `potentialPointsAward`, `maximumPointsExposure`, `idempotencyKey`

---

## E. New API Modules

### `MatchCentreModule` (`apps/api/src/match-centre/`)

**Files:**
- `match-centre.service.ts` — `MatchCentreService`, 16 public methods
- `match-centre.controller.ts`
- `match-centre.module.ts`
- `match-centre.service.spec.ts`
- `dto/ingest-match-data.dto.ts`
- `dto/upsert-player-rating.dto.ts`
- `dto/upsert-standings.dto.ts`
- `dto/upsert-team-form.dto.ts`

**Service methods (all on `MatchCentreService`):**
- `getLiveFixtures()`, `getFixtureLiveState(fixtureId)`, `getLiveMatchDashboard(fixtureId)`
- `getFixtureAvailability(fixtureId)`, `getFixtureLineups(fixtureId)`, `getFixtureEvents(fixtureId)`
- `getFixturePlayerStats(fixtureId)`, `getLiveFantasyPreview(fixtureId)`
- `kickOff(fixtureId)`, `halfTime(fixtureId)`, `secondHalf(fixtureId)`, `fullTime(fixtureId)`
- `addMatchEvent(fixtureId, dto)`, `deleteMatchEvent(eventId)`
- `upsertPlayerStat(fixtureId, dto)`, `ingestSandboxData(dto)`
- `getIngestionLog(filters)`, `getCapabilityStatus()`
- Campaign trigger integration: `CampaignTriggerService` injected, fires on `GOAL_SCORED`, `HALF_TIME`, `FULL_TIME`, `MATCH_STARTED`, `LINEUP_CONFIRMED`

### `SocialPredictionModule` (`apps/api/src/social-prediction/`)

**Files:**
- `social-prediction.service.ts` — 30+ public methods
- `social-prediction.controller.ts`
- `social-prediction.module.ts`
- `social-prediction.service.spec.ts`
- `direct-challenge-concurrency.integration.spec.ts`
- Multiple DTOs in `dto/`

**Key service methods:**
- Fan: `fanGetAllocation`, `fanGetMarketplace`, `fanGetMarketplaceListings`, `fanCreateListing`, `fanAcceptListing`, `fanWithdrawListing`
- Fan direct challenges: `fanCreateDirectChallenge`, `fanAcceptDirectChallenge`, `fanDeclineDirectChallenge`, `fanWithdrawDirectChallenge`, `fanGetIncomingChallenges`, `fanGetOutgoingChallenges`, `fanGetChallengeShareLink`
- Fan leaderboard: `fanGetLeaderboard`, `fanGetMyLedger`
- Admin: `adminCreateMarketConfig`, `adminGenerateFixtureMarkets`, `adminOpenMarket`, `adminLockMarket`, `adminSettleMarket`, `adminVoidMarket`, `adminGrantAllocation`, `adminAdjustAllocation`, `adminListAllListings`, `adminVoidMatch`, `adminGetComplianceStatus`

### `CampaignTriggerService` (`apps/api/src/campaigns/campaign-trigger.service.ts`)

- Isolated from `CampaignsService` — injected into `MatchCentreModule`
- `triggerCampaignEvent(fixtureId, triggerType, sourceEventId?)` — finds PUBLISHED campaigns with active time window, creates `CampaignTriggerEvent` with deterministic idempotency key `${campaignId}:${fixtureId}:${triggerType}:${sourceEventId ?? 'none'}`
- Failure-isolated: errors logged, never throw to callers
- `campaigns.module.ts` exports `CampaignTriggerService`

---

## F. Direct Challenge Concurrency Pattern

The atomic acceptance pattern at `fanAcceptDirectChallenge` uses a single `$transaction`:

```typescript
await this.prisma.$transaction(async tx => {
  const listingResult = await tx.challengeListing.updateMany({
    where: { id: listingId, status: 'OPEN', availablePoints: { gte: committedPoints } },
    data: { matchedPoints: { increment: committedPoints }, availablePoints: { decrement: committedPoints }, status: 'FULLY_MATCHED' },
  });
  if (listingResult.count !== 1) throw new ConflictException('Challenge already accepted or unavailable');

  const allocResult = await tx.gameweekPointsAllocation.updateMany({
    where: { fanUserId, gameweekId: listing.gameweekId, remainingAllocation: { gte: committedPoints } },
    data: { usedAllocation: { increment: committedPoints }, remainingAllocation: { decrement: committedPoints } },
  });
  if (allocResult.count !== 1) throw new ConflictException('Insufficient points allocation');
  // ... create ChallengeMatch, SocialPredictionPointsEntry records ...
});
```

**Idempotency key:** `direct-accept:${listingId}:${fanUserId}` — stored on `ChallengeMatch`.

**Concurrency proof:** `apps/api/src/social-prediction/direct-challenge-concurrency.integration.spec.ts` — runs against real dev DB, races two concurrent `atomicClaim` calls, asserts `['ACCEPTED', 'CONFLICT']` sorted. Runs as part of standard `vitest run` suite (not excluded). Passed in 50ms.

---

## G. Web Clients

All 4 new clients are in `apps/web/src/lib/`:

### `match-centre-client.ts`
- Uses `getToken()` internally from `auth-client`
- Functions: `getLiveFixtures()`, `getFixtureLiveState(fixtureId)`, `getLiveMatchDashboard(fixtureId)`, `getFixtureLineups(fixtureId)`, `getFixtureEvents(fixtureId)`, `getFixtureAvailability(fixtureId)`, `getFixturePlayerStats(fixtureId)`, `getLiveFantasyPreview(fixtureId)`

### `admin-match-centre-client.ts` (exported as `adminFootballClient` / `adminMatchCentreClient`)
- Uses `getToken()` internally
- Functions: `kickOff(fixtureId)`, `halfTime(fixtureId)`, `secondHalf(fixtureId)`, `fullTime(fixtureId)`, `addMatchEvent(fixtureId, dto)`, `deleteMatchEvent(eventId)`, `upsertPlayerStat(fixtureId, dto)`, `adminIngestSandboxData(payload)`, `adminGetIngestionLog(filters)`, `adminGetCapabilityStatus()`, `reopenFixture(fixtureId)`, `recalculateFixtureState(fixtureId)`, `syncProvider(fixtureId)`

### `social-prediction-client.ts`
- **DIFFERENT PATTERN** — uses `authFetch(path, token, options)` where token is passed as a parameter by callers (not retrieved internally)
- Base URL: `process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:4000'`
- Callers must: `const token = await getBetaToken(); await client.someFunction(token, ...args)`

### `admin-social-prediction-client.ts`
- Also uses `authFetch(path, token)` — token passed by callers
- Same pattern as `social-prediction-client.ts`

**Note:** `match-centre-client.ts` and `admin-match-centre-client.ts` call their methods via a `footballClient` / `adminFootballClient` named export used throughout existing pages.

---

## H. Fan Match Centre Pages (10 pages)

All under `apps/web/src/app/matches/`:

| Route | File | Notes |
|-------|------|-------|
| `/matches` | `page.tsx` | Fixture list, links to match centre |
| `/matches/live` | `live/page.tsx` | Live fixtures only, auto-polls |
| `/matches/[fixtureId]` | `[fixtureId]/page.tsx` | Match overview, tab nav |
| `/matches/[fixtureId]/lineups` | `[fixtureId]/lineups/page.tsx` | Starting XI + bench |
| `/matches/[fixtureId]/stats` | `[fixtureId]/stats/page.tsx` | Team stats |
| `/matches/[fixtureId]/timeline` | `[fixtureId]/timeline/page.tsx` | Match events chronological |
| `/matches/[fixtureId]/players` | `[fixtureId]/players/page.tsx` | Player ratings |
| `/matches/[fixtureId]/fantasy` | `[fixtureId]/fantasy/page.tsx` | Live fantasy preview, sorted by est. points desc |
| `/matches/[fixtureId]/predictions` | `[fixtureId]/predictions/page.tsx` | Live score, lock status, 15s auto-poll |
| `/matches/[fixtureId]/social` | `[fixtureId]/social/page.tsx` | Marketplace listings + direct challenges |

---

## I. Admin Live-Match Pages (11 pages)

All under `apps/web/src/app/admin/live-match/`:

| Route | File | Purpose |
|-------|------|---------|
| `/admin/live-match` | `page.tsx` | List live/all fixtures, filter toggle |
| `/admin/live-match/[fixtureId]` | `[fixtureId]/page.tsx` | Dashboard + lifecycle action buttons |
| `/admin/live-match/[fixtureId]/readiness` | `.../readiness/page.tsx` | Player availability + capability status |
| `/admin/live-match/[fixtureId]/lineups` | `.../lineups/page.tsx` | Lineups grouped by team, "Fire Lineup Confirmed" |
| `/admin/live-match/[fixtureId]/events` | `.../events/page.tsx` | Add/delete match events |
| `/admin/live-match/[fixtureId]/team-stats` | `.../team-stats/page.tsx` | Aggregated team stats |
| `/admin/live-match/[fixtureId]/player-stats` | `.../player-stats/page.tsx` | Upsert per-player stats |
| `/admin/live-match/[fixtureId]/fantasy-impact` | `.../fantasy-impact/page.tsx` | Live fantasy preview summary |
| `/admin/live-match/[fixtureId]/prediction-impact` | `.../prediction-impact/page.tsx` | Settlement status, prediction lock |
| `/admin/live-match/provider-readiness` | `provider-readiness/page.tsx` | Provider connection, capabilities grid |
| `/admin/live-match/ingestion-batches` | `ingestion-batches/page.tsx` | Sandbox ingest form + ingestion log |

**Note:** There is also an older `apps/web/src/app/admin/match-centre/` family (4 pages: standings, ingestion, ratings, fixture ingest) from an earlier phase of STORY-38. Both families exist — they serve different purposes and there is no duplication to resolve.

---

## J. Social Challenges & Marketplace Pages

### Social Challenges (`apps/web/src/app/social-challenges/`) — 5 pages

| Route | Purpose |
|-------|---------|
| `/social-challenges` | Hub page |
| `/social-challenges/incoming` | Incoming direct challenges |
| `/social-challenges/outgoing` | Outgoing direct challenges |
| `/social-challenges/new` | Create direct challenge |
| `/social-challenges/[challengeId]` | Challenge detail |

### Social Predictions Marketplace (`apps/web/src/app/social-predictions/`) — 6 pages

| Route | Purpose |
|-------|---------|
| `/social-predictions/marketplace/[fixtureId]` | Per-fixture marketplace |
| `/social-predictions/create/[marketId]` | Create listing for market |
| `/social-predictions/[listingId]` | Listing detail |
| `/social-predictions/my-listings` | My open/matched listings |
| `/social-predictions/allocation` | My points allocation |
| `/social-predictions/leaderboard` | Season/gameweek leaderboard |

---

## K. Seed State

`apps/api/prisma/seed.ts` changes vs baseline:

1. **Added `campaignTriggerEvent.deleteMany()`** before `sponsorCampaign.deleteMany()` (cascade order fix)
2. **Added `match-day-trigger-demo` campaign** — `status: PUBLISHED`, `campaignType: 'OTHER'`, window 2026-01-01 → 2027-01-01, `triggerCondition: 'MATCH_EVENT'`
3. **Removed demo direct challenge block** — had wrong field names (`creatorId`, `marketId`); removed entirely to keep seed clean

The seed runs clean: `prisma db seed` passes with no errors.

---

## L. TypeScript Rules (exactOptionalPropertyTypes)

`exactOptionalPropertyTypes: true` is active in both API and web. The most common trip wire:

**WRONG:**
```typescript
{ description: form.description || undefined }  // TS error: string|undefined not assignable to string
{ entityType: filter.entityType || undefined }
```

**CORRECT:**
```typescript
{ ...(form.description ? { description: form.description } : {}) }
{ ...(filter.entityType ? { entityType: filter.entityType } : {}) }
```

Also applies to `Prisma.DbNull` for nullable JSON fields when setting to null:
```typescript
metadataJson: someValue ?? Prisma.DbNull
```

---

## M. Next.js 15 Dynamic Params

All dynamic route pages use `use(params)` (not `await params`):
```typescript
export default function Page({ params }: { params: Promise<{ fixtureId: string }> }) {
  const { fixtureId } = use(params);
  // ...
}
```

---

## N. Safety Constraints (Preserved)

The following are permanently out of scope for this codebase:

- Real-money wallet, payments, checkout, orders, fulfilment, refunds
- Ticket purchases, ticket issuance, inventory reservation
- Live-provider ingestion (Opta, Stats Perform, Sportradar, API-Football, FIFA, PSL)
- External sports provider calls or scraping copyrighted sites
- Copyrighted player images
- AWS commands, Terraform, editing `.next`, introducing Kafka
- Production database access (local PostgreSQL only)
- Betting, odds, stakes, wagers, payouts, cashout, gambling mechanics
- Deposits, withdrawals, fiat/cash/crypto balances
- Paid-entry Fantasy or paid-entry Guess the Score
- Production rewards redemption, production sponsor billing
- Player prices have no cash value, market value, transfer fee, or betting odds
- Fan Value is non-financial

---

## O. Exact Resume Order

The STORY-38 implementation is **complete**. The only remaining action is to commit when the user instructs.

### When the user says "commit this":

1. **Verify gates are still passing** (in case of intervening changes):
   ```bash
   cd apps/api && npx prisma validate && npx tsc --noEmit
   cd apps/web && npx tsc --noEmit
   cd apps/api && npx vitest run 2>&1 | tail -10
   cd apps/api && npx prisma db seed
   ```

2. **Stage all STORY-38 files** (explicit staging, never `git add -A`):
   ```bash
   git add apps/api/prisma/schema.prisma
   git add apps/api/prisma/seed.ts
   git add apps/api/prisma/migrations/20260609063038_drop_old_notification_prefs/
   git add apps/api/prisma/migrations/20260613000001_social_prediction_match_centre/
   git add apps/api/prisma/migrations/20260613000002_direct_challenges_campaign_triggers/
   git add apps/api/src/admin-operations/admin-operations.service.ts
   git add apps/api/src/app.module.ts
   git add apps/api/src/beta-feedback/beta-feedback.service.spec.ts
   git add apps/api/src/beta-feedback/beta-feedback.service.ts
   git add apps/api/src/campaigns/
   git add apps/api/src/match-centre/
   git add apps/api/src/social-prediction/
   git add apps/web/src/app/admin/live-match/
   git add apps/web/src/app/admin/match-centre/
   git add apps/web/src/app/admin/social-predictions/
   git add apps/web/src/app/match-centre/
   git add apps/web/src/app/matches/
   git add apps/web/src/app/social-challenges/
   git add apps/web/src/app/social-predictions/
   git add apps/web/src/lib/admin-match-centre-client.ts
   git add apps/web/src/lib/admin-social-prediction-client.ts
   git add apps/web/src/lib/match-centre-client.ts
   git add apps/web/src/lib/social-prediction-client.ts
   git add docs/platform/
   ```

3. **Commit:**
   ```bash
   git commit -m "$(cat <<'EOF'
   feat: live match intelligence, social prediction gaming & direct challenges

   Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
   EOF
   )"
   ```

4. **Update memory** — replace `project_story38_complete.md` noting the story is fully committed.

### If starting a new story:

- Gate baseline: **1528 API tests (53 files)**, **319 web pages**
- Latest migration: `20260613000002_direct_challenges_campaign_triggers`
- Seed is clean; `campaignTriggerEvent.deleteMany()` is the first seed teardown call
- The `direct-challenge-concurrency.integration.spec.ts` runs as part of standard suite — do not exclude it
- Web client token pattern: `social-prediction-client.ts` requires callers to pass token; `match-centre-client.ts` retrieves token internally

---

## P. File Map — Quick Reference

```
apps/api/
  prisma/
    schema.prisma                          ← MODIFIED: 12 new models, 3 new enums
    seed.ts                                ← MODIFIED: trigger campaign, teardown order
    migrations/
      20260609063038_drop_old_notification_prefs/  ← NEW (untracked)
      20260613000001_social_prediction_match_centre/  ← NEW (untracked)
      20260613000002_direct_challenges_campaign_triggers/  ← NEW (untracked)
  src/
    app.module.ts                          ← MODIFIED: imports MatchCentreModule, SocialPredictionModule
    match-centre/                          ← NEW: MatchCentreModule (16-method service)
    social-prediction/                     ← NEW: SocialPredictionModule + concurrency integration test
    campaigns/
      campaign-trigger.service.ts          ← NEW: CampaignTriggerService
      campaign-trigger.service.spec.ts     ← NEW
      campaigns.module.ts                  ← MODIFIED: exports CampaignTriggerService
    admin-operations/
      admin-operations.service.ts          ← MODIFIED: season-switching checks
    beta-feedback/
      beta-feedback.service.ts             ← MODIFIED
      beta-feedback.service.spec.ts        ← MODIFIED

apps/web/src/
  lib/
    match-centre-client.ts                 ← NEW: uses getToken() internally
    admin-match-centre-client.ts           ← NEW: uses getToken() internally
    social-prediction-client.ts            ← NEW: token passed by callers
    admin-social-prediction-client.ts      ← NEW: token passed by callers
  app/
    matches/                               ← NEW: 10 fan match centre pages
    social-challenges/                     ← NEW: 5 direct challenge pages
    social-predictions/                    ← NEW: 6 marketplace pages
    admin/
      live-match/                          ← NEW: 11 admin live-match pages
      match-centre/                        ← NEW: 4 older admin match-centre pages
      social-predictions/                  ← NEW: admin social predictions pages

docs/platform/
  LIVE-MATCH-DATA-ARCHITECTURE.md         ← NEW
  PLAYER-PERFORMANCE-DATA-MODEL.md        ← NEW
  SOCIAL-PREDICTION-MATCHMAKING.md        ← NEW
  API-ROUTE-INVENTORY.md                  ← MODIFIED
  FRONTEND-ROUTE-INVENTORY.md             ← MODIFIED
  DATABASE-MIGRATION-INVENTORY.md         ← MODIFIED
  PLATFORM-OVERVIEW.md                    ← MODIFIED
  BETA-READINESS-REVIEW.md                ← MODIFIED
  ADMIN-CAPABILITY-GAP-REVIEW.md          ← MODIFIED
  STORY-BY-STORY-CODE-WALKTHROUGH.md      ← MODIFIED
```
