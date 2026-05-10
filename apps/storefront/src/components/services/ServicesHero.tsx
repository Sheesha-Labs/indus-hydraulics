import Link from 'next/link'
import type { HeroStat } from '../../lib/services-config'

type Props = {
  stats: HeroStat[]
}

export default function ServicesHero({ stats }: Props) {
  return (
    <section className="border-b border-[var(--color-border)] py-14">
      <div className="grid items-end gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <div>
          <span className="eyebrow">SERVICES · WORKSHOPS · ON-SITE</span>
          <h1 className="my-3 text-5xl font-semibold leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-7xl xl:text-[80px]">
            Things people <span className="text-[var(--color-accent)]">bring us broken</span>, and what we sent back.
          </h1>
          <p className="max-w-xl text-[17px] leading-[1.55] text-[var(--color-muted)]">
            Service jobs run out of our Jebel Ali yard — written as case studies, with photos, measurements
            and what it actually cost. Browse the cases or jump straight to a quote.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-sm border border-[var(--color-border)] bg-[var(--color-elevated)] px-4 pb-4 pt-3.5"
              >
                <div className="text-[28px] font-semibold leading-none tracking-[-0.02em]">
                  {s.value}
                  {s.smallSuffix ? (
                    <small className="text-sm font-medium text-[var(--color-muted)]">
                      {s.smallSuffix}
                    </small>
                  ) : null}
                </div>
                <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.1em] text-[var(--color-muted)]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 rounded-sm bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-[var(--color-elevated)] hover:bg-[color-mix(in_oklab,var(--color-primary)_88%,white)]"
            >
              Request a service quote
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-sm border border-[var(--color-border)] bg-[var(--color-elevated)] px-5 py-3 text-sm font-medium hover:border-[var(--color-muted)]"
            >
              Talk to an engineer →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
