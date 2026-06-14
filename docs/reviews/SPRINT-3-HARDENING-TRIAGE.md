# Sprint 3 Infrastructure Story 0 — Security & Performance Hardening Triage

**Purpose:** Classify, reproduce, and record disposition for every finding from the technical review board, security review, and performance review agents  
**Audience:** Engineering, release management, QA  
**Status:** Implemented and awaiting acceptance  
**Last verified:** 2026-06-14  
**Source of truth:** `apps/api/src/`, `docs/reviews/SPRINT-3-SECURITY-PERFORMANCE-RISK-REGISTER.md`  
**Story identifier:** S3-INFRA-00  
**Baseline commit:** 0a251fdaf0dc08b5ce25c1bdeaf2c3facd63c4c4  
**Branch:** main

---

## Finding Registry

### F-01: Password Reset Token Logged in Console

| Field | Value |
|-------|-------|
| **ID** | F-01 |
| **Source** | Security Review |
| **Claim** | Raw password-reset token logged via `console.log` in `AuthService.requestPasswordReset` |
| **File/path** | `apps/api/src/auth/auth.service.ts:199` |
| **Severity claimed** | Critical |
| **Reproduced?** | YES — `console.log(\`[DEV] Password reset token for ${email}: ${rawToken}\`)` confirmed present |
| **Actual severity** | HIGH (Critical in staging/production; local dev tolerable but not safe in shared CI logs) |
| **Classification** | CONFIRMED |
| **Evidence** | Line 199 of auth.service.ts at baseline |
| **Decision** | FIXED |
| **Fix required?** | YES |
| **Test required?** | YES |
| **Owner** | Security |
| **Status** | FIXED — `PasswordResetNotifier` abstraction introduced; `ConsolePasswordResetNotifier` for dev only; `NullPasswordResetNotifier` for staging/production |

---

### F-02: CORS Origin Hardcoded to localhost

| Field | Value |
|-------|-------|
| **ID** | F-02 |
| **Source** | Security Review |
| **Claim** | `app.enableCors({ origin: ['http://localhost:3001'], credentials: true })` is hardcoded |
| **File/path** | `apps/api/src/main.ts:11` |
| **Severity claimed** | High |
| **Reproduced?** | YES — confirmed in main.ts at baseline |
| **Actual severity** | HIGH — staging/production would allow only localhost origins, effectively blocking the web app |
| **Classification** | CONFIRMED |
| **Evidence** | Hardcoded origin; no environment variable path |
| **Decision** | FIXED |
| **Fix required?** | YES |
| **Test required?** | YES |
| **Owner** | Platform |
| **Status** | FIXED — `parseCorsOrigins()` reads `CORS_ORIGINS` env var; fails fast in staging/production if not set; rejects wildcard |

---

### F-03: Prediction Admin Routes May Bypass JWT

| Field | Value |
|-------|-------|
| **ID** | F-03 |
| **Source** | Technical Review Board / Security Review |
| **Claim** | `settle-fixture`, `lock-fixture`, `void-fixture`, `lock-gameweek`, `force-lock-gameweek`, `settle-gameweek` may bypass JWT |
| **File/path** | `apps/api/src/predictions/predictions.controller.ts` |
| **Severity claimed** | Critical |
| **Reproduced?** | NO |
| **Actual severity** | NOT A VULNERABILITY |
| **Classification** | FALSE_POSITIVE |
| **Evidence** | Controller class has `@UseGuards(JwtAuthGuard)`. NestJS merges controller-level and method-level guards — it does NOT override. Admin methods add `@UseGuards(RolesGuard)` at method level; both guards execute. Unauthenticated → 401. FAN role → 403. `LocalJwtProvider.verifyToken` throws on invalid token; `JwtAuthGuard` catches and re-throws `UnauthorizedException`. |
| **Decision** | FALSE_POSITIVE — no fix required |
| **Fix required?** | NO |
| **Test required?** | YES (regression coverage) |
| **Owner** | Platform |
| **Status** | CLOSED — regression tests added in `predictions-admin-guards.spec.ts` |

---

### F-04: No Authentication Rate Limiting on Auth Endpoints

| Field | Value |
|-------|-------|
| **ID** | F-04 |
| **Source** | Security Review |
| **Claim** | Login, register, password-reset have no rate limiting |
| **File/path** | `apps/api/src/auth/auth.controller.ts` |
| **Severity claimed** | High |
| **Reproduced?** | YES — no ThrottlerModule or guard at baseline |
| **Actual severity** | HIGH for single-instance; MEDIUM for multi-replica until distributed state available |
| **Classification** | CONFIRMED |
| **Evidence** | No throttling on POST /auth/login, /auth/register, /auth/password-reset/* |
| **Decision** | MITIGATED |
| **Fix required?** | YES |
| **Test required?** | YES |
| **Owner** | Platform |
| **Status** | FIXED — `AuthThrottleGuard` added; 20 req/15min per IP, in-process. Multi-replica requires INFRASTRUCTURE_REQUIRED (Redis). Documented in guard class. |

---

### F-05: Squad Import Uses Wrong JWT Field (req.user?.userId vs sub)

| Field | Value |
|-------|-------|
| **ID** | F-05 |
| **Source** | Security Review / Code Inspection |
| **Claim** | `squad-import.controller.ts` reads `req.user?.userId` but `TokenPayload.sub` is the authoritative field |
| **File/path** | `apps/api/src/squad-import/squad-import.controller.ts:51-88` |
| **Severity claimed** | High |
| **Reproduced?** | YES — `req.user?.userId` at baseline; `TokenPayload` only has `sub`, `email`, `role` |
| **Actual severity** | HIGH — `userId` would always be `undefined`; audit logging for batch operations broken |
| **Classification** | CONFIRMED |
| **Evidence** | `interface TokenPayload { sub: string; email: string; role: string }` — no `userId` field |
| **Decision** | FIXED |
| **Fix required?** | YES |
| **Test required?** | YES (existing controller tests cover the mutation path) |
| **Owner** | Platform |
| **Status** | FIXED — switched to `@CurrentUser() user: TokenPayload` + `user.sub` throughout |

---

### F-06: Version Endpoint Exposes Sensitive Data

| Field | Value |
|-------|-------|
| **ID** | F-06 |
| **Source** | Security Review |
| **Claim** | `/version` might expose secrets or internal hostnames |
| **File/path** | `apps/api/src/version/version.controller.ts` |
| **Severity claimed** | Medium |
| **Reproduced?** | NO |
| **Actual severity** | LOW — only exports `{ version: '0.1.0', environment: 'development' }` |
| **Classification** | FALSE_POSITIVE |
| **Evidence** | No secrets, no DB URL, no hostnames, no provider credentials. `environment` is `NODE_ENV` value ('development'/'production'/'staging') — acceptable operational metadata. |
| **Decision** | FALSE_POSITIVE — no fix required |
| **Fix required?** | NO |
| **Test required?** | NO |
| **Owner** | Platform |
| **Status** | CLOSED |

---

### F-07: Tracked .env File Contains Secrets

| Field | Value |
|-------|-------|
| **ID** | F-07 |
| **Source** | Security Review |
| **Claim** | Real `.env` files may be tracked in git |
| **File/path** | `apps/api/.env` |
| **Severity claimed** | Critical |
| **Reproduced?** | NO |
| **Actual severity** | NOT AN ISSUE |
| **Classification** | FALSE_POSITIVE |
| **Evidence** | `git ls-files \| grep -E '.env'` returns only `.env.example`. `apps/api/.env` exists locally but is NOT tracked. `.gitignore` includes `.env`, `.env.local`, `.env.*.local`. `git grep` for AWS_ACCESS_KEY_ID, JWT_SECRET returns zero results in tracked files. |
| **Decision** | FALSE_POSITIVE — no fix required |
| **Fix required?** | NO |
| **Test required?** | NO |
| **Owner** | DevOps |
| **Status** | CLOSED — `.gitignore` is correct; AWS_ACCOUNT_ID in local dev .env is a dev placeholder, not a production credential |

---

### F-08: Unbounded Pagination Parameters

| Field | Value |
|-------|-------|
| **ID** | F-08 |
| **Source** | Performance Review |
| **Claim** | `parseInt(limit, 10)` throughout controllers has no maximum cap |
| **File/path** | `apps/api/src/leaderboards/leaderboards.controller.ts`, `activity-feed`, `fan-value`, `match-centre`, `notifications`, `media`, `rewards` |
| **Severity claimed** | Medium |
| **Reproduced?** | YES — `parseInt(limit, 10)` with no cap confirmed in multiple controllers |
| **Actual severity** | MEDIUM — user can request enormous page sizes causing slow queries |
| **Classification** | CONFIRMED |
| **Evidence** | e.g. `leaderboards.controller.ts:22: limit ? parseInt(limit, 10) : 50` — no max |
| **Decision** | FIXED |
| **Fix required?** | YES |
| **Test required?** | YES |
| **Owner** | Platform |
| **Status** | FIXED — `parseBoundedLimit(value, default, max)` helper in `common/pagination.ts`; leaderboard controller updated; max 200 for leaderboards. Other high-risk controllers use helper where applicable. |

---

### F-09: Campaign Analytics Unsafe Date Parsing

| Field | Value |
|-------|-------|
| **ID** | F-09 |
| **Source** | Security Review |
| **Claim** | `new Date(body.snapshotDate)` without validation in campaign analytics controller |
| **File/path** | `apps/api/src/campaign-analytics/campaign-analytics.controller.ts:38` |
| **Severity claimed** | Medium |
| **Reproduced?** | YES — `new Date(body.snapshotDate)` at baseline, `body` typed as `{ snapshotDate?: string }` with no validation |
| **Actual severity** | MEDIUM — malformed dates produce `Invalid Date` and may cause unexpected behaviour in downstream service |
| **Classification** | CONFIRMED |
| **Evidence** | No DTO with `@IsISO8601()` at baseline |
| **Decision** | FIXED |
| **Fix required?** | YES |
| **Test required?** | YES (global ValidationPipe covers this) |
| **Owner** | Platform |
| **Status** | FIXED — `RecalculateSnapshotDto` with `@IsISO8601()` added |

---

### F-10: Leaderboard Season-Scoped Aggregation Loads Full Ledger

| Field | Value |
|-------|-------|
| **ID** | F-10 |
| **Source** | Performance Review |
| **Claim** | `getPredictionsLeaderboard` loads all ledger rows for a season into Node memory and aggregates in JS |
| **File/path** | `apps/api/src/leaderboards/leaderboards.service.ts:160-171` |
| **Severity claimed** | High |
| **Reproduced?** | YES — `findMany` + in-memory `Map` aggregation at baseline |
| **Actual severity** | HIGH at scale — at 2M fans with millions of prediction records this would OOM the process |
| **Classification** | CONFIRMED |
| **Evidence** | `const entries = await this.prisma.predictionPointsLedger.findMany({...})` then `const aggregated = new Map<string, number>()` with JS loop |
| **Decision** | FIXED |
| **Fix required?** | YES |
| **Test required?** | YES |
| **Owner** | Platform |
| **Status** | FIXED — replaced with `$queryRaw` parameterised SQL `GROUP BY fan_user_id SUM(points)` with `ORDER BY` and `LIMIT`; database does the aggregation |

---

### F-11: Notification Broadcast Loads All Users into Memory

| Field | Value |
|-------|-------|
| **ID** | F-11 |
| **Source** | Performance Review |
| **Claim** | `createAdminBroadcast` and `createLiveMatchAlert` load all active users into Node.js memory |
| **File/path** | `apps/api/src/notifications/notifications.service.ts:175-225` |
| **Severity claimed** | High |
| **Reproduced?** | YES — `user.findMany({ where: { isActive: true } })` with no limit at baseline |
| **Actual severity** | HIGH — at 2M users this would exhaust heap and crash the process |
| **Classification** | CONFIRMED |
| **Evidence** | `const users = await this.prisma.user.findMany({ select: { id: true }, where: { isActive: true } })` — no `take` |
| **Decision** | FIXED |
| **Fix required?** | YES |
| **Test required?** | YES |
| **Owner** | Platform |
| **Status** | FIXED — cursor-based pagination with configurable `batchSize` (default 500); loop processes batches until exhausted |

---

### F-12: Social Prediction Settlement N+1 Queries

| Field | Value |
|-------|-------|
| **ID** | F-12 |
| **Source** | Performance Review |
| **Claim** | Settlement loop runs per-listing, per-match queries inside nested loops |
| **File/path** | `apps/api/src/social-prediction/social-prediction.service.ts:953-1110` |
| **Severity claimed** | High |
| **Reproduced?** | PARTIALLY — nested `findMany` loops confirmed; however, queries are bounded by fixture scope |
| **Actual severity** | MEDIUM — bounded by fixture (10-30 listings, 30-100 matches); not an unbounded full-table scan. Idempotent with `skipDuplicates`. Atomic per match via `$transaction`. |
| **Classification** | PARTIALLY_CONFIRMED |
| **Evidence** | Per-listing: `challengeListing.findMany` scoped to `fixtureMarketId`. Per-match: `challengeMatch.findMany` scoped to `supportingListingId`. Per-direct-accept: `socialPredictionPointsEntry.findFirst`. All queries carry FK-indexed filters. |
| **Decision** | DEFERRED — acceptable at current game scale; worth preloading if > 500 concurrent matches per fixture |
| **Fix required?** | NO (at current scale) |
| **Test required?** | NO new tests required (existing settlement tests cover correctness) |
| **Owner** | Platform |
| **Status** | DEFERRED_WITH_ACCEPTED_RISK — revisit if fixture concurrency exceeds 20 simultaneous markets |

---

### F-13: Social Prediction Bulk Allocation Serial Upserts

| Field | Value |
|-------|-------|
| **ID** | F-13 |
| **Source** | Performance Review |
| **Claim** | `adminGrantAllocation` runs serial per-user upserts for all active fans |
| **File/path** | `apps/api/src/social-prediction/social-prediction.service.ts:232-261` |
| **Severity claimed** | Medium |
| **Reproduced?** | YES — `for...of` loop with `prisma.gameweekPointsAllocation.upsert()` per fan |
| **Actual severity** | MEDIUM — at 2M fans this would be extremely slow; however, this is an admin-triggered operation, not user-facing |
| **Classification** | CONFIRMED |
| **Evidence** | Lines 252-258: `for (const entry of data) { await this.prisma.gameweekPointsAllocation.upsert(...) }` |
| **Decision** | DEFERRED — admin-only operation; not user-facing; can be run off-hours; upsert semantics require conflict handling that `createMany` doesn't provide cleanly |
| **Fix required?** | NO (batch in chunks of 500 is the right fix but is infrastructure work) |
| **Test required?** | NO |
| **Owner** | Platform |
| **Status** | DEFERRED_WITH_ACCEPTED_RISK — classification: LOAD_TEST_REQUIRED before first live gameweek |

---

### F-14: Reward evaluateAllFans Serial Per-User Evaluation

| Field | Value |
|-------|-------|
| **ID** | F-14 |
| **Source** | Performance Review |
| **Claim** | `evaluateAllFans` runs serial evaluation for every active user |
| **File/path** | `apps/api/src/rewards/rewards-readiness.service.ts:150-161` |
| **Severity claimed** | Medium |
| **Reproduced?** | YES — `for...of` loop over all active users with async per-user call |
| **Actual severity** | MEDIUM — admin-only, not user-facing, not on the request path |
| **Classification** | CONFIRMED |
| **Evidence** | Lines 150-161: `const users = await this.prisma.user.findMany(...)` then `for (const { id: userId } of users)` |
| **Decision** | DEFERRED — candidate-user selection and batching is the right fix but is an infrastructure story |
| **Fix required?** | NO |
| **Test required?** | NO |
| **Owner** | Platform |
| **Status** | DEFERRED_WITH_ACCEPTED_RISK — revisit in Sprint 3 infrastructure story |

---

### F-15: Missing Database Indexes

| Field | Value |
|-------|-------|
| **ID** | F-15 |
| **Source** | Performance Review |
| **Claim** | Missing indexes on MatchEvent, FantasyPointsLedger, PredictionPointsLedger |
| **File/path** | `apps/api/prisma/schema.prisma` |
| **Severity claimed** | High |
| **Reproduced?** | YES — confirmed absent at baseline |
| **Actual severity** | HIGH for production (full table scans on event queries, ledger lookups) |
| **Classification** | CONFIRMED |
| **Evidence** | No `@@index` on `match_events`, no `@@index` on `fantasy_points_ledger`, no `@@index([fixtureId])` on `prediction_points_ledger` |
| **Decision** | FIXED |
| **Fix required?** | YES |
| **Test required?** | Migration verified |
| **Owner** | Platform |
| **Status** | FIXED — migration `20260615000001_security_performance_hardening` adds: `match_events(fixture_id, minute)`, `fantasy_points_ledger(fantasy_team_id, fixture_id)`, `fantasy_points_ledger(fantasy_team_id)`, `prediction_points_ledger(fixture_id)` |

---

### F-16: No Security Headers

| Field | Value |
|-------|-------|
| **ID** | F-16 |
| **Source** | Security Review |
| **Claim** | API responses lack standard security headers |
| **File/path** | `apps/api/src/main.ts` |
| **Severity claimed** | Medium |
| **Reproduced?** | YES — no helmet or header hooks at baseline |
| **Actual severity** | MEDIUM — increases attack surface for XSS (via content-type sniffing), clickjacking, referrer leakage |
| **Classification** | CONFIRMED |
| **Evidence** | main.ts at baseline: no security headers |
| **Decision** | FIXED |
| **Fix required?** | YES |
| **Test required?** | Response header checks (manual verification; unit test coverage in integration test) |
| **Owner** | Platform |
| **Status** | FIXED — Fastify `onSend` hook adds: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-XSS-Protection: 0`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, removes `x-powered-by`. HSTS deferred to HTTPS infrastructure. |

---

### F-17: No Kafka / Event Bus Wired

| Field | Value |
|-------|-------|
| **ID** | F-17 |
| **Source** | Technical Review Board |
| **Claim** | No Kafka wired; critical domain events lost |
| **File/path** | `packages/kafka-client/` (exists but not imported by API) |
| **Severity claimed** | High |
| **Reproduced?** | PARTIALLY — `kafka-client` package exists but is not wired into the API application |
| **Actual severity** | LOW at current stage — domain events use best-effort direct calls with `.catch(() => null)` guards; acceptable for pre-launch beta |
| **Classification** | ARCHITECTURE_DECISION_REQUIRED |
| **Evidence** | `grep -R "KafkaModule\|KafkaProducer" apps/api/src --include="*.ts"` returns zero results. `kafka-client` package is infrastructure scaffolding only. Beta feedback service explicitly documents this as a known gap (line 331). |
| **Decision** | DEFERRED — documented in ADR-027 candidate; direct calls retained for current stage |
| **Fix required?** | NO (this story) |
| **Test required?** | NO |
| **Owner** | Architecture |
| **Status** | ARCHITECTURE_DECISION_REQUIRED — See F-17 in risk register |

---

### F-18: Public Football and Leaderboard Routes

| Field | Value |
|-------|-------|
| **ID** | F-18 |
| **Source** | Security Review |
| **Claim** | Football fixtures and leaderboards accessible without authentication |
| **File/path** | `apps/api/src/football/`, `apps/api/src/leaderboards/` |
| **Severity claimed** | Medium |
| **Reproduced?** | YES — no auth guards on GET /football/*, GET /leaderboards/* |
| **Actual severity** | NOT A VULNERABILITY |
| **Classification** | INTENTIONAL_PRODUCT_BEHAVIOUR |
| **Evidence** | Public football data (fixtures, teams, standings) is fan-facing content. Leaderboard entries expose only `displayName` (chosen by user) and points total — no email, DOB, or internal IDs. Product intent: read-only public access. |
| **Decision** | INTENTIONAL — no fix |
| **Fix required?** | NO |
| **Test required?** | NO |
| **Owner** | Product |
| **Status** | CLOSED |

---

### F-19: Logout Does Not Revoke JWT

| Field | Value |
|-------|-------|
| **ID** | F-19 |
| **Source** | Security Review |
| **Claim** | JWT is stateless — logout does not invalidate the token |
| **File/path** | `apps/api/src/auth/providers/local-jwt.provider.ts:19` |
| **Severity claimed** | High |
| **Reproduced?** | YES — `LocalJwtProvider.logout` is a no-op |
| **Actual severity** | MEDIUM — JWT expiry is 1 hour; risk window is bounded |
| **Classification** | ARCHITECTURE_DECISION_REQUIRED |
| **Evidence** | Token lifetime: 1h (`signOptions: { expiresIn: '1h' }`). No refresh token. No session table. Logout only clears client-side token. Cognito adapter comment indicates `globalSignOut` would be called in production. |
| **Decision** | DEFERRED — residual 1h window documented; Cognito/session strategy is Sprint 3 infrastructure |
| **Fix required?** | NO (this story) |
| **Test required?** | NO |
| **Owner** | Architecture |
| **Status** | DEFERRED_WITH_ACCEPTED_RISK — residual window: max 60 minutes after logout before token expires naturally |

---

### F-20: No Redis / Distributed Cache

| Field | Value |
|-------|-------|
| **ID** | F-20 |
| **Source** | Performance Review |
| **Claim** | High-read endpoints have no caching |
| **File/path** | Various service files |
| **Severity claimed** | Medium |
| **Reproduced?** | YES — no cache layer at baseline |
| **Actual severity** | LOW — below threshold for beta; PostgreSQL with indexes handles current load |
| **Classification** | ARCHITECTURE_DECISION_REQUIRED |
| **Evidence** | See `docs/performance/CACHE-READINESS.md` for per-endpoint analysis |
| **Decision** | DEFERRED — measure before implementing |
| **Fix required?** | NO |
| **Test required?** | NO |
| **Owner** | Architecture |
| **Status** | ARCHITECTURE_DECISION_REQUIRED — INFRASTRUCTURE_REQUIRED for distributed cache |

---

### F-21: Sandbox Wallet Routes Production Guard

| Field | Value |
|-------|-------|
| **ID** | F-21 |
| **Source** | Security Review |
| **Claim** | Sandbox wallet operations may not be blocked in production |
| **File/path** | `apps/api/src/wallet-integration/wallet-integration.service.ts` |
| **Severity claimed** | High |
| **Reproduced?** | PARTIALLY CONFIRMED |
| **Actual severity** | LOW — `SiliconEnterpriseSandboxWalletAdapter` always checks `providerConfig.isSandbox`; no production adapter is registered; no real money moves; no wallet balance stored. Product constraint enforced. |
| **Classification** | PARTIALLY_CONFIRMED |
| **Evidence** | `wallet-integration.service.ts` reads `IntegrationProviderConfig.isSandbox` from DB before processing. Sandbox adapter name: `SiliconEnterpriseSandbox`. No production provider code exists. |
| **Decision** | MITIGATED — existing DB-level config check is the guard; no additional server-side guard required at this stage |
| **Fix required?** | NO |
| **Test required?** | YES (existing wallet tests cover sandbox config checks) |
| **Owner** | Platform |
| **Status** | MITIGATED — revisit before production provider onboarding |

---

## Summary

| Classification | Count |
|----------------|-------|
| CONFIRMED → FIXED | 10 (F-01, F-02, F-04, F-05, F-08, F-09, F-10, F-11, F-15, F-16) |
| FALSE_POSITIVE | 3 (F-03, F-06, F-07) |
| INTENTIONAL_PRODUCT_BEHAVIOUR | 1 (F-18) |
| ARCHITECTURE_DECISION_REQUIRED | 3 (F-17, F-19, F-20) |
| DEFERRED_WITH_ACCEPTED_RISK | 4 (F-12, F-13, F-14, F-19) |
| PARTIALLY_CONFIRMED → MITIGATED | 2 (F-12, F-21) |

**Staging deployment blockers resolved:** All confirmed critical/high findings fixed.  
**Remaining open items:** Architecture decisions (Kafka, session revocation, Redis) — not required for beta staging.
