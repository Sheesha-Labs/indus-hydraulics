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
    <div className="border-ih-border mb-6 flex overflow-x-auto border-b">
      {SUB_TABS.map((tab) => {
        const active = pathname === tab.path || pathname?.startsWith(`${tab.path}/`)
        return (
          <Link
            key={tab.id}
            href={tab.path}
            className={`-mb-px border-b-2 px-4 py-2.5 text-[12px] whitespace-nowrap tabular-nums ${
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
