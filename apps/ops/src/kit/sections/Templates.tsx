import type { NavKey } from '@indus/ops-ui/shell/nav'
import type { Route } from 'next'
import Link from 'next/link'
import type { ComponentType } from 'react'
import { TEMPLATE_SPECIMEN_NAV } from '../template-nav'
import T1A from '../templates/T1A'
import T1B from '../templates/T1B'
import T2A from '../templates/T2A'
import T2B from '../templates/T2B'
import T3A from '../templates/T3A'
import T4A from '../templates/T4A'
import T5A from '../templates/T5A'
import T6A from '../templates/T6A'
import T7A from '../templates/T7A'
import T8A from '../templates/T8A'
import T8AFirstRun from '../templates/T8AFirstRun'
import T9A from '../templates/T9A'
import T10A from '../templates/T10A'
import T11A from '../templates/T11A'
import T12A from '../templates/T12A'
import X1 from '../templates/X1'

/** The template specimens: S02-T04 built T1–T6, S02-T05 T7–T12 and X1. */
export const status: 'built' | 'pending' = 'built'

/**
 * Where a specimen renders. 'shell': inside the real AppShell, (console)/%5Fkit/templates/[t]. The three
 * templates that never sit in the shell render through their own route group's layout, each at its own
 * static route: 'bare' (T9 centred wizard: the board draws no sidebar) in (kit), 'auth' (T11) in (auth),
 * 'client' (T12) in (client).
 */
export type SpecimenFrame = 'shell' | 'bare' | 'auth' | 'client'

export interface TemplateSpecimen {
  /** URL segment: /_kit/templates/<slug>. */
  slug: string
  /** The board PNG it is compared with: templates/png/<board>.png; null when the template has none. */
  board: string | null
  /** T1 … T12. */
  template: string
  name: string
  /** What the board shows (the README's board caption). */
  shows: string
  frame: SpecimenFrame
  /** The sidebar row the board marks active (template-nav.ts); null outside the shell. */
  nav: NavKey | null
  Specimen: ComponentType
}

const spec = (
  s: Omit<TemplateSpecimen, 'nav' | 'frame'> & { frame?: SpecimenFrame }
): TemplateSpecimen => ({
  ...s,
  frame: s.frame ?? 'shell',
  nav: TEMPLATE_SPECIMEN_NAV[s.slug] ?? null,
})

/**
 * Every template specimen in board order. Each is one L2 template (`@indus/ops-ui/templates`) with its
 * slots filled by kit parts and neutral fixtures, arranged like its board, inside the real AppShell. To add
 * one: a file in src/kit/templates/, a row here, and its nav row in template-nav.ts.
 */
export const TEMPLATE_SPECIMENS: readonly TemplateSpecimen[] = [
  spec({
    slug: 't1a',
    board: 'T1A',
    template: 'T1',
    name: 'Index list',
    shows: 'Quotations · default',
    Specimen: T1A,
  }),
  spec({
    slug: 't1b',
    board: 'T1B',
    template: 'T1',
    name: 'Index list · preview',
    shows: 'Suppliers · row open in a 360 preview',
    Specimen: T1B,
  }),
  spec({
    slug: 't2a',
    board: 'T2A',
    template: 'T2',
    name: 'Record cockpit',
    shows: 'Enquiry · Lines tab',
    Specimen: T2A,
  }),
  spec({
    slug: 't2b',
    board: 'T2B',
    template: 'T2',
    name: 'Record cockpit · order',
    shows: 'Order · Freight tab',
    Specimen: T2B,
  }),
  spec({
    slug: 't3a',
    board: 'T3A',
    template: 'T3',
    name: 'Three-pane mail',
    shows: 'Supplier quote selected',
    Specimen: T3A,
  }),
  spec({
    slug: 't4a',
    board: 'T4A',
    template: 'T4',
    name: 'Review queue',
    shows: 'RFQ proposal open',
    Specimen: T4A,
  }),
  spec({
    slug: 't5a',
    board: 'T5A',
    template: 'T5',
    name: 'Document on well',
    shows: 'Quotation tab',
    Specimen: T5A,
  }),
  spec({
    slug: 't6a',
    board: 'T6A',
    template: 'T6',
    name: 'Compare grid',
    shows: 'Landed cost per unit',
    Specimen: T6A,
  }),
  spec({
    slug: 't7a',
    board: 'T7A',
    template: 'T7',
    name: 'Settings form',
    shows: 'Company',
    Specimen: T7A,
  }),
  spec({ slug: 't8a', board: 'T8A', template: 'T8', name: 'Today', shows: 'Owner', Specimen: T8A }),
  spec({
    slug: 't8a-first-run',
    board: null,
    template: 'T8',
    name: 'Today · first run',
    shows: 'Setup checklist in place of needs-you (board 224)',
    Specimen: T8AFirstRun,
  }),
  spec({
    slug: 't9a',
    board: 'T9A',
    template: 'T9',
    name: 'Wizard',
    shows: 'Setup · step 3 History',
    frame: 'bare',
    Specimen: T9A,
  }),
  spec({
    slug: 't10a',
    board: 'T10A',
    template: 'T10',
    name: 'Gantt',
    shows: 'Supplier plan across orders',
    Specimen: T10A,
  }),
  spec({
    slug: 't11a',
    board: 'T11A',
    template: 'T11',
    name: 'Sign-in',
    shows: 'Default',
    frame: 'auth',
    Specimen: T11A,
  }),
  spec({
    slug: 't12a',
    board: 'T12A',
    template: 'T12',
    name: 'Client page',
    shows: 'Online quotation, client columns only (C36)',
    frame: 'client',
    Specimen: T12A,
  }),
  spec({
    slug: 'x1',
    board: null,
    template: 'X1',
    name: 'Exception page',
    shows: 'Supplier can’t deliver (boards 195–200 shape)',
    Specimen: X1,
  }),
]

export function templateSpecimen(slug: string): TemplateSpecimen | undefined {
  return TEMPLATE_SPECIMENS.find((t) => t.slug === slug)
}

/** A specimen that renders outside the shell, by slug; throws if the slug is not one (a static route's typo). */
export function bareSpecimen(slug: string): ComponentType {
  const entry = templateSpecimen(slug)
  if (!entry || entry.frame === 'shell')
    throw new Error(`No out-of-shell template specimen "${slug}"`)
  return entry.Specimen
}

/** /_kit/templates: one link per specimen. */
export default function TemplatesIndex() {
  return (
    <div className="px-io-page-x flex flex-col gap-4 py-8">
      <h1 className="text-io-page">Templates</h1>
      <p className="text-io-body text-io-ink-3 max-w-[640px]">
        Each L2 template with its slots filled like its board, inside the console shell. Templates
        are layout only; the content is neutral sample data.
      </p>
      <ul className="flex flex-col gap-1.5">
        {TEMPLATE_SPECIMENS.map((t) => (
          <li key={t.slug} className="text-io-body">
            <Link className="io-focus text-io-accent" href={`/_kit/templates/${t.slug}` as Route}>
              {t.board ?? t.template} · {t.name}
            </Link>{' '}
            <span className="text-io-ink-3">{t.shows}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
