import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { env } from '../../../lib/env'

// The T12 template specimen (/_kit/templates/t12a, S02-T05) renders in the (client) group, outside the
// console, with no session. The same gate as (kit)/%5Fkit: never in production, only with OPS_KIT=1.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Templates · Kit · Indus Operations',
  robots: { index: false, follow: false },
}

export default function ClientKitLayout({ children }: { children: ReactNode }) {
  const e = env()
  if (e.APP_ENV === 'production' || e.OPS_KIT !== '1') notFound()
  return children
}
