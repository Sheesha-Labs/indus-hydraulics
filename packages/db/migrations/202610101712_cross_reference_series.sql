-- Per-size cross-references and the competitor series they belong to.
--
-- `product_cross_references` held one row per product (a competitor family
-- named against an Indus listing). The Hydraulics Direct export and the size
-- tables carry the competitor number for EACH size, so a row can now name the
-- Indus part number it equals and the competitor series it sits in.
--
--   "variantPartNumber" — the Indus orderable part number (product_variants
--                         ."partNumber") this competitor number equals. Text,
--                         not a foreign key: catalogue importers rebuild
--                         variant rows by part number, and a SET NULL foreign
--                         key would silently detach every reference on re-run.
--   "series"            — the competitor's series label with the size stripped
--                         ("HTX-SS", "259-2027", "J#U"), set by the loader from
--                         @indus/domain crossReferenceSeries().
--
-- Additive and nullable: the current code never selects these columns.

ALTER TABLE "product_cross_references" ADD COLUMN IF NOT EXISTS "variantPartNumber" TEXT;
ALTER TABLE "product_cross_references" ADD COLUMN IF NOT EXISTS "series" TEXT;

CREATE INDEX IF NOT EXISTS "product_cross_references_variantPartNumber_idx"
  ON "product_cross_references" ("variantPartNumber");
CREATE INDEX IF NOT EXISTS "product_cross_references_competitorBrand_series_idx"
  ON "product_cross_references" ("competitorBrand", "series");
