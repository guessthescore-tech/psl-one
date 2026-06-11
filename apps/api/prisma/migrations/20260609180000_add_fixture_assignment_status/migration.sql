-- Add assignment tracking fields to fixtures
ALTER TABLE "fixtures" ADD COLUMN "assignment_status" TEXT NOT NULL DEFAULT 'UNASSIGNED';
ALTER TABLE "fixtures" ADD COLUMN "assignment_source" TEXT;
ALTER TABLE "fixtures" ADD COLUMN "assigned_at" TIMESTAMP(3);
