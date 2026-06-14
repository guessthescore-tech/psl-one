# PSL One — Glossary

**Purpose:** Definitions of product and technical terms  
**Audience:** All contributors  
**Status:** Current as of STORY-39  

---

## Football Domain

**Competition** — A football tournament or league. PSL One supports multiple competitions (e.g., FIFA World Cup 2026, PSL Premiership 2026/27). Each competition has one or more seasons.

**Season** — A specific running instance of a competition. Seasons are the primary scope boundary for Fantasy, predictions, social predictions, leaderboards, Fan Value, and player stats. Only one season is `isActive: true` at any time.

**Active Season** — The season with `isActive: true`. This is the season fans interact with for live Fantasy, predictions, and challenges. Currently: FIFA World Cup 2026.

**Prepared Season** — A season in `UPCOMING` status with all readiness checks configured but not yet activated. Currently: PSL Premiership 2026/27.

**Historical Season** — A past season (`isActive: false`, `status: COMPLETED` or similar). Its data is preserved and read-only. The FIFA World Cup 2026 will become historical after PSL activation.

**SeasonTeam** — A club registered to a specific season. Season-scoped so that a club's squad can differ between competitions.

**Fixture** — A scheduled match between two teams. Has lifecycle: `SCHEDULED → LIVE → FINISHED`. Fixtures must be `isPublished: true` to be eligible for predictions.

**Gameweek** — A collection of fixtures within a defined date window, used to scope Fantasy scoring and transfer deadlines.

**Matchday** — Informal term for a day when fixtures are played. Managed via `GameweekOperationsModule`.

**Venue** — A stadium where fixtures are played.

---

## Fan Engagement

**Fan Value** — A non-financial loyalty score awarded to fans for platform engagement (predictions, Fantasy participation, social activity, achievements). Stored in `FanValueLedger`. Has no cash value. Cannot be converted to money. Not the same as gameplay points.

**Gameplay Points** — System-issued points used in Social Prediction challenges. Allocated per gameweek/fixture by admins. Cannot be purchased, transferred between users, withdrawn, or converted to money. Used only for platform scoring.

**Points Allocation** — An admin grant of gameplay points to a fan for a specific gameweek, enabling them to participate in social prediction challenges.

**Points Commitment** — The amount a fan stakes on a social prediction challenge from their gameplay points balance.

**Points Return Rate** — The multiplier applied when a fan wins a challenge. E.g., a 2× return on a correct prediction.

**Confidence Multiplier** — A bonus applied to Fan Value or prediction scoring based on prediction confidence level.

**Active Season Override** — An explicit `seasonId` passed to a query to retrieve data for a non-active season (e.g., viewing historical World Cup Fantasy performance while PSL is live).

---

## Social Prediction Gaming

**Challenge Listing** — A fan's posted offer to compete in a prediction challenge for a specific fixture. Has a stake amount (gameplay points), position (SUPPORTING/OPPOSING), and capacity.

**Marketplace Listing** — A public challenge listing open to any fan.

**Direct Challenge** — A challenge listing sent to a specific user (`challengedUserId`). Only that user can accept.

**Partial Match** — A challenge match where only part of the listed capacity is filled by a single opponent.

**Full Match** — All capacity filled by one or more opponents.

**FIFO Matching** — First-in-first-out deterministic order for public challenge matching. No randomness, no hidden weighting.

**Immutable Points Ledger** — `SocialPredictionPointsEntry` records are never updated. Corrections are new entries only. Types: `POINTS_COMMITTED`, `POINTS_AWARDED`, `POINTS_FORGONE`, `VOID_RESTORED`.

**User-to-User Transfer Prohibited** — Gameplay points from one fan's allocation cannot be sent to another fan except through the challenge match result.

---

## Fantasy Football

**Fantasy Team** — A fan's selected squad of players, scored over gameweeks.

**Transfer** — Swapping a player in or out of a Fantasy team during a transfer window.

**Chip** — A one-time advantage (wildcard, triple captain, bench boost, free hit).

**Auto-Substitution** — Automatic bench coverage when a selected player scores 0 points.

**Provisional Fantasy Points** — Points calculated before official results are confirmed. Distinguished from official settled points.

---

## Platform Architecture

**Bounded Context** — A domain area with clear ownership, its own NestJS module, and defined interfaces to other contexts. PSL One has 25+ bounded contexts in `apps/api/src/`.

**Module** — A NestJS `@Module()` class grouping a service, controller, and DTOs for one bounded context.

**Sandbox** — A mode where external provider calls are simulated locally. No real API calls made. Example: `SiliconEnterpriseSandboxWalletAdapter`.

**Provider Required** — A capability where the interface is built but an external provider contract is needed before production enablement.

**Production Disabled** — Code exists and passes tests, but is gated from production execution by a readiness flag or missing provider configuration.

**Dry Run** — A read-only analysis that describes what an operation *would* do without performing it. All dry-run responses carry `dryRunOnly: true`.

**Activation Approval** — An admin-created record (`SeasonActivationApproval`) confirming that all readiness gates have been verified. Status is `APPROVED` — this does not activate the season. Actual activation is a separate controlled operation.

**Activation** — The transition of a prepared season to `isActive: true`. Requires 13-check gate, explicit PSL_ADMIN trigger, and approval record. Not yet implemented in the current codebase.

**Season Switching** — The controlled process of moving fan-facing operations from one active season to another (e.g., World Cup → PSL). Managed by `SeasonSwitchingModule`.

**Readiness Check** — One of 13 named checks that must pass before season activation (e.g., `clubs`, `fixtures_published`, `squad_import`).

**AdminAuditLog** — An immutable record of every admin mutation, written to the database. Actor user ID captured from JWT context.

**Idempotency Key** — A unique string used to prevent duplicate operations. Example: `direct-accept:{listingId}:{fanUserId}` in social prediction challenge acceptance.

---

## Wallet and Commerce

**Sandbox Wallet** — The local wallet integration using `SiliconEnterpriseSandboxWalletAdapter`. Makes zero outbound HTTP calls. No real money.

**Wallet Provider** — An external financial services provider that holds customer funds. PSL One does not hold funds. No production wallet provider is wired.

**Fan Value ≠ Gameplay Points** — Fan Value is a non-financial loyalty score. Gameplay points are a separate system-issued challenge currency. They are distinct models with distinct tables.

**Prediction Points ≠ Money** — Prediction points, challenge stakes, and Fan Value points have no monetary value. PSL One is not a betting or gambling product.

**Wallet Linking ≠ Funds Custody** — Linking a wallet provider account records a reference ID. PSL One does not hold, move, or custody funds.

---

## Seasons Distinctions

| Term | Meaning |
|------|---------|
| Active season | `isActive: true` — fans play here |
| Prepared season | `status: UPCOMING` — readiness checks done, not activated |
| Historical season | Past season, data preserved read-only |
| Season context | The season resolved for a fan operation (defaults to active) |
| Explicit season override | `?seasonId=` query param for historical data |
