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
 * These cards are now the only place an article lists its parts — the old
 * "Parts in this article" side panel repeated them — so every one stays a
 * real link into /p/.
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
    <section aria-label={block.heading ?? 'Parts in this section'} className="min-w-0">
      {block.heading && <h3 className="mb-3.5 text-[15px] font-semibold text-ih-ink">{block.heading}</h3>}
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 min-[901px]:grid-cols-4">
        {products.map((product) => (
          <li key={product.sku} className="min-w-0">
            <Link
              href={`/p/${product.slug}`}
              className="group flex h-full flex-col gap-1 rounded-lg border border-ih-border bg-ih-surface px-2.5 pb-3.5 pt-2.5 transition-colors duration-150 hover:border-ih-accent motion-reduce:transition-none"
            >
              <span className="relative mb-2 block aspect-square overflow-hidden rounded-md bg-ih-surface-3">
                {product.imagePath ? (
                  <Image
                    src={mediaUrl(product.imagePath)}
                    alt={product.imageAlt ?? product.title}
                    fill
                    sizes="(max-width: 900px) calc((100vw - 52px) / 2), 240px"
                    className="object-cover"
                  />
                ) : null}
              </span>
              <span className="font-mono text-[10.5px] text-ih-accent">{product.sku}</span>
              <span className="text-[13.5px] font-medium leading-[1.35] text-ih-ink group-hover:text-ih-accent">
                {product.title}
              </span>
              {product.brandName && (
                <span className="mt-auto pt-1 text-[12px] text-ih-muted">{product.brandName}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
      {block.note && <p className="mt-3.5 text-[14.5px] leading-[1.65] text-ih-ink-2">{block.note}</p>}
    </section>
  )
}
