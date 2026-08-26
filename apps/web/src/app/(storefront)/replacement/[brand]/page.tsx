import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { buildBreadcrumbLd, buildCollectionLd } from '@indus/domain'
import { JsonLd, LeadCapturePanel, buildWhatsappHref, buildMailtoHref } from '@indus/ui'
import { pageMetadata, urlFor } from '../../../../lib/seo'
import { getReplacementBrands, getReplacementsForBrand } from '../../../../lib/replacement-data'
import { getStoreSettings } from '../../../../lib/store-settings'

type Props = {
  params: Promise<{ brand: string }>
}

/**
 * A deliberately tiny prerender list — the brands with the most cross-references.
 *
 * The size is not the point; the function EXISTING is. A dynamic route with no
 * `generateStaticParams` is served fully dynamically and `no-store` however
 * statically renderable its code is, which is what this route was doing on
 * every request. With a list, the route switches to the incremental cache and
 * `dynamicParams` renders every unlisted entry on first request and caches it
 * from then on. See the long note on `/p/[slug]`.
 *
 * Length is paid in build minutes, so it stays small — see PR #412, where
 * oversized lists took the production build from 5 minutes to 16.
 */
const STATIC_REPLACEMENT_BRAND_LIMIT = 3

export async function generateStaticParams() {
  const brands = await getReplacementBrands()
  return brands
    .slice(0, STATIC_REPLACEMENT_BRAND_LIMIT)
    .map(({ brandSlug }) => ({ brand: brandSlug }))
}

export const dynamicParams = true

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params
  const items = await getReplacementsForBrand(brand)
  if (items.length === 0) return {}
  const competitorBrand = items[0]!.competitorBrand
  return pageMetadata({
    title: `${competitorBrand} replacements — Indus Hydraulics`,
    description: `${items.length} ${competitorBrand} part${items.length === 1 ? '' : 's'} cross-referenced to in-stock Indus Hydraulics equivalents. Verified by our applications team.`,
    path: `/replacement/${brand}`,
  })
}

export default async function BrandReplacementsPage({ params }: Props) {
  const { brand } = await params
  const [items, settings] = await Promise.all([
    getReplacementsForBrand(brand),
    getStoreSettings(),
  ])
  if (items.length === 0) notFound()

  const competitorBrand = items[0]!.competitorBrand
  const pageUrl = urlFor(`/replacement/${brand}`)

  const collectionLd = buildCollectionLd({
    name: `${competitorBrand} replacements`,
    description: `${items.length} ${competitorBrand} part${items.length === 1 ? '' : 's'} we cross-reference to Indus Hydraulics equivalents.`,
    url: pageUrl,
  })
  const breadcrumbLd = buildBreadcrumbLd({
    items: [
      { name: 'Home', url: urlFor('/') },
      { name: 'Replacements', url: urlFor('/replacement') },
      { name: competitorBrand, url: pageUrl },
    ],
  })

  return (
    <div className="mx-auto max-w-[1100px] px-5 sm:px-8 py-8 pb-16">
      <JsonLd data={[collectionLd, breadcrumbLd]} />

      <nav className="py-2 font-mono text-[12px] text-ih-muted flex gap-2 items-center mb-6">
        <Link href={`/`} className="hover:text-ih-ink">Home</Link>
        <span className="opacity-40">/</span>
        <Link href={`/replacement`} className="hover:text-ih-ink">Replacements</Link>
        <span className="opacity-40">/</span>
        <span className="text-ih-ink">{competitorBrand}</span>
      </nav>

      <header className="mb-8">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-2">
          Replacement catalogue
        </p>
        <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal tracking-[-0.02em] leading-[1.1] mb-3">
          {competitorBrand} replacements
        </h1>
        <p className="text-[15px] text-ih-muted max-w-[640px] leading-[1.55]">
          <b className="text-ih-ink">{items.length}</b> {competitorBrand} part{items.length === 1 ? '' : 's'} we cross-reference to in-stock Indus Hydraulics equivalents. Each has datasheets and lead times confirmed by our applications team.
        </p>
      </header>

      <div className="border border-ih-border bg-white">
        {items.map((it, i) => (
          <Link
            key={`${it.brandSlug}/${it.mpnSlug}`}
            href={`/replacement/${it.brandSlug}/${it.mpnSlug}`}
            className={`grid grid-cols-[1fr_auto_120px] gap-4 px-4 py-3 items-center hover:bg-ih-surface-2 transition-colors ${
              i > 0 ? 'border-t border-ih-border' : ''
            }`}
          >
            <div>
              <div className="font-mono text-[11px] text-ih-muted tracking-[0.04em]">{competitorBrand}</div>
              <div className="text-[14px] font-medium text-ih-ink">{it.competitorMpn}</div>
            </div>
            <span className="font-mono text-[11px] text-ih-muted">
              {it.matchCount} match{it.matchCount === 1 ? '' : 'es'}
            </span>
            <span className="font-mono text-[11px] text-ih-accent text-right">View →</span>
          </Link>
        ))}
      </div>

      {/* CTA scoped to the brand so the lead lands already framed. */}
      <div className="mt-10">
        <LeadCapturePanel
          variant="compact"
          heading={`Don't see your ${competitorBrand} part?`}
          body={`We carry over a thousand SKUs that aren't all in the cross-reference table yet. Send us the part number and our applications team will confirm interchangeability and lead time within one business day.`}
          whatsappUrl={buildWhatsappHref(settings.contactPhone, `Enquiry: ${competitorBrand} part not in cross-reference`)}
          emailUrl={buildMailtoHref(settings.contactEmail, `${competitorBrand} replacement enquiry`)}
          phone={settings.contactPhone}
        />
      </div>
    </div>
  )
}
