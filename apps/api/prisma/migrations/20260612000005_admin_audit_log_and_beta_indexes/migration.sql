-- STORY-35: Beta Feedback, Bug Fixes & UX Polish
-- 1. AdminAuditLog table — lightweight cross-domain audit surface
-- 2. Performance indexes for high-volume query paths identified in Sprint 2

-- ── AdminAuditLog ─────────────────────────────────────────────────────────────
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "actor_role" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "route" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "admin_audit_logs_actor_user_id_idx" ON "admin_audit_logs"("actor_user_id");
CREATE INDEX "admin_audit_logs_entity_type_entity_id_idx" ON "admin_audit_logs"("entity_type", "entity_id");
CREATE INDEX "admin_audit_logs_created_at_idx" ON "admin_audit_logs"("created_at" DESC);
CREATE INDEX "admin_audit_logs_action_idx" ON "admin_audit_logs"("action");

-- ── Performance indexes: Fixture ──────────────────────────────────────────────
-- listFixtures(seasonId, status, isPublished) — fan fixture browsing + import
CREATE INDEX "fixtures_season_id_status_is_published_idx" ON "fixtures"("season_id", "status", "is_published");
-- Gameweek operations: fixture calendar by season/kickoff
CREATE INDEX "fixtures_season_id_kickoff_at_idx" ON "fixtures"("season_id", "kickoff_at");

-- ── Performance indexes: ScorePrediction ─────────────────────────────────────
-- User prediction history + settlement queries
CREATE INDEX "score_predictions_user_id_status_idx" ON "score_predictions"("user_id", "status");
CREATE INDEX "score_predictions_fixture_id_status_idx" ON "score_predictions"("fixture_id", "status");

-- ── Performance indexes: PredictionPointsLedger ───────────────────────────────
-- Prediction leaderboard aggregation by user
CREATE INDEX "prediction_points_ledger_user_id_idx" ON "prediction_points_ledger"("user_id");

-- ── Performance indexes: FantasyGameweekScore ─────────────────────────────────
-- Fantasy leaderboard: season-scoped by user and by gameweek
CREATE INDEX "fantasy_gameweek_scores_season_id_user_id_idx" ON "fantasy_gameweek_scores"("season_id", "user_id");
CREATE INDEX "fantasy_gameweek_scores_season_id_gameweek_id_idx" ON "fantasy_gameweek_scores"("season_id", "gameweek_id");

-- ── Performance indexes: FanValueLedger ──────────────────────────────────────
-- Fan Value queries: user totals by season
CREATE INDEX "fan_value_ledger_user_id_season_id_idx" ON "fan_value_ledger"("user_id", "season_id");

-- ── Performance indexes: PlayerMatchStats ────────────────────────────────────
-- Player stats: season-scoped list + status filter
CREATE INDEX "player_match_stats_season_id_status_idx" ON "player_match_stats"("season_id", "status");
-- Player profile: per-player career + season totals
CREATE INDEX "player_match_stats_player_id_season_id_idx" ON "player_match_stats"("player_id", "season_id");
