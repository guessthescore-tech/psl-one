# Sprint 3 Infrastructure Story 0 — Matchday Load Model

**Purpose:** Establish explicit load assumptions, request volume estimates, and load-test thresholds for staging and production infrastructure sizing  
**Audience:** Infrastructure team, platform engineers, QA  
**Status:** Implemented and awaiting acceptance  
**Last verified:** 2026-06-14  
**Source of truth:** Modelled from explicit beta and year-1 assumptions; not yet load-tested against real infrastructure  
**Story identifier:** S3-INFRA-00

---

## Explicit Assumptions

These are not promises. They are the planning basis for Sprint 3 sizing decisions.

| Parameter | Assumption | Source |
|-----------|-----------|--------|
| Registered users at beta launch | 5,000 | Beta cohort target |
| Monthly active users (MAU) at beta | 2,000 | 40% of registered |
| Peak concurrent users (simultaneous) | 500 | PSL estimate; 25% of MAU |
| Long-term registered users (year 1) | 250,000 | PSL growth target |
| Long-term MAU (year 1) | 100,000 | 40% retention |
| Peak concurrent (year 1, match day) | 25,000 | 25% of MAU |
| Design ceiling (CLAUDE.md) | 2,000,000 | PSL 2M fan target |

**Do not claim 2M concurrent fan support without load evidence.**

---

## Matchday Event Timeline (Single 90-min Fixture)

| Time | Event | Expected Load |
|------|-------|--------------|
| T-60min | Pre-match squad reveal | +30% prediction submissions |
| T-30min | Prediction lock deadline | Peak prediction traffic |
| T-0 (KO) | Kickoff alert broadcast | Notification fan-out; Match Centre spike |
| T+5min | First goal (if scored) | Live event ingest; notification burst |
| T+15, 30, 45, HT | Regular intervals | Match Centre polling |
| HT (T+45min) | Half-time notification | Second fan-out event |
| T+90min | Full time | Settlement trigger; leaderboard refresh |
| T+95min | Settlement complete | Notification burst; leaderboard read spike |

---

## Request Volume Model (Beta — 500 concurrent)

| Endpoint | Requests/min (peak) | Notes |
|----------|---------------------|-------|
| `GET /match-centre/live/:fixtureId` | 1,500 | 3 req/min × 500 viewers |
| `GET /football/fixtures` | 200 | Fixture list refresh |
| `GET /leaderboards/predictions` | 100 | Post-settlement read spike |
| `POST /predictions` | 50 | Pre-kickoff burst |
| `POST /notifications admin broadcast` | 1 (fan-out to 500) | Batched in 500-user chunks |
| `GET /auth/me` | 500 | Session validation |
| `GET /fantasy/*` | 300 | Transfer window activity |

**Peak total: ~2,700 req/min (~45 req/sec)**

---

## Request Volume Model (Year 1 — 25,000 concurrent)

| Endpoint | Requests/min (peak) | Notes |
|----------|---------------------|-------|
| `GET /match-centre/live/:fixtureId` | 75,000 | Live viewers |
| `GET /football/fixtures` | 10,000 | CDN-cached; origin sees 5% miss rate = 500 |
| `GET /leaderboards/predictions` | 5,000 | CDN-cached; 5% miss = 250 |
| `POST /predictions` | 2,500 | |
| `POST /notifications admin broadcast` | 1 (fan-out to 25,000) | 50 batches of 500 |
| `GET /auth/me` | 25,000 | Requires session caching or JWT validation cache |
| `GET /fantasy/*` | 15,000 | |

**Peak total: ~132,500 req/min (~2,200 req/sec)**

At year-1 scale:
- ECS tasks: minimum 4 × 2 vCPU / 4 GB instances
- PostgreSQL: RDS r6g.xlarge or equivalent (4 vCPU, 32 GB RAM)
- CDN is mandatory for fixture/leaderboard endpoints
- Redis required for session management and rate limiting

---

## Settlement Workload Model

| Scenario | Users with predictions | Markets to settle | Matches to settle | Estimated duration |
|----------|----------------------|------------------|-------------------|-------------------|
| Beta (single fixture) | 200 | 3 | 50 | < 5 seconds |
| Year 1 (single fixture) | 5,000 | 5 | 500 | < 30 seconds |
| 2M fans (all fixtures) | 500,000 | 5 | 50,000 | Requires batched async job |

**At 2M fans, synchronous settlement is not viable. A durable job queue (Kafka consumer or SQS) is required. This is INFRASTRUCTURE_REQUIRED.**

---

## Notification Fan-Out Model

| Scenario | Users to notify | Batch size | Batches | DB writes | Estimated duration |
|----------|----------------|------------|---------|-----------|-------------------|
| Beta goal notification | 500 | 500 | 1 | 500 | ~2 seconds |
| Year 1 goal notification | 25,000 | 500 | 50 | 25,000 | ~100 seconds (synchronous) |
| 2M fans | 2,000,000 | 500 | 4,000 | 2M | Hours — requires async |

**At year-1 scale, synchronous in-process notification fan-out becomes a 100-second blocking operation. A background job queue is INFRASTRUCTURE_REQUIRED at > 10,000 users.**

---

## Database Query Performance Targets

| Query | Target p95 | Current status |
|-------|-----------|----------------|
| `SELECT * FROM fixtures WHERE season_id = ? AND status = ? AND is_published = true` | < 5ms | Indexed ✓ |
| `SELECT user_id, SUM(points) FROM prediction_points_ledger WHERE fixture_id IN (...)` | < 20ms | Indexed ✓ (Sprint 3) |
| `SELECT fixture_id, minute FROM match_events WHERE fixture_id = ? ORDER BY minute` | < 10ms | Indexed ✓ (Sprint 3) |
| `SELECT fantasy_team_id, SUM(points) FROM fantasy_points_ledger WHERE fantasy_team_id = ?` | < 10ms | Indexed ✓ (Sprint 3) |
| Leaderboard `GROUP BY` (season-scoped, 100k rows) | < 100ms | Unverified — measure |

---

## Load Test Thresholds (Before Production)

The following thresholds must be demonstrated before production go-live:

1. `GET /match-centre/live/:fixtureId` sustains 2,000 req/min with p95 < 200ms
2. Settlement of 5,000 predictions completes within 30 seconds
3. Notification fan-out to 10,000 users completes without heap OOM
4. Database CPU < 60% at peak matchday simulation
5. Zero 500 errors during simulated 60-minute fixture window

**Blocking:** No production launch without evidence on items 1, 2, 3.

---

## Out of Scope for This Story

- Actual load test execution (requires staging environment)
- Load test tooling setup (k6 / Locust — Sprint 3 infrastructure)
- Database query plan analysis (requires production-scale data volume)
- 2M fan capacity proof (design target, not beta target)
