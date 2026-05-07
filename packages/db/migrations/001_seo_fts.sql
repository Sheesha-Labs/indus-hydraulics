-- SEO Operating System — Postgres FTS migration
-- Apply AFTER `pnpm db:push` so that the products table already exists.
--
-- The DDL below adds a STORED generated tsvector column to products, weighted
-- A→C across the indexable fields, and adds the GIN indexes the storefront
-- /search query relies on (websearch_to_tsquery + pg_trgm typo-tolerance).
--
-- Column names are quoted to match Prisma's default camelCase (no @map).
--
-- Applied to production on 2026-05-04 via supabase MCP as
-- `seo_fts_search_indexes`. The original snake_case version of this file
-- was never applied (column-name mismatch) — the camelCase version below
-- is what's actually in production.
--
-- Idempotent: safe to re-run.

BEGIN;

-- 1. pg_trgm extension for SKU/MPN/title typo-tolerance (similarity ops, %>).
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add products.search_tsv as a STORED generated tsvector.
--    Drop and recreate so weights stay in sync with this file.
ALTER TABLE products DROP COLUMN IF EXISTS search_tsv;

ALTER TABLE products
  ADD COLUMN search_tsv tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple',  coalesce(sku, '') || ' ' || coalesce(mpn, '')), 'A') ||
    setweight(to_tsvector('english', coalesce("descriptionShort", '')), 'B') ||
    setweight(to_tsvector('english', coalesce("descriptionLong", '')),  'C')
  ) STORED;

-- 3. Indexes powering the /search route.
DROP INDEX IF EXISTS products_search_tsv_idx;
CREATE INDEX products_search_tsv_idx ON products USING GIN (search_tsv);

DROP INDEX IF EXISTS products_sku_trgm;
CREATE INDEX products_sku_trgm ON products USING GIN (sku gin_trgm_ops);

DROP INDEX IF EXISTS products_mpn_trgm;
CREATE INDEX products_mpn_trgm ON products USING GIN (mpn gin_trgm_ops)
  WHERE mpn IS NOT NULL;

DROP INDEX IF EXISTS products_title_trgm;
CREATE INDEX products_title_trgm ON products USING GIN (title gin_trgm_ops);

-- 4. Helper indexes for inspector + audit lookups that aren't expressible in
--    Prisma without breaking the schema-first workflow.
CREATE INDEX IF NOT EXISTS seo_audit_actor_idx
  ON seo_audit_logs ("actorId", "createdAt" DESC) WHERE "actorId" IS NOT NULL;

COMMIT;
