import { db } from '@indus/db'
import { DataTable, EmptyState, StatusPill } from '@indus/ui'
import type { Metadata } from 'next'

import AdminPageShell from '../../../../components/admin/AdminPageShell'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Suppliers — Indus Admin' }

const ORIGIN_LABEL: Record<string, string> = {
  brand: 'Brand',
  manual: 'Manual',
  research: 'Research',
  mail: 'Sent mail',
}

export default async function SuppliersPage() {
  const [suppliers, reachable] = await Promise.all([
    db.supplier.findMany({
      where: { status: 'active' },
      orderBy: [{ isAuthorizedDistributor: 'desc' }, { name: 'asc' }],
      take: 200,
      select: {
        id: true,
        name: true,
        country: true,
        kind: true,
        origin: true,
        isAuthorizedDistributor: true,
        rfqsSent: true,
        repliesReceived: true,
        _count: { select: { contacts: true } },
      },
    }),
    db.supplier.count({ where: { status: 'active', contacts: { some: {} } } }),
  ])

  const coverage = suppliers.length > 0 ? Math.round((reachable / suppliers.length) * 100) : 0

  return (
    <AdminPageShell
      title="Suppliers"
      sub={
        <span className="text-[13px] text-ih-muted">
          {suppliers.length} active · {reachable} reachable ({coverage}%) · contact coverage is the
          number that matters, not the supplier count
        </span>
      }
    >
      <DataTable
        minWidth="lg"
        rowKey={(row) => row.id}
        rows={suppliers}
        emptyState={
          <EmptyState
            condition="NO SUPPLIERS"
            message="Run the brand backfill to seed the ledger, or add a supplier by hand."
          />
        }
        columns={[
          {
            key: 'name',
            header: 'Supplier',
            width: '35%',
            cell: (row) => (
              <div className="flex flex-col gap-0.5">
                <span className="text-ih-ink">{row.name}</span>
                <span className="text-[12px] text-ih-muted">
                  {row.kind}
                  {row.country ? ` · ${row.country}` : ''}
                </span>
              </div>
            ),
          },
          {
            key: 'relationship',
            header: 'Relationship',
            cell: (row) =>
              row.isAuthorizedDistributor ? (
                <StatusPill tone="good" size="sm">
                  Authorised
                </StatusPill>
              ) : (
                <span className="text-ih-muted">—</span>
              ),
          },
          {
            key: 'origin',
            header: 'Source',
            cell: (row) => (
              <span className="font-mono text-[12px] text-ih-ink-2">
                {ORIGIN_LABEL[row.origin] ?? row.origin}
              </span>
            ),
          },
          {
            key: 'contacts',
            header: 'Contacts',
            numeric: true,
            cell: (row) =>
              row._count.contacts === 0 ? (
                <StatusPill tone="warn" size="sm">
                  None
                </StatusPill>
              ) : (
                <span className="font-mono">{row._count.contacts}</span>
              ),
          },
          {
            key: 'responsiveness',
            header: 'RFQs / replies',
            numeric: true,
            cell: (row) => (
              <span className="font-mono text-ih-ink-2">
                {row.rfqsSent} / {row.repliesReceived}
              </span>
            ),
          },
        ]}
      />
    </AdminPageShell>
  )
}
