# PSL One — Frontend Architecture

**Purpose:** Next.js app structure, routing conventions, and API integration patterns  
**Audience:** Frontend engineers  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Framework

Next.js 14 App Router with TypeScript, Tailwind CSS, and React 18 Server Components.

- **Port:** 3001 (`next dev -p 3001`)
- **Root:** `apps/web/`
- **App directory:** `apps/web/src/app/`
- **Lib directory:** `apps/web/src/lib/`
- **Components directory:** `apps/web/src/components/` (shared components)

---

## Routing Structure

337 pages total as of STORY-39. Two main route segments:

### Fan Routes

`/apps/web/src/app/(fan)/`

| Route prefix | Domain |
|-------------|--------|
| `/` | Home / dashboard |
| `/predictions` | Guess the Score |
| `/fantasy` | Fantasy Football |
| `/social-predictions` | Social Prediction Gaming |
| `/social-challenges` | Challenge listings |
| `/matches` | Live match feed |
| `/match-centre` | Live Match Centre |
| `/leaderboards` | Fan leaderboards |
| `/achievements` | Badges and achievements |
| `/rewards` | Reward readiness |
| `/feed` | Activity feed |
| `/profile` | User profile |
| `/notifications` | Notifications inbox |
| `/clubs` | Club experience |
| `/media` | Media and news |
| `/player-stats` | Player match stats |
| `/beta` | Beta landing page |

### Admin Routes

`/apps/web/src/app/admin/`

| Route prefix | Domain |
|-------------|--------|
| `/admin` | Dashboard |
| `/admin/seasons` | Season management |
| `/admin/competitions` | Competition management |
| `/admin/clubs` | Club management |
| `/admin/fixtures` | Fixture management |
| `/admin/fixture-import` | Fixture import pipeline |
| `/admin/gameweeks` | Gameweek management |
| `/admin/players` | Player management |
| `/admin/predictions` | Prediction settle/void |
| `/admin/fantasy` | Fantasy scoring |
| `/admin/fantasy-rules` | Fantasy rules config |
| `/admin/fantasy-calibration` | Provisional player prices |
| `/admin/squad-import` | Squad import |
| `/admin/season-switching` | Season switching gate |
| `/admin/leaderboards` | Leaderboard management |
| `/admin/achievements` | Achievement management |
| `/admin/rewards` | Rewards management |
| `/admin/campaigns` | Campaign management |
| `/admin/media` | Media management |
| `/admin/wallet` | Wallet configuration |
| `/admin/live-match` | Live match session management |
| `/admin/match-centre` | Admin Match Centre |
| `/admin/social-predictions` | Social prediction admin |
| `/admin/player-stats` | Player stats entry |
| `/admin/operations` | Admin operations control plane |
| `/admin/beta-feedback` | Beta feedback management |
| `/admin/beta-launch` | Beta launch readiness |
| `/admin/notifications` | Notification management |
| `/admin/activity-feed` | Activity feed admin |

---

## API Integration Pattern

All API calls are made from client components using typed client functions in `apps/web/src/lib/`.

### Base URL

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
```

Note: The environment variable is `NEXT_PUBLIC_API_BASE_URL`, not `NEXT_PUBLIC_API_URL`. The default is `http://localhost:4000`.

### Client File Pattern

Each domain has its own client file in `apps/web/src/lib/`:

```
apps/web/src/lib/
  auth-client.ts
  fantasy-client.ts
  predictions-client.ts
  social-prediction-client.ts
  match-centre-client.ts
  beta-launch-client.ts
  admin-match-centre-client.ts
  admin-social-prediction-client.ts
  ...
```

Each file exports typed async functions:

```typescript
export async function adminGetReadiness(seasonId: string, token: string) {
  const res = await fetch(
    `${API_BASE}/admin/beta-launch/${seasonId}/readiness`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

### Auth Token in Pages

Pages extract the JWT token from `localStorage` (browser-side). All API calls that require auth pass `Authorization: Bearer <token>` header.

No server-side session or cookie-based auth in current implementation. Sprint 3 will add `httpOnly` cookies.

---

## Page Pattern

All pages are React client components (`'use client'`) using `useState` and `useEffect` for data fetching.

```typescript
'use client';
import { useState, useEffect } from 'react';
import { someClientFn } from '@/lib/some-client';

export default function SomePage() {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token') ?? '';
    someClientFn(token).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{/* render */}</div>;
}
```

---

## TypeScript Strict Mode

`apps/web/tsconfig.json` has `exactOptionalPropertyTypes: true`. This means:

- Never assign `undefined` to an optional field — use spread pattern: `{ ...base, ...(condition ? { field: val } : {}) }`
- JSX conditionals where the value is `unknown` type require `!!value` (double negation) to force `boolean`, otherwise TypeScript rejects it as not assignable to `ReactNode`
- Dynamic object access like `obj['key']` returns `unknown` under strict mode — cast or use type assertion when rendering

---

## Styling

Tailwind CSS utility classes only. No custom CSS modules (except global `globals.css`). Dark mode is used in some admin pages — `bg-gray-900`, `text-white` patterns.

---

## Build

```bash
pnpm --filter @psl-one/web build
```

Build output: `.next/` directory. Do not commit `.next/`.

TypeScript checking during build: `next build` runs type checking. All type errors are blocking.

---

## No Business Logic in Frontend

**Explicit project rule:** Never store business logic in frontend.

- No validation logic duplicated from the API
- No domain calculations (points, budgets, dates) performed in the browser
- API is authoritative — frontend displays API responses only
- Role checks are display-only hints — never rely on frontend role checks for access control
