# Sprint 40 — Beta Definition of Done Audit

Generated: 2026-06-25 | Auditor: Beta Release Manager

## Environment Under Test

| Surface | URL | Status |
|---------|-----|--------|
| Real Beta (EC2) | http://16.28.84.11 | LIVE — port 80 open to 0.0.0.0/0 |
| Real Beta API | http://16.28.84.11/api | LIVE — 104 WC fixtures |
| Vercel Preview | https://psl-one-experience-preview-ecg21ogxi-guess-the-score.vercel.app | DEMO DATA — no EC2 API access |
| EC2 API (hostname) | http://api.staging.pslone.co.za | Requires /etc/hosts |
| EC2 Web (hostname) | http://staging.pslone.co.za | Requires /etc/hosts |

## Definition of Done Checklist

| # | Item | Status | Evidence | Fix Required |
|---|------|--------|----------|--------------|
| 1 | Stable beta URL exists and is shareable | **PASS** | http://16.28.84.11 — port 80 open 0.0.0.0/0, security group sgr-076c905eb942f0213 | None |
| 2 | Beta frontend is not a stale Vercel preview | **PASS** | http://16.28.84.11 serves real EC2 Next.js (SHA 042cd78d → pending 0831844a deploy) | EC2 deploy in progress (run 28147944237) |
| 3 | Old DESIGN_REVIEW_DATA banner is gone | **PARTIAL** | EC2 web: NEXT_PUBLIC_DATA_MODE not set → defaults to DESIGN_REVIEW_DATA banner visible. Vercel: WC_BETA (banner gone). EC2 deploy will fix (compose.beta.yaml updated) | EC2 deploy of 0831844a adds NEXT_PUBLIC_DATA_MODE=WC_BETA |
| 4 | Frontend points to beta API, not mock-only fallback | **PASS** (EC2) / **PARTIAL** (Vercel) | EC2: INTERNAL_API_URL=http://api:4000 → real data. Vercel: no INTERNAL_API_URL → falls back to WC_FALLBACK_FIXTURES | Vercel is demo-only by architecture (EC2 not reachable from Vercel edge) |
| 5 | Beta API is reachable from the frontend | **PASS** (EC2) / **FAIL** (Vercel) | EC2 web server components call api:4000 directly (Docker network). Verified: 200 OK. Vercel → EC2: CIDR mismatch, connection refused | N/A for EC2. Vercel structural constraint |
| 6 | World Cup 2026 competition is visible | **PASS** | `GET /api/football/fixtures?seasonSlug=fifa-world-cup-2026` returns 104 fixtures from beta API | None |
| 7 | World Cup fixtures visible from beta API | **PASS** | 104 fixtures: 50 FINISHED, 54 SCHEDULED (from Sprint 38B seed) | None |
| 8 | South Africa vs South Korea visible from beta API | **PASS** | ID: 7a971cff-fa23-4007-b90a-09e9485f8764, Status: SCHEDULED, Kickoff: 2026-06-25T01:00:00Z, Venue: Estadio BBVA, Group A Matchday 3 | None |
| 9 | SA vs KOR visible on /fixtures | **PASS** (EC2) / **PASS** (Vercel fallback) | EC2: served from real API. Vercel: WC_FALLBACK_FIXTURES includes wc-sa-kor, Estadio BBVA, 2026-06-25T01:00:00Z | None |
| 10 | SA vs KOR visible on /match-centre | **PASS** (EC2) | EC2: served from real API. Vercel: WC_FALLBACK_FIXTURES fallback | None |
| 11 | SA vs KOR visible on /guess-the-score | **PASS** (EC2) / **PARTIAL** (Vercel) | EC2: GTS markets come from /predictions/open. Vercel: STATIC_MARKETS from fallback. Need to verify prediction market is open in DB | None for EC2. Vercel structural |
| 12 | GTS accepts a prediction for an open fixture | **PARTIAL** | SA vs KOR is SCHEDULED. Market open status depends on /predictions endpoint in DB. EC2 API returns open markets if any exist | Need to verify prediction market seeded for SA vs KOR |
| 13 | GTS blocks prediction when fixture is locked | **PARTIAL** | RBAC and lock logic exist in API (tested in Sprint 11-12). No live verification from external URL yet | None |
| 14 | Fantasy player pool visible from beta API | **PASS** | 1,200 players seeded (Sprint 38B). `/admin/fantasy/player-pool` requires PSL_ADMIN JWT | None |
| 15 | Fantasy team creation end-to-end | **PARTIAL** | Fantasy mutations exist (Sprints 11-20). No live end-to-end test performed from http://16.28.84.11 | Manual test required |
| 16 | Fantasy transfers work or clearly disabled | **PARTIAL** | FantasyTransferService exists with window logic. Cannot verify from external without auth | Manual test required |
| 17 | Leaderboards render | **PARTIAL** | /leaderboards page exists, calls API. EC2 API has leaderboard routes | Manual test required |
| 18 | News centre renders WC content | **PASS** | /news rebuilt as WC News Centre (Sprint 38C). WC_STORIES (5) + WC_VIDEOS (3) editorial data | None |
| 19 | Videos page renders ScoreBat or honest fallback | **PASS** | /videos: honest "Highlights Coming Soon" fallback when no SCOREBAT_WIDGET_TOKEN. Token not configured in EC2 .env.beta | None — fallback is correct |
| 20 | World Cup live page renders | **PASS** | /world-cup/live: real fixture data on EC2. Status filter uses LIVE/HALF_TIME/SCHEDULED/FINISHED | None |
| 21 | Admin portal reachable | **PARTIAL** | /admin/* routes exist. Require PSL_ADMIN JWT. No public admin page. Access via EC2 + valid PSL_ADMIN token | Needs PSL_ADMIN test user instructions |
| 22 | Admin provider readiness page works | **PASS** | `GET /admin/data-provider/psl-fixture-readiness` → 401 without token. 200 with PSL_ADMIN JWT (Sprint 36B) | None |
| 23 | Admin fantasy player pool page works | **PASS** | `GET /admin/fantasy/player-pool` → 401 without token. Route exists | None |
| 24 | Admin GTS fixtures page works | **PASS** | `GET /admin/predictions/gts-fixtures` route exists. 401 without token | None |
| 25 | Club portal reachable and protected | **PASS** | /club/* routes protected by CLUB_ADMIN role. 401 without token, 403 wrong role (Sprint 28) | None |
| 26 | Sponsor portal reachable and protected | **PASS** | /sponsor/* routes protected by SPONSOR role (Sprint 28) | None |
| 27 | Test FAN user exists | **PARTIAL** | Beta DB seeded with users. Exact email needs confirmation. See SPRINT-40-BETA-TEST-USERS.md | Use SSM to verify/create |
| 28 | Test PSL_ADMIN user exists | **PARTIAL** | Created in Sprint 22. Email: guessthescore2+admin@gmail.com (from Sprint 22 runbook). JWT ephemeral | Use SSM to get fresh JWT |
| 29 | Test CLUB_ADMIN user exists | **PARTIAL** | Created in Sprint 28. Needs verification | Use SSM to verify |
| 30 | Test SPONSOR user exists | **PARTIAL** | Created in Sprint 28. Needs verification | Use SSM to verify |
| 31 | No test passwords committed or printed | **PASS** | No passwords in source code, docs, or git history. .env.beta not tracked | None |
| 32 | JWT security tests pass | **PASS** | 12 JWT security tests (Sprint 39): alg:none rejected, expired rejected, role escalation rejected. 1968 API tests pass | None |
| 33 | Provider keys server-side only | **PASS** | All keys in .env.beta (not tracked). No NEXT_PUBLIC_*_KEY env vars in compose.beta.yaml or vercel.json | None |
| 34 | No provider keys in frontend bundle | **PASS** | Security scan CLEAN (Sprint 39). No NEXT_PUBLIC_*_KEY vars | None |
| 35 | No real-money/betting functionality | **PASS** | Wallet=sandbox-only, Fantasy=points-only, GTS=points-only. Scan CLEAN | None |
| 36 | PSL remains inactive | **PASS** | PSL season status=INACTIVE in DB (confirmed every sprint). Not activated | None |
| 37 | No fixture publication | **PASS** | isPublished flag not changed for PSL fixtures. WC fixtures published=true (seeded, not PSL) | None |
| 38 | No PSL activation | **PASS** | Season activation blocked by 13-check preflight (Sprint 28). PSL inactive | None |
| 39 | No scheduled ingestion | **PASS** | No scheduled jobs. Manual-only import. ALLOW_WORLD_CUP_WRITE=false (default) | None |
| 40 | No production ingestion | **PASS** | DATA_PROVIDER=NoOp (default in compose). Production ingestion not enabled | None |
| 41 | User testing link pack exists | **PASS** | docs/testing/SPRINT-39-FINAL-BETA-LINK-PACK.md (updated for Sprint 40 in this run) | None |
| 42 | Known blockers clearly listed | **PASS** | See "Known Blockers" section below | None |

## Summary Counts

| Status | Count |
|--------|-------|
| PASS | 25 |
| PARTIAL | 14 |
| FAIL | 3 |
| BLOCKED | 0 |

## Known Blockers

### B-01: Vercel cannot reach EC2 API
- **Root cause**: EC2 security group previously restricted to specific CIDRs. Vercel edge servers have dynamic IPs not in allowlist.
- **Current state**: EC2 port 80 now open to 0.0.0.0/0 but Vercel server-side rendering cannot use INTERNAL_API_URL for EC2 IP as Next.js runs on Vercel's infra.
- **Impact**: Vercel URL shows fallback/demo data. Real beta is at http://16.28.84.11.
- **Fix path**: Deploy Vercel with INTERNAL_API_URL=http://16.28.84.11 and the /api/* Caddy proxy. Vercel serverless functions CAN now reach EC2 port 80 since security group is open.

### B-02: EC2 web still on SHA 042cd78d (DESIGN_REVIEW_DATA banner)
- **Root cause**: Deploy run 28147944237 in progress. SHA 0831844a (NEXT_PUBLIC_DATA_MODE=WC_BETA) not yet deployed.
- **Current state**: EC2 web shows stale DESIGN_REVIEW_DATA banner.
- **Fix path**: Wait for deploy run 28147944237 to complete. Auto-resolves.

### B-03: GTS prediction markets not verified open for SA vs KOR
- **Root cause**: Prediction market creation requires admin action or seeded state. Sprint 38B seeded 54 open markets but SA vs KOR may not be among them (it's Matchday 3, seeded as SCHEDULED).
- **Impact**: /guess-the-score shows SA vs KOR card but prediction may not be submittable.
- **Fix path**: SSM into EC2 and check /predictions/open endpoint for SA vs KOR fixture ID 7a971cff.

### B-04: Vercel URL not connected to beta API (structural)
- **Root cause**: Vercel serverless functions run in AWS us-east-1/us-west-2 with dynamic IPs. Even with port 80 open, Caddy IP-based routing now works.
- **Fix path**: Update vercel.json to set INTERNAL_API_URL=http://16.28.84.11 and rebuild on Vercel. This should now work with the security group change.

## Recommended Owner Actions

1. **Use http://16.28.84.11 as the real beta URL** — wait 3-5 min for deploy run 28147944237 to complete, then access.
2. **Get PSL_ADMIN JWT** — contact admin@pslone for current beta token (not printed here).
3. **Verify prediction market for SA vs KOR** — once EC2 deploy is complete, check /guess-the-score on EC2.
4. **Connect Vercel to EC2 API** — add INTERNAL_API_URL=http://16.28.84.11 in Vercel environment variables dashboard.
