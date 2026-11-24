-- Indus Operations · S05-T09 · mail_message."firstLabelledAt" for the pipeline latency metric
--
-- Set once, by the first Indus label write (#3) on a live message. The metric is arrival (receivedAt) →
-- firstLabelledAt over the last 200 such messages (p50 / p95 in live_counter, /api/health). The index serves
-- "the last 200 labelled". The table is small when this ships; plain DDL in the transaction is fine.

BEGIN;

ALTER TABLE "ops"."mail_message" ADD COLUMN IF NOT EXISTS "firstLabelledAt" timestamptz(3);

CREATE INDEX IF NOT EXISTS "mail_message_firstLabelledAt_idx"
  ON "ops"."mail_message" ("firstLabelledAt" DESC)
  WHERE "firstLabelledAt" IS NOT NULL;

COMMIT;
