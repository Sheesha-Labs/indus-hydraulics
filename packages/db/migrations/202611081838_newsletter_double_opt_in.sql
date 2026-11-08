-- Newsletter phase 1: double opt-in, permanent unsubscribe, suppressions.
-- docs/newsletter-plan.md §4 Phase 1.
--
-- Safe ahead of the code that reads it. Everything here is additive:
--
-- 1. Two new enum values, `pending` and `confirmed`. No row uses either until
--    the regenerated Prisma client is deployed — the deployed client rejects a
--    value it does not know on read (see the 2026-10-21 DocumentKind outage).
--    `active` stays for now; 202611081839_newsletter_retire_active_status.sql
--    moves the one legacy row to `confirmed` and drops `active`, and runs
--    AFTER the deploy.
--
-- 2. Columns on `newsletter_subscribers`:
--    - `confirmationTokenHash` — SHA-256 of the one-time confirmation token.
--      The token itself is only ever in the email; a database read cannot
--      confirm anyone.
--    - `unsubscribeToken` — permanent, 48 hex characters, stored in clear
--      because every email to the subscriber has to carry it. Backfilled for
--      the existing row by the column default.
--    - `confirmationSentAt`, `confirmedAt`, `bouncedAt`.
--    - `consentText` + `consentVersion` — the exact wording the subscriber
--      agreed to (Bazar recorded none; plan §2 bug 7).
--
-- 3. `newsletter_suppressions` — SHA-256 of lower(trim(email)) for every
--    address that unsubscribed, hard-bounced or complained. No address is
--    stored. A trigger keeps it in step with `newsletter_subscribers`; the
--    Resend webhook also writes to it directly for transactional mail.
--
-- 4. Delivery timestamps on `sent_emails` (delivered / bounced / complained),
--    written by the Resend webhook, plus an index on `providerId`, which is
--    how the webhook finds the row.
--
-- RLS on with no policy for the new table, as for every hand-written table
-- (202605110531): Prisma connects as the owner and bypasses it; no anon key
-- ever reads these.

-- ── 1. Enum values ──────────────────────────────────────────────────────
-- Outside the transaction block: ADD VALUE may run in one on PG ≥ 12, but the
-- value cannot be used in the same transaction, and nothing below uses it as
-- a literal of the enum type anyway.

ALTER TYPE "NewsletterSubscriberStatus" ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE "NewsletterSubscriberStatus" ADD VALUE IF NOT EXISTS 'confirmed';

BEGIN;

-- ── 2. Subscriber columns ───────────────────────────────────────────────

ALTER TABLE "newsletter_subscribers"
  ADD COLUMN IF NOT EXISTS "confirmationTokenHash" TEXT,
  ADD COLUMN IF NOT EXISTS "unsubscribeToken"      TEXT NOT NULL
    DEFAULT encode(extensions.gen_random_bytes(24), 'hex'),
  ADD COLUMN IF NOT EXISTS "confirmationSentAt"    TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "confirmedAt"           TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "bouncedAt"             TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "consentText"           TEXT,
  ADD COLUMN IF NOT EXISTS "consentVersion"        TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'newsletter_subscribers_unsubscribe_token_format'
  ) THEN
    ALTER TABLE "newsletter_subscribers"
      ADD CONSTRAINT "newsletter_subscribers_unsubscribe_token_format"
      CHECK ("unsubscribeToken" ~ '^[0-9a-f]{48}$');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'newsletter_subscribers_confirmation_hash_format'
  ) THEN
    ALTER TABLE "newsletter_subscribers"
      ADD CONSTRAINT "newsletter_subscribers_confirmation_hash_format"
      CHECK ("confirmationTokenHash" IS NULL OR "confirmationTokenHash" ~ '^[0-9a-f]{64}$');
  END IF;
END$$;

CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_subscribers_unsubscribeToken_key"
  ON "newsletter_subscribers" ("unsubscribeToken");

CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_subscribers_confirmationTokenHash_key"
  ON "newsletter_subscribers" ("confirmationTokenHash");

-- The signup action's per-IP limit counts recent confirmation sends per hash.
CREATE INDEX IF NOT EXISTS "newsletter_subscribers_ipHash_confirmationSentAt_idx"
  ON "newsletter_subscribers" ("ipHash", "confirmationSentAt");

-- ── 3. Suppressions ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.newsletter_email_hash(p_email TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public, extensions
AS $$
  SELECT encode(extensions.digest(lower(btrim(coalesce(p_email, ''))), 'sha256'), 'hex');
$$;

CREATE TABLE IF NOT EXISTS "newsletter_suppressions" (
  "emailHash" TEXT         NOT NULL PRIMARY KEY CHECK ("emailHash" ~ '^[0-9a-f]{64}$'),
  "reason"    TEXT         NOT NULL CHECK ("reason" IN ('unsubscribed', 'bounced', 'complained')),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "newsletter_suppressions" ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE "newsletter_suppressions" IS
  'SHA-256 of lower(trim(email)) for every address that unsubscribed, hard-bounced or complained. Never mailed by a campaign. No address stored. Kept through erasure on purpose: it is what honours the objection.';

-- A subscriber leaving (unsubscribe, hard bounce) suppresses the address; a
-- fresh confirmation — an explicit opt-in proven by clicking the emailed link —
-- lifts it. Text comparisons, not enum literals, so the function compiles
-- before `pending`/`confirmed` are committed and survives the enum rebuild in
-- the follow-up migration.
CREATE OR REPLACE FUNCTION public.newsletter_subscriber_status_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status::text = OLD.status::text THEN
    RETURN NEW;
  END IF;

  IF NEW.status::text IN ('unsubscribed', 'bounced') THEN
    INSERT INTO "newsletter_suppressions" ("emailHash", "reason")
    VALUES (
      public.newsletter_email_hash(NEW.email),
      CASE WHEN NEW.status::text = 'bounced' THEN 'bounced' ELSE 'unsubscribed' END
    )
    ON CONFLICT ("emailHash") DO NOTHING;
  ELSIF NEW.status::text = 'confirmed' AND TG_OP = 'UPDATE' THEN
    DELETE FROM "newsletter_suppressions"
     WHERE "emailHash" = public.newsletter_email_hash(NEW.email);
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.newsletter_subscriber_status_sync() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.newsletter_email_hash(TEXT) FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS "newsletter_subscriber_status_sync" ON "newsletter_subscribers";
CREATE TRIGGER "newsletter_subscriber_status_sync"
  AFTER INSERT OR UPDATE OF status ON "newsletter_subscribers"
  FOR EACH ROW EXECUTE FUNCTION public.newsletter_subscriber_status_sync();

-- Anyone who already left before this table existed.
INSERT INTO "newsletter_suppressions" ("emailHash", "reason")
SELECT DISTINCT ON (public.newsletter_email_hash(email))
       public.newsletter_email_hash(email),
       CASE WHEN status::text = 'bounced' THEN 'bounced' ELSE 'unsubscribed' END
  FROM "newsletter_subscribers"
 WHERE status::text IN ('unsubscribed', 'bounced')
ON CONFLICT ("emailHash") DO NOTHING;

-- ── 4. Delivery events on sent_emails ───────────────────────────────────

ALTER TABLE "sent_emails"
  ADD COLUMN IF NOT EXISTS "deliveredAt"  TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "bouncedAt"    TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "complainedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "sent_emails_providerId_idx"
  ON "sent_emails" ("providerId")
  WHERE "providerId" IS NOT NULL;

COMMIT;
