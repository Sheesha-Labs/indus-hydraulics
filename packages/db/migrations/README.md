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

| File | Purpose |
|------|---------|
| `001_seo_fts.sql` | Wire the SEO OS Postgres FTS pieces: `pg_trgm` extension, generated `products.search_tsv` column, GIN indexes, audit-log helper index. Required for `apps/storefront/src/app/search/page.tsx` and the AI Suggest layer. |
