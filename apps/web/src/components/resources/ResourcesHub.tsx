import Link from 'next/link'
import { Eyebrow, HairlineCell, HairlineGrid, SpecList } from '@indus/ui'
import type { ResourceEntry } from '@indus/domain'
import { ArrowRightIcon } from '../designed/icons'
import type { ResourceContact, ResourceCtaCopy, ResourceGuide } from '../../lib/resources-content'
import ResourceSpecimen from './ResourceSpecimens'
import {
  HubSectionHead,
  RESOURCE_GUTTER,
  RESOURCE_WIDTH,
  ResourceBreadcrumbStrip,
  ResourceCtaBand,
} from './ResourceLayout'

/**
 * The designed `/resources` hub.
 *
 * Its job is to be the page a technician bookmarks: four references, the three
 * small tools, and the articles that explain them, each one a link in the
 * server-rendered HTML. Nothing here is behind a client boundary.
 *
 * HEADING TREE: H1 in the hero; one H2 per section (references, calculators,
 * guides, the closing band); each reference card is an H3. The specimen panels
 * are hidden from assistive technology — the card's own text carries it.
 *
 * Copy comes from Pages & Blocks · Resources with the live counts substituted
 * by the page; the cards themselves come from the registry in code.
 */

export type ResourcesHubCopy = {
  hero: {
    eyebrow: string | null
    heading: string | null
    headingEmphasis: string | null
    body: string | null
    tiles: { label: string; value: string }[]
  }
  manifest: { label: string; value: string }[]
  references: { eyebrow: string | null; heading: string | null; body: string | null }
  calculators: { eyebrow: string | null; heading: string | null; body: string | null }
  guides: { eyebrow: string | null; heading: string | null }
  order: string[]
}

export default function ResourcesHub({
  copy,
  entries,
  calculators,
  guides,
  cta,
  contact,
  meta,
}: {
  copy: ResourcesHubCopy
  entries: readonly ResourceEntry[]
  calculators: readonly { href: string; kind: string; title: string; summary: string }[]
  guides: readonly ResourceGuide[]
  cta: ResourceCtaCopy
  contact: ResourceContact
  meta: string
}) {
  const on = (key: string) => copy.order.includes(key)

  return (
    <div className="bg-ih-surface">
      <ResourceBreadcrumbStrip trail={[{ label: 'Home', href: '/' }, { label: 'Resources' }]} meta={meta} />

      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <section className={`border-b border-ih-border bg-ih-surface pb-12 pt-10 lg:pb-14 lg:pt-14 ${RESOURCE_GUTTER}`}>
        <div
          className={`${RESOURCE_WIDTH} grid grid-cols-1 items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16`}
        >
          <div>
            {copy.hero.eyebrow ? <Eyebrow>{copy.hero.eyebrow}</Eyebrow> : null}
            <h1 className="mt-[18px] max-w-[860px] text-balance font-serif text-[38px] font-normal leading-[1.02] tracking-[-0.01em] sm:text-[48px] lg:text-[60px]">
              {copy.hero.heading} {copy.hero.headingEmphasis ? <em>{copy.hero.headingEmphasis}</em> : null}
            </h1>
            {copy.hero.body ? (
              <p className="mt-5 max-w-[660px] text-pretty text-[16px] leading-[1.6] text-ih-ink-2">{copy.hero.body}</p>
            ) : null}
            <div className="mt-[26px] flex flex-wrap gap-2">
              {entries.map((entry) => (
                <Link
                  key={entry.key}
                  href={entry.href}
                  className="inline-flex h-[30px] items-center rounded-full border border-ih-border bg-ih-surface px-3 text-[12.5px] text-ih-ink-2 transition-colors duration-150 hover:border-ih-accent hover:text-ih-accent"
                >
                  {entry.title}
                </Link>
              ))}
            </div>
          </div>

          {/* The 1px gap over the border colour IS the divider. */}
          {copy.hero.tiles.length > 0 ? (
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-ih-border bg-ih-border">
              {copy.hero.tiles.map((tile) => (
                <div key={tile.label} className="bg-ih-surface px-5 pb-5 pt-[18px]">
                  <dt className="mono text-[9.5px] uppercase tracking-[0.13em] text-ih-muted">{tile.label}</dt>
                  {/^\d[\d,]*$/.test(tile.value) ? (
                    <dd className="m-0 mt-1.5 text-[30px] font-medium leading-none tracking-[-0.025em]">{tile.value}</dd>
                  ) : (
                    <dd className="m-0 mt-1.5 font-serif text-[24px] leading-none tracking-[-0.025em]">{tile.value}</dd>
                  )}
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>

      {/* ─── Manifest strip ────────────────────────────────────────────── */}
      {on('manifest') && copy.manifest.length > 0 ? (
        <div className={`bg-ih-navy ${RESOURCE_GUTTER}`}>
          <dl className={`${RESOURCE_WIDTH} grid grid-cols-2 gap-px bg-white/15 sm:grid-cols-3 lg:grid-cols-6`}>
            {copy.manifest.map((fact) => (
              <div key={fact.label} className="bg-ih-navy px-5 pb-6 pt-[22px]">
                <dt className="mono text-[9px] uppercase tracking-[0.16em] text-ih-steel">{fact.label}</dt>
                <dd className="mono m-0 mt-2 text-[14px] leading-[1.35] tracking-[-0.01em] text-white">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {/* ─── 01 · References ───────────────────────────────────────────── */}
      {on('references') ? (
        <section aria-label="References" className={`bg-ih-bg py-14 lg:py-[72px] ${RESOURCE_GUTTER}`}>
          <div className={RESOURCE_WIDTH}>
            <div className="grid grid-cols-1 items-end gap-6 border-b border-ih-border pb-[13px] lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-14">
              <HubSectionHead number="/01" eyebrow={copy.references.eyebrow} title={copy.references.heading} />
              {copy.references.body ? (
                <p className="text-[13.5px] leading-[1.6] text-ih-muted">{copy.references.body}</p>
              ) : null}
            </div>

            <ul className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {entries.map((entry) => (
                <li key={entry.key}>
                  {/*
                    The whole card is the link target via the stretched ::after
                    on the title's anchor, so the card has ONE link in the tab
                    order and one accessible name — not four.
                  */}
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-ih-border bg-ih-surface transition-colors duration-150 focus-within:border-ih-accent focus-within:ring-[3px] focus-within:ring-ih-accent-soft hover:border-ih-accent">
                    <ResourceSpecimen resource={entry.key} />
                    <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                      <p className="mono text-[9.5px] uppercase tracking-[0.12em] text-ih-steel">{entry.basis}</p>
                      <h3 className="mt-2.5 text-[22px] font-medium leading-[1.2] tracking-[-0.02em]">
                        <Link
                          href={entry.href}
                          className="outline-none after:absolute after:inset-0 after:content-[''] group-hover:text-ih-accent"
                        >
                          {entry.title}
                        </Link>
                      </h3>
                      <p className="mt-2 text-[13.5px] leading-[1.6] text-ih-muted">{entry.summary}</p>
                      <SpecList rows={entry.facts} className="mt-4" />
                      <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ih-accent">
                        {entry.cta}
                        <ArrowRightIcon size={14} />
                      </span>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ─── 02 · Calculators ──────────────────────────────────────────── */}
      {on('calculators') ? (
        <section aria-label="Calculators" className={`border-t border-ih-border bg-ih-surface py-14 lg:py-[72px] ${RESOURCE_GUTTER}`}>
          <div className={RESOURCE_WIDTH}>
            <div className="grid grid-cols-1 items-end gap-6 border-b border-ih-border pb-[13px] lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-14">
              <HubSectionHead number="/02" eyebrow={copy.calculators.eyebrow} title={copy.calculators.heading} />
              {copy.calculators.body ? (
                <p className="text-[13.5px] leading-[1.6] text-ih-muted">{copy.calculators.body}</p>
              ) : null}
            </div>

            <HairlineGrid className="mt-8 grid-cols-1 md:grid-cols-3">
              {calculators.map((tool) => (
                <HairlineCell key={tool.href} className="group relative flex flex-col gap-2.5 px-6 pb-6 pt-[22px] focus-within:bg-ih-surface-2 hover:bg-ih-surface-2">
                  <p className="mono text-[9.5px] uppercase tracking-[0.12em] text-ih-steel">{tool.kind}</p>
                  <h3 className="text-[17px] font-medium tracking-[-0.02em]">
                    <Link
                      href={tool.href}
                      className="outline-none after:absolute after:inset-0 after:content-[''] group-hover:text-ih-accent focus-visible:underline"
                    >
                      {tool.title}
                    </Link>
                  </h3>
                  <p className="flex-1 text-[13px] leading-[1.55] text-ih-muted">{tool.summary}</p>
                  <span aria-hidden="true" className="text-ih-accent">
                    <ArrowRightIcon size={15} />
                  </span>
                </HairlineCell>
              ))}
            </HairlineGrid>
          </div>
        </section>
      ) : null}

      {/* ─── 03 · Guides ───────────────────────────────────────────────── */}
      {on('guides') && guides.length > 0 ? (
        <section aria-label="Guides" className={`border-t border-ih-border bg-ih-bg py-14 lg:py-[72px] ${RESOURCE_GUTTER}`}>
          <div className={RESOURCE_WIDTH}>
            <div className="border-b border-ih-border pb-[13px]">
              <HubSectionHead number="/03" eyebrow={copy.guides.eyebrow} title={copy.guides.heading} />
            </div>
            {/* Reading order is real, so the numbers are too. */}
            <ol className="mt-2 grid grid-cols-1 gap-x-14 md:grid-cols-2">
              {guides.map((guide, i) => (
                <li key={guide.slug} className="border-b border-ih-border">
                  <Link href={`/blog/${guide.slug}`} className="group flex items-baseline gap-4 py-[18px]">
                    <span className="mono w-6 shrink-0 text-[11px] text-ih-accent">{String(i + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15.5px] font-medium leading-[1.35] tracking-[-0.01em] text-ih-ink group-hover:text-ih-accent">
                        {guide.title}
                      </span>
                      <span className="mono mt-1.5 block text-[10.5px] uppercase tracking-[0.08em] text-ih-muted">
                        {[guide.category, guide.readingMinutes ? `${guide.readingMinutes} min read` : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                    <span aria-hidden="true" className="text-ih-muted-2 group-hover:text-ih-accent">
                      <ArrowRightIcon size={14} />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {on('cta') ? <ResourceCtaBand copy={cta} contact={contact} /> : null}
    </div>
  )
}
