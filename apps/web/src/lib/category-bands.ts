import 'server-only'
import { db } from '@indus/db'
import { CATALOGUE_STOCK_POSTURE, marketBySlug } from '@indus/domain'

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

  const variants = await db.productVariant.findMany({
    where: {
      product: { categoryId: { in: [...categoryIds] }, status: 'active' },
    },
    select: { productId: true, hoseDn: true, hoseInch: true },
  })
  if (variants.length === 0) return null

  const bores = variants
    .map((v) => v.hoseDn)
    .filter((dn): dn is number => typeof dn === 'number')

  // The inch label is carried per row, so the ends of the range are the labels
  // sitting on the smallest and largest bore — never a conversion done here.
  let boreInch: CategorySizeSummary['boreInch'] = null
  if (bores.length > 0) {
    const min = Math.min(...bores)
    const max = Math.max(...bores)
    const labelAt = (dn: number) =>
      variants.find((v) => v.hoseDn === dn && v.hoseInch)?.hoseInch ?? null
    const minLabel = labelAt(min)
    const maxLabel = labelAt(max)
    if (minLabel && maxLabel) boreInch = { min: minLabel, max: maxLabel }
  }

  return {
    products: new Set(variants.map((v) => v.productId)).size,
    sizes: variants.length,
    boreMm: bores.length > 0 ? { min: Math.min(...bores), max: Math.max(...bores) } : null,
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
