import Link from 'next/link'
import type { HeroStat } from '../../lib/services-config'

type Props = {
  stats: HeroStat[]
  /**
   * Copy from Pages & Blocks. Every field falls back to the string this
   * component shipped with, so the component still renders correctly if it is
   * ever mounted without a document behind it.
   */
  eyebrow?: string | null
  headingLead?: string | null
  headingEmphasis?: string | null
  headingTail?: string | null
  primaryLabel?: string | null
  primaryHref?: string | null
  secondaryLabel?: string | null
  secondaryHref?: string | null
}

/**
 * The /services hero, kept deliberately quiet: eyebrow, headline and the
 * three job figures under it, with the two actions on the right. The
 * standfirst paragraph was dropped (owner call, 2026-11-18) — the case cards
 * directly below say the same thing with evidence. The `body` field stays in
 * Pages & Blocks; this component simply no longer renders it.
 */
export default function ServicesHero({
  stats,
  eyebrow,
  headingLead,
  headingEmphasis,
  headingTail,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: Props) {
  return (
    <section className="border-ih-border border-b py-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <div>
          <span className="eyebrow">{eyebrow ?? 'SERVICES · WORKSHOPS · ON-SITE'}</span>
          {/*
            The display pattern: a full declarative sentence ending in a
            period, with the closing clause in ITALIC. 01-design-language.md
            §3 — the italic clause is the emphasis, and you never bold inside
            a serif headline.
          */}
          <h1 className="mt-3 max-w-[30ch] font-serif text-[clamp(32px,4vw,46px)] leading-[1.06] font-normal tracking-[-0.01em] text-balance">
            {headingLead ?? 'Things people'}{' '}
            {headingEmphasis ? <em className="italic">{headingEmphasis}</em> : null}
            {headingTail ?? ', and what we sent back.'}
          </h1>

          {stats.length > 0 ? (
            <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
              {stats.map((s) => (
                <div key={s.label} className="border-ih-accent border-l-2 pl-3.5">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-[24px] leading-none font-semibold tracking-[-0.02em] tabular-nums">
                    {s.value}
                    {s.smallSuffix ? (
                      <small className="text-ih-muted ml-0.5 text-sm font-medium">
                        {s.smallSuffix}
                      </small>
                    ) : null}
                  </dd>
                  <p
                    aria-hidden="true"
                    className="text-ih-muted mt-1.5 text-[12px] font-medium tracking-[0.08em] uppercase"
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          {primaryLabel ? (
            <Link
              href={primaryHref ?? '/contact'}
              className="bg-ih-navy hover:bg-ih-ink inline-flex h-10 items-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-medium text-white"
            >
              {primaryLabel}
            </Link>
          ) : null}
          {secondaryLabel ? (
            <Link
              href={secondaryHref ?? '/contact'}
              className="border-ih-border bg-ih-surface hover:border-ih-accent inline-flex h-10 items-center gap-2 rounded-[var(--radius-md)] border px-5 text-sm font-medium"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
