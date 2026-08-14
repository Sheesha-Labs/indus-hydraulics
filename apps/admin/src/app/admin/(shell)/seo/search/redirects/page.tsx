import type { Metadata } from 'next'
import { db } from '@indus/db'
import SearchRedirectsClient from './SearchRedirectsClient'

export const metadata: Metadata = { title: 'Query redirects — Indus Admin' }

export default async function SearchRedirectsPage() {
  const rows = await db.searchRedirect.findMany({
    orderBy: [{ isActive: 'desc' }, { query: 'asc' }],
  })
  return <SearchRedirectsClient rows={rows} />
}
