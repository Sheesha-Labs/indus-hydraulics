import Link from 'next/link'
import PlaceholderImage from './PlaceholderImage'
import type { ServiceCaseListItem } from '../../lib/service-cases'

type Props = {
  case: ServiceCaseListItem
}

/**
 * Large "Case of the Week" feature row at the top of /services.
 * 1.5fr image + 1fr body. Renders the 3 most useful outcome pills as a
 * 3-cell metric strip (matches the mock).
 */
export default function FeaturedCase({ case: c }: Props) {
  // Outcome pills come from the same data the grid card uses; pick first 3
  // to populate the 3-cell metric strip.
  const pills = (c.cardOutcomePills as Array<{ label: string; style: string }>) ?? []
  const tagBg = c.cardTagStyle === 'oil' ? 'bg-ih-accent text-white' : 'bg-ih-navy text-white'

  return (
    <section className="grid grid-cols-1 gap-8 py-12 lg:grid-cols-[1.5fr_1fr]">
      <Link href={`/services/${c.slug}`} className="group relative block">
        <PlaceholderImage
          storagePath={c.heroImage?.storagePath}
          alt={c.heroImage?.alt ?? c.title}
          placeholderLabel={`"${c.title}\\nfeatured 1100×760"`}
          className="aspect-[16/11] border border-ih-border"
          sizes="(min-width: 1024px) 60vw, 100vw"
          priority
        />
        <span className={`absolute left-4 top-4 ${tagBg} mono px-3 py-1.5 text-[10.5px] uppercase tracking-[0.12em]`}>
          Case of the week
        </span>
      </Link>

      <div className="flex flex-col gap-4 py-3">
        <div className="mono flex flex-wrap gap-3.5 text-[11px] uppercase tracking-[0.1em] text-ih-muted">
          <span>
            <strong className="font-medium text-ih-ink">NO. {c.caseNumber}</strong>
          </span>
          <span>· {c.cardTagLabel}</span>
          {c.caseDateLabel ? <span>· {c.caseDateLabel}</span> : null}
        </div>
        <h2 className="text-3xl font-semibold leading-[1.05] tracking-[-0.025em] sm:text-4xl lg:text-[42px]">
          <Link href={`/services/${c.slug}`} className="hover:text-ih-accent">
            {c.titleAccent ? renderTitleWithAccent(c.title, c.titleAccent) : c.title}
          </Link>
        </h2>
        <p className="text-[16px] leading-[1.55] text-ih-ink-2">
          {c.cardOneLiner ?? c.deck}
        </p>

        {pills.length > 0 ? (
          <div className="mt-2 grid grid-cols-3 gap-px border border-ih-border bg-ih-border">
            {pills.slice(0, 3).map((p, i) => (
              <div key={i} className="bg-ih-surface p-4">
                <div className="mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
                  {p.label.replace(/^([^:]+):.*/, '$1') /* if "key: value" pattern, show key */}
                </div>
                <div
                  className={`mt-1 text-[22px] font-semibold leading-tight tracking-[-0.01em] ${
                    p.style === 'good'
                      ? 'text-ih-success'
                      : p.style === 'accent'
                        ? 'text-ih-accent'
                        : ''
                  }`}
                >
                  {p.label.includes(':') ? (p.label.split(':')[1] ?? '').trim() : p.label}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-2 flex items-center gap-3 border-t border-ih-border pt-3 text-sm">
          <div className="size-9 rounded-full border border-ih-border bg-ih-surface-2" aria-hidden />
          <div>
            <strong className="font-medium">Indus Hydraulics</strong>
            <small className="mono mt-0.5 block text-[11px] tracking-[0.04em] text-ih-muted">
              {c.region ? c.region.toUpperCase() : 'JEBEL ALI · UAE'}
            </small>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Replace one occurrence of the accent phrase inside the title with italic-orange. */
function renderTitleWithAccent(title: string, accent: string): React.ReactNode {
  const idx = title.indexOf(accent)
  if (idx < 0) return title
  return (
    <>
      {title.slice(0, idx)}
      <em className="font-normal italic text-ih-accent">{accent}</em>
      {title.slice(idx + accent.length)}
    </>
  )
}
