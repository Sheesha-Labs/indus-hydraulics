-- Newsletter phase 2: lists staff upload or build by hand
-- (docs/newsletter-plan.md, Phase 2).
--
-- 1. `newsletter_lists` and `newsletter_list_contacts` — one row per address
--    per list (unique), each with its own permanent unsubscribe token and a
--    status (active / unsubscribed / bounced). Addresses are stored
--    lower-cased and trimmed; a CHECK holds that.
--
-- 2. `newsletter_list_imports` — one row per upload: who, when, which file,
--    the counts, and the consent statement the uploader ticked (plan D6).
--    Contacts keep the import they came from, so "who put this address on a
--    list, and on what basis" has an answer per address.
--
-- 3. Suppression reaches every list. An unsubscribe or a hard bounce on a
--    list contact suppresses the address (newsletter_suppressions), marks its
--    other list rows the same way and ends its subscription, if any. A
--    subscriber unsubscribing or bouncing marks the address's list rows the
--    same way (the subscriber trigger from 202611081838 is replaced to do
--    so). Each update touches only rows still active / pending / confirmed,
--    so the two triggers settle after one round.
--
--    Confirming a subscription again lifts the suppression (unchanged) but
--    does NOT reactivate list rows: a list row is only ever made active by
--    staff adding the address again, and the import refuses suppressed
--    addresses.
--
-- Additive: the deployed code reads none of these tables, and the replaced
-- trigger function behaves as before for an address on no list. The new
-- enum type belongs to a new table, so no deployed client can meet it.

-- ── 1. Lists and contacts ─────────────────────────────────────────────────

CREATE TYPE "NewsletterContactStatus" AS ENUM ('active', 'unsubscribed', 'bounced');

CREATE TABLE IF NOT EXISTS "newsletter_lists" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"        TEXT NOT NULL CHECK (length(trim("name")) BETWEEN 1 AND 120),
  "description" TEXT NOT NULL DEFAULT '',
  "createdById" TEXT REFERENCES "staff_users"("id") ON DELETE SET NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "newsletter_list_imports" (
  "id"            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "listId"        TEXT NOT NULL REFERENCES "newsletter_lists"("id") ON DELETE CASCADE,
  "fileName"      TEXT NOT NULL DEFAULT '',
  "consentText"   TEXT NOT NULL,
  "importedById"  TEXT REFERENCES "staff_users"("id") ON DELETE SET NULL,
  "rows"          INTEGER NOT NULL DEFAULT 0,
  "added"         INTEGER NOT NULL DEFAULT 0,
  "alreadyOnList" INTEGER NOT NULL DEFAULT 0,
  "suppressed"    INTEGER NOT NULL DEFAULT 0,
  "invalid"       INTEGER NOT NULL DEFAULT 0,
  "duplicates"    INTEGER NOT NULL DEFAULT 0,
  "truncated"     INTEGER NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "newsletter_list_imports_listId_createdAt_idx"
  ON "newsletter_list_imports" ("listId", "createdAt");

CREATE TABLE IF NOT EXISTS "newsletter_list_contacts" (
  "id"               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "listId"           TEXT NOT NULL REFERENCES "newsletter_lists"("id") ON DELETE CASCADE,
  "email"            TEXT NOT NULL CHECK ("email" = lower(trim("email")) AND "email" ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  "name"             TEXT NOT NULL DEFAULT '',
  "status"           "NewsletterContactStatus" NOT NULL DEFAULT 'active',
  "unsubscribeToken" TEXT NOT NULL DEFAULT encode(extensions.gen_random_bytes(24), 'hex')
                     CHECK ("unsubscribeToken" ~ '^[0-9a-f]{48}$'),
  "source"           TEXT NOT NULL DEFAULT 'manual' CHECK ("source" IN ('upload', 'manual')),
  "importId"         TEXT REFERENCES "newsletter_list_imports"("id") ON DELETE SET NULL,
  "addedById"        TEXT REFERENCES "staff_users"("id") ON DELETE SET NULL,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "unsubscribedAt"   TIMESTAMP(3),
  CONSTRAINT "newsletter_list_contacts_listId_email_key" UNIQUE ("listId", "email")
);

CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_list_contacts_unsubscribeToken_key"
  ON "newsletter_list_contacts" ("unsubscribeToken");
CREATE INDEX IF NOT EXISTS "newsletter_list_contacts_email_idx"
  ON "newsletter_list_contacts" ("email");
CREATE INDEX IF NOT EXISTS "newsletter_list_contacts_listId_status_idx"
  ON "newsletter_list_contacts" ("listId", "status");

-- Personal data with no reason to be readable through the Data API: RLS on,
-- no policy. Prisma connects as the table owner and is unaffected.
ALTER TABLE "newsletter_lists"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "newsletter_list_imports"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "newsletter_list_contacts" ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE "newsletter_list_contacts" IS
  'Addresses staff uploaded or added to a newsletter list. An unsubscribe or hard bounce here suppresses the address everywhere (newsletter_suppressions) and ends its subscription.';

-- ── 2. Subscriber → list rows ─────────────────────────────────────────────
-- As 202611081838, plus: unsubscribed / bounced marks the address's active
-- list rows the same way.

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

    UPDATE "newsletter_list_contacts" c
       SET status = (CASE WHEN NEW.status::text = 'bounced' THEN 'bounced' ELSE 'unsubscribed' END)::"NewsletterContactStatus",
           "unsubscribedAt" = COALESCE(c."unsubscribedAt", CURRENT_TIMESTAMP)
     WHERE c.email = lower(trim(NEW.email))
       AND c.status = 'active';
  ELSIF NEW.status::text = 'confirmed' AND TG_OP = 'UPDATE' THEN
    DELETE FROM "newsletter_suppressions"
     WHERE "emailHash" = public.newsletter_email_hash(NEW.email);
  END IF;

  RETURN NEW;
END;
$$;

-- ── 3. List row → everywhere ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.newsletter_contact_status_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status::text = 'active' OR (TG_OP = 'UPDATE' AND NEW.status::text = OLD.status::text) THEN
    RETURN NEW;
  END IF;

  INSERT INTO "newsletter_suppressions" ("emailHash", "reason")
  VALUES (
    public.newsletter_email_hash(NEW.email),
    CASE WHEN NEW.status::text = 'bounced' THEN 'bounced' ELSE 'unsubscribed' END
  )
  ON CONFLICT ("emailHash") DO NOTHING;

  UPDATE "newsletter_list_contacts" c
     SET status = NEW.status,
         "unsubscribedAt" = COALESCE(c."unsubscribedAt", CURRENT_TIMESTAMP)
   WHERE c.email = NEW.email
     AND c.id <> NEW.id
     AND c.status = 'active';

  UPDATE "newsletter_subscribers" s
     SET status = (CASE WHEN NEW.status::text = 'bounced' THEN 'bounced' ELSE 'unsubscribed' END)::"NewsletterSubscriberStatus",
         "unsubscribedAt" = CASE WHEN NEW.status::text = 'bounced' THEN s."unsubscribedAt"
                                 ELSE COALESCE(s."unsubscribedAt", CURRENT_TIMESTAMP) END,
         "bouncedAt" = CASE WHEN NEW.status::text = 'bounced' THEN COALESCE(s."bouncedAt", CURRENT_TIMESTAMP)
                            ELSE s."bouncedAt" END,
         "updatedAt" = CURRENT_TIMESTAMP
   WHERE lower(s.email) = NEW.email
     AND s.status::text IN ('pending', 'confirmed');

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.newsletter_contact_status_sync() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS "newsletter_contact_status_sync" ON "newsletter_list_contacts";
CREATE TRIGGER "newsletter_contact_status_sync"
  AFTER INSERT OR UPDATE OF status ON "newsletter_list_contacts"
  FOR EACH ROW EXECUTE FUNCTION public.newsletter_contact_status_sync();
