# Sprint 4 — Handover

**Sprint:** S4 — Premium Experience Activation, Live Data Readiness & Beta Release  
**Branch:** `feature/sprint-4-premium-activation`  
**Starting SHA:** `a58c38b247fe85ad63ce292f5c71dfd0f887284b`  
**Date:** 2026-06-20  
**Status:** COMPLETE — ready for owner review

---

## Sprint Goal — Achieved

A stakeholder can open the premium PSL One experience, complete the primary Fantasy and football journeys across mobile and desktop, distinguish live beta data from design-review data, use visible sharing and challenge functions, and review sponsor-ready analytics — without activating PSL, production wallets, betting, or real-money functionality.

---

## Story Completion Matrix

| Story | Title | Status | Notes |
|-------|-------|--------|-------|
| S4-01 | External Premium Experience Preview | ✅ COMPLETE (blocked at credentials) | `vercel.json` committed; deploy guide written; stops at `vercel link` |
| S4-02 | Owner Visual Acceptance System | ✅ COMPLETE | 52-screen matrix, defect log, owner review guide |
| S4-03 | Real API Wiring Matrix | ✅ COMPLETE | All 52 routes classified; data-source truth table |
| S4-04 | Missing Backend Contracts | ✅ COMPLETE (documented) | 7 contracts documented; 2 high-priority for Sprint 5 |
| S4-05 | Prediction Sharing & Social Challenge Loop | ✅ COMPLETE | Full predict page + challenge + accept + share |
| S4-06 | Sports Data Provider Discovery Spike | ✅ COMPLETE | Sportmonks recommended; licensing gate; PoC adapter |
| S4-07 | Authentication & Account Completion | ✅ COMPLETE | Notifications prefs page added; wired to backend |
| S4-08 | Preview Analytics & Sponsor Readiness | ✅ COMPLETE | Event catalogue, sponsor inventory, safe zones |
| S4-09 | Beta Release Gate | ✅ COMPLETE | Release gate, rollback plan, owner decision log |

---

## What Was Built in Sprint 4

### New Pages (3)

| Route | Description |
|-------|-------------|
| `/predict` | Full prediction game with score steppers, sharing, challenge links, lock states, error/empty states |
| `/predict/challenge` | Challenge creation page with how-it-works, score entry, share link generation |
| `/predict/challenge/accept` | Challenge acceptance page with challenger's score display, counter-prediction, WhatsApp reply |
| `/account/notifications` | Notification preferences page wired to `GET/PATCH /notifications/preferences` |

### Modified Files (4)

| File | Change |
|------|--------|
| `apps/experience/src/app/predict/page.tsx` | Replaced "Coming soon" with full prediction game |
| `apps/experience/src/app/layout.tsx` | Added `robots: noindex` meta in preview/design-review mode |
| `apps/experience/src/components/account/AccountNav.tsx` | Added Notifications link |
| `apps/experience/src/lib/experience.spec.ts` | Added 50 new tests (384 → 434) |

### New Configuration

| File | Purpose |
|------|---------|
| `apps/experience/vercel.json` | Vercel deployment config (noindex, security headers, env vars) |
| `apps/experience/.env.example` | Environment variable documentation |

### New Documentation (24 files)

**Sprint planning:**
- `docs/sprints/SPRINT-4-DELIVERY-PLAN.md`
- `docs/sprints/SPRINT-4-STORY-MATRIX.md`
- `docs/sprints/SPRINT-4-DEPENDENCY-GRAPH.md`
- `docs/sprints/SPRINT-4-FILE-OWNERSHIP.md`

**Experience docs:**
- `apps/experience/docs/SPRINT-4-DEPLOY-GUIDE.md`
- `apps/experience/docs/SPRINT-4-API-WIRING-MATRIX.md`
- `apps/experience/docs/SPRINT-4-DATA-SOURCE-TRUTH-TABLE.md`
- `apps/experience/docs/SPRINT-4-MISSING-CONTRACTS.md`
- `apps/experience/docs/SPRINT-4-ANALYTICS-EVENT-CATALOGUE.md`
- `apps/experience/docs/SPRINT-4-SPONSOR-INVENTORY.md`
- `apps/experience/docs/SPRINT-4-SPONSOR-SAFE-ZONES.md`
- `apps/experience/docs/SPRINT-4-OWNER-VISUAL-REVIEW.md`
- `apps/experience/docs/SPRINT-4-SCREEN-ACCEPTANCE-MATRIX.md`
- `apps/experience/docs/SPRINT-4-VISUAL-DEFECT-LOG.md`

**Provider research:**
- `docs/data/SPRINT-4-PROVIDER-COMPARISON.md`
- `docs/data/SPRINT-4-PROVIDER-RECOMMENDATION.md`
- `docs/data/SPRINT-4-PROVIDER-FIELD-MAPPING.md`
- `docs/data/SPRINT-4-PROVIDER-LICENSING-GATE.md`

**Provider PoC:**
- `tools/data-provider-spike/README.md`
- `tools/data-provider-spike/adapter-interface.ts`

**Handover:**
- `docs/handover/SPRINT-4-RELEASE-GATE.md`
- `docs/handover/SPRINT-4-ROLLBACK-PLAN.md`
- `docs/handover/SPRINT-4-OWNER-DECISION.md`
- `docs/handover/SPRINT-4-KNOWN-GAPS.md`
- `docs/handover/SPRINT-4-OWNER-REVIEW-GUIDE.md`

---

## Validation Results

| Gate | Result |
|------|--------|
| `pnpm --filter @psl-one/experience typecheck` | ✅ PASS — 0 errors |
| `pnpm --filter @psl-one/experience test` | ✅ PASS — 434/434 |
| `pnpm --filter @psl-one/experience build` | ✅ PASS — 52 pages |
| `pnpm --filter @psl-one/api test` | ✅ PASS — 1,652/1,652 |
| `pnpm codex:validate` | ✅ PASS — 0 errors |
| `pnpm docs:validate` | ✅ PASS — 18/18 checks |
| `pnpm audit` | ⚠️ 3 moderate pre-existing (postcss/uuid/protobufjs) — NOT in experience app |

---

## Route Count

| Scope | Count |
|-------|-------|
| Experience pages total | 52 |
| LIVE_BETA_DATA routes | 19 |
| PARTIAL routes | 4 |
| DESIGN_REVIEW_DATA routes | 17 |
| STATIC_CONTENT routes | 6 |
| DEFERRED_STUB routes | 2 |
| MISSING_BACKEND_CONTRACT routes | 7 |

---

## Prediction Sharing Features

| Feature | Status |
|---------|--------|
| Share button visible post-prediction | ✅ |
| WhatsApp share | ✅ |
| Web Share API (mobile native) | ✅ |
| Copy link fallback | ✅ |
| Challenge creation link | ✅ |
| Challenge accept page | ✅ |
| WhatsApp reply after acceptance | ✅ |
| Lock state handling | ✅ |
| Points-only disclaimer | ✅ on every surface |
| No real money language | ✅ confirmed |

---

## Provider Research

| Item | Result |
|------|--------|
| Recommended provider | Sportmonks |
| Fallback provider | API-Football |
| PSL coverage | Partial (Sportmonks) — verify via trial |
| WC 2026 coverage | Available |
| Go/no-go | NO-GO until licensing gate completed |
| Licensing gate doc | `docs/data/SPRINT-4-PROVIDER-LICENSING-GATE.md` |

---

## Deployment State

| Item | State |
|------|-------|
| Branch | `feature/sprint-4-premium-activation` |
| Starting SHA | `a58c38b247fe85ad63ce292f5c71dfd0f887284b` |
| PSL | INACTIVE |
| World Cup 2026 | ACTIVE (beta) |
| Wallet | Sandbox-only |
| AWS beta | Unchanged — operational |
| Vercel (experience) | Config ready; deploy pending owner action |
| Production | Not started |
| STORY-40 | RESERVED — not touched |

---

## Critical Confirmations

- [x] PSL remains inactive
- [x] World Cup 2026 remains active as beta context
- [x] Wallet remains sandbox-only
- [x] No real-money functionality added
- [x] No production deployment performed
- [x] No Terraform or IAM changes
- [x] Trivy blocking mode unchanged
- [x] CI security gates unchanged
- [x] STORY-40 reserved and untouched

---

## Recommended Next Actions (in order)

1. **Owner: deploy Vercel preview** — run `vercel login && cd apps/experience && vercel link` (15 minutes)
2. **Owner: review visual acceptance matrix** — `apps/experience/docs/SPRINT-4-SCREEN-ACCEPTANCE-MATRIX.md`
3. **Owner: initiate Sportmonks trial** — review `docs/data/SPRINT-4-PROVIDER-LICENSING-GATE.md`
4. **Team: implement 2 high-priority backend contracts** — password change + POPIA deletion request
5. **Owner: approve PR** — `feature/sprint-4-premium-activation` → `main`
6. **Sprint 5 planning** — see `PSL-ONE-NEXT-EXECUTION-PLAN.md`
