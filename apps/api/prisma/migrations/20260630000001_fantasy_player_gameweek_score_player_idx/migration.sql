-- Supporting index for batch player season fantasy-point lookups.
-- The existing unique index is on (fantasy_team_id, player_id, gameweek_id),
-- which puts player_id in the second position — a poor fit for queries that
-- filter by player_id IN (...) and join on gameweek.season_id.
-- This index lets PostgreSQL do a direct index seek for those lookups.
CREATE INDEX "fantasy_player_gameweek_scores_player_id_gameweek_id_idx"
    ON "fantasy_player_gameweek_scores"("player_id", "gameweek_id");
