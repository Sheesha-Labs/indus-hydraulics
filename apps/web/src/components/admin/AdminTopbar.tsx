'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { deriveCrumbs } from './admin-routes'

export default function AdminTopbar() {
  const pathname = usePathname() ?? '/'
  const crumbs = deriveCrumbs(pathname)

  return (
    <div className="h-14 bg-white border-b border-[#e6e1d5] flex items-center px-6 gap-5 sticky top-0 z-20">
      {/* Breadcrumbs */}
      <nav className="font-mono text-[12px] text-ih-muted flex items-center gap-1">
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
        <div className="flex items-center gap-2 h-9 px-3 bg-[#f5f3ee] border border-[#d9d4c8] text-[13px] text-ih-muted max-w-[380px] w-full">
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
          <span className="font-mono text-[10px] bg-[#ebe7df] border border-[#d9d4c8] px-1.5 py-0.5">
            ⌘K
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          className="w-[34px] h-[34px] border border-[#d9d4c8] bg-white grid place-items-center text-ih-ink-2 hover:border-ih-accent transition-colors"
          title="Help"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="8" cy="8" r="6" /><path d="M6.5 6.5c0-1 .7-1.5 1.5-1.5s1.5.5 1.5 1.5c0 1.5-1.5 1-1.5 2.5" /><circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
          </svg>
        </button>
        <button
          className="relative w-[34px] h-[34px] border border-[#d9d4c8] bg-white grid place-items-center text-ih-ink-2 hover:border-ih-accent transition-colors"
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
