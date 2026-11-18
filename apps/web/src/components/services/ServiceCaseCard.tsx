import Link from 'next/link'
import PlaceholderImage from './PlaceholderImage'
import type { ServiceCaseListItem } from '../../lib/service-cases'

type Props = {
  case: ServiceCaseListItem
}

/**
 * Grid card on /services: 4:3 image with the category tag (top-left) and the
 * duration (bottom-right), then a one-line meta row, the headline and up to
 * four outcome chips.
 *
 * Kept light on purpose (owner call, 2026-11-18): no one-liner under the
 * title, Geist throughout instead of mono labels, and neutral chips. The
 * chips used to be tinted green/blue by `style`; colour there read as status
 * and made a grid of twenty cards loud. The case page itself still carries
 * the full deck and the detail.
 */
export default function ServiceCaseCard({ case: c }: Props) {
  const pills = (c.cardOutcomePills as Array<{ label: string; style: string }>) ?? []
  return (
    <Link href={`/services/${c.slug}`} className="group flex flex-col">
      <div className="relative mb-3.5 overflow-hidden rounded-[var(--radius-lg)]">
        <PlaceholderImage
          storagePath={c.heroImage?.storagePath}
          alt={c.heroImage?.alt ?? c.title}
          className="aspect-[4/3] transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11.5px] font-semibold text-ih-ink shadow-[0_1px_4px_rgba(10,20,40,0.18)]">
          {c.cardTagLabel}
        </span>
        {c.cardDurationLabel ? (
          <span className="absolute bottom-3 right-3 rounded-full bg-[oklch(0.18_0.01_240/0.8)] px-2.5 py-1 text-[11.5px] font-medium tabular-nums text-white backdrop-blur-sm">
            {c.cardDurationLabel}
          </span>
        ) : null}
      </div>
      <p className="mb-1.5 text-[12.5px] font-medium text-ih-muted">
        <span className="tabular-nums text-ih-ink">No. {c.caseNumber}</span>
        <span aria-hidden="true"> · </span>
        {c.cardTagLabel}
      </p>
      <h3 className="mb-3.5 text-balance text-[19px] font-semibold leading-snug tracking-[-0.015em] group-hover:text-ih-accent">
        {c.title}
      </h3>
      {pills.length > 0 ? (
        <ul className="mt-auto flex flex-wrap gap-1.5">
          {pills.slice(0, 4).map((p, i) => (
            <li
              key={i}
              className="rounded-full border border-ih-border bg-ih-surface px-2.5 py-1 text-[12px] font-medium text-ih-ink"
            >
              {p.label}
            </li>
          ))}
        </ul>
      ) : null}
    </Link>
  )
}
