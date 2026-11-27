-- Indus Operations · S10-T04/T05/T06 · supplier onboarding, approvals, line-card status and document status
--
--   ops."SupplierOnboardingStatus"  draft → proposed → under_review → approved_trial | approved | rejected; suspended.
--   supplier_profile                onboardingStatus (NULL = never in the wizard: a contact-only or research supplier
--                                   keeps RFQ eligibility, board 130), who proposed it, registry facts, the registry
--                                   switchboard number (the only number a bank call-back may use, C21), commercial
--                                   terms that pre-fill RFQs and POs (board 52), the price list file, rejection and
--                                   re-screen dates, TPI on each trial PO.
--   ops.supplier_approval           one row per tier decision (propose, send back, approve, approve on trial, reject,
--                                   promote, block, unblock), with who and why. Tiers change only through it.
--   supplier_line_card              status (proposed | trial | active | suspended | not_carried), the documents that
--                                   cover it (an expired one suspends it), a spec note and a version per save.
--   compliance_document             status, the reminder thresholds already sent (60/30/7, C18), the trades it covers
--                                   and a note.
--
-- RLS on the new table with the ops_app policy. Idempotent.

BEGIN;

DO $$ BEGIN
  CREATE TYPE ops."SupplierOnboardingStatus" AS ENUM
    ('draft', 'proposed', 'under_review', 'approved_trial', 'approved', 'suspended', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE ops.supplier_profile
  ADD COLUMN IF NOT EXISTS "onboardingStatus" ops."SupplierOnboardingStatus",
  ADD COLUMN IF NOT EXISTS "proposedById" uuid REFERENCES ops."user"(id),
  ADD COLUMN IF NOT EXISTS "proposedAt" timestamptz(3),
  ADD COLUMN IF NOT EXISTS "registryNo" text,
  ADD COLUMN IF NOT EXISTS "taxId" text,
  ADD COLUMN IF NOT EXISTS "foundedYear" integer CHECK ("foundedYear" IS NULL OR "foundedYear" BETWEEN 1800 AND 2100),
  ADD COLUMN IF NOT EXISTS "staffCount" integer CHECK ("staffCount" IS NULL OR "staffCount" >= 0),
  ADD COLUMN IF NOT EXISTS "introducedBy" text,
  ADD COLUMN IF NOT EXISTS "address" text,
  ADD COLUMN IF NOT EXISTS "registryPhone" text,
  ADD COLUMN IF NOT EXISTS "quoteCurrencies" char(3)[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "validityDays" integer CHECK ("validityDays" IS NULL OR "validityDays" BETWEEN 1 AND 365),
  ADD COLUMN IF NOT EXISTS "leadTimeText" text,
  ADD COLUMN IF NOT EXISTS "moqText" text,
  ADD COLUMN IF NOT EXISTS "documentsWithPo" text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "expectedReplyDays" integer CHECK ("expectedReplyDays" IS NULL OR "expectedReplyDays" BETWEEN 1 AND 60),
  ADD COLUMN IF NOT EXISTS "priceListFileId" uuid REFERENCES ops.stored_file(id),
  ADD COLUMN IF NOT EXISTS "rejectReason" text,
  ADD COLUMN IF NOT EXISTS "reproposeAfter" date,
  ADD COLUMN IF NOT EXISTS "rescreenDueAt" date,
  ADD COLUMN IF NOT EXISTS "lastScreenedAt" timestamptz(3),
  ADD COLUMN IF NOT EXISTS "trialTpiEachPo" boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "version" integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS supplier_profile_onboarding_idx
  ON ops.supplier_profile ("onboardingStatus") WHERE "onboardingStatus" IS NOT NULL;
CREATE INDEX IF NOT EXISTS supplier_profile_rescreen_idx
  ON ops.supplier_profile ("rescreenDueAt") WHERE "rescreenDueAt" IS NOT NULL;

CREATE TABLE IF NOT EXISTS ops.supplier_approval (
  "id"           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "supplierId"   uuid NOT NULL REFERENCES ops.company(id),
  "decision"     text NOT NULL CHECK ("decision" IN
                   ('propose', 'send_back', 'approve', 'approve_trial', 'reject', 'promote', 'block', 'unblock')),
  "fromTier"     ops."SupplierTier",
  "toTier"       ops."SupplierTier",
  "conditions"   jsonb NOT NULL DEFAULT '[]',
  "reason"       text,
  "decidedById"  uuid REFERENCES ops."user"(id),
  "decidedAt"    timestamptz(3) NOT NULL DEFAULT now(),
  "actionId"     uuid REFERENCES ops.assistant_action(id)
);
CREATE INDEX IF NOT EXISTS supplier_approval_supplier_idx ON ops.supplier_approval ("supplierId", "decidedAt" DESC);

ALTER TABLE ops.supplier_approval ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'ops' AND tablename = 'supplier_approval' AND policyname = 'ops_app_all'
  ) THEN
    CREATE POLICY ops_app_all ON ops.supplier_approval AS PERMISSIVE FOR ALL TO ops_app USING (true) WITH CHECK (true);
  END IF;
END $$;
-- A decision, once taken, is the record: no UPDATE or DELETE for ops_app.
GRANT SELECT, INSERT ON ops.supplier_approval TO ops_app;

ALTER TABLE ops.supplier_line_card
  ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'active'
    CHECK ("status" IN ('proposed', 'trial', 'active', 'suspended', 'not_carried')),
  ADD COLUMN IF NOT EXISTS "coveredByDocumentIds" uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "specNote" text,
  ADD COLUMN IF NOT EXISTS "suspendedReason" text,
  ADD COLUMN IF NOT EXISTS "version" integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS supplier_line_card_supplier_status_idx ON ops.supplier_line_card ("supplierId", "status");

ALTER TABLE ops.compliance_document
  ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'received'
    CHECK ("status" IN ('requested', 'received', 'awaiting_signature', 'signed', 'missing', 'expired')),
  ADD COLUMN IF NOT EXISTS "remindersSentDays" integer[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "coversTradeIds" uuid[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "note" text;
CREATE INDEX IF NOT EXISTS compliance_document_status_expiry_idx
  ON ops.compliance_document ("status", "expiresAt") WHERE "archivedAt" IS NULL;

COMMIT;
