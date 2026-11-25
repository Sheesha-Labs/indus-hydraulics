-- S08-T06 (C5): ENQ numbering while the website admin still allocates ENQ-YYYY-NNNN refs.
--
-- ops.legacy_enquiry_ref_exists(text) and the allocate_number skip (a legacy ref is recorded as a void issued
-- number) already exist since 202611220001_ops_functions_triggers.sql. This adds the one more read Ops needs:
-- the highest legacy number in a year, for the seed (legacy max + 1000) and the nightly continuity check
-- (ops.numbering.continuity). It is the second and last read path from ops_app into public; both functions are
-- dropped in the S21 cutover cleanup, after the legacy allocator is frozen.
CREATE OR REPLACE FUNCTION ops.legacy_enquiry_max(p_year int)
  RETURNS int
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  SELECT coalesce(max(substring(e."code" FROM '^ENQ-' || p_year::text || '-(\d+)$')::int), 0)
    FROM public.enquiries e
   WHERE e."code" LIKE 'ENQ-' || p_year::text || '-%'
$$;

ALTER FUNCTION ops.legacy_enquiry_max(int) OWNER TO postgres;
REVOKE ALL ON FUNCTION ops.legacy_enquiry_max(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ops.legacy_enquiry_max(int) TO ops_app;
