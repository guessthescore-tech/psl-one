-- FantasyGameweekScore
CREATE TABLE "fantasy_gameweek_scores" (
  "id" TEXT NOT NULL,
  "fantasy_team_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "season_id" TEXT NOT NULL,
  "gameweek_id" TEXT NOT NULL,
  "gross_points" INTEGER NOT NULL DEFAULT 0,
  "transfer_cost" INTEGER NOT NULL DEFAULT 0,
  "chip_points" INTEGER NOT NULL DEFAULT 0,
  "bench_points" INTEGER NOT NULL DEFAULT 0,
  "captain_points" INTEGER NOT NULL DEFAULT 0,
  "net_points" INTEGER NOT NULL DEFAULT 0,
  "rank" INTEGER,
  "settled_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fantasy_gameweek_scores_pkey" PRIMARY KEY ("id")
);

-- FantasyPlayerGameweekScore
CREATE TABLE "fantasy_player_gameweek_scores" (
  "id" TEXT NOT NULL,
  "fantasy_team_id" TEXT NOT NULL,
  "gameweek_score_id" TEXT NOT NULL,
  "player_id" TEXT NOT NULL,
  "gameweek_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "base_points" INTEGER NOT NULL DEFAULT 0,
  "multiplier" INTEGER NOT NULL DEFAULT 1,
  "multiplied_points" INTEGER NOT NULL DEFAULT 0,
  "is_starter" BOOLEAN NOT NULL DEFAULT false,
  "is_bench" BOOLEAN NOT NULL DEFAULT false,
  "is_captain" BOOLEAN NOT NULL DEFAULT false,
  "is_vice_captain" BOOLEAN NOT NULL DEFAULT false,
  "counted_in_total" BOOLEAN NOT NULL DEFAULT false,
  "reason" TEXT,
  "breakdown_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fantasy_player_gameweek_scores_pkey" PRIMARY KEY ("id")
);

-- FanValueLedger
CREATE TABLE "fan_value_ledger" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "source_type" TEXT NOT NULL,
  "source_id" TEXT NOT NULL,
  "season_id" TEXT,
  "gameweek_id" TEXT,
  "gameweek_score_id" TEXT,
  "points" INTEGER NOT NULL,
  "value_type" TEXT NOT NULL DEFAULT 'FANTASY_POINTS',
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fan_value_ledger_pkey" PRIMARY KEY ("id")
);

-- Unique indexes
CREATE UNIQUE INDEX "fantasy_gameweek_scores_fantasy_team_id_gameweek_id_key"
  ON "fantasy_gameweek_scores"("fantasy_team_id", "gameweek_id");

CREATE UNIQUE INDEX "fantasy_player_gameweek_scores_fantasy_team_id_player_id_gameweek_id_key"
  ON "fantasy_player_gameweek_scores"("fantasy_team_id", "player_id", "gameweek_id");

CREATE UNIQUE INDEX "fan_value_ledger_source_type_source_id_key"
  ON "fan_value_ledger"("source_type", "source_id");

-- FK: fantasy_gameweek_scores
ALTER TABLE "fantasy_gameweek_scores"
  ADD CONSTRAINT "fantasy_gameweek_scores_fantasy_team_id_fkey"
    FOREIGN KEY ("fantasy_team_id") REFERENCES "fantasy_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "fantasy_gameweek_scores_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "fantasy_gameweek_scores_season_id_fkey"
    FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "fantasy_gameweek_scores_gameweek_id_fkey"
    FOREIGN KEY ("gameweek_id") REFERENCES "gameweeks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- FK: fantasy_player_gameweek_scores
ALTER TABLE "fantasy_player_gameweek_scores"
  ADD CONSTRAINT "fantasy_player_gameweek_scores_fantasy_team_id_fkey"
    FOREIGN KEY ("fantasy_team_id") REFERENCES "fantasy_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "fantasy_player_gameweek_scores_player_id_fkey"
    FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "fantasy_player_gameweek_scores_gameweek_id_fkey"
    FOREIGN KEY ("gameweek_id") REFERENCES "gameweeks"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "fantasy_player_gameweek_scores_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "fantasy_player_gameweek_scores_gameweek_score_id_fkey"
    FOREIGN KEY ("gameweek_score_id") REFERENCES "fantasy_gameweek_scores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- FK: fan_value_ledger
ALTER TABLE "fan_value_ledger"
  ADD CONSTRAINT "fan_value_ledger_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "fan_value_ledger_season_id_fkey"
    FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "fan_value_ledger_gameweek_id_fkey"
    FOREIGN KEY ("gameweek_id") REFERENCES "gameweeks"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "fan_value_ledger_gameweek_score_id_fkey"
    FOREIGN KEY ("gameweek_score_id") REFERENCES "fantasy_gameweek_scores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
