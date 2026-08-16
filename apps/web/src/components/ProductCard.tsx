import Link from 'next/link'
import Image from 'next/image'
import { mediaUrl } from '../lib/media'
import AddToCompareCardButton from './AddToCompareCardButton'

type ProductCardProps = {
  product: {
    id: string
    sku: string
    slug: string
    title: string
    categoryId: string | null
    specTemplateId: string | null
    descriptionShort?: string | null
    brand?: { name: string; slug: string } | null
    images: Array<{
      media: { storagePath: string; alt?: string | null }
      alt?: string | null
    }>
    specs: Array<{ label: string; value: string; unit?: string | null }>
  }
}

/**
 * Design language v2 — `.ih-prod`.
 *
 * 1:1 media, SKU in mono above the title, title at 14px/500, and a meta row
 * pinned to the bottom so cards in a row align on their last line regardless
 * of how long the titles run. Hover takes the border to accent — the card
 * itself is the affordance, so there is no separate "view" action.
 *
 * No price. The catalogue is quote-only and 02-screen-index.md §02 is
 * absolute about it: never render a price field, a cart total, or a checkout
 * affordance. The card previously rendered a ProductPrice that always
 * resolved to "Quote on request", which was a stub for a field that must
 * never populate here.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0]
  const imgUrl = image ? mediaUrl(image.media.storagePath) : null

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-ih-border bg-ih-surface transition-colors focus-within:border-ih-accent hover:border-ih-accent">
      <div className="relative aspect-square border-b border-ih-border bg-ih-surface-2">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={image?.alt ?? image?.media.alt ?? product.title}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center px-4">
            <span className="text-center font-mono text-[10.5px] tracking-[0.02em] text-ih-muted">{product.sku}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-[7px] px-4 pb-4 pt-3.5">
        <div className="font-mono text-[10.5px] tracking-[0.02em] text-ih-muted">{product.sku}</div>

        {/*
          The link wraps only the title but is stretched over the whole card
          with an overlay. That keeps one link per card for assistive tech and
          for crawlers — the accessible name is the product title, not a soup
          of SKU, specs and brand — while the entire card stays clickable.
        */}
        <h3 className="text-[14px] font-medium leading-[1.35] tracking-[-0.01em]">
          <Link href={`/p/${product.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {product.title}
          </Link>
        </h3>

        <div className="mt-auto flex flex-wrap gap-x-2.5 gap-y-1 pt-2 font-mono text-[11px] text-ih-muted">
          {product.brand && <b className="font-medium text-ih-ink-2">{product.brand.name}</b>}
          {product.specs.slice(0, 2).map((spec) => (
            <span key={spec.label}>
              {spec.value}
              {spec.unit ? ` ${spec.unit}` : ''}
            </span>
          ))}
        </div>

        {/*
          Sits above the stretched link so it stays clickable. z-10 rather than
          a nested button, which would be invalid inside the card's link.
        */}
        <div className="relative z-10 mt-3">
          <AddToCompareCardButton
            sku={product.sku}
            categoryId={product.categoryId}
            specTemplateId={product.specTemplateId}
          />
        </div>
      </div>
    </div>
  )
}
