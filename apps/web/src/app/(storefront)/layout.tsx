import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Suspense } from 'react'
import AnalyticsProvider from '../../components/AnalyticsProvider'
import { db } from '@indus/db'
import { buildOrgLd, buildWebsiteLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import SiteHeader from '../../components/SiteHeader'
import SiteFooter from '../../components/SiteFooter'
import { SkipToContent } from '@indus/ui'
import CommandPalette from '../../components/CommandPalette'
import CompareTrayBadge from '../../components/CompareTrayBadge'
import { BASE_URL, ORG_ID, SITE_NAME } from '../../lib/seo'
import { areasServed, OFFICES } from '../../lib/site-locations'
import { getStoreSettings } from '../../lib/store-settings'
import { getFooterSocials } from '../../lib/footer'
import { searchIconUrl } from '../../lib/brand-identity'

/**
 * Legacy source for `sameAs`: a comma-separated list of profile URLs set in
 * Vercel as `NEXT_PUBLIC_SOCIAL_PROFILES`.
 *
 * Superseded by the `footer_socials` rows behind /admin/footer, which the
 * footer also draws — so the list a crawler reads and the row a visitor sees
 * can no longer disagree, and the person who runs the accounts can edit it
 * without deploy access. Kept as the fallback for exactly one case: the env
 * var is set and nobody has opened the Footer editor yet, where dropping it
 * would silently delete a live `sameAs`. Once rows exist they win outright.
 */
function readSameAsFromEnv(): string[] {
  const raw = process.env.NEXT_PUBLIC_SOCIAL_PROFILES
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

// Cache the global SEO override row across requests. Admin should call
// revalidateTag('seo-settings') when changing SeoSetting JSON-LD overrides.
const getSeoSetting = unstable_cache(
  async () =>
    db.seoSetting
      .findFirst({ select: { organizationJsonLd: true, websiteJsonLd: true } })
      .catch(() => null),
  ['seo-settings'],
  { revalidate: 3600, tags: ['seo-settings'] },
)

/**
 * Build the `verification` block from optional env vars. Each entry is
 * conditionally included so Next.js only emits the corresponding meta tag
 * when the verification ID is set in the environment.
 *
 *   NEXT_PUBLIC_GSC_VERIFICATION  → <meta name="google-site-verification" …>
 *   NEXT_PUBLIC_BING_VERIFICATION → <meta name="msvalidate.01" …>
 *
 * Returns `undefined` (not an empty object) when nothing is set, so the
 * Metadata type stays clean.
 */
function readVerification(): Metadata['verification'] {
  const google = process.env.NEXT_PUBLIC_GSC_VERIFICATION?.trim()
  const bing = process.env.NEXT_PUBLIC_BING_VERIFICATION?.trim()
  const v: NonNullable<Metadata['verification']> = {}
  if (google) v.google = google
  if (bing) v.other = { 'msvalidate.01': bing }
  return Object.keys(v).length > 0 ? v : undefined
}

/**
 * Default share-card title and description used by openGraph + twitter
 * below. Routes that emit their own metadata (PDP, category, brand, blog
 * via `pageMetadata`) override these per-page.
 */
const DEFAULT_OG_TITLE = 'Indus Hydraulics — Industrial hydraulic distributor'
const DEFAULT_OG_DESCRIPTION =
  'Pumps, valves, cylinders and hose assemblies for engineers who can’t afford downtime. Authorized distributor for Parker, Bosch Rexroth, Yuken, and HYDAC, shipped from Dubai across the GCC and beyond.'

/**
 * Storefront head. Static, because nothing here depends on a database read:
 * the two CMS-driven fields — the favicon and the search-result mark — are
 * declared once in the ROOT layout (app/layout.tsx) and inherited by every
 * segment, this one included. Putting them here covered the storefront and
 * left /admin on the bundled default. Do not move them back down.
 */
export const metadata: Metadata = {
  title: {
    default: 'Indus Hydraulics',
    template: '%s | Indus Hydraulics',
  },
  description:
    'Pumps, valves, cylinders and hose assemblies for oil & gas, mining, marine and steel industries.',
  verification: readVerification(),
  // Open Graph defaults — applied to any route that doesn't emit its own
  // openGraph block. The OG image itself is supplied by the file-based
  // convention at app/opengraph-image.tsx, so we don't list images here
  // (Next merges them automatically). LinkedIn reads exclusively from OG
  // tags, which is the primary share surface for a B2B audience.
  openGraph: {
    type: 'website',
    siteName: 'Indus Hydraulics',
    locale: 'en_AE',
    title: DEFAULT_OG_TITLE,
    description: DEFAULT_OG_DESCRIPTION,
    url: process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com',
  },
  // Twitter card defaults — same shape as OG. The image is supplied by
  // app/twitter-image.tsx; if that file isn't found, Twitter falls back
  // to the OG image, which is what we want.
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_OG_TITLE,
    description: DEFAULT_OG_DESCRIPTION,
  },
}

/**
 * Google Analytics 4 measurement ID, e.g. `G-XXXXXXXXXX`. When unset (local
 * dev, preview deploys without the env var) the GA script is not loaded.
 * Set on Vercel as `NEXT_PUBLIC_GA_MEASUREMENT_ID` once the GA4 property
 * is provisioned. GA4 is in addition to Vercel Analytics / Speed Insights /
 * PostHog — its primary role here is Search Console attribution.
 */
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()


export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  // Pull admin-managed Org/WebSite JSON-LD overrides AND StoreSettings for
  // contact / legal details that flow into the Organization schema. Both
  // are cross-request cached.
  const [seoSetting, settings, socials] = await Promise.all([
    getSeoSetting(),
    getStoreSettings(),
    getFooterSocials(),
  ])

  // The HQ office's address feeds the Organization PostalAddress (single
  // top-level address per Schema.org guidance). Branch offices get their
  // own LocalBusiness nodes on the contact page.
  const hq = OFFICES.find((o) => o.kind === 'hq')

  const orgLd = buildOrgLd({
    id: ORG_ID,
    name: SITE_NAME,
    legalName: settings.legalName,
    url: BASE_URL,
    // The same crawlable URL the <head> icon links carry, not `logoUrl` alone.
    // A crawler that reads one mark from the head and a different one from the
    // structured data is exactly the case that produces a blank generic icon
    // in the result row — and the storage URL this used to resolve to is
    // served `x-robots-tag: none`, so it could not be indexed as the
    // organisation logo either.
    logoUrl: searchIconUrl(settings, BASE_URL),
    description:
      'Industrial hydraulic components — pumps, cylinders, valves, hoses and consumables — for engineers who can’t afford downtime.',
    foundingDate: '2003',
    sameAs: socials.length > 0 ? socials.map((s) => s.href) : readSameAsFromEnv(),
    contact: { email: settings.contactEmail, telephone: settings.contactPhone },
    address: hq?.address ?? null,
    areaServed: areasServed(),
    override: seoSetting?.organizationJsonLd,
  })
  const websiteLd = buildWebsiteLd({
    name: SITE_NAME,
    url: BASE_URL,
    searchUrlTemplate: `${BASE_URL}/search?q={search_term_string}`,
    override: seoSetting?.websiteJsonLd,
  })

  // A fragment, not an element: the root layout already emits <html>/<body>
  // with the classes this chrome was written against, so the storefront's
  // rendered DOM is identical to before the merge.
  return (
    <>
        <SkipToContent />
        <SiteHeader />
        {/* A real <main> with an id, so the skip link has somewhere to go and
            assistive tech has a landmark. This was a bare div. */}
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <CommandPalette />
        <CompareTrayBadge />
        <JsonLd data={[orgLd, websiteLd]} />
        <SpeedInsights />
        {/* PostHog client init + pageview tracking. No-ops without
            NEXT_PUBLIC_POSTHOG_KEY. Suspense boundary required because
            AnalyticsProvider uses useSearchParams. */}
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
        {/* Google Analytics 4. Only rendered when NEXT_PUBLIC_GA_MEASUREMENT_ID
            is set; locally and on un-provisioned previews this emits nothing.
            Used mainly so Google Search Console can attribute organic
            traffic — campaign + product analytics still live in PostHog. */}
        {GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={GA_MEASUREMENT_ID} /> : null}
    </>
  )
}
