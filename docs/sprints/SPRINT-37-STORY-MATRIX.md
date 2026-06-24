# Sprint 37 — Story Matrix

## Sprint Goal

Create the safe owner-ready pathway from fixture readiness monitoring → provider validation → dry-run import → owner-approved write import.

## Stories

| # | Story | Type | Status |
|---|-------|------|--------|
| S37-01 | Provider architecture baseline | DOCS | DONE |
| S37-02 | Provider procurement decision matrix | DOCS | DONE |
| S37-03 | Provider env validation tool | TOOL | DONE |
| S37-04 | PSL provider availability check tool | TOOL | DONE |
| S37-05 | WC provider availability check tool | TOOL | DONE |
| S37-06 | Fixture import dry-run readiness tool | TOOL | DONE |
| S37-07 | Owner approval pack (fixture write import) | DOCS | DONE |
| S37-08 | Enhanced readiness endpoint (+providerDecision, +dryRunEligible, +writeImportForbidden) | BACKEND | DONE |
| S37-09 | Sprint 37 API tests | TEST | DONE |
| S37-10 | Sprint 37 experience/docs tests | TEST | DONE |
| S37-11 | Provider check runbook | DOCS | DONE |
| S37-12 | Handover + known gaps + owner review guide | DOCS | DONE |

## Deliverables

| Category | Count |
|----------|-------|
| Backend service changes | 1 |
| New staging tools | 4 |
| New docs | 13 |
| New API tests | ~9 |
| New experience tests | ~25 |
| Migrations | 0 |
| Schema changes | 0 |
| Deployments | 0 |

## Safety State (end of sprint)

```
PSL                    = INACTIVE
WC 2026                = ACTIVE (beta)
Fixture import write   = NOT APPROVED
Fixture publication    = NOT APPROVED
PSL activation         = NOT APPROVED
Scheduled ingestion    = DISABLED
Production ingestion   = DISABLED
Real-money             = NONE
Wallet                 = SANDBOX ONLY
Fantasy                = POINTS ONLY
Commerce               = CATALOGUE ONLY
```

## Dependencies

| Dependency | Status |
|------------|--------|
| PR #39 (Sprint 36C evidence) | OPEN — does not block Sprint 37 |
| Parse PSL key (owner) | PENDING |
| football-data.org key (owner) | PENDING confirmation |
| PSL 2026/27 fixture schedule | PENDING (~July/August 2026) |
