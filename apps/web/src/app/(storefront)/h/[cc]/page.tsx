import HomeView, { homeMetadata } from '../../home-view'

export const generateMetadata = homeMetadata

/**
 * A per-country copy of the homepage.
 *
 * Not linked from anywhere and not meant to be visited directly. The proxy
 * rewrites `/` here once it has resolved the visitor's country, so each
 * country's wording is cached on its own path instead of every visitor paying
 * for a fresh render of `/`.
 *
 * The rewrite is internal, so the address bar still reads `/`. That is also
 * why this route carries the same metadata as `/` — canonical included, and
 * emphatically not `noindex`: what this file declares is what a crawler reads
 * at `/`.
 */
export const revalidate = 3600

/**
 * The home market, prerendered. Everything else is cached on first request.
 *
 * The list existing is what makes the route cacheable at all — without it Next
 * marks the route `ƒ` and renders per request, which is the cost this was
 * meant to remove. Its LENGTH only decides how many countries are already warm
 * when a deploy lands, and length is paid in build minutes: all 127 variants
 * helped take the production build from ~5 minutes to ~16.
 *
 * The GCC six are the ones worth the build time — they are the market, and the
 * `hero-geo` e2e suite asserts each of them by name. Every other country
 * renders once, on its first visitor, and is cached from then on.
 *
 * The fallback is not among them: it already lives at `/`, which is where the
 * proxy leaves visitors it has no wording for.
 */
const WARM_GEO_CODES = ['AE', 'SA', 'OM', 'QA', 'BH', 'KW'] as const

export function generateStaticParams() {
  return WARM_GEO_CODES.map((cc) => ({ cc }))
}

/**
 * A code outside the list can only arrive by someone typing it: the proxy
 * resolves through `resolveHeroGeoCode`, which never emits one. Render it
 * rather than 404 — `HomeView` falls back to the Dubai wording.
 */
export const dynamicParams = true

export default async function HomeGeoVariantPage({
  params,
}: {
  params: Promise<{ cc: string }>
}) {
  const { cc } = await params
  return <HomeView geoCode={cc} />
}
