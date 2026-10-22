-- Index the hose bore columns of product_variants.
--
-- The shelf "bore range" band (apps/web/src/lib/category-bands.ts) orders its dominant-inch-label
-- subqueries by a correlated count over every active variant with the same hoseDn + hoseInch. With
-- no index that count is a scan of the whole table per group. At ~45k variants it was tolerable; at
-- ~100k (maker catalogue waves of 2026-10-21/22) each run took 10-25 s, and after the 2026-10-22
-- 00:57 UTC deploy left every shelf cold, concurrent runs exhausted the Supavisor pool (EMAXCONN)
-- and /api/health returned 503s.
--
-- Additive and non-locking. CONCURRENTLY cannot run inside a transaction block, so apply this file
-- with `prisma db execute` or a plain session, not inside BEGIN/COMMIT.
CREATE INDEX CONCURRENTLY IF NOT EXISTS "product_variants_hoseDn_hoseInch_idx"
  ON "product_variants" ("hoseDn", "hoseInch");
