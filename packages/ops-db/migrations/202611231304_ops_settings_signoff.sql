-- Indus Operations · S03-T04 · sign-off flags on settings and content rows (S03 migration 3)
--
-- ADR-28: every value the handoff marks *default* or *needs sign-off* ships as a seeded row with
-- signoffStatus = 'awaiting'. Settings shows "Default · awaiting sign-off" next to it and Settings
-- home lists every awaiting row until the Owner confirms it (markSignedOff in
-- apps/ops/src/server/settings/signoff.ts).
--
--   enum ops."SignoffStatus"  awaiting · signed_off · not_required
--
--   On the eight tables that hold configuration or copy:
--     settings_entry, email_template, document_template, terms_clause, terms_preset, guardrail,
--     sending_rule, autopilot_action_def
--   three columns:
--     "signoffStatus"   ops."SignoffStatus" NOT NULL DEFAULT 'not_required'
--     "signedOffById"   uuid → ops."user"(id), ON DELETE RESTRICT (actor-column convention: a SQL
--                       foreign key, no Prisma relation)
--     "signedOffAt"     timestamptz(3)
--   and a CHECK that keeps them consistent: signed_off ⇔ both signedOffById and signedOffAt set.
--
-- Existing rows (the 11 guardrails and 14 sending-rule skeletons of the reference seed) take the
-- default 'not_required'; the sprints that give them values flag them 'awaiting' (ADR-28, §9.2).
-- The Autopilot locked-level trigger (ops.locked_level_guard, on autopilot_setting) reads
-- autopilot_action_def with SELECT * INTO a %ROWTYPE, which is unaffected by the new columns.
--
-- Idempotent: the enum only when absent, ADD COLUMN IF NOT EXISTS, constraints in DO blocks that
-- swallow duplicate_object.

BEGIN;

DO $$ BEGIN
  CREATE TYPE "ops"."SignoffStatus" AS ENUM ('awaiting', 'signed_off', 'not_required');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'settings_entry', 'email_template', 'document_template', 'terms_clause',
    'terms_preset', 'guardrail', 'sending_rule', 'autopilot_action_def'
  ] LOOP
    EXECUTE format(
      'ALTER TABLE "ops".%I
         ADD COLUMN IF NOT EXISTS "signoffStatus" "ops"."SignoffStatus" NOT NULL DEFAULT ''not_required'',
         ADD COLUMN IF NOT EXISTS "signedOffById" UUID,
         ADD COLUMN IF NOT EXISTS "signedOffAt" TIMESTAMPTZ(3)',
      t
    );

    BEGIN
      EXECUTE format(
        'ALTER TABLE "ops".%I ADD CONSTRAINT %I FOREIGN KEY ("signedOffById")
           REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE',
        t, t || '_signedOffById_fkey'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
      EXECUTE format(
        'ALTER TABLE "ops".%I ADD CONSTRAINT %I CHECK (
           ("signoffStatus" = ''signed_off'') = ("signedOffById" IS NOT NULL AND "signedOffAt" IS NOT NULL)
           AND ("signedOffById" IS NULL) = ("signedOffAt" IS NULL)
         )',
        t, t || '_signoff_consistent'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

COMMIT;
