# Indus Hydraulics: Current State and Production Roadmap

Date: June 12, 2026

## Executive Summary

Indus Hydraulics is a substantial B2B catalogue and lead-generation platform, not a simple brochure site. It already includes:

- A 1,138-product catalogue with search, categories, brands, comparison, and structured product pages.
- RFQ submission, quote management, customer accounts, PDFs, notifications, and order tracking.
- Programmatic SEO pages, metadata, schema, sitemap, redirects, and an SEO administration area.
- Product, media, content, scraper, and customer administration.
- A competitor/source-page scraper with review and image ingestion.

Supabase has been restored and is healthy. The production storefront and database-backed routes are responding normally.

The main production-readiness issue is catalogue presentation rather than missing platform functionality. Product copy exists for most records, but its quality has not been editorially validated. Image coverage was effectively absent before this work.

This delivery added a repeatable image research, visual review, and bulk ingestion workflow and used it to populate 100 existing products. All 100 now have a relevant hero image in Supabase Storage and render that image on production product pages.

## Verified Production State

### Availability

- Production health endpoint: HTTP 200.
- Database status: reachable.
- Production homepage: HTTP 200.
- Search and product detail routes: HTTP 200.
- Catalogue redirect behavior: operating as expected.
- Sample production product pages render newly ingested Supabase images.

### Supabase

Project reference: `hesezbozronntejnsopr`

Verified storage buckets:

| Bucket | Access | Limit |
| --- | --- | --- |
| `product-images` | Public | 50 MB per object |
| `product-documents` | Public | 50 MB per object |
| `quotes` | Private | 10 MB per object |

The restored database is accessible from the application and local database package.

### Repository

- Local `main` is reconciled with `origin/main`.
- Current base commit: `a4237a3`.
- Existing user files in `.claude/` and `apps/admin/pnpm-lock.yaml` were preserved.
- Workspace dependencies install successfully with the frozen lockfile.
- The full production build completes for both applications.
- The storefront build logs recoverable connection-pool timeouts because the local Supabase transaction-pool URL uses `connection_limit=1` while Next.js generates pages concurrently.

## Catalogue Snapshot

| Measure | Current value |
| --- | ---: |
| Products | 1,138 |
| Active products | 1,134 |
| Brands | 29 |
| Categories | 171 |
| Blog posts | 0 |
| RFQs | 3 |
| Product image records | 102 |
| Products with images | 101 |
| Products without images | 1,037 |

### Product content coverage

| Content field | Products populated |
| --- | ---: |
| Short description | 1,137 |
| Long description | 1,111 |
| SEO title and description | 1,061 |
| Focus keyword | 1,059 |
| Specifications | 1,083 |
| FAQs | 1,056 |
| Documents | 1 |

The database is therefore not missing descriptions at a structural level. The open question is whether those descriptions are specific, accurate, differentiated, and useful enough for a buyer. That requires a quality audit rather than a null-field audit.

## Application Flow Map

### Buyer-facing storefront

- Homepage and catalogue entry points.
- Category, brand, industry, and replacement-product pages.
- Product pages with specifications, FAQs, related content, comparison, and RFQ actions.
- Search, autocomplete, synonyms, redirects, boosts, zero-result logging, and comparison.
- RFQ builder and anonymous or authenticated submission.
- Quote access, acceptance, decline, expiry, PDFs, and notifications.
- Account creation, sign-in, password reset, profile, addresses, lists, quotes, and orders.
- Blog, services, about, contact, maintenance, and policy pages.

### Administration

- Products, brands, categories, industries, specifications, media, and navigation.
- CSV and catalogue imports.
- RFQs, customers, users, settings, pages, and blogs.
- SEO audits, metadata, redirects, 404s, sitemap, robots, schema, and AI suggestions.
- Scraper jobs, product review, image selection, mapping, and ingestion.

### Lead flow

The RFQ flow is the strongest conversion path:

1. Buyer discovers a product through search, category, brand, or landing page.
2. Buyer adds products to an RFQ.
3. Anonymous submission can create a prospect account and contact.
4. Internal and customer notifications are generated.
5. Staff review and issue a quote.
6. The customer can accept or decline.
7. Order and status tracking can continue within the account.

This is sufficient for an initial production GTM motion without adding a separate CRM.

## Image Enrichment Delivered

### First 100-product cohort

The cohort spans:

- Bosch Rexroth
- Dixon
- Eaton Aeroquip
- HYDAC
- Yuken
- Parker Hannifin

The completed scraper job is `SCRAPE-2026-0003`.

Final job result:

- Researched rows: 100
- Unique target products: 100
- Selected rows: 100
- Ingested rows: 100
- Failed rows: 0
- Products in the cohort with images: 100

### Workflow added

1. Select a cohort of active products without images.
2. Build brand, MPN, SKU, and title-aware image searches.
3. Rank and probe candidate images.
4. Apply curated SKU overrides and controlled family-level reuse.
5. Generate a browser review contact sheet.
6. Materialize the reviewed selections as an auditable scraper job.
7. Dry-run the job.
8. Download, validate, upload, and attach images to existing products.
9. Retry isolated source failures without repeating successful rows.

Research manifest:

`data/catalogue-enrichment/first-100-image-research.json`

Review artifact:

`data/catalogue-enrichment/first-100-image-review.html`

### Production verification

- All 100 target products have a `ProductImage`.
- Public Supabase image URLs return HTTP 200 with image MIME types.
- Sample Bosch Rexroth, Dixon, and Eaton production pages return HTTP 200 and contain their new Supabase image URLs.

## Scraper and Product Generation State

### Existing scraper strengths

- Supports sitemap, listing page, and direct product URL discovery.
- Extracts JSON-LD product data, Open Graph content, descriptions, and images.
- Runs background jobs through Inngest.
- Supports admin review, image selection, brand/category mapping, duplicate handling, and attaching to existing products.
- Stores images in Supabase and links them through media and product-image records.

### Improvements delivered

- Direct product URLs now work when no sitemap/listing URLs are discovered.
- Ingestion logic is reusable from both server actions and the CLI.
- New products created from scraper rows now receive source-derived:
  - Short description
  - Long description
  - SEO title
  - SEO description
  - Focus keyword
  - Draft status
- Bulk image research and ingestion can run from the command line.
- Selected-image research can be reviewed before any catalogue write.

### Remaining product-generation gap

The scraper can now create a better draft, but it is not yet a complete SEO product writer. The next workflow should transform extracted source facts into:

- A concise buyer-oriented summary.
- An original long description.
- Applications and use cases.
- Normalized technical specifications.
- Compatibility and replacement context.
- FAQs.
- SEO title, meta description, and focus keyword.
- Internal links to category, brand, and related products.
- A quality score and human approval state.

The safe architecture is:

`extract -> normalize facts -> generate copy -> validate -> review -> publish`

Generation should use structured facts as input. It should not try to recover technical specifications from an already-generated paragraph.

## SEO and Content Assessment

### Strong technical foundation

- Product, organization, breadcrumb, FAQ, local-business, and article schema.
- Sitemaps, robots controls, canonicals, redirects, and social metadata.
- Programmatic category, brand, industry, and replacement pages.
- Search-query and zero-result logging.
- Product content scoring.
- SEO administration and AI-assisted suggestions.

### Current content risks

1. Existing copy is broadly populated but has not been quality-scored for specificity or duplication.
2. Only one product document is attached across the catalogue.
3. The blog system exists but contains zero posts.
4. The first 100 enriched products currently have one hero image each, not full multi-image galleries.
5. More than 90% of products still have no image.
6. There are 171 categories for 1,138 products, so thin or overlapping taxonomy branches are likely and should be reviewed.

### Recommended launch content standard

For the first 100 commercially important products:

- One accurate hero image, already completed.
- Two additional useful images where available.
- A source-backed technical specification table.
- A short description written for search snippets and category cards.
- A detailed description focused on application, selection, and procurement.
- Three to five FAQs.
- Related products and alternatives.
- A direct RFQ call to action.
- A datasheet or technical document where available.

## GTM Assessment

### Best initial acquisition motion

Prioritize high-intent searches from maintenance, procurement, and engineering buyers in the UAE and GCC:

- Exact manufacturer part numbers.
- Replacement and cross-reference searches.
- Product family plus pressure, size, material, or application.
- Urgent hydraulic repair and sourcing needs.
- Brand and category searches with commercial intent.

The product page, not the homepage, should be the primary acquisition and conversion unit.

### Highest-value page types

1. Exact MPN pages.
2. Product-family pages.
3. Replacement and equivalent-product pages.
4. Brand and category pages.
5. Application and troubleshooting articles.

### Content publishing opportunity

The empty blog is a meaningful GTM gap. The first editorial set should support product demand rather than broad thought leadership:

- How to identify a hydraulic hose or coupling.
- Eaton/Danfoss coupling interchange guides.
- Bosch Rexroth pump identification.
- Hydraulic accumulator sizing and maintenance.
- Hose selection by pressure, medium, and temperature.
- Common causes of hydraulic pump failure.
- UAE/GCC procurement and lead-time guidance.
- Brand-specific replacement and compatibility guides.

Each article should link to relevant product groups and RFQ actions.

## Recommended Next Steps

### Priority 0: Ship the completed workflow

- Review and commit the current code changes.
- Deploy the admin workflow changes.
- Run a post-deployment admin smoke test.
- Keep `SCRAPE-2026-0003` as the reference batch.

Exit criterion: the same research, review, and ingestion workflow can be run from the deployed operational environment.

### Priority 1: Make the first 100 pages sales-ready

- Audit the existing descriptions for the enriched cohort.
- Rewrite weak or duplicated product copy.
- Normalize specifications and units.
- Add two more useful images per priority product where possible.
- Add datasheets to the highest-intent products.
- Confirm related products, alternatives, and RFQ calls to action.

Exit criterion: the first 100 pages are credible enough to send directly to a buyer.

### Priority 2: Build the SEO generation workflow

- Add a structured enrichment job and review state.
- Generate copy from extracted facts.
- Store generation inputs, outputs, model metadata, and reviewer status.
- Support batch generation for existing products and scraper-created drafts.
- Add duplicate-copy and missing-fact checks.

Exit criterion: staff can enrich a 100-product batch without manually writing every field.

### Priority 3: Scale image coverage

- Process another 100-product batch using the delivered workflow.
- Prioritize products by RFQ potential, exact MPN demand, and category importance.
- Reuse reviewed family images only where the product form is genuinely representative.
- Add image-source preflight before every production job.

Exit criterion: image coverage grows predictably without manual database work.

### Priority 4: Launch demand content

- Publish the first 10 to 12 high-intent technical articles.
- Build internal links between articles, categories, brands, and product pages.
- Connect Google Search Console and submit the sitemap.
- Review impressions, clicks, product views, searches, and RFQs weekly.

Exit criterion: organic acquisition begins producing measurable product-page sessions and enquiries.

### Priority 5: Operational production checks

- Add uptime monitoring for the homepage and `/api/health`.
- Confirm Supabase backups and perform a restore drill.
- Add the production build to CI.
- Give build-time database work a slightly larger connection allowance, or reduce static-generation concurrency, so successful builds do not depend on query fallbacks.
- Run storefront and admin smoke tests before release.
- Test one complete RFQ-to-quote flow with real notifications and ownership.

Exit criterion: failures are detected before buyers encounter them.

## Suggested 30-Day Plan

### Week 1

- Deploy the new catalogue workflow.
- Select the commercial priority order for the first 100 products.
- Audit descriptions and specifications for the first 25.
- Test the complete RFQ and quote flow.

### Week 2

- Complete copy QA for products 26 to 60.
- Add second and third images to the highest-value products.
- Attach initial datasheets.
- Publish three product-led articles.

### Week 3

- Complete copy QA for products 61 to 100.
- Run the next 100-product image batch.
- Publish three more articles.
- Review search queries and zero-result searches.

### Week 4

- Launch the structured SEO generation workflow.
- Publish the remaining initial articles.
- Review product-page to RFQ conversion.
- Choose the next catalogue cohort using observed demand.

## Core Production KPIs

- Storefront uptime and database error rate.
- Products with images.
- Priority products with three or more images.
- Products with reviewed descriptions and specifications.
- Product-page organic impressions and clicks.
- Search zero-result rate.
- Product view to RFQ-start rate.
- RFQ-start to RFQ-submit rate.
- Median first response time.
- Quote acceptance rate.
- Enquiries by product, brand, category, and landing page.

## Current Production-Ready Definition

The initial production milestone is complete when:

- Storefront, database, storage, and RFQ flows are monitored and healthy.
- The first 100 priority products have reviewed copy, specifications, images, and clear RFQ actions.
- The bulk research and enrichment workflow is deployed and repeatable.
- Releases run build and smoke checks before production.
- Search Console and funnel analytics provide a weekly feedback loop.

## Primary References

- Supabase Storage buckets:
  https://supabase.com/docs/guides/storage/buckets/fundamentals
- Supabase changelog:
  https://supabase.com/changelog
- Google product structured data:
  https://developers.google.com/search/docs/appearance/structured-data/product
- Google image SEO:
  https://developers.google.com/search/docs/appearance/google-images
- Google people-first content:
  https://developers.google.com/search/docs/fundamentals/creating-helpful-content

Individual image candidates and source pages are retained in the first-100 research manifest.
