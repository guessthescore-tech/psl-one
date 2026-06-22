# Sprint 13 — football-data.org Live Validation

## Summary

| Field | Value |
|---|---|
| Date | 2026-06-22 |
| Tools | `sprint-13-worldcup-sample.mjs`, `sprint-12-football-data-health.mjs` |
| Result | `FOOTBALL_DATA_WC_BETA_VALIDATED` |
| HTTP status | 200 |
| Matches returned | 104 |
| Score data | AVAILABLE on free tier |
| PSL support | NOT SUPPORTED on football-data.org |

## Validation log

```
[INFO] Fetching WC matches from football-data.org ...

--- Sample matches (up to 5 of 104) ---
  Mexico vs South Africa | 2026-06-11T19:00:00Z | FINISHED
  South Korea vs Czechia | 2026-06-12T02:00:00Z | FINISHED
  Canada vs Bosnia-Herzegovina | 2026-06-12T19:00:00Z | FINISHED
  United States vs Paraguay | 2026-06-13T01:00:00Z | FINISHED
  Qatar vs Switzerland | 2026-06-13T19:00:00Z | FINISHED

[INFO] Score data in free tier: AVAILABLE

[WC_SAMPLE_OK] 104 matches returned
[INFO] PSL (Premier Soccer League) is NOT supported on football-data.org
```

## Result: VALIDATED

football-data.org is confirmed as the World Cup 2026 data provider. 104 matches accessible on the free tier. Score data (fullTime goals) is available. Authentication via `X-Auth-Token` header works correctly.

## PSL Availability Note

PSL is **not listed** in the football-data.org competition catalogue — this is a permanent, known gap, not a tier issue. PSL data routes to API-Football (league 288) via `ProviderRouterService`. See `SPRINT-13-PER-COMPETITION-ROUTING.md`.

## Related Documents

- `docs/data/SPRINT-13-API-FOOTBALL-LIVE-VALIDATION.md` — API-Football (PSL path) validation
- `docs/data/SPRINT-13-PROVIDER-LIVE-VALIDATION-SUMMARY.md` — combined status table
- `docs/data/SPRINT-13-PER-COMPETITION-ROUTING.md` — ProviderRouterService design
