# Sprint 14 — Beta Go / No-Go

## Status: CONDITIONAL_GO

---

## Go Conditions

| # | Condition | Status |
|---|---|---|
| 1 | Parse PSL clubs, results, and standings validated with live key | PENDING |
| 2 | Parse PSL fixtures: either available or source-empty accepted as official state | PENDING |
| 3 | Parse.bot usage terms reviewed and accepted | PENDING owner review |
| 4 | football-data.org attribution requirements reviewed and accepted | PENDING owner review |
| 5 | EC2 staging migration applied | PENDING authorisation |
| 6 | Staging smoke suite passing | PENDING condition 5 |
| 7 | No betting or odds endpoints enabled | CONFIRMED |

---

## Carry-Forward from Sprint 13

The football-data.org WC 2026 validation (104 matches confirmed) completed in Sprint 12/13 and remains CLEARED. Condition 4 above relates specifically to attribution/terms review, not technical validation.

---

## What Is Already GO

The following items are unconditionally safe for beta:

- `NoOpAdapter` is the stable default when no provider keys are set
- `DataProviderService` global behaviour is unchanged — Sprint 14 adds the `parse-psl` option without modifying existing paths
- `ParsePslAdapter` is purely additive — the codebase is safe to ship without live key validation
- No DB migrations were introduced in Sprint 14
- Rollback is available (see Sprint 14 Rollback Plan)

---

## What Is NOT GO for Beta Production Use

- Live PSL data via `ParsePslAdapter` (pending key and terms)
- EC2 staging environment with live provider keys (pending migration authorisation)
- PSL season activation
- Production data ingestion pipeline
- Any real-money or wallet production flows
- Sportmonks (rejected — do not provision)
- Betting or odds endpoints
