-- Compatibility migration for the legacy profile-scoped
-- notification_preferences table.
--
-- On an empty replay this runs after 20260609063037_add_fan_profile (which
-- creates the legacy profile-scoped shape) and before
-- 20260611000002_notifications (which creates the current user-scoped shape).
--
-- On an already-upgraded database the current table is user-scoped (has
-- user_id, not profile_id), so this block performs no mutation and existing
-- rows, constraints and indexes are preserved.
--
-- CASCADE is intentionally omitted: no committed migration creates a foreign
-- key that references notification_preferences, so a plain DROP is safe for
-- the legacy shape and avoids silently removing unrelated objects.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'notification_preferences'
      AND column_name  = 'profile_id'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'notification_preferences'
      AND column_name  = 'user_id'
  )
  THEN
    DROP TABLE "notification_preferences";
  END IF;
END
$$;
