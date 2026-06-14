-- Security and Performance Hardening: Sprint 3 Story 0
-- Adds missing indexes identified during triage.
-- Additive only — no destructive changes.

-- MatchEvent: queries ordered by minute within a fixture
CREATE INDEX IF NOT EXISTS "match_events_fixture_id_minute_idx" ON "match_events"("fixture_id", "minute");

-- FantasyPointsLedger: fixture-based scoring queries
CREATE INDEX IF NOT EXISTS "fantasy_points_ledger_fantasy_team_id_fixture_id_idx" ON "fantasy_points_ledger"("fantasy_team_id", "fixture_id");
CREATE INDEX IF NOT EXISTS "fantasy_points_ledger_fantasy_team_id_idx" ON "fantasy_points_ledger"("fantasy_team_id");

-- PredictionPointsLedger: settlement lookup by fixture and season aggregation
CREATE INDEX IF NOT EXISTS "prediction_points_ledger_fixture_id_idx" ON "prediction_points_ledger"("fixture_id");
