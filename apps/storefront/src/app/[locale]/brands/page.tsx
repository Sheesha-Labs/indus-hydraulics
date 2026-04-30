import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import { getTranslations } from 'next-intl/server'

type Props = { params: Promise<{ locale: string }> }

export const metadata: Metadata = { title: 'Brands' }

export default async function BrandsPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'brands' })

  const brands = await db.brand.findMany({
    where: { isPublished: true },
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })

  return (
    <div className="max-w-[1360px] mx-auto px-8 py-8 pb-16">
      <nav className="font-mono text-[12px] text-[var(--color-muted)] flex gap-2 items-center mb-6">
        <Link href={`/${locale}`} className="hover:text-[var(--color-primary)]">Home</Link>
        <span className="opacity-40">/</span>
        <span className="text-[var(--color-primary)]">Brands</span>
      </nav>

      <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-muted)] mb-1">
        {brands.length} Authorised partnerships · OEM sourcing
      </p>
      <h1 className="text-[42px] font-semibold tracking-[-0.02em] mb-3">{t('title')}</h1>
      <p className="text-[var(--color-muted)] max-w-[680px] mb-8 leading-[1.55]">
        Authorised distributor, importer or channel partner for the brands below. We supply genuine parts only — every SKU is OEM-traceable with batch certificates on request.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/${locale}/brands/${brand.slug}`}
            className="group border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden hover:border-[var(--color-body)] transition-colors"
          >
            {/* Brand hero area */}
            <div className="aspect-[16/7] bg-gradient-to-br from-[var(--color-deep)] to-[var(--color-elevated)] border-b border-[var(--color-border)] grid place-items-center relative">
              <span className="font-mono text-[24px] font-bold tracking-[-0.02em] text-[var(--color-muted)] group-hover:text-[var(--color-primary)] transition-colors">
                {brand.name.toUpperCase()}
              </span>
              {brand.country && (
                <span className="absolute top-2.5 right-2.5 font-mono text-[10px] bg-[var(--color-elevated)] border border-[var(--color-border)] px-2 py-0.5 text-[var(--color-muted)] uppercase">
                  {brand.country}
                </span>
              )}
            </div>
            <div className="p-4">
              {brand.description && (
                <p className="text-[13px] text-[var(--color-muted)] mb-3 line-clamp-2 leading-[1.5]">
                  {brand.description}
                </p>
              )}
              <div className="flex justify-between items-center font-mono text-[11px] text-[var(--color-muted)]">
                <span>{brand._count.products} SKUs</span>
                {brand.isAuthorizedDistributor ? (
                  <span className="text-[var(--color-accent)]">{t('authorizedDistributor')} →</span>
                ) : (
                  <span className="text-[var(--color-accent)]">{t('viewProducts')} →</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
