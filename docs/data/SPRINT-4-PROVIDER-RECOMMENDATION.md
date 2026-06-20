# PSL One — Sprint 4 Provider Recommendation
**Last updated:** 2026-06-20 (Sprint 4 data-provider research)
**Status:** DRAFT — awaiting owner decision
**Related:** `SPRINT-4-PROVIDER-COMPARISON.md`, `SPRINT-4-PROVIDER-LICENSING-GATE.md`, ADR-030

---

## 1. Decision

**RECOMMENDED: Sportmonks for beta production integration.**

**Fallback for Sprint 4 development/spike only: API-Football (existing discovery script).**

This recommendation is for the server-side football data adapter that feeds `LiveMatchService`, `FixtureImportModule`, `SquadImportModule`, and the standing/player-stats endpoints. It does not cover the official PSL partnership path, which remains the long-term preferred source of truth.

---

## 2. Rationale

### 2.1 Why Sportmonks over API-Football for production

| Factor | API-Football | Sportmonks | Winner |
|--------|:------------:|:----------:|:------:|
| PSL data completeness | 6/10 | 7/10 | Sportmonks |
| Player stats for fantasy scoring | Partial | Good | Sportmonks |
| Commercial terms clarity | Verify needed | Commercial tier defined | Sportmonks |
| Vendor longevity | MEDIUM risk | LOW-MEDIUM risk | Sportmonks |
| API design consistency | Good | Good | Tie |
| Time to integrate | Days | Days–weeks | API-Football |

API-Football is adequate for a proof-of-concept and for the existing discovery spike. For production deployment to 2M fans, Sportmonks offers better data quality and a more clearly defined commercial path.

### 2.2 Why not Stats Perform / Opta or Sportradar now

- Enterprise contract complexity: minimum 3-month negotiation cycle.
- No self-service trial: can't validate PSL data quality before committing.
- Cost floor too high for beta phase.
- **Deferred to commercial launch phase** (3–12 months from beta).

### 2.3 Why not TheSportsDB

- Community-sourced data: no reliability guarantee for live PSL data.
- No commercial redistribution rights.
- No SLA or support.
- Excluded entirely from production consideration.

---

## 3. Go / No-Go Decision

| Condition | Status | Blocker? |
|-----------|:------:|:--------:|
| Licensing gate completed (see `SPRINT-4-PROVIDER-LICENSING-GATE.md`) | NOT DONE | YES — no fan-facing display until complete |
| Owner has approved provider cost | NOT DONE | YES |
| PSL competition rights confirmed (or acknowledged as unresolved risk) | NOT DONE | YES |
| Server-side adapter implemented (no browser-direct calls) | Architecture defined (ADR-030) | No (engineering ready) |
| Redis caching implemented | Exists in backend | No |
| API key in AWS Secrets Manager | Not yet set | YES — before production |
| Attribution wired in product UI | NOT DONE | YES — before fan-facing display |

**Current go/no-go: NO-GO for fan-facing display.** Sprint 4 engineering work on the adapter can proceed in parallel, but data may not be shown to fans until the licensing gate is complete and signed by the owner.

---

## 4. Commercial Decision Items (Owner Must Decide)

These items cannot be resolved by engineering. The product owner must personally action each one:

1. **Provider selection confirmation** — Confirm Sportmonks as the production provider (or override with a different choice).

2. **Sportmonks commercial tier** — Contact Sportmonks sales and obtain a quote for a commercial fan platform with:
   - PSL DStv Premiership coverage
   - WC 2026 coverage
   - Up to 2M end users (fans receiving displayed data)
   - Redistribution of match data (fixtures, standings, player stats, match events) to fans

3. **API-Football decision for Sprint 4 spike** — If the development spike (using `tools/data-provider-spike/api-football-discovery.mjs`) is to continue: confirm that the key used is on a paid plan (not the free 100 req/day tier) if any PSL One team member other than the developer is accessing results.

4. **Redistribution rights confirmation** — Get explicit written confirmation from the chosen provider that displaying match data to fans on a commercial platform is permitted under the selected plan. Do not infer permission from the fact that data is technically accessible.

5. **PSL official position** — Contact the PSL commercial department to:
   - Confirm PSL One has permission to display PSL DStv Premiership data.
   - Identify who PSL's current official data partner is (likely Opta/Stats Perform — important for understanding the chain of data rights).
   - Explore whether a direct data partnership is available.

6. **Logo and image rights** — Confirm whether the chosen provider's plan includes rights to display team logos and player images to fans. If not (likely), the fallback is colour-badge styling from `Club.primaryColor`/`secondaryColor` until rights are established.

7. **Monthly budget approval** — Approve the recurring monthly cost. For Sportmonks commercial tier, budget $200–$800/month (estimate; actual quote required). For API-Football Ultra/Mega tier, budget $120–$300/month.

8. **Attribution placement** — Agree on how "Data provided by [Provider]" attribution will appear in the product (e.g., footer of fixture pages, data-heavy screens).

---

## 5. Integration Architecture

**Principle: Server-side adapter only. No browser-direct API calls. No API keys in frontend code. No `NEXT_PUBLIC_` provider keys.**

### 5.1 Architecture Overview

```
Fan Browser / Mobile
       │
       │ HTTPS request
       ▼
NextJS Edge / API Routes (apps/web, apps/experience)
       │
       │ Internal HTTP (same VPC) or direct import
       ▼
NestJS API (apps/api)
  FootballModule
    FootballDataProviderAdapter  ◄─── ONLY touchpoint to external provider
       │
       │  Server-side HTTPS call with API key from AWS Secrets Manager
       ▼
 [Sportmonks API / API-Football API]
       │
       ▼
  Redis Cache (TTL-aware)
       │
  Result served to LiveMatchService / FixtureImportModule / etc.
```

### 5.2 Module Structure (NestJS)

```
apps/api/src/football/
  football.module.ts              ← imports FootballDataProviderModule
  football.controller.ts
  football.service.ts
  live-match.service.ts           ← consumes LiveMatchProviderAdapter
  live-match-provider.interface.ts ← already exists; extended by real adapter

  providers/
    football-data-provider.module.ts   ← selects adapter from env var
    api-football.adapter.ts            ← implements ProviderAdapter for API-Football
    sportmonks.adapter.ts              ← implements ProviderAdapter for Sportmonks
    manual.adapter.ts                  ← existing ManualLiveMatchProviderAdapter
    football-data-provider-cache.service.ts ← Redis wrapper with TTL strategy
```

### 5.3 Provider Selection (Environment-Driven)

The adapter is selected via the `FOOTBALL_DATA_PROVIDER` environment variable. No code change is needed to switch providers:

```
FOOTBALL_DATA_PROVIDER=sportmonks       # production
FOOTBALL_DATA_PROVIDER=api-football     # development spike
FOOTBALL_DATA_PROVIDER=manual           # default (current state — no external calls)
```

The `FootballDataProviderModule` reads this variable and injects the correct adapter. This is the "circuit breaker at the source" pattern — if the provider is down or the variable is unset, the `manual` adapter is used as fallback and the platform degrades gracefully.

### 5.4 Key Storage

```
AWS Secrets Manager path: /psl-one/{env}/football-data-provider/api-key
```

The NestJS service retrieves this key at startup via the existing AWS SDK integration. The key is:
- Never committed to git.
- Never exposed to the frontend (no `NEXT_PUBLIC_` prefix).
- Never logged in application logs.
- Rotated without code deployment (SSM/Secrets Manager update, ECS task restart).

### 5.5 HTTP Client

The adapter uses NestJS `HttpModule` (wrapping Axios) configured with:
- Base URL per provider (injected via module config)
- API key header per provider specification
- Timeout: 10 s (provider call); request aborted if exceeded
- Retry: 1 retry on 5xx, no retry on 4xx
- Circuit breaker: if 3 consecutive failures occur, fall back to `manual` adapter for 60 s (implemented in `FootballDataProviderCacheService`)

---

## 6. Caching Strategy

All provider responses are cached in Redis. The cache is the first line of defence against rate-limit breaches and provider outages.

| Data type | Cache TTL | Key pattern | Notes |
|-----------|:---------:|-------------|-------|
| Live fixture state | 30 s | `football:live:{providerFixtureId}:state` | Minimum safe polling interval |
| Live match events | 30 s | `football:live:{providerFixtureId}:events` | Refreshed alongside state |
| Live lineup | 5 min | `football:live:{providerFixtureId}:lineup` | Lineups rarely change mid-match |
| Live player stats | 30 s | `football:live:{providerFixtureId}:stats` | Refreshed alongside state |
| Scheduled fixture list | 5 min | `football:fixtures:{leagueId}:{season}` | Non-live; low change rate |
| Standings | 5 min | `football:standings:{leagueId}:{season}` | Updates only after matches |
| Team data | 24 h | `football:teams:{leagueId}:{season}` | Season-stable |
| Player data | 24 h | `football:players:{teamId}:{season}` | Season-stable |
| Historical fixture | 24 h | `football:fixture:{providerFixtureId}:history` | Finished — immutable |
| Competition/league metadata | 24 h | `football:league:{leagueId}` | Season-stable |

**Cache miss behaviour:** On cache miss, the adapter makes a provider API call, stores the result with the appropriate TTL, and returns the data. If the provider call fails (non-2xx or timeout), the stale cache value (if any) is returned with a `stale: true` flag in the response metadata.

**Cache invalidation:** Manual cache clear available via admin API endpoint (`POST /admin/football/cache/clear`). Used after manual data corrections.

---

## 7. Fallback Plan

The system degrades gracefully in the following sequence:

1. **Redis cache hit** → Return cached data (no provider call)
2. **Redis cache miss, provider call succeeds** → Refresh cache, return fresh data
3. **Provider call fails (transient)** → Return stale cache if age < 5 min; otherwise return 503 with retry hint
4. **Provider call fails (circuit breaker open)** → Use `manual` adapter (returns null/empty); frontend shows "Live data temporarily unavailable"
5. **Provider key invalid / account suspended** → Admin alert via Kafka event; manual import fallback activated
6. **Complete provider outage** → Manual CSV import pipeline (`FixtureImportModule`) used for end-of-day data refresh

The `FOOTBALL_DATA_PROVIDER` env var can be changed in AWS Secrets Manager and the ECS task restarted without a code deployment. Switching from Sportmonks to API-Football (or vice versa) is a < 5 minute operational action.

---

## 8. Attribution Requirements

Once a provider is licensed, attribution must appear in the product:

- Fixture detail pages
- Standings tables
- Player stats pages
- Live match centre pages

Example wording (to be confirmed with provider): "Match data provided by Sportmonks" with a link to the provider website. Exact wording and placement specified in the commercial agreement.

Engineering implementation: Attribution text stored in a `FootballDataProviderConfig` value (from the provider enum/name), rendered by a shared `<DataAttribution />` component in the frontend.

---

## 9. Next Steps

| Action | Owner | Priority |
|--------|:-----:|:--------:|
| Complete licensing gate checklist | OWNER | P0 — blocks fan-facing display |
| Contact Sportmonks for commercial quote | OWNER | P0 |
| Confirm PSL official position on data rights | OWNER | P0 |
| Implement `SportmonksAdapter` extending existing interface | Engineering | P1 |
| Add `FootballDataProviderCacheService` (Redis TTL layer) | Engineering | P1 |
| Store API key in AWS Secrets Manager | Engineering + Owner | P1 |
| Wire `FOOTBALL_DATA_PROVIDER` env var in ECS task definition | Engineering | P1 |
| Implement `<DataAttribution />` component | Engineering | P2 |
| Replace `picsum.photos` placeholders with licensed assets | Engineering | P2 (after rights confirmed) |
