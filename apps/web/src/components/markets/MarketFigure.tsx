import Image from 'next/image'
import { cn } from '@indus/ui'

/**
 * One image slot on a market page.
 *
 * There are 28 of them and most have no photograph yet, so the empty state is
 * the state that matters. It follows the pattern already shipping on `/c`: the
 * aspect ratio is held open, the box fills with `surface-2`, and a mono label
 * names the subject. Nothing shifts when the photograph arrives — the layout
 * has already reserved the space, which is the whole reason the ratio is a
 * prop rather than something the image supplies.
 *
 * WHAT TO PUT IN `alt`, when a photograph does land:
 *
 *   - Describe the equipment and what it is doing. "Four-spiral hydraulic hose
 *     assembly with crimped JIC fittings" beats "hydraulic hose".
 *   - Do NOT put the market name in it. One photograph serves all 126 market
 *     pages; alt text claiming a Dubai warehouse shot was taken in Nigeria is
 *     both wrong and trivially detectable.
 *   - Repetition is worse than silence. Where two slots end up with near
 *     identical shots, give the second `alt=""`.
 *
 * `label` is the placeholder caption, not alt text — it names the subject for
 * a reader looking at an empty box, and disappears the moment `src` exists.
 */
export default function MarketFigure({
  src,
  alt,
  label,
  ratio,
  sizes,
  priority = false,
  className,
}: {
  src: string | null
  /** Required whenever `src` is set. Empty string marks a decorative repeat. */
  alt?: string
  label: string
  /**
   * The utility that gives the box its height before an image exists —
   * `aspect-[4/3]` where the slot is a ratio, `h-[152px]` where the design
   * pins a letterbox strip. Either way the space is reserved, so dropping a
   * photograph in later is a swap and not a re-layout.
   */
  ratio: string
  sizes: string
  /** Eager-load only the four operations shots; everything else is below fold. */
  priority?: boolean
  className?: string
}) {
  return (
    <div className={cn('relative overflow-hidden bg-ih-surface-2', ratio, className)}>
      {src ? (
        <Image
          src={src}
          alt={alt ?? ''}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <span className="mono absolute inset-0 grid place-items-center px-4 text-center text-[10px] uppercase leading-[1.5] tracking-[0.1em] text-ih-muted-2">
          {label}
        </span>
      )}
    </div>
  )
}
