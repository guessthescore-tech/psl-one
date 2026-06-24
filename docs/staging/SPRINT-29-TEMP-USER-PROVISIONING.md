# Sprint 29 Temporary Smoke User Provisioning

**Date:** 2026-06-24
**Environment:** Beta EC2 (i-0a5f16539c9626f90, af-south-1)
**Purpose:** Document how temporary smoke users are provisioned, scoped, and cleaned up

---

## Overview

Two temporary smoke users are created for Sprint 29 cross-tenant membership smoke:

| User | Role | Scope | Email |
|---|---|---|---|
| CLUB_ADMIN smoke | CLUB_ADMIN | ClubMembership → ALLOWED_TEAM_ID | `sprint29-club-admin-smoke@psl-one.internal` |
| SPONSOR smoke | SPONSOR | SponsorMembership → ALLOWED_SPONSOR_ID | `sprint29-sponsor-smoke@psl-one.internal` |

These users exist **only for the duration of the smoke run** and are deleted immediately
after (see `SPRINT-29-TEMP-USER-CLEANUP-EVIDENCE.md`).

---

## Provisioning Approach

All provisioning runs **on the beta EC2** via SSM commands. No passwords or JWTs are
printed to SSM output or committed to the repository. All secrets are stored in
`/tmp/sprint29/` with `chmod 600`.

### Step 1: Create secure working directory on EC2

```bash
aws ssm send-command \
  --instance-ids i-0a5f16539c9626f90 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["mkdir -p /tmp/sprint29 && chmod 700 /tmp/sprint29 && echo WORKSPACE_READY"]' \
  --region af-south-1 --output json
```

### Step 2: Login as PSL_ADMIN and store token

```bash
# Credentials from secure staging config (never printed to stdout)
aws ssm send-command \
  --instance-ids i-0a5f16539c9626f90 \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "set -euo pipefail",
    "TOKEN=$(curl -sf -X POST http://localhost:3000/auth/login -H '"'"'Content-Type: application/json'"'"' -d @/tmp/sprint29/admin_creds.json | python3 -c '"'"'import sys,json; print(json.load(sys.stdin)[\"access_token\"])'"'"')",
    "echo \"$TOKEN\" > /tmp/sprint29/admin_token && chmod 600 /tmp/sprint29/admin_token",
    "echo ADMIN_TOKEN_STORED=OK"
  ]' \
  --region af-south-1 --output json
```

### Step 3: Create smoke users via Prisma (docker exec)

```bash
# Uses bcryptjs (already installed in API image) to hash passwords
# Password generated randomly per run — never committed
# CLUB_ADMIN smoke user
docker exec $(docker ps -qf name=psl-one-api) node -e "
  const {PrismaClient}=require('@prisma/client');
  const bcrypt=require('bcryptjs');
  const p=new PrismaClient();
  bcrypt.hash(process.env.CLUB_SMOKE_PASS,12).then(h =>
    p.user.create({data:{
      email:'sprint29-club-admin-smoke@psl-one.internal',
      passwordHash:h,
      role:'CLUB_ADMIN',
      isActive:true
    }}).then(u=>{
      console.log('CLUB_SMOKE_USER_ID='+u.id);
      p.\$disconnect();
    })
  );
"
```

### Step 4: Create ClubMembership and SponsorMembership

```bash
# ClubMembership
docker exec $(docker ps -qf name=psl-one-api) node -e "
  const {PrismaClient}=require('@prisma/client');
  const p=new PrismaClient();
  p.clubMembership.create({
    data:{userId:process.env.CLUB_SMOKE_USER_ID,teamId:process.env.ALLOWED_TEAM_ID,isActive:true}
  }).then(m=>{console.log('CLUB_MEMBERSHIP_ID='+m.id);p.\$disconnect()});
"

# SponsorMembership
docker exec $(docker ps -qf name=psl-one-api) node -e "
  const {PrismaClient}=require('@prisma/client');
  const p=new PrismaClient();
  p.sponsorMembership.create({
    data:{userId:process.env.SPONSOR_SMOKE_USER_ID,sponsorId:process.env.ALLOWED_SPONSOR_ID,isActive:true}
  }).then(m=>{console.log('SPONSOR_MEMBERSHIP_ID='+m.id);p.\$disconnect()});
"
```

### Step 5: Login as smoke users — store tokens, never print

```bash
# CLUB_ADMIN token
TOKEN=$(curl -sf -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d @/tmp/sprint29/club_creds.json \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])')
echo "$TOKEN" > /tmp/sprint29/club_token && chmod 600 /tmp/sprint29/club_token
echo "CLUB_TOKEN_STORED=OK"
```

---

## Security Constraints

- All passwords are random, single-use, stored only in `/tmp/sprint29/` on EC2
- `/tmp/sprint29/` has `chmod 700` (only root can list); all files `chmod 600`
- Passwords and JWTs are **never** printed to SSM StandardOutput
- Smoke users have `.internal` email domain — not real email addresses
- All records deleted immediately after smoke (see cleanup doc)

---

## Status

**STAGING_SMOKE_PENDING** — Provisioning runs after EC2 deploys Sprint 28 SHA
(`2605b372df829ea77f76c9c334909d54abdec294`) and Migration 43 is applied.

---

## Existing Pattern Reference

This approach follows the pattern established in:
- `docs/staging/SPRINT-22-TEMP-ADMIN-PROVISIONING-RUNBOOK.md`
- `docs/staging/SPRINT-22-TEMP-ADMIN-CLEANUP-EVIDENCE.md`
- `docs/staging/SPRINT-24-TEMP-ADMIN-CLEANUP-EVIDENCE.md`
