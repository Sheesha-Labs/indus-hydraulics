/**
 * Dimensional thread chart for `/resources/thread-chart`.
 *
 * WHY A SECOND THREAD PAGE
 *
 * `/tools/thread-identifier` walks from three questions to a family, and the
 * table under it (`thread-reference.ts`) counts which designations appear on
 * live catalogue parts. Neither answers the bench question: "my calipers read
 * 0.56 in across the male thread and the gauge says 18 — what is it?" That
 * needs the measured diameters, family by family, and that is this file.
 *
 * WHERE THE NUMBERS COME FROM
 *
 * The published standards — SAE J514 / J512 / J1926 / J1453 / J518, ASME B1.1
 * and B1.20.1/.3, ISO 228-1, ISO 261, ISO 8434-1 (formerly DIN 2353). A
 * distributor's chart was used only as a cross-check, and it disagreed with the
 * standards in several places (NPSM 3/8" at 14 TPI, a JIC -12 male O.D. of
 * 11/16", an ORFS -16 female of 1-3/4"); the standard won every time.
 *
 * Male thread O.D. is the nominal major diameter. Female thread I.D. is an
 * APPROXIMATE minor diameter for identification only — measure with it, never
 * machine to it — and the page says so in the table caption.
 *
 * Values are stored in the family's native unit (inch families in inches,
 * metric families in millimetres) and converted at render. Storing both would
 * be two numbers that can disagree.
 */

export type ThreadChartRegion = 'american' | 'international'

export type ThreadChartUnit = 'in' | 'mm'

/** A thread table: dash · nominal · thread · pitch · male O.D. · female I.D. */
export interface ThreadChartRow {
  readonly dash: number | null
  /** Tube O.D. or pipe size the connection is named for. */
  readonly nominal: string
  /** As it is written on a drawing: `9/16-18`, `G1/2`, `M22×1.5`. */
  readonly thread: string
  /** Threads per inch for inch threads; mm pitch for metric. */
  readonly pitch: string
  readonly maleOd: number
  readonly femaleId: number | null
}

/** Four-bolt flange head dimensions, inches. Null where the code has no size. */
export interface FlangeChartRow {
  readonly dash: number
  readonly nominal: string
  readonly code61Spacing: number
  readonly code61Od: number
  readonly code62Spacing: number | null
  readonly code62Od: number | null
}

/** ISO 8434-1 24° cone: tube O.D. to thread, per series. */
export interface ConeChartRow {
  readonly tubeOd: number
  readonly ll: string | null
  readonly l: string | null
  readonly s: string | null
}

interface ThreadChartFamilyBase {
  /** Anchor on the page and stable key. */
  readonly id: string
  readonly region: ThreadChartRegion
  readonly name: string
  /** Every connection type this one table identifies. */
  readonly covers: readonly string[]
  readonly standard: string
  /** Where and how it seals — the thing the thread alone cannot tell you. */
  readonly seal: string
  readonly note?: string
  /** Catalogue category to buy it in. */
  readonly shopHref?: string
  readonly shopLabel?: string
}

export type ThreadChartFamily =
  | (ThreadChartFamilyBase & { readonly kind: 'thread'; readonly unit: ThreadChartUnit; readonly rows: readonly ThreadChartRow[] })
  | (ThreadChartFamilyBase & { readonly kind: 'flange'; readonly rows: readonly FlangeChartRow[] })
  | (ThreadChartFamilyBase & { readonly kind: 'cone'; readonly rows: readonly ConeChartRow[] })

const r = (
  dash: number | null,
  nominal: string,
  thread: string,
  pitch: string,
  maleOd: number,
  femaleId: number | null,
): ThreadChartRow => ({ dash, nominal, thread, pitch, maleOd, femaleId })

/** Metric parallel thread: male O.D. is the nominal, female ≈ nominal − pitch (the tap drill). */
const metric = (dash: number | null, nominal: string, size: number, pitch: number): ThreadChartRow =>
  r(dash, nominal, `M${size}×${pitch.toFixed(pitch % 1 === 0 ? 0 : 1)}`, pitch.toFixed(1), size, +(size - pitch).toFixed(2))

export const THREAD_FAMILIES: readonly ThreadChartFamily[] = [
  {
    id: 'npt-nptf-npsm',
    region: 'american',
    kind: 'thread',
    unit: 'in',
    name: 'NPT, NPTF and NPSM',
    covers: ['NPT', 'NPTF (Dryseal)', 'NPSM'],
    standard: 'ASME B1.20.1 · ASME B1.20.3',
    seal:
      'NPT and NPTF taper, and seal on the thread itself — NPTF by crushing the crests, NPT with sealant. NPSM is straight and seals on a 30° seat inside the female swivel, which also mates a chamfered NPTF male.',
    note: 'All three share a pitch at every size, so a pitch gauge alone cannot separate them. Hold a straight edge along the male: a taper shows daylight at one end.',
    shopHref: '/c/npt-adapters',
    shopLabel: 'NPT adapters',
    rows: [
      r(2, '1/8"', '1/8-27', '27', 0.405, 0.38),
      r(4, '1/4"', '1/4-18', '18', 0.54, 0.49),
      r(6, '3/8"', '3/8-18', '18', 0.675, 0.63),
      r(8, '1/2"', '1/2-14', '14', 0.84, 0.77),
      r(12, '3/4"', '3/4-14', '14', 1.05, 0.98),
      r(16, '1"', '1-11½', '11½', 1.315, 1.24),
      r(20, '1-1/4"', '1-1/4-11½', '11½', 1.66, 1.58),
      r(24, '1-1/2"', '1-1/2-11½', '11½', 1.9, 1.82),
      r(32, '2"', '2-11½', '11½', 2.375, 2.3),
    ],
  },
  {
    id: 'unf-jic-orb-flareless',
    region: 'american',
    kind: 'thread',
    unit: 'in',
    name: 'JIC 37°, SAE O-ring boss and SAE flareless',
    covers: ['JIC 37° flare', 'SAE O-ring boss (ORB)', 'SAE flareless (bite-type)'],
    standard: 'SAE J514 · SAE J1926',
    seal:
      'Same UN/UNF thread, three different seals. JIC seals metal to metal on a 37° flare. ORB seals with an O-ring pressed into a chamfer at the port face. Flareless seals where a sleeve bites into the tube on a 24° seat.',
    note: 'Because the thread is identical, measuring it only narrows the field to these three. Look at the end: a cone is JIC, an O-ring under a flat face is ORB, a sleeve on a tube is flareless.',
    shopHref: '/c/jic-adapters',
    shopLabel: 'JIC adapters',
    rows: [
      r(2, '1/8"', '5/16-24', '24', 0.3125, 0.27),
      r(3, '3/16"', '3/8-24', '24', 0.375, 0.34),
      r(4, '1/4"', '7/16-20', '20', 0.4375, 0.39),
      r(5, '5/16"', '1/2-20', '20', 0.5, 0.45),
      r(6, '3/8"', '9/16-18', '18', 0.5625, 0.51),
      r(8, '1/2"', '3/4-16', '16', 0.75, 0.69),
      r(10, '5/8"', '7/8-14', '14', 0.875, 0.81),
      r(12, '3/4"', '1-1/16-12', '12', 1.0625, 0.98),
      r(14, '7/8"', '1-3/16-12', '12', 1.1875, 1.1),
      r(16, '1"', '1-5/16-12', '12', 1.3125, 1.23),
      r(20, '1-1/4"', '1-5/8-12', '12', 1.625, 1.54),
      r(24, '1-1/2"', '1-7/8-12', '12', 1.875, 1.79),
      r(32, '2"', '2-1/2-12', '12', 2.5, 2.42),
    ],
  },
  {
    id: 'orfs',
    region: 'american',
    kind: 'thread',
    unit: 'in',
    name: 'O-ring face seal (ORFS)',
    covers: ['ORFS'],
    standard: 'SAE J1453 · ISO 8434-3',
    seal: 'An O-ring in a groove on the male face is squeezed flat against the female’s machined face. The thread only clamps.',
    note: 'ORFS threads are a size larger than JIC at the same dash: a -6 ORFS is 11/16-16, a -6 JIC is 9/16-18.',
    shopHref: '/c/orfs-adapters',
    shopLabel: 'ORFS adapters',
    rows: [
      r(4, '1/4"', '9/16-18', '18', 0.5625, 0.51),
      r(6, '3/8"', '11/16-16', '16', 0.6875, 0.63),
      r(8, '1/2"', '13/16-16', '16', 0.8125, 0.75),
      r(10, '5/8"', '1-14', '14', 1.0, 0.93),
      r(12, '3/4"', '1-3/16-12', '12', 1.1875, 1.11),
      r(16, '1"', '1-7/16-12', '12', 1.4375, 1.36),
      r(20, '1-1/4"', '1-11/16-12', '12', 1.6875, 1.61),
      r(24, '1-1/2"', '2-12', '12', 2.0, 1.92),
    ],
  },
  {
    id: 'sae-45-flare',
    region: 'american',
    kind: 'thread',
    unit: 'in',
    name: 'SAE 45° flare',
    covers: ['SAE 45° flare'],
    standard: 'SAE J512',
    seal: 'Metal to metal on a 45° flare. Low-pressure duty: fuel, refrigerant and instrument air.',
    note: 'Up to -10 the threads match JIC except at -6 (5/8-18 here, 9/16-18 on JIC). The seat angle is what separates them, and a 37° and a 45° seat never seal on each other.',
    shopHref: '/c/brass-sae-45-flare-fittings',
    shopLabel: 'Brass SAE 45° flare fittings',
    rows: [
      r(2, '1/8"', '5/16-24', '24', 0.3125, 0.27),
      r(3, '3/16"', '3/8-24', '24', 0.375, 0.34),
      r(4, '1/4"', '7/16-20', '20', 0.4375, 0.39),
      r(5, '5/16"', '1/2-20', '20', 0.5, 0.45),
      r(6, '3/8"', '5/8-18', '18', 0.625, 0.57),
      r(8, '1/2"', '3/4-16', '16', 0.75, 0.69),
      r(10, '5/8"', '7/8-14', '14', 0.875, 0.81),
      r(12, '3/4"', '1-1/16-14', '14', 1.0625, 0.99),
      r(14, '7/8"', '1-1/4-12', '12', 1.25, 1.16),
      r(16, '1"', '1-3/8-12', '12', 1.375, 1.29),
    ],
  },
  {
    id: 'sae-inverted-flare',
    region: 'american',
    kind: 'thread',
    unit: 'in',
    name: 'SAE inverted flare',
    covers: ['SAE inverted flare'],
    standard: 'SAE J512',
    seal: 'The male tube nut clamps a double-flared 45° tube end onto a 42° seat inside the female fitting. Brake and fuel lines on vehicles.',
    shopHref: '/c/brass-inverted-flare-fittings',
    shopLabel: 'Brass inverted flare fittings',
    rows: [
      r(2, '1/8"', '5/16-28', '28', 0.3125, 0.27),
      r(3, '3/16"', '3/8-24', '24', 0.375, 0.34),
      r(4, '1/4"', '7/16-24', '24', 0.4375, 0.39),
      r(5, '5/16"', '1/2-20', '20', 0.5, 0.45),
      r(6, '3/8"', '5/8-18', '18', 0.625, 0.57),
      r(7, '7/16"', '11/16-18', '18', 0.6875, 0.63),
      r(8, '1/2"', '3/4-18', '18', 0.75, 0.7),
      r(10, '5/8"', '7/8-18', '18', 0.875, 0.81),
      r(12, '3/4"', '1-1/16-16', '16', 1.0625, 1.0),
    ],
  },
  {
    id: 'four-bolt-flange',
    region: 'american',
    kind: 'flange',
    name: 'Four-bolt flange, Code 61 and Code 62',
    covers: ['SAE Code 61 flange', 'SAE Code 62 flange'],
    standard: 'SAE J518 · ISO 6162-1 · ISO 6162-2',
    seal: 'An O-ring in the flange head seals on the flat port face; two clamp halves and four bolts hold it.',
    note: 'There is no thread to measure. Measure the bolt spacing on the long side: at every size Code 62 is wider and its head is thicker, and the two codes never interchange.',
    shopHref: '/c/sae-flange-adapters',
    shopLabel: 'SAE flange adapters',
    rows: [
      { dash: 8, nominal: '1/2"', code61Spacing: 1.5, code61Od: 1.188, code62Spacing: 1.594, code62Od: 1.25 },
      { dash: 12, nominal: '3/4"', code61Spacing: 1.875, code61Od: 1.5, code62Spacing: 2.0, code62Od: 1.625 },
      { dash: 16, nominal: '1"', code61Spacing: 2.062, code61Od: 1.75, code62Spacing: 2.25, code62Od: 1.875 },
      { dash: 20, nominal: '1-1/4"', code61Spacing: 2.312, code61Od: 2.0, code62Spacing: 2.625, code62Od: 2.125 },
      { dash: 24, nominal: '1-1/2"', code61Spacing: 2.75, code61Od: 2.375, code62Spacing: 3.125, code62Od: 2.5 },
      { dash: 32, nominal: '2"', code61Spacing: 3.062, code61Od: 2.812, code62Spacing: 3.812, code62Od: 3.125 },
      { dash: 40, nominal: '2-1/2"', code61Spacing: 3.5, code61Od: 3.312, code62Spacing: null, code62Od: null },
      { dash: 48, nominal: '3"', code61Spacing: 4.188, code61Od: 4.0, code62Spacing: null, code62Od: null },
    ],
  },
  {
    id: 'bsp-jis',
    region: 'international',
    kind: 'thread',
    unit: 'mm',
    name: 'BSPP, BSPT and JIS 30° flare',
    covers: ['BSPP (G)', 'BSPT (R)', 'JIS 30° flare'],
    standard: 'ISO 228-1 · ISO 7-1 · JIS B 8363',
    seal:
      'BSPP is parallel and seals with a bonded washer, an O-ring or a 60° cone in the female swivel. BSPT tapers and seals on the thread. JIS 30° flare uses the BSPP thread with a 30° seat.',
    note: 'The 55° flank angle and these pitches separate BSP from NPT: at 1/2" both are 14 TPI, but a BSP male measures 20.96 mm against NPT’s 21.34 mm.',
    shopHref: '/c/bsp-hydraulic-adapters-uae',
    shopLabel: 'BSP adapters',
    rows: [
      r(2, '1/8"', 'G1/8', '28', 9.728, 8.566),
      r(4, '1/4"', 'G1/4', '19', 13.157, 11.445),
      r(6, '3/8"', 'G3/8', '19', 16.662, 14.95),
      r(8, '1/2"', 'G1/2', '14', 20.955, 18.631),
      r(10, '5/8"', 'G5/8', '14', 22.911, 20.587),
      r(12, '3/4"', 'G3/4', '14', 26.441, 24.117),
      r(16, '1"', 'G1', '11', 33.249, 30.291),
      r(20, '1-1/4"', 'G1-1/4', '11', 41.91, 38.952),
      r(24, '1-1/2"', 'G1-1/2', '11', 47.803, 44.845),
      r(32, '2"', 'G2', '11', 59.614, 56.656),
    ],
  },
  {
    id: 'metric-ports',
    region: 'international',
    kind: 'thread',
    unit: 'mm',
    name: 'Metric parallel threads',
    covers: ['ISO 6149 O-ring port', 'ISO 9974 / DIN 3852 flat-face port'],
    standard: 'ISO 261 · ISO 6149 · ISO 9974',
    seal:
      'ISO 6149 ports seal with an O-ring in a chamfer, like SAE ORB, and carry a ring groove on the spot face to say so. ISO 9974 and DIN 3852 ports seal on a flat face with a bonded washer or edge seal.',
    note: 'A metric thread is named by its real size: M18×1.5 is 18 mm across the crests with 1.5 mm between them. The female figure is the tap drill size.',
    shopHref: '/c/metric-adapters',
    shopLabel: 'Metric adapters',
    rows: [
      metric(null, '—', 8, 1),
      metric(null, '—', 10, 1),
      metric(null, '—', 12, 1.5),
      metric(null, '—', 14, 1.5),
      metric(null, '—', 16, 1.5),
      metric(null, '—', 18, 1.5),
      metric(null, '—', 20, 1.5),
      metric(null, '—', 22, 1.5),
      metric(null, '—', 24, 1.5),
      metric(null, '—', 26, 1.5),
      metric(null, '—', 27, 2),
      metric(null, '—', 30, 2),
      metric(null, '—', 33, 2),
      metric(null, '—', 36, 2),
      metric(null, '—', 42, 2),
      metric(null, '—', 48, 2),
      metric(null, '—', 60, 2),
    ],
  },
  {
    id: 'din-24-cone',
    region: 'international',
    kind: 'cone',
    name: '24° cone bite-type (DIN 2353)',
    covers: ['DIN 2353 / ISO 8434-1 LL', 'L (light)', 'S (heavy)'],
    standard: 'ISO 8434-1 (formerly DIN 2353)',
    seal: 'A cutting ring bites into plain metric tube as the nut is made up on a 24° cone.',
    note: 'The same thread can be two different fittings: M22×1.5 is a 15 mm light-series fitting and a 14 mm heavy-series one. Name the tube O.D. and the series, never the thread alone.',
    shopHref: '/c/din-2353-bite-type-adapters-uae',
    shopLabel: 'DIN 2353 adapters',
    rows: [
      { tubeOd: 4, ll: 'M8×1', l: null, s: null },
      { tubeOd: 6, ll: 'M10×1', l: 'M12×1.5', s: 'M14×1.5' },
      { tubeOd: 8, ll: 'M12×1', l: 'M14×1.5', s: 'M16×1.5' },
      { tubeOd: 10, ll: 'M14×1', l: 'M16×1.5', s: 'M18×1.5' },
      { tubeOd: 12, ll: 'M16×1', l: 'M18×1.5', s: 'M20×1.5' },
      { tubeOd: 14, ll: null, l: null, s: 'M22×1.5' },
      { tubeOd: 15, ll: null, l: 'M22×1.5', s: null },
      { tubeOd: 16, ll: null, l: null, s: 'M24×1.5' },
      { tubeOd: 18, ll: null, l: 'M26×1.5', s: null },
      { tubeOd: 20, ll: null, l: null, s: 'M30×2' },
      { tubeOd: 22, ll: null, l: 'M30×2', s: null },
      { tubeOd: 25, ll: null, l: null, s: 'M36×2' },
      { tubeOd: 28, ll: null, l: 'M36×2', s: null },
      { tubeOd: 30, ll: null, l: null, s: 'M42×2' },
      { tubeOd: 35, ll: null, l: 'M45×2', s: null },
      { tubeOd: 38, ll: null, l: null, s: 'M52×2' },
      { tubeOd: 42, ll: null, l: 'M52×2', s: null },
    ],
  },
  {
    id: 'komatsu-30-flare',
    region: 'international',
    kind: 'thread',
    unit: 'mm',
    name: 'Komatsu 30° flare (metric)',
    covers: ['Komatsu 30° flare'],
    standard: 'Komatsu (JIS metric)',
    seal: 'Metric parallel thread with a 30° seat. Found across Komatsu machines and some other Japanese equipment.',
    note: 'Easily mistaken for metric 24° cone fittings of the same thread. The seat angle settles it.',
    rows: [
      metric(6, '3/8"', 18, 1.5),
      metric(8, '1/2"', 22, 1.5),
      metric(10, '5/8"', 24, 1.5),
      metric(12, '3/4"', 30, 1.5),
      metric(16, '1"', 33, 1.5),
      metric(20, '1-1/4"', 36, 1.5),
      metric(24, '1-1/2"', 42, 1.5),
    ],
  },
]

/** The other unit, rounded for display: 2 dp in mm, 3 dp in inches. */
export function convertLength(value: number, from: ThreadChartUnit): { inches: number; millimetres: number } {
  return from === 'in'
    ? { inches: value, millimetres: Math.round(value * 25.4 * 100) / 100 }
    : { inches: Math.round((value / 25.4) * 1000) / 1000, millimetres: value }
}

export function threadFamiliesByRegion(region: ThreadChartRegion): readonly ThreadChartFamily[] {
  return THREAD_FAMILIES.filter((f) => f.region === region)
}

export function threadChartTotals(): { families: number; connectionTypes: number; rows: number } {
  return {
    families: THREAD_FAMILIES.length,
    connectionTypes: THREAD_FAMILIES.reduce((n, f) => n + f.covers.length, 0),
    rows: THREAD_FAMILIES.reduce((n, f) => n + f.rows.length, 0),
  }
}

/**
 * How each connection seals — the column that separates threads a gauge cannot.
 * `anchor` points at the family table that charts the thread.
 */
export const THREAD_SEATS: readonly {
  readonly connection: string
  readonly seat: string
  readonly sealsOn: string
  readonly standard: string
  readonly anchor: string
}[] = [
  { connection: 'JIC 37° flare', seat: '37° cone (74° included)', sealsOn: 'Metal to metal', standard: 'SAE J514', anchor: 'unf-jic-orb-flareless' },
  { connection: 'SAE 45° flare', seat: '45° cone', sealsOn: 'Metal to metal', standard: 'SAE J512', anchor: 'sae-45-flare' },
  { connection: 'SAE inverted flare', seat: '42° seat in the female', sealsOn: 'Metal to metal', standard: 'SAE J512', anchor: 'sae-inverted-flare' },
  { connection: 'SAE flareless', seat: '24° seat', sealsOn: 'Sleeve biting the tube', standard: 'SAE J514', anchor: 'unf-jic-orb-flareless' },
  { connection: 'DIN 2353 / ISO 8434-1', seat: '24° cone', sealsOn: 'Cutting ring biting the tube', standard: 'ISO 8434-1', anchor: 'din-24-cone' },
  { connection: 'JIS 30° and Komatsu', seat: '30° seat (60° included)', sealsOn: 'Metal to metal', standard: 'JIS B 8363', anchor: 'bsp-jis' },
  { connection: 'BSPP female swivel', seat: '60° cone', sealsOn: 'Metal to metal', standard: 'ISO 228-1', anchor: 'bsp-jis' },
  { connection: 'NPSM female swivel', seat: '30° seat (60° included)', sealsOn: 'Metal to metal', standard: 'ASME B1.20.1', anchor: 'npt-nptf-npsm' },
  { connection: 'SAE ORB and ISO 6149', seat: 'Chamfer at the port face', sealsOn: 'O-ring', standard: 'SAE J1926 · ISO 6149', anchor: 'unf-jic-orb-flareless' },
  { connection: 'ORFS', seat: 'Flat face', sealsOn: 'O-ring in the male face', standard: 'SAE J1453', anchor: 'orfs' },
  { connection: 'Code 61 / Code 62 flange', seat: 'Flat port face', sealsOn: 'O-ring in the flange head', standard: 'SAE J518', anchor: 'four-bolt-flange' },
  { connection: 'NPT, NPTF, BSPT', seat: 'None — tapered thread', sealsOn: 'The thread', standard: 'ASME B1.20.1/.3 · ISO 7-1', anchor: 'npt-nptf-npsm' },
]
