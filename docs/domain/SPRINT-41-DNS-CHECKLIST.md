# Sprint 41 — DNS Configuration Checklist

Owner action required. Do not run Terraform. DNS changes are made in the domain registrar control panel.

---

## Prerequisites

- [ ] You have login access to the domain registrar for `pslone.co.za`
- [ ] EC2 `i-0a5f16539c9626f90` is running (`16.28.84.11`)
- [ ] EC2 security group allows port 443 inbound (currently only port 80 is open)
- [ ] You have SSM access to update Caddyfile on EC2

---

## Phase 1 DNS Records (Add Now)

### A Records

| Record type | Name | Value | TTL |
|-------------|------|-------|-----|
| A | `beta` | `16.28.84.11` | 300 |
| A | `api.beta` | `16.28.84.11` | 300 |

Resulting FQDNs:
- `beta.pslone.co.za` → `16.28.84.11`
- `api.beta.pslone.co.za` → `16.28.84.11`

Set TTL to 300 seconds (5 minutes) initially so you can fix mistakes quickly.

---

## Phase 1 Infrastructure Steps (After DNS Propagates)

### Step 1 — Open port 443 on EC2 security group

In AWS console → EC2 → Security Groups → sg attached to `i-0a5f16539c9626f90` → Edit inbound rules → Add:
- Type: HTTPS, Port: 443, Source: 0.0.0.0/0

### Step 2 — Update Caddyfile on EC2 via SSM

```bash
aws ssm start-session --target i-0a5f16539c9626f90 --region af-south-1
```

Inside session, edit `/opt/psl-one/infra/beta/Caddyfile` or patch the running compose volume. Add:

```caddy
# Named domain routing (Phase 1 beta)
beta.pslone.co.za {
    reverse_proxy web:3001 {
        header_up Host {host}
    }
}

api.beta.pslone.co.za {
    reverse_proxy api:4000 {
        header_up Host {host}
    }
}
```

Then restart Caddy:
```bash
docker compose --env-file .env.beta -f compose.beta.yaml restart caddy
```

Watch logs for TLS certificate issuance:
```bash
docker logs psl-one-beta-caddy-1 --follow
```

Expect to see `Certificate obtained successfully` within 60 seconds.

### Step 3 — Trigger new CI deploy with updated API base URL

In `.github/workflows/deploy-beta-ec2.yml`, update build-args:
```yaml
NEXT_PUBLIC_API_BASE_URL: https://api.beta.pslone.co.za
```

Commit and push to main → CI redeploys with the correct baked API URL.

### Step 4 — Update APP_BASE_URL in EC2 environment

Via SSM, update `.env.beta`:
```bash
APP_BASE_URL=https://beta.pslone.co.za
```

Restart API:
```bash
docker compose --env-file .env.beta -f compose.beta.yaml restart api
```

---

## Verification Checklist

After completing steps above:

- [ ] `curl -I https://beta.pslone.co.za` returns `200 OK` with TLS cert
- [ ] `curl -I https://api.beta.pslone.co.za/health` returns `{"status":"ok","service":"api",...}`
- [ ] Browser: `https://beta.pslone.co.za` loads without certificate warning
- [ ] Browser: `https://beta.pslone.co.za/world-cup` loads World Cup page
- [ ] API links on page point to `https://api.beta.pslone.co.za`
- [ ] Email verification links use `https://beta.pslone.co.za/verify-email?token=...`
- [ ] `http://16.28.84.11` still works (keep for internal smoke tests)
- [ ] Run smoke suite: `SMOKE_ENVIRONMENT=beta BETA_API_BASE_URL=https://api.beta.pslone.co.za BETA_WEB_BASE_URL=https://beta.pslone.co.za node scripts/smoke/staging-smoke.mjs`

---

## Phase 3 DNS Records (Future — Production Launch Only)

Do NOT add these until PSL season is officially activated and production infrastructure is live.

| Record type | Name | Value |
|-------------|------|-------|
| CNAME | `www` | Vercel assigned domain |
| ALIAS/A | `@` (root) | Vercel or production load balancer |
| A | `api` | Production API IP or CNAME to load balancer |
| A | `admin` | Production admin panel |
| A | `club` | Club portal |
| A | `sponsor` | Sponsor portal |

---

## Notes

- Caddy auto-renews TLS certificates from Let's Encrypt. No manual renewal needed.
- EC2 Elastic IP `16.28.84.11` is static — it won't change when the instance restarts.
- Do not point `pslone.co.za` (root) or `www.pslone.co.za` at EC2 — keep root pointing at Vercel or leave unset until production launch.
- `beta.*` subdomains are safe to delete or reassign after production launch.
