-- Single-use links for staff onboarding and password resets.
--
-- Invites and resets are the same mechanism — an emailed, expiring,
-- single-use link ending at a set-your-password screen — so they share one
-- table, discriminated by `purpose`.
--
-- The raw token is never stored: only sha256(token). Mirrors
-- password_reset_tokens on the customer side.
-- Applied to production 2026-08-15 as `staff_invitations`. Idempotent.

DO $$ BEGIN
  CREATE TYPE "InvitationPurpose" AS ENUM ('invite', 'reset');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS staff_invitations (
  id            text PRIMARY KEY,
  email         text NOT NULL,
  name          text NOT NULL,
  role          "StaffRole" NOT NULL,
  purpose       "InvitationPurpose" NOT NULL DEFAULT 'invite',
  "tokenHash"   text NOT NULL,
  "invitedById" text REFERENCES staff_users(id) ON DELETE SET NULL,
  "expiresAt"   timestamp(3) NOT NULL,
  "activatedAt" timestamp(3),
  "createdAt"   timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "staff_invitations_tokenHash_key" ON staff_invitations ("tokenHash");
CREATE INDEX IF NOT EXISTS staff_invitations_email_purpose_idx ON staff_invitations (email, purpose);
-- Quote the camelCase names or Postgres folds them to lower case and Prisma
-- reports permanent drift.
CREATE INDEX IF NOT EXISTS "staff_invitations_expiresAt_idx" ON staff_invitations ("expiresAt");

ALTER TABLE staff_invitations ENABLE ROW LEVEL SECURITY;
