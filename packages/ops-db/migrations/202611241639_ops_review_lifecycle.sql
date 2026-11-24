-- Indus Operations · S06-T01 / T03 · Review lifecycle columns on assistant_action
--
--   staleAt, staleReason      the record changed after drafting (a reply in the thread, a changed contact):
--                             approving is blocked until the card is redrafted (S06-T03, board 110)
--   supersededById            the newer action (a redraft) that replaces this one
--   blockedByActionId         an earlier action this one waits for
--   redraftOfId               the action this one was redrafted from
--   effectivePayload          what a person edited (Edit, then Save and approve). The proposal columns stay
--                             immutable: the S05 guard still rejects any change to them.
--
-- The lifecycle columns are mutable (the guard lists only the proposal columns). Indexes: the queue already has
-- (surface, state, createdAt); Later needs (laterUntil) for the clock that brings cards back.

BEGIN;

ALTER TABLE "ops"."assistant_action"
  ADD COLUMN IF NOT EXISTS "staleAt" timestamptz(3),
  ADD COLUMN IF NOT EXISTS "staleReason" text,
  ADD COLUMN IF NOT EXISTS "supersededById" uuid,
  ADD COLUMN IF NOT EXISTS "blockedByActionId" uuid,
  ADD COLUMN IF NOT EXISTS "redraftOfId" uuid,
  ADD COLUMN IF NOT EXISTS "effectivePayload" jsonb;

CREATE INDEX IF NOT EXISTS "assistant_action_later_idx"
  ON "ops"."assistant_action" ("laterUntil")
  WHERE "state" = 'later';

CREATE INDEX IF NOT EXISTS "assistant_action_redraftOfId_idx"
  ON "ops"."assistant_action" ("redraftOfId")
  WHERE "redraftOfId" IS NOT NULL;

COMMIT;
