# Sprint 23 — RBAC Fix

## Summary

Changed `@Roles('ADMIN')` to `@Roles('PSL_ADMIN')` in 3 controller files (5 decorators total).

`'ADMIN'` is not a value in the `UserRole` enum. `'PSL_ADMIN'` is the correct platform admin role.

---

## Files Changed

### `apps/api/src/fixture-import/fixture-publication.controller.ts`

```diff
- @Roles('ADMIN')
+ @Roles('PSL_ADMIN')
export class FixturePublicationController {
```

```diff
- @Roles('ADMIN')
+ @Roles('PSL_ADMIN')
export class PslPreflightController {
```

### `apps/api/src/data-provider/data-provider.controller.ts`

```diff
- @Roles('ADMIN')
+ @Roles('PSL_ADMIN')
export class DataProviderController {
```

### `apps/api/src/prediction-challenges/prediction-challenges.controller.ts`

```diff
- @Roles('ADMIN')   // settle-fixture route
+ @Roles('PSL_ADMIN')
```

```diff
- @Roles('ADMIN')   // :token/settle route
+ @Roles('PSL_ADMIN')
```

---

## Tests Added

Three new HTTP-level integration spec files:

| File | Tests | Coverage |
|------|-------|---------|
| `fixture-import/fixture-publication-admin-http.spec.ts` | 14 | GET /admin/fixtures/imported, POST /admin/fixtures/publish, GET /admin/psl/preflight — 401/403/PSL_ADMIN passes |
| `data-provider/data-provider-admin-http.spec.ts` | 13 | GET /admin/data-provider/health, GET /admin/data-provider/discovery/seasons, POST ingest — 401/403/PSL_ADMIN passes + write-mode validation |
| `prediction-challenges/prediction-challenges-admin-http.spec.ts` | 9 | POST settle-fixture, POST :token/settle — 401/403/PSL_ADMIN passes; fan routes remain fan-accessible |

**Total new tests: 36** (1,932 → 1,968 API tests)

---

## Safety Properties

| Property | Status |
|----------|--------|
| RolesGuard not bypassed | Confirmed |
| JwtAuthGuard not removed | Confirmed |
| Admin endpoints not made public | Confirmed |
| DB user `isActive` check unchanged | Confirmed |
| Unauthenticated → 401 | Verified by new tests |
| FAN role → 403 | Verified by new tests |
| PSL_ADMIN → passes guards | Verified by new tests |
| No new role added | Confirmed — only string corrected |
| No wildcard admin access | Confirmed |
| No PSL activation | Confirmed |
| No scheduled ingestion | Confirmed |
| No real-money functionality | Confirmed |

---

## Affected Endpoints (now PSL_ADMIN accessible)

| Endpoint | Purpose |
|----------|---------|
| `GET /admin/fixtures/imported` | List imported fixtures by providerSource/season |
| `POST /admin/fixtures/publish` | Publish fixtures (separate from PSL activation) |
| `GET /admin/psl/preflight` | Read-only PSL activation readiness check |
| `GET /admin/data-provider/health` | Data provider adapter health check |
| `GET /admin/data-provider/discovery/seasons` | Provider season discovery |
| `GET /admin/data-provider/discovery/fixtures/:seasonId` | Provider fixture discovery |
| `GET /admin/data-provider/discovery/teams/:seasonId` | Provider team discovery |
| `GET /admin/data-provider/discovery/standings/:seasonId` | Provider standings discovery |
| `POST /admin/data-provider/parse-psl/fixtures/ingest` | Manual Parse PSL ingestion (dry-run default) |
| `POST /predictions/challenges/settle-fixture/:fixtureId` | Admin challenge settlement trigger |
| `POST /predictions/challenges/:token/settle` | Individual challenge settlement |
