# SEO Operating System — carry-forward tracker

This file tracks what's intentionally left for follow-up PRs after the
Phase 1 foundation lands. Delete each section as it's shipped.

The original plan lives at
`/Users/ayushkbhatia/.claude/plans/ok-now-a-new-staged-clock.md`
(plan name: "ok-now-a-new-staged-clock"). All terms below match the plan's
section numbers.

---

## Phase 1 — remaining MVP work (next 1–2 PRs)

### 1. SeoEntityDrawer on Product + Category edit pages

**Why next:** the Inspector is read-only today — admins can spot problems
but cannot fix them inline. The drawer is the primary editing surface.

**Build:**
- `apps/admin/src/components/seo/SeoEntityDrawer.tsx` — server component
  rendering tabs General / Social / Schema / Sitemap / AI / Advanced,
  reusing `CharCounter`, `SerpPreview`, `OgPreview`, `JsonLdPreview`,
  `SeoHealthBadge` from `@indus/ui`.
- `apps/admin/src/app/(shell)/products/[id]/edit/seo/actions.ts` —
  `updateProductSeo({ productId, ...seoFields })`. Wraps `withSeoAudit`
  (see #2). Uses `requireRole(..., ROLES.SEO_WRITE)`.
- Mirror for Category.
- Mount the drawer as a tab inside the existing edit pages
  (`apps/admin/src/app/(shell)/products/[id]/edit/page.tsx`,
  `.../categories/[id]/edit/page.tsx`).
- Roll the same drawer to Brand, Industry, BlogPost, CmsPage in a Phase 2
  PR.

**Acceptance:**
- Save updates `seoTitle`, `seoDescription`, `canonicalUrl`, `robotsIndex`,
  `robotsFollow`, `ogImageMediaId`, `focusKeyword`, `sitemapPriority`,
  `sitemapChangeFreq`, `excludeFromSitemap`, `seoUpdatedAt`,
  `seoUpdatedById` on the entity.
- The Inspector grid reflects the change after refresh.
- An audit row is written.

### 2. `withSeoAudit` writer + revert wired to /seo/audit

**Why next:** the audit log viewer is in place but the writer that feeds
it doesn't exist yet, so the page is permanently empty.

**Build:**
- `apps/admin/src/lib/seo-audit.ts` — `withSeoAudit(entityType, entityId,
  before, after, actorId, fn)` that runs `fn` inside a Prisma transaction
  and writes one `SeoAuditLog` row per changed field via
  `diffSnapshots` + `projectSeoFields` from `@indus/domain`.
- `apps/admin/src/app/(shell)/seo/audit/actions.ts` —
  `revertChange(auditLogId): Result<void>`. Reads the row, applies
  `before` to the named field, writes a new audit row with
  `reason: 'reverted'`.
- Add Revert button to each row in `audit/page.tsx`.
- Hook every existing SEO server action to `withSeoAudit`:
  - `seo/actions.ts → saveSeoSettings` (entityType `global:seo_setting`).
  - `seo/actions.ts → addRedirect / deleteRedirect`
    (entityType `redirect`).
  - The drawer save actions from #1.

**Acceptance:**
- Change a product's `seoTitle` → audit log shows one row with the diff.
- Click Revert → field returns to previous value, second row appended.

### 3. Postgres FTS storefront `/search` rewrite

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

### 4. Search admin pages (synonyms, redirects, boosts, analytics)

**Why next:** without these CRUD pages the search subsystem in #3 is
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
