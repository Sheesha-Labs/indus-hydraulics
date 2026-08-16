import type { ReactNode } from 'react'
import Link from 'next/link'
import { Breadcrumb } from '@indus/ui'

/**
 * Shared shell for the five policy pages.
 *
 * 02-screen-index.md §10 specifies "one template, five content sets" with a
 * three-column layout: a sticky left column carrying a policy switcher and an
 * on-this-page nav, a max-780px article column, and a right rail.
 *
 * Two deliberate departures from the artboard:
 *
 *  - The right rail's AT-A-GLANCE spec card is NOT built. It summarises
 *    commercial positions (liability caps, return windows, what is excluded)
 *    and there is no structured policy data to derive it from. Writing one by
 *    hand would mean inventing a summary of a legal document, which is not a
 *    layout change. It lands with the `policy` tables in WS-8.
 *  - The PDF-download card is likewise absent — there is no PDF to link to.
 *
 * So this is two columns, not three. Everything it does render is derived
 * from content that already exists; no policy copy is authored here.
 */

export type PolicySection = { id: string; title: string }

const POLICIES = [
  { slug: 'shipping', label: 'Shipping' },
  { slug: 'returns', label: 'Returns' },
  { slug: 'warranty', label: 'Warranty' },
  { slug: 'terms', label: 'Terms' },
  { slug: 'privacy', label: 'Privacy' },
] as const

export default function PolicyLayout({
  slug,
  title,
  effectiveLine,
  sections,
  children,
}: {
  slug: (typeof POLICIES)[number]['slug']
  title: string
  effectiveLine?: string
  sections: readonly PolicySection[]
  children: ReactNode
}) {
  const current = POLICIES.find((p) => p.slug === slug)

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 sm:px-8 xl:px-12">
      <div className="border-b border-ih-border py-4">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: current?.label ?? title }]} />
      </div>

      <div className="grid gap-10 py-10 lg:grid-cols-[196px_minmax(0,780px)] lg:gap-16">
        {/* Left rail — switcher, then on-this-page. Ordered that way because
            "am I on the right document?" precedes "where in it am I?". */}
        <aside className="lg:sticky lg:top-[100px] lg:self-start">
          <nav aria-label="Policies">
            <p className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
              Policies
            </p>
            <ul className="flex flex-col gap-0.5">
              {POLICIES.map((p) => {
                const active = p.slug === slug
                return (
                  <li key={p.slug}>
                    <Link
                      href={`/${p.slug}`}
                      aria-current={active ? 'page' : undefined}
                      className={`block rounded-sm border-l-2 py-1.5 pl-2.5 text-[13px] transition-colors ${
                        active
                          ? 'border-ih-accent bg-ih-accent-soft font-medium text-ih-accent'
                          : 'border-transparent text-ih-ink-2 hover:border-ih-accent hover:bg-ih-surface-2'
                      }`}
                    >
                      {p.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {sections.length > 0 && (
            <nav aria-label="On this page" className="mt-8 border-t border-ih-border pt-6">
              <p className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                On this page
              </p>
              <ul className="flex flex-col gap-2">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="block text-[12.5px] leading-snug text-ih-muted hover:text-ih-accent">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>

        <article className="min-w-0 text-ih-ink-2">
          <header className="mb-10">
            <h1 className="mb-3 font-serif text-[clamp(30px,4vw,40px)] font-normal leading-[1.06] tracking-[-0.01em] text-ih-ink">
              {title}
            </h1>
            {effectiveLine && (
              <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
                {effectiveLine}
              </p>
            )}
          </header>
          {children}
        </article>
      </div>
    </div>
  )
}

/**
 * A numbered policy section. The `id` is what the on-this-page nav targets,
 * and `scroll-mt` keeps the heading clear of the sticky site header when a
 * reader jumps to it — without it the anchor lands under the chrome.
 */
export function PolicySectionBody({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className="mb-9 scroll-mt-[120px]">
      <h2 className="mb-3 text-[18px] font-medium tracking-[-0.01em] text-ih-ink">{title}</h2>
      <div className="space-y-3 text-[15px] leading-[1.7]">{children}</div>
    </section>
  )
}
