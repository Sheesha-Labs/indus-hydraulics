/**
 * Units of measure (S08-T02). The table lives in the database (`ops.uom_unit`, `ops.uom_alias`); this module
 * only applies it. A unit read from a column header instead of the line itself is a softer reading ("header").
 */
export type UomMethod = 'exact' | 'alias' | 'header' | 'unknown' | 'missing'

export interface UomTable {
  /** Unit codes: EA, PR, SET, M … */
  codes: ReadonlySet<string>
  /** Alias (uppercase, no trailing dot) → unit code. */
  aliases: ReadonlyMap<string, string>
}

export function uomKey(raw: string): string {
  return raw.trim().toUpperCase().replace(/\.+$/, '').replace(/\s+/g, ' ')
}

export function normaliseUom(
  raw: string | null | undefined,
  table: UomTable,
  opts: { fromHeader?: boolean } = {}
): { code: string | null; method: UomMethod } {
  if (!raw || !raw.trim()) return { code: null, method: 'missing' }
  const key = uomKey(raw)
  const found = table.codes.has(key) ? key : (table.aliases.get(key) ?? null)
  if (!found) return { code: null, method: 'unknown' }
  if (opts.fromHeader) return { code: found, method: 'header' }
  return { code: found, method: table.codes.has(key) ? 'exact' : 'alias' }
}

/** Counts per normalised unit for a set of lines (board 35 "NOS → EA ·8"); unknown units under their raw text. */
export function unitCounts(
  raws: ReadonlyArray<string | null | undefined>,
  table: UomTable
): Array<{ raw: string; code: string | null; count: number }> {
  const by = new Map<string, { raw: string; code: string | null; count: number }>()
  for (const raw of raws) {
    if (!raw || !raw.trim()) continue
    const key = uomKey(raw)
    const { code } = normaliseUom(raw, table)
    const prev = by.get(key)
    if (prev) prev.count += 1
    else by.set(key, { raw: key, code, count: 1 })
  }
  return [...by.values()].sort((a, b) => b.count - a.count)
}
