# Sprint 3 Infrastructure Story 0 — Cache Readiness Analysis

**Purpose:** Per-endpoint analysis of caching suitability; inform the Redis/CDN infrastructure decision  
**Audience:** Platform engineers, infrastructure team  
**Status:** Implemented and awaiting acceptance  
**Last verified:** 2026-06-14  
**Source of truth:** `apps/api/src/`, measurement required before cache layer is implemented  
**Story identifier:** S3-INFRA-00  
**Decision:** Measure before implementing Redis

---

## Principle

Do not add Redis because a review suggested it. Add Redis when a measured query latency, throughput limit, or database CPU target cannot be met with indexes and query optimisation alone.

This document provides the analysis required to make that decision.

---

## Endpoint Analysis

### 1. Active Season

| Attribute | Value |
|-----------|-------|
| **Endpoint** | `GET /seasons/active` |
| **Current query** | `season.findFirst({ where: { isActive: true } })` |
| **Estimated frequency** | Every authenticated request (embedded in middleware of season-scoped routes) |
| **Data change frequency** | Once per season activation (months between changes) |
| **Acceptable staleness** | 60 seconds |
| **Current indexes** | None on `isActive` — but table has < 10 rows |
| **CDN suitability** | NO (user-authenticated context) |
| **In-process cache** | HIGH suitability — 60s TTL, single value, tiny payload |
| **Distributed cache** | LOW priority — single value, trivial |
| **Invalidation owner** | `SeasonSwitchingService.activateSeason()` |
| **Recommendation** | Simple NestJS in-process `Map` with 60s TTL; defer Redis |

---

### 2. League Standings

| Attribute | Value |
|-----------|-------|
| **Endpoint** | `GET /leaderboards/overall` |
| **Current query** | `fanValueLedger.groupBy` + `fanProfile.findMany` |
| **Estimated frequency** | ~100 req/min at peak matchday |
| **Data change frequency** | Every fan transaction (frequent during live match) |
| **Acceptable staleness** | 30 seconds |
| **Current indexes** | `@@index([seasonId, userId])` on fanValueLedger ✓ |
| **CDN suitability** | YES (public endpoint, no PII) |
| **In-process cache** | MEDIUM — multi-instance staleness; CDN preferred |
| **Distributed cache** | LOW priority for beta |
| **Invalidation owner** | `FanValueService` on any ledger write |
| **Recommendation** | Add `Cache-Control: public, max-age=30` header; CDN edge cache covers this |

---

### 3. Fixture List

| Attribute | Value |
|-----------|-------|
| **Endpoint** | `GET /football/fixtures` |
| **Current query** | `fixture.findMany` with season/status/isPublished filters |
| **Estimated frequency** | ~500 req/min at peak (Match Centre landing) |
| **Data change frequency** | Admin-triggered (publish, score update) |
| **Acceptable staleness** | 60 seconds |
| **Current indexes** | `@@index([seasonId, status, isPublished])`, `@@index([seasonId, kickoffAt])` ✓ |
| **CDN suitability** | YES (public, no PII) |
| **In-process cache** | MEDIUM |
| **Distributed cache** | LOW priority for beta |
| **Invalidation owner** | `FootballService` on fixture update |
| **Recommendation** | `Cache-Control: public, max-age=60`; revalidate on admin fixture publish event |

---

### 4. Live Match Centre

| Attribute | Value |
|-----------|-------|
| **Endpoint** | `GET /match-centre/live/:fixtureId` |
| **Current query** | Multiple joins: fixture + match_events + lineups + standings |
| **Estimated frequency** | ~2,000 req/min per live fixture at scale |
| **Data change frequency** | Every 30–60 seconds during live match |
| **Acceptable staleness** | 15 seconds (live data) |
| **Current indexes** | `@@index([fixtureId, minute])` on match_events ✓ (added Sprint 3) |
| **CDN suitability** | PARTIAL — short TTL needed; CDN edge with 15s TTL viable |
| **In-process cache** | LOW — invalidation complexity |
| **Distributed cache** | MEDIUM priority — required for > 5 concurrent live fixtures |
| **Invalidation owner** | `LiveMatchService.ingestEvent()` |
| **Recommendation** | `Cache-Control: public, max-age=15`; investigate server-sent events for push model. Redis classified INFRASTRUCTURE_REQUIRED if > 5 simultaneous live fixtures |

---

### 5. Player Pool (Fantasy)

| Attribute | Value |
|-----------|-------|
| **Endpoint** | `GET /fantasy/players` |
| **Current query** | `player.findMany` with season filter + price join |
| **Estimated frequency** | ~200 req/min during transfer window |
| **Data change frequency** | Price recalibration (admin-triggered, infrequent) |
| **Acceptable staleness** | 5 minutes |
| **Current indexes** | `@@index` on player season/status ✓ |
| **CDN suitability** | YES (public) |
| **In-process cache** | HIGH suitability — large stable dataset |
| **Distributed cache** | LOW priority for beta |
| **Invalidation owner** | `FantasyPriceCalibrationService` on price publish |
| **Recommendation** | `Cache-Control: public, max-age=300`; invalidate on price calibration event |

---

### 6. Prediction Leaderboard

| Attribute | Value |
|-----------|-------|
| **Endpoint** | `GET /leaderboards/predictions` |
| **Current query** | `$queryRaw GROUP BY user_id` (fixed Sprint 3) |
| **Estimated frequency** | ~50 req/min |
| **Data change frequency** | On settlement (post-match) |
| **Acceptable staleness** | 5 minutes |
| **Current indexes** | `@@index([fixtureId])` on prediction_points_ledger ✓ (added Sprint 3) |
| **CDN suitability** | YES (public) |
| **In-process cache** | MEDIUM |
| **Distributed cache** | LOW priority |
| **Invalidation owner** | `PredictionsService.settleFixture()` |
| **Recommendation** | `Cache-Control: public, max-age=300`; no Redis required at beta |

---

## Cache Decision Summary

| Endpoint | CDN | In-Process | Distributed (Redis) | Priority |
|----------|-----|------------|---------------------|----------|
| Active season | NO | YES (60s TTL) | NOT REQUIRED | LOW |
| Standings | YES | NO | NOT REQUIRED | MEDIUM |
| Fixture list | YES | NO | NOT REQUIRED | MEDIUM |
| Live Match Centre | PARTIAL (15s) | NO | INFRASTRUCTURE_REQUIRED >5 fixtures | HIGH |
| Player pool | YES | YES (5min) | NOT REQUIRED | LOW |
| Prediction leaderboard | YES | NO | NOT REQUIRED | LOW |

---

## Redis Classification

**Redis is NOT required for beta staging.**

Redis becomes INFRASTRUCTURE_REQUIRED when:

1. More than 5 simultaneous live fixtures are served concurrently  
2. Multi-replica API deployment requires shared auth rate-limiting state  
3. Session token revocation requires distributed invalidation  
4. Cache-aside pattern is needed for sub-second leaderboard serving under peak load

Trigger: load test showing `p95 > 200ms` on any of the above endpoints under simulated matchday traffic.

---

## Immediately Safe Improvements (No Redis)

These can be added without infrastructure changes:

1. Add `Cache-Control` headers to public fixture/standings/leaderboard endpoints  
2. Add ETag support to fixture list (hash of last-updated timestamp)  
3. Add CDN-friendly `Vary` headers  
4. Add in-process active-season cache with 60s TTL in `SeasonSwitchingService`

These are Sprint 3 infrastructure work, not this story.
