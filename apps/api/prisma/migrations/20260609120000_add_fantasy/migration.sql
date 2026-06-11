-- Add new MatchEventType values
ALTER TYPE "MatchEventType" ADD VALUE IF NOT EXISTS 'ASSIST';
ALTER TYPE "MatchEventType" ADD VALUE IF NOT EXISTS 'OWN_GOAL';
ALTER TYPE "MatchEventType" ADD VALUE IF NOT EXISTS 'PENALTY_MISSED';
ALTER TYPE "MatchEventType" ADD VALUE IF NOT EXISTS 'PENALTY_SAVE';
ALTER TYPE "MatchEventType" ADD VALUE IF NOT EXISTS 'SAVE';

-- Create FantasySquadRole enum
CREATE TYPE "FantasySquadRole" AS ENUM ('STARTER', 'SUBSTITUTE');

-- Create fantasy_teams
CREATE TABLE "fantasy_teams" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My Fantasy Team',
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fantasy_teams_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fantasy_teams_user_id_season_id_key" ON "fantasy_teams"("user_id", "season_id");

ALTER TABLE "fantasy_teams" ADD CONSTRAINT "fantasy_teams_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fantasy_teams" ADD CONSTRAINT "fantasy_teams_season_id_fkey"
    FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create fantasy_team_players
CREATE TABLE "fantasy_team_players" (
    "id" TEXT NOT NULL,
    "fantasy_team_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "squad_role" "FantasySquadRole" NOT NULL,
    "bench_slot" INTEGER,
    "is_captain" BOOLEAN NOT NULL DEFAULT false,
    "is_vice_captain" BOOLEAN NOT NULL DEFAULT false,
    "position" "PlayerPosition" NOT NULL,
    "locked_at" TIMESTAMP(3),
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fantasy_team_players_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fantasy_team_players_fantasy_team_id_player_id_key"
    ON "fantasy_team_players"("fantasy_team_id", "player_id");

ALTER TABLE "fantasy_team_players" ADD CONSTRAINT "fantasy_team_players_fantasy_team_id_fkey"
    FOREIGN KEY ("fantasy_team_id") REFERENCES "fantasy_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fantasy_team_players" ADD CONSTRAINT "fantasy_team_players_player_id_fkey"
    FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create fantasy_points_ledger
CREATE TABLE "fantasy_points_ledger" (
    "id" TEXT NOT NULL,
    "fantasy_team_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "is_captain_bonus" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fantasy_points_ledger_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "fantasy_points_ledger" ADD CONSTRAINT "fantasy_points_ledger_fantasy_team_id_fkey"
    FOREIGN KEY ("fantasy_team_id") REFERENCES "fantasy_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fantasy_points_ledger" ADD CONSTRAINT "fantasy_points_ledger_player_id_fkey"
    FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fantasy_points_ledger" ADD CONSTRAINT "fantasy_points_ledger_fixture_id_fkey"
    FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
