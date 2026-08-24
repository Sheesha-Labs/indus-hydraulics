-- Blog category hubs get a block-authored body.
--
-- The hubs already carry CollectionPage + BreadcrumbList JSON-LD and collect
-- the internal links from every article in their topic, but they render an H1,
-- one line of hero copy and a card grid. That is a listing page wearing a
-- pillar page's job: nothing on it answers a question, so nothing on it earns
-- a link or a citation.
--
-- `bodyBlocks` is the same discriminated union the articles use, so a hub can
-- carry a comparison table, an FAQ, a decision tree and a CTA through the
-- renderer that already exists. Reusing the article machinery rather than
-- adding a category-only prose field is deliberate — a second content system
-- for the same kind of content is how the two drift.
--
-- Nullable with no default: a hub with no body renders exactly as it does
-- today, so this is safe to apply ahead of the code that reads it.

ALTER TABLE "blog_categories"
  ADD COLUMN IF NOT EXISTS "bodyBlocks" JSONB;

COMMENT ON COLUMN "blog_categories"."bodyBlocks" IS
  'Block-authored hub body, same schema as blog_posts.bodyBlocks. Rendered between the hub header and the article grid. NULL renders no body.';
