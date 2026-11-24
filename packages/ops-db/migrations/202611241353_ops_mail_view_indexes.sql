-- Indus Operations · S05-T05 · indexes for the Mail view (board 91; CLAUDE.md §7.7: every list WHERE/ORDER BY has one)
--
--   mail_thread (lastMessageAt DESC, id DESC)              the thread list, newest first, keyset by (lastMessageAt, id)
--   mail_thread (mailboxId, lastMessageAt DESC, id DESC)   the sales@ and purchase@ folders
--   mail_message (threadId, direction, origin)             "a thread with live inbound mail" in the list filter
--   mail_message (classification, confidence)              the Type folder counts
--
-- The mail tables are small when this ships (one mailbox pair, no history import yet), so plain CREATE INDEX
-- inside the transaction is fine; IF NOT EXISTS keeps it idempotent.

BEGIN;

CREATE INDEX IF NOT EXISTS "mail_thread_lastMessageAt_id_idx"
  ON "ops"."mail_thread" ("lastMessageAt" DESC, "id" DESC);
CREATE INDEX IF NOT EXISTS "mail_thread_mailboxId_lastMessageAt_id_idx"
  ON "ops"."mail_thread" ("mailboxId", "lastMessageAt" DESC, "id" DESC);
CREATE INDEX IF NOT EXISTS "mail_message_threadId_direction_origin_idx"
  ON "ops"."mail_message" ("threadId", "direction", "origin");
CREATE INDEX IF NOT EXISTS "mail_message_classification_confidence_idx"
  ON "ops"."mail_message" ("classification", "confidence");

COMMIT;
