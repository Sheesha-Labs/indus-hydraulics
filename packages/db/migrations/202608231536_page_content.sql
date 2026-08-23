-- Pages & Blocks: section documents for the editable marketing pages.
--
-- One row per editable page. `key` is `master/<page>` for a master page and
-- `<kind>/<slug>` for a sub-page built from a record (`market/nigeria`,
-- `brand/eaton`). `sections` holds the ordered section document that the
-- registry in @indus/domain/page-sections merges over its code defaults.
--
-- Column types match Prisma's String @id @default(uuid()) → TEXT (not UUID).
-- IDs are generated application-side via Prisma; no DB-side default. Column
-- names are Prisma's camelCase, quoted, because the model carries no @map on
-- its fields — only on the table.
--
-- Idempotent — safe to re-run.

BEGIN;

CREATE TABLE IF NOT EXISTS "page_content" (
  "id"          TEXT         NOT NULL PRIMARY KEY,
  "key"         TEXT         NOT NULL,
  "kind"        TEXT         NOT NULL,
  "sections"    JSONB        NOT NULL DEFAULT '[]'::jsonb,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedById" TEXT,
  CONSTRAINT "page_content_updatedById_fkey"
    FOREIGN KEY ("updatedById") REFERENCES "staff_users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "page_content_key_key" ON "page_content" ("key");
CREATE INDEX IF NOT EXISTS "page_content_kind_idx" ON "page_content" ("kind");

-- Admin-owned content. Every read goes through Prisma on the server, never an
-- anon key, so RLS is on with no policy — matching the other hand-rolled
-- tables (see 202605110531_enable_rls_unprotected_tables.sql).
ALTER TABLE "page_content" ENABLE ROW LEVEL SECURITY;

COMMIT;
