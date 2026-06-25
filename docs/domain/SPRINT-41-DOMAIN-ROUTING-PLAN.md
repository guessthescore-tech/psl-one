# Sprint 41 — Domain Routing Plan

Generated: 2026-06-25 | Sprint: 41 | Status: PLANNING

---

## Objective

Transition PSL One from a direct-IP beta (`http://16.28.84.11`) to a credible, named-domain beta (`beta.pslone.co.za`) without disrupting the working EC2 environment. This document defines the target domain structure, routing rules, and phased migration path.

---

## Target Domain Map

| Subdomain | Purpose | Target | Phase |
|-----------|---------|--------|-------|
| `pslone.co.za` | Root — public fan frontend | Vercel (production) | Phase 3 |
| `www.pslone.co.za` | Public fan frontend | Vercel (production) | Phase 3 |
| `beta.pslone.co.za` | Beta fan frontend (current working beta) | EC2 `16.28.84.11` | **Phase 1 — NOW** |
| `api.beta.pslone.co.za` | Beta API | EC2 `16.28.84.11` | **Phase 1 — NOW** |
| `app.pslone.co.za` | Authenticated fan app | TBD (post-launch) | Phase 3 |
| `admin.pslone.co.za` | Admin portal | TBD (post-launch) | Phase 3 |
| `club.pslone.co.za` | Club portal | TBD (post-launch) | Phase 3 |
| `sponsor.pslone.co.za` | Sponsor portal | TBD (post-launch) | Phase 3 |
| `api.pslone.co.za` | Production API | TBD (post-launch) | Phase 3 |

---

## Phase 1 — Beta Domain (Immediate, Owner Action)

### What changes
- Point `beta.pslone.co.za` and `api.beta.pslone.co.za` to `16.28.84.11`
- Update Caddy on EC2 to respond to these hostnames
- Issue a free TLS certificate via Caddy + Let's Encrypt
- Update `NEXT_PUBLIC_API_BASE_URL` in the web container to `https://api.beta.pslone.co.za`

### Why beta.pslone.co.za before www/root
- The direct IP `http://16.28.84.11` is not shareable with external testers
- A named domain enables HTTPS (required for secure cookies, certain browser APIs)
- `beta.*` is explicitly scoped — testers understand this is pre-production
- Preserves the option to point `www/root` at a polished Vercel build later

### Caddy configuration update required

Add to `infra/beta/Caddyfile` (owner to apply via SSM after DNS propagates):

```caddy
# beta.pslone.co.za — fan frontend
beta.pslone.co.za {
    reverse_proxy web:3001 {
        header_up Host {host}
    }
}

# api.beta.pslone.co.za — API
api.beta.pslone.co.za {
    reverse_proxy api:4000 {
        header_up Host {host}
    }
}
```

Caddy handles TLS automatically once DNS resolves.

---

## Phase 2 — Vercel Production Preview (After Beta Stable)

- Connect Vercel project to custom domain `preview.pslone.co.za` or `demo.pslone.co.za`
- Set `INTERNAL_API_URL=https://api.beta.pslone.co.za` in Vercel environment variables
- Vercel server components and API routes then proxy to the real EC2 API
- This makes the Vercel URL a fully connected preview, not just a static demo

---

## Phase 3 — Production Launch (Post-PSL Activation)

Only proceed after:
- PSL season activated by the board
- Production API on managed infrastructure (Railway, ECS, or dedicated EC2)
- Real domain HTTPS verified
- Security audit completed

Points `pslone.co.za` and `www.pslone.co.za` at production Vercel or direct deployment.

---

## Routing Architecture (Phase 1 — Beta)

```
User Browser
    │
    ▼
beta.pslone.co.za:443 (HTTPS) ──► Caddy (EC2 port 443)
                                      │
                           ┌──────────┼──────────────────────┐
                           ▼          ▼                       ▼
                      web:3001   (web assets, SSR)     api.beta.pslone.co.za
                                                            │
                                                        api:4000
                                                            │
                                                        postgres:5432

Direct IP (fallback, internal only):
http://16.28.84.11 — still works for internal smoke tests
```

---

## Naming Rationale

| Choice | Reason |
|--------|--------|
| `.co.za` TLD | South African domain — PSL is a South African football league |
| `beta.` prefix | Communicates pre-production status; protects brand if bugs surface |
| `api.beta.` | Enables separate TLS cert, separate routing rules, future CDN layer |
| Avoid `staging.` | Staging implies internal dev; `beta` is user-facing |
| Avoid root `pslone.co.za` for beta | Root domain should point to polished public launch |

---

## Current vs Target

| Property | Current | Target (Phase 1) |
|----------|---------|------------------|
| URL | `http://16.28.84.11` | `https://beta.pslone.co.za` |
| TLS | None | Yes (Let's Encrypt via Caddy) |
| Shareable | Limited (no HTTPS, raw IP) | Yes |
| CORS rules | IP-based | Hostname-based |
| NEXT_PUBLIC_API_BASE_URL | `http://16.28.84.11/api` (baked in image) | Needs rebuild with new URL |
| Caddy config | Mode C IP-based | Hostname-based (+ keep IP fallback) |

---

## Risk: Image Rebuild Required

`NEXT_PUBLIC_API_BASE_URL` is baked at Docker build time. To use the new domain, a new deploy is required with updated build args:

```yaml
NEXT_PUBLIC_API_BASE_URL: https://api.beta.pslone.co.za
```

Owner should trigger a new CI deploy after DNS propagates (usually 15–60 minutes for freshly set A records).

---

## Environment variable updates needed

After DNS and Caddy are updated, update in AWS SSM or EC2 `.env.beta`:

```bash
APP_BASE_URL=https://beta.pslone.co.za
```

This is used by the email verification service to generate correct `/verify-email?token=...` URLs.
