-- Indus Operations · S11-T08 · the numbering service (board 214, ADR-15, §4.5, C4, C6)
--
-- 1. number_sequence: the continuity state the nightly check writes (clear / out_of_step / not_checked / unseeded /
--    check_failed), when it last ran, its per-source evidence, and the C6 sign-off of the Round 1 styles.
-- 2. ops.peek_number(key, scope): the number the next allocation would give, formatted, without locking or writing
--    (previews and Settings › Numbering). NULL while the sequence is unseeded. Skips what allocate_number skips.
-- 3. ops.legacy_quote_number_max(): the highest INDUS/Q number the website has issued, from public.quotes codes and
--    both public.counters 'quote' rows (06 §5.1: base 26386), for the cutover evidence. SECURITY DEFINER, owner
--    postgres, the third and last read path into public; dropped at the S21 cutover cleanup with the others.
-- 4. Every C6 Round 1 sequence exists (ON CONFLICT DO NOTHING: the S00 reference seed already wrote them).

BEGIN;

ALTER TABLE ops.number_sequence
  ADD COLUMN IF NOT EXISTS "continuityStatus" text NOT NULL DEFAULT 'not_checked',
  ADD COLUMN IF NOT EXISTS "lastCheckedAt" timestamptz(3),
  ADD COLUMN IF NOT EXISTS "continuityDetail" jsonb,
  ADD COLUMN IF NOT EXISTS "signoffStatus" ops."SignoffStatus" NOT NULL DEFAULT 'awaiting',
  ADD COLUMN IF NOT EXISTS "signedOffById" uuid REFERENCES ops."user"(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS "signedOffAt" timestamptz(3);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'number_sequence_continuity_check') THEN
    ALTER TABLE ops.number_sequence ADD CONSTRAINT number_sequence_continuity_check
      CHECK ("continuityStatus" IN ('clear', 'out_of_step', 'not_checked', 'unseeded', 'check_failed'));
  END IF;
END $$;

UPDATE ops.number_sequence SET "continuityStatus" = 'unseeded'
 WHERE "seededAt" IS NULL AND "continuityStatus" = 'not_checked';
-- Structural sequences continue nothing and need no sign-off.
UPDATE ops.number_sequence SET "signoffStatus" = 'not_required', "continuityStatus" = 'clear'
 WHERE "key" = 'assistant_action' AND "signoffStatus" = 'awaiting';

CREATE OR REPLACE FUNCTION ops.peek_number(p_key text, p_scope text DEFAULT '')
  RETURNS text
  LANGUAGE plpgsql
  STABLE
  SECURITY INVOKER
  SET search_path = ops, pg_catalog
AS $$
DECLARE
  v_seq ops.number_sequence%ROWTYPE;
  v_scope text := coalesce(p_scope, '');
  v_candidate bigint;
  v_formatted text;
  v_released text;
  v_guard int := 0;
BEGIN
  SELECT * INTO v_seq FROM ops.number_sequence s WHERE s."key" = p_key;
  IF NOT FOUND OR v_seq."seededAt" IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT i."formatted" INTO v_released
    FROM ops.issued_number i
   WHERE i."sequenceKey" = p_key AND i."scope" = v_scope AND i."status" = 'released'
   ORDER BY i."value" LIMIT 1;
  IF v_released IS NOT NULL THEN
    RETURN v_released;
  END IF;
  SELECT c."nextValue" INTO v_candidate
    FROM ops.number_counter c WHERE c."sequenceKey" = p_key AND c."scope" = v_scope;
  v_candidate := coalesce(v_candidate, 1);
  LOOP
    v_guard := v_guard + 1;
    IF v_guard > 10000 THEN
      RETURN NULL;
    END IF;
    v_formatted := ops.format_number(v_seq."pattern", v_candidate, v_scope, v_seq."scopeKind", v_seq."padTo");
    IF EXISTS (SELECT 1 FROM ops.issued_number i
                WHERE i."sequenceKey" = p_key
                  AND (i."formatted" = v_formatted OR (i."scope" = v_scope AND i."value" = v_candidate)))
       OR EXISTS (SELECT 1 FROM ops.external_number_observation o
                   WHERE o."sequenceKey" = p_key AND o."formatted" = v_formatted)
       OR (p_key = 'quotation' AND v_candidate <= 2147483647 AND ops.legacy_quote_number_exists(v_candidate::int))
       OR (p_key = 'enquiry' AND ops.legacy_enquiry_ref_exists(v_formatted))
    THEN
      v_candidate := v_candidate + 1;
      CONTINUE;
    END IF;
    RETURN v_formatted;
  END LOOP;
END;
$$;
GRANT EXECUTE ON FUNCTION ops.peek_number(text, text) TO ops_app;

-- plpgsql with dynamic SQL: public.counters may not exist in every database (a local one), and an SQL-language
-- body would be checked against it at creation.
CREATE OR REPLACE FUNCTION ops.legacy_quote_number_max()
  RETURNS int
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE
  v_codes int := 0;
  v_counters int := 0;
BEGIN
  IF to_regclass('public.quotes') IS NOT NULL THEN
    EXECUTE $q$
      SELECT coalesce(max(substring(q."code" FROM '^INDUS/Q(\d+)')::int), 0)
        FROM public.quotes q WHERE q."code" ~ '^INDUS/Q\d+'
    $q$ INTO v_codes;
  END IF;
  IF to_regclass('public.counters') IS NOT NULL THEN
    EXECUTE $q$
      SELECT coalesce(max(26386 + c."value"), 0) FROM public.counters c WHERE c."scope" = 'quote'
    $q$ INTO v_counters;
  END IF;
  RETURN greatest(coalesce(v_codes, 0), coalesce(v_counters, 0));
END;
$$;
ALTER FUNCTION ops.legacy_quote_number_max() OWNER TO postgres;
REVOKE ALL ON FUNCTION ops.legacy_quote_number_max() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ops.legacy_quote_number_max() TO ops_app;

COMMIT;
