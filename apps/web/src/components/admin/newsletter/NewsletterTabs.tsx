import { NavTabs } from '@indus/ui'

type Section = 'overview' | 'subscribers' | 'lists' | 'suppressions'

const TABS: { id: Section; label: string; href: string }[] = [
  { id: 'overview', label: 'Overview', href: '/admin/newsletter' },
  { id: 'subscribers', label: 'Subscribers', href: '/admin/newsletter/subscribers' },
  { id: 'lists', label: 'Lists', href: '/admin/newsletter/lists' },
  { id: 'suppressions', label: 'Suppressions', href: '/admin/newsletter/suppressions' },
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
