-- CreateEnum
CREATE TYPE "CompetitionFormat" AS ENUM ('LEAGUE', 'CUP', 'TOURNAMENT', 'HYBRID');

-- CreateEnum
CREATE TYPE "StageType" AS ENUM ('LEAGUE', 'GROUP', 'KNOCKOUT', 'FINAL', 'PLAYOFF');

-- AlterTable: add format fields to competitions
ALTER TABLE "competitions"
  ADD COLUMN "format"               "CompetitionFormat" NOT NULL DEFAULT 'LEAGUE',
  ADD COLUMN "team_count"           INTEGER,
  ADD COLUMN "has_groups"           BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "has_knockouts"        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "has_home_away"        BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "uses_neutral_venues"  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "points_for_win"       INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN "points_for_draw"      INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "points_for_loss"      INTEGER NOT NULL DEFAULT 0;

-- CreateTable: competition_stages
CREATE TABLE "competition_stages" (
    "id"             TEXT NOT NULL,
    "competition_id" TEXT NOT NULL,
    "name"           TEXT NOT NULL,
    "slug"           TEXT NOT NULL,
    "type"           "StageType" NOT NULL,
    "order"          INTEGER NOT NULL,
    "starts_at"      TIMESTAMP(3),
    "ends_at"        TIMESTAMP(3),
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competition_stages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "competition_stages_competition_id_slug_key" ON "competition_stages"("competition_id", "slug");

ALTER TABLE "competition_stages"
  ADD CONSTRAINT "competition_stages_competition_id_fkey"
  FOREIGN KEY ("competition_id") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: add format-related fields to fixtures
ALTER TABLE "fixtures"
  ADD COLUMN "stage_id"               TEXT,
  ADD COLUMN "is_neutral_venue"        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "leg_number"             INTEGER,
  ADD COLUMN "aggregate_home_score"   INTEGER,
  ADD COLUMN "aggregate_away_score"   INTEGER,
  ADD COLUMN "extra_time_home_score"  INTEGER,
  ADD COLUMN "extra_time_away_score"  INTEGER,
  ADD COLUMN "penalties_home_score"   INTEGER,
  ADD COLUMN "penalties_away_score"   INTEGER;

ALTER TABLE "fixtures"
  ADD CONSTRAINT "fixtures_stage_id_fkey"
  FOREIGN KEY ("stage_id") REFERENCES "competition_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
