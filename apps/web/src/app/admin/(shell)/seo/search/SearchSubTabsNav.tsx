'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const SUB_TABS = [
  { id: 'synonyms', label: 'Synonyms', path: '/admin/seo/search/synonyms' },
  { id: 'redirects', label: 'Query redirects', path: '/admin/seo/search/redirects' },
  { id: 'boosts', label: 'Boosts', path: '/admin/seo/search/boosts' },
  { id: 'queries', label: 'Query analytics', path: '/admin/seo/search/queries' },
] as const

export default function SearchSubTabsNav() {
  const pathname = usePathname()
  return (
    <div className="flex border-b border-ih-border mb-6 overflow-x-auto">
      {SUB_TABS.map((tab) => {
        const active = pathname === tab.path || pathname?.startsWith(`${tab.path}/`)
        return (
          <Link
            key={tab.id}
            href={tab.path}
            className={`px-4 py-2.5 font-mono text-[12px] border-b-2 -mb-px whitespace-nowrap ${
              active
                ? 'border-ih-accent text-ih-ink'
                : 'border-transparent text-ih-muted hover:text-ih-ink-2'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
