-- CreateEnum
CREATE TYPE "prediction_rules_status" AS ENUM ('PROVISIONAL', 'ACTIVE');

-- CreateTable
CREATE TABLE "prediction_rules_configs" (
    "id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "correct_score_points" INTEGER NOT NULL DEFAULT 10,
    "correct_goal_difference_points" INTEGER NOT NULL DEFAULT 5,
    "correct_result_points" INTEGER NOT NULL DEFAULT 3,
    "participation_points" INTEGER NOT NULL DEFAULT 0,
    "challenge_win_points" INTEGER NOT NULL DEFAULT 0,
    "challenge_draw_points" INTEGER NOT NULL DEFAULT 0,
    "lock_minutes_before_kickoff" INTEGER NOT NULL DEFAULT 0,
    "status" "prediction_rules_status" NOT NULL DEFAULT 'PROVISIONAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prediction_rules_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prediction_rules_configs_season_id_key" ON "prediction_rules_configs"("season_id");

-- AddForeignKey
ALTER TABLE "prediction_rules_configs" ADD CONSTRAINT "prediction_rules_configs_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
