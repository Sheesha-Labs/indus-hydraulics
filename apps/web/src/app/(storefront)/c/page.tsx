import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@indus/db'
import { Breadcrumb, EmptyState, Button } from '@indus/ui'
import { buildBreadcrumbLd, buildCollectionLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import { mediaUrl } from '../../../lib/media'
import { pageMetadata, urlFor } from '../../../lib/seo'

/**
 * Category index.
 *
 * This route used to `redirect()` to whichever category happened to sort
 * first, so /c was a dead URL that the mega menu, the breadcrumb on every
 * PLP, and the sitemap all pointed at. 02-screen-index.md §06 lists
 * `cat-index` as a real surface, distinct from a single category PLP.
 *
 * Counts are computed per request and rolled up the tree (see below). 05
 * §12.7 asks for a cached sku_count and that is the right eventual answer,
 * but at ~1,100 SKUs with an hourly revalidate the cache would buy nothing
 * measurable. Noted rather than silently skipped.
 */

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: 'Product categories — Indus Hydraulics',
    description:
      'The full hydraulic and oilfield catalogue by category — pumps, cylinders, valves, hoses, fittings and consumables, every SKU datasheet-backed.',
    path: '/c',
  })
}

export default async function CategoriesIndexPage() {
  /*
    SKU counts roll UP the tree.

    `_count.products` on a top-level row counts only products pinned directly
    to it, which for this catalogue is almost none — nearly every product
    lives on a leaf. Rendering that number told visitors the catalogue held
    26 SKUs when it holds over a thousand. A wrong number on a public page is
    worse than no number.
  */
  const [roots, allCategories, grouped] = await Promise.all([
    db.category.findMany({
      where: { isPublished: true, parentId: null },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        image: { select: { storagePath: true, alt: true } },
        children: {
          where: { isPublished: true },
          orderBy: { position: 'asc' },
          select: { id: true, name: true, slug: true },
          take: 5,
        },
      },
    }),
    db.category.findMany({ select: { id: true, parentId: true } }),
    db.product.groupBy({
      by: ['categoryId'],
      where: { status: 'active', categoryId: { not: null } },
      _count: { _all: true },
    }),
  ])

  const parentOf = new Map(allCategories.map((c) => [c.id, c.parentId]))
  const directCount = new Map(grouped.map((g) => [g.categoryId as string, g._count._all]))

  // Walk each category's ancestry once and credit every ancestor. Cheap at
  // this size, and it does not care how deep the tree goes.
  const rollup = new Map<string, number>()
  for (const [categoryId, count] of directCount) {
    let cursor: string | null | undefined = categoryId
    const seen = new Set<string>()
    while (cursor && !seen.has(cursor)) {
      seen.add(cursor)
      rollup.set(cursor, (rollup.get(cursor) ?? 0) + count)
      cursor = parentOf.get(cursor) ?? null
    }
  }

  const categories = roots.map((c) => ({ ...c, skuCount: rollup.get(c.id) ?? 0 }))
  const totalSkus = [...directCount.values()].reduce((a, b) => a + b, 0)
  const pageUrl = urlFor('/c')

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 xl:px-12">
      <JsonLd
        data={[
          buildCollectionLd({
            name: 'Product categories',
            description: 'The full Indus Hydraulics catalogue, by category.',
            url: pageUrl,
          }),
          buildBreadcrumbLd({
            items: [
              { name: 'Home', url: urlFor('/') },
              { name: 'Categories', url: pageUrl },
            ],
          }),
        ]}
      />

      <div className="border-b border-ih-border py-4">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Categories' }]} />
      </div>

      <header className="border-b border-ih-border py-10">
        <p className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
          Catalogue · {categories.length} groups
        </p>
        <h1 className="mb-3 max-w-[18ch] text-balance font-serif text-[clamp(30px,4vw,40px)] font-normal leading-[1.06] tracking-[-0.01em]">
          The full catalogue, organised the way engineers think.
        </h1>
        <p className="max-w-[640px] text-[16px] leading-[1.6] text-ih-ink-2">
          {totalSkus.toLocaleString()} SKUs across {categories.length} groups. Every listing carries a datasheet, and
          anything not stocked can be cross-referenced from an obsolete code.
        </p>
      </header>

      {categories.length === 0 ? (
        <div className="mt-8 rounded-lg border border-ih-border bg-ih-surface">
          <EmptyState
            condition="Nothing published yet"
            message="The catalogue is being loaded. Tell us what you need and an engineer will source it."
            action={
              <Button asChild kind="primary">
                <Link href="/quote/submit">Request a quote</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((cat) => {
            const img = cat.image ? mediaUrl(cat.image.storagePath) : null
            return (
              <div
                key={cat.id}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-ih-border bg-ih-surface transition-colors hover:border-ih-accent"
              >
                <div className="relative aspect-[16/9] border-b border-ih-border bg-ih-surface-2">
                  {img ? (
                    <Image
                      src={img}
                      alt={cat.image?.alt ?? ''}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center font-mono text-[10.5px] uppercase tracking-[0.1em] text-ih-muted-2">
                      {cat.name}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-[17px] font-medium tracking-[-0.01em]">
                    {/* One link per card, stretched over the whole tile — the
                        accessible name is the category, not the child list. */}
                    <Link href={`/c/${cat.slug}`} className="after:absolute after:inset-0 after:content-['']">
                      {cat.name}
                    </Link>
                  </h2>

                  {cat.shortDescription && (
                    <p className="mt-2 line-clamp-2 text-[13px] leading-[1.55] text-ih-muted">{cat.shortDescription}</p>
                  )}

                  {cat.children.length > 0 && (
                    <ul className="relative z-10 mt-3.5 flex flex-wrap gap-x-3 gap-y-1.5">
                      {cat.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/c/${child.slug}`}
                            className="text-[12.5px] text-ih-ink-2 underline-offset-2 hover:text-ih-accent hover:underline"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-auto pt-4 font-mono text-[11px] tabular-nums text-ih-muted">
                    {cat.skuCount.toLocaleString()} SKU{cat.skuCount === 1 ? '' : 's'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
