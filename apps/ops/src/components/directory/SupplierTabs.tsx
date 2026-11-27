'use client'

import { LinkTabs } from '@indus/ops-ui/controls'
import { usePathname } from 'next/navigation'

/** Board 129's seven tabs as URL segments; the active tab follows the path. */
const TABS = [
  ['overview', 'Overview'],
  ['contacts', 'Contacts'],
  ['quotes', 'RFQs and quotes'],
  ['prices', 'Prices'],
  ['orders', 'Orders'],
  ['documents', 'Documents'],
  ['notes', 'Notes and lessons'],
  ['line-card', 'Line card'],
] as const

export default function SupplierTabs({ id }: { id: string }) {
  const path = usePathname()
  const seg = path.split('/')[3] ?? 'overview'
  const active = TABS.some(([k]) => k === seg) ? seg : seg === 'history' ? 'history' : 'overview'
  return (
    <LinkTabs
      aria-label="Supplier sections"
      tabsStyle="record"
      active={active}
      items={[
        ...TABS.map(([key, label]) => ({
          key,
          label,
          href: key === 'overview' ? `/suppliers/${id}` : `/suppliers/${id}/${key}`,
        })),
        { key: 'history', label: 'History', href: `/suppliers/${id}/history` },
      ]}
    />
  )
}
