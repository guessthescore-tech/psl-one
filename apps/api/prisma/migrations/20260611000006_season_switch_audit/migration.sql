-- Season Switch Audit — STORY-28

CREATE TYPE "SeasonSwitchAction" AS ENUM ('PREVIEW', 'ACTIVATE', 'COMPLETE', 'ROLLBACK');
CREATE TYPE "SeasonSwitchStatus" AS ENUM ('SUCCESS', 'BLOCKED', 'FAILED');

CREATE TABLE "season_switch_audits" (
    "id"                   TEXT NOT NULL,
    "from_season_id"       TEXT,
    "to_season_id"         TEXT NOT NULL,
    "action"               "SeasonSwitchAction" NOT NULL,
    "status"               "SeasonSwitchStatus" NOT NULL,
    "performed_by_user_id" TEXT,
    "blockers_json"        JSONB,
    "warnings_json"        JSONB,
    "summary_json"         JSONB,
    "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "season_switch_audits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "season_switch_audits_to_season_id_idx"  ON "season_switch_audits"("to_season_id");
CREATE INDEX "season_switch_audits_created_at_idx"    ON "season_switch_audits"("created_at" DESC);
