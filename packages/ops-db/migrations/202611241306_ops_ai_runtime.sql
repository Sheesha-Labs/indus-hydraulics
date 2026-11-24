-- Indus Operations · S05-T01 · AI runtime: model prices, the monthly budget and its reservations (ADR-08, C14)
--
--   ops.ai_model_price   one row per (model, effectiveFrom): USD per million tokens for input, output, cache read,
--                        5-minute and 1-hour cache writes, and USD per thousand web searches. Prices are data, so
--                        a price change costs no deploy; every seeded row is 'awaiting' sign-off.
--   ops.ai_budget        one row per month (Asia/Dubai calendar month, keyed by its first day): the limit, the
--                        mode, what is spent and what is reserved by calls in flight.
--   ops.ai_reservation   one row per model call: the estimate reserved before the call and the actual cost
--                        settled after it.
--   ops.ai_budget_reserve(month, est, purpose, action) → reservation id, or NULL when refused. One conditional
--                        UPDATE, so two calls racing for the last dollars cannot both pass:
--                          hard_stop            spent + reserved + est <= limit, for every purpose;
--                          warn_pause_research  the same condition, but only for purpose 'research';
--                          warn_only            always passes (the 80 % and 100 % notices still fire).
--                        In every mode a single estimate above the whole month's limit is refused.
--                        A month without a row gets one from the `assistant.budget` setting first.
--   ops.ai_budget_settle(reservation, actual) moves the estimate out of reserved and the actual into spent, once.
--   ops.ai_budget_release_stale(older_than) settles at zero every reservation a crashed call left open.
--   ops.ai_call          + promptVersion, stopReason, effort, cacheWrite1hTokens, reservationId. Stays INSERT-only.
--
-- (decision) The plan names settings `ai.monthly_budget_usd` and `ai.budget_mode`. The limit already lives in
-- `assistant.budget` ({"monthlyUsd":150}, S03, awaiting sign-off), so the mode joins it there instead of a second
-- key holding the same number: {"monthlyUsd":150,"mode":"warn_pause_research"}.
--
-- The functions are SECURITY INVOKER with search_path pinned; ops_app holds the table privileges they use.

BEGIN;

-- ── Prices ────────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ops"."ai_model_price" (
    "model" TEXT NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "inputPerM" DECIMAL(12,4) NOT NULL,
    "outputPerM" DECIMAL(12,4) NOT NULL,
    "cacheReadPerM" DECIMAL(12,4) NOT NULL,
    "cacheWrite5mPerM" DECIMAL(12,4) NOT NULL,
    "cacheWrite1hPerM" DECIMAL(12,4) NOT NULL,
    "webSearchPerK" DECIMAL(12,4) NOT NULL DEFAULT 10,
    "signoffStatus" TEXT NOT NULL DEFAULT 'awaiting',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_model_price_pkey" PRIMARY KEY ("model", "effectiveFrom"),
    CONSTRAINT "ai_model_price_nonneg_check" CHECK (
      "inputPerM" >= 0 AND "outputPerM" >= 0 AND "cacheReadPerM" >= 0 AND
      "cacheWrite5mPerM" >= 0 AND "cacheWrite1hPerM" >= 0 AND "webSearchPerK" >= 0
    ),
    CONSTRAINT "ai_model_price_signoff_check" CHECK ("signoffStatus" IN ('awaiting', 'signed_off', 'not_required'))
);

-- Published first-party rates on 2026-11-01. Cache writes are 1.25× input (5 min) and 2× input (1 h);
-- cache reads 0.1× input; web search USD 10 per 1,000.
INSERT INTO "ops"."ai_model_price"
  ("model", "effectiveFrom", "inputPerM", "outputPerM", "cacheReadPerM", "cacheWrite5mPerM", "cacheWrite1hPerM", "webSearchPerK")
VALUES
  ('claude-opus-5-5',   '2026-11-01', 4.0000, 20.0000, 0.2000, 5.0000, 8.0000, 10.0000),
  ('claude-sonnet-5-5', '2026-11-01', 2.0000, 10.0000, 0.1000, 2.5000, 4.0000, 10.0000),
  ('claude-haiku-5-5',  '2026-11-01', 0.1000,  0.5000, 0.0100, 0.1250, 0.2000, 10.0000)
ON CONFLICT ("model", "effectiveFrom") DO NOTHING;

-- ── Budget ────────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ops"."ai_budget" (
    "month" DATE NOT NULL,
    "limitUsd" DECIMAL(12,4) NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'warn_pause_research',
    "spentUsd" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "reservedUsd" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "notified80At" TIMESTAMPTZ(3),
    "notified100At" TIMESTAMPTZ(3),
    "signoffStatus" TEXT NOT NULL DEFAULT 'awaiting',
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_budget_pkey" PRIMARY KEY ("month"),
    CONSTRAINT "ai_budget_month_check" CHECK (EXTRACT(DAY FROM "month") = 1),
    CONSTRAINT "ai_budget_mode_check" CHECK ("mode" IN ('warn_pause_research', 'hard_stop', 'warn_only')),
    CONSTRAINT "ai_budget_amounts_check" CHECK ("limitUsd" >= 0 AND "spentUsd" >= 0 AND "reservedUsd" >= 0),
    CONSTRAINT "ai_budget_signoff_check" CHECK ("signoffStatus" IN ('awaiting', 'signed_off', 'not_required'))
);

CREATE TABLE IF NOT EXISTS "ops"."ai_reservation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "month" DATE NOT NULL,
    "purpose" TEXT NOT NULL,
    "estUsd" DECIMAL(12,6) NOT NULL,
    "actionId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settledAt" TIMESTAMPTZ(3),
    "actualUsd" DECIMAL(12,6),
    CONSTRAINT "ai_reservation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ai_reservation_month_fkey" FOREIGN KEY ("month") REFERENCES "ops"."ai_budget"("month") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ai_reservation_action_fkey" FOREIGN KEY ("actionId") REFERENCES "ops"."assistant_action"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ai_reservation_amounts_check" CHECK ("estUsd" >= 0 AND ("actualUsd" IS NULL OR "actualUsd" >= 0))
);

CREATE INDEX IF NOT EXISTS "ai_reservation_open_idx" ON "ops"."ai_reservation"("createdAt") WHERE "settledAt" IS NULL;
CREATE INDEX IF NOT EXISTS "ai_reservation_month_idx" ON "ops"."ai_reservation"("month");

-- ── ai_call: the fields structured calls record ───────────────────────────────────────────
ALTER TABLE "ops"."ai_call"
  ADD COLUMN IF NOT EXISTS "promptVersion" TEXT,
  ADD COLUMN IF NOT EXISTS "stopReason" TEXT,
  ADD COLUMN IF NOT EXISTS "effort" TEXT,
  ADD COLUMN IF NOT EXISTS "cacheWrite1hTokens" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "reservationId" UUID;

-- ── The budget setting gains its mode (decision above) ────────────────────────────────────
UPDATE "ops"."settings_entry"
   SET "value" = "value" || '{"mode":"warn_pause_research"}'::jsonb
 WHERE "key" = 'assistant.budget' AND NOT ("value" ? 'mode');

INSERT INTO "ops"."settings_entry" ("key", "value", "version", "ownerOnly", "signoffStatus", "updatedAt")
VALUES ('assistant.budget', '{"monthlyUsd":150,"mode":"warn_pause_research"}', 0, true, 'awaiting', now())
ON CONFLICT ("key") DO NOTHING;

-- ── Functions ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION ops.ai_budget_ensure_month(p_month date)
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = ops, pg_temp
AS $$
  INSERT INTO ops.ai_budget ("month", "limitUsd", "mode", "signoffStatus", "updatedAt")
  SELECT p_month,
         COALESCE((s."value" ->> 'monthlyUsd')::numeric, 150),
         COALESCE(NULLIF(s."value" ->> 'mode', ''), 'warn_pause_research'),
         COALESCE(s."signoffStatus"::text, 'awaiting'),
         now()
    FROM (SELECT 1) AS one
    LEFT JOIN ops.settings_entry s ON s."key" = 'assistant.budget'
  ON CONFLICT ("month") DO NOTHING;
$$;

CREATE OR REPLACE FUNCTION ops.ai_budget_reserve(p_month date, p_est numeric, p_purpose text, p_action uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ops, pg_temp
AS $$
DECLARE
  v_month date;
  v_id uuid;
BEGIN
  IF p_est IS NULL OR p_est < 0 THEN
    RAISE EXCEPTION 'ai_budget_reserve: estimate must be zero or more';
  END IF;
  PERFORM ops.ai_budget_ensure_month(p_month);

  UPDATE ops.ai_budget b
     SET "reservedUsd" = b."reservedUsd" + p_est,
         "updatedAt" = now()
   WHERE b."month" = p_month
     -- One call estimated above the whole month's limit is refused in every mode.
     AND p_est <= b."limitUsd"
     AND (
       b."mode" = 'warn_only'
       OR (b."mode" = 'warn_pause_research' AND p_purpose <> 'research')
       OR b."spentUsd" + b."reservedUsd" + p_est <= b."limitUsd"
     )
  RETURNING b."month" INTO v_month;

  IF v_month IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO ops.ai_reservation ("month", "purpose", "estUsd", "actionId")
  VALUES (v_month, p_purpose, p_est, p_action)
  RETURNING "id" INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION ops.ai_budget_settle(p_reservation uuid, p_actual numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ops, pg_temp
AS $$
DECLARE
  v_month date;
  v_est numeric;
  v_actual numeric := GREATEST(COALESCE(p_actual, 0), 0);
BEGIN
  UPDATE ops.ai_reservation r
     SET "settledAt" = now(),
         "actualUsd" = v_actual
   WHERE r."id" = p_reservation AND r."settledAt" IS NULL
  RETURNING r."month", r."estUsd" INTO v_month, v_est;

  IF v_month IS NULL THEN
    RETURN; -- unknown or already settled: settling twice never double-counts
  END IF;

  UPDATE ops.ai_budget b
     SET "reservedUsd" = GREATEST(b."reservedUsd" - v_est, 0),
         "spentUsd" = b."spentUsd" + v_actual,
         "updatedAt" = now()
   WHERE b."month" = v_month;
END;
$$;

CREATE OR REPLACE FUNCTION ops.ai_budget_release_stale(p_older_than interval)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ops, pg_temp
AS $$
DECLARE
  r record;
  n integer := 0;
BEGIN
  FOR r IN
    SELECT "id" FROM ops.ai_reservation
     WHERE "settledAt" IS NULL AND "createdAt" < now() - p_older_than
     ORDER BY "createdAt"
     LIMIT 500
  LOOP
    PERFORM ops.ai_budget_settle(r."id", 0);
    n := n + 1;
  END LOOP;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION ops.ai_budget_ensure_month(date) FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.ai_budget_reserve(date, numeric, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.ai_budget_settle(uuid, numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.ai_budget_release_stale(interval) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ops.ai_budget_ensure_month(date) TO ops_app;
GRANT EXECUTE ON FUNCTION ops.ai_budget_reserve(date, numeric, text, uuid) TO ops_app;
GRANT EXECUTE ON FUNCTION ops.ai_budget_settle(uuid, numeric) TO ops_app;
GRANT EXECUTE ON FUNCTION ops.ai_budget_release_stale(interval) TO ops_app;

-- The current month's row (Asia/Dubai), from the setting.
SELECT ops.ai_budget_ensure_month(date_trunc('month', now() AT TIME ZONE 'Asia/Dubai')::date);

-- ── RLS, policies and grants ──────────────────────────────────────────────────────────────
DO $$
DECLARE
  t text;
  r text;
BEGIN
  FOREACH t IN ARRAY ARRAY['ai_model_price', 'ai_budget', 'ai_reservation'] LOOP
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

-- Prices change by inserting a new effectiveFrom row; reservations are settled, never deleted.
GRANT SELECT, INSERT, UPDATE ON "ops"."ai_model_price" TO ops_app;
GRANT SELECT, INSERT, UPDATE ON "ops"."ai_budget" TO ops_app;
GRANT SELECT, INSERT, UPDATE ON "ops"."ai_reservation" TO ops_app;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['ai_model_price', 'ai_budget', 'ai_reservation'] LOOP
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = format('ops.%I', t)::regclass) THEN
      RAISE EXCEPTION 'ops.% must have row-level security on', t;
    END IF;
  END LOOP;
  IF has_table_privilege('ops_app', 'ops.ai_call', 'UPDATE') THEN
    RAISE EXCEPTION 'ops.ai_call must stay INSERT-only for ops_app';
  END IF;
END $$;

COMMIT;
