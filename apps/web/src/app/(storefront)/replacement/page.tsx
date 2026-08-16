import type { Metadata } from 'next'
import Link from 'next/link'
import { buildBreadcrumbLd, buildCollectionLd } from '@indus/domain'
import { JsonLd, LeadCapturePanel, buildWhatsappHref, buildMailtoHref } from '@indus/ui'
import { pageMetadata, urlFor } from '../../../lib/seo'
import { getReplacementBrands } from '../../../lib/replacement-data'
import { getStoreSettings } from '../../../lib/store-settings'

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: 'Replacements & cross-references — Indus Hydraulics',
    description:
      'Find Indus Hydraulics equivalents for Parker, Bosch Rexroth, Eaton, and other major hydraulic-component brands. Cross-references verified by our applications team.',
    path: `/replacement`,
  })
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
    <div className="mx-auto max-w-[1100px] px-5 sm:px-8 py-8 pb-16">
      <JsonLd data={[collectionLd, breadcrumbLd]} />

      <nav className="py-2 font-mono text-[12px] text-ih-muted flex gap-2 items-center mb-6">
        <Link href={`/`} className="hover:text-ih-ink">Home</Link>
        <span className="opacity-40">/</span>
        <span className="text-ih-ink">Replacements</span>
      </nav>

      <header className="mb-8">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-2">
          Replacements &amp; cross-references
        </p>
        <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal tracking-[-0.02em] leading-[1.1] mb-3">
          Find an Indus Hydraulics equivalent
        </h1>
        <p className="text-[15px] text-ih-muted max-w-[640px] leading-[1.55]">
          {totalMpns > 0 ? (
            <>
              <b className="text-ih-ink">{totalMpns}</b> competitor part{totalMpns === 1 ? '' : 's'} cross-referenced to in-stock Indus Hydraulics equivalents across <b className="text-ih-ink">{brands.length}</b> brand{brands.length === 1 ? '' : 's'}. Pick a brand to see the full list, or talk to an engineer if your part is not yet covered.
            </>
          ) : (
            <>Cross-reference data is being added. Talk to an engineer for an immediate equivalent quote.</>
          )}
        </p>
      </header>

      {brands.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
          {brands.map((b) => (
            <Link
              key={b.brandSlug}
              href={`/replacement/${b.brandSlug}`}
              className="group p-4 border border-ih-border bg-ih-surface hover:border-ih-accent transition-colors flex flex-col gap-1"
            >
              <span className="font-mono text-[11px] text-ih-muted tracking-[0.04em]">Brand</span>
              <span className="text-[16px] font-semibold text-ih-ink group-hover:text-ih-accent transition-colors">
                {b.competitorBrand}
              </span>
              <span className="font-mono text-[11px] text-ih-muted mt-auto pt-2">
                {b.mpnCount} MPN{b.mpnCount === 1 ? '' : 's'} covered →
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-16 border border-dashed border-ih-border text-center">
          <p className="text-ih-muted mb-3">No cross-references published yet.</p>
          <Link
            href={`/contact`}
            className="inline-flex h-9 px-4 items-center bg-ih-accent text-white text-[13px] font-medium hover:opacity-90"
          >
            Ask an engineer →
          </Link>
        </div>
      )}

      <LeadCapturePanel
        variant="compact"
        heading="Can't find the brand you're replacing?"
        body="Send us the part number or photo of the unit on the bench. Our applications team confirms interchangeability and lead time within one business day."
        whatsappUrl={buildWhatsappHref(settings.contactPhone, 'Enquiry: replacement part not in catalogue')}
        emailUrl={buildMailtoHref(settings.contactEmail, 'Replacement enquiry')}
        phone={settings.contactPhone}
      />
    </div>
  )
}
