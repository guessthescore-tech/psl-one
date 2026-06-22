# Sprint 17 — Known Gaps

## Deferred Items

### 1. Source Empty Until July/August 2026

**Gap:** psl.co.za has not published 2026/27 Betway Premiership fixtures.
**Impact:** All ingestion attempts return `SOURCE_EMPTY`. No fixture data can be imported yet.
**Action:** Revisit in early July 2026. Run `tools/discovery/sprint-17-parse-ingestion-preview.mjs` to check.

### 2. No Fixture Publishing in This Sprint

**Gap:** Imported fixtures are `isPublished=false`. No admin UI for publishing individual fixtures was added in Sprint 17.
**Impact:** Even once fixtures are imported, they won't be visible to fans until published.
**Action:** Admin Fixture Management (STORY-27 routes) provides publish functionality. No new work needed.

### 3. No Team Name Alias Table

**Gap:** Team resolution uses exact then fuzzy `contains` matching. If psl.co.za uses names that don't match seeded names (e.g. `SuperSport United` vs `Supersport United`), fixtures will be skipped.
**Impact:** Potential fixture skip if psl.co.za uses unexpected name variants.
**Action:** Run `tools/discovery/sprint-17-team-resolution-check.mjs` when fixtures appear; add normalisation step if needed.

### 4. No Schema Change Detection

**Gap:** If psl.co.za changes its fixture data schema, `sourceStatus: SCHEMA_CHANGED` is returned but no automatic alerting is set up.
**Impact:** Operator must notice the failure manually.
**Action:** Monitor ingestion audit log; add alerting when monitoring infrastructure is ready.

### 5. No Retry / Back-off Logic

**Gap:** Network failures from Parse PSL return a single `PROVIDER_ERROR`. No retry or exponential back-off is implemented.
**Impact:** Transient network failures require the operator to re-trigger manually.
**Action:** Acceptable for beta; add retry in production ingestion sprint.

### 6. Parse PSL Key Rotation Not Automated

**Gap:** `PARSE_API_KEY` is a static key in `.env`. There is no automated rotation or expiry warning.
**Impact:** If the key expires, ingestion fails with `AUTH_FAILED`.
**Action:** Check Parse PSL dashboard before each write run; rotate key if needed.
