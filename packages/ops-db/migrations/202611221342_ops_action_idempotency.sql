-- Indus Operations · S02-T08 · action idempotency
--
-- Architecture §4.10 and 05-map-frontend §7.2: approve, send and pay actions carry an
-- idempotency key (`<action name>:<proposalId>:<version>`), and a repeated call returns the
-- first call's result instead of running again. `defineAction` (apps/ops/src/lib/define-action.ts)
-- reads this table before it runs a handler and writes the handler's result here in the same
-- transaction as the handler's own writes.
--
--   key        the full idempotency key, primary key (a second INSERT is ON CONFLICT DO NOTHING)
--   action     the action name, for the log and for purging by action
--   userId     who ran it (FK to ops."user")
--   result     the stored Result JSON returned to every replay
--   expiresAt  createdAt + 24 h; an expired row is deleted and replaced on the next call
--
-- Grants: ops_app may SELECT, INSERT and DELETE, never UPDATE: a stored result is never
-- rewritten. Migration 7 (`…_ops_rls_and_grants.sql`) grants SELECT, INSERT, UPDATE, DELETE on
-- every table it finds, so when the files are re-applied in order (apply-local.sh) it would
-- hand UPDATE back; the explicit REVOKE below converges it again.
--
-- Idempotent: CREATE … IF NOT EXISTS, the foreign key and policy only when absent, GRANT and
-- REVOKE converge.

BEGIN;

CREATE TABLE IF NOT EXISTS "ops"."action_idempotency" (
    "key" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT now(),
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "action_idempotency_pkey" PRIMARY KEY ("key")
);

CREATE INDEX IF NOT EXISTS "action_idempotency_expiresAt_idx"
  ON "ops"."action_idempotency"("expiresAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'action_idempotency_userId_fkey'
       AND conrelid = 'ops.action_idempotency'::regclass
  ) THEN
    ALTER TABLE "ops"."action_idempotency"
      ADD CONSTRAINT "action_idempotency_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "ops"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- ── RLS and the ops_app policy (the shape of migration 7) ───────────────────────────────
ALTER TABLE "ops"."action_idempotency" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'ops' AND tablename = 'action_idempotency' AND policyname = 'ops_app_all'
  ) THEN
    CREATE POLICY ops_app_all ON "ops"."action_idempotency"
      AS PERMISSIVE FOR ALL TO ops_app USING (true) WITH CHECK (true);
  END IF;
END $$;

GRANT SELECT, INSERT, DELETE ON "ops"."action_idempotency" TO ops_app;
REVOKE UPDATE, TRUNCATE, REFERENCES, TRIGGER ON "ops"."action_idempotency" FROM ops_app;

-- ── Nothing for PUBLIC or the Supabase API roles ────────────────────────────────────────
REVOKE ALL ON "ops"."action_idempotency" FROM PUBLIC;
DO $$
DECLARE
  r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON ops.action_idempotency FROM %I', r);
    END IF;
  END LOOP;
END $$;

-- ── Assertions ──────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid = 'ops.action_idempotency'::regclass) THEN
    RAISE EXCEPTION 'ops.action_idempotency must have row-level security on';
  END IF;
  -- has_table_privilege with a list is true if ANY one is held, so each is checked alone.
  IF NOT (has_table_privilege('ops_app', 'ops.action_idempotency', 'SELECT')
          AND has_table_privilege('ops_app', 'ops.action_idempotency', 'INSERT')
          AND has_table_privilege('ops_app', 'ops.action_idempotency', 'DELETE')) THEN
    RAISE EXCEPTION 'ops_app must be able to SELECT, INSERT and DELETE ops.action_idempotency';
  END IF;
  IF has_table_privilege('ops_app', 'ops.action_idempotency', 'UPDATE') THEN
    RAISE EXCEPTION 'ops_app must not be able to UPDATE ops.action_idempotency';
  END IF;
END $$;

COMMIT;
