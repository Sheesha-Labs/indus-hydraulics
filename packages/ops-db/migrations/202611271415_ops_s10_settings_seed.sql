-- Indus Operations · S10 · settings defaults for supplier onboarding, trust and document reminders
--
--   supplier_docs.request   board 50: the upload link expires after 14 days, reminders every 4 days, 30 requests per
--                          10 minutes per link and per address on /u.
--   suppliers.trust        boards 51, 52, 130 (P09, C21, C40): trial = first 3 POs, each ≤ USD 25,000, TPI at works on
--                          each; re-screen every 90 days and before any PO above USD 50,000; re-propose 6 months after
--                          a rejection; Trial → Approved suggested after 3 good POs; 24 h cooling-off after a verified
--                          bank change.
--   documents.reminders    C18: reminders at 60, 30 and 7 days before a document expires.
--
-- All awaiting the Owner's sign-off (open items P09, P23). ON CONFLICT DO NOTHING: a value the Owner changed is kept.

BEGIN;

INSERT INTO "ops"."settings_entry" ("key", "value", "version", "ownerOnly", "signoffStatus", "updatedAt")
VALUES
  ('supplier_docs.request', '{"expiryDays":14,"reminderEveryDays":4,"rateLimitPer10Min":30}', 0, true, 'awaiting', now()),
  ('suppliers.trust',
    '{"trialPos":3,"trialPerPoUsd":25000,"trialTpiEachPo":true,"rescreenDays":90,"rescreenAboveUsd":50000,"reproposeMonths":6,"approvedAfterPos":3,"coolingOffHours":24}',
    0, true, 'awaiting', now()),
  ('documents.reminders', '{"thresholds":[60,30,7]}', 0, true, 'awaiting', now())
ON CONFLICT ("key") DO NOTHING;

COMMIT;
