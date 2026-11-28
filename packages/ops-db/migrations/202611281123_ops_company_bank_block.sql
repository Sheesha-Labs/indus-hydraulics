-- Indus Operations · S11-T07 · the confirmed bank block (board 213, architecture §9.1 item 1, ADR-01)
--
-- own_bank_account gains what the Owner confirms: the exact lines printed in the bank block, in order (read from
-- one of his own Zoho estimates, never typed into code), where they came from, who confirmed them and when, the
-- branch, and the sign-off state. Client documents print only a confirmed block, and cannot be approved until one
-- exists (ops-core clientDocumentApprovalGate). No bank detail is seeded: they are runtime data only.

BEGIN;

ALTER TABLE ops.own_bank_account
  ADD COLUMN IF NOT EXISTS "branch" text,
  ADD COLUMN IF NOT EXISTS "printLines" text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "source" text,
  ADD COLUMN IF NOT EXISTS "sourceFileId" uuid REFERENCES ops.stored_file(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS "signoffStatus" ops."SignoffStatus" NOT NULL DEFAULT 'awaiting',
  ADD COLUMN IF NOT EXISTS "confirmedById" uuid REFERENCES ops."user"(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS "confirmedAt" timestamptz(3),
  ADD COLUMN IF NOT EXISTS "createdAt" timestamptz(3) NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz(3) NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'own_bank_account_source_check') THEN
    ALTER TABLE ops.own_bank_account ADD CONSTRAINT own_bank_account_source_check
      CHECK ("source" IS NULL OR "source" IN ('zoho_estimate', 'manual'));
  END IF;
  -- Confirmed means: someone, at a time, with printed lines, and signed off; never half of it.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'own_bank_account_confirmed_check') THEN
    ALTER TABLE ops.own_bank_account ADD CONSTRAINT own_bank_account_confirmed_check CHECK (
      ("confirmedAt" IS NULL) = ("confirmedById" IS NULL)
      AND ("confirmedAt" IS NULL OR (cardinality("printLines") > 0 AND "signoffStatus" = 'signed_off')));
  END IF;
END $$;

-- At most one live default per currency.
CREATE UNIQUE INDEX IF NOT EXISTS own_bank_account_one_default_per_ccy
  ON ops.own_bank_account ("currency") WHERE "isDefaultForCcy" AND "archivedAt" IS NULL;

COMMIT;
