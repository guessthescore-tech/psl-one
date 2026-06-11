-- CreateEnum
CREATE TYPE "FantasyChipType" AS ENUM ('BENCH_BOOST', 'FREE_HIT', 'TRIPLE_CAPTAIN', 'WILDCARD');

-- CreateEnum
CREATE TYPE "FantasyChipStatus" AS ENUM ('AVAILABLE', 'ACTIVE', 'USED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "FantasyLeagueType" AS ENUM ('PRIVATE', 'PUBLIC', 'GLOBAL');

-- CreateEnum
CREATE TYPE "FantasyLeagueScoringType" AS ENUM ('CLASSIC', 'HEAD_TO_HEAD');

-- CreateEnum
CREATE TYPE "FantasyHeadToHeadStatus" AS ENUM ('SCHEDULED', 'COMPLETE', 'VOID');

-- CreateEnum
CREATE TYPE "FantasyCupTieStatus" AS ENUM ('SCHEDULED', 'COMPLETE', 'VOID');

-- AlterTable fantasy_teams
ALTER TABLE "fantasy_teams"
  ADD COLUMN "free_transfers_available" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "has_passed_first_deadline" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "total_transfer_deductions" INTEGER NOT NULL DEFAULT 0;

-- AlterTable fantasy_transfers
ALTER TABLE "fantasy_transfers"
  ADD COLUMN "gameweek_id" TEXT,
  ADD COLUMN "transfer_cost" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "is_free_transfer" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "counts_toward_limit" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "chip_context" TEXT;

-- AddForeignKey fantasy_transfers -> gameweeks
ALTER TABLE "fantasy_transfers" ADD CONSTRAINT "fantasy_transfers_gameweek_id_fkey"
  FOREIGN KEY ("gameweek_id") REFERENCES "gameweeks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable fantasy_chips
CREATE TABLE "fantasy_chips" (
  "id" TEXT NOT NULL,
  "fantasy_team_id" TEXT NOT NULL,
  "type" "FantasyChipType" NOT NULL,
  "status" "FantasyChipStatus" NOT NULL DEFAULT 'AVAILABLE',
  "gameweek_id" TEXT,
  "activated_at" TIMESTAMP(3),
  "cancelled_at" TIMESTAMP(3),
  "used_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fantasy_chips_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fantasy_chips_fantasy_team_id_type_key" ON "fantasy_chips"("fantasy_team_id", "type");

ALTER TABLE "fantasy_chips" ADD CONSTRAINT "fantasy_chips_fantasy_team_id_fkey"
  FOREIGN KEY ("fantasy_team_id") REFERENCES "fantasy_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "fantasy_chips" ADD CONSTRAINT "fantasy_chips_gameweek_id_fkey"
  FOREIGN KEY ("gameweek_id") REFERENCES "gameweeks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable fantasy_free_hit_snapshots
CREATE TABLE "fantasy_free_hit_snapshots" (
  "id" TEXT NOT NULL,
  "fantasy_team_id" TEXT NOT NULL,
  "gameweek_id" TEXT NOT NULL,
  "snapshot_json" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fantasy_free_hit_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fantasy_free_hit_snapshots_fantasy_team_id_gameweek_id_key"
  ON "fantasy_free_hit_snapshots"("fantasy_team_id", "gameweek_id");

ALTER TABLE "fantasy_free_hit_snapshots" ADD CONSTRAINT "fantasy_free_hit_snapshots_fantasy_team_id_fkey"
  FOREIGN KEY ("fantasy_team_id") REFERENCES "fantasy_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "fantasy_free_hit_snapshots" ADD CONSTRAINT "fantasy_free_hit_snapshots_gameweek_id_fkey"
  FOREIGN KEY ("gameweek_id") REFERENCES "gameweeks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable fantasy_gameweek_lineup_snapshots
CREATE TABLE "fantasy_gameweek_lineup_snapshots" (
  "id" TEXT NOT NULL,
  "fantasy_team_id" TEXT NOT NULL,
  "gameweek_id" TEXT NOT NULL,
  "snapshot_json" JSONB NOT NULL,
  "auto_subs_applied" BOOLEAN NOT NULL DEFAULT false,
  "auto_subs_log" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fantasy_gameweek_lineup_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fantasy_gameweek_lineup_snapshots_fantasy_team_id_gameweek_id_key"
  ON "fantasy_gameweek_lineup_snapshots"("fantasy_team_id", "gameweek_id");

ALTER TABLE "fantasy_gameweek_lineup_snapshots" ADD CONSTRAINT "fantasy_gameweek_lineup_snapshots_fantasy_team_id_fkey"
  FOREIGN KEY ("fantasy_team_id") REFERENCES "fantasy_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "fantasy_gameweek_lineup_snapshots" ADD CONSTRAINT "fantasy_gameweek_lineup_snapshots_gameweek_id_fkey"
  FOREIGN KEY ("gameweek_id") REFERENCES "gameweeks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable fantasy_player_prices
CREATE TABLE "fantasy_player_prices" (
  "id" TEXT NOT NULL,
  "player_id" TEXT NOT NULL,
  "season_id" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fantasy_player_prices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fantasy_player_prices_player_id_season_id_key" ON "fantasy_player_prices"("player_id", "season_id");

ALTER TABLE "fantasy_player_prices" ADD CONSTRAINT "fantasy_player_prices_player_id_fkey"
  FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "fantasy_player_prices" ADD CONSTRAINT "fantasy_player_prices_season_id_fkey"
  FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable fantasy_player_price_history
CREATE TABLE "fantasy_player_price_history" (
  "id" TEXT NOT NULL,
  "player_id" TEXT NOT NULL,
  "season_id" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fantasy_player_price_history_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "fantasy_player_price_history" ADD CONSTRAINT "fantasy_player_price_history_player_id_fkey"
  FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable fantasy_player_match_stats
CREATE TABLE "fantasy_player_match_stats" (
  "id" TEXT NOT NULL,
  "player_id" TEXT NOT NULL,
  "fixture_id" TEXT NOT NULL,
  "minutes_played" INTEGER NOT NULL DEFAULT 0,
  "goals" INTEGER NOT NULL DEFAULT 0,
  "assists" INTEGER NOT NULL DEFAULT 0,
  "own_goals" INTEGER NOT NULL DEFAULT 0,
  "yellow_cards" INTEGER NOT NULL DEFAULT 0,
  "red_cards" INTEGER NOT NULL DEFAULT 0,
  "penalties_missed" INTEGER NOT NULL DEFAULT 0,
  "penalties_saved" INTEGER NOT NULL DEFAULT 0,
  "saves" INTEGER NOT NULL DEFAULT 0,
  "clean_sheet" BOOLEAN NOT NULL DEFAULT false,
  "bonus_points" INTEGER NOT NULL DEFAULT 0,
  "tackles_won" INTEGER NOT NULL DEFAULT 0,
  "interceptions" INTEGER NOT NULL DEFAULT 0,
  "blocked_shots" INTEGER NOT NULL DEFAULT 0,
  "did_not_play" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fantasy_player_match_stats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fantasy_player_match_stats_player_id_fixture_id_key"
  ON "fantasy_player_match_stats"("player_id", "fixture_id");

ALTER TABLE "fantasy_player_match_stats" ADD CONSTRAINT "fantasy_player_match_stats_player_id_fkey"
  FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "fantasy_player_match_stats" ADD CONSTRAINT "fantasy_player_match_stats_fixture_id_fkey"
  FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable fantasy_leagues
CREATE TABLE "fantasy_leagues" (
  "id" TEXT NOT NULL,
  "season_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "FantasyLeagueType" NOT NULL DEFAULT 'PRIVATE',
  "scoring_type" "FantasyLeagueScoringType" NOT NULL DEFAULT 'CLASSIC',
  "invite_code" TEXT,
  "created_by_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fantasy_leagues_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fantasy_leagues_invite_code_key" ON "fantasy_leagues"("invite_code");

ALTER TABLE "fantasy_leagues" ADD CONSTRAINT "fantasy_leagues_season_id_fkey"
  FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "fantasy_leagues" ADD CONSTRAINT "fantasy_leagues_created_by_id_fkey"
  FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable fantasy_league_members
CREATE TABLE "fantasy_league_members" (
  "id" TEXT NOT NULL,
  "league_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "fantasy_team_id" TEXT NOT NULL,
  "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fantasy_league_members_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fantasy_league_members_league_id_user_id_key" ON "fantasy_league_members"("league_id", "user_id");

ALTER TABLE "fantasy_league_members" ADD CONSTRAINT "fantasy_league_members_league_id_fkey"
  FOREIGN KEY ("league_id") REFERENCES "fantasy_leagues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "fantasy_league_members" ADD CONSTRAINT "fantasy_league_members_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "fantasy_league_members" ADD CONSTRAINT "fantasy_league_members_fantasy_team_id_fkey"
  FOREIGN KEY ("fantasy_team_id") REFERENCES "fantasy_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable fantasy_head_to_head_fixtures
CREATE TABLE "fantasy_head_to_head_fixtures" (
  "id" TEXT NOT NULL,
  "league_id" TEXT NOT NULL,
  "gameweek_id" TEXT NOT NULL,
  "home_team_id" TEXT NOT NULL,
  "away_team_id" TEXT NOT NULL,
  "home_points" INTEGER,
  "away_points" INTEGER,
  "home_league_points" INTEGER,
  "away_league_points" INTEGER,
  "status" "FantasyHeadToHeadStatus" NOT NULL DEFAULT 'SCHEDULED',
  "settled_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fantasy_head_to_head_fixtures_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fantasy_head_to_head_fixtures_league_id_gameweek_id_home_team_id_away_team_id_key"
  ON "fantasy_head_to_head_fixtures"("league_id", "gameweek_id", "home_team_id", "away_team_id");

ALTER TABLE "fantasy_head_to_head_fixtures" ADD CONSTRAINT "fantasy_head_to_head_fixtures_league_id_fkey"
  FOREIGN KEY ("league_id") REFERENCES "fantasy_leagues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "fantasy_head_to_head_fixtures" ADD CONSTRAINT "fantasy_head_to_head_fixtures_gameweek_id_fkey"
  FOREIGN KEY ("gameweek_id") REFERENCES "gameweeks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "fantasy_head_to_head_fixtures" ADD CONSTRAINT "fantasy_head_to_head_fixtures_home_team_id_fkey"
  FOREIGN KEY ("home_team_id") REFERENCES "fantasy_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "fantasy_head_to_head_fixtures" ADD CONSTRAINT "fantasy_head_to_head_fixtures_away_team_id_fkey"
  FOREIGN KEY ("away_team_id") REFERENCES "fantasy_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable fantasy_cups
CREATE TABLE "fantasy_cups" (
  "id" TEXT NOT NULL,
  "season_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fantasy_cups_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "fantasy_cups" ADD CONSTRAINT "fantasy_cups_season_id_fkey"
  FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable fantasy_cup_rounds
CREATE TABLE "fantasy_cup_rounds" (
  "id" TEXT NOT NULL,
  "cup_id" TEXT NOT NULL,
  "gameweek_id" TEXT NOT NULL,
  "round_name" TEXT NOT NULL,
  "settled_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fantasy_cup_rounds_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fantasy_cup_rounds_cup_id_gameweek_id_key" ON "fantasy_cup_rounds"("cup_id", "gameweek_id");

ALTER TABLE "fantasy_cup_rounds" ADD CONSTRAINT "fantasy_cup_rounds_cup_id_fkey"
  FOREIGN KEY ("cup_id") REFERENCES "fantasy_cups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "fantasy_cup_rounds" ADD CONSTRAINT "fantasy_cup_rounds_gameweek_id_fkey"
  FOREIGN KEY ("gameweek_id") REFERENCES "gameweeks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable fantasy_cup_ties
CREATE TABLE "fantasy_cup_ties" (
  "id" TEXT NOT NULL,
  "round_id" TEXT NOT NULL,
  "home_team_id" TEXT NOT NULL,
  "away_team_id" TEXT NOT NULL,
  "home_points" INTEGER,
  "away_points" INTEGER,
  "winner_id" TEXT,
  "status" "FantasyCupTieStatus" NOT NULL DEFAULT 'SCHEDULED',
  "settled_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fantasy_cup_ties_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "fantasy_cup_ties" ADD CONSTRAINT "fantasy_cup_ties_round_id_fkey"
  FOREIGN KEY ("round_id") REFERENCES "fantasy_cup_rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "fantasy_cup_ties" ADD CONSTRAINT "fantasy_cup_ties_home_team_id_fkey"
  FOREIGN KEY ("home_team_id") REFERENCES "fantasy_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "fantasy_cup_ties" ADD CONSTRAINT "fantasy_cup_ties_away_team_id_fkey"
  FOREIGN KEY ("away_team_id") REFERENCES "fantasy_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
