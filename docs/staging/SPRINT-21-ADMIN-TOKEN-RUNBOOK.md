# Sprint 21 — Admin Token Runbook

## Overview

The staging smoke tools require a valid admin JWT (`ADMIN_TOKEN`) to test authenticated endpoints. This runbook explains how to safely obtain, use, and revoke an admin token against the beta staging environment.

**Critical:** The token must never be committed, logged, or printed in shared output.

---

## Why the Token Is Needed

Sprint 19 smoke tools test:
- **Unauthenticated paths** — admin endpoints should return 401/403 (no token needed)
- **Authenticated paths** — admin endpoints should return non-5xx with a valid admin JWT

The second category requires a JWT signed with the staging `JWT_SECRET`.

---

## Why Tokens Cannot Be Auto-Provisioned

The seeded admin user (`seed-admin@psl-one.internal`) has a placeholder password hash (`$SEED_NOT_A_REAL_PASSWORD`). This is intentional — the seed user is a system actor, not a login user. No known password exists for it.

To obtain a token, either:
1. Create a temporary admin user with a known password (see below)
2. Generate a JWT directly using the `JWT_SECRET` (advanced, see below)

---

## Method 1: Create a Temporary Smoke Admin User

Run on the beta EC2 via SSM or direct SSH:

```bash
# Step 1: Hash a temporary password (on EC2)
TEMP_PW_HASH=$(docker run --rm node:22-alpine \
  sh -c "npm install --silent bcryptjs@2 && node -e \"const b=require('bcryptjs'); console.log(b.hashSync('SmokeAdmin2026!', 10));\"" 2>/dev/null)

# Step 2: Insert the user via Prisma (in the API container)
docker exec psl-one-beta-api-1 \
  node -e "
    const { PrismaClient } = require('@prisma/client');
    const p = new PrismaClient();
    p.user.upsert({
      where: { email: 'smoke-runner@psl-one.internal' },
      create: { email: 'smoke-runner@psl-one.internal', passwordHash: process.env.HASH, role: 'PSL_ADMIN', dateOfBirth: new Date('1990-01-01'), isVerified: true, isActive: true },
      update: { passwordHash: process.env.HASH }
    }).then(() => p.\$disconnect())
  " HASH="$TEMP_PW_HASH"

# Step 3: Login to get token (output contains access_token — do not share)
# Extract and export WITHOUT printing:
export ADMIN_TOKEN=$(curl -sf -X POST http://127.0.0.1/auth/login \
  -H 'Content-Type: application/json' \
  -H 'Host: api.staging.pslone.co.za' \
  -d '{"email":"smoke-runner@psl-one.internal","password":"SmokeAdmin2026!"}' \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['accessToken'])")

# Verify presence without printing:
node -e "const t=process.env['ADMIN_TOKEN']||''; console.log('ADMIN_TOKEN: ' + (t.length>20 ? 'PRESENT_REDACTED length='+t.length : 'MISSING'));"
```

---

## Method 2: Generate JWT Directly (Advanced)

If `JWT_SECRET` is accessible from SSM:

```bash
# Get JWT_SECRET from SSM (never print it)
export JWT_SECRET=$(aws ssm get-parameter \
  --name /psl-one/beta/jwt-secret \
  --with-decryption \
  --query Parameter.Value \
  --output text \
  --region af-south-1 2>/dev/null)

# Generate smoke token
export ADMIN_TOKEN=$(node -e "
  const h = Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');
  const p = Buffer.from(JSON.stringify({sub:'smoke-runner',role:'PSL_ADMIN',email:'smoke@internal',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600})).toString('base64url');
  const {createHmac} = require('crypto');
  const s = createHmac('sha256', process.env.JWT_SECRET).update(h+'.'+p).digest('base64url');
  console.log(h+'.'+p+'.'+s);
")

# Verify without printing
node -e "const t=process.env['ADMIN_TOKEN']||''; console.log('ADMIN_TOKEN: ' + (t.length>20 ? 'PRESENT_REDACTED length='+t.length : 'MISSING'));"
```

---

## Verifying Token Presence (Safe)

```bash
node - <<'NODE'
const token = process.env.ADMIN_TOKEN || '';
console.log(`ADMIN_TOKEN: ${token.length > 20 ? `PRESENT_REDACTED length=${token.length}` : 'MISSING'}`);
NODE
```

---

## Running Smoke Tools After Token Obtained

```bash
export BASE_URL="http://127.0.0.1"  # or http://api:4000 from within Docker network
export DRY_RUN_ONLY=true
export ALLOW_WRITE_SMOKE=false
# ADMIN_TOKEN already set above

node tools/staging/sprint-19-admin-rbac-smoke.mjs
node tools/staging/sprint-19-parse-ingestion-smoke.mjs
node tools/staging/sprint-19-fixture-publication-smoke.mjs
node tools/staging/sprint-19-psl-preflight-smoke.mjs
node tools/staging/sprint-19-admin-smoke.mjs
```

---

## After Smoke Completion

Delete the temporary smoke user:

```bash
docker exec psl-one-beta-api-1 node -e "
  const { PrismaClient } = require('@prisma/client');
  const p = new PrismaClient();
  p.user.delete({ where: { email: 'smoke-runner@psl-one.internal' } }).then(() => p.\$disconnect())
"
```

---

## Token Exposure Protocol

If the admin token is accidentally printed or committed:

1. It expires automatically after 1 hour (standard JWT `exp`)
2. To invalidate immediately: rotate `JWT_SECRET` in SSM and restart the API container
3. Delete the smoke user from the database
4. Report the exposure to the owner

---

## Safety Constraints

- `ADMIN_TOKEN` must never be committed to git
- `ADMIN_TOKEN` must never appear in docs, PR body, logs, or screenshots
- `JWT_SECRET` must never be printed or committed
- All smoke tools run with `DRY_RUN_ONLY=true` and `ALLOW_WRITE_SMOKE=false`
- PSL activation does NOT occur during smoke runs
- Wallet remains sandbox-only during all smoke runs
- No real-money functionality
