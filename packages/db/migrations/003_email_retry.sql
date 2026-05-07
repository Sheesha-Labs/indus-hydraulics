-- Email retry queue — adds retry tracking columns to `sent_emails`.
-- Apply AFTER the matching `feat(quote): retry queue for failed
-- transactional emails` PR is merged and Prisma client is regenerated.
--
-- Hand-rolled because `prisma db push` would attempt to drop the
-- FTS-managed `products.search_tsv` column (managed by 001_seo_fts.sql,
-- not Prisma) — destructive false positive that would break /search.
--
-- Idempotent: every statement uses IF [NOT] EXISTS / quoted column names
-- so re-running is safe.

BEGIN;

-- 1. Retry tracking columns. Existing rows default to retryCount=0,
--    lastAttemptAt=NULL, payload=NULL — none will be retried until they
--    receive a payload via the new sendEmail() write path.
ALTER TABLE sent_emails
  ADD COLUMN IF NOT EXISTS "retryCount"    integer      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "lastAttemptAt" timestamp(3),
  ADD COLUMN IF NOT EXISTS payload         jsonb;

-- 2. Composite index supporting the retry cron query
--    (status='failed' AND retryCount<3 AND lastAttemptAt < threshold).
CREATE INDEX IF NOT EXISTS sent_emails_status_retry_idx
  ON sent_emails (status, "retryCount", "lastAttemptAt");

COMMIT;
