-- Indus Operations · migration 6 of 8 · read-only catalogue views
--
-- The three views of 06-map-schema.md §6 (S5). They are the whole contract between Ops and the
-- website catalogue: ops_app has no grant on any public table and reads the catalogue only
-- through these. A rename on the website side breaks one view, not the app.
--
-- Columns checked against packages/db/prisma/schema.prisma (models Product, ProductVariant,
-- ProductCrossReference, Brand, Category; no @map, so SQL names are the quoted camelCase ones):
--   products                  id, sku, mpn, slug, title, "brandId", "categoryId", status,
--                             "hsCode", "weightKg"                      all present
--   product_variants          "partNumber", "productId"                 present
--   product_cross_references  id, "productId", "competitorBrand", "competitorMpn",
--                             compatibility, "variantPartNumber"        present
--   brands.name, categories.name                                        present
-- Columns dropped from the §6 outline: none.
--
-- SUPABASE LINT EXCEPTION (security_definer_view). These views are deliberately NOT
-- security_invoker: ops_app reads through the owner's (postgres) rights, which is the point.
-- Supabase's linter flags that as security_definer_view. The exception is accepted because the
-- ops schema is not exposed to PostgREST and anon / authenticated have no USAGE on it
-- (migration 1). Recorded in packages/ops-db/migrations/README.md.
--
-- Only active products are visible. Ops stores catalogue links as plain text with no foreign
-- key across schemas, so an unpublished product simply stops resolving.
--
-- Idempotent: CREATE OR REPLACE VIEW (columns are only ever appended, never reordered).

BEGIN;

CREATE OR REPLACE VIEW ops.catalogue_product_v AS
  SELECT p."id",
         p."sku",
         p."mpn",
         upper(regexp_replace(coalesce(p."mpn", ''), '[^A-Za-z0-9]', '', 'g')) AS "mpnNorm",
         p."slug",
         p."title",
         b."name" AS "brandName",
         c."name" AS "categoryName",
         'https://indushydraulics.com/p/' || p."slug" AS "url",
         p."hsCode",
         p."weightKg"
    FROM public.products p
    LEFT JOIN public.brands b ON b."id" = p."brandId"
    LEFT JOIN public.categories c ON c."id" = p."categoryId"
   WHERE p."status" = 'active';

CREATE OR REPLACE VIEW ops.catalogue_variant_v AS
  SELECT v."partNumber",
         upper(regexp_replace(v."partNumber", '[^A-Za-z0-9]', '', 'g')) AS "partNumberNorm",
         v."productId"
    FROM public.product_variants v
    JOIN public.products p ON p."id" = v."productId"
   WHERE p."status" = 'active';

CREATE OR REPLACE VIEW ops.catalogue_cross_ref_v AS
  SELECT x."id",
         x."productId",
         x."competitorBrand",
         x."competitorMpn",
         upper(regexp_replace(x."competitorMpn", '[^A-Za-z0-9]', '', 'g')) AS "competitorMpnNorm",
         x."compatibility"::text AS "compatibility",
         x."variantPartNumber"
    FROM public.product_cross_references x
    JOIN public.products p ON p."id" = x."productId"
   WHERE p."status" = 'active';

ALTER VIEW ops.catalogue_product_v OWNER TO postgres;
ALTER VIEW ops.catalogue_variant_v OWNER TO postgres;
ALTER VIEW ops.catalogue_cross_ref_v OWNER TO postgres;

COMMENT ON VIEW ops.catalogue_product_v IS
  'Active website products for Ops. Owner-rights view (Supabase lint security_definer_view accepted: ops is not exposed to PostgREST).';
COMMENT ON VIEW ops.catalogue_variant_v IS
  'Variant part numbers of active website products for Ops. Owner-rights view (see catalogue_product_v).';
COMMENT ON VIEW ops.catalogue_cross_ref_v IS
  'Competitor cross-references of active website products for Ops. Owner-rights view (see catalogue_product_v).';

REVOKE ALL ON ops.catalogue_product_v, ops.catalogue_variant_v, ops.catalogue_cross_ref_v FROM PUBLIC;
GRANT SELECT ON ops.catalogue_product_v, ops.catalogue_variant_v, ops.catalogue_cross_ref_v TO ops_app;

COMMIT;
