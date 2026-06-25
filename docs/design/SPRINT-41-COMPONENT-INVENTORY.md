# Sprint 41 — Design System Component Inventory

All components live in `apps/experience/src/components/design/`.

---

## Components

### PslOneHero

Premium hero banner for landing/section hero placement.

**Props:**
| Prop | Type | Required | Default |
|------|------|----------|---------|
| title | string | yes | — |
| subtitle | string | yes | — |
| tag | string | no | undefined |
| ctaLabel | string | yes | — |
| ctaHref | string | yes | — |
| imageBg | string | no | navy gradient |

**Usage:**
```tsx
<PslOneHero
  title="World Cup 2026"
  subtitle="Follow every goal, every story, every moment."
  tag="Live Tournament"
  ctaLabel="View fixtures"
  ctaHref="/fixtures"
  imageBg="linear-gradient(135deg, #060d19 0%, #1b3a6b 100%)"
/>
```

---

### PslOneSection

Reusable section wrapper with heading, optional subtitle and tag chip.

**Props:**
| Prop | Type | Required | Default |
|------|------|----------|---------|
| title | string | yes | — |
| subtitle | string | no | undefined |
| children | ReactNode | yes | — |
| dark | boolean | no | false |
| tag | string | no | undefined |
| className | string | no | undefined |

**Usage:**
```tsx
<PslOneSection title="Latest News" dark tag="Editorial">
  <NewsHeroCard ... />
</PslOneSection>
```

---

### PlayerCard

Fantasy/stats player card. Fixed 160px width for horizontal scroll rails.

**Props:**
| Prop | Type | Required | Default |
|------|------|----------|---------|
| name | string | yes | — |
| position | string | yes | — |
| club | `{ name, abbr, primaryColor }` | yes | — |
| price | number | yes | — |
| score | number | no | undefined |
| imageUrl | string | no | undefined |

**Usage:**
```tsx
<PlayerCard
  name="Kylian Mbappé"
  position="FWD"
  club={{ name: 'France', abbr: 'FRA', primaryColor: '#002395' }}
  price={12.5}
  score={18}
/>
```

---

### ClubCrest

Beta placeholder crest using shield shape. Replace with licensed artwork before production launch.

**Props:**
| Prop | Type | Required | Default |
|------|------|----------|---------|
| club | `{ name, abbr, primaryColor, secondaryColor, textColor }` | yes | — |
| size | `'sm' \| 'md' \| 'lg' \| 'xl'` | no | `'md'` |

**Usage:**
```tsx
<ClubCrest
  club={{ name: 'Mamelodi Sundowns', abbr: 'SUN', primaryColor: '#FFD700', secondaryColor: '#006400', textColor: '#000' }}
  size="lg"
/>
```

---

### SponsorBanner

Glass-morphism sponsor banner. Catalogue-only — no financial/cash language permitted.

**Props:**
| Prop | Type | Required | Default |
|------|------|----------|---------|
| campaignName | string | yes | — |
| sponsorName | string | yes | — |
| tagline | string | no | undefined |
| ctaLabel | string | yes | — |
| ctaHref | string | yes | — |
| accentColor | string (hex) | yes | — |

**Usage:**
```tsx
<SponsorBanner
  campaignName="Fan Zone Presented By"
  sponsorName="MTN Business"
  tagline="Connecting South Africa through football"
  ctaLabel="Explore rewards"
  ctaHref="/sponsor/mtn"
  accentColor="#FFD700"
/>
```

---

### NewsHeroCard

Full-width editorial hero card with optional background image.

**Props:**
| Prop | Type | Required | Default |
|------|------|----------|---------|
| title | string | yes | — |
| category | string | yes | — |
| excerpt | string | yes | — |
| publishedAt | string (ISO) | yes | — |
| imageUrl | string | no | undefined |
| href | string | no | `'#'` |

**Usage:**
```tsx
<NewsHeroCard
  title="Mbappé breaks tournament record"
  category="Match Report"
  excerpt="France's captain delivers a masterclass in the Round of 16."
  publishedAt="2026-06-22T18:00:00Z"
  imageUrl="/media/match-report-fra.jpg"
  href="/media/mbappe-record"
/>
```

---

### VideoTile

Snap-scroll video tile with hover play overlay. Fixed 200px width.

**Props:**
| Prop | Type | Required | Default |
|------|------|----------|---------|
| title | string | yes | — |
| thumbnailUrl | string | no | undefined |
| duration | string | yes | — |
| category | string | yes | — |
| onPlay | `() => void` | no | undefined |

**Usage:**
```tsx
<VideoTile
  title="Goal of the Week — Round 4"
  duration="1:47"
  category="Highlights"
  onPlay={() => openPlayer('video-id')}
/>
```

---

### MatchdayBanner

Full-width split-colour matchday hero banner.

**Props:**
| Prop | Type | Required | Default |
|------|------|----------|---------|
| homeClub | `{ name, abbr, primaryColor, textColor }` | yes | — |
| awayClub | `{ name, abbr, primaryColor, textColor }` | yes | — |
| kickoffAt | string (ISO) | yes | — |
| competition | string | yes | — |
| status | `'SCHEDULED' \| 'LIVE' \| 'FINISHED'` | yes | — |
| homeScore | number | no | undefined |
| awayScore | number | no | undefined |

**Usage:**
```tsx
<MatchdayBanner
  homeClub={{ name: 'South Africa', abbr: 'RSA', primaryColor: '#007A4D', textColor: '#fff' }}
  awayClub={{ name: 'Korea Republic', abbr: 'KOR', primaryColor: '#CD2E3A', textColor: '#fff' }}
  kickoffAt="2026-06-22T19:00:00Z"
  competition="FIFA World Cup 2026 — Group Stage"
  status="FINISHED"
  homeScore={2}
  awayScore={1}
/>
```

---

## Auth Pages

### /sign-up

Two-state page: registration form → email sent confirmation.

- Fields: email, password (min 8), dateOfBirth (13+ check), 3 consent checkboxes
- POST `/api/auth/register`
- Success: resend verification email button

### /verify-email?token=...

Server-side token verification.

- No token → invalid link state
- Token found: POST `/api/auth/email/verify`
- Success → "Email verified" + sign-in link
- 400/expired → "Link expired" + link to `/account/security`

---

*Generated Sprint 41 · 2026-06-25*
