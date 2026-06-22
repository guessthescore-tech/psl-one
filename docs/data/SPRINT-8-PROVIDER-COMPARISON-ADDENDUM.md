# Provider Comparison — Sprint 8 Addendum

**Sprint:** 8 (amendment)  
**Date:** 2026-06-21  
**Status:** SUPERSEDED — Sprint 10 amendment (2026-06-22): Sportmonks REJECTED. See `docs/data/SPRINT-10-ACTIVE-PROVIDER-STRATEGY.md`.

---

## Candidates

| # | Provider | Adapter | Status |
|---|----------|---------|--------|
| 1 | **Sportmonks** | `SportmonksAdapter` | Primary candidate — BLOCKED_BY_REPLACEMENT_TOKEN |
| 2 | **SportsDataIO** | `SportsDataIoSoccerAdapter` | Secondary candidate — trial not yet run |
| 3 | *Future fallback* | Implement `ProviderAdapter` | TBD |

---

## Comparison Matrix

| Property | Sportmonks v3 | SportsDataIO v4 | Future fallback |
|----------|--------------|-----------------|-----------------|
| **Auth method** | `Authorization: Bearer <key>` | `Ocp-Apim-Subscription-Key: <key>` | TBD |
| **PSL One env var** | `SPORTMONKS_API_KEY` | `SPORTSDATAIO_SOCCER_API_KEY` | TBD |
| **Trial access** | Available (token exposed — revoke + replace) | Available (self-service signup) | N/A |
| **Trial scope** | UEFA leagues + others (exact scope TBD) | UEFA Champions League only (Competition ID 3) | N/A |
| **Soccer coverage** | Known to cover many global leagues | Strong North American + European focus | Unknown |
| **PSL likelihood** | Possible — has African competitions | Unknown — less African coverage historically | Unknown |
| **World Cup 2026** | Possible — major tournament coverage likely | Possible — FIFA partnerships vary | Unknown |
| **Fixture coverage** | ✅ Confirmed in adapter | ✅ Confirmed in adapter | TBD |
| **Team/player coverage** | ✅ Confirmed in adapter | ✅ Confirmed in adapter | TBD |
| **Standings coverage** | ✅ Confirmed in adapter | ✅ Confirmed in adapter | TBD |
| **Live scores** | ✅ via `state.short_name` | ✅ `LiveScores/{competition}` endpoint | TBD |
| **Rate limits** | Tier-dependent; 429 handled gracefully | Tier-dependent; 429 handled gracefully | TBD |
| **Response format** | JSON with nested objects | Flat JSON arrays | TBD |
| **ID scheme** | Integer IDs | Integer IDs | TBD |
| **Commercial requirement** | Paid plan for production | Paid plan for production | TBD |
| **Odds/betting feeds** | Available but NOT used by PSL One | Available but MUST NOT use | N/A |
| **Implementation effort** | Complete (adapter written + tested) | Complete (adapter written + tested) | High |
| **Risk** | Low (proven adapter, known API shape) | Medium (less African league data) | High |
| **Documentation quality** | Good | Good | N/A |

---

## Recommendation (SUPERSEDED — see Sprint 10 amendment)

> **Sportmonks has been REJECTED** (Sprint 10 amendment 2026-06-22). The recommendation below is historical record only.

**Historical Primary:** Sportmonks (now REJECTED)  
**Historical Secondary:** SportsDataIO (still a candidate — PSL coverage unconfirmed)

**Decision gate:**  
A provider decision should NOT be made until both trial validations are complete. The criteria should be:
1. Does the provider have PSL (Premier Soccer League, South Africa) data?
2. Does the provider have World Cup 2026 fixture data?
3. What are the respective commercial terms?

The answer to (1) is the deciding factor — PSL is the primary competition for this platform.

---

## No-key safe state (confirmed for both)

Both adapters return safe empty arrays when their respective env key is absent. Neither throws. Neither calls any external service without a key. The NoOpAdapter remains the default when no key is configured.

---

## What is NOT permitted regardless of provider

- Odds feeds
- Betting lines
- Wagering data
- Fixed-odds endpoints
- Any data described as "betting" or "gambling" in the provider docs
- Any `NEXT_PUBLIC_*` provider keys
- Committing `.env` files with key values
