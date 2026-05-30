/**
 * Shared types for the competitor scraper engine.
 *
 * The engine is intentionally pure-logic: adapters take raw HTML and emit
 * `ScrapedProductDraft`s. The orchestrator in `crawl.ts` ties an adapter to
 * the throttled fetcher; persistence (Prisma writes to `ScraperJob` /
 * `ScrapedProduct`) happens in the Inngest function that wraps the
 * orchestrator. That separation keeps everything unit-testable with fixture
 * HTML and easy to run from the CLI.
 */

export type CandidateImage = {
  /** Absolute URL (relatives are resolved by `resolveAsset` before we get here). */
  url: string
  /** 0-based display order. */
  position: number
  /** Alt text scraped from <img alt="…"> or schema.org/JSON-LD when present. */
  alt?: string
  /**
   * MIME type from a HEAD probe (Phase 2: optional, may be undefined when
   * we skipped probing). Used at ingest time to derive the file extension.
   */
  contentType?: string
  /** Byte size from a HEAD probe. Used to early-reject >10MB candidates. */
  bytes?: number
}

export type ScrapedProductDraft = {
  /** Canonical product page URL, absolute. */
  sourceUrl: string
  title: string
  description?: string
  /** Vendor-supplied SKU when we can extract one cleanly (often not). */
  sku?: string
  /** Free-form brand text we found on the page (we map to internal Brand later). */
  brandText?: string
  /** Free-form category text — first breadcrumb element is usually best. */
  categoryText?: string
  candidateImages: CandidateImage[]
}

/**
 * Pluggable per-host adapter. The orchestrator looks up an adapter by
 * hostname; if none is registered, the generic adapter is used.
 *
 * `discoverProductUrls` is given the *crawl starting point* the user
 * pasted — could be a sitemap URL, a listing URL, or anything else. It is
 * the adapter's job to return absolute product-detail URLs.
 *
 * `parseProductPage` is given fetched HTML plus the URL it came from
 * (needed for resolving relative asset URLs). It is synchronous to keep it
 * easy to test in isolation against fixtures.
 */
export interface Adapter {
  /** e.g. "competitor.example" — used to register and look up. */
  hostname: string
  /** Discover absolute product-detail URLs from a crawl start point. */
  discoverProductUrls(startUrl: string): Promise<string[]>
  /** Parse one product detail page into a draft. */
  parseProductPage(html: string, pageUrl: string): ScrapedProductDraft
}

/**
 * Bundle of dependencies the adapters and discoverers need. Lets us
 * inject a mock fetch in tests instead of mocking the global.
 */
export interface ScraperContext {
  /** Throttled, robots-respecting fetch. */
  fetchHtml(url: string): Promise<{ status: number; html: string; finalUrl: string }>
  /** HEAD probe (or 1KB streaming GET) for image content-type + size. */
  probeImage(url: string): Promise<{ contentType?: string; bytes?: number; ok: boolean }>
}
