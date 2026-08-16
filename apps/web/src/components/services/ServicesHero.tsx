import Link from 'next/link'
import type { HeroStat } from '../../lib/services-config'

type Props = {
  stats: HeroStat[]
}

export default function ServicesHero({ stats }: Props) {
  return (
    <section className="border-b border-ih-border py-14">
      <div className="grid items-end gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <div>
          <span className="eyebrow">SERVICES · WORKSHOPS · ON-SITE</span>
          {/*
            The display pattern: a full declarative sentence ending in a
            period, with the closing clause in ITALIC. 01-design-language.md
            §3 — the italic clause is the emphasis, and you never bold inside
            a serif headline. This previously coloured the clause accent
            instead, which reads as a link and spends the signal colour on
            decoration.
          */}
          <h1 className="my-4 max-w-[15ch] text-balance font-serif text-[clamp(38px,5.5vw,60px)] font-normal leading-[1.04] tracking-[-0.01em]">
            Things people <em className="italic">bring us broken</em>, and what we sent back.
          </h1>
          <p className="max-w-xl text-[17px] leading-[1.55] text-ih-muted">
            Service jobs run out of our Jebel Ali yard — written as case studies, with photos, measurements
            and what it actually cost. Browse the cases or jump straight to a quote.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-sm border border-ih-border bg-ih-surface px-4 pb-4 pt-3.5"
              >
                <div className="text-[28px] font-semibold leading-none tracking-[-0.02em]">
                  {s.value}
                  {s.smallSuffix ? (
                    <small className="text-sm font-medium text-ih-muted">
                      {s.smallSuffix}
                    </small>
                  ) : null}
                </div>
                <div className="mono mt-2 text-[10.5px] uppercase tracking-[0.1em] text-ih-muted">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 rounded-sm bg-ih-navy px-5 py-3 text-sm font-medium text-white hover:bg-ih-ink"
            >
              Request a service quote
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-sm border border-ih-border bg-ih-surface px-5 py-3 text-sm font-medium hover:border-ih-accent"
            >
              Talk to an engineer →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
