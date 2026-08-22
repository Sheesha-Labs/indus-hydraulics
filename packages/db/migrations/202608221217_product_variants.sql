-- Product size tables (`product_variants`) + searchable identifier aliases.
--
-- WHY
--
-- A catalogue family — "JIC 37° female swivel 90° elbow crimp fitting" — is one
-- listing with one page and twenty-odd orderable sizes underneath it. Until now
-- the schema had nowhere to put those sizes: `products` is one row per page and
-- `product_specs` is key/value prose. `product_variants` is the size table kept
-- as a table.
--
-- `dimensions` is jsonb rather than fixed columns because every catalogue prints
-- a different set of lettered dimensions (A/B/H on a rigid fitting, A/B/E on an
-- elbow, A/B/F on a flange head). Column order and human labels live in
-- `@indus/domain/variant-columns`.
--
-- The second half of this file rebuilds `products.search_tsv`. The generated
-- column can only read its own row, so a competitor part number sitting in
-- `product_cross_references` — or a variant part number sitting in the new table
-- — is invisible to /search. `products."searchAliases"` is the denormalised
-- landing spot for both, folded in at weight A alongside sku and mpn. It is
-- written by the importer that owns those identifiers, never by hand.
--
-- Rebuilding search_tsv is a DROP + ADD of the generated column, exactly as
-- 202605021638_seo_fts.sql created it. The weights below must stay identical to
-- that file apart from the new alias line — /search ranks on them.
--
-- Idempotent: safe to re-run.

BEGIN;

-- 1. Size tables.
CREATE TABLE IF NOT EXISTS product_variants (
  id                TEXT PRIMARY KEY,
  "productId"       TEXT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  "partNumber"      TEXT NOT NULL,
  position          INTEGER NOT NULL DEFAULT 0,
  "hoseDash"        INTEGER,
  "hoseInch"        TEXT,
  "hoseDn"          INTEGER,
  "portLabel"       TEXT,
  "portDash"        INTEGER,
  dimensions        JSONB,
  "competitorBrand" TEXT,
  "competitorMpn"   TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS product_variants_part_number_key
  ON product_variants ("partNumber");
CREATE INDEX IF NOT EXISTS product_variants_product_id_idx
  ON product_variants ("productId");
CREATE INDEX IF NOT EXISTS product_variants_hose_dash_idx
  ON product_variants ("hoseDash");

-- Same posture as every other application table here: RLS on, no policy, so
-- only the service role reaches it. See 202605110531_enable_rls_unprotected_tables.sql.
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- 2. Searchable aliases.
ALTER TABLE products ADD COLUMN IF NOT EXISTS "searchAliases" TEXT;

-- 3. Rebuild the FTS column so aliases are matchable.
ALTER TABLE products DROP COLUMN IF EXISTS search_tsv;

ALTER TABLE products
  ADD COLUMN search_tsv tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple',  coalesce(sku, '') || ' ' || coalesce(mpn, '')), 'A') ||
    setweight(to_tsvector('simple',  coalesce("searchAliases", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("descriptionShort", '')), 'B') ||
    setweight(to_tsvector('english', coalesce("descriptionLong", '')),  'C')
  ) STORED;

DROP INDEX IF EXISTS products_search_tsv_idx;
CREATE INDEX products_search_tsv_idx ON products USING GIN (search_tsv);

-- Trigram index over the alias blob, so a mistyped competitor part number
-- still reaches the same product the exact match would have.
DROP INDEX IF EXISTS products_search_aliases_trgm;
CREATE INDEX products_search_aliases_trgm
  ON products USING GIN ("searchAliases" gin_trgm_ops);

COMMIT;
