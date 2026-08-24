-- The footer becomes one editable surface: /admin/footer.
--
-- Almost everything the footer draws was already in the database — link
-- columns in the `footer_main` nav menu, contact details and the logo on
-- `store_settings` — but spread across two admin screens neither of which is
-- named after the thing being edited. Two pieces were not in the database at
-- all, and those are what this migration adds:
--
--   · store_settings."footerLegalLine"
--       The bottom bar was `© {year} {name} Pvt. Ltd.`, hardcoded in
--       SiteFooter.tsx. "Pvt. Ltd." is an Indian company suffix; the entity is
--       Indus Hydraulic Power Trading LLC, a UAE LLC. Nobody could correct it
--       without a deploy. Nullable, and null still renders a correct line from
--       `legalName` — so this is additive for a database nobody edits.
--
--   · footer_socials
--       There was no social row in the footer and no editable list anywhere.
--       The Organization JSON-LD's `sameAs` read NEXT_PUBLIC_SOCIAL_PROFILES,
--       a comma-separated Vercel env var — so the one list a search engine
--       uses to connect this site to its LinkedIn was editable only by someone
--       with deploy access, and had no way to agree with what the page showed.
--       These rows now feed both.
--
-- Column types match Prisma's `String @id @default(uuid())` → TEXT (not UUID).
-- IDs are generated application-side via Prisma; no DB-side default. Column
-- names are Prisma's camelCase, quoted, because the model carries no @map on
-- its fields — only on the table.
--
-- No data is seeded here. The editor writes rows on first save, and an empty
-- `footer_socials` renders no social row at all rather than an empty box —
-- which is the correct state until the accounts exist.
--
-- Idempotent — safe to re-run.

BEGIN;

ALTER TABLE "store_settings"
  ADD COLUMN IF NOT EXISTS "footerLegalLine" TEXT;

COMMENT ON COLUMN "store_settings"."footerLegalLine" IS
  'Footer copyright / entity line. {year} is substituted at render time. Null falls back to "© {year} {legalName ?? name}. All rights reserved."';

CREATE TABLE IF NOT EXISTS "footer_socials" (
  "id"        TEXT         NOT NULL PRIMARY KEY,
  "position"  INTEGER      NOT NULL DEFAULT 0,
  "label"     TEXT         NOT NULL,
  "platform"  TEXT         NOT NULL DEFAULT 'other',
  "href"      TEXT         NOT NULL,
  "isVisible" BOOLEAN      NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "footer_socials_position_idx" ON "footer_socials" ("position");

COMMENT ON COLUMN "footer_socials"."platform" IS
  'Which icon to draw. Stored rather than sniffed from href, so a vanity domain still gets the right mark. See FOOTER_SOCIAL_PLATFORMS in @indus/domain.';

-- Admin-owned content. Every read goes through Prisma on the server, never an
-- anon key, so RLS is on with no policy — matching the other hand-rolled
-- tables (see 202605110531_enable_rls_unprotected_tables.sql).
ALTER TABLE "footer_socials" ENABLE ROW LEVEL SECURITY;

COMMIT;
