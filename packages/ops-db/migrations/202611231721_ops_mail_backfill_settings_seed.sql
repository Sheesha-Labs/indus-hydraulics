-- Indus Operations · S04-T05 · backfill exclusions (content, ADR-01)
--
--   mail.backfill_exclusions   senders whose past mail is never imported (addresses and domains). Seeded empty
--                              and awaiting sign-off; P07 (history import, S20) owns the full editor. Mailing
--                              lists, bulk mail and the Indus/Ignore label are excluded by code, not by this list.
--
-- ON CONFLICT DO NOTHING: a re-run never overwrites a value someone has edited in Settings.

BEGIN;

INSERT INTO "ops"."settings_entry" ("key", "value", "version", "ownerOnly", "signoffStatus", "updatedAt") VALUES
  ('mail.backfill_exclusions',
    '{"addresses":[],"domains":[]}',
    0, true, 'awaiting', now())
ON CONFLICT ("key") DO NOTHING;

COMMIT;
