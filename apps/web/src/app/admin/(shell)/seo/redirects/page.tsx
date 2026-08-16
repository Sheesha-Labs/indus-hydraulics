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
      <div className="flex gap-3 mb-6 flex-wrap">
        <Link
          href="/admin/seo/redirects/not-found"
          className="inline-flex items-center gap-2 h-9 px-3 border border-ih-border bg-ih-surface hover:bg-ih-surface-2 font-mono text-[12px]"
        >
          404 log
          {unresolved404Count > 0 && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[oklch(0.5_0.18_25)] text-white">
              {unresolved404Count}
            </span>
          )}
        </Link>
        <Link
          href="/admin/seo/redirects/chains"
          className="inline-flex items-center gap-2 h-9 px-3 border border-ih-border bg-ih-surface hover:bg-ih-surface-2 font-mono text-[12px]"
        >
          Detect chains
          <span className="font-mono text-[10px] text-ih-muted">
            {activeCount} active
          </span>
        </Link>
      </div>

      <RedirectsManager redirects={redirects} />
    </div>
  )
}
