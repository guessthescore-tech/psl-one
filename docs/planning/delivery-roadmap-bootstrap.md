# PSL One — Bootstrap Delivery Roadmap

**Version:** 2.0 (Bootstrap)  
**Date:** 2026-06-08  
**Replaces:** Original 12-week microservices roadmap  
**Authority:** Programme Director  
**Horizon:** 10 weeks to MVP Demo Day

---

## Guiding Principle

> Build the smallest working product that a real South African football fan finds genuinely useful. Everything else waits.

The bootstrap roadmap prioritises:
1. **Working** over complete
2. **Fast iteration** over architectural perfection
3. **Real data** over placeholder content
4. **Fan delight** over admin tooling

---

## Timeline Overview

```
Week  1:  Sprint 0  — Infrastructure + Monolith scaffold
Week  2:  Sprint 1A — Identity + Auth + Football data
Week  3:  Sprint 1B — Fixtures UI + Fan profile
Week  4:  Sprint 2A — GTS Predictions (core mechanic)
Week  5:  Sprint 2B — Loyalty + Points + Tier display
Week  6:  Sprint 3A — Fantasy squad builder
Week  7:  Sprint 3B — Fantasy scoring + gameweek
Week  8:  Sprint 4A — Match centre (live/finished)
Week  9:  Sprint 4B — Notifications + Admin tools
Week 10:  Sprint 5  — Polish + Seed data + Demo Day
```

**Demo Day target: End of Week 10 (2026-08-16)**

---

## Sprint Definitions

---

### Sprint 0 — Infrastructure Foundation

**Dates:** 2026-06-09 → 2026-06-15 (1 week)  
**Agents:** DevOps, Platform, Identity  
**Reference:** `docs/planning/sprint-0-bootstrap.md` (full spec)

**Goal:** Platform deployable, monolith live, fan can register and log in.

| Deliverable | Owner | Done When |
|---|---|---|
| Terraform: EC2 + RDS + S3 | DevOps | `terraform apply` succeeds |
| EC2 running Docker + Nginx | DevOps | `curl https://api.pslone.co.za/health` → 200 |
| Vercel deployment | DevOps | `apps/web` loads at public URL |
| GitHub Actions CI/CD | DevOps | PR blocks on fail; deploy on merge |
| NestJS monolith scaffold | Platform | 11 domain schemas, outbox worker |
| Prisma multi-schema | Platform | All migrations run clean |
| Cognito User Pool | Identity | Dev pool live |
| Register + Login endpoints | Identity | Fan can auth via API |

**Sprint 0 exit criteria:** See `sprint-0-bootstrap.md` success criteria section.

---

### Sprint 1A — Football Data + Identity Core

**Dates:** 2026-06-16 → 2026-06-19 (4 days)  
**Agents:** Football Agent, Identity Agent  
**Dependency:** Sprint 0 complete

**Goal:** Real PSL fixture and club data in the database. Fan registration working end-to-end.

**Football Agent work package:**
- [ ] API-Football adapter (`services/api/src/modules/football/adapters/api-football.adapter.ts`)
- [ ] `FootballDataProviderPort` interface
- [ ] Competition sync: PSL, MTN8 Cup, Nedbank Cup
- [ ] Club sync: all 16 PSL clubs with badges (stored in S3)
- [ ] Player sync: all registered players with positions
- [ ] Fixture sync: current season schedule
- [ ] Scheduled task: sync every 15 minutes during match windows (NestJS `@Cron`)
- [ ] Manual override endpoints: `PUT /admin/fixtures/:id/score`

**Identity Agent work package:**
- [ ] Fan registration flow (complete POPIA consent capture)
- [ ] Email verification via Cognito
- [ ] OTP via SMS (Twilio sandbox for dev — Africa's Talking for prod)
- [ ] Password reset
- [ ] `GET /api/v1/me` — authenticated user profile
- [ ] POPIA: `GET /api/v1/me/data`, `POST /api/v1/me/consent`, `DELETE /api/v1/me/account`
- [ ] AuditLog writes on all sensitive operations

**Sprint 1A exit criteria:**
- [ ] Real PSL fixtures visible in database (run a sync manually, verify > 50 fixtures loaded)
- [ ] Fan can register, receive verification email, verify, log in
- [ ] POPIA consent written to ConsentRecord on registration

---

### Sprint 1B — Fan Profile + Fixtures UI

**Dates:** 2026-06-20 → 2026-06-22 (3 days)  
**Agents:** Fan Agent, Frontend Agent  
**Dependency:** Sprint 1A (API-Football adapter, auth endpoints)

**Goal:** A fan can open the web app, register, see real PSL fixtures.

**Fan Agent work package:**
- [ ] Fan profile creation on `identity.user.registered` event
- [ ] `GET /api/v1/fan/profile` (own profile)
- [ ] `PUT /api/v1/fan/profile` (update name, province, avatar)
- [ ] `PUT /api/v1/fan/profile/club` (set primary club)
- [ ] Notification preferences model (opt-in/out per channel + category)

**Frontend Agent work package:**
- [ ] Registration form (email + mobile + POPIA consent checkboxes + date of birth)
- [ ] Login form
- [ ] Home page: upcoming fixtures widget + headline content
- [ ] Fixture list page with competition filter (PSL / MTN8)
- [ ] Fixture card: home team, away team, date, time, status badge
- [ ] Profile page: avatar, name, province, primary club
- [ ] Mobile-first layout (375px breakpoint)
- [ ] Lighthouse ≥ 80 (target 90 by Sprint 5)

**Sprint 1B exit criteria:**
- [ ] Fan can register, log in, see their profile
- [ ] PSL fixtures list loads with real data
- [ ] Competition filter works
- [ ] Mobile layout usable on Pixel 7 simulation in Playwright

---

### Sprint 2A — GTS Predictions

**Dates:** 2026-06-23 → 2026-06-26 (4 days)  
**Agents:** GTS Agent, Frontend Agent  
**Dependency:** Sprint 1A (fixtures, fan profile)

**Goal:** A fan can make a score prediction on an upcoming fixture. After the match, their prediction is settled and they see the result.

**GTS Agent work package:**
- [ ] GTS module: prediction creation (`POST /api/v1/gts/predictions`)
- [ ] Prediction validation: locked after kickoff, one prediction per fixture per fan
- [ ] Prediction settlement engine: triggered by `football.match.finished` event
- [ ] Settlement: exact score → 3 points, correct result → 1 point, incorrect → 0 points
- [ ] `GET /api/v1/gts/predictions` — my predictions (paginated)
- [ ] `GET /api/v1/gts/leaderboard` — top fans this gameweek + overall
- [ ] OutboxEvent: `gts.prediction.created`, `gts.prediction.settled`

**Frontend Agent work package:**
- [ ] Score prediction widget on fixture card
- [ ] My predictions history page
- [ ] GTS leaderboard page (weekly + overall)
- [ ] Score prediction input: home score + away score number inputs
- [ ] Prediction status badge: PENDING / EXACT_SCORE / CORRECT_RESULT / INCORRECT

**Sprint 2A exit criteria:**
- [ ] Fan can predict 2-1 on a fixture
- [ ] After manually triggering settlement (or test fixture), prediction shows SETTLED with points
- [ ] Leaderboard shows top fans
- [ ] Prediction locked message shown after fixture kickoff time

---

### Sprint 2B — Loyalty + Points

**Dates:** 2026-06-27 → 2026-06-30 (4 days)  
**Agents:** Loyalty Agent, Wallet Agent, Frontend Agent  
**Dependency:** Sprint 2A (GTS prediction settled events)

**Goal:** A fan earns points for making predictions. Their tier and balance are visible on their profile.

**Loyalty Agent work package:**
- [ ] Loyalty account creation on `identity.user.registered` event
- [ ] Points award on `gts.prediction.settled` event (EXACT_SCORE=10pts, CORRECT_RESULT=5pts)
- [ ] Points award on daily login (5 pts), registration (100 pts)
- [ ] Tier calculation: Bronze → Silver → Gold → Platinum → Superfan thresholds
- [ ] Tier promotion event: `loyalty.tier.changed` → OutboxEvent
- [ ] `GET /api/v1/loyalty/account` — points balance + tier
- [ ] `GET /api/v1/loyalty/transactions` — points history

**Wallet Agent work package:**
- [ ] Wallet creation on `identity.user.registered`
- [ ] Ledger: append-only transaction log (immutable — DB-level constraint, see ARB-001 005-B)
- [ ] `GET /api/v1/wallet/balance`
- [ ] `GET /api/v1/wallet/transactions`

**Frontend Agent work package:**
- [ ] Points balance + tier badge on profile page
- [ ] Tier badge in navigation (Bronze / Silver / Gold / Platinum / Superfan)
- [ ] Points history page
- [ ] Registration success: confetti + "You've earned 100 welcome points!"

**Sprint 2B exit criteria:**
- [ ] Fan earns 100 points on registration
- [ ] Fan earns points for GTS prediction settlement
- [ ] Tier badge shown correctly based on cumulative points
- [ ] Points history shows every earning event

---

### Sprint 3A — Fantasy Squad Builder

**Dates:** 2026-07-01 → 2026-07-06 (4 days — Mon-Sun includes weekend)  
**Agents:** Fantasy Agent, Frontend Agent  
**Dependency:** Sprint 1A (players in DB)

**Goal:** A fan can build a 15-player PSL fantasy squad within budget and save it.

**Fantasy Agent work package:**
- [ ] Squad model: 15 players (GK 2, DEF 5, MID 5, FWD 3), budget R100M
- [ ] Squad validation: 3 players max per club, formation validation
- [ ] Captain + Vice Captain selection
- [ ] `POST /api/v1/fantasy/squad` — create squad
- [ ] `GET /api/v1/fantasy/squad` — my squad
- [ ] `PUT /api/v1/fantasy/squad/transfers` — make transfers
- [ ] Player price seeding (use real positions, set prices based on profile)
- [ ] OutboxEvent: `fantasy.squad.created`

**Frontend Agent work package:**
- [ ] Squad builder page: pitch view + player list panel
- [ ] Position filter on player list (GK / DEF / MID / FWD)
- [ ] Club filter on player list
- [ ] Budget remaining display
- [ ] Club limit warning (> 3 from same club)
- [ ] Captain / VC selector on pitch view
- [ ] Squad submission button + validation errors
- [ ] Mobile: bottom sheet for player selection

**Sprint 3A exit criteria:**
- [ ] Fan can select 15 valid players within budget
- [ ] Validation blocks: wrong formation, over budget, too many per club
- [ ] Squad persists after page refresh
- [ ] Mobile squad builder is usable (not just functional)

---

### Sprint 3B — Fantasy Scoring

**Dates:** 2026-07-07 → 2026-07-11 (5 days)  
**Agents:** Fantasy Agent, Football Agent  
**Dependency:** Sprint 3A (squads exist), Sprint 1A (player stats)

**Goal:** After a gameweek's fixtures complete, fantasy squads are scored automatically.

**Football Agent additions:**
- [ ] Player statistics per match: goals, assists, clean sheets, yellow/red cards, saves
- [ ] Player statistics stored per `football.match.finished` event
- [ ] `GET /api/v1/football/players/:id/stats` — career + season stats

**Fantasy Agent work package:**
- [ ] Scoring engine: triggered by `football.match.finished` event
- [ ] Point calculations: goal (FWD=4, MID=5, DEF=6, GK=6), assist=3, clean sheet (DEF/GK=4), yellow=-1, red=-3
- [ ] Captain multiplier ×2, Triple Captain ×3 (chips)
- [ ] Bench auto-fill: if starting player has 0 minutes, replace from bench
- [ ] Gameweek total calculation per squad
- [ ] `GET /api/v1/fantasy/gameweek/:id/scores` — detailed breakdown
- [ ] `GET /api/v1/fantasy/leaderboard` — overall + gameweek leaderboard
- [ ] Points award to loyalty: `fantasy.gameweek.scored` event → loyalty module awards points
- [ ] OutboxEvent: `fantasy.gameweek.scored`

**Frontend Agent additions:**
- [ ] Gameweek points breakdown page: player by player scoring
- [ ] Overall leaderboard with rank position
- [ ] Rank change indicator (vs previous gameweek)

**Sprint 3B exit criteria:**
- [ ] Manually trigger a gameweek score via admin endpoint
- [ ] Squad with goals/assists shows correct point totals
- [ ] Captain multiplier applied correctly
- [ ] Bench auto-fill works when starting player has 0 minutes
- [ ] Leaderboard shows correct ranking

---

### Sprint 4A — Match Centre

**Dates:** 2026-07-14 → 2026-07-18 (5 days)  
**Agents:** Football Agent, Frontend Agent  
**Dependency:** Sprint 1A (fixtures), API-Football live score data

**Goal:** A fan watching a live PSL match can open the match centre and see the current score, scorers, and match events updated every ~60 seconds.

**Football Agent work package:**
- [ ] Match centre data model: live score, minute, scorers, red cards, match events array
- [ ] Live fixture sync: during LIVE status, sync every 60 seconds (API-Football rate limit aware)
- [ ] `GET /api/v1/football/fixtures/:id/live` — full match centre payload
- [ ] `GET /api/v1/football/fixtures/:id/events` — goal scorers, substitutions, cards

**Frontend Agent work package:**
- [ ] Match centre page: score display, team lineups, match events timeline
- [ ] Live badge + animation on live matches
- [ ] Auto-refresh: `useQuery` with `refetchInterval: 60000` (60 seconds polling)
- [ ] Score update animation (subtle highlight on score change)
- [ ] My GTS prediction shown on match centre (with result after settlement)
- [ ] My fantasy players playing in this match (highlighted)

**Sprint 4A exit criteria:**
- [ ] Match centre page loads for a finished fixture with correct score + scorers
- [ ] For a live fixture (or simulated), score updates without page reload
- [ ] GTS prediction result shown when match is finished
- [ ] Fantasy players in the match highlighted

---

### Sprint 4B — Notifications + Admin Tools

**Dates:** 2026-07-19 → 2026-07-23 (5 days)  
**Agents:** Notifications Agent, Admin Agent (or Platform Agent if no dedicated agent)  
**Dependency:** All preceding sprints (consumes events)

**Goal:** Platform sends emails for key events. Admins can manage football data.

**Notifications Agent work package:**
- [ ] Welcome email on `identity.user.registered`
- [ ] Fantasy points email on `fantasy.gameweek.scored`
- [ ] Tier promotion email on `loyalty.tier.changed`
- [ ] GTS result email on `gts.prediction.settled`
- [ ] SES integration (from EC2 = free tier)
- [ ] React Email templates for all 4 email types
- [ ] Preference check before send (respect `consentMarketing`)
- [ ] No notifications 22:00–07:00 SA time (push policy — apply to any future push)
- [ ] Delivery log: every send recorded in `notifications.notification_deliveries`

**Admin Agent work package:**
- [ ] `POST /admin/football/fixtures/:id/override` — manual score entry
- [ ] `POST /admin/football/players` — create player (if missing from API-Football)
- [ ] `GET /admin/outbox/dead` — dead letter queue viewer
- [ ] `POST /admin/outbox/:id/retry` — manually retry a dead outbox event
- [ ] Basic admin UI in `apps/admin` (simple Next.js pages, no design polish needed)
- [ ] All admin endpoints behind `@Roles(Role.PSL_ADMIN)` guard

**Sprint 4B exit criteria:**
- [ ] Registration triggers welcome email (check Mailpit locally, SES in staging)
- [ ] Fantasy gameweek score email received after scoring
- [ ] Admin can manually enter a score that overrides API-Football
- [ ] Dead letter queue events visible and retryable

---

### Sprint 5 — Polish, Demo Prep, Seed Data

**Dates:** 2026-07-28 → 2026-08-08 (2 weeks — includes QA buffer)  
**Agents:** All agents  
**Goal:** A live, seeded platform that tells a compelling story for stakeholders and investors.

**Seed data work package:**
- [ ] All 16 PSL clubs with logos
- [ ] All registered PSL players (current season)
- [ ] Current season fixture list (from API-Football)
- [ ] Demo fan accounts (5 personas: superfan, casual fan, fantasy winner, GTS pundit, club admin)
- [ ] Historical GTS results for demo personas (shows points history)
- [ ] A completed fantasy gameweek with realistic scores

**Quality work package:**
- [ ] Lighthouse audit: all pages ≥ 80 mobile, ≥ 90 desktop
- [ ] Playwright E2E: registration → login → predict score → view result flow
- [ ] Playwright E2E: squad builder → save squad → view gameweek score flow
- [ ] Load test: 100 concurrent users on fixture list and match centre (K6)
- [ ] POPIA audit: test GDPR-equivalent flows (data export, account deletion)
- [ ] Security review: OWASP Top 10 manual check on auth and input endpoints
- [ ] Mobile testing: Chrome DevTools Pixel 7, iPhone 14 simulations

**Demo prep work package:**
- [ ] Demo walkthrough script (10-minute stakeholder demo)
- [ ] "What's next" roadmap slide deck for fundraising
- [ ] Screenshots + screen recordings for product deck
- [ ] PSL branding: confirm colours, typefaces, club logos cleared for use

**Sprint 5 exit criteria (Demo Day gates):**
- [ ] Registration → login → predict → earn points → fantasy squad: all in one session
- [ ] All pages load in < 2 seconds on mobile (Lighthouse LCP)
- [ ] No TypeScript errors (`pnpm turbo run typecheck`)
- [ ] All Playwright E2E tests passing
- [ ] Seed data loaded: demo walk-through works without live API calls
- [ ] Admin can enter a score manually and trigger settlement

---

## Milestones Summary

| Milestone | Date | Deliverable |
|---|---|---|
| M0: Foundation | 2026-06-15 | EC2 live, monolith deployed, fan can register |
| M1: Football Platform | 2026-06-22 | Real fixtures + fan profiles in browser |
| M2: Prediction Engine | 2026-06-30 | Fan makes GTS prediction, earns points |
| M3: Fantasy Launch | 2026-07-11 | Fantasy squad built, gameweek scored |
| M4: Live Platform | 2026-07-23 | Match centre live, notifications sending |
| M5: Demo Day | 2026-08-10 | Investor-grade demo, fundraising ready |

---

## Agent Assignment

| Domain | Agent | Key Sprints |
|---|---|---|
| Infrastructure / CI/CD | DevOps Agent | Sprint 0, all deployments |
| Monolith scaffold / shared infrastructure | Platform Agent | Sprint 0, ongoing |
| Identity, Auth, POPIA | Identity Agent | Sprint 0, Sprint 1A |
| Football Data, Match Centre | Football Agent | Sprint 1A, Sprint 4A |
| Fan Profile | Fan Agent | Sprint 1B |
| Frontend (web app) | Frontend Agent | Sprint 1B → Sprint 5 |
| GTS Predictions | GTS Agent | Sprint 2A |
| Loyalty, Tiers | Loyalty Agent | Sprint 2B |
| Wallet, Ledger | Wallet Agent | Sprint 2B |
| Fantasy Football | Fantasy Agent | Sprint 3A, Sprint 3B |
| Notifications | Notifications Agent | Sprint 4B |
| Admin Tools | Platform Agent (or Admin Agent) | Sprint 4B |

---

## Risks to the Roadmap

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| API-Football PSL data quality poor | HIGH | HIGH | Sprint 1A: data quality audit. If < 80% player coverage, escalate immediately. Manual data entry is the fallback. |
| Cognito SES sandbox limits email delivery | MEDIUM | MEDIUM | Request SES production access in Sprint 1A. 24–48h AWS review. |
| EC2 t2.micro free tier expired | LOW | LOW | Create new AWS account. R0 cost. |
| Under-18 fan compliance | HIGH | HIGH | Age gate at registration in Sprint 1A. Do not defer. |
| Scope creep | HIGH | HIGH | Every feature that is NOT in this roadmap requires Programme Director sign-off to add. |

---

## Out of Scope for Bootstrap MVP

The following are explicitly deferred to Phase 2 (post-funding):

- Live WebSocket subscriptions (using HTTP polling instead)
- Redis caching
- Kafka / MSK
- ECS Fargate (using EC2 + Docker Compose)
- Multi-account AWS Organisations
- Club Portal app (`apps/club-portal`)
- Sponsor Portal app (`apps/sponsor-portal`)
- Marketplace (kit, tickets)
- Ticketing integration
- In-app wallet top-up (payment gateway)
- Push notifications (web push / FCM)
- Search service
- Content management system (CMS)
- Analytics / reporting dashboards
- Social features (fan groups, comments)
