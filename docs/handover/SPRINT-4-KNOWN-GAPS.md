# Sprint 4 — Known Gaps

**Date:** 2026-06-20  
**Branch:** `feature/sprint-4-premium-activation`

---

## Gap 1: Vercel Preview Not Yet Live

**Type:** Credential blocker  
**Story:** STORY-S4-01  
**Status:** BLOCKED — requires owner action

The complete Vercel configuration is committed (`vercel.json`, `.env.example`, `SPRINT-4-DEPLOY-GUIDE.md`). The blocker is the `vercel link` step which requires the owner to authenticate with their Vercel account.

**Impact:** Stakeholder cannot access the preview at a URL until this is done.  
**Workaround:** Run `pnpm --filter @psl-one/experience dev` locally on port 3002.

---

## Gap 2: Real Team Crests / Logos Not Available

**Type:** Asset gap  
**Story:** STORY-S4-02  
**Status:** DEFERRED

All team crests use colored shield shapes with initials (TeamIdentity component). Real team logos require:
1. Licensing from the clubs or PSL
2. Asset delivery
3. CDN/image serving setup

**Impact:** Visual experience looks designed but not authentic for PSL clubs.  
**Mitigation:** Acceptable for design review; must be resolved before public launch.

---

## Gap 3: Player Images Are Placeholder

**Type:** Asset gap  
**Story:** STORY-S4-02  
**Status:** DEFERRED

Player profile images use picsum.photos placeholder images. Real player headshots require:
1. Photography or official club assets
2. Image rights
3. CDN hosting

**Impact:** Players/stats pages look generic.  
**Mitigation:** Acceptable for design review; must be resolved before public launch.

---

## Gap 4: Sports Data Provider Not Contracted

**Type:** Commercial gap  
**Story:** STORY-S4-06  
**Status:** BLOCKED — requires owner action

Provider recommendation is Sportmonks. Architecture is designed (NestJS adapter interface in `tools/data-provider-spike/`). The platform currently uses WC 2026 design review data.

**Impact:** Live fixture data, standings, and player stats cannot be served until a provider is licensed.  
**Next step:** Owner to review `SPRINT-4-PROVIDER-LICENSING-GATE.md` and begin commercial discussion with Sportmonks.

---

## Gap 5: Missing Backend Contracts (7)

**Type:** Backend gap  
**Story:** STORY-S4-04  
**Status:** Documented; implementation deferred to Sprint 5

The following frontend pages fall back to design review data because their backend APIs don't exist yet:
- `/account/security` — password change
- `/account/delete` — POPIA deletion request
- `/stats/awards` — awards endpoint
- `/stats/hall-of-fame` — hall of fame endpoint
- `/stats/compare` — player comparison
- `/fantasy/stats` — fantasy stats summary
- `/fantasy/fixture-difficulty` — FDR algorithm

See: `apps/experience/docs/SPRINT-4-MISSING-CONTRACTS.md`

---

## Gap 6: Challenge Backend Integration (Design Review Only)

**Type:** Feature gap  
**Story:** STORY-S4-05  
**Status:** Partially implemented

The challenge pages use a URL-based approach (query params) for design review. The backend `ChallengesController` exists (`POST /challenges`, `POST /challenges/:id/accept`). Wiring the frontend challenge pages to the backend requires authentication state management (currently challenges are unauthenticated in the frontend).

**Impact:** Challenges work in design review mode (URL share). Persistent challenges with backend persistence require LIVE_BETA_DATA mode + authenticated user.

---

## Gap 7: Analytics Not Yet Instrumentated

**Type:** Implementation gap  
**Story:** STORY-S4-08  
**Status:** Documented only

The analytics event catalogue is complete (`SPRINT-4-ANALYTICS-EVENT-CATALOGUE.md`) but no analytics adapter is implemented in the frontend code. Events are documented but not fired.

**Impact:** No tracking data from the preview.  
**Next step:** Sprint 5 — implement a consent-aware analytics adapter (PostHog or similar).

---

## Gap 8: Quiz and Badge Scan (Design Only)

**Type:** Feature gap  
**Status:** DEFERRED — requires physical/content infrastructure

- `/quiz/[quizId]` — quiz pages render but need a quiz engine backend
- `/scan` — badge scanner UI exists but requires physical NFC/QR event integration

These are intentionally deferred.

---

## Summary

| Gap | Blocker Type | Sprint 5 Priority |
|-----|-------------|-------------------|
| Vercel preview URL | Owner action needed | HIGH — do immediately |
| Team crests | Asset/licensing | HIGH for launch |
| Player images | Asset/licensing | HIGH for launch |
| Sports data provider | Commercial | HIGH — begin discussions |
| 7 missing backend contracts | Development | HIGH (password change, POPIA) / MEDIUM (awards, HOF) |
| Challenge backend wiring | Development | MEDIUM |
| Analytics implementation | Development | MEDIUM |
| Quiz engine | Infrastructure | LOW |
| Badge scan | Physical infrastructure | LOW |
