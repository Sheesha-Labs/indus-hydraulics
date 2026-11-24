-- Indus Operations · S05-T08 · assistant_action (createdAt DESC) for the sidebar pill's popover
--
-- "37 actions this week · last 2 min ago" (board 102 state 1, S05A): a count over the last seven days and the
-- newest row, read by the console layout (cached a minute per process). assistant_action is small when this
-- ships (the Assistant goes live in this sprint), so plain CREATE INDEX inside the transaction is fine.

BEGIN;

CREATE INDEX IF NOT EXISTS "assistant_action_createdAt_idx"
  ON "ops"."assistant_action" ("createdAt" DESC);

COMMIT;
