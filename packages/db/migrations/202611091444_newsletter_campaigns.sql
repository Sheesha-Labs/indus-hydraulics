-- Newsletter phase 3: campaigns, saved templates and the sender settings
-- (docs/newsletter-plan.md, Phase 3).
--
-- 1. `newsletter_campaigns` — one row per newsletter: subject, preheader,
--    its body in one of two formats (`blocks`: a JSON block document in
--    `design`; `rich`: sanitised HTML in `bodyHtml`), the audience (all
--    confirmed subscribers, or `none` = the chosen lists only), the lists,
--    and where it is: draft → scheduled → sending → sent, or cancelled.
--    Phase 4 adds the per-recipient deliveries and the sender.
--
-- 2. `newsletter_templates` — a saved design or rich body staff can start a
--    campaign from.
--
-- 3. `newsletter_settings` — one row: the From name, the From address (its
--    local part; the domain is always the newsletter subdomain, enforced by
--    the code and a CHECK here), and the Reply-To.
--
-- Additive: nothing deployed reads these tables.

CREATE TYPE "NewsletterCampaignStatus" AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'cancelled');

CREATE TABLE IF NOT EXISTS "newsletter_campaigns" (
  "id"             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "subject"        TEXT NOT NULL DEFAULT '' CHECK (length("subject") <= 200),
  "preheader"      TEXT NOT NULL DEFAULT '' CHECK (length("preheader") <= 200),
  "format"         TEXT NOT NULL DEFAULT 'blocks' CHECK ("format" IN ('blocks', 'rich')),
  "design"         JSONB,
  "bodyHtml"       TEXT NOT NULL DEFAULT '',
  "audience"       TEXT NOT NULL DEFAULT 'all' CHECK ("audience" IN ('all', 'none')),
  "listIds"        TEXT[] NOT NULL DEFAULT '{}' CHECK (cardinality("listIds") <= 20),
  "status"         "NewsletterCampaignStatus" NOT NULL DEFAULT 'draft',
  "scheduledAt"    TIMESTAMP(3),
  "startedAt"      TIMESTAMP(3),
  "sentAt"         TIMESTAMP(3),
  "cancelledAt"    TIMESTAMP(3),
  "testSentAt"     TIMESTAMP(3),
  "recipientCount" INTEGER NOT NULL DEFAULT 0,
  "createdById"    TEXT REFERENCES "staff_users"("id") ON DELETE SET NULL,
  "updatedById"    TEXT REFERENCES "staff_users"("id") ON DELETE SET NULL,
  "sentById"       TEXT REFERENCES "staff_users"("id") ON DELETE SET NULL,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "newsletter_campaigns_scheduled_has_time"
    CHECK ("status" <> 'scheduled' OR "scheduledAt" IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS "newsletter_campaigns_status_scheduledAt_idx" ON "newsletter_campaigns" ("status", "scheduledAt");
CREATE INDEX IF NOT EXISTS "newsletter_campaigns_createdAt_idx" ON "newsletter_campaigns" ("createdAt");

CREATE TABLE IF NOT EXISTS "newsletter_templates" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name"        TEXT NOT NULL CHECK (length(trim("name")) BETWEEN 1 AND 120),
  "description" TEXT NOT NULL DEFAULT '',
  "subject"     TEXT NOT NULL DEFAULT '',
  "preheader"   TEXT NOT NULL DEFAULT '',
  "format"      TEXT NOT NULL DEFAULT 'blocks' CHECK ("format" IN ('blocks', 'rich')),
  "design"      JSONB,
  "bodyHtml"    TEXT NOT NULL DEFAULT '',
  "createdById" TEXT REFERENCES "staff_users"("id") ON DELETE SET NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "newsletter_settings" (
  "id"          TEXT PRIMARY KEY DEFAULT 'default' CHECK ("id" = 'default'),
  "fromName"    TEXT NOT NULL DEFAULT 'Indus Hydraulics' CHECK (length(trim("fromName")) BETWEEN 1 AND 80),
  "fromLocal"   TEXT NOT NULL DEFAULT 'newsletter' CHECK ("fromLocal" ~ '^[a-z0-9][a-z0-9._-]{0,63}$'),
  "replyTo"     TEXT NOT NULL DEFAULT 'sales@indushydraulics.me' CHECK ("replyTo" ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  "updatedById" TEXT REFERENCES "staff_users"("id") ON DELETE SET NULL,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "newsletter_settings" ("id") VALUES ('default') ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "newsletter_campaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "newsletter_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "newsletter_settings"  ENABLE ROW LEVEL SECURITY;
