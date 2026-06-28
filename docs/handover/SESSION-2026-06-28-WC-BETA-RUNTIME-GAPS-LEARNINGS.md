# Session Handover - 2026-06-28
## WC Beta Runtime Gaps, Player Sync, and Sitewide Live Data

**Date:** 2026-06-28
**Status:** Documented - runtime gaps resolved in code, deploy wiring added for beta population, targeted local validation completed
**Scope:** Explain why the beta could pass smoke tests yet still render empty or mock-looking surfaces, what changed, and what still needs to be verified operationally.

---

## Summary

The beta smoke tests were not lying, but they were incomplete.

The experience app was already wired to live beta endpoints in several places, yet some of the backing tables were still empty or only partially populated in the deployed environment. That meant:

- fixtures could render while players still showed as empty
- stories could render while some pages still fell back to design-review content
- the site could appear healthy in smoke tests while the underlying data shape was still wrong for a few visible routes

The important lesson is that routing and smoke checks prove wiring, not completeness of the beta dataset.

---

## What Changed

1. The experience app pages that need live data were moved onto the shared server API base rather than localhost-oriented assumptions.
2. The homepage story rail now uses the live editorial feed directive instead of depending on mock-only content.
3. The players and fantasy views now try the World Cup season explicitly and fall back to top performers instead of assuming the player pool is already complete.
4. The backend now has a safe player-stat sync path that writes Sportmonks-backed facts into both `FantasyPlayerMatchStat` and `PlayerMatchStats`.
5. The beta World Cup seed/backfill path now includes season registration rows, fantasy rules, prediction rules, and player pricing so fresh or partial databases can be populated non-destructively.
6. The replay harness and live provider wiring were documented and gated so settlement remains domain-owned and idempotent.
7. The beta deployment workflow now runs the non-destructive World Cup backfill first and then player-stat sync when Sportmonks is configured, using the compiled script path inside the API container.

---

## Why Smoke Tests Passed But The Site Still Looked Wrong

There were three different failure classes:

1. **Data incomplete, not code broken**
   - Some player and fantasy surfaces depend on `FantasyPlayerMatchStat`, `PlayerMatchStats`, `SeasonTeam`, and price rows.
   - If those tables are empty or only partially populated, the UI can still technically render but show "No players found" or a thin fallback state.

2. **Design-review mode still exists by design**
   - Several pages intentionally keep `DESIGN_REVIEW_DATA` content available for review flows.
   - If the environment or route mode is wrong, the page can look like it is showing mock data even when the code is behaving as written.

3. **Server-rendered experience pages need the right beta API base**
   - Pages that resolve their API base differently on Vercel vs EC2 can pass local checks but fail at runtime if they still point at localhost or an unavailable service.

Smoke tests verified that the routes existed and the compiled pages booted. They did not guarantee that the beta database contained every fact those pages expect.

---

## Page Map

### Fantasy

- `/fantasy`
- `/fantasy/onboarding`
- `/fantasy/fixture-difficulty`
- `/fantasy/fixtures`
- `/fantasy/history`
- `/fantasy/history/[gameweekId]`
- `/fantasy/leagues`
- `/fantasy/leagues/create`
- `/fantasy/leagues/join`
- `/fantasy/leagues/[leagueId]`
- `/fantasy/leagues/[leagueId]/teams/[teamId]`
- `/fantasy/page`
- `/fantasy/points`
- `/fantasy/rules`
- `/fantasy/search`
- `/fantasy/stats`
- `/fantasy/team`
- `/fantasy/team/chips`
- `/fantasy/team/transfers`

### Predictions

- `/guess-the-score`
- `/predict`
- `/predict/challenge`
- `/predict/challenge/accept`

### Match Centre and Fixtures

- `/match-centre`
- `/fixtures`
- `/matches`
- `/matches/[fixtureId]`
- `/matches/[fixtureId]/motm`
- `/world-cup`
- `/world-cup/live`

### Players and Stats

- `/players`
- `/players/[playerId]`
- `/players/[playerId]/stats`
- `/stats/season`
- `/stats/standings`
- `/stats/compare`
- `/stats/awards`
- `/stats/hall-of-fame`

### Account and Auth

- `/account`
- `/account/onboarding`
- `/account/profile`
- `/account/security`
- `/account/notifications`
- `/account/favourite-team`
- `/account/delete`
- `/sign-in`
- `/verify-email`
- `/forgot-password`
- `/reset-password`

### Media and Editorial

- `/news`
- `/videos`
- `/media/[slug]`
- `/scan`

---

## Root Cause

The beta did not have a single bug.

It had a data-flow mismatch:

- some surfaces expected the World Cup player pool to already exist
- some surfaces expected stat rows that were never backfilled
- some surfaces expected the beta API base to be resolved server-side
- some surfaces were still intentionally reading from design-review data

The fix path is to keep the code on the live beta contract and make the data contract complete enough for that code to render normally.

---

## What We Learned

1. Live provider availability is only useful if the domain tables that consumers read from are actually populated.
2. `FantasyPlayerMatchStat` alone is not enough if player profile and stats pages also read `PlayerMatchStats`.
3. World Cup beta pages must resolve the World Cup 2026 season explicitly. Generic active-season lookups are too loose for beta.
4. Smoke tests prove route health, not data completeness.
5. Design-review mock data must stay fenced off from live beta mode. If the boundary is fuzzy, an intentional review state looks like a runtime outage.
6. The safe ingestion path is the right path for beta: write provider-backed facts into the domain tables, then let existing pages consume them.
7. Deployment validation should include both compiled runtime paths and actual beta data shape checks.
8. Verification email is a separate operational concern from the World Cup data flow. It needs provider configuration, not just UI wiring.

---

## Remaining Gaps

These are still intentional follow-ups, not regressions:

- verification email provider rollout still needs to be fully completed in beta
- provider-backed player-stat ingestion should be re-run whenever new finished WC fixtures land so fantasy and player views stay populated
- some screens remain design-review-only by design and should not be mistaken for runtime failures; these are intentionally review-only surfaces, not outages

---

## Current Beta Behaviour

- Homepage stories render from the live editorial feed.
- Fixtures and live match pages are connected to the beta API base.
- Fantasy and players pages prefer live season data and top performers.
- The beta deploy now backfills the World Cup data set non-destructively before the app starts.
- When Sportmonks is configured, beta deploy also syncs finished fixture player stats into the fantasy/player stat tables.
- Replay settlement remains domain-owned and idempotent.
- The beta can still look empty if the backing tables are not populated yet.

---

## Validation

- API targeted tests: PASS
  - `pnpm --filter @psl-one/api test -- world-cup-beta-backfill.service.spec.ts sportmonks.adapter.spec.ts`
  - 2 files passed, 17 tests passed
- Experience regression tests: PASS
  - `pnpm --filter @psl-one/experience test -- experience.spec.ts`
  - 1 file passed, 1,660 tests passed
- Diff hygiene: PASS
  - `git diff --check`

The full repository acceptance gate was not re-run during this handover save. The remaining pre-release gate is still:

```bash
pnpm --filter @psl-one/api db:seed
pnpm --filter @psl-one/api db:seed
pnpm --filter @psl-one/api prisma validate
pnpm --filter @psl-one/api typecheck
pnpm --filter @psl-one/api test
pnpm --filter @psl-one/api build
pnpm --filter @psl-one/web typecheck
pnpm --filter @psl-one/web test
pnpm --filter @psl-one/web build
```
