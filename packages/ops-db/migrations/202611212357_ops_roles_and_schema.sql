-- Indus Operations · migration 1 of 8 · roles and schema
--
-- Creates the two Ops login roles and the `ops` schema (06-map-schema.md §3, ADR-03, ADR-04, C3).
--
--   ops_app    the runtime role (apps/ops, Inngest). NOINHERIT, CONNECTION LIMIT 15,
--              search_path ops, 15 s statement timeout. No privilege on any public table.
--   ops_maint  retention purges and the mailbox purge. NOINHERIT, CONNECTION LIMIT 2,
--              120 s statement timeout.
--
-- NO PASSWORD IS SET HERE. The repository is public. Passwords are set out of band
-- (`ALTER ROLE ops_app PASSWORD ...` in the Supabase SQL editor) and stored only in the Ops
-- Vercel project's env. scripts/apply-local.sh sets a local-only one for Docker Postgres.
--
-- Supabase's API roles (anon, authenticated, service_role) are referenced only inside DO
-- blocks that check pg_roles first, so this file also runs on plain Postgres (local, CI).
--
-- Idempotent: roles are created only when absent and their attributes re-asserted; the
-- schema is IF NOT EXISTS; REVOKE / GRANT / ALTER ROLE SET converge on every run.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ops_app') THEN
    CREATE ROLE ops_app LOGIN NOINHERIT CONNECTION LIMIT 15;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ops_maint') THEN
    CREATE ROLE ops_maint LOGIN NOINHERIT CONNECTION LIMIT 2;
  END IF;
END $$;

-- Re-assert the attributes on every run, so a role created by hand converges.
ALTER ROLE ops_app LOGIN NOINHERIT CONNECTION LIMIT 15;
ALTER ROLE ops_maint LOGIN NOINHERIT CONNECTION LIMIT 2;

-- Per-role session defaults. These hold for every connection the role opens, through the
-- pooler or directly, so a slow query cannot pin a pooled backend (ADR-04).
ALTER ROLE ops_app SET search_path = ops;
ALTER ROLE ops_app SET statement_timeout = '15s';
ALTER ROLE ops_app SET lock_timeout = '5s';
ALTER ROLE ops_app SET idle_in_transaction_session_timeout = '30s';

ALTER ROLE ops_maint SET search_path = ops;
ALTER ROLE ops_maint SET statement_timeout = '120s';
ALTER ROLE ops_maint SET lock_timeout = '5s';
ALTER ROLE ops_maint SET idle_in_transaction_session_timeout = '30s';

CREATE SCHEMA IF NOT EXISTS ops AUTHORIZATION postgres;

-- Nobody but the two Ops roles may even look inside the schema. It is never exposed to
-- PostgREST, and anon / authenticated have no USAGE on it (06 §3.3).
REVOKE ALL ON SCHEMA ops FROM PUBLIC;
DO $$
DECLARE
  r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON SCHEMA ops FROM %I', r);
    END IF;
  END LOOP;
END $$;

GRANT USAGE ON SCHEMA ops TO ops_app, ops_maint;

-- Defence in depth for objects postgres creates in ops later. Per-schema default privileges
-- can only ADD to global ones, so these revokes cannot undo a global default grant; that is why
-- migrations 5 and 7 also revoke explicitly on every function and table they create.
ALTER DEFAULT PRIVILEGES IN SCHEMA ops REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA ops REVOKE ALL ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA ops REVOKE ALL ON SEQUENCES FROM PUBLIC;
DO $$
DECLARE
  r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA ops REVOKE ALL ON TABLES FROM %I', r);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA ops REVOKE ALL ON FUNCTIONS FROM %I', r);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA ops REVOKE ALL ON SEQUENCES FROM %I', r);
    END IF;
  END LOOP;
END $$;

-- Assertion: the Ops roles hold no privilege on any website table. The website's tables are
-- read only through the views in migration 6 and two SECURITY DEFINER functions in migration 5.
DO $$
DECLARE
  bad text;
BEGIN
  SELECT string_agg(format('%s on public.%I', r.rolname, c.relname), ', ')
    INTO bad
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    CROSS JOIN (VALUES ('ops_app'), ('ops_maint')) AS r(rolname)
   WHERE n.nspname = 'public'
     AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
     AND has_table_privilege(r.rolname, c.oid, 'SELECT,INSERT,UPDATE,DELETE');
  IF bad IS NOT NULL THEN
    RAISE EXCEPTION 'Ops roles must hold no privilege on public tables: %', bad;
  END IF;
END $$;

COMMIT;
