-- Sprint 32: Audience Segmentation
-- Adds AudienceSegment model for POPIA-safe sponsor audience targeting.
-- NO PSL_ACTIVATION. NO WALLET_PRODUCTION. NO REAL_MONEY.
-- POPIA: stores criteria (aggregate filters only) — not individual fan data.

CREATE TABLE "audience_segments" (
    "id"                TEXT NOT NULL,
    "sponsor_id"        TEXT NOT NULL,
    "name"              TEXT NOT NULL,
    "description"       TEXT,
    "criteria"          JSONB NOT NULL DEFAULT '{}',
    "estimated_size"    INTEGER,
    "is_active"         BOOLEAN NOT NULL DEFAULT true,
    "created_by_user_id" TEXT,
    "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"        TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audience_segments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audience_segments_sponsor_id_idx" ON "audience_segments"("sponsor_id");
CREATE INDEX "audience_segments_is_active_idx" ON "audience_segments"("is_active");

ALTER TABLE "audience_segments" ADD CONSTRAINT "audience_segments_sponsor_id_fkey"
    FOREIGN KEY ("sponsor_id") REFERENCES "sponsors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
