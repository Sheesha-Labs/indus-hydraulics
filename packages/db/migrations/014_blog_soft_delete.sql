-- 014_blog_soft_delete.sql
--
-- Soft delete for blog posts, backing the Delete action on the Blog Editor
-- list. Deleting a live article from a table row is one click away from
-- irreversible, so the row is marked rather than removed and lands in a Trash
-- view it can be restored from. Permanent delete stays available there, admin
-- only.
--
-- Trashing also forces `isPublished` false in application code, which is what
-- every storefront read already filters on — so no public query needs a second
-- gate on this column.
--
-- Additive and idempotent. Existing rows get NULL, i.e. "not deleted".

BEGIN;

ALTER TABLE "blog_posts"
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- The admin list filters on `deletedAt IS NULL` and orders by status; the
-- Trash view filters on `deletedAt IS NOT NULL`.
CREATE INDEX IF NOT EXISTS "blog_posts_deletedAt_status_idx"
  ON "blog_posts" ("deletedAt", "status");

COMMIT;
