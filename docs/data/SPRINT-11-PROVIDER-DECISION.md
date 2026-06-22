# Sprint 11 — Provider Decision

Date: 2026-06-22

## Current Status: PRIMARY CANDIDATE SELECTED — PENDING TRIAL VALIDATION

**Primary candidate: API-Football (api-sports.io / api-football.com)**  
**Trial key status: NOT PRESENT** — `API_FOOTBALL_KEY` is set in `apps/api/.env` but its value is empty (length 0) as of Sprint 11.  
**Production ingestion: NOT AUTHORISED**  
**PSL season: NOT ACTIVATED**

---

## Provider Status Summary

| Provider | Sprint 11 Status | Reason |
|----------|-----------------|--------|
| API-Football | PRIMARY_CANDIDATE | Broad global coverage; 1,000+ leagues; African leagues included; free trial available; adapter skeleton implemented this sprint |
| SportsDataIO | SECONDARY_CANDIDATE | WC2026 confirmed (CompetitionId=21); PSL NOT confirmed on trial; existing adapter skeleton |
| Opta / Stats Perform | BLOCKED_BY_COMMERCIAL_ACCESS | No self-service trial; enterprise sales required |
| Sportradar | BLOCKED_BY_COMMERCIAL_ACCESS | No self-service trial; enterprise sales required; high cost |
| Football-Data.org | REJECTED_NO_PSL_COVERAGE | European-only competition coverage; PSL unlikely |
| Sportmonks | REJECTED | Sprint 10 amendment 2026-06-22; not reconsidered |

---

## Primary Candidate: API-Football

### Why API-Football Was Selected

- **Coverage breadth:** 1,000+ leagues worldwide; documented African league coverage
- **PSL prospect:** PSL Premier Soccer League (South Africa) is likely covered based on advertised league list; must be confirmed with a live key
- **WC2026 prospect:** Major international tournaments are documented in API-Football coverage; must be confirmed
- **Accessibility:** Free tier available; self-service sign-up; no sales engagement required for trial
- **Adoption:** Widely used in similar football analytics and fan engagement platforms
- **Dual endpoint:** Available directly (`v3.football.api-sports.io`) and via RapidAPI gateway; flexibility for infrastructure routing

### What Has Been Implemented

- Adapter skeleton created in `apps/api/src/data-provider/` this sprint
- Adapter operates in safe no-key mode when `API_FOOTBALL_KEY` is absent or empty
- Wired conditionally on `DATA_PROVIDER=api-football` env flag
- NoOp fallback adapter remains active when `DATA_PROVIDER` is unset or set to an unrecognised value
- Discovery script at `tools/discovery/api-football-discovery.mjs`
- No live API calls have been made (key is empty)

### API Configuration

| Item | Value |
|------|-------|
| Base URL (direct) | `https://v3.football.api-sports.io` |
| Base URL (RapidAPI) | `https://api-football-v1.p.rapidapi.com/v3` |
| Key header (direct) | `x-apisports-key` |
| Key header (RapidAPI) | `x-rapidapi-key` + `x-rapidapi-host` |
| Key env var | `API_FOOTBALL_KEY` |
| Wiring env flag | `DATA_PROVIDER=api-football` |
| Key storage | `apps/api/.env` (server-side only; never committed; never `NEXT_PUBLIC_*`) |

### PSL Coverage Status

**NOT_CONFIRMED** — PSL Premier Soccer League was not verified because no live trial key was available during Sprint 11. Coverage must be confirmed before production wiring.

### WC2026 Coverage Status

**LIKELY** — API-Football documents major international tournament coverage. Must be confirmed with a live trial key.

---

## Secondary Candidate: SportsDataIO

- Existing adapter skeleton retained
- WC2026 confirmed (CompetitionId=21 on trial)
- PSL NOT found in competition list on trial subscription
- Remains secondary candidate; PSL gap unresolved
- Will be reconsidered if API-Football PSL validation fails and SportsDataIO confirms PSL on a paid plan

---

## Owner Decision Gates

The following actions are required before API-Football can be wired to production ingestion:

- [ ] API-Football trial key obtained and set in `apps/api/.env` (never committed)
- [ ] `DATA_PROVIDER=api-football` set in `apps/api/.env`
- [ ] PSL Premier Soccer League confirmed in API-Football competition list (`tools/discovery/api-football-discovery.mjs`)
- [ ] WC2026 confirmed in API-Football competition list
- [ ] Starting lineup, match event, and standings fields verified against `ProviderAdapter` interface
- [ ] Commercial terms reviewed by owner (redistribution rights, rate limits, pricing tier)
- [ ] Rate limits validated as sufficient for 2 million concurrent fans
- [ ] Staging EC2 migration applied and smoke tests passing
- [ ] Owner explicitly authorises production ingestion

---

## What This Document Does NOT Authorise

- Production provider ingestion is NOT enabled
- PSL season is NOT activated
- No provider key is committed to git
- No provider key is accessible in frontend code or `NEXT_PUBLIC_*` env vars
- Sportmonks is NOT reconsidered
- No betting or odds endpoints are used
