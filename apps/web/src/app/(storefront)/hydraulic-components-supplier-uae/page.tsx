import type { Metadata } from 'next'
import { Fragment, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@indus/db'
import { interpolate, list, str, visibleList, type ImageValue } from '@indus/domain'
import { getMasterPageContent } from '../../../lib/page-content'
import { pageMetadata } from '../../../lib/seo'

// Static-ish marketing page; cache for 1 hour.
export const revalidate = 3600

const FOUNDING_YEAR = 2003

/**
 * The company page lives at a descriptive URL rather than `/about`.
 *
 * "About us" describes the page to us; it describes nothing to someone
 * searching for a supplier. The content here — founding year, facility,
 * certifications, leadership — is exactly what a buyer evaluating a supplier
 * is looking for, so the URL says that. `/about` 301s here via the redirects
 * table.
 *
 * The CmsPage override key stays `'about'`: it identifies the content, not
 * the route, and decoupling the two avoids a data migration every time a URL
 * is tuned.
 */
export const ABOUT_CMS_SLUG = 'about'
const PATH = '/hydraulic-components-supplier-uae'

export async function generateMetadata(): Promise<Metadata> {
  const [page, skuCount, brandCount] = await Promise.all([
    // `isPublished` matters here as much as it does in the body query below.
    // Without it a draft row supplied the title and description while the
    // body still rendered the hardcoded fallback — a half-published page.
    db.cmsPage.findUnique({ where: { slug: ABOUT_CMS_SLUG, isPublished: true } }),
    db.product.count({ where: { status: 'active' } }),
    db.brand.count({ where: { isPublished: true } }),
  ])
  const yearsInBusiness = new Date().getFullYear() - FOUNDING_YEAR
  const skuFloor = Math.max(100, Math.floor(skuCount / 100) * 100)
  return pageMetadata({
    // No brand name here. The storefront layout applies
    // `template: '%s | Indus Hydraulics'`, so a title carrying the brand
    // itself rendered as "About Indus Hydraulics | Indus Hydraulics".
    title: page?.seoTitle ?? 'Hydraulic Components Supplier in UAE',
    description:
      page?.seoDescription ??
      `Hydraulic hoses, fittings, adapters, valves and cylinders supplied across the UAE and GCC since ${FOUNDING_YEAR}. ${yearsInBusiness} years in business, ${skuFloor.toLocaleString()}+ SKUs across ${brandCount} brands, shipped from our Dubai warehouse.`,
    path: PATH,
    canonicalUrl: page?.canonicalUrl ?? null,
  })
}

type Props = { params: Promise<Record<string, never>> }

export default async function AboutPage({ params }: Props) {
  await params
  const [page, activeSkuCount, publishedBrandCount, content] = await Promise.all([
    db.cmsPage.findUnique({ where: { slug: ABOUT_CMS_SLUG, isPublished: true } }),
    db.product.count({ where: { status: 'active' } }),
    db.brand.count({ where: { isPublished: true } }),
    // Section order, visibility and copy, edited under Pages & Blocks.
    getMasterPageContent('about'),
  ])
  const yearsInBusiness = new Date().getFullYear() - FOUNDING_YEAR
  // Floor to the nearest 100 so the hero claim never overstates the
  // catalogue — adding SKUs only ever ratchets the number up.
  const skuFloor = Math.max(100, Math.floor(activeSkuCount / 100) * 100)

  if (page) {
    return (
      <div className="max-w-[860px] mx-auto px-8 py-10 pb-20">
        <h1 className="text-[32px] font-semibold tracking-tight mb-8">{page.title}</h1>
        <div
          className="ih-rich-text max-w-none leading-[1.7]"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      </div>
    )
  }

  // Live figures the editable copy may quote as {years}, {skus}, {brands}.
  const tokens = {
    skus: activeSkuCount,
    skusFloor: skuFloor,
    brands: publishedBrandCount,
    years: yearsInBusiness,
  }
  const t = (value: string | null): string | null => interpolate(value, tokens)

  const hero = content.values('hero')
  const stats = content.values('stats')
  const story = content.values('story')
  const team = content.values('team')
  const values = content.values('values')
  const cta = content.values('cta')

  const statRows = list<{ value?: string; label?: string }>(stats, 'stats')
  const timeline = visibleList<{ tag?: string; name?: string; desc?: string }>(story, 'items')
  const people = visibleList<{ tag?: string; name?: string; desc?: string; image?: ImageValue }>(
    team,
    'items',
  )
  const principles = visibleList<{ tag?: string; name?: string; desc?: string }>(values, 'items')

  /*
    Every section, keyed, rendered in `content.order` — the editor's
    arrangement with hidden sections already dropped.
  */
  const sections: Record<string, ReactNode> = {
    hero: (
      /* ── Hero ──────────────────────────────────────────────── */
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 pt-16 pb-8 grid grid-cols-1 gap-14 items-end lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="font-mono text-[11px] tracking-[0.16em] text-ih-muted uppercase mb-3">{t(str(hero, 'eyebrow'))}</div>
          <h1 className="text-[clamp(44px,5.5vw,72px)] tracking-[-0.035em] leading-[1.02] font-semibold">
            {t(str(hero, 'heading'))}
          </h1>
        </div>
        <p className="text-[17px] text-ih-muted leading-[1.55] max-w-[520px]">
          {t(str(hero, 'body'))}
        </p>
      </div>
    ),

    stats: statRows.length > 0 ? (
      /* ── Stats strip ───────────────────────────────────────── */
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
        <div className="grid grid-cols-2 border-t border-b border-ih-border sm:grid-cols-4">
          {statRows.map((stat, i) => (
            <div key={`${stat.label ?? ''}-${i}`} className={`px-6 py-6 ${i < statRows.length - 1 ? 'border-r border-ih-border' : ''}`}>
              <div className="font-mono text-[40px] tracking-[-0.03em] font-medium">{t(stat.value ?? '')}</div>
              <div className="font-mono text-[11px] text-ih-muted tracking-[0.08em] uppercase mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    ) : null,

    story: (
      /* ── Timeline ──────────────────────────────────────────── */
      <section className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 py-16">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_2fr]">
          <div>
            <div className="font-mono text-[11px] tracking-[0.16em] text-ih-muted uppercase mb-2">{t(str(story, 'eyebrow'))}</div>
            <h2 className="text-[36px] font-semibold tracking-[-0.02em] leading-[1.1] mb-4">{t(str(story, 'heading'))}</h2>
            <p className="text-ih-muted leading-[1.6] text-[14px]">
              {t(str(story, 'body'))}
            </p>
          </div>
          <div>
            {timeline.map((item, i) => (
              <div
                key={`${item.tag ?? ''}-${i}`}
                /* Class, not inline: an inline gridTemplateColumns beats the
                   responsive utilities, so the 80px year column plus body
                   text ran past a 390px viewport. */
                className={`grid grid-cols-[64px_1fr] gap-4 py-5 sm:grid-cols-[80px_1fr] sm:gap-6 ${i < timeline.length - 1 ? 'border-b border-ih-border' : ''}`}
              >
                <span className="font-mono text-[16px] text-ih-accent">{item.tag}</span>
                <div className="min-w-0">
                  <h4 className="text-[17px] font-semibold mb-1.5">{item.name}</h4>
                  <p className="text-[14px] text-ih-muted leading-[1.55]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),

    team: people.length > 0 ? (
      /* ── Team ──────────────────────────────────────────────── */
      <section className="border-t border-ih-border py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="font-mono text-[11px] tracking-[0.16em] text-ih-muted uppercase mb-2">{t(str(team, 'eyebrow'))}</div>
              <h2 className="text-[32px] font-semibold tracking-[-0.02em]">{t(str(team, 'heading'))}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {people.map((person, i) => (
              <div key={`${person.name ?? ''}-${i}`} className="border border-ih-border bg-ih-surface overflow-hidden">
                <div className="relative aspect-[4/5] bg-ih-surface-2 border-b border-ih-border grid place-items-center">
                  {/* A photograph replaces the initials disc. Until one is
                      picked the disc IS the portrait — it is not a loading
                      state, so it never renders alongside the image. */}
                  {person.image?.url ? (
                    <Image
                      src={person.image.url}
                      alt={person.image.alt ?? person.name ?? ''}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-ih-navy text-white grid place-items-center text-[28px] font-semibold">
                      {person.tag}
                    </div>
                  )}
                </div>
                <div className="p-4 pb-5">
                  <h4 className="text-[15px] font-semibold">{person.name}</h4>
                  <p className="font-mono text-[11px] text-ih-muted tracking-[0.04em] mt-1">{person.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ) : null,

    values: principles.length > 0 ? (
      /* ── Values ────────────────────────────────────────────── */
      <section className="border-t border-ih-border bg-ih-surface py-16">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
          <div className="font-mono text-[11px] tracking-[0.16em] text-ih-muted uppercase mb-2">{t(str(values, 'eyebrow'))}</div>
          <h2 className="text-[32px] font-semibold tracking-[-0.02em] mb-10">{t(str(values, 'heading'))}</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {principles.map((item, i) => (
              <div key={`${item.name ?? ''}-${i}`}>
                <div className="font-mono text-[32px] font-semibold text-ih-muted opacity-30 mb-4">{item.tag}</div>
                <h3 className="text-[20px] font-semibold tracking-[-0.01em] mb-3">{item.name}</h3>
                <p className="text-[14px] text-ih-muted leading-[1.6]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    ) : null,

    cta: (
      /* ── CTA ───────────────────────────────────────────────── */
      <section className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 py-16 grid grid-cols-1 gap-8 items-center md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] mb-2">{t(str(cta, 'heading'))}</h2>
          <p className="text-[14px] text-ih-muted">{t(str(cta, 'body'))}</p>
        </div>
        <div className="flex flex-wrap gap-3 sm:shrink-0">
          {str(cta, 'primary_cta_label') && str(cta, 'primary_cta_href') ? (
            <Link href={str(cta, 'primary_cta_href') ?? '/quote'} className="h-11 px-6 flex items-center bg-ih-accent text-white text-[14px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
              {str(cta, 'primary_cta_label')}
            </Link>
          ) : null}
          {str(cta, 'secondary_cta_label') && str(cta, 'secondary_cta_href') ? (
            <Link href={str(cta, 'secondary_cta_href') ?? '/contact'} className="h-11 px-5 flex items-center border border-ih-border text-[14px] text-ih-ink-2 hover:bg-ih-surface-2 transition-colors whitespace-nowrap">
              {str(cta, 'secondary_cta_label')}
            </Link>
          ) : null}
        </div>
      </section>
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
