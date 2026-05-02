# SEO Operating System — carry-forward tracker

This file tracks what's intentionally left for follow-up PRs after the
Phase 1 foundation lands. Delete each section as it's shipped.

The original plan lives at
`/Users/ayushkbhatia/.claude/plans/ok-now-a-new-staged-clock.md`
(plan name: "ok-now-a-new-staged-clock"). The drawer/audit PR's plan is
at `/Users/ayushkbhatia/.claude/plans/seo-os-drawer-and-audit.md`.

---

## ✅ Shipped (PR #4 — feat/seo-os-drawer)

- SeoEntityDrawer mounted on Product + Category edit pages.
- `withSeoAudit` transactional writer; every SEO mutation now writes audit rows.
- Revert action wired into `/seo/audit` (Revert button per row).
- Existing `saveSeoSettings`, `addRedirect`, `deleteRedirect` routed through `withSeoAudit`.
- Inspector titles deep-link into the drawer for Product + Category.

## Phase 1 — remaining MVP work

### 1. SeoEntityDrawer on Brand, Industry, BlogPost, CmsPage

**Why next:** the drawer pattern works for Product/Category — rolling it
to the remaining 4 entity types is mechanical now and unblocks editing
SEO across the whole catalogue.

**Build (per entity type):**
- New `apps/admin/src/app/(shell)/<entity>/[id]/edit/{page,actions,EditorClient}.tsx`
  mirroring the category editor's pattern, OR mount the drawer as a tab
  inside the existing edit screen if one exists.
- New action `update<Entity>Seo` wrapping `withSeoAudit` (entityType =
  'brand' | 'industry' | 'blog_post' | 'cms_page').
- Add the entity to `editPathFor` in
  `apps/admin/src/app/(shell)/seo/inspector/page.tsx`.

**Acceptance:**
- Save updates the same 11 SEO fields shipped in PR #4.
- Audit rows appear with the right `entityType`.
- Inspector deep-links work.

### 2. Postgres FTS storefront `/search` rewrite

**Why next:** the schema changes (`Unsupported("tsvector")` on Product)
and SQL migration for `pg_trgm` + GIN indexes already shipped — the
search page still uses the old Prisma `OR contains` query, leaving the
investment unrealised.

**Build:**
- `apps/storefront/src/lib/search.ts` — calls `planSearch` from
  `@indus/domain`, then either issues a `redirect()` for the
  `kind: 'redirect'` case or runs a parameterised `db.$queryRaw` against
  `search_tsv` with `websearch_to_tsquery` + `ts_rank_cd` × `boost`,
  falling back to `pg_trgm %>` similarity when the FTS hit count is 0.
- Replace the substring loop in
  `apps/storefront/src/app/search/page.tsx`.
- `apps/storefront/src/app/api/search/log/route.ts` — POST endpoint
  inserting `SearchQueryLog`.
- `apps/storefront/src/app/api/search/suggest/route.ts` — autocomplete
  (prefix tsquery, returns 8 products + categories).
- `apps/storefront/src/components/SearchAutocomplete.tsx` — debounced
  client island, used in `SiteHeader`.
- Result anchors fire a `navigator.sendBeacon` to update
  `clickedSku`/`clickedAt` on the originating `SearchQueryLog`.

**Acceptance:**
- `/search?q=oring` returns the same set as `/search?q=o-ring` once a
  synonym group is defined.
- A misspelled SKU (e.g. `1064-6-6`) still returns the closest
  `pg_trgm` match.
- `SearchQueryLog` rows accumulate.

### 3. Search admin pages (synonyms, redirects, boosts, analytics)

**Why next:** without these CRUD pages the search subsystem in #2 is
inert.

**Build:** four sub-pages under
`apps/admin/src/app/(shell)/seo/search/`:
- `synonyms/` — group editor; CRUD over `SearchSynonym`.
- `redirects/` — query → URL; CRUD over `SearchRedirect`.
- `boosts/` — pin/bury rules per entity; CRUD over `SearchBoost` with
  optional `expiresAt`.
- `queries/` — read-only analytics over `SearchQueryLog`: top queries,
  zero-result queries, no-click queries (last 30 days).

Replace the placeholder at `seo/search/page.tsx` with a sub-tab nav.

---

## Phase 2 (next 4 weeks of build)

### 5. AI Suggest drawer (Sonnet streaming) + Accept/Reject

- `apps/admin/src/app/(shell)/seo/ai/actions.ts` —
  `generateSuggestion`, `acceptSuggestion`, `rejectSuggestion`,
  `upsertPromptTemplate`. Reads `AiPromptTemplate.systemPrompt` (cached
  prefix), renders user template via `renderTemplate` from
  `@indus/domain`, calls Anthropic Messages API with streaming.
- Per-entity AI tab in `SeoEntityDrawer` — uses `DiffView` from
  `@indus/ui`. Accept writes the field via the same `withSeoAudit` path.
- Default templates seeded into `AiPromptTemplate` (one per
  `AiPromptKind` × `SeoEntityType` combination that matters).
- Cost telemetry: record `inputTokens`, `outputTokens`, `cacheHitRatio`,
  `costUsdMicros` on each `AiSuggestion`. Enforce
  `AiUsageQuota.monthlyUsdCapMicros` server-side.
- `seo/ai/templates/page.tsx` — CRUD UI for prompt templates.
- `seo/ai/quota/page.tsx` — per-user spend dashboard.

**Models:** `claude-haiku-4-5` for bulk, `claude-sonnet-4-6` for
per-entity quality. Wire prompt caching with the system prefix marked
`cache_control: { type: 'ephemeral' }`.

### 6. Inngest setup + bulk AI fan-out

- Add `inngest` package; mount handler at
  `apps/admin/src/app/api/inngest/route.ts`.
- Functions:
  - `ai.bulk.generate` — chunked Anthropic Batch API submission, polling,
    write `AiSuggestion` rows.
  - `seo.health.recompute_all` — nightly fan-out, populate
    `SeoHealthScore`.
  - `seo.sitemap.regenerate` — debounced revalidate of `/sitemap.xml`.
  - `seo.404.aggregate` — hourly dedupe of `NotFoundLog`.
- Inspector multi-select → "AI generate (bulk)" calls the Inngest
  function and returns a batchId; `/seo/ai/runs` page polls
  `getBatchStatus`.

### 7. SEO entity drawer rolled to remaining 4 entity types

Brand, Industry, BlogPost, CmsPage edit pages get the same drawer that
landed for Product/Category in #1.

### 8. Site-wide health dashboard

Replace the `seo/health/page.tsx` placeholder with:
- Average score across all entities, broken down by type.
- Trend chart (7/30/90 day) — requires `SeoHealthScore.computedAt`
  history; recompute job is in #6.
- Worst-offender list with deep-link to drawer.

### 9. 404 log capture middleware + suggestions UI

- Add a tiny POST endpoint `apps/storefront/src/app/api/seo/404-log/route.ts`
  called from `not-found.tsx`. Upserts `NotFoundLog` (fire-and-forget).
- New page `seo/redirects/not-found/page.tsx` lists top 404s with
  one-click "Add redirect" workflow.

### 10. Sitemap previewer drill-in + exclusions browser

Today the page renders counts only. Add:
- Filterable list of would-be-included entries.
- Quick toggle for `excludeFromSitemap` on selected rows.

### 11. Redirect chain detector + CSV import

- `seo/redirects/actions.ts → detectRedirectChains()` walks the
  `Redirect` table as a graph and reports cycles + chains ≥ 2 hops.
- `seo/redirects/import/page.tsx` accepts a CSV (fromPath, toPath,
  statusCode), validates, writes through `addRedirect`.

### 12. Storefront middleware for redirects + 404 log

`apps/storefront/proxy.ts` — read `Redirect` table cached via
`unstable_cache(tag: 'redirects')`, issue 301/302/307/308 before page
render, increment `Redirect.hits` async. Capture 404s into
`NotFoundLog`.

---

## Phase 3 — polish

### 13. Internal-link crawler

- Inngest weekly `seo.crawl.weekly` BFS from `/`, max 5k pages, 8
  concurrency. Writes `CrawlEdge` then derives `CrawlFinding` rows
  (orphan, broken, redirect_chain, deep, dup_canonical).
- `seo/crawl/page.tsx` — run history + findings; hook findings into the
  Inspector grid ("3 broken links from this page").

### 14. JSON-LD per-entity override editor + validator

In the SEO drawer's Schema tab: full-text JSON editor with schema.org
validation, written into the entity's `jsonLdOverride` column. The
storefront builders (`buildProductLd` etc.) already deep-merge this.

### 15. Google Search Console integration

- OAuth connect (per-staff token).
- Daily Inngest `gsc.daily.sync` paginated `searchanalytics.query` for
  the last 90 days into `GscMetricDaily`.
- Inspector grid joins on URL to show impressions / CTR / position.
- Drawer shows "Suggested focus keywords" — top 10 GSC queries by
  impressions where `position ∈ [8, 25]`.

### 16. Trending searches + zero-result auto-suggestions

Surface `SearchQueryLog` aggregations on the home admin dashboard.

### 17. Optional: staging preview for global SEO changes

Robots.txt and global SeoSetting changes get a "preview on staging"
before the audit log flips them in production. Skip if effort > value.

---

## Sanity checks before shipping each PR

- `pnpm typecheck`
- `pnpm test --filter @indus/domain`
- `pnpm test --filter @indus/db`
- Storefront: verify `/robots.txt`, `/sitemap.xml`, and one product
  page's JSON-LD with Google Rich Results Test.
- Lighthouse SEO ≥ 95 on the touched routes.
