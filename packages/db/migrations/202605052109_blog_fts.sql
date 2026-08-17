-- Blog FTS — adds a STORED generated tsvector column on `blog_posts` so
-- `/search` can return blog articles alongside products. Mirrors the
-- pattern from 202605021638_seo_fts.sql (products.search_tsv).
--
-- Weights:
--   A — title                 (most important match)
--   B — excerpt
--   C — body                  (long-form, less prioritised)
--
-- Idempotent: drops + recreates the column each apply so weight tweaks
-- can ship without manual cleanup.

BEGIN;

ALTER TABLE blog_posts DROP COLUMN IF EXISTS search_tsv;

ALTER TABLE blog_posts
  ADD COLUMN search_tsv tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')),    'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')),  'B') ||
    setweight(to_tsvector('english', coalesce(body, '')),     'C')
  ) STORED;

DROP INDEX IF EXISTS blog_posts_search_tsv_idx;
CREATE INDEX blog_posts_search_tsv_idx ON blog_posts USING GIN (search_tsv);

COMMIT;
