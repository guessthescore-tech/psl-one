# PSL One — Sprint 2: PSL Season Readiness Plan

**Sprint:** Sprint 2  
**Theme:** PSL Season Data & Operating Model Readiness  
**Trigger:** World Cup ends, official PSL season data becomes available  
**Goal:** Transition from World Cup beta mode to PSL season operating mode

---

## Sprint 2 Purpose

After the World Cup, PSL One must shift from World Cup beta data to the official Premier Soccer League season. Sprint 2 is not commerce-first — it is data and calibration work. The platform must be able to ingest real PSL clubs, squads, and fixtures; validate data before publishing; and configure the fantasy and prediction engines for PSL rules.

Sprint 2 prepares the operating model. Sprint 3 turns on production and commerce.

---

## Guiding Principles for Sprint 2

### Do not hardcode team counts
The Premier Soccer League has 16 teams, but promoted and relegated clubs change each season. Sprint 2 must not hardcode `COUNT = 16` anywhere. Season-specific club participation must drive which clubs, players, and fixtures are active.

### Existing PSL clubs are baseline
Teams like Kaizer Chiefs, Orlando Pirates, Mamelodi Sundowns, etc. already exist in the system as examples or can be pre-seeded. Promoted/relegated clubs can be added once officially confirmed.

### Import-first, manual validation
All PSL fixture and squad data should be importable via the existing import pipeline (`/admin/imports`). Admins must be able to validate and preview before committing. No batch commits without review.

### Provider-neutral fixture data
PSL fixture data may come from the PSL directly, from a licensed data provider (Opta, Stats Perform, etc.), or via manual entry. The import pipeline must support all three without code changes. The `LiveMatchProviderInterface` adapter from Sprint 1 is the right pattern.

### Do not break World Cup data
The platform supports multiple competitions simultaneously. WC 2026 data can remain available for historical browsing. Sprint 2 adds a new PSL season; it does not delete or overwrite WC data.

---

## Candidate Stories

### STORY-26 — PSL Club, Squad, Season & Club Experience Readiness ✅ COMPLETE (2026-06-11)

**Goal:** Ensure all PSL clubs and their squads are ready for the season, and fans have a full club experience.

**Work completed:**
- 16 PSL clubs seeded with `SeasonTeam` participation for `psl-premiership-upcoming`
- 14 unique venues seeded (`Venue` model) with capacity and city
- `ClubProfile`, `ClubContentItem`, `ClubShopProduct` (8 per club, `CATALOGUE_ONLY`), `ClubExperienceStatus` seeded for all clubs
- `ClubExperienceService` — 11 fan-facing methods (club list, detail, overview, fixtures, results, squad, stats, stadium, tickets, shop, product)
- `ClubAdminService` — 24 admin methods across season management, player assignment, fixture assignment, readiness validation
- `ClubExperienceController` — full route suite with static-before-dynamic ordering for Fastify compatibility
- 11 fan web pages + 8 admin web pages
- 71 new tests; total 883 API tests passing

**Acceptance criteria met:** Admin can browse all 16 PSL clubs with readiness status. Fans can view club hub, squad, fixtures, results, stats, stadium, shop catalogue. Commerce stub returns `CATALOGUE_ONLY` with Sprint 3 note. All gate checks pass.

---

### STORY-27 — PSL Fixture Import, Validation & Publishing Workflow ✅ COMPLETE (2026-06-11)

**Goal:** Import the official PSL fixture calendar and validate it before publishing to fans.

**Work completed:**
- `Fixture.isPublished Boolean @default(true)` — existing WC2026 fixtures remain fan-visible; PSL import fixtures start `false`
- Migration `20260611000005_fixture_import`: `fixture_import_batches`, `fixture_import_rows` tables + 3 enums
- `FixtureImportService` (22 methods): batch CRUD, row CRUD, validation (ERROR/WARNING/INFO), conflict detection (DUPLICATE_FIXTURE, TEAM_SCHEDULE_OVERLAP, VENUE_OVERLAP), commit (idempotent, `isPublished=false`), publish (blocks if predictions/fantasy/events), auto-gameweek creation from round data
- `FixtureImportController` at `@Controller('fixtures/admin')` — 21 PSL_ADMIN routes
- `FootballService.listFixtures()` and `ClubExperienceService` fixture queries filter `isPublished: true`
- 10 admin web pages: imports list/new/detail/rows/validation/publish, season validation/conflicts/gameweeks/publishing
- `fixture-import-client.ts` — 21 typed API wrappers
- 110 new tests; total 922 API tests passing

**Acceptance criteria met:** Admin can create import batches, add rows, validate (row-level ERROR/WARNING), commit to provisional fixtures, and publish safely. Fan-facing fixture queries return only published fixtures. WC2026 fixtures remain visible (default `true`). RBAC enforced (401/403 for non-admin). All gate checks pass.

**Provider-neutral:** Import source enum supports MANUAL, CSV_UPLOAD, PROVIDER_API. No vendor parsing hardcoded.

**Commerce boundary:** No betting, odds, stakes, payouts, wallet, payment, checkout, order, or commerce mechanics introduced.

---

### STORY-28 — Competition Switching: World Cup Beta to PSL Season Mode

**Goal:** Activate the PSL season as the primary competition without losing WC 2026 data.

**Work:**
- Create a new `Season` for the PSL 2026/27 season and set it to `ACTIVE`
- Archive WC 2026 season (status: `COMPLETED`)
- Update default season context: fantasy team creation and predictions should default to PSL season
- Validate: fan fantasy teams for WC are retained but not active for PSL season
- Validate: WC prediction history is preserved and visible

**Acceptance:** `/football/seasons/active` returns PSL season; WC season is accessible historically.

---

### STORY-29 — PSL Fantasy Season Calibration

**Goal:** Configure fantasy rules and pricing for the PSL season operating model.

**Work:**
- Create a `FantasyRulesConfig` for the PSL season with appropriate values:
  - Squad size: 15 (typical PSL format)
  - Budget: calibrated to make squad selection interesting (e.g., 100M FV)
  - Transfers per gameweek: 1 free, 4 banked max
  - Formation rules: standard PSL formations
  - Scoring weights: goals, assists, clean sheets, saves, bonus points
- Calibrate player prices based on their expected contribution
- Validate: fans can create a legal PSL fantasy squad within the budget
- Validate: transfer rules correctly applied for 30-round season

**Acceptance:** Fans can create a PSL fantasy team that is within budget and meets squad rules.

---

### STORY-30 — Guess the Score PSL Season Calibration

**Goal:** Validate Guess the Score works for PSL fixtures.

**Work:**
- Verify prediction lock/settle cycle works for PSL fixture timeline
- Calibrate prediction point values (consider PSL scoring patterns vs. WC)
- Test: admin can lock predictions 1 hour before kickoff
- Test: admin can settle predictions after final whistle
- Test: void works for postponed PSL fixtures

**Acceptance:** Full prediction lifecycle tested against PSL fixtures.

---

### STORY-31 — Club Content & Editorial Readiness

**Goal:** Each PSL club has basic editorial content ready before season launch.

**Work:**
- Ensure all clubs have: name, slug, shortName, country, logoUrl
- Add club descriptions and history (brief editorial content)
- Validate: team detail page renders correctly for all 16 PSL clubs
- Validate: club logos display correctly

**Acceptance:** All PSL club pages render with correct content and branding.

---

### STORY-32 — Admin Operations QA & Route Smoke Testing

**Goal:** Validate every admin operational workflow works end-to-end with PSL data.

**Work:**
- Smoke test all admin routes with PSL season fixtures and clubs
- Validate: fixture assignment pipeline (assign all 30 rounds)
- Validate: prediction settlement on PSL fixtures
- Validate: fantasy scoring on PSL match stats
- Validate: achievement evaluation works with PSL context
- Validate: notification broadcast works
- Validate: admin command centre shows PSL season data

**Acceptance:** All 58+ admin routes work without errors against PSL season data.

---

### STORY-33 — Beta Feedback, Bug Fixes & UX Polish

**Goal:** Address bugs and UX issues discovered during World Cup beta.

**Work:**
- Collect and triage World Cup beta feedback
- Fix any prediction scoring edge cases
- Fix any fantasy transfer or deadline edge cases
- Polish key fan flows (registration, team creation, prediction making)
- Wire real auth token management in web app (replace dev-token placeholder)
- Improve error handling and empty state messages on key pages

**Acceptance:** Top 10 beta feedback items addressed; no P1 bugs open.

---

### STORY-34 — PSL Launch Data Checklist

**Goal:** Final data validation checklist before PSL season fan launch.

**Work:**
- [x] All 16 PSL clubs loaded (including promoted/relegated)
- [x] All squad registrations validated
- [x] All 30 matchday fixtures loaded with correct kickoff times
- [x] All fixtures assigned to gameweeks
- [x] Fantasy rules config active for PSL season
- [x] Player prices reviewed and calibrated
- [x] Achievement definitions reviewed for PSL context
- [x] Reward readiness definitions reviewed
- [x] Admin user(s) created and tested
- [x] All API tests pass on PSL data
- [x] Platform health: all green

**Acceptance:** Launch data checklist signed off by product owner.

---

## What NOT to do in Sprint 2

- Do not implement commerce or sponsor activation
- Do not implement production deployment (AWS)
- Do not implement CI/CD pipeline
- Do not implement real notification delivery (email/SMS/push)
- Do not implement rewards redemption
- Do not start POPIA compliance workflows
- Do not implement reporting builder or scheduled exports
- Do not implement full sponsor management portal

These are Sprint 3.

---

## Sprint 2 Technical Notes

### Database
- No new Prisma migrations expected for data readiness work
- Seed scripts should be extended to support PSL club and fixture data
- Use the existing import pipeline (`/admin/imports`) rather than custom seeding scripts

### Architecture
- Platform already supports multiple concurrent competitions
- No architectural changes needed — Sprint 2 is configuration and data

### Known deferred issues (from Sprint 1 expert review)

The following issues were identified in the Sprint 1 expert review and are documented here for Sprint 2 awareness. They do not block data readiness work but must be resolved before production:

**1. Audit log coverage**

Audit logs currently cover auth events (register, login, logout, password reset). Several domain mutations still need dedicated audit coverage before production, including prediction settlement, fantasy transfer, fan value posting, achievement awards, notification broadcasts, activity moderation, and admin dashboard actions. This should be addressed in Sprint 2 or Sprint 3 as a dedicated audit and governance story.

**2. Dev-token placeholder on web pages**

Several Sprint 1 web pages use a `dev-token` placeholder for local/demo API calls. This is acceptable for World Cup beta development but must be replaced with the real authenticated session and token flow before production launch. A UX pass is planned in STORY-33.

**3. CORS production readiness**

The API currently uses local development CORS settings (`localhost:3001` hardcoded). Before staging or production deployment, CORS origins must be environment-driven. No code change required in Sprint 2 — deferred to Sprint 3 pre-deployment.

**4. Performance indexes**

Some high-volume query paths should receive dedicated indexes before production-scale testing, especially fixtures, predictions, peer challenges, and fantasy leaderboard and scoring queries. No migrations required in Sprint 2 — deferred to Sprint 3 as a performance migration story.

**5. Admin user management**

Admin visibility exists through the command centre, but full user and role administration (promote, suspend, search) is not yet implemented. Deferred to Sprint 3.

**6. Sponsor, reporting, and compliance are readiness stubs**

Sponsor Management, Reporting Centre, and Compliance/POPIA Governance are command-centre readiness sections in Sprint 1. Full operational sponsor management, report export centre, and compliance workflow engine belong in Sprint 3. Keep Sprint 2 focused on PSL Season Readiness, data validation, fixture and squad ingestion, competition switching, QA, and beta feedback.

### Testing
- All existing 883 API tests must remain green (updated after STORY-26)
- New tests should cover PSL-specific rule variants (30-round seasons, squad sizes)
- Integration tests should cover full fixture-to-prediction-to-settlement lifecycle with PSL data

### Fixture Timing
- PSL season typically starts August/September
- World Cup ends late June 2026
- Sprint 2 window: approximately July 2026
- Official PSL fixture release: typically 4–6 weeks before season start
