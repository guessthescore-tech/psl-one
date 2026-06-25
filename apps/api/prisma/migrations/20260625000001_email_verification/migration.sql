-- Sprint 41: Email Verification
-- Adds EmailVerificationToken model and two new AuditEvent values.
-- NO PSL_ACTIVATION. NO WALLET_PRODUCTION. NO REAL_MONEY.
-- Tokens are SHA-256 hashed before storage; raw tokens never reach the DB.

-- AuditEvent enum: add EMAIL_VERIFICATION_REQUEST and EMAIL_VERIFICATION_CONFIRM
ALTER TYPE "AuditEvent" ADD VALUE IF NOT EXISTS 'EMAIL_VERIFICATION_REQUEST';
ALTER TYPE "AuditEvent" ADD VALUE IF NOT EXISTS 'EMAIL_VERIFICATION_CONFIRM';

-- Email verification tokens table
CREATE TABLE "email_verification_tokens" (
    "id"         TEXT NOT NULL,
    "user_id"    TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at"    TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "email_verification_tokens_token_hash_key"
    ON "email_verification_tokens"("token_hash");

ALTER TABLE "email_verification_tokens"
    ADD CONSTRAINT "email_verification_tokens_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
