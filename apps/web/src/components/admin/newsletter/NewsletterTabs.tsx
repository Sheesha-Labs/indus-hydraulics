import Link from 'next/link'
import { Ban, LayoutTemplate, ListChecks, Send, Settings, Users, type LucideIcon } from 'lucide-react'

type Section = 'campaigns' | 'templates' | 'subscribers' | 'lists' | 'suppressions' | 'settings'

const TABS: { id: Section; label: string; href: string; icon: LucideIcon }[] = [
  { id: 'campaigns', label: 'Newsletters', href: '/admin/newsletter', icon: Send },
  { id: 'templates', label: 'Templates', href: '/admin/newsletter/templates', icon: LayoutTemplate },
  { id: 'subscribers', label: 'Subscribers', href: '/admin/newsletter/subscribers', icon: Users },
  { id: 'lists', label: 'Lists', href: '/admin/newsletter/lists', icon: ListChecks },
  { id: 'suppressions', label: 'Suppressions', href: '/admin/newsletter/suppressions', icon: Ban },
  { id: 'settings', label: 'Sender', href: '/admin/newsletter/settings', icon: Settings },
]

/**
 * The newsletter section's own tabs — Bazar's segmented bar: an icon, the
 * name and, where the page knows it, a count.
 */
export default function NewsletterTabs({ active, counts }: { active: Section; counts?: Partial<Record<Section, number>> }) {
  return (
    <nav aria-label="Newsletter sections" className="inline-flex max-w-full flex-wrap gap-0.5 self-start rounded-md border border-ih-border bg-ih-surface p-0.5">
      {TABS.map(({ id, label, href, icon: Icon }) => {
        const on = id === active
        const n = counts?.[id]
        return (
          <Link
            key={id}
            href={href}
            aria-current={on ? 'page' : undefined}
            className={`inline-flex h-8 items-center gap-1.5 rounded px-3 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ih-accent-soft ${
              on ? 'bg-ih-navy font-medium text-ih-bg' : 'text-ih-ink-2 hover:bg-ih-surface-2 hover:text-ih-ink'
            }`}
          >
            <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
            {label}
            {n !== undefined ? <span className={`tabular-nums text-[11.5px] ${on ? 'text-ih-bg/75' : 'text-ih-muted'}`}>{n.toLocaleString('en-US')}</span> : null}
          </Link>
        )
      })}
    </nav>
  )
}
