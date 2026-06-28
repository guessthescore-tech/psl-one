# PSL One Portal Review and Data Handover

**Date:** 2026-06-29  
**Scope:** Admin portal, sponsor portal, club portal, seeded identities, missing data sources

## Seeded identities

The API seed now creates three login-capable identities plus the required portal linkage:

- `admin@pslone.co.za` - `PSL_ADMIN`
- `obe@digisphere.co.za` - `FAN` with a `FanProfile`
- `guessthescore2@gmail.com` - `SPONSOR` with a `SponsorMembership`

The seed password is read from `apps/api/.env` via `SEED_PLATFORM_USERS_PASSWORD`. The local fallback is temporary and should stay out of git history.

## Portal review summary

### Admin portal

Strengths:

- RBAC is explicit on admin routes.
- Audit logging is treated as mandatory.
- Safety banners and readiness pages are already in place.
- The admin shell is more mature than the user-facing portal because it is already framed around operational checks.

Gaps:

- Most admin screens are still static or demo-driven.
- Several “overview” pages are presentation layers without full CRUD back-end coverage.
- Provider readiness is visible, but operational action paths are still incomplete.
- The admin experience is useful for monitoring, not yet for running a league at stakeholder-grade depth.

### Sponsor portal

Strengths:

- Sponsor scoping is DB-backed through `SponsorMembership`.
- Non-financial reward rules are enforced in the service layer.
- The portal separates campaign, audience, activation, rewards, and analytics concerns.

Gaps:

- Audience segmentation is still shallow.
- Asset management is still planned rather than operationally complete.
- Billing is intentionally invoice-only and off-platform.
- The portal is structurally sound, but it still reads like a controlled beta rather than an enterprise partner console.

### Club portal

Strengths:

- Club scoping is DB-backed through `ClubMembership`.
- The service layer already prevents cross-club access.
- Profile, squad, fixtures, content, sponsors, and campaigns are split into separate views.

Gaps:

- Fan-to-club relationship data is still minimal.
- Several club pages are placeholders with static counts or empty states.
- The portal does not yet feel like an operating system for club staff because it lacks richer workflows, approvals, collaboration, and live data.

## Where the platform is relative to EPL-grade stakeholder tooling

The current structure is directionally right, but the gap is depth:

- We have role separation.
- We have scope isolation.
- We have safety constraints.
- We do not yet have enough live operational data, workflow automation, and stakeholder-grade reporting.

That means the architecture is closer to a safe beta control plane than a full production stakeholder platform.

## What will let the platform scale across multiple seasons and future sports

The base is usable if we keep enforcing these rules:

- Every competition fact should be season-scoped.
- Provider ingestion should be routed by competition, not hard-coded to one sport.
- Rules, pricing, and scoring should remain configuration-driven.
- Historical seasons must be preserved and immutable.
- Fan-facing records should never assume a single active season.
- Sport-specific logic should live behind adapters or bounded contexts, not inside UI pages.

The next hardening step is to keep the season and sport dimensions explicit in every model and every read path, then add per-sport provider adapters later without changing the portal contract.

## Why `/players` is empty on the screen

The page is currently in live mode when `NEXT_PUBLIC_DATA_MODE` is not `DESIGN_REVIEW_DATA`, but the live player pool is returning empty because the backing provider/data feed is not configured or not supplying rows.

This is not a visual bug. It is a data availability problem.

## Candidate resources for missing football data

These are research sources only. They are not a production ingestion decision.

- [wheniskickoff data](https://wheniskickoff.com/data/)
- [Apify World Cup 2026 live scores article](https://dev.to/fatihbuilds/i-built-a-free-world-cup-2026-live-scores-api-on-apify-heres-how-576h)
- [macOS World Cup widget article](https://dev.to/alexdesign420/i-built-a-live-fifa-world-cup-2026-desktop-widget-for-macos-526h)
- [Discovery search for a free World Cup fantasy API](https://yandex.com/search?text=free++fifa+world+2026+fantasy+league+api&lr=21438)

## Practical next step

If the goal is immediate on-screen data, use design-review data locally until a provider is selected and populated. If the goal is production-like live data, wire a real provider behind the current ingestion/readiness surface and keep the portal in beta-safe mode until the source is reliable.
