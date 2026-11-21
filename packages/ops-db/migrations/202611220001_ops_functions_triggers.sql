-- Indus Operations · migration 5 of 8 · functions and triggers
--
-- 06-map-schema.md §11 row 5, §5 (numbering) and §9.11 (assistant action), ADR-03, ADR-15, C5.
--
-- Numbering (SECURITY INVOKER, SET search_path = ops; called by ops_app):
--   ops.format_number(pattern, value, scope, scopeKind, padTo)   pure formatter
--   ops.allocate_number(key, scope, recordType, recordId)        → (value, formatted)
--   ops.release_number(key, formatted)                           → number back to the pool
--   ops.seed_number_sequence(key, next, evidence, scope, by)     Owner action (Settings › Numbering)
--
-- The only two paths from ops_app into website data (SECURITY DEFINER, owner postgres,
-- SET search_path = public, pg_temp, EXECUTE to ops_app only):
--   ops.legacy_quote_number_exists(int)    reads public.quotes."code"     (INDUS/Q{n})
--   ops.legacy_enquiry_ref_exists(text)    reads public.enquiries."code"  (ENQ-yyyy-nnnn), until cutover
--   Columns checked against packages/db/prisma/schema.prisma: Quote.code, Enquiry.code
--   (no @map, so the SQL names are "code" on tables quotes and enquiries).
--
-- Guards (trigger functions):
--   ops.forbid_update_delete()        append-only: assistant_action_event, activity_event,
--                                     auth_event, ai_call, share_link_event, zoho_sync_log
--   ops.assistant_action_guard()      immutable columns, no DELETE, one event row per transition
--   ops.locked_level_guard()          autopilot_setting obeys the def's lockedLevel / maxLevel
--   ops.owner_only_approval()         quotation, supplier_po, supplier_payment approver = active owner
--   ops.tax_invoice_never_cancelled() document: a tax invoice is credited, never cancelled
--   ops.touch_stage_changed_at()      enquiry, order
--   ops.refresh_search_document()     + AFTER INSERT OR UPDATE triggers on the 11 indexed tables
--
-- Session context for audit rows: the app sets, inside its transaction,
--   SELECT set_config('ops.actor_kind', 'user', true), set_config('ops.actor_id', '<uuid>', true)
-- and the assistant-action event trigger reads them (default actor kind 'system').
--
-- Idempotent: CREATE OR REPLACE FUNCTION; every trigger is dropped IF EXISTS and recreated.
-- Postgres grants EXECUTE on new functions to PUBLIC, and a per-schema default privilege cannot
-- revoke that, so every function here is revoked from PUBLIC explicitly.

BEGIN;

-- ════════════════════════════════════════════════════════════════════════════════════════
-- Numbering
-- ════════════════════════════════════════════════════════════════════════════════════════

-- Pattern tokens (patterns are data in number_sequence, C6):
--   {n}           the value, left-padded with zeros to padTo when padTo > 0
--   {nn} {nnnn}…  the value, zero-padded to at least that many digits (never truncated)
--   {yyyy} {yy}   year from the scope      ({yyyy} needs a year, month or day scope)
--   {mm} {dd}     month / day from the scope
--   {yymm}        month scope as written ('2611')
--   {parent}      the parent scope as written (a parent ref)
--   {enq4}        the last four digits of the parent scope
-- Scope formats by scopeKind: global '' · year 'yyyy' · month 'yymm' · day 'yy-mm-dd' · parent any.
CREATE OR REPLACE FUNCTION ops.format_number(
  p_pattern text,
  p_value bigint,
  p_scope text,
  p_scope_kind ops."NumberScopeKind",
  p_pad_to int DEFAULT 0
) RETURNS text
  LANGUAGE plpgsql
  IMMUTABLE
  SET search_path = ops, pg_catalog
AS $$
DECLARE
  v_out text := p_pattern;
  v_yy text;
  v_mm text;
  v_dd text;
  v_digits text := p_value::text;
  v_token text;
  v_width int;
BEGIN
  IF p_value IS NULL OR p_value < 0 THEN
    RAISE EXCEPTION 'format_number: value must be a non-negative integer';
  END IF;

  CASE p_scope_kind
    WHEN 'global' THEN
      IF coalesce(p_scope, '') <> '' THEN
        RAISE EXCEPTION 'format_number: a global sequence takes the empty scope, not %', p_scope;
      END IF;
    WHEN 'year' THEN
      IF p_scope !~ '^\d{4}$' THEN
        RAISE EXCEPTION 'format_number: year scope must be yyyy, got %', p_scope;
      END IF;
      v_yy := right(p_scope, 2);
    WHEN 'month' THEN
      IF p_scope !~ '^\d{4}$' THEN
        RAISE EXCEPTION 'format_number: month scope must be yymm, got %', p_scope;
      END IF;
      v_yy := left(p_scope, 2);
      v_mm := right(p_scope, 2);
    WHEN 'day' THEN
      IF p_scope !~ '^\d{2}-\d{2}-\d{2}$' THEN
        RAISE EXCEPTION 'format_number: day scope must be yy-mm-dd, got %', p_scope;
      END IF;
      v_yy := split_part(p_scope, '-', 1);
      v_mm := split_part(p_scope, '-', 2);
      v_dd := split_part(p_scope, '-', 3);
    WHEN 'parent' THEN
      IF coalesce(p_scope, '') = '' THEN
        RAISE EXCEPTION 'format_number: a parent-scoped sequence needs the parent ref as scope';
      END IF;
  END CASE;

  IF p_scope_kind = 'year' THEN
    v_out := replace(v_out, '{yyyy}', p_scope);
  ELSIF v_yy IS NOT NULL THEN
    v_out := replace(v_out, '{yyyy}', '20' || v_yy);
  END IF;
  IF v_yy IS NOT NULL THEN v_out := replace(v_out, '{yy}', v_yy); END IF;
  IF v_mm IS NOT NULL THEN v_out := replace(v_out, '{mm}', v_mm); END IF;
  IF v_dd IS NOT NULL THEN v_out := replace(v_out, '{dd}', v_dd); END IF;
  IF p_scope_kind = 'month' THEN v_out := replace(v_out, '{yymm}', p_scope); END IF;
  IF p_scope_kind = 'parent' THEN
    v_out := replace(v_out, '{parent}', p_scope);
    v_out := replace(v_out, '{enq4}', right(regexp_replace(p_scope, '\D', '', 'g'), 4));
  END IF;

  -- {n}, {nn}, {nnnn} …
  LOOP
    v_token := substring(v_out FROM '\{n+\}');
    EXIT WHEN v_token IS NULL;
    v_width := length(v_token) - 2;
    IF v_width = 1 THEN
      v_width := greatest(coalesce(p_pad_to, 0), 1);
    END IF;
    v_out := replace(
      v_out, v_token,
      CASE WHEN length(v_digits) >= v_width THEN v_digits ELSE lpad(v_digits, v_width, '0') END
    );
  END LOOP;

  IF v_out ~ '\{[a-z0-9]+\}' THEN
    RAISE EXCEPTION 'format_number: pattern % has a token the % scope cannot fill', p_pattern, p_scope_kind;
  END IF;
  RETURN v_out;
END;
$$;

-- Website INDUS/Q numbers (ADR-03, §5.2). The only read of public.quotes from Ops.
CREATE OR REPLACE FUNCTION ops.legacy_quote_number_exists(p_value int)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.quotes q
     WHERE q."code" = 'INDUS/Q' || p_value::text
        OR q."code" LIKE 'INDUS/Q' || p_value::text || '-%'
  )
$$;

-- Website ENQ- refs while the old admin still allocates them (C5). Removed at cutover.
CREATE OR REPLACE FUNCTION ops.legacy_enquiry_ref_exists(p_ref text)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (SELECT 1 FROM public.enquiries e WHERE e."code" = p_ref)
$$;

ALTER FUNCTION ops.legacy_quote_number_exists(int) OWNER TO postgres;
ALTER FUNCTION ops.legacy_enquiry_ref_exists(text) OWNER TO postgres;

CREATE OR REPLACE FUNCTION ops.allocate_number(
  p_key text,
  p_scope text DEFAULT '',
  p_record_type ops."RecordType" DEFAULT NULL,
  p_record_id uuid DEFAULT NULL
) RETURNS TABLE (value bigint, formatted text)
  LANGUAGE plpgsql
  VOLATILE
  SECURITY INVOKER
  SET search_path = ops, pg_catalog
AS $$
#variable_conflict use_variable
DECLARE
  v_seq ops.number_sequence%ROWTYPE;
  v_scope text := coalesce(p_scope, '');
  v_status ops."IssuedNumberStatus" := CASE WHEN p_record_id IS NULL THEN 'reserved' ELSE 'issued' END;
  v_next bigint;
  v_candidate bigint;
  v_formatted text;
  v_released ops.issued_number%ROWTYPE;
  v_guard int := 0;
BEGIN
  SELECT * INTO v_seq FROM ops.number_sequence s WHERE s."key" = p_key;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'unknown number sequence %', p_key;
  END IF;
  IF v_seq."seededAt" IS NULL THEN
    RAISE EXCEPTION 'sequence % not seeded; complete Settings › Numbering', p_key;
  END IF;

  -- Validates the scope against the family (raises on a bad one) before anything is written.
  PERFORM ops.format_number(v_seq."pattern", 0, v_scope, v_seq."scopeKind", v_seq."padTo");

  -- Scoped families (per month, per day, per parent) start at 1 the first time a scope is used.
  INSERT INTO ops.number_counter ("sequenceKey", "scope", "nextValue", "updatedAt")
  VALUES (p_key, v_scope, 1, now())
  ON CONFLICT ("sequenceKey", "scope") DO NOTHING;

  SELECT c."nextValue" INTO v_next
    FROM ops.number_counter c
   WHERE c."sequenceKey" = p_key AND c."scope" = v_scope
     FOR UPDATE;

  -- An undone send gave its number back: reuse the lowest one, so the series has no gap.
  SELECT * INTO v_released
    FROM ops.issued_number i
   WHERE i."sequenceKey" = p_key AND i."scope" = v_scope AND i."status" = 'released'
   ORDER BY i."value"
   LIMIT 1
     FOR UPDATE;
  IF FOUND THEN
    UPDATE ops.issued_number i
       SET "status" = v_status, "recordType" = p_record_type, "recordId" = p_record_id,
           "issuedAt" = now(), "releasedAt" = NULL
     WHERE i."id" = v_released."id";
    value := v_released."value";
    formatted := v_released."formatted";
    RETURN NEXT;
    RETURN;
  END IF;

  v_candidate := v_next;
  LOOP
    v_guard := v_guard + 1;
    IF v_guard > 10000 THEN
      RAISE EXCEPTION 'allocate_number(%): no free number in 10000 candidates from %', p_key, v_next;
    END IF;
    v_formatted := ops.format_number(v_seq."pattern", v_candidate, v_scope, v_seq."scopeKind", v_seq."padTo");

    IF EXISTS (
      SELECT 1 FROM ops.issued_number i
       WHERE i."sequenceKey" = p_key
         AND (i."formatted" = v_formatted OR (i."scope" = v_scope AND i."value" = v_candidate))
    ) THEN
      v_candidate := v_candidate + 1;
      CONTINUE;
    END IF;

    IF EXISTS (
         SELECT 1 FROM ops.external_number_observation o
          WHERE o."sequenceKey" = p_key AND o."formatted" = v_formatted
       )
       OR (p_key = 'quotation' AND v_candidate <= 2147483647
           AND ops.legacy_quote_number_exists(v_candidate::int))
       OR (p_key = 'enquiry' AND ops.legacy_enquiry_ref_exists(v_formatted))
    THEN
      -- Seen outside Ops: record the skip as void so the gap audit can explain it (board 134).
      INSERT INTO ops.issued_number ("sequenceKey", "scope", "value", "formatted", "status", "issuedAt")
      VALUES (p_key, v_scope, v_candidate, v_formatted, 'void', now())
      ON CONFLICT DO NOTHING;
      v_candidate := v_candidate + 1;
      CONTINUE;
    END IF;

    EXIT;
  END LOOP;

  INSERT INTO ops.issued_number ("sequenceKey", "scope", "value", "formatted", "status", "recordType", "recordId", "issuedAt")
  VALUES (p_key, v_scope, v_candidate, v_formatted, v_status, p_record_type, p_record_id, now());

  UPDATE ops.number_counter c
     SET "nextValue" = v_candidate + 1, "updatedAt" = now()
   WHERE c."sequenceKey" = p_key AND c."scope" = v_scope;

  value := v_candidate;
  formatted := v_formatted;
  RETURN NEXT;
END;
$$;

-- Give a number back. Only for undo paths where nothing left the building (ADR-15).
CREATE OR REPLACE FUNCTION ops.release_number(p_key text, p_formatted text)
  RETURNS void
  LANGUAGE plpgsql
  VOLATILE
  SECURITY INVOKER
  SET search_path = ops, pg_catalog
AS $$
BEGIN
  UPDATE ops.issued_number i
     SET "status" = 'released', "releasedAt" = now(), "recordType" = NULL, "recordId" = NULL
   WHERE i."sequenceKey" = p_key AND i."formatted" = p_formatted
     AND i."status" IN ('reserved', 'issued');
  IF NOT FOUND THEN
    RAISE EXCEPTION 'release_number: % % is not reserved or issued', p_key, p_formatted;
  END IF;
END;
$$;

-- Owner action from Settings › Numbering (214): set the next value with its evidence.
-- Refuses to move a counter backwards past a number already handed out.
CREATE OR REPLACE FUNCTION ops.seed_number_sequence(
  p_key text,
  p_next bigint,
  p_evidence jsonb,
  p_scope text DEFAULT '',
  p_seeded_by uuid DEFAULT NULL
) RETURNS void
  LANGUAGE plpgsql
  VOLATILE
  SECURITY INVOKER
  SET search_path = ops, pg_catalog
AS $$
DECLARE
  v_seq ops.number_sequence%ROWTYPE;
  v_scope text := coalesce(p_scope, '');
  v_max bigint;
BEGIN
  SELECT * INTO v_seq FROM ops.number_sequence s WHERE s."key" = p_key FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'unknown number sequence %', p_key;
  END IF;
  IF p_next IS NULL OR p_next < 1 THEN
    RAISE EXCEPTION 'seed_number_sequence: next value must be at least 1';
  END IF;
  IF p_evidence IS NULL OR p_evidence = '{}'::jsonb THEN
    RAISE EXCEPTION 'seed_number_sequence: evidence is required';
  END IF;
  PERFORM ops.format_number(v_seq."pattern", p_next, v_scope, v_seq."scopeKind", v_seq."padTo");

  SELECT max(i."value") INTO v_max
    FROM ops.issued_number i
   WHERE i."sequenceKey" = p_key AND i."scope" = v_scope;
  IF v_max IS NOT NULL AND p_next <= v_max THEN
    RAISE EXCEPTION 'seed_number_sequence: % already issued up to %; next must be greater', p_key, v_max;
  END IF;

  INSERT INTO ops.number_counter ("sequenceKey", "scope", "nextValue", "updatedAt")
  VALUES (p_key, v_scope, p_next, now())
  ON CONFLICT ("sequenceKey", "scope") DO UPDATE SET "nextValue" = EXCLUDED."nextValue", "updatedAt" = now();

  UPDATE ops.number_sequence s
     SET "seededAt" = now(), "seededById" = p_seeded_by, "seedEvidence" = p_evidence, "updatedAt" = now()
   WHERE s."key" = p_key;
END;
$$;

-- ════════════════════════════════════════════════════════════════════════════════════════
-- Guards
-- ════════════════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION ops.forbid_update_delete()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ops, pg_catalog
AS $$
BEGIN
  RAISE EXCEPTION 'ops.% is append-only: % is not allowed', TG_TABLE_NAME, TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['assistant_action_event', 'activity_event', 'auth_event', 'ai_call',
                           'share_link_event', 'zoho_sync_log'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON ops.%I', t || '_append_only', t);
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE OR DELETE ON ops.%I FOR EACH ROW EXECUTE FUNCTION ops.forbid_update_delete()',
      t || '_append_only', t
    );
  END LOOP;
END $$;

-- §9.11: immutable proposal columns, no DELETE, and one assistant_action_event per transition
-- (the creation counts as one, from NULL).
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
    THEN
      RAISE EXCEPTION 'assistant action %: proposal columns are immutable; create a new action instead', OLD."ref"
        USING ERRCODE = 'insufficient_privilege';
    END IF;
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

DROP TRIGGER IF EXISTS assistant_action_guard ON ops.assistant_action;
CREATE TRIGGER assistant_action_guard
  BEFORE UPDATE OR DELETE ON ops.assistant_action
  FOR EACH ROW EXECUTE FUNCTION ops.assistant_action_guard();
DROP TRIGGER IF EXISTS assistant_action_created ON ops.assistant_action;
CREATE TRIGGER assistant_action_created
  AFTER INSERT ON ops.assistant_action
  FOR EACH ROW EXECUTE FUNCTION ops.assistant_action_guard();

-- Autonomy order off < suggest < draft_and_ask < do_and_tell < do_quietly. 'never' has no rank.
CREATE OR REPLACE FUNCTION ops.autonomy_rank(p_level ops."AutopilotLevel")
  RETURNS int
  LANGUAGE sql
  IMMUTABLE
  SET search_path = ops, pg_catalog
AS $$
  SELECT CASE p_level
    WHEN 'off' THEN 0
    WHEN 'suggest' THEN 1
    WHEN 'draft_and_ask' THEN 2
    WHEN 'do_and_tell' THEN 3
    WHEN 'do_quietly' THEN 4
  END
$$;

CREATE OR REPLACE FUNCTION ops.locked_level_guard()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ops, pg_catalog
AS $$
DECLARE
  v_def ops.autopilot_action_def%ROWTYPE;
BEGIN
  SELECT * INTO v_def FROM ops.autopilot_action_def d WHERE d."key" = NEW."actionKey";
  IF NOT FOUND THEN
    RAISE EXCEPTION 'autopilot setting for unknown action %', NEW."actionKey";
  END IF;

  IF v_def."lockedLevel" IS NOT NULL AND NEW."level" <> v_def."lockedLevel" THEN
    RAISE EXCEPTION 'action % is locked at %; % is not allowed', NEW."actionKey", v_def."lockedLevel", NEW."level"
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW."level" = 'never' AND v_def."lockedLevel" IS DISTINCT FROM 'never' THEN
    RAISE EXCEPTION 'level never is only valid for actions locked at never (%)', NEW."actionKey"
      USING ERRCODE = 'check_violation';
  END IF;

  IF v_def."maxLevel" IS NOT NULL AND NEW."level" <> 'never'
     AND ops.autonomy_rank(NEW."level") > coalesce(ops.autonomy_rank(v_def."maxLevel"), -1) THEN
    RAISE EXCEPTION 'action % allows at most %; % is not allowed', NEW."actionKey", v_def."maxLevel", NEW."level"
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS autopilot_setting_locked_level ON ops.autopilot_setting;
CREATE TRIGGER autopilot_setting_locked_level
  BEFORE INSERT OR UPDATE ON ops.autopilot_setting
  FOR EACH ROW EXECUTE FUNCTION ops.locked_level_guard();

-- Quotation, supplier PO and supplier payment approvals are the Owner's alone.
CREATE OR REPLACE FUNCTION ops.owner_only_approval()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ops, pg_catalog
AS $$
BEGIN
  IF NEW."approvedById" IS NOT NULL
     AND (TG_OP = 'INSERT' OR NEW."approvedById" IS DISTINCT FROM OLD."approvedById")
     AND NOT EXISTS (
       SELECT 1 FROM ops."user" u
        WHERE u."id" = NEW."approvedById" AND u."role" = 'owner' AND u."status" = 'active'
     )
  THEN
    RAISE EXCEPTION 'only the active owner can approve a %', TG_TABLE_NAME
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['quotation', 'supplier_po', 'supplier_payment'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON ops.%I', t || '_owner_only_approval', t);
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE INSERT OR UPDATE ON ops.%I FOR EACH ROW EXECUTE FUNCTION ops.owner_only_approval()',
      t || '_owner_only_approval', t
    );
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION ops.tax_invoice_never_cancelled()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ops, pg_catalog
AS $$
BEGIN
  IF NEW."kind" = 'tax_invoice' AND NEW."status" = 'cancelled' THEN
    RAISE EXCEPTION 'a tax invoice is never cancelled; issue a credit note instead'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS document_tax_invoice_never_cancelled ON ops.document;
CREATE TRIGGER document_tax_invoice_never_cancelled
  BEFORE INSERT OR UPDATE ON ops.document
  FOR EACH ROW EXECUTE FUNCTION ops.tax_invoice_never_cancelled();

CREATE OR REPLACE FUNCTION ops.touch_stage_changed_at()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ops, pg_catalog
AS $$
BEGIN
  IF NEW."stage" IS DISTINCT FROM OLD."stage" THEN
    NEW."stageChangedAt" := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enquiry_touch_stage_changed_at ON ops.enquiry;
CREATE TRIGGER enquiry_touch_stage_changed_at
  BEFORE UPDATE ON ops.enquiry
  FOR EACH ROW EXECUTE FUNCTION ops.touch_stage_changed_at();
DROP TRIGGER IF EXISTS order_touch_stage_changed_at ON ops."order";
CREATE TRIGGER order_touch_stage_changed_at
  BEFORE UPDATE ON ops."order"
  FOR EACH ROW EXECUTE FUNCTION ops.touch_stage_changed_at();

-- ════════════════════════════════════════════════════════════════════════════════════════
-- Command-bar index (§7.1)
-- ════════════════════════════════════════════════════════════════════════════════════════

-- Rebuild the search_document row for one record. A record that no longer exists loses its
-- row. Every reference format resolves to the same row (a quotation's refs hold INDUS/Q26941-R2,
-- INDUS/Q26941, Q26941 and 26941). Mail and attachments are searched through their own
-- searchTsv columns, which keeps this table small.
CREATE OR REPLACE FUNCTION ops.refresh_search_document(p_kind ops."SearchKind", p_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  VOLATILE
  SET search_path = ops, pg_catalog
AS $$
DECLARE
  v_enquiry uuid;
  v_refs text[];
  v_title text;
  v_body text;
  v_parts text[];
  v_at timestamptz;
BEGIN
  CASE p_kind
    WHEN 'enquiry' THEN
      SELECT e."id", ARRAY[e."ref", e."clientRef"], e."title", NULL, NULL, e."receivedAt"
        INTO v_enquiry, v_refs, v_title, v_body, v_parts, v_at
        FROM ops.enquiry e WHERE e."id" = p_id;
    WHEN 'quotation' THEN
      SELECT q."enquiryId",
             ARRAY[q."number", 'INDUS/Q' || q."baseNumber", 'Q' || q."baseNumber", q."baseNumber"::text, q."clientRef"],
             coalesce(q."number", 'Draft quotation'), q."notes", NULL, coalesce(q."sentAt", q."createdAt")
        INTO v_enquiry, v_refs, v_title, v_body, v_parts, v_at
        FROM ops.quotation q WHERE q."id" = p_id;
    WHEN 'supplier_rfq' THEN
      SELECT r."enquiryId", ARRAY[r."ref"], 'Supplier RFQ ' || r."ref", NULL, NULL, r."createdAt"
        INTO v_enquiry, v_refs, v_title, v_body, v_parts, v_at
        FROM ops.supplier_rfq r WHERE r."id" = p_id;
    WHEN 'supplier_quote' THEN
      SELECT sq."enquiryId", ARRAY[sq."supplierRef"],
             'Supplier quote ' || coalesce(sq."supplierRef", '') || ' · ' || coalesce(c."name", ''),
             sq."summaryEn", NULL, sq."receivedAt"
        INTO v_enquiry, v_refs, v_title, v_body, v_parts, v_at
        FROM ops.supplier_quote sq LEFT JOIN ops.company c ON c."id" = sq."supplierId"
       WHERE sq."id" = p_id;
    WHEN 'order' THEN
      SELECT o."enquiryId", ARRAY[o."ref", o."clientPoNumber"], 'Order ' || o."ref", NULL, NULL, o."createdAt"
        INTO v_enquiry, v_refs, v_title, v_body, v_parts, v_at
        FROM ops."order" o WHERE o."id" = p_id;
    WHEN 'supplier_po' THEN
      SELECT o."enquiryId", ARRAY[po."number"],
             'Supplier PO ' || coalesce(po."number", 'draft') || ' · ' || coalesce(c."name", ''),
             NULL, NULL, coalesce(po."sentAt", po."createdAt")
        INTO v_enquiry, v_refs, v_title, v_body, v_parts, v_at
        FROM ops.supplier_po po
        JOIN ops."order" o ON o."id" = po."orderId"
        LEFT JOIN ops.company c ON c."id" = po."supplierId"
       WHERE po."id" = p_id;
    WHEN 'company' THEN
      SELECT NULL::uuid, coalesce(c."domains", ARRAY[]::text[]) || ARRAY[c."primaryDomain"],
             c."name", concat_ws(' ', c."legalName", ops.immutable_array_to_string(c."aliases", ' ')),
             NULL, c."createdAt"
        INTO v_enquiry, v_refs, v_title, v_body, v_parts, v_at
        FROM ops.company c WHERE c."id" = p_id;
    WHEN 'contact' THEN
      SELECT NULL::uuid, ARRAY[ct."email"], coalesce(ct."name", ct."email", 'Contact'),
             concat_ws(' ', ct."role", c."name"), NULL, ct."createdAt"
        INTO v_enquiry, v_refs, v_title, v_body, v_parts, v_at
        FROM ops.contact ct LEFT JOIN ops.company c ON c."id" = ct."companyId"
       WHERE ct."id" = p_id;
    WHEN 'part' THEN
      SELECT p."firstAskedEnquiryId", ARRAY[p."partNo"], concat_ws(' ', p."partNo", nullif(p."brand", '')),
             p."description", ARRAY[p."partNoNorm"], p."createdAt"
        INTO v_enquiry, v_refs, v_title, v_body, v_parts, v_at
        FROM ops.part p WHERE p."id" = p_id;
    WHEN 'tender' THEN
      SELECT t."enquiryId", ARRAY[t."tenderRef", t."awardPoRef"], 'Tender ' || t."tenderRef",
             t."buyerName", NULL, t."closingAt"
        INTO v_enquiry, v_refs, v_title, v_body, v_parts, v_at
        FROM ops.tender t WHERE t."id" = p_id;
    WHEN 'document' THEN
      SELECT d."enquiryId", ARRAY[d."number"],
             replace(d."kind"::text, '_', ' ') || coalesce(' ' || d."number", ''),
             NULL, NULL, coalesce(d."issuedAt", d."createdAt")
        INTO v_enquiry, v_refs, v_title, v_body, v_parts, v_at
        FROM ops.document d WHERE d."id" = p_id;
    ELSE
      RAISE EXCEPTION 'refresh_search_document: % is not indexed here', p_kind;
  END CASE;

  IF v_title IS NULL THEN
    DELETE FROM ops.search_document s WHERE s."kind" = p_kind AND s."recordId" = p_id;
    RETURN;
  END IF;

  -- Drop NULLs and duplicates (a quotation's number often equals INDUS/Q<base>), keep order.
  SELECT array_agg(r ORDER BY o) INTO v_refs
    FROM (SELECT DISTINCT ON (r) r, o FROM unnest(v_refs) WITH ORDINALITY AS u(r, o)
           WHERE r IS NOT NULL AND r <> '' ORDER BY r, o) d;
  INSERT INTO ops.search_document
    ("kind", "recordId", "enquiryId", "refs", "title", "body", "partNosNorm", "occurredAt", "updatedAt")
  VALUES (p_kind, p_id, v_enquiry, v_refs, v_title, v_body, v_parts, v_at, now())
  ON CONFLICT ("kind", "recordId") DO UPDATE
    SET "enquiryId" = EXCLUDED."enquiryId", "refs" = EXCLUDED."refs", "title" = EXCLUDED."title",
        "body" = EXCLUDED."body", "partNosNorm" = EXCLUDED."partNosNorm",
        "occurredAt" = EXCLUDED."occurredAt", "updatedAt" = now();
END;
$$;

CREATE OR REPLACE FUNCTION ops.search_document_sync()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = ops, pg_catalog
AS $$
BEGIN
  PERFORM ops.refresh_search_document(TG_ARGV[0]::ops."SearchKind", NEW."id");
  RETURN NULL;
END;
$$;

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('enquiry', 'enquiry'), ('quotation', 'quotation'), ('supplier_rfq', 'supplier_rfq'),
      ('supplier_quote', 'supplier_quote'), ('order', 'order'), ('supplier_po', 'supplier_po'),
      ('company', 'company'), ('contact', 'contact'), ('part', 'part'), ('tender', 'tender'),
      ('document', 'document')
    ) AS t(tbl, kind)
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON ops.%I', r.tbl || '_search_document', r.tbl);
    EXECUTE format(
      'CREATE TRIGGER %I AFTER INSERT OR UPDATE ON ops.%I FOR EACH ROW EXECUTE FUNCTION ops.search_document_sync(%L)',
      r.tbl || '_search_document', r.tbl, r.kind
    );
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════════════════════════════════════
-- Execute privileges
-- ════════════════════════════════════════════════════════════════════════════════════════

REVOKE ALL ON FUNCTION ops.format_number(text, bigint, text, ops."NumberScopeKind", int) FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.allocate_number(text, text, ops."RecordType", uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.release_number(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.seed_number_sequence(text, bigint, jsonb, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.legacy_quote_number_exists(int) FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.legacy_enquiry_ref_exists(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.forbid_update_delete() FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.assistant_action_guard() FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.autonomy_rank(ops."AutopilotLevel") FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.locked_level_guard() FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.owner_only_approval() FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.tax_invoice_never_cancelled() FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.touch_stage_changed_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.refresh_search_document(ops."SearchKind", uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.search_document_sync() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION ops.format_number(text, bigint, text, ops."NumberScopeKind", int) TO ops_app;
GRANT EXECUTE ON FUNCTION ops.allocate_number(text, text, ops."RecordType", uuid) TO ops_app;
GRANT EXECUTE ON FUNCTION ops.release_number(text, text) TO ops_app;
GRANT EXECUTE ON FUNCTION ops.seed_number_sequence(text, bigint, jsonb, text, uuid) TO ops_app;
GRANT EXECUTE ON FUNCTION ops.legacy_quote_number_exists(int) TO ops_app;
GRANT EXECUTE ON FUNCTION ops.legacy_enquiry_ref_exists(text) TO ops_app;
GRANT EXECUTE ON FUNCTION ops.autonomy_rank(ops."AutopilotLevel") TO ops_app;
GRANT EXECUTE ON FUNCTION ops.refresh_search_document(ops."SearchKind", uuid) TO ops_app;
-- Generated columns and the trigram indexes call it on every write.
GRANT EXECUTE ON FUNCTION ops.immutable_array_to_string(text[], text) TO ops_app, ops_maint;

COMMIT;
