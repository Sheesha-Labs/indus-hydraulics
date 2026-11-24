-- Indus Operations · S07-T01 / T02 / T03 / T05 · Autopilot learning, guardrail triggers and defaults
--
--   guardrail_trigger           one row per guardrail that fired on an Assistant run (board 100 counters and
--                               "Last triggered"); append-only for ops_app. Index (guardrailKey, at).
--   autopilot_suggestion        earned suggestions ("You approved the last 25 … Switch to Do and tell?"), one
--                               open row per action (partial unique index); the nightly job upserts them.
--   preference                  + actionKey, createdFrom (reject | edit | unsure_choice | override | sent_mail
--                               | manual), strength (occurrences), disabledAt (the board 115 on/off switch).
--   preference_learn_batch      one Message Batches submission of the nightly learner (status, signal ids,
--                               the groups sent, errors).
--   autopilot_setting           + signoffStatus / signedOffById / signedOffAt (ADR-28), 'awaiting' until the
--                               Owner saves the row; autopilot_action_def rows flagged 'awaiting' likewise.
--   guardrail                   the S00 skeleton rows get their values (S07-T03, awaiting sign-off): the
--                               single value_threshold row becomes value_threshold_quotation (AED 200,000) and
--                               value_threshold_rfq (USD 50,000) is added; every row is enabled; rows the
--                               Owner has signed off are never overwritten.
--   email_template              'supplier_chaser' wording (P04, awaiting sign-off), previewed on board 99.
--   autopilot_action_def        minutesSaved defaults (classify 0.5, extract 6, RFQ 12, chaser 3, capture 8),
--                               awaiting sign-off, where the Owner has not confirmed the row.
--
-- Idempotent: IF NOT EXISTS, ON CONFLICT DO NOTHING, updates guarded by signoffStatus <> 'signed_off'.

BEGIN;

-- ── guardrail_trigger ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ops"."guardrail_trigger" (
  "id"           uuid          NOT NULL DEFAULT gen_random_uuid(),
  "guardrailKey" text          NOT NULL,
  "actionId"     uuid,
  "actionKey"    text          NOT NULL,
  "effect"       text          NOT NULL DEFAULT 'ask' CHECK ("effect" IN ('ask', 'queue', 'block')),
  "text"         text          NOT NULL DEFAULT '',
  "at"           timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "guardrail_trigger_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "ops"."guardrail_trigger" ADD CONSTRAINT "guardrail_trigger_actionId_fkey"
    FOREIGN KEY ("actionId") REFERENCES "ops"."assistant_action"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS "guardrail_trigger_guardrailKey_at_idx"
  ON "ops"."guardrail_trigger" ("guardrailKey", "at");
CREATE INDEX IF NOT EXISTS "guardrail_trigger_at_idx" ON "ops"."guardrail_trigger" ("at" DESC);

-- ── autopilot_suggestion ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ops"."autopilot_suggestion" (
  "id"             uuid                    NOT NULL DEFAULT gen_random_uuid(),
  "actionKey"      text                    NOT NULL,
  "kind"           text                    NOT NULL DEFAULT 'earned' CHECK ("kind" = 'earned'),
  "fromLevel"      "ops"."AutopilotLevel"  NOT NULL,
  "toLevel"        "ops"."AutopilotLevel"  NOT NULL,
  "streak"         integer                 NOT NULL,
  "evidence"       jsonb                   NOT NULL DEFAULT '{}',
  "createdAt"      timestamptz(3)          NOT NULL DEFAULT now(),
  "dismissedUntil" timestamptz(3),
  "acceptedAt"     timestamptz(3),
  "acceptedById"   uuid,
  CONSTRAINT "autopilot_suggestion_pkey" PRIMARY KEY ("id")
);
DO $$ BEGIN
  ALTER TABLE "ops"."autopilot_suggestion" ADD CONSTRAINT "autopilot_suggestion_actionKey_fkey"
    FOREIGN KEY ("actionKey") REFERENCES "ops"."autopilot_action_def"("key") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."autopilot_suggestion" ADD CONSTRAINT "autopilot_suggestion_acceptedById_fkey"
    FOREIGN KEY ("acceptedById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS "autopilot_suggestion_open_key"
  ON "ops"."autopilot_suggestion" ("actionKey") WHERE "acceptedAt" IS NULL;

-- ── preference ────────────────────────────────────────────────────────────────────────────
ALTER TABLE "ops"."preference"
  ADD COLUMN IF NOT EXISTS "actionKey"   text,
  ADD COLUMN IF NOT EXISTS "createdFrom" text,
  ADD COLUMN IF NOT EXISTS "strength"    integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "disabledAt"  timestamptz(3),
  ADD COLUMN IF NOT EXISTS "createdById" uuid;
DO $$ BEGIN
  ALTER TABLE "ops"."preference" ADD CONSTRAINT "preference_createdFrom_check"
    CHECK ("createdFrom" IS NULL OR "createdFrom" IN ('reject', 'edit', 'unsure_choice', 'override', 'sent_mail', 'manual'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS "preference_actionKey_idx" ON "ops"."preference" ("actionKey") WHERE "disabledAt" IS NULL;
CREATE INDEX IF NOT EXISTS "preference_signal_unconsumed_idx"
  ON "ops"."preference_signal" ("createdAt") WHERE "consumedAt" IS NULL;

-- ── preference_learn_batch ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ops"."preference_learn_batch" (
  "id"               uuid           NOT NULL DEFAULT gen_random_uuid(),
  "anthropicBatchId" text,
  "status"           text           NOT NULL DEFAULT 'submitted'
                     CHECK ("status" IN ('submitted', 'in_progress', 'ended', 'failed', 'applied')),
  "signalIds"        uuid[]         NOT NULL DEFAULT '{}',
  "groups"           jsonb          NOT NULL DEFAULT '[]',
  "submittedAt"      timestamptz(3) NOT NULL DEFAULT now(),
  "endedAt"          timestamptz(3),
  "error"            text,
  CONSTRAINT "preference_learn_batch_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "preference_learn_batch_anthropicBatchId_key"
  ON "ops"."preference_learn_batch" ("anthropicBatchId");
CREATE INDEX IF NOT EXISTS "preference_learn_batch_open_idx"
  ON "ops"."preference_learn_batch" ("submittedAt") WHERE "status" IN ('submitted', 'in_progress', 'ended');

-- ── sign-off on autopilot_setting (ADR-28) ────────────────────────────────────────────────
ALTER TABLE "ops"."autopilot_setting"
  ADD COLUMN IF NOT EXISTS "signoffStatus" "ops"."SignoffStatus" NOT NULL DEFAULT 'awaiting',
  ADD COLUMN IF NOT EXISTS "signedOffById" uuid,
  ADD COLUMN IF NOT EXISTS "signedOffAt"   timestamptz(3);
DO $$ BEGIN
  ALTER TABLE "ops"."autopilot_setting" ADD CONSTRAINT "autopilot_setting_signedOffById_fkey"
    FOREIGN KEY ("signedOffById") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."autopilot_setting" ADD CONSTRAINT "autopilot_setting_signoff_consistent" CHECK (
    ("signoffStatus" = 'signed_off') = ("signedOffById" IS NOT NULL AND "signedOffAt" IS NOT NULL)
    AND ("signedOffById" IS NULL) = ("signedOffAt" IS NULL)
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
ALTER TABLE "ops"."guardrail"
  ADD COLUMN IF NOT EXISTS "signoffStatus" "ops"."SignoffStatus" NOT NULL DEFAULT 'awaiting';
ALTER TABLE "ops"."autopilot_action_def"
  ADD COLUMN IF NOT EXISTS "signoffStatus" "ops"."SignoffStatus" NOT NULL DEFAULT 'awaiting';

UPDATE "ops"."autopilot_action_def" SET "signoffStatus" = 'awaiting'
 WHERE "signoffStatus" = 'not_required';

-- ── minutes saved per task (P04, awaiting sign-off) ────────────────────────────────────────
UPDATE "ops"."autopilot_action_def" d SET "minutesSaved" = v.m
  FROM (VALUES ('classify_mail', 0.5), ('extract_lines', 6), ('send_supplier_rfqs', 12),
               ('chase_suppliers', 3), ('capture_supplier_quotes', 8)) AS v(k, m)
 WHERE d."key" = v.k AND d."minutesSaved" IS NULL AND d."signoffStatus" <> 'signed_off';

-- ── guardrail values (S07-T03, awaiting sign-off) ─────────────────────────────────────────
UPDATE "ops"."guardrail" SET "key" = 'value_threshold_quotation'
 WHERE "key" = 'value_threshold'
   AND NOT EXISTS (SELECT 1 FROM "ops"."guardrail" WHERE "key" = 'value_threshold_quotation');

INSERT INTO "ops"."guardrail" ("key", "kind", "label", "enabled", "fixed", "params", "signoffStatus", "updatedAt") VALUES
  ('value_threshold_quotation', 'value_threshold', 'Client quotation above a value always asks', true, false,
   '{"appliesTo":"quotation","currency":"AED","amount":200000}', 'awaiting', now()),
  ('value_threshold_rfq', 'value_threshold', 'Supplier RFQ above a value always asks', true, false,
   '{"appliesTo":"rfq","currency":"USD","amount":50000}', 'awaiting', now())
ON CONFLICT ("key") DO NOTHING;

UPDATE "ops"."guardrail" g SET
    "label" = v.label, "enabled" = true, "fixed" = v.fixed, "params" = v.params::jsonb,
    "signoffStatus" = CASE WHEN v.fixed THEN 'not_required'::"ops"."SignoffStatus" ELSE 'awaiting'::"ops"."SignoffStatus" END,
    "updatedAt" = now()
  FROM (VALUES
    ('value_threshold_quotation', 'Client quotation above a value always asks', false, '{"appliesTo":"quotation","currency":"AED","amount":200000}'),
    ('value_threshold_rfq', 'Supplier RFQ above a value always asks', false, '{"appliesTo":"rfq","currency":"USD","amount":50000}'),
    ('first_contact', 'First email to anyone new asks', false, '{}'),
    ('margin_floor', 'Below the margin floor asks', false, '{"floorPct":12,"hardMinPct":5}'),
    ('credit_hold', 'Client on credit hold asks', false, '{}'),
    ('working_hours', 'Outside working hours, queue until', false, '{"days":[1,2,3,4,5],"start":"09:00","end":"18:00","queueUntil":"08:30"}'),
    ('holiday_calendar', 'Holiday calendar', false, '{"country":"AE","ramadanStart":"10:00","ramadanEnd":"15:00"}'),
    ('daily_send_cap', 'Daily send cap per mailbox', false, '{}'),
    ('ai_budget', 'AI budget', false, '{}'),
    ('research_cap', 'Research cap per enquiry', false, '{"perEnquiryUsd":5}'),
    ('fixed_client_prices', 'Client prices are never sent without your approval', true, '{}'),
    ('fixed_no_money', 'The Assistant never moves money', true, '{}')
  ) AS v(key, label, fixed, params)
 WHERE g."key" = v.key AND g."signoffStatus" <> 'signed_off'
   AND (g."params" = '{}'::jsonb OR g."key" IN ('value_threshold_quotation', 'value_threshold_rfq')
        OR g."fixed" <> v.fixed OR NOT g."enabled");

-- ── supplier chaser wording (P04, awaiting sign-off): board 99 previews it ─────────────────
INSERT INTO "ops"."email_template"
  ("key", "label", "mailboxRole", "subjectTemplate", "bodyTemplate", "variables", "signoffStatus", "updatedAt")
VALUES
  ('supplier_chaser', 'Supplier chaser', 'supplier', 'RE: RFQ {rfq_ref} — reminder',
   E'Dear {supplier_contact},\n\nA reminder about our RFQ {rfq_ref}: we would welcome your offer by {reply_by}. If you will not be quoting, a short reply would help us plan.\n\nKind regards,\n{sender_name}',
   ARRAY['rfq_ref', 'supplier_contact', 'reply_by', 'sender_name'], 'awaiting', now())
ON CONFLICT ("key") DO NOTHING;

-- ── RLS, policies and grants ──────────────────────────────────────────────────────────────
DO $$
DECLARE
  t text;
  r text;
BEGIN
  FOREACH t IN ARRAY ARRAY['guardrail_trigger', 'autopilot_suggestion', 'preference_learn_batch'] LOOP
    EXECUTE format('ALTER TABLE ops.%I ENABLE ROW LEVEL SECURITY', t);
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'ops' AND tablename = t AND policyname = 'ops_app_all'
    ) THEN
      EXECUTE format(
        'CREATE POLICY ops_app_all ON ops.%I AS PERMISSIVE FOR ALL TO ops_app USING (true) WITH CHECK (true)', t);
    END IF;
    EXECUTE format('REVOKE ALL ON ops.%I FROM PUBLIC', t);
    FOREACH r IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
        EXECUTE format('REVOKE ALL ON ops.%I FROM %I', t, r);
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Triggers are a counter's history: written once, never changed. Suggestions and batches move state.
GRANT SELECT, INSERT ON "ops"."guardrail_trigger" TO ops_app;
GRANT SELECT, INSERT, UPDATE ON "ops"."autopilot_suggestion" TO ops_app;
GRANT SELECT, INSERT, UPDATE ON "ops"."preference_learn_batch" TO ops_app;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ops_maint') THEN
    GRANT SELECT, DELETE ON "ops"."guardrail_trigger" TO ops_maint;
  END IF;
END $$;

COMMIT;
