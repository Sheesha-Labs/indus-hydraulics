-- Indus Operations · S10 · action defs and email templates (CLAUDE.md §17)
--
-- The settings this sprint adds are in 202611271415_ops_s10_settings_seed.sql (the registry test reads *_settings_seed.sql).
--
-- Action defs (system positions 144–146):
--   request_supplier_documents  board 50: the email that carries the /u link to a new supplier, from purchase@.
--                               Sends externally; Draft and ask in every preset.
--   bank_change_warning         board 132: after a not-genuine call-back, a warning to the address on file (never the
--                               sender). Locked Draft and ask.
--   supplier_reliability_summary board 129: one internal paragraph from computed figures. Locked Do quietly.
-- #16 remind_supplier_documents, promote_supplier and bank_change_alert were seeded by S03-T06; #16's rule text
-- moves to C18 (60/30/7) where it was never edited.
--
-- Email templates, awaiting sign-off (P09, P23): supplier_document_request, supplier_document_reminder,
-- bank_change_warning. Supplier-bound: no client identity can appear in any variable (ADR-13).
--
-- ON CONFLICT DO NOTHING throughout: a value, level or wording the Owner changed is kept.

BEGIN;

INSERT INTO "ops"."autopilot_action_def"
  ("key", "group", "label", "description", "ruleText", "position", "configurable", "lockedLevel", "maxLevel",
   "defaultCareful", "defaultBalanced", "defaultHandsOff", "minutesSaved", "originBoard", "signoffStatus")
VALUES
  ('request_supplier_documents', 'sourcing', 'Ask a new supplier for documents', 'A supplier being set up · Produces the email with the secure upload link', 'The link expires after 14 days; reminders every 4 days', 144, true, NULL, NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', 5, '50', 'awaiting'),
  ('bank_change_warning', 'money', 'Warn a supplier about a fake bank change', 'A bank-detail change found not genuine on the call-back · Produces a warning to the address on file', 'Always asks you; never sent to the address that asked for the change', 145, false, 'draft_and_ask', NULL, 'draft_and_ask', 'draft_and_ask', 'draft_and_ask', 3, '132', 'awaiting'),
  ('supplier_reliability_summary', 'sourcing', 'Supplier reliability summary', 'Nightly supplier figures · Produces one internal paragraph on the profile', 'Internal text from computed figures; shown with 3 or more replies', 146, false, 'do_quietly', NULL, 'do_quietly', 'do_quietly', 'do_quietly', 2, '129', 'awaiting')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "ops"."autopilot_setting" ("actionKey", "level", "rules", "version", "updatedAt")
VALUES
  ('request_supplier_documents', 'draft_and_ask', '{}', 0, now()),
  ('bank_change_warning', 'draft_and_ask', '{}', 0, now()),
  ('supplier_reliability_summary', 'do_quietly', '{}', 0, now())
ON CONFLICT ("actionKey") DO NOTHING;

UPDATE "ops"."autopilot_action_def"
   SET "ruleText" = 'Licences, certificates and approvals, at 60, 30 and 7 days'
 WHERE "key" = 'remind_supplier_documents' AND "ruleText" = 'Licences and approvals, 30 days ahead';

INSERT INTO "ops"."email_template"
  ("key", "label", "mailboxRole", "subjectTemplate", "bodyTemplate", "variables", "signoffStatus", "updatedAt")
VALUES
  ('supplier_document_request', 'New supplier · documents request', 'supplier',
   'Supplier registration: documents for {supplier_name}',
   E'{salutation}\n\nThank you for your interest in supplying Indus Hydraulic Power Trading LLC. To complete your registration, please upload the following documents through our secure link:\n\n{document_list}\n\n{upload_link}\n\nThe link expires on {expiry_date}. You can upload the documents in more than one visit; each one shows as received as soon as it is in.',
   ARRAY['salutation', 'supplier_name', 'document_list', 'upload_link', 'expiry_date'], 'awaiting', now()),
  ('supplier_document_reminder', 'Supplier documents · reminder', 'supplier',
   'Re: {original_subject}',
   E'{salutation}\n\n{reminder_line}\n\n{document_list}\n\nYou can upload them through our secure link:\n\n{upload_link}\n\nThe link expires on {expiry_date}.',
   ARRAY['salutation', 'original_subject', 'reminder_line', 'document_list', 'upload_link', 'expiry_date'], 'awaiting', now()),
  ('bank_change_warning', 'Bank-detail change · warning', 'supplier',
   'Bank details on your account with Indus Hydraulic Power Trading LLC',
   E'{salutation}\n\nOn {request_date} we received an email from {sender_address} asking us to change the bank details we hold for {supplier_name}. When we called the number we hold on file, your team confirmed that the request did not come from you.\n\nWe have not changed your bank details and no payment has been made to the new account. Please check your email accounts for unauthorised access. If you do need to change your bank details, please send the change on your letterhead and we will confirm it by phone before anything is paid.',
   ARRAY['salutation', 'request_date', 'sender_address', 'supplier_name'], 'awaiting', now())
ON CONFLICT ("key") DO NOTHING;

COMMIT;
