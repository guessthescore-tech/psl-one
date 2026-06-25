# Sprint 41 — Club Icon & Emblem Guidelines

## Legal Baseline

**PSL One does not have a licence to use official PSL club crests.**

Until a club licensing agreement is signed:
- Do NOT display official Kaizer Chiefs, Orlando Pirates, Sundowns, etc. badge images
- Use programmatic placeholder crests only
- Label all placeholder crests as beta
- The `ClubCrest` component renders text initials on a shield shape — this is the correct beta approach

---

## Placeholder Crest System

The `ClubCrest` component (added in Sprint 41) renders a shield-shaped badge with:
- Club `primaryColor` as background
- Club `textColor` for the abbreviation text
- Club `abbr` (2–3 characters, e.g. "KAI", "ORL", "SUN")
- `secondaryColor` as a subtle bottom border accent

This is football-authentic (many clubs use initial-based crests) and legally safe.

```tsx
<ClubCrest
  club={{ name: 'Kaizer Chiefs', abbr: 'KAI', primaryColor: '#f7d000', secondaryColor: '#1a1a1a', textColor: '#1a1a1a' }}
  size="lg"
/>
```

### Size variants

| Size | Badge dimensions | Text size | Use case |
|------|-----------------|-----------|----------|
| `sm` | 32×32 | 10px | Inline mentions, compact lists |
| `md` | 44×44 | 12px | Card components, rail items |
| `lg` | 56×56 | 14px | Match centre, fixture cards |
| `xl` | 80×80 | 18px | Hero sections, team pages |

---

## Shield Shape

The shield uses CSS `border-radius` to create an authentic football crest shape:
```css
border-radius: 28% 28% 50% 50% / 20% 20% 40% 40%;
```

This produces a rounded-top, pointed-bottom shield. Alternative badge shapes:
- Circular (for modern clubs): `rounded-full`
- Rounded rectangle (for sponsor logos): `rounded-card`

---

## Club Colour Data

All 16 PSL clubs are seeded in the database. Colour data is stored in the `Club` model.

For frontend display, the `ExpClub` type in `apps/experience/src/lib/data.ts` provides:
```ts
interface ExpClub {
  id: string;
  name: string;
  shortName: string;
  abbr: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
}
```

---

## Transition to Licensed Crests

When club licensing is secured:

1. Upload SVG crests to S3: `s3://psl-one-assets/clubs/crests/<club-slug>.svg`
2. Update `Club` model to include `crestUrl: String?`
3. Update `ClubCrest` component to render `next/image` when `crestUrl` is present, fallback to placeholder
4. No code changes required in consuming components — `ClubCrest` handles the switch

```tsx
// ClubCrest component logic
if (club.crestUrl) {
  return <Image src={club.crestUrl} alt={`${club.name} crest`} ... />;
}
return <PlaceholderCrest club={club} size={size} />;
```

---

## World Cup / International Crests

For World Cup 2026:
- National team crests are governed by FIFA/national FA licensing
- Same placeholder approach applies: flag colours + country code abbreviation
- Consider using country flag emoji as supplement to text crest (accessible, widely understood)

Example: South Africa — 🇿🇦 "RSA" on green/yellow/black gradient

---

## Asset Registry (to be filled when licensing complete)

| Club | Crest licensed | License type | Valid until | Cleared by |
|------|---------------|--------------|-------------|-----------|
| Kaizer Chiefs | NO | — | — | — |
| Orlando Pirates | NO | — | — | — |
| Mamelodi Sundowns | NO | — | — | — |
| _(all 16 clubs)_ | NO | — | — | — |
