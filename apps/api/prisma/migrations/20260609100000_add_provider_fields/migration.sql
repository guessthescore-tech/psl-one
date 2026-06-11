-- AlterTable: teams
ALTER TABLE "teams" ADD COLUMN "external_id" TEXT;
ALTER TABLE "teams" ADD COLUMN "source" TEXT;
ALTER TABLE "teams" ADD COLUMN "source_url" TEXT;
CREATE UNIQUE INDEX "teams_external_id_key" ON "teams"("external_id");

-- AlterTable: venues
ALTER TABLE "venues" ADD COLUMN "external_id" TEXT;
ALTER TABLE "venues" ADD COLUMN "source" TEXT;
ALTER TABLE "venues" ADD COLUMN "source_url" TEXT;
CREATE UNIQUE INDEX "venues_external_id_key" ON "venues"("external_id");

-- AlterTable: players
ALTER TABLE "players" ADD COLUMN "external_id" TEXT;
ALTER TABLE "players" ADD COLUMN "source" TEXT;
ALTER TABLE "players" ADD COLUMN "source_url" TEXT;

-- AlterTable: fixtures
ALTER TABLE "fixtures" ADD COLUMN "round" TEXT;
ALTER TABLE "fixtures" ADD COLUMN "external_id" TEXT;
ALTER TABLE "fixtures" ADD COLUMN "source" TEXT;
ALTER TABLE "fixtures" ADD COLUMN "source_url" TEXT;
