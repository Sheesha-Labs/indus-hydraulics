-- Ops schema verification (06-map-schema.md §11 "Verification after applying").
--
-- Run AS ops_app, after the migrations:
--   (cd packages/ops-db && bunx prisma db execute --url "<ops_app url>" --file sql/verify.sql)
--
-- Every check is a DO block that RAISEs on failure, so the command exits non-zero on the first
-- failed check. The whole file runs inside BEGIN … ROLLBACK and leaves nothing behind: the
-- number allocated below is rolled back with everything else.

BEGIN;

-- 1. It really is ops_app (the checks below mean nothing as postgres, which bypasses RLS).
DO $$
BEGIN
  IF current_user <> 'ops_app' THEN
    RAISE EXCEPTION 'verify.sql must run as ops_app, not %', current_user;
  END IF;
END $$;

-- 2. anon has no USAGE on ops (skipped on plain Postgres without Supabase roles).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    IF has_schema_privilege('anon', 'ops', 'USAGE') THEN
      RAISE EXCEPTION 'anon has USAGE on schema ops';
    END IF;
  ELSE
    RAISE NOTICE 'anon does not exist here; USAGE check skipped';
  END IF;
END $$;

-- 3. The catalogue views answer for ops_app.
DO $$
DECLARE
  n bigint;
BEGIN
  SELECT count(*) INTO n FROM ops.catalogue_product_v;
  IF n < 0 THEN
    RAISE EXCEPTION 'catalogue_product_v count is negative';
  END IF;
  PERFORM count(*) FROM ops.catalogue_variant_v;
  PERFORM count(*) FROM ops.catalogue_cross_ref_v;
END $$;

-- 4. A structural sequence allocates its first number on an empty counter.
DO $$
DECLARE
  v_scope text := to_char(now(), 'YY-MM-DD');
  v_expected text := 'A-' || to_char(now(), 'YY-MM-DD') || '-0001';
  v_got text;
BEGIN
  IF EXISTS (
    SELECT 1 FROM ops.number_counter WHERE "sequenceKey" = 'assistant_action' AND "scope" = v_scope
  ) THEN
    -- A real action was numbered today, so the counter is not empty: check the format only.
    SELECT formatted INTO v_got FROM ops.allocate_number('assistant_action', v_scope);
    IF v_got !~ ('^A-' || v_scope || '-\d{4,}$') THEN
      RAISE EXCEPTION 'allocate_number(assistant_action) returned %, expected A-%-nnnn', v_got, v_scope;
    END IF;
    RAISE NOTICE 'assistant_action already had a counter for %; checked the format (%), not 0001', v_scope, v_got;
    RETURN;
  END IF;
  SELECT formatted INTO v_got FROM ops.allocate_number('assistant_action', v_scope);
  IF v_got IS DISTINCT FROM v_expected THEN
    RAISE EXCEPTION 'allocate_number(assistant_action) returned %, expected %', v_got, v_expected;
  END IF;
END $$;

-- 5. INDUS/Q is unseeded until cutover: allocation must refuse.
DO $$
BEGIN
  BEGIN
    PERFORM ops.allocate_number('quotation');
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%not seeded%' THEN
      RETURN;
    END IF;
    RAISE EXCEPTION 'allocate_number(quotation) failed for the wrong reason: %', SQLERRM;
  END;
  RAISE EXCEPTION 'allocate_number(quotation) succeeded; it must refuse until seeded';
END $$;

-- 6. activity_event is append-only for ops_app (no UPDATE grant; the trigger is the backstop).
DO $$
BEGIN
  BEGIN
    UPDATE ops.activity_event SET "note" = 'x';
  EXCEPTION WHEN insufficient_privilege THEN
    RETURN;
  END;
  RAISE EXCEPTION 'UPDATE on activity_event did not raise';
END $$;

-- 7. Every ops table has row-level security on.
DO $$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n FROM pg_tables WHERE schemaname = 'ops' AND NOT rowsecurity;
  IF n <> 0 THEN
    RAISE EXCEPTION '% ops tables have row-level security disabled', n;
  END IF;
END $$;

-- 8. ops_app cannot read website tables directly.
DO $$
BEGIN
  BEGIN
    PERFORM 1 FROM public.products LIMIT 1;
  EXCEPTION WHEN insufficient_privilege OR undefined_table THEN
    RETURN;
  END;
  RAISE EXCEPTION 'ops_app can read public.products directly';
END $$;

DO $$
BEGIN
  RAISE NOTICE 'verify.sql: all checks passed';
END $$;

ROLLBACK;
