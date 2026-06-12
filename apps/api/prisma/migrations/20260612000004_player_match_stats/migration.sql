-- CreateEnum
CREATE TYPE "player_match_stats_source" AS ENUM ('MANUAL', 'IMPORTED', 'PROVIDER', 'SYSTEM_DERIVED');

-- CreateEnum
CREATE TYPE "player_match_stats_status" AS ENUM ('DRAFT', 'VERIFIED', 'PUBLISHED', 'LOCKED');

-- CreateTable
CREATE TABLE "player_match_stats" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "team_id" TEXT,
    "season_id" TEXT NOT NULL,
    "gameweek_id" TEXT,
    "status" "player_match_stats_status" NOT NULL DEFAULT 'DRAFT',
    "source" "player_match_stats_source" NOT NULL DEFAULT 'MANUAL',
    "minutes_played" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "own_goals" INTEGER NOT NULL DEFAULT 0,
    "yellow_cards" INTEGER NOT NULL DEFAULT 0,
    "red_cards" INTEGER NOT NULL DEFAULT 0,
    "penalties_missed" INTEGER NOT NULL DEFAULT 0,
    "penalties_saved" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "goals_conceded" INTEGER NOT NULL DEFAULT 0,
    "clean_sheet" BOOLEAN NOT NULL DEFAULT false,
    "started" BOOLEAN NOT NULL DEFAULT false,
    "came_on_minute" INTEGER,
    "subbed_off_minute" INTEGER,
    "shots_on_target" INTEGER NOT NULL DEFAULT 0,
    "shots_total" INTEGER NOT NULL DEFAULT 0,
    "key_passes" INTEGER NOT NULL DEFAULT 0,
    "tackles_won" INTEGER NOT NULL DEFAULT 0,
    "interceptions" INTEGER NOT NULL DEFAULT 0,
    "blocked_shots" INTEGER NOT NULL DEFAULT 0,
    "aerial_duels_won" INTEGER NOT NULL DEFAULT 0,
    "distance_run" DOUBLE PRECISION,
    "pass_accuracy" DOUBLE PRECISION,
    "dribble_success" DOUBLE PRECISION,
    "rating" DOUBLE PRECISION,
    "did_not_play" BOOLEAN NOT NULL DEFAULT false,
    "provider_stat_id" TEXT,
    "notes" TEXT,
    "verified_at" TIMESTAMP(3),
    "verified_by_user_id" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_match_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "player_match_stats_player_id_fixture_id_key" ON "player_match_stats"("player_id", "fixture_id");

-- AddForeignKey
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_gameweek_id_fkey" FOREIGN KEY ("gameweek_id") REFERENCES "gameweeks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
