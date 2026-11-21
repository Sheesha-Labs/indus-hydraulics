import Link from 'next/link'
import PlaceholderImage from './PlaceholderImage'
import type { ServiceCaseListItem } from '../../lib/service-cases'

type Props = {
  cases: ServiceCaseListItem[]
}

export default function RelatedCases({ cases }: Props) {
  if (cases.length === 0) return null
  return (
    <section className="border-ih-border bg-ih-surface -mx-[var(--spacing-page-gutter)] border-y px-[var(--spacing-page-gutter)] py-16">
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
            className="border-ih-border bg-ih-surface hover:border-ih-accent inline-flex items-center rounded-sm border px-4 py-2 text-sm font-medium"
          >
            All case studies →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cases.slice(0, 3).map((c) => (
            <Link
              key={c.id}
              href={`/services/${c.slug}`}
              className="border-ih-border bg-ih-bg hover:border-ih-accent flex flex-col overflow-hidden rounded-sm border"
            >
              <PlaceholderImage
                storagePath={c.heroImage?.storagePath}
                alt={c.heroImage?.alt ?? c.title}
                placeholderLabel={`"${c.cardTagLabel.toLowerCase()} 520×325"`}
                className="aspect-[16/10]"
                sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw"
              />
              <div className="p-5">
                <span className="mono text-ih-accent text-[10.5px] tracking-[0.08em] uppercase">
                  NO. {c.caseNumber} · {c.cardTagLabel}
                </span>
                <h4 className="mt-1.5 mb-2 text-[18px] leading-tight font-semibold tracking-[-0.01em]">
                  {c.title}
                </h4>
                <p className="text-ih-muted m-0 text-[13px] leading-[1.5]">
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
