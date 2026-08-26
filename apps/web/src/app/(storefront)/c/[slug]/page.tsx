import type { Metadata } from 'next'
import { db } from '@indus/db'
import CategoryView, { categoryMetadata } from '../category-view'

/**
 * A category shelf, unfiltered — the canonical, indexable URL.
 *
 * Nothing in this file may read `searchParams`, `headers()` or `cookies()`.
 * Reading them is what made this route `ƒ`: all 194 shelves rendered per
 * request, the CDN never held a copy, and every visitor and every crawler cost
 * a full render plus ~39 KB of origin transfer. The `revalidate` below was
 * inert for exactly as long as that was true.
 *
 * A day rather than an hour, because the timer is a backstop and no longer the
 * thing keeping shelves fresh: product edits walk the ancestor chain, and
 * category tree edits and imports invalidate the whole `/c/[slug]` space.
 *
 * Filters and deep pages still work and still live at these same URLs. The
 * proxy spots the query string and rewrites to `/c-filter/<slug>`, which is
 * the same view with the facets applied — see `rewriteFilteredCategory`.
 */
export const revalidate = 86400

/**
 * A deliberately tiny prerender list, for the reason `/p/[slug]` documents at
 * length: what matters is that this function EXISTS.
 *
 * A dynamic route with no `generateStaticParams` is served fully dynamically
 * and `no-store`, however statically renderable its code is. Give it a list and
 * the route switches to the incremental cache — the listed slugs are built
 * ahead of time, and with `dynamicParams` every OTHER shelf renders on first
 * request and is cached from then on.
 *
 * So the list unlocks caching for all 194 shelves; its length only decides how
 * many are already warm when a deploy lands. Length is expensive, and more so
 * here than for a PDP: a shelf rolls up its whole sub-tree, and the largest
 * holds 595 products. Prerendering all 194 took the production build from
 * ~5 minutes to ~16.
 *
 * Ordered by product count, so the shelves most likely to be hit first are the
 * ones already warm. Raising this number is the lever that trades deploy speed
 * back for fewer cold first-hits.
 */
const STATIC_SHELF_LIMIT = 8

export async function generateStaticParams() {
  const categories = await db.category.findMany({
    where: { isPublished: true },
    select: { slug: true },
    orderBy: { products: { _count: 'desc' } },
    take: STATIC_SHELF_LIMIT,
  })
  return categories.map(({ slug }) => ({ slug }))
}

/** A shelf published after the last deploy is served on demand, not 404'd. */
export const dynamicParams = true

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return categoryMetadata({ slug, sp: {} })
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <CategoryView slug={slug} sp={{}} />
}
