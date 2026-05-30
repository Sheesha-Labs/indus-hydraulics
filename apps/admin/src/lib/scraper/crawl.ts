// Intentionally NOT marked 'server-only' so the CLI (tsx) can import it.
// This module is only ever imported from server actions, the Inngest
// function, and the CLI — never from a client component.

/**
 * Crawl orchestrator. Glues a `ScraperContext` (HTTP + throttling +
 * robots) to an `Adapter` (per-host parsing) and drives the discover →
 * parse → probe-images pipeline.
 *
 * The orchestrator returns plain `ScrapedProductDraft`s. Persistence
 * happens in the Inngest function in Phase 3, which wraps each step in
 * `step.run` so the entire crawl is checkpointed and resumable.
 *
 * Two entry shapes:
 *
 *   `discoverAndCrawl(startUrl)` — adapter discovers product URLs from a
 *   sitemap or listing root.
 *   `crawlUrlList(urls)` — caller supplies the URL list directly (used
 *   when the user paste-imports a newline-separated list).
 */

import { createScraperContext } from './fetch'
import { getAdapterForHost } from './adapters'
import { isProbedImageAcceptable } from './resolveAsset'
import type { Adapter, ScrapedProductDraft, ScraperContext } from './types'

export type CrawlOptions = {
  /** Default 2 req/s; lower for fragile/protected sites. */
  requestsPerSecond?: number
  /** Override the global fetch in tests. */
  fetchImpl?: typeof fetch
  /** Skip image HEAD probes (useful for sites that block HEAD broadly). */
  skipImageProbes?: boolean
  /** Maximum number of product URLs to parse — safety cap. */
  maxUrls?: number
  /** Called after each product is parsed. */
  onProgress?: (event: { parsed: number; total: number; lastUrl: string }) => void
}

export type CrawlResult = {
  hostname: string
  startUrl: string
  discoveredUrls: string[]
  products: ScrapedProductDraft[]
  errors: Array<{ url: string; message: string }>
}

const DEFAULT_MAX_URLS = 500

export async function discoverAndCrawl(startUrl: string, opts: CrawlOptions = {}): Promise<CrawlResult> {
  const hostname = hostnameOf(startUrl)
  const ctx = createScraperContext({
    hostname,
    requestsPerSecond: opts.requestsPerSecond,
    fetchImpl: opts.fetchImpl,
  })
  const adapter = getAdapterForHost(hostname, ctx)

  const discoveredUrls = await adapter.discoverProductUrls(startUrl)
  const limited = discoveredUrls.slice(0, opts.maxUrls ?? DEFAULT_MAX_URLS)
  const { products, errors } = await crawlInternal(ctx, adapter, limited, opts)
  return { hostname, startUrl, discoveredUrls: limited, products, errors }
}

export async function crawlUrlList(
  startUrl: string,
  urls: string[],
  opts: CrawlOptions = {},
): Promise<CrawlResult> {
  const hostname = hostnameOf(startUrl)
  const ctx = createScraperContext({
    hostname,
    requestsPerSecond: opts.requestsPerSecond,
    fetchImpl: opts.fetchImpl,
  })
  const adapter = getAdapterForHost(hostname, ctx)
  const limited = urls.slice(0, opts.maxUrls ?? DEFAULT_MAX_URLS)
  const { products, errors } = await crawlInternal(ctx, adapter, limited, opts)
  return { hostname, startUrl, discoveredUrls: limited, products, errors }
}

async function crawlInternal(
  ctx: ScraperContext,
  adapter: Adapter,
  urls: string[],
  opts: CrawlOptions,
): Promise<{ products: ScrapedProductDraft[]; errors: Array<{ url: string; message: string }> }> {
  const products: ScrapedProductDraft[] = []
  const errors: Array<{ url: string; message: string }> = []

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]!
    try {
      const fetched = await ctx.fetchHtml(url)
      if (fetched.status !== 200 || !fetched.html) {
        errors.push({ url, message: `HTTP ${fetched.status}` })
        continue
      }
      const draft = adapter.parseProductPage(fetched.html, fetched.finalUrl || url)

      if (!opts.skipImageProbes) {
        const probed: typeof draft.candidateImages = []
        for (const img of draft.candidateImages) {
          try {
            const probe = await ctx.probeImage(img.url)
            if (!probe.ok) continue
            if (!isProbedImageAcceptable(probe.contentType)) continue
            probed.push({ ...img, contentType: probe.contentType, bytes: probe.bytes })
          } catch {
            // Probe failure: skip this image; we still got the URL but
            // can't validate it. Better safe than ingest a 404.
          }
        }
        draft.candidateImages = probed.map((img, position) => ({ ...img, position }))
      }

      products.push(draft)
      opts.onProgress?.({ parsed: i + 1, total: urls.length, lastUrl: url })
    } catch (err) {
      errors.push({ url, message: (err as Error).message ?? 'unknown error' })
    }
  }

  return { products, errors }
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}
