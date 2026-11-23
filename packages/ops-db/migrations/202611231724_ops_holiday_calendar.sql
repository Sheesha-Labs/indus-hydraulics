-- Indus Operations · S04-T06 · holiday calendar (send slots: 08-map-integrations §1.10, boards 87 and 100)
--
--   ops.holiday   one row per (country, date, kind): public_holiday | ramadan | closure, with optional working
--                 hours for the day (Ramadan: 10:00–15:00). Content edited in Settings, so a moon sighting or a
--                 government announcement costs no deploy. Every seeded row is 'awaiting' sign-off.
--
-- The UAE dates below are the best known on 2026-11-23: the Islamic holidays move with the moon sighting and
-- are announced shortly before; the Owner confirms or edits them in Settings. work_calendar_day (S00) stays;
-- the calendar reads both, and new rows go here.
--
-- RLS + ops_app policy and grants. Idempotent (ON CONFLICT DO NOTHING on the natural key).

BEGIN;

CREATE TABLE IF NOT EXISTS "ops"."holiday" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "country" CHAR(2) NOT NULL,
    "date" DATE NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "hoursStart" TEXT,
    "hoursEnd" TEXT,
    "signoffStatus" TEXT NOT NULL DEFAULT 'awaiting',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "holiday_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "holiday_country_check" CHECK ("country" ~ '^[A-Z]{2}$'),
    CONSTRAINT "holiday_kind_check" CHECK ("kind" IN ('public_holiday', 'ramadan', 'closure')),
    CONSTRAINT "holiday_hours_check" CHECK (
      ("hoursStart" IS NULL OR "hoursStart" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$') AND
      ("hoursEnd" IS NULL OR "hoursEnd" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
    ),
    CONSTRAINT "holiday_signoff_check" CHECK ("signoffStatus" IN ('awaiting', 'signed_off', 'not_required'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "holiday_country_date_kind_key" ON "ops"."holiday"("country", "date", "kind");
CREATE INDEX IF NOT EXISTS "holiday_date_idx" ON "ops"."holiday"("date");

-- ── UAE public holidays 2026–2027 and Ramadan 2027 (best known; awaiting sign-off) ─────────────────
INSERT INTO "ops"."holiday" ("country", "date", "name", "kind") VALUES
  ('AE', '2026-01-01', 'New Year''s Day', 'public_holiday'),
  ('AE', '2026-03-20', 'Eid al-Fitr', 'public_holiday'),
  ('AE', '2026-03-21', 'Eid al-Fitr', 'public_holiday'),
  ('AE', '2026-03-22', 'Eid al-Fitr', 'public_holiday'),
  ('AE', '2026-05-26', 'Arafat Day', 'public_holiday'),
  ('AE', '2026-05-27', 'Eid al-Adha', 'public_holiday'),
  ('AE', '2026-05-28', 'Eid al-Adha', 'public_holiday'),
  ('AE', '2026-05-29', 'Eid al-Adha', 'public_holiday'),
  ('AE', '2026-06-16', 'Islamic New Year', 'public_holiday'),
  ('AE', '2026-08-25', 'Prophet''s Birthday', 'public_holiday'),
  ('AE', '2026-11-30', 'Commemoration Day', 'public_holiday'),
  ('AE', '2026-12-02', 'National Day', 'public_holiday'),
  ('AE', '2026-12-03', 'National Day', 'public_holiday'),
  ('AE', '2027-01-01', 'New Year''s Day', 'public_holiday'),
  ('AE', '2027-03-09', 'Eid al-Fitr', 'public_holiday'),
  ('AE', '2027-03-10', 'Eid al-Fitr', 'public_holiday'),
  ('AE', '2027-03-11', 'Eid al-Fitr', 'public_holiday'),
  ('AE', '2027-05-15', 'Arafat Day', 'public_holiday'),
  ('AE', '2027-05-16', 'Eid al-Adha', 'public_holiday'),
  ('AE', '2027-05-17', 'Eid al-Adha', 'public_holiday'),
  ('AE', '2027-05-18', 'Eid al-Adha', 'public_holiday'),
  ('AE', '2027-06-06', 'Islamic New Year', 'public_holiday'),
  ('AE', '2027-08-14', 'Prophet''s Birthday', 'public_holiday'),
  ('AE', '2027-12-01', 'Commemoration Day', 'public_holiday'),
  ('AE', '2027-12-02', 'National Day', 'public_holiday'),
  ('AE', '2027-12-03', 'National Day', 'public_holiday')
ON CONFLICT ("country", "date", "kind") DO NOTHING;

INSERT INTO "ops"."holiday" ("country", "date", "name", "kind", "hoursStart", "hoursEnd")
SELECT 'AE', d::date, 'Ramadan', 'ramadan', '10:00', '15:00'
  FROM generate_series('2027-02-08'::date, '2027-03-08'::date, interval '1 day') AS d
ON CONFLICT ("country", "date", "kind") DO NOTHING;

-- ── RLS, policies and grants ──────────────────────────────────────────────────────────────
ALTER TABLE "ops"."holiday" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'ops' AND tablename = 'holiday' AND policyname = 'ops_app_all'
  ) THEN
    CREATE POLICY ops_app_all ON "ops"."holiday" AS PERMISSIVE FOR ALL TO ops_app USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON "ops"."holiday" TO ops_app;
REVOKE ALL ON "ops"."holiday" FROM PUBLIC;
DO $$
DECLARE
  r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON ops.holiday FROM %I', r);
    END IF;
  END LOOP;
END $$;

DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'ops.holiday'::regclass) THEN
    RAISE EXCEPTION 'ops.holiday must have row-level security on';
  END IF;
END $$;

COMMIT;
