# Sprint 15 — Beta Go/No-Go

## Status: CONDITIONAL_GO

Same status as Sprint 14. Live validation is still pending due to missing `PARSE_API_KEY`.

## Conditions for Full GO

| # | Condition | Status |
|---|-----------|--------|
| 1 | `PARSE_API_KEY` provisioned | PENDING |
| 2 | Parse health validated (`PARSE_PSL_HEALTH_OK`) | PENDING |
| 3 | Parse source state confirmed (available or source-empty) | PENDING |
| 4 | Parse.bot commercial terms accepted | PENDING |
| 5 | API-Football fallback reactivated (optional path) | PENDING |
| 6 | Fixture ingestion design approved by owner | PENDING |
| 7 | EC2 staging migration applied | PENDING |
| 8 | Staging smoke PASS after migration | PENDING |
| 9 | PSL season activation (separate decision) | NOT STARTED |

## What Is Already GO (Unchanged from Sprint 14)

- football-data.org WC_BETA_VALIDATED (104 matches)
- ParsePslAdapter code complete and tested
- ProviderRouterService PSL routing correct
- Source-empty fixture handling correct
- No production ingestion active
- No real-money mechanics

## Sprint 15 New Deliverables (Complete)

- Parse PSL live validation docs (PENDING_KEY state recorded)
- Source-empty seasonal assessment
- Provider routing status current
- Safe fixture ingestion design (design only)
- Idempotent ingestion rules
- Rate-limit plan
- Canonical data boundary
- Dry-run normalizer script

## Sprint 15 Still Pending

- Live validation with real key
- Owner approval of ingestion design
- EC2 staging migration

## Related Documents

- `docs/data/SPRINT-15-PROVIDER-GO-NOGO.md`
- `docs/handover/SPRINT-15-OWNER-REVIEW-GUIDE.md`
- `docs/handover/SPRINT-14-BETA-GO-NOGO.md`
