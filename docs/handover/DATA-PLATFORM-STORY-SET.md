# PSL One Data Platform Story Set 1-10

**Purpose:** Close the live data gaps without relying on an official FIFA-owned feed, while keeping PSL inactive and the World Cup beta on provisional seed data where required.

**Baseline already in code:** `DataProviderModule`, `FixtureImportModule`, `MatchCentreModule`, `FootballModule`, `FantasyModule`, `DataIngestionLog`, fixture provenance fields (`providerSource`, `providerFixtureId`, `importedAt`, `lastSyncedAt`), and the WC beta backfill path.

**This set is additive.** No PSL activation, no scheduled ingestion, no production live-data provider calls.

## Story Map

| Story | Module | Migration name | Outcome |
|---|---|---|---|
| DP-01 | `DataProviderModule` | `20260629000001_add_data_provider_player_discovery` | Player discovery route for seeds and imports |
| DP-02 | `DataProviderModule`, `FixtureImportModule` | `20260629000002_add_world_cup_feed_ingestion_run_ledger` | Public schedule feed import into beta fixtures |
| DP-03 | `MatchCentreModule` | `20260629000003_add_data_ingestion_provenance_snapshot` | Ingestion log + provenance reads become first-class |
| DP-04 | `FixtureImportModule` | `20260629000004_add_fixture_publish_guardrails` | PSL manual seed stays provisional until approved |
| DP-05 | `MatchCentreModule` | `20260629000005_add_match_stats_provenance` | Stats and player ratings stay traceable to source |
| DP-06 | `MatchCentreModule` | `20260629000006_add_team_form_and_standings_refresh` | Season form and standings are season-scoped |
| DP-07 | `FantasyModule`, `DataProviderModule` | `20260629000007_add_provisional_player_pool_projection` | Keep players on provisional WC seed while prices and pool stay usable |
| DP-08 | `MediaModule`, `CampaignModule` | `20260629000008_add_curated_feed_items` | Highlights/news surfaces can be populated without blocking fixtures |
| DP-09 | `AdminDashboardModule` | `20260629000009_add_admin_data_readiness_panels` | Admins can see what is missing before asking for deployment |
| DP-10 | `FootballModule`, `DataProviderModule` | `20260629000010_add_multiseason_feed_registry` | Multi-season and future-sport expansion without schema rewrites |

## DP-01 — Player Discovery Route

**Module:** `DataProviderModule`

**Migration:** `20260629000001_add_data_provider_player_discovery` only if a new projection table is introduced. If not, no migration is required.

**Routes**
- `GET /admin/data-provider/discovery/players/:teamId`
- `GET /admin/data-provider/world-cup/player-pool-status`

**Acceptance criteria**
- Admin-only, protected by `JwtAuthGuard + RolesGuard + @Roles('PSL_ADMIN')`.
- The route returns adapter-backed players for the supplied team identifier.
- Missing/empty provider data returns an empty array, not a 500.
- The response never exposes provider keys.
- The player pool status endpoint reports the provisional seed counts and price coverage.

## DP-02 — World Cup Public Schedule Import

**Module:** `DataProviderModule`, `FixtureImportModule`

**Migration:** `20260629000002_add_world_cup_feed_ingestion_run_ledger` if the import run needs durable audit rows beyond `DataIngestionLog`.

**Routes**
- `POST /admin/data-provider/world-cup/fixtures/import`
- `GET /admin/data-provider/world-cup/fixture-status`
- `GET /admin/data-provider/world-cup/sync-status`
- `POST /admin/data-provider/world-cup/fixtures/refresh-status`

**Acceptance criteria**
- Dry-run remains the default.
- Write mode requires both `ALLOW_WORLD_CUP_WRITE=true` and `confirmWorldCupWrite=IMPORT_WORLD_CUP_BETA`.
- Fixtures are created from the public schedule feed, not from browser-side logic.
- Existing fixtures preserve valid score data unless the provider supplies a better value.
- Imported fixtures remain unpublished unless explicitly published later.

## DP-03 — Ingestion Provenance and Audit Reads

**Module:** `MatchCentreModule`

**Migration:** `20260629000003_add_data_ingestion_provenance_snapshot` if a dedicated provenance snapshot table is needed. Otherwise use the existing `DataIngestionLog`.

**Routes**
- `GET /admin/match-centre/ingestion-log`
- `GET /admin/match-centre/provenance/:entityType/:entityId`

**Acceptance criteria**
- Every ingest path writes a searchable ingestion record.
- Provenance reads return `sourceType`, `providerKey`, freshness, and timestamps.
- Entity provenance can be queried without reading raw provider payloads.
- No route returns provider secret values.

## DP-04 — Manual PSL Seed Guardrails

**Module:** `FixtureImportModule`

**Migration:** `20260629000004_add_fixture_publish_guardrails` if the publication flow needs extra state fields.

**Routes**
- `POST /fixtures/admin/imports`
- `POST /fixtures/admin/imports/:batchId/commit`
- `POST /fixtures/admin/publishing/season/:seasonId/publish-provisional`
- `POST /fixtures/admin/publishing/season/:seasonId/unpublish-provisional`

**Acceptance criteria**
- Manual PSL data stays provisional until separately published.
- Import validation does not activate the season.
- Gameweeks can be derived from the imported fixtures, but activation remains a separate approval.
- Batch commit, publish, and reject actions remain auditable.

## DP-05 — Match Stats and Player Ratings Provenance

**Module:** `MatchCentreModule`

**Migration:** `20260629000005_add_match_stats_provenance` only if new provenance columns are needed on stats tables.

**Routes**
- `GET /match-centre/fixture/:fixtureId/stats`
- `GET /match-centre/fixture/:fixtureId/player-ratings`
- `POST /admin/match-centre/ingest`
- `POST /admin/match-centre/player-ratings`

**Acceptance criteria**
- Fan reads show fixture stats with source provenance attached.
- Admin writes upsert stats and ratings rather than duplicating records.
- Match-centre writes record ingestion events.
- Ratings remain provisional until the underlying fixture is final.

## DP-06 — Standings and Team Form Refresh

**Module:** `MatchCentreModule`

**Migration:** `20260629000006_add_team_form_and_standings_refresh` if refresh timestamps or source fields need persistence changes.

**Routes**
- `GET /match-centre/standings/:seasonId`
- `GET /match-centre/team-form/:clubId?seasonId=...`
- `GET /admin/data-provider/discovery/standings/:seasonId`
- `GET /admin/data-provider/discovery/teams/:seasonId`

**Acceptance criteria**
- Standings and form are season-scoped.
- The season identifier is required, explicit, and stable.
- Provenance on the read surface reflects the underlying source record.
- Empty state is valid and should not fail the page.

## DP-07 — Provisional Player Pool and Fantasy Prices

**Module:** `FantasyModule`, `DataProviderModule`

**Migration:** `20260629000007_add_provisional_player_pool_projection` if an explicit projection table is introduced.

**Routes**
- `GET /fantasy/player-pool`
- `GET /fantasy/player-pool?position=...`
- `GET /admin/data-provider/world-cup/player-pool-status`

**Acceptance criteria**
- The player pool continues to use the provisional World Cup seed.
- Prices remain season-scoped.
- The pool can be filtered without relying on a live official feed.
- No player is duplicated across the same season and role.

## DP-08 — Curated News and Highlights Feed

**Module:** `MediaModule`, `CampaignModule`

**Migration:** `20260629000008_add_curated_feed_items` if a feed table is required.

**Routes**
- `GET /admin/data-provider/world-cup/media-status`
- `GET /world-cup/live`
- `GET /media` or the existing media routes already powering the fan UI

**Acceptance criteria**
- Highlights/news content can be populated independently of fixture ingestion.
- The live page renders even when the widget is absent.
- Media content is provenance-tagged and does not block fixture import.

## DP-09 — Admin Readiness Panels

**Module:** `AdminDashboardModule`

**Migration:** `20260629000009_add_admin_data_readiness_panels` only if persisted panel state is needed.

**Routes**
- `GET /admin/data-provider/world-cup-live-readiness`
- `GET /admin/data-provider/wc-beta-capability`
- `GET /admin/data-provider/psl-fixture-readiness`
- `GET /admin/data-provider/health`

**Acceptance criteria**
- Admins can see which feed pieces are configured, missing, or source-empty.
- Readiness responses are read-only.
- The response never leaks provider secrets.
- The panel text makes it obvious when the platform is awaiting public data.

## DP-10 — Multi-Season Feed Registry

**Module:** `FootballModule`, `DataProviderModule`

**Migration:** `20260629000010_add_multiseason_feed_registry` if a registry or namespace table is required.

**Routes**
- `GET /admin/data-provider/discovery/seasons`
- `GET /admin/data-provider/discovery/fixtures/:seasonId`
- `GET /admin/data-provider/discovery/teams/:seasonId`
- `GET /admin/data-provider/discovery/standings/:seasonId`

**Acceptance criteria**
- The platform can carry multiple seasons without rewriting fixture history.
- External IDs remain namespaced by provider/source.
- The same patterns can be reused for rugby, golf, or future sports without changing the fan-facing contract.
- Historical World Cup data remains untouched when PSL seasons are introduced.

## Execution Notes

- The current API already contains the main import and provenance primitives. The first useful code gap closed by this work is DP-01, which adds player discovery to the admin data-provider controller.
- Any additional schema changes should remain additive and must be reviewed before being applied.
- These stories should be implemented in order, because the later stories depend on the earlier provenance and ingestion primitives.
