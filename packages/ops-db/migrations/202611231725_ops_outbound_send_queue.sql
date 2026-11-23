-- Indus Operations · S04-T06 · the send queue columns on outbound_email (ADR-07, 08-map-integrations §1.9)
--
--   claimedAt              the one conditional claim scheduled → sending (reconcile searches Sent from here)
--   proposedRfcMessageId   <ops.<uuid>@indushydraulics.me>, set when the MIME is built
--   rfcMessageId           read back from the sent message (Gmail may rewrite it), never assumed
--   referencesRfcIds       the References chain written (last 20)
--   basisHash              what the approval saw; a mismatch at the gate makes the send stale (S06 hook)
--   approvedById/At        the PERSON who approved (never the Assistant): priced client sends need it
--   holdReason             cap | pause | mailbox | slot (why it is held or waiting)
--   sendSlotAt             the slot computed after the undo window
--   reconcileChecks        checks of Sent for X-Indus-Outbound after an ambiguous send (two, then a person)
--   fromAlias              the send-as alias chosen by the sending rule, re-checked at the gate
--
-- Partial index for the send worker and the health view; the S00 CHECK that a sent Gmail row has its
-- gmailMessageId is asserted present. Idempotent.

BEGIN;

ALTER TABLE "ops"."outbound_email" ADD COLUMN IF NOT EXISTS "claimedAt" TIMESTAMPTZ(3);
ALTER TABLE "ops"."outbound_email" ADD COLUMN IF NOT EXISTS "proposedRfcMessageId" TEXT;
ALTER TABLE "ops"."outbound_email" ADD COLUMN IF NOT EXISTS "rfcMessageId" TEXT;
ALTER TABLE "ops"."outbound_email" ADD COLUMN IF NOT EXISTS "referencesRfcIds" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "ops"."outbound_email" ADD COLUMN IF NOT EXISTS "basisHash" TEXT;
ALTER TABLE "ops"."outbound_email" ADD COLUMN IF NOT EXISTS "approvedById" UUID;
ALTER TABLE "ops"."outbound_email" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMPTZ(3);
ALTER TABLE "ops"."outbound_email" ADD COLUMN IF NOT EXISTS "holdReason" TEXT;
ALTER TABLE "ops"."outbound_email" ADD COLUMN IF NOT EXISTS "sendSlotAt" TIMESTAMPTZ(3);
ALTER TABLE "ops"."outbound_email" ADD COLUMN IF NOT EXISTS "reconcileChecks" SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE "ops"."outbound_email" ADD COLUMN IF NOT EXISTS "fromAlias" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'outbound_email_approvedById_fkey' AND conrelid = 'ops.outbound_email'::regclass
  ) THEN
    ALTER TABLE "ops"."outbound_email"
      ADD CONSTRAINT "outbound_email_approvedById_fkey"
      FOREIGN KEY ("approvedById") REFERENCES "ops"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'outbound_email_holdReason_check' AND conrelid = 'ops.outbound_email'::regclass
  ) THEN
    ALTER TABLE "ops"."outbound_email"
      ADD CONSTRAINT "outbound_email_holdReason_check"
      CHECK ("holdReason" IS NULL OR "holdReason" IN ('cap', 'pause', 'mailbox', 'slot'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "outbound_email_mailbox_active_idx"
  ON "ops"."outbound_email"("mailboxId", "status")
  WHERE "status" IN ('scheduled', 'held', 'sending', 'unknown');

-- Re-asserted (S00 created it): a Gmail row is never 'sent' without the Gmail message id.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conrelid = 'ops.outbound_email'::regclass AND contype = 'c'
       AND pg_get_constraintdef(oid) ILIKE '%gmailMessageId%'
  ) THEN
    RAISE EXCEPTION 'outbound_email must keep its sent-has-gmailMessageId CHECK (S00)';
  END IF;
END $$;

COMMIT;
