import Image from 'next/image'
import Link from 'next/link'
import { mediaUrl } from '../lib/media'

export type HomeMixProduct = {
  id: string
  slug: string
  title: string
  image: { storagePath: string; alt: string | null }
  category: { slug: string; name: string }
}

/**
 * How many tiles each breakpoint shows, out of the sample. Every tile is in
 * the HTML; narrower screens simply stop earlier, so a phone gets four rows
 * of two rather than twelve. Counts per breakpoint: 8 · 12 · 16 · 18 · 24.
 * Literal class strings because Tailwind only generates classes it finds
 * written out in full.
 */
function visibilityFor(index: number): string {
  if (index >= 18) return 'hidden xl:flex'
  if (index >= 16) return 'hidden lg:flex'
  if (index >= 12) return 'hidden md:flex'
  if (index >= 8) return 'hidden sm:flex'
  return 'flex'
}

/**
 * The home page's product sample — a dense grid of photographed products,
 * one per category, each labelled with that category.
 *
 * Small tiles on purpose: image, category, title, and nothing else. The
 * previous version gave four products a full card each (SKU, brand, a meta
 * row) and drew a placeholder where the photograph should be; this one fits
 * up to twenty-four real photographs — eight to a row on a wide screen —
 * in about the height four used to take with their placeholders.
 *
 * Each tile is one link (the title's stretched link covers the tile), with
 * the category label as its own link layered above it — the same pattern as
 * ProductCard — so the label goes to the category rather than the product.
 */
export default function HomeProductMix({ products }: { products: HomeMixProduct[] }) {
  return (
    <ul className="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {products.map((product, index) => (
        <li key={product.id} className={visibilityFor(index)}>
          <article className="group relative flex w-full flex-col overflow-hidden rounded-lg border border-ih-border bg-ih-surface transition-colors focus-within:border-ih-accent hover:border-ih-accent">
            <div className="relative aspect-square border-b border-ih-border bg-ih-surface">
              <Image
                src={mediaUrl(product.image.storagePath)}
                alt={product.image.alt ?? product.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 17vw, 170px"
                className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5 px-3 pb-3 pt-2.5">
              <Link
                href={`/c/${product.category.slug}`}
                className="relative z-10 self-start truncate font-mono text-[10px] uppercase tracking-[0.08em] text-ih-muted transition-colors hover:text-ih-accent"
              >
                {product.category.name}
              </Link>
              <h3 className="line-clamp-2 text-[13px] font-medium leading-[1.35] tracking-[-0.01em]">
                <Link
                  href={`/p/${product.slug}`}
                  className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                >
                  {product.title}
                </Link>
              </h3>
            </div>
          </article>
        </li>
      ))}
    </ul>
  )
}
