import type { Metadata } from 'next'
import { Inter, IBM_Plex_Mono, Source_Serif_4 } from 'next/font/google'
import { unstable_cache } from 'next/cache'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { db } from '@indus/db'
import { buildOrgLd, buildWebsiteLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import CompareTrayBadge from '../components/CompareTrayBadge'
import { BASE_URL, ORG_ID, SITE_NAME } from '../lib/seo'
import { mediaUrl } from '../lib/media'
import { areasServed, OFFICES } from '../lib/site-locations'
import { getStoreSettings } from '../lib/store-settings'
import './globals.css'

/**
 * Optional, comma-separated list of social profile URLs surfaced as
 * `sameAs` on the Organization JSON-LD. Set in Vercel as
 * `NEXT_PUBLIC_SOCIAL_PROFILES`. Empty / unset = no sameAs.
 */
function readSameAs(): string[] {
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
  { revalidate: 300, tags: ['seo-settings'] },
)

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

// Source Serif 4 — body font for /services case-study articles. Loaded here
// so the variable is on <html> and available to any route that opts in via
// .sc-article-body / .sc-lead utilities (or font-serif Tailwind class).
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Indus Hydraulics',
    template: '%s | Indus Hydraulics',
  },
  description:
    'Pumps, valves, cylinders and hose assemblies for oil & gas, mining, marine and steel industries.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com'),
}

// Co-locate Vercel functions with the Supabase database region (currently
// `bom1`) to avoid transcontinental Prisma round-trips. Propagates to every
// route segment via the root layout. Belt-and-braces with vercel.json's
// `regions: ["bom1"]`. Revisit once Supabase relocates to a GCC region.
export const preferredRegion = 'bom1'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Pull admin-managed Org/WebSite JSON-LD overrides AND StoreSettings for
  // contact / legal details that flow into the Organization schema. Both
  // are cross-request cached.
  const [seoSetting, settings] = await Promise.all([getSeoSetting(), getStoreSettings()])

  // The HQ office's address feeds the Organization PostalAddress (single
  // top-level address per Schema.org guidance). Branch offices get their
  // own LocalBusiness nodes on the contact page.
  const hq = OFFICES.find((o) => o.kind === 'hq')

  const orgLd = buildOrgLd({
    id: ORG_ID,
    name: SITE_NAME,
    legalName: settings.legalName,
    url: BASE_URL,
    logoUrl: settings.logoUrl ? mediaUrl(settings.logoUrl) : null,
    description:
      'Industrial hydraulic components — pumps, cylinders, valves, hoses and consumables — for engineers who can’t afford downtime.',
    foundingDate: '2003',
    sameAs: readSameAs(),
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

  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexMono.variable} ${sourceSerif.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--color-surface)] text-[var(--color-primary)]">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <CompareTrayBadge />
        <JsonLd data={[orgLd, websiteLd]} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
