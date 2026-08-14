import type { Metadata } from 'next'
import { Inter, IBM_Plex_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
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
    default: 'Indus Hydraulics Admin',
    template: '%s | Admin',
  },
  robots: 'noindex, nofollow',
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
      className={`${inter.variable} ${ibmPlexMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[var(--color-surface)] text-[var(--color-primary)]">
        {/* Carries the admin type scale. See the [data-surface='admin'] block
            in globals.css — the old text-[14px] utility here was dead code,
            outranked by the unlayered body rule. */}
        <div data-surface="admin" className="min-h-full">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}
