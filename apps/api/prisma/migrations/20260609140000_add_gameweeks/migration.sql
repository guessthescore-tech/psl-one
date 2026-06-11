-- CreateEnum
CREATE TYPE "GameweekStatus" AS ENUM ('UPCOMING', 'OPEN', 'LOCKED', 'LIVE', 'COMPLETED');

-- CreateTable
CREATE TABLE "gameweeks" (
    "id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "transfer_deadline_at" TIMESTAMP(3) NOT NULL,
    "prediction_deadline_at" TIMESTAMP(3) NOT NULL,
    "status" "GameweekStatus" NOT NULL DEFAULT 'UPCOMING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gameweeks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gameweeks_season_id_slug_key" ON "gameweeks"("season_id", "slug");

-- AddForeignKey
ALTER TABLE "gameweeks" ADD CONSTRAINT "gameweeks_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "fixtures" ADD COLUMN "gameweek_id" TEXT;

-- AddForeignKey
ALTER TABLE "fixtures" ADD CONSTRAINT "fixtures_gameweek_id_fkey" FOREIGN KEY ("gameweek_id") REFERENCES "gameweeks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
