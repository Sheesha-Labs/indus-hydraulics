-- Competitor scraper — discover competitor catalogues + ingest their product
-- images into our own Product/Media/ProductImage tables.
--
-- Hand-rolled because `prisma db push` proposes dropping the FTS-managed
-- `search_tsv` generated columns on `products` and `service_cases` (it
-- doesn't recognise the GENERATED column). The schema additions themselves
-- (two new tables + three enums + a FK on scraped_products → scraper_jobs)
-- are safe and isolated from the existing product catalogue.
--
-- Applied via Supabase MCP `apply_migration`. Mirrors the Prisma models
-- ScraperJob + ScrapedProduct and the enums ScraperJobStatus,
-- ScrapedProductSelectionStatus, ScrapedProductIngestMode added in the
-- same PR.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ScraperJobStatus') THEN
    CREATE TYPE "ScraperJobStatus" AS ENUM ('queued', 'running', 'completed', 'failed', 'cancelled');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ScrapedProductSelectionStatus') THEN
    CREATE TYPE "ScrapedProductSelectionStatus" AS ENUM ('pending', 'selected', 'skipped', 'ingested', 'ingest_failed');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ScrapedProductIngestMode') THEN
    CREATE TYPE "ScrapedProductIngestMode" AS ENUM ('create_new', 'attach_to_existing');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS "scraper_jobs" (
  "id"               TEXT               NOT NULL PRIMARY KEY,
  "code"             TEXT               NOT NULL,
  "sourceUrl"        TEXT               NOT NULL,
  "hostname"         TEXT               NOT NULL,
  "status"           "ScraperJobStatus" NOT NULL DEFAULT 'queued',
  "startedAt"        TIMESTAMP(3),
  "finishedAt"       TIMESTAMP(3),
  "totalFound"       INTEGER            NOT NULL DEFAULT 0,
  "errorMessage"     TEXT,
  "notes"            TEXT,
  "createdByStaffId" TEXT,
  "options"          JSONB              NOT NULL DEFAULT '{}'::jsonb,
  "createdAt"        TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3)       NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "scraper_jobs_code_key"
  ON "scraper_jobs" ("code");

CREATE INDEX IF NOT EXISTS "scraper_jobs_status_createdAt_idx"
  ON "scraper_jobs" ("status", "createdAt");

CREATE TABLE IF NOT EXISTS "scraped_products" (
  "id"                  TEXT                            NOT NULL PRIMARY KEY,
  "jobId"               TEXT                            NOT NULL,
  "sourceUrl"           TEXT                            NOT NULL,
  "sourceTitle"         TEXT                            NOT NULL,
  "sourceDescription"   TEXT,
  "sourceCategoryText"  TEXT,
  "sourceBrandText"     TEXT,
  "sourceSku"           TEXT,
  "candidateImages"     JSONB                           NOT NULL,
  "selectionStatus"     "ScrapedProductSelectionStatus" NOT NULL DEFAULT 'pending',
  "ingestMode"          "ScrapedProductIngestMode"      NOT NULL DEFAULT 'create_new',
  "targetProductId"     TEXT,
  "mappedCategoryId"    TEXT,
  "mappedBrandId"       TEXT,
  "editedTitle"         TEXT,
  "editedSku"           TEXT,
  "deselectedImageUrls" JSONB                           NOT NULL DEFAULT '[]'::jsonb,
  "ingestedProductId"   TEXT,
  "ingestedAt"          TIMESTAMP(3),
  "ingestError"         TEXT,
  "createdAt"           TIMESTAMP(3)                    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3)                    NOT NULL,
  CONSTRAINT "scraped_products_jobId_fkey"
    FOREIGN KEY ("jobId") REFERENCES "scraper_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "scraped_products_jobId_sourceUrl_key"
  ON "scraped_products" ("jobId", "sourceUrl");

CREATE INDEX IF NOT EXISTS "scraped_products_jobId_selectionStatus_idx"
  ON "scraped_products" ("jobId", "selectionStatus");

-- RLS: enable with no policies. Prisma + service-role bypass RLS, so this
-- only matters for the anon role (which should not touch these tables).
ALTER TABLE "scraper_jobs"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "scraped_products"   ENABLE ROW LEVEL SECURITY;

COMMIT;
