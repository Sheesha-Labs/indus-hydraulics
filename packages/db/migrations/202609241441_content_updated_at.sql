-- Content modification timestamps for the sitemap's <lastmod>.
--
-- WHY A NEW COLUMN, AND WHY TRIGGERS
--
-- Google uses <lastmod> only when it is "consistently and verifiably accurate",
-- and stops trusting a host whose dates are not. Measured on production
-- 2026-09-24:
--
--   - products: 1,485 of 1,487 active rows carried the same `updatedAt`, all
--     written inside five minutes on 2026-08-25. Prisma's `@updatedAt` moves on
--     ANY write — `recomputeContentScore` writing a score, a stock sync, a
--     bulk script — so the sitemap claimed the whole catalogue changed at once.
--   - categories, brands, industries: no modification timestamp at all, so 452
--     sitemap URLs carried no <lastmod>. `seoUpdatedAt` only moves when the SEO
--     panel is saved.
--
-- `contentUpdatedAt` moves only when something a visitor would see changes.
-- It is maintained in the database rather than in application code because
-- the writers are many and varied — admin actions, a dozen import scripts,
-- raw SQL data fixes — and a rule each of them has to remember is a rule one
-- of them forgets.
--
-- WHAT COUNTS AS CONTENT
--
-- Own columns: every column EXCEPT an explicit list of bookkeeping ones. A
-- denylist, deliberately — a column added later counts as content until
-- someone decides otherwise, so the failure mode is a date that moves too
-- often, never a real edit that goes unannounced.
--
-- Child rows: specs, images, size tables, FAQs, documents and cross-references
-- render on the product page, so a change to any of them dates the product.
-- Case studies render on brand and industry pages and date those.
--
-- Shelf membership: a category or brand page lists its active products, so a
-- product joining, leaving, or being renamed dates the shelf it is on.
--
-- BACKFILL
--
-- products: copied from `updatedAt`. That is the date the sitemap already
-- publishes, so the backfill makes no claim that is not already live.
-- categories, brands, industries: left NULL. There is no honest date to copy,
-- and inventing one ("changed today, when the migration ran") is exactly the
-- lie this column exists to stop. They gain a date on their first real edit.
--
-- The DEFAULT is set AFTER the backfill, so a new row is dated at insert
-- while an existing row is not dated by the ALTER.
--
-- Additive and idempotent.

BEGIN;

-- ── Columns ─────────────────────────────────────────────────────────────────

ALTER TABLE "products"   ADD COLUMN IF NOT EXISTS "contentUpdatedAt" TIMESTAMP(3);
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "contentUpdatedAt" TIMESTAMP(3);
ALTER TABLE "brands"     ADD COLUMN IF NOT EXISTS "contentUpdatedAt" TIMESTAMP(3);
ALTER TABLE "industries" ADD COLUMN IF NOT EXISTS "contentUpdatedAt" TIMESTAMP(3);

UPDATE "products" SET "contentUpdatedAt" = "updatedAt" WHERE "contentUpdatedAt" IS NULL;

ALTER TABLE "products"   ALTER COLUMN "contentUpdatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "categories" ALTER COLUMN "contentUpdatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "brands"     ALTER COLUMN "contentUpdatedAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "industries" ALTER COLUMN "contentUpdatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- ── Own-column changes ──────────────────────────────────────────────────────
-- TG_ARGV is the list of columns that do NOT count. `contentUpdatedAt` is
-- always ignored so that an explicit write to it (from the child triggers
-- below) survives.
--
-- `search_tsv` must be ignored on products: it is GENERATED ALWAYS, and in a
-- BEFORE trigger NEW carries it un-computed, so it would differ from OLD on
-- every single update.

CREATE OR REPLACE FUNCTION touch_content_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  ignored text[] := array_append(TG_ARGV::text[], 'contentUpdatedAt');
BEGIN
  IF (to_jsonb(NEW) - ignored) IS DISTINCT FROM (to_jsonb(OLD) - ignored) THEN
    NEW."contentUpdatedAt" := CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "products_content_updated_at" ON "products";
CREATE TRIGGER "products_content_updated_at"
  BEFORE UPDATE ON "products"
  FOR EACH ROW EXECUTE FUNCTION touch_content_updated_at(
    'updatedAt', 'contentScore', 'searchAliases', 'searchTsv', 'search_tsv',
    'stockQty', 'stockWarehouse',
    'seoUpdatedAt', 'seoUpdatedById',
    'sitemapPriority', 'sitemapChangeFreq', 'excludeFromSitemap', 'robotsIndex', 'robotsFollow'
  );

DROP TRIGGER IF EXISTS "categories_content_updated_at" ON "categories";
CREATE TRIGGER "categories_content_updated_at"
  BEFORE UPDATE ON "categories"
  FOR EACH ROW EXECUTE FUNCTION touch_content_updated_at(
    'position', 'seoUpdatedAt', 'seoUpdatedById',
    'sitemapPriority', 'sitemapChangeFreq', 'excludeFromSitemap', 'robotsIndex', 'robotsFollow'
  );

DROP TRIGGER IF EXISTS "brands_content_updated_at" ON "brands";
CREATE TRIGGER "brands_content_updated_at"
  BEFORE UPDATE ON "brands"
  FOR EACH ROW EXECUTE FUNCTION touch_content_updated_at(
    'position', 'seoUpdatedAt', 'seoUpdatedById',
    'sitemapPriority', 'sitemapChangeFreq', 'excludeFromSitemap', 'robotsIndex', 'robotsFollow'
  );

DROP TRIGGER IF EXISTS "industries_content_updated_at" ON "industries";
CREATE TRIGGER "industries_content_updated_at"
  BEFORE UPDATE ON "industries"
  FOR EACH ROW EXECUTE FUNCTION touch_content_updated_at(
    'position', 'seoUpdatedAt', 'seoUpdatedById',
    'sitemapPriority', 'sitemapChangeFreq', 'excludeFromSitemap', 'robotsIndex', 'robotsFollow'
  );

-- ── Child-row changes ───────────────────────────────────────────────────────
-- TG_ARGV[0] is the parent table, TG_ARGV[1] the foreign-key column. An UPDATE
-- that changes nothing but `updatedAt` — an importer re-upserting an identical
-- row — does not count.

CREATE OR REPLACE FUNCTION touch_parent_content_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  parent_table text := TG_ARGV[0];
  fk text := TG_ARGV[1];
  ids text[] := '{}';
BEGIN
  IF TG_OP = 'UPDATE'
     AND (to_jsonb(NEW) - 'updatedAt') IS NOT DISTINCT FROM (to_jsonb(OLD) - 'updatedAt') THEN
    RETURN NULL;
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN ids := array_append(ids, to_jsonb(NEW) ->> fk); END IF;
  IF TG_OP IN ('UPDATE', 'DELETE') THEN ids := array_append(ids, to_jsonb(OLD) ->> fk); END IF;
  EXECUTE format('UPDATE %I SET "contentUpdatedAt" = CURRENT_TIMESTAMP WHERE id = ANY($1)', parent_table)
    USING ids;
  RETURN NULL;
END;
$$;

DO $$
DECLARE
  child record;
BEGIN
  FOR child IN
    SELECT * FROM (VALUES
      ('product_specs',            'products',   'productId'),
      ('product_images',           'products',   'productId'),
      ('product_variants',         'products',   'productId'),
      ('product_faqs',             'products',   'productId'),
      ('product_documents',        'products',   'productId'),
      ('product_cross_references', 'products',   'productId'),
      ('brand_case_studies',       'brands',     'brandId'),
      ('industry_case_studies',    'industries', 'industryId')
    ) AS t(child_table, parent_table, fk)
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', child.child_table || '_touch_parent', child.child_table);
    EXECUTE format(
      'CREATE TRIGGER %I AFTER INSERT OR UPDATE OR DELETE ON %I '
      'FOR EACH ROW EXECUTE FUNCTION touch_parent_content_updated_at(%L, %L)',
      child.child_table || '_touch_parent', child.child_table, child.parent_table, child.fk
    );
  END LOOP;
END;
$$;

-- ── Shelf membership ────────────────────────────────────────────────────────
-- A product that is, or was, active and joins, leaves, or is renamed on a
-- shelf dates that category and brand. A draft moving between categories
-- changes no public page and dates nothing.

CREATE OR REPLACE FUNCTION touch_product_shelves() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  was_live boolean := TG_OP <> 'INSERT' AND OLD."status" = 'active';
  is_live  boolean := TG_OP <> 'DELETE' AND NEW."status" = 'active';
  -- What a shelf card shows, plus whether the product is on the shelf at all.
  card_changed boolean := TG_OP <> 'UPDATE'
    OR NEW."status" <> OLD."status" OR NEW."title" <> OLD."title" OR NEW."slug" <> OLD."slug";
  category_changed boolean := card_changed OR NEW."categoryId" IS DISTINCT FROM OLD."categoryId";
  brand_changed    boolean := card_changed OR NEW."brandId"    IS DISTINCT FROM OLD."brandId";
BEGIN
  IF NOT (was_live OR is_live) THEN RETURN NULL; END IF;

  IF category_changed THEN
    UPDATE "categories" SET "contentUpdatedAt" = CURRENT_TIMESTAMP
     WHERE id IN (CASE WHEN was_live THEN OLD."categoryId" END, CASE WHEN is_live THEN NEW."categoryId" END);
  END IF;
  IF brand_changed THEN
    UPDATE "brands" SET "contentUpdatedAt" = CURRENT_TIMESTAMP
     WHERE id IN (CASE WHEN was_live THEN OLD."brandId" END, CASE WHEN is_live THEN NEW."brandId" END);
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS "products_touch_shelves" ON "products";
CREATE TRIGGER "products_touch_shelves"
  AFTER INSERT OR UPDATE OR DELETE ON "products"
  FOR EACH ROW EXECUTE FUNCTION touch_product_shelves();

COMMIT;
