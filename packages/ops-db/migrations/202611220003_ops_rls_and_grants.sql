-- Indus Operations · migration 7 of 8 · row-level security and grants
--
-- 06-map-schema.md §3.3 and §11 row 7 (S3, S9).
--
--   * RLS is enabled on every table in ops. ops_app does not own the tables and is not
--     BYPASSRLS, so each table gets an explicit permissive policy TO ops_app. anon and
--     authenticated get no policy (and have no USAGE on the schema anyway).
--   * ops_app: SELECT, INSERT, UPDATE, DELETE on every table, then
--       - REVOKE UPDATE, DELETE on the append-only audit tables (also trigger-guarded,
--         migration 5): assistant_action_event, activity_event, auth_event, ai_call,
--         share_link_event, zoho_sync_log;
--       - REVOKE DELETE on records that are cancelled or superseded, never deleted:
--         assistant_action, issued_number, document, document_version, quotation,
--         client_invoice, supplier_payment.
--   * ops_maint (retention and the board 90 mailbox purge): policies and grants only on
--     mail_message, mail_attachment, mail_link, mail_thread, stored_file, document_text and
--     outbound_email (SELECT and DELETE; UPDATE only of the purge columns on mail_message and
--     stored_file), plus INSERT on activity_event for the purge receipt.
--   * Grants go table by table from pg_tables, never `ON ALL TABLES`, which would also grant
--     write privileges on the catalogue views of migration 6.
--   * PUBLIC and the Supabase API roles lose every privilege on ops tables, sequences and
--     functions, explicitly, because a per-schema default privilege cannot revoke a global one.
--
-- Final assertions: no ops table lacks rowsecurity; no Supabase API role holds a privilege on
-- an ops table; the Ops roles still hold none on public.
--
-- Idempotent: ENABLE RLS and GRANT / REVOKE converge; policies are created only when absent.

BEGIN;

-- ── RLS and the ops_app policy on every table ───────────────────────────────────────────
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'ops' ORDER BY tablename LOOP
    EXECUTE format('ALTER TABLE ops.%I ENABLE ROW LEVEL SECURITY', t.tablename);
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
       WHERE schemaname = 'ops' AND tablename = t.tablename AND policyname = 'ops_app_all'
    ) THEN
      EXECUTE format(
        'CREATE POLICY ops_app_all ON ops.%I AS PERMISSIVE FOR ALL TO ops_app USING (true) WITH CHECK (true)',
        t.tablename
      );
    END IF;
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON ops.%I TO ops_app', t.tablename);
  END LOOP;
END $$;

-- ── Append-only and never-deleted tables ────────────────────────────────────────────────
REVOKE UPDATE, DELETE ON
  ops.assistant_action_event, ops.activity_event, ops.auth_event, ops.ai_call,
  ops.share_link_event, ops.zoho_sync_log
FROM ops_app;

REVOKE DELETE ON
  ops.assistant_action, ops.issued_number, ops.document, ops.document_version,
  ops.quotation, ops.client_invoice, ops.supplier_payment
FROM ops_app;

-- ── ops_maint: retention and mailbox purge only ─────────────────────────────────────────
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['mail_message', 'mail_attachment', 'mail_link', 'mail_thread',
                           'stored_file', 'document_text', 'outbound_email'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'ops' AND tablename = t AND policyname = 'ops_maint_all'
    ) THEN
      EXECUTE format(
        'CREATE POLICY ops_maint_all ON ops.%I AS PERMISSIVE FOR ALL TO ops_maint USING (true) WITH CHECK (true)',
        t
      );
    END IF;
    EXECUTE format('GRANT SELECT, DELETE ON ops.%I TO ops_maint', t);
  END LOOP;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
     WHERE schemaname = 'ops' AND tablename = 'activity_event' AND policyname = 'ops_maint_insert'
  ) THEN
    CREATE POLICY ops_maint_insert ON ops.activity_event AS PERMISSIVE FOR INSERT TO ops_maint WITH CHECK (true);
  END IF;
END $$;

GRANT UPDATE ("bodyText", "bodyPurgedAt") ON ops.mail_message TO ops_maint;
GRANT UPDATE ("purgedAt") ON ops.stored_file TO ops_maint;
GRANT INSERT ON ops.activity_event TO ops_maint;

-- ── Nothing for PUBLIC or the Supabase API roles ────────────────────────────────────────
REVOKE ALL ON ALL TABLES IN SCHEMA ops FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA ops FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA ops FROM PUBLIC;
DO $$
DECLARE
  r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA ops FROM %I', r);
      EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA ops FROM %I', r);
      EXECUTE format('REVOKE ALL ON ALL FUNCTIONS IN SCHEMA ops FROM %I', r);
    END IF;
  END LOOP;
END $$;

-- ── Assertions ──────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  n int;
  bad text;
BEGIN
  SELECT count(*) INTO n FROM pg_tables t WHERE t.schemaname = 'ops' AND NOT t.rowsecurity;
  IF n <> 0 THEN
    RAISE EXCEPTION '% ops tables have row-level security disabled', n;
  END IF;

  SELECT string_agg(format('%s on ops.%I', r.rolname, c.relname), ', ') INTO bad
    FROM pg_class c
    JOIN pg_namespace ns ON ns.oid = c.relnamespace
    JOIN pg_roles r ON r.rolname IN ('anon', 'authenticated', 'service_role')
   WHERE ns.nspname = 'ops' AND c.relkind IN ('r', 'p', 'v', 'm')
     AND has_table_privilege(r.oid, c.oid, 'SELECT,INSERT,UPDATE,DELETE');
  IF bad IS NOT NULL THEN
    RAISE EXCEPTION 'Supabase API roles must hold no privilege in ops: %', bad;
  END IF;

  SELECT string_agg(format('%s on public.%I', r.rolname, c.relname), ', ') INTO bad
    FROM pg_class c
    JOIN pg_namespace ns ON ns.oid = c.relnamespace
    CROSS JOIN (VALUES ('ops_app'), ('ops_maint')) AS r(rolname)
   WHERE ns.nspname = 'public' AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
     AND has_table_privilege(r.rolname, c.oid, 'SELECT,INSERT,UPDATE,DELETE');
  IF bad IS NOT NULL THEN
    RAISE EXCEPTION 'Ops roles must hold no privilege on public tables: %', bad;
  END IF;

  IF has_table_privilege('ops_app', 'ops.activity_event', 'UPDATE')
     OR has_table_privilege('ops_app', 'ops.activity_event', 'DELETE') THEN
    RAISE EXCEPTION 'ops_app must not be able to UPDATE or DELETE activity_event';
  END IF;
END $$;

COMMIT;
