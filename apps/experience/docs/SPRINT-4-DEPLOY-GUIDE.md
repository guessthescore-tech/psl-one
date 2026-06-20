# Sprint 4 — Vercel Deployment Guide for `apps/experience`

**Story:** STORY-S4-01  
**Agent:** Agent 2 — Preview Hosting and Release Engineering  
**Date:** 2026-06-20  
**Status:** Configuration complete — requires owner to complete Vercel project linking

---

## Overview

`apps/experience` is the standalone premium PSL One fan experience app built with Next.js 15. This guide covers deploying it to Vercel for external stakeholder preview under `DESIGN_REVIEW_DATA` mode.

**This deployment does NOT replace the operational AWS beta (`apps/web`).**

---

## Prerequisites

| Item | Requirement |
|------|------------|
| Vercel account | Owner must have access (guessthescore2@gmail.com or team account) |
| Vercel CLI | `npm i -g vercel` |
| Node | ≥ 20 |
| pnpm | ≥ 9 |
| Repository | Linked to Vercel as a monorepo |

---

## Step 1 — Install Vercel CLI

```bash
npm install -g vercel
```

---

## Step 2 — Login to Vercel

```bash
vercel login
```

Select the GitHub login option and authenticate with the account that owns `guessthescore-tech/psl-one`.

---

## Step 3 — Link the experience project

From the repo root:

```bash
cd ~/Projects/psl-one/apps/experience
vercel link
```

When prompted:
- **Set up and deploy?** No (link only)
- **Which scope?** Select your Vercel team/personal account
- **Link to existing project?** No — Create new project
- **Project name:** `psl-one-experience` (or `pslone-experience`)
- **Root directory:** `apps/experience` (IMPORTANT: must be set to this subdirectory)

> **Monorepo note:** Vercel automatically detects the root of a pnpm workspace monorepo. When linking, confirm the root is set to `apps/experience`, not the workspace root. The `vercel.json` in `apps/experience/` controls the build.

---

## Step 4 — Configure environment variables in Vercel dashboard

Navigate to: Vercel Dashboard → Project `psl-one-experience` → Settings → Environment Variables

Add the following for **Preview** environment:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_DATA_MODE` | `DESIGN_REVIEW_DATA` | MUST be this value for preview |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.beta.pslone.co.za` | Points to beta API (or `http://localhost:4000` for local) |
| `NEXT_PUBLIC_ENVIRONMENT_LABEL` | `vercel-preview` | Shown in the Design Review banner |
| `NEXT_PUBLIC_ANALYTICS_DEBUG` | `false` | Keep false for preview |

> **Security:** Never add sports data provider API keys, wallet adapter secrets, or JWT signing keys to `NEXT_PUBLIC_*` variables. All sensitive credentials must live in server-side env vars behind the NestJS backend.

---

## Step 5 — Deploy preview

```bash
cd ~/Projects/psl-one
vercel --cwd apps/experience
```

Or push to the branch and Vercel will automatically deploy.

---

## Step 6 — (Optional) Enable Vercel password protection

For stakeholder-only access before public launch:

1. Vercel Dashboard → Project → Settings → General
2. Scroll to **Password Protection**
3. Enable and set a password
4. Share the preview URL + password with stakeholders only

---

## Build Configuration (vercel.json)

The `apps/experience/vercel.json` file is committed to source control and controls all build and header settings:

```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm --filter @psl-one/experience build",
  "outputDirectory": "apps/experience/.next",
  "installCommand": "pnpm install --frozen-lockfile",
  "env": {
    "NEXT_PUBLIC_DATA_MODE": "DESIGN_REVIEW_DATA",
    "NEXT_PUBLIC_API_BASE_URL": "https://api.beta.pslone.co.za",
    "NEXT_PUBLIC_ENVIRONMENT_LABEL": "vercel-preview"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex, nofollow" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

Key points:
- `X-Robots-Tag: noindex, nofollow` — prevents search indexing of preview
- All pages are non-indexable by default
- CORS, framing and content-type security headers applied globally

---

## noindex Metadata

The Next.js layout adds noindex via `metadata.robots`. This is in `apps/experience/src/app/layout.tsx`. After implementing, confirm:

```bash
curl -I https://<preview-url>.vercel.app | grep -i x-robots
```

Expected: `x-robots-tag: noindex, nofollow`

---

## Environment Variable Matrix

| Variable | Local dev | Vercel Preview | Production |
|----------|-----------|----------------|------------|
| `NEXT_PUBLIC_DATA_MODE` | `DESIGN_REVIEW_DATA` | `DESIGN_REVIEW_DATA` | `LIVE_BETA_DATA` |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000` | `https://api.beta.pslone.co.za` | `https://api.pslone.co.za` |
| `NEXT_PUBLIC_ENVIRONMENT_LABEL` | `local` | `vercel-preview` | `production` |
| `NEXT_PUBLIC_ANALYTICS_DEBUG` | `true` | `false` | `false` |

---

## What This Deployment Does NOT Do

- Does NOT replace `apps/web` (operational beta on AWS EC2)
- Does NOT activate PSL season
- Does NOT enable production wallet
- Does NOT expose real user data
- Does NOT enable live provider data ingestion
- Does NOT deploy `apps/api` — uses existing beta API

---

## Smoke Checks After Deploy

```bash
# Replace with actual preview URL
PREVIEW_URL=https://psl-one-experience.vercel.app

curl -s "$PREVIEW_URL" | grep -i "PSL One"
curl -I "$PREVIEW_URL" | grep -i "x-robots"
curl -s "$PREVIEW_URL/fantasy" | grep -c "Fantasy"
curl -s "$PREVIEW_URL/matches" | grep -c "Matches"
curl -I "$PREVIEW_URL/api/health" # Should 404 (API is separate)
```

---

## Deployment Status

| Item | Status |
|------|--------|
| `vercel.json` | COMMITTED (`apps/experience/vercel.json`) |
| `.env.example` | COMMITTED (`apps/experience/.env.example`) |
| Vercel project linking | PENDING — requires owner to run `vercel link` |
| Environment variables | PENDING — owner must set in Vercel dashboard |
| Preview deployment | PENDING — after above steps |
| Password protection | RECOMMENDED but optional |
| Preview URL | TBD after linking |

---

## Blocker

**Hard blocker at Step 3**: Vercel project linking requires the owner to authenticate via `vercel login` with the Vercel account associated with `guessthescore-tech/psl-one` on GitHub. This cannot be done autonomously.

**All other Sprint 4 work continues independently of this blocker.**
