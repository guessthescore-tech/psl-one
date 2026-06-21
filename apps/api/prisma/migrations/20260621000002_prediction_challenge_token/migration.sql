-- CreateEnum
CREATE TYPE "PredictionChallengeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED', 'LOCKED');

-- AddValues AuditEvent enum
ALTER TYPE "AuditEvent" ADD VALUE IF NOT EXISTS 'CHALLENGE_TOKEN_CREATED';
ALTER TYPE "AuditEvent" ADD VALUE IF NOT EXISTS 'CHALLENGE_TOKEN_ACCEPTED';

-- CreateTable
CREATE TABLE "prediction_challenges" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "creator_user_id" TEXT NOT NULL,
    "creator_home_score" INTEGER NOT NULL,
    "creator_away_score" INTEGER NOT NULL,
    "acceptor_user_id" TEXT,
    "acceptor_home_score" INTEGER,
    "acceptor_away_score" INTEGER,
    "status" "PredictionChallengeStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prediction_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prediction_challenges_token_key" ON "prediction_challenges"("token");

-- AddForeignKey
ALTER TABLE "prediction_challenges" ADD CONSTRAINT "prediction_challenges_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixtures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_challenges" ADD CONSTRAINT "prediction_challenges_creator_user_id_fkey" FOREIGN KEY ("creator_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_challenges" ADD CONSTRAINT "prediction_challenges_acceptor_user_id_fkey" FOREIGN KEY ("acceptor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
