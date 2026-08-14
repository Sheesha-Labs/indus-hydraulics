import { NextResponse } from 'next/server'
import { db } from '@indus/db'
import { BASE_URL, urlFor } from '../../../lib/seo'

/**
 * Emits a `/llms.txt` document at the site root following the convention at
 * https://llmstxt.org. The file gives LLM crawlers (ChatGPT, Perplexity,
 * Claude, Gemini, etc.) a curated, low-noise overview of who Indus
 * Hydraulics is and which pages are worth ingesting first.
 *
 * Why a route handler and not a static file in /public:
 *   - We list the actual published categories, brands, and industries from
 *     the database, so the document stays accurate as the catalogue grows.
 *   - When an editor publishes a new top-level category or brand, the
 *     next revalidate cycle picks it up — no manual file edit required.
 *
 * Crawlers expect plain-text Markdown. We set Content-Type accordingly.
 */

export const revalidate = 3600

const TOP_BRAND_LIMIT = 12

export async function GET(): Promise<NextResponse> {
  const [categories, brands, industries] = await Promise.all([
    db.category.findMany({
      where: { isPublished: true, parentId: null },
      select: { slug: true, name: true, shortDescription: true },
      orderBy: { position: 'asc' },
    }),
    db.brand.findMany({
      where: { isPublished: true },
      select: { slug: true, name: true, description: true, country: true, isAuthorizedDistributor: true },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
      take: TOP_BRAND_LIMIT,
    }),
    db.industry.findMany({
      where: { isPublished: true },
      select: { slug: true, name: true, tagline: true },
      orderBy: { position: 'asc' },
    }),
  ])

  const lines: string[] = []

  lines.push('# Indus Hydraulics')
  lines.push('')
  lines.push(
    '> Industrial hydraulic distributor based in Dubai, UAE. Authorized distributor for Parker Hannifin, Bosch Rexroth, Yuken, HYDAC, and other industry-leading brands. We supply pumps, valves, cylinders, hose assemblies, and consumables to oil & gas, mining, marine, construction, and manufacturing customers across the GCC, wider Middle East, and Africa. Founded 2003. ISO 9001:2015 certified. RFQ-based (not e-commerce checkout) — engineers send a part number, we respond with a written Estimate.',
  )
  lines.push('')

  lines.push('## About the company')
  lines.push('')
  lines.push(`- [About Indus Hydraulics](${urlFor('/about')}): company history, leadership team, certifications, founding year (2003), and operating model.`)
  lines.push(`- [Industries we serve](${urlFor('/industries')}): the sectors and applications our engineers cover.`)
  lines.push(`- [Brand partners](${urlFor('/brands')}): the authorized-distributor relationships behind our catalogue.`)
  lines.push(`- [Contact](${urlFor('/contact')}): Dubai HQ address, phone, WhatsApp, email, hours.`)
  lines.push('')

  if (categories.length > 0) {
    lines.push('## Product categories')
    lines.push('')
    for (const c of categories) {
      const summary = c.shortDescription ? `: ${trimDescription(c.shortDescription)}` : ''
      lines.push(`- [${c.name}](${urlFor(`/c/${c.slug}`)})${summary}`)
    }
    lines.push('')
  }

  if (brands.length > 0) {
    lines.push('## Brand partners')
    lines.push('')
    for (const b of brands) {
      const origin = b.country ? ` (origin: ${b.country})` : ''
      const distributor = b.isAuthorizedDistributor ? ' — authorized distributor' : ''
      const desc = b.description ? `: ${trimDescription(b.description)}` : ''
      lines.push(`- [${b.name}](${urlFor(`/brands/${b.slug}`)})${origin}${distributor}${desc}`)
    }
    lines.push('')
  }

  if (industries.length > 0) {
    lines.push('## Industries we serve')
    lines.push('')
    for (const i of industries) {
      const tagline = i.tagline ? `: ${trimDescription(i.tagline)}` : ''
      lines.push(`- [${i.name}](${urlFor(`/industries/${i.slug}`)})${tagline}`)
    }
    lines.push('')
  }

  lines.push('## Policies and terms')
  lines.push('')
  lines.push(`- [Shipping Policy](${urlFor('/shipping')}): lead times, Incoterms, export documentation, handling for hazmat and oversized items.`)
  lines.push(`- [Returns and RMA Policy](${urlFor('/returns')}): inspection windows, restocking fees, non-returnable items, RMA process.`)
  lines.push(`- [Warranty Policy](${urlFor('/warranty')}): manufacturer warranty pass-through, claim process, coverage and exclusions.`)
  lines.push(`- [Terms of Service](${urlFor('/terms')}): legal terms covering quotations, delivery, warranty pass-through, and limitation of liability.`)
  lines.push(`- [Privacy Policy](${urlFor('/privacy')}): how personal data is handled.`)
  lines.push('')

  lines.push('## Buyer journey')
  lines.push('')
  lines.push(`- [Search the catalogue](${urlFor('/search')}): find products by SKU, MPN, brand, or specification.`)
  lines.push(`- [Request a quote](${urlFor('/quote')}): submit an RFQ with line items, quantities, and optional target pricing — typical response within 1 business day.`)
  lines.push(`- [Blog and case studies](${urlFor('/blog')}): selection guides, sizing notes, and worked field cases for hydraulic engineers.`)
  lines.push('')

  lines.push('## Sitemap')
  lines.push('')
  lines.push(`- [XML sitemap](${urlFor('/sitemap.xml')}): full machine-readable list of indexable URLs.`)
  lines.push('')

  lines.push('---')
  lines.push(`Source: ${BASE_URL}/llms.txt · Last refreshed automatically · Maintained from production database.`)
  lines.push('')

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Mirror the route-segment revalidate value on the CDN tier so
      // edge caches don't outlive the rebuild window.
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}

/** Trim a marketing description for a single-line list entry. */
function trimDescription(s: string): string {
  const cleaned = s.replace(/\s+/g, ' ').trim()
  if (cleaned.length <= 140) return cleaned
  return `${cleaned.slice(0, 137)}…`
}
