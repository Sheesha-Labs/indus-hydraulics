-- 202608171847_media_library.sql
--
-- Groundwork for the media library rebuild (phase 2 of 9). The library needs
-- a trash it can restore from, a modified timestamp to sort and display, and
-- indexes — `media` shipped with nothing but its primary key, which is fine
-- for the current read-only wall of 200 thumbnails and not fine for a
-- searchable, filtered, paginated surface.
--
-- Trash semantics match `202608171741_blog_soft_delete.sql`: `deletedAt IS
-- NULL` is the live library, `IS NOT NULL` is the trash. Unlike blog posts,
-- a trashed media row keeps its storage object so restoring costs nothing;
-- the object is only removed when the row is permanently deleted, and only
-- then if no OTHER row still points at it (see the note on storagePath below).
--
-- Additive and idempotent. Existing rows get `deletedAt = NULL` (not deleted)
-- and `updatedAt = now()`.

BEGIN;

-- ── Trash ───────────────────────────────────────────────────────────────────

ALTER TABLE "media"
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- ── Modified timestamp ──────────────────────────────────────────────────────
-- Prisma's `@updatedAt` is maintained by the client on write, so there is no
-- trigger here. The DEFAULT exists only so the 665 existing rows get a value
-- when the column is added; Prisma supplies it from then on.

ALTER TABLE "media"
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ── Indexes ─────────────────────────────────────────────────────────────────
-- The library's default read is "not trashed, newest first"; the trash view is
-- the same index read from the other side of the predicate.

CREATE INDEX IF NOT EXISTS "media_deletedAt_createdAt_idx"
  ON "media" ("deletedAt", "createdAt" DESC);

-- Kind is the primary filter chip (image / document / cad), always paired with
-- the same ordering.
CREATE INDEX IF NOT EXISTS "media_kind_createdAt_idx"
  ON "media" ("kind", "createdAt" DESC);

-- NOT a unique index, deliberately, and this is the important one.
--
-- 227 of the 665 rows currently share a `storagePath` with another row: 38
-- distinct files each inserted up to 14 times, all on 2026-08-17, from a
-- datasheet import that re-ran. 225 of those duplicate rows are attached to
-- nothing at all. A UNIQUE constraint would simply fail to create.
--
-- The consequence outlives the cleanup, so the index is here to serve it:
-- because several rows can address one storage object, permanently deleting a
-- row must NOT delete the object while another row still references it, or an
-- unrelated live datasheet 404s. The delete guard queries
-- `... WHERE "storagePath" = $1 AND id <> $2` and needs this index.
--
-- (Bazar, which this feature is modelled on, has storage_key UNIQUE and so
-- never had to think about it. We cannot adopt that until the duplicates are
-- cleaned up — which is what the library's Unused filter is for.)
CREATE INDEX IF NOT EXISTS "media_storagePath_idx"
  ON "media" ("storagePath");

-- Uploader is an unindexed FK today and becomes a filter in the library.
-- 657 of 665 rows have it NULL, so the index is partial — it stays small and
-- only covers the rows that can actually match.
CREATE INDEX IF NOT EXISTS "media_uploadedById_idx"
  ON "media" ("uploadedById")
  WHERE "uploadedById" IS NOT NULL;

COMMIT;
