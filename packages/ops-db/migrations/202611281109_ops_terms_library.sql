-- Indus Operations · S11-T06 · the offer terms library (board 39, 06-map-schema §8.1, ADR-08, ADR-28)
--
-- 1. terms_clause: a position inside its category, whether it is the category's default, where it came from
--    ("From Offer INDUS/Q…"), the category vocabulary as a CHECK, and the approval rule as jsonb
--    ({kind: always} | {kind: payment_days_over, days} | {kind: advance_pct_below, pct}, evaluated in code).
--    The column held text and no rows; a text value that parses as JSON is kept, anything else becomes NULL.
-- 2. terms_preset: a position, and at most one live preset that is the default for new clients.
-- 3. terms_import / terms_import_candidate: "Import from offer". An uploaded INDUS/Q PDF (ops-uploads) is read by
--    the Assistant (import_terms, Do quietly, internal) into candidate clauses. Candidates are proposals: nothing
--    becomes a clause until a person accepts it, one by one.

BEGIN;

ALTER TABLE ops.terms_clause
  ADD COLUMN IF NOT EXISTS "position" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "isDefault" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "sourceRef" text;

DO $$ BEGIN
  IF (SELECT data_type FROM information_schema.columns
       WHERE table_schema = 'ops' AND table_name = 'terms_clause' AND column_name = 'approvalRule') = 'text' THEN
    CREATE OR REPLACE FUNCTION pg_temp.try_jsonb(t text) RETURNS jsonb LANGUAGE plpgsql AS $f$
    BEGIN RETURN t::jsonb; EXCEPTION WHEN others THEN RETURN NULL; END $f$;
    ALTER TABLE ops.terms_clause
      ALTER COLUMN "approvalRule" TYPE jsonb USING pg_temp.try_jsonb("approvalRule");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'terms_clause_category_check') THEN
    ALTER TABLE ops.terms_clause ADD CONSTRAINT terms_clause_category_check CHECK ("category" IN (
      'payment', 'delivery', 'lead_time', 'validity', 'make_origin', 'vat', 'documents', 'inspection',
      'warranty', 'packing', 'disclaimer', 'cancellation'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'terms_clause_approval_rule_check') THEN
    ALTER TABLE ops.terms_clause ADD CONSTRAINT terms_clause_approval_rule_check CHECK (
      "approvalRule" IS NULL
      OR coalesce("approvalRule" ->> 'kind', '') IN ('always', 'payment_days_over', 'advance_pct_below'));
  END IF;
END $$;

-- One default clause per live category.
CREATE UNIQUE INDEX IF NOT EXISTS terms_clause_one_default
  ON ops.terms_clause ("category") WHERE "isDefault" AND "archivedAt" IS NULL;

ALTER TABLE ops.terms_preset ADD COLUMN IF NOT EXISTS "position" integer NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS terms_preset_one_default
  ON ops.terms_preset ("isDefaultForNewClient") WHERE "isDefaultForNewClient" AND "archivedAt" IS NULL;

CREATE TABLE IF NOT EXISTS ops.terms_import (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "fileId"      uuid NOT NULL REFERENCES ops.stored_file(id) ON DELETE RESTRICT,
  "offerRef"    text,
  "status"      text NOT NULL DEFAULT 'reading' CHECK ("status" IN ('reading', 'ready', 'failed', 'closed')),
  "failureNote" text,
  "actionId"    uuid,
  "createdById" uuid REFERENCES ops."user"(id) ON DELETE RESTRICT,
  "createdAt"   timestamptz(3) NOT NULL DEFAULT now(),
  "updatedAt"   timestamptz(3) NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS terms_import_status_idx ON ops.terms_import ("status", "createdAt" DESC);

CREATE TABLE IF NOT EXISTS ops.terms_import_candidate (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "importId"    uuid NOT NULL REFERENCES ops.terms_import(id) ON DELETE CASCADE,
  "position"    integer NOT NULL DEFAULT 0,
  "category"    text NOT NULL,
  "title"       text NOT NULL,
  "body"        text NOT NULL,
  "variables"   text[] NOT NULL DEFAULT '{}',
  "status"      text NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'accepted', 'skipped')),
  "clauseId"    uuid REFERENCES ops.terms_clause(id) ON DELETE SET NULL,
  "decidedById" uuid REFERENCES ops."user"(id) ON DELETE RESTRICT,
  "decidedAt"   timestamptz(3)
);
CREATE INDEX IF NOT EXISTS terms_import_candidate_import_idx
  ON ops.terms_import_candidate ("importId", "position");

ALTER TABLE ops.terms_import ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops.terms_import_candidate ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'ops' AND tablename = 'terms_import'
                 AND policyname = 'ops_app_all') THEN
    CREATE POLICY ops_app_all ON ops.terms_import AS PERMISSIVE FOR ALL TO ops_app USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'ops' AND tablename = 'terms_import_candidate'
                 AND policyname = 'ops_app_all') THEN
    CREATE POLICY ops_app_all ON ops.terms_import_candidate AS PERMISSIVE FOR ALL TO ops_app USING (true) WITH CHECK (true);
  END IF;
END $$;
GRANT SELECT, INSERT, UPDATE ON ops.terms_import TO ops_app;
GRANT SELECT, INSERT, UPDATE ON ops.terms_import_candidate TO ops_app;

COMMIT;
