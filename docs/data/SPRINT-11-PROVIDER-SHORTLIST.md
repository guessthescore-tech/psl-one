# Sprint 11 — Provider Shortlist

Date: 2026-06-22

## Context

Sportmonks was REJECTED in Sprint 10 (amendment 2026-06-22) and is not reconsidered.  
Primary provider remains UNDECIDED entering Sprint 11.  
Sprint 11 selects API-Football as the primary candidate for adapter implementation and pending trial validation.

See `docs/data/SPRINT-10-PROVIDER-DECISION.md` for the full Sportmonks rejection record.  
See `docs/data/SPRINT-11-PROVIDER-DECISION.md` for the Sprint 11 decision record.

> **IMPORTANT:** PSL Premier Soccer League coverage has NOT been confirmed on any provider by the PSL One team as of Sprint 11. All coverage assessments below are research-stage estimates. Coverage must be verified with a live trial key before any provider is wired to production ingestion.

---

## 1. API-Football / API-Sports

**Status: PRIMARY_CANDIDATE**

- **Providers:** api-football.com / api-sports.io (same underlying platform)
- **Base URL (direct):** `https://v3.football.api-sports.io`
- **Base URL (RapidAPI gateway):** `https://api-football-v1.p.rapidapi.com/v3`
- **Key header (direct):** `x-apisports-key`
- **Key header (RapidAPI):** `x-rapidapi-key` + `x-rapidapi-host`
- **Key env var:** `API_FOOTBALL_KEY`
- **PSL coverage:** NOT_CONFIRMED — 1,000+ leagues claimed including African competitions; PSL Premier Soccer League (South Africa) must be confirmed with a live trial key
- **WC2026 coverage:** LIKELY — major tournament coverage documented; must be confirmed
- **Free tier:** YES — limited requests/day; sufficient for discovery and validation
- **Commercial:** Self-service subscription tiers; paid plan required for production volumes
- **Adapter status:** Skeleton implemented this sprint (safe no-key mode); pending validation
- **Discovery script:** `tools/discovery/api-football-discovery.mjs`
- **Wiring condition:** `DATA_PROVIDER=api-football` env flag
- **Owner action required:** Obtain trial key, set `API_FOOTBALL_KEY` in `apps/api/.env`, run discovery tools

---

## 2. Football-Data.org

**Status: REJECTED_NO_PSL_COVERAGE (likely)**

- **Base URL:** `https://api.football-data.org/v4`
- **Key header:** `X-Auth-Token`
- **PSL coverage:** NOT_CONFIRMED — primarily European leagues (Premier League, Bundesliga, Serie A, etc.); African football coverage is minimal to absent
- **WC2026 coverage:** LIKELY — FIFA competitions historically included
- **Free tier:** YES — limited endpoints; paid tiers for full access
- **Commercial:** Freemium + paid plans
- **Adapter status:** NOT IMPLEMENTED
- **Rejection rationale:** European-only focus makes PSL coverage highly unlikely; not worth adapter investment without prior confirmation of PSL via the `/competitions` endpoint

---

## 3. Opta / Stats Perform

**Status: BLOCKED_BY_COMMERCIAL_ACCESS**

- **URL:** https://www.statsperform.com/opta/
- **Auth method:** API key / OAuth (varies by product tier; B2B contract required)
- **PSL coverage:** LIKELY HIGH — Opta has historically covered South African football and the PSL Premier Soccer League
- **WC2026 coverage:** LIKELY HIGH — covers major FIFA competitions at enterprise tier
- **Free tier:** NO — enterprise B2B licensing; no self-service trial
- **Commercial:** Enterprise pricing; owner must contact Stats Perform sales
- **Adapter status:** NOT IMPLEMENTED
- **Blocking condition:** Requires sales engagement before any coverage can be confirmed or adapter built

---

## 4. Sportradar

**Status: BLOCKED_BY_COMMERCIAL_ACCESS**

- **URL:** https://sportradar.com/
- **Auth method:** API key (B2B contract required)
- **PSL coverage:** LIKELY — Sportradar has broad African football coverage
- **WC2026 coverage:** LIKELY HIGH — Sportradar is an official FIFA data partner for major tournaments
- **Free tier:** NO — enterprise B2B licensing; limited developer sandbox (does not include PSL)
- **Commercial:** Enterprise pricing; owner must contact Sportradar sales; significant commercial cost
- **Adapter status:** NOT IMPLEMENTED
- **Blocking condition:** Requires sales engagement; cost may be prohibitive for early-stage platform

---

## 5. SportsDataIO

**Status: SECONDARY_CANDIDATE**

- **URL:** https://sportsdata.io/soccer
- **Auth method:** `Ocp-Apim-Subscription-Key` header
- **Key env var:** `SPORTS_DATA_IO_KEY`
- **PSL coverage:** NOT_CONFIRMED — PSL was NOT present in the competition list on the current trial subscription; requires paid plan or sales confirmation to determine if PSL is available at any tier
- **WC2026 coverage:** PARTIAL — World Cup 2026 (CompetitionId=21) confirmed on trial
- **Free tier:** YES — UCL trial only; PSL not accessible on trial
- **Commercial:** Self-service paid plans for additional competitions
- **Adapter status:** Skeleton exists; wired to `DataProviderService` but gated behind `DATA_PROVIDER` env flag
- **Blocking condition:** PSL coverage gap unresolved; secondary until PSL is confirmed via paid plan or sales

---

## 6. Official PSL Manual Import (Fallback)

**Status: FALLBACK_OPTION**

- **Method:** CSV / manual fixture and result import via existing admin tooling
- **PSL coverage:** CONFIRMED — data entered directly by operators
- **WC2026 coverage:** N/A — fallback covers PSL only; WC2026 would require a separate provider
- **Free tier:** N/A — operational cost only
- **Commercial:** No API licensing; operator-managed data entry
- **Adapter status:** `FixtureImportBatch` and `FixtureImportRow` models exist in the Prisma schema; `FixtureImportModule` implemented in Sprint 27
- **Limitation:** High operational burden; does not scale for live scores or automated events; last resort if all API providers fail to confirm PSL coverage

---

## Shortlist Summary

| Provider | PSL Coverage | WC2026 | Free Trial | Commercial Gate | Sprint 11 Status |
|----------|-------------|--------|------------|-----------------|-----------------|
| API-Football | NOT_CONFIRMED | LIKELY | YES | Self-service | PRIMARY_CANDIDATE |
| Football-Data.org | UNLIKELY | LIKELY | YES | Freemium | REJECTED_NO_PSL_COVERAGE |
| Opta / Stats Perform | LIKELY | LIKELY HIGH | NO | Enterprise sales | BLOCKED_BY_COMMERCIAL_ACCESS |
| Sportradar | LIKELY | LIKELY HIGH | NO | Enterprise sales | BLOCKED_BY_COMMERCIAL_ACCESS |
| SportsDataIO | NOT_CONFIRMED | PARTIAL | UCL only | Self-service | SECONDARY_CANDIDATE |
| PSL Manual Import | CONFIRMED | N/A | N/A | None | FALLBACK_OPTION |

---

## What Is NOT Permitted

- No betting, odds, or wagering provider consideration
- No committing provider API keys to git
- No `NEXT_PUBLIC_*` provider keys
- No production ingestion until owner authorizes after all gates pass
- No PSL season activation
- No Sportmonks reconsideration
