import Image from 'next/image'
import Link from 'next/link'
import { mediaUrl } from '../lib/media'
import { marqueeDurationClass, type MarqueeBrand } from '../lib/brand-marquee'

type Props = {
  brands: MarqueeBrand[]
  /** Names the strip for assistive tech, e.g. "Brands we distribute". */
  label: string
}

/**
 * A continuous, clickable strip of maker logos.
 *
 * Ported from the developer-logo marquee on the Bazar site, onto this app's
 * tokens and Tailwind conventions. No library and no JavaScript: the set is
 * rendered twice and the track slides by -50% (`ih-marquee` in globals.css),
 * so the second copy lands exactly where the first started and the restart is
 * invisible. It stays a Server Component, which keeps the home page static.
 *
 * - Spacing is padding on each item, not flex `gap`. With `gap`, the seam
 *   between the two copies is one gap short and the loop jumps by half a gap.
 * - Pauses on hover AND keyboard focus, so a moving target can be clicked or
 *   tabbed to. The second copy is decorative: `aria-hidden` and out of the tab
 *   order, so keyboard and screen-reader users meet each brand once.
 * - Touch screens (`hover: none`) never get that pause — the tile under a
 *   thumb would not be the tile that opened. There the animation stops, the
 *   duplicate copy is dropped, and the strip becomes a rail the visitor
 *   swipes. Free scroll, not snap: a snapped tile would come to rest inside
 *   the edge fade and read as half-drawn.
 * - `prefers-reduced-motion` stops the animation outright.
 * - Logos sit in a fixed box with `object-contain`: the files range from 120
 *   to 1200px wide and from 9:1 wordmarks to near-square marks, and bounding
 *   both axes is what evens out their optical weight.
 */
export default function BrandMarquee({ brands, label }: Props) {
  if (brands.length === 0) return null
  const loop = [...brands, ...brands]

  return (
    <div
      role="region"
      aria-label={label}
      className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent_0,#000_7%,#000_93%,transparent_100%)] [-webkit-mask-image:linear-gradient(90deg,transparent_0,#000_7%,#000_93%,transparent_100%)] [@media(hover:none)]:overflow-x-auto [@media(hover:none)]:overscroll-x-contain [@media(hover:none)]:[scrollbar-width:none] [@media(hover:none)]:[&::-webkit-scrollbar]:hidden"
    >
      <ul
        className={`flex w-max [animation-name:ih-marquee] [animation-timing-function:linear] [animation-iteration-count:infinite] ${marqueeDurationClass(brands.length)} group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:[animation-name:none] [@media(hover:none)]:[animation-name:none]`}
      >
        {loop.map((brand, i) => {
          const duplicate = i >= brands.length
          return (
            <li
              key={`${brand.slug}-${i}`}
              aria-hidden={duplicate || undefined}
              className={`shrink-0 pr-[14px] md:pr-5 ${duplicate ? '[@media(hover:none)]:hidden' : ''}`}
            >
              <Link
                href={`/brands/${brand.slug}`}
                tabIndex={duplicate ? -1 : undefined}
                className="flex h-[108px] min-w-[200px] items-center justify-center rounded-lg border border-ih-border bg-ih-surface px-8 transition-colors duration-150 hover:border-ih-border-strong focus-visible:border-ih-accent focus-visible:shadow-[0_0_0_3px_var(--color-ih-accent-soft)] focus-visible:outline-none md:h-[128px] md:min-w-[240px] md:px-10"
              >
                <span className="relative block h-12 w-[132px] md:h-14 md:w-40">
                  <Image
                    src={mediaUrl(brand.logoPath)}
                    // The logo is the link's only content, so it names the
                    // brand the tile opens — not a parent whose mark it shares.
                    alt={brand.name}
                    fill
                    sizes="160px"
                    className="object-contain"
                  />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
