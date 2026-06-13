-- Migration: squad_import_price_calibration
-- Adds SquadImportBatch, SquadImportRow, FantasyPriceCalibrationBatch
-- Adds minPrice/maxPrice/defaultPrice to FantasyRulesConfig

-- ── Enums ─────────────────────────────────────────────────────────────────────

CREATE TYPE "squad_import_batch_status" AS ENUM (
  'DRAFT', 'VALIDATED', 'HAS_WARNINGS', 'BLOCKED', 'IMPORTED', 'PUBLISHED', 'CANCELLED'
);

CREATE TYPE "squad_import_batch_source_type" AS ENUM (
  'MANUAL', 'CSV_UPLOAD', 'ADMIN_ENTRY', 'PROVIDER_STUB'
);

CREATE TYPE "squad_import_row_validation_status" AS ENUM (
  'PENDING', 'VALID', 'WARNING', 'BLOCKED', 'IMPORTED', 'SKIPPED'
);

CREATE TYPE "fantasy_price_calibration_batch_status" AS ENUM (
  'DRAFT', 'VALIDATED', 'HAS_WARNINGS', 'BLOCKED', 'PUBLISHED', 'CANCELLED'
);

-- ── FantasyRulesConfig: add price bounds ──────────────────────────────────────

ALTER TABLE "fantasy_rules_configs"
  ADD COLUMN "min_price"     INTEGER NOT NULL DEFAULT 40,
  ADD COLUMN "max_price"     INTEGER NOT NULL DEFAULT 200,
  ADD COLUMN "default_price" INTEGER NOT NULL DEFAULT 55;

-- ── SquadImportBatch ──────────────────────────────────────────────────────────

CREATE TABLE "squad_import_batches" (
  "id"                VARCHAR(36)                      NOT NULL,
  "season_id"         VARCHAR(36)                      NOT NULL,
  "competition_id"    VARCHAR(36),
  "source_type"       "squad_import_batch_source_type" NOT NULL DEFAULT 'MANUAL',
  "original_filename" TEXT,
  "status"            "squad_import_batch_status"      NOT NULL DEFAULT 'DRAFT',
  "total_rows"        INTEGER                          NOT NULL DEFAULT 0,
  "valid_rows"        INTEGER                          NOT NULL DEFAULT 0,
  "warning_rows"      INTEGER                          NOT NULL DEFAULT 0,
  "blocked_rows"      INTEGER                          NOT NULL DEFAULT 0,
  "imported_rows"     INTEGER                          NOT NULL DEFAULT 0,
  "published_rows"    INTEGER                          NOT NULL DEFAULT 0,
  "notes"             TEXT,
  "created_by_user_id" VARCHAR(36),
  "created_at"        TIMESTAMP(3)                     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"        TIMESTAMP(3)                     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validated_at"      TIMESTAMP(3),
  "imported_at"       TIMESTAMP(3),
  "published_at"      TIMESTAMP(3),
  "cancelled_at"      TIMESTAMP(3),

  CONSTRAINT "squad_import_batches_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "squad_import_batches_season_id_fkey"
    FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "squad_import_batches_season_id_idx" ON "squad_import_batches"("season_id");
CREATE INDEX "squad_import_batches_status_idx" ON "squad_import_batches"("status");
CREATE INDEX "squad_import_batches_season_id_status_idx" ON "squad_import_batches"("season_id", "status");
CREATE INDEX "squad_import_batches_created_at_idx" ON "squad_import_batches"("created_at" DESC);

-- ── SquadImportRow ────────────────────────────────────────────────────────────

CREATE TABLE "squad_import_rows" (
  "id"                       VARCHAR(36)                           NOT NULL,
  "batch_id"                 VARCHAR(36)                           NOT NULL,
  "row_number"               INTEGER                               NOT NULL,
  "raw_data"                 JSONB                                 NOT NULL DEFAULT '{}',
  "season_id"                VARCHAR(36)                           NOT NULL,
  "team_id"                  VARCHAR(36),
  "matched_player_id"        VARCHAR(36),
  "proposed_player_name"     TEXT                                  NOT NULL,
  "proposed_display_name"    TEXT,
  "proposed_position"        TEXT                                  NOT NULL,
  "proposed_shirt_number"    INTEGER,
  "proposed_nationality"     TEXT,
  "proposed_date_of_birth"   DATE,
  "proposed_status"          TEXT,
  "proposed_fantasy_price"   INTEGER,
  "duplicate_player_ids"     JSONB,
  "validation_status"        "squad_import_row_validation_status"  NOT NULL DEFAULT 'PENDING',
  "validation_messages"      JSONB,
  "is_importable"            BOOLEAN                               NOT NULL DEFAULT false,
  "imported_player_id"       VARCHAR(36),
  "imported_registration_id" VARCHAR(36),
  "created_at"               TIMESTAMP(3)                          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"               TIMESTAMP(3)                          NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "squad_import_rows_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "squad_import_rows_batch_id_fkey"
    FOREIGN KEY ("batch_id") REFERENCES "squad_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "squad_import_rows_season_id_fkey"
    FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "squad_import_rows_batch_id_idx" ON "squad_import_rows"("batch_id");
CREATE INDEX "squad_import_rows_validation_status_idx" ON "squad_import_rows"("validation_status");
CREATE INDEX "squad_import_rows_matched_player_id_idx" ON "squad_import_rows"("matched_player_id");
CREATE INDEX "squad_import_rows_season_id_idx" ON "squad_import_rows"("season_id");
CREATE INDEX "squad_import_rows_team_id_idx" ON "squad_import_rows"("team_id");
CREATE INDEX "squad_import_rows_batch_id_validation_status_idx" ON "squad_import_rows"("batch_id", "validation_status");

-- ── FantasyPriceCalibrationBatch ──────────────────────────────────────────────

CREATE TABLE "fantasy_price_calibration_batches" (
  "id"                     VARCHAR(36)                                 NOT NULL,
  "season_id"              VARCHAR(36)                                 NOT NULL,
  "status"                 "fantasy_price_calibration_batch_status"    NOT NULL DEFAULT 'DRAFT',
  "min_price"              INTEGER                                     NOT NULL DEFAULT 40,
  "max_price"              INTEGER                                     NOT NULL DEFAULT 200,
  "default_price"          INTEGER                                     NOT NULL DEFAULT 55,
  "missing_price_count"    INTEGER                                     NOT NULL DEFAULT 0,
  "invalid_price_count"    INTEGER                                     NOT NULL DEFAULT 0,
  "calibrated_player_count" INTEGER                                    NOT NULL DEFAULT 0,
  "published_player_count" INTEGER                                     NOT NULL DEFAULT 0,
  "notes"                  TEXT,
  "created_by_user_id"     VARCHAR(36),
  "created_at"             TIMESTAMP(3)                                NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"             TIMESTAMP(3)                                NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validated_at"           TIMESTAMP(3),
  "published_at"           TIMESTAMP(3),
  "cancelled_at"           TIMESTAMP(3),

  CONSTRAINT "fantasy_price_calibration_batches_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "fantasy_price_calibration_batches_season_id_fkey"
    FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "fantasy_price_calibration_batches_season_id_idx" ON "fantasy_price_calibration_batches"("season_id");
CREATE INDEX "fantasy_price_calibration_batches_status_idx" ON "fantasy_price_calibration_batches"("status");
CREATE INDEX "fantasy_price_calibration_batches_created_at_idx" ON "fantasy_price_calibration_batches"("created_at" DESC);
