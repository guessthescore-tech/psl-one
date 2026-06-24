# Sprint 34 — API Response Caching Architecture

## Overview

PSL One uses a provider-abstracted in-memory cache for read-heavy API endpoints.
The cache reduces database load for frequently-accessed, slowly-changing data.

## Module Structure

```
apps/api/src/api-cache/
  cache.interface.ts              — CacheProvider interface + constants
  api-cache.module.ts             — Global NestJS module (InMemoryCacheAdapter default)
  api-cache.service.ts            — Wraps CacheProvider (DI-friendly)
  cache-invalidation.service.ts   — Domain-aware invalidation helpers
  adapters/
    in-memory-cache.adapter.ts    — Map-based TTL cache (Sprint 34 default)
  interceptors/
    cache-response.interceptor.ts — HTTP interceptor: cache GET responses
  decorators/
    cache-response.decorator.ts   — @CacheResponse(ttl) shorthand decorator
```

## Usage

```typescript
// On any GET endpoint:
@Get('public/fixtures')
@CacheResponse(300)  // cache for 5 minutes
listPublicFixtures() {
  return this.service.listPublicFixtures();
}
```

The `@CacheResponse(ttlSeconds)` decorator:
1. Sets `CACHE_TTL_METADATA` on the handler.
2. Applies `CacheResponseInterceptor` which checks/sets the cache using `req.url` as key.
3. Only caches HTTP GET requests (mutations are never cached).
4. Returns a cached response without hitting the DB if a valid entry exists.

## Cache Key Strategy

Cache keys are based on the full request URL including query string:
- `http:GET /fan/fixtures?season=wc-2026` → cached separately from `?season=psl-2026`
- Predictable: invalidation by prefix covers fixture, club, media, etc.

## Recommended TTLs

| Endpoint category        | TTL       | Rationale                                    |
|--------------------------|-----------|----------------------------------------------|
| Public fixture list      | 300s (5m) | Rarely changes mid-day                       |
| Club/team info           | 600s      | Very stable                                  |
| Leaderboards/standings   | 60s       | Updated after match events                   |
| Media/news listings      | 120s      | Editorial updates a few times per day        |
| Live match data          | 0 (none)  | Always live — never cache                    |
| Admin endpoints          | 0 (none)  | Admin needs current data                     |

## Cache Invalidation

`CacheInvalidationService` exposes domain-level invalidation:

```typescript
this.cacheInvalidation.invalidateFixture('fix-123');   // clears fixture:fix-123:* + fixtures:*
this.cacheInvalidation.invalidateLeaderboard();         // clears leaderboard:* + standings:*
this.cacheInvalidation.invalidateMedia();               // clears media:*, news:*, video:*
this.cacheInvalidation.invalidateAll();                 // full flush
```

Call these in service methods that mutate the relevant data.

## Future: Redis Adapter

When the platform scales beyond a single ECS task, the in-memory cache requires
a distributed cache. The `CacheProvider` interface is designed for a Redis swap:

```
CACHE_ADAPTER=redis  →  RedisAdapter (Sprint 35+)
```

No application code changes needed — only a new adapter implementing `CacheProvider`.
See ADR-036 for the boundary decision.
