import { unstable_cache } from 'next/cache'
import {
  buildThreadReference,
  groupThreadReference,
  type ThreadFamily,
  type ThreadReading,
} from '@indus/domain'
import { db } from '@indus/db'
import { STOREFRONT_TAGS } from './cache-tags'

/**
 * Every port thread the catalogue actually carries, counted and grouped.
 *
 * One `GROUP BY` over `product_variants`, cached on the `products` tag so it
 * refreshes when the catalogue does. The read is cheap — a grouped count over
 * ~6,300 rows returning ~319 — but the page is prerendered and this keeps it
 * that way rather than making the route dynamic for a table that changes when
 * an importer runs.
 *
 * The grouping deliberately happens in JavaScript rather than SQL: the
 * multiplication-sign normalisation lives in `@indus/domain` next to the parser
 * that reads the designation, and a second implementation in SQL would be free
 * to drift from it. Same reasoning as `normaliseFacetValue`.
 */
export const getThreadReference = unstable_cache(
  async (): Promise<Array<{ family: Exclude<ThreadFamily, 'unknown'>; rows: ThreadReading[] }>> => {
    const rows = await db.productVariant.groupBy({
      by: ['portLabel'],
      _count: { _all: true },
      where: { portLabel: { not: null } },
    })

    const readings = buildThreadReference(
      rows
        .filter((r): r is typeof r & { portLabel: string } => Boolean(r.portLabel?.trim()))
        .map((r) => ({ label: r.portLabel, variants: r._count._all })),
    )

    return groupThreadReference(readings)
  },
  // The suffix is a shape version, not decoration. Vercel's Data Cache outlives a
  // deployment, so an entry written by an older build is served back to a newer
  // one; when the returned shape changes, the key has to change with it or the
  // page renders yesterday's fields as blanks. Bump it whenever ThreadReading does.
  ['thread-reference', 'v2'],
  { tags: [STOREFRONT_TAGS.products], revalidate: 3600 },
)
