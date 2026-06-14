# PSL One — Frontend Engineering Guide

**Purpose:** Next.js patterns, conventions, and rules for web development  
**Audience:** Frontend engineers  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Project Structure

```
apps/web/
  src/
    app/
      (fan)/               # Fan routes
        predictions/
        fantasy/
        ...
      admin/               # Admin routes
        seasons/
        fixtures/
        ...
      layout.tsx           # Root layout
      page.tsx             # Home page
    lib/
      auth-client.ts       # API client functions
      fantasy-client.ts
      predictions-client.ts
      ...
    components/            # Shared UI components
  public/                  # Static assets
  next.config.js
  tsconfig.json
```

---

## Page Pattern

All pages are React client components with direct API calls via `useEffect`:

```typescript
'use client';
import { useState, useEffect } from 'react';
import { getMyPredictions } from '@/lib/predictions-client';

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') ?? '';
    getMyPredictions(token)
      .then(setPredictions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  return <div>{/* render predictions */}</div>;
}
```

---

## Client Function Pattern

All API calls go through typed client functions in `apps/web/src/lib/`:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export async function getMyPredictions(token: string) {
  const res = await fetch(`${API_BASE}/predictions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createPrediction(
  token: string,
  data: { fixtureId: string; homeScore: number; awayScore: number }
) {
  const res = await fetch(`${API_BASE}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

**Important:** Environment variable is `NEXT_PUBLIC_API_BASE_URL`, NOT `NEXT_PUBLIC_API_URL`.

---

## Auth Token

Token lives in `localStorage`:

```typescript
// Store on login
localStorage.setItem('token', tokenFromApi);

// Read in pages
const token = localStorage.getItem('token') ?? '';

// Clear on logout
localStorage.removeItem('token');
```

Sprint 3 will migrate to `httpOnly` cookies for production security.

---

## TypeScript Strict Mode

`exactOptionalPropertyTypes: true` is enabled. Follow these patterns:

### Conditional optional properties

```typescript
// ❌ WRONG — undefined assignment not allowed
const obj: { name?: string } = { name: undefined };

// ✓ CORRECT — spread pattern
const obj = { ...base, ...(condition ? { name: value } : {}) };
```

### JSX with unknown types

When API responses are typed as `unknown` (e.g., `data['field']`), use double negation:

```typescript
// ❌ WRONG — unknown not assignable to ReactNode
{data['approvedAt'] && <p>Approved</p>}

// ✓ CORRECT — double negation forces boolean
{!!data['approvedAt'] && <p>Approved</p>}
```

---

## Styling

Tailwind CSS only. No inline `style={{}}` for layout. No CSS Modules except `globals.css`.

Common patterns:

```tsx
// Page wrapper
<div className="min-h-screen bg-gray-50 p-6">

// Admin dark theme
<div className="min-h-screen bg-gray-900 text-white p-6">

// Card
<div className="bg-white rounded-lg shadow p-4">

// Status badge
<span className={`px-2 py-1 rounded text-sm ${
  status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
}`}>{status}</span>

// Loading state
<div className="p-4 text-gray-500">Loading...</div>

// Error state
<div className="p-4 text-red-500">{error}</div>
```

---

## No Business Logic in Frontend

**Explicit project rule.** The frontend must not:

- Validate transfer budgets or squad limits (API does this)
- Calculate Fantasy points or leaderboard scores
- Determine if a fixture window is open
- Make role-based decisions that affect data access

Frontend role checks are display-only hints (`if (role === 'PSL_ADMIN') showAdminLink()`). The API is always authoritative.

---

## Admin Pages

Admin pages follow the same pattern as fan pages, but add admin-specific navigation and use admin API routes:

```typescript
// Always verify role from API response, not local storage
const token = localStorage.getItem('token') ?? '';
const profile = await getUserProfile(token);
if (profile.role !== 'PSL_ADMIN') router.push('/');
```

Admin pages live in `apps/web/src/app/admin/`.

---

## Adding a New Page

1. Create `apps/web/src/app/<route>/page.tsx`
2. Add `'use client'` directive
3. Add client function to appropriate `apps/web/src/lib/<domain>-client.ts`
4. Add navigation link if needed

Do not create new layout files unless the route segment needs its own layout shell.

---

## Building and Type Checking

```bash
# Type check without building
pnpm --filter @psl-one/web typecheck

# Build (includes type check)
pnpm --filter @psl-one/web build
```

All type errors are blocking. Fix before reporting work done.
