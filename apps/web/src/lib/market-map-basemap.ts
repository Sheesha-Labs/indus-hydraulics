import type { MarketMapModel } from './market-geometry'

/**
 * The hero map's basemap, served as a file instead of inlined into the page.
 *
 * WHY — 2026-09-10.
 *
 * The graticule and the neighbouring-country outlines are pure geometry: no
 * text, no interactivity, and identical on every visit. Inlined, they were 89%
 * of the hero SVG and ~40 KB gzipped of a 151 KB market page — on 126 pages,
 * and on a domain where Google is rationing crawl hard enough that 1,733 URLs
 * have never been fetched.
 *
 * As a file they are fetched once and reused across all 126 pages, and the
 * page keeps only what carries meaning: the country outline, the export lanes,
 * the city markers and every `<text>` label.
 *
 * WHAT STAYS BEHIND, AND WHY IT MUST
 *
 * Only the elements drawn BEFORE the first `<text>` move here. That is not an
 * arbitrary cut: it preserves paint order exactly. Neighbour labels are drawn
 * over the neighbour fills and under the target country, so moving the fills
 * into a single `<image>` beneath them leaves the stacking identical, while
 * moving anything from after that point would let a label surface through a
 * country that used to cover it.
 *
 * THE COLOURS ARE BAKED, AND A TEST WATCHES THEM
 *
 * An external file referenced by `<image>` renders in its own document and
 * cannot see the page's CSS custom properties, so the three tokens it needs
 * are written out as literals. `market-map-basemap.test.ts` reads globals.css
 * and fails if a token is retuned without this file following, because the
 * failure mode is otherwise invisible: the map keeps rendering, in last
 * season's colours.
 */
export const BASEMAP_COLOURS = {
  /** --color-ih-border */
  graticule: 'oklch(0.902 0.008 250)',
  /** --color-ih-surface-2 */
  neighbourFill: 'oklch(0.955 0.006 250)',
  /** --color-ih-border-strong */
  neighbourStroke: 'oklch(0.82 0.013 250)',
} as const

/** Public URL of one market's basemap. */
export function basemapUrl(slug: string): string {
  return `/market-maps/${slug}.svg`
}

/**
 * Serialise the basemap layer.
 *
 * The viewBox matches the hero's exactly, so the `<image>` that references
 * this can be placed at 0,0 at full width and height and every coordinate
 * still lines up with the geometry the page kept.
 */
export function renderBasemapSvg(model: MarketMapModel): string {
  const { width: w, height: h } = model
  const c = BASEMAP_COLOURS

  const graticule = model.graticule
    ? `<path d="${model.graticule}" fill="none" stroke="${c.graticule}" stroke-width="1" stroke-dasharray="1 4"/>`
    : ''

  const neighbours = model.neighbours
    .map(
      (d) =>
        `<path d="${d}" fill="${c.neighbourFill}" stroke="${c.neighbourStroke}" stroke-width="0.9" stroke-opacity="0.8"/>`
    )
    .join('')

  // No `role`/`aria-label`: the page's own <svg> carries the accessible name
  // for the whole figure, and this layer is decorative within it.
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
    graticule +
    neighbours +
    `</svg>`
  )
}
