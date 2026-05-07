/**
 * Availability filter for `/search` (and any future PLP that adopts it).
 *
 * The URL `avail` param accepts:
 *   - `in_stock`   → products with `stockQty > 0`
 *   - `ships_24h`  → products with `stockQty > 0` AND lead-time of 1 day
 *                    or less. `leadTimeDays IS NULL` is treated as ≤ 1
 *                    (no recorded lead time = "ships from stock").
 *   - missing/anything else → no filter applied
 *
 * Returns the Prisma `where` fragment to AND into the existing query —
 * `null` when no filter should apply, so the caller can spread without
 * defaulting.
 *
 * Pure logic — testable without a DB.
 */

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
): Record<string, unknown> | null {
  if (!mode) return null
  if (mode === 'in_stock') {
    return { stockQty: { gt: 0 } }
  }
  // ships_24h: in stock AND lead time ≤ 1 (or null = no lead time recorded)
  return {
    stockQty: { gt: 0 },
    OR: [{ leadTimeDays: null }, { leadTimeDays: { lte: 1 } }],
  }
}
