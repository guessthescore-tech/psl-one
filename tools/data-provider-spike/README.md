# PSL One — Data Provider Spike: NestJS Adapter Architecture

**Last updated:** 2026-06-20 (Sprint 4 data-provider research)
**Status:** ARCHITECTURE SKETCH — no real API calls, no real keys, no scraping
**Related docs:** `docs/data/SPRINT-4-PROVIDER-RECOMMENDATION.md`, `docs/data/SPRINT-4-PROVIDER-FIELD-MAPPING.md`, ADR-030

This directory contains:
- `api-football-discovery.mjs` — read-only discovery script (requires owner-supplied API key, not committed)
- `adapter-interface.ts` — TypeScript interface sketch (types only, no implementation, no live calls)
- `README.md` — this file

---

## Purpose

This spike answers the question: **what would a production-grade Sportmonks adapter look like inside the PSL One NestJS backend?**

It does NOT:
- Make live API calls
- Store or expose API keys
- Scrape any website
- Write to the database
- Deploy to any environment

It DOES:
- Define the TypeScript interfaces that a real adapter must implement
- Describe the NestJS module structure
- Describe the Redis caching strategy
- Show how `LiveMatchService` consumes the adapter
- Describe the HTTP client configuration

---

## Adapter Module Structure

The production adapter lives in `apps/api/src/football/providers/`. The spike defines the interfaces; the real adapter files are created in Sprint 4 implementation.

```
apps/api/src/football/
├── football.module.ts                    (imports FootballDataProviderModule)
├── football.controller.ts
├── football.service.ts
├── live-match.service.ts                 (consumes LiveMatchProviderAdapter — already exists)
├── live-match-provider.interface.ts      (already exists; extended by real adapters)
│
└── providers/
    ├── football-data-provider.module.ts  (selects adapter from FOOTBALL_DATA_PROVIDER env var)
    ├── football-data-provider.token.ts   (NestJS injection token)
    ├── football-data-provider-cache.service.ts  (Redis TTL wrapper)
    ├── api-football.adapter.ts           (implements ProviderAdapter for API-Football)
    ├── sportmonks.adapter.ts             (implements ProviderAdapter for Sportmonks)
    └── manual.adapter.ts                 (existing ManualLiveMatchProviderAdapter — no-op)
```

---

## FootballDataProviderModule

The module selects the correct adapter at startup based on an environment variable:

```typescript
// apps/api/src/football/providers/football-data-provider.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FOOTBALL_DATA_PROVIDER_TOKEN } from './football-data-provider.token';
import { SportmonksAdapter } from './sportmonks.adapter';
import { ApiFootballAdapter } from './api-football.adapter';
import { ManualLiveMatchProviderAdapter } from '../live-match-provider.interface';
import { FootballDataProviderCacheService } from './football-data-provider-cache.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    FootballDataProviderCacheService,
    {
      provide: FOOTBALL_DATA_PROVIDER_TOKEN,
      useFactory: (config: ConfigService, cache: FootballDataProviderCacheService) => {
        const provider = config.get<string>('FOOTBALL_DATA_PROVIDER', 'manual');
        switch (provider) {
          case 'sportmonks':
            return new SportmonksAdapter(config, cache);
          case 'api-football':
            return new ApiFootballAdapter(config, cache);
          case 'manual':
          default:
            return new ManualLiveMatchProviderAdapter();
        }
      },
      inject: [ConfigService, FootballDataProviderCacheService],
    },
  ],
  exports: [FOOTBALL_DATA_PROVIDER_TOKEN],
})
export class FootballDataProviderModule {}
```

**Key design decisions:**
- The `FOOTBALL_DATA_PROVIDER` env var controls which adapter is active. No code change needed to switch providers.
- The `manual` adapter is the default — the platform boots and operates without any external provider configured.
- The factory pattern means NestJS DI handles all lifecycle management.

---

## How LiveMatchService Consumes the Adapter

`LiveMatchService` (already exists at `apps/api/src/football/live-match.service.ts`) is updated to inject the provider adapter:

```typescript
// apps/api/src/football/live-match.service.ts (injection update)
import { Inject, Injectable } from '@nestjs/common';
import { FOOTBALL_DATA_PROVIDER_TOKEN } from './providers/football-data-provider.token';
import { LiveMatchProviderAdapter } from './live-match-provider.interface';

@Injectable()
export class LiveMatchService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(FOOTBALL_DATA_PROVIDER_TOKEN)
    private readonly provider: LiveMatchProviderAdapter,
  ) {}

  async syncLiveFixtureFromProvider(fixtureId: string): Promise<void> {
    // Look up the provider fixture ID from our internal fixture record
    const fixture = await this.prisma.fixture.findUnique({
      where: { id: fixtureId },
      select: { id: true, externalId: true, status: true },
    });
    if (!fixture?.externalId) return; // no provider ref — skip silently

    // Fetch from provider (cache-first, handled inside adapter)
    const state = await this.provider.fetchFixtureState(fixture.externalId);
    if (!state) return;

    // Update fixture status and scores in the database
    await this.prisma.fixture.update({
      where: { id: fixtureId },
      data: {
        status: state.status,
        homeScore: state.homeScore,
        awayScore: state.awayScore,
        liveMinute: state.currentMinute,
      },
    });

    // Sync events
    const events = await this.provider.fetchFixtureEvents(fixture.externalId);
    // ... upsert events using existing AddMatchEventDto logic ...
  }
}
```

The adapter is consumed only server-side. `LiveMatchService` never passes provider data directly to the frontend — it writes to Prisma, and the frontend reads from the NestJS REST API.

---

## Redis Caching Strategy

The `FootballDataProviderCacheService` wraps all provider calls with Redis caching. The adapter calls this service rather than calling the provider HTTP client directly.

```typescript
// Conceptual structure — not production code
class FootballDataProviderCacheService {
  // Cache TTLs
  LIVE_STATE_TTL    = 30;       // seconds — minimum safe interval for live polling
  LIVE_EVENTS_TTL   = 30;       // seconds
  LIVE_LINEUP_TTL   = 5 * 60;   // 5 minutes — lineups rarely change mid-match
  SCHEDULED_TTL     = 5 * 60;   // 5 minutes — non-live fixture list
  STANDINGS_TTL     = 5 * 60;   // 5 minutes — updates only after matches
  TEAM_TTL          = 24 * 3600; // 24 hours — season-stable
  PLAYER_TTL        = 24 * 3600; // 24 hours — season-stable
  HISTORICAL_TTL    = 24 * 3600; // 24 hours — finished fixtures are immutable

  // Cache key patterns
  liveStateKey(providerFixtureId: string): string {
    return `football:live:${providerFixtureId}:state`;
  }
  liveEventsKey(providerFixtureId: string): string {
    return `football:live:${providerFixtureId}:events`;
  }
  standingsKey(leagueId: string, season: string): string {
    return `football:standings:${leagueId}:${season}`;
  }
  teamsKey(leagueId: string, season: string): string {
    return `football:teams:${leagueId}:${season}`;
  }

  async getOrFetch<T>(
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>,
  ): Promise<{ data: T; stale: boolean }> {
    // 1. Try cache hit
    // 2. On miss: call fetcher (provider HTTP call)
    // 3. On fetcher success: store in Redis with TTL; return fresh data
    // 4. On fetcher failure: return stale cache if age < STALE_THRESHOLD; else return null
    // 5. Increment provider call counter for rate-limit monitoring
  }
}
```

**Rate-limit defence:**
- At any given time, there are at most 8 PSL fixtures live simultaneously (a full matchday round).
- Each fixture requires one `liveState` + one `liveEvents` refresh per 30 s cycle.
- That is 8 × 2 = 16 provider calls per 30 s = 32 calls/min.
- API-Football Pro tier allows 30,000/day = ~20 calls/min average; Ultra allows 150,000/day.
- For Sportmonks commercial tier: confirm per-minute limits with the provider.
- The cache means that 2M fans hitting the NestJS API during a live match do NOT each trigger a provider call — they all get the same cached data.

---

## HTTP Client Configuration

Each adapter uses NestJS `HttpModule` (Axios-based) configured with provider-specific settings:

```typescript
// Conceptual — inside SportmonksAdapter constructor
const axiosConfig: AxiosRequestConfig = {
  baseURL: 'https://api.sportmonks.com/v3/football',
  headers: {
    Authorization: `Bearer ${apiKey}`,   // Key from AWS Secrets Manager — never hardcoded
    Accept: 'application/json',
  },
  timeout: 10_000,                        // 10 s hard timeout per request
};
```

**Retry policy:**
- 1 automatic retry on 5xx errors (transient server errors)
- No retry on 4xx errors (client/auth errors — alert immediately)
- No retry on timeout — log as provider latency event

**Circuit breaker:**
- After 3 consecutive failures within 60 s, the adapter enters "open" state
- In open state: returns null/empty without calling provider; `LiveMatchService` falls back to stale DB data
- After 60 s, the adapter enters "half-open" state and tries one probe request
- On probe success: circuit closes; normal operation resumes
- Circuit state stored in Redis so it survives pod restart

---

## Environment Variables

| Variable | Description | Where stored |
|----------|-------------|:------------:|
| `FOOTBALL_DATA_PROVIDER` | `sportmonks` / `api-football` / `manual` | AWS SSM Parameter Store or ECS task env |
| `FOOTBALL_API_KEY` | Provider API key | AWS Secrets Manager — never in git or `.env` |
| `FOOTBALL_API_BASE_URL` | Provider base URL (overridable for testing) | ECS task env or config |

The existing `apps/api/src/env.ts` (using `zod` validation) should be extended with these variables. They have safe defaults (`FOOTBALL_DATA_PROVIDER` defaults to `'manual'`) so the platform boots without provider configuration.

---

## What a Real Implementation Would NOT Do

- Call any provider API directly from `apps/web` or `apps/experience` (Next.js frontends)
- Store `NEXT_PUBLIC_FOOTBALL_API_KEY` in any frontend environment variable
- Expose provider rate limit headers to the frontend
- Log raw provider responses (they may contain PII — player DOB, nationality)
- Cache provider data without respecting the TTL rules above
- Hard-code league IDs, team IDs, or player IDs from memory — all IDs are discovered at runtime via the leagues discovery flow

---

## Testing the Adapter (No Live Calls)

The adapter can be unit-tested without live calls by injecting a mock HTTP client:

```typescript
// Conceptual test
describe('SportmonksAdapter', () => {
  it('should transform a raw fixture response to ProviderFixtureState', async () => {
    const mockHttpClient = {
      get: jest.fn().mockResolvedValue({ data: MOCK_SPORTMONKS_FIXTURE_RESPONSE }),
    };
    const adapter = new SportmonksAdapter(mockConfig, mockCache, mockHttpClient);
    const result = await adapter.fetchFixtureState('TEST-FIXTURE-123');
    expect(result?.status).toBe('LIVE');
    expect(result?.homeScore).toBe(2);
  });
});
```

Mock responses are defined in `apps/api/src/football/providers/__mocks__/` (to be created in Sprint 4 implementation).

The existing `ManualLiveMatchProviderAdapter` (in `live-match-provider.interface.ts`) already serves as the null implementation for tests that don't need provider data.

---

## Next Steps for Sprint 4 Implementation

1. Create `apps/api/src/football/providers/football-data-provider.module.ts`
2. Create `apps/api/src/football/providers/football-data-provider-cache.service.ts`
3. Create `apps/api/src/football/providers/sportmonks.adapter.ts` implementing `LiveMatchProviderAdapter`
4. Update `LiveMatchService` to inject `FOOTBALL_DATA_PROVIDER_TOKEN`
5. Extend `apps/api/src/env.ts` with `FOOTBALL_DATA_PROVIDER` and `FOOTBALL_API_KEY` variables
6. Add `FOOTBALL_API_KEY` to AWS Secrets Manager (owner action — requires licensed key)
7. Add Sprint 4 adapter unit tests to the existing test suite

**Gate:** Implementation may proceed. Fan-facing activation requires licensing gate sign-off first (see `docs/data/SPRINT-4-PROVIDER-LICENSING-GATE.md`).
