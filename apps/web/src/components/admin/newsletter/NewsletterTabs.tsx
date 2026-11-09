import { NavTabs } from '@indus/ui'

type Section = 'campaigns' | 'templates' | 'subscribers' | 'lists' | 'suppressions' | 'settings'

const TABS: { id: Section; label: string; href: string }[] = [
  { id: 'campaigns', label: 'Newsletters', href: '/admin/newsletter' },
  { id: 'templates', label: 'Templates', href: '/admin/newsletter/templates' },
  { id: 'subscribers', label: 'Subscribers', href: '/admin/newsletter/subscribers' },
  { id: 'lists', label: 'Lists', href: '/admin/newsletter/lists' },
  { id: 'suppressions', label: 'Suppressions', href: '/admin/newsletter/suppressions' },
  { id: 'settings', label: 'Sender', href: '/admin/newsletter/settings' },
]

/** The newsletter section's own tabs, under the page bar. */
export default function NewsletterTabs({ active }: { active: Section }) {
  return (
    <NavTabs
      label="Newsletter sections"
      items={TABS.map((t) => ({ href: t.href, label: t.label, active: t.id === active }))}
    />
  )
}
