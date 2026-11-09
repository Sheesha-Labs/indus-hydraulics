-- Newsletter: accept the batch size as BIGINT too.
--
-- Prisma's $queryRaw binds a JavaScript number as int8, so the deployed
-- sender's call `newsletter_claim_deliveries(${id}, ${n})` resolved to
-- (text, bigint) — which did not exist — and every claim failed with 42883
-- (found in the first production rehearsal, 2026-11-09). This overload
-- forwards to the INTEGER version, so the deployed code works with no
-- deploy; the code also casts `::int` from the next release.

CREATE OR REPLACE FUNCTION public.newsletter_claim_deliveries(p_campaign TEXT, p_limit BIGINT)
RETURNS SETOF "newsletter_deliveries"
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.newsletter_claim_deliveries(p_campaign, LEAST(GREATEST(p_limit, 0), 2147483647)::integer);
$$;

REVOKE ALL ON FUNCTION public.newsletter_claim_deliveries(TEXT, BIGINT) FROM PUBLIC, anon, authenticated;
