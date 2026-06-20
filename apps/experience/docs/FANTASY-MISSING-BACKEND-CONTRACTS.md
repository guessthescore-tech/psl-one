# Missing Backend Contracts — PSL One Experience

These endpoints do not yet exist in the PSL One NestJS API. Each entry documents
the expected HTTP contract so that the backend team can implement them, and
lists which frontend screens are currently blocked.

Mock/static data fills each gap in `DESIGN_REVIEW_DATA` mode. When the endpoint
exists, switch the screen to `LIVE_BETA_DATA` mode and call the real API.

---

## 1. GET /fantasy/fixture-difficulty

**Purpose:** Fixture Difficulty Rating (FDR) — per-club difficulty scores for
upcoming gameweeks, pre-computed by the backend using recent form, opposition
strength, home/away factor, and venue stats. The frontend must not compute FDR
itself (business logic stays in the backend per CLAUDE.md rule).

**Auth:** PUBLIC

**Query params:**
```
seasonId    string   required   Active season ID
gameweeks   number   optional   How many upcoming gameweeks to return (default 5, max 10)
```

**Response shape:**
```json
[
  {
    "teamId": "string",
    "teamName": "string",
    "teamSlug": "string",
    "fixtures": [
      {
        "gameweekId": "string",
        "gameweekNumber": 4,
        "opponentId": "string",
        "opponentShortName": "GER",
        "isHome": true,
        "difficulty": 3
      }
    ]
  }
]
```
`difficulty` is an integer 1–5 (1 = easiest, 5 = hardest).

**Screens unblocked when implemented:**
- `/fantasy/fdr` — Fixture Difficulty Rating table
- `/fantasy/player-pool` — FDR column next to player rows
- `/fantasy/transfers` — difficulty hint beside recommended transfers

**Current workaround:** `FANTASY_MOCK_FDR` in `data.ts`.

---

## 2. GET /fantasy/teams/:teamId/public

**Purpose:** Read another manager's fantasy team (public view). Needed for
rival team inspection and head-to-head comparison within leagues.

**Auth:** PUBLIC (any authenticated or unauthenticated user can view; server
should not expose private league invite codes or user email in this response).

**Path params:**
```
teamId   string   required   Fantasy team ID (from league standings row)
```

**Response shape:**
```json
{
  "id": "string",
  "name": "string",
  "managerDisplayName": "string",
  "formation": "4-3-3",
  "totalPoints": 347,
  "players": [
    {
      "playerId": "string",
      "playerName": "string",
      "position": "MIDFIELDER",
      "squadRole": "STARTER",
      "benchSlot": null,
      "isCaptain": false,
      "isViceCaptain": true,
      "teamShortName": "FRA"
    }
  ]
}
```

**Screens unblocked when implemented:**
- `/fantasy/leagues/:id/standings` — tap a manager row to view their squad
- `/fantasy/h2h/:roundId` — H2H matchup detail page

---

## 3. GET /fantasy/search

**Purpose:** Full-text search for managers by display name or team name.
Needed for the "find a friend" flow when joining or creating a private league.

**Auth:** AUTH

**Query params:**
```
q          string   required   Search term (min 2 characters)
seasonId   string   optional   Scope to a specific season
limit      number   optional   Max results (default 10, max 50)
```

**Response shape:**
```json
[
  {
    "fantasyTeamId": "string",
    "teamName": "string",
    "managerDisplayName": "string",
    "totalPoints": 312,
    "rank": 10423
  }
]
```

**Screens unblocked when implemented:**
- `/fantasy/leagues/invite` — search for a manager before sending an invite
- `/fantasy/leagues/:id/members` — search members within a large league

---

## 4. GET /stats/compare

**Purpose:** Side-by-side player stat comparison. The backend should join
player match stats and season stats for two players so the frontend does not
perform cross-player data merges (violates "no business logic in frontend").

**Auth:** PUBLIC

**Query params:**
```
playerA    string   required   Player ID
playerB    string   required   Player ID
seasonId   string   optional   Season scope (defaults to active season)
```

**Response shape:**
```json
{
  "seasonId": "string",
  "players": [
    {
      "playerId": "string",
      "playerName": "string",
      "teamShortName": "string",
      "position": "FORWARD",
      "appearances": 8,
      "minutesPlayed": 620,
      "goals": 5,
      "assists": 2,
      "yellowCards": 1,
      "redCards": 0,
      "cleanSheets": 0,
      "saves": 0,
      "fantasyPoints": 94,
      "fantasyPrice": 13.0
    }
  ]
}
```

**Screens unblocked when implemented:**
- `/players/compare` — two-column player comparison page
- `/fantasy/player-pool` — "compare" action on player card

---

## 5. POST /auth/password/change

**Purpose:** In-session password change (current password + new password).
Distinct from the unauthenticated password-reset flow (`/auth/password-reset/*`)
because the fan is already logged in and knows their current password.

**Auth:** AUTH

**Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response:** `200 OK` `{ message: "Password changed successfully" }`

**Error cases:**
- `400` — `{ message: "Current password is incorrect" }`
- `400` — `{ message: "New password does not meet requirements" }`
- `401` — token invalid

**Screens unblocked when implemented:**
- `/settings/security` — Change password form
- Onboarding step 3 (set a permanent password after social login)

---

## 6. DELETE /auth/account

**Purpose:** POPIA-compliant self-service account deletion. The fan requests
permanent deletion of their personal data. The backend must:
1. Anonymise PII (name, email, phone, date of birth)
2. Retain audit and transaction records with anonymised user ID
3. Publish a `fan.account.deleted` Kafka event
4. Return 200 — the client clears the local token.

**Auth:** AUTH

**Body:**
```json
{
  "confirmationText": "DELETE MY ACCOUNT"
}
```
Server must validate `confirmationText === "DELETE MY ACCOUNT"` to prevent
accidental deletion.

**Response:** `200 OK` `{ message: "Account deletion scheduled" }`

**Error cases:**
- `400` — `{ message: "Confirmation text does not match" }`
- `401` — token invalid

**Screens unblocked when implemented:**
- `/settings/account` — Delete account section
- POPIA compliance screen (required for app store submission)

---

## 7. POST /fan-value/scan

**Purpose:** QR code / NFC stadium badge scan to credit fan-value points for
physical attendance. The frontend captures the scan payload from the device
camera/NFC reader and POSTs it for server-side verification. The backend must
validate the scan token (signed, time-limited), credit attendance points, and
publish a `fan-value.attendance.credited` Kafka event.

**Auth:** AUTH

**Body:**
```json
{
  "scanPayload": "string",
  "scanType": "QR_CODE | NFC",
  "idempotencyKey": "string"
}
```
`scanPayload` is a signed token issued by the PSL stadium operations system.

**Response:**
```json
{
  "credited": true,
  "pointsAwarded": 500,
  "newTotal": 6740,
  "venue": "FNB Stadium",
  "match": "Kaizer Chiefs vs Orlando Pirates",
  "badgeAwarded": {
    "id": "string",
    "name": "Match Day Warrior",
    "imageUrl": "string"
  } | null
}
```

**Error cases:**
- `400` — `{ message: "Scan token expired" }` (token older than 15 minutes)
- `409` — `{ message: "Attendance already credited for this fixture" }` (idempotency)
- `422` — `{ message: "Invalid scan payload" }`

**Screens unblocked when implemented:**
- `/scan` — QR/NFC scanner page
- `/match-day` — in-stadium match day experience hub
- Fan value breakdown — attendance category

---

## 8. GET /quiz/:quizId

**Purpose:** Fetch a published quiz (prediction or trivia) for the fan to
answer. The backend owns the question set, correct answers, and point values.
The frontend renders the quiz UI from this response — it must not hard-code
questions or compute scores client-side.

**Auth:** PUBLIC (fetch quiz structure); POST /quiz/:quizId/submit requires AUTH.

**Path params:**
```
quizId   string   required   Quiz ID (from notifications or campaign payload)
```

**Response shape:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "type": "TRIVIA | PREDICTION | POLL",
  "status": "OPEN | CLOSED | RESULTS_PUBLISHED",
  "closeAt": "2026-06-21T14:00:00Z",
  "pointsPerCorrectAnswer": 50,
  "questions": [
    {
      "id": "string",
      "text": "Who will score first in the France vs Germany match?",
      "type": "SINGLE_CHOICE | MULTIPLE_CHOICE | FREE_TEXT",
      "options": [
        { "id": "string", "text": "Kylian Mbappe" },
        { "id": "string", "text": "Antoine Griezmann" },
        { "id": "string", "text": "Thomas Muller" }
      ],
      "imageUrl": null
    }
  ]
}
```

**Associated submission endpoint (also missing):**

`POST /quiz/:quizId/submit`  
**Auth:** AUTH  
**Body:** `{ answers: [{ questionId: string; optionId?: string; freeText?: string }] }`  
**Response:** `{ submitted: true; pointsPending: number }`

**Screens unblocked when implemented:**
- `/quiz/:id` — Quiz page (in-app trivia, match prediction quizzes)
- `/campaigns/:id` — Sponsor campaign quiz engagement
- Notification deep-link: `/quiz/:id` (notification-driven engagement)
