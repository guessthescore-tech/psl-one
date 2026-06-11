# Next Session — Start Here

## Accepted Work

| Item | State |
|---|---|
| Issue 0 — monorepo foundation | Accepted |
| STORY-01 — Fan Auth | Accepted |
| STORY-02 — Football Core MVP | Accepted |
| STORY-03 — Fan Profile & Preferences | Accepted |

## Local Runtime

- Homebrew PostgreSQL 16
- Database: `psl_identity_dev`
- Docker not used
- API: http://localhost:4000
- Web: http://localhost:3001

## Applied Migrations

- `20260609045934_init_auth_schema`
- `20260609054914_add_football_core`
- `20260609063037_add_fan_profile`

## Seed

```bash
pnpm --filter @psl-one/api db:seed
```

FIFA World Cup 2026 beta data. Auth users are not seeded — register via API.

## Verified Endpoints

**Auth:** `/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`, `/auth/password-reset/*`

**Football:** `/football/seasons/active`, `/football/teams`, `/football/fixtures`, `/football/standings`, `/football/match-centre/:fixtureId`

**Profile (all require Bearer token):** `/profile/me` (GET/PATCH), `/profile/preferences` (GET/PATCH), `/profile/summary` (GET)

## Next Issue

**STORY-04** — (your choice, suggested: Live Fixture Feed / Kafka event publishing / Fan Fantasy MVP)

## Do Not

- Do not run AWS commands
- Do not run Terraform
- Do not edit `.next`
- Do not start fantasy or wallet without explicit instruction
