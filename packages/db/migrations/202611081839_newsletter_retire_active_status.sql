-- Newsletter phase 1, part 2: retire the `active` status.
--
-- RUN AFTER THE DEPLOY of the code that knows `pending`/`confirmed`, never
-- before. The previously deployed client writes `active` on every signup and
-- does not know `confirmed` — writing a `confirmed` row ahead of it would make
-- it throw on read.
--
-- 1. Every `active` row becomes `confirmed`. There was one in production
--    (2026-09-20, homepage). It subscribed through the single-opt-in form,
--    whose fine print read "By subscribing you agree to our privacy policy.
--    Unsubscribe in one click."; that wording is recorded as its consent with
--    version `legacy-single-opt-in`, and `confirmedAt` is its signup time.
--    Any row the old code wrote between part 1 and the deploy is moved too.
--
-- 2. The enum is rebuilt without `active`, so no code can write it again.
--    Postgres cannot drop an enum value in place; this swaps the type. The
--    status-sync trigger compares text, so it is unaffected, and a column
--    type change does not fire it.

BEGIN;

UPDATE "newsletter_subscribers"
   SET status           = 'confirmed',
       "confirmedAt"    = COALESCE("confirmedAt", "createdAt"),
       "consentText"    = COALESCE("consentText", 'By subscribing you agree to our privacy policy. Unsubscribe in one click.'),
       "consentVersion" = COALESCE("consentVersion", 'legacy-single-opt-in')
 WHERE status = 'active';

ALTER TABLE "newsletter_subscribers" ALTER COLUMN status DROP DEFAULT;

ALTER TYPE "NewsletterSubscriberStatus" RENAME TO "NewsletterSubscriberStatus_legacy";
CREATE TYPE "NewsletterSubscriberStatus" AS ENUM ('pending', 'confirmed', 'unsubscribed', 'bounced');

ALTER TABLE "newsletter_subscribers"
  ALTER COLUMN status TYPE "NewsletterSubscriberStatus"
  USING status::text::"NewsletterSubscriberStatus";

ALTER TABLE "newsletter_subscribers" ALTER COLUMN status SET DEFAULT 'pending';

DROP TYPE "NewsletterSubscriberStatus_legacy";

COMMIT;
