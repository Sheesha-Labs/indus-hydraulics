import type { MarketThumbnail } from '../../lib/market-thumbnails'

/**
 * One country silhouette. A pure renderer — every coordinate arrives from
 * `lib/market-thumbnails.ts` and nothing here computes anything.
 *
 * ON THE DOUBLE OUTLINE: the country is painted three times — a hatch fill,
 * then two offset strokes at falling weight and opacity. The hero map uses
 * three strokes; at thumbnail scale three reads as mud, so this is the lighter
 * relative of the same treatment. Do not add the third back.
 *
 * THE GEOMETRY IS SERIALISED ONCE, THOUGH. The three paints are `<use>`
 * references to a single `<path>` in `<defs>`. Repeating the `d` attribute
 * three times is what took the prerendered page to 3.3 MB — Canada's outline
 * alone is ~38 KB, and it was being written out three times on one card, 126
 * cards to a page. Presentation attributes on a `<use>` still apply, so the
 * drawing is identical.
 *
 * Both ids are namespaced per market: 126 of these share one document, and
 * duplicate SVG ids resolve to whichever the browser saw first — every card
 * would take the first card's hatch and the first card's outline.
 */
export default function MarketThumb({
  thumbnail,
  countryName,
}: {
  thumbnail: MarketThumbnail | null
  countryName: string
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
        className="grid aspect-[208/132] place-items-center bg-ih-surface-2"
        role="img"
        aria-label={`Outline map of ${countryName} unavailable`}
      >
        <span className="mono px-3 text-center text-[9px] uppercase tracking-[0.1em] text-ih-muted-2">
          Map unavailable
        </span>
      </div>
    )
  }

  const patternId = `mkit-${thumbnail.uid}`
  const outlineId = `mkio-${thumbnail.uid}`

  return (
    <svg
      viewBox={`0 0 ${thumbnail.width} ${thumbnail.height}`}
      preserveAspectRatio="xMidYMid meet"
      className="block aspect-[208/132] w-full"
      role="img"
      aria-label={thumbnail.ariaLabel}
    >
      <defs>
        <pattern
          id={patternId}
          width="6"
          height="6"
          patternTransform="rotate(38)"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-ih-steel)" strokeWidth="1" opacity="0.38" />
        </pattern>
        <path id={outlineId} d={thumbnail.path} />
      </defs>

      <use href={`#${outlineId}`} fill={`url(#${patternId})`} stroke="none" />
      <g fill="none" stroke="var(--color-ih-ink)">
        <use href={`#${outlineId}`} strokeWidth="1.5" strokeOpacity="0.85" />
        <use href={`#${outlineId}`} strokeWidth="0.8" strokeOpacity="0.4" transform="translate(1.6,2)" />
      </g>

      {thumbnail.port && (
        // Inside the labelled SVG and carrying nothing a screen reader needs —
        // the card's status line already states the lane.
        <g>
          <circle cx={thumbnail.port.x} cy={thumbnail.port.y} r="5" fill="var(--color-ih-accent)" opacity="0.14" />
          <circle
            cx={thumbnail.port.x}
            cy={thumbnail.port.y}
            r="2.1"
            fill="var(--color-ih-accent)"
            stroke="#fff"
            strokeWidth="0.9"
          />
        </g>
      )}
    </svg>
  )
}
