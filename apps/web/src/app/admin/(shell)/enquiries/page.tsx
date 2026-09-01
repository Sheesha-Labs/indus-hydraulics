import { db } from '@indus/db'
import { Button, DataTable, EmptyState, StatusPill } from '@indus/ui'
import Link from 'next/link'

import AdminPageShell from '../../../../components/admin/AdminPageShell'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  triage: 'Triage',
  researching: 'Researching',
  rfq_sent: 'RFQ sent',
  comparing: 'Comparing',
  quoted: 'Quoted',
  won: 'Won',
  lost: 'Lost',
  abandoned: 'Abandoned',
}

function daysLeft(closingAt: Date | null): string {
  if (!closingAt) return '—'
  const ms = closingAt.getTime() - Date.now()
  const days = Math.ceil(ms / 86_400_000)
  if (days < 0) return 'Closed'
  if (days === 0) return 'Today'
  return `${days}d`
}

export default async function EnquiriesPage() {
  const enquiries = await db.enquiry.findMany({
    orderBy: [{ closingAt: 'asc' }, { createdAt: 'desc' }],
    take: 100,
    select: {
      id: true,
      code: true,
      title: true,
      buyerName: true,
      status: true,
      closingAt: true,
      createdAt: true,
      _count: { select: { lines: true } },
    },
  })

  return (
    <AdminPageShell
      title="Enquiries"
      sub="Inbound procurement enquiries pasted in for research and quoting."
      actions={
        <Button asChild kind="primary" size="dense">
          <Link href="/admin/enquiries/new">New enquiry</Link>
        </Button>
      }
    >
      <DataTable
          minWidth="lg"
          rowKey={(row) => row.id}
          rows={enquiries}
          columns={[
            {
              key: 'code',
              header: 'Code',
              width: '25%',
              cell: (row) => (
                <Link className="font-mono text-ih-ink hover:underline" href={`/admin/enquiries/${row.code}`}>
                  {row.code}
                </Link>
              ),
            },
            {
              key: 'title',
              header: 'Title',
              cell: (row) => (
                <div>
                  <p className="text-ih-ink">{row.title}</p>
                  {row.buyerName ? <p className="text-[12px] text-ih-muted">{row.buyerName}</p> : null}
                </div>
              ),
            },
            {
              key: 'lines',
              header: 'Lines',
              numeric: true,
              cell: (row) => <span className="font-mono">{row._count.lines}</span>,
            },
            {
              key: 'closing',
              header: 'Closes',
              cell: (row) => <span className="font-mono text-ih-ink-2">{daysLeft(row.closingAt)}</span>,
            },
            {
              key: 'status',
              header: 'Status',
              cell: (row) => <StatusPill>{STATUS_LABEL[row.status] ?? row.status}</StatusPill>,
            },
          ]}
          emptyState={
            <EmptyState
              condition="NO ENQUIRIES"
              message="Paste a procurement enquiry to extract its line items and start research."
              action={
                <Button asChild kind="primary" size="dense">
                  <Link href="/admin/enquiries/new">New enquiry</Link>
                </Button>
              }
            />
          }
        />
    </AdminPageShell>
  )
}
