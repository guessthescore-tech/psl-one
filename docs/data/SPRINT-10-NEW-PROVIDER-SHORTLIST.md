# Sprint 10 — New Provider Shortlist

Date: 2026-06-22

## Context

Sportmonks was rejected as the primary provider (Sprint 10 amendment, 2026-06-22).  
Primary provider is UNDECIDED. This document lists candidates for evaluation.

**Critical requirement:** Any provider must have **PSL Premier Soccer League (South Africa)** fixture data. This is the non-negotiable deciding factor. See `docs/data/SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md` for the full requirements list.

---

## Evaluation Criteria (in priority order)

| # | Criterion | Must Have |
|---|-----------|-----------|
| 1 | PSL Premier Soccer League fixtures | YES — mandatory |
| 2 | World Cup 2026 fixtures | YES — mandatory |
| 3 | Live scores + match events | YES — mandatory |
| 4 | Player/squad data | YES — mandatory |
| 5 | Rate limits for 2M fans | YES — mandatory |
| 6 | No betting/odds feeds | YES — PSL One policy |
| 7 | Commercial licensing for PSL data | YES — gate before production |
| 8 | `ProviderAdapter` interface compatibility | Preferred (reduces implementation effort) |

---

## Shortlisted Candidates

> **IMPORTANT:** Claims of PSL coverage for providers below have NOT been validated by the PSL One team. All entries are research-stage only. Coverage must be confirmed with a live trial key before any provider is wired.

### 1. Opta / Stats Perform

- **Reputation:** Industry standard for African football data
- **PSL likelihood:** HIGH — Opta has historically covered the PSL
- **WC2026 likelihood:** HIGH — covers major FIFA competitions
- **Coverage model:** Licensed data feeds (B2B contract required)
- **Auth method:** API key / OAuth (varies by product tier)
- **Adapter effort:** NEW (implement `ProviderAdapter` interface)
- **Commercial:** Enterprise pricing — owner must contact sales
- **URL:** https://www.statsperform.com/opta/
- **PSL confirmation required:** YES — trial or sales confirmation needed

### 2. Football-Data.org

- **Reputation:** Popular free/freemium football API
- **PSL likelihood:** UNKNOWN — primarily covers European leagues; African coverage limited
- **WC2026 likelihood:** LIKELY (FIFA competitions typically included)
- **Coverage model:** Free tier + paid tiers
- **Auth method:** `X-Auth-Token` header (standard)
- **Adapter effort:** NEW (implement `ProviderAdapter` interface)
- **Commercial:** Free for limited use; paid for commercial/production
- **URL:** https://www.football-data.org/
- **PSL confirmation required:** YES — check `/competitions` endpoint for PSL

### 3. API-Football (RapidAPI / api-football.com)

- **Reputation:** Large database, many leagues worldwide
- **PSL likelihood:** MEDIUM — covers many African leagues; PSL specifically needs confirmation
- **WC2026 likelihood:** HIGH
- **Coverage model:** RapidAPI subscription tiers
- **Auth method:** `x-rapidapi-key` or `x-apisports-key` header
- **Adapter effort:** NEW (implement `ProviderAdapter` interface)
- **Commercial:** Pay-per-request or subscription; verify PSL on free tier
- **URL:** https://www.api-football.com/
- **Discovery script:** `tools/discovery/api-football-discovery.mjs` (created Sprint 10 amendment)
- **PSL confirmation required:** YES — run discovery with trial key

### 4. SportsDataIO (existing skeleton)

- **Reputation:** Strong North American + European coverage
- **PSL likelihood:** LOW — PSL was NOT found in competition list on current trial
- **WC2026 likelihood:** HIGH (CompetitionId=21 confirmed in trial)
- **Coverage model:** Self-service; UCL trial available; paid plans for other competitions
- **Auth method:** `Ocp-Apim-Subscription-Key` (existing adapter handles this)
- **Adapter effort:** LOW — skeleton exists; wire to DataProviderService once confirmed
- **Commercial:** Paid plan required for PSL (if available at all)
- **URL:** https://sportsdata.io/soccer
- **PSL confirmation required:** YES — sales confirmation or paid plan required; trial showed PSL absent

### 5. LiveScore API / ScoreAxis

- **Reputation:** Real-time scores focus; coverage varies by plan
- **PSL likelihood:** UNKNOWN — needs verification
- **WC2026 likelihood:** LIKELY
- **Coverage model:** Subscription
- **Auth method:** API key
- **Adapter effort:** NEW (implement `ProviderAdapter` interface)
- **Commercial:** Contact for pricing
- **PSL confirmation required:** YES

### 6. Sportradar

- **Reputation:** Enterprise-grade; official data partner for many leagues
- **PSL likelihood:** MEDIUM-HIGH — Sportradar has broad African coverage
- **WC2026 likelihood:** HIGH — FIFA official data partner
- **Coverage model:** Enterprise B2B licensing
- **Auth method:** API key
- **Adapter effort:** NEW (implement `ProviderAdapter` interface)
- **Commercial:** Enterprise pricing; significant cost; owner must contact sales
- **URL:** https://sportradar.com/
- **PSL confirmation required:** YES — sales confirmation required

---

## Recommended Evaluation Order

1. **API-Football** — run discovery script; large database; likely has PSL; accessible trial
2. **Opta / Stats Perform** — most likely to have authoritative PSL data; requires sales contact
3. **Sportradar** — enterprise option; strong African coverage; high cost
4. **SportsDataIO** — existing adapter advantage; but PSL absence on trial is a concern
5. **Football-Data.org** — European focus; PSL coverage unlikely but worth checking

---

## How to Evaluate a Candidate

1. Sign up for a trial key (or contact sales)
2. Add key to `apps/api/.env` as `<PROVIDER>_API_KEY=<value>` (never commit)
3. Implement `ProviderAdapter` interface (if new provider)
4. Run: `PROVIDER=<name> node --env-file=apps/api/.env tools/discovery/provider-coverage-check.mjs`
5. Verify PSL is in competition list
6. Run: `PROVIDER=<name> node --env-file=apps/api/.env tools/discovery/provider-field-mapping-check.mjs`
7. Document results in a new `docs/data/SPRINT-XX-<PROVIDER>-VALIDATION.md`
8. If PSL + WC2026 confirmed and field mapping passes → proceed to commercial terms review

---

## What Is NOT Permitted During Evaluation

- No betting, odds, or wagering endpoints
- No committing provider keys to git
- No `NEXT_PUBLIC_*` provider keys
- No production ingestion until owner authorizes
- No PSL season activation
