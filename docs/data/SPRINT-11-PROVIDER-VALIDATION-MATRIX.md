# Sprint 11 — Provider Validation Matrix

Date: 2026-06-22

## Legend

| Symbol | Meaning |
|--------|---------|
| CONFIRMED | Verified by live API call or official documentation |
| PARTIAL | Partially available; full scope requires paid plan or further investigation |
| LIKELY | Documented or historically known coverage; not yet verified by PSL One team |
| NOT_CONFIRMED | Coverage claimed or possible but not verified |
| UNKNOWN | No information available |
| UNLIKELY | Available evidence suggests coverage is absent |
| BLOCKED_BY_COMMERCIAL_ACCESS | Requires enterprise sales engagement before verification is possible |
| REJECTED_NO_PSL_COVERAGE | PSL coverage is absent or effectively inaccessible |
| N/A | Not applicable |

---

## Full Validation Matrix

| Criterion | API-Football | Football-Data.org | Opta / Stats Perform | Sportradar | SportsDataIO | PSL Manual Import |
|-----------|-------------|-------------------|---------------------|------------|--------------|------------------|
| **PSL coverage** | NOT_CONFIRMED | UNLIKELY | BLOCKED_BY_COMMERCIAL_ACCESS | BLOCKED_BY_COMMERCIAL_ACCESS | NOT_CONFIRMED | CONFIRMED |
| **WC2026 coverage** | LIKELY | LIKELY | BLOCKED_BY_COMMERCIAL_ACCESS | BLOCKED_BY_COMMERCIAL_ACCESS | PARTIAL | N/A |
| **Fixtures** | NOT_CONFIRMED | PARTIAL (EU only) | BLOCKED_BY_COMMERCIAL_ACCESS | BLOCKED_BY_COMMERCIAL_ACCESS | PARTIAL (UCL only) | CONFIRMED |
| **Live scores** | NOT_CONFIRMED | PARTIAL | BLOCKED_BY_COMMERCIAL_ACCESS | BLOCKED_BY_COMMERCIAL_ACCESS | UNKNOWN | N/A |
| **Lineups** | NOT_CONFIRMED | PARTIAL | BLOCKED_BY_COMMERCIAL_ACCESS | BLOCKED_BY_COMMERCIAL_ACCESS | UNKNOWN | N/A |
| **Squads** | NOT_CONFIRMED | PARTIAL | BLOCKED_BY_COMMERCIAL_ACCESS | BLOCKED_BY_COMMERCIAL_ACCESS | PARTIAL | CONFIRMED |
| **Players** | NOT_CONFIRMED | PARTIAL | BLOCKED_BY_COMMERCIAL_ACCESS | BLOCKED_BY_COMMERCIAL_ACCESS | PARTIAL | CONFIRMED |
| **Standings** | NOT_CONFIRMED | PARTIAL (EU) | BLOCKED_BY_COMMERCIAL_ACCESS | BLOCKED_BY_COMMERCIAL_ACCESS | UNKNOWN | N/A |
| **Match events (goals/cards/subs)** | NOT_CONFIRMED | PARTIAL | BLOCKED_BY_COMMERCIAL_ACCESS | BLOCKED_BY_COMMERCIAL_ACCESS | UNKNOWN | N/A |
| **Rate limits** | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | N/A |
| **Auth method** | x-apisports-key / x-rapidapi-key | X-Auth-Token | API key / OAuth (B2B) | API key (B2B) | Ocp-Apim-Subscription-Key | N/A |
| **Trial availability** | YES (free tier) | YES (free tier) | NO | NO | YES (UCL only) | N/A |
| **Commercial gate** | Self-service subscription | Freemium | Enterprise sales required | Enterprise sales required | Self-service subscription | None |
| **Redistribution rights** | UNKNOWN — review ToS | UNKNOWN — review ToS | UNKNOWN — review ToS | UNKNOWN — review ToS | UNKNOWN — review ToS | Owner-controlled |
| **Implementation complexity** | MEDIUM — skeleton exists | HIGH — new adapter | HIGH — new adapter + B2B | HIGH — new adapter + B2B | LOW — skeleton exists | LOW — existing import UI |
| **PSL One risk** | HIGH (PSL unconfirmed) | HIGH (PSL rejected) | HIGH (commercial access) | HIGH (commercial access) | HIGH (PSL unconfirmed) | LOW (manual fallback) |
| **Sprint 11 status** | PRIMARY_CANDIDATE | REJECTED_NO_PSL_COVERAGE | BLOCKED_BY_COMMERCIAL_ACCESS | BLOCKED_BY_COMMERCIAL_ACCESS | SECONDARY_CANDIDATE | FALLBACK_OPTION |

---

## Notes by Provider

### API-Football
- All data point coverage listed as NOT_CONFIRMED because `API_FOOTBALL_KEY` is empty (length 0) in `apps/api/.env` as of Sprint 11.
- Adapter skeleton operates in safe no-key mode; no live calls made.
- Coverage status will update to CONFIRMED or REJECTED once owner sets a live trial key and runs `tools/discovery/api-football-discovery.mjs`.

### Football-Data.org
- Endpoints and free tier are functional but European-league-centric.
- PSL Premier Soccer League is not listed in the free tier `/competitions` response based on public documentation.
- Not worth adapter investment unless PSL presence is confirmed via a direct API call.

### Opta / Stats Perform
- All criteria are BLOCKED_BY_COMMERCIAL_ACCESS because no self-service trial is available.
- Historically strong PSL coverage is documented anecdotally but cannot be listed as CONFIRMED.
- Owner must initiate sales contact before any validation is possible.

### Sportradar
- As with Opta, all criteria are BLOCKED_BY_COMMERCIAL_ACCESS.
- Sportradar is an official FIFA data partner, making WC2026 coverage highly probable.
- Enterprise cost may be a significant barrier for the current platform stage.

### SportsDataIO
- Trial key is active and functional (HTTP 200 on competition list endpoint).
- 93 competitions returned; PSL Premier Soccer League (South Africa) was NOT among them in Sprint 9/10 validation.
- WC2026 (CompetitionId=21) was confirmed on the trial.
- Adapter skeleton exists and is functional; gated behind `DATA_PROVIDER=sportsdataio`.

### PSL Manual Import
- Highest PSL certainty of all options; operator controls the data.
- Impractical for live scores, real-time events, or automated lineups.
- `FixtureImportBatch` / `FixtureImportRow` / `FixtureImportModule` are fully implemented.
- Intended as last resort only.

---

## What Must Change Before Any Column Moves to CONFIRMED

1. A live trial API key must be in `apps/api/.env` (never committed).
2. Discovery scripts must be run and output documented.
3. PSL competition ID must appear in the provider's competition list.
4. At least one full fixture response for a PSL match must be mapped to `ProviderAdapter` fields.
5. Commercial terms must be reviewed by the owner.
