-- Blog content platform — categories, public authors, block bodies and the
-- two join tables that let an article point back into the catalogue.
--
-- Context:
--   `blog_posts` today is a flat table with an HTML-string `body` and a
--   free-text `tags` JSON array whose first element the storefront renders as
--   a category badge. There is no category entity, so there are no category
--   hub pages; no author entity, so there are no author pages and no Person
--   JSON-LD; and no relation to products, so nothing an article says can be
--   linked to something it sells.
--
-- Shape of this change:
--   Strictly ADDITIVE. No column is dropped, renamed or retyped, and
--   `isPublished` is left exactly as it is — `status` is added alongside it
--   and backfilled, so both surfaces keep working while the code migrates.
--   The only destructive statement is the DROP/CREATE of the generated
--   `search_tsv` column, which holds no authored data and is rebuilt in the
--   same transaction.
--
-- Column naming:
--   Prisma in this repo does not @map to snake_case, so Postgres columns are
--   camelCase and MUST be double-quoted. The first version of 202605021638_seo_fts.sql
--   was written in snake_case, silently never applied, and surfaced only when
--   /search returned 500 in production. See migrations/README.md.
--
-- Idempotent: safe to re-run.

BEGIN;

-- ── Enums ────────────────────────────────────────────────────────────────

-- `scheduled` is distinct from `draft` so a post can carry a future
-- publishedAt and be picked up by a job, rather than relying on someone
-- being at a keyboard at the right moment.
DO $$ BEGIN
  CREATE TYPE "BlogPostStatus" AS ENUM ('draft', 'scheduled', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- The SEO OS keys every override, audit row and health score by entity type.
-- Category and author hubs are indexable pages, so they need to be first-class
-- there or they are invisible to the inspector, the audit trail and sitemap
-- priority overrides.
-- Bare statements, not wrapped in DO/EXCEPTION: an exception handler opens a
-- subtransaction, and Postgres refuses ALTER TYPE ... ADD VALUE inside one.
-- IF NOT EXISTS gives the idempotency the wrapper would have provided. Since
-- PG 12 this is legal inside a transaction block provided the new values are
-- not USED in the same transaction — they are not; nothing here writes them.
ALTER TYPE "SeoEntityType" ADD VALUE IF NOT EXISTS 'blog_category';
ALTER TYPE "SeoEntityType" ADD VALUE IF NOT EXISTS 'blog_author';

-- ── blog_categories ──────────────────────────────────────────────────────
--
-- Replaces `tags[0]`-as-category. The point is not tidiness: a category with
-- its own row gets its own URL, and a hub page at /blog/c/[slug] is the thing
-- that accumulates internal links and ranks for a topic. A JSON string can
-- never do that.

CREATE TABLE IF NOT EXISTS "blog_categories" (
  "id"                 TEXT         NOT NULL PRIMARY KEY,
  "slug"               TEXT         NOT NULL,
  "name"               TEXT         NOT NULL,
  "description"        TEXT,
  -- Longer intro copy rendered on the hub page above the article list.
  "heroCopy"           TEXT,
  "position"           INTEGER      NOT NULL DEFAULT 0,
  "isPublished"        BOOLEAN      NOT NULL DEFAULT TRUE,
  "imageId"            TEXT,

  -- SEO OS — same override block every other indexable entity carries.
  "seoTitle"           TEXT,
  "seoDescription"     TEXT,
  "canonicalUrl"       TEXT,
  "robotsIndex"        BOOLEAN      NOT NULL DEFAULT TRUE,
  "robotsFollow"       BOOLEAN      NOT NULL DEFAULT TRUE,
  "ogImageMediaId"     TEXT,
  "focusKeyword"       TEXT,
  "sitemapPriority"    DECIMAL(2,1),
  "sitemapChangeFreq"  "ChangeFreq",
  "excludeFromSitemap" BOOLEAN      NOT NULL DEFAULT FALSE,
  "jsonLdOverride"     JSONB,
  "seoUpdatedAt"       TIMESTAMP(3),
  "seoUpdatedById"     TEXT,

  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY ("imageId")        REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY ("ogImageMediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "blog_categories_slug_key"
  ON "blog_categories" ("slug");
CREATE INDEX IF NOT EXISTS "blog_categories_isPublished_position_idx"
  ON "blog_categories" ("isPublished", "position");

-- ── blog_authors ─────────────────────────────────────────────────────────
--
-- Deliberately NOT extra columns on `staff_users`. Two reasons: an auth table
-- should not carry marketing copy, and a public byline is not the same thing
-- as a login — an outside contributor or a consulting engineer needs a
-- profile without an admin account, and a warehouse user with an account
-- should not become a public page by existing.
--
-- `staffUserId` links the two when they happen to be the same person.

CREATE TABLE IF NOT EXISTS "blog_authors" (
  "id"                 TEXT         NOT NULL PRIMARY KEY,
  "slug"               TEXT         NOT NULL,
  "name"               TEXT         NOT NULL,
  "jobTitle"           TEXT,
  "bio"                TEXT,
  -- Free text, e.g. "BEng Mechanical · IWCF Level 4". Feeds Person JSON-LD
  -- `hasCredential`, which is a large part of why author pages are worth
  -- building at all.
  "credentials"        TEXT,
  "yearsExperience"    INTEGER,
  "avatarMediaId"      TEXT,
  "linkedinUrl"        TEXT,
  "staffUserId"        TEXT,
  "isPublished"        BOOLEAN      NOT NULL DEFAULT TRUE,
  "position"           INTEGER      NOT NULL DEFAULT 0,

  "seoTitle"           TEXT,
  "seoDescription"     TEXT,
  "canonicalUrl"       TEXT,
  "robotsIndex"        BOOLEAN      NOT NULL DEFAULT TRUE,
  "robotsFollow"       BOOLEAN      NOT NULL DEFAULT TRUE,
  "ogImageMediaId"     TEXT,
  "sitemapPriority"    DECIMAL(2,1),
  "sitemapChangeFreq"  "ChangeFreq",
  "excludeFromSitemap" BOOLEAN      NOT NULL DEFAULT FALSE,
  "jsonLdOverride"     JSONB,
  "seoUpdatedAt"       TIMESTAMP(3),
  "seoUpdatedById"     TEXT,

  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY ("avatarMediaId")  REFERENCES "media"("id")       ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY ("ogImageMediaId") REFERENCES "media"("id")       ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY ("staffUserId")    REFERENCES "staff_users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "blog_authors_slug_key"
  ON "blog_authors" ("slug");
CREATE INDEX IF NOT EXISTS "blog_authors_isPublished_position_idx"
  ON "blog_authors" ("isPublished", "position");

-- ── blog_posts: new columns ──────────────────────────────────────────────

ALTER TABLE "blog_posts"
  -- Typed block array validated by BlogBlocksSchema in @indus/domain. `body`
  -- stays put: it is the fallback while posts migrate, and dropping it would
  -- take the FTS column and the admin editor with it.
  ADD COLUMN IF NOT EXISTS "bodyBlocks"     JSONB        NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Article JSON-LD emits dateModified from seoUpdatedAt today, which only
  -- moves when someone opens the SEO tab. A real updatedAt makes that honest.
  ADD COLUMN IF NOT EXISTS "readingMinutes" INTEGER,
  ADD COLUMN IF NOT EXISTS "status"         "BlogPostStatus" NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS "categoryId"     TEXT,
  ADD COLUMN IF NOT EXISTS "blogAuthorId"   TEXT,
  -- Standards content carries pressure ratings and clause references. A named
  -- reviewer and a date make "who checked this" answerable rather than
  -- assumed.
  ADD COLUMN IF NOT EXISTS "reviewedById"   TEXT,
  ADD COLUMN IF NOT EXISTS "reviewedAt"     TIMESTAMP(3);

DO $$ BEGIN
  ALTER TABLE "blog_posts"
    ADD CONSTRAINT "blog_posts_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "blog_categories"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "blog_posts"
    ADD CONSTRAINT "blog_posts_blogAuthorId_fkey"
    FOREIGN KEY ("blogAuthorId") REFERENCES "blog_authors"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "blog_posts"
    ADD CONSTRAINT "blog_posts_reviewedById_fkey"
    FOREIGN KEY ("reviewedById") REFERENCES "staff_users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Backfill `status` from the boolean it shadows, so the two agree from the
-- first moment rather than after a code deploy.
UPDATE "blog_posts"
   SET "status" = 'published'
 WHERE "isPublished" = TRUE
   AND "status" = 'draft';

-- Existing rows predate createdAt; the publication date is the closest true
-- value available, and CURRENT_TIMESTAMP would claim every archive post was
-- written today.
UPDATE "blog_posts"
   SET "createdAt" = "publishedAt"
 WHERE "publishedAt" IS NOT NULL
   AND "createdAt" > "publishedAt";

CREATE INDEX IF NOT EXISTS "blog_posts_status_publishedAt_idx"
  ON "blog_posts" ("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "blog_posts_categoryId_status_publishedAt_idx"
  ON "blog_posts" ("categoryId", "status", "publishedAt");
CREATE INDEX IF NOT EXISTS "blog_posts_blogAuthorId_status_publishedAt_idx"
  ON "blog_posts" ("blogAuthorId", "status", "publishedAt");

-- ── blog_post_products ───────────────────────────────────────────────────
--
-- The loop that makes the blog pay: articles link down into products, and
-- product pages surface "related reading" back up. Without a relation, that
-- second direction is impossible and the blog stays a cul-de-sac.
--
-- Populated from `product_embed` blocks, but stored relationally so a product
-- page can ask "which articles mention me" without scanning every JSON body.

CREATE TABLE IF NOT EXISTS "blog_post_products" (
  "postId"    TEXT         NOT NULL,
  "productId" TEXT         NOT NULL,
  "position"  INTEGER      NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY ("postId", "productId"),
  FOREIGN KEY ("postId")    REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("productId") REFERENCES "products"("id")   ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "blog_post_products_productId_idx"
  ON "blog_post_products" ("productId");

-- ── blog_post_categories ─────────────────────────────────────────────────
--
-- Cross-links a post to CATALOGUE categories (/c/[slug]) — not to its own
-- blog category, which is the scalar `categoryId` above. Same rationale:
-- lets a category page show the articles that lead into it.

CREATE TABLE IF NOT EXISTS "blog_post_categories" (
  "postId"     TEXT         NOT NULL,
  "categoryId" TEXT         NOT NULL,
  "position"   INTEGER      NOT NULL DEFAULT 0,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY ("postId", "categoryId"),
  FOREIGN KEY ("postId")     REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "blog_post_categories_categoryId_idx"
  ON "blog_post_categories" ("categoryId");

-- ── Row Level Security ───────────────────────────────────────────────────
--
-- Enabled with NO policies, matching 202605110531_enable_rls_unprotected_tables.sql. Prisma connects as postgres and
-- bypasses RLS; the only Supabase JS client uses the service role and touches
-- Storage, not these tables. This locks the anon role out by default.

ALTER TABLE "blog_categories"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blog_authors"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blog_post_products"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blog_post_categories"  ENABLE ROW LEVEL SECURITY;

-- ── FTS rebuild ──────────────────────────────────────────────────────────
--
-- SUPERSEDES 202605052109_blog_fts.sql. That definition draws weight C from `body`
-- alone. Once article text lives in `bodyBlocks`, a post written entirely in
-- blocks would be searchable by title and excerpt only — no error, no failing
-- test, just quietly worse results. This is the failure mode the plan flagged.
--
-- `jsonb_to_tsvector` with an explicit 'english' regconfig is IMMUTABLE, which
-- is what a generated column requires; the two-argument form reads
-- default_text_search_config and is only STABLE, so it cannot be used here.
-- If this ever rejects on apply, that is the reason.
--
-- The '["string"]' filter takes every string value in the document. That
-- sweeps in block type discriminators ("paragraph") and anchors alongside the
-- prose, which is mild noise — and it also makes any SKU named in a
-- product_embed block searchable, which is worth more than the noise costs.

ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "search_tsv";

ALTER TABLE "blog_posts"
  ADD COLUMN "search_tsv" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce("title", '')),   'A') ||
    setweight(to_tsvector('english', coalesce("excerpt", '')), 'B') ||
    setweight(to_tsvector('english', coalesce("body", '')),    'C') ||
    setweight(
      jsonb_to_tsvector('english', coalesce("bodyBlocks", '[]'::jsonb), '["string"]'),
      'C'
    )
  ) STORED;

DROP INDEX IF EXISTS "blog_posts_search_tsv_idx";
CREATE INDEX "blog_posts_search_tsv_idx" ON "blog_posts" USING GIN ("search_tsv");

COMMIT;
