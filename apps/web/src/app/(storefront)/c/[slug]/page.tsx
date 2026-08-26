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
 * Every published shelf is prerendered.
 *
 * The old file argued against a list here, correctly: the page bailed to
 * dynamic at the first facet read, so pre-rendering was work thrown away. That
 * read has moved to `/c-filter/[slug]` and the argument goes with it.
 */
export async function generateStaticParams() {
  const categories = await db.category.findMany({
    where: { isPublished: true },
    select: { slug: true },
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
