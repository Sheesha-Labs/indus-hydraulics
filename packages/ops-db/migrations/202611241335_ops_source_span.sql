-- Indus Operations · S05-T04 · source spans (ADR-12 "Why?", 08-map-integrations §2.8)
--
--   ops.source_span   one verbatim quote a model cited, resolved to a place in its source: for an email the
--                     character range in mail_message.bodyText (textHash = bodyTextHash at the time), for a PDF
--                     a page and box, for a sheet a cell. Moved forward from S08: classification and link
--                     reasons cite email text now, and S06's Why? reads these rows. S08 adds the PDF, sheet and
--                     DOCX resolvers.
--
--   resolved   exact | fuzzy | page_only | unresolved   (an unresolved quote is never shown as evidence)
--
-- Idempotent. RLS + ops_app policy and grants: insert, read and delete (with its message); a span is never edited.

BEGIN;

CREATE TABLE IF NOT EXISTS "ops"."source_span" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sourceKind" TEXT NOT NULL,
    "sourceId" UUID NOT NULL,
    "textHash" TEXT,
    "page" INTEGER,
    "sheet" TEXT,
    "cellRef" TEXT,
    "charStart" INTEGER,
    "charEnd" INTEGER,
    "bbox" JSONB,
    "quote" TEXT NOT NULL,
    "resolved" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "source_span_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "source_span_kind_check" CHECK ("sourceKind" IN ('email', 'pdf', 'sheet', 'image', 'docx')),
    CONSTRAINT "source_span_resolved_check" CHECK ("resolved" IN ('exact', 'fuzzy', 'page_only', 'unresolved')),
    CONSTRAINT "source_span_range_check" CHECK (
      ("charStart" IS NULL AND "charEnd" IS NULL) OR ("charStart" >= 0 AND "charEnd" >= "charStart")
    ),
    CONSTRAINT "source_span_quote_check" CHECK (char_length("quote") BETWEEN 1 AND 2000)
);

CREATE INDEX IF NOT EXISTS "source_span_sourceKind_sourceId_idx" ON "ops"."source_span"("sourceKind", "sourceId");

ALTER TABLE "ops"."source_span" ENABLE ROW LEVEL SECURITY;
DO $$
DECLARE
  r text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'ops' AND tablename = 'source_span' AND policyname = 'ops_app_all'
  ) THEN
    CREATE POLICY ops_app_all ON "ops"."source_span" AS PERMISSIVE FOR ALL TO ops_app USING (true) WITH CHECK (true);
  END IF;
  REVOKE ALL ON "ops"."source_span" FROM PUBLIC;
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON ops.source_span FROM %I', r);
    END IF;
  END LOOP;
END $$;

GRANT SELECT, INSERT, DELETE ON "ops"."source_span" TO ops_app;

-- The mailbox purge (ops_maint) removes a deleted mailbox's email spans with its messages.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ops_maint') THEN
    GRANT SELECT, DELETE ON "ops"."source_span" TO ops_maint;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'ops' AND tablename = 'source_span' AND policyname = 'ops_maint_purge'
    ) THEN
      CREATE POLICY ops_maint_purge ON "ops"."source_span" AS PERMISSIVE FOR ALL TO ops_maint USING (true);
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'ops.source_span'::regclass) THEN
    RAISE EXCEPTION 'ops.source_span must have row-level security on';
  END IF;
END $$;

COMMIT;
