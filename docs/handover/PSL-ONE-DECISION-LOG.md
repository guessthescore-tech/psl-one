# PSL One — Decision Log
**Last updated:** 2026-06-19 (STORY-FE-FANTASY-AGENTIC-01)

Each entry records: Date, Decision, Context, Options, Chosen, Reason, Consequences, Revisit trigger.

---

## DEC-001: apps/web remains stable engineering beta

**Date:** 2026-06-17
**Decision:** `apps/web` is the stable engineering beta and must not be modified during creative product work.
**Context:** Multiple frontend stories added social sharing, navigation, and design systems to `apps/web`. The operational beta is live at `16.28.84.11` with real seeded data.
**Options considered:**
1. Continue iterating `apps/web` as both engineering and creative workspace
2. Separate creative product into a new app with its own package
**Chosen:** Option 2
**Reason:** Creative iteration would destabilise the beta. Separate app allows design experimentation without risk to API smoke checks.
**Consequences:** Two frontend apps to maintain. `apps/web` and `apps/experience` share no code and are independently deployable.
**Revisit trigger:** When `apps/experience` matures to production quality, consider whether to merge or keep separate Vercel deployments.

---

## DEC-002: apps/experience is the dedicated creative product

**Date:** 2026-06-19
**Decision:** `apps/experience` is the premium creative frontend for PSL One, kept separate from the engineering beta.
**Context:** The creative product requires WC 2026 design-review data, independent design tokens, and freedom to prototype without engineering constraints.
**Options considered:**
1. Design Lab routes within `apps/web` (gate with env var)
2. Standalone Next.js app at `apps/experience`
**Chosen:** Option 2
**Reason:** Design Lab was already used for prototyping. A full standalone app allows independent routing, layout, and Vercel configuration.
**Consequences:** `apps/experience` has its own `package.json`, Tailwind config, and design tokens (`exp-*` prefix to avoid conflicts with `apps/web`).
**Revisit trigger:** Owner approves visual direction and commits to Vercel — at that point align CI/CD and Vercel project configuration.

---

## DEC-003: Vercel proposed for apps/experience preview hosting

**Date:** 2026-06-18 (STORY-FE-VISION-01)
**Decision:** `apps/experience` will be hosted on Vercel for preview, separate from the AWS-hosted API and operational beta.
**Context:** `apps/web` had `vercel.json` added in STORY-FE-VISION-01. `apps/experience` needs its own Vercel project.
**Options considered:**
1. Same Vercel project as `apps/web` with separate root directory
2. Dedicated Vercel project for `apps/experience`
3. AWS CloudFront + ECS (same infra as API)
**Chosen:** Option 2 (pending owner approval)
**Reason:** Vercel's Next.js integration is optimal for preview deploys. Keeps creative iteration loop separate from AWS infrastructure cycle.
**Consequences:** Two Vercel projects to manage. API still on AWS. CORS and API URLs must be environment-variable driven.
**Revisit trigger:** If provider API integration moves to production — at that point CloudFront distribution for `apps/experience` may be more appropriate.

---

## DEC-004: AWS remains the API/backend environment

**Date:** 2026-06-15 (S3-INFRA-01)
**Decision:** All API, database, and event infrastructure remains AWS-native (ECS Fargate / EC2, RDS, Kafka, Redis).
**Context:** 39 Prisma migrations, 12 Terraform modules, existing ECR repos and OIDC deploy role.
**Options considered:** None actively considered — architecture already committed.
**Chosen:** AWS
**Reason:** Domain-driven, event-driven architecture already established. Too late to switch. AWS af-south-1 (Cape Town) reduces latency for South African fans.
**Consequences:** Frontend teams must use API routes — no direct DB access from browser.
**Revisit trigger:** Cost escalation or latency issues beyond Africa. Not expected in Sprint 3-4.

---

## DEC-005: World Cup 2026 remains the active beta season

**Date:** 2026-06-17 (S3-INFRA-02G-C)
**Decision:** WC 2026 is the active season in the beta database. PSL season is NOT activated.
**Context:** Seed script applied WC2026 data idempotently. PSL season requires official data, licensing, and calibration (STORY-29/30).
**Options considered:**
1. Activate PSL season immediately for testing
2. Keep WC 2026 as test season, approach PSL activation separately
**Chosen:** Option 2
**Reason:** PSL data requires official provider agreement. WC 2026 is safe, internationally recognisable test data. Beta testers can evaluate the product without PSL data licensing risk.
**Consequences:** All design review data references WC 2026 national teams. PSL club pages show seeded data but are not live-connected.
**Revisit trigger:** PSL data provider selected AND commercial licence accepted AND PSL competition rights confirmed.

---

## DEC-006: Provider integration must use a backend adapter

**Date:** 2026-06-19 (STORY-FE-PREMIUM-01A)
**Decision:** All sports data provider API calls must go through a server-side NestJS adapter. No provider keys in browser JavaScript.
**Context:** Phase 8 of this story discovered the PSL league ID via a backend-only discovery script. The key was loaded from `API_FOOTBALL_KEY` env var, never exposed to the browser.
**Options considered:**
1. Call provider API directly from Next.js frontend (NEXT_PUBLIC_ key)
2. Proxy all calls through NestJS backend adapter
3. Server-side Next.js API routes (intermediate)
**Chosen:** Option 2
**Reason:** Security: keys cannot be exposed to browser bundles. Architecture: existing NestJS import pipeline (FixtureImportBatch, SquadImport, etc.) already exists. Domain: provider data must be validated before publish.
**Consequences:** Adds latency vs direct fetch. Requires rate-limit and caching layer in NestJS. Enables audit trail.
**Revisit trigger:** Never — this is a hard security requirement.

---

## DEC-007: No provider key in frontend code (hard constraint)

**Date:** 2026-06-19 (STORY-FE-PREMIUM-01A)
**Decision:** `NEXT_PUBLIC_API_FOOTBALL_KEY` must never exist. API keys must never appear in browser-accessible JavaScript.
**Context:** Instruction in STORY-FE-PREMIUM-01A: "Never use NEXT_PUBLIC_API_FOOTBALL_KEY. Never expose the key in browser JavaScript."
**Options considered:** None — this is a hard constraint.
**Chosen:** Server-side only
**Reason:** Any `NEXT_PUBLIC_` prefixed variable is embedded in the browser bundle and visible to users. Provider terms prohibit key sharing.
**Consequences:** All data fetching for provider data must happen on the server.
**Revisit trigger:** Never.

---

## DEC-008: No unlicensed imagery

**Date:** 2026-06-19 (STORY-FE-PREMIUM-01A)
**Decision:** All imagery in `apps/experience` must use Picsum placeholders until licensed photography is procured.
**Context:** `expImg()` uses `https://picsum.photos/seed/{seed}/{w}/{h}` for all images. Seeds describe the intended subject for production photography handoff.
**Options considered:**
1. Use Unsplash/Google Images (unlicensed)
2. Use Picsum placeholders (CC0)
3. Procure licensed PSL photography immediately
**Chosen:** Option 2 (with Option 3 as the production target)
**Reason:** Picsum is CC0 and safe for development. Production photography requires contracts with photographers and/or the PSL media team.
**Consequences:** All Picsum URLs must be replaced before any public launch. `next.config.ts` `domains` array must be updated.
**Revisit trigger:** Engagement with PSL media rights team or stock photography provider.

---

## DEC-009: No production live ingestion until licensing and coverage are approved

**Date:** 2026-06-19 (STORY-FE-PREMIUM-01A)
**Decision:** No provider may send live data into the PSL One database until: provider selected, commercial licence accepted, PSL competition rights confirmed, data quality reviewed, security review passed.
**Context:** API-Football and other providers are technically available but legally unconfirmed for commercial redistribution.
**Options considered:** Activate provider immediately vs. follow the licensing gate.
**Chosen:** Follow the licensing gate (docs/data/PSL-DATA-LICENSING-GATE.md)
**Reason:** Commercial redistribution of football data without authorisation violates provider terms and potentially PSL broadcast rights.
**Consequences:** Provider data integration is deferred. Design review uses mock WC 2026 data.
**Revisit trigger:** Owner completes PSL-DATA-LICENSING-GATE.md checklist.

---

## DEC-010: apps/experience design data uses WC 2026 national teams, not PSL clubs

**Date:** 2026-06-19 (STORY-FE-PREMIUM-01A)
**Decision:** `apps/experience` DESIGN_REVIEW_DATA uses FIFA World Cup 2026 national teams, not PSL clubs.
**Context:** PSL clubs are seeded in `apps/api` database but PSL provider data is not yet licensed. WC 2026 is internationally recognisable for design reviews with stakeholders and sponsors.
**Options considered:**
1. Use PSL club names and fabricated data
2. Use WC 2026 national teams (well-known, no PSL data dependency)
**Chosen:** Option 2
**Reason:** Design reviews with international stakeholders benefit from recognisable teams. Avoids risk of PSL club branding being presented without commercial authorisation.
**Consequences:** The creative product does not currently reflect PSL club visual identity. PSL club colours exist in the database (16 clubs seeded) but are not displayed in `apps/experience` yet.
**Revisit trigger:** PSL data provider selected and club identity assets confirmed.

---

## DEC-011: All Phosphor icons in apps/experience must use /dist/ssr

**Date:** 2026-06-19 (STORY-FE-FANTASY-AGENTIC-01)
**Decision:** Every `@phosphor-icons/react` import in `apps/experience` must use `@phosphor-icons/react/dist/ssr`, never the bare package.
**Context:** Next.js 15 statically pre-renders all pages. The non-SSR Phosphor package uses `createContext()` at module level, which fails during static generation.
**Options considered:**
1. Use the non-SSR package with `"use client"` directives everywhere
2. Use `/dist/ssr` which is pre-rendering safe
**Chosen:** Option 2 — `/dist/ssr` on all imports
**Reason:** The non-SSR package's `createContext()` call fails at build time even for Client Components in Next.js 15. 28 files were fixed in commit `a40526d`.
**Consequences:** All future additions of Phosphor icons must import from `/dist/ssr`.
**Revisit trigger:** Phosphor Icons releases a version that does not use `createContext()` at module level. Until then, `/dist/ssr` is mandatory.

---

## DEC-012: useSearchParams must be wrapped in Suspense in Next.js 15

**Date:** 2026-06-19 (STORY-FE-FANTASY-AGENTIC-01)
**Decision:** Any page component that calls `useSearchParams()` must extract the logic into a child component and wrap it in `<Suspense>`.
**Context:** Next.js 15 static pre-rendering requires `useSearchParams()` to have a Suspense boundary. Without it, the build throws an error and the page fails to export.
**Options considered:**
1. Mark entire page as dynamic with `export const dynamic = 'force-dynamic'`
2. Extract component and wrap in `<Suspense>`
**Chosen:** Option 2 — component extraction + Suspense
**Reason:** Option 2 keeps pages statically pre-rendered where possible. The inner component handles the dynamic search params; the outer page is still static.
**Consequences:** `/sign-in` and `/reset-password` use this pattern. Any future pages using `useSearchParams()` must follow it.
**Revisit trigger:** Next.js changes its static rendering behaviour for `useSearchParams()`.
