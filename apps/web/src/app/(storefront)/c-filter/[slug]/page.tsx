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
 * Rendered per request — it reads `searchParams`, so it cannot be prerendered
 * — but no longer `force-dynamic`. That flag emitted
 * `cache-control: private, no-cache, no-store`, which told the CDN never to
 * store the response, so the same filtered URL was a full render every single
 * time it was requested.
 *
 * Nothing here is per-visitor: the page is a function of the slug and the
 * query alone. So the response is cacheable per URL, and `next.config.ts`
 * gives this path an `s-maxage` for the shared CDN cache while keeping it
 * out of the browser's. The short window is deliberate — these URLs are
 * `noindex`, a person clicking through filters wants current stock, and the
 * catalogue-wide tags that revalidate the clean shelves do not reach a
 * response cached by URL.
 *
 * `categoryMetadata` keeps deciding `noindex` from the facets, exactly as it
 * did when both cases lived in one file.
 */

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
