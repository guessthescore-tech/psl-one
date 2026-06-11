-- CreateEnum
CREATE TYPE "MatchEventType" AS ENUM ('GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION', 'KICKOFF', 'HALF_TIME', 'FULL_TIME', 'VAR', 'OTHER');

-- CreateEnum
CREATE TYPE "LineupStatus" AS ENUM ('STARTING', 'SUBSTITUTE', 'UNAVAILABLE', 'INJURED', 'SUSPENDED', 'NOT_IN_SQUAD');

-- AlterEnum
ALTER TYPE "FixtureStatus" ADD VALUE 'HALF_TIME';

-- AlterTable
ALTER TABLE "fixtures" ADD COLUMN     "current_minute" INTEGER,
ADD COLUMN     "last_updated_at" TIMESTAMP(3),
ADD COLUMN     "period" TEXT;

-- CreateTable
CREATE TABLE "match_events" (
    "id" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "team_id" TEXT,
    "player_id" TEXT,
    "minute" INTEGER NOT NULL,
    "event_type" "MatchEventType" NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixture_lineups" (
    "id" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "status" "LineupStatus" NOT NULL DEFAULT 'STARTING',
    "shirt_number" INTEGER,
    "position" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fixture_lineups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fixture_lineups_fixture_id_team_id_player_id_key" ON "fixture_lineups"("fixture_id", "team_id", "player_id");

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixture_lineups" ADD CONSTRAINT "fixture_lineups_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixture_lineups" ADD CONSTRAINT "fixture_lineups_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixture_lineups" ADD CONSTRAINT "fixture_lineups_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
