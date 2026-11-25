-- Indus Operations · S08-T03 · Intake staging: batches, files and line candidates
--
--   intake_batch            one intake: an upload session (board 14), an email read for lines (board 36) or a
--                           paste. Holds the facts read so far (client, ref, deadline, terms) until a person confirms.
--   intake_file             one file in a batch and its processing state (Queued → Extracting → Ready / Needs
--                           attention), with the failure kind board 17 shows.
--   intake_line_candidate   an extracted line waiting for a person: values, code confidence and reasons, the Unsure
--                           question and options, duplicate link, the person's decision, the spans it stands on.
--                           NOTHING here touches enquiry_line: confirmation copies accepted lines across (S08-T06).
--
-- RecordType gains 'intake_file' (the subject of an extract_lines run). ADD VALUE ships ahead of code; no row uses it
-- until the deploy with the regenerated client is live.
--
-- Idempotent. RLS on, ops_app policy and grants as the base migration.

ALTER TYPE "ops"."RecordType" ADD VALUE IF NOT EXISTS 'intake_file';

BEGIN;

DO $$ BEGIN
  CREATE TYPE "ops"."IntakeSource" AS ENUM ('upload', 'mail', 'paste');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "ops"."IntakeBatchStatus" AS ENUM ('open', 'confirmed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "ops"."IntakeFileStatus" AS ENUM ('queued', 'extracting', 'ready', 'needs_attention', 'cancelled', 'removed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "ops"."intake_batch" (
  "id"                 uuid NOT NULL DEFAULT gen_random_uuid(),
  "source"             "ops"."IntakeSource" NOT NULL,
  "status"             "ops"."IntakeBatchStatus" NOT NULL DEFAULT 'open',
  "mailMessageId"      uuid,
  "createdById"        uuid,
  "createdByActionId"  uuid,
  "clientCompanyId"    uuid,
  "contactId"          uuid,
  "enquiryId"          uuid,
  "leadId"             uuid,
  "clientRef"          text,
  "deadline"           timestamptz(3),
  -- { incoterm, place, payment, compliance, validity, partial } each { text, spanId }
  "terms"              jsonb,
  -- { kind: 'revision', enquiryId, ref, reason } recorded by board 17 "Revision detected"
  "revisionIntent"     jsonb,
  "confirmedAt"        timestamptz(3),
  "confirmedById"      uuid,
  "createdAt"          timestamptz(3) NOT NULL DEFAULT now(),
  "updatedAt"          timestamptz(3) NOT NULL DEFAULT now(),
  "version"            integer NOT NULL DEFAULT 0,
  CONSTRAINT "intake_batch_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "intake_batch_status_createdAt_idx" ON "ops"."intake_batch" ("status", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "intake_batch_mailMessageId_idx" ON "ops"."intake_batch" ("mailMessageId");
-- One open mail batch per message: reading lines from an email twice reopens the same batch.
CREATE UNIQUE INDEX IF NOT EXISTS "intake_batch_open_mail_key"
  ON "ops"."intake_batch" ("mailMessageId") WHERE "mailMessageId" IS NOT NULL AND "status" = 'open';

CREATE TABLE IF NOT EXISTS "ops"."intake_file" (
  "id"               uuid NOT NULL DEFAULT gen_random_uuid(),
  "batchId"          uuid NOT NULL,
  "storedFileId"     uuid,
  "mailAttachmentId" uuid,
  "parentFileId"     uuid,
  "filename"         text NOT NULL,
  "kind"             text NOT NULL,
  "status"           "ops"."IntakeFileStatus" NOT NULL DEFAULT 'queued',
  "progressPct"      integer NOT NULL DEFAULT 0,
  "progressNote"     text,
  "pageCount"        integer,
  "sizeBytes"        integer,
  -- unreadable | password_protected | unsupported | too_large | failed
  "failureKind"      text,
  "failureNote"      text,
  "actionId"         uuid,
  "mappingId"        uuid,
  "linesFound"       integer NOT NULL DEFAULT 0,
  "linesToCheck"     integer NOT NULL DEFAULT 0,
  "uploadedById"     uuid,
  "createdAt"        timestamptz(3) NOT NULL DEFAULT now(),
  "updatedAt"        timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "intake_file_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "intake_file_kind_check" CHECK ("kind" IN ('pdf', 'sheet', 'docx', 'image', 'email', 'paste', 'zip', 'other')),
  CONSTRAINT "intake_file_progress_check" CHECK ("progressPct" BETWEEN 0 AND 100)
);
CREATE INDEX IF NOT EXISTS "intake_file_batchId_status_idx" ON "ops"."intake_file" ("batchId", "status");
CREATE INDEX IF NOT EXISTS "intake_file_status_createdAt_idx" ON "ops"."intake_file" ("status", "createdAt");

CREATE TABLE IF NOT EXISTS "ops"."intake_line_candidate" (
  "id"                 uuid NOT NULL DEFAULT gen_random_uuid(),
  "batchId"            uuid NOT NULL,
  "fileId"             uuid,
  "ord"                integer NOT NULL,
  "description"        text NOT NULL DEFAULT '',
  "qty"                numeric(18, 4),
  "qtyPrinted"         text,
  "uom"                text,
  "uomRaw"             text,
  "uomMethod"          text,
  "partNo"             text,
  "partNoNorm"         text,
  "make"               text,
  "spec"               text,
  "certification"      text,
  "clientRef"          text,
  "notes"              text,
  "confidence"         "ops"."Confidence" NOT NULL DEFAULT 'unsure',
  "reasons"            jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- { field, question, options: [{ value, label, sub }], doubt? } while the line is Unsure
  "unsure"             jsonb,
  "duplicateOfId"      uuid,
  "decision"           text NOT NULL DEFAULT 'pending',
  "decidedById"        uuid,
  "decidedAt"          timestamptz(3),
  "partId"             uuid,
  "partMatch"          text,
  "catalogueProductId" text,
  "spanIds"            uuid[] NOT NULL DEFAULT '{}',
  -- { field: spanId } for Why? per value
  "fieldSpans"         jsonb NOT NULL DEFAULT '{}'::jsonb,
  "sourcePage"         integer,
  "sourceKind"         text,
  -- board 36 Source: table | text; sheets: the row
  "sourceDetail"       text,
  "version"            integer NOT NULL DEFAULT 0,
  "createdAt"          timestamptz(3) NOT NULL DEFAULT now(),
  "updatedAt"          timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "intake_line_candidate_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "intake_line_candidate_decision_check"
    CHECK ("decision" IN ('pending', 'accepted', 'edited', 'merged', 'removed'))
);
CREATE INDEX IF NOT EXISTS "intake_line_candidate_batchId_ord_idx" ON "ops"."intake_line_candidate" ("batchId", "ord");
CREATE INDEX IF NOT EXISTS "intake_line_candidate_fileId_idx" ON "ops"."intake_line_candidate" ("fileId");

-- ── Foreign keys ──────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE "ops"."intake_batch" ADD CONSTRAINT "intake_batch_mailMessageId_fkey"
    FOREIGN KEY ("mailMessageId") REFERENCES "ops"."mail_message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."intake_batch" ADD CONSTRAINT "intake_batch_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "ops"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."intake_batch" ADD CONSTRAINT "intake_batch_createdByActionId_fkey"
    FOREIGN KEY ("createdByActionId") REFERENCES "ops"."assistant_action"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."intake_batch" ADD CONSTRAINT "intake_batch_clientCompanyId_fkey"
    FOREIGN KEY ("clientCompanyId") REFERENCES "ops"."company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."intake_batch" ADD CONSTRAINT "intake_batch_contactId_fkey"
    FOREIGN KEY ("contactId") REFERENCES "ops"."contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."intake_batch" ADD CONSTRAINT "intake_batch_enquiryId_fkey"
    FOREIGN KEY ("enquiryId") REFERENCES "ops"."enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."intake_batch" ADD CONSTRAINT "intake_batch_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "ops"."lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."intake_batch" ADD CONSTRAINT "intake_batch_confirmedById_fkey"
    FOREIGN KEY ("confirmedById") REFERENCES "ops"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."intake_file" ADD CONSTRAINT "intake_file_batchId_fkey"
    FOREIGN KEY ("batchId") REFERENCES "ops"."intake_batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."intake_file" ADD CONSTRAINT "intake_file_storedFileId_fkey"
    FOREIGN KEY ("storedFileId") REFERENCES "ops"."stored_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."intake_file" ADD CONSTRAINT "intake_file_mailAttachmentId_fkey"
    FOREIGN KEY ("mailAttachmentId") REFERENCES "ops"."mail_attachment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."intake_file" ADD CONSTRAINT "intake_file_parentFileId_fkey"
    FOREIGN KEY ("parentFileId") REFERENCES "ops"."intake_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."intake_file" ADD CONSTRAINT "intake_file_actionId_fkey"
    FOREIGN KEY ("actionId") REFERENCES "ops"."assistant_action"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."intake_file" ADD CONSTRAINT "intake_file_mappingId_fkey"
    FOREIGN KEY ("mappingId") REFERENCES "ops"."client_column_mapping"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."intake_file" ADD CONSTRAINT "intake_file_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "ops"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ops"."intake_line_candidate" ADD CONSTRAINT "intake_line_candidate_batchId_fkey"
    FOREIGN KEY ("batchId") REFERENCES "ops"."intake_batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."intake_line_candidate" ADD CONSTRAINT "intake_line_candidate_fileId_fkey"
    FOREIGN KEY ("fileId") REFERENCES "ops"."intake_file"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."intake_line_candidate" ADD CONSTRAINT "intake_line_candidate_duplicateOfId_fkey"
    FOREIGN KEY ("duplicateOfId") REFERENCES "ops"."intake_line_candidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."intake_line_candidate" ADD CONSTRAINT "intake_line_candidate_decidedById_fkey"
    FOREIGN KEY ("decidedById") REFERENCES "ops"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."intake_line_candidate" ADD CONSTRAINT "intake_line_candidate_partId_fkey"
    FOREIGN KEY ("partId") REFERENCES "ops"."part"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Part-number similarity for ops_app (S08-T02 match step 4) ──────────────────────────────
-- pg_trgm lives in public on production (extensions elsewhere) and ops_app has no privilege on public. A narrow
-- SECURITY DEFINER wrapper, pinned to the extension's schema, is the only path to it: pure, no table access.
DO $$
DECLARE
  trgm_schema text;
BEGIN
  SELECT extnamespace::regnamespace::text INTO trgm_schema FROM pg_extension WHERE extname = 'pg_trgm';
  IF trgm_schema IS NULL THEN
    RAISE EXCEPTION 'pg_trgm is not installed (migration 202611212358_ops_extensions)';
  END IF;
  EXECUTE format($f$
    CREATE OR REPLACE FUNCTION ops.trgm_similarity(a text, b text) RETURNS real
      LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE SECURITY DEFINER
      SET search_path = %I, pg_temp
      AS 'SELECT similarity(a, b)'
  $f$, trgm_schema);
END $$;
ALTER FUNCTION ops.trgm_similarity(text, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION ops.trgm_similarity(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ops.trgm_similarity(text, text) TO ops_app;

-- ── RLS, policies and grants ──────────────────────────────────────────────────────────────
DO $$
DECLARE
  t text;
  r text;
BEGIN
  FOREACH t IN ARRAY ARRAY['intake_batch', 'intake_file', 'intake_line_candidate'] LOOP
    EXECUTE format('ALTER TABLE ops.%I ENABLE ROW LEVEL SECURITY', t);
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'ops' AND tablename = t AND policyname = 'ops_app_all'
    ) THEN
      EXECUTE format(
        'CREATE POLICY ops_app_all ON ops.%I AS PERMISSIVE FOR ALL TO ops_app USING (true) WITH CHECK (true)', t);
    END IF;
    EXECUTE format('REVOKE ALL ON ops.%I FROM PUBLIC', t);
    FOREACH r IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
        EXECUTE format('REVOKE ALL ON ops.%I FROM %I', t, r);
      END IF;
    END LOOP;
  END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON "ops"."intake_batch" TO ops_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "ops"."intake_file" TO ops_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "ops"."intake_line_candidate" TO ops_app;

COMMIT;
