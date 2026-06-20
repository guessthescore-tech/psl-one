# PSL One — Fantasy Dependency Graph
**Story:** STORY-FE-FANTASY-AGENTIC-01
**Date:** 2026-06-19

```
Phase A (Orchestrator)
  └── Branch created: feature/fantasy-complete-experience
  └── Directory scaffolding: 48 directories
  └── Planning docs: 3 files
  │
  ├─────────────────────────────────────────────────┐
  │                                                 │
Phase B-Agent 2                               Phase B-Agent 8
(Design System)                              (Data Layer)
  └── Fantasy design tokens                    └── src/lib/api.ts
  └── FantasyShell + 12 primitives             └── src/lib/auth.ts
  └── Motion standards                         └── src/lib/fantasy-api.ts
  └── Skeleton components                      └── src/lib/football-api.ts
  └── tailwind.config.ts updates               └── src/lib/players-api.ts
  └── globals.css updates                      └── src/lib/media-api.ts
                │                                  └── src/lib/data.ts (extend)
                │                                  └── FANTASY-API-CONTRACTS.md
                └─────────────────┬───────────────┘
                                  │
                    (merge both branches into feature)
                                  │
          ┌───────────────────────┼──────────────────────┐────────────────┐
          │                       │                       │                │
Phase C-Agent 3             Phase C-Agent 4        Phase C-Agent 5   Phase C-Agent 6
(Fantasy Core)              (Leagues)              (Football)        (Account)
  /fantasy                    /fantasy/leagues        /matches          /sign-in
  /fantasy/onboarding         /fantasy/leagues/join   /players          /register
  /fantasy/team               /fantasy/leagues/create /stats            /account
  /fantasy/team/transfers     /fantasy/leagues/[id]   /media            /help
  /fantasy/team/chips         /fantasy/history        /stats/compare    /terms
  /fantasy/fixture-difficulty /fantasy/search         /stats/awards     /privacy
  /fantasy/help               components/fantasy/     /stats/hall-of-   /about
  components/fantasy/core/    leagues/                 fame             /scan
                                                     components/       /quiz
                                                     football/         components/
                                                                       account/
          │                       │                       │                │
          └───────────────────────┼───────────────────────┘────────────────┘
                                  │
                    (merge all four branches into feature)
                                  │
                           Phase D-Agent 7
                           (Navigation)
                             AppHeader update
                             MobileBottomNav update
                             FantasyNav component
                             Route manifest
                             Link integrity tests
                                  │
                  ┌───────────────┼───────────────┐
                  │                               │
           Phase E-Agent 9                 Phase E-Agent 10
           (Accessibility QA)              (Test Coverage)
             A11y review doc                 Extended spec
             Responsive review doc          Journey tests
                  │                               │
                  └───────────────┬───────────────┘
                                  │
                          Phase F (Orchestrator)
                            typecheck PASS
                            tests PASS
                            build PASS
                            codex:validate PASS
                            docs:validate PASS
                            Final integration
                            Owner-review package
```

---

## File Ownership Map

```
src/app/
  page.tsx                          — Orchestrator (existing, do not touch)
  layout.tsx                        — Agent 7 (update nav only)
  globals.css                       — Agent 2 (extend)
  fantasy/
    page.tsx                        — Agent 3
    onboarding/page.tsx             — Agent 3
    team/page.tsx                   — Agent 3
    team/transfers/page.tsx         — Agent 3
    team/chips/page.tsx             — Agent 3
    fixture-difficulty/page.tsx     — Agent 3
    help/page.tsx                   — Agent 3
    leagues/page.tsx                — Agent 4
    leagues/join/page.tsx           — Agent 4
    leagues/create/page.tsx         — Agent 4
    leagues/[leagueId]/page.tsx     — Agent 4
    leagues/[leagueId]/teams/[teamId]/page.tsx — Agent 4
    history/page.tsx                — Agent 4
    history/[gameweekId]/page.tsx   — Agent 4
    search/page.tsx                 — Agent 4
  matches/
    page.tsx                        — Agent 5
    [fixtureId]/page.tsx            — Agent 5
    [fixtureId]/motm/page.tsx       — Agent 5
  players/
    page.tsx                        — Agent 5
    [playerId]/page.tsx             — Agent 5
    [playerId]/stats/page.tsx       — Agent 5
  stats/
    season/page.tsx                 — Agent 5
    compare/page.tsx                — Agent 5
    standings/page.tsx              — Agent 5
    awards/page.tsx                 — Agent 5
    hall-of-fame/page.tsx           — Agent 5
  media/
    [slug]/page.tsx                 — Agent 5
  sign-in/page.tsx                  — Agent 6
  register/page.tsx                 — Agent 6
  forgot-password/page.tsx          — Agent 6
  reset-password/page.tsx           — Agent 6
  account/page.tsx                  — Agent 6
  account/profile/page.tsx          — Agent 6
  account/security/page.tsx         — Agent 6
  account/favourite-team/page.tsx   — Agent 6
  account/delete/page.tsx           — Agent 6
  help/page.tsx                     — Agent 6
  help/[slug]/page.tsx              — Agent 6
  terms/page.tsx                    — Agent 6
  privacy/page.tsx                  — Agent 6
  about/page.tsx                    — Agent 6
  scan/page.tsx                     — Agent 6
  quiz/[quizId]/page.tsx            — Agent 6

src/components/
  shell/
    AppHeader.tsx                   — Agent 7 (update nav links)
    MobileBottomNav.tsx             — Agent 7 (update tabs)
    MatchweekNav.tsx                — Existing (do not touch)
    FantasyNav.tsx                  — Agent 7 (new)
    FantasyTabBar.tsx               — Agent 7 (new)
  fantasy/
    shared/                         — Agent 2
      FantasyShell.tsx
      FantasyPageHero.tsx
      FantasyEmptyState.tsx
      FantasyLoadingState.tsx
      FantasyErrorState.tsx
      FantasyActionBar.tsx
      FantasyModal.tsx
      FantasyBottomSheet.tsx
      FantasyToast.tsx
      FantasySectionHeader.tsx
      FantasyTabs.tsx
      SkeletonCard.tsx
      SkeletonText.tsx
    core/                           — Agent 3
      FantasyPitchView.tsx
      FantasyPlayerCard.tsx
      PlayerSlot.tsx
      PlayerPool.tsx
      PlayerSearch.tsx
      PlayerFilters.tsx
      BudgetIndicator.tsx
      FormationValidation.tsx
      CaptainMarker.tsx
      BenchPanel.tsx
      TransferPanel.tsx
      TransferConfirmation.tsx
      ChipCard.tsx
      ChipSelector.tsx
      DeadlineCountdown.tsx
      FixtureDifficultyMatrix.tsx
      FixtureDifficultyCell.tsx
    leagues/                        — Agent 4
      LeagueCard.tsx
      LeagueCodeInput.tsx
      LeagueCreateForm.tsx
      LeagueStandingsTable.tsx
      ManagerRow.tsx
      RankMovement.tsx
      RivalTeamPitchView.tsx
      FantasyHistoryTimeline.tsx
      GameweekHistoryCard.tsx
      InviteLeagueSheet.tsx
      ManagerSearch.tsx
      ManagerFilters.tsx
  football/                         — Agent 5
    MatchHeader.tsx
    MatchStateBadge.tsx
    MatchTimeline.tsx
    MatchStatsPanel.tsx
    LineupPitch.tsx
    PlayerProfileHero.tsx
    PlayerStatGrid.tsx
    PlayerGameweekTable.tsx
    PlayerComparison.tsx
    ComparisonMetric.tsx
    SeasonLeaderboard.tsx
    StandingsTable.tsx
    AwardCard.tsx
    HallOfFameCard.tsx
    ManOfTheMatchCard.tsx
    ArticleDetail.tsx
    VideoPlayerShell.tsx
  account/                          — Agent 6
    AuthLayout.tsx
    AuthTabs.tsx
    AccountNav.tsx
    ProfileForm.tsx
    PasswordForm.tsx
    FavouriteTeamSelector.tsx
    DeleteAccountDialog.tsx
    HelpCategoryList.tsx
    HelpArticle.tsx
    LegalDocument.tsx
    BadgeScannerShell.tsx
    QuizShell.tsx
  ui/ (existing)                    — Do not modify
  actions/ (existing)               — Do not modify

src/lib/
  api.ts                            — Agent 8 (new)
  auth.ts                           — Agent 8 (new)
  fantasy-api.ts                    — Agent 8 (new)
  football-api.ts                   — Agent 8 (new)
  players-api.ts                    — Agent 8 (new)
  media-api.ts                      — Agent 8 (new)
  profile-api.ts                    — Agent 8 (new)
  data.ts                           — Agent 8 (extend existing)
  experience.spec.ts                — Agent 10 (extend)
```
