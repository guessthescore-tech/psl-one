# STORY-26 — PSL Club, Squad & Season Data Readiness

> **Historical Implementation Record** — This document was created during Sprint delivery as a working reference. It may be superseded by content in `docs/architecture/`, `docs/engineering/`, `docs/reference/`, or `docs/domain/`. Do not use as the canonical source for system behaviour.


**Sprint:** Sprint 2 — PSL Season Readiness  
**Theme:** Transition from World Cup beta data to PSL season operating mode  
**Goal:** Ensure all PSL clubs and their squads are accurately represented in the system and ready for the 2026/27 season, without breaking WC 2026 historical data

---

## Context

Sprint 1 shipped with World Cup 2026 data (48 teams, 1200 players, 104 fixtures, 9 gameweeks) seeded in `psl_identity_dev`. The platform supports multiple concurrent competitions by design. PSL season data must be added alongside — not instead of — WC 2026 data.

STORY-26 is **data and configuration only**. No new product features. No migrations. No AWS. No Kafka. No financial mechanics.

---

## Pre-Story Expert Lens Checklist

Before writing a single line of code, apply these lenses:

### Enterprise Architect
- This story belongs to the **Football Core** bounded context
- No new Prisma models required — `Competition`, `Season`, `Team`, `Player` already exist
- A new PSL `Season` will be created with status `UPCOMING` (not `ACTIVE` yet — activation is STORY-28)
- No cross-context Prisma leakage — data readiness work stays in Football Core

### DDD Architect
- Aggregate roots: `Competition` (owns `Season`), `Team` (owns `Player`)
- Do not hardcode team counts — PSL has 16 teams but promoted/relegated clubs change each season
- Use `slug` as the human-readable team identifier — ensure uniqueness before adding new teams
- `externalId` on `Team` and `Player` enables provider-neutral import — use it

### Staff Engineer
- All mutations must be admin-only (`PSL_ADMIN` role)
- No audit logs wired for team/player mutations in Sprint 1 — this is a known deferred gap; do not add audit logs unless explicitly instructed
- Tests: all 812 existing API tests must pass after this story; new tests should cover PSL club count, squad completeness, and player price ranges
- TypeScript strict mode: `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess` — all new code must compile cleanly

### Security Engineer
- All player and team data is public — no PII concerns
- `fantasyPrice` values must be within a reasonable calibrated range — validate on import
- No player personal data (date of birth, nationality beyond team assignment, agent details) needed

### Product Manager
- **WC 2026 season must remain available** — do not change its status or delete its data
- **PSL season status should be `UPCOMING`** at end of this story — only STORY-28 activates it
- **Acceptance is manual review by admin**, not automated fan-facing deployment
- **Out of scope:** fixture import (STORY-27), competition switching (STORY-28), fantasy calibration (STORY-29)

---

## Scope

### In Scope

1. **Create PSL 2026/27 season** (status: `UPCOMING`)
   - Link to existing PSL competition (or create one if not seeded)
   - Season name, start/end date placeholders (official dates TBD)
   - Season must not activate — status remains `UPCOMING`

2. **Review and update existing PSL teams**
   - Identify all PSL clubs already in the database (Kaizer Chiefs, Orlando Pirates, Mamelodi Sundowns, etc.)
   - Confirm each club has: `name`, `slug`, `shortName`, `country`, `logoUrl` placeholder
   - Add any missing top-flight PSL clubs (based on 2025/26 season — do not guess 2026/27 promoted clubs until officially confirmed)

3. **Add promoted/relegated club handling**
   - Do not hardcode `COUNT = 16`
   - Season-specific club participation is driven by the `Fixture` model (which teams are in fixtures), not a static team count
   - Document which clubs are currently seeded vs. which will be added after official announcement

4. **Review and update player data**
   - Ensure all seeded PSL club players have: `position`, `fantasyPrice` (calibrated for PSL budget model), `name`, `teamId`
   - Flag any players missing `position` or `fantasyPrice`
   - Calibrate `fantasyPrice` so that a valid squad can be assembled within the planned PSL budget (e.g., 100M FV)
   - Use `externalId` on players if a data source is available — leave null if manual entry

5. **Validate squad completeness**
   - Every PSL club must have a minimum of 15 registered players
   - Validate: no duplicate `externalId` or conflicting `slug` across teams

6. **Provider-neutral data source approach**
   - Data may come from: PSL directly, a licensed provider (Opta, Stats Perform), manual entry, or CSV import via `/admin/imports`
   - The import pipeline must handle all sources without code changes
   - If PSL has not yet released official squad data, seed with reasonable placeholder squads and note them as `provisional`
   - Make no assumptions about final official squad composition until data is available

7. **Venue data quality checks**
   - Review seeded `Venue` records for PSL stadiums (name, city, capacity)
   - Add missing PSL stadium venues if not already present
   - Prefer existing `Venue` model — no new venue-related models needed

8. **Data quality validation**
   - Clubs: name, slug, shortName, country, logoUrl (placeholder acceptable)
   - Players: name, position, teamId, fantasyPrice — flag any missing fields
   - Squads: minimum 15 players per club, positional balance (2 GK, 5 DEF, 5 MID, 3 FWD minimum)
   - Season: competition linkage, status, start/end date placeholders
   - No duplicate externalIds or slugs across teams or players

9. **Prefer existing patterns — add new models only if unavoidable**
   - Use existing `Competition`, `Season`, `Team`, `Player`, `Venue`, `Fixture`, `CompetitionImportJob` models
   - Do not introduce new bounded contexts or Prisma models for this story
   - Use existing admin import pipeline (`/admin/imports`) for data ingestion where possible
   - Manual admin review via existing admin pages before any data is considered ready

### Out of Scope

- Do not import PSL fixtures (STORY-27)
- Do not activate the PSL season (STORY-28)
- Do not configure PSL fantasy rules (STORY-29)
- Do not calibrate prediction points for PSL (STORY-30)
- Do not implement new API routes unless the existing import pipeline is genuinely insufficient
- Do not introduce Kafka, AWS commands, or Terraform
- Do not edit `.next`
- Do not touch production databases — local PostgreSQL only
- Do not implement sponsor, commerce, reporting, compliance, or any financial mechanics
- Do not introduce new product domains — Football Core only
- Do not implement new admin management UIs unless explicitly needed for this data review

---

## Acceptance Criteria

```
Given: a clean seed of the local development database
When:  an admin logs in as admin@psl.co.za and navigates to the club/player admin tools
Then:  all PSL 2025/26 top-flight clubs are present with name, slug, shortName, and logoUrl
And:   each PSL club has a minimum of 15 players with position and fantasyPrice set
And:   no duplicate externalId or slug exists across teams
And:   the PSL 2026/27 season exists with status UPCOMING
And:   the WC 2026 season remains with its original status (ACTIVE or COMPLETED — unchanged)
And:   all 812 API tests pass
And:   the platform seed runs cleanly on a fresh database
```

Additional acceptance criteria:
```
Given: a PSL club's squad is browsed at GET /football/teams/:slug
Then:  the response includes at least 15 players with position and fantasyPrice
```

```
Given: admin attempts to add a player with a duplicate externalId
Then:  the API returns 409 Conflict (or the import flags it as a conflict)
```

---

## Implementation Guidance

### Step 1 — Baseline audit

Before writing code:
1. `GET /football/competitions` — identify whether a PSL competition already exists
2. `GET /football/seasons` — identify whether a PSL season exists
3. `GET /football/teams?limit=100` — count and list all teams currently in the DB
4. Identify which teams are PSL clubs vs. WC 2026 teams
5. For each PSL club, check: `GET /football/teams/:slug` — count players, check positions and prices

### Step 2 — Create PSL season (if not exists)

Use `POST /admin/competitions` and `POST /admin/competitions/:id/seasons` if they don't already exist. Do not create them manually in the seed — use the admin API so the import pipeline is exercised.

PSL season record:
```json
{
  "name": "PSL 2026/27",
  "year": 2026,
  "status": "UPCOMING",
  "startDate": "2026-08-01",
  "endDate": "2027-05-31"
}
```

### Step 3 — Review and update PSL club records

For each PSL club found in step 1:
- Confirm `slug` is URL-safe and human-readable (e.g., `kaizer-chiefs`, `orlando-pirates`)
- Confirm `shortName` is set (e.g., `Chiefs`, `Pirates`)
- Confirm `logoUrl` is set (placeholder URL is acceptable for now)
- Update via `PATCH /admin/competitions/:competitionId/teams/:id` if fields are missing

### Step 4 — Add missing PSL clubs

If any major PSL clubs are absent, add them via the admin API:
```json
{
  "name": "Kaizer Chiefs",
  "shortName": "Chiefs",
  "slug": "kaizer-chiefs",
  "country": "ZA",
  "logoUrl": "/logos/kaizer-chiefs.png"
}
```

Do not add promoted/relegated clubs speculatively — only add clubs confirmed for the 2025/26 completed season baseline.

### Step 5 — Review player data per club

For each PSL club:
1. `GET /football/teams/:slug` — count players by position
2. Verify: at least 2 goalkeepers, 5+ defenders, 5+ midfielders, 3+ forwards
3. Verify all have `fantasyPrice` set in a calibrated range
4. Update via `PATCH /football/players/:id` or re-import if prices are wrong

### Step 6 — Fantasy price calibration

PSL fantasy budget model (configurable in STORY-29, but calibrate data now):
- Total squad of 15 players within a 100M FV budget
- Goalkeeper price range: 4M–8M
- Defender price range: 4M–9M
- Midfielder price range: 5M–12M
- Forward price range: 5M–15M
- Top 5 players (Sundowns, Pirates, Chiefs starters) should be near the top of their range
- Ensure a valid budget-legal squad can be assembled from each club

### Step 7 — Validate and test

After data updates:
1. Run all 812 API tests: `pnpm --filter @psl-one/api test`
2. Run seed on fresh database: `pnpm --filter @psl-one/api db:seed` (WC data must seed correctly, PSL season script if added)
3. Manual smoke test: browse PSL clubs and squads via admin pages
4. Confirm WC 2026 data is untouched: `GET /football/seasons` must still show WC season

---

## Quality Gate (must pass before acceptance)

| Gate | Command | Expected |
|------|---------|----------|
| Seed | `pnpm --filter @psl-one/api db:seed` | No errors, expected row counts |
| Prisma validate | `cd apps/api && npx prisma validate` | Schema valid |
| API typecheck | `pnpm --filter @psl-one/api typecheck` | 0 errors |
| API tests | `pnpm --filter @psl-one/api test` | 812/812 pass (minimum) |
| API build | `pnpm --filter @psl-one/api build` | No compile errors |
| Web typecheck | `pnpm --filter @psl-one/web typecheck` | 0 errors |
| Web tests | `pnpm --filter @psl-one/web test` | 8/8 pass |
| Web build | `pnpm --filter @psl-one/web build` | No build errors |

**Do not claim tests passed unless the gate commands were run in the current session.**

---

## PSL Club Baseline (2025/26 top-flight — confirmed clubs)

The following clubs are expected in the 2025/26 PSL top-flight (use this as baseline, not the 2026/27 promoted list):

| Club | Short name | Slug |
|------|-----------|------|
| Kaizer Chiefs | Chiefs | kaizer-chiefs |
| Orlando Pirates | Pirates | orlando-pirates |
| Mamelodi Sundowns | Sundowns | mamelodi-sundowns |
| Cape Town City | CT City | cape-town-city |
| Stellenbosch FC | Stellies | stellenbosch |
| SuperSport United | SuperSport | supersport-united |
| TS Galaxy | Galaxy | ts-galaxy |
| Sekhukhune United | Sekhukhune | sekhukhune-united |
| Chippa United | Chippa | chippa-united |
| Golden Arrows | Arrows | golden-arrows |
| Royal AM | Royal AM | royal-am |
| Moroka Swallows | Swallows | moroka-swallows |
| Polokwane City | Polokwane | polokwane-city |
| Amazulu FC | Amazulu | amazulu |
| Maritzburg United | Maritzburg | maritzburg-united |
| Baroka FC | Baroka | baroka |

**Note:** Promoted/relegated clubs for 2026/27 season are NOT yet confirmed. Add them only after official announcement. Do not guess.

---

## Platform Guardrails (non-negotiable)

- No AWS commands
- No Terraform
- No Kafka
- Do not edit `.next`
- Local PostgreSQL only (`psl_identity_dev`)
- Do not touch production databases
- No financial mechanics (no money, fiat, crypto, betting, gambling)
- Fan Value is non-financial engagement metric only
- Do not activate PSL season — status must remain `UPCOMING` until STORY-28
- Do not delete or overwrite WC 2026 data
- Always run full quality gate before accepting the story
- Do not claim tests passed unless they were run

---

## Commit instruction (after acceptance)

```
git add apps/api/prisma apps/api/src apps/web/src docs
git restore --staged .next apps/web/.next apps/api/dist apps/web/out node_modules 2>/dev/null || true
git status --short
git commit -m "feat: psl club squad and season data readiness (story-26)"
```

**Do not commit until the quality gate passes and the story is explicitly accepted.**

---

## Recommended next story after STORY-26

**STORY-27 — PSL Fixture Import, Validation & Publishing Workflow**

Once clubs and squads are ready, import the official PSL fixture calendar and assign fixtures to gameweeks. All 30 PSL matchday rounds must be importable via the existing import pipeline with admin preview before publishing.
