# ADR-037 — World Cup Beta Live Match Provider Strategy

**Status:** Accepted  
**Date:** 2026-06-26  
**Author:** Platform Engineering  
**Related:** ADR-029 (Sportmonks rejected for PSL), ADR-030 (football-data.org for WC fixtures)

---

## Context

The World Cup 2026 beta requires live match state (events, lineups, player stats) for the Match Centre experience. The original ADR-029 rejected Sportmonks for the **PSL production** data feed due to cost, account suspension history, and lack of PSL coverage. That rejection remains in force for PSL.

For **World Cup 2026 beta**, the requirements differ:
- Fixtures and scores are supplied by football-data.org (ADR-030, already live, 104 fixtures seeded)
- Live match events, lineups, and player stats require a separate live-match provider — football-data.org's free tier does not supply these in real time
- Sportmonks v3 offers trial access to WC live match data (events, lineups, player statistics)

The current `LiveMatchService` hardcodes `ManualLiveMatchProviderAdapter` which returns null/empty for all live data. This means the Match Centre displays no events, lineups, or player stats until an admin enters them manually.

---

## Decision

**Sportmonks is conditionally accepted for World Cup 2026 beta live match data only**, subject to the constraints below.

A new `SportmonksLiveMatchAdapter` implementing `LiveMatchProviderAdapter` is introduced. The adapter is activated via two required env vars:

```
WC_LIVE_PROVIDER=sportmonks
SPORTMONKS_API_KEY=<trial or licensed key>
```

`LiveMatchService` resolves the provider at startup via `resolveProvider()`. When neither env var is set, `ManualLiveMatchProviderAdapter` remains the default — safe, no network calls, no key required.

**Sportmonks remains REJECTED for PSL production.** `ProviderRouterService` does not route any PSL competition code to Sportmonks.

---

## Constraints (non-negotiable)

| Constraint | Enforcement |
|---|---|
| PSL production ingestion via Sportmonks | Blocked — `ProviderRouterService` has no Sportmonks PSL route |
| Provider key exposed in API response | Never — `getWcBetaCapability` reports key presence only |
| Provider key in NEXT_PUBLIC_* env var | Forbidden by build-time validation |
| Betting / odds data | Not requested, not mapped, not stored |
| Scheduled or automatic ingestion | Not implemented — all sync is admin-triggered |
| Real-money features | None — Guess the Score and Fantasy are points-only |
| PSL season activation | Blocked — independent of this ADR |

---

## Provider capability summary (WC2026 beta)

| Concern | Provider | Status |
|---|---|---|
| Fixtures and scores | football-data.org | Live (ADR-030) |
| Live match state (status, minute) | football-data.org (refresh) | Live (periodic admin refresh) |
| Match events (goals, cards, subs) | Sportmonks v3 | Gated by `WC_LIVE_PROVIDER=sportmonks` |
| Lineups | Sportmonks v3 | Gated by `WC_LIVE_PROVIDER=sportmonks` |
| Player stats | Sportmonks v3 | Gated by `WC_LIVE_PROVIDER=sportmonks` |
| Video highlights | ScoreBat (widget embed) | Gated by `SCOREBAT_WIDGET_TOKEN` |
| PSL fixtures | ParsePslAdapter / ApiFootball | Not activated (ADR-018, ADR-019) |

---

## Consequences

**Positive:**
- Match Centre gains live events, lineups, and player stats for WC matches
- Safe default: if `SPORTMONKS_API_KEY` is not configured, the service falls back to manual mode silently
- PSL rejection is unchanged — no Sportmonks routing for PSL codes
- Provider is swappable: any class implementing `LiveMatchProviderAdapter` can replace Sportmonks without changing `LiveMatchService`

**Negative:**
- Sportmonks trial keys have rate limits and may require upgrade
- WC live data sync is not automated — admin must call the sync endpoint per fixture
- Adapter maps Sportmonks v3 event type_ids which may change between API versions

---

## Alternatives Considered

| Alternative | Rejected reason |
|---|---|
| Manual admin entry only | Events, lineups, stats for 104 fixtures is operationally infeasible |
| SportRadar for live data | API is expensive, not configured, and PSL scope is unclear |
| football-data.org for live events | Free tier does not include real-time events endpoint |
| SportsDataIO | WC coverage unverified, adapter is partial |

---

## ADR Trail

- ADR-029: Sportmonks rejected for PSL — remains in force
- ADR-030: football-data.org selected for WC fixtures — remains in force
- **ADR-037 (this):** Sportmonks conditionally accepted for WC beta live match data
