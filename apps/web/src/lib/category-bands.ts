import 'server-only'
import { unstable_cache } from 'next/cache'
import { db, Prisma } from '@indus/db'
import { STOREFRONT_TAGS } from './cache-tags'
import { CATALOGUE_STOCK_POSTURE, buildSpecFacets, marketBySlug } from '@indus/domain'

/**
 * The data behind the category page's editorial bands.
 *
 * Both of these are read rather than authored, for the same reason: a shelf's
 * size coverage and the markets it ships to change under the copy, and a typed
 * figure would be wrong the week after someone typed it.
 */

export type CategorySizeSummary = {
  /** Products on this shelf that publish a size table. */
  products: number
  /** Orderable sizes across them. */
  sizes: number
  /** Smallest and largest bore in millimetres, where the tables carry one. */
  boreMm: { min: number; max: number } | null
  /** The inch labels at each end of the range, where the tables carry them. */
  boreInch: { min: string; max: string } | null
}

/**
 * What the size tables under one category branch actually cover.
 *
 * Returns null when nothing on the shelf has a size table — which is most of
 * the catalogue, so the band that reads this hides itself rather than
 * announcing "0 sizes".
 */
export async function categorySizeSummary(
  categoryIds: readonly string[],
): Promise<CategorySizeSummary | null> {
  if (categoryIds.length === 0) return null

  /*
   * One aggregate, one row.
   *
   * This used to `findMany` every variant in the subtree and reduce it in
   * JavaScript — 5,917 rows crossing the wire on the largest shelf to produce
   * four numbers and two labels. pg_stat_statements had it at 8.9 BILLION rows
   * returned over 78 days, the single largest contributor to Supabase egress.
   *
   * The shape below is a transcription of the code it replaces, not an
   * improvement on it:
   *   - `sizes` counted every variant row, including ones with no bore.
   *   - `products` counted distinct products across all of them, likewise.
   *   - `boreMm` came from the non-null bores only; SQL min/max skip nulls,
   *     which is the same rule.
   *   - the inch labels are the DOMINANT spelling at the smallest and largest
   *     bore. The old code used `.find()` over an unordered result, so when
   *     several rows shared a bore the winner was whichever Postgres happened
   *     to return first. That matters here: the catalogue disagrees with
   *     itself at DN4, carrying both 3/16" (4 variants) and 1/8" (3). Counting
   *     picks the same label the site shows today, and picks it on purpose —
   *     the same rule `buildSpecFacets` already uses for merged facet values.
   */
  const [row] = await db.$queryRaw<
    Array<{
      sizes: bigint
      products: bigint
      bore_min: number | null
      bore_max: number | null
      inch_min: string | null
      inch_max: string | null
    }>
  >`
    WITH v AS (
      SELECT pv."productId", pv."hoseDn", pv."hoseInch"
      FROM "product_variants" pv
      JOIN "products" p ON p."id" = pv."productId"
      WHERE p."categoryId" IN (${Prisma.join([...categoryIds])})
        AND p."status" = CAST('active' AS "ProductStatus")
    )
    SELECT
      (SELECT count(*) FROM v)                       AS sizes,
      (SELECT count(DISTINCT "productId") FROM v)    AS products,
      (SELECT min("hoseDn") FROM v)                  AS bore_min,
      (SELECT max("hoseDn") FROM v)                  AS bore_max,
      (SELECT vv."hoseInch" FROM v vv
        WHERE vv."hoseDn" = (SELECT min("hoseDn") FROM v) AND vv."hoseInch" IS NOT NULL
        GROUP BY vv."hoseDn", vv."hoseInch"
        ORDER BY count(*) DESC, (SELECT count(*) FROM "product_variants" cv
             JOIN "products" cp ON cp."id" = cv."productId"
             WHERE cp."status" = CAST('active' AS "ProductStatus")
               AND cv."hoseDn" = vv."hoseDn" AND cv."hoseInch" = vv."hoseInch") DESC, vv."hoseInch"
        LIMIT 1)                                       AS inch_min,
      (SELECT vv."hoseInch" FROM v vv
        WHERE vv."hoseDn" = (SELECT max("hoseDn") FROM v) AND vv."hoseInch" IS NOT NULL
        GROUP BY vv."hoseDn", vv."hoseInch"
        ORDER BY count(*) DESC, (SELECT count(*) FROM "product_variants" cv
             JOIN "products" cp ON cp."id" = cv."productId"
             WHERE cp."status" = CAST('active' AS "ProductStatus")
               AND cv."hoseDn" = vv."hoseDn" AND cv."hoseInch" = vv."hoseInch") DESC, vv."hoseInch"
        LIMIT 1)                                       AS inch_max
  `

  const sizes = Number(row?.sizes ?? 0)
  if (sizes === 0) return null

  const boreMm =
    row?.bore_min != null && row?.bore_max != null
      ? { min: Number(row.bore_min), max: Number(row.bore_max) }
      : null

  // Both ends or neither — a half-labelled range reads as a typo.
  const boreInch =
    row?.inch_min && row?.inch_max ? { min: row.inch_min, max: row.inch_max } : null

  return {
    products: Number(row?.products ?? 0),
    sizes,
    boreMm,
    boreInch,
  }
}

export type GccMarketLink = { slug: string; name: string; leadTime: string }

/** The GCC states, for the band that links a shelf to its export markets. */
const GCC_SLUGS = ['saudi-arabia', 'oman', 'qatar', 'bahrain', 'kuwait'] as const

/**
 * The market links a shelf points at.
 *
 * This is the return leg of a link that has only ever run one way: market
 * pages link out to 187 categories and no category has ever linked back. The
 * list is the five other GCC states — the UAE is where the stock sits, and it
 * is covered by the stock line above these links rather than by a link to a
 * page about exporting to ourselves.
 */
export function gccMarketLinks(): GccMarketLink[] {
  const out: GccMarketLink[] = []
  for (const slug of GCC_SLUGS) {
    const market = marketBySlug(slug)
    if (market) out.push({ slug, name: market.name, leadTime: market.leadTime })
  }
  return out
}

/** The one-line stock claim these bands repeat, from the catalogue posture. */
export function stockLine(): string | null {
  if (!CATALOGUE_STOCK_POSTURE.exStock) return null
  return `Ex-stock from Dubai, delivered within ${CATALOGUE_STOCK_POSTURE.deliveryDays} working days in the UAE.`
}

/**
 * The facet chips for an unfiltered shelf, built once and cached.
 *
 * Same rows, same builder, same output — but computed on a cache miss per
 * subtree rather than on every render. The shelf page calls this only when
 * nothing is filtering, which is the case that is cached and crawled; a
 * filtered view still reads the rows live, because it needs to know which
 * products carry a value rather than how many.
 *
 * Tagged with both `products` and `categories`: a facet's counts move when a
 * product's specs change AND when the tree it rolls up changes shape. Both
 * tags are already purged by the admin actions that do those things.
 */
export const getShelfFacets = unstable_cache(
  async (categoryIds: readonly string[]) => {
    if (categoryIds.length === 0) return []
    const rows = await db.productSpec.findMany({
      where: {
        isFilterable: true,
        product: { categoryId: { in: [...categoryIds] }, status: 'active' },
      },
      select: { productId: true, label: true, value: true },
    })
    return buildSpecFacets(rows)
  },
  ['shelf-facets'],
  { revalidate: 3600, tags: [STOREFRONT_TAGS.products, STOREFRONT_TAGS.categories] },
)
