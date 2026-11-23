-- Indus Operations · S04-T02 (with T04, T05) · mailbox connect, sync and message columns
--
--   ops.oauth_state          single-use OAuth state for the mailbox connect flow (ADR-06): the SHA-256 of a
--                            32-byte nonce, the session user, the role and address chosen, the PKCE verifier
--                            sealed with OPS_TOKEN_KEYS, 10-minute expiry, usedAt set by the one claim.
--   mailbox                  tokenKeyId (the key id the tokens were sealed with, for the rekey job; text,
--                            because key ids are strings such as "k1": decision S04-T02), accessTokenEnc,
--                            accessExpiresAt, grantedEmail, lastTokenError.
--   mailbox_sync_state       lastSuccessfulSyncAt, watchRenewedAt, watchError, resyncFrom, backfillState,
--                            dlqCount (NULL while Ops holds no GCP key; docs/gmail-setup.md §f).
--   mail_message             origin (live | backfill | import: backfilled and imported mail never causes an
--                            external effect), internalDate, inReplyToRfcId, referencesRfcIds, gmailLabelIds,
--                            authSummary, headerFlags, bodyTextHash, bodyHtmlFileId, rawEmlFileId, and an
--                            index on (mailboxId, internalDate).
--
-- RLS + ops_app_all on the new table; ops_maint may purge it. Idempotent throughout.

BEGIN;

-- ── OAuth state ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ops"."oauth_state" (
    "nonceHash" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "role" "ops"."MailboxRole" NOT NULL,
    "address" TEXT NOT NULL,
    "codeVerifierEnc" TEXT NOT NULL,
    "returnTo" TEXT NOT NULL DEFAULT 'settings',
    "backfillMonths" INTEGER,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "usedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "oauth_state_pkey" PRIMARY KEY ("nonceHash"),
    CONSTRAINT "oauth_state_returnTo_check" CHECK ("returnTo" IN ('settings', 'setup'))
);

CREATE INDEX IF NOT EXISTS "oauth_state_expiresAt_idx" ON "ops"."oauth_state"("expiresAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'oauth_state_userId_fkey' AND conrelid = 'ops.oauth_state'::regclass
  ) THEN
    ALTER TABLE "ops"."oauth_state"
      ADD CONSTRAINT "oauth_state_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "ops"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ── mailbox ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "ops"."mailbox" ADD COLUMN IF NOT EXISTS "tokenKeyId" TEXT;
ALTER TABLE "ops"."mailbox" ADD COLUMN IF NOT EXISTS "accessTokenEnc" BYTEA;
ALTER TABLE "ops"."mailbox" ADD COLUMN IF NOT EXISTS "accessExpiresAt" TIMESTAMPTZ(3);
ALTER TABLE "ops"."mailbox" ADD COLUMN IF NOT EXISTS "grantedEmail" TEXT;
ALTER TABLE "ops"."mailbox" ADD COLUMN IF NOT EXISTS "lastTokenError" TEXT;

-- ── mailbox_sync_state ──────────────────────────────────────────────────────────────────
ALTER TABLE "ops"."mailbox_sync_state" ADD COLUMN IF NOT EXISTS "lastSuccessfulSyncAt" TIMESTAMPTZ(3);
ALTER TABLE "ops"."mailbox_sync_state" ADD COLUMN IF NOT EXISTS "watchRenewedAt" TIMESTAMPTZ(3);
ALTER TABLE "ops"."mailbox_sync_state" ADD COLUMN IF NOT EXISTS "watchError" TEXT;
ALTER TABLE "ops"."mailbox_sync_state" ADD COLUMN IF NOT EXISTS "resyncFrom" TIMESTAMPTZ(3);
ALTER TABLE "ops"."mailbox_sync_state" ADD COLUMN IF NOT EXISTS "backfillState" JSONB;
ALTER TABLE "ops"."mailbox_sync_state" ADD COLUMN IF NOT EXISTS "dlqCount" INTEGER;

-- ── mail_message ────────────────────────────────────────────────────────────────────────
ALTER TABLE "ops"."mail_message" ADD COLUMN IF NOT EXISTS "origin" TEXT NOT NULL DEFAULT 'live';
ALTER TABLE "ops"."mail_message" ADD COLUMN IF NOT EXISTS "internalDate" TIMESTAMPTZ(3);
ALTER TABLE "ops"."mail_message" ADD COLUMN IF NOT EXISTS "inReplyToRfcId" TEXT;
ALTER TABLE "ops"."mail_message" ADD COLUMN IF NOT EXISTS "referencesRfcIds" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "ops"."mail_message" ADD COLUMN IF NOT EXISTS "gmailLabelIds" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "ops"."mail_message" ADD COLUMN IF NOT EXISTS "authSummary" JSONB;
ALTER TABLE "ops"."mail_message" ADD COLUMN IF NOT EXISTS "headerFlags" JSONB;
ALTER TABLE "ops"."mail_message" ADD COLUMN IF NOT EXISTS "bodyTextHash" TEXT;
ALTER TABLE "ops"."mail_message" ADD COLUMN IF NOT EXISTS "bodyHtmlFileId" UUID;
ALTER TABLE "ops"."mail_message" ADD COLUMN IF NOT EXISTS "rawEmlFileId" UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'mail_message_origin_check' AND conrelid = 'ops.mail_message'::regclass
  ) THEN
    ALTER TABLE "ops"."mail_message"
      ADD CONSTRAINT "mail_message_origin_check" CHECK ("origin" IN ('live', 'backfill', 'import'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'mail_message_bodyHtmlFileId_fkey' AND conrelid = 'ops.mail_message'::regclass
  ) THEN
    ALTER TABLE "ops"."mail_message"
      ADD CONSTRAINT "mail_message_bodyHtmlFileId_fkey"
      FOREIGN KEY ("bodyHtmlFileId") REFERENCES "ops"."stored_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'mail_message_rawEmlFileId_fkey' AND conrelid = 'ops.mail_message'::regclass
  ) THEN
    ALTER TABLE "ops"."mail_message"
      ADD CONSTRAINT "mail_message_rawEmlFileId_fkey"
      FOREIGN KEY ("rawEmlFileId") REFERENCES "ops"."stored_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "mail_message_mailboxId_internalDate_idx"
  ON "ops"."mail_message"("mailboxId", "internalDate");

-- ── RLS, policies and grants on the new table ──────────────────────────────────────────
ALTER TABLE "ops"."oauth_state" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'ops' AND tablename = 'oauth_state' AND policyname = 'ops_app_all'
  ) THEN
    CREATE POLICY ops_app_all ON "ops"."oauth_state"
      AS PERMISSIVE FOR ALL TO ops_app USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'ops' AND tablename = 'oauth_state' AND policyname = 'ops_maint_all'
  ) THEN
    CREATE POLICY ops_maint_all ON "ops"."oauth_state"
      AS PERMISSIVE FOR ALL TO ops_maint USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON "ops"."oauth_state" TO ops_app;
GRANT SELECT, DELETE ON "ops"."oauth_state" TO ops_maint;
REVOKE ALL ON "ops"."oauth_state" FROM PUBLIC;
DO $$
DECLARE
  r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON ops.oauth_state FROM %I', r);
    END IF;
  END LOOP;
END $$;

-- ── Assertions ──────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'ops.oauth_state'::regclass) THEN
    RAISE EXCEPTION 'ops.oauth_state must have row-level security on';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'ops' AND table_name = 'mail_message' AND column_name = 'origin'
  ) THEN
    RAISE EXCEPTION 'mail_message.origin is missing';
  END IF;
END $$;

COMMIT;
