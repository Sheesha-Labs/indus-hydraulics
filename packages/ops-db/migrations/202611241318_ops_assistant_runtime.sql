-- Indus Operations · S05-T02 · Assistant runtime: pause state, live counters, preference signals, action columns
--
--   ops.assistant_state     the single row (id = 1) behind "Pause everything" (boards 98, 102). Replaces the
--                           S04 interim settings row `assistant.paused`, whose value is carried over here.
--   ops.live_counter        key → value, one upsert per bump (the shell's live counts: mail.unsure, …).
--   ops.preference_signal   edits, rejections, Unsure choices, overrides and sent mail that later shape
--                           learned preferences (S06/S07 consume them).
--   ops.assistant_action    + basisHash, idempotencyKey (unique), origin, model, promptVersion, levelReasons,
--                           surface, version. The new proposal columns join the immutable set; `version` is
--                           bumped by the guard on every update (optimistic concurrency for Review).
--   ops.mail_message        + assistantNote, flags.
--
-- The setting `assistant.internal_undo_minutes` is seeded by …_ops_s05_settings_seed.sql.
--
-- Idempotent. RLS + ops_app policies and grants on the new tables.

BEGIN;

-- ── Pause state ───────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ops"."assistant_state" (
    "id" SMALLINT NOT NULL DEFAULT 1,
    "pausedAt" TIMESTAMPTZ(3),
    "pausedById" UUID,
    "pauseNote" TEXT,
    "resumedAt" TIMESTAMPTZ(3),
    "resumedById" UUID,
    "version" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "assistant_state_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "assistant_state_single_row" CHECK ("id" = 1),
    CONSTRAINT "assistant_state_paused_by_fkey" FOREIGN KEY ("pausedById") REFERENCES "ops"."user"("id") ON DELETE SET NULL,
    CONSTRAINT "assistant_state_resumed_by_fkey" FOREIGN KEY ("resumedById") REFERENCES "ops"."user"("id") ON DELETE SET NULL
);

INSERT INTO "ops"."assistant_state" ("id", "pausedAt", "pausedById")
SELECT 1,
       NULLIF(s."value" ->> 'pausedAt', '')::timestamptz,
       CASE WHEN (s."value" ->> 'pausedById') ~ '^[0-9a-f-]{36}$'
             AND EXISTS (SELECT 1 FROM "ops"."user" u WHERE u."id" = (s."value" ->> 'pausedById')::uuid)
            THEN (s."value" ->> 'pausedById')::uuid END
  FROM (SELECT 1) AS one
  LEFT JOIN "ops"."settings_entry" s ON s."key" = 'assistant.paused'
ON CONFLICT ("id") DO NOTHING;

-- ── Live counters ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ops"."live_counter" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "live_counter_pkey" PRIMARY KEY ("key"),
    CONSTRAINT "live_counter_key_check" CHECK ("key" ~ '^[a-z][a-z0-9_.:-]{0,119}$')
);

-- ── Preference signals ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ops"."preference_signal" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kind" TEXT NOT NULL,
    "actionId" UUID,
    "actionKey" TEXT,
    "companyId" UUID,
    "mailboxId" UUID,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "createdById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumedAt" TIMESTAMPTZ(3),
    CONSTRAINT "preference_signal_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "preference_signal_kind_check" CHECK ("kind" IN ('edit', 'reject', 'unsure_choice', 'override', 'sent_mail')),
    CONSTRAINT "preference_signal_action_fkey" FOREIGN KEY ("actionId") REFERENCES "ops"."assistant_action"("id") ON DELETE SET NULL,
    CONSTRAINT "preference_signal_company_fkey" FOREIGN KEY ("companyId") REFERENCES "ops"."company"("id") ON DELETE SET NULL,
    CONSTRAINT "preference_signal_mailbox_fkey" FOREIGN KEY ("mailboxId") REFERENCES "ops"."mailbox"("id") ON DELETE SET NULL,
    CONSTRAINT "preference_signal_created_by_fkey" FOREIGN KEY ("createdById") REFERENCES "ops"."user"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "preference_signal_open_idx"
  ON "ops"."preference_signal"("kind", "createdAt") WHERE "consumedAt" IS NULL;
CREATE INDEX IF NOT EXISTS "preference_signal_company_idx" ON "ops"."preference_signal"("companyId", "createdAt");

-- ── assistant_action: runner columns ──────────────────────────────────────────────────────
ALTER TABLE "ops"."assistant_action"
  ADD COLUMN IF NOT EXISTS "basisHash" TEXT,
  ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT,
  ADD COLUMN IF NOT EXISTS "origin" TEXT NOT NULL DEFAULT 'live',
  ADD COLUMN IF NOT EXISTS "model" TEXT,
  ADD COLUMN IF NOT EXISTS "promptVersion" TEXT,
  ADD COLUMN IF NOT EXISTS "levelReasons" JSONB,
  ADD COLUMN IF NOT EXISTS "surface" TEXT NOT NULL DEFAULT 'review',
  ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS "assistant_action_idempotencyKey_key" ON "ops"."assistant_action"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "assistant_action_surface_state_idx" ON "ops"."assistant_action"("surface", "state", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assistant_action_origin_check') THEN
    ALTER TABLE "ops"."assistant_action" ADD CONSTRAINT "assistant_action_origin_check"
      CHECK ("origin" IN ('live', 'backfill', 'import', 'manual'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'assistant_action_surface_check') THEN
    ALTER TABLE "ops"."assistant_action" ADD CONSTRAINT "assistant_action_surface_check"
      CHECK ("surface" IN ('review', 'mail_unsure', 'hint'));
  END IF;
END $$;

-- ── mail_message: the Assistant's note and detector flags ─────────────────────────────────
ALTER TABLE "ops"."mail_message"
  ADD COLUMN IF NOT EXISTS "assistantNote" TEXT,
  ADD COLUMN IF NOT EXISTS "flags" JSONB;

-- ── The guard: new immutable columns, version bump ────────────────────────────────────────
CREATE OR REPLACE FUNCTION ops.assistant_action_guard()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ops, pg_catalog
AS $$
DECLARE
  v_kind ops."ActorKind" := coalesce(nullif(current_setting('ops.actor_kind', true), ''), 'system')::ops."ActorKind";
  v_actor uuid := nullif(current_setting('ops.actor_id', true), '')::uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'assistant actions are never deleted (action %)', OLD."ref"
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW."ref" IS DISTINCT FROM OLD."ref"
       OR NEW."actionKey" IS DISTINCT FROM OLD."actionKey"
       OR NEW."levelAtTime" IS DISTINCT FROM OLD."levelAtTime"
       OR NEW."guardrails" IS DISTINCT FROM OLD."guardrails"
       OR NEW."enquiryId" IS DISTINCT FROM OLD."enquiryId"
       OR NEW."subjectType" IS DISTINCT FROM OLD."subjectType"
       OR NEW."subjectId" IS DISTINCT FROM OLD."subjectId"
       OR NEW."headline" IS DISTINCT FROM OLD."headline"
       OR NEW."reasons" IS DISTINCT FROM OLD."reasons"
       OR NEW."preview" IS DISTINCT FROM OLD."preview"
       OR NEW."checks" IS DISTINCT FROM OLD."checks"
       OR NEW."confidence" IS DISTINCT FROM OLD."confidence"
       OR NEW."inputs" IS DISTINCT FROM OLD."inputs"
       OR NEW."createdAt" IS DISTINCT FROM OLD."createdAt"
       -- S05-T02
       OR NEW."basisHash" IS DISTINCT FROM OLD."basisHash"
       OR NEW."idempotencyKey" IS DISTINCT FROM OLD."idempotencyKey"
       OR NEW."origin" IS DISTINCT FROM OLD."origin"
       OR NEW."model" IS DISTINCT FROM OLD."model"
       OR NEW."promptVersion" IS DISTINCT FROM OLD."promptVersion"
       OR NEW."levelReasons" IS DISTINCT FROM OLD."levelReasons"
       OR NEW."surface" IS DISTINCT FROM OLD."surface"
    THEN
      RAISE EXCEPTION 'assistant action %: proposal columns are immutable; create a new action instead', OLD."ref"
        USING ERRCODE = 'insufficient_privilege';
    END IF;
    NEW."version" := OLD."version" + 1;
    IF NEW."state" IS DISTINCT FROM OLD."state" THEN
      INSERT INTO ops.assistant_action_event ("actionId", "fromState", "toState", "actorKind", "actorId", "at")
      VALUES (NEW."id", OLD."state", NEW."state", v_kind, v_actor, now());
    END IF;
    RETURN NEW;
  END IF;

  -- AFTER INSERT
  INSERT INTO ops.assistant_action_event ("actionId", "fromState", "toState", "actorKind", "actorId", "at")
  VALUES (NEW."id", NULL, NEW."state", v_kind, v_actor, now());
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION ops.assistant_action_guard() FROM PUBLIC;

-- ── RLS, policies and grants ──────────────────────────────────────────────────────────────
DO $$
DECLARE
  t text;
  r text;
BEGIN
  FOREACH t IN ARRAY ARRAY['assistant_state', 'live_counter', 'preference_signal'] LOOP
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

-- The single pause row is updated, never inserted or deleted by the app.
GRANT SELECT, UPDATE ON "ops"."assistant_state" TO ops_app;
GRANT SELECT, INSERT, UPDATE ON "ops"."live_counter" TO ops_app;
GRANT SELECT, INSERT, UPDATE ON "ops"."preference_signal" TO ops_app;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['assistant_state', 'live_counter', 'preference_signal'] LOOP
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = format('ops.%I', t)::regclass) THEN
      RAISE EXCEPTION 'ops.% must have row-level security on', t;
    END IF;
  END LOOP;
  IF (SELECT count(*) FROM ops.assistant_state) <> 1 THEN
    RAISE EXCEPTION 'ops.assistant_state must hold exactly one row';
  END IF;
END $$;

COMMIT;
