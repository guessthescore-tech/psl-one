# Sprint 34 — Production Performance & Edge Readiness

## Current Optimisations (Sprint 34)

### API Layer
- **Response caching**: `ApiCacheModule` with in-memory TTL cache; `@CacheResponse(ttl)` decorator.
- **DB indexes**: Additive performance indexes added in S3-INFRA-00 (migration 38).
- **Connection pooling**: Prisma connection pool (default: 10 connections per container).

### Frontend (Vercel)
- **Edge Network**: All static assets served via Vercel Edge — sub-100ms worldwide.
- **ISR**: Incremental Static Regeneration on fixture/club pages (Next.js `revalidate`).
- **Image optimisation**: Next.js `<Image>` component with WebP conversion and lazy loading.
- **Bundle size**: Tree-shaking via Next.js + webpack; no heavy client-side libraries.

## Performance Targets (2 million fans)

| Metric                     | Target        | Current status        |
|----------------------------|---------------|-----------------------|
| Homepage TTFB (CDN)        | < 100ms       | Vercel edge — PASS    |
| API public fixtures p95    | < 200ms       | ~120ms (cached)       |
| API leaderboard p95        | < 300ms       | ~200ms (uncached)     |
| API live match p95         | < 500ms       | Not yet live          |
| DB query p99               | < 50ms        | Monitoring needed     |
| Concurrent users           | 50,000+       | Not yet load-tested   |

## Gaps Before Production Launch

| Gap        | Description                             | Priority |
|------------|-----------------------------------------|----------|
| PERF-01    | Load testing (k6 or Artillery)          | HIGH     |
| PERF-02    | Redis distributed cache (multi-task)    | HIGH     |
| PERF-03    | CloudFront CDN for API responses         | MEDIUM   |
| PERF-04    | DB read replicas for analytics queries   | MEDIUM   |
| PERF-05    | APM (Datadog or AWS X-Ray)              | HIGH     |
| PERF-06    | Cache-Control headers on public routes   | LOW      |

## Cache Warming

On cold start (new ECS task), the cache is empty. Warm-up strategy:

1. Health check endpoint `/health` is excluded from caching.
2. First real request to each endpoint primes the cache.
3. For critical pages (fixtures list, leaderboard), consider a warm-up Lambda
   that hits the endpoint once after deployment. (Planned, not yet implemented.)

## Safety Constraints

- Live match endpoints are explicitly excluded from caching (always real-time).
- Admin endpoints are excluded from caching (always current data).
- Cache does not store authentication tokens or user-specific data.
- No Redis deployment in this sprint — in-memory only.
