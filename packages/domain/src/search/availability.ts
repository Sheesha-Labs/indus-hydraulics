/**
 * Availability filter for `/search` (and any future PLP that adopts it).
 *
 * The URL `avail` param accepts:
 *   - `in_stock`   → what the catalogue calls available. Under the ex-stock
 *                    posture that is every listed product, so the filter
 *                    matches everything rather than the one product with a
 *                    counted `stockQty` — a filter labelled "In stock" that
 *                    returned one row while every page said ex-stock would be
 *                    the site disagreeing with itself.
 *   - `ships_24h`  → products with `stockQty > 0` AND lead-time of 1 day
 *                    or less. Deliberately still per-product: the posture
 *                    claims three days, not one, so nothing inherits this.
 *   - missing/anything else → no filter applied
 *
 * Returns the Prisma `where` fragment to AND into the existing query —
 * `null` when no filter should apply, so the caller can spread without
 * defaulting.
 *
 * Pure logic — testable without a DB.
 */

import { CATALOGUE_STOCK_POSTURE, type CatalogueStockPosture } from '../stock-posture'

export type AvailabilityMode = 'in_stock' | 'ships_24h'

export const AVAILABILITY_MODES: ReadonlyArray<AvailabilityMode> = ['in_stock', 'ships_24h']

export const AVAILABILITY_LABELS: Record<AvailabilityMode, string> = {
  in_stock: 'In stock',
  ships_24h: 'Ships in 24h',
}

export function parseAvailabilityParam(
  raw: string | undefined | null,
): AvailabilityMode | null {
  if (!raw) return null
  return AVAILABILITY_MODES.includes(raw as AvailabilityMode)
    ? (raw as AvailabilityMode)
    : null
}

/**
 * Builds the Prisma `where` fragment representing the chosen availability
 * mode. Returns `null` when no mode is supplied — caller should fall back
 * to no filter.
 */
export function availabilityToWhere(
  mode: AvailabilityMode | null,
  posture: CatalogueStockPosture = CATALOGUE_STOCK_POSTURE,
): Record<string, unknown> | null {
  if (!mode) return null
  if (mode === 'in_stock') {
    // No fragment at all when the whole catalogue is ex-stock: every active
    // product already qualifies, and AND-ing `stockQty > 0` would hide 1,485
    // of them behind a filter whose label they satisfy.
    if (posture.exStock && posture.exemptCategories.length === 0) return null
    return { OR: [{ stockQty: { gt: 0 } }, ...(posture.exStock ? [{ status: 'active' }] : [])] }
  }
  // ships_24h: in stock AND lead time ≤ 1 (or null = no lead time recorded)
  return {
    stockQty: { gt: 0 },
    OR: [{ leadTimeDays: null }, { leadTimeDays: { lte: 1 } }],
  }
}

/**
 * The availability filters worth OFFERING under a given posture.
 *
 * "Ships in 24h" asks for something the catalogue-wide claim does not make —
 * it promises three days — so under that posture the control matches only the
 * handful of products carrying a counted stock figure and a one-day lead time,
 * which today is none. A filter that always returns nothing is a broken
 * control, so it is not offered while the posture is the answer. The parser
 * still accepts the value, so an old bookmark keeps working.
 */
export function offeredAvailabilityModes(
  posture: CatalogueStockPosture = CATALOGUE_STOCK_POSTURE,
): ReadonlyArray<AvailabilityMode> {
  if (posture.exStock && posture.deliveryDays > 1) return ['in_stock']
  return AVAILABILITY_MODES
}
