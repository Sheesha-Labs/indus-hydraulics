-- Adds `certificate` to the DocumentKind enum.
--
-- Product documents were datasheets, CAD models, service manuals and
-- installation guides. Class type approvals and product design assessments
-- (DNV, ABS) are attached to the listings they cover, and naming one a
-- "Datasheet" or "Service manual" would be untrue. The storefront labels an
-- unknown kind by its raw name, so the value is safe ahead of the code.
--
-- ADD VALUE cannot run inside a transaction block on older Postgres; run it on
-- its own with `prisma db execute`.

ALTER TYPE "DocumentKind" ADD VALUE IF NOT EXISTS 'certificate';
