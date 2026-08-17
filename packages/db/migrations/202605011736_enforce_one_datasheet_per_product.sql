-- Migration: enforce_one_datasheet_per_product
-- Applied: 2026-05-01 via Supabase migration system
--
-- Adds a partial unique index that allows at most one ProductDocument
-- with kind='datasheet' per product. Other document kinds (STEP, IGES,
-- service_manual, installation_guide) remain unconstrained — multiple
-- per product are still allowed.
--
-- This is enforced at the DB layer because the application-layer
-- replace-on-upload logic (see uploadProductDocument server action)
-- has a TOCTOU window between SELECT and INSERT. The unique index
-- closes that window: the second concurrent insert fails at commit.
--
-- Prisma cannot represent partial unique indexes in schema.prisma.
-- Do not run `prisma db push` against the project schema — it will
-- diff and silently drop this index.

CREATE UNIQUE INDEX product_documents_one_datasheet_per_product
  ON product_documents ("productId")
  WHERE kind = 'datasheet';
