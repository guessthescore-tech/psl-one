-- Extend PredictionChallengeStatus enum
ALTER TYPE "PredictionChallengeStatus" ADD VALUE IF NOT EXISTS 'SETTLED';

-- Add AuditEvent value
ALTER TYPE "AuditEvent" ADD VALUE IF NOT EXISTS 'CHALLENGE_SETTLED';

-- Add settlement fields to prediction_challenges
ALTER TABLE "prediction_challenges" ADD COLUMN IF NOT EXISTS "settled_at" TIMESTAMP(3);
ALTER TABLE "prediction_challenges" ADD COLUMN IF NOT EXISTS "creator_points" INTEGER;
ALTER TABLE "prediction_challenges" ADD COLUMN IF NOT EXISTS "acceptor_points" INTEGER;
ALTER TABLE "prediction_challenges" ADD COLUMN IF NOT EXISTS "winner_user_id" TEXT;
ALTER TABLE "prediction_challenges" ADD COLUMN IF NOT EXISTS "settlement_reason" TEXT;

-- AddForeignKey for winner
ALTER TABLE "prediction_challenges" ADD CONSTRAINT "prediction_challenges_winner_user_id_fkey" FOREIGN KEY ("winner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
