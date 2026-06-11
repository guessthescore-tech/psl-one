-- AlterTable: add isPublished to fixtures (default true preserves all existing fixtures as published)
ALTER TABLE "fixtures" ADD COLUMN "is_published" BOOLEAN NOT NULL DEFAULT true;

-- CreateEnum
CREATE TYPE "FixtureImportBatchStatus" AS ENUM ('DRAFT', 'VALIDATING', 'VALIDATED', 'FAILED_VALIDATION', 'COMMITTED', 'PUBLISHED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FixtureImportRowStatus" AS ENUM ('PENDING', 'VALID', 'WARNING', 'ERROR', 'COMMITTED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "FixtureImportSource" AS ENUM ('MANUAL', 'CSV', 'JSON', 'OFFICIAL_PSL', 'PROVIDER_IMPORT', 'PLACEHOLDER');

-- CreateTable
CREATE TABLE "fixture_import_batches" (
    "id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "source" "FixtureImportSource" NOT NULL DEFAULT 'MANUAL',
    "status" "FixtureImportBatchStatus" NOT NULL DEFAULT 'DRAFT',
    "label" TEXT,
    "file_name" TEXT,
    "source_reference" TEXT,
    "imported_by_user_id" TEXT,
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "valid_rows" INTEGER NOT NULL DEFAULT 0,
    "warning_rows" INTEGER NOT NULL DEFAULT 0,
    "error_rows" INTEGER NOT NULL DEFAULT 0,
    "committed_rows" INTEGER NOT NULL DEFAULT 0,
    "summary_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "validated_at" TIMESTAMP(3),
    "committed_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),

    CONSTRAINT "fixture_import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixture_import_rows" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "row_number" INTEGER NOT NULL,
    "raw_data_json" JSONB NOT NULL,
    "home_team_raw" TEXT,
    "away_team_raw" TEXT,
    "venue_raw" TEXT,
    "kickoff_at_raw" TEXT,
    "round_raw" TEXT,
    "home_team_id" TEXT,
    "away_team_id" TEXT,
    "venue_id" TEXT,
    "gameweek_id" TEXT,
    "fixture_id" TEXT,
    "status" "FixtureImportRowStatus" NOT NULL DEFAULT 'PENDING',
    "errors_json" JSONB,
    "warnings_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fixture_import_rows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fixture_import_batches_season_id_status_idx" ON "fixture_import_batches"("season_id", "status");

-- CreateIndex
CREATE INDEX "fixture_import_rows_batch_id_status_idx" ON "fixture_import_rows"("batch_id", "status");

-- AddForeignKey
ALTER TABLE "fixture_import_batches" ADD CONSTRAINT "fixture_import_batches_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixture_import_rows" ADD CONSTRAINT "fixture_import_rows_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "fixture_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fixture_import_rows" ADD CONSTRAINT "fixture_import_rows_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE SET NULL ON UPDATE CASCADE;
