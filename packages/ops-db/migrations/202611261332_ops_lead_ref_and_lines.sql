-- Indus Operations · S09-T05 (applied with S09-T01, whose lead machine writes lead.version) · Leads
--
--   lead            ref L-{nnnn} (unique, CHECK), ownerId, title, contactId, clientRef, neededBy, notes, version
--                   (optimistic writes through server/enquiry/transition.ts). Existing rows get a ref from
--                   ops.allocate_number('lead') before the column becomes NOT NULL.
--   lead_line       a lead's material specs (board 22): description, part no., qty, uom, spec notes, trade, the
--                   document and page they were read from, their spans, who confirmed them.
--   number_sequence 'lead' seeded at 1 with the evidence "no legacy leads" (the website never numbered leads).
--   enquiry         preallocateRequested: "Pre-allocate from line cards" on convert (board 23), consumed in S12.
--   (documents read into a lead use document.subjectType 'lead'; intake_batch.leadId already exists.)
--
-- Idempotent. RLS on, ops_app policy and grants as the base migration.

BEGIN;

ALTER TABLE ops.lead
  ADD COLUMN IF NOT EXISTS "ref"        text,
  ADD COLUMN IF NOT EXISTS "ownerId"    uuid REFERENCES ops."user"(id),
  ADD COLUMN IF NOT EXISTS "title"      text,
  ADD COLUMN IF NOT EXISTS "contactId"  uuid REFERENCES ops.contact(id),
  ADD COLUMN IF NOT EXISTS "clientRef"  text,
  ADD COLUMN IF NOT EXISTS "neededBy"   date,
  ADD COLUMN IF NOT EXISTS "notes"      text,
  ADD COLUMN IF NOT EXISTS "version"    integer NOT NULL DEFAULT 0;

UPDATE ops.number_sequence
   SET "padTo" = 4,
       "seededAt" = coalesce("seededAt", now()),
       "seedEvidence" = coalesce("seedEvidence", '{"source": "no legacy leads"}'::jsonb),
       "updatedAt" = now()
 WHERE "key" = 'lead';

INSERT INTO ops.number_counter ("sequenceKey", "scope", "nextValue", "updatedAt")
VALUES ('lead', '', 1, now())
ON CONFLICT ("sequenceKey", "scope") DO NOTHING;

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id FROM ops.lead WHERE "ref" IS NULL ORDER BY "createdAt", id LOOP
    UPDATE ops.lead
       SET "ref" = (SELECT formatted FROM ops.allocate_number('lead', '', 'lead', r.id))
     WHERE id = r.id;
  END LOOP;
END $$;

ALTER TABLE ops.lead ALTER COLUMN "ref" SET NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lead_ref_key') THEN
    ALTER TABLE ops.lead ADD CONSTRAINT lead_ref_key UNIQUE ("ref");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lead_ref_format') THEN
    ALTER TABLE ops.lead ADD CONSTRAINT lead_ref_format CHECK ("ref" ~ '^L-\d{4,}$');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS lead_stage_created_idx ON ops.lead ("stage", "createdAt" DESC, id);
CREATE INDEX IF NOT EXISTS lead_company_idx ON ops.lead ("companyId");

CREATE TABLE IF NOT EXISTS ops.lead_line (
  "id"               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "leadId"           uuid NOT NULL REFERENCES ops.lead(id) ON DELETE CASCADE,
  "no"               integer NOT NULL,
  "description"      text NOT NULL,
  "partNo"           text,
  "partNoNorm"       text,
  "qty"              numeric(18,4),
  "uom"              text,
  "specNotes"        text,
  "tradeId"          uuid REFERENCES ops.trade(id),
  "sourceDocumentId" uuid,
  "sourcePage"       integer,
  "spanIds"          uuid[] NOT NULL DEFAULT '{}',
  "confirmedById"    uuid REFERENCES ops."user"(id),
  "confirmedAt"      timestamptz(3),
  "version"          integer NOT NULL DEFAULT 0,
  "createdAt"        timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT lead_line_lead_no_key UNIQUE ("leadId", "no")
);

ALTER TABLE ops.enquiry
  ADD COLUMN IF NOT EXISTS "preallocateRequested" boolean NOT NULL DEFAULT false;

ALTER TABLE ops.lead_line ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'ops' AND tablename = 'lead_line' AND policyname = 'ops_app_all'
  ) THEN
    CREATE POLICY ops_app_all ON ops.lead_line AS PERMISSIVE FOR ALL TO ops_app USING (true) WITH CHECK (true);
  END IF;
END $$;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops.lead_line TO ops_app;

COMMIT;
