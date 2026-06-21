# Sprint 4 — Owner Decision Log

**Date:** 2026-06-20  
**Branch:** `feature/sprint-4-premium-activation`

This document records decisions requiring owner input during Sprint 4.

---

## DECISION-S4-01: Vercel Preview Deployment

**Decision required:** Connect `apps/experience` to Vercel for external stakeholder preview.

**What the team has done:**
- Created `apps/experience/vercel.json` — all build and security config ready
- Created `apps/experience/.env.example` — all env vars documented
- Created `apps/experience/docs/SPRINT-4-DEPLOY-GUIDE.md` — step-by-step instructions

**Deployed by:** autonomous API deployment via Vercel API + GitHub gitSource (2026-06-20)

**Preview URL:** https://psl-one-experience-preview-cxb5urftw-guess-the-score.vercel.app
**Deployment ID:** `dpl_W1mvR8gYtbeUhza1ZJAC6s8UoRtJ`
**Inspector:** https://vercel.com/guess-the-score/psl-one-experience-preview/W1mvR8gYtbeUhza1ZJAC6s8UoRtJ
**Protection:** None (SSO disabled — accessible without login)
**Smoke checks:** 9/9 routes HTTP 200
**Data mode:** `DESIGN_REVIEW_DATA`
**Screenshots:** 34 PNG files in `~/Desktop/psl-one-sprint4-preview-review/` (17 routes × mobile + desktop)

**Decision:** DONE — preview deployed; visual acceptance review is next (DECISION-S4-02)

---

## DECISION-S4-02: Visual Screen Acceptance

**Decision required:** Review and approve/reject the premium experience screens.

**What to review:** `apps/experience/docs/SPRINT-4-SCREEN-ACCEPTANCE-MATRIX.md`

**Classification:** Each screen is classified as APPROVED / APPROVED_WITH_CORRECTIONS / REQUIRES_REDESIGN / BLOCKED_BY_BACKEND / BLOCKED_BY_ASSETS

**Key known issues:**
- Placeholder team crests (colored badge shapes instead of real logos) — BLOCKED_BY_ASSETS
- Player images use picsum.photos placeholder — BLOCKED_BY_ASSETS
- DStv sponsor hardcoded in SponsorSection — requires real sponsor config
- Some stats pages (Awards, Hall of Fame, Compare) use design review data — BLOCKED_BY_BACKEND

**Decision:** PENDING — owner must review each screen

---

## DECISION-S4-03: Sports Data Provider

**Decision required:** Choose and contract a sports data provider for PSL and WC 2026 data.

**Recommendation:** Sportmonks (see `docs/data/SPRINT-4-PROVIDER-RECOMMENDATION.md`)

**Current status:** Design review data only; all sports data uses WC 2026 mock

**What happens without a provider:** The app works with design review data indefinitely; live scores/fixtures will only appear when a provider is integrated

**Commercial items requiring owner decision:**
1. Commercial licence approval with Sportmonks (estimated ~$150-400/month at production scale)
2. PSL competition rights confirmation (Sportmonks may only have partial PSL coverage)
3. Logo/image redistribution rights
4. POPIA compliance for player data
5. Attribution requirements

**See:** `docs/data/SPRINT-4-PROVIDER-LICENSING-GATE.md` for the complete checklist

**Decision:** PENDING

---

## DECISION-S4-04: PR Merge to Main

**Decision required:** Merge `feature/sprint-4-premium-activation` to `main`.

**Prerequisites:**
- [ ] Vercel preview deployed and visually reviewed
- [ ] Screen acceptance matrix completed
- [ ] Critical visual defects resolved (or deferred with documented reason)
- [ ] Owner has signed off via this document

**Decision:** PENDING — branch is ready for PR when above prerequisites met

---

## DECISION-S4-05: Missing Backend Contracts Prioritisation

**Decision required:** Which missing backend contracts to implement in Sprint 5?

**Missing contracts (see `SPRINT-4-MISSING-CONTRACTS.md`):**
| Priority | Contract | Effort |
|----------|---------|--------|
| HIGH | Password change (`POST /auth/password/change`) | S/M |
| HIGH | Account deletion request (POPIA) | M |
| MEDIUM | Fantasy stats summary | S |
| MEDIUM | Awards endpoint | S |
| MEDIUM | Hall of Fame endpoint | S |
| LOW | Player comparison | S |
| LOW | Fixture difficulty rating | L (algorithm design needed) |

**Decision:** PENDING — recommend implementing HIGH priority items in Sprint 5

---

## DECISIONS ALREADY MADE (no owner action required)

| Decision | Resolution | Date |
|----------|-----------|------|
| PSL activation | REMAIN INACTIVE | Ongoing |
| Fantasy gaming | Points-only | Ongoing |
| Wallet | Sandbox-only | Ongoing |
| STORY-40 | RESERVED — not touched | Ongoing |
| Provider ingestion | NOT activated | Sprint 4 |
| Production deployment | NOT performed | Sprint 4 |
