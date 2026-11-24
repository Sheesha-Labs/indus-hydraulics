-- Indus Operations · S05-T09 · notification: open rows by dedupeKey
--
-- resolveNotifications(key) runs on every recovery (a mailbox reconnected, a sync caught up, a resume) and
-- filters on dedupeKey alone; the existing indexes lead with userId. A partial index on the open rows keeps it
-- an index lookup as the table grows. The table is small in production; plain DDL in the transaction is fine.

BEGIN;

CREATE INDEX IF NOT EXISTS "notification_open_dedupeKey_idx"
  ON "ops"."notification" ("dedupeKey")
  WHERE "resolvedAt" IS NULL;

COMMIT;
