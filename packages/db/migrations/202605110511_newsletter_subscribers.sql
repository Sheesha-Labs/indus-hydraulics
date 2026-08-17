-- Newsletter subscribers — capture from homepage + future CTAs.
--
-- Until this migration, the homepage <HomeNewsletterForm /> rendered a
-- success state without persisting anything (a silent lead leak). This
-- table backs the new subscribeToNewsletter server action.
--
-- Applied via Supabase MCP `apply_migration`. Mirrors the Prisma model
-- NewsletterSubscriber added in the same PR.
--
-- Column types match Prisma's String @id @default(uuid()) → TEXT. We
-- index by status (most queries are "list active subscribers") and by
-- createdAt for chronological export.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'NewsletterSubscriberStatus'
  ) THEN
    CREATE TYPE "NewsletterSubscriberStatus" AS ENUM ('active', 'unsubscribed', 'bounced');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
  "id"             TEXT                         NOT NULL PRIMARY KEY,
  "email"          TEXT                         NOT NULL,
  "status"         "NewsletterSubscriberStatus" NOT NULL DEFAULT 'active',
  "source"         TEXT,
  "ipHash"         TEXT,
  "userAgent"      TEXT,
  "createdAt"      TIMESTAMP(3)                 NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3)                 NOT NULL,
  "unsubscribedAt" TIMESTAMP(3)
);

CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_subscribers_email_key"
  ON "newsletter_subscribers" ("email");

CREATE INDEX IF NOT EXISTS "newsletter_subscribers_status_idx"
  ON "newsletter_subscribers" ("status");

CREATE INDEX IF NOT EXISTS "newsletter_subscribers_createdAt_idx"
  ON "newsletter_subscribers" ("createdAt");

COMMIT;
