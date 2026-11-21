-- ════════════════════════════════════════════════════════════════════════════════════════
--  LOCAL AND CI ONLY. NEVER APPLY THIS FILE TO SUPABASE OR ANY SHARED DATABASE.
-- ════════════════════════════════════════════════════════════════════════════════════════
--
-- A plain Docker Postgres has none of Supabase's roles and none of the website's tables, so
-- the Ops migrations would fail on it: migration 5's SECURITY DEFINER functions read
-- public.quotes and public.enquiries, and migration 6's views read the catalogue tables.
-- This stub creates the smallest stand-in for those: the Supabase API roles (NOLOGIN) and
-- the public tables with exactly the columns the views and the two legacy functions read,
-- named as in packages/db/prisma/schema.prisma (camelCase columns, quoted).
--
-- scripts/apply-local.sh runs it first, and refuses any host that is not localhost.
-- The guard below refuses as well if it finds signs of a Supabase database.
--
-- Fixture data is fictional (CLAUDE.md §14): brand "Example Valve Co", part EX-100.

BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname IN ('supabase_admin', 'authenticator'))
     OR EXISTS (SELECT 1 FROM pg_namespace WHERE nspname IN ('auth', 'storage', 'supabase_migrations')) THEN
    RAISE EXCEPTION 'public-stub.sql is for local Docker Postgres only; this database looks like Supabase';
  END IF;
END $$;

-- Supabase API roles, so migrations 1 and 7 exercise their revoke branches locally.
DO $$
DECLARE
  r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('CREATE ROLE %I NOLOGIN', r);
    END IF;
  END LOOP;
END $$;

DO $$ BEGIN
  CREATE TYPE public."ProductStatus" AS ENUM ('draft', 'active', 'discontinued');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public."CrossRefCompatibility" AS ENUM ('direct', 'compatible', 'superseded_by_us');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.brands (
  "id"   text PRIMARY KEY,
  "name" text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.categories (
  "id"   text PRIMARY KEY,
  "name" text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.products (
  "id"         text PRIMARY KEY,
  "sku"        text NOT NULL UNIQUE,
  "mpn"        text,
  "slug"       text NOT NULL UNIQUE,
  "title"      text NOT NULL,
  "brandId"    text REFERENCES public.brands ("id"),
  "categoryId" text REFERENCES public.categories ("id"),
  "status"     public."ProductStatus" NOT NULL DEFAULT 'draft',
  "hsCode"     text,
  "weightKg"   numeric(8, 3)
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  "id"         text PRIMARY KEY,
  "productId"  text NOT NULL REFERENCES public.products ("id") ON DELETE CASCADE,
  "partNumber" text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.product_cross_references (
  "id"                text PRIMARY KEY,
  "productId"         text NOT NULL REFERENCES public.products ("id") ON DELETE CASCADE,
  "competitorBrand"   text NOT NULL,
  "competitorMpn"     text NOT NULL,
  "compatibility"     public."CrossRefCompatibility" NOT NULL DEFAULT 'direct',
  "variantPartNumber" text
);

-- Read by ops.legacy_quote_number_exists(int).
CREATE TABLE IF NOT EXISTS public.quotes (
  "id"   text PRIMARY KEY,
  "code" text NOT NULL UNIQUE
);

-- Read by ops.legacy_enquiry_ref_exists(text).
CREATE TABLE IF NOT EXISTS public.enquiries (
  "id"   text PRIMARY KEY,
  "code" text NOT NULL UNIQUE
);

INSERT INTO public.brands ("id", "name")
VALUES ('00000000-0000-4000-8000-00000000b001', 'Example Valve Co')
ON CONFLICT DO NOTHING;

INSERT INTO public.categories ("id", "name")
VALUES ('00000000-0000-4000-8000-00000000c001', 'Ball valves')
ON CONFLICT DO NOTHING;

-- One active product (visible through the views) and one draft (filtered out by them).
INSERT INTO public.products ("id", "sku", "mpn", "slug", "title", "brandId", "categoryId", "status", "hsCode", "weightKg")
VALUES
  ('00000000-0000-4000-8000-00000000a100', 'EX-100', 'EX-100', 'example-ball-valve-ex-100',
   'Example ball valve EX-100', '00000000-0000-4000-8000-00000000b001',
   '00000000-0000-4000-8000-00000000c001', 'active', '8481.80', 2.500),
  ('00000000-0000-4000-8000-00000000a200', 'EX-200', 'EX-200', 'example-ball-valve-ex-200',
   'Example ball valve EX-200 (draft)', '00000000-0000-4000-8000-00000000b001',
   '00000000-0000-4000-8000-00000000c001', 'draft', NULL, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO public.product_variants ("id", "productId", "partNumber")
VALUES ('00000000-0000-4000-8000-00000000d100', '00000000-0000-4000-8000-00000000a100', 'EX-100-12')
ON CONFLICT DO NOTHING;

INSERT INTO public.product_cross_references ("id", "productId", "competitorBrand", "competitorMpn", "compatibility", "variantPartNumber")
VALUES ('00000000-0000-4000-8000-00000000e100', '00000000-0000-4000-8000-00000000a100',
        'Sample Maker', 'SM 100/12', 'compatible', 'EX-100-12')
ON CONFLICT DO NOTHING;

COMMIT;
