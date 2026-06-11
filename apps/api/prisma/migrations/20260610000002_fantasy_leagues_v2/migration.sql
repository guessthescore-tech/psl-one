-- CreateEnum
CREATE TYPE "FantasyLeagueMemberRole" AS ENUM ('OWNER', 'MEMBER');
CREATE TYPE "FantasyCupStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETE');

-- AlterTable fantasy_leagues: make created_by_id nullable, add new columns
ALTER TABLE "fantasy_leagues"
  ALTER COLUMN "created_by_id" DROP NOT NULL,
  ADD COLUMN "is_joinable" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "starts_gameweek_id" TEXT,
  ADD COLUMN "max_members" INTEGER;

-- AlterTable fantasy_league_members: add role, leftAt; change unique constraint
ALTER TABLE "fantasy_league_members"
  ADD COLUMN "left_at" TIMESTAMP(3),
  ADD COLUMN "role" "FantasyLeagueMemberRole" NOT NULL DEFAULT 'MEMBER';

-- Drop old unique index on (league_id, user_id)
DROP INDEX IF EXISTS "fantasy_league_members_league_id_user_id_key";

-- Create new unique index on (league_id, fantasy_team_id)
CREATE UNIQUE INDEX "fantasy_league_members_league_id_fantasy_team_id_key"
  ON "fantasy_league_members"("league_id", "fantasy_team_id");

-- AlterTable fantasy_cups: add league_id, status, starts/ends gameweek
ALTER TABLE "fantasy_cups"
  ADD COLUMN "league_id" TEXT,
  ADD COLUMN "status" "FantasyCupStatus" NOT NULL DEFAULT 'UPCOMING',
  ADD COLUMN "starts_gameweek_id" TEXT,
  ADD COLUMN "ends_gameweek_id" TEXT;

-- AddForeignKey: fantasy_leagues.starts_gameweek_id -> gameweeks.id
ALTER TABLE "fantasy_leagues"
  ADD CONSTRAINT "fantasy_leagues_starts_gameweek_id_fkey"
  FOREIGN KEY ("starts_gameweek_id") REFERENCES "gameweeks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: fantasy_cups.league_id -> fantasy_leagues.id
ALTER TABLE "fantasy_cups"
  ADD CONSTRAINT "fantasy_cups_league_id_fkey"
  FOREIGN KEY ("league_id") REFERENCES "fantasy_leagues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: fantasy_cups.starts_gameweek_id -> gameweeks.id
ALTER TABLE "fantasy_cups"
  ADD CONSTRAINT "fantasy_cups_starts_gameweek_id_fkey"
  FOREIGN KEY ("starts_gameweek_id") REFERENCES "gameweeks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: fantasy_cups.ends_gameweek_id -> gameweeks.id
ALTER TABLE "fantasy_cups"
  ADD CONSTRAINT "fantasy_cups_ends_gameweek_id_fkey"
  FOREIGN KEY ("ends_gameweek_id") REFERENCES "gameweeks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
