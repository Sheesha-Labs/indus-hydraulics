# Raw SQL migrations

Schema changes in this repo are hand-rolled SQL, applied manually. Files here
cover both the Postgres-specific bits Prisma's schema language cannot express
and, in practice, every other schema change too:

- generated `tsvector` columns (`GENERATED ALWAYS AS (...) STORED`)
- extensions (`pg_trgm`)
- partial / expression indexes that don't round-trip through `@@index`
- ordinary column and table additions

> **`pnpm db:push` does not work against this database and must not be run.**
> `202605021638_seo_fts.sql` adds `products.search_tsv`, a STORED generated
> column that `schema.prisma` does not model. Every `db push` therefore
> proposes dropping it and stops at Prisma's data-loss guard. Passing
> `--accept-data-loss` does not fix it — it deletes the column and breaks
> `/search` in production. Edit `schema.prisma` for the types, write the SQL
> here for the database, and keep the two in step by hand.

## Naming

    YYYYMMDDHHMM_snake_case_description.sql

**A timestamp, never a sequence number.** Sequence numbers were the convention
until 2026-08-17 and they collided: a shared counter that every open branch
reads at the same moment and increments independently produces the same next
number in each. Two branches shipped a `014_` on the same day, and the second
one only found out when GitHub refused to merge it. With this many worktrees
open at once that outcome is structural, not bad luck.

A timestamp comes from when *you* wrote the file, so two authors collide only
by writing in the same minute. `migration-filenames.test.ts` fails the build if
they do, if a name does not match the pattern, or if a file is missing from the
table below.

```bash
echo "packages/db/migrations/$(date +%Y%m%d%H%M)_add_the_thing.sql"
```

Local time, not UTC — the prefix only has to sort correctly against its
neighbours, and mixing the two would put a file in the wrong place for anyone
reasoning about the order by eye.

## Applying

Files sort lexically into the order they were written, so apply them in plain
`ls` order. Contents are idempotent — re-running one is safe.

Two routes, both fine:

```bash
# Preferred locally: raw SQL over the direct (non-pooled) connection.
# `db execute` does not trip the data-loss guard that blocks `db push`.
pnpm --filter @indus/db exec prisma db execute \
  --file migrations/<file>.sql --schema prisma/schema.prisma
```

Or the Supabase MCP `apply_migration` tool, which is how most of the older
files landed.

**Apply before merging the PR that needs it.** The deployed code expects the
new columns the moment it boots; SQL that lands after the deploy shows up as
`column does not exist` in production.

After editing `schema.prisma`, regenerate the client — this touches no
database:

```bash
pnpm --filter @indus/db db:generate
```

## Files

| File | Purpose | Applied to prod |
|------|---------|-----------------|
| `202605011736_enforce_one_datasheet_per_product.sql` | Partial unique index ensuring at most one datasheet per product. | yes |
| `202605021638_seo_fts.sql` | Wire the SEO OS Postgres FTS pieces: `pg_trgm` extension, generated `products.search_tsv` column, GIN indexes, audit-log helper index. Required for `apps/web/src/app/search/page.tsx` and the AI Suggest layer. | 2026-05-04 (as `seo_fts_search_indexes`) |
| `202605051945_counters.sql` | `counters` table backing the atomic code generators added in PR #51 (RFQ, ACC, quote). Backfills counter rows from `MAX` of existing codes. Hand-rolled because `db push` would attempt to drop the FTS-managed `products.search_tsv` column. | 2026-05-05 (as `counters_atomic_codes`) |
| `202605051958_email_retry.sql` | Adds `retryCount` / `lastAttemptAt` / `payload` columns to `sent_emails` plus a composite index, backing the email retry queue. Existing rows default to retryCount=0, no payload — never retried. | yes |
| `202605052047_product_compare_at_price.sql` | Adds optional `compareAtPrice` column on `products` for strike-through MSRP display alongside `listPrice`. Renders only when strictly greater than listPrice — never a fake discount. | 2026-05-05 (as `product_compare_at_price`) |
| `202605052109_blog_fts.sql` | STORED generated `tsvector` column on `blog_posts` (title weight A, excerpt B, body C) plus GIN index. Backs the multi-type search results page so blog posts surface alongside products. **Superseded by `202608171153_blog_content_platform.sql` — the column it defines draws weight C from `body` alone and is dropped and rebuilt there. Do not re-run this after `202608171153_blog_content_platform.sql`, or blog search silently loses every block-authored article.** | 2026-05-05 (as `blog_fts_search_indexes`) |
| `202605072210_homepage_hero_slides.sql` | `homepage_hero_slides` table backing the ordered carousel on the storefront homepage's right-side visual. Each slide references a `media` row and reuses the existing public `product-images` bucket, so no new bucket was needed. Mirrors the Prisma model `HomepageHeroSlide`. | yes — via `apply_migration`; exact date not recorded |
| `202605110350_service_cases.sql` | `service_cases` plus the `ServiceCaseStatus` / `ServiceCaseCategory` / `ServiceCaseCardTagStyle` enums, backing the case-study-led `/services` section. Replaces the earlier "BOP services modelled as products" pattern. Idempotent. | yes — via `apply_migration`; exact date not recorded |
| `202605110511_newsletter_subscribers.sql` | `newsletter_subscribers` table backing the homepage newsletter form. Holds email, status enum (active / unsubscribed / bounced), source, sha256-hashed IP, user-agent. Unique index on email; secondary indexes on status + createdAt for ops queries and chronological export. | 2026-05-11 (as `newsletter_subscribers`) |
| `202605110531_enable_rls_unprotected_tables.sql` | Enables Row Level Security (no policies) on the 23 tables that shipped with RLS disabled — every table added via the hand-rolled SQL migrations. Closes the Supabase advisory that warned the anon role could read/write those rows. Prisma + the service-role Supabase JS client both bypass RLS, so this is a no-op for runtime behaviour; only the public anon role loses access. | 2026-05-11 (as `enable_rls_unprotected_tables`) |
| `202605301144_competitor_scraper.sql` | `scraper_jobs` + `scraped_products` and three enums, backing the competitor-catalogue scraper that ingests images into our own `Product`/`Media`/`ProductImage` tables. Hand-rolled because `db push` proposes dropping the FTS-managed `search_tsv` generated columns on `products` and `service_cases` — it does not recognise a GENERATED column. | yes — via `apply_migration`; exact date not recorded |
| `202608141633_staff_signin_lockout.sql` | Adds `lastSignInAt`, `failedSignInCount`, `lockedUntil` to `staff_users` so staff sign-in gets the same lockout `account_contacts` already had. Additive, zero-downtime. | 2026-08-14 (as `staff_user_signin_lockout`) |
| `202608151515_staff_invitations.sql` | `staff_invitations` + the `InvitationPurpose` enum. Staff invites and password resets are the same mechanism — an emailed, expiring, single-use link ending at a set-your-password screen — so they share one table discriminated by `purpose`. The raw token is never stored, only `sha256(token)`, mirroring `password_reset_tokens` on the customer side. | 2026-08-15 (as `staff_invitations`) |
| `202608171153_blog_content_platform.sql` | Blog content platform: `blog_categories` and `blog_authors` tables, the `blog_post_products` / `blog_post_categories` join tables, `BlogPostStatus` enum, and new `blog_posts` columns (`bodyBlocks`, `status`, `createdAt`, `updatedAt`, `readingMinutes`, `categoryId`, `blogAuthorId`, `reviewedById`, `reviewedAt`). Extends `SeoEntityType` with `blog_category` / `blog_author`. Rebuilds `blog_posts.search_tsv` to index `bodyBlocks` via `jsonb_to_tsvector`, superseding `005`. Strictly additive — `isPublished` and `body` are both retained. RLS enabled with no policies on all four new tables, matching `202605110531_enable_rls_unprotected_tables.sql`. | 2026-08-17 (as `blog_content_platform`) |
| `202608171741_blog_soft_delete.sql` | Adds `deletedAt` to `blog_posts` plus a `(deletedAt, status)` index, backing the Trash view on the Blog Editor list. Deleting a post marks the row instead of removing it; permanent delete stays available from the trash for `super_admin` / `manager`. Trashing also forces `isPublished` false in application code, which every storefront read already filters on, so no public query needs a second gate. | 2026-08-17 (as `blog_soft_delete`) |
| `202608171758_store_settings_brand_identity.sql` | Brand & identity: adds `logoStyle` (text + CHECK, defaults `mark_and_name`), `footerLogoMediaId`, `faviconMediaId` and `searchLogoMediaId` to `store_settings`, each an `ON DELETE SET NULL` FK to `media` matching the existing `logoMediaId`. Backs the Brand & Identity tab at `/admin/settings?tab=brand` — the header logo, the reversed footer lockup, the tab favicon and the square mark search engines draw. Strictly additive: every column is nullable or defaulted, so existing rows render exactly what they rendered before. Applied with `prisma db execute` over `DIRECT_URL` rather than the supabase MCP — `db execute` runs raw SQL and does not trip the FTS data-loss guard that blocks `db push`. | 2026-08-17 (as `store_settings_brand_identity`) |
| `202608171847_media_library.sql` | Media library groundwork (phase 2 of 9): adds `deletedAt` (trash, same semantics as `202608171741_blog_soft_delete.sql`) and `updatedAt` to `media`, plus the four indexes the table has never had — it shipped with only its primary key. `(deletedAt, createdAt DESC)` serves both the live list and the trash view; `(kind, createdAt DESC)` serves the filter chips; `uploadedById` is partial because 657 of 665 rows have it NULL. **`storagePath` gets a plain index, not a unique one, deliberately** — 227 rows currently share a `storagePath` with another row (38 files each inserted up to 14 times by a datasheet import that re-ran; 225 of those duplicates are attached to nothing). A UNIQUE constraint would fail to create, and the consequence outlives any cleanup: because several rows can address one storage object, permanent delete must not remove the object while another row still points at it, and that guard needs this index. Strictly additive and idempotent. | 2026-08-17 (via `prisma db execute` over `DIRECT_URL`) |
| `202608220120_about_keyword_url_nav.sql` | Repoints the header and footer "About" nav items from `/about` to `/hydraulic-components-supplier-uae` after the company page moved to a descriptive URL. Data-only — no schema change. Needed because nav lives in `nav_menu_items` and `seed.ts` only writes when the menu is empty (`if (headerCount === 0)`), so re-seeding never touches an existing database; without this both links keep taking a pointless redirect hop. Matches on the exact `customUrl` rather than the label, so a renamed item is still caught and an unrelated item labelled "About" is not. Verified against prod beforehand: exactly two `custom_url` rows held `/about`, no `cms_pages` row used the slug, and no redirect already existed. Applied only after the deploy that added the new route — earlier and the nav would have pointed at a URL that did not exist yet. Two rows updated, zero stragglers; the nav cache is `unstable_cache` with `revalidate: 60`, so the live header picked it up about a minute later. | 2026-08-22 (via `$executeRawUnsafe`, after #277 deployed) |

> **Column-naming note:** Prisma in this repo does not use `@map` to snake_case
> table columns, so the underlying Postgres columns are camelCase (e.g. `"descriptionShort"`,
> `"entityId"`, `"actorId"`, `"createdAt"`). Raw SQL must double-quote those identifiers.
> The first version of `202605021638_seo_fts.sql` was written in snake_case and silently never
> got applied — surfaced when `/search` returned 500 in production after launch.

## Renamed from sequence numbers

Every file was renamed on 2026-08-17 when the convention changed. The new
prefix is the moment the file was first committed, so the order is unchanged.
Nothing tracks these files by name — there is no `_prisma_migrations` table and
no code reads the directory — so the rename was safe; this table is only here
so older PRs, commit messages and comments that say "migration 013" remain
traceable.

| Was | Now |
|-----|-----|
| `20260501_enforce_one_datasheet_per_product.sql` | `202605011736_enforce_one_datasheet_per_product.sql` |
| `001_seo_fts.sql` | `202605021638_seo_fts.sql` |
| `002_counters.sql` | `202605051945_counters.sql` |
| `003_email_retry.sql` | `202605051958_email_retry.sql` |
| `004_product_compare_at_price.sql` | `202605052047_product_compare_at_price.sql` |
| `005_blog_fts.sql` | `202605052109_blog_fts.sql` |
| `006_homepage_hero_slides.sql` | `202605072210_homepage_hero_slides.sql` |
| `007_service_cases.sql` | `202605110350_service_cases.sql` |
| `008_newsletter_subscribers.sql` | `202605110511_newsletter_subscribers.sql` |
| `009_enable_rls_unprotected_tables.sql` | `202605110531_enable_rls_unprotected_tables.sql` |
| `010_competitor_scraper.sql` | `202605301144_competitor_scraper.sql` |
| `011_staff_signin_lockout.sql` | `202608141633_staff_signin_lockout.sql` |
| `012_staff_invitations.sql` | `202608151515_staff_invitations.sql` |
| `013_blog_content_platform.sql` | `202608171153_blog_content_platform.sql` |
| `014_blog_soft_delete.sql` | `202608171741_blog_soft_delete.sql` |
| `015_store_settings_brand_identity.sql` | `202608171758_store_settings_brand_identity.sql` |
