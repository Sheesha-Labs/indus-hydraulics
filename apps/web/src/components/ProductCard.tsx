import Link from 'next/link'
import Image from 'next/image'
import { mediaUrl } from '../lib/media'
import ProductEnquiryLink from './ProductEnquiryLink'

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
  /**
   * Shown when the product has no photograph of its own: the root category's
   * studio shot, muted and tagged so it never passes for a photo of this part.
   */
  fallbackImage?: { src: string; categoryName: string } | null
  /**
   * The part the "Inquire" email names — `url` is the absolute product page
   * URL. The link itself is built by `ProductEnquiryLink`
   * (`lib/enquiry-links.ts#productEnquiryHref`). Omitted ⇒ no button.
   */
  inquire?: { sku: string; title: string; url: string } | null
}

/**
 * Design language v2 — `.ih-prod`.
 *
 * 1:1 media, title at 14px/500, and a meta row pinned to the bottom so cards
 * in a row align on their last line regardless of how long the titles run.
 * The part number is not printed on the card (owner call, 2026-11-19 — the
 * title needs the room on a two-up phone grid); it is on the product page. Hover takes the border to accent — the card
 * itself is the affordance, so there is no separate "view" action.
 *
 * No price. The catalogue is quote-only and 02-screen-index.md §02 is
 * absolute about it: never render a price field, a cart total, or a checkout
 * affordance. The card previously rendered a ProductPrice that always
 * resolved to "Quote on request", which was a stub for a field that must
 * never populate here.
 */
export default function ProductCard({ product, fallbackImage, inquire }: ProductCardProps) {
  const image = product.images[0]
  const imgUrl = image ? mediaUrl(image.media.storagePath) : null

  return (
    <div className="group border-ih-border bg-ih-surface focus-within:border-ih-accent hover:border-ih-accent relative flex flex-col overflow-hidden rounded-lg border transition-colors">
      <div className="border-ih-border bg-ih-surface-2 relative aspect-square border-b">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={image?.alt ?? image?.media.alt ?? product.title}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : fallbackImage ? (
          <CategoryFallbackImage
            src={fallbackImage.src}
            categoryName={fallbackImage.categoryName}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center px-4">
            <span className="text-ih-muted text-center font-mono text-[10.5px] tracking-[0.02em]">
              {product.sku}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-[7px] px-4 pt-3.5 pb-4">
        {/*
          The link wraps only the title but is stretched over the whole card
          with an overlay. That keeps one link per card for assistive tech and
          for crawlers — the accessible name is the product title, not a soup
          of SKU, specs and brand — while the entire card stays clickable.
        */}
        <h3 className="text-[14px] leading-[1.35] font-medium tracking-[-0.01em]">
          <Link
            href={`/p/${product.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {product.title}
          </Link>
        </h3>

        <div className="text-ih-muted mt-auto flex flex-wrap gap-x-2.5 gap-y-1 pt-2 text-[12px]">
          {product.brand && <b className="text-ih-ink-2 font-medium">{product.brand.name}</b>}
          {product.specs.slice(0, 2).map((spec) => (
            <span key={spec.label}>
              {spec.value}
              {spec.unit ? ` ${spec.unit}` : ''}
            </span>
          ))}
        </div>

        {/*
          "Inquire" replaced "Compare" (owner call, 2026-11-19): the card's one
          action is now the enquiry itself. It sits above the stretched title
          link (z-10) so it stays clickable without nesting a link in a link.
        */}
        {inquire ? (
          <ProductEnquiryLink
            product={inquire}
            className="border-ih-border-strong text-ih-ink hover:border-ih-accent hover:text-ih-accent relative z-10 mt-3 inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border text-[13px] font-medium transition-colors"
          >
            Inquire
          </ProductEnquiryLink>
        ) : null}
      </div>
    </div>
  )
}

/**
 * The no-photo state for a product tile: the category's studio shot, faded
 * toward the surface colour, with a small mono tag naming it as a category
 * image. Shared with the industry page's inline product tiles.
 */
export function CategoryFallbackImage({
  src,
  categoryName,
  showTag = true,
  sizes = '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw',
}: {
  src: string
  categoryName: string
  /** Off on thumbnails too small to carry the label (search results). */
  showTag?: boolean
  sizes?: string
}) {
  return (
    <>
      <Image
        src={mediaUrl(src)}
        alt=""
        fill
        className="object-cover opacity-45 grayscale-[35%]"
        sizes={sizes}
      />
      {showTag && (
        <span className="border-ih-border bg-ih-surface text-ih-muted absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-[3px] border px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.08em] uppercase">
          Category image · {categoryName}
        </span>
      )}
    </>
  )
}
