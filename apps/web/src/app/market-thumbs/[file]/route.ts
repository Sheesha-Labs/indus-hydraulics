import { marketBySlug, marketsOrdered } from '@indus/domain'
import { buildMarketThumbnail } from '../../../lib/market-thumbnails'
import { renderThumbSvg } from '../../../lib/market-thumb-asset'

/**
 * `/market-thumbs/<slug>.svg` — one country silhouette for the /markets index.
 * See lib/market-thumb-asset for why these are files.
 */
export const revalidate = 31536000

export function generateStaticParams(): { file: string }[] {
  return marketsOrdered().map((m) => ({ file: `${m.slug}.svg` }))
}

export const dynamicParams = true

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ file: string }> }
): Promise<Response> {
  const { file } = await ctx.params
  if (!file.endsWith('.svg')) return new Response('Not found', { status: 404 })

  const market = marketBySlug(file.slice(0, -'.svg'.length))
  if (!market) return new Response('Not found', { status: 404 })

  const thumbnail = buildMarketThumbnail(market)
  // Null is a real outcome, not an error: Natural Earth's `properties.name` is
  // not always the trade name. The card renders its own labelled gap.
  if (!thumbnail) return new Response('Not found', { status: 404 })

  return new Response(renderThumbSvg(thumbnail), {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400',
    },
  })
}
