/**
 * Crimp diameters for `/resources/crimp-specifications`.
 *
 * A crimp diameter is a property of a PAIR: one maker's hose crimped into the
 * same maker's fitting series. The figures below are the principal's published
 * settings for its own hose lines and fitting series — the ones Indus supplies.
 * They are not a universal chart, and the page says so before it says anything
 * else: a 100R2 hose from another mill, or a fitting from another series, needs
 * that maker's figure. Publishing these as "SAE 100R2 crimp diameters" would be
 * the most dangerous sentence on the site.
 *
 * SOURCE AND WHAT WAS CHANGED
 *
 * Normalised from the principal's crimp table (2026-10-09 export) by a one-off
 * script kept with the export, not in this repo:
 *
 *   - Nine rows for a hose coded R115 are dropped. No hose of that code exists
 *     anywhere in the principal's catalogue, so there is nothing to tell a
 *     reader which hose the figure belongs to.
 *   - Series names are reduced to the series code and kind (HY, 43-series, BW…)
 *     and stainless variants keep their own code: a stainless shell does not
 *     always crimp to the steel figure.
 *   - Bore is derived from the dash size (sixteenths of an inch) except for
 *     SAE 100R5 and the PTFE hose, whose dash numbers follow tube O.D. — there
 *     the bore is the published one. The source gave 7/16" for 100R5 -8; SAE
 *     J517 says 13/32", and SAE J517 wins.
 *   - Every row was checked: inch × 25.4 agrees with the published millimetre
 *     figure to within 0.6 mm (rounding in the source), and no hose/size/series
 *     combination appears twice.
 *
 * The rows are a tuple table rather than objects because 242 object literals
 * would triple the file for no gain; `CRIMP_SPECS` expands them once.
 */

export type CrimpHoseCode =
  | 'R1S'
  | 'HFW'
  | 'R2S'
  | 'UFW'
  | 'R16S'
  | 'R17'
  | 'R12'
  | 'R13'
  | 'R15'
  | '4SH'
  | 'SF5K'
  | 'R4'
  | 'R5'
  | 'R7'
  | 'R14'
  | 'PW'
  | 'AWB'
  | 'HJK'

export type CrimpSeriesCode =
  'HY' | 'HY-SS' | '43' | 'BW' | 'BW-SS' | 'TS4' | 'TS6' | 'T77' | 'UHP' | 'JJ' | 'T91' | 'T91-SS'

/** `full` — dies over the whole ferrule. `knurl` — dies set to the knurled band. */
export type CrimpDiePosition = 'full' | 'knurl'

export interface CrimpHose {
  readonly code: CrimpHoseCode
  /** Standard designation where the hose is built to one, else a plain name. */
  readonly name: string
  readonly construction: string
  /**
   * The product page that carries THIS maker's hose, where there is one. Left
   * empty when the site's page for that grade lists another maker's hose — a
   * link there would imply these crimp figures apply to it.
   */
  readonly href?: string
}

export interface CrimpSeries {
  readonly code: CrimpSeriesCode
  readonly name: string
  readonly description: string
  readonly href?: string
}

export interface CrimpSpec {
  readonly hose: CrimpHoseCode
  readonly dash: number
  /** Nominal bore as a fraction, inches. */
  readonly bore: string
  readonly series: CrimpSeriesCode
  readonly crimpIn: number
  readonly crimpMm: number
  readonly die: CrimpDiePosition
}

export const CRIMP_HOSES: readonly CrimpHose[] = [
  { code: 'R1S', name: 'SAE 100R1S', construction: 'One steel wire braid' },
  {
    code: 'HFW',
    name: '1SNK compact',
    construction: 'One wire braid, compact, high-abrasion cover',
  },
  { code: 'R2S', name: 'SAE 100R2S', construction: 'Two steel wire braids' },
  {
    code: 'UFW',
    name: '2SNK compact',
    construction: 'Two wire braids, compact, high-abrasion cover',
  },
  {
    code: 'R16S',
    name: 'SAE 100R16S',
    construction: 'Two wire braids, compact',
    href: '/p/r16-compact-two-wire-braid-hose',
  },
  {
    code: 'R17',
    name: 'SAE 100R17',
    construction: 'Compact braid, 3,000 psi in every size',
    href: '/p/r17-compact-high-pressure-hose',
  },
  {
    code: 'R12',
    name: 'SAE 100R12',
    construction: 'Four steel wire spirals',
    href: '/p/r12-four-spiral-high-pressure-hose',
  },
  {
    code: 'R13',
    name: 'SAE 100R13',
    construction: 'Four or six steel wire spirals',
    href: '/p/r13-multi-spiral-very-high-pressure-hose',
  },
  {
    code: 'R15',
    name: 'SAE 100R15',
    construction: 'Four or six steel wire spirals',
    href: '/p/r15-six-spiral-ultra-high-pressure-hose',
  },
  {
    code: '4SH',
    name: 'EN 856 4SH',
    construction: 'Four steel wire spirals',
    href: '/p/4sh-four-spiral-heavy-duty-hydraulic-hose',
  },
  { code: 'SF5K', name: 'Four-spiral, 5,000 psi', construction: 'Four high-tensile wire spirals' },
  {
    code: 'R4',
    name: 'SAE 100R4',
    construction: 'Suction and return, textile with helix wire',
    href: '/p/r4-low-pressure-suction-return-hose',
  },
  { code: 'R5', name: 'SAE 100R5', construction: 'One wire braid, textile cover' },
  { code: 'R7', name: 'SAE 100R7', construction: 'Thermoplastic, fibre braid' },
  { code: 'R14', name: 'SAE 100R14', construction: 'PTFE tube, stainless steel braid' },
  {
    code: 'PW',
    name: 'Pressure-wash hose',
    construction: 'One wire braid, 4,000 psi',
    href: '/p/pressure-wash-hose-1-wire-braid-4000-psi',
  },
  { code: 'AWB', name: 'Air and water hose', construction: 'Industrial, textile reinforced' },
  {
    code: 'HJK',
    name: 'Hydraulic jack hose',
    construction: 'Two wire braids, 10,000 psi',
    href: '/p/hydraulic-jack-hose-2-wire-braid-10000-psi',
  },
]

export const CRIMP_SERIES: readonly CrimpSeries[] = [
  {
    code: 'HY',
    name: 'HY series',
    description: 'One-piece crimp fittings for braided hose.',
    href: '/c/thy-series-crimp-fittings',
  },
  {
    code: 'HY-SS',
    name: 'HY series, stainless',
    description: 'The HY profile in 316 stainless steel.',
    href: '/c/stainless-steel-hydraulic-fittings',
  },
  {
    code: '43',
    name: '43-series',
    description: 'One-piece crimp fittings for one- and two-wire braided hose.',
  },
  {
    code: 'BW',
    name: 'BW series',
    description:
      'Bite-to-wire one-piece fittings for braided and spiral hose, including the W style.',
    href: '/c/bw-series-crimp-fittings',
  },
  {
    code: 'BW-SS',
    name: 'BW series, stainless',
    description: 'The bite-to-wire profile in 316 stainless steel.',
    href: '/c/stainless-steel-hydraulic-fittings',
  },
  { code: 'TS4', name: 'TS4 spiral', description: 'Fittings for four-spiral hose, smaller bores.' },
  {
    code: 'TS6',
    name: 'TS6 spiral',
    description: 'Fittings for four- and six-spiral hose, larger bores.',
  },
  { code: 'T77', name: 'T77', description: 'Fittings for four-spiral hose at 1/2" and 5/8".' },
  {
    code: 'UHP',
    name: 'UHP',
    description: 'Ultra-high-pressure fittings for spiral hose at 3/4" and 1".',
  },
  { code: 'JJ', name: 'JJ style', description: 'Fittings for spiral hose from 1-1/4" to 2".' },
  {
    code: 'T91',
    name: 'T91 PTFE',
    description: 'Crimp fittings for PTFE hose with a stainless braid.',
    href: '/c/r14-ptfe-hose-ends',
  },
  {
    code: 'T91-SS',
    name: 'T91 PTFE, stainless',
    description: 'The T91 profile in stainless steel.',
    href: '/c/r14-ptfe-hose-ends',
  },
]

export const CRIMP_DIE_POSITIONS: Readonly<
  Record<CrimpDiePosition, { label: string; description: string }>
> = {
  full: {
    label: 'Full crimp',
    description: 'The dies close over the whole length of the ferrule.',
  },
  knurl: {
    label: 'Crimp to knurl',
    description:
      'The dies are set up to the knurled band on the ferrule, not over its full length.',
  },
}

type Row = readonly [
  CrimpHoseCode,
  number,
  string,
  CrimpSeriesCode,
  number,
  number,
  CrimpDiePosition,
]

/* Generated. Hose, dash, bore, series, crimp diameter in, crimp diameter mm, die position. */
const ROWS: readonly Row[] = [
  ['R1S', 4, '1/4"', 'HY', 0.6, 15.2, 'knurl'],
  ['R1S', 4, '1/4"', 'HY-SS', 0.6, 15.2, 'knurl'],
  ['R1S', 4, '1/4"', '43', 0.65, 16.6, 'full'],
  ['R1S', 4, '1/4"', 'BW', 0.65, 16.6, 'full'],
  ['R1S', 6, '3/8"', 'HY', 0.77, 19.5, 'knurl'],
  ['R1S', 6, '3/8"', 'HY-SS', 0.77, 19.5, 'knurl'],
  ['R1S', 6, '3/8"', '43', 0.83, 21.2, 'full'],
  ['R1S', 6, '3/8"', 'BW', 0.79, 20.1, 'full'],
  ['R1S', 8, '1/2"', 'HY', 0.85, 21.6, 'knurl'],
  ['R1S', 8, '1/2"', 'HY-SS', 0.85, 21.6, 'knurl'],
  ['R1S', 8, '1/2"', '43', 0.95, 24.1, 'full'],
  ['R1S', 8, '1/2"', 'BW', 0.92, 23.4, 'full'],
  ['R1S', 10, '5/8"', 'HY', 1.0, 25.3, 'knurl'],
  ['R1S', 10, '5/8"', 'HY-SS', 1.0, 25.3, 'knurl'],
  ['R1S', 10, '5/8"', '43', 1.07, 27.2, 'full'],
  ['R1S', 10, '5/8"', 'BW', 1.07, 27.2, 'full'],
  ['R1S', 12, '3/4"', 'HY', 1.15, 29.2, 'knurl'],
  ['R1S', 12, '3/4"', 'HY-SS', 1.15, 29.2, 'knurl'],
  ['R1S', 12, '3/4"', '43', 1.26, 32.0, 'full'],
  ['R1S', 12, '3/4"', 'BW', 1.22, 30.9, 'full'],
  ['R1S', 16, '1"', 'HY', 1.45, 36.8, 'knurl'],
  ['R1S', 16, '1"', 'HY-SS', 1.45, 36.8, 'knurl'],
  ['R1S', 16, '1"', '43', 1.6, 40.6, 'full'],
  ['R1S', 16, '1"', 'BW', 1.61, 41.0, 'full'],
  ['R1S', 20, '1-1/4"', 'HY', 1.83, 46.5, 'knurl'],
  ['R1S', 20, '1-1/4"', 'HY-SS', 1.83, 46.5, 'knurl'],
  ['R1S', 20, '1-1/4"', '43', 1.96, 49.9, 'full'],
  ['R1S', 20, '1-1/4"', 'BW', 1.96, 49.9, 'full'],
  ['R1S', 24, '1-1/2"', 'BW', 2.34, 59.4, 'full'],
  ['HFW', 4, '1/4"', 'HY', 0.57, 14.6, 'knurl'],
  ['HFW', 4, '1/4"', '43', 0.63, 16.1, 'full'],
  ['HFW', 6, '3/8"', 'HY', 0.73, 18.5, 'knurl'],
  ['HFW', 6, '3/8"', '43', 0.75, 19.0, 'full'],
  ['HFW', 8, '1/2"', 'HY', 0.85, 21.67, 'knurl'],
  ['HFW', 8, '1/2"', '43', 0.91, 23.1, 'full'],
  ['HFW', 10, '5/8"', 'HY', 0.97, 24.64, 'knurl'],
  ['HFW', 10, '5/8"', '43', 1.02, 26.0, 'full'],
  ['HFW', 12, '3/4"', 'HY', 1.11, 28.26, 'knurl'],
  ['HFW', 12, '3/4"', '43', 1.18, 29.95, 'full'],
  ['HFW', 16, '1"', 'HY', 1.35, 34.23, 'knurl'],
  ['HFW', 16, '1"', '43', 1.45, 36.86, 'full'],
  ['HFW', 20, '1-1/4"', 'HY', 1.8, 45.66, 'knurl'],
  ['HFW', 20, '1-1/4"', '43', 1.92, 48.8, 'full'],
  ['HFW', 24, '1-1/2"', '43', 2.22, 56.35, 'full'],
  ['R2S', 4, '1/4"', 'HY', 0.65, 16.4, 'knurl'],
  ['R2S', 4, '1/4"', 'HY-SS', 0.66, 16.8, 'knurl'],
  ['R2S', 4, '1/4"', '43', 0.7, 17.7, 'full'],
  ['R2S', 4, '1/4"', 'BW', 0.7, 17.7, 'full'],
  ['R2S', 6, '3/8"', 'HY', 0.84, 21.3, 'knurl'],
  ['R2S', 6, '3/8"', 'HY-SS', 0.81, 20.7, 'knurl'],
  ['R2S', 6, '3/8"', '43', 0.87, 22.2, 'full'],
  ['R2S', 6, '3/8"', 'BW', 0.85, 21.6, 'full'],
  ['R2S', 8, '1/2"', 'HY', 0.94, 23.8, 'knurl'],
  ['R2S', 8, '1/2"', 'HY-SS', 0.91, 23.1, 'knurl'],
  ['R2S', 8, '1/2"', '43', 1.0, 25.3, 'full'],
  ['R2S', 8, '1/2"', 'BW', 0.97, 24.6, 'full'],
  ['R2S', 10, '5/8"', 'HY', 1.06, 26.8, 'knurl'],
  ['R2S', 10, '5/8"', 'HY-SS', 1.03, 26.2, 'knurl'],
  ['R2S', 10, '5/8"', '43', 1.11, 28.2, 'full'],
  ['R2S', 10, '5/8"', 'BW', 1.2, 30.5, 'full'],
  ['R2S', 12, '3/4"', 'HY', 1.22, 31.0, 'knurl'],
  ['R2S', 12, '3/4"', 'HY-SS', 1.21, 30.8, 'knurl'],
  ['R2S', 12, '3/4"', '43', 1.3, 32.9, 'full'],
  ['R2S', 12, '3/4"', 'BW', 1.28, 32.6, 'full'],
  ['R2S', 16, '1"', 'HY', 1.51, 38.3, 'knurl'],
  ['R2S', 16, '1"', 'HY-SS', 1.54, 39.0, 'knurl'],
  ['R2S', 16, '1"', '43', 1.64, 41.7, 'full'],
  ['R2S', 16, '1"', 'BW', 1.67, 42.3, 'full'],
  ['R2S', 20, '1-1/4"', 'HY', 1.91, 48.5, 'knurl'],
  ['R2S', 20, '1-1/4"', 'HY-SS', 1.91, 48.5, 'knurl'],
  ['R2S', 20, '1-1/4"', '43', 2.06, 52.3, 'full'],
  ['R2S', 20, '1-1/4"', 'BW', 2.06, 52.3, 'full'],
  ['R2S', 24, '1-1/2"', '43', 2.4, 61.0, 'full'],
  ['R2S', 24, '1-1/2"', 'BW', 2.4, 61.0, 'full'],
  ['R2S', 32, '2"', 'BW', 2.87, 72.9, 'full'],
  ['UFW', 4, '1/4"', 'HY', 0.6, 15.2, 'knurl'],
  ['UFW', 4, '1/4"', 'HY-SS', 0.6, 15.2, 'knurl'],
  ['UFW', 4, '1/4"', '43', 0.65, 16.6, 'full'],
  ['UFW', 4, '1/4"', 'BW', 0.66, 16.8, 'full'],
  ['UFW', 6, '3/8"', 'HY', 0.77, 19.5, 'knurl'],
  ['UFW', 6, '3/8"', 'HY-SS', 0.75, 19.1, 'knurl'],
  ['UFW', 6, '3/8"', '43', 0.8, 20.2, 'full'],
  ['UFW', 6, '3/8"', 'BW', 0.8, 20.3, 'full'],
  ['UFW', 8, '1/2"', 'HY', 0.89, 22.7, 'knurl'],
  ['UFW', 8, '1/2"', 'HY-SS', 0.89, 22.5, 'knurl'],
  ['UFW', 8, '1/2"', '43', 0.94, 24.0, 'full'],
  ['UFW', 8, '1/2"', 'BW', 0.95, 24.1, 'full'],
  ['UFW', 10, '5/8"', 'HY', 1.01, 25.6, 'knurl'],
  ['UFW', 10, '5/8"', 'HY-SS', 1.01, 25.6, 'knurl'],
  ['UFW', 10, '5/8"', '43', 1.07, 27.2, 'full'],
  ['UFW', 10, '5/8"', 'BW', 1.17, 29.7, 'full'],
  ['UFW', 12, '3/4"', 'HY', 1.17, 29.6, 'knurl'],
  ['UFW', 12, '3/4"', 'HY-SS', 1.24, 31.5, 'knurl'],
  ['UFW', 12, '3/4"', '43', 1.19, 30.2, 'full'],
  ['UFW', 12, '3/4"', 'BW', 1.24, 31.5, 'full'],
  ['UFW', 16, '1"', 'HY', 1.5, 38.0, 'knurl'],
  ['UFW', 16, '1"', 'HY-SS', 1.46, 37.0, 'knurl'],
  ['UFW', 16, '1"', '43', 1.6, 40.6, 'full'],
  ['UFW', 16, '1"', 'BW', 1.54, 39.2, 'full'],
  ['UFW', 20, '1-1/4"', 'HY', 1.79, 45.55, 'knurl'],
  ['UFW', 20, '1-1/4"', '43', 1.94, 49.25, 'full'],
  ['R16S', 4, '1/4"', 'HY', 0.61, 15.6, 'knurl'],
  ['R16S', 4, '1/4"', 'HY-SS', 0.61, 15.6, 'knurl'],
  ['R16S', 4, '1/4"', '43', 0.65, 16.6, 'full'],
  ['R16S', 4, '1/4"', 'BW', 0.67, 17.0, 'full'],
  ['R16S', 6, '3/8"', 'HY', 0.77, 19.6, 'knurl'],
  ['R16S', 6, '3/8"', 'HY-SS', 0.77, 19.6, 'knurl'],
  ['R16S', 6, '3/8"', '43', 0.83, 21.2, 'full'],
  ['R16S', 6, '3/8"', 'BW', 0.81, 20.7, 'full'],
  ['R16S', 8, '1/2"', 'HY', 0.86, 21.8, 'knurl'],
  ['R16S', 8, '1/2"', 'HY-SS', 0.86, 21.8, 'knurl'],
  ['R16S', 8, '1/2"', '43', 0.96, 24.3, 'full'],
  ['R16S', 8, '1/2"', 'BW', 0.94, 24.0, 'full'],
  ['R16S', 10, '5/8"', 'HY', 1.0, 25.4, 'knurl'],
  ['R16S', 10, '5/8"', 'HY-SS', 1.0, 25.4, 'knurl'],
  ['R16S', 10, '5/8"', '43', 1.07, 27.2, 'full'],
  ['R16S', 10, '5/8"', 'BW', 1.18, 29.9, 'full'],
  ['R16S', 12, '3/4"', 'HY', 1.13, 28.7, 'knurl'],
  ['R16S', 12, '3/4"', 'HY-SS', 1.13, 28.7, 'knurl'],
  ['R16S', 12, '3/4"', '43', 1.26, 31.9, 'full'],
  ['R16S', 12, '3/4"', 'BW', 1.23, 31.2, 'full'],
  ['R16S', 16, '1"', 'HY', 1.43, 36.2, 'knurl'],
  ['R16S', 16, '1"', 'HY-SS', 1.43, 36.2, 'knurl'],
  ['R16S', 16, '1"', '43', 1.6, 40.6, 'full'],
  ['R16S', 16, '1"', 'BW', 1.56, 39.5, 'full'],
  ['R17', 4, '1/4"', 'HY', 0.58, 14.8, 'knurl'],
  ['R17', 4, '1/4"', 'HY-SS', 0.57, 14.4, 'knurl'],
  ['R17', 4, '1/4"', '43', 0.65, 16.6, 'full'],
  ['R17', 4, '1/4"', 'BW', 0.63, 15.9, 'full'],
  ['R17', 6, '3/8"', 'HY', 0.74, 18.8, 'knurl'],
  ['R17', 6, '3/8"', 'HY-SS', 0.72, 18.4, 'knurl'],
  ['R17', 6, '3/8"', '43', 0.83, 21.2, 'full'],
  ['R17', 6, '3/8"', 'BW', 0.78, 19.8, 'full'],
  ['R17', 8, '1/2"', 'HY', 0.84, 21.3, 'knurl'],
  ['R17', 8, '1/2"', 'HY-SS', 0.84, 21.3, 'knurl'],
  ['R17', 8, '1/2"', '43', 0.93, 23.6, 'full'],
  ['R17', 8, '1/2"', 'BW', 0.95, 24.1, 'full'],
  ['R17', 10, '5/8"', 'HY', 1.0, 25.3, 'knurl'],
  ['R17', 10, '5/8"', 'HY-SS', 1.0, 25.3, 'knurl'],
  ['R17', 10, '5/8"', '43', 1.07, 27.2, 'full'],
  ['R17', 10, '5/8"', 'BW', 1.17, 29.7, 'full'],
  ['R17', 12, '3/4"', 'HY', 1.2, 30.6, 'knurl'],
  ['R17', 12, '3/4"', 'HY-SS', 1.26, 32.0, 'knurl'],
  ['R17', 12, '3/4"', '43', 1.26, 32.0, 'full'],
  ['R17', 12, '3/4"', 'BW', 1.28, 32.4, 'full'],
  ['R17', 16, '1"', 'HY', 1.53, 38.8, 'knurl'],
  ['R17', 16, '1"', 'HY-SS', 1.53, 38.8, 'knurl'],
  ['R17', 16, '1"', '43', 1.6, 40.6, 'full'],
  ['R17', 16, '1"', 'BW', 1.56, 39.6, 'full'],
  ['R12', 6, '3/8"', 'BW', 0.87, 22.1, 'full'],
  ['R12', 8, '1/2"', 'BW', 1.01, 25.7, 'full'],
  ['R12', 12, '3/4"', 'BW', 1.32, 33.5, 'full'],
  ['R12', 12, '3/4"', 'UHP', 1.43, 36.3, 'knurl'],
  ['R12', 16, '1"', 'BW', 1.63, 41.4, 'full'],
  ['R12', 16, '1"', 'UHP', 1.71, 43.4, 'knurl'],
  ['R12', 20, '1-1/4"', 'BW', 2.05, 52.1, 'full'],
  ['R12', 20, '1-1/4"', 'JJ', 1.98, 50.3, 'knurl'],
  ['R12', 24, '1-1/2"', 'BW', 2.38, 60.5, 'full'],
  ['R12', 24, '1-1/2"', 'JJ', 2.23, 56.6, 'knurl'],
  ['R12', 32, '2"', 'BW', 2.89, 73.4, 'full'],
  ['R12', 32, '2"', 'JJ', 2.84, 72.1, 'knurl'],
  ['R13', 12, '3/4"', 'BW', 1.33, 33.9, 'full'],
  ['R13', 12, '3/4"', 'UHP', 1.49, 37.8, 'knurl'],
  ['R13', 16, '1"', 'BW', 1.65, 41.8, 'full'],
  ['R13', 20, '1-1/4"', 'JJ', 2.05, 52.1, 'knurl'],
  ['R13', 24, '1-1/2"', 'JJ', 2.32, 58.9, 'knurl'],
  ['R13', 32, '2"', 'JJ', 2.98, 75.7, 'knurl'],
  ['R15', 12, '3/4"', 'UHP', 1.43, 36.4, 'knurl'],
  ['R15', 16, '1"', 'UHP', 1.74, 44.2, 'knurl'],
  ['R15', 20, '1-1/4"', 'JJ', 2.07, 52.7, 'knurl'],
  ['R15', 24, '1-1/2"', 'JJ', 2.35, 59.6, 'knurl'],
  ['4SH', 12, '3/4"', 'BW', 1.32, 33.5, 'full'],
  ['4SH', 12, '3/4"', 'UHP', 1.43, 36.3, 'knurl'],
  ['4SH', 16, '1"', 'BW', 1.63, 41.4, 'full'],
  ['4SH', 20, '1-1/4"', 'BW', 1.99, 50.5, 'full'],
  ['4SH', 20, '1-1/4"', 'JJ', 1.94, 49.4, 'full'],
  ['4SH', 24, '1-1/2"', 'BW', 2.39, 60.7, 'full'],
  ['4SH', 24, '1-1/2"', 'JJ', 2.2, 55.8, 'knurl'],
  ['4SH', 32, '2"', 'JJ', 2.84, 72.1, 'knurl'],
  ['SF5K', 6, '3/8"', '43', 0.89, 22.59, 'full'],
  ['SF5K', 8, '1/2"', 'TS4', 0.98, 24.83, 'full'],
  ['SF5K', 8, '1/2"', 'T77', 0.93, 23.73, 'full'],
  ['SF5K', 10, '5/8"', 'TS4', 1.14, 28.85, 'full'],
  ['SF5K', 10, '5/8"', 'T77', 1.08, 27.51, 'full'],
  ['SF5K', 12, '3/4"', 'TS4', 1.28, 32.5, 'full'],
  ['SF5K', 16, '1"', 'TS6', 1.64, 41.55, 'full'],
  ['SF5K', 20, '1-1/4"', 'BW-SS', 1.97, 50.16, 'full'],
  ['SF5K', 20, '1-1/4"', 'TS6', 2.06, 52.2, 'full'],
  ['R4', 12, '3/4"', 'HY', 1.22, 31.1, 'knurl'],
  ['R4', 12, '3/4"', '43', 1.35, 34.25, 'full'],
  ['R4', 16, '1"', 'HY', 1.46, 37.2, 'knurl'],
  ['R4', 16, '1"', '43', 1.88, 47.7, 'full'],
  ['R4', 20, '1-1/4"', 'HY', 1.93, 49.0, 'knurl'],
  ['R4', 20, '1-1/4"', '43', 2.08, 52.9, 'full'],
  ['R4', 24, '1-1/2"', '43', 2.37, 60.2, 'full'],
  ['R4', 32, '2"', '43', 3.0, 76.3, 'full'],
  ['R5', 4, '3/16"', 'HY', 0.54, 13.6, 'knurl'],
  ['R5', 5, '1/4"', 'HY', 0.66, 16.8, 'knurl'],
  ['R5', 6, '5/16"', 'HY', 0.72, 18.4, 'knurl'],
  ['R5', 8, '13/32"', 'HY', 0.83, 21.1, 'knurl'],
  ['R5', 10, '1/2"', 'HY', 0.92, 23.3, 'knurl'],
  ['R5', 12, '5/8"', 'HY', 1.04, 26.5, 'knurl'],
  ['R5', 16, '7/8"', 'HY', 1.24, 31.5, 'knurl'],
  ['R5', 20, '1-1/8"', 'HY', 1.53, 38.9, 'knurl'],
  ['R5', 24, '1-3/8"', 'HY', 1.73, 43.9, 'knurl'],
  ['R5', 32, '1-13/16"', 'HY', 2.22, 56.5, 'knurl'],
  ['R7', 3, '3/16"', 'HY', 0.5, 12.6, 'knurl'],
  ['R7', 4, '1/4"', 'HY', 0.57, 14.5, 'knurl'],
  ['R7', 5, '5/16"', 'HY', 0.63, 16.0, 'knurl'],
  ['R7', 6, '3/8"', 'HY', 0.72, 18.3, 'knurl'],
  ['R7', 8, '1/2"', 'HY', 0.9, 22.85, 'knurl'],
  ['R7', 12, '3/4"', 'HY', 1.19, 30.2, 'knurl'],
  ['R14', 4, '3/16"', 'T91', 0.35, 8.9, 'full'],
  ['R14', 4, '3/16"', 'T91-SS', 0.35, 8.9, 'full'],
  ['R14', 5, '1/4"', 'T91', 0.4, 10.1, 'full'],
  ['R14', 5, '1/4"', 'T91-SS', 0.44, 11.05, 'full'],
  ['R14', 6, '5/16"', 'T91', 0.48, 12.3, 'full'],
  ['R14', 6, '5/16"', 'T91-SS', 0.48, 12.3, 'full'],
  ['R14', 7, '3/8"', 'T91', 0.53, 13.4, 'full'],
  ['R14', 7, '3/8"', 'T91-SS', 0.53, 13.4, 'full'],
  ['R14', 8, '13/32"', 'T91', 0.58, 14.8, 'full'],
  ['R14', 8, '13/32"', 'T91-SS', 0.58, 14.8, 'full'],
  ['R14', 10, '1/2"', 'T91', 0.68, 17.18, 'full'],
  ['R14', 10, '1/2"', 'T91-SS', 0.68, 17.18, 'full'],
  ['R14', 12, '5/8"', 'T91', 0.79, 20.0, 'full'],
  ['R14', 12, '5/8"', 'T91-SS', 0.8, 20.2, 'full'],
  ['R14', 16, '1"', 'T91-SS', 1.1, 27.9, 'full'],
  ['PW', 4, '1/4"', 'HY', 0.6, 15.2, 'knurl'],
  ['PW', 4, '1/4"', '43', 0.62, 15.85, 'full'],
  ['PW', 6, '3/8"', 'HY', 0.76, 19.2, 'knurl'],
  ['PW', 6, '3/8"', '43', 0.79, 20.0, 'full'],
  ['PW', 8, '1/2"', 'HY', 0.85, 21.5, 'knurl'],
  ['PW', 8, '1/2"', '43', 0.94, 24.0, 'full'],
  ['AWB', 4, '1/4"', 'HY', 0.59, 15.0, 'knurl'],
  ['AWB', 6, '3/8"', 'HY', 0.75, 19.1, 'knurl'],
  ['AWB', 8, '1/2"', 'HY', 0.92, 23.3, 'knurl'],
  ['AWB', 10, '5/8"', 'HY', 1.04, 26.5, 'knurl'],
  ['AWB', 12, '3/4"', 'HY', 1.21, 30.7, 'knurl'],
  ['AWB', 16, '1"', 'HY', 1.46, 37.12, 'knurl'],
  ['HJK', 4, '1/4"', 'HY', 0.63, 16.1, 'knurl'],
  ['HJK', 6, '3/8"', 'HY', 0.79, 19.94, 'knurl'],
  ['HJK', 6, '3/8"', '43', 0.84, 21.3, 'full'],
]

export const CRIMP_SPECS: readonly CrimpSpec[] = ROWS.map(
  ([hose, dash, bore, series, crimpIn, crimpMm, die]) => ({
    hose,
    dash,
    bore,
    series,
    crimpIn,
    crimpMm,
    die,
  })
)

const HOSE_BY_CODE = new Map(CRIMP_HOSES.map((h) => [h.code, h]))
const SERIES_BY_CODE = new Map(CRIMP_SERIES.map((s) => [s.code, s]))

export function crimpHose(code: CrimpHoseCode): CrimpHose {
  const hose = HOSE_BY_CODE.get(code)
  if (!hose) throw new Error(`Unknown crimp hose ${code}`)
  return hose
}

export function crimpSeries(code: CrimpSeriesCode): CrimpSeries {
  const series = SERIES_BY_CODE.get(code)
  if (!series) throw new Error(`Unknown crimp series ${code}`)
  return series
}

/** Counts for headers and the resources hub. Derived, never typed. */
export function crimpSpecTotals(): {
  settings: number
  hoses: number
  series: number
  sizes: number
} {
  return {
    settings: CRIMP_SPECS.length,
    hoses: new Set(CRIMP_SPECS.map((r) => r.hose)).size,
    series: new Set(CRIMP_SPECS.map((r) => r.series)).size,
    sizes: new Set(CRIMP_SPECS.map((r) => r.dash)).size,
  }
}
