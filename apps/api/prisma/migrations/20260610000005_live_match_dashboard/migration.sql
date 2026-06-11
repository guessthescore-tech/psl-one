-- AlterEnum MatchEventType - add new values
ALTER TYPE "MatchEventType" ADD VALUE IF NOT EXISTS 'SECOND_YELLOW';
ALTER TYPE "MatchEventType" ADD VALUE IF NOT EXISTS 'PENALTY_SCORED';
ALTER TYPE "MatchEventType" ADD VALUE IF NOT EXISTS 'SECOND_HALF';
ALTER TYPE "MatchEventType" ADD VALUE IF NOT EXISTS 'INJURY';

-- AlterTable Fixture - add live match tracking fields
ALTER TABLE "fixtures"
  ADD COLUMN IF NOT EXISTS "started_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "half_time_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "resumed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "finished_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "last_synced_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "provider_source" TEXT,
  ADD COLUMN IF NOT EXISTS "provider_fixture_id" TEXT;

-- AlterTable MatchEvent - add provider/detail fields
ALTER TABLE "match_events"
  ADD COLUMN IF NOT EXISTS "related_player_id" TEXT,
  ADD COLUMN IF NOT EXISTS "stoppage_minute" INTEGER,
  ADD COLUMN IF NOT EXISTS "period" TEXT,
  ADD COLUMN IF NOT EXISTS "provider_event_id" TEXT,
  ADD COLUMN IF NOT EXISTS "source" TEXT,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable FantasyPlayerMatchStat - add extended stat fields
ALTER TABLE "fantasy_player_match_stats"
  ADD COLUMN IF NOT EXISTS "team_id" TEXT,
  ADD COLUMN IF NOT EXISTS "goals_conceded" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "started" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "came_on_minute" INTEGER,
  ADD COLUMN IF NOT EXISTS "subbed_off_minute" INTEGER,
  ADD COLUMN IF NOT EXISTS "source" TEXT,
  ADD COLUMN IF NOT EXISTS "provider_stat_id" TEXT;

-- AddForeignKey for match_events.related_player_id
ALTER TABLE "match_events"
  ADD CONSTRAINT "match_events_related_player_id_fkey"
  FOREIGN KEY ("related_player_id") REFERENCES "players"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey for fantasy_player_match_stats.team_id
ALTER TABLE "fantasy_player_match_stats"
  ADD CONSTRAINT "fantasy_player_match_stats_team_id_fkey"
  FOREIGN KEY ("team_id") REFERENCES "teams"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
