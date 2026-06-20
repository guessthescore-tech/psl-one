# Fantasy Known Gaps
**Last updated:** 2026-06-19 (STORY-FE-FANTASY-AGENTIC-01)

---

## Stub Pages (UI Shell Only)

These pages exist but show placeholder content. They require design + backend API before they can be made interactive.

| Route | Stub Content | Blocker |
|-------|-------------|---------|
| `/fantasy/points` | Shell with "Points" heading | Backend Gameweek scoring API contract |
| `/fantasy/fixtures` | Shell with "Fixtures" heading | May merge with `/matches` — needs UX decision |
| `/fantasy/stats` | Shell with "Stats" heading | Backend fantasy stats API contract |
| `/fantasy/rules` | Shell with "Rules" heading | Rules content from Product team |
| `/predict` | Shell with "Predictions" heading | Prediction game full UI story |

---

## Missing Backend Contracts

See `docs/FANTASY-MISSING-BACKEND-CONTRACTS.md` for full API contract gap list.

---

## Deferred Design

| Item | Severity | Notes |
|------|----------|-------|
| `ShareAction` bottom sheet focus trap | LOW | Needs `focus-trap-react` or native `inert` attribute |
| Horizontal scroll for FantasyTabs on desktop | LOW | Overflow-x scroll works; a styled scrollbar would polish it |
| `MatchweekNav` not wired to homepage | LOW | Available in `src/components/shell/MatchweekNav.tsx` |

---

## Data Placeholders

| Placeholder | Location | Resolution |
|-------------|----------|------------|
| Football-themed SVG data URIs | `src/lib/data.ts:expImg()` | Replace with licensed football photography before public launch (picsum.photos removed in STORY-FE-EXPERIENCE-CORRECTIONS-01) |
| WC 2026 mock data | `src/lib/data.ts` | Replace with real PSL provider data after licensing gate |
| `LIVE_BETA_DATA` returns mock | `src/lib/data.ts` (TODO comment) | Wire real API calls in provider integration story |
| `fantasyTeam.captain` is always `ExpPlayer` not null | `src/lib/data.ts` | No-captain state needed for new users |

---

## Accessibility Gaps (Not Blocking)

| Item | Severity | Notes |
|------|----------|-------|
| `ShareAction` bottom sheet: no focus trap | LOW | Screen reader can escape the sheet |
| Fixture tabs (dots): no keyboard activation of dots while scrolling | LOW | All fixtures reachable via the overall list |
| `FantasyTabs`: horizontal scroll not keyboard-scrollable | LOW | All tabs reachable via Tab key |

---

## Dead Links Fixed (not gaps)

10 internal dead hrefs were corrected during reconciliation. All internal links now point at existing routes:

| From | Fixed To | Where |
|------|---------|-------|
| `/fixtures` | `/matches` | `FixtureCarouselSection.tsx`, `AppHeader` NAV |
| `/clubs` | `/players` | `AppHeader` NAV |
| `/clubs/${id}` | `/players` | `ClubIdentitySection.tsx`, `MyClubSection.tsx` |
| `/fantasy/transfers` | `/fantasy/team/transfers` | `FantasyGameweekSection.tsx` |
| `/table` | `/stats/standings` | `LeagueTableSection.tsx` |
| `/video` | `/media` | `VideoRailSection.tsx` |
| `/news` | `/media` | `EditorialGridSection.tsx` |
| `/profile/fan-value` | `/account` | `FanValueSection.tsx` |
| `/login` | `/sign-in` | `AppHeader.tsx` desktop CTA |

---

## Non-Blocking Debt

| Item | Notes |
|------|-------|
| `ExpFanValue.breakdown` keys not aligned with `FanValueSection` category keys | `FanValueSection` uses hardcoded `predictions`, `fantasy`, `social`, `streaks`; align when backend contract arrives |
| `ExpPlayer.goalsThisTournament` / `assistsThisTournament` exposed on type | Used in player stats view; backend field name must match exactly |
