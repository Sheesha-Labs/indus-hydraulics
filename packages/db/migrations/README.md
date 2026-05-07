# Raw SQL migrations

This project drives schema changes through `pnpm db:push` (Prisma `db push`),
not `prisma migrate`. Files in this directory cover Postgres-specific bits
that Prisma's schema language cannot express:

- generated `tsvector` columns (`GENERATED ALWAYS AS (...) STORED`)
- extensions (`pg_trgm`)
- partial / expression indexes that don't round-trip through `@@index`

## Apply order

After every `pnpm db:push`, run each file in numeric order against the same
database. The contents are idempotent — re-running them is safe.

```bash
psql "$DATABASE_URL" -f packages/db/migrations/001_seo_fts.sql
```

## Files

| File | Purpose | Applied to prod |
|------|---------|-----------------|
| `001_seo_fts.sql` | Wire the SEO OS Postgres FTS pieces: `pg_trgm` extension, generated `products.search_tsv` column, GIN indexes, audit-log helper index. Required for `apps/storefront/src/app/search/page.tsx` and the AI Suggest layer. | 2026-05-04 (as `seo_fts_search_indexes`) |
| `20260501_enforce_one_datasheet_per_product.sql` | Partial unique index ensuring at most one datasheet per product. | yes |
| `002_counters.sql` | `counters` table backing the atomic code generators added in PR #51 (RFQ, ACC, quote). Backfills counter rows from `MAX` of existing codes. Hand-rolled because `db push` would attempt to drop the FTS-managed `products.search_tsv` column. | 2026-05-05 (as `counters_atomic_codes`) |
| `003_email_retry.sql` | Adds `retryCount` / `lastAttemptAt` / `payload` columns to `sent_emails` plus a composite index, backing the email retry queue. Existing rows default to retryCount=0, no payload — never retried. | yes |
| `004_product_compare_at_price.sql` | Adds optional `compareAtPrice` column on `products` for strike-through MSRP display alongside `listPrice`. Renders only when strictly greater than listPrice — never a fake discount. | 2026-05-05 (as `product_compare_at_price`) |
| `005_blog_fts.sql` | STORED generated `tsvector` column on `blog_posts` (title weight A, excerpt B, body C) plus GIN index. Backs the multi-type search results page so blog posts surface alongside products. | 2026-05-05 (as `blog_fts_search_indexes`) |

> **Column-naming note:** Prisma in this repo does not use `@map` to snake_case
> table columns, so the underlying Postgres columns are camelCase (e.g. `"descriptionShort"`,
> `"entityId"`, `"actorId"`, `"createdAt"`). Raw SQL must double-quote those identifiers.
> The first version of `001_seo_fts.sql` was written in snake_case and silently never
> got applied — surfaced when `/search` returned 500 in production after launch.
