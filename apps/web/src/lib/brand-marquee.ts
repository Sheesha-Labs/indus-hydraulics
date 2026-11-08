/**
 * Which brands appear in the home page's logo marquee, and in what order.
 *
 * Only brands that carry a logo are eligible — a name-only tile in a strip of
 * logos reads as a broken image. Two further rules come from the data:
 *
 * 1. One tile per picture. Several brands deliberately share a parent's logo
 *    (Cessna, Char-Lynn, Eaton Aeroquip and Eaton Winner all point at one
 *    Danfoss Media row; Anson uses NOV's, DEMCO uses Cameron's), and Dixon and
 *    Dixon Valve & Coupling carry the same file under two storage keys. A
 *    marquee showing the Danfoss mark four times running looks like a bug, so
 *    tiles are de-duplicated on the Media row AND on the file's fingerprint
 *    (bytes × width × height). The brand kept for a shared picture is the one
 *    the logo actually names (`alt === "<name> logo"`), else the one with the
 *    most active SKUs — the page a click is most likely to want.
 * 2. Not our own house brand. The section is "Authorised distributor for the
 *    names engineers trust"; the Indus mark is not one of those names.
 *
 * Order is by active SKU count, descending, so the best-stocked makers lead
 * the strip; ties fall back to name so the order is stable between renders.
 */

/** The house brand's slug — the same literal the catalogue code keys on. */
export const HOUSE_BRAND_SLUG = 'indus'

export type MarqueeBrandRow = {
  slug: string
  name: string
  skuCount: number
  logo: {
    id: string
    storagePath: string
    alt: string | null
    width: number | null
    height: number | null
    bytes: number | null
  } | null
}

export type MarqueeBrand = {
  slug: string
  name: string
  logoPath: string
}

function namesItself(row: MarqueeBrandRow): boolean {
  const alt = row.logo?.alt?.trim().toLowerCase()
  return !!alt && alt.startsWith(`${row.name.trim().toLowerCase()} logo`)
}

/** True when `a` should be the tile for a picture `b` also uses. */
function preferred(a: MarqueeBrandRow, b: MarqueeBrandRow): boolean {
  const an = namesItself(a)
  const bn = namesItself(b)
  if (an !== bn) return an
  if (a.skuCount !== b.skuCount) return a.skuCount > b.skuCount
  return a.name.localeCompare(b.name) < 0
}

function fingerprint(logo: NonNullable<MarqueeBrandRow['logo']>): string | null {
  if (logo.bytes == null || logo.width == null || logo.height == null) return null
  return `${logo.bytes}:${logo.width}x${logo.height}`
}

export function selectMarqueeBrands(rows: readonly MarqueeBrandRow[]): MarqueeBrand[] {
  // A row joins the first group that shares either its Media id or its file
  // fingerprint — two keys, so one lookup map per key.
  const groups: MarqueeBrandRow[][] = []
  const byMedia = new Map<string, number>()
  const byPrint = new Map<string, number>()

  for (const row of rows) {
    if (!row.logo || row.slug === HOUSE_BRAND_SLUG) continue
    const print = fingerprint(row.logo)
    const existing = byMedia.get(row.logo.id) ?? (print ? byPrint.get(print) : undefined)
    const idx = existing ?? groups.push([]) - 1
    groups[idx]!.push(row)
    byMedia.set(row.logo.id, idx)
    if (print) byPrint.set(print, idx)
  }

  return groups
    .map((group) => group.reduce((best, row) => (preferred(row, best) ? row : best)))
    .sort((a, b) => b.skuCount - a.skuCount || a.name.localeCompare(b.name))
    .map((row) => ({ slug: row.slug, name: row.name, logoPath: row.logo!.storagePath }))
}

/**
 * The marquee's cycle time, as a literal class Tailwind can see.
 *
 * Speed should stay near 40 px/s whatever the brand count (a tile plus its
 * spacing is ~260px at md, so ~6.5 s per brand). Inline `style=` is banned in
 * this app, and Tailwind only generates classes it finds written out in full,
 * so the duration is picked from a fixed ladder of literal classes rather than
 * interpolated. Rounding to the nearest ten brands moves the speed by at most
 * a few percent, which nobody can see.
 */
const DURATION_BY_TENS: Record<number, string> = {
  10: '[animation-duration:65s]',
  20: '[animation-duration:130s]',
  30: '[animation-duration:195s]',
  40: '[animation-duration:260s]',
  50: '[animation-duration:325s]',
  60: '[animation-duration:390s]',
  70: '[animation-duration:455s]',
  80: '[animation-duration:520s]',
  90: '[animation-duration:585s]',
  100: '[animation-duration:650s]',
}

export function marqueeDurationClass(count: number): string {
  const tens = Math.min(100, Math.max(10, Math.round(count / 10) * 10))
  return DURATION_BY_TENS[tens]!
}
