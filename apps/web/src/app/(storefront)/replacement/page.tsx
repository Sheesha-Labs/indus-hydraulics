import type { Metadata } from 'next'
import Link from 'next/link'
import { buildBreadcrumbLd, buildCollectionLd, enquiryMailto } from '@indus/domain'
import { JsonLd, LeadCapturePanel, buildWhatsappHref } from '@indus/ui'
import { pageMetadata, urlFor } from '../../../lib/seo'
import { getReplacementBrands } from '../../../lib/replacement-data'
import { getStoreSettings } from '../../../lib/store-settings'

export async function generateMetadata(): Promise<Metadata> {
  /*
    Noindex until there is data.

    `product_cross_references` is EMPTY, so this page ships a heading, a promise
    of "cross-references verified by our applications team", and then "No
    cross-references published yet." An indexed page that answers nothing is a
    thin-content signal working against the rest of the SEO effort, and it is
    the first impression for anyone who searches a competitor part number.

    The route stays live and reachable — the "ask an engineer" path on it is
    genuinely useful. Only indexing is switched off.

    REMOVE THIS as soon as rows exist. The count below is the switch: it flips
    back to indexable on its own, so nobody has to remember.
  */
  const brands = await getReplacementBrands()
  const hasData = brands.length > 0

  return {
    ...pageMetadata({
      title: 'Replacements & cross-references',
      description:
        'Find Indus Hydraulics equivalents for Parker, Bosch Rexroth, Eaton, and other major hydraulic-component brands. Cross-references verified by our applications team.',
      path: `/replacement`,
    }),
    ...(hasData ? {} : { robots: { index: false, follow: true } }),
  }
}

export default async function ReplacementIndexPage() {
  const [brands, settings] = await Promise.all([getReplacementBrands(), getStoreSettings()])
  const pageUrl = urlFor('/replacement')
  const totalMpns = brands.reduce((sum, b) => sum + b.mpnCount, 0)

  const collectionLd = buildCollectionLd({
    name: 'Replacements & cross-references',
    description:
      'Indus Hydraulics replacement equivalents across all major hydraulic-component brands.',
    url: pageUrl,
  })
  const breadcrumbLd = buildBreadcrumbLd({
    items: [
      { name: 'Home', url: urlFor('/') },
      { name: 'Replacements', url: pageUrl },
    ],
  })

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-8 pb-16 sm:px-8">
      <JsonLd data={[collectionLd, breadcrumbLd]} />

      <nav className="text-ih-muted mb-6 flex items-center gap-2 py-2 font-mono text-[12px]">
        <Link href={`/`} className="hover:text-ih-ink">
          Home
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-ih-ink">Replacements</span>
      </nav>

      <header className="mb-8">
        <p className="text-ih-muted mb-2 font-mono text-[10.5px] font-medium tracking-[0.13em] uppercase">
          Replacements &amp; cross-references
        </p>
        <h1 className="mb-3 font-serif text-[clamp(28px,4vw,40px)] leading-[1.1] font-normal tracking-[-0.02em]">
          Find an Indus Hydraulics equivalent
        </h1>
        <p className="text-ih-muted max-w-[640px] text-[15px] leading-[1.55]">
          {totalMpns > 0 ? (
            <>
              <b className="text-ih-ink">{totalMpns}</b> competitor part{totalMpns === 1 ? '' : 's'}{' '}
              cross-referenced to in-stock Indus Hydraulics equivalents across{' '}
              <b className="text-ih-ink">{brands.length}</b> brand{brands.length === 1 ? '' : 's'}.
              Pick a brand to see the full list, or talk to an engineer if your part is not yet
              covered.
            </>
          ) : (
            <>
              Cross-reference data is being added. Talk to an engineer for an immediate equivalent
              quote.
            </>
          )}
        </p>
      </header>

      {brands.length > 0 ? (
        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((b) => (
            <Link
              key={b.brandSlug}
              href={`/replacement/${b.brandSlug}`}
              className="group border-ih-border bg-ih-surface hover:border-ih-accent flex flex-col gap-1 border p-4 transition-colors"
            >
              <span className="text-ih-muted font-mono text-[11px] tracking-[0.04em]">Brand</span>
              <span className="text-ih-ink group-hover:text-ih-accent text-[16px] font-semibold transition-colors">
                {b.competitorBrand}
              </span>
              <span className="text-ih-muted mt-auto pt-2 font-mono text-[11px]">
                {b.mpnCount} MPN{b.mpnCount === 1 ? '' : 's'} covered →
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="border-ih-border border border-dashed py-16 text-center">
          <p className="text-ih-muted mb-3">No cross-references published yet.</p>
          <Link
            href={`/contact`}
            className="bg-ih-accent inline-flex h-9 items-center px-4 text-[13px] font-medium text-white hover:opacity-90"
          >
            Ask an engineer →
          </Link>
        </div>
      )}

      <LeadCapturePanel
        variant="compact"
        heading="Can't find the brand you're replacing?"
        body="Send us the part number or photo of the unit on the bench. Our applications team confirms interchangeability and lead time within one business day."
        whatsappUrl={buildWhatsappHref(
          settings.contactPhone,
          'Enquiry: replacement part not in catalogue'
        )}
        emailUrl={enquiryMailto({ subject: 'Replacement enquiry' })}
        phone={settings.contactPhone}
      />
    </div>
  )
}
