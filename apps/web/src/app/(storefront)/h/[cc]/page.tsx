import { HERO_GEO_CODES, HERO_GEO_FALLBACK_CODE } from '@indus/domain'
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
 * Every variant is prerendered.
 *
 * This list is what makes the route cacheable, and it is the whole point of
 * the change — without it Next marks the route `ƒ` and renders it per request,
 * which is exactly the cost this was meant to remove. The pages are cheap to
 * build: all of them run the same handful of `unstable_cache`d queries and
 * differ only in the opening words of the headline.
 *
 * The fallback is excluded because it already lives at `/`, which is where the
 * proxy leaves visitors it has no wording for.
 */
export function generateStaticParams() {
  return HERO_GEO_CODES.filter((cc) => cc !== HERO_GEO_FALLBACK_CODE).map((cc) => ({ cc }))
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
