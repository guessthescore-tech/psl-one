# Sprint 14 — Updated Provider Strategy

## Provider Status Table

| Provider | Competition | Status | Key Env |
|---|---|---|---|
| football-data.org | WC / WORLD_CUP_2026 | VALIDATED — 104 matches | `FOOTBALL_DATA_API_KEY` |
| ParsePslAdapter | PSL / BETWAY_PREMIERSHIP | PRIMARY_CANDIDATE — pending live validation | `PARSE_API_KEY` |
| ApiFootballAdapter | PSL | FALLBACK — account suspended | `API_FOOTBALL_KEY` |
| SportsDataIO | n/a | SECONDARY_RESEARCH | `SPORTSDATAIO_SOCCER_API_KEY` |
| Sportmonks | n/a | REJECTED | `SPORTMONKS_API_KEY` (deprecated) |
| ESPN | n/a | RESEARCH_ONLY | n/a |

---

## Key Principle

Both the `DATA_PROVIDER` environment flag **and** the matching key must be set. Setting the key alone does not activate the provider. Setting the flag without a key falls through to `NoOpAdapter`.

Example for PSL:
```
DATA_PROVIDER=parse-psl
PARSE_API_KEY=<key>
```

Both must be present in `apps/api/.env` for `ParsePslAdapter` to serve live data.

---

## Source-Empty Note for Parse PSL

When `PARSE_API_KEY` is set and `ParsePslAdapter` is active, `get_fixtures` may return an empty array. This is not a provider failure. It indicates that psl.co.za has not yet published new-season fixture data. The adapter is functioning correctly; the source simply has no fixtures to expose yet.

Validation in this state: confirm that `get_clubs_list` and `get_standings` still return data. If they do, the adapter is healthy.

---

## Provider Notes

**football-data.org** — VALIDATED in Sprint 12/13 with 104 WC 2026 matches confirmed. Attribution requirements must be reviewed by the project owner before public display of data.

**ParsePslAdapter** — Implemented in Sprint 14 as PSL primary. Parse.bot is an unofficial scraper over psl.co.za. Not an official PSL developer API. May break without notice if psl.co.za restructures. Requires owner review of Parse.bot usage terms before production use.

**ApiFootballAdapter** — API-Football account was suspended during Sprint 13 validation. Demoted to PSL fallback. Can be reactivated at dashboard.api-football.com. Competition code 288 remains in router for backwards compatibility.

**Sportmonks** — Rejected in Sprint 9/10 due to missing PSL coverage and trial token requirements. `SPORTMONKS_API_KEY` env var is deprecated; do not provision.

**ESPN** — Research-only. No adapter implemented. Not in routing table.
