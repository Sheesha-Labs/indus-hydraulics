import Image from 'next/image'
import Link from 'next/link'
import type { ProductEmbedBlock } from '@indus/domain'
import { mediaUrl } from '../../../lib/media'
import type { EmbeddedProduct } from '../../../lib/blog-article'

/**
 * Inline product cards, resolved by SKU on the server.
 *
 * Unresolved SKUs are skipped, not rendered as dead cards — a discontinued
 * part should leave a gap in an article, never a link to a 404. If every SKU
 * in the block is gone the block renders nothing at all rather than an empty
 * heading with nothing under it.
 *
 * Does not reuse ProductCard: that component requires a fully hydrated product
 * with `specs` and `categoryId`, which would mean selecting far more per
 * article than an inline mention needs.
 */
export default function ProductEmbedBlockView({
  block,
  productsBySku,
}: {
  block: ProductEmbedBlock
  productsBySku: Map<string, EmbeddedProduct>
}) {
  const products = block.skus
    .map((sku) => productsBySku.get(sku))
    .filter((p): p is EmbeddedProduct => Boolean(p))

  if (products.length === 0) return null

  return (
    <section className="my-8">
      <p className="mono mb-3 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
        {block.heading ?? 'Parts in this section'}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {products.map((product) => (
          <Link
            key={product.sku}
            href={`/p/${product.slug}`}
            className="group flex gap-3.5 rounded-lg border border-ih-border bg-ih-surface p-3 transition-colors hover:border-ih-accent"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border border-ih-border bg-ih-surface-2">
              {product.imagePath ? (
                <Image
                  src={mediaUrl(product.imagePath)}
                  alt={product.imageAlt ?? product.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <span className="mono absolute inset-0 grid place-items-center text-[9px] text-ih-muted-2">
                  No image
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="mono mb-0.5 text-[10.5px] text-ih-muted">{product.sku}</p>
              <p className="text-[13.5px] font-medium leading-[1.35] text-ih-ink group-hover:text-ih-accent">
                {product.title}
              </p>
              {product.brandName && (
                <p className="mt-0.5 text-[12px] text-ih-muted">{product.brandName}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
      {block.note && <p className="mt-2.5 text-[13px] leading-[1.55] text-ih-muted">{block.note}</p>}
    </section>
  )
}
