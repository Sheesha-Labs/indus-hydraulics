-- Counters — atomic monotonic sequences for user-facing codes.
-- Apply AFTER PR #51 (feat(db): atomic Counter-backed code generators).
--
-- This file is hand-rolled rather than relying on `prisma db push` because
-- `db push` currently wants to drop the FTS-managed `products.search_tsv`
-- column (managed by 001_seo_fts.sql, not by Prisma) — a destructive false
-- positive that would break /search.
--
-- Applied to production on 2026-05-05 via supabase MCP as
-- `counters_atomic_codes`. Re-running is safe and monotonic.
--
-- Idempotent: CREATE TABLE IF NOT EXISTS + ON CONFLICT DO UPDATE with
-- GREATEST guards re-runs from decrementing existing counters.

BEGIN;

-- 1. Counters table. Composite primary key forces a row-level write lock
--    during increment, eliminating the `count() + 1` race fixed in PR #51.
CREATE TABLE IF NOT EXISTS counters (
  scope       text         NOT NULL,
  year        integer      NOT NULL,
  value       integer      NOT NULL DEFAULT 0,
  "updatedAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (scope, year)
);

-- 2. Backfill RFQ counter from `rfqs.code` (format: `RFQ-YYYY-NNNN`).
--    Per-year scope. ON CONFLICT uses GREATEST so re-running cannot
--    decrement an existing counter, even if rows are deleted.
INSERT INTO counters (scope, year, value)
SELECT
  'rfq' AS scope,
  ((regexp_match(code, '^RFQ-([0-9]+)-([0-9]+)$'))[1])::int AS year,
  MAX(((regexp_match(code, '^RFQ-([0-9]+)-([0-9]+)$'))[2])::int) AS value
FROM rfqs
WHERE code ~ '^RFQ-[0-9]+-[0-9]+$'
GROUP BY 2
ON CONFLICT (scope, year)
DO UPDATE SET
  value = GREATEST(counters.value, EXCLUDED.value),
  "updatedAt" = CURRENT_TIMESTAMP;

-- 3. Backfill ACC counter from `accounts.code` (format: `ACC-YYYY-NNNN`).
--    Legacy fixture codes (TATA-001 etc.) don't match this pattern and are
--    intentionally excluded — going-forward admin-created accounts start
--    fresh at ACC-YYYY-0001.
INSERT INTO counters (scope, year, value)
SELECT
  'account' AS scope,
  ((regexp_match(code, '^ACC-([0-9]+)-([0-9]+)$'))[1])::int AS year,
  MAX(((regexp_match(code, '^ACC-([0-9]+)-([0-9]+)$'))[2])::int) AS value
FROM accounts
WHERE code ~ '^ACC-[0-9]+-[0-9]+$'
GROUP BY 2
ON CONFLICT (scope, year)
DO UPDATE SET
  value = GREATEST(counters.value, EXCLUDED.value),
  "updatedAt" = CURRENT_TIMESTAMP;

-- 4. Backfill quote counter from `quotes.code` (format: `INDUS/Q{N}`).
--    Global scope (year = 0). Only revision=1 quotes contribute — revisions
--    like `INDUS/Q26387-R2` reuse the parent's number. Counter `value` is
--    the offset from the Zoho continuation base (26386), so value=1 maps
--    to `INDUS/Q26387` (the next call increments to value=2 → INDUS/Q26388).
INSERT INTO counters (scope, year, value)
SELECT
  'quote' AS scope,
  0 AS year,
  MAX(((regexp_match(code, '^INDUS/Q([0-9]+)$'))[1])::int - 26386) AS value
FROM quotes
WHERE revision = 1 AND code ~ '^INDUS/Q[0-9]+$'
ON CONFLICT (scope, year)
DO UPDATE SET
  value = GREATEST(counters.value, EXCLUDED.value),
  "updatedAt" = CURRENT_TIMESTAMP;

COMMIT;
