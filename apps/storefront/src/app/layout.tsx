import type { Metadata } from 'next'
import { Inter, IBM_Plex_Mono } from 'next/font/google'
import { db } from '@indus/db'
import { buildOrgLd, buildWebsiteLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import CompareTrayBadge from '../components/CompareTrayBadge'
import { BASE_URL, SITE_NAME } from '../lib/seo'
import './globals.css'

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

export const metadata: Metadata = {
  title: {
    default: 'Indus Hydraulics',
    template: '%s | Indus Hydraulics',
  },
  description:
    'Pumps, valves, cylinders and hose assemblies for oil & gas, mining, marine and steel industries.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com'),
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Pull admin-managed Org/WebSite JSON-LD overrides for the global script tag.
  const seoSetting = await db.seoSetting
    .findFirst({ select: { organizationJsonLd: true, websiteJsonLd: true } })
    .catch(() => null)

  const orgLd = buildOrgLd({
    name: SITE_NAME,
    url: BASE_URL,
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
      className={`${inter.variable} ${ibmPlexMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--color-surface)] text-[var(--color-primary)]">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <CompareTrayBadge />
        <JsonLd data={[orgLd, websiteLd]} />
      </body>
    </html>
  )
}
