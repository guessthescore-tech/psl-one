# Sprint 41 — Player Card System

## Purpose

Player cards are the core visual unit for the PSL One Fantasy experience. They communicate a player's value, position, club, and live score at a glance.

---

## Card Anatomy

```
┌─────────────────────────┐
│  ████████████████████   │  ← Club colour gradient header
│  ██  PLAYER IMAGE  ██   │  ← Silhouette (beta) or licensed photo
│  ████████████████████   │
├─────────────────────────┤
│  [MID]  Baloyi  [CPT]  │  ← Position chip + name + captain indicator
│  Kaizer Chiefs          │  ← Club name
│                         │
│  R 8.5m    ↑ 12pts     │  ← Price + points (if scored)
└─────────────────────────┘
```

---

## Card Variants

### Standard card (fantasy selection)
- Width: 160px (snap scroll)
- Background: dark (exp-navy) or light (exp-surface)
- Position chip: coloured by position (GK=yellow, DEF=blue, MID=green, FWD=red)
- Price: white/gold text
- Points: only shown if gameweek has started

### Compact card (squad list)
- Width: 100%
- Horizontal layout: small badge + name + position + price + points
- Used in squad management view

### Hero card (featured player)
- Width: 220px
- Prominent image area
- Shows form stats (last 5 gameweeks)
- Used on leaderboards, top performers sections

---

## Position Colour System

| Position | Token | Hex |
|----------|-------|-----|
| GK | `pos-gk` | `#f59e0b` (amber) |
| DEF | `pos-def` | `#3b82f6` (blue) |
| MID | `pos-mid` | `#22c55e` (green) |
| FWD | `pos-fwd` | `#ef4444` (red) |

---

## Beta Image Approach

Until licensed photography is available:
1. Large player initials on club-coloured gradient background
2. Generic silhouette graphic (single SVG, positioned at bottom)
3. Position-coloured gradient with position text

Example implementation:
```tsx
// No image — show initials on club gradient
<div
  className="w-full aspect-[3/4] flex items-end justify-center"
  style={{
    background: `linear-gradient(180deg, ${club.primaryColor}dd 0%, ${club.primaryColor}44 100%)`,
  }}
>
  <span className="text-6xl font-black text-white/80 mb-4">
    {initials}
  </span>
</div>
```

When licensed photography is available, replace with `next/image` with `object-cover object-top`.

---

## Data requirements

```ts
interface PlayerCardData {
  id: string;
  name: string;           // Display name (e.g. "S. Baloyi")
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  club: {
    name: string;
    shortName: string;
    abbr: string;
    primaryColor: string;
    textColor: string;
  };
  price: number;          // In fantasy points units
  totalPoints?: number;   // This season
  gameweekPoints?: number; // This gameweek
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  imageUrl?: string;      // null for beta
  form?: number;          // Average points last 5 GWs
  selectedBy?: number;    // % of teams containing player
}
```

---

## Card States

| State | Visual treatment |
|-------|-----------------|
| Available | Normal card |
| Selected | Gold border, slight scale-up |
| Captain | Gold "C" badge in top-right |
| Vice-captain | Gold "VC" badge in top-right |
| Injured | Red overlay, "OUT" chip |
| Doubtful | Yellow overlay, "?" chip |
| Suspended | Red overlay, "BAN" chip |
| Playing now | Green pulse, live points counter |
| Bench | Reduced opacity (0.7) |

---

## Accessibility

- Player name in alt text for any image
- Position readable via chip text (not colour alone)
- Price in aria-label: "Price: 8.5 million fantasy points"
- Captain/Vice-captain in aria-label: "Captain" / "Vice-captain"
