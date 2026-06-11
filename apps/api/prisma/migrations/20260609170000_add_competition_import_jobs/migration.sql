-- CreateEnum: CompetitionImportStatus
CREATE TYPE "CompetitionImportStatus" AS ENUM (
  'DRAFT', 'VALIDATING', 'VALIDATED', 'IMPORTING', 'COMPLETED', 'FAILED', 'CANCELLED'
);

-- CreateEnum: CompetitionImportSourceType
CREATE TYPE "CompetitionImportSourceType" AS ENUM (
  'MANUAL', 'JSON_FILE', 'CSV_FILE', 'SUPPLIER_FEED', 'OFFICIAL_FEED', 'REFERENCE_DATA'
);

-- CreateTable: competition_import_jobs
CREATE TABLE "competition_import_jobs" (
  "id"               TEXT NOT NULL,
  "source"           TEXT NOT NULL,
  "source_type"      "CompetitionImportSourceType" NOT NULL,
  "status"           "CompetitionImportStatus" NOT NULL DEFAULT 'DRAFT',
  "competition_id"   TEXT,
  "season_id"        TEXT,
  "file_name"        TEXT,
  "source_url"       TEXT,
  "total_records"    INTEGER NOT NULL DEFAULT 0,
  "imported_records" INTEGER NOT NULL DEFAULT 0,
  "skipped_records"  INTEGER NOT NULL DEFAULT 0,
  "failed_records"   INTEGER NOT NULL DEFAULT 0,
  "errors_json"      JSONB,
  "raw_payload"      JSONB,
  "started_at"       TIMESTAMP(3),
  "completed_at"     TIMESTAMP(3),
  "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by_user_id" TEXT,
  CONSTRAINT "competition_import_jobs_pkey" PRIMARY KEY ("id")
);

-- AlterTable: add importedAt to competitions
ALTER TABLE "competitions" ADD COLUMN "imported_at" TIMESTAMP(3);

-- AlterTable: add importedAt to venues
ALTER TABLE "venues" ADD COLUMN "imported_at" TIMESTAMP(3);

-- AlterTable: add importedAt to teams
ALTER TABLE "teams" ADD COLUMN "imported_at" TIMESTAMP(3);

-- AlterTable: add importedAt to players
ALTER TABLE "players" ADD COLUMN "imported_at" TIMESTAMP(3);

-- AlterTable: add importedAt to fixtures
ALTER TABLE "fixtures" ADD COLUMN "imported_at" TIMESTAMP(3);

-- AlterTable: add import fields to groups
ALTER TABLE "groups"
  ADD COLUMN "external_id" TEXT,
  ADD COLUMN "source"      TEXT,
  ADD COLUMN "source_url"  TEXT,
  ADD COLUMN "imported_at" TIMESTAMP(3);

-- CreateIndex: unique (season_id, name) on groups
CREATE UNIQUE INDEX "groups_season_id_name_key" ON "groups"("season_id", "name");

-- AlterTable: add import fields to gameweeks
ALTER TABLE "gameweeks"
  ADD COLUMN "external_id" TEXT,
  ADD COLUMN "source"      TEXT,
  ADD COLUMN "source_url"  TEXT,
  ADD COLUMN "imported_at" TIMESTAMP(3);
