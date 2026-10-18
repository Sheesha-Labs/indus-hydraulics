import { convertPressure } from '../hydraulic-units'

/**
 * Maximum working pressure by connection type and size, for
 * `/resources/fitting-pressure-ratings`.
 *
 * WHAT THESE NUMBERS ARE
 *
 * The principal's published recommendations for CARBON STEEL adapters and
 * fittings: a 4:1 safety factor on each connection's minimum burst pressure,
 * tested at SAE assembly torque in hardened test blocks. They are guidelines,
 * not guarantees, and the page states the three conditions that move them —
 * material, the other end, and the hose — before it shows a single figure.
 *
 * THE RULE THE PAGE EXISTS TO TEACH: a joint is rated by its weakest end. A
 * 1/2" JIC × NPTF adapter is a 3,000 psi part, not a 4,500 psi one, because the
 * pipe thread end governs. `jointRating` computes exactly that.
 *
 * SOURCE NOTES
 *
 * The source table placed the Code 61 figures for 2-1/2" to 4" (2,500, 2,000,
 * 500 and 500 psi) in its BSP column. They are SAE J518 Code 61 ratings — the
 * Code 61 column above them is J518 to the psi, and those four numbers are the
 * standard's continuation of it — so they are filed under Code 61 here. A lone
 * 5,145 psi figure at 1/8" with no recoverable column is omitted. The metric
 * table's "M36×2.20" is M36×2, and its "1500psi" is 1,500.
 *
 * The SAE 100R2 column is carried as a REFERENCE, not a connection: it is the
 * two-wire hose a fitting of that size is most often crimped onto, so the
 * reader can see at a glance when the hose, not the fitting, is the limit.
 */

export type RatingConnectionId =
  | 'nptf'
  | 'npsm'
  | 'jic'
  | 'jic-swivel'
  | 'flareless'
  | 'orfs'
  | 'orfs-adjustable'
  | 'bsp'
  | 'code61'
  | 'code62'

export interface RatingConnection {
  readonly id: RatingConnectionId
  readonly name: string
  /** Short form for column heads. */
  readonly short: string
  readonly standard: string
  readonly note: string
}

export const RATING_CONNECTIONS: readonly RatingConnection[] = [
  {
    id: 'nptf',
    name: 'NPTF pipe thread, rigid',
    short: 'NPTF',
    standard: 'ASME B1.20.3',
    note: 'The lowest-rated end at most sizes, down to 1,000 psi at 1-1/2" and 2".',
  },
  {
    id: 'npsm',
    name: 'NPSM straight thread, swivel',
    short: 'NPSM',
    standard: 'ASME B1.20.1',
    note: 'Seals on a 30° seat. Tracks the two-wire hose rating at every size.',
  },
  {
    id: 'jic',
    name: 'JIC 37° flare, rigid',
    short: 'JIC rigid',
    standard: 'SAE J514',
    note: 'Metal-to-metal cone. 5,000 psi to 3/8", then falls steadily with size.',
  },
  {
    id: 'jic-swivel',
    name: 'JIC 37° flare, swivel or adjustable',
    short: 'JIC swivel',
    standard: 'SAE J514',
    note: 'A swivel nut or adjustable stud rates below the rigid end from 1/4" up.',
  },
  {
    id: 'flareless',
    name: 'SAE flareless (bite-type)',
    short: 'Flareless',
    standard: 'SAE J514',
    note: 'Rated through 1". Depends on the tube wall as much as the fitting.',
  },
  {
    id: 'orfs',
    name: 'ORFS, rigid',
    short: 'ORFS',
    standard: 'SAE J1453',
    note: '6,000 psi to 1", 4,000 psi above. The usual answer when a joint keeps weeping.',
  },
  {
    id: 'orfs-adjustable',
    name: 'ORFS, adjustable',
    short: 'ORFS adj.',
    standard: 'SAE J1453',
    note: 'Matches the rigid end to 7/8", then drops to 3,000 psi at 1-1/2".',
  },
  {
    id: 'bsp',
    name: 'BSPT / BSPP',
    short: 'BSP',
    standard: 'ISO 7-1 · ISO 228-1',
    note: 'From 6,500 psi at 1/4" down to 2,000 psi at 1-1/2" and 2".',
  },
  {
    id: 'code61',
    name: 'SAE Code 61 flange',
    short: 'Code 61',
    standard: 'SAE J518 · ISO 6162-1',
    note: 'The standard-pressure flange. 500 psi at 3-1/2" and 4".',
  },
  {
    id: 'code62',
    name: 'SAE Code 62 flange',
    short: 'Code 62',
    standard: 'SAE J518 · ISO 6162-2',
    note: '6,000 psi at every size it is made in.',
  },
]

export interface RatingRow {
  readonly dash: number
  readonly nominal: string
  /** SAE 100R2 two-wire hose at this size, for reference only. */
  readonly r2: number | null
  readonly psi: Readonly<Partial<Record<RatingConnectionId, number>>>
}

export const RATING_ROWS: readonly RatingRow[] = [
  { dash: 2, nominal: '1/8"', r2: null, psi: { nptf: 5000, npsm: 5000, jic: 5000, 'jic-swivel': 5000 } },
  {
    dash: 4,
    nominal: '1/4"',
    r2: 5000,
    psi: { nptf: 4000, npsm: 5000, jic: 5000, 'jic-swivel': 4500, flareless: 6000, orfs: 6000, 'orfs-adjustable': 6000, bsp: 6500 },
  },
  { dash: 5, nominal: '5/16"', r2: 4250, psi: { jic: 5000, 'jic-swivel': 4000, orfs: 6000, 'orfs-adjustable': 6000 } },
  {
    dash: 6,
    nominal: '3/8"',
    r2: 4000,
    psi: { nptf: 3000, npsm: 4000, jic: 5000, 'jic-swivel': 4000, flareless: 6000, orfs: 6000, 'orfs-adjustable': 6000, bsp: 5500 },
  },
  {
    dash: 8,
    nominal: '1/2"',
    r2: 3500,
    psi: {
      nptf: 3000,
      npsm: 3500,
      jic: 4500,
      'jic-swivel': 4000,
      flareless: 6000,
      orfs: 6000,
      'orfs-adjustable': 6000,
      bsp: 4500,
      code61: 5000,
      code62: 6000,
    },
  },
  {
    dash: 10,
    nominal: '5/8"',
    r2: 2750,
    psi: { jic: 3500, 'jic-swivel': 3000, flareless: 5000, orfs: 6000, 'orfs-adjustable': 6000, bsp: 4000 },
  },
  {
    dash: 12,
    nominal: '3/4"',
    r2: 2250,
    psi: {
      nptf: 2500,
      npsm: 2250,
      jic: 3500,
      'jic-swivel': 3000,
      flareless: 4500,
      orfs: 6000,
      'orfs-adjustable': 6000,
      bsp: 3500,
      code61: 5000,
      code62: 6000,
    },
  },
  { dash: 14, nominal: '7/8"', r2: 2000, psi: { jic: 3050, 'jic-swivel': 2500, orfs: 6000, 'orfs-adjustable': 6000 } },
  {
    dash: 16,
    nominal: '1"',
    r2: 2000,
    psi: {
      nptf: 2000,
      npsm: 2000,
      jic: 3050,
      'jic-swivel': 2500,
      flareless: 4000,
      orfs: 6000,
      'orfs-adjustable': 5000,
      bsp: 3000,
      code61: 5000,
      code62: 6000,
    },
  },
  {
    dash: 20,
    nominal: '1-1/4"',
    r2: 1625,
    psi: {
      nptf: 1150,
      npsm: 1625,
      jic: 2500,
      'jic-swivel': 2000,
      orfs: 4000,
      'orfs-adjustable': 4000,
      bsp: 2500,
      code61: 4000,
      code62: 6000,
    },
  },
  {
    dash: 24,
    nominal: '1-1/2"',
    r2: 1250,
    psi: {
      nptf: 1000,
      npsm: 1250,
      jic: 2000,
      'jic-swivel': 1500,
      orfs: 4000,
      'orfs-adjustable': 3000,
      bsp: 2000,
      code61: 3000,
      code62: 6000,
    },
  },
  {
    dash: 32,
    nominal: '2"',
    r2: 1125,
    psi: { nptf: 1000, npsm: 1125, jic: 1500, 'jic-swivel': 1150, bsp: 2000, code61: 3000, code62: 6000 },
  },
  { dash: 40, nominal: '2-1/2"', r2: null, psi: { code61: 2500 } },
  { dash: 48, nominal: '3"', r2: null, psi: { code61: 2000 } },
  { dash: 56, nominal: '3-1/2"', r2: null, psi: { code61: 500 } },
  { dash: 64, nominal: '4"', r2: null, psi: { code61: 500 } },
]

export type ConeSeries = 'LL' | 'L' | 'S'

export interface ConeRatingRow {
  readonly tubeOd: number
  readonly series: Readonly<Partial<Record<ConeSeries, { thread: string; psi: number }>>>
}

/** ISO 8434-1 (DIN 2353) 24° cone fittings, carbon steel. */
export const CONE_RATING_ROWS: readonly ConeRatingRow[] = [
  { tubeOd: 4, series: { LL: { thread: 'M8×1', psi: 1500 } } },
  {
    tubeOd: 6,
    series: { LL: { thread: 'M10×1', psi: 1500 }, L: { thread: 'M12×1.5', psi: 3750 }, S: { thread: 'M14×1.5', psi: 9450 } },
  },
  {
    tubeOd: 8,
    series: { LL: { thread: 'M12×1', psi: 1500 }, L: { thread: 'M14×1.5', psi: 3750 }, S: { thread: 'M16×1.5', psi: 9450 } },
  },
  {
    tubeOd: 10,
    series: { LL: { thread: 'M14×1', psi: 1500 }, L: { thread: 'M16×1.5', psi: 3750 }, S: { thread: 'M18×1.5', psi: 9450 } },
  },
  {
    tubeOd: 12,
    series: { LL: { thread: 'M16×1', psi: 1500 }, L: { thread: 'M18×1.5', psi: 3750 }, S: { thread: 'M20×1.5', psi: 9450 } },
  },
  { tubeOd: 14, series: { S: { thread: 'M22×1.5', psi: 9450 } } },
  { tubeOd: 15, series: { L: { thread: 'M22×1.5', psi: 3750 } } },
  { tubeOd: 16, series: { S: { thread: 'M24×1.5', psi: 6000 } } },
  { tubeOd: 18, series: { L: { thread: 'M26×1.5', psi: 2400 } } },
  { tubeOd: 20, series: { S: { thread: 'M30×2', psi: 6000 } } },
  { tubeOd: 22, series: { L: { thread: 'M30×2', psi: 2400 } } },
  { tubeOd: 25, series: { S: { thread: 'M36×2', psi: 6000 } } },
  { tubeOd: 28, series: { L: { thread: 'M36×2', psi: 1500 } } },
  { tubeOd: 30, series: { S: { thread: 'M42×2', psi: 3750 } } },
  { tubeOd: 35, series: { L: { thread: 'M45×2', psi: 1500 } } },
  { tubeOd: 38, series: { S: { thread: 'M52×2', psi: 3750 } } },
  { tubeOd: 42, series: { L: { thread: 'M52×2', psi: 1500 } } },
]

/** psi to bar, rounded to the nearest whole bar — the precision the source carries. */
export function psiToBar(psi: number): number {
  return Math.round(convertPressure(psi, 'psi', 'bar'))
}

export function ratingConnection(id: RatingConnectionId): RatingConnection {
  const found = RATING_CONNECTIONS.find((c) => c.id === id)
  if (!found) throw new Error(`Unknown connection ${id}`)
  return found
}

export function ratingRow(dash: number): RatingRow | undefined {
  return RATING_ROWS.find((row) => row.dash === dash)
}

export type JointRating =
  | { readonly status: 'rated'; readonly psi: number; readonly governedBy: readonly RatingConnectionId[]; readonly r2: number | null }
  | { readonly status: 'unrated'; readonly missing: readonly RatingConnectionId[] }

/**
 * The working pressure of a joint: the LOWER of its two ends at that size.
 *
 * Unrated when either end has no published figure at that size. It never
 * falls back to the other end's number — a missing rating is not a high one.
 * `governedBy` lists every end that sets the limit, so a tie names both.
 */
export function jointRating(a: RatingConnectionId, b: RatingConnectionId, dash: number): JointRating {
  const row = ratingRow(dash)
  const ends = a === b ? [a] : [a, b]
  const missing = ends.filter((id) => row?.psi[id] === undefined)
  if (!row || missing.length > 0) return { status: 'unrated', missing: row ? missing : ends }
  const values = ends.map((id) => row.psi[id] as number)
  const psi = Math.min(...values)
  return { status: 'rated', psi, governedBy: ends.filter((id) => row.psi[id] === psi), r2: row.r2 }
}

/** Every dash size at which this connection has a published rating. */
export function ratedSizes(id: RatingConnectionId): readonly number[] {
  return RATING_ROWS.filter((row) => row.psi[id] !== undefined).map((row) => row.dash)
}

export function pressureRatingTotals(): { connections: number; ratings: number; sizes: number } {
  const inch = RATING_ROWS.reduce((n, row) => n + Object.keys(row.psi).length, 0)
  const cone = CONE_RATING_ROWS.reduce((n, row) => n + Object.keys(row.series).length, 0)
  return {
    connections: RATING_CONNECTIONS.length + 3,
    ratings: inch + cone,
    sizes: RATING_ROWS.length,
  }
}
