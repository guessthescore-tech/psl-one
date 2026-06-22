# Sprint 11 — Provider Risk Register

Date: 2026-06-22

## Overview

This register tracks all known risks related to the Sprint 11 provider selection. Risks are assessed against the primary candidate (API-Football) and the overall provider strategy. Risk levels apply at time of writing; they must be reviewed when the owner sets a live trial key and runs discovery.

---

## Risk Register

### R1 — PSL not in API-Football free tier

| Field | Value |
|-------|-------|
| **Risk ID** | R1 |
| **Category** | Coverage |
| **Likelihood** | MEDIUM |
| **Impact** | HIGH |
| **Overall Level** | HIGH |
| **Description** | API-Football claims 1,000+ leagues including African competitions but PSL Premier Soccer League (South Africa) has not been confirmed. If PSL is absent from the free tier or any paid tier, the primary candidate must be replaced. |
| **Owner action** | Obtain API-Football trial key; run `tools/discovery/api-football-discovery.mjs`; confirm PSL is in the competition list. |
| **Mitigation** | SportsDataIO remains as secondary candidate (PSL also unconfirmed). Opta / Sportradar as enterprise fallback. Manual PSL import as last resort. |
| **Status** | OPEN — key not yet available |

---

### R2 — API-Football rate limits insufficient at 2 million fans

| Field | Value |
|-------|-------|
| **Risk ID** | R2 |
| **Category** | Scalability |
| **Likelihood** | MEDIUM |
| **Impact** | MEDIUM |
| **Overall Level** | MEDIUM |
| **Description** | PSL One is designed to scale to 2 million concurrent fans. API-Football free tier has strict daily request limits. Paid plans vary. Rate limits have not been validated for production load. |
| **Owner action** | Review API-Football paid plan tiers; confirm requests-per-minute and burst limits; assess whether server-side caching strategy (Redis TTL layer) is sufficient to stay within limits. |
| **Mitigation** | Aggressive server-side caching with Redis; polling interval tuning; CDN edge caching for static fixture data. Rate limit architecture is documented in `docs/performance/`. |
| **Status** | OPEN — pending commercial tier review |

---

### R3 — No live trial key available in Sprint 11

| Field | Value |
|-------|-------|
| **Risk ID** | R3 |
| **Category** | Validation |
| **Likelihood** | CONFIRMED (current state) |
| **Impact** | HIGH |
| **Overall Level** | HIGH |
| **Description** | `API_FOOTBALL_KEY` is present in `apps/api/.env` but its value has length 0. The adapter skeleton has been implemented and tested in no-key mode but no live API call has been made. PSL and WC2026 coverage, field mapping, and rate limits remain unvalidated. |
| **Owner action** | Sign up at https://www.api-football.com/ or https://rapidapi.com/api-sports/api/api-football; place trial key in `apps/api/.env` as `API_FOOTBALL_KEY=<value>`; run discovery scripts. |
| **Mitigation** | Adapter safe no-key mode ensures CI and tests pass without a key. Platform is fully functional with NoOp provider until key is set. |
| **Status** | OPEN — owner action required |

---

### R4 — Commercial terms not yet reviewed

| Field | Value |
|-------|-------|
| **Risk ID** | R4 |
| **Category** | Legal / Licensing |
| **Likelihood** | CONFIRMED (current state) |
| **Impact** | HIGH |
| **Overall Level** | HIGH |
| **Description** | API-Football Terms of Service and redistribution rights have not been reviewed by the owner. Downstream display of PSL match data to fans may require specific licensing. Using the API without reviewing terms creates legal and commercial risk. |
| **Owner action** | Review API-Football Terms of Service at https://www.api-football.com/documentation; confirm redistribution is permitted for the intended commercial use case; seek legal advice if unclear. |
| **Mitigation** | Production ingestion is blocked until this gate is explicitly cleared by the owner. No live data is displayed to fans during Sprint 11. |
| **Status** | OPEN — owner review required before production |

---

### R5 — SportsDataIO PSL gap unresolved

| Field | Value |
|-------|-------|
| **Risk ID** | R5 |
| **Category** | Coverage |
| **Likelihood** | MEDIUM |
| **Impact** | MEDIUM |
| **Overall Level** | MEDIUM |
| **Description** | SportsDataIO is the secondary candidate with an existing adapter skeleton and confirmed WC2026 coverage. However, PSL Premier Soccer League was NOT present in the competition list returned on the current trial subscription. If a paid plan or sales confirmation cannot resolve this gap, SportsDataIO cannot serve as primary provider for PSL data. |
| **Owner action** | Contact SportsDataIO sales or upgrade to a paid plan that includes African leagues; re-run competition list check; if PSL confirmed, elevate to co-primary for PSL. |
| **Mitigation** | API-Football is primary candidate. Manual PSL import is last resort. |
| **Status** | OPEN — sales or paid plan confirmation required |

---

### R6 — Manual PSL import increases operational burden if all APIs fail

| Field | Value |
|-------|-------|
| **Risk ID** | R6 |
| **Category** | Operations |
| **Likelihood** | LOW (only triggers if all API providers fail to confirm PSL) |
| **Impact** | MEDIUM |
| **Overall Level** | LOW |
| **Description** | If neither API-Football nor SportsDataIO can confirm PSL coverage, and enterprise providers (Opta, Sportradar) are not contracted, the platform falls back to CSV/manual fixture import via `FixtureImportBatch`. This approach does not support live scores, automated events, or lineups, and requires manual operator input for every matchday. |
| **Owner action** | Ensure at least one API provider confirms PSL coverage before the PSL season is activated. If manual import becomes the sole option, accept the operational cost and scope limitation explicitly. |
| **Mitigation** | Manual import infrastructure is fully implemented (Sprint 27). Fantasy scoring and predictions can use manually imported fixture data with reduced live match intelligence capability. |
| **Status** | OPEN — monitoring; does not block current sprint |

---

## Risk Summary

| ID | Risk | Level | Status |
|----|------|-------|--------|
| R1 | PSL not in API-Football free tier | HIGH | OPEN |
| R2 | API-Football rate limits insufficient at 2M fans | MEDIUM | OPEN |
| R3 | No live trial key available in Sprint 11 | HIGH | OPEN |
| R4 | Commercial terms not yet reviewed | HIGH | OPEN |
| R5 | SportsDataIO PSL gap unresolved | MEDIUM | OPEN |
| R6 | Manual import operational burden | LOW | OPEN |

---

## Risk Closure Criteria

| ID | Closed When |
|----|------------|
| R1 | PSL competition confirmed in API-Football competition list via live API call |
| R2 | Paid plan rate limits documented and caching strategy confirmed sufficient |
| R3 | Live trial key placed in `apps/api/.env`; discovery scripts run and documented |
| R4 | Owner reviews and accepts ToS; redistribution rights confirmed for commercial use |
| R5 | SportsDataIO PSL confirmed on paid plan OR SportsDataIO relegated to WC2026-only role |
| R6 | At least one API provider confirms PSL coverage before season activation |
