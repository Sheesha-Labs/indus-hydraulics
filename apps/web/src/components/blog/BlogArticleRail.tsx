import Image from 'next/image'
import Link from 'next/link'
import { mediaUrl } from '../../lib/media'
import type { EmbeddedProduct } from '../../lib/blog-article'

type Props = {
  products: EmbeddedProduct[]
  quoteHref?: string
}

/**
 * Sticky right rail — "Parts in this article", then a quote prompt.
 *
 * The design handoff specifies exactly this
 * (design_handoff_indus_hydraulics_v2/design-source/site-editorial.jsx:160-171),
 * and it is the mechanism that makes editorial pay: a reader who has just
 * understood which hose grade they need can see the parts without scrolling
 * back through the article to find the inline embed.
 *
 * The list is every product referenced anywhere in the body, de-duplicated
 * upstream — not a separate curated field, so it cannot fall out of step with
 * what the article actually mentions.
 */
export default function BlogArticleRail({ products, quoteHref = '/quote' }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {products.length > 0 && (
        <div>
          <p className="mono mb-3 border-b border-ih-border pb-3 text-[10.5px] uppercase tracking-[0.12em] text-ih-muted-2">
            Parts in this article
          </p>
          <ul className="flex list-none flex-col gap-2.5 p-0">
            {products.map((product) => (
              <li key={product.sku}>
                <Link
                  href={`/p/${product.slug}`}
                  className="group flex gap-2.5 rounded-md border border-ih-border bg-ih-surface p-2 transition-colors hover:border-ih-accent"
                >
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-sm border border-ih-border bg-ih-surface-2">
                    {product.imagePath ? (
                      <Image
                        src={mediaUrl(product.imagePath)}
                        alt={product.imageAlt ?? product.title}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="mono text-[10px] text-ih-muted">{product.sku}</p>
                    <p className="line-clamp-2 text-[12px] font-medium leading-[1.3] text-ih-ink group-hover:text-ih-accent">
                      {product.title}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-ih-border bg-ih-surface-2 p-4">
        <p className="mb-1.5 text-[14px] font-semibold text-ih-ink">Need these specified?</p>
        <p className="mb-3 text-[12.5px] leading-[1.5] text-ih-muted">
          Send the part numbers or a photo. Our applications engineers reply with availability and
          a written estimate.
        </p>
        <Link
          href={quoteHref}
          className="mono inline-flex h-9 items-center rounded-md bg-ih-accent px-4 text-[11.5px] uppercase tracking-[0.08em] text-ih-accent-fg transition-opacity hover:opacity-90"
        >
          {products.length > 0 ? 'Quote these parts' : 'Request a quote'}
        </Link>
      </div>
    </div>
  )
}
