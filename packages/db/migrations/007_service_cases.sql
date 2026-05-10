-- Service Cases — case-study-led /services section. Replaces the old
-- "BOP services as products" pattern. Mirrors the Prisma model ServiceCase
-- + 3 enums (ServiceCaseStatus, ServiceCaseCategory, ServiceCaseCardTagStyle)
-- added in the same PR.
--
-- Applied via Supabase MCP `apply_migration`. Idempotent — safe to re-run.
--
-- Column types match Prisma:
--   String @id @default(uuid())   → TEXT  (no DB-side default; client-side uuid)
--   DateTime / DateTime?          → TIMESTAMP(3)
--   Json                           → JSONB
--   Int                            → INTEGER
--   Boolean                        → BOOLEAN
--   Decimal @db.Decimal(2, 1)      → DECIMAL(2, 1)
--   Unsupported("tsvector")?       → TSVECTOR (STORED generated, see below)
--
-- Identifiers are double-quoted because the Prisma schema does not use @map
-- and the columns are camelCase in Postgres.

BEGIN;

-- ── Enums ────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "ServiceCaseStatus" AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ServiceCaseCategory" AS ENUM (
    'cylinders',
    'hoses',
    'pumps',
    'valves_manifolds',
    'bop_pressure_control',
    'ct_wireline',
    'wellhead',
    'field_service',
    'lab_forensics',
    'custom_builds'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ServiceCaseCardTagStyle" AS ENUM ('standard', 'oil');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Table ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "service_cases" (
  "id"                  TEXT                       NOT NULL PRIMARY KEY,
  "slug"                TEXT                       NOT NULL,
  "caseNumber"          TEXT                       NOT NULL,
  "status"              "ServiceCaseStatus"        NOT NULL DEFAULT 'draft',
  "publishedAt"         TIMESTAMP(3),
  "isFeatured"          BOOLEAN                    NOT NULL DEFAULT FALSE,

  -- Hero
  "category"            "ServiceCaseCategory"      NOT NULL,
  "topicLabel"          TEXT                       NOT NULL,
  "region"              TEXT,
  "caseDateLabel"       TEXT,
  "title"               TEXT                       NOT NULL,
  "titleAccent"         TEXT,
  "deck"                TEXT                       NOT NULL,
  "heroImageId"         TEXT,
  "heroImageCaption"    TEXT,
  "heroImageCredit"     TEXT,

  -- Meta strip — JSONB array of {label, value, valueSmall?, style?}
  "metaCells"           JSONB                      NOT NULL DEFAULT '[]'::jsonb,

  -- Body — JSONB array of typed BodyBlock objects
  "bodyBlocks"          JSONB                      NOT NULL DEFAULT '[]'::jsonb,

  -- Right rail
  "ctaCardTitle"        TEXT,
  "ctaCardBody"         TEXT,
  "ctaCardPhone"        TEXT,
  "pullQuoteText"       TEXT,
  "pullQuoteAuthor"     TEXT,
  "pullQuoteRole"       TEXT,
  "pullQuoteLocation"   TEXT,
  "specsAtGlance"       JSONB                      NOT NULL DEFAULT '[]'::jsonb,
  "galleryImageIds"     JSONB                      NOT NULL DEFAULT '[]'::jsonb,
  "galleryTotalCount"   INTEGER                    NOT NULL DEFAULT 0,
  "downloads"           JSONB                      NOT NULL DEFAULT '[]'::jsonb,

  -- Footer of article
  "caseFileMeta"        TEXT,

  -- Card grid display
  "cardOneLiner"        TEXT,
  "cardOutcomePills"    JSONB                      NOT NULL DEFAULT '[]'::jsonb,
  "cardDurationLabel"   TEXT,
  "cardTagStyle"        "ServiceCaseCardTagStyle"  NOT NULL DEFAULT 'standard',
  "cardTagLabel"        TEXT                       NOT NULL,

  -- Sort/filter
  "durationDays"        INTEGER,
  "savingsAmount"       INTEGER,
  "savingsCurrency"     "Currency",

  -- SEO OS
  "seoTitle"            TEXT,
  "seoDescription"      TEXT,
  "canonicalUrl"        TEXT,
  "robotsIndex"         BOOLEAN                    NOT NULL DEFAULT TRUE,
  "robotsFollow"        BOOLEAN                    NOT NULL DEFAULT TRUE,
  "ogImageMediaId"      TEXT,
  "focusKeyword"        TEXT,
  "sitemapPriority"     DECIMAL(2, 1),
  "sitemapChangeFreq"   "ChangeFreq",
  "excludeFromSitemap"  BOOLEAN                    NOT NULL DEFAULT FALSE,
  "jsonLdOverride"      JSONB,
  "seoUpdatedAt"        TIMESTAMP(3),

  "createdAt"           TIMESTAMP(3)               NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3)               NOT NULL,

  CONSTRAINT "service_cases_heroImageId_fkey"
    FOREIGN KEY ("heroImageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "service_cases_ogImageMediaId_fkey"
    FOREIGN KEY ("ogImageMediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "service_cases_slug_key" ON "service_cases" ("slug");
CREATE INDEX IF NOT EXISTS "service_cases_status_publishedAt_idx" ON "service_cases" ("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "service_cases_category_status_publishedAt_idx" ON "service_cases" ("category", "status", "publishedAt");
CREATE INDEX IF NOT EXISTS "service_cases_isFeatured_status_publishedAt_idx" ON "service_cases" ("isFeatured", "status", "publishedAt");

-- ── FTS column ───────────────────────────────────────────────────────────
-- STORED generated tsvector: title (A), deck (B), cardOneLiner (C).
-- Drop + recreate so weight tweaks ship without manual cleanup.

ALTER TABLE "service_cases" DROP COLUMN IF EXISTS "search_tsv";

ALTER TABLE "service_cases"
  ADD COLUMN "search_tsv" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("title", '')),         'A') ||
    setweight(to_tsvector('english', coalesce("deck", '')),          'B') ||
    setweight(to_tsvector('english', coalesce("cardOneLiner", '')),  'C')
  ) STORED;

DROP INDEX IF EXISTS "service_cases_search_tsv_idx";
CREATE INDEX "service_cases_search_tsv_idx" ON "service_cases" USING GIN ("search_tsv");

COMMIT;
