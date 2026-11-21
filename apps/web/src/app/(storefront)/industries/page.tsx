import type { Metadata } from 'next'
import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@indus/db'
import { interpolate, list, str } from '@indus/domain'
import { getIndustryList } from '../../../lib/industry-content'
import { mediaUrl } from '../../../lib/media'
import { getMasterPageContent } from '../../../lib/page-content'

// A day, not five minutes: industry saves revalidate this path directly
// (admin/industries actions), so the window is only a backstop.
export const revalidate = 86400

const FOUNDING_YEAR = 2003

export async function generateMetadata(): Promise<Metadata> {
  // The count comes from `getIndustryList`, not `db.industry.count` — the list
  // includes the designed pages, which have no table row. Counting the table
  // would print one number in the meta description and render a different
  // number of cards on the page.
  const [activeSkuCount, industries] = await Promise.all([
    db.product.count({ where: { status: 'active' } }),
    getIndustryList(),
  ])
  const industryCount = industries.length
  const yearsInBusiness = new Date().getFullYear() - FOUNDING_YEAR
  return {
    title: 'Industries We Serve',
    alternates: { canonical: '/industries' },
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
  // eslint-disable-next-line react/purity -- Server Component: reading the clock at render is intended here.
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
      <div className="mx-auto max-w-[1440px] px-5 pt-14 pb-10 sm:px-8 xl:px-12">
        <div className="text-ih-muted mb-3 font-mono text-[11px] tracking-[0.16em] uppercase">
          {t(str(hero, 'eyebrow'))}
        </div>
        <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-[1.2fr_1fr]">
          <h1 className="text-[clamp(40px,5vw,64px)] leading-[1.05] font-semibold tracking-[-0.03em]">
            {t(str(hero, 'heading'))}
          </h1>
          <p className="text-ih-muted max-w-[520px] text-[17px] leading-[1.55]">
            {t(str(hero, 'body'))}
          </p>
        </div>
      </div>
    ),

    stats:
      statRows.length > 0 ? (
        /* Stats strip */
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
          <div className="border-ih-border grid grid-cols-2 border-t border-b sm:grid-cols-4">
            {statRows.map((stat, i) => (
              <div
                key={`${stat.label ?? ''}-${i}`}
                className={`px-6 py-5 ${i < statRows.length - 1 ? 'border-ih-border border-r' : ''}`}
              >
                <div className="font-mono text-[36px] font-medium tracking-[-0.03em]">
                  {t(stat.value ?? '')}
                </div>
                <div className="text-ih-muted mt-1 font-mono text-[11px] tracking-[0.08em] uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null,

    grid: (
      /* Industry cards grid */
      <div className="mx-auto max-w-[1440px] px-5 py-12 pb-20 sm:px-8 xl:px-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind) => (
            <Link
              key={ind.slug}
              href={`/industries/${ind.slug}`}
              className="group border-ih-border hover:border-ih-accent flex flex-col overflow-hidden border transition-colors"
            >
              {/* Dark hero band. With a hero photograph, the photo sits under a
                  bottom-weighted scrim (the CaseHero figcaption treatment) so
                  the white tagline, name and chips keep their contrast; without
                  one, the band keeps its gradient. */}
              <div
                className="relative isolate flex min-h-[160px] flex-col gap-3 overflow-hidden px-7 py-8 text-white"
                style={{ background: ind.gradient ?? DEFAULT_GRADIENT }}
              >
                {ind.heroImage && (
                  <>
                    <Image
                      src={mediaUrl(ind.heroImage)}
                      alt={ind.heroImageAlt ?? ''}
                      fill
                      className="-z-20 object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 -z-10 bg-gradient-to-t from-[oklch(0_0_0/0.85)] via-[oklch(0_0_0/0.66)] to-[oklch(0_0_0/0.58)]"
                    />
                  </>
                )}
                <div
                  className={`font-mono text-[10px] tracking-[0.16em] uppercase ${ind.heroImage ? 'opacity-80' : 'opacity-60'}`}
                >
                  {ind.tagline ?? ''}
                </div>
                <h2 className="text-[22px] leading-tight font-semibold tracking-[-0.015em]">
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
              <div className="bg-ih-surface flex flex-1 flex-col gap-3 px-7 py-5">
                {ind.description && (
                  <p className="text-ih-muted text-[13px] leading-[1.6]">{ind.description}</p>
                )}
                <div className="border-ih-border mt-auto flex items-center justify-between border-t pt-3">
                  <span className="text-ih-muted font-mono text-[11px]">
                    {str(grid, 'cta_label')}
                  </span>
                  <span className="text-ih-accent font-mono text-[12px] group-hover:underline">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    ),

    cta: (
      /* Bottom CTA */
      <div className="border-ih-border bg-ih-surface border-t py-14">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-8 px-5 sm:px-8 xl:px-12">
          <div>
            <h2 className="mb-2 text-[28px] font-semibold tracking-[-0.02em]">
              {t(str(cta, 'heading'))}
            </h2>
            <p className="text-ih-muted text-[14px]">{t(str(cta, 'body'))}</p>
          </div>
          <div className="flex flex-wrap gap-3 sm:shrink-0">
            {str(cta, 'primary_cta_label') ? (
              <Link
                href={str(cta, 'primary_cta_href') ?? '/contact'}
                className="bg-ih-accent flex h-11 items-center px-6 text-[14px] font-medium whitespace-nowrap text-white transition-opacity hover:opacity-90"
              >
                {str(cta, 'primary_cta_label')}
              </Link>
            ) : null}
            {str(cta, 'secondary_cta_label') ? (
              <Link
                href={str(cta, 'secondary_cta_href') ?? '/contact'}
                className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 flex h-11 items-center border px-5 text-[14px] whitespace-nowrap transition-colors"
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
        sections[key] ? <Fragment key={key}>{sections[key]}</Fragment> : null
      )}
    </div>
  )
}
