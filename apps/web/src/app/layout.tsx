import type { Metadata } from 'next'
import { Inter, IBM_Plex_Mono, Source_Serif_4 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

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
// .sc-article-body / .sc-lead utilities (or the font-serif Tailwind class).
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  // metadataBase is the one metadata field both surfaces need — it resolves
  // every relative URL in every nested metadata export. Titles, descriptions,
  // openGraph, twitter, verification and robots all belong to a surface and
  // live in the surface layouts.
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com'),
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
      className={`${inter.variable} ${ibmPlexMono.variable} ${sourceSerif.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--color-surface)] text-[var(--color-primary)]">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
