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

### STORY-26 — PSL Club, Squad & Season Data Readiness

**Goal:** Ensure all PSL clubs (including promoted clubs once confirmed) and their squads are ready for the season.

**Work:**
- Review existing team data — identify PSL clubs already in the system
- Add missing PSL clubs (promoted teams once official)
- Import/validate official PSL squad data (player registrations, transferred players)
- Set correct `fantasyPrice` values calibrated for PSL (budget-balanced)
- Set player `position` values accurately
- Validate: every PSL club has a full squad (minimum 15 registered players)
- Validate: no duplicate external IDs or conflicting slugs

**Acceptance:** Admin can browse PSL season teams and see accurate, complete squads.

---

### STORY-27 — PSL Fixture Import, Validation & Publishing Workflow

**Goal:** Import the official PSL fixture calendar and validate it before publishing to fans.

**Work:**
- Import all 30 PSL matchday rounds as gameweeks
- Import all fixtures with correct kickoff times and venues
- Assign fixtures to gameweeks using auto-assign or manual assignment
- Validate: no fixture without a gameweek, no gameweek without fixtures
- Admin preview + confirmation step before fixtures are published
- Set fixture status to `SCHEDULED` for all pre-season fixtures

**Acceptance:** PSL fixtures are browsable at `/football/fixtures` with correct dates and teams.

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

### Testing
- All existing 812 API tests must remain green
- New tests should cover PSL-specific rule variants (30-round seasons, squad sizes)
- Integration tests should cover full fixture-to-prediction-to-settlement lifecycle with PSL data

### Fixture Timing
- PSL season typically starts August/September
- World Cup ends late June 2026
- Sprint 2 window: approximately July 2026
- Official PSL fixture release: typically 4–6 weeks before season start
