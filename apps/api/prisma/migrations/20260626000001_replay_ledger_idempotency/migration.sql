-- Migration: replay_ledger_idempotency
-- Adds DB-level unique indexes for idempotent WC Beta replay settlement.
--
-- PredictionPointsLedger: partial unique index on prediction_id WHERE NOT NULL.
--   Scoped to replay/score-prediction ledger rows only; challenge ledger rows
--   (prediction_id IS NULL) are unaffected.
--
-- FantasyPointsLedger: composite unique index on (fantasy_team_id, player_id, fixture_id).
--   Guarantees one ledger entry per player per fixture per fantasy team.
--
-- Both indexes are created with IF NOT EXISTS so the migration is re-runnable
-- in case of partial failure.

-- ── Duplicate audit ────────────────────────────────────────────────────────────
-- Raise an exception early if duplicate data already exists, so the index creation
-- below does not silently fail or partially succeed.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM prediction_points_ledger
    WHERE prediction_id IS NOT NULL
    GROUP BY prediction_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Duplicate prediction_points_ledger rows found for prediction_id; '
      'deduplicate before applying replay idempotency index';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM fantasy_points_ledger
    GROUP BY fantasy_team_id, player_id, fixture_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Duplicate fantasy_points_ledger rows found for fantasy_team_id/player_id/fixture_id; '
      'deduplicate before applying replay idempotency index';
  END IF;
END $$;

-- ── Unique indexes ────────────────────────────────────────────────────────────

-- Partial unique index: one score-prediction settlement ledger row per predictionId.
-- Partial (WHERE prediction_id IS NOT NULL) preserves challenge ledger rows
-- which legitimately have prediction_id = NULL.
CREATE UNIQUE INDEX IF NOT EXISTS prediction_points_ledger_prediction_id_unique
  ON prediction_points_ledger (prediction_id)
  WHERE prediction_id IS NOT NULL;

-- Composite unique index: one fantasy ledger row per (team, player, fixture).
-- Mirrors the @@unique([fantasyTeamId, playerId, fixtureId]) added to the Prisma schema.
CREATE UNIQUE INDEX IF NOT EXISTS fantasy_points_ledger_team_player_fixture_unique
  ON fantasy_points_ledger (fantasy_team_id, player_id, fixture_id);
