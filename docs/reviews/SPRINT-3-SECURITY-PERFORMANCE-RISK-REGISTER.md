# Sprint 3 Infrastructure Story 0 — Security & Performance Risk Register

**Purpose:** Record disposition, residual risk, and production-blocker status for every S3-INFRA-00 finding  
**Audience:** Engineering, release management, security review board  
**Status:** Implemented and awaiting acceptance  
**Last verified:** 2026-06-14  
**Source of truth:** `apps/api/src/`, `docs/reviews/SPRINT-3-HARDENING-TRIAGE.md`  
**Story identifier:** S3-INFRA-00 (Sprint 3 Infrastructure Story 0 — Security & Performance Hardening Gate)  
**Scope:** Pre-staging hardening before containerisation and cloud deployment

---

## Risk Register

| ID | Title | Source | Severity | Disposition | Fix Commit/File | Regression Test | Residual Risk | Production Blocker? | Owner | Revisit |
|----|-------|--------|----------|-------------|-----------------|-----------------|---------------|---------------------|-------|---------|
| F-01 | Password reset token logged in console | Security Review | HIGH | FIXED | `auth.service.ts`, `auth/providers/password-reset-notifier.ts`, `auth.module.ts` | `auth.service.spec.ts` tests 7-9 | None — notifier abstraction separates delivery from logging | NO | Security | — |
| F-02 | CORS hardcoded to localhost | Security Review | HIGH | FIXED | `main.ts`, `env.ts` | `env.spec.ts` (10 tests) | None — fails fast in staging if `CORS_ORIGINS` not set | NO | Platform | — |
| F-03 | Prediction admin route JWT bypass claim | Tech Review Board | HIGH | FALSE_POSITIVE | — | `predictions-admin-guards.spec.ts` | None | NO | Platform | — |
| F-04 | No auth endpoint rate limiting | Security Review | HIGH | MITIGATED | `auth/guards/auth-throttle.guard.ts`, `auth.controller.ts` | `auth-throttle.guard.spec.ts` (5 tests) | Multi-replica: INFRASTRUCTURE_REQUIRED (Redis sliding window needed for distributed enforcement) | NO (beta) | Platform | Sprint 3 infra |
| F-05 | Squad import uses undefined userId | Code Inspection | HIGH | FIXED | `squad-import/squad-import.controller.ts` | Existing controller tests cover mutation path | None | NO | Platform | — |
| F-06 | Version endpoint exposes secrets | Security Review | LOW | FALSE_POSITIVE | — | — | None | NO | Platform | — |
| F-07 | Tracked .env files | Security Review | CRITICAL (claimed) | FALSE_POSITIVE | — | — | None — `.gitignore` correct, no tracked secrets | NO | DevOps | — |
| F-08 | Unbounded pagination parameters | Performance Review | MEDIUM | FIXED | `common/pagination.ts`, `leaderboards/leaderboards.controller.ts` | `common/pagination.spec.ts` (11 tests) | Other controllers (activity-feed, fan-value, etc.) use defaults; to be hardened progressively | NO | Platform | Sprint 3 |
| F-09 | Unsafe date parsing in campaign analytics | Security Review | MEDIUM | FIXED | `campaign-analytics/dto/recalculate-snapshot.dto.ts`, `campaign-analytics.controller.ts` | Global `ValidationPipe` + DTO | None | NO | Platform | — |
| F-10 | Leaderboard in-memory aggregation | Performance Review | HIGH | FIXED | `leaderboards/leaderboards.service.ts` | `leaderboards.service.spec.ts` (updated 6 tests) | None — SQL GROUP BY with LIMIT prevents full materialization | NO | Platform | — |
| F-11 | Notification broadcast memory exhaustion | Performance Review | HIGH | FIXED | `notifications/notifications.service.ts` | `notifications.service.spec.ts` (3 batching tests) | None — cursor batching with configurable batchSize | NO | Platform | — |
| F-12 | Social prediction settlement N+1 | Performance Review | MEDIUM | DEFERRED | — | — | Bounded by fixture scope; acceptable at current scale; revisit > 500 concurrent markets | NO | Platform | Sprint 3 load test |
| F-13 | Bulk allocation serial upserts | Performance Review | MEDIUM | DEFERRED | — | — | Admin-only operation; can run off-hours; bounded by registered fan count | NO | Platform | Sprint 3 infra |
| F-14 | Reward evaluateAllFans serial | Performance Review | MEDIUM | DEFERRED | — | — | Admin-only; accepted risk for beta | NO | Platform | Sprint 3 infra |
| F-15 | Missing database indexes | Performance Review | HIGH | FIXED | `prisma/schema.prisma`, migration `20260615000001` | Migration applied and verified | None | NO | Platform | — |
| F-16 | No security headers | Security Review | MEDIUM | FIXED | `main.ts` | Fastify `onSend` hook (observable in integration) | HSTS requires HTTPS termination at CDN/load balancer — infrastructure story | NO | Platform | Sprint 3 infra |
| F-17 | No Kafka / durable event bus | Tech Review Board | HIGH (claimed) | ARCHITECTURE_DECISION_REQUIRED | — | — | Best-effort side effects with `.catch(() => null)` guards; acceptable for beta | NO (beta) | Architecture | Sprint 3 infra |
| F-18 | Public football routes without auth | Security Review | MEDIUM (claimed) | INTENTIONAL | — | — | None — public read-only football data is the intended product behaviour | NO | Product | — |
| F-19 | JWT logout does not revoke token | Security Review | HIGH | DEFERRED | — | — | Residual window: max 60 minutes (token TTL). Cognito adapter in Sprint 3 will add `globalSignOut`. | NO (beta) | Architecture | Sprint 3 infra |
| F-20 | No Redis / distributed cache | Performance Review | MEDIUM | ARCHITECTURE_DECISION_REQUIRED | `docs/performance/CACHE-READINESS.md` | — | DB with indexes handles beta load. Measure before Redis investment. | NO (beta) | Architecture | Sprint 3 infra |
| F-21 | Sandbox wallet in production | Security Review | HIGH (claimed) | MITIGATED | — | Existing wallet tests | DB-level `isSandbox` check is enforced; no real money; no production adapter registered | NO | Platform | Before provider onboarding |

---

## Production Blocker Summary

**Zero confirmed critical or high findings remain open for staging deployment.**

All staging blockers have been addressed:

| Blocker | Resolution |
|---------|-----------|
| Raw token in logs | PasswordResetNotifier abstraction |
| Hardcoded CORS | Environment-driven `parseCorsOrigins` |
| Auth route rate limiting | AuthThrottleGuard (in-process) |
| Wrong identity field in squad import | @CurrentUser() + user.sub |
| In-memory leaderboard aggregation | $queryRaw SQL GROUP BY |
| Notification broadcast OOM | Cursor-based batching |
| Missing indexes | Migration 20260615000001 |
| Security headers | Fastify onSend hook |

---

## Accepted Residual Risks for Beta Staging

| Risk | Justification |
|------|---------------|
| Auth rate limiting is single-instance only | Redis needed for multi-replica; beta is single instance |
| JWT not immediately revocable on logout | 60-minute TTL window; acceptable for beta |
| Social settlement N+1 pattern | Bounded by fixture scope; correctness and idempotency preserved |
| Bulk allocation serial upserts | Admin-only operation; not fan-facing |
| No durable event bus | Best-effort side effects acceptable for beta |
| No distributed cache | DB with indexes handles beta throughput |

---

## Security Scan Confirmation

```
git ls-files | grep -E '(^|/)\.env($|\.)' → only .env.example (safe)
git grep AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|BEGIN PRIVATE KEY|rawToken|resetToken → zero results in tracked files
```

---

## Product Safety Confirmation

| Invariant | Status |
|-----------|--------|
| World Cup history intact | ✓ No schema or data changes to WC season |
| PSL season inactive | ✓ No `activateSeason` called |
| STORY-40 untouched | ✓ All changes are hardening only |
| All games points-only | ✓ No financial value introduced |
| Fan Value non-financial | ✓ Disclaimer preserved in all responses |
| Wallet sandbox-only | ✓ `SiliconEnterpriseSandboxWalletAdapter` only |
| No real money | ✓ Confirmed |
| No production providers | ✓ No production adapter registered |
| No Kafka introduced | ✓ `kafka-client` package not wired into API |
| No AWS/Terraform execution | ✓ Confirmed |
