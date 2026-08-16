import { NextResponse } from 'next/server'
import { db } from '@indus/db'
import { runAutocomplete } from '../../../../lib/search'

export const runtime = 'nodejs'

/**
 * Grouped results for the ⌘K palette.
 *
 * The header's `/suggest` endpoint returns products only, which is right for
 * an inline autocomplete. The palette is a jump-to-anywhere surface —
 * 02-screen-index.md §06 groups it Products / Categories / Services / Pages —
 * so it needs its own shape rather than four calls from the client.
 *
 * Static pages are matched in memory. They are a fixed, tiny list and
 * round-tripping them to Postgres would be slower than the match itself.
 */

const PAGES = [
  { title: 'Replacements & cross-references', url: '/replacement', hint: 'Find an equivalent for an obsolete code' },
  { title: 'Request a quote', url: '/quote/submit', hint: 'Send a parts list to an engineer' },
  { title: 'Your quote list', url: '/quote', hint: 'Everything you have staged' },
  { title: 'Compare products', url: '/compare', hint: 'Side-by-side spec matrix' },
  { title: 'Brands', url: '/brands', hint: 'Authorised distribution partners' },
  { title: 'Industries', url: '/industries', hint: 'What we supply, by sector' },
  { title: 'Services & case studies', url: '/services', hint: 'Rebuilds, testing, field work' },
  { title: 'Insights', url: '/blog', hint: 'Field notes and sizing guides' },
  { title: 'Contact', url: '/contact', hint: 'Dubai HQ, phone and email' },
  { title: 'Shipping', url: '/shipping', hint: 'Dispatch times and freight' },
  { title: 'Returns', url: '/returns', hint: 'Fitted vs unfitted' },
  { title: 'Warranty', url: '/warranty', hint: 'What is and is not covered' },
]

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').trim()

  // The palette shows an indexed-SKU count before anything is typed, so the
  // empty query is a valid request rather than an early return.
  const skuCount = await db.product.count({ where: { status: 'active' } })

  if (q.length < 1 || q.length > 80) {
    return NextResponse.json({ products: [], categories: [], services: [], pages: [], skuCount })
  }

  const needle = q.toLowerCase()

  try {
    const [products, categories, services] = await Promise.all([
      runAutocomplete(q, 5).catch(() => []),
      db.category.findMany({
        where: { isPublished: true, name: { contains: q, mode: 'insensitive' } },
        select: { name: true, slug: true, _count: { select: { products: true } } },
        take: 4,
        orderBy: { position: 'asc' },
      }),
      db.serviceCase.findMany({
        where: { status: 'published', title: { contains: q, mode: 'insensitive' } },
        select: { title: true, slug: true, topicLabel: true },
        take: 3,
        orderBy: { publishedAt: 'desc' },
      }),
    ])

    return NextResponse.json({
      skuCount,
      products: products.map((p) => ({
        title: p.title,
        sku: p.sku,
        url: `/p/${p.sku}`,
        hint: p.brandName ?? '',
      })),
      categories: categories.map((c) => ({
        title: c.name,
        url: `/c/${c.slug}`,
        hint: `${c._count.products} SKU${c._count.products === 1 ? '' : 's'}`,
      })),
      services: services.map((s) => ({
        title: s.title,
        url: `/services/${s.slug}`,
        hint: s.topicLabel ?? '',
      })),
      pages: PAGES.filter((p) => p.title.toLowerCase().includes(needle)).slice(0, 4),
    })
  } catch {
    return NextResponse.json({ products: [], categories: [], services: [], pages: [], skuCount })
  }
}
