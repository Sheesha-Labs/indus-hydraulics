import type { Metadata } from 'next'
import Link from 'next/link'
import { buildBreadcrumbLd, buildCollectionLd } from '@indus/domain'
import { JsonLd, LeadCapturePanel, buildWhatsappHref, buildMailtoHref } from '@indus/ui'
import { pageMetadata, urlFor } from '../../lib/seo'
import { getReplacementBrands } from '../../lib/replacement-data'
import { getStoreSettings } from '../../lib/store-settings'

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
    <div className="max-w-[1100px] mx-auto px-8 py-8 pb-16">
      <JsonLd data={[collectionLd, breadcrumbLd]} />

      <nav className="py-2 font-mono text-[12px] text-[var(--color-muted)] flex gap-2 items-center mb-6">
        <Link href={`/`} className="hover:text-[var(--color-primary)]">Home</Link>
        <span className="opacity-40">/</span>
        <span className="text-[var(--color-primary)]">Replacements</span>
      </nav>

      <header className="mb-8">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-muted)] mb-2">
          Replacements &amp; cross-references
        </p>
        <h1 className="text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.02em] leading-[1.1] mb-3">
          Find an Indus Hydraulics equivalent
        </h1>
        <p className="text-[15px] text-[var(--color-muted)] max-w-[640px] leading-[1.55]">
          {totalMpns > 0 ? (
            <>
              <b className="text-[var(--color-primary)]">{totalMpns}</b> competitor part{totalMpns === 1 ? '' : 's'} cross-referenced to in-stock Indus Hydraulics equivalents across <b className="text-[var(--color-primary)]">{brands.length}</b> brand{brands.length === 1 ? '' : 's'}. Pick a brand to see the full list, or talk to an engineer if your part is not yet covered.
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
              className="group p-4 border border-[var(--color-border)] bg-[var(--color-elevated)] hover:border-[var(--color-body)] transition-colors flex flex-col gap-1"
            >
              <span className="font-mono text-[11px] text-[var(--color-muted)] tracking-[0.04em]">Brand</span>
              <span className="text-[16px] font-semibold text-[var(--color-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                {b.competitorBrand}
              </span>
              <span className="font-mono text-[11px] text-[var(--color-muted)] mt-auto pt-2">
                {b.mpnCount} MPN{b.mpnCount === 1 ? '' : 's'} covered →
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-16 border border-dashed border-[var(--color-border)] text-center">
          <p className="text-[var(--color-muted)] mb-3">No cross-references published yet.</p>
          <Link
            href={`/contact`}
            className="inline-flex h-9 px-4 items-center bg-[var(--color-accent)] text-white text-[13px] font-medium hover:opacity-90"
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
