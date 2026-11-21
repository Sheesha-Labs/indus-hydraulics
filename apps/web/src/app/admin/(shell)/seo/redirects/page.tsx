import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@indus/db'
import RedirectsManager from './RedirectsManager'

export const metadata: Metadata = { title: 'Redirects — Indus Admin' }

export default async function SeoRedirectsPage() {
  const [redirects, unresolved404Count, activeCount] = await Promise.all([
    db.redirect.findMany({
      orderBy: [{ isActive: 'desc' }, { hits: 'desc' }, { createdAt: 'desc' }],
    }),
    db.notFoundLog.count({ where: { resolvedRedirectId: null } }),
    db.redirect.count({ where: { isActive: true } }),
  ])

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/admin/seo/redirects/not-found"
          className="border-ih-border bg-ih-surface hover:bg-ih-surface-2 inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[12px] tabular-nums"
        >
          404 log
          {unresolved404Count > 0 && (
            <span className="bg-[oklch(0.5_0.18_25)] px-1.5 py-0.5 text-[11px] text-white tabular-nums">
              {unresolved404Count}
            </span>
          )}
        </Link>
        <Link
          href="/admin/seo/redirects/chains"
          className="border-ih-border bg-ih-surface hover:bg-ih-surface-2 inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[12px] tabular-nums"
        >
          Detect chains
          <span className="text-ih-muted text-[11px] tabular-nums">{activeCount} active</span>
        </Link>
      </div>

      <RedirectsManager redirects={redirects} />
    </div>
  )
}
