import type { Metadata } from 'next'
import CategoryView, { categoryMetadata } from '../../c/category-view'

/**
 * A category shelf with facets applied.
 *
 * Not a URL anyone sees. The proxy rewrites `/c/<slug>?brands=…` here, so the
 * address bar still reads `/c/<slug>?brands=…` and this route's output is what
 * is served there. Splitting it off is what lets the clean `/c/<slug>` be
 * prerendered — one route cannot be both static and read `searchParams`.
 *
 * Deliberately dynamic, and it cannot currently be otherwise.
 *
 * `force-dynamic` makes every request a full render — the same filtered URL
 * three times running is three MISSes, ~0.75s each against ~0.52s for the
 * cached clean shelf. Removing it and giving the path an `s-maxage` through
 * `next.config.ts` was tried and REVERTED: it works under `next start` and
 * does nothing on Vercel, because a `Cache-Control` header returned by a
 * function overrides one defined for the same route in `next.config.js`, and
 * a dynamically rendered page IS that function. Verified on production —
 * `/c-filter/<slug>` requested directly, bypassing the rewrite entirely,
 * still answered `private, no-cache, no-store`.
 *
 * What would actually work is making the response not come from a per-request
 * render at all: Next 16 cache components, or moving the filter state into the
 * path so the route can be prerendered. Both are real changes to a core
 * catalogue route, and since crawlers are now denied on filtered URLs the
 * whole thing is worth ~250ms on a human's filter click. Not worth it yet.
 *
 * `categoryMetadata` keeps deciding `noindex` from the facets, exactly as it
 * did when both cases lived in one file.
 */
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** Narrow the loose query bag to the shape the view expects. */
function firstOf(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, raw] = await Promise.all([params, searchParams])
  return categoryMetadata({
    slug,
    sp: {
      brands: firstOf(raw.brands),
      page: firstOf(raw.page),
      sort: firstOf(raw.sort),
      spec: firstOf(raw.spec),
    },
  })
}

export default async function FilteredCategoryPage({ params, searchParams }: Props) {
  const [{ slug }, raw] = await Promise.all([params, searchParams])
  return (
    <CategoryView
      slug={slug}
      sp={{
        brands: firstOf(raw.brands),
        page: firstOf(raw.page),
        sort: firstOf(raw.sort),
        spec: firstOf(raw.spec),
      }}
    />
  )
}
