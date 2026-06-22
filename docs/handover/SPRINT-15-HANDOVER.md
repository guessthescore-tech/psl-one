# Sprint 15 — Handover

## Sprint Goal

Validate the Parse PSL live data path and design a safe, idempotent, read-only-first fixture ingestion process.

## Sprint Outcome: CONDITIONAL_GO

Live validation is blocked on `PARSE_API_KEY` (not yet provisioned). All design, documentation, and tooling deliverables are complete.

## Deliverables

| # | Deliverable | Status |
|---|-------------|--------|
| S15-01 | Parse live validation run | PARSE_PSL_KEY_MISSING — owner must set key |
| S15-02 | Live validation docs (4 files) | ✅ DONE |
| S15-03 | Source-empty seasonal assessment | ✅ DONE |
| S15-04 | Provider routing status doc | ✅ DONE |
| S15-05 | Safe fixture ingestion design | ✅ DONE |
| S15-06 | Idempotent ingestion rules | ✅ DONE |
| S15-07 | Parse rate-limit plan | ✅ DONE |
| S15-08 | Canonical data boundary | ✅ DONE |
| S15-09 | Dry-run fixture normalizer script | ✅ DONE |
| S15-10 | Sprint 15 handover package (5 docs) | ✅ DONE |
| S15-11 | Sprint 15 experience spec block | ✅ DONE |

## Test Counts

- API: 1,868 / 1,868 (unchanged — no new service code)
- Experience: 688+ / 688+ (Sprint 15 block added)

## Key Technical Context

### Source-Empty is Valid

`get_fixtures` returning `[]` means psl.co.za has not published new-season Betway Premiership fixtures. This is a normal seasonal state expected in June. The adapter handles this correctly and returns an empty array without error.

### Dry-Run Script

`tools/discovery/sprint-15-parse-fixture-dry-run.mjs` previews normalized fixture data without any DB writes. Outputs:
- `DRY_RUN_SOURCE_EMPTY` — no fixtures available yet (valid)
- `DRY_RUN_FIXTURES_NORMALIZED` — fixtures available and normalised
- `DRY_RUN_AUTH_FAILED` — key rejected
- `DRY_RUN_RATE_LIMITED` — rate limit hit
- `DRY_RUN_SCHEMA_CHANGED` — Parse API changed its response shape
- `DRY_RUN_KEY_MISSING` — key not set

### Ingestion Design (No Scheduler)

`docs/data/SPRINT-15-FIXTURE-INGESTION-DESIGN.md` describes the intended ingestion flow. No scheduler is active. The first run must be explicitly owner-authorised and manual.

## Owner Actions Required

1. Set `PARSE_API_KEY` in `apps/api/.env`
2. Run `node --env-file=apps/api/.env tools/discovery/sprint-14-parse-psl-health.mjs`
3. Run `node --env-file=apps/api/.env tools/discovery/sprint-15-parse-fixture-dry-run.mjs`
4. Review and approve `docs/data/SPRINT-15-FIXTURE-INGESTION-DESIGN.md`
5. Review Parse.bot terms of service
6. Authorise EC2 staging migration when ready

## What Was NOT Done (Intentional)

- No scheduled ingestion job implemented
- No PSL season activated
- No production ingestion enabled
- No real-money or wallet changes
- No AWS/Terraform/EC2 mutation
- No DB migration added

## Branch

`feature/sprint-15-parse-live-ingestion-design`

## Related Sprints

- Sprint 14: ParsePslAdapter implementation, routing, tools
- Sprint 16: Fixture ingestion job implementation (post owner-approval)
