-- Homepage hero carousel — ordered slides for the storefront homepage
-- right-side visual. Each slide references a Media row (uses existing
-- public product-images bucket — no new bucket needed).
--
-- Applied via Supabase MCP `apply_migration`. Mirrors the Prisma model
-- HomepageHeroSlide added in the same PR.
--
-- Column types match Prisma's String @id @default(uuid()) → TEXT (not UUID).
-- IDs are generated application-side via Prisma; no DB-side default.

BEGIN;

CREATE TABLE IF NOT EXISTS "homepage_hero_slides" (
  "id"           TEXT         NOT NULL PRIMARY KEY,
  "mediaId"      TEXT         NOT NULL,
  "position"     INTEGER      NOT NULL DEFAULT 0,
  "alt"          TEXT,
  "isPublished"  BOOLEAN      NOT NULL DEFAULT true,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "homepage_hero_slides_mediaId_fkey"
    FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "homepage_hero_slides_position_idx"
  ON "homepage_hero_slides" ("position");

CREATE INDEX IF NOT EXISTS "homepage_hero_slides_isPublished_position_idx"
  ON "homepage_hero_slides" ("isPublished", "position");

COMMIT;
