import HomeView, { homeMetadata } from './home-view'

export const generateMetadata = homeMetadata

/**
 * The homepage, cached.
 *
 * This route renders the Dubai fallback wording. Visitors from a country we
 * have wording for never reach it: the proxy resolves their country and
 * rewrites to `/h/<cc>`, which renders the same view with their possessive
 * and is cached on its own path. The URL in the address bar stays `/` either
 * way, and every variant declares `/` as its canonical.
 *
 * It reads nothing per-request, which is the point. `headers()` and
 * `searchParams` both used to be read here, and either one is enough to make
 * the route dynamic — production served `/` with `no-store`, so the CDN never
 * held a copy and every visitor and every crawler cost a full render.
 */
export const revalidate = 3600

export default function HomePage() {
  return <HomeView geoCode={null} />
}
