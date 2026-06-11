-- Add formation column to fantasy_teams
ALTER TABLE "fantasy_teams" ADD COLUMN "formation" TEXT;

-- Create fantasy_transfers table
CREATE TABLE "fantasy_transfers" (
    "id"                TEXT NOT NULL,
    "fantasy_team_id"   TEXT NOT NULL,
    "removed_player_id" TEXT NOT NULL,
    "added_player_id"   TEXT NOT NULL,
    "transferred_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fantasy_transfers_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "fantasy_transfers"
    ADD CONSTRAINT "fantasy_transfers_fantasy_team_id_fkey"
    FOREIGN KEY ("fantasy_team_id") REFERENCES "fantasy_teams"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "fantasy_transfers"
    ADD CONSTRAINT "fantasy_transfers_removed_player_id_fkey"
    FOREIGN KEY ("removed_player_id") REFERENCES "players"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "fantasy_transfers"
    ADD CONSTRAINT "fantasy_transfers_added_player_id_fkey"
    FOREIGN KEY ("added_player_id") REFERENCES "players"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
