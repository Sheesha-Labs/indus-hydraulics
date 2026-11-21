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
    <div className="border-ih-border mb-6 flex overflow-x-auto border-b">
      {TABS.map((tab) => {
        const active = pathname === tab.path || pathname?.startsWith(`${tab.path}/`)
        return (
          <Link
            key={tab.id}
            href={tab.path}
            className={`-mb-px border-b-2 px-4 py-2.5 text-[12px] whitespace-nowrap tabular-nums transition-colors ${
              active
                ? 'border-ih-accent text-ih-ink'
                : 'text-ih-muted hover:text-ih-ink-2 border-transparent'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
