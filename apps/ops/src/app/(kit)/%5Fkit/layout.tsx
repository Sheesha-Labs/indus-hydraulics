import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { env } from '../../../lib/env'

// Decision: App Router treats folders starting with "_" as private, so the specimen lives at
// (kit)/%5Fkit (URL /_kit), outside (console): no session, no database. The proxy makes /_kit public
// only under the same condition; env.ts refuses OPS_KIT in production, so production always 404s.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Kit · Indus Operations',
  robots: { index: false, follow: false },
}

export default function KitLayout({ children }: { children: ReactNode }) {
  const e = env()
  if (e.APP_ENV === 'production' || e.OPS_KIT !== '1') notFound()
  return <div className="bg-io-ground min-h-screen w-max min-w-full">{children}</div>
}
