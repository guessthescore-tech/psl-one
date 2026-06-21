# Sprint 9 — Handover

## Sprint Title
Provider Validation, Staging Migration Apply Gate & Beta Smoke Activation

## Delivered

### S9-01: Provider Replacement-Key Validation Tooling
All 4 discovery tools created. Both providers BLOCKED_BY_REPLACEMENT_TOKEN:
- `tools/discovery/provider-health-check.mjs` — checks both providers, safe when no key
- `tools/discovery/provider-coverage-check.mjs` — endpoint-by-endpoint coverage
- `tools/discovery/provider-field-mapping-check.mjs` — PSL One field mapping verification
- `tools/discovery/provider-compare.mjs` — side-by-side comparison

Docs:
- `docs/data/SPRINT-9-PROVIDER-VALIDATION-RESULTS.md` — results template + instructions
- `docs/data/SPRINT-9-PROVIDER-COMPARISON.md` — full comparison matrix
- `docs/data/SPRINT-9-PROVIDER-GO-NOGO.md` — go/no-go criteria

### S9-02: Staging Migration Apply Gate
- `docs/handover/SPRINT-9-STAGING-MIGRATION-APPLY-LOG.md` — apply checklist, command, result template
- `docs/handover/SPRINT-9-STAGING-MIGRATION-GO-NOGO.md` — decision: NO-GO (not authorized)
- Status: STAGING_APPLY_PENDING_OWNER_AUTHORIZATION

### S9-03: Staging Challenge Flow Smoke Suite
- `tools/smoke/sprint-9-staging-smoke.mjs` — 8 checks, idempotent, skips when no admin token
- `tools/smoke/sprint-9-challenge-settlement-smoke.mjs` — 8 checks (5 file-level, 3 live)
- `docs/handover/SPRINT-9-SMOKE-RESULTS.md` — file-level PASS; live checks pending server

### S9-04: Provider Decision Gate
- `docs/data/SPRINT-9-PROVIDER-DECISION-RECOMMENDATION.md`
- Preliminary recommendation: Sportmonks primary, pending live trial validation
- 5 explicit owner decision gates listed

### S9-05: Beta Release Readiness Gate
- `docs/handover/SPRINT-9-BETA-GO-NOGO.md` — Overall NO-GO
- `docs/handover/SPRINT-9-KNOWN-GAPS.md` — 6 gaps
- `docs/handover/SPRINT-9-OWNER-REVIEW-GUIDE.md` — step-by-step for owner
- `docs/handover/SPRINT-9-ROLLBACK-PLAN.md` — rollback procedures

## Test Counts
- API: 1,770 / 1,770 (unchanged from Sprint 8 baseline)
- Experience: 518 / 518 (+18 new S9 tests)

## Migration Status
- Migrations 41 and 42: NOT applied to staging
- Runbook and go/no-go gate ready in this sprint's docs

## Provider Status

| Provider | Status | Adapter |
|----------|--------|---------|
| Sportmonks | **REJECTED** (Sprint 10 amendment 2026-06-22) | Deprecated (retained for reference) |
| SportsDataIO | Secondary candidate — PSL not in competition list | Skeleton (candidate, not wired) |
| NoOp | **Active default** | Always used until primary provider decided |

## Product State
- PSL: INACTIVE ✅
- World Cup 2026: ACTIVE (beta) ✅
- Wallet: Sandbox-only ✅
- Production ingestion: DISABLED ✅
- STORY-40: RESERVED ✅

## Owner Actions Required
1. Revoke exposed Sportmonks token (if not already done) at https://app.sportmonks.com/api-tokens
2. Generate replacement Sportmonks key → `apps/api/.env` as `SPORTMONKS_API_KEY=<value>`
3. Run `node tools/discovery/provider-health-check.mjs` → record in SPRINT-9-PROVIDER-VALIDATION-RESULTS.md
4. Register at sportsdata.io → `SPORTSDATAIO_SOCCER_API_KEY=<trial_key>` in `apps/api/.env`
5. Authorize staging migration apply (explicit: "I authorize staging migration apply for Sprint 9")
6. After migration: run `BASE_URL=http://<staging>:4000 node tools/smoke/sprint-9-staging-smoke.mjs`
7. Review `docs/data/SPRINT-9-PROVIDER-DECISION-RECOMMENDATION.md` and confirm provider choice
