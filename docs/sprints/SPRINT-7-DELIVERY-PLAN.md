# Sprint 7 — Delivery Plan

**Sprint:** 7  
**Theme:** Sportmonks Trial Activation, Challenge Settlement & Staging Readiness  
**Status:** IN PROGRESS

---

## Sprint Goals

1. Activate Sportmonks trial adapter with real v3 API response mapping
2. Implement challenge settlement engine (points-only, no real money)
3. Confirm staging migration readiness for migration 42
4. Provider security boundary: API key never reaches frontend

---

## Story Matrix

| Story | Title | Status |
|-------|-------|--------|
| S7-01 | Sportmonks Trial Activation | COMPLETE |
| S7-02 | Challenge Settlement Engine | COMPLETE |
| S7-03 | Beta/Staging Migration Readiness | COMPLETE |
| S7-04 | Vercel Preview Refresh | DOCUMENTED |
| S7-05 | Live Data Route Upgrade Plan | DOCUMENTED |
| S7-06 | Release Gate | COMPLETE |

---

## Non-Negotiables

- `SPORTMONKS_API_KEY` MUST NEVER appear in frontend code, `NEXT_PUBLIC_*` env vars, or committed `.env` files
- Settlement is points-only — no wallet records, no real money
- Settlement MUST be idempotent
- Migration is additive only (no DROP, no NOT NULL without default)
- PSL season remains INACTIVE
- No `prisma.user.delete()` anywhere

---

## Migration List (Sprint 7)

| # | Name | Type |
|---|------|------|
| 42 | `20260621000003_challenge_settlement` | Additive (new columns + enum values) |

---

## New Endpoints (Sprint 7)

| Method | Path | Guard | Description |
|--------|------|-------|-------------|
| POST | `/predictions/challenges/:token/settle` | ADMIN | Settle a challenge after fixture finishes |
| GET | `/predictions/challenges/:token/result` | Public | Get settlement result |
| GET | `/admin/data-provider/discovery/standings/:seasonId` | ADMIN | Sportmonks standings discovery |

---

## Points System

| Result | Points |
|--------|--------|
| Exact score | 10 |
| Correct outcome (win/draw/loss) | 5 |
| Incorrect | 0 |

---

## File Ownership

See SPRINT-7-FILE-OWNERSHIP.md
