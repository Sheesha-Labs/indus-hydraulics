import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { env } from '../../../lib/env'

// The template specimens (/_kit/templates/<t>, S02-T04) show each L2 template inside the real AppShell, so
// unlike the rest of /_kit (the (kit) group: no session, no database) they live in (console) and need a
// signed-in user. The same gate as (kit)/%5Fkit: never in production, only with OPS_KIT=1.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Templates · Kit · Indus Operations',
  robots: { index: false, follow: false },
}

export default function ConsoleKitLayout({ children }: { children: ReactNode }) {
  const e = env()
  if (e.APP_ENV === 'production' || e.OPS_KIT !== '1') notFound()
  return children
}
