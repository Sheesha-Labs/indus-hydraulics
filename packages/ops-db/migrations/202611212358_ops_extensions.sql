-- Indus Operations · migration 2 of 8 · extensions
--
-- pg_trgm backs the "did you mean" part and company lookups (06 §7). Production already has
-- it (packages/db/migrations/202605021638_seo_fts.sql installed it in schema public), so on
-- Supabase this file only asserts it and records where it lives.
--
-- It is created here only when absent: in schema `extensions` when that schema exists
-- (Supabase's convention for new extensions), otherwise in `public` (plain Postgres).
--
-- Each migration file is a separate execution, so nothing is passed to later files through a
-- session setting. Migrations 3 and 4 look the schema up themselves:
--   SELECT extnamespace::regnamespace FROM pg_extension WHERE extname = 'pg_trgm'
-- and qualify the operator class with format('%I.gin_trgm_ops', ...).
--
-- No `vector` extension (06 S11). gen_random_uuid() is core since Postgres 13.

BEGIN;

DO $$
DECLARE
  trgm_schema text;
BEGIN
  IF current_setting('server_version_num')::int < 130000 THEN
    RAISE EXCEPTION 'Ops needs Postgres 13 or later (gen_random_uuid in core)';
  END IF;

  SELECT extnamespace::regnamespace::text INTO trgm_schema
    FROM pg_extension WHERE extname = 'pg_trgm';

  IF trgm_schema IS NULL THEN
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'extensions') THEN
      CREATE EXTENSION pg_trgm WITH SCHEMA extensions;
    ELSE
      CREATE EXTENSION pg_trgm WITH SCHEMA public;
    END IF;
    SELECT extnamespace::regnamespace::text INTO trgm_schema
      FROM pg_extension WHERE extname = 'pg_trgm';
  END IF;

  IF trgm_schema IS NULL THEN
    RAISE EXCEPTION 'pg_trgm is not installed and could not be created';
  END IF;

  -- Calling similarity() from ops_app needs USAGE on the extension's schema. A dedicated
  -- extensions schema holds only functions, so USAGE there grants no data. Schema public is
  -- deliberately left alone: ops_app holds no rights there beyond what PUBLIC already has.
  IF trgm_schema <> 'public' THEN
    EXECUTE format('GRANT USAGE ON SCHEMA %I TO ops_app, ops_maint', trgm_schema);
  ELSIF NOT has_schema_privilege('ops_app', 'public', 'USAGE') THEN
    RAISE NOTICE 'ops_app has no USAGE on schema public, so similarity() must be called schema-qualified by a role that has it';
  END IF;

  EXECUTE format(
    'COMMENT ON SCHEMA ops IS %L',
    'Indus Operations (packages/ops-db). Owned by postgres, used by ops_app and ops_maint with RLS on. '
      || 'pg_trgm lives in schema ' || trgm_schema || '; migrations look it up from pg_extension.'
  );
END $$;

COMMIT;
