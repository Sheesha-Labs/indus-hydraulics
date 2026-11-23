-- Indus Operations · S04-T07 · Settings › Sending and Settings › Mailboxes content (boards 85, 87)
--
--   send.signatures         signature blocks by sender ({ <userId>: { html, text } }); empty: until the Owner
--                           saves one, the mailbox's detected Gmail signature is used. Content, no sign-off.
--   send.attachment_names   INDUS-Q{n}.pdf and IH-RFQ-{ref}.pdf (board 87), awaiting sign-off.
--   mail.test_allowlist     internal addresses the Owner's "Send a test email…" may use; empty.
--
-- ON CONFLICT DO NOTHING: a re-run never overwrites a value someone has edited in Settings.

BEGIN;

INSERT INTO "ops"."settings_entry" ("key", "value", "version", "ownerOnly", "signoffStatus", "updatedAt") VALUES
  ('send.signatures', '{}', 0, true, 'not_required', now()),
  ('send.attachment_names',
    '{"quotation":"INDUS-Q{n}.pdf","supplierRfq":"IH-RFQ-{ref}.pdf"}',
    0, true, 'awaiting', now()),
  ('mail.test_allowlist', '{"addresses":[]}', 0, true, 'not_required', now())
ON CONFLICT ("key") DO NOTHING;

COMMIT;
