'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { deriveCrumbs } from './admin-routes'

export default function AdminTopbar() {
  const pathname = usePathname() ?? '/'
  const crumbs = deriveCrumbs(pathname)

  return (
    <div className="sticky top-0 z-20 flex h-[60px] items-center gap-5 border-b border-ih-border bg-ih-surface px-[26px]">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 font-mono text-[12px] text-ih-muted">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="opacity-40">/</span>}
              {isLast || !crumb.href ? (
                <span className="text-ih-ink">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-ih-ink transition-colors">
                  {crumb.label}
                </Link>
              )}
            </span>
          )
        })}
      </nav>

      {/* Search */}
      <div className="flex-1 flex justify-end">
        <div className="flex h-10 w-full max-w-[380px] items-center gap-2 rounded-md border border-ih-border bg-ih-surface-2 px-3 text-[13.5px] text-ih-muted">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" />
          </svg>
          <span className="flex-1 text-ih-muted-2">Search products, orders, pages…</span>
          <span className="rounded-[3px] border border-ih-border bg-ih-surface px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          className="grid h-9 w-9 place-items-center rounded-md border border-ih-border bg-ih-surface text-ih-ink-2 transition-colors hover:border-ih-accent hover:text-ih-accent"
          title="Help"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="8" cy="8" r="6" /><path d="M6.5 6.5c0-1 .7-1.5 1.5-1.5s1.5.5 1.5 1.5c0 1.5-1.5 1-1.5 2.5" /><circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
          </svg>
        </button>
        <button
          className="relative grid h-9 w-9 place-items-center rounded-md border border-ih-border bg-ih-surface text-ih-ink-2 transition-colors hover:border-ih-accent hover:text-ih-accent"
          title="Notifications"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M4 7a4 4 0 018 0v3l1 2H3l1-2V7z" /><path d="M7 13a1 1 0 002 0" />
          </svg>
          <span className="absolute top-[5px] right-[5px] w-1.5 h-1.5 rounded-full bg-ih-accent" />
        </button>
      </div>
    </div>
  )
}
