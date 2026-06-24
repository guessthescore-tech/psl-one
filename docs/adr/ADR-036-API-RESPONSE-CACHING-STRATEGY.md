# ADR-036 — API Response Caching Strategy

**Status:** Accepted  
**Date:** 2026-06-24  
**Sprint:** Sprint 34

## Context

PSL One targets 2 million fans with traffic spikes around match kick-offs.
Read-heavy public endpoints (fixture lists, leaderboards, club info) will see
repeat identical requests within seconds. Without caching, every request hits PostgreSQL.

At 50,000 concurrent users with 5 req/s per user, uncached fixture-list queries
would generate 250,000 DB queries per second — far beyond any RDS instance budget.

## Decision

We adopt a **provider-abstracted, in-memory response cache** for this sprint:

- `CacheProvider` interface (get, set, delete, deleteByPrefix, flush).
- `InMemoryCacheAdapter` (Map + TTL) as the default — zero dependencies.
- `@CacheResponse(ttlSeconds)` decorator for per-endpoint TTL configuration.
- `CacheInvalidationService` for domain-level invalidation (fixture, leaderboard, media, etc.).
- `ApiCacheModule` is marked `@Global()` so all modules can use it without re-importing.

**Not cached:**
- Live match endpoints (always real-time).
- Admin endpoints (always current state).
- POST/PATCH/DELETE requests (mutations are never cached).
- User-specific or auth-token data.

## Consequences

### Positive

- Eliminates repeat DB hits for stable read endpoints.
- Zero new infrastructure (no Redis, no Elasticache in this sprint).
- Interface-based design: swap to Redis by implementing `RedisAdapter` without changing app code.
- Simple cache key strategy (full request URL) — predictable and easy to debug.

### Negative

- In-memory cache is not shared across ECS tasks — each task has its own cache.
  At scale (multi-task deployment), a fan on task-1 and a fan on task-2 may get
  different cache freshness. Acceptable for read-heavy public data; Redis solves this.
- Cache never persists across process restarts.
- No cache warming on cold start — first request after deploy is always uncached.

## Rejected Alternatives

### A — NestJS `@nestjs/cache-manager` with ioredis

**Deferred.** `cache-manager` adds indirect dependency chains and configuration complexity.
A direct Redis adapter in the next sprint is cleaner. Using `cache-manager` now
would add a layer we'd need to unwrap later.

### B — CloudFront response caching at the CDN layer

**Deferred.** CloudFront caching for API responses requires careful Cache-Control header
management and signed origins. Valuable for Sprint 35+, but adds infrastructure
complexity that blocks this sprint.

### C — No caching (DB for every request)

**Rejected.** Unsustainable at 2M fan scale. DB connection pool exhaustion at peak match
traffic is a known failure mode. Must cache before production launch.

## Upgrade Path (Sprint 35+)

```typescript
// Future: Redis adapter
const cacheProvider = {
  provide: CACHE_PROVIDER,
  useFactory: (configService: ConfigService) => {
    if (configService.get('CACHE_ADAPTER') === 'redis') {
      return new RedisAdapter(configService.get('REDIS_URL'));
    }
    return new InMemoryCacheAdapter();
  },
  inject: [ConfigService],
};
```

No controller or service changes needed — only the provider factory changes.

## Related

- ADR-008: Database design principles
- Sprint 34 docs: `docs/performance/SPRINT-34-CACHING-ARCHITECTURE.md`
- S3-INFRA-00: Database performance indexes (migration 38)
