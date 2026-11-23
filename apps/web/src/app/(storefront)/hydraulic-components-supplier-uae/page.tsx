import type { Metadata } from 'next'
import { Fragment, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@indus/db'
import { interpolate, list, str, visibleList, type ImageValue } from '@indus/domain'
import { getMasterPageContent } from '../../../lib/page-content'
import { pageMetadata } from '../../../lib/seo'
import ServiceAreaStrip from '../../../components/locations/ServiceAreaStrip'

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
  // eslint-disable-next-line react/purity -- Server Component: reading the clock at render is intended here.
  const yearsInBusiness = new Date().getFullYear() - FOUNDING_YEAR
  // Floor to the nearest 100 so the hero claim never overstates the
  // catalogue — adding SKUs only ever ratchets the number up.
  const skuFloor = Math.max(100, Math.floor(activeSkuCount / 100) * 100)

  if (page) {
    return (
      <div className="mx-auto max-w-[860px] px-8 py-10 pb-20">
        <h1 className="mb-8 text-[32px] font-semibold tracking-tight">{page.title}</h1>
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
    'items'
  )
  const principles = visibleList<{ tag?: string; name?: string; desc?: string }>(values, 'items')

  /*
    Every section, keyed, rendered in `content.order` — the editor's
    arrangement with hidden sections already dropped.
  */
  const sections: Record<string, ReactNode> = {
    hero: (
      /* ── Hero ──────────────────────────────────────────────── */
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-end gap-14 px-5 pt-16 pb-8 sm:px-8 lg:grid-cols-[1.2fr_1fr] xl:px-12">
        <div>
          <div className="text-ih-muted mb-3 font-mono text-[11px] tracking-[0.16em] uppercase">
            {t(str(hero, 'eyebrow'))}
          </div>
          <h1 className="text-[clamp(44px,5.5vw,72px)] leading-[1.02] font-semibold tracking-[-0.035em]">
            {t(str(hero, 'heading'))}
          </h1>
        </div>
        <p className="text-ih-muted max-w-[520px] text-[17px] leading-[1.55]">
          {t(str(hero, 'body'))}
        </p>
      </div>
    ),

    stats:
      statRows.length > 0 ? (
        /* ── Stats strip ───────────────────────────────────────── */
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
          <div className="border-ih-border grid grid-cols-2 border-t border-b sm:grid-cols-4">
            {statRows.map((stat, i) => (
              <div
                key={`${stat.label ?? ''}-${i}`}
                className={`px-6 py-6 ${i < statRows.length - 1 ? 'border-ih-border border-r' : ''}`}
              >
                <div className="font-mono text-[40px] font-medium tracking-[-0.03em]">
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

    story: (
      /* ── Timeline ──────────────────────────────────────────── */
      <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 xl:px-12">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_2fr]">
          <div>
            <div className="text-ih-muted mb-2 font-mono text-[11px] tracking-[0.16em] uppercase">
              {t(str(story, 'eyebrow'))}
            </div>
            <h2 className="mb-4 text-[36px] leading-[1.1] font-semibold tracking-[-0.02em]">
              {t(str(story, 'heading'))}
            </h2>
            <p className="text-ih-muted text-[14px] leading-[1.6]">{t(str(story, 'body'))}</p>
          </div>
          <div>
            {timeline.map((item, i) => (
              <div
                key={`${item.tag ?? ''}-${i}`}
                /* Class, not inline: an inline gridTemplateColumns beats the
                   responsive utilities, so the 80px year column plus body
                   text ran past a 390px viewport. */
                className={`grid grid-cols-[64px_1fr] gap-4 py-5 sm:grid-cols-[80px_1fr] sm:gap-6 ${i < timeline.length - 1 ? 'border-ih-border border-b' : ''}`}
              >
                <span className="text-ih-accent font-mono text-[16px]">{item.tag}</span>
                <div className="min-w-0">
                  <h4 className="mb-1.5 text-[17px] font-semibold">{item.name}</h4>
                  <p className="text-ih-muted text-[14px] leading-[1.55]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    ),

    team:
      people.length > 0 ? (
        /* ── Team ──────────────────────────────────────────────── */
        <section className="border-ih-border border-t py-16">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <div className="text-ih-muted mb-2 font-mono text-[11px] tracking-[0.16em] uppercase">
                  {t(str(team, 'eyebrow'))}
                </div>
                <h2 className="text-[32px] font-semibold tracking-[-0.02em]">
                  {t(str(team, 'heading'))}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {people.map((person, i) => (
                <div
                  key={`${person.name ?? ''}-${i}`}
                  className="border-ih-border bg-ih-surface overflow-hidden border"
                >
                  <div className="bg-ih-surface-2 border-ih-border relative grid aspect-[4/5] place-items-center border-b">
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
                      <div className="bg-ih-navy grid h-20 w-20 place-items-center rounded-full text-[28px] font-semibold text-white">
                        {person.tag}
                      </div>
                    )}
                  </div>
                  <div className="p-4 pb-5">
                    <h4 className="text-[15px] font-semibold">{person.name}</h4>
                    <p className="text-ih-muted mt-1 font-mono text-[11px] tracking-[0.04em]">
                      {person.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null,

    values:
      principles.length > 0 ? (
        /* ── Values ────────────────────────────────────────────── */
        <section className="border-ih-border bg-ih-surface border-t py-16">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
            <div className="text-ih-muted mb-2 font-mono text-[11px] tracking-[0.16em] uppercase">
              {t(str(values, 'eyebrow'))}
            </div>
            <h2 className="mb-10 text-[32px] font-semibold tracking-[-0.02em]">
              {t(str(values, 'heading'))}
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {principles.map((item, i) => (
                <div key={`${item.name ?? ''}-${i}`}>
                  <div className="text-ih-muted mb-4 font-mono text-[32px] font-semibold opacity-30">
                    {item.tag}
                  </div>
                  <h3 className="mb-3 text-[20px] font-semibold tracking-[-0.01em]">{item.name}</h3>
                  <p className="text-ih-muted text-[14px] leading-[1.6]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null,

    cta: (
      /* ── Service areas, then the CTA ───────────────────────── */
      <>
        <ServiceAreaStrip heading="Supplied from Dubai, serviced on site" />
        <section className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-8 px-5 py-16 sm:px-8 md:grid-cols-[1fr_auto] xl:px-12">
          <div>
            <h2 className="mb-2 text-[28px] font-semibold tracking-[-0.02em]">
              {t(str(cta, 'heading'))}
            </h2>
            <p className="text-ih-muted text-[14px]">{t(str(cta, 'body'))}</p>
          </div>
          <div className="flex flex-wrap gap-3 sm:shrink-0">
            {str(cta, 'primary_cta_label') && str(cta, 'primary_cta_href') ? (
              <Link
                href={str(cta, 'primary_cta_href') ?? '/contact'}
                className="bg-ih-accent flex h-11 items-center px-6 text-[14px] font-medium whitespace-nowrap text-white transition-opacity hover:opacity-90"
              >
                {str(cta, 'primary_cta_label')}
              </Link>
            ) : null}
            {str(cta, 'secondary_cta_label') && str(cta, 'secondary_cta_href') ? (
              <Link
                href={str(cta, 'secondary_cta_href') ?? '/contact'}
                className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 flex h-11 items-center border px-5 text-[14px] whitespace-nowrap transition-colors"
              >
                {str(cta, 'secondary_cta_label')}
              </Link>
            ) : null}
          </div>
        </section>
      </>
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
