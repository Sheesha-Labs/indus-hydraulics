import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { BASEMAP_COLOURS, renderBasemapSvg } from './market-map-basemap'
import { THUMB_COLOURS, renderThumbSvg } from './market-thumb-asset'
import { buildMarketMapModel } from './market-geometry'
import { buildMarketThumbnail } from './market-thumbnails'
import { marketBySlug, releasedMarketPage, releasedMarketPageSlugs } from '@indus/domain'

/**
 * An external SVG renders in its own document and cannot read the page's CSS
 * custom properties, so these three token values are written out as literals.
 * That is invisible when it goes wrong — the map keeps rendering, in the old
 * colours — so the literals are checked against globals.css here.
 */
describe('baked colours match the design tokens', () => {
  const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8')

  function tokenValue(name: string): string | null {
    const m = css.match(new RegExp(`^\\s*--${name}:\\s*([^;]+);`, 'm'))
    return m?.[1]?.trim() ?? null
  }

  const pairs: [string, string][] = [
    ['color-ih-border', BASEMAP_COLOURS.graticule],
    ['color-ih-surface-2', BASEMAP_COLOURS.neighbourFill],
    ['color-ih-border-strong', BASEMAP_COLOURS.neighbourStroke],
    ['color-ih-steel', THUMB_COLOURS.hatch],
    ['color-ih-ink', THUMB_COLOURS.outline],
    ['color-ih-accent', THUMB_COLOURS.port],
  ]

  for (const [token, baked] of pairs) {
    it(`--${token}`, () => {
      const live = tokenValue(token)
      expect(live, `--${token} not found in globals.css`).not.toBeNull()
      expect(baked).toBe(live)
    })
  }
})

describe('basemap asset', () => {
  const slug = releasedMarketPageSlugs()[0]!
  const model = buildMarketMapModel(releasedMarketPage(slug)!, marketBySlug(slug)!.name)!
  const svg = renderBasemapSvg(model)

  it('shares the hero map viewBox exactly, so coordinates still line up', () => {
    expect(svg).toContain(`viewBox="0 0 ${model.width} ${model.height}"`)
  })

  it('carries the neighbour geometry', () => {
    expect(svg.match(/<path /g)?.length).toBeGreaterThanOrEqual(model.neighbours.length)
  })

  it('carries NO text — everything with a label stays in the page', () => {
    // The cut is "everything drawn before the first <text>". A label in here
    // would be a label Google can no longer read.
    expect(svg).not.toContain('<text')
  })

  it('is well-formed enough to be served as a standalone document', () => {
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true)
    expect(svg.endsWith('</svg>')).toBe(true)
  })
})

describe('thumbnail asset', () => {
  const market = marketBySlug(releasedMarketPageSlugs()[0]!)!
  const thumb = buildMarketThumbnail(market)!
  const svg = renderThumbSvg(thumb)

  it('defines the outline once and paints it three times', () => {
    // Repeating the `d` is what took the index to 3.3 MB.
    expect(svg.match(/<use /g)?.length).toBe(3)
    expect(svg.match(new RegExp(escapeRegExp(thumb.path), 'g'))?.length).toBe(1)
  })

  it('keeps the thumbnail aspect box', () => {
    expect(svg).toContain(`viewBox="0 0 ${thumb.width} ${thumb.height}"`)
  })

  it('carries no text', () => {
    expect(svg).not.toContain('<text')
  })
})

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
