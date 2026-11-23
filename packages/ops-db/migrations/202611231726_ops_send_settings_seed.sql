-- Indus Operations · S04-T06 · send timing defaults (content, ADR-01; boards 87, 99, 100; P02 sign-off)
--
--   send.timing                 client hours 09:00–18:00 GST; composed after 19:00 → released 08:30 the next
--                               working day; Ramadan 10:00–15:00; supplier local morning 09:00–11:00; chasers
--                               never on a Friday after 15:00 local; daily caps reset 04:00 GST.
--                               Precedence (decision, flagged for sign-off): guardrail hours first, then the
--                               window: a working-day moment between 08:30 and 18:00 sends now.
--   calendar.country_weekends   weekend days by country (0 = Sunday … 6 = Saturday); default Saturday–Sunday.
--
-- The hold before every external send is the existing setting `undo` (sendWindowMinutes 5, S03). Daily caps are
-- per mailbox (mailbox.dailySendCap: Client 40, Supplier 80 by default from the role at connect).
-- ON CONFLICT DO NOTHING: a re-run never overwrites a value someone has edited in Settings.

BEGIN;

INSERT INTO "ops"."settings_entry" ("key", "value", "version", "ownerOnly", "signoffStatus", "updatedAt") VALUES
  ('send.timing',
    '{"clientHours":{"start":"09:00","end":"18:00"},"window":{"after":"19:00","releaseAt":"08:30"},"ramadanHours":{"start":"10:00","end":"15:00"},"supplierMorning":{"start":"09:00","end":"11:00"},"chaserNoFridayAfter":"15:00","capReset":"04:00"}',
    0, true, 'awaiting', now()),
  ('calendar.country_weekends',
    '{"default":[6,0],"byCountry":{"AE":[6,0],"SA":[5,6],"OM":[5,6],"KW":[5,6],"QA":[5,6],"BH":[5,6],"EG":[5,6],"IR":[4,5]}}',
    0, true, 'awaiting', now())
ON CONFLICT ("key") DO NOTHING;

COMMIT;
