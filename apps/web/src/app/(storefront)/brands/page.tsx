import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumb } from '@indus/ui'
import { db } from '@indus/db'

export const metadata: Metadata = { title: 'Brands' }

// Brand list is admin-curated and changes rarely; cache for 5 minutes.
export const revalidate = 300

export default async function BrandsPage() {
  const brands = await db.brand.findMany({
    where: { isPublished: true },
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-8 pb-16 sm:px-8 xl:px-12">
      <div className="mb-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Brands' }]} />
      </div>

      <p className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
        {brands.length} Authorised partnerships · OEM sourcing
      </p>
      <h1 className="mb-3 font-serif text-[clamp(30px,4vw,40px)] font-normal leading-[1.06] tracking-[-0.01em]">Our brands</h1>
      <p className="mb-8 max-w-[680px] text-[16px] leading-[1.6] text-ih-ink-2">
        Authorised distributor, importer or channel partner for the brands below. We supply genuine parts only — every SKU is OEM-traceable with batch certificates on request.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="group overflow-hidden rounded-lg border border-ih-border bg-ih-surface transition-colors hover:border-ih-accent"
          >
            {/* Brand hero area */}
            <div className="relative grid aspect-[16/7] place-items-center border-b border-ih-border bg-ih-surface-2">
              <span className="font-mono text-[22px] tracking-[-0.02em] text-ih-muted transition-colors group-hover:text-ih-accent">
                {brand.name.toUpperCase()}
              </span>
              {brand.country && (
                <span className="absolute right-2.5 top-2.5 rounded-[3px] bg-ih-steel-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-[oklch(0.42_0.07_240)]">
                  {brand.country}
                </span>
              )}
            </div>
            <div className="p-4">
              {brand.description && (
                <p className="mb-3 line-clamp-2 text-[13px] leading-[1.5] text-ih-muted">
                  {brand.description}
                </p>
              )}
              <div className="flex items-center justify-between font-mono text-[11px] text-ih-muted">
                <span>{brand._count.products} SKUs</span>
                {brand.isAuthorizedDistributor ? (
                  <span className="text-ih-accent">Authorised distributor →</span>
                ) : (
                  <span className="text-ih-accent">View products →</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
