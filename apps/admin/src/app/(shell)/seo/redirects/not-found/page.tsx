import type { Metadata } from 'next'
import { db } from '@indus/db'
import NotFoundList from './NotFoundList'

export const metadata: Metadata = { title: '404 log — Indus Admin' }

export default async function NotFoundLogPage() {
  const rows = await db.notFoundLog.findMany({
    where: { resolvedRedirectId: null },
    orderBy: [{ hits: 'desc' }, { lastSeenAt: 'desc' }],
    take: 100,
  })
  return (
    <NotFoundList
      rows={rows.map((r) => ({
        id: r.id,
        path: r.path,
        referer: r.referer,
        hits: r.hits,
        firstSeenAt: r.firstSeenAt.toISOString(),
        lastSeenAt: r.lastSeenAt.toISOString(),
      }))}
    />
  )
}
