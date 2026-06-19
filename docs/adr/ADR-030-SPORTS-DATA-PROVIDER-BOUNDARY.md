# ADR-030: Sports Data Provider Boundary

**Status:** DRAFT
**Date:** 2026-06-19
**Author:** Engineering Lead
**Deciders:** Engineering Lead, Product Owner
**Story:** STORY-FE-PREMIUM-01A

---

## Context

PSL One requires live and historical football data for the Premier Soccer League (DStv Premiership). This data includes fixtures, standings, teams, players, squads, lineups, match events, and statistics.

The platform must integrate with a third-party sports data provider while:
- Keeping provider credentials off the browser
- Maintaining provider switchability
- Validating data before publishing to fans
- Preserving an audit trail of all imported data
- Respecting rate limits and caching requirements
- Complying with provider licensing terms

The existing codebase already has import infrastructure (`FixtureImportBatch`, `FixtureImportRow`, `SquadImportModule`, `FantasyCalibrationModule`) that provides a pattern for controlled imports with admin review.

---

## Decision

We will implement a **provider-neutral domain contract** (`FootballDataProvider` interface) with:

1. A NestJS adapter per provider that implements the interface
2. External IDs stored with source namespace (e.g., `externalId: '288', externalSource: 'api-football'`)
3. A data lifecycle: `DRAFT → VALIDATED → IMPORTED → PUBLISHED`
4. Admin review before any data becomes fan-visible
5. No automatic PSL season activation
6. All provider credentials server-side only, never in browser code

---

## Provider Interface Contract

```typescript
export interface FootballDataProvider {
  // Competition discovery
  listCompetitions(country?: string): Promise<Competition[]>;
  listSeasons(competitionId: string): Promise<Season[]>;

  // Club and squad data
  getTeams(competitionId: string, season: number): Promise<Team[]>;
  getPlayers(competitionId: string, season: number, page?: number): Promise<Player[]>;
  getSquads(teamId: string): Promise<Squad[]>;

  // Match data
  getFixtures(competitionId: string, season: number): Promise<Fixture[]>;
  getFixture(externalFixtureId: string): Promise<FixtureDetail>;
  getStandings(competitionId: string, season: number): Promise<Standing[]>;
  getLineups(externalFixtureId: string): Promise<Lineup[]>;
  getMatchEvents(externalFixtureId: string): Promise<MatchEvent[]>;

  // Statistics
  getPlayerStatistics(competitionId: string, season: number, teamId?: string): Promise<PlayerStats[]>;
}
```

All methods return domain types, never raw provider responses. Raw responses are stored separately for audit.

---

## External ID Strategy

All entities imported from a provider will carry:

```typescript
{
  externalId: string;      // Provider's identifier for this entity
  externalSource: string;  // Provider name slug: 'api-football', 'sportmonks', 'opta', etc.
}
```

This allows:
- Idempotent imports (find-or-create by externalId + externalSource)
- Provider switching without losing historical data
- Duplicate detection across imports

Existing models (`Player.externalId`) already follow this pattern (ADR-? — see STORY-29).

---

## Data Lifecycle

```
DRAFT       — raw data received from provider, not validated
VALIDATED   — passed schema validation and business rules
IMPORTED    — committed to domain models (not yet fan-visible)
PUBLISHED   — fan-visible; admin has approved
```

Admin UI must allow review and publish/reject at the IMPORTED stage.

This matches the existing `FixtureImportBatch` / `FixtureImportRow` pattern.

---

## Rate Limiting and Caching

```typescript
// Cache TTLs by data type
const CACHE_TTL = {
  live:        30,    // seconds — polling interval for live fixtures
  fixtures:    300,   // 5 minutes — upcoming fixtures
  standings:   3600,  // 1 hour — standings change rarely
  squads:      86400, // 24 hours — squads change weekly at most
  historical:  0,     // Never expire — completed seasons are immutable
};
```

A `ProviderRateLimiter` must:
- Track requests per minute and per day against plan limits
- Queue requests when near the limit
- Return cached data when available

---

## Retry and Circuit Breaker

- Retries: 3 attempts with exponential backoff (1s, 4s, 16s)
- Circuit breaker: open after 5 consecutive failures, half-open after 60s
- Timeout: 10 seconds per request

---

## Observability

Metrics to emit via OpenTelemetry:
- `provider.request.count` (by provider, endpoint, status)
- `provider.request.duration_ms` (by provider, endpoint)
- `provider.rate_limit.remaining` (by provider)
- `provider.cache.hit_rate` (by cache level)
- `provider.circuit_breaker.state` (by provider)

---

## Provider Switchability

The active provider is configured via environment variable:

```bash
FOOTBALL_DATA_PROVIDER=api-football  # or: sportmonks, opta, sportradar
```

The NestJS module selects the correct adapter at startup. No code changes required to switch providers.

---

## Mapping Errors and Validation

All provider responses must pass a validation stage before import:
- Schema validation (required fields present)
- Business rule validation (e.g., fixture date in reasonable range)
- Duplicate detection (same externalId + externalSource already imported)
- Missing entity detection (team referenced in fixture but not in teams list)

Validation failures are written to an audit log. Admin must acknowledge before re-import.

---

## Data Licensing Metadata

Each import record will carry:
```typescript
{
  providerName: string;
  providerPlanId: string;   // e.g., 'api-football-pro'
  importedAt: Date;
  licenseVerifiedAt: Date | null;  // null until legal review complete
  licenseNote: string | null;
}
```

No data with `licenseVerifiedAt: null` can be published to fans.

---

## No Automatic PSL Activation

The `SeasonSwitchAudit` model (ADR from STORY-28) requires 13 pre-activation checks. Provider data integration does not bypass these checks. PSL season activation remains a manual admin action.

---

## Consequences

**Positive:**
- Provider can be switched without application code changes
- All data has an audit trail
- No provider credentials ever reach the browser
- Data quality problems are caught before they affect fans
- License compliance is trackable

**Negative:**
- More complexity than a direct API call from the frontend
- Latency for live data is higher than direct browser polling
- Requires NestJS rate-limit and cache infrastructure

**Neutral:**
- Adds ~2-3 weeks of implementation time vs. direct API calls
- This complexity was already partly built in the import pipeline stories

---

## Implementation Notes

- Prefer extending existing `FixtureImportBatch` / `FixtureImportRow` models over creating new ones
- If new Prisma models are required, they must go through the normal schema approval process (not added in this ADR)
- The `tools/data-provider-spike/api-football-discovery.mjs` script is the read-only proof-of-concept; it does not use this adapter pattern
- The first production adapter will target API-Football while commercial terms are being arranged with Stats Perform

---

## Related

- ADR-027: Import pipeline design
- ADR-028: ECS Fargate deployment
- ADR-029: EC2+Compose beta profile
- STORY-27: Fixture Import, Validation & Publishing
- STORY-36: Squad Import & Price Calibration
- `docs/data/PSL-DATA-PROVIDER-EVALUATION.md`
- `docs/data/PSL-DATA-MAPPING.md`
- `docs/data/PSL-DATA-LICENSING-GATE.md`
