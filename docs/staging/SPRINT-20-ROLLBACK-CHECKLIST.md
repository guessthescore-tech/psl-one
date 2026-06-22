# Sprint 20 — Rollback Checklist

## When to Roll Back

Roll back if:
1. API `/health/ready` fails after deployment
2. Smoke tests fail with non-transient errors
3. Security concern discovered (e.g., key exposure via logs)
4. Unintended DB writes detected post-deployment

---

## Rollback Procedure

### Step 1: Identify rollback SHA

The deployment workflow records the previous SHA in `rollback_sha` output and in SSM `/psl-one/beta/git-sha` (overwritten on deploy).

Check prior deploy SHAs:
- Sprint 17 (last confirmed good): `26916a7...` (full SHA from GHA run 27683700325)

### Step 2: Trigger rollback deployment

```bash
gh workflow run deploy-beta-ec2.yml \
  --repo guessthescore-tech/psl-one \
  --field git_sha=<rollback_sha> \
  --field run_migrations=false \
  --field confirm=DEPLOY
```

Use `run_migrations=false` for rollback to avoid re-running migrations.

### Step 3: Verify rollback

```bash
curl -s http://api.staging.pslone.co.za/health/ready
```

Expected: `{"status":"ok"}` or similar.

---

## Database Rollback

Sprint 20 adds 0 migrations. No database rollback is needed.

If Sprint 18/19 migrations need to be reversed (they add no migrations), no DB action is required.

---

## What Is NOT Rolled Back

- PSL activation status — PSL was not activated; nothing to roll back
- Wallet sandbox status — always sandbox; nothing to roll back
- Provider keys in SSM — unchanged by this deployment

---

## Code Rollback (if PR was merged)

Sprint 20 contains only docs/tests. To roll back:

```bash
git revert <sprint-20-merge-commit> --no-commit
git commit -m "revert: roll back Sprint 20 staging docs"
git push origin main
```

No API endpoints or frontend pages are affected.
