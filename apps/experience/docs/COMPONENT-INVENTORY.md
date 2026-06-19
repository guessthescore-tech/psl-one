# apps/experience — Component Inventory
**Last updated:** 2026-06-19 (STORY-FE-FANTASY-AGENTIC-01 final)
**Total components:** 83

---

## Shell Components

| Component | File | Notes |
|-----------|------|-------|
| `AppHeader` | `shell/AppHeader.tsx` | Sticky dark; wordmark; desktop nav; mobile account icon; `min-h-[44px]` on all targets |
| `MobileBottomNav` (shell) | `shell/MobileBottomNav.tsx` | Original shell nav; 5 tabs |
| `MatchweekNav` | `shell/MatchweekNav.tsx` | Gameweek prev/next arrows; direction-aware slide; `min-h-[44px]` |

---

## Navigation Components

| Component | File | Notes |
|-----------|------|-------|
| `MobileBottomNav` (nav) | `nav/MobileBottomNav.tsx` | framer-motion spring indicator; 5 destinations (Home, Matches, Fantasy, Predict, Profile) |
| `FantasyTabs` (nav) | `fantasy/nav/FantasyTabs.tsx` | 9-tab horizontal scroll; `usePathname()` active detection; `min-h-[44px]` |

---

## UI Primitives

| Component | File | Notes |
|-----------|------|-------|
| `SectionHeader` | `ui/SectionHeader.tsx` | Light/dark variant; optional "View all" link |
| `TeamIdentity` | `ui/TeamIdentity.tsx` | Club crest + name; `sm/md/lg` sizes |
| `FixtureCard` | `ui/FixtureCard.tsx` | Fixture card; score/status |
| `EditorialStory` | `ui/EditorialStory.tsx` | Story card; featured variant |
| `VideoCard` | `ui/VideoCard.tsx` | Video thumbnail + title |
| `PlayerPortrait` | `ui/PlayerPortrait.tsx` | Player photo + position badge |
| `LeagueTable` | `ui/LeagueTable.tsx` | Standings table; form dots |
| `SponsorMoment` | `ui/SponsorMoment.tsx` | Sponsor full-bleed card |
| `GameEntryCard` | `ui/GameEntryCard.tsx` | Game entry CTA card |

---

## Fantasy Shared Primitives

| Component | File | Notes |
|-----------|------|-------|
| `FantasyShell` | `fantasy/shared/FantasyShell.tsx` | Top-level shell; AppHeader + FantasyTabs + MobileBottomNav |
| `FantasyLoadingState` | `fantasy/shared/FantasyLoadingState.tsx` | Shared skeleton loader |
| `FantasyEmptyState` | `fantasy/shared/FantasyEmptyState.tsx` | Empty state with CTA |
| `FantasyErrorState` | `fantasy/shared/FantasyErrorState.tsx` | Error state with retry |
| `FantasyModal` | `fantasy/shared/FantasyModal.tsx` | Modal wrapper |
| `FantasyBottomSheet` | `fantasy/shared/FantasyBottomSheet.tsx` | Bottom sheet (mobile) |
| `FantasyActionBar` | `fantasy/shared/FantasyActionBar.tsx` | Sticky action bar |
| `FantasyPageHero` | `fantasy/shared/FantasyPageHero.tsx` | Page hero with title/subtitle |
| `FantasySectionHeader` | `fantasy/shared/FantasySectionHeader.tsx` | Section header (fantasy variant) |
| `FantasyTabs` (shared) | `fantasy/shared/FantasyTabs.tsx` | Tab bar (shared variant) |
| `SkeletonCard` | `fantasy/shared/SkeletonCard.tsx` | Skeleton card placeholder |
| `SkeletonText` | `fantasy/shared/SkeletonText.tsx` | Skeleton text line |
| `DesignReviewBanner` | `fantasy/shared/DesignReviewBanner.tsx` | Purple DESIGN_REVIEW_DATA mode banner |

---

## Fantasy Core Components

| Component | File | Notes |
|-----------|------|-------|
| `FantasyPitchView` | `fantasy/core/FantasyPitchView.tsx` | 15-slot pitch; GK/DEF/MID/FWD rows; captain badge |
| `PlayerSlot` | `fantasy/core/PlayerSlot.tsx` | Single player slot; captain/vice badge |
| `CaptainMarker` | `fantasy/core/CaptainMarker.tsx` | C/VC badge overlay |
| `BenchPanel` | `fantasy/core/BenchPanel.tsx` | 4-player bench row |
| `BudgetIndicator` | `fantasy/core/BudgetIndicator.tsx` | Budget remaining display |
| `TransferPanel` | `fantasy/core/TransferPanel.tsx` | Transfer action panel |
| `TransferConfirmation` | `fantasy/core/TransferConfirmation.tsx` | Confirm transfer modal |
| `PlayerPool` | `fantasy/core/PlayerPool.tsx` | Scrollable player list |
| `PlayerPoolRow` | `fantasy/core/PlayerPoolRow.tsx` | Compact player row; Phosphor Plus icon; G · A stats |
| `PlayerFilters` | `fantasy/core/PlayerFilters.tsx` | Position filter tabs |
| `ChipCard` | `fantasy/core/ChipCard.tsx` | Individual chip card (Phosphor icons, hover/active states) |
| `ChipSelector` | `fantasy/core/ChipSelector.tsx` | Chip selection grid |
| `DeadlineCountdown` | `fantasy/core/DeadlineCountdown.tsx` | Deadline timer display |
| `FormationSelector` | `fantasy/core/FormationSelector.tsx` | Formation picker |
| `OnboardingStep` | `fantasy/core/OnboardingStep.tsx` | Single onboarding step |
| `FixtureDifficultyCell` | `fantasy/core/FixtureDifficultyCell.tsx` | Single FDR cell |
| `FixtureDifficultyMatrix` | `fantasy/core/FixtureDifficultyMatrix.tsx` | Full FDR colour grid |

---

## Fantasy League Components

| Component | File | Notes |
|-----------|------|-------|
| `LeagueCard` | `fantasy/leagues/LeagueCard.tsx` | League entry card |
| `LeagueStandingsTable` | `fantasy/leagues/LeagueStandingsTable.tsx` | Standings table with rank movement |
| `LeagueCreateForm` | `fantasy/leagues/LeagueCreateForm.tsx` | Create league form |
| `LeagueCodeInput` | `fantasy/leagues/LeagueCodeInput.tsx` | Join-by-code input |
| `InviteLeagueSheet` | `fantasy/leagues/InviteLeagueSheet.tsx` | Invite members bottom sheet |
| `ManagerSearch` | `fantasy/leagues/ManagerSearch.tsx` | Manager search input |
| `ManagerRow` | `fantasy/leagues/ManagerRow.tsx` | Manager row in standings |
| `ManagerFilters` | `fantasy/leagues/ManagerFilters.tsx` | Filter controls for manager list |
| `RankMovement` | `fantasy/leagues/RankMovement.tsx` | Up/down/same rank indicator |
| `GameweekHistoryCard` | `fantasy/leagues/GameweekHistoryCard.tsx` | GW history list item |
| `FantasyHistoryTimeline` | `fantasy/leagues/FantasyHistoryTimeline.tsx` | Historical points timeline |
| `RivalTeamPitchView` | `fantasy/leagues/RivalTeamPitchView.tsx` | Rival manager's pitch (read-only) |

---

## Football Context Components

| Component | File | Notes |
|-----------|------|-------|
| `MatchHeader` | `football/MatchHeader.tsx` | Match score header |
| `MatchTimeline` | `football/MatchTimeline.tsx` | Events timeline (goals, cards) |
| `MatchStatsPanel` | `football/MatchStatsPanel.tsx` | Match statistics panel |
| `MatchStateBadge` | `football/MatchStateBadge.tsx` | Live/FT/HT badge |
| `LineupPitch` | `football/LineupPitch.tsx` | Team lineups pitch view |
| `ManOfTheMatchCard` | `football/ManOfTheMatchCard.tsx` | MOTM display card |
| `PlayerProfileHero` | `football/PlayerProfileHero.tsx` | Player profile hero section |
| `PlayerStatGrid` | `football/PlayerStatGrid.tsx` | Player stats grid |
| `PlayerGameweekTable` | `football/PlayerGameweekTable.tsx` | Player GW-by-GW stats |
| `PlayerComparison` | `football/PlayerComparison.tsx` | Two-player comparison |
| `ComparisonMetric` | `football/ComparisonMetric.tsx` | Single comparison metric row |
| `StandingsTable` | `football/StandingsTable.tsx` | League standings table |
| `SeasonLeaderboard` | `football/SeasonLeaderboard.tsx` | Season leaderboard |
| `AwardCard` | `football/AwardCard.tsx` | Award display card |
| `HallOfFameCard` | `football/HallOfFameCard.tsx` | Hall of Fame entry |
| `ArticleDetail` | `football/ArticleDetail.tsx` | Article content display |
| `VideoPlayerShell` | `football/VideoPlayerShell.tsx` | Video player wrapper |

---

## Account & Auth Components

| Component | File | Notes |
|-----------|------|-------|
| `AuthLayout` | `account/AuthLayout.tsx` | Centered auth page layout |
| `AuthTabs` | `account/AuthTabs.tsx` | Sign In / Register tab switcher |
| `AccountNav` | `account/AccountNav.tsx` | Account sidebar nav (4 items + Sign Out) |
| `ProfileForm` | `account/ProfileForm.tsx` | Edit display name form |
| `PasswordForm` | `account/PasswordForm.tsx` | Change password form |
| `FavouriteTeamSelector` | `account/FavouriteTeamSelector.tsx` | Team selector grid |
| `DeleteAccountDialog` | `account/DeleteAccountDialog.tsx` | POPIA deletion placeholder |
| `HelpCategoryList` | `account/HelpCategoryList.tsx` | Help categories grid |
| `HelpArticle` | `account/HelpArticle.tsx` | Help article content |
| `LegalDocument` | `account/LegalDocument.tsx` | Terms/Privacy document layout |
| `BadgeScannerShell` | `account/BadgeScannerShell.tsx` | Badge scanner UI shell |
| `QuizShell` | `account/QuizShell.tsx` | Quiz question/answer shell |

---

## Action Components

| Component | File | Notes |
|-----------|------|-------|
| `ShareAction` | `actions/ShareAction.tsx` | Share sheet; note: no focus trap (deferred) |
| `ChallengeAction` | `actions/ChallengeAction.tsx` | Challenge a friend CTA |

---

## Homepage Sections

| Section | File |
|---------|------|
| `MatchweekHeroSection` | `sections/MatchweekHeroSection.tsx` |
| `FixtureCarouselSection` | `sections/FixtureCarouselSection.tsx` |
| `FeaturedMatchSection` | `sections/FeaturedMatchSection.tsx` |
| `GuessTheScoreSection` | `sections/GuessTheScoreSection.tsx` |
| `LeagueTableSection` | `sections/LeagueTableSection.tsx` |
| `FantasyGameweekSection` | `sections/FantasyGameweekSection.tsx` |
| `PlayerSpotlightSection` | `sections/PlayerSpotlightSection.tsx` |
| `EditorialGridSection` | `sections/EditorialGridSection.tsx` |
| `VideoRailSection` | `sections/VideoRailSection.tsx` |
| `ClubIdentitySection` | `sections/ClubIdentitySection.tsx` |
| `SponsorSection` | `sections/SponsorSection.tsx` |
| `FanValueSection` | `sections/FanValueSection.tsx` |
| `MyClubSection` | `sections/MyClubSection.tsx` |
