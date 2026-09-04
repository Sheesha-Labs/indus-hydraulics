/**
 * Reading a port designation off the catalogue and saying what it is.
 *
 * WHY THIS EXISTS
 *
 * `/tools/thread-identifier` asks three questions and names a family. It is a
 * good tool and it is 225 words long, which means it is not a page anyone links
 * to and not a page Google has much reason to fetch. What turns a widget into a
 * reference is data, and we are sitting on some: 5,803 product variants carry a
 * port designation, across 319 distinct spellings, every one of them a thread
 * that appears on a real part somebody can buy.
 *
 * Published as a table, that is a resource this industry does not otherwise
 * have for free — thread guides are textbook extracts or gated behind a
 * manufacturer's login. Ours comes off a live catalogue, and carries the one
 * number a textbook cannot: how many parts actually wear each thread.
 *
 * WHAT IT WILL AND WILL NOT CLAIM
 *
 * A thread designation identifies the THREAD. It does not identify the fitting
 * family, and the difference is the whole point of the article this table sits
 * under: JIC, ORFS and SAE O-ring boss all run UNF threads, and only the seat
 * tells them apart. So the UNF note says that, and never picks one.
 *
 * The same honesty rule decides the pipe threads. `1/2"-14` with no prefix is
 * NPT *or* BSPT — both are 14 TPI at that size, and only the 60°/55° flank
 * angle separates them — so it is published as an ambiguous pipe thread rather
 * than assigned. `3/8"-18` is not ambiguous: BSPT is 19 TPI at 3/8", so NPT is
 * the only standard that fits, and it is named. That distinction is table-
 * driven (see PIPE_TPI below), not a judgement call per row.
 *
 * Anything the parser cannot read confidently is dropped rather than guessed
 * at — bare sizes with no pitch (`1"`), weld preps (`2" butt weld, Sch XXS`),
 * and oilfield LP threads, whose label carries no pitch at all. A reference
 * table with a wrong row in it is worse than a shorter one.
 */

/** The thread families a designation can be read as. */
export type ThreadFamily = 'metric' | 'bsp' | 'bspt' | 'npt' | 'pipe' | 'unf' | 'unknown'

export type ThreadReading = {
  /** Normalised for grouping — see `normaliseThreadLabel`. */
  readonly key: string
  /** Canonical spelling for display: `M16×1.5`, `G1/2"`, `NPT 1/2"-14`. */
  readonly designation: string
  readonly family: ThreadFamily
  /** Nominal size as written: `M18`, `G1/2"`, `9/16"`. */
  readonly size: string
  /** Millimetre pitch for metric, threads per inch for everything else. */
  readonly pitch: string
  /** How many catalogue variants carry it. Filled in by `buildThreadReference`. */
  readonly variants: number
}

/**
 * The two spelling traps in this column.
 *
 * `M16X1.5` (175 variants) and `M16×1.5` (59) are the same thread entered by
 * two importers — a letter X against U+00D7 MULTIPLICATION SIGN. So are
 * `G1/2"X14` and `G1/2"-14`: separator by preference, not by standard.
 * Anything grouping on the raw string reports one thread three times with its
 * count split, which is also what the facet panel and the search index have
 * been doing. Normalising fixes the table; the rows are worth a cleanup.
 */
export function normaliseThreadLabel(label: string): string {
  return label
    .trim()
    .toUpperCase()
    .replace(/[×\-]/g, 'X')
    .replace(/["'\s]/g, '')
}

/** `1`, `3/4`, `1.1/4`, `9/16`, `1.11/16` — widest form first or it matches short. */
const SIZE = String.raw`(\d+\.\d+\/\d+|\d+\/\d+|\d+)`
const TPI = String.raw`(\d+(?:\.\d+)?)`

const METRIC = new RegExp(String.raw`^M(\d+(?:\.\d+)?)X(\d+(?:\.\d+)?)$`)
const NPT = new RegExp(String.raw`^NPTF?${SIZE}X${TPI}$`)
const BSPT = new RegExp(String.raw`^(RC|R)${SIZE}X${TPI}$`)
const BSP = new RegExp(String.raw`^G${SIZE}X${TPI}$`)
const INCH = new RegExp(String.raw`^${SIZE}X${TPI}$`)

/**
 * Threads per inch by nominal size for the two inch pipe standards.
 *
 * This table is the whole reason an un-prefixed `3/8"-18` can be named NPT
 * while `1/2"-14` cannot: at 3/8" the standards disagree (18 against 19) and at
 * 1/2" they agree. Sourced from ASME B1.20.1 and ISO 7-1.
 */
const PIPE_TPI: Record<string, { npt?: number; bspt?: number }> = {
  '1/16': { npt: 27, bspt: 28 },
  '1/8': { npt: 27, bspt: 28 },
  '1/4': { npt: 18, bspt: 19 },
  '3/8': { npt: 18, bspt: 19 },
  '1/2': { npt: 14, bspt: 14 },
  '3/4': { npt: 14, bspt: 14 },
  '1': { npt: 11.5, bspt: 11 },
  '1.1/4': { npt: 11.5, bspt: 11 },
  '1.1/2': { npt: 11.5, bspt: 11 },
  '2': { npt: 11.5, bspt: 11 },
  '2.1/2': { npt: 8, bspt: 11 },
  '3': { npt: 8, bspt: 11 },
  '4': { npt: 8, bspt: 11 },
}

/** Which inch-pipe standards can produce this size/pitch pair. */
function pipeFamilyFor(size: string, tpi: number): 'npt' | 'bspt' | 'pipe' | null {
  const row = PIPE_TPI[size]
  if (!row) return null
  const isNpt = row.npt === tpi
  const isBspt = row.bspt === tpi
  if (isNpt && isBspt) return 'pipe'
  if (isNpt) return 'npt'
  if (isBspt) return 'bspt'
  return null
}

const unread = (key: string, label: string): ThreadReading => ({
  key,
  designation: label,
  family: 'unknown',
  size: label,
  pitch: '',
  variants: 0,
})

/**
 * Read one designation. Returns `unknown` rather than a guess.
 *
 * Prefixes are tried before the bare-fraction rule, or `G1/2"X14` loses its `G`
 * and is published as a UNF thread it is not.
 */
export function readThreadLabel(label: string): ThreadReading {
  const key = normaliseThreadLabel(label)

  const metric = METRIC.exec(key)
  if (metric) {
    return {
      key,
      designation: `M${metric[1]}×${metric[2]}`,
      family: 'metric',
      size: `M${metric[1]}`,
      pitch: `${metric[2]} mm`,
      variants: 0,
    }
  }

  const npt = NPT.exec(key)
  if (npt) {
    return {
      key,
      designation: `NPT ${npt[1]}"-${npt[2]}`,
      family: 'npt',
      size: `${npt[1]}"`,
      pitch: `${npt[2]} TPI`,
      variants: 0,
    }
  }

  const bspt = BSPT.exec(key)
  if (bspt) {
    const male = bspt[1] === 'R'
    return {
      key,
      designation: `${male ? 'R' : 'Rc'} ${bspt[2]}"-${bspt[3]}`,
      family: 'bspt',
      size: `${bspt[2]}"`,
      pitch: `${bspt[3]} TPI`,
      variants: 0,
    }
  }

  const bsp = BSP.exec(key)
  if (bsp) {
    return {
      key,
      designation: `G${bsp[1]}"-${bsp[2]}`,
      family: 'bsp',
      size: `G${bsp[1]}"`,
      pitch: `${bsp[2]} TPI`,
      variants: 0,
    }
  }

  const inch = INCH.exec(key)
  if (inch) {
    const size = inch[1]!
    const tpi = Number(inch[2])
    const pipe = pipeFamilyFor(size, tpi)
    return {
      key,
      designation: `${size}"-${inch[2]}`,
      family: pipe ?? 'unf',
      size: `${size}"`,
      pitch: `${inch[2]} TPI`,
      variants: 0,
    }
  }

  return unread(key, label)
}

/** Human label for a family, for table headings. */
export const THREAD_FAMILY_LABEL: Record<Exclude<ThreadFamily, 'unknown'>, string> = {
  metric: 'Metric',
  bsp: 'BSP parallel — G',
  bspt: 'BSP taper — R and Rc',
  npt: 'NPT',
  pipe: 'Inch pipe — NPT or BSP taper',
  unf: 'Inch straight — UN/UNF',
}

/**
 * What a family settles, and what it leaves open. One per family rather than
 * one per row: 33 metric rows sharing one sentence is 33 copies of the same
 * 100 characters in the HTML, and a reader who has read it once is being made
 * to read it 32 more times.
 */
export const THREAD_FAMILY_NOTE: Record<Exclude<ThreadFamily, 'unknown'>, string> = {
  metric:
    'A 60° metric thread. On a hydraulic port it is normally a 24° cone (DIN 2353 / ISO 8434-1) or a metric O-ring port — the seat decides, not the thread.',
  bsp: 'Parallel, 55° Whitworth form, ISO 228. It never seals on the thread: the seal is a 60° cone in the port or a bonded washer under the hex.',
  bspt: 'Taper, 55° Whitworth form, ISO 7. R is the male taper, Rc the female. It seals on the thread itself, so it wants sealant and it is not reusable indefinitely.',
  npt: 'Taper, 60° form, ASME B1.20.1, sealing on the thread. Nothing in the label is prefixed here, but at these sizes BSP taper has a different pitch, so NPT is the only standard that fits.',
  pipe: 'At 1/2" and 3/4" both NPT and BSP taper are 14 TPI, so a designation with no prefix does not tell you which one you are holding. Measure the flank angle — 60° is NPT, 55° is BSP.',
  unf: 'A straight UN/UNF thread. JIC 37° flare, ORFS and SAE O-ring boss all run these, so the thread narrows it to three and the seat picks between them.',
}

/** The order the table presents families in: metric, then BSP, then inch. */
const FAMILY_ORDER: Array<Exclude<ThreadFamily, 'unknown'>> = [
  'metric',
  'bsp',
  'bspt',
  'npt',
  'pipe',
  'unf',
]

/**
 * Collapse raw catalogue labels into published rows, heaviest first.
 *
 * Counts are summed across spellings, so `M16X1.5` and `M16×1.5` arrive as one
 * row carrying 234 variants rather than two rows carrying 175 and 59. Unknown
 * readings are dropped — see the file header.
 */
export function buildThreadReference(
  rows: ReadonlyArray<{ label: string; variants: number }>,
): ThreadReading[] {
  const merged = new Map<string, { reading: ThreadReading; variants: number }>()

  for (const row of rows) {
    const reading = readThreadLabel(row.label)
    if (reading.family === 'unknown') continue
    const existing = merged.get(reading.key)
    if (existing) existing.variants += row.variants
    else merged.set(reading.key, { reading, variants: row.variants })
  }

  return [...merged.values()]
    .sort((a, b) => b.variants - a.variants || a.reading.key.localeCompare(b.reading.key))
    .map((e) => ({ ...e.reading, variants: e.variants }))
}

/** Rows grouped by family, in the order the table presents them. */
export function groupThreadReference(
  readings: readonly ThreadReading[],
): Array<{ family: Exclude<ThreadFamily, 'unknown'>; rows: ThreadReading[] }> {
  return FAMILY_ORDER.map((family) => ({
    family,
    rows: readings.filter((r) => r.family === family),
  })).filter((g) => g.rows.length > 0)
}
