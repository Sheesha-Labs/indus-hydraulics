import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { buildBreadcrumbLd, buildCollectionLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import { pageMetadata, urlFor } from '../../../lib/seo'
import { getReplacementsForBrand } from '../../../lib/replacement-data'

type Props = {
  params: Promise<{ brand: string }>
}

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
  const items = await getReplacementsForBrand(brand)
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
    <div className="max-w-[1100px] mx-auto px-8 py-8 pb-16">
      <JsonLd data={[collectionLd, breadcrumbLd]} />

      <nav className="py-2 font-mono text-[12px] text-[var(--color-muted)] flex gap-2 items-center mb-6">
        <Link href={`/`} className="hover:text-[var(--color-primary)]">Home</Link>
        <span className="opacity-40">/</span>
        <Link href={`/replacement`} className="hover:text-[var(--color-primary)]">Replacements</Link>
        <span className="opacity-40">/</span>
        <span className="text-[var(--color-primary)]">{competitorBrand}</span>
      </nav>

      <header className="mb-8">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-muted)] mb-2">
          Replacement catalogue
        </p>
        <h1 className="text-[clamp(28px,4vw,40px)] font-semibold tracking-[-0.02em] leading-[1.1] mb-3">
          {competitorBrand} replacements
        </h1>
        <p className="text-[15px] text-[var(--color-muted)] max-w-[640px] leading-[1.55]">
          <b className="text-[var(--color-primary)]">{items.length}</b> {competitorBrand} part{items.length === 1 ? '' : 's'} we cross-reference to in-stock Indus Hydraulics equivalents. Each has datasheets and lead times confirmed by our applications team.
        </p>
      </header>

      <div className="border border-[var(--color-border)] bg-white">
        {items.map((it, i) => (
          <Link
            key={`${it.brandSlug}/${it.mpnSlug}`}
            href={`/replacement/${it.brandSlug}/${it.mpnSlug}`}
            className={`grid grid-cols-[1fr_auto_120px] gap-4 px-4 py-3 items-center hover:bg-[var(--color-deep)] transition-colors ${
              i > 0 ? 'border-t border-[var(--color-border)]' : ''
            }`}
          >
            <div>
              <div className="font-mono text-[11px] text-[var(--color-muted)] tracking-[0.04em]">{competitorBrand}</div>
              <div className="text-[14px] font-medium text-[var(--color-primary)]">{it.competitorMpn}</div>
            </div>
            <span className="font-mono text-[11px] text-[var(--color-muted)]">
              {it.matchCount} match{it.matchCount === 1 ? '' : 'es'}
            </span>
            <span className="font-mono text-[11px] text-[var(--color-accent)] text-right">View →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
