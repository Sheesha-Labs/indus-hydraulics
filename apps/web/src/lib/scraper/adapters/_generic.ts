/**
 * Generic fallback adapter.
 *
 * When the user pastes a competitor URL we have no per-host adapter for,
 * this kicks in. It tries three signals, in priority order:
 *
 *   1. JSON-LD `<script type="application/ld+json">` with a `Product` entity
 *      → richest source: title, sku, brand, description, image array
 *   2. Open Graph `<meta property="og:…">` tags
 *      → fallback for title/description/image when JSON-LD is absent
 *   3. Generic `<img>` extraction across the whole document
 *      → fills in the remaining image gallery, deduplicates against (1)/(2)
 *
 * Discovery uses the host's sitemap.xml. If the user pasted a sitemap URL
 * directly we use that; otherwise we probe `${origin}/sitemap.xml` and
 * `${origin}/sitemap_index.xml`. URLs are filtered with the default
 * product-page heuristic from `sitemapDiscover`.
 */

import * as cheerio from 'cheerio'
import type { Adapter, ScrapedProductDraft, ScraperContext, CandidateImage } from '../types'
import { discoverFromSitemap, filterUrlsToProductPages, MAX_DISCOVERED_URLS } from '../sitemapDiscover'
import { extractImageCandidates, resolveAsset } from '../resolveAsset'
import { fetchXml } from '../fetch'

export function createGenericAdapter(ctx: ScraperContext, hostname: string): Adapter {
  return {
    hostname,

    async discoverProductUrls(startUrl: string): Promise<string[]> {
      const start = new URL(startUrl)
      const origin = `${start.protocol}//${start.host}`

      // If the user pasted a sitemap directly we respect that and only try it.
      const candidates = start.pathname.toLowerCase().endsWith('.xml')
        ? [startUrl]
        : [
            startUrl, // in case they pasted /sitemap or /sitemap-products etc.
            `${origin}/sitemap.xml`,
            `${origin}/sitemap_index.xml`,
          ]

      const seen = new Set<string>()
      const out: string[] = []
      for (const url of candidates) {
        if (out.length >= MAX_DISCOVERED_URLS) break
        const entries = await discoverFromSitemap(url, { fetchXml: (u) => fetchXml(ctx, u) })
        for (const entry of entries) {
          if (seen.has(entry.loc)) continue
          seen.add(entry.loc)
          out.push(entry.loc)
          if (out.length >= MAX_DISCOVERED_URLS) break
        }
        if (out.length > 0) break // first sitemap that yielded entries wins
      }

      return filterUrlsToProductPages(out)
    },

    parseProductPage(html: string, pageUrl: string): ScrapedProductDraft {
      return parseGenericProductPage(html, pageUrl)
    },
  }
}

export function parseGenericProductPage(html: string, pageUrl: string): ScrapedProductDraft {
  const $ = cheerio.load(html)

  const draft: ScrapedProductDraft = {
    sourceUrl: pageUrl,
    title: '',
    candidateImages: [],
  }

  // 1. JSON-LD Product
  const ld = findJsonLdProduct($)
  if (ld) {
    if (ld.name && typeof ld.name === 'string') draft.title = ld.name
    if (ld.description && typeof ld.description === 'string') draft.description = ld.description
    if (ld.sku && typeof ld.sku === 'string') draft.sku = ld.sku
    const brand = extractBrandName(ld.brand)
    if (brand) draft.brandText = brand
    const ldImages = collectJsonLdImages(ld.image, pageUrl)
    for (const url of ldImages) {
      draft.candidateImages.push({ url, position: draft.candidateImages.length })
    }
  }

  // 2. Open Graph fallbacks (don't overwrite JSON-LD)
  if (!draft.title) {
    draft.title = ($('meta[property="og:title"]').attr('content') ?? $('title').first().text() ?? '').trim()
  }
  if (!draft.description) {
    const ogd = $('meta[property="og:description"]').attr('content')
    const md = $('meta[name="description"]').attr('content')
    draft.description = (ogd ?? md ?? '').trim() || undefined
  }
  const ogImage = resolveAsset(pageUrl, $('meta[property="og:image"]').attr('content'))
  if (ogImage && !draft.candidateImages.some((c) => c.url === ogImage)) {
    draft.candidateImages.push({ url: ogImage, position: draft.candidateImages.length })
  }

  // 3. Inline <img> scan, deduplicated against what we already collected.
  const existing = new Set(draft.candidateImages.map((c) => c.url))
  const extracted = extractImageCandidates($, pageUrl)
  for (const img of extracted) {
    if (existing.has(img.url)) continue
    existing.add(img.url)
    draft.candidateImages.push({
      url: img.url,
      position: draft.candidateImages.length,
      alt: img.alt,
    })
  }

  // 4. Breadcrumb → categoryText (last non-Home item)
  if (!draft.categoryText) {
    const crumbs = $('nav.breadcrumbs a, ol.breadcrumb a, [class*="breadcrumb"] a, [aria-label="Breadcrumb"] a')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter((s) => s && s.toLowerCase() !== 'home')
    if (crumbs.length > 0) draft.categoryText = crumbs[crumbs.length - 1]
  }

  return draft
}

/**
 * Find the first JSON-LD blob that declares an @type of "Product". JSON-LD
 * can be a single object, an array, or nested in a `@graph` array.
 */
function findJsonLdProduct($: cheerio.CheerioAPI): Record<string, unknown> | null {
  const scripts = $('script[type="application/ld+json"]')
  for (const el of scripts.toArray()) {
    const raw = $(el).contents().text()
    if (!raw) continue
    try {
      const parsed = JSON.parse(raw)
      const product = findProduct(parsed)
      if (product) return product
    } catch {
      // Some sites embed broken JSON-LD; skip and try the next block.
    }
  }
  return null
}

function findProduct(node: unknown): Record<string, unknown> | null {
  if (!node) return null
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findProduct(item)
      if (found) return found
    }
    return null
  }
  if (typeof node !== 'object') return null
  const obj = node as Record<string, unknown>
  const type = obj['@type']
  if (type === 'Product' || (Array.isArray(type) && type.includes('Product'))) return obj
  if ('@graph' in obj) return findProduct(obj['@graph'])
  return null
}

function extractBrandName(brand: unknown): string | undefined {
  if (!brand) return undefined
  if (typeof brand === 'string') return brand
  if (Array.isArray(brand)) return extractBrandName(brand[0])
  if (typeof brand === 'object' && brand !== null) {
    const obj = brand as Record<string, unknown>
    if (typeof obj['name'] === 'string') return obj['name']
  }
  return undefined
}

function collectJsonLdImages(image: unknown, pageUrl: string): string[] {
  const out: string[] = []
  const push = (raw: unknown) => {
    if (typeof raw !== 'string') return
    const resolved = resolveAsset(pageUrl, raw)
    if (resolved) out.push(resolved)
  }
  if (typeof image === 'string') push(image)
  else if (Array.isArray(image)) image.forEach(push)
  else if (typeof image === 'object' && image !== null) {
    const obj = image as Record<string, unknown>
    push(obj['url'] ?? obj['contentUrl'])
  }
  return Array.from(new Set(out))
}

// Re-export for the adapter registry's convenience.
export type GenericCandidateImage = CandidateImage
