# apps/experience — Component Inventory
**Last updated:** 2026-06-19 (STORY-FE-PREMIUM-01A)

---

## Shell Components

| Component | File | Props | Key features |
|-----------|------|-------|--------------|
| `AppHeader` | `components/shell/AppHeader.tsx` | none | Sticky dark, wordmark, desktop nav, mobile account icon |
| `MobileBottomNav` | `components/shell/MobileBottomNav.tsx` | none | 5 tabs, spring indicator, `pb-safe`, `useReducedMotion` |
| `MatchweekNav` | `components/shell/MatchweekNav.tsx` | `currentGW`, `totalGW`, `label`, `onPrev`, `onNext` | Direction-aware slide transition, `useReducedMotion` |

## UI Components

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

## Action Components

| Component | File | Props | Key features |
|-----------|------|-------|--------------|
| `ShareAction` | `components/actions/ShareAction.tsx` | `title`, `text`, `url?`, `compact?` | Spring bottom sheet, WhatsApp/X/Copy, `role="dialog"`, safe-area padding |
| `ChallengeAction` | `components/actions/ChallengeAction.tsx` | `fixture`, variant? | Compact + full versions, Sword icon |

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
