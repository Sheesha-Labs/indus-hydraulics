import type { Metadata } from 'next'
import { Inter, IBM_Plex_Mono } from 'next/font/google'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import CompareTrayBadge from '../components/CompareTrayBadge'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      </body>
    </html>
  )
}
