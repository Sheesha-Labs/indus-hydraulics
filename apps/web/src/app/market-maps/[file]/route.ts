import { marketBySlug, releasedMarketPage, releasedMarketPageSlugs } from '@indus/domain'
import { buildMarketMapModel } from '../../../lib/market-geometry'
import { renderBasemapSvg } from '../../../lib/market-map-basemap'

/**
 * `/market-maps/<slug>.svg` — the graticule and neighbour outlines for one
 * market's hero map. See lib/market-map-basemap for why this is a file.
 *
 * Cached hard and for a long time. The geometry is derived from Natural Earth
 * topology that ships with the build, so it changes only when the build does,
 * and a deploy gets a fresh CDN cache anyway.
 */
export const revalidate = 31536000

export function generateStaticParams(): { file: string }[] {
  // Prerendering every basemap is cheap — they are static files — and it means
  // no market page's first visitor pays for a projection.
  return releasedMarketPageSlugs().map((slug) => ({ file: `${slug}.svg` }))
}

export const dynamicParams = true

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ file: string }> }
): Promise<Response> {
  const { file } = await ctx.params
  if (!file.endsWith('.svg')) return new Response('Not found', { status: 404 })
  const slug = file.slice(0, -'.svg'.length)

  const page = releasedMarketPage(slug)
  const market = marketBySlug(slug)
  if (!page || !market) return new Response('Not found', { status: 404 })

  const model = buildMarketMapModel(page, market.name)
  if (!model) return new Response('Not found', { status: 404 })

  return new Response(renderBasemapSvg(model), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400',
    },
  })
}
