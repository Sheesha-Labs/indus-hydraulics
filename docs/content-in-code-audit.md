# Which content still costs a deployment

Audited 2026-08-26. The question behind it: adding content through a commit
costs a build, a deploy, and a cold ISR cache for ~1,790 URLs. Adding the same
content through `/admin` costs nothing. So — what is still in code that has a
home in the database?

## Already in the database, with an admin screen

Adding to any of these is **zero deployments**.

| Content | Rows | Screen |
|---|---|---|
| Products | 1,495 | `/admin/products` (+ CSV importer) |
| Categories | 195 | `/admin/categories` |
| Blog posts | 93 | `/admin/blog` |
| Brands | 29 | `/admin/brands` |
| Service cases | 20 | — *(no admin screen; see below)* |
| Industries | 6 | `/admin/industries` |
| Homepage hero slides | 4 | `/admin/pages/hero` |
| Navigation, footer, SEO settings, media | — | `/admin/navigation`, `/admin/footer`, `/admin/seo`, `/admin/media` |

Category SEO is worth calling out: all 195 rows already carry `seoTitle`,
`seoDescription` and `shortDescription`. When those were written they arrived as
a committed seed script — the storage was right, the delivery mechanism still
cost a deploy. Writing them straight to the database would not have.

## The CMS that exists and is not being used

`page_content` holds **one row**.

Pages & Blocks sits behind all ten marketing pages plus the market and brand
sub-pages, and falls back to the wording declared in
`@indus/domain/page-sections` whenever nothing has been saved. Nothing has been
saved. So every copy change to those pages has been a code edit and a deploy,
for content that already had a home and an editor.

**This is the single biggest saving available, and it needs no new code.** Move
the copy into the editor once, and marketing-page edits stop being deployments.

## Still in code, with no database home

| Content | Size | Notes |
|---|---|---|
| Market page records | **~17,800 lines** across 6 files | 126 markets: lede, facts, manifest, map geometry, routes |
| Hero geo variants | 127 entries | One possessive per country |
| Product alternate names | 715 lines | Search synonyms |
| Designed pages | ~1,600 lines | `manufacturing-page.ts`, `quality-control-page.ts`, `industry-pages.ts` |

The market records dominate — over half the domain package. They are genuinely
editorial (a lede, a facts table) mixed with genuine configuration (projected
coordinates, route geometry).

**Not recommended right now.** Moving them means a table, a migration for 126
rich records, an editor to make it worth having, and the `releasedMarketPage`
gate reproduced against rows. All 126 markets were released on 2026-08-24 and the
content is stable, so the deploy-frequency saving is small against that effort.
Revisit if market copy starts changing regularly.

The hero geo variants are the same shape and a tenth of the size: one line of
copy per country, changed almost never. Leave them.

## Service cases have no editor

Twenty rows in the database, a public route family, and no `/admin/services`
screen — so adding or editing a case means a commit. The smallest gap worth
closing if service content is going to keep growing.

## The rule

Before writing content into code, check whether a table and a screen already
exist for it. Usually one does. Genuinely new code — a template, a route, a
component — is what deployments are for.
