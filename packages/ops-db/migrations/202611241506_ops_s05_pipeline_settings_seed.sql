-- Indus Operations · S05-T09 · the mail pipeline switch (content, ADR-01)
--
--   assistant.mail_pipeline_enabled   {"enabled":false}: while off, new mail is stored and shown but the
--                                     Assistant does not classify it (#1), so nothing is linked or labelled.
--                                     The Owner turns it on in Settings › Mailboxes after the deploy; turning
--                                     it on sorts the unclassified backlog oldest first (ops.assistant.backlog).
--
-- A switch, not a default to confirm: signoffStatus not_required. ON CONFLICT DO NOTHING: a re-run never
-- turns it back off.

BEGIN;

INSERT INTO "ops"."settings_entry" ("key", "value", "version", "ownerOnly", "signoffStatus", "updatedAt") VALUES
  ('assistant.mail_pipeline_enabled', '{"enabled":false}', 0, true, 'not_required', now())
ON CONFLICT ("key") DO NOTHING;

COMMIT;
