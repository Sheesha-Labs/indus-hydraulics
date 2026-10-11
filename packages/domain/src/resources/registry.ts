import { crimpSpecTotals } from './crimp-specs'
import { GLOSSARY } from './glossary'
import { pressureRatingTotals } from './pressure-ratings'
import { threadChartTotals } from './thread-chart'

/**
 * What `/resources` lists, and the figures it quotes.
 *
 * The reference pages are code — each one is a template over a frozen data set
 * — so the list of them lives here rather than in Pages & Blocks, the same way
 * the market registry feeds `/markets`. The hub's COPY is editable; which pages
 * exist is not, because adding one is a deploy anyway.
 *
 * Every count in this file is derived from the data it describes. The hub's
 * hero tiles read `resourceTotals()`, so adding a glossary term moves the tile
 * without anyone editing a sentence.
 */

export type ResourceKey = 'thread-chart' | 'crimp-specifications' | 'fitting-pressure-ratings' | 'hydraulic-glossary'

export interface ResourceEntry {
  readonly key: ResourceKey
  readonly href: string
  /** Breadcrumb and card title. */
  readonly title: string
  /** The standards or source the page rests on — the card's mono eyebrow. */
  readonly basis: string
  readonly summary: string
  /** Three label/value facts for the card's spec list. Values are derived. */
  readonly facts: readonly (readonly [string, string])[]
  readonly cta: string
}

/** Month the reference data was last checked. Shown on every reference page. */
export const RESOURCES_LAST_CHECKED = 'October 2026'

export function resourceTotals() {
  const threads = threadChartTotals()
  const crimp = crimpSpecTotals()
  const pressure = pressureRatingTotals()
  return {
    references: 4,
    threadFamilies: threads.families,
    connectionTypes: threads.connectionTypes,
    threadRows: threads.rows,
    crimpSettings: crimp.settings,
    crimpHoses: crimp.hoses,
    crimpSeries: crimp.series,
    ratings: pressure.ratings,
    ratingConnections: pressure.connections,
    terms: GLOSSARY.length,
  }
}

export function resourceEntries(): readonly ResourceEntry[] {
  const t = resourceTotals()
  return [
    {
      key: 'thread-chart',
      href: '/resources/thread-chart',
      title: 'Thread chart',
      basis: 'SAE J514 · J1453 · J518 · ISO 228 · ISO 8434',
      summary:
        'Male and female thread diameters, pitch and seat for every common port and connector — measured in inches and millimetres, family by family.',
      facts: [
        ['Connection types', String(t.connectionTypes)],
        ['Families charted', String(t.threadFamilies)],
        ['Units', 'in · mm'],
      ],
      cta: 'Open the thread chart',
    },
    {
      key: 'crimp-specifications',
      href: '/resources/crimp-specifications',
      title: 'Crimp specifications',
      basis: 'Maker’s published settings',
      summary:
        'Finished crimp diameter and die position for each hose and fitting series we supply, with a finder that narrows it to one row.',
      facts: [
        ['Crimp settings', String(t.crimpSettings)],
        ['Hose types', String(t.crimpHoses)],
        ['Fitting series', String(t.crimpSeries)],
      ],
      cta: 'Find a crimp setting',
    },
    {
      key: 'fitting-pressure-ratings',
      href: '/resources/fitting-pressure-ratings',
      title: 'Fitting pressure ratings',
      basis: '4:1 on minimum burst · carbon steel',
      summary:
        'Maximum working pressure by connection type and size, in psi and bar, and a calculator that rates a joint by its weaker end.',
      facts: [
        ['Ratings published', String(t.ratings)],
        ['Connection types', String(t.ratingConnections)],
        ['Units', 'psi · bar'],
      ],
      cta: 'Rate a joint',
    },
    {
      key: 'hydraulic-glossary',
      href: '/resources/hydraulic-glossary',
      title: 'Hydraulic glossary',
      basis: 'Written for this site',
      summary:
        'The words on a datasheet and at the counter — dash size, drop length, skiving, Code 62 — defined plainly, with what each is confused with.',
      facts: [
        ['Terms defined', String(t.terms)],
        ['Cross-references', String(GLOSSARY.reduce((n, g) => n + (g.see?.length ?? 0), 0))],
        ['Format', 'A–Z, linkable'],
      ],
      cta: 'Browse the glossary',
    },
  ]
}

export function resourceEntry(key: ResourceKey): ResourceEntry {
  const entry = resourceEntries().find((e) => e.key === key)
  if (!entry) throw new Error(`Unknown resource ${key}`)
  return entry
}

/** The calculators and identifiers that already live under /tools. */
export const RESOURCE_CALCULATORS: readonly {
  readonly href: string
  readonly kind: string
  readonly title: string
  readonly summary: string
}[] = [
  {
    href: '/tools/thread-identifier',
    kind: 'Identifier',
    title: 'Thread identifier',
    summary: 'Three questions — taper, thread angle, seat — to a fitting family.',
  },
  {
    href: '/tools/pressure-converter',
    kind: 'Converter',
    title: 'Pressure converter',
    summary: 'psi, bar and MPa, for datasheets that each use a different one.',
  },
  {
    href: '/tools/dash-size-chart',
    kind: 'Chart',
    title: 'Dash size chart',
    summary: 'Dash number to inches and millimetres, with the two caveats that cause most ordering mistakes.',
  },
]

/**
 * Posts that use the charts, by slug, in reading order. The hub resolves the
 * titles from the database, so a renamed post keeps its new title here and a
 * deleted one drops out rather than leaving a dead link.
 */
export const RESOURCE_GUIDE_SLUGS: readonly string[] = [
  'identify-any-hydraulic-fitting',
  'hydraulic-thread-size-and-pitch-reference',
  'jic-vs-orfs-vs-npt-vs-bsp',
  'bspp-vs-bspt',
  'hydraulic-hose-crimp-faults',
  'hydraulic-hose-pressure-by-size',
  'sae-j518-code-61-code-62-flanges',
  'hydraulic-fitting-make-up-torque',
]
