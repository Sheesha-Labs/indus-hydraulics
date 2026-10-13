import Link from 'next/link'
import type { ReactNode } from 'react'
import { Card, Eyebrow, SpecList, Stat } from '@indus/ui'
import { RESOURCES_LAST_CHECKED, type ResourceEntry } from '@indus/domain'
import { ArrowRightIcon } from '../designed/icons'
import type { ResourceContact, ResourceCtaCopy } from '../../lib/resources-content'
import { RESOURCE_GUTTER, RESOURCE_WIDTH, ResourceBreadcrumbStrip, ResourceCtaBand } from './ResourceLayout'

/**
 * The shell for a reference page: hero, a two-column body with a sticky rail,
 * the other references, and the shared navy band.
 *
 * HEADING TREE: one H1 in the hero, then the page's numbered H2 sections in the
 * main column, then "Other references" and the band. The rail carries no
 * headings of its own — its labels are eyebrows — so it never interleaves with
 * the outline.
 *
 * THE RAIL IS NAVIGATION, NOT CONTENT. Below `lg` it would sit after a long
 * table where nobody would find it, so the same contents links render as a chip
 * row above the main column instead and the rail is hidden.
 */

export type ResourceHero = {
  eyebrow: string
  lead: string
  emphasis: string
  lede: string
  spec: readonly (readonly [string, string])[]
  stats: readonly { value: string; label: string }[]
}

export default function ResourcePage({
  entry,
  hero,
  contents,
  railNote,
  related,
  cta,
  contact,
  children,
}: {
  entry: ResourceEntry
  hero: ResourceHero
  contents: readonly { id: string; label: string }[]
  /** The one editorial aside on the page, shown in the rail. */
  railNote: { title: string; body: ReactNode }
  related: readonly ResourceEntry[]
  cta: ResourceCtaCopy
  contact: ResourceContact
  children: ReactNode
}) {
  return (
    <div className="bg-ih-surface">
      <ResourceBreadcrumbStrip
        trail={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: entry.title }]}
        meta={`Checked ${RESOURCES_LAST_CHECKED}`}
      />

      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <section className={`border-b border-ih-border bg-ih-surface pb-12 pt-10 lg:pb-14 lg:pt-12 ${RESOURCE_GUTTER}`}>
        <div className={RESOURCE_WIDTH}>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
            <div>
              <Eyebrow>{hero.eyebrow}</Eyebrow>
              <h1 className="mt-[18px] text-balance font-serif text-[34px] font-normal leading-[1.04] tracking-[-0.01em] sm:text-[44px] lg:text-[54px]">
                {hero.lead} <em>{hero.emphasis}</em>
              </h1>
              <p className="mt-5 max-w-[640px] text-pretty text-[16px] leading-[1.6] text-ih-ink-2">{hero.lede}</p>
            </div>
            <div>
              <p className="mono mb-1 text-[10px] uppercase tracking-[0.14em] text-ih-muted">About this reference</p>
              <SpecList rows={hero.spec} />
            </div>
          </div>

          <div className="mt-11 grid max-w-[1040px] grid-cols-2 gap-7 sm:grid-cols-4">
            {hero.stats.map((stat) => (
              <Stat key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Body ──────────────────────────────────────────────────────── */}
      <div className={`bg-ih-bg py-12 lg:py-16 ${RESOURCE_GUTTER}`}>
        <div
          className={`${RESOURCE_WIDTH} grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_320px]`}
        >
          <div className="min-w-0">
            <nav aria-label="On this page" className="mb-10 lg:hidden">
              <p className="mono mb-2.5 text-[10px] uppercase tracking-[0.14em] text-ih-muted">On this page</p>
              <ul className="flex flex-wrap gap-2">
                {contents.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="inline-flex h-[30px] items-center rounded-full border border-ih-border bg-ih-surface px-3 text-[12.5px] text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex flex-col gap-16">{children}</div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-[124px] flex flex-col gap-4">
              <Card>
                <nav aria-label="On this page" className="px-5 py-[18px]">
                  <p className="mono mb-3 text-[10px] uppercase tracking-[0.14em] text-ih-muted">On this page</p>
                  <ol className="flex flex-col">
                    {contents.map((item, i) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="group flex items-baseline gap-3 border-t border-ih-border py-2.5 text-[13px] text-ih-ink-2 first:border-t-0 hover:text-ih-accent"
                        >
                          <span className="mono w-6 shrink-0 text-[10.5px] text-ih-muted-2 group-hover:text-ih-accent">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </Card>

              <div className="rounded-lg border border-[oklch(0.88_0.04_248)] bg-ih-accent-soft px-5 py-[18px]">
                <p className="mono text-[10px] uppercase tracking-[0.14em] text-[oklch(0.38_0.09_248)]">{railNote.title}</p>
                <div className="mt-2.5 text-[13px] leading-[1.6] text-[oklch(0.33_0.07_248)]">{railNote.body}</div>
              </div>

              <Card className="bg-ih-steel-soft px-5 py-[18px]">
                <p className="text-[13.5px] font-medium leading-[1.4] text-ih-ink">Need the part, not just the figure?</p>
                <p className="mt-1.5 text-[12.5px] leading-[1.55] text-ih-muted">
                  Send the part number or the measurements and we quote the same day.
                </p>
                <Link
                  href="/quote"
                  className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-ih-accent hover:text-ih-accent-hover"
                >
                  Request a quote
                  <ArrowRightIcon size={14} />
                </Link>
              </Card>
            </div>
          </aside>
        </div>
      </div>

      {/* ─── Other references ──────────────────────────────────────────── */}
      <section
        aria-labelledby="other-references-heading"
        className={`border-t border-ih-border bg-ih-surface py-12 lg:py-14 ${RESOURCE_GUTTER}`}
      >
        <div className={RESOURCE_WIDTH}>
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <h2 id="other-references-heading" className="font-serif text-[26px] font-normal tracking-[-0.01em] sm:text-[30px]">
              Other references
            </h2>
            <Link
              href="/resources"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ih-accent hover:text-ih-accent-hover"
            >
              All resources
              <ArrowRightIcon size={14} />
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {related.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="group flex h-full flex-col rounded-lg border border-ih-border bg-ih-surface p-5 transition-colors duration-150 hover:border-ih-accent"
                >
                  <span className="mono text-[9.5px] uppercase tracking-[0.12em] text-ih-steel">{item.basis}</span>
                  <span className="mt-2.5 text-[17px] font-medium tracking-[-0.02em] text-ih-ink group-hover:text-ih-accent">
                    {item.title}
                  </span>
                  <span className="mt-1.5 flex-1 text-[13px] leading-[1.55] text-ih-muted">{item.summary}</span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ih-accent">
                    {item.cta}
                    <ArrowRightIcon size={14} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ResourceCtaBand copy={cta} contact={contact} />
    </div>
  )
}
