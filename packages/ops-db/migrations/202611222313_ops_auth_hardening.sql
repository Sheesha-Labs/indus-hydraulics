-- Indus Operations · S03-T01 / S03-T02 · auth hardening
--
-- Board 77 (password + TOTP fallback, lockout, reset) and board 84 (devices) need:
--
--   ops.rate_limit_counter     fixed-window counters, one row per (key, windowStart). Keys are
--                              opaque strings built by apps/ops/src/lib/rate-limit.ts, e.g.
--                              `signin-ip:<ipHash>`, `reset-email:<sha256(email)>`,
--                              `totp-user:<userId>`. No address or email is ever stored raw.
--   ops.hit_rate_limit(key, window_seconds, max)
--                              atomic upsert of the current window's counter; returns TRUE while
--                              the hit is within the limit (count <= max) and FALSE once it is
--                              over. SECURITY INVOKER, so ops_app's own grants and RLS apply.
--   "rate_limit_counter_windowStart_idx"
--                              lets the nightly purge (ops_maint) delete old windows by range.
--   user."passwordHistory"     Argon2id hashes of the last five passwords (reuse check).
--   user."passwordSetAt"       when the current password was set.
--   user."totpLastStep"        the last accepted TOTP time step: a code whose step is not
--                              greater is a replay and is refused (UPDATE … WHERE guard).
--   user_session."deviceHash"  keyed hash of the device (S03-T02, Devices list).
--   user_session."revokedById" who signed the session out (actor column, FK to ops."user").
--   user_session."revokeReason" 'password_reset' | 'signed_out_by_owner' | … (open vocabulary).
--   "user_session_revokedAt_idx" partial index: the proxy's revocation lookup reads revoked rows only.
--
-- RLS + ops_app_all on the new table (the shape of migration 7); ops_maint may SELECT and DELETE
-- it (retention purge). Nothing for PUBLIC or the Supabase API roles.
--
-- Idempotent: IF NOT EXISTS everywhere, CREATE OR REPLACE for the function, the foreign key and
-- policies only when absent, GRANT / REVOKE converge.

BEGIN;

-- ── Rate limits ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ops"."rate_limit_counter" (
    "key" TEXT NOT NULL,
    "windowStart" TIMESTAMPTZ(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "rate_limit_counter_pkey" PRIMARY KEY ("key", "windowStart")
);

CREATE INDEX IF NOT EXISTS "rate_limit_counter_windowStart_idx"
  ON "ops"."rate_limit_counter"("windowStart");

CREATE OR REPLACE FUNCTION ops.hit_rate_limit(p_key text, p_window_seconds int, p_max int)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = ops
AS $$
DECLARE
  v_window timestamptz(3);
  v_count int;
BEGIN
  IF p_key IS NULL OR length(p_key) = 0 OR p_window_seconds <= 0 OR p_max < 0 THEN
    RAISE EXCEPTION 'hit_rate_limit: invalid arguments';
  END IF;
  v_window := to_timestamp(
    floor(extract(epoch FROM clock_timestamp()) / p_window_seconds) * p_window_seconds
  );
  INSERT INTO ops.rate_limit_counter AS c ("key", "windowStart", "count")
  VALUES (p_key, v_window, 1)
  ON CONFLICT ("key", "windowStart") DO UPDATE SET "count" = c."count" + 1
  RETURNING c."count" INTO v_count;
  RETURN v_count <= p_max;
END;
$$;

REVOKE ALL ON FUNCTION ops.hit_rate_limit(text, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ops.hit_rate_limit(text, int, int) TO ops_app;

-- ── user: password history, password age, TOTP replay guard ────────────────────────────
ALTER TABLE "ops"."user" ADD COLUMN IF NOT EXISTS "passwordHistory" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "ops"."user" ADD COLUMN IF NOT EXISTS "passwordSetAt" TIMESTAMPTZ(3);
ALTER TABLE "ops"."user" ADD COLUMN IF NOT EXISTS "totpLastStep" BIGINT;

-- ── user_session: device and revocation (S03-T02) ──────────────────────────────────────
ALTER TABLE "ops"."user_session" ADD COLUMN IF NOT EXISTS "deviceHash" TEXT;
ALTER TABLE "ops"."user_session" ADD COLUMN IF NOT EXISTS "revokedById" UUID;
ALTER TABLE "ops"."user_session" ADD COLUMN IF NOT EXISTS "revokeReason" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'user_session_revokedById_fkey'
       AND conrelid = 'ops.user_session'::regclass
  ) THEN
    ALTER TABLE "ops"."user_session"
      ADD CONSTRAINT "user_session_revokedById_fkey"
      FOREIGN KEY ("revokedById") REFERENCES "ops"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "user_session_revokedAt_idx"
  ON "ops"."user_session"("revokedAt") WHERE "revokedAt" IS NOT NULL;

-- ── RLS, policies and grants on the new table ──────────────────────────────────────────
ALTER TABLE "ops"."rate_limit_counter" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'ops' AND tablename = 'rate_limit_counter' AND policyname = 'ops_app_all'
  ) THEN
    CREATE POLICY ops_app_all ON "ops"."rate_limit_counter"
      AS PERMISSIVE FOR ALL TO ops_app USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'ops' AND tablename = 'rate_limit_counter' AND policyname = 'ops_maint_all'
  ) THEN
    CREATE POLICY ops_maint_all ON "ops"."rate_limit_counter"
      AS PERMISSIVE FOR ALL TO ops_maint USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON "ops"."rate_limit_counter" TO ops_app;
GRANT SELECT, DELETE ON "ops"."rate_limit_counter" TO ops_maint;

REVOKE ALL ON "ops"."rate_limit_counter" FROM PUBLIC;
DO $$
DECLARE
  r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON ops.rate_limit_counter FROM %I', r);
      EXECUTE format('REVOKE ALL ON FUNCTION ops.hit_rate_limit(text, int, int) FROM %I', r);
    END IF;
  END LOOP;
END $$;

-- ── Assertions ──────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'ops.rate_limit_counter'::regclass) THEN
    RAISE EXCEPTION 'ops.rate_limit_counter must have row-level security on';
  END IF;
  IF NOT has_function_privilege('ops_app', 'ops.hit_rate_limit(text, int, int)', 'EXECUTE') THEN
    RAISE EXCEPTION 'ops_app must be able to execute ops.hit_rate_limit';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'ops' AND p.proname = 'hit_rate_limit' AND p.prosecdef
  ) THEN
    RAISE EXCEPTION 'ops.hit_rate_limit must be SECURITY INVOKER';
  END IF;
END $$;

COMMIT;
