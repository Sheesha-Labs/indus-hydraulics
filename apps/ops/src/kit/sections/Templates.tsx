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

/** The template specimens (S02-T04: T1–T6) are built; S02-T05 appends T7–T12 and X1. */
export const status: 'built' | 'pending' = 'built'

export interface TemplateSpecimen {
  /** URL segment: /_kit/templates/<slug>. */
  slug: string
  /** The board PNG it is compared with: templates/png/<board>.png. */
  board: string
  /** T1 … T12. */
  template: string
  name: string
  /** What the board shows (the README's board caption). */
  shows: string
  /** The sidebar row the board marks active (template-nav.ts). */
  nav: NavKey
  Specimen: ComponentType
}

const spec = (s: Omit<TemplateSpecimen, 'nav'>): TemplateSpecimen => ({
  ...s,
  nav: TEMPLATE_SPECIMEN_NAV[s.slug]!,
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
]

export function templateSpecimen(slug: string): TemplateSpecimen | undefined {
  return TEMPLATE_SPECIMENS.find((t) => t.slug === slug)
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
              {t.board} · {t.name}
            </Link>{' '}
            <span className="text-io-ink-3">{t.shows}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
