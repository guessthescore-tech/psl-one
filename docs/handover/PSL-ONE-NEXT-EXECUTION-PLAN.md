# PSL One — Next Execution Plan
**Last updated:** 2026-06-19 (STORY-FE-PREMIUM-01A)

Dependency-ordered. Each item must be completed before the next begins unless marked as parallel.

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
**Status:** COMPLETE (this story)
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
