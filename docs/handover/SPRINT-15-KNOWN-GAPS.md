# Sprint 15 — Known Gaps

## G1 — Parse key not provisioned

**Gap:** `PARSE_API_KEY` has not been placed in `apps/api/.env`. Live validation cannot proceed.

**Risk:** HIGH — PSL data path entirely unvalidated.

**Resolution:** Owner provisions key from parse.bot marketplace.

## G2 — Source-empty state unconfirmed

**Gap:** Cannot confirm whether source-empty is the actual state of psl.co.za fixtures until key is set.

**Risk:** LOW — source-empty is expected based on seasonal calendar (June).

**Resolution:** Run `sprint-14-parse-psl-fixtures.mjs` with key set.

## G3 — Parse.bot commercial terms not reviewed

**Gap:** Parse.bot wraps public psl.co.za data via scraper. This is not an official PSL developer API. Usage terms may restrict automated ingestion.

**Risk:** MEDIUM — unofficial scraper may be blocked; PSL may issue DMCA or access restriction.

**Resolution:** Owner reviews Parse.bot ToS and confirms usage is permitted.

## G4 — API-Football account still suspended

**Gap:** API-Football fallback for PSL route is inactive. If Parse key fails, PSL route falls through to NoOpAdapter.

**Risk:** LOW while Parse key is primary.

**Resolution:** Owner reactivates at dashboard.api-football.com.

## G5 — No player ingestion path

**Gap:** `getPlayers()` in ParsePslAdapter returns `[]`. Player data requires lineup scraping (future sprint).

**Risk:** LOW — players are managed via calibration module.

**Resolution:** Implement player ingestion via lineup data in Sprint 17+.

## G6 — Ingestion job not implemented

**Gap:** Sprint 15 only designs the ingestion job. No code implementation exists.

**Risk:** MEDIUM — fixture data cannot flow to DB until job is built.

**Resolution:** Sprint 16 implements the job after owner approves the design.

## G7 (Carried from Sprint 14) — Unofficial scraper risk

**Gap:** Parse.bot psl-co-za-api is a scraper of public PSL website, not an official data partner.

**Risk:** MEDIUM — scraper may break if psl.co.za changes structure; PSL could block the bot.

**Mitigation:** Design includes fallback to API-Football; official PSL API partnership is the long-term goal.

## G8 — EC2 staging migration pending

**Gap:** DB migration to staging environment has not been applied.

**Risk:** HIGH for staging testing — local dev only.

**Resolution:** Owner authorises EC2 migration (separate approval).
