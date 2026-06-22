# Sprint 14 — Provider Go / No-Go

## Status: CONDITIONAL_GO

Sprint 14 code is safe to ship. Live validation and several owner-authorised actions remain pending.

---

## Go Conditions

| # | Condition | Status |
|---|---|---|
| 1 | Parse PSL clubs, results, and standings validated with live key | PENDING |
| 2 | Parse PSL fixtures: either `PARSE_PSL_FIXTURES_AVAILABLE` or `PARSE_PSL_FIXTURES_SOURCE_EMPTY` accepted as official state | PENDING |
| 3 | Commercial and usage terms for Parse.bot reviewed and accepted by project owner | PENDING owner review |
| 4 | football-data.org attribution requirements reviewed and accepted by project owner | PENDING owner review |
| 5 | EC2 staging migration applied | PENDING authorisation |
| 6 | Staging smoke suite passing with live keys | PENDING condition 5 |
| 7 | No betting or odds endpoints enabled in any adapter | CONFIRMED |

---

## What CONDITIONAL_GO Means

Conditions 1–4 are data-provider gating items that require owner action (key provisioning and legal review). They do not block code from being shipped to staging; they block production data use.

Condition 5 (EC2 migration) is an infrastructure authorisation item carried from Sprint 13.

Condition 6 cannot be cleared until condition 5 is resolved.

Condition 7 is permanently confirmed — no adapter in the codebase exposes betting or odds data.

---

## No-Go Items

- Do not activate the PSL season
- Do not deploy provider adapters in production data-ingestion mode
- Do not use Sportmonks (rejected)
- Do not expose `PARSE_API_KEY` or any other provider key in frontend bundles
