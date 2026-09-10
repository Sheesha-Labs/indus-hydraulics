import type { MarketThumbnail } from '../../lib/market-thumbnails'
import { thumbUrl } from '../../lib/market-thumb-asset'

/**
 * One country silhouette. A pure renderer — every coordinate arrives from
 * `lib/market-thumbnails.ts` and nothing here computes anything.
 *
 * ON THE DOUBLE OUTLINE: the country is painted three times — a hatch fill,
 * then two offset strokes at falling weight and opacity. The hero map uses
 * three strokes; at thumbnail scale three reads as mud, so this is the lighter
 * relative of the same treatment. Do not add the third back.
 *
 * THE GEOMETRY NO LONGER TRAVELS WITH THE PAGE AT ALL. It is served from
 * /market-thumbs/<slug>.svg and referenced here as an ordinary image: 126
 * silhouettes were 181 KB of the index's 408 KB gzipped, for artwork with no
 * text in it. Cards below the fold are now not fetched at all until scrolled
 * to, and the files cache independently of the page.
 *
 * The drawing itself — hatch fill, two offset outlines, port marker, and the
 * single `<defs>` path the three paints share — moved verbatim to
 * lib/market-thumb-asset, which is also where the id-collision note went: it
 * stopped applying the moment each silhouette got its own document.
 */
export default function MarketThumb({
  thumbnail,
  countryName,
  slug,
}: {
  thumbnail: MarketThumbnail | null
  countryName: string
  /** Names the cached silhouette file. */
  slug: string
}) {
  if (!thumbnail) {
    /*
      Natural Earth's `properties.name` is not always the trade name, so a
      country can fail to match. A labelled panel is the right failure: the
      reader sees a deliberate gap rather than a broken card, and the card's
      own text already carries every fact.
    */
    return (
      <div
        className="bg-ih-surface-2 grid aspect-[208/132] place-items-center"
        role="img"
        aria-label={`Outline map of ${countryName} unavailable`}
      >
        <span className="mono text-ih-muted-2 px-3 text-center text-[9px] uppercase tracking-[0.1em]">
          Map unavailable
        </span>
      </div>
    )
  }

  return (
    /*
      A plain <img>, not next/image, and deliberately so. These are vector
      files: the image optimiser cannot resample an SVG, and serving one
      through it requires `dangerouslyAllowSVG`, which turns /_next/image into
      a route that renders arbitrary SVG. They are already a few KB each, they
      are cached for a year, and the layout box is fixed by width/height here —
      so there is nothing for the optimiser to add.
    */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={thumbUrl(slug)}
      alt={thumbnail.ariaLabel}
      width={thumbnail.width}
      height={thumbnail.height}
      loading="lazy"
      decoding="async"
      className="block aspect-[208/132] w-full"
    />
  )
}
