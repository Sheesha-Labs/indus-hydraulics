import Link from 'next/link'
import PlaceholderImage from './PlaceholderImage'
import type { ServiceCaseListItem } from '../../lib/service-cases'

type Props = {
  case: ServiceCaseListItem
}

/**
 * Grid card on /services. Always 4:3 image with a category tag overlay
 * (top-left), an optional duration label (bottom-right), then meta + title +
 * one-liner + outcome pills.
 */
export default function ServiceCaseCard({ case: c }: Props) {
  const pills = (c.cardOutcomePills as Array<{ label: string; style: string }>) ?? []
  const tagBg = c.cardTagStyle === 'oil' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-primary)] text-[var(--color-elevated)]'
  return (
    <Link href={`/services/${c.slug}`} className="group flex flex-col">
      <div className="relative">
        <PlaceholderImage
          storagePath={c.heroImage?.storagePath}
          alt={c.heroImage?.alt ?? c.title}
          placeholderLabel={`"${c.cardTagLabel.toLowerCase()} case\\n520×390"`}
          className="aspect-[4/3] border border-[var(--color-border)] mb-4 group-hover:outline group-hover:outline-2 group-hover:outline-[var(--color-primary)]"
          sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw"
        />
        <span className={`absolute left-3 top-3 ${tagBg} mono px-2.5 py-1 text-[10px] uppercase tracking-[0.12em]`}>
          {c.cardTagLabel}
        </span>
        {c.cardDurationLabel ? (
          <span className="absolute bottom-3 right-3 bg-[oklch(0.18_0.01_240/0.85)] px-2.5 py-1 backdrop-blur-sm mono text-[10.5px] tracking-[0.06em] text-white">
            {c.cardDurationLabel}
          </span>
        ) : null}
      </div>
      <div className="mono mb-1.5 flex gap-2.5 text-[11px] uppercase tracking-[0.08em] text-[var(--color-muted)]">
        <span>
          <strong className="font-medium text-[var(--color-primary)]">NO. {c.caseNumber}</strong>
        </span>
        <span>{c.cardTagLabel}</span>
      </div>
      <h3 className="mb-2 text-[22px] font-semibold leading-tight tracking-[-0.015em]">{c.title}</h3>
      <p className="mb-4 text-sm leading-[1.55] text-[var(--color-muted)]">
        {c.cardOneLiner ?? c.deck}
      </p>
      {pills.length > 0 ? (
        <div className="mt-auto flex flex-wrap gap-2">
          {pills.slice(0, 4).map((p, i) => (
            <span
              key={i}
              className={`mono rounded-sm border px-2 py-1 text-[10.5px] tracking-[0.06em] ${pillClass(p.style)}`}
            >
              {p.label}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  )
}

function pillClass(style: string): string {
  if (style === 'good')
    return 'border-[var(--color-good)] bg-[oklch(0.97_0.03_150)] text-[var(--color-good)]'
  if (style === 'accent')
    return 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
  return 'border-[var(--color-border)] bg-[var(--color-elevated)] text-[var(--color-body)]'
}
