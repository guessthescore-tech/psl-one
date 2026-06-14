-- Migration: beta_launch_readiness
-- Adds BetaCohort, BetaCohortMember, and SeasonActivationApproval models
-- for STORY-39 PSL Season Activation, Frontend Showcase & Beta Launch Readiness.
-- No existing data is modified. Activation of the PSL season is NOT performed
-- by this migration.

CREATE TYPE "BetaCohortStatus" AS ENUM (
  'DRAFT',
  'INVITE_ONLY',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE "BetaCohortMemberStatus" AS ENUM (
  'INVITED',
  'ACTIVE',
  'PAUSED',
  'REMOVED',
  'COMPLETED'
);

CREATE TYPE "BetaLaunchApprovalStatus" AS ENUM (
  'DRAFT',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
  'INVALIDATED',
  'ACTIVATED',
  'CANCELLED'
);

CREATE TABLE "beta_cohorts" (
  "id"               TEXT NOT NULL,
  "name"             TEXT NOT NULL,
  "slug"             TEXT NOT NULL,
  "season_id"        TEXT NOT NULL,
  "status"           "BetaCohortStatus" NOT NULL DEFAULT 'DRAFT',
  "starts_at"        TIMESTAMP(3),
  "ends_at"          TIMESTAMP(3),
  "max_users"        INTEGER,
  "notes"            TEXT,
  "created_by_user_id" TEXT,
  "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "beta_cohorts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "beta_cohorts_slug_key" UNIQUE ("slug"),
  CONSTRAINT "beta_cohorts_season_id_fkey" FOREIGN KEY ("season_id")
    REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "beta_cohorts_season_id_idx" ON "beta_cohorts"("season_id");
CREATE INDEX "beta_cohorts_status_idx" ON "beta_cohorts"("status");

CREATE TABLE "beta_cohort_members" (
  "id"           TEXT NOT NULL,
  "cohort_id"    TEXT NOT NULL,
  "user_id"      TEXT NOT NULL,
  "status"       "BetaCohortMemberStatus" NOT NULL DEFAULT 'INVITED',
  "invited_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "joined_at"    TIMESTAMP(3),
  "removed_at"   TIMESTAMP(3),
  "metadata_json" JSONB,
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "beta_cohort_members_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "beta_cohort_members_cohort_id_user_id_key" UNIQUE ("cohort_id", "user_id"),
  CONSTRAINT "beta_cohort_members_cohort_id_fkey" FOREIGN KEY ("cohort_id")
    REFERENCES "beta_cohorts"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "beta_cohort_members_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "beta_cohort_members_user_id_idx" ON "beta_cohort_members"("user_id");

CREATE TABLE "season_activation_approvals" (
  "id"                        TEXT NOT NULL,
  "season_id"                 TEXT NOT NULL,
  "readiness_snapshot_json"   JSONB NOT NULL,
  "readiness_fingerprint"     TEXT NOT NULL,
  "blocker_count"             INTEGER NOT NULL,
  "warning_count"             INTEGER NOT NULL,
  "approved_by_user_id"       TEXT,
  "approved_at"               TIMESTAMP(3),
  "approval_status"           "BetaLaunchApprovalStatus" NOT NULL DEFAULT 'DRAFT',
  "notes"                     TEXT,
  "rollback_verified"         BOOLEAN NOT NULL DEFAULT FALSE,
  "beta_cohort_verified"      BOOLEAN NOT NULL DEFAULT FALSE,
  "frontend_verified"         BOOLEAN NOT NULL DEFAULT FALSE,
  "data_verified"             BOOLEAN NOT NULL DEFAULT FALSE,
  "security_verified"         BOOLEAN NOT NULL DEFAULT FALSE,
  "operations_verified"       BOOLEAN NOT NULL DEFAULT FALSE,
  "expires_at"                TIMESTAMP(3),
  "invalidated_at"            TIMESTAMP(3),
  "invalidation_reason"       TEXT,
  "activation_performed_at"   TIMESTAMP(3),
  "created_at"                TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "season_activation_approvals_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "season_activation_approvals_season_id_fkey" FOREIGN KEY ("season_id")
    REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "season_activation_approvals_season_id_approval_status_idx"
  ON "season_activation_approvals"("season_id", "approval_status");
CREATE INDEX "season_activation_approvals_created_at_idx"
  ON "season_activation_approvals"("created_at" DESC);
