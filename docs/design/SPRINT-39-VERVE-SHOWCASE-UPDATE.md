# Sprint 39 Verve / Showcase Update Plan

**Status:** Showcase pages not found in current codebase.
**Date:** 2026-06-25

---

## Search Results

The following showcase/design-lab/vision-studio directories were not found in the worktree:
- `apps/experience/src/app/design-lab/` — NOT PRESENT
- `apps/experience/src/app/vision-studio/` — NOT PRESENT

The PSL One experience app (`apps/experience`) does not currently contain a dedicated showcase or Verve design demo section.

---

## What IS Available (WC Beta Platform Features)

As of Sprint 39, the full WC beta platform includes:

### Fan Pages (All Operational)
- `/` — Homepage with WC hero, fixtures, feature hub, clubs, media, campaigns
- `/world-cup` — WC 2026 Hub
- `/world-cup/live` — Live scores (public API, no admin auth required)
- `/fixtures` — All 104 WC fixtures with SAST timezone display
- `/match-centre` — Live match centre
- `/news` — WC News Centre with editorial stories + video grid
- `/videos` — ScoreBat widget + placeholder
- `/guess-the-score` — 54 OPEN prediction markets
- `/fantasy` — Fantasy football
- `/leaderboards` — Fan leaderboards
- `/players` — Player stats
- `/trust` — Trust & Security Centre (NEW Sprint 39)

### Portal Pages
- `/admin` — 27 admin command centre routes
- `/club` — Club portal with 14 pages
- `/sponsor` — Sponsor portal with 13 pages

---

## Showcase Update Plan (Future Sprint)

When a design showcase/Verve page is created, it should highlight:

1. **WC Beta Data Layer** — 104 live fixtures, 1,200 player prices, 54 GTS markets
2. **Auth Hardening** — JWT security tests (12 checks), alg:none rejected
3. **Trust Centre** — /trust page with SOC2 readiness transparency
4. **Public API** — /football/fixtures and /football/world-cup/scorebat-widget (no auth required)
5. **RBAC** — PSL_ADMIN / CLUB_OFFICIAL / SPONSOR role isolation
6. **Mobile UX** — Bottom nav, responsive layouts, SAST timezone display

---

## Action Required

Owner should decide whether to:
A) Create a new `/design-lab` or `/vision-studio` page in a future sprint
B) Use the existing homepage (/) as the primary showcase
C) Create a Storybook or standalone design review environment
