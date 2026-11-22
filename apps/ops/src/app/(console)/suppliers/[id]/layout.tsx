import { PageHeader } from '@indus/ops-ui/shell'
import { T7Settings } from '@indus/ops-ui/templates'
import type { ReactNode } from 'react'
import SubNav from '../../../../components/route/SubNav'
import { to } from '../../../../lib/routes'
import { recordId, routeParam, type SupplierSection } from '../../../../lib/route-params'

const SECTION_LABEL: Readonly<Record<SupplierSection, string>> = {
  contacts: 'Contacts',
  quotes: 'RFQs and quotes',
  prices: 'Prices',
  orders: 'Orders',
  documents: 'Documents',
  notes: 'Notes and lessons',
  history: 'History',
  'line-card': 'Line card',
}

/**
 * The supplier profile (boards 126, 129; T7): the header and the section sub-nav persist across sections.
 * S10 fills the header (name, type, tier, country) and the sections from one read. A malformed id is
 * notFound() (the suppliers segment's "not imported" state). Not an authorization boundary: every page
 * under it calls requireOpsUser() itself.
 */
export default async function SupplierLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ id: string }>
}) {
  const id = routeParam(recordId, (await params).id)
  const base = to(`/suppliers/${id}`)
  const items = [
    { label: 'Overview', href: base },
    ...(Object.keys(SECTION_LABEL) as SupplierSection[]).map((s) => ({
      label: SECTION_LABEL[s],
      href: to(`/suppliers/${id}/${s}`),
    })),
  ]
  return (
    <T7Settings
      header={<PageHeader crumb="Directory · Suppliers" title="Supplier" />}
      subnav={<SubNav groups={[{ items }]} />}
      subnavLabel="Supplier sections"
    >
      <div className="py-6">{children}</div>
    </T7Settings>
  )
}
