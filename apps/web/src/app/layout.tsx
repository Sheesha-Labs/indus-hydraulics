import type { Metadata } from 'next'
import { Geist, JetBrains_Mono, Instrument_Serif } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { buildIconMetadata } from '../lib/brand-identity'
import { getStoreSettings } from '../lib/store-settings'
import { BASE_URL } from '../lib/seo'

/**
 * Root layout for BOTH surfaces.
 *
 * Deliberately minimal: it owns only what is genuinely shared — the <html>
 * element, the font variables, the stylesheet, and Vercel Analytics (which
 * both apps rendered before the merge). Everything surface-specific lives one
 * level down, in (storefront)/layout.tsx and admin/layout.tsx.
 *
 * That split is what keeps `robots: 'noindex, nofollow'` correct. It used to
 * be a ROOT-layout export in the admin app; leaving it here would apply it to
 * the entire public site — an inversion, not merely a loss.
 *
 * The <body> classes are byte-for-byte the storefront's previous ones, and
 * (storefront)/layout.tsx returns a fragment, so the storefront's rendered DOM
 * is unchanged by the merge. The admin wrapper is simply a stretched flex
 * child.
 */

// Design language v2 ships three families and no others: Geist for UI,
// Instrument Serif for display, JetBrains Mono for data and labels.
// See design_handoff_indus_hydraulics_v2/01-design-language.md §3.
//
// next/font self-hosts and inlines these at build time, so the handoff's
// "self-host for production" requirement is met by staying on next/font/google.

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

// Instrument Serif ships weight 400 ONLY (normal + italic) — verified against
// next/font's font-data.json. Requesting any other weight throws at build.
// The display pattern needs exactly this: serif headlines are 400 with an
// italic closing clause, and 01-design-language.md §3 is explicit that you
// never bold inside a serif headline. Where the old build used a semibold
// serif, use Geist 500/600 rather than synthesising a weight this face
// does not have.
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

/**
 * The two metadata fields both surfaces need: `metadataBase` and the icon
 * links. Titles, descriptions, openGraph, twitter, verification and robots all
 * belong to a surface and live in the surface layouts.
 *
 * The icons live HERE rather than in (storefront)/layout.tsx, where they were
 * until the tab strip proved it. Next resolves metadata root -> page and a
 * segment inherits every field it does not set itself, so icons declared on
 * the storefront layout covered the storefront and nothing else: /admin, its
 * sign-in page, the root not-found and global-error all fell through to the
 * browser's implicit request for /favicon.ico and drew the bundled default.
 * An operator's uploaded favicon appearing on the public site but not on the
 * admin they spend their day in is the shape that reported it.
 *
 * `generateMetadata` rather than a static `metadata`, so the favicon and the
 * search-result mark can come from the CMS (/admin/settings?tab=brand). The
 * read is `getStoreSettings` — `unstable_cache`d with a 300s revalidate and
 * already awaited by the storefront layout body — so this adds no per-request
 * work and touches no dynamic API, which means prerendering is unaffected.
 * Do NOT swap it for an uncached query: a dynamic read in the ROOT layout
 * takes every route in the app off the CDN, both surfaces at once.
 */
export async function generateMetadata(): Promise<Metadata> {
  const icons = buildIconMetadata(await getStoreSettings(), BASE_URL)

  return {
    // Resolves every relative URL in every nested metadata export.
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com'),
    ...(icons ? { icons } : {}),
  }
}

// Co-locate Vercel functions with the Supabase database region (currently
// `bom1`) to avoid transcontinental Prisma round-trips. Propagates to every
// route segment via the root layout. Belt-and-braces with vercel.json's
// `regions: ["bom1"]`. Revisit once Supabase relocates to a GCC region.
export const preferredRegion = 'bom1'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-ih-bg text-ih-ink">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
