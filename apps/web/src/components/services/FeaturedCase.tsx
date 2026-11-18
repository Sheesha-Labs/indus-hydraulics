import Link from 'next/link'
import PlaceholderImage from './PlaceholderImage'
import type { ServiceCaseListItem } from '../../lib/service-cases'

type Props = {
  case: ServiceCaseListItem
}

/**
 * "Case of the week" at the top of /services, as a compact blog-style row:
 * a 16:10 image beside the meta line, headline, one-liner and a quiet strip
 * of the three headline outcomes. Sized so the first row of the grid shows
 * on the same screen (owner call, 2026-11-18 — the old 1.5fr hero-sized
 * feature pushed everything else below the fold).
 */
export default function FeaturedCase({ case: c }: Props) {
  const pills = (c.cardOutcomePills as Array<{ label: string; style: string }>) ?? []

  return (
    <section className="grid grid-cols-1 items-center gap-6 border-b border-ih-border py-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
      <Link href={`/services/${c.slug}`} className="group relative block overflow-hidden rounded-[var(--radius-lg)]">
        <PlaceholderImage
          storagePath={c.heroImage?.storagePath}
          alt={c.heroImage?.alt ?? c.title}
          className="aspect-[16/10] transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          sizes="(min-width: 768px) 40vw, 100vw"
          priority
        />
        <span className="absolute left-3 top-3 rounded-full bg-ih-navy px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
          Case of the week
        </span>
      </Link>

      <div className="flex min-w-0 flex-col">
        <p className="text-[12.5px] font-medium text-ih-muted">
          <span className="tabular-nums text-ih-ink">No. {c.caseNumber}</span>
          <span aria-hidden="true"> · </span>
          {c.cardTagLabel}
          {c.caseDateLabel ? (
            <>
              <span aria-hidden="true"> · </span>
              {c.caseDateLabel}
            </>
          ) : null}
        </p>
        <h2 className="mt-2 text-balance text-[24px] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[28px]">
          <Link href={`/services/${c.slug}`} className="hover:text-ih-accent">
            {c.titleAccent ? renderTitleWithAccent(c.title, c.titleAccent) : c.title}
          </Link>
        </h2>
        <p className="mt-2.5 line-clamp-2 max-w-[640px] text-[15px] leading-[1.55] text-ih-ink-2">
          {c.cardOneLiner ?? c.deck}
        </p>

        {pills.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            {pills.slice(0, 3).map((p, i) => {
              const [key, value] = splitPill(p.label)
              return (
                <li key={i} className="border-l-2 border-ih-border pl-3">
                  {key ? (
                    <span className="block text-[11.5px] font-medium uppercase tracking-[0.06em] text-ih-muted">{key}</span>
                  ) : null}
                  <span className="block text-[15px] font-semibold tracking-[-0.01em] text-ih-ink">{value}</span>
                </li>
              )
            })}
          </ul>
        ) : null}

        <div className="mt-5 flex items-center gap-3 text-sm">
          {/* The site's own favicon, served by /tab-icon.png from the brand
              settings, so it follows whatever mark the operator uploads. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- a route-served brand mark, not an optimisable asset */}
          <img
            src="/tab-icon.png"
            alt=""
            width={32}
            height={32}
            className="size-8 rounded-full border border-ih-border bg-ih-surface object-contain p-1"
          />
          <div className="leading-tight">
            <span className="font-medium">Indus Hydraulics</span>
            <span className="block text-[12px] text-ih-muted">{c.region ?? 'Jebel Ali · UAE'}</span>
          </div>
          <Link
            href={`/services/${c.slug}`}
            className="ml-auto inline-flex items-center gap-1 text-[13.5px] font-medium text-ih-accent hover:underline"
          >
            Read the case <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

/** "Key: value" labels → [key, value]; a plain label is the value alone. */
function splitPill(label: string): [string | null, string] {
  const at = label.indexOf(':')
  if (at < 0) return [null, label]
  return [label.slice(0, at).trim(), label.slice(at + 1).trim()]
}

/** Replace one occurrence of the accent phrase inside the title with italic accent. */
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
