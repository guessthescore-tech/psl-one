# PSL One — Next Execution Plan
**Last updated:** 2026-06-19 (STORY-FE-FANTASY-00)

Dependency-ordered. Each item must be completed before the next begins unless marked as parallel.

---

## 0. Fantasy Journey Inventory

**Status:** COMPLETE (STORY-FE-FANTASY-00)
**Output:** `apps/experience/docs/FANTASY-USER-JOURNEY.md` — 40-screen canonical inventory
**Key findings:**
- 22 of 40 screens EXISTS_PARTIAL in `apps/web` (operational beta) with live API
- 13 screens MISSING_BOTH (neither page nor API)
- 5 screens MISSING_FRONTEND (API exists, no premium page)
- No screens are EXISTS_COMPLETE in `apps/experience` yet (only homepage `/` is built)
- Critical gaps requiring new backend work: FDR algorithm, rival team endpoint, in-session password change, account deletion (POPIA), quiz model, badge scan model

---

## 1. Verify Premium Homepage

**Owner:** Engineering lead
**Prerequisites:** None
**Deliverables:**
- Independent integrity review of `apps/experience` complete
- All integrity issues repaired
- Typecheck PASS, 81/81 tests PASS, build PASS
**Acceptance criteria:**
- `pnpm --filter @psl-one/experience typecheck` exits 0
- `pnpm --filter @psl-one/experience test` 81/81 PASS
- `pnpm --filter @psl-one/experience build` exits 0
- No secrets, no broken imports, no unlicensed imagery
- No duplicate imports or dead code
**Blockers:** None
**Status:** COMPLETE (STORY-FE-PREMIUM-01A)
**Next command:**
```bash
pnpm --filter @psl-one/experience dev
# Open http://localhost:3002 and review visually
```

---

## 2. Approve Visual Direction

**Owner:** Product owner / design lead
**Prerequisites:** Step 1 complete
**Deliverables:**
- Owner has reviewed `http://localhost:3002` running locally
- Feedback documented (approve / iterate)
- `docs/experience/CREATIVE-DIRECTION.md` updated if direction changes
**Acceptance criteria:**
- Owner explicitly approves the 13-section homepage layout
- Colour palette, typography, and football-first principles confirmed
- Motion feel and `GuessTheScore` interaction approved
- Picsum placeholder strategy confirmed acceptable for current phase
**Blockers:** Requires owner to run `pnpm --filter @psl-one/experience dev` locally
**Next prompt:**
```
Review http://localhost:3002 and confirm: (a) visual direction approved, (b) any sections to change before commit, (c) commit approved
```

---

## 3. Commit Premium Foundation

**Owner:** Engineering lead
**Prerequisites:** Step 2 owner approval
**Deliverables:**
- `apps/experience` committed and pushed to `main`
- `pnpm-lock.yaml` committed
- Commit message references STORY-FE-PREMIUM-01
- `git diff --check` passes
**Acceptance criteria:**
- `git log --oneline -1` shows correct commit
- `git push` succeeds
- CI passes
**Blockers:** Owner approval from Step 2
**Next command:**
```bash
git add apps/experience pnpm-lock.yaml
git commit -m "feat(experience): STORY-FE-PREMIUM-01 — premium standalone frontend with WC2026 design data"
git push
```

---

## 4. Vercel Preview Configuration

**Owner:** Engineering lead + owner (billing)
**Prerequisites:** Step 3 commit pushed
**Deliverables:**
- Vercel project created for `apps/experience`
- Root directory set to `apps/experience`
- Framework preset: Next.js
- `NEXT_PUBLIC_DATA_MODE` env var set (default: `DESIGN_REVIEW_DATA`)
- Preview URL confirmed working
**Acceptance criteria:**
- Vercel deploy succeeds on push to `main`
- Preview URL shows the premium homepage
- Purple DESIGN_REVIEW_DATA banner visible
- No build errors in Vercel logs
**Blockers:** Owner must authorise Vercel project creation and billing
**Next prompt:**
```
Create a Vercel project for apps/experience. Root directory: apps/experience. Framework: Next.js. Add NEXT_PUBLIC_DATA_MODE=DESIGN_REVIEW_DATA. Confirm preview URL.
```

---

## 5. Provider Evaluation

**Owner:** Product owner + engineering lead
**Prerequisites:** Steps 1-4 (parallel with Step 4)
**Deliverables:**
- `docs/data/PSL-DATA-PROVIDER-EVALUATION.md` reviewed by owner
- Provider shortlisted (recommendation: API-Football for prototype, Stats Perform for production)
- Budget approved for selected prototype provider
**Acceptance criteria:**
- Owner selects a provider for the proof-of-concept phase
- Owner acknowledges licensing requirements
- Owner confirms approach to official PSL partnership
**Blockers:** `docs/data/PSL-DATA-PROVIDER-EVALUATION.md` must be completed (this story Phase 7)
**Next prompt:**
```
Review docs/data/PSL-DATA-PROVIDER-EVALUATION.md. Select provider for prototype. Confirm budget.
```

---

## 6. Read-Only Provider Proof

**Owner:** Engineering lead
**Prerequisites:** Step 5 provider selected, API key obtained
**Deliverables:**
- `tools/data-provider-spike/api-football-discovery.mjs` run successfully
- PSL league ID confirmed from official provider response
- Available seasons confirmed
- Coverage assessment complete
- Output written to `/tmp/` only, no database writes
**Acceptance criteria:**
- Script discovers `Premier Soccer League` from country `South Africa` query
- Correct league ID returned (not guessed)
- Standing, fixtures, teams, player endpoints confirmed
- API quota headers printed
**Blockers:** `API_FOOTBALL_KEY` env var must be set
**Next command:**
```bash
API_FOOTBALL_KEY=your-key node tools/data-provider-spike/api-football-discovery.mjs
```

---

## 7. Data Mapping

**Owner:** Engineering lead
**Prerequisites:** Step 6 coverage confirmed
**Deliverables:**
- `docs/data/PSL-DATA-MAPPING.md` completed with actual field names from provider response
- Mapping from provider schema to existing Prisma models documented
- Gap analysis complete (fields provider has that PSL One needs but doesn't model yet)
**Acceptance criteria:**
- Every provider field mapped to a PSL One domain field or marked as gap
- External ID namespace strategy confirmed (`externalId`, `externalSource`)
- No new Prisma models added yet
**Blockers:** Step 6 raw provider responses
**Next prompt:**
```
Map API-Football PSL response fields to existing Prisma models. Document in docs/data/PSL-DATA-MAPPING.md. Flag gaps that require new models.
```

---

## 8. Controlled Import

**Owner:** Engineering lead
**Prerequisites:** Steps 5-7 complete, licensing gate checklist signed (Step 10)
**Deliverables:**
- `FootballDataProvider` adapter implemented in NestJS
- PSL fixtures imported via `FixtureImportBatch` / `FixtureImportRow` (existing pipeline)
- Admin review UI for imported data
- Data lifecycle: `DRAFT → VALIDATED → IMPORTED → PUBLISHED`
- No automatic activation
**Acceptance criteria:**
- Admin can trigger import
- Admin can review raw import and diff vs. existing data
- Admin can publish or reject
- No data visible to fans until published
**Blockers:** Steps 5-7 + licensing gate
**Next prompt:**
```
Implement FootballDataProvider NestJS adapter for API-Football. Wire to existing FixtureImportBatch pipeline. Add admin review routes. DRAFT lifecycle only.
```

---

## 9. PSL Season Readiness

**Owner:** Engineering lead
**Prerequisites:** Step 8 controlled import working
**Deliverables:**
- PSL season calibration re-run (STORY-29/30) with real provider data
- FantasyRulesConfig for PSL season confirmed
- PredictionRulesConfig for PSL season confirmed
- 13 season-switching checks all PASS
- Full squad import from provider (or CSV) for PSL clubs
**Acceptance criteria:**
- `pnpm api:calibrate` passes all 13 checks for PSL season
- 16 PSL clubs with real players and prices
- Activation dry-run passes
**Blockers:** Step 8 + real PSL squad data
**Next command:**
```bash
# After squad import:
pnpm api:calibrate --season=PSL-2026 --dry-run
```

---

## 10. Official Data and Licensing Approval

**Owner:** Product owner (must be done by owner — not delegatable)
**Prerequisites:** None (can start in parallel with Steps 5-8)
**Deliverables:**
- `docs/data/PSL-DATA-LICENSING-GATE.md` checklist completed and signed
- Provider commercial licence accepted
- PSL competition rights confirmed in writing
- Logo/image rights confirmed
- Redistribution and caching policies confirmed
- Attribution requirement documented
- Budget approved
- Security review passed
- Data quality review passed
- Rollback provider/fallback defined
**Acceptance criteria:**
- Every checkbox in `docs/data/PSL-DATA-LICENSING-GATE.md` ticked
- Signed contract or LOA available
**Blockers:** Owner must engage Stats Perform / API-Football commercial team
**Next prompt:**
```
Review docs/data/PSL-DATA-LICENSING-GATE.md. Engage provider commercial team. Complete the checklist. This must be done by the owner before production provider integration.
```

---

## 11. Production Provider Integration

**Owner:** Engineering lead
**Prerequisites:** Step 10 licensing gate SIGNED
**Deliverables:**
- Provider adapter promoted from prototype to production quality
- Rate limiting, caching, retries, circuit breaker implemented
- Observability: metrics, alerts, dashboards
- Provenance metadata on all imported records
- Auto-import on schedule via Kafka event or cron
- Data quality alerts for missing/stale data
- PSL season activated in production
**Acceptance criteria:**
- Live PSL scores update within provider's stated latency SLA
- All data sources attributed correctly
- No provider key in any browser-accessible code
- Provider switchable without application code changes
**Blockers:** Step 10 licensing gate + Step 9 season readiness
**Next prompt:**
```
Promote FootballDataProvider adapter to production. Add rate limiting, caching, circuit breaker, observability. Implement auto-import schedule. Run PSL season activation.
```

---

## 12. Fantasy Phase 1 — Core Screens (apps/experience)

**Owner:** Engineering lead
**Prerequisites:** Steps 1–4 complete (premium frontend committed, Vercel preview live); Fantasy journey inventory reviewed and approved by owner (Step 0)
**Scope:** 11 screens from `apps/experience/docs/FANTASY-USER-JOURNEY.md` Phase 1
**Deliverables:**
- `/fantasy` — Fantasy landing page (unauthenticated splash + returning manager fork)
- `/fantasy/onboarding` — Multi-step squad creation wizard (pitch view + player pool + name team)
- `/fantasy/team` — Team profile with formation pitch view (GK/DEF/MID/FWD rows)
- `/fantasy/team/transfers` — Transfer flow with pitch interaction
- `/fantasy/team/chips` — Chip selector with status awareness
- `/fantasy/fixture-difficulty` — FDR matrix (requires new backend FDR endpoint)
- `/fantasy/leagues` — League hub (my leagues + join + create)
- `/fantasy/leagues/join` — Join by code or public league
- `/fantasy/leagues/[leagueId]` — League standings
- `/fantasy/leagues/[leagueId]/teams/[teamId]` — Rival team (requires new `GET /api/fantasy/teams/:teamId/public`)
- `/fantasy/help` — Help & Rules with live config values
**New components required:** ~20 (see `apps/experience/docs/COMPONENT-INVENTORY.md` Phase 1 section)
**New API required:**
- `GET /api/fantasy/fixture-difficulty` — FDR computation (club × next 6 GWs)
- `GET /api/fantasy/teams/:teamId/public` — Rival team detail (read-only, same-league only)
**Tests required:** All new screens must have vitest structural + integration tests
**Acceptance criteria:**
- First-time journey (Journey A) completable end-to-end in `apps/experience`
- Returning manager journey (Journey B) completable end-to-end
- All screens pass typecheck, tests, build, codex:validate, docs:validate
**Next prompt:**
```
Begin STORY-FE-FANTASY-01 — Fantasy Phase 1 screens for apps/experience. Reference apps/experience/docs/FANTASY-USER-JOURNEY.md for all screen requirements.
```

---

## 13. Fantasy Phase 2 — Research and Match Context (apps/experience)

**Owner:** Engineering lead
**Prerequisites:** Step 12 complete
**Scope:** Phase 2 screens from journey inventory
**Key screens:** `/matches`, `/matches/[fixtureId]`, `/players/[playerId]`, `/players/[playerId]/stats`, `/stats/season`, `/stats/compare`, `/fantasy/history`
**New API required:**
- `GET /api/stats/compare?playerA=:id&playerB=:id` — player comparison aggregation
**Next prompt:**
```
Begin STORY-FE-FANTASY-02 — Fantasy Phase 2 screens for apps/experience. Reference FANTASY-USER-JOURNEY.md Phase 2.
```

---

## 14. Fantasy Phase 3 — Account and Support (apps/experience)

**Owner:** Engineering lead + Legal (for Terms/Privacy)
**Prerequisites:** Step 13 complete; legal team has approved T&C and Privacy Policy text
**Scope:** Phase 3 screens from journey inventory
**Key screens:** `/account`, `/account/profile`, `/account/security`, `/sign-in`, `/forgot-password`, `/help`, `/terms`, `/privacy`, `/about`
**New API required:**
- `POST /api/auth/password/change` — in-session password change
- `DELETE /api/auth/account` — POPIA-compliant account deletion
**New models required:** Account deletion audit trail; deletion scheduled job
**Legal gate:** `/terms` and `/privacy` must be reviewed and signed off by legal before any user-facing release
**Next prompt:**
```
Begin STORY-FE-FANTASY-03 — Fantasy Phase 3 account and support screens for apps/experience. Reference FANTASY-USER-JOURNEY.md Phase 3. Legal review gate for /terms and /privacy.
```
