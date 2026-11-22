import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { env } from '../../../lib/env'

// The T11 template specimen (/_kit/templates/t11a, S02-T05) renders through the (auth) layout, as every
// sign-in page does. The same gate as (kit)/%5Fkit: never in production, only with OPS_KIT=1.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Templates · Kit · Indus Operations',
  robots: { index: false, follow: false },
}

export default function AuthKitLayout({ children }: { children: ReactNode }) {
  const e = env()
  if (e.APP_ENV === 'production' || e.OPS_KIT !== '1') notFound()
  return children
}
