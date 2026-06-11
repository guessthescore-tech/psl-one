-- CreateEnum
CREATE TYPE "SeasonStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- AlterTable: add provider-neutral source fields + status to seasons
ALTER TABLE "seasons"
  ADD COLUMN "status"       "SeasonStatus" NOT NULL DEFAULT 'UPCOMING',
  ADD COLUMN "source"       TEXT,
  ADD COLUMN "external_id"  TEXT,
  ADD COLUMN "source_url"   TEXT,
  ADD COLUMN "imported_at"  TIMESTAMP(3);

-- AlterTable: add provider-neutral source fields to competitions
ALTER TABLE "competitions"
  ADD COLUMN "source"       TEXT,
  ADD COLUMN "external_id"  TEXT,
  ADD COLUMN "source_url"   TEXT;

-- CreateIndex: unique external_id on competitions
CREATE UNIQUE INDEX "competitions_external_id_key" ON "competitions"("external_id");

-- Backfill: mark existing active season as ACTIVE status
UPDATE "seasons" SET "status" = 'ACTIVE' WHERE "is_active" = true;
