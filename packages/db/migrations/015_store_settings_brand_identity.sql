-- 015_store_settings_brand_identity.sql
--
-- Brand & identity: the three brand images an operator could not set, plus the
-- placement switch the header needs.
--
-- `logoMediaId` has existed since the schema was written and is read by the
-- footer and the Organization JSON-LD, but no admin surface has ever written
-- it — it is null in production. This migration adds the three siblings that
-- make the set complete, and the Brand & identity panel that writes all four.
--
--   logoStyle          how the header logo relates to the typeset wordmark
--   footerLogoMediaId  the reversed lockup drawn on the navy footer
--   faviconMediaId     the browser-tab icon
--   searchLogoMediaId  the square mark Google draws in a result row / panel
--
-- Three separate columns rather than one reused image, because the surfaces
-- want different files: the footer is the ink surface and normally takes the
-- light variant of the header art; a favicon authored to survive 16px in a tab
-- strip is cruder than the mark that should stand for the brand at ~24px in a
-- SERP row. Reusing one column would force a choice of which surface to get
-- right.
--
-- Strictly additive. Every column is nullable (or defaulted), so existing rows
-- keep rendering exactly what they render today: `logoStyle` defaults to the
-- behaviour the header already has, and a null image on any of the three new
-- columns resolves to the same fallback that was there before this ran.
--
-- Column names are camelCase and MUST stay double-quoted: Prisma in this repo
-- does not `@map` its fields, so the physical columns are camelCase. See the
-- naming note at the bottom of README.md — an unquoted identifier folds to
-- lowercase and creates a second, silently unused column.

BEGIN;

ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS "logoStyle" text NOT NULL DEFAULT 'mark_and_name',
  ADD COLUMN IF NOT EXISTS "footerLogoMediaId" text,
  ADD COLUMN IF NOT EXISTS "faviconMediaId" text,
  ADD COLUMN IF NOT EXISTS "searchLogoMediaId" text;

COMMENT ON COLUMN store_settings."logoStyle" IS
  'mark_and_name = header logo sits beside the typeset wordmark; logo_only = it replaces the wordmark. The header cannot tell a monogram from a finished lockup from the bytes, so the operator says which.';
COMMENT ON COLUMN store_settings."footerLogoMediaId" IS
  'Reversed/light lockup for the navy footer. Null keeps the typeset wordmark — deliberately does NOT fall back to logoMediaId, since a dark lockup on the dark footer reads as a broken image.';
COMMENT ON COLUMN store_settings."faviconMediaId" IS
  'Browser-tab icon. Null falls back to the bundled app/favicon.ico.';
COMMENT ON COLUMN store_settings."searchLogoMediaId" IS
  'Square mark for search results and knowledge panels (rel=icon sizes=192x192, apple-touch-icon, Organization JSON-LD logo). Null falls back favicon -> logo.';

-- ON DELETE SET NULL matches `logoMediaId`: deleting an image from the media
-- library must clear the reference and fall back, never block the delete or
-- leave the settings row pointing at a dead object.
--
-- Guarded individually because ADD CONSTRAINT has no IF NOT EXISTS on PG 17 —
-- re-running the file must stay a no-op.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'store_settings_footerLogoMediaId_fkey') THEN
    ALTER TABLE store_settings
      ADD CONSTRAINT "store_settings_footerLogoMediaId_fkey"
      FOREIGN KEY ("footerLogoMediaId") REFERENCES media(id)
      ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'store_settings_faviconMediaId_fkey') THEN
    ALTER TABLE store_settings
      ADD CONSTRAINT "store_settings_faviconMediaId_fkey"
      FOREIGN KEY ("faviconMediaId") REFERENCES media(id)
      ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'store_settings_searchLogoMediaId_fkey') THEN
    ALTER TABLE store_settings
      ADD CONSTRAINT "store_settings_searchLogoMediaId_fkey"
      FOREIGN KEY ("searchLogoMediaId") REFERENCES media(id)
      ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
END $$;

-- Only the two values the app knows how to render. Without this a bad write
-- lands a string the header has no branch for and the logo silently vanishes.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'store_settings_logoStyle_check') THEN
    ALTER TABLE store_settings
      ADD CONSTRAINT "store_settings_logoStyle_check"
      CHECK ("logoStyle" IN ('mark_and_name', 'logo_only'));
  END IF;
END $$;

COMMIT;
