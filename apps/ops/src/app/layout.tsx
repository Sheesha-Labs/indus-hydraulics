import type { Metadata } from 'next'
import { Geist, Instrument_Serif } from 'next/font/google'
import type { ReactNode } from 'react'
import './globals.css'

// next/font self-hosts both families at build time; nothing is fetched from Google at runtime.
// Geist is variable (400/500/600 all present). Instrument Serif has weight 400 only: never bold it.
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })
const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Indus Operations',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  )
}
