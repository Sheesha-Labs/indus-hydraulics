import type { MarketThumbnail } from './market-thumbnails'
import { BASEMAP_COLOURS } from './market-map-basemap'

/**
 * One country silhouette, served as a file rather than inlined into /markets.
 *
 * WHY — 2026-09-10.
 *
 * The index carries 126 of these in one document. Measured on production, the
 * inline SVGs were **181 KB of the page's 408 KB gzipped** — 44% of by far the
 * heaviest page on the site, for artwork carrying no text at all.
 *
 * Served as files they are fetched only when scrolled into view (`loading
 * ="lazy"`), cached independently of the page, and shared with any other
 * surface that wants the same silhouette.
 *
 * The ids can be fixed rather than namespaced here, which they could not be
 * inline: each file is its own document, so there is nothing to collide with.
 * That was the entire reason for the `mkit-`/`mkio-` prefixes.
 */
export const THUMB_COLOURS = {
  /** --color-ih-steel */
  hatch: 'oklch(0.68 0.075 240)',
  /** --color-ih-ink */
  outline: 'oklch(0.195 0.016 255)',
  /** --color-ih-accent */
  port: 'oklch(0.475 0.115 248)',
} as const

/** Public URL of one market's thumbnail. */
export function thumbUrl(slug: string): string {
  return `/market-thumbs/${slug}.svg`
}

/**
 * Serialise a thumbnail.
 *
 * The drawing is a transcription of what `MarketThumb` used to render inline —
 * hatch fill, then two offset strokes at falling weight, then the port marker.
 * The geometry is still defined once and `<use>`d three times, for the reason
 * that comment gave: repeating a coastline's `d` took the page to 3.3 MB.
 */
export function renderThumbSvg(thumbnail: MarketThumbnail): string {
  const c = THUMB_COLOURS
  const port = thumbnail.port
    ? `<g>` +
      `<circle cx="${thumbnail.port.x}" cy="${thumbnail.port.y}" r="5" fill="${c.port}" opacity="0.14"/>` +
      `<circle cx="${thumbnail.port.x}" cy="${thumbnail.port.y}" r="2.1" fill="${c.port}" stroke="#fff" stroke-width="0.9"/>` +
      `</g>`
    : ''

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${thumbnail.width} ${thumbnail.height}" preserveAspectRatio="xMidYMid meet">` +
    `<defs>` +
    `<pattern id="h" width="6" height="6" patternTransform="rotate(38)" patternUnits="userSpaceOnUse">` +
    `<line x1="0" y1="0" x2="0" y2="6" stroke="${c.hatch}" stroke-width="1" opacity="0.38"/>` +
    `</pattern>` +
    `<path id="o" d="${thumbnail.path}"/>` +
    `</defs>` +
    `<use href="#o" fill="url(#h)" stroke="none"/>` +
    `<g fill="none" stroke="${c.outline}">` +
    `<use href="#o" stroke-width="1.5" stroke-opacity="0.85"/>` +
    `<use href="#o" stroke-width="0.8" stroke-opacity="0.4" transform="translate(1.6,2)"/>` +
    `</g>` +
    port +
    `</svg>`
  )
}

/** Re-exported so a single test can assert every baked colour at once. */
export const ALL_BAKED_COLOURS = { ...BASEMAP_COLOURS, ...THUMB_COLOURS }
