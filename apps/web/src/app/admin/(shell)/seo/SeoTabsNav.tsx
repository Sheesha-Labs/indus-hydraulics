'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS: { id: string; label: string; path: string }[] = [
  { id: 'inspector', label: 'Inspector', path: '/admin/seo/inspector' },
  { id: 'health', label: 'Health', path: '/admin/seo/health' },
  { id: 'structured-data', label: 'Structured data', path: '/admin/seo/structured-data' },
  { id: 'sitemap', label: 'Sitemap', path: '/admin/seo/sitemap' },
  { id: 'robots', label: 'Robots', path: '/admin/seo/robots' },
  { id: 'redirects', label: 'Redirects', path: '/admin/seo/redirects' },
  { id: 'search', label: 'Search', path: '/admin/seo/search' },
  { id: 'ai', label: 'AI', path: '/admin/seo/ai' },
  { id: 'gsc', label: 'GSC', path: '/admin/seo/gsc' },
  { id: 'audit', label: 'Audit', path: '/admin/seo/audit' },
  { id: 'settings', label: 'Settings', path: '/admin/seo/settings' },
]

export default function SeoTabsNav() {
  const pathname = usePathname()
  return (
    <div className="flex border-b border-[var(--color-border)] mb-6 overflow-x-auto">
      {TABS.map((tab) => {
        const active = pathname === tab.path || pathname?.startsWith(`${tab.path}/`)
        return (
          <Link
            key={tab.id}
            href={tab.path}
            className={`px-4 py-2.5 font-mono text-[12px] border-b-2 -mb-px transition-colors whitespace-nowrap ${
              active
                ? 'border-[var(--color-accent)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-body)]'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
