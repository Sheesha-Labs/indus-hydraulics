import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { buildBreadcrumbLd, buildReplacementCollectionLd } from '@indus/domain'
import { JsonLd, LeadCapturePanel, buildWhatsappHref, buildMailtoHref } from '@indus/ui'
import { mediaUrl } from '../../../../../lib/media'
import { ORG_ID, SITE_NAME, pageMetadata, urlFor } from '../../../../../lib/seo'
import { getReplacementMatches } from '../../../../../lib/replacement-data'
import { getStoreSettings } from '../../../../../lib/store-settings'

type Props = {
  params: Promise<{ brand: string; mpn: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand, mpn } = await params
  const matches = await getReplacementMatches(brand, mpn)
  if (matches.length === 0) return {}
  const first = matches[0]!
  const competitorBrand = first.competitorBrand
  const competitorMpn = first.competitorMpn
  return pageMetadata({
    title: `${competitorBrand} ${competitorMpn} replacement — Indus Hydraulics`,
    description: `Indus Hydraulics replacement for ${competitorBrand} ${competitorMpn}. ${matches.length} verified equivalent${matches.length === 1 ? '' : 's'} from our distributor catalogue, with datasheets and lead times.`,
    path: `/replacement/${brand}/${mpn}`,
  })
}

export default async function ReplacementPage({ params }: Props) {
  const { brand, mpn } = await params
  const [matches, settings] = await Promise.all([getReplacementMatches(brand, mpn), getStoreSettings()])
  if (matches.length === 0) notFound()

  const first = matches[0]!
  const competitorBrand = first.competitorBrand
  const competitorMpn = first.competitorMpn
  const pageUrl = urlFor(`/replacement/${brand}/${mpn}`)

  const collectionLd = buildReplacementCollectionLd({
    competitorBrand,
    competitorMpn,
    pageUrl,
    matches: matches.map((m) => ({
      productUrl: urlFor(`/p/${m.product.slug}`),
      productName: m.product.title,
      imageUrl: m.product.images[0]
        ? mediaUrl(m.product.images[0]!.media.storagePath)
        : null,
      compatibility: m.compatibility,
    })),
    sellerId: ORG_ID,
  })
  const breadcrumbLd = buildBreadcrumbLd({
    items: [
      { name: 'Home', url: urlFor('/') },
      { name: 'Replacements', url: urlFor('/replacement') },
      { name: competitorBrand, url: urlFor(`/replacement/${brand}`) },
      { name: competitorMpn, url: pageUrl },
    ],
  })

  return (
    <div className="mx-auto max-w-[1100px] px-5 sm:px-8 py-8 pb-16">
      <JsonLd data={[collectionLd, breadcrumbLd]} />

      {/* Breadcrumb */}
      <nav className="py-2 font-mono text-[12px] text-ih-muted flex gap-2 items-center flex-wrap mb-6">
        <Link href={`/`} className="hover:text-ih-ink">Home</Link>
        <span className="opacity-40">/</span>
        <Link href={`/replacement`} className="hover:text-ih-ink">Replacements</Link>
        <span className="opacity-40">/</span>
        <Link href={`/replacement/${brand}`} className="hover:text-ih-ink">{competitorBrand}</Link>
        <span className="opacity-40">/</span>
        <span className="text-ih-ink">{competitorMpn}</span>
      </nav>

      <header className="mb-8">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-2">
          {SITE_NAME} replacement
        </p>
        <h1 className="font-serif text-[clamp(28px,4vw,40px)] font-normal tracking-[-0.02em] leading-[1.1] mb-3">
          {SITE_NAME} replacement for {competitorBrand} {competitorMpn}
        </h1>
        <p className="text-[15px] text-ih-muted max-w-[680px] leading-[1.55]">
          {matches.length === 1 ? (
            <>One verified equivalent for <b className="text-ih-ink">{competitorBrand} {competitorMpn}</b> from the {SITE_NAME} catalogue. Datasheet, lead time, and stock are confirmed by our applications team.</>
          ) : (
            <><b className="text-ih-ink">{matches.length}</b> verified equivalents for <b className="text-ih-ink">{competitorBrand} {competitorMpn}</b> from the {SITE_NAME} catalogue. Each has datasheets and lead times confirmed by our applications team.</>
          )}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {matches.map((m) => (
          <Link
            key={m.productId}
            href={`/p/${m.product.slug}`}
            className="group flex gap-4 p-4 border border-ih-border bg-ih-surface hover:border-ih-accent transition-colors"
          >
            <div className="relative w-[120px] h-[120px] shrink-0 bg-ih-surface-2 border border-ih-border">
              {m.product.images[0] ? (
                <Image
                  src={mediaUrl(m.product.images[0]!.media.storagePath)}
                  alt={m.product.images[0]!.media.alt ?? m.product.title}
                  fill
                  className="object-contain p-2"
                  sizes="120px"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center font-mono text-[10px] text-ih-muted">
                  {m.product.sku}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <CompatibilityBadge value={m.compatibility} />
              <div className="font-mono text-[11px] text-ih-muted tracking-[0.04em] mt-2 mb-0.5">
                {m.product.sku}{m.product.brand ? ` · ${m.product.brand.name}` : ''}
              </div>
              <h2 className="text-[15px] font-medium text-ih-ink leading-snug group-hover:text-ih-accent transition-colors line-clamp-2">
                {m.product.title}
              </h2>
              {m.product.descriptionShort && (
                <p className="text-[12px] text-ih-muted mt-2 leading-[1.5] line-clamp-2">
                  {m.product.descriptionShort}
                </p>
              )}
              <span className="font-mono text-[11px] text-ih-accent mt-auto pt-3">
                View product →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <section className="border-t border-ih-border pt-8 mb-10">
        <h3 className="font-semibold text-[16px] mb-2">Browse all {competitorBrand} replacements</h3>
        <p className="text-[13px] text-ih-muted leading-[1.55] mb-4">
          See every {competitorBrand} part we cover, with the matching Indus equivalents.
        </p>
        <Link
          href={`/replacement/${brand}`}
          className="inline-flex h-9 px-4 items-center border border-ih-border bg-ih-surface font-mono text-[12px] text-ih-ink-2 hover:border-ih-ink transition-colors"
        >
          All {competitorBrand} parts →
        </Link>
      </section>

      {/* Pre-baked CTAs with the competitor part number in the email
          subject + WhatsApp opener so the lead lands already scoped. */}
      <LeadCapturePanel
        variant="compact"
        heading={`Quote on ${competitorBrand} ${competitorMpn}`}
        body={`Our applications team can confirm interchangeability, port pattern, mounting and lead time before you commit. Send your part number or a photo of the unit and we'll come back within one business day.`}
        whatsappUrl={buildWhatsappHref(settings.contactPhone, `Enquiry: ${competitorBrand} ${competitorMpn} replacement`)}
        emailUrl={buildMailtoHref(settings.contactEmail, `${competitorBrand} ${competitorMpn} replacement enquiry`)}
        phone={settings.contactPhone}
        quoteLabel="Request a quote"
      />
    </div>
  )
}

function CompatibilityBadge({ value }: { value: 'direct' | 'compatible' | 'superseded_by_us' }) {
  const labels = {
    direct: 'Direct replacement',
    compatible: 'Compatible alternative',
    superseded_by_us: 'Indus replacement',
  } as const
  const styles = {
    direct: 'bg-[oklch(0.94_0.06_145)] text-[oklch(0.4_0.14_145)]',
    compatible: 'bg-[oklch(0.95_0.05_220)] text-[oklch(0.45_0.15_220)]',
    superseded_by_us: 'bg-[oklch(0.96_0.07_85)] text-[oklch(0.45_0.13_75)]',
  } as const
  return (
    <span className={`inline-block self-start px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.04em] ${styles[value]}`}>
      {labels[value]}
    </span>
  )
}
