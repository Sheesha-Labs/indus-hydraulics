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
  const data = await getReplacementsForBrand(brand)
  if (!data) return {}
  const { competitorBrand, partNumberCount, series } = data
  const seriesNames = [...new Set(series.map((s) => s.series))]
  return pageMetadata({
    title: `${competitorBrand} cross-reference and replacements`,
    description:
      seriesNames.length > 0
        ? `${partNumberCount} ${competitorBrand} part numbers matched size by size to Indus Hydraulics equivalents, across ${seriesNames.length} series including ${seriesNames.slice(0, 3).join(', ')}.`
        : `${partNumberCount} ${competitorBrand} part${partNumberCount === 1 ? '' : 's'} cross-referenced to Indus Hydraulics equivalents.`,
    path: `/replacement/${brand}`,
  })
}

const COMPATIBILITY_LABEL = {
  direct: 'Direct equivalent',
  compatible: 'Equivalent part — do not intermix',
  superseded_by_us: 'Indus replacement',
} as const

export default async function BrandReplacementsPage({ params }: Props) {
  const { brand } = await params
  const [data, settings] = await Promise.all([getReplacementsForBrand(brand), getStoreSettings()])
  if (!data) notFound()

  const { competitorBrand, series, parts, partNumberCount } = data
  const pageUrl = urlFor(`/replacement/${brand}`)
  const intermix = series.some((s) => s.compatibility === 'compatible')

  const collectionLd = buildCollectionLd({
    name: `${competitorBrand} cross-reference and replacements`,
    description: `${partNumberCount} ${competitorBrand} part numbers cross-referenced to Indus Hydraulics equivalents.`,
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
          Cross-reference
        </p>
        <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal tracking-[-0.02em] leading-[1.1] mb-3">
          {competitorBrand} cross-reference and replacements
        </h1>
        <p className="text-[15px] text-ih-muted max-w-[680px] leading-[1.55]">
          <b className="text-ih-ink">{partNumberCount}</b> {competitorBrand} part number
          {partNumberCount === 1 ? '' : 's'} matched to Indus Hydraulics equivalents
          {series.length > 0 ? ' size by size' : ''}. Find the series below and open the listing:
          its size table prints the {competitorBrand} number beside the Indus part number for every
          size.
        </p>
      </header>

      {series.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif text-[24px] font-normal mb-4">By series</h2>
          <div className="overflow-x-auto border border-ih-border bg-white">
            <table className="w-full min-w-[640px] text-[13px]">
              <thead>
                <tr className="bg-ih-surface-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ih-muted">
                  <th scope="col" className="px-4 py-2.5 text-left font-medium">{competitorBrand} series</th>
                  <th scope="col" className="px-4 py-2.5 text-left font-medium">Indus equivalent</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Sizes</th>
                  <th scope="col" className="px-4 py-2.5 text-left font-medium">Match</th>
                </tr>
              </thead>
              <tbody>
                {series.map((s) => (
                  <tr key={`${s.series}|${s.product.slug}`} className="border-t border-ih-border">
                    <th scope="row" className="px-4 py-2.5 text-left font-mono font-medium text-ih-ink whitespace-nowrap">
                      {s.series}
                    </th>
                    <td className="px-4 py-2.5">
                      <Link href={`/p/${s.product.slug}`} className="text-ih-ink hover:text-ih-accent">
                        {s.product.title}
                      </Link>
                      <span className="ml-2 font-mono text-[11px] text-ih-muted">{s.product.sku}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-ih-ink-2">{s.sizes}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-ih-muted whitespace-nowrap">
                      {COMPATIBILITY_LABEL[s.compatibility]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[12.5px] leading-[1.55] text-ih-muted">
            Series are {competitorBrand} part numbers with the size removed; every listing&rsquo;s size table
            gives the exact {competitorBrand} number for each Indus part number.
            {intermix &&
              ' Tube-fitting equivalents do the same job in the same size, but nuts, ferrules and bodies from two makers must never be mixed in one joint.'}{' '}
            Indus Hydraulics is not affiliated with {competitorBrand}; its part numbers are shown for
            cross-reference only.
          </p>
        </section>
      )}

      {parts.length > 0 && (
        <section className="mb-10">
          {series.length > 0 && <h2 className="font-serif text-[24px] font-normal mb-4">By part number</h2>}
          <div className="border border-ih-border bg-white">
            {parts.map((it, i) => (
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
        </section>
      )}

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
