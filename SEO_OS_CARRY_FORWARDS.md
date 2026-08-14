# SEO Operating System — carry-forward tracker

This file tracks what's intentionally left for follow-up PRs after the
Phase 1 foundation lands. Delete each section as it's shipped.

The original plan lives at
`/Users/ayushkbhatia/.claude/plans/ok-now-a-new-staged-clock.md`
(plan name: "ok-now-a-new-staged-clock"). The drawer/audit PR's plan is
at `/Users/ayushkbhatia/.claude/plans/seo-os-drawer-and-audit.md`.

---

## ✅ Shipped (PR #5 — feat/seo-os-drawer)

- SeoEntityDrawer mounted on Product + Category edit pages.
- `withSeoAudit` transactional writer; every SEO mutation now writes audit rows.
- Revert action wired into `/seo/audit` (Revert button per row).
- Existing `saveSeoSettings`, `addRedirect`, `deleteRedirect` routed through `withSeoAudit`.
- Inspector titles deep-link into the drawer for Product + Category.

## ✅ Shipped (PR #6 — feat/seo-drawer-rollout)

- SeoEntityDrawer rolled out to Brand, Industry, BlogPost, and CmsPage.
- Brand & Industry: new dedicated `/[entity]/[id]/edit` pages with Core (stub) + SEO tabs; "SEO" link added per row in BrandsClient/IndustriesClient.
- BlogPost & CmsPage: existing inline editors refactored to a tabbed Content + SEO layout. Existing `savePost` / `savePage` content actions preserved; new `update<X>Seo` + `upload<X>OgImage` actions added.
- `SeoEntityDrawer.extra` extended with `brand`, `industry`, `blog_post`, `cms_page` discriminators; JSON-LD preview switch covers Organization (brand), CollectionPage (industry), Article (blog_post), and skips JSON-LD entirely for cms_page (matching what the storefront emits today).
- Inspector `editPathFor` covers all 6 entity types; `?tab=seo` deep-link honoured by the BlogPost and CmsPage editors.

## ✅ Shipped (PR #8 — feat/seo-search-fts)

- Storefront `/search` rewritten on top of Postgres FTS + pg_trgm fallback.
- `/api/search/{log,suggest}` endpoints; debounced `SearchAutocomplete` in the header; click-through beacon.
- Admin `/seo/search` 4-tab sub-shell: synonyms / query redirects / boosts / query analytics.

## ✅ Shipped (PR #9 — feat/seo-ai-suggest)

- Anthropic SDK + cost-tracking + quota-gated `generateSuggestion` / `acceptSuggestion` / `rejectSuggestion`.
- `AiSuggestButton` mounted on every SEO drawer's title / description / focus keyword fields.
- `/seo/ai` overview, `/seo/ai/runs` log, `/seo/ai/quota` per-user spend.

## ✅ Shipped (PR #10 — feat/seo-health-404)

- 404 capture beacon → `/api/seo/404-log` → `NotFoundLog`.
- Admin `/seo/redirects/not-found` (top hits + one-click resolve) and `/seo/redirects/chains` (cycle/chain detector).
- Site-wide `/seo/health` dashboard with per-type aggregate, worst-offender list, infrastructure tiles.

## ✅ Shipped (this PR — feat/seo-jsonld-inngest)

- JSON-LD override **live validator** on the drawer Schema tab — parses on every keystroke, surfaces a `valid` / `invalid` chip, red textarea border + error message on invalid JSON, preview falls back to the unmerged base.
- **Inngest infrastructure** wired in (`inngest` package + `apps/admin/src/inngest/{client,functions}.ts` + `/api/inngest/route.ts`). First scheduled function: `seo.health.recompute_all` runs nightly at 04:00, populates `SeoHealthScore` rows for every entity. The dashboard still computes live but the cached table will back trend charts in the next phase.
- `/seo/health` gained a **search activity** section: top queries (last 7 days) + zero-result queries (with deep-link to `/seo/search/synonyms` for the obvious follow-up).
- New `/seo/gsc` page documenting the Google Search Console OAuth setup steps and showing live counts of captured `GscMetricDaily` rows. The OAuth flow itself ships once `GOOGLE_OAUTH_CLIENT_ID` / `_SECRET` are provisioned in GCP — the page detects them and surfaces a follow-up CTA.
- Sidebar/`SeoTabsNav` now includes the `GSC` tab.

## Phase 2 (next chunk)

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

### 7. Site-wide health dashboard

Replace the `seo/health/page.tsx` placeholder with:
- Average score across all entities, broken down by type.
- Trend chart (7/30/90 day) — requires `SeoHealthScore.computedAt`
  history; recompute job is in #6.
- Worst-offender list with deep-link to drawer.

### 9. 404 log capture middleware + suggestions UI

- Add a tiny POST endpoint `apps/web/src/app/api/seo/404-log/route.ts`
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

`apps/web/proxy.ts` — read `Redirect` table cached via
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
