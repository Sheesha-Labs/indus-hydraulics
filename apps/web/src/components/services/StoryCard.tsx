import Link from 'next/link'
import PlaceholderImage from './PlaceholderImage'
import type { ServiceCaseListItem } from '../../lib/service-cases'

type Props = {
  case: ServiceCaseListItem
  /** 'dark' renders inverse (ink bg, light text); 'light' renders elevated bg. */
  variant: 'dark' | 'light'
}

/**
 * Two-up "From the blog" long-read presentation of a case. Same data as the
 * grid card, different framing (longer paragraph, 3 stat cells from the
 * outcome pills, larger image).
 */
export default function StoryCard({ case: c, variant }: Props) {
  const isDark = variant === 'dark'
  const pills = (c.cardOutcomePills as Array<{ label: string; style: string }>) ?? []

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-sm ${
        isDark
          ? 'bg-ih-navy text-white'
          : 'border border-ih-border bg-ih-surface text-ih-ink'
      }`}
    >
      <Link href={`/services/${c.slug}`} className="block">
        <PlaceholderImage
          storagePath={c.heroImage?.storagePath}
          alt={c.heroImage?.alt ?? c.title}
          placeholderLabel={`"${c.cardTagLabel.toLowerCase()} long read\\n660×370"`}
          className="aspect-video"
          sizes="(min-width: 1100px) 50vw, 100vw"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3.5 p-8">
        <span
          className={`mono text-[11px] uppercase tracking-[0.1em] ${
            isDark ? 'opacity-70' : 'text-ih-muted'
          }`}
        >
          FROM THE FIELD · {c.cardTagLabel} · {c.durationDays ? `${c.durationDays} D ON BENCH` : 'CASE STUDY'}
        </span>
        <h3 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.02em]">
          <Link href={`/services/${c.slug}`}>{c.title}</Link>
        </h3>
        <p className={`text-[15px] leading-[1.55] ${isDark ? 'opacity-85' : 'text-ih-ink-2'}`}>
          {c.cardOneLiner ?? c.deck}
        </p>
        {pills.length > 0 ? (
          <div
            className={`mt-auto grid grid-cols-3 gap-4 border-t pt-4 ${
              isDark ? 'border-[oklch(1_0_0/0.12)]' : 'border-ih-border'
            }`}
          >
            {pills.slice(0, 3).map((p, i) => (
              <div key={i}>
                <div
                  className={`text-[22px] font-semibold leading-tight tracking-[-0.015em] ${
                    p.style === 'accent' ? 'text-ih-accent' : ''
                  }`}
                >
                  {p.label.includes(':') ? (p.label.split(':')[1] ?? '').trim() : p.label}
                </div>
                <div
                  className={`mono mt-1 text-[10px] uppercase tracking-[0.1em] ${
                    isDark ? 'opacity-60' : 'text-ih-muted-2'
                  }`}
                >
                  {p.label.includes(':') ? (p.label.split(':')[0] ?? '').trim() : 'Outcome'}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}
