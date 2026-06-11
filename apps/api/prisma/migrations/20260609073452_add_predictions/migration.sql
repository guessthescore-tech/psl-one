-- CreateEnum
CREATE TYPE "PredictionStatus" AS ENUM ('PENDING', 'LOCKED', 'WON', 'LOST', 'SETTLED');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'SETTLED');

-- CreateTable
CREATE TABLE "score_predictions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "predicted_home_score" INTEGER NOT NULL,
    "predicted_away_score" INTEGER NOT NULL,
    "points_awarded" INTEGER NOT NULL DEFAULT 0,
    "status" "PredictionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "settled_at" TIMESTAMP(3),

    CONSTRAINT "score_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peer_challenges" (
    "id" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "challenger_user_id" TEXT NOT NULL,
    "opponent_user_id" TEXT NOT NULL,
    "challenger_prediction_id" TEXT,
    "opponent_prediction_id" TEXT,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'PENDING',
    "winner_user_id" TEXT,
    "points_awarded_challenger" INTEGER NOT NULL DEFAULT 0,
    "points_awarded_opponent" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "settled_at" TIMESTAMP(3),

    CONSTRAINT "peer_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prediction_points_ledger" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "prediction_id" TEXT,
    "challenge_id" TEXT,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prediction_points_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "score_predictions_user_id_fixture_id_key" ON "score_predictions"("user_id", "fixture_id");

-- AddForeignKey
ALTER TABLE "score_predictions" ADD CONSTRAINT "score_predictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_predictions" ADD CONSTRAINT "score_predictions_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peer_challenges" ADD CONSTRAINT "peer_challenges_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peer_challenges" ADD CONSTRAINT "peer_challenges_challenger_user_id_fkey" FOREIGN KEY ("challenger_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peer_challenges" ADD CONSTRAINT "peer_challenges_opponent_user_id_fkey" FOREIGN KEY ("opponent_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peer_challenges" ADD CONSTRAINT "peer_challenges_winner_user_id_fkey" FOREIGN KEY ("winner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peer_challenges" ADD CONSTRAINT "peer_challenges_challenger_prediction_id_fkey" FOREIGN KEY ("challenger_prediction_id") REFERENCES "score_predictions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peer_challenges" ADD CONSTRAINT "peer_challenges_opponent_prediction_id_fkey" FOREIGN KEY ("opponent_prediction_id") REFERENCES "score_predictions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_points_ledger" ADD CONSTRAINT "prediction_points_ledger_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_points_ledger" ADD CONSTRAINT "prediction_points_ledger_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_points_ledger" ADD CONSTRAINT "prediction_points_ledger_prediction_id_fkey" FOREIGN KEY ("prediction_id") REFERENCES "score_predictions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_points_ledger" ADD CONSTRAINT "prediction_points_ledger_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "peer_challenges"("id") ON DELETE SET NULL ON UPDATE CASCADE;
