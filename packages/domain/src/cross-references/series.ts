/**
 * Competitor series and per-size equivalents.
 *
 * A cross-reference row names one competitor part number. Most competitor
 * numbers are a series code plus a size — Parker `4 HTX-SS`, Aeroquip
 * `259-2027-4-4`, SSP `J4U` — so the same Indus listing matches one series in
 * many sizes. Grouping by series is what lets a product page say "equivalent
 * to Parker HTX-SS" once, and a brand hub list a series once, instead of
 * minting a near-identical page per part number (the reason the per-part
 * pages are noindex — see `replacement/[brand]/[mpn]/page.tsx`).
 *
 * Pure: no Prisma, no React.
 */

/**
 * Designations that identify a part by a standard rather than by a maker —
 * the SAE J514/J516 code and the US military (MS) number. They print as
 * size-table columns, but they are not brands: there is no "SAE replacement"
 * page to link to and no one to be "not affiliated with".
 */
export const STANDARD_DESIGNATION_BRANDS: readonly string[] = ['SAE', 'MS']

export function isStandardDesignation(brand: string): boolean {
  return STANDARD_DESIGNATION_BRANDS.includes(brand)
}

/**
 * Tube-fitting systems whose equivalents are functional, not interchangeable:
 * the same job in the same size, but nuts, ferrules and bodies from two makers
 * must never be mixed in one joint.
 */
export const NON_INTERMIX_BRANDS: readonly string[] = ['Swagelok', 'Parker A-LOK', 'SSP Duolok']

/** Column and listing order: makers first, standard designations last. */
const BRAND_ORDER = [
  'Parker',
  'Aeroquip',
  'SSP',
  'Swagelok',
  'Parker A-LOK',
  'SSP Duolok',
  'Brennan / Tompkins',
  'Crosby',
  'SAE',
  'MS',
]

export function compareEquivalentBrands(a: string, b: string): number {
  const ia = BRAND_ORDER.indexOf(a)
  const ib = BRAND_ORDER.indexOf(b)
  if (ia !== ib)
    return (ia === -1 ? BRAND_ORDER.length : ia) - (ib === -1 ? BRAND_ORDER.length : ib)
  return a.localeCompare(b)
}

/** Brands whose codes carry the size inside a token (`J4U`, `4C4-SS`, `ISSD4C`). */
const EMBEDDED_SIZE_BRANDS = /^(ssp|ssp duolok|parker a-lok)$/i

/** Placeholder for a stripped size; never a character a part number contains. */
const SIZE = '\u0000'

/**
 * The competitor series a part number belongs to, with its size stripped.
 *
 *   Parker   `4-2 HTX-SS`    → `HTX-SS`     Aeroquip `259-2027-4-2` → `259-2027`
 *   Parker   `19243-4-4`     → `19243`      SSP      `J4-2U`        → `J#U`
 *   Swagelok `SS-400-1-4`    → `SS-#-1`   Crosby   `G-209`        → `G-209`
 *
 * Sizes are one- or two-digit dash numbers (a -32 is the largest common
 * size). Three- and four-digit numbers are style codes and are kept, which is
 * why Crosby patterns and Parker style prefixes survive. A size that cannot be
 * stripped cleanly from either end stays in the label as `#`, rather than the
 * label silently claiming a series that a different size might not share.
 */
export function crossReferenceSeries(brand: string, mpn: string): string {
  const m = mpn.trim()
  if (!m || isStandardDesignation(brand)) return m

  let s: string
  if (/^swagelok$/i.test(brand)) {
    // SS-810-1-8ST: material, tube size (100–600, 810, 1010 … 3200, or 6M0
    // metric), style (1 = male connector, 6 = reducing union …), then a port
    // size — bare, or with its thread/weld suffix (8ST, 4W) — only when a
    // fourth part is present. The style code defines the series; sizes go.
    const parts = m.split('-')
    s = parts
      .map((t, i) => {
        if (/^\d{1,2}(?:00|10)$/.test(t) || /^\d{1,2}M0$/.test(t)) return SIZE
        if (i === parts.length - 1 && parts.length >= 4)
          return t.replace(/^\d{1,2}(?=[A-Z]*$)/, SIZE)
        return t
      })
      .join('-')
  } else {
    const embedded = EMBEDDED_SIZE_BRANDS.test(brand)
    s = m
      .split(/([-\s])/)
      .map((t) => {
        if (/^\d{1,2}$/.test(t)) return SIZE
        if (embedded && /[A-Z]/.test(t)) {
          return t.replace(/(?<![A-Z0-9])\d{1,2}(?=[A-Z])|(?<=[A-Z])\d{1,2}(?!\d)/g, SIZE)
        }
        return t
      })
      .join('')
  }

  return s
    .replace(new RegExp(`${SIZE}(?:[-\\s]${SIZE})+`, 'g'), SIZE)
    .replace(new RegExp(`^${SIZE}[-\\s]`), '')
    .replace(new RegExp(`[-\\s]${SIZE}$`), '')
    .replace(new RegExp(SIZE, 'g'), '#')
    .trim()
}

export type EquivalentRow = {
  competitorBrand: string
  competitorMpn: string
  variantPartNumber?: string | null
  series?: string | null
}

/**
 * Per-size equivalents keyed by Indus part number, plus the ordered list of
 * brands that appear — the extra columns of a size table.
 */
export function equivalentsByPartNumber(rows: readonly EquivalentRow[]): {
  brands: string[]
  byPartNumber: Map<string, Record<string, string>>
} {
  const byPartNumber = new Map<string, Record<string, string>>()
  const brands = new Set<string>()
  for (const r of rows) {
    if (!r.variantPartNumber) continue
    const cell = byPartNumber.get(r.variantPartNumber) ?? {}
    // Two numbers for one size from one maker (a superseded and a current
    // code) both print, current-catalogue order.
    cell[r.competitorBrand] = cell[r.competitorBrand]
      ? `${cell[r.competitorBrand]} / ${r.competitorMpn}`
      : r.competitorMpn
    byPartNumber.set(r.variantPartNumber, cell)
    brands.add(r.competitorBrand)
  }
  return { brands: [...brands].sort(compareEquivalentBrands), byPartNumber }
}

export type SeriesSummary = { brand: string; series: string[]; sizes: number }

/**
 * Which competitor series a listing matches, per brand, most-matched series
 * first. Family-level rows (no part number) count as their own series.
 */
export function seriesByBrand(rows: readonly EquivalentRow[]): SeriesSummary[] {
  const map = new Map<string, Map<string, number>>()
  for (const r of rows) {
    const series = r.series || crossReferenceSeries(r.competitorBrand, r.competitorMpn)
    if (!series) continue
    const perBrand = map.get(r.competitorBrand) ?? new Map<string, number>()
    perBrand.set(series, (perBrand.get(series) ?? 0) + 1)
    map.set(r.competitorBrand, perBrand)
  }
  return [...map.entries()]
    .sort(([a], [b]) => compareEquivalentBrands(a, b))
    .map(([brand, counts]) => ({
      brand,
      series: [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([s]) => s),
      sizes: [...counts.values()].reduce((n, c) => n + c, 0),
    }))
}

/**
 * One sentence naming what a listing is equivalent to, for the line above the
 * size table: "Equivalent to Parker HTX-SS, Aeroquip 259-2027 and SSP J#U
 * (SAE 70101, MS51501)." Null when there is nothing to say. At most two series
 * per brand — a listing that matches more is better read in the table.
 */
export function equivalenceSentence(summaries: readonly SeriesSummary[]): string | null {
  const makers = summaries.filter((s) => !isStandardDesignation(s.brand))
  const standards = summaries.filter((s) => isStandardDesignation(s.brand))
  if (makers.length === 0 && standards.length === 0) return null
  // A designation that already carries its prefix (MS51501) is not printed
  // twice ("MS MS51501").
  const name = (s: SeriesSummary) => {
    const series = s.series.slice(0, 2).join(' / ')
    return series.startsWith(s.brand) ? series : `${s.brand} ${series}`
  }
  const list = (items: string[]) =>
    items.length <= 1
      ? items.join('')
      : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
  const std = standards.length ? ` (${standards.map(name).join(', ')})` : ''
  return makers.length
    ? `Equivalent to ${list(makers.map(name))}${std}.`
    : `Made to ${standards.map(name).join(', ')}.`
}
