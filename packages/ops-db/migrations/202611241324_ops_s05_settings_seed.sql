-- Indus Operations · S05 · settings seeds (content, ADR-01; every default awaits the Owner's sign-off)
--
--   assistant.internal_undo_minutes   {"minutes":5}: how long an internal Assistant effect (a link, a Gmail
--                                     label) can be undone from the log (S05-T02, 06-map §9.11 done → undone).
--
-- ON CONFLICT DO NOTHING: a re-run never overwrites a value someone has edited in Settings.

BEGIN;

INSERT INTO "ops"."settings_entry" ("key", "value", "version", "ownerOnly", "signoffStatus", "updatedAt") VALUES
  ('assistant.internal_undo_minutes', '{"minutes":5}', 0, true, 'awaiting', now())
ON CONFLICT ("key") DO NOTHING;

COMMIT;
