import type { Metadata } from 'next'
import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import { db } from '@indus/db'
import { interpolate, list, str } from '@indus/domain'
import { getIndustryList } from '../../../lib/industry-content'
import { getMasterPageContent } from '../../../lib/page-content'

// Industries list is admin-curated and changes rarely; cache for 5 minutes.
export const revalidate = 300

const FOUNDING_YEAR = 2003

export async function generateMetadata(): Promise<Metadata> {
  const [activeSkuCount, industryCount] = await Promise.all([
    db.product.count({ where: { status: 'active' } }),
    db.industry.count({ where: { isPublished: true } }),
  ])
  const yearsInBusiness = new Date().getFullYear() - FOUNDING_YEAR
  return {
    title: 'Industries We Serve',
    description: `Hydraulic components for ${industryCount} industries including oil & gas, mining, marine and construction. ${activeSkuCount.toLocaleString()} live SKUs. Specialist supplier, ${yearsInBusiness} years, shipping across the GCC from our Dubai HQ.`,
  }
}

type Props = { params: Promise<Record<string, never>> }

// Default gradient — used when an industry row has no per-row gradient set.
// Hue 252 is the one dark band in the language; every other dark surface on
// the site (home hero, editorial, longform) uses it too.
const DEFAULT_GRADIENT = 'linear-gradient(160deg,oklch(0.275 0.055 252),oklch(0.20 0.045 252))'

export default async function IndustriesIndexPage({ params }: Props) {
  await params

  const [industries, activeSkuCount, content] = await Promise.all([
    getIndustryList(),
    db.product.count({ where: { status: 'active' } }),
    // Section order, visibility and copy, edited under Pages & Blocks.
    getMasterPageContent('industries'),
  ])
  const yearsInBusiness = new Date().getFullYear() - FOUNDING_YEAR

  const hero = content.values('hero')
  const stats = content.values('stats')
  const grid = content.values('grid')
  const cta = content.values('cta')

  const t = (value: string | null): string | null =>
    interpolate(value, {
      industries: industries.length,
      skus: activeSkuCount,
      years: yearsInBusiness,
    })

  const statRows = list<{ value?: string; label?: string }>(stats, 'stats')

  const sections: Record<string, ReactNode> = {
    hero: (
      /* Hero */
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 pt-14 pb-10">
        <div className="font-mono text-[11px] tracking-[0.16em] text-ih-muted uppercase mb-3">
          {t(str(hero, 'eyebrow'))}
        </div>
        <div className="grid grid-cols-1 gap-12 items-end lg:grid-cols-[1.2fr_1fr]">
          <h1 className="text-[clamp(40px,5vw,64px)] tracking-[-0.03em] leading-[1.05] font-semibold">
            {t(str(hero, 'heading'))}
          </h1>
          <p className="text-[17px] text-ih-muted leading-[1.55] max-w-[520px]">
            {t(str(hero, 'body'))}
          </p>
        </div>
      </div>
    ),

    stats:
      statRows.length > 0 ? (
        /* Stats strip */
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
          <div className="grid grid-cols-2 border-t border-b border-ih-border sm:grid-cols-4">
            {statRows.map((stat, i) => (
              <div
                key={`${stat.label ?? ''}-${i}`}
                className={`px-6 py-5 ${i < statRows.length - 1 ? 'border-r border-ih-border' : ''}`}
              >
                <div className="font-mono text-[36px] tracking-[-0.03em] font-medium">
                  {t(stat.value ?? '')}
                </div>
                <div className="font-mono text-[11px] text-ih-muted tracking-[0.08em] uppercase mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null,

    grid: (
      /* Industry cards grid */
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 py-12 pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind) => (
            <Link
              key={ind.slug}
              href={`/industries/${ind.slug}`}
              className="group flex flex-col overflow-hidden border border-ih-border hover:border-ih-accent transition-colors"
            >
              {/* Dark hero band */}
              <div
                className="px-7 py-8 flex min-h-[160px] flex-col gap-3 text-white"
                style={{ background: ind.gradient ?? DEFAULT_GRADIENT }}
              >
                <div className="font-mono text-[10px] tracking-[0.16em] opacity-60 uppercase">
                  {ind.tagline ?? ''}
                </div>
                <h2 className="text-[22px] font-semibold tracking-[-0.015em] leading-tight">
                  {ind.name}
                </h2>
                <div className="mt-auto flex flex-wrap gap-1.5">
                  {ind.chips.slice(0, 3).map((chip) => (
                    <span
                      key={chip}
                      className="bg-white/12 px-2 py-0.5 font-mono text-[9px] tracking-[0.1em] text-white/80"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card body */}
              <div className="px-7 py-5 bg-ih-surface flex flex-col gap-3 flex-1">
                {ind.description && (
                  <p className="text-[13px] text-ih-muted leading-[1.6]">{ind.description}</p>
                )}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-ih-border">
                  <span className="font-mono text-[11px] text-ih-muted">
                    {str(grid, 'cta_label')}
                  </span>
                  <span className="font-mono text-[12px] text-ih-accent group-hover:underline">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    ),

    cta: (
      /* Bottom CTA */
      <div className="border-t border-ih-border bg-ih-surface py-14">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 flex flex-wrap items-center justify-between gap-8">
          <div>
            <h2 className="text-[28px] font-semibold tracking-[-0.02em] mb-2">
              {t(str(cta, 'heading'))}
            </h2>
            <p className="text-[14px] text-ih-muted">{t(str(cta, 'body'))}</p>
          </div>
          <div className="flex flex-wrap gap-3 sm:shrink-0">
            {str(cta, 'primary_cta_label') ? (
              <Link
                href={str(cta, 'primary_cta_href') ?? '/quote'}
                className="h-11 px-6 flex items-center bg-ih-accent text-white text-[14px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                {str(cta, 'primary_cta_label')}
              </Link>
            ) : null}
            {str(cta, 'secondary_cta_label') ? (
              <Link
                href={str(cta, 'secondary_cta_href') ?? '/contact'}
                className="h-11 px-5 flex items-center border border-ih-border text-[14px] text-ih-ink-2 hover:bg-ih-surface-2 transition-colors whitespace-nowrap"
              >
                {str(cta, 'secondary_cta_label')}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    ),
  }

  return (
    <div>
      {content.order.map((key) =>
        sections[key] ? <Fragment key={key}>{sections[key]}</Fragment> : null,
      )}
    </div>
  )
}
