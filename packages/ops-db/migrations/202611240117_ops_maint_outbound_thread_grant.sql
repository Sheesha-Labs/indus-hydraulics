-- Indus Operations · S04 follow-up · ops_maint may clear outbound_email."threadId" (board 90 purge)
--
-- The "Delete everything imported" purge (src/server/gmail/purge.ts, run as ops_maint) deletes a mailbox's
-- threads last. An outbound row that pointed at one of those threads keeps its history with the link cleared
-- first, which needs UPDATE on that column, and on "updatedAt", which Prisma's updateMany sets on every write
-- (@updatedAt). ops_maint already holds SELECT and DELETE on outbound_email and the ops_maint_all RLS policy (S00);
-- only these column grants were missing, so a purge failed at its thread stage.
--
-- Column-level, nothing wider. Idempotent (GRANT repeats harmlessly); the assertion proves it took.

BEGIN;

GRANT UPDATE ("threadId", "updatedAt") ON "ops"."outbound_email" TO ops_maint;

DO $$
BEGIN
  IF NOT has_column_privilege('ops_maint', 'ops.outbound_email', 'threadId', 'UPDATE')
     OR NOT has_column_privilege('ops_maint', 'ops.outbound_email', 'updatedAt', 'UPDATE') THEN
    RAISE EXCEPTION 'ops_maint must be able to clear outbound_email.threadId (and stamp updatedAt)';
  END IF;
  IF has_column_privilege('ops_maint', 'ops.outbound_email', 'status', 'UPDATE') THEN
    RAISE EXCEPTION 'ops_maint must not be able to change an outbound status';
  END IF;
  IF has_table_privilege('ops_maint', 'ops.outbound_email', 'UPDATE') THEN
    RAISE EXCEPTION 'ops_maint must not hold UPDATE on the whole of outbound_email';
  END IF;
END $$;

COMMIT;
