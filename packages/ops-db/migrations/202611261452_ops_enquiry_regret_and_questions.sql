-- Indus Operations · S09-T06/T07 · Regret reasons and the client-question clocks
--
--   RegretReason                     why a whole enquiry was regretted (board 168): no_source_found, deadline_too_short,
--                                    not_our_range, client_unresponsive, other
--   enquiry.regretReason             set when the whole-enquiry regret is sent
--   enquiry.relatedEnquiryId         a new enquiry opened from a reply to a regretted one (171b state 5)
--   LineRegretReason                 gains deadline_too_short and client_unresponsive (the line chips of board 168)
--   client_question                  reminderDueAt, callTaskAt, fallbackAt (the board 171 clock), fallbackChoice
--                                    (assume · leave_out · wait), reminderActionId; index (status, reminderDueAt)
--
-- The two ADD VALUE statements run first, outside BEGIN/COMMIT: Postgres refuses to use a value added in the same
-- transaction. ADD VALUE ships ahead of code (C31): no row uses the new values until the deploy with the regenerated
-- client is live.
--
-- Idempotent.

ALTER TYPE "ops"."LineRegretReason" ADD VALUE IF NOT EXISTS 'deadline_too_short';
ALTER TYPE "ops"."LineRegretReason" ADD VALUE IF NOT EXISTS 'client_unresponsive';

BEGIN;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
                  WHERE n.nspname = 'ops' AND t.typname = 'RegretReason') THEN
    CREATE TYPE "ops"."RegretReason" AS ENUM
      ('no_source_found', 'deadline_too_short', 'not_our_range', 'client_unresponsive', 'other');
  END IF;
END $$;

ALTER TABLE ops.enquiry
  ADD COLUMN IF NOT EXISTS "regretReason" "ops"."RegretReason",
  ADD COLUMN IF NOT EXISTS "relatedEnquiryId" uuid REFERENCES ops.enquiry(id);

ALTER TABLE ops.client_question
  ADD COLUMN IF NOT EXISTS "reminderDueAt" timestamptz(3),
  ADD COLUMN IF NOT EXISTS "callTaskAt" timestamptz(3),
  ADD COLUMN IF NOT EXISTS "fallbackAt" timestamptz(3),
  ADD COLUMN IF NOT EXISTS "fallbackChoice" text,
  ADD COLUMN IF NOT EXISTS "reminderActionId" uuid;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'client_question_fallback_choice') THEN
    ALTER TABLE ops.client_question ADD CONSTRAINT client_question_fallback_choice
      CHECK ("fallbackChoice" IS NULL OR "fallbackChoice" IN ('assume', 'leave_out', 'wait'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS client_question_status_reminder_idx ON ops.client_question (status, "reminderDueAt");
CREATE INDEX IF NOT EXISTS client_question_status_fallback_idx ON ops.client_question (status, "fallbackAt");
CREATE INDEX IF NOT EXISTS enquiry_related_idx ON ops.enquiry ("relatedEnquiryId") WHERE "relatedEnquiryId" IS NOT NULL;

COMMIT;
