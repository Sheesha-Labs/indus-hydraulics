import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import CategoryView, { categoryMetadata } from '../../../category-view'

/**
 * Page 2 and beyond of a category shelf.
 *
 * Deep pages used to live at `?page=2`, which the proxy sent to the dynamic
 * twin — so every one of them rendered per request. They are the only
 * crawlable URLs on this route that a query string was hiding: the clean shelf
 * is prerendered precisely because it reads no query string, and a page number
 * in the path can be prerendered the same way.
 *
 * Filtered pagination is deliberately NOT here. `?brands=…&page=2` stays on
 * the dynamic twin, where it belongs — those URLs are `noindex` and
 * robots-disallowed, so nothing crawls them.
 *
 * Indexing behaviour is unchanged: `categoryMetadata` treats any page above 1
 * as a facet variant, so these stay `noindex, follow` with a canonical back to
 * the clean shelf — exactly what `?page=2` did.
 */
export const revalidate = 86400

export const dynamicParams = true

/**
 * A handful of second pages, for the reason `/p/[slug]` documents: the
 * function existing is what switches the route to the incremental cache, and
 * its length only decides how many are warm at deploy. Only four shelves
 * paginate at all at 48 per page.
 */
export async function generateStaticParams() {
  const categories = await db.category.findMany({
    where: { isPublished: true },
    select: { slug: true },
    orderBy: { products: { _count: 'desc' } },
    take: 3,
  })
  return categories.map(({ slug }) => ({ slug, n: '2' }))
}

type Props = { params: Promise<{ slug: string; n: string }> }

/** Reject anything that is not a plain page number above 1. */
function parsePage(raw: string): string | null {
  if (!/^[0-9]+$/.test(raw)) return null
  const n = Number(raw)
  return n > 1 ? String(n) : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, n } = await params
  const page = parsePage(n)
  if (!page) return {}
  return categoryMetadata({ slug, sp: { page } })
}

export default async function CategoryPagePage({ params }: Props) {
  const { slug, n } = await params
  const page = parsePage(n)
  // `/c/<slug>/page/1` is the clean shelf under another name, and a junk
  // segment is not a page at all. Neither should render a second copy.
  if (!page) notFound()
  return <CategoryView slug={slug} sp={{ page }} />
}
