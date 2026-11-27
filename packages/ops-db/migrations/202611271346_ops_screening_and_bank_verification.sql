-- Indus Operations · S10-T05/T07 · manual screening rows and the bank call-back record (boards 51, 132; C21, C40)
--
--   screening_check        the list searched (listName), what was searched (scope), who checked and the evidence link.
--                          The checklist is manual: no third-party screening API (C40).
--   supplier_bank_account  where the call-back number came from (registry | verified_record | other — 'other' is
--                          refused in code), the outcome (genuine | not_genuine) and when it was verified. The partial
--                          index finds a supplier's pending, live request fast (the payment gate and the banner).
--
-- Idempotent.

BEGIN;

ALTER TABLE ops.screening_check
  ADD COLUMN IF NOT EXISTS "listName" text,
  ADD COLUMN IF NOT EXISTS "scope" text,
  ADD COLUMN IF NOT EXISTS "checkedById" uuid REFERENCES ops."user"(id),
  ADD COLUMN IF NOT EXISTS "evidenceUrl" text,
  ADD COLUMN IF NOT EXISTS "note" text;

ALTER TABLE ops.supplier_bank_account
  ADD COLUMN IF NOT EXISTS "callbackNumberSource" text
    CHECK ("callbackNumberSource" IS NULL OR "callbackNumberSource" IN ('registry', 'verified_record', 'other')),
  ADD COLUMN IF NOT EXISTS "callbackOutcome" text
    CHECK ("callbackOutcome" IS NULL OR "callbackOutcome" IN ('genuine', 'not_genuine')),
  ADD COLUMN IF NOT EXISTS "callbackSpokeToRole" text,
  ADD COLUMN IF NOT EXISTS "verifiedAt" timestamptz(3),
  ADD COLUMN IF NOT EXISTS "bankLetterFileId" uuid REFERENCES ops.stored_file(id),
  ADD COLUMN IF NOT EXISTS "nameMatchesRegistry" boolean,
  ADD COLUMN IF NOT EXISTS "letterMatchesIban" boolean,
  ADD COLUMN IF NOT EXISTS "ibanHash" text;

CREATE INDEX IF NOT EXISTS supplier_bank_account_pending_idx
  ON ops.supplier_bank_account ("supplierId")
  WHERE "status" = 'pending_verification' AND "supersededAt" IS NULL;
CREATE INDEX IF NOT EXISTS supplier_bank_account_iban_hash_idx
  ON ops.supplier_bank_account ("ibanHash") WHERE "ibanHash" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS supplier_bank_account_request_message_idx
  ON ops.supplier_bank_account ("requestedViaMessageId") WHERE "requestedViaMessageId" IS NOT NULL;

COMMIT;
