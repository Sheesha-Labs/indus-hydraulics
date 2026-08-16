import Link from 'next/link'
import PlaceholderImage from './PlaceholderImage'
import type { ServiceCaseListItem } from '../../lib/service-cases'

type Props = {
  cases: ServiceCaseListItem[]
}

export default function RelatedCases({ cases }: Props) {
  if (cases.length === 0) return null
  return (
    <section className="-mx-[var(--spacing-page-gutter)] border-y border-ih-border bg-ih-surface px-[var(--spacing-page-gutter)] py-16">
      <div className="mx-auto max-w-[var(--spacing-max-w)]">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <span className="eyebrow">RELATED CASES · SIMILAR JOBS THIS QUARTER</span>
            <h3 className="mt-2 text-[28px] font-semibold tracking-[-0.02em]">
              More from the {cases[0]?.cardTagLabel.toLowerCase() ?? 'case'} desk.
            </h3>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center rounded-sm border border-ih-border bg-ih-surface px-4 py-2 text-sm font-medium hover:border-ih-accent"
          >
            All case studies →
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cases.slice(0, 3).map((c) => (
            <Link
              key={c.id}
              href={`/services/${c.slug}`}
              className="flex flex-col overflow-hidden rounded-sm border border-ih-border bg-ih-bg hover:border-ih-accent"
            >
              <PlaceholderImage
                storagePath={c.heroImage?.storagePath}
                alt={c.heroImage?.alt ?? c.title}
                placeholderLabel={`"${c.cardTagLabel.toLowerCase()} 520×325"`}
                className="aspect-[16/10]"
                sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw"
              />
              <div className="p-5">
                <span className="mono text-[10.5px] uppercase tracking-[0.08em] text-ih-accent">
                  NO. {c.caseNumber} · {c.cardTagLabel}
                </span>
                <h4 className="mb-2 mt-1.5 text-[18px] font-semibold leading-tight tracking-[-0.01em]">
                  {c.title}
                </h4>
                <p className="m-0 text-[13px] leading-[1.5] text-ih-muted">
                  {c.cardOneLiner ?? c.deck}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
