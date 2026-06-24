# Sprint 29 Smoke Scope Selection

**Date:** 2026-06-24
**Environment:** Beta EC2 (i-0a5f16539c9626f90, af-south-1)
**Purpose:** Select team and sponsor records for cross-tenant smoke testing

---

## Scope Selection Approach

Records are selected from the beta DB using SSM-executed Prisma queries:

```bash
# Teams
docker exec $(docker ps -qf name=psl-one-api) node -e "
  const {PrismaClient}=require('@prisma/client');
  const p=new PrismaClient();
  p.team.findMany({take:4,select:{id:true,name:true}})
   .then(t=>{console.log(JSON.stringify(t));p.\$disconnect()})
"

# Sponsors
docker exec $(docker ps -qf name=psl-one-api) node -e "
  const {PrismaClient}=require('@prisma/client');
  const p=new PrismaClient();
  p.sponsor.findMany({take:4,select:{id:true,name:true}})
   .then(s=>{console.log(JSON.stringify(s));p.\$disconnect()})
"
```

---

## Selected Records (IDs redacted in public docs)

IDs are stored in `/tmp/sprint29/` with `chmod 600` on the beta EC2 during smoke
execution only. They are never committed to the repository.

| Role | Entity | Selection | Notes |
|---|---|---|---|
| ALLOWED_TEAM_ID | Team | First seeded team | CLUB_ADMIN is granted ClubMembership for this team |
| FORBIDDEN_TEAM_ID | Team | Second seeded team | CLUB_ADMIN has NO membership — cross-tenant test |
| ALLOWED_SPONSOR_ID | Sponsor | First seeded sponsor | SPONSOR user is granted SponsorMembership for this sponsor |
| FORBIDDEN_SPONSOR_ID | Sponsor | Second seeded sponsor | SPONSOR user has NO membership — cross-tenant test |

---

## Storage Protocol

```bash
# After querying, store IDs on EC2:
mkdir -p /tmp/sprint29 && chmod 700 /tmp/sprint29
echo "<TEAM_ID_1>" > /tmp/sprint29/allowed_team_id    && chmod 600 /tmp/sprint29/allowed_team_id
echo "<TEAM_ID_2>" > /tmp/sprint29/forbidden_team_id  && chmod 600 /tmp/sprint29/forbidden_team_id
echo "<SPONSOR_ID_1>" > /tmp/sprint29/allowed_sponsor_id   && chmod 600 /tmp/sprint29/allowed_sponsor_id
echo "<SPONSOR_ID_2>" > /tmp/sprint29/forbidden_sponsor_id && chmod 600 /tmp/sprint29/forbidden_sponsor_id
```

---

## Status

**STAGING_SMOKE_PENDING** — Execution pending EC2 deployment of Sprint 28 SHA.
IDs will be populated during smoke execution and remain on-EC2 only.

---

## Safety Notes

- PSL remains INACTIVE throughout scope selection
- No fixture import or publication performed
- No wallet production interaction
- NON_FINANCIAL scope only — no real-money records selected
