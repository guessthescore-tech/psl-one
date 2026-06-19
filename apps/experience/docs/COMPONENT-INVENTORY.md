# apps/experience — Component Inventory
**Last updated:** 2026-06-19 (STORY-FE-FANTASY-00)

---

## Built Components (STORY-FE-PREMIUM-01A)

### Shell Components

| Component | File | Props | Key features |
|-----------|------|-------|--------------|
| `AppHeader` | `components/shell/AppHeader.tsx` | none | Sticky dark, wordmark, desktop nav, mobile account icon |
| `MobileBottomNav` | `components/shell/MobileBottomNav.tsx` | none | 5 tabs, spring indicator, `pb-safe`, `useReducedMotion` |
| `MatchweekNav` | `components/shell/MatchweekNav.tsx` | `currentGW`, `totalGW`, `label`, `onPrev`, `onNext` | Direction-aware slide transition, `useReducedMotion` |

### UI Components

| Component | File | Props | Key features |
|-----------|------|-------|--------------|
| `SectionHeader` | `components/ui/SectionHeader.tsx` | `title`, `subtitle?`, `href?`, `linkLabel?`, `dark?` | Light/dark variant, optional "View all" link |
| `FixtureCard` | `components/ui/FixtureCard.tsx` | `fixture`, `index?` | Live/finished/scheduled states, dual colour bar, stagger animation |
| `TeamIdentity` | `components/ui/TeamIdentity.tsx` | `club`, `size`, `showName?`, `nameClass?` | 4 sizes (sm/md/lg/xl), colour badge derived from club data |
| `PlayerPortrait` | `components/ui/PlayerPortrait.tsx` | `player`, `compact?` | Full card + compact list variant, stats grid |
| `LeagueTable` | `components/ui/LeagueTable.tsx` | `standings` | CSS grid, zone colour bars, form dots |
| `EditorialStory` | `components/ui/EditorialStory.tsx` | `story`, `featured?` | Featured full-height + compact grid variant |
| `VideoCard` | `components/ui/VideoCard.tsx` | `video` | Snap card, play overlay, duration + category badges |
| `GameEntryCard` | `components/ui/GameEntryCard.tsx` | `fixture`, `variant?` | `predict`/`fantasy`/`challenge` variants, disclaimer, `whileTap` |
| `SponsorMoment` | `components/ui/SponsorMoment.tsx` | none | Picsum bg, transparency label, non-financial disclaimer |

### Action Components

| Component | File | Props | Key features |
|-----------|------|-------|--------------|
| `ShareAction` | `components/actions/ShareAction.tsx` | `title`, `text`, `url?`, `compact?` | Spring bottom sheet, WhatsApp/X/Copy, `role="dialog"`, safe-area padding |
| `ChallengeAction` | `components/actions/ChallengeAction.tsx` | `fixture`, variant? | Compact + full versions, Sword icon |

---

## Proposed Components — Phase 1 (Fantasy Core)

These components are required to build the 11 Phase 1 screens. None exist yet in `apps/experience`.

### Fantasy Pitch

| Component | Purpose | Reuses existing? |
|-----------|---------|-----------------|
| `FantasyPitchView` | Formation pitch showing 15 players (GK / DEF / MID / FWD rows) | No — new |
| `PlayerSlot` | Individual slot on pitch — empty or filled with player card | No — new |
| `SquadPlayerCard` | Compact player on pitch: jersey number, name, points, captain badge | Uses `PlayerPortrait` pattern |
| `TransferBar` | Sticky bar: budget remaining + transfers available + confirm CTA | No — new |
| `DeadlineCountdown` | Live countdown to next transfer deadline | No — new |
| `PointsSummaryHeader` | Sticky header: GW points total + rank movement | No — new |

### Transfer Flow

| Component | Purpose | Reuses existing? |
|-----------|---------|-----------------|
| `PlayerPoolRow` | Player in transfer list: position badge, name, club, price, points, ownership % | No — new |
| `PlayerPoolFilter` | Position / price range / club filter controls | No — new |
| `TransferComparison` | Side-by-side OUT vs IN player before confirming | No — new |
| `BudgetIndicator` | Colour bar showing budget headroom | No — new |

### Chips

| Component | Purpose | Reuses existing? |
|-----------|---------|-----------------|
| `ChipCard` | Chip tile: name, description, status (available / used / active), activate button | No — new |
| `ChipStatusBadge` | Pill: ACTIVE / USED / AVAILABLE | No — new |

### Fixture Difficulty Rating

| Component | Purpose | Reuses existing? |
|-----------|---------|-----------------|
| `FDRMatrix` | Horizontal-scroll table: clubs × next 6 gameweeks | No — new |
| `FDRCell` | Individual cell: colour + opponent abbr + H/A indicator | No — new |

### Leagues

| Component | Purpose | Reuses existing? |
|-----------|---------|-----------------|
| `LeagueCard` | Summary card: name, type badge, own rank, points gap to leader | No — new |
| `LeagueStandingsTable` | Full standings: Rank / Manager / Team / GW / Total / movement | Extends `LeagueTable` |
| `ManagerRow` | Row in standings: avatar, manager name, team name, rank, points | No — new |
| `RivalTeamPitchView` | Read-only pitch for a rival's team | Extends `FantasyPitchView` |
| `LeagueCodeInput` | Code input with join action and error messaging | No — new |

### Onboarding

| Component | Purpose | Reuses existing? |
|-----------|---------|-----------------|
| `OnboardingStep` | Step indicator: numbered circles + connecting line | No — new |
| `BudgetMeter` | Budget progress bar during squad build | No — new |
| `PositionSlotGroup` | Row of empty position slots during onboarding | No — new |

---

## Proposed Components — Phase 2 (Research and Match Context)

### Match

| Component | Purpose | Reuses existing? |
|-----------|---------|-----------------|
| `ScoreHeader` | Sticky score: teams, score, minute, status | No — new |
| `MatchTabBar` | Tab bar: Summary / Lineups / Stats / Fantasy | No — new |
| `TimelineEvent` | Goal / card / sub event: minute, player, team colour | No — new |
| `LineupFormation` | Visual 11-player formation diagram | No — new |
| `TeamStatsBar` | Dual-bar stat row: possession, shots, corners | No — new |
| `LivePulseBadge` | "LIVE 23'" animated badge | No — new |
| `MOTMHero` | Man of the Match hero: portrait + key stats | Extends `PlayerPortrait` |

### Player Research

| Component | Purpose | Reuses existing? |
|-----------|---------|-----------------|
| `PlayerStatGrid` | Goals / Assists / Minutes / Cards grid | No — new |
| `PerGameweekTable` | GW-by-GW stat table with sortable columns | No — new |
| `PlayerComparisonColumn` | One side of a two-player comparison view | Extends `PlayerStatGrid` |
| `WinnerHighlight` | Per-row winner indicator in comparison | No — new |

### Season Stats

| Component | Purpose | Reuses existing? |
|-----------|---------|-----------------|
| `TopScorersList` | Ranked list: position number, name, club, stat value | No — new |
| `StandingsTable` | Full PSL standings with sortable columns | Extends `LeagueTable` |
| `AwardCard` | Award category card: icon, category, current leader | No — new |

---

## Proposed Components — Phase 3 (Account and Support)

| Component | Purpose | Reuses existing? |
|-----------|---------|-----------------|
| `AccountMenuList` | List of account sections with chevrons | No — new |
| `ProfileForm` | Name, bio, email fields with save | No — new |
| `PasswordChangeForm` | Current + new + confirm password fields | No — new |
| `ClubBadgeSelector` | 4-column grid of club badges with selection state | Extends `TeamIdentity` |
| `SignInForm` | Email + password + submit | No — new |
| `ForgotPasswordForm` | Email input for reset request | No — new |
| `FAQAccordion` | Category-filtered expandable FAQ list | No — new |
| `StaticContentPage` | Shared layout for Terms, Privacy, About | No — new |
| `QRScanner` | Camera viewfinder with QR detection | No — new (native camera API) |

---

## Design System

All components use the `exp-*` Tailwind token set defined in `tailwind.config.ts`.

**Do not use:** `bg-gray-*`, `text-slate-*`, or any Tailwind default colours in this app. Use `exp-*` tokens only.

**Token reference:**

| Category | Tokens |
|----------|--------|
| Dark surfaces | `exp-void`, `exp-navy`, `exp-navy-2`, `exp-ink` |
| Light surfaces | `exp-surface`, `exp-card` |
| Accents | `exp-gold`, `exp-gold-2`, `exp-green`, `exp-green-2`, `exp-blue`, `exp-live` |
| Text | `exp-muted`, `exp-border`, `exp-border-dk` |
| Typography | `text-display-2xl` through `text-display-sm`, `text-body-lg/md/sm`, `text-label-lg/md/sm`, `text-score-xl/lg/md` |
| Radii | `rounded-card` (14px), `rounded-card-sm` (10px), `rounded-card-xs` (8px), `rounded-pill` (100px) |
| Shadows | `shadow-card`, `shadow-card-md`, `shadow-card-lg`, `shadow-card-xl`, `shadow-glow-gold`, `shadow-glow-green` |
| Animations | `animate-live-pulse`, `animate-shimmer`, `animate-slide-up`, `animate-fade-in`, `animate-ticker-left` |

---

## Motion Standards

All animated components must:
1. Import `useReducedMotion` from `framer-motion`
2. Pass `false` as `initial` prop when `reduce` is true (disables entrance animation)
3. Use `[0.16, 1, 0.3, 1]` as the enter easing curve
4. Keep duration ≤ 350ms for functional transitions, ≤ 150ms for micro-interactions
5. Animate only `opacity` and transform properties (`y`, `x`, `scale`) — never `width`, `height`, `top`, `left`
