-- Enable Row Level Security on the tables that shipped without it.
--
-- Background:
--   Tables added via Prisma db push (the initial schema migration) got
--   RLS enabled automatically by Supabase. Every table added via the
--   hand-rolled SQL migrations under packages/db/migrations/00X_*.sql
--   has shipped with RLS DISABLED, which means the Supabase `anon`
--   role can read and write every row if it ever gains access to the
--   publishable anon key.
--
-- Safety:
--   We enable RLS with NO policies, which is the most restrictive
--   stance. That fully locks anonymous and authenticated Supabase
--   roles out of the tables. Prisma connects as the `postgres`
--   superuser via DATABASE_URL and bypasses RLS, so all server-side
--   reads + writes keep working. The only Supabase JS client in this
--   repo (apps/{storefront,admin}/src/lib/supabase.ts) uses
--   SUPABASE_SERVICE_ROLE_KEY, which also bypasses RLS, and only
--   touches Storage signed URLs — not these tables — so this is
--   a no-op for runtime behaviour.
--
-- If a future surface needs to read one of these tables from the
-- browser via the anon key, add an explicit policy alongside the
-- table that's being exposed — never blanket-disable RLS again.

BEGIN;

ALTER TABLE "nav_menus"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nav_menu_items"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_prompt_templates"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_suggestions"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_usage_quotas"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "seo_health_scores"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "search_synonyms"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "search_redirects"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "search_boosts"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "search_query_logs"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "seo_audit_logs"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "not_found_logs"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gsc_metric_daily"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crawl_runs"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crawl_edges"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crawl_findings"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sent_emails"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "counters"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "homepage_hero_slides"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "industry_case_studies"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_cases"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "brand_case_studies"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "newsletter_subscribers"  ENABLE ROW LEVEL SECURITY;

COMMIT;
