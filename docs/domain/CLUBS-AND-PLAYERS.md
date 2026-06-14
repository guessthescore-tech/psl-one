# PSL One — Clubs and Players Domain

**Purpose:** Club experience, squad management, and player data  
**Audience:** Backend engineers, product  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Domain Overview

Modules: `ClubExperienceModule`, `PlayersModule`, `TeamsModule`

---

## Clubs

### 16 PSL Clubs (Seeded)

- Kaizer Chiefs
- Orlando Pirates
- Mamelodi Sundowns
- SuperSport United
- Cape Town City
- AmaZulu
- Stellenbosch FC
- Sekhukhune United
- TS Galaxy
- Royal AM
- Chippa United
- Swallows FC
- Baroka FC
- Maritzburg United
- Golden Arrows
- Black Leopards

### ClubProfile

Each club has a `ClubProfile` record:

| Field | Description |
|-------|-------------|
| `teamId` | Club reference |
| `bio` | Club description |
| `socialLinks` | JSON social media links |
| `badgeUrl` | Club badge image URL |

### ClubNews

Admin-managed news articles per club:

| Field | Description |
|-------|-------------|
| `teamId` | Club reference |
| `title` | Article title |
| `body` | Article body |
| `publishedAt` | Publish timestamp |

### ClubFanFollow

Fans can follow clubs:

| Field | Description |
|-------|-------------|
| `userId` | Fan reference |
| `teamId` | Club reference |

### Important

`ClubExperienceModule` requires `AuthModule` in its imports — this is not optional. Without it, `JwtAuthGuard` is not resolvable at runtime.

---

## Players

### Player Model

| Field | Description |
|-------|-------------|
| `id` | UUID |
| `externalId` | External data provider ID (non-unique!) |
| `name` | Full name |
| `position` | `GK`, `DEF`, `MID`, `FWD` |
| `teamId` | Current team |
| `nationality` | Player nationality |

### `externalId` Non-Uniqueness

`Player.externalId` is not a unique constraint. Multiple players can share the same `externalId` across different seasons or import batches.

**Always use `findFirst` with season scope, never `findUnique` by `externalId`:**

```typescript
const player = await this.prisma.player.findFirst({
  where: { externalId, seasonTeamPlayers: { some: { seasonId } } },
});
```

### SeasonTeamPlayer

Season-scoped player record with Fantasy price:

| Field | Description |
|-------|-------------|
| `seasonId` | Season reference |
| `playerId` | Player reference |
| `teamId` | Team reference |
| `price` | Fantasy price in millions |
| `status` | `AVAILABLE`, `INJURED`, `SUSPENDED` |

---

## Squad Import

`SquadImportModule` handles bulk squad data ingestion:

1. Admin creates import batch: `POST /admin/squad-import/batches`
2. Admin adds player rows: `POST /admin/squad-import/batches/:id/rows`
3. System validates each row
4. Admin processes batch: `POST /admin/squad-import/batches/:id/process`
5. Players and `SeasonTeamPlayer` records upserted

Status: Batch can be `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`.

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/clubs` | Fan | List PSL clubs |
| GET | `/clubs/:id` | Fan | Club profile |
| GET | `/clubs/:id/squad` | Fan | Club squad |
| GET | `/clubs/:id/news` | Fan | Club news |
| POST | `/clubs/:id/follow` | Fan | Follow a club |
| GET | `/players` | Fan | Browse players |
| GET | `/players/:id` | Fan | Player profile |
| GET | `/admin/clubs` | Admin | All clubs |
| POST | `/admin/clubs` | Admin | Create club |
| PATCH | `/admin/clubs/:id` | Admin | Update club |
| POST | `/admin/clubs/:id/news` | Admin | Post club news |
| GET | `/admin/players` | Admin | All players |
| POST | `/admin/players` | Admin | Create player |
| PATCH | `/admin/players/:id` | Admin | Update player |
| GET | `/admin/squad-import/batches` | Admin | Import batches |
| POST | `/admin/squad-import/batches` | Admin | Start import |
| POST | `/admin/squad-import/batches/:id/process` | Admin | Process batch |
