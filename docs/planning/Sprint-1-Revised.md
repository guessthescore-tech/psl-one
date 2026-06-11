# PSL One — Sprint 1 Revised

**Date:** 2026-06-08  
**Authority:** Programme Director  
**Status:** APPROVED FOR SPEC — no code until story is individually approved  
**Constraint:** One bounded context at a time. Domain model → API contract → DB schema → AC → tests → then code.

---

## Sprint Goal

> A fan can register, browse the PSL season, build a fantasy team, predict match scores, earn points and see where they stand.

All 12 goals are in scope. Every domain is an MVP slice — minimum fields, minimum rules, maximum demonstrability.

---

## What Is Explicitly Out of Scope

| Excluded | Reason |
|---|---|
| Fantasy chips (wildcard, triple captain, bench boost) | Sprint 2+ |
| Financial wallet (ZAR balance, top-up, withdrawal) | Post-funding |
| Sponsor marketplace | Post-funding |
| Push / SMS notifications | Sprint 2 |
| Fantasy bench players | Sprint 2 (start with 11-player squad) |
| OTP SMS verification at registration | Sprint 2 (email verify only) |
| Club portal / sponsor portal | Post-funding |
| Content / articles feed | Sprint 2 |
| Social / comments | Post-funding |
| Password reset flow | Sprint 2 |

---

## Duration

**2 weeks: 2026-06-16 → 2026-06-29**  

Parallel tracks: Backend and Frontend agents work simultaneously once the API contract for each story is approved.

---

## Critical Path

```
STORY-01 (Identity — Register/Login)
    │
    ├── STORY-02 (Football — Competitions + Seasons)
    │       │
    │       ├── STORY-03 (Football — Teams + Players)
    │       │       │
    │       │       ├── STORY-05 (Fantasy — Squad Creation)  ← needs players
    │       │       │       │
    │       │       │       └── STORY-06 (Fantasy — Transfers)
    │       │       │
    │       ├── STORY-04 (Football — Fixtures)
    │               │
    │               └── STORY-07 (GTS — Predictions)
    │                       │
    │                       └── STORY-08 (Loyalty — Earn Points)
    │                               │
    │                               ├── STORY-09 (Wallet — View Balance)
    │                               └── STORY-10 (Leaderboard)
```

Unblock in this order: 01 → 02 → 03+04 (parallel) → 05+07 (parallel) → 06+08 (parallel) → 09+10 (parallel).

---

## Stories

---

## STORY-01 — Identity: Register and Login

**As a** South African football fan  
**I want to** create an account and log in  
**So that** I can access all platform features

**Bounded context:** Identity  
**Sprint days:** Days 1–3  
**Blocks:** Everything

---

### Domain Model

```
Fan
  id            UUID
  email         String (unique)
  mobile        String (nullable, E.164 format)
  displayName   String
  dateOfBirth   Date  ← required (age gate)
  cognitoId     String (unique)
  createdAt     DateTime

ConsentRecord   ← append-only, never updated
  id            UUID
  fanId         UUID → Fan
  consentTerms  Boolean (must be true)
  consentMkt    Boolean
  consentData   Boolean
  ipAddress     String
  createdAt     DateTime
```

**Rules:**
- Fan must be 18 or older at registration (POPIA — ARB-001 finding 010-A)
- `ConsentRecord` is append-only — a new row is created for every consent change, never an UPDATE
- A Fan row is created only after Cognito user creation succeeds (no orphaned DB rows)
- Registration, login, token operations are the only unauthenticated endpoints

---

### API Contract

```
POST /api/v1/auth/register
  Body:    { email, password, displayName, dateOfBirth, mobile?,
             consentTerms: true, consentMkt: boolean, consentData: boolean }
  201:     { fanId: UUID, message: "Verify your email to continue" }
  400:     { code: "VALIDATION_ERROR", fields: [...] }
  400:     { code: "UNDER_AGE", message: "You must be 18 or older to register" }
  409:     { code: "EMAIL_EXISTS" }

POST /api/v1/auth/login
  Body:    { email, password }
  200:     { accessToken: JWT }
           Set-Cookie: refreshToken=...; HttpOnly; SameSite=Lax; Secure; Path=/api/v1/auth
  401:     { code: "INVALID_CREDENTIALS" }
  403:     { code: "EMAIL_NOT_VERIFIED" }

POST /api/v1/auth/refresh
  Cookie:  refreshToken
  200:     { accessToken: JWT }
  401:     { code: "INVALID_REFRESH_TOKEN" }

POST /api/v1/auth/logout
  Cookie:  refreshToken
  204:     (no body, clears cookie)

GET /api/v1/auth/me                        ← requires JWT
  200:     { fanId, email, displayName, createdAt }
```

---

### DB Schema

```sql
-- schema: identity

CREATE TABLE fans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  mobile        TEXT,
  display_name  TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  cognito_id    TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE consent_records (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id         UUID NOT NULL REFERENCES identity.fans(id),
  consent_terms  BOOLEAN NOT NULL,
  consent_mkt    BOOLEAN NOT NULL DEFAULT FALSE,
  consent_data   BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- NO updated_at — immutable by design
);

CREATE INDEX idx_consent_fan_id ON consent_records(fan_id);
CREATE INDEX idx_consent_created ON consent_records(created_at);

-- DB-level immutability for consent_records
CREATE RULE no_update_consent AS ON UPDATE TO consent_records DO INSTEAD NOTHING;
CREATE RULE no_delete_consent AS ON DELETE TO consent_records DO INSTEAD NOTHING;
```

**OutboxEvent written on registration:**
```
topic:   identity.fan.registered
payload: { fanId, email, displayName, consentMkt, consentData, ipAddress }
```

---

### Acceptance Criteria

```
AC-01-01: Successful registration
  Given   a valid payload with age ≥ 18 and consentTerms=true
  When    POST /api/v1/auth/register
  Then    201 returned
  And     Fan row exists in DB
  And     ConsentRecord row exists in DB
  And     OutboxEvent with topic identity.fan.registered exists in DB
  And     Cognito user created

AC-01-02: Age gate
  Given   dateOfBirth indicates age < 18
  When    POST /api/v1/auth/register
  Then    400 returned with code UNDER_AGE
  And     No Fan row created
  And     No Cognito user created

AC-01-03: Duplicate email
  Given   email already exists in fans table
  When    POST /api/v1/auth/register
  Then    409 returned with code EMAIL_EXISTS

AC-01-04: Successful login
  Given   a registered and verified fan
  When    POST /api/v1/auth/login with correct credentials
  Then    200 returned with accessToken (JWT, RS256)
  And     refreshToken cookie set (HttpOnly, SameSite=Lax)

AC-01-05: Registration atomicity
  Given   Cognito succeeds but DB transaction fails
  When    POST /api/v1/auth/register
  Then    Transaction rolls back
  And     Cognito user is deleted (compensating action)
  And     500 returned (not 201)
```

---

### Test Scenarios

```
Unit:
  [ ] Age calculation: born today-18yrs = pass, today-17yrs = fail, today-18yrs+1day = pass
  [ ] ConsentTerms=false → validation error
  [ ] Email normalisation: UPPER@CASE.COM stored as lower

Integration (Testcontainers):
  [ ] Happy path: register → login → GET /auth/me returns correct data
  [ ] Duplicate email returns 409 on second call
  [ ] Refresh token flow: login → refresh → old token rejected
  [ ] Logout clears cookie
  [ ] DB rule: attempt UPDATE on consent_records → no effect (verify row unchanged)
```

---

## STORY-02 — Football: Competitions and Seasons

**As a** fan  
**I want to** browse available competitions and their seasons  
**So that** I can navigate to fixtures and standings for the current PSL season

**Bounded context:** Football  
**Sprint days:** Days 1–3 (parallel with STORY-01)  
**Blocks:** STORY-03, STORY-04, STORY-05, STORY-07

---

### Domain Model

```
Competition
  id       UUID
  name     String           e.g. "DStv Premiership"
  code     String (unique)  e.g. "PSL"
  country  String           "ZA"
  logoUrl  String?

Season
  id            UUID
  competitionId UUID → Competition
  name          String    e.g. "2025/26"
  year          Int       e.g. 2025
  startDate     Date
  endDate       Date
  isCurrent     Boolean   ← only one true per competition
```

**Rules:**
- Exactly one Season per Competition has `isCurrent=true`
- All data is seeded from API-Football + manual entry; fans cannot create competitions
- No soft delete for MVP (competitions rarely change)

---

### API Contract

```
GET /api/v1/competitions
  Auth:   required
  200:    { competitions: Competition[] }

GET /api/v1/competitions/:competitionCode
  Auth:   required
  200:    Competition
  404:    { code: "COMPETITION_NOT_FOUND" }

GET /api/v1/competitions/:competitionCode/seasons
  Auth:   required
  200:    { seasons: Season[], currentSeasonId: UUID }

GET /api/v1/competitions/:competitionCode/seasons/:seasonId
  Auth:   required
  200:    Season
  404:    { code: "SEASON_NOT_FOUND" }

-- Admin only --
POST /api/v1/admin/competitions          @Roles(PSL_ADMIN)
PUT  /api/v1/admin/competitions/:id      @Roles(PSL_ADMIN)
POST /api/v1/admin/seasons               @Roles(PSL_ADMIN)
PUT  /api/v1/admin/seasons/:id/current   @Roles(PSL_ADMIN)
```

**Response shape (Competition):**
```json
{
  "id": "uuid",
  "name": "DStv Premiership",
  "code": "PSL",
  "country": "ZA",
  "logoUrl": "https://..."
}
```

---

### DB Schema

```sql
-- schema: football

CREATE TABLE competitions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  code        TEXT NOT NULL UNIQUE,
  country     TEXT NOT NULL DEFAULT 'ZA',
  logo_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE seasons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id  UUID NOT NULL REFERENCES football.competitions(id),
  name            TEXT NOT NULL,
  year            INT NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  is_current      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (competition_id, year)
);

-- Only one current season per competition
CREATE UNIQUE INDEX idx_one_current_season
  ON seasons(competition_id)
  WHERE is_current = TRUE;
```

**Seed data required before Sprint 1 tests:**
```
PSL (DStv Premiership) — season 2025/26 — isCurrent=true
MTN8 (MTN8 Cup) — season 2025/26 — isCurrent=true
```

---

### Acceptance Criteria

```
AC-02-01: List competitions
  Given   PSL and MTN8 seeded
  When    GET /api/v1/competitions (authenticated)
  Then    200 with both competitions returned

AC-02-02: Current season
  Given   2025/26 season seeded with isCurrent=true
  When    GET /api/v1/competitions/PSL/seasons
  Then    200 with currentSeasonId pointing to 2025/26

AC-02-03: One current season enforced
  Given   PSL already has isCurrent=true season
  When    Admin sets a different season as current
  Then    Previous season isCurrent becomes false
  And     New season isCurrent is true

AC-02-04: Unauthenticated request rejected
  Given   no JWT provided
  When    GET /api/v1/competitions
  Then    401 returned
```

---

### Test Scenarios

```
Unit:
  [ ] seasonService.setCurrentSeason() clears previous isCurrent before setting new

Integration:
  [ ] Seed 2 competitions → GET /competitions returns both
  [ ] Set season as current → unique index prevents two current seasons
  [ ] 404 on unknown competition code
  [ ] Unauthenticated → 401
```

---

## STORY-03 — Football: Teams and Players

**As a** fan  
**I want to** view all PSL clubs and their player squads  
**So that** I can browse players when building my fantasy team

**Bounded context:** Football  
**Sprint days:** Days 2–4  
**Blocks:** STORY-05 (Fantasy needs player list)

---

### Domain Model

```
Club
  id            UUID
  name          String
  shortName     String       e.g. "Chiefs"
  code          String       e.g. "KAI" (3 letters)
  logoUrl       String?
  homeColour    String?      hex

ClubSeason                   ← club participates in a competition season
  id            UUID
  clubId        UUID → Club
  seasonId      UUID → Season
  externalId    String?      API-Football team ID

Player
  id            UUID
  clubId        UUID → Club   ← current club (for sprint 1; history later)
  firstName     String
  lastName      String
  position      Enum          GK | DEF | MID | FWD
  nationality   String?
  dateOfBirth   Date?
  shirtNumber   Int?
  photoUrl      String?
  externalId    String?       API-Football player ID
  isActive      Boolean       default true

FantasyPrice                  ← per player per season
  id            UUID
  playerId      UUID → Player
  seasonId      UUID → Season
  price         Int           in rand-millions × 10 (e.g. 85 = R8.5M)
```

**Rules:**
- Player belongs to exactly one current club (no transfer history in MVP)
- FantasyPrice must exist for a player before they can be added to a fantasy squad
- Position enum is fixed: GK, DEF, MID, FWD

---

### API Contract

```
GET /api/v1/competitions/:code/seasons/:seasonId/clubs
  Auth:   required
  200:    { clubs: Club[] }

GET /api/v1/clubs/:clubId
  Auth:   required
  200:    Club
  404:    { code: "CLUB_NOT_FOUND" }

GET /api/v1/clubs/:clubId/players
  Auth:   required
  Query:  ?position=GK|DEF|MID|FWD  (optional filter)
  200:    { players: PlayerWithPrice[] }

GET /api/v1/players
  Auth:   required
  Query:  ?seasonId=UUID&position=&clubId=&page=1&limit=50
  200:    { players: PlayerWithPrice[], total: Int, page: Int }

GET /api/v1/players/:playerId
  Auth:   required
  200:    PlayerWithPrice
  404:    { code: "PLAYER_NOT_FOUND" }
```

**PlayerWithPrice shape:**
```json
{
  "id": "uuid",
  "firstName": "Percy",
  "lastName": "Tau",
  "position": "MID",
  "shirtNumber": 11,
  "photoUrl": "...",
  "club": { "id": "uuid", "name": "Al Ahly", "shortName": "Ahly", "logoUrl": "..." },
  "fantasyPrice": 120,
  "fantasyPriceFormatted": "R12.0M"
}
```

---

### DB Schema

```sql
-- schema: football (continued)

CREATE TABLE clubs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  short_name   TEXT NOT NULL,
  code         CHAR(3) NOT NULL UNIQUE,
  logo_url     TEXT,
  home_colour  CHAR(7),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE club_seasons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id      UUID NOT NULL REFERENCES football.clubs(id),
  season_id    UUID NOT NULL REFERENCES football.seasons(id),
  external_id  TEXT,
  UNIQUE (club_id, season_id)
);

CREATE TABLE players (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id       UUID NOT NULL REFERENCES football.clubs(id),
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  position      TEXT NOT NULL CHECK (position IN ('GK','DEF','MID','FWD')),
  nationality   TEXT,
  date_of_birth DATE,
  shirt_number  INT,
  photo_url     TEXT,
  external_id   TEXT UNIQUE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_players_club    ON players(club_id);
CREATE INDEX idx_players_pos     ON players(position);
CREATE INDEX idx_players_active  ON players(is_active);

CREATE TABLE fantasy_prices (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id  UUID NOT NULL REFERENCES football.players(id),
  season_id  UUID NOT NULL REFERENCES football.seasons(id),
  price      INT NOT NULL,  -- in 0.1M units, e.g. 85 = R8.5M
  UNIQUE (player_id, season_id)
);
```

---

### Acceptance Criteria

```
AC-03-01: Club list for season
  Given   16 PSL clubs seeded for 2025/26 season
  When    GET /api/v1/competitions/PSL/seasons/:currentSeasonId/clubs
  Then    200 with 16 clubs, each with id/name/code/logoUrl

AC-03-02: Player list with fantasy price
  Given   players seeded with fantasy_prices for current season
  When    GET /api/v1/players?seasonId=:id&position=MID
  Then    200 with only MID players, each with fantasyPrice field

AC-03-03: Player without price excluded from fantasy context
  Given   player exists but has no fantasy_price for current season
  When    GET /api/v1/players?seasonId=:id
  Then    Player is NOT returned (cannot be selected for fantasy)

AC-03-04: Pagination
  When    GET /api/v1/players?page=2&limit=20
  Then    Returns players 21-40 with total count
```

---

### Test Scenarios

```
Unit:
  [ ] formatFantasyPrice(85) === "R8.5M"
  [ ] formatFantasyPrice(120) === "R12.0M"
  [ ] Position filter query builds correctly

Integration:
  [ ] Seed 3 clubs × 5 players → GET clubs returns 3, GET players returns 15
  [ ] Position filter reduces result set
  [ ] Player with no fantasy_price not in fantasy player list
  [ ] Pagination: 50 players, page=2&limit=20 returns items 21-40
```

---

## STORY-04 — Football: View Fixtures

**As a** fan  
**I want to** see upcoming and past PSL fixtures with scores  
**So that** I can follow the season and decide which matches to predict

**Bounded context:** Football  
**Sprint days:** Days 2–4 (parallel with STORY-03)  
**Blocks:** STORY-07 (GTS)

---

### Domain Model

```
Fixture
  id              UUID
  seasonId        UUID → Season
  homeClubId      UUID → Club
  awayClubId      UUID → Club
  kickoffAt       DateTime (UTC)
  status          Enum: SCHEDULED | LIVE | FINISHED | POSTPONED | CANCELLED
  homeScore       Int?   (null until FINISHED or LIVE)
  awayScore       Int?
  minute          Int?   (null unless LIVE)
  round           Int?   e.g. 12
  venue           String?
  externalId      String?  API-Football fixture ID
  manualOverride  Boolean  default false (locks out API-Football sync)
```

**Rules:**
- Score is null for SCHEDULED fixtures
- `manualOverride=true` means API-Football sync will not overwrite scores
- Status transitions: SCHEDULED → LIVE → FINISHED (or → POSTPONED/CANCELLED)

---

### API Contract

```
GET /api/v1/competitions/:code/seasons/:seasonId/fixtures
  Auth:   required
  Query:  ?status=SCHEDULED|LIVE|FINISHED&page=1&limit=20
  200:    { fixtures: Fixture[], total, page }

GET /api/v1/fixtures/:fixtureId
  Auth:   required
  200:    Fixture (with homeClub and awayClub embedded)
  404:    { code: "FIXTURE_NOT_FOUND" }

GET /api/v1/fixtures/live
  Auth:   required
  200:    { fixtures: Fixture[] }   -- all currently LIVE fixtures

-- Admin overrides --
PUT /api/v1/admin/fixtures/:id/score   @Roles(PSL_ADMIN)
  Body:   { homeScore: Int, awayScore: Int, status: "FINISHED" }
  200:    Fixture
  Note:   Sets manualOverride=true, writes AuditLog
          Fires OutboxEvent: football.fixture.finished

PUT /api/v1/admin/fixtures/:id/status  @Roles(PSL_ADMIN)
  Body:   { status: "POSTPONED" | "CANCELLED" | "LIVE" | "SCHEDULED" }
  200:    Fixture
```

**Fixture response shape:**
```json
{
  "id": "uuid",
  "kickoffAt": "2026-06-14T15:00:00Z",
  "status": "FINISHED",
  "homeScore": 2,
  "awayScore": 1,
  "round": 12,
  "homeClub": { "id": "uuid", "name": "Kaizer Chiefs", "code": "KAI", "logoUrl": "..." },
  "awayClub": { "id": "uuid", "name": "Orlando Pirates", "code": "ORL", "logoUrl": "..." }
}
```

---

### DB Schema

```sql
-- schema: football (continued)

CREATE TYPE fixture_status AS ENUM (
  'SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED', 'CANCELLED'
);

CREATE TABLE fixtures (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id        UUID NOT NULL REFERENCES football.seasons(id),
  home_club_id     UUID NOT NULL REFERENCES football.clubs(id),
  away_club_id     UUID NOT NULL REFERENCES football.clubs(id),
  kickoff_at       TIMESTAMPTZ NOT NULL,
  status           fixture_status NOT NULL DEFAULT 'SCHEDULED',
  home_score       INT,
  away_score       INT,
  minute           INT,
  round            INT,
  venue            TEXT,
  external_id      TEXT UNIQUE,
  manual_override  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (home_club_id <> away_club_id)
);

CREATE INDEX idx_fixtures_season    ON fixtures(season_id);
CREATE INDEX idx_fixtures_status    ON fixtures(status);
CREATE INDEX idx_fixtures_kickoff   ON fixtures(kickoff_at);
CREATE INDEX idx_fixtures_live      ON fixtures(status) WHERE status = 'LIVE';
```

**OutboxEvents:**
```
football.fixture.finished  → { fixtureId, homeScore, awayScore, seasonId }
football.fixture.live      → { fixtureId, kickoffAt }
```

---

### Acceptance Criteria

```
AC-04-01: List upcoming fixtures
  Given   fixtures seeded for current PSL season
  When    GET /api/v1/competitions/PSL/seasons/:id/fixtures?status=SCHEDULED
  Then    Only SCHEDULED fixtures returned, sorted by kickoffAt ascending

AC-04-02: Fixture with scores
  Given   a FINISHED fixture with homeScore=2, awayScore=1
  When    GET /api/v1/fixtures/:id
  Then    homeScore=2, awayScore=1 in response

AC-04-03: Admin score entry fires event
  Given   a SCHEDULED fixture
  When    PUT /api/v1/admin/fixtures/:id/score with { homeScore:2, awayScore:0, status:"FINISHED" }
  Then    Fixture status=FINISHED, homeScore=2, manualOverride=true
  And     OutboxEvent football.fixture.finished written
  And     AuditLog entry written with PSL_ADMIN userId

AC-04-04: Manual override prevents API sync
  Given   manualOverride=true on a fixture
  When    API-Football sync job runs
  Then    Fixture scores are NOT overwritten

AC-04-05: Live fixtures endpoint
  Given   2 fixtures with status=LIVE
  When    GET /api/v1/fixtures/live
  Then    Both returned (regardless of competition)
```

---

### Test Scenarios

```
Unit:
  [ ] isLive(fixture): true only when status=LIVE
  [ ] canSync(fixture): false when manualOverride=true

Integration:
  [ ] Filter by status=SCHEDULED excludes FINISHED fixtures
  [ ] Admin score entry: fixture updated + OutboxEvent created in same transaction
  [ ] AuditLog entry contains correct userId and resourceId
  [ ] Two different clubs required (CHECK constraint test)
```

---

## STORY-05 — Fantasy: Create a Squad

**As a** fan  
**I want to** pick 11 PSL players within a budget to form my fantasy squad  
**So that** I can compete with other fans for the week's best XI

**Bounded context:** Fantasy  
**Sprint days:** Days 3–6  
**Depends on:** STORY-01 (fan must be authenticated), STORY-03 (players with prices)

---

### Domain Model

```
Squad
  id          UUID
  fanId       UUID → Fan
  seasonId    UUID → Season
  name        String         default "My Team"
  createdAt   DateTime
  updatedAt   DateTime

SquadPick
  id            UUID
  squadId       UUID → Squad
  playerId      UUID → Player
  position      Enum: GK | DEF | MID | FWD  (starting position in squad)
  isCaptain     Boolean   exactly one per squad
  isActive      Boolean   true = in starting XI

-- MVP formation: 1 GK, 4 DEF, 3 MID, 3 FWD (4-3-3 fixed)
-- No bench for MVP Sprint 1
```

**Rules:**
- One squad per fan per season
- Exactly 11 players: 1 GK, 4 DEF, 3 MID, 3 FWD
- Total squad price ≤ 1000 (representing R100M at 0.1M units)
- Max 3 players from the same club
- Exactly 1 captain per squad
- Only players with a FantasyPrice for the current season are selectable

---

### API Contract

```
POST /api/v1/fantasy/squads
  Auth:   required
  Body:   {
            name?: String,
            picks: [
              { playerId: UUID, position: "GK"|"DEF"|"MID"|"FWD", isCaptain: boolean }
            ]
          }
  201:    Squad (with picks and playerDetails embedded)
  400:    { code: "VALIDATION_ERROR", violations: [...] }
          Possible violations:
            WRONG_FORMATION       (not 1-4-3-3)
            OVER_BUDGET           (total > R100M)
            CLUB_LIMIT_EXCEEDED   (> 3 from same club, clubName specified)
            NO_CAPTAIN            (isCaptain not set on exactly one pick)
            PLAYER_NOT_AVAILABLE  (player has no price for this season)
            SQUAD_EXISTS          (fan already has a squad this season)

GET /api/v1/fantasy/squads/mine
  Auth:   required
  Query:  ?seasonId=UUID
  200:    Squad (full, with picks and playerDetails)
  404:    { code: "NO_SQUAD" }
```

**Squad response shape:**
```json
{
  "id": "uuid",
  "name": "My Team",
  "totalPrice": 985,
  "totalPriceFormatted": "R98.5M",
  "picks": [
    {
      "position": "GK",
      "isCaptain": false,
      "player": { "id": "uuid", "firstName": "...", "lastName": "...",
                  "club": { "name": "...", "code": "..." }, "price": 70 }
    }
  ]
}
```

---

### DB Schema

```sql
-- schema: fantasy

CREATE TABLE squads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id      UUID NOT NULL,
  season_id   UUID NOT NULL,
  name        TEXT NOT NULL DEFAULT 'My Team',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (fan_id, season_id)
);

CREATE TABLE squad_picks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id    UUID NOT NULL REFERENCES fantasy.squads(id) ON DELETE CASCADE,
  player_id   UUID NOT NULL,
  position    TEXT NOT NULL CHECK (position IN ('GK','DEF','MID','FWD')),
  is_captain  BOOLEAN NOT NULL DEFAULT FALSE,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (squad_id, player_id)
);

-- Only one captain per squad
CREATE UNIQUE INDEX idx_one_captain
  ON squad_picks(squad_id)
  WHERE is_captain = TRUE;
```

**OutboxEvent on squad creation:**
```
fantasy.squad.created → { squadId, fanId, seasonId, totalPrice, picks: [playerId] }
```

---

### Acceptance Criteria

```
AC-05-01: Valid squad creation
  Given   11 players: 1 GK, 4 DEF, 3 MID, 3 FWD, total ≤ R100M, ≤ 3 per club
  When    POST /api/v1/fantasy/squads
  Then    201 returned with squad and all 11 picks
  And     OutboxEvent fantasy.squad.created written

AC-05-02: Formation violation
  Given   picks contain 2 GKs
  When    POST /api/v1/fantasy/squads
  Then    400 with violation WRONG_FORMATION

AC-05-03: Budget violation
  Given   total price of selected players > R100M
  When    POST /api/v1/fantasy/squads
  Then    400 with violation OVER_BUDGET

AC-05-04: Club limit violation
  Given   4 players from the same club
  When    POST /api/v1/fantasy/squads
  Then    400 with violation CLUB_LIMIT_EXCEEDED and clubName in message

AC-05-05: Duplicate squad
  Given   fan already has a squad for the current season
  When    POST /api/v1/fantasy/squads
  Then    400 with violation SQUAD_EXISTS

AC-05-06: Retrieve own squad
  Given   fan has an existing squad
  When    GET /api/v1/fantasy/squads/mine?seasonId=:id
  Then    200 with full squad including player details and prices
```

---

### Test Scenarios

```
Unit:
  [ ] validateFormation([1 GK, 4 DEF, 3 MID, 3 FWD]) = VALID
  [ ] validateFormation([2 GK, 3 DEF, 3 MID, 3 FWD]) = WRONG_FORMATION
  [ ] validateBudget(picks totalling 1001) = OVER_BUDGET
  [ ] validateClubLimit(4 players from same club) = CLUB_LIMIT_EXCEEDED
  [ ] calculateTotalPrice(picks) returns correct sum

Integration:
  [ ] Create valid squad → DB has 11 squad_picks + 1 OutboxEvent
  [ ] Unique index: second squad creation for same fan+season fails
  [ ] DB index: only one captain per squad (insert second captain → error)
  [ ] GET /mine with no squad → 404 with NO_SQUAD
```

---

## STORY-06 — Fantasy: Make Transfers

**As a** fan  
**I want to** swap players in and out of my squad  
**So that** I can respond to injuries and form

**Bounded context:** Fantasy  
**Sprint days:** Days 5–7  
**Depends on:** STORY-05 (squad exists)

---

### Domain Model

```
Transfer
  id            UUID
  squadId       UUID → Squad
  playerOutId   UUID → Player
  playerInId    UUID → Player
  isFree        Boolean    (first transfer in a gameweek window = free)
  pointCost     Int        0 if free, -4 if paid
  gameweekId    UUID → Gameweek
  createdAt     DateTime

Gameweek
  id            UUID
  seasonId      UUID → Season
  number        Int       e.g. 15
  deadlineAt    DateTime  ← transfers locked after this
  isActive      Boolean   one active gameweek at a time
```

**Rules:**
- 1 free transfer per gameweek (rolling, max 2 banked — MVP: no banking, just 1 free)
- Additional transfers cost -4 points each (deducted from gameweek score)
- Transfers locked after `deadlineAt` (typically Friday before matchday)
- A transfer must maintain the valid formation (swap same position)
- New player must have a FantasyPrice and must not already be in the squad

---

### API Contract

```
GET /api/v1/fantasy/gameweeks/active
  Auth:   required
  200:    { gameweek: Gameweek, freeTransfersRemaining: Int, deadlineAt: DateTime }

POST /api/v1/fantasy/squads/mine/transfers
  Auth:   required
  Body:   { playerOutId: UUID, playerInId: UUID }
  200:    { transfer: Transfer, squad: Squad (updated) }
  400:    { code: "TRANSFER_ERROR", reason: String }
          Reasons: DEADLINE_PASSED | POSITION_MISMATCH | PLAYER_ALREADY_IN_SQUAD
                   OVER_BUDGET_AFTER_TRANSFER | NO_SQUAD

GET /api/v1/fantasy/squads/mine/transfers
  Auth:   required
  Query:  ?gameweekId=UUID
  200:    { transfers: Transfer[], freeTransfersUsed: Int, pointDeductions: Int }
```

---

### DB Schema

```sql
-- schema: fantasy (continued)

CREATE TABLE gameweeks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id    UUID NOT NULL,
  number       INT NOT NULL,
  deadline_at  TIMESTAMPTZ NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (season_id, number)
);

CREATE UNIQUE INDEX idx_one_active_gameweek
  ON gameweeks(season_id)
  WHERE is_active = TRUE;

CREATE TABLE transfers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id        UUID NOT NULL REFERENCES fantasy.squads(id),
  player_out_id   UUID NOT NULL,
  player_in_id    UUID NOT NULL,
  is_free         BOOLEAN NOT NULL,
  point_cost      INT NOT NULL DEFAULT 0,
  gameweek_id     UUID NOT NULL REFERENCES fantasy.gameweeks(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transfers_squad    ON transfers(squad_id);
CREATE INDEX idx_transfers_gameweek ON transfers(gameweek_id);
```

---

### Acceptance Criteria

```
AC-06-01: Free transfer within deadline
  Given   active gameweek, deadline not passed, fan has 1 free transfer remaining
  When    POST transfer with valid playerOut/playerIn (same position, budget ok)
  Then    200, squad updated, isFree=true, pointCost=0

AC-06-02: Paid transfer
  Given   fan has already used free transfer this gameweek
  When    POST another transfer
  Then    200, isFree=false, pointCost=-4

AC-06-03: Deadline passed
  Given   gameweek deadline has passed
  When    POST transfer
  Then    400 with reason DEADLINE_PASSED

AC-06-04: Position mismatch
  Given   playerOut is GK, playerIn is MID
  When    POST transfer
  Then    400 with reason POSITION_MISMATCH

AC-06-05: Budget exceeded after transfer
  Given   playerIn has higher price that would push total over R100M
  When    POST transfer
  Then    400 with reason OVER_BUDGET_AFTER_TRANSFER
```

---

### Test Scenarios

```
Unit:
  [ ] isDeadlinePassed(gameweek with deadline 1h ago) = true
  [ ] countFreeTransfers(0 transfers this gameweek) = 1 free remaining
  [ ] countFreeTransfers(1 transfer this gameweek) = 0 free remaining

Integration:
  [ ] First transfer in gameweek → isFree=true, pointCost=0
  [ ] Second transfer in gameweek → isFree=false, pointCost=-4
  [ ] Transfer after deadline → 400
  [ ] Position mismatch → 400
  [ ] Squad reflects new player after transfer
```

---

## STORY-07 — GTS: Predict Scores

**As a** fan  
**I want to** predict the score of upcoming PSL fixtures  
**So that** I can earn points and compete on the leaderboard

**Bounded context:** GTS (Guess the Score)  
**Sprint days:** Days 4–7  
**Depends on:** STORY-01, STORY-04 (fixtures exist)

---

### Domain Model

```
Prediction
  id                  UUID
  fanId               UUID → Fan
  fixtureId           UUID → Fixture
  predictedHomeScore  Int (0–20)
  predictedAwayScore  Int (0–20)
  status              Enum: PENDING | SETTLED
  outcome             Enum?: EXACT_SCORE | CORRECT_RESULT | INCORRECT
  pointsEarned        Int?    null until settled
  createdAt           DateTime
```

**Scoring rules:**
- EXACT_SCORE (both scores correct): 10 points
- CORRECT_RESULT (right winner or correct draw, wrong score): 5 points
- INCORRECT (wrong result): 0 points

**Rules:**
- One prediction per fan per fixture
- Predictions locked when fixture `kickoffAt` ≤ NOW()
- Settled automatically when `football.fixture.finished` event received
- Cannot be edited or deleted once submitted

---

### API Contract

```
POST /api/v1/gts/predictions
  Auth:   required
  Body:   { fixtureId: UUID, predictedHomeScore: Int, predictedAwayScore: Int }
  201:    Prediction
  400:    { code: "GTS_ERROR", reason: String }
          Reasons: FIXTURE_NOT_FOUND | PREDICTIONS_LOCKED | DUPLICATE_PREDICTION
                   INVALID_SCORE (< 0 or > 20)

GET /api/v1/gts/predictions/mine
  Auth:   required
  Query:  ?seasonId=UUID&page=1&limit=20
  200:    { predictions: PredictionWithFixture[], total, page }

GET /api/v1/gts/predictions/mine/:fixtureId
  Auth:   required
  200:    PredictionWithFixture
  404:    { code: "PREDICTION_NOT_FOUND" }
```

**PredictionWithFixture shape:**
```json
{
  "id": "uuid",
  "predictedHomeScore": 2,
  "predictedAwayScore": 1,
  "status": "SETTLED",
  "outcome": "EXACT_SCORE",
  "pointsEarned": 10,
  "fixture": {
    "id": "uuid",
    "kickoffAt": "2026-06-14T15:00:00Z",
    "homeScore": 2,
    "awayScore": 1,
    "homeClub": { "name": "Kaizer Chiefs", "code": "KAI" },
    "awayClub": { "name": "Orlando Pirates", "code": "ORL" }
  }
}
```

---

### DB Schema

```sql
-- schema: gts

CREATE TYPE prediction_status AS ENUM ('PENDING', 'SETTLED');
CREATE TYPE prediction_outcome AS ENUM ('EXACT_SCORE', 'CORRECT_RESULT', 'INCORRECT');

CREATE TABLE predictions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id                UUID NOT NULL,
  fixture_id            UUID NOT NULL,
  predicted_home_score  INT NOT NULL CHECK (predicted_home_score BETWEEN 0 AND 20),
  predicted_away_score  INT NOT NULL CHECK (predicted_away_score BETWEEN 0 AND 20),
  status                prediction_status NOT NULL DEFAULT 'PENDING',
  outcome               prediction_outcome,
  points_earned         INT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (fan_id, fixture_id)
);

CREATE INDEX idx_predictions_fan     ON predictions(fan_id);
CREATE INDEX idx_predictions_fixture ON predictions(fixture_id);
CREATE INDEX idx_predictions_pending ON predictions(status) WHERE status = 'PENDING';
```

**OutboxEvents:**
```
gts.prediction.created  → { predictionId, fanId, fixtureId }
gts.prediction.settled  → { predictionId, fanId, outcome, pointsEarned }
```

Settlement handler (listens for `football.fixture.finished`):
```
For each PENDING prediction on this fixture:
  1. Determine outcome using actual scores
  2. Update prediction: status=SETTLED, outcome, pointsEarned
  3. Write OutboxEvent: gts.prediction.settled
```

---

### Acceptance Criteria

```
AC-07-01: Submit valid prediction
  Given   a SCHEDULED fixture, fan logged in, no existing prediction
  When    POST /api/v1/gts/predictions with valid scores
  Then    201 returned
  And     Prediction status=PENDING in DB
  And     OutboxEvent gts.prediction.created written

AC-07-02: Locked after kickoff
  Given   fixture kickoffAt is in the past
  When    POST /api/v1/gts/predictions
  Then    400 with reason PREDICTIONS_LOCKED

AC-07-03: Duplicate prediction
  Given   fan already has a prediction for this fixture
  When    POST /api/v1/gts/predictions for same fixture
  Then    400 with reason DUPLICATE_PREDICTION

AC-07-04: Settlement — exact score
  Given   fan predicted 2-1, actual result is 2-1
  When    football.fixture.finished event fires
  Then    prediction status=SETTLED, outcome=EXACT_SCORE, pointsEarned=10

AC-07-05: Settlement — correct result
  Given   fan predicted 2-1, actual result is 3-1 (Chiefs still won)
  When    football.fixture.finished event fires
  Then    outcome=CORRECT_RESULT, pointsEarned=5

AC-07-06: Settlement — incorrect
  Given   fan predicted 2-1, actual result is 1-1 (draw)
  When    football.fixture.finished event fires
  Then    outcome=INCORRECT, pointsEarned=0
```

---

### Test Scenarios

```
Unit:
  [ ] determineOutcome(predicted:2-1, actual:2-1) = EXACT_SCORE
  [ ] determineOutcome(predicted:2-1, actual:3-1) = CORRECT_RESULT
  [ ] determineOutcome(predicted:2-1, actual:0-0) = INCORRECT
  [ ] determineOutcome(predicted:1-1, actual:0-0) = CORRECT_RESULT (both draws)
  [ ] isLocked(kickoffAt: 1h ago) = true

Integration:
  [ ] Predict on SCHEDULED fixture → 201
  [ ] Predict on FINISHED fixture → 400 PREDICTIONS_LOCKED
  [ ] Two predictions on same fixture → 409 DUPLICATE_PREDICTION
  [ ] Settlement handler: 5 PENDING predictions → all become SETTLED
  [ ] Idempotency: calling settlement twice on same fixture → no duplicate settlements
```

---

## STORY-08 — Loyalty: Earn Points

**As a** fan  
**I want to** earn points for my platform activity  
**So that** my engagement is rewarded and reflected in my tier

**Bounded context:** Loyalty  
**Sprint days:** Days 5–8  
**Depends on:** STORY-01, STORY-07 (GTS settlement events)

---

### Domain Model

```
LoyaltyAccount
  id           UUID
  fanId        UUID (unique)
  totalPoints  Int   default 0
  tier         Enum: BRONZE | SILVER | GOLD | PLATINUM | SUPERFAN
  createdAt    DateTime

PointsTransaction   ← append-only ledger
  id          UUID
  accountId   UUID → LoyaltyAccount
  action      Enum: REGISTRATION | GTS_EXACT | GTS_CORRECT | GTS_INCORRECT
                    FANTASY_GAMEWEEK | DAILY_LOGIN
  points      Int    (always positive; 0 for INCORRECT)
  refId       UUID?  reference to source entity (predictionId, etc.)
  createdAt   DateTime
```

**Point values (MVP):**
```
REGISTRATION:      100 pts
GTS_EXACT:         10 pts
GTS_CORRECT:       5 pts
GTS_INCORRECT:     0 pts   (logged as 0 so history is complete)
DAILY_LOGIN:       5 pts   (once per calendar day SA time)
FANTASY_GAMEWEEK:  1 pt per fantasy point earned
```

**Tier thresholds:**
```
BRONZE:   0 – 999 pts
SILVER:   1,000 – 4,999 pts
GOLD:     5,000 – 19,999 pts
PLATINUM: 20,000 – 49,999 pts
SUPERFAN: 50,000+ pts
```

**Rules:**
- `PointsTransaction` is append-only — no UPDATE, no DELETE
- `LoyaltyAccount.totalPoints` is a computed aggregate, updated after every transaction
- Tier is recalculated after every totalPoints update
- Creating a transaction and updating `totalPoints` must be in the same DB transaction

---

### API Contract

```
(No new endpoints — account and balance are in STORY-09)
```

**Event listeners (internal — no HTTP):**
```
ON identity.fan.registered     → award 100 points (REGISTRATION)
ON gts.prediction.settled      → award points based on outcome
ON fantasy.gameweek.scored     → award 1pt per fantasy point (future, Sprint 2)
```

---

### DB Schema

```sql
-- schema: loyalty

CREATE TYPE loyalty_tier AS ENUM (
  'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'SUPERFAN'
);

CREATE TYPE points_action AS ENUM (
  'REGISTRATION', 'GTS_EXACT', 'GTS_CORRECT', 'GTS_INCORRECT',
  'FANTASY_GAMEWEEK', 'DAILY_LOGIN'
);

CREATE TABLE loyalty_accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fan_id        UUID NOT NULL UNIQUE,
  total_points  INT NOT NULL DEFAULT 0,
  tier          loyalty_tier NOT NULL DEFAULT 'BRONZE',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE points_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES loyalty.loyalty_accounts(id),
  action      points_action NOT NULL,
  points      INT NOT NULL CHECK (points >= 0),
  ref_id      UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- NO updated_at — immutable ledger
);

CREATE RULE no_update_transactions
  AS ON UPDATE TO points_transactions DO INSTEAD NOTHING;
CREATE RULE no_delete_transactions
  AS ON DELETE TO points_transactions DO INSTEAD NOTHING;

CREATE INDEX idx_pts_txn_account  ON points_transactions(account_id);
CREATE INDEX idx_pts_txn_ref      ON points_transactions(ref_id);
```

**OutboxEvent:**
```
loyalty.points.awarded → { fanId, action, points, newTotal, tier }
loyalty.tier.changed   → { fanId, previousTier, newTier }  (only when tier changes)
```

---

### Acceptance Criteria

```
AC-08-01: Registration points
  Given   fan.registered event fires
  When    loyalty handler processes event
  Then    LoyaltyAccount created with totalPoints=100, tier=BRONZE
  And     PointsTransaction with action=REGISTRATION, points=100 written

AC-08-02: GTS exact score points
  Given   gts.prediction.settled with outcome=EXACT_SCORE
  When    loyalty handler processes event
  Then    PointsTransaction with action=GTS_EXACT, points=10 written
  And     totalPoints incremented by 10

AC-08-03: Tier promotion
  Given   fan has totalPoints=990
  When    10 points awarded (GTS_EXACT)
  Then    totalPoints=1000, tier=SILVER (was BRONZE)
  And     loyalty.tier.changed OutboxEvent written

AC-08-04: Idempotency
  Given   same predictionId already has a GTS_EXACT transaction
  When    gts.prediction.settled fires again for same predictionId
  Then    No duplicate transaction created

AC-08-05: Ledger immutability
  Given   a PointsTransaction row exists
  When    DB UPDATE is attempted
  Then    Row unchanged (rule blocks UPDATE)
```

---

### Test Scenarios

```
Unit:
  [ ] calculateTier(999) = BRONZE
  [ ] calculateTier(1000) = SILVER
  [ ] calculateTier(4999) = SILVER
  [ ] calculateTier(5000) = GOLD
  [ ] pointsForOutcome(EXACT_SCORE) = 10
  [ ] pointsForOutcome(CORRECT_RESULT) = 5
  [ ] pointsForOutcome(INCORRECT) = 0

Integration:
  [ ] identity.fan.registered event → 100 pts awarded, account created
  [ ] gts.prediction.settled (EXACT) → 10 pts, account total updated
  [ ] Tier crosses 1000 → tier=SILVER + OutboxEvent loyalty.tier.changed
  [ ] Idempotency: duplicate event for same refId → only 1 transaction
  [ ] DB rule: UPDATE on points_transactions → no change
```

---

## STORY-09 — Wallet: View Points Balance

**As a** fan  
**I want to** see my current points balance and earning history  
**So that** I know how many points I have and how I earned them

**Bounded context:** Loyalty (wallet view is the loyalty balance for MVP; no ZAR wallet)  
**Sprint days:** Days 7–8  
**Depends on:** STORY-08

---

### Domain Model

No new entities — reads from `LoyaltyAccount` and `PointsTransaction`.

---

### API Contract

```
GET /api/v1/loyalty/me
  Auth:   required
  200:    {
            totalPoints: Int,
            tier: "BRONZE"|"SILVER"|"GOLD"|"PLATINUM"|"SUPERFAN",
            tierLabel: String,            e.g. "Bronze"
            nextTier: String?,            e.g. "Silver"
            pointsToNextTier: Int?,       e.g. 400
            tierProgressPct: Float        0.0 – 100.0
          }
  404:    { code: "NO_LOYALTY_ACCOUNT" }  (edge case: account not yet created)

GET /api/v1/loyalty/me/transactions
  Auth:   required
  Query:  ?page=1&limit=20
  200:    {
            transactions: [
              { id, action, points, actionLabel, createdAt }
            ],
            total, page
          }
```

**actionLabel mapping:**
```
REGISTRATION     → "Welcome bonus"
GTS_EXACT        → "GTS: Exact score prediction"
GTS_CORRECT      → "GTS: Correct result prediction"
GTS_INCORRECT    → "GTS: Incorrect prediction"
DAILY_LOGIN      → "Daily login bonus"
FANTASY_GAMEWEEK → "Fantasy gameweek score"
```

---

### DB Schema

No new tables. Uses `loyalty.loyalty_accounts` and `loyalty.points_transactions`.

---

### Acceptance Criteria

```
AC-09-01: View balance
  Given   fan has totalPoints=1250, tier=SILVER
  When    GET /api/v1/loyalty/me
  Then    totalPoints=1250, tier=SILVER, nextTier=GOLD, pointsToNextTier=3750

AC-09-02: Progress to next tier
  Given   fan at SUPERFAN (50000+ points)
  When    GET /api/v1/loyalty/me
  Then    nextTier=null, pointsToNextTier=null, tierProgressPct=100.0

AC-09-03: Transaction history
  Given   fan has 3 transactions (registration, 2x GTS)
  When    GET /api/v1/loyalty/me/transactions
  Then    3 transactions returned, newest first, with actionLabel

AC-09-04: No account edge case
  Given   loyalty account not yet created (race condition at registration)
  When    GET /api/v1/loyalty/me
  Then    404 with NO_LOYALTY_ACCOUNT (fan can retry after a moment)
```

---

### Test Scenarios

```
Unit:
  [ ] tierProgressPct(BRONZE, 500) = 50.0  (500/1000 to Silver)
  [ ] tierProgressPct(SILVER, 1000) = 0.0   (just hit Silver)
  [ ] tierProgressPct(SUPERFAN, 75000) = 100.0
  [ ] actionLabel(GTS_EXACT) = "GTS: Exact score prediction"

Integration:
  [ ] Fan with 1250 points → correct nextTier and pointsToNextTier
  [ ] Transactions sorted newest first
  [ ] Pagination: 25 transactions, page=2&limit=20 returns 5
```

---

## STORY-10 — Leaderboard

**As a** fan  
**I want to** see how I rank against other fans in GTS predictions  
**So that** I know where I stand and feel motivated to predict more

**Bounded context:** Cross-cutting (reads from GTS + Loyalty)  
**Sprint days:** Days 8–10  
**Depends on:** STORY-07 (GTS points), STORY-08 (total loyalty points)

---

### Domain Model

No new entities. Leaderboard is a computed read model derived from:
- `gts.predictions` (for GTS-specific leaderboard)
- `loyalty.loyalty_accounts` (for overall leaderboard)

**MVP leaderboard types:**
1. **GTS Weekly** — top fans by GTS points earned in the current gameweek
2. **GTS Overall** — top fans by total GTS points ever earned
3. **Overall** — top fans by total loyalty points (all actions)

---

### API Contract

```
GET /api/v1/leaderboard
  Auth:   required
  Query:  ?type=GTS_WEEKLY|GTS_OVERALL|OVERALL&limit=50
  200:    {
            type: String,
            entries: [
              {
                rank:         Int,
                fanId:        UUID,
                displayName:  String,
                tier:         String,
                points:       Int,
                isSelf:       Boolean   ← true for authenticated fan
              }
            ],
            myEntry: {      ← always present, even if rank > 50
              rank: Int,
              points: Int
            }
          }
```

**Notes:**
- `isSelf` flag lets the frontend highlight the current fan's row
- `myEntry` returned even if the fan is rank 5,000 (outside top 50)
- Leaderboard cached in-memory for 5 minutes (simple Map with TTL — no Redis)
- Ties broken by: (1) more predictions attempted, (2) earlier registration

---

### DB Schema

No new tables. Read-only queries:

```sql
-- GTS Overall leaderboard query shape
SELECT
  f.id           AS fan_id,
  f.display_name,
  la.tier,
  SUM(p.points_earned) AS gts_points
FROM gts.predictions p
JOIN identity.fans f ON f.id = p.fan_id
JOIN loyalty.loyalty_accounts la ON la.fan_id = p.fan_id
WHERE p.status = 'SETTLED'
GROUP BY f.id, f.display_name, la.tier
ORDER BY gts_points DESC
LIMIT 50;
```

**Note:** Cross-schema SELECT is permitted for read-only leaderboard queries (no JOIN in domain writes — only in this reporting query).

---

### Acceptance Criteria

```
AC-10-01: GTS Weekly leaderboard
  Given   3 fans with settled predictions in current gameweek
  When    GET /api/v1/leaderboard?type=GTS_WEEKLY
  Then    Entries ranked by GTS points earned this gameweek, descending

AC-10-02: Self highlighted
  Given   authenticated fan is rank 12
  When    GET /api/v1/leaderboard?type=GTS_OVERALL
  Then    Fan's entry has isSelf=true
  And     myEntry.rank=12

AC-10-03: Fan outside top 50
  Given   authenticated fan is rank 300, limit=50
  When    GET /api/v1/leaderboard?type=OVERALL
  Then    entries has 50 results, none is the fan
  And     myEntry.rank=300 is returned separately

AC-10-04: Empty leaderboard
  Given   no predictions have been settled yet
  When    GET /api/v1/leaderboard?type=GTS_WEEKLY
  Then    200 with entries=[], myEntry.rank=null
```

---

### Test Scenarios

```
Unit:
  [ ] breakTie: fan A (5 predictions) beats fan B (3 predictions) at same points
  [ ] myEntry included when fan rank > limit

Integration:
  [ ] 3 fans, different GTS scores → correct ranking
  [ ] isSelf=true on exactly one entry (or zero if fan not in top 50)
  [ ] Cache: two calls within 5min → same result (no DB query second time)
  [ ] type=INVALID_TYPE → 400
```

---

## Dependencies Map

```
STORY-01 (Identity)
  ↓ fan exists in DB
STORY-02 (Competitions)     STORY-03 (Players)         STORY-04 (Fixtures)
  ↓ seasonId known            ↓ playerIds + prices        ↓ fixtureId + kickoffAt
                            STORY-05 (Squad)            STORY-07 (Predictions)
                              ↓ squad exists              ↓ prediction.settled event
                            STORY-06 (Transfers)        STORY-08 (Loyalty points)
                                                          ↓ totalPoints updated
                                                        STORY-09 (Balance view)
                                                        STORY-10 (Leaderboard)
```

**Stories with no hard blockers (can start Day 1):**
- STORY-01, STORY-02, STORY-03, STORY-04 (all parallel, data foundation only)

**Stories requiring prior stories to be complete:**
- STORY-05 → needs STORY-03 (player list + prices)
- STORY-06 → needs STORY-05 (squad to transfer from)
- STORY-07 → needs STORY-04 (fixtures to predict on)
- STORY-08 → needs STORY-01 (fan events) + STORY-07 (GTS settled event)
- STORY-09 → needs STORY-08 (points to display)
- STORY-10 → needs STORY-07 + STORY-08 (both settled and points exist)

---

## Sprint Calendar

```
Day  Agent           Story
─────────────────────────────────────────────────────────────
 1   Identity        STORY-01 spec approved → backend begins
 1   Football        STORY-02 spec approved → backend begins
 1   Football        STORY-03 spec approved → backend begins
 1   Football        STORY-04 spec approved → backend begins
 2   Frontend        STORY-01 UI (register + login forms)
 3   Fantasy         STORY-05 spec approved → backend begins
 3   GTS             STORY-07 spec approved → backend begins
 4   Frontend        STORY-02 UI (competition/season browser)
 4   Frontend        STORY-04 UI (fixture list)
 5   Loyalty         STORY-08 spec approved → backend begins
 5   Fantasy         STORY-06 spec approved → backend begins
 5   Frontend        STORY-03 UI (player browser for squad)
 6   Frontend        STORY-05 UI (squad builder)
 7   Loyalty         STORY-09 spec approved → backend begins
 7   Leaderboard     STORY-10 spec approved → backend begins
 7   GTS             STORY-07 settlement tested end-to-end
 8   Frontend        STORY-07 UI (predictions + leaderboard)
 9   Frontend        STORY-09 UI (wallet / points balance)
 9   Frontend        STORY-10 UI (leaderboard)
10   All             Integration + E2E testing
```

---

## Definition of Done

A story is DONE when ALL of the following are true:

**Backend:**
- [ ] All acceptance criteria passing (verified with integration tests)
- [ ] All test scenarios implemented and green
- [ ] OutboxEvent(s) written for every state change
- [ ] AuditLog written for every admin or sensitive operation
- [ ] No cross-module Service imports (only EventEmitter2 or interfaces)
- [ ] Zod validation on all input shapes
- [ ] No raw SQL — Prisma queries only (except approved leaderboard aggregate)
- [ ] API response matches the contract shape exactly

**Frontend:**
- [ ] Matches API contract (no hardcoded data)
- [ ] Mobile layout valid at 375px
- [ ] No business logic in component code
- [ ] TanStack Query for all data fetching (correct query key used)
- [ ] Loading + error states handled

**Quality:**
- [ ] Unit test coverage ≥ 80% for the story's module
- [ ] Integration test covers happy path + at least 2 error paths
- [ ] Playwright E2E test covers the story's primary user flow
- [ ] No TypeScript errors (`pnpm tsc --noEmit`)
- [ ] `pnpm lint` passes

**POPIA (Identity story only):**
- [ ] ConsentRecord written on registration
- [ ] Age gate blocks under-18 (tested)
- [ ] DB rule prevents UPDATE on consent_records
- [ ] AuditLog written on data access endpoint

---

## Code Generation Policy

**No code is generated until the story's spec section above is approved.**

Workflow per story:
1. Programme Director reviews spec for this document
2. Approval given ("generate STORY-XX")
3. Agent generates one bounded context at a time
4. Code reviewed before next story begins

Stories may be approved in parallel if they have no dependency between them.
