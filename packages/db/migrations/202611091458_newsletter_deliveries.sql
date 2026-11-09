-- Newsletter phase 4: sending (docs/newsletter-plan.md, Phase 4).
--
-- 1. `newsletter_deliveries` — the audience snapshot taken when a campaign
--    starts: one row per recipient, a subscriber OR a list contact (exactly
--    one), never the address itself. Cascades with the person, so deleting a
--    subscriber or a list takes their delivery rows. Resend's id and the
--    webhook's delivered / bounced / complained timestamps land here.
--
-- 2. Campaigns gain `maxPerHour` (the send pace, low for warm-up) and
--    `dryRun` (the whole pipeline without calling Resend — a rehearsal).
--
-- 3. `newsletter_start_campaign(id)` — atomically: lock the campaign while
--    it is draft/scheduled, snapshot confirmed subscribers, then active list
--    contacts (one row per address: a subscriber copy wins, then the
--    earliest list row), leave out every suppressed address, mark it
--    sending. NULL when the campaign was not startable — a second "Send"
--    click or a stale scheduled event does nothing.
--
-- 4. `newsletter_claim_deliveries(id, n)` — claim up to n queued rows of
--    one campaign (FOR UPDATE SKIP LOCKED) and mark them sending. Only
--    QUEUED rows: a row left in `sending` by a run that died is never sent
--    again automatically (its outcome is unknown; resending risks a
--    duplicate — Bazar bug 4). The sender marks those failed.
--
-- Additive: nothing deployed reads these.

CREATE TYPE "NewsletterDeliveryStatus" AS ENUM ('queued', 'sending', 'sent', 'failed', 'skipped');

CREATE TABLE IF NOT EXISTS "newsletter_deliveries" (
  "id"           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "campaignId"   TEXT NOT NULL REFERENCES "newsletter_campaigns"("id") ON DELETE CASCADE,
  "subscriberId" TEXT REFERENCES "newsletter_subscribers"("id") ON DELETE CASCADE,
  "contactId"    TEXT REFERENCES "newsletter_list_contacts"("id") ON DELETE CASCADE,
  "status"       "NewsletterDeliveryStatus" NOT NULL DEFAULT 'queued',
  "attempts"     INTEGER NOT NULL DEFAULT 0,
  "providerId"   TEXT,
  "error"        TEXT,
  "claimedAt"    TIMESTAMP(3),
  "sentAt"       TIMESTAMP(3),
  "deliveredAt"  TIMESTAMP(3),
  "bouncedAt"    TIMESTAMP(3),
  "complainedAt" TIMESTAMP(3),
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "newsletter_deliveries_one_recipient" CHECK (num_nonnulls("subscriberId", "contactId") = 1)
);

CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_deliveries_campaign_subscriber_key"
  ON "newsletter_deliveries" ("campaignId", "subscriberId") WHERE "subscriberId" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "newsletter_deliveries_campaign_contact_key"
  ON "newsletter_deliveries" ("campaignId", "contactId") WHERE "contactId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "newsletter_deliveries_campaignId_status_idx" ON "newsletter_deliveries" ("campaignId", "status");
CREATE INDEX IF NOT EXISTS "newsletter_deliveries_providerId_idx" ON "newsletter_deliveries" ("providerId") WHERE "providerId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "newsletter_deliveries_subscriberId_idx" ON "newsletter_deliveries" ("subscriberId") WHERE "subscriberId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "newsletter_deliveries_contactId_idx" ON "newsletter_deliveries" ("contactId") WHERE "contactId" IS NOT NULL;

ALTER TABLE "newsletter_deliveries" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "newsletter_campaigns"
  ADD COLUMN IF NOT EXISTS "maxPerHour" INTEGER NOT NULL DEFAULT 600 CHECK ("maxPerHour" BETWEEN 100 AND 20000),
  ADD COLUMN IF NOT EXISTS "dryRun" BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.newsletter_start_campaign(p_campaign TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audience TEXT;
  v_lists    TEXT[];
  v_count    INTEGER;
BEGIN
  SELECT audience, "listIds" INTO v_audience, v_lists
    FROM "newsletter_campaigns"
   WHERE id = p_campaign AND status IN ('draft', 'scheduled')
   FOR UPDATE;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF v_audience = 'all' THEN
    INSERT INTO "newsletter_deliveries" ("campaignId", "subscriberId")
    SELECT p_campaign, s.id
      FROM "newsletter_subscribers" s
     WHERE s.status = 'confirmed'
       AND NOT EXISTS (
         SELECT 1 FROM "newsletter_suppressions" x WHERE x."emailHash" = public.newsletter_email_hash(s.email)
       )
    ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO "newsletter_deliveries" ("campaignId", "contactId")
  SELECT p_campaign, c.id
    FROM (
      SELECT DISTINCT ON (c.email) c.id, c.email
        FROM "newsletter_list_contacts" c
       WHERE c."listId" = ANY(COALESCE(v_lists, '{}'))
         AND c.status = 'active'
       ORDER BY c.email, c."createdAt"
    ) c
   WHERE NOT EXISTS (
           SELECT 1 FROM "newsletter_suppressions" x WHERE x."emailHash" = public.newsletter_email_hash(c.email)
         )
     AND NOT EXISTS (
           SELECT 1
             FROM "newsletter_deliveries" d
             JOIN "newsletter_subscribers" s ON s.id = d."subscriberId"
            WHERE d."campaignId" = p_campaign
              AND lower(s.email) = c.email
         )
  ON CONFLICT DO NOTHING;

  SELECT count(*) INTO v_count FROM "newsletter_deliveries" WHERE "campaignId" = p_campaign;

  UPDATE "newsletter_campaigns"
     SET status = 'sending',
         "startedAt" = CURRENT_TIMESTAMP,
         "recipientCount" = v_count,
         "updatedAt" = CURRENT_TIMESTAMP
   WHERE id = p_campaign;

  RETURN v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.newsletter_claim_deliveries(p_campaign TEXT, p_limit INTEGER)
RETURNS SETOF "newsletter_deliveries"
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE "newsletter_deliveries" d
     SET status = 'sending',
         "claimedAt" = CURRENT_TIMESTAMP,
         attempts = d.attempts + 1
   WHERE d.id IN (
     SELECT x.id
       FROM "newsletter_deliveries" x
      WHERE x."campaignId" = p_campaign
        AND x.status = 'queued'
      ORDER BY x."createdAt", x.id
      LIMIT GREATEST(p_limit, 0)
      FOR UPDATE SKIP LOCKED
   )
  RETURNING d.*;
$$;

REVOKE ALL ON FUNCTION public.newsletter_start_campaign(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.newsletter_claim_deliveries(TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
