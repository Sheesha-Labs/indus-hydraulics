-- Indus Operations · S04-T02 · mail settings defaults (content, not code: ADR-01, CLAUDE.md §6.10)
--
--   mail.label_names   the Indus/* labels created in each connected mailbox (08-map-integrations §1.8).
--                      Names need the Owner's sign-off (P02 open item) → signoffStatus 'awaiting'.
--   mailbox.consent    the consent explainer's data-location line on board 86. The board said "EU region";
--                      the data lives in Supabase ap-south-1 (Mumbai) → rewritten, awaiting sign-off (ADR-32).
--
-- ON CONFLICT DO NOTHING: a re-run never overwrites a value someone has edited in Settings.

BEGIN;

INSERT INTO "ops"."settings_entry" ("key", "value", "version", "ownerOnly", "signoffStatus", "updatedAt") VALUES
  ('mail.label_names',
    '{"enquiry":"Indus/Enquiry","clientReply":"Indus/Client reply","po":"Indus/PO","supplierQuote":"Indus/Supplier quote","supplierQuestion":"Indus/Supplier question","needsOwner":"Indus/Needs Krishan","notBusiness":"Indus/Not business","ignore":"Indus/Ignore"}',
    0, true, 'awaiting', now()),
  ('mailbox.consent',
    '{"dataLocation":"Data is stored in Indus Operations'' own database in Mumbai (ap-south-1), encrypted at rest. You can disconnect and delete it at any time."}',
    0, true, 'awaiting', now())
ON CONFLICT ("key") DO NOTHING;

COMMIT;
