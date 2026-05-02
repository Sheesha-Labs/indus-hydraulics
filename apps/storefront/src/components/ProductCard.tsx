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

export default function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0]
  const imgUrl = image ? mediaUrl(image.media.storagePath) : null

  return (
    <Link
      href={`/p/${product.sku}`}
      className="group border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden flex flex-col hover:border-[var(--color-body)] transition-colors"
    >
      {/* Image */}
      <div className="aspect-square border-b border-[var(--color-border-2)] bg-[var(--color-deep)] relative overflow-hidden">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={image?.alt ?? image?.media.alt ?? product.title}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div className="font-mono text-[11px] tracking-[0.08em] text-[var(--color-muted)] text-center px-4">
              <div className="text-3xl mb-2 opacity-20">⚙</div>
              {product.sku}
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="font-mono text-[11px] text-[var(--color-muted)]">{product.sku}</div>
        <h3 className="text-[14px] font-medium leading-snug group-hover:text-[var(--color-accent)] transition-colors">
          {product.title}
        </h3>

        {product.specs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.specs.slice(0, 3).map((spec) => (
              <span key={spec.label} className="font-mono text-[10px] px-1.5 py-0.5 border border-[var(--color-border)] text-[var(--color-muted)]">
                {spec.value}{spec.unit ? ` ${spec.unit}` : ''}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-2)] mt-auto gap-2">
          {product.brand && (
            <span className="text-[12px] text-[var(--color-body)] font-medium truncate">{product.brand.name}</span>
          )}
          <div className="flex items-center gap-2 shrink-0">
            <AddToCompareCardButton
              sku={product.sku}
              categoryId={product.categoryId}
              specTemplateId={product.specTemplateId}
            />
            <span className="font-mono text-[11px] text-[var(--color-accent)]">RFQ →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
