import type { ReactNode } from 'react'
import Image from 'next/image'
import type { DesignedPageImage } from '@indus/domain'
import { cn } from '@indus/ui'

/**
 * One photograph on a designed page.
 *
 * Unlike `MarketFigure` there is no empty state: every slot on this page has a
 * real asset, so a placeholder branch would be dead code that quietly hid a
 * broken URL instead of showing one.
 *
 * The prototype rendered each `<img>` at `opacity: 0` and revealed it on load,
 * so an un-sourced image left a blueprint placeholder visible. That is
 * scaffolding for a design review and is deliberately not carried over — here
 * it would mean every image fades in for no reason and a failed load left a
 * permanently blank box.
 *
 * The ratio and the crop position come from the record as a closed union and
 * are mapped to literal class strings below. Tailwind only emits classes it can
 * see in the source, so a computed `aspect-[${ratio}]` compiles to nothing —
 * no error, no warning, just a collapsed box. That failure is why these are
 * lookup tables rather than template literals.
 *
 * RADIUS. The handoff measures 12px on the hero and feature images. There is no
 * 12px step in the v2 ladder (4 · 6 · 10 · 16) and inventing one for a single
 * page is how a ladder stops being a ladder, so these take `rounded-lg` (10px)
 * like every other feature image on the site.
 */

const RATIO_CLASS = {
  '4/3': 'aspect-[4/3]',
  '16/9': 'aspect-[16/9]',
  '16/10': 'aspect-[16/10]',
  '1/1': 'aspect-square',
  '3/4': 'aspect-[3/4]',
} as const

const FOCUS_CLASS = {
  lower: 'object-[center_62%]',
} as const

export default function DesignedFigure({
  image,
  sizes,
  priority = false,
  caption,
  flush = false,
  fill = false,
  className,
  children,
}: {
  image: DesignedPageImage
  sizes: string
  /** Eager-load the hero only; everything else is below the fold. */
  priority?: boolean
  /** Mono uppercase line under the frame. Visible copy, not alt text. */
  caption?: string
  /** Square off the corners for an image sitting flush inside a card. */
  flush?: boolean
  /**
   * From `sm` up, fill the parent's height instead of holding the ratio open.
   *
   * The product-family card puts a fixed-width image column beside a text
   * column whose content sets the card height, so the image has to take that
   * height rather than impose one of its own. Below `sm` the fixed column
   * collapses and the image stacks above the text, where it takes its own ratio
   * back — which is why this is a breakpoint switch on one element rather than
   * two figures behind `hidden`. Two would download the same file twice: a
   * `display: none` ancestor does not stop the fetch.
   */
  fill?: boolean
  className?: string
  /** Furniture drawn over the frame, e.g. the numbered corner badge. */
  children?: ReactNode
}) {
  return (
    <figure className={cn('m-0', fill && 'sm:h-full', className)}>
      <div
        className={cn(
          'relative overflow-hidden bg-ih-surface-2',
          RATIO_CLASS[image.ratio],
          fill && 'sm:aspect-auto sm:h-full sm:min-h-[240px]',
          flush ? 'rounded-none' : 'rounded-lg'
        )}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn('object-cover', image.focus && FOCUS_CLASS[image.focus])}
        />
        {children}
      </div>
      {caption ? (
        <figcaption className="mt-2.5 font-mono text-[10.5px] uppercase leading-[1.5] tracking-[0.07em] text-ih-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
