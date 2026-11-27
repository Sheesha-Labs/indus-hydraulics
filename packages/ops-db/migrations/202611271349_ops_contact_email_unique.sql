-- Indus Operations · S10-T01 · one live contact per address per company (06-map-schema §8.4)
--
-- A company has at most one non-archived contact for an email address (case-insensitive). upsertContact relies on it;
-- merge dedupes contacts by address before moving them. The directory is empty in production when this ships, so the
-- index builds without a duplicate check. Idempotent.

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS contact_company_email_live_key
  ON ops.contact ("companyId", lower("email"))
  WHERE "email" IS NOT NULL AND "archivedAt" IS NULL;

COMMIT;
