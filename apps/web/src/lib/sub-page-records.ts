import 'server-only'
import { db } from '@indus/db'
import { marketsOrdered, releasedMarketPageSlugs, type SubPageKind } from '@indus/domain'

/**
 * The records behind each sub-page family, in one shape.
 *
 * The admin's kind index and editor are generic; this is the only place that
 * knows a market comes from a code registry and a brand comes from a table.
 * Without it both routes would grow a `switch` and drift apart.
 */
export type SubPageRecord = {
  slug: string
  name: string
  /** A short code shown beside the name — a country code, a brand's country. */
  code: string
  /**
   * Is this page actually public? A market is live once its regulatory copy
   * clears review; a brand is live once it is published. An editor needs the
   * split because most markets are held back, and editing a page nobody can
   * reach should say so rather than look the same as editing a live one.
   */
  live: boolean
}

export async function listSubPageRecords(kind: SubPageKind): Promise<SubPageRecord[]> {
  switch (kind) {
    case 'market': {
      const released = new Set(releasedMarketPageSlugs())
      return marketsOrdered().map((market) => ({
        slug: market.slug,
        name: market.name,
        code: market.countryCode,
        live: released.has(market.slug),
      }))
    }
    case 'brand': {
      const brands = await db.brand.findMany({
        orderBy: { name: 'asc' },
        select: { slug: true, name: true, country: true, isPublished: true },
      })
      return brands.map((brand) => ({
        slug: brand.slug,
        name: brand.name,
        code: brand.country?.toUpperCase() ?? '',
        live: brand.isPublished,
      }))
    }
    default: {
      const exhaustive: never = kind
      throw new Error(`Unknown sub-page kind: ${String(exhaustive)}`)
    }
  }
}

export async function findSubPageRecord(
  kind: SubPageKind,
  slug: string,
): Promise<SubPageRecord | null> {
  const records = await listSubPageRecords(kind)
  return records.find((r) => r.slug === slug) ?? null
}

/** How many pages of each kind exist, for the counts on the Pages index. */
export async function countSubPageRecords(
  kinds: readonly SubPageKind[],
): Promise<Record<string, number>> {
  const out: Record<string, number> = {}
  for (const kind of kinds) out[kind] = (await listSubPageRecords(kind)).length
  return out
}
