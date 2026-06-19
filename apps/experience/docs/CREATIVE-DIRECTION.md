# PSL One — Creative Direction

## The Pulse of South African Football

PSL One is the digital heartbeat of South African football. Every design decision should feel like it belongs pitch-side — immediate, visceral, alive with the energy of the beautiful game. This is not a sports statistics dashboard. It is a living match experience that puts fans at the centre of the action.

---

## Product Ambition

PSL One aims to be the first product that South African football fans reach for on matchday — before the TV, before social media. The premium experience layer must earn that position through design quality that reflects the calibre of the competition it serves.

The experience app is the creative production environment for PSL One. It allows the team to prototype, pressure-test, and iterate on the product's visual direction before committing changes to the live engineering beta.

---

## Audience

**Primary:** South African football fans aged 18-40 who follow the DStv Premiership weekly. Mobile-first, data-conscious, deeply tribal about their clubs. They carry strong opinions about Sundowns, Pirates, Chiefs, and City.

**Secondary:** International football fans and broadcasters discovering South African football through World Cup cycles and continental competition.

**Tertiary:** Sponsors, media partners, and potential commercial partners evaluating the platform's brand quality.

The design must honour the intelligence and passion of South African fans. It must not talk down to them with generic sports-app clichés.

---

## Football-First Principles

1. **Start with the ball.** Every page opens with football activity — a live score, a next fixture, a prediction window — not a marketing headline.
2. **Data in context.** Stats exist to deepen understanding of the game, not to fill space. A possession percentage should feel significant.
3. **Club identity is sacred.** Each club carries its own visual identity — colours, crest, supporter culture. The platform must represent all 16 clubs with equal care.
4. **The moment matters.** A 67th-minute goal should feel like news. Live match states should be visually unmistakable from completed or scheduled ones.
5. **Prediction is participation.** Guess the Score is the primary fan engagement mechanic. The interaction must feel satisfying enough to want to use every matchday.

---

## South African Visual Identity

South Africa's visual culture is bold, warm, and deeply layered. The platform should feel rooted in this context without resorting to tourist-brochure clichés.

**What this means in practice:**
- Use the full depth of the PSL navy and green — do not flatten them to generic sports blue and generic sports green.
- Stadium photography should emphasise the energy of South African crowds, not empty pitches.
- When editorial content references townships, youth academies, or community football, the imagery treatment should match the warmth and authenticity of those stories.
- Match the linguistic register of South African fans. "Diski" not "soccer". "Sundowns" not "Mamelodi Sundowns FC".

---

## Typography

**Primary font:** Outfit (Google Fonts)
- Chosen for its geometric precision with warm personality — suited to both scoreboards and editorial reading.
- Use weight 900 for scores and hero headlines.
- Use weight 700 for section headers and fixture cards.
- Use weight 500 for navigation and labels.
- Use weight 400 for body copy.

**Monospace:** JetBrains Mono
- Reserved for statistics, form data, and code contexts.
- Always tabular figures for score displays.

**Rules:**
- Display type (`text-display-2xl`) for live scores and hero matchweek stats only.
- `text-display-lg` for section headers.
- `text-body-md` for descriptions and editorial body.
- No text below 12px visible to users.
- No decorative serif — Outfit's geometric warmth provides all the premium feel needed.

---

## Colour

**Palette rationale:** PSL One uses a two-mode palette: immersive dark for match experiences, warm editorial light for content and data.

### Dark immersive surfaces (match centre, game modules, hero)
- `exp-void` `#060d19` — deepest background for matchday hero
- `exp-navy` `#0d1b2e` — primary dark surface for game modules
- `exp-navy-2` `#1b3a6b` — elevated dark panels

### Light editorial surfaces (league tables, news, club pages)
- `exp-surface` `#f8f9fb` — off-white editorial background
- `exp-card` `#ffffff` — card whites
- Body text at minimum 4.5:1 contrast ratio against all surfaces.

### Brand accents
- `exp-gold` `#e6aa00` — action gold (primary CTA, live indicators, captain badges)
- `exp-green` `#00843d` — football green (champions zone, success states, PSL green)
- `exp-blue` `#1e3a8a` — tournament blue (group stage, competition context)
- `exp-live` `#ef4444` — live match red (LIVE badge, live indicators)

### Rules
- One accent per section. A live section uses red. A CTA uses gold. Not both.
- Club colours supplement — never override — the brand palette.
- No pure `#000000` or `#ffffff`. Use `exp-void` and `exp-card`.
- Ensure all text meets WCAG AA (4.5:1 body, 3:1 large text).

---

## Imagery

### Football photography
Use descriptive Picsum seeds that communicate the intended subject for handoff to the production photography team.

Seeds to use:
- `psl-stadium-soweto` — Orlando Stadium crowd energy
- `psl-sundowns-training` — training ground, morning light
- `psl-match-night` — floodlit pitch atmosphere
- `wc-2026-fanpark` — World Cup fan park energy
- `player-portrait-*` — individual player portraits (dark studio bg)
- `club-crest-wall-*` — club visual identity shots

### Production asset requirements (see section: Missing Asset List)
All Picsum placeholders in this app represent production photography requirements. Real photography must replace all `picsum.photos` URLs before any public launch.

### Rules
- Never hotlink unlicensed third-party images.
- Stadium images: always with crowd. Empty pitches feel wrong for an entertainment product.
- Player portraits: consistent treatment — dark background, facing forward.
- Club crests: use colour values from the seeded database, not external image assets.

---

## Motion

**Philosophy (from Emil Kowalski):** Every animation must answer "why does this animate?" If the answer is "it looks cool," remove it.

### Motivated uses in this product
- **Fixture carousel** — drag/swipe momentum communicates spatial navigation
- **Score stepper** — AnimatePresence number flip communicates value change
- **Live score ribbon** — ticker motion communicates real-time data
- **Card transitions** — `whileInView` stagger communicates content arriving in sequence
- **Tab indicators** — sliding underline communicates active state change
- **Share sheets** — spring slide-up from bottom communicates modal origin
- **Prediction confirmation** — scale + fade communicates success state

### Motion tokens
- Enter: `cubic-bezier(0.16, 1, 0.3, 1)` (strong ease-out, starts fast)
- Exit:  `cubic-bezier(0.32, 0.72, 0, 1)` (iOS-style drawer curve)
- Duration: 200-350ms for transitions, 100-150ms for micro-interactions
- Springs: `{ type: "spring", duration: 0.5, bounce: 0.15 }` for drag interactions

### Rules
- `useReducedMotion()` guard on every animated component.
- Never animate `width`, `height`, `top`, `left` — only `transform` and `opacity`.
- Enter animations start from `scale(0.95)` + `opacity: 0`, never `scale(0)`.
- Exit animations are 30-40% shorter than enter animations.
- Keyboard-triggered actions (tab, space, enter to submit) receive no animation.
- No decorative loops on informational sections.

---

## Sponsor Integration

Sponsors are commercial partners, not intrusions. The platform represents them with the same care as editorial content.

**Rules:**
- Always label sponsored content: "Presented by" or "In partnership with."
- No gambling language, no betting odds, no wagering terminology — ever.
- Disclaimer required on all game surfaces: "Points only - no real money."
- Sponsor placements must not obscure football content.
- `rel="noopener noreferrer nofollow"` on all external sponsor links.

---

## Mobile Behaviour

PSL One is a mobile-first product. Most fans use it while watching the match on TV or at the stadium.

**Navigation:** Bottom navigation bar with 5 maximum items: Home, Fixtures, Fantasy, Predict, Account. Safe-area-inset-bottom required.

**Touch:** All interactive elements minimum 44px height. 8px minimum gap between touch targets.

**Carousels:** Horizontal scroll-snap. `overscroll-behavior-x: contain`. Visible peek of next card (partial visibility cue).

**Modals/sheets:** Spring slide-up from bottom. `env(safe-area-inset-bottom)` padding. Swipe-to-dismiss via velocity threshold.

**Score steppers:** Large `w-12 h-12` targets. `min-h-[44px]` on all buttons. Physical scale feedback on press via `whileTap={{ scale: 0.92 }}`.

**Typography:** Minimum `text-base` (16px) for body text to prevent iOS auto-zoom.

---

## Accessibility

- WCAG AA minimum: 4.5:1 text contrast, 3:1 large text.
- Focus rings: visible on all interactive elements via `focus-visible:ring-2`.
- Screen reader: `aria-label` on all icon-only buttons, `role="region"` on major sections.
- Skip to main content link in layout.
- `aria-live="polite"` on score updates and prediction confirmations.
- `prefers-reduced-motion` respected via `useReducedMotion()` on all animated components.
- `min-h-[100dvh]` (never `h-screen`) for full-height sections.
- No content conveyed by colour alone (always with icon or text).

---

## Things to Avoid

**Visual:**
- Identical three-equal-card grids
- Empty dark backgrounds with no visual interest
- Excessive glassmorphism that obscures content
- Generic sports dashboard styling with too many borders
- Letter-only club "badges" without real colour identity
- Em-dashes in any visible copy
- Centred hero over a dark mesh gradient

**Copy:**
- "Elevate your football experience"
- "Seamless fan journey"
- "Next-gen predictions"
- Gambling, betting, wagering, odds, stakes, cash prizes
- Infrastructure language on fan-facing pages ("API", "endpoint", "webhook")

**Motion:**
- Animations on keyboard-triggered actions
- `scale(0)` start states
- `ease-in` easing on entering elements
- Animations longer than 400ms in functional UI
- Multiple concurrent infinite loops on a single section

**Layout:**
- `h-screen` (causes iOS Safari layout shift — use `min-h-[100dvh]`)
- Nested horizontal scrollers on mobile
- More than 3 eyebrow labels across the page
- Section-numbering eyebrows (`01 / Fixtures`, `02 / Fantasy`)
