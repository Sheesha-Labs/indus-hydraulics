import type { Metadata } from 'next'
import { db } from '@indus/db'
import RedirectsManager from './RedirectsManager'

export const metadata: Metadata = { title: 'Redirects — Indus Admin' }

export default async function SeoRedirectsPage() {
  const redirects = await db.redirect.findMany({
    orderBy: [{ isActive: 'desc' }, { hits: 'desc' }, { createdAt: 'desc' }],
  })
  return <RedirectsManager redirects={redirects} />
}
