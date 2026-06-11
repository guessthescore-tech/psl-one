-- CreateEnum
CREATE TYPE "FantasyAutoSubstitutionStatus" AS ENUM ('APPLIED', 'SKIPPED_NO_ELIGIBLE_SUB', 'SKIPPED_FORMATION_INVALID', 'SKIPPED_BENCH_PLAYER_DID_NOT_PLAY', 'SKIPPED_GOALKEEPER_ONLY', 'SKIPPED_STARTER_PLAYED');

-- CreateTable
CREATE TABLE "fantasy_auto_substitutions" (
    "id" TEXT NOT NULL,
    "fantasy_team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "gameweek_id" TEXT NOT NULL,
    "out_player_id" TEXT NOT NULL,
    "in_player_id" TEXT,
    "out_fantasy_team_player_id" TEXT,
    "in_fantasy_team_player_id" TEXT,
    "reason" TEXT NOT NULL,
    "status" "FantasyAutoSubstitutionStatus" NOT NULL,
    "bench_priority" INTEGER,
    "formation_before" TEXT,
    "formation_after" TEXT,
    "applied_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fantasy_auto_substitutions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fantasy_auto_substitutions_fantasy_team_id_gameweek_id_out_player_id_key" ON "fantasy_auto_substitutions"("fantasy_team_id", "gameweek_id", "out_player_id");

-- AddForeignKey
ALTER TABLE "fantasy_auto_substitutions" ADD CONSTRAINT "fantasy_auto_substitutions_fantasy_team_id_fkey" FOREIGN KEY ("fantasy_team_id") REFERENCES "fantasy_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fantasy_auto_substitutions" ADD CONSTRAINT "fantasy_auto_substitutions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fantasy_auto_substitutions" ADD CONSTRAINT "fantasy_auto_substitutions_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fantasy_auto_substitutions" ADD CONSTRAINT "fantasy_auto_substitutions_gameweek_id_fkey" FOREIGN KEY ("gameweek_id") REFERENCES "gameweeks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fantasy_auto_substitutions" ADD CONSTRAINT "fantasy_auto_substitutions_out_player_id_fkey" FOREIGN KEY ("out_player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fantasy_auto_substitutions" ADD CONSTRAINT "fantasy_auto_substitutions_in_player_id_fkey" FOREIGN KEY ("in_player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
