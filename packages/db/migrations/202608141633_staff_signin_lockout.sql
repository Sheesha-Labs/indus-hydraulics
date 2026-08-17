-- Brute-force protection for staff_users, mirroring account_contacts.
--
-- Staff sign-in had no rate limiting of any kind: unlimited password guesses
-- against every staff account. That was tolerable while the admin sat on an
-- obscure *-admin.vercel.app host; it is not once /admin serves from the
-- public domain.
--
-- All three columns are nullable or defaulted, so this is additive and
-- zero-downtime — existing rows need no backfill. Idempotent.

ALTER TABLE staff_users
  ADD COLUMN IF NOT EXISTS "lastSignInAt"      timestamp(3),
  ADD COLUMN IF NOT EXISTS "failedSignInCount" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "lockedUntil"       timestamp(3);
