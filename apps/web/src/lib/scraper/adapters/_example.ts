/**
 * Template for adding a per-host adapter.
 *
 * Copy this file to `adapters/<hostname>.ts`, replace the selectors with
 * ones that match the target site, and register the factory in
 * `adapters/index.ts`.
 *
 * Per-host adapters take precedence over the generic adapter when the
 * crawl URL's hostname matches.
 */

import * as cheerio from 'cheerio'
import type { Adapter, ScrapedProductDraft, ScraperContext } from '../types'
import { extractImageCandidates } from '../resolveAsset'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createExampleAdapter(ctx: ScraperContext): Adapter {
  return {
    hostname: 'example.com',

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async discoverProductUrls(_startUrl: string): Promise<string[]> {
      // Example: scrape paginated listing pages instead of the sitemap.
      // const $ = cheerio.load((await ctx.fetchHtml(startUrl)).html)
      // return $('a.product-card').map((_, el) => $(el).attr('href')).get()
      return []
    },

    parseProductPage(html: string, pageUrl: string): ScrapedProductDraft {
      const $ = cheerio.load(html)
      return {
        sourceUrl: pageUrl,
        title: $('h1.product-title').first().text().trim(),
        description: $('.product-description').first().text().trim() || undefined,
        sku: $('[data-sku]').first().attr('data-sku') || undefined,
        brandText: $('.product-brand').first().text().trim() || undefined,
        candidateImages: extractImageCandidates($, pageUrl, '.product-gallery').map((img, i) => ({
          url: img.url,
          position: i,
          alt: img.alt,
        })),
      }
    },
  }
}
