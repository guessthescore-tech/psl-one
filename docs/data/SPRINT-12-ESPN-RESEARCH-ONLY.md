# Sprint 12 — ESPN: Research Only

## Status: RESEARCH_ONLY_NO_ADAPTER

## What ESPN Is

ESPN exposes a set of public-facing endpoints under `site.api.espn.com`. These endpoints are **not officially documented, not contracted, and not part of any API agreement** between ESPN and PSL One. They are unofficial endpoints observed through public web traffic inspection.

## ESPN Is NOT Wired Into PSL One

- No ESPN adapter exists in the PSL One codebase.
- ESPN is not listed in `DataProviderService` as a selectable provider.
- No `DATA_PROVIDER=espn` value is recognised.
- No `ESPN_*` env vars are defined or expected.

## Permitted Use: Research Only

ESPN data may be consulted for **research purposes only**:

- Inspecting what competitions, fixtures, and player data ESPN exposes
- Understanding response format and field coverage
- Assessing whether ESPN data would satisfy PSL One's data model requirements
- Comparing ESPN coverage against football-data.org and API-Football

Research observations must be documented but must not be used to populate the production database or drive any system logic.

## Prohibited Uses

- ESPN data must **not** be used for production settlement of predictions or fantasy scoring.
- ESPN data must **not** be used to trigger fantasy scoring, auto-substitution, or badge award logic.
- ESPN must **not** be used as a source of truth for match results.
- ESPN odds endpoints (if any exist) must **not** be used — PSL One is a points-only platform.

## Path to Production Consideration

ESPN may be reconsidered in a future sprint only if **all** of the following conditions are met:

1. An official API agreement is reached with ESPN or its data licensing arm.
2. Data rights for the PSL and/or WC2026 are confirmed in writing.
3. Rate limits, availability SLAs, and commercial terms are documented.
4. An adapter is implemented and validated against a live credentialed key.

Until all four conditions are met, ESPN remains `RESEARCH_ONLY_NO_ADAPTER`.
