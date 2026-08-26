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
 * Deliberately dynamic. These URLs are `noindex` with a canonical back to the
 * clean shelf, and robots.txt disallows the `brands=` and `sort=` forms
 * outright, so crawlers do not fetch them; what is left is a visitor who has
 * clicked a filter, and they need the real answer.
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
