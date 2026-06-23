# Sprint 23 — Env File Hygiene

## Finding

The Sprint 22 secret/token scan matched `apps/api/.env` on disk. This raised a concern that the file was tracked in git.

## Investigation Result

`apps/api/.env` is **not tracked in git**. It is correctly excluded by `.gitignore`:

```
apps/*/.env   →   matches apps/api/.env
```

The security scan searches files on disk (not just tracked files). The `.env` file is a local developer configuration file created during initial local setup.

## Confirmation

```bash
git ls-files apps/api/.env
# (empty output — not tracked)

git check-ignore -v apps/api/.env
# .gitignore:17:apps/*/.env   apps/api/.env
```

## Tracked `.env`-related files (intentional)

Only template files are tracked:

| File | Purpose |
|------|---------|
| `.env.example` | Root env template |
| `.env.beta.example` | Beta EC2 env template |
| `.env.compose.example` | Docker Compose env template |
| `apps/experience/.env.example` | Experience app env template |

Template files contain no real values.

## Key Values in `apps/api/.env`

The local `.env` contains development/discovery keys that were used for provider evaluation sprints (Sprints 10–14). These keys:

1. Are for evaluation/trial accounts
2. Were never committed to git
3. Should be rotated if they were ever exposed in any shared channel
4. Must not appear in frontend code (`NEXT_PUBLIC_*` prefix is forbidden)

**Owner action:** Rotate any provider keys that were shared outside the local development environment.

## No Remediation Required

No git history changes are needed. The file is correctly gitignored. No tracked `.env` files contain real values.

## Future Prevention

`.gitignore` already blocks:
- `apps/*/.env`
- `.env` (root)
- `.env.*` variants (except `.env.*.example`)

No changes to `.gitignore` are required.
