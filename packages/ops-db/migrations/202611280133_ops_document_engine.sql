-- Indus Operations · S11-T04 · the document engine (ADR-14, 06-map-schema §8.10, §9.8)
--
-- 1. document_template: a published / draft / archived status, who published it and when, and the page size.
--    Settings › Document templates (S11-T05) edits a draft and publishes it; documents use the published one.
-- 2. document_version: the SHA-256 of the rendered PDF and when it was rendered (render once, then verify on
--    every attach and download).
-- 3. stored_file: generated documents default to the ops-documents bucket.
-- 4. ops.issued_file_immutable(): a stored file that belongs to an issued document (any status but draft) can
--    be neither updated nor deleted. The only exception is the retention purge, run as ops_maint, which may set
--    purgedAt (and nothing else). A cancelled document keeps its file unchanged; a reissue writes a new file.
--
-- Idempotent.

BEGIN;

ALTER TABLE ops.document_template
  ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS "publishedAt" timestamptz(3),
  ADD COLUMN IF NOT EXISTS "publishedById" uuid REFERENCES ops."user"(id),
  ADD COLUMN IF NOT EXISTS "pageSize" text NOT NULL DEFAULT 'A4';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'document_template_status_check') THEN
    ALTER TABLE ops.document_template
      ADD CONSTRAINT document_template_status_check CHECK ("status" IN ('draft', 'published', 'archived'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'document_template_page_size_check') THEN
    ALTER TABLE ops.document_template
      ADD CONSTRAINT document_template_page_size_check CHECK ("pageSize" IN ('A4', 'Letter'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'document_template_published_check') THEN
    ALTER TABLE ops.document_template
      ADD CONSTRAINT document_template_published_check
      CHECK (("status" = 'published') = ("publishedAt" IS NOT NULL) OR "status" = 'archived');
  END IF;
END $$;

-- At most one published template per kind.
CREATE UNIQUE INDEX IF NOT EXISTS document_template_one_published
  ON ops.document_template ("kind") WHERE "status" = 'published';

ALTER TABLE ops.document_version
  ADD COLUMN IF NOT EXISTS "sha256" text,
  ADD COLUMN IF NOT EXISTS "renderedAt" timestamptz(3);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'document_version_sha256_check') THEN
    ALTER TABLE ops.document_version
      ADD CONSTRAINT document_version_sha256_check CHECK ("sha256" IS NULL OR "sha256" ~ '^[0-9a-f]{64}$');
  END IF;
END $$;

ALTER TABLE ops.stored_file ALTER COLUMN "bucket" SET DEFAULT 'ops-documents';

CREATE OR REPLACE FUNCTION ops.issued_file_immutable() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  issued boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
      FROM ops.document_version dv
      JOIN ops.document d ON d.id = dv."documentId"
     WHERE dv."fileId" = OLD.id
       AND d."status" <> 'draft'
  ) INTO issued;
  IF NOT issued THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;
  -- The retention purge (ops_maint) may mark the file purged, and change nothing else.
  IF TG_OP = 'UPDATE'
     AND current_user = 'ops_maint'
     AND OLD."purgedAt" IS NULL AND NEW."purgedAt" IS NOT NULL
     AND (to_jsonb(NEW) - 'purgedAt') = (to_jsonb(OLD) - 'purgedAt') THEN
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'stored_file % belongs to an issued document and is immutable', OLD.id
    USING ERRCODE = 'integrity_constraint_violation';
END $$;

DROP TRIGGER IF EXISTS stored_file_issued_immutable ON ops.stored_file;
CREATE TRIGGER stored_file_issued_immutable
  BEFORE UPDATE OR DELETE ON ops.stored_file
  FOR EACH ROW EXECUTE FUNCTION ops.issued_file_immutable();

COMMIT;
