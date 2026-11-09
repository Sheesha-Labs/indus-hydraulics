import { DataTable, EmptyState, Field, Input, Panel } from '@indus/ui'
import type { Metadata } from 'next'
import Link from 'next/link'

import AdminPageShell from '../../../../../components/admin/AdminPageShell'
import ActionForm from '../../../../../components/admin/newsletter/ActionForm'
import NewsletterTabs from '../../../../../components/admin/newsletter/NewsletterTabs'
import { listSummaries } from '../../../../../lib/newsletter/admin'
import { ROLES } from '../../../../../lib/rbac'
import { requireStaffRole } from '../../../../../lib/staff-session'
import { createListAction } from '../actions'

export const metadata: Metadata = { title: 'Newsletter lists — Indus Admin' }
export const dynamic = 'force-dynamic'

export default async function NewsletterListsPage() {
  await requireStaffRole(ROLES.NEWSLETTER_WRITE)
  const lists = await listSummaries()

  return (
    <AdminPageShell title="Lists" sub={`${lists.length} list${lists.length === 1 ? '' : 's'}`}>
      <div className="flex flex-col gap-6">
        <NewsletterTabs active="lists" />

        <Panel>
          <h2 className="mb-1 text-[15px] font-medium text-ih-ink">New list</h2>
          <p className="mb-3 max-w-[70ch] text-[13.5px] text-ih-ink-2">
            A list is a set of addresses you can send a newsletter to, alongside or instead of the subscribers — an
            exhibition&apos;s visitors, a customer group. Only people who agreed to hear from Indus.
          </p>
          <ActionForm action={createListAction} submitLabel="Create list" pendingLabel="Creating…">
            <Field label="Name" className="min-w-[260px]">
              <Input name="name" required maxLength={120} placeholder="ADIPEC 2026 visitors" />
            </Field>
            <Field label="Description (optional)" className="min-w-[320px] flex-1">
              <Input name="description" maxLength={400} placeholder="Who is on it and how they agreed" />
            </Field>
          </ActionForm>
        </Panel>

        <DataTable
          minWidth="md"
          rows={lists}
          rowKey={(l) => l.id}
          columns={[
            {
              key: 'name',
              header: 'List',
              width: '44%',
              cell: (l) => (
                <div>
                  <Link href={`/admin/newsletter/lists/${l.id}`} className="font-medium text-ih-ink hover:underline">
                    {l.name}
                  </Link>
                  {l.description ? <p className="text-[12.5px] text-ih-muted">{l.description}</p> : null}
                </div>
              ),
            },
            { key: 'active', header: 'Can be mailed', numeric: true, cell: (l) => <span className="font-mono">{l.active.toLocaleString('en-US')}</span> },
            { key: 'total', header: 'On list', numeric: true, cell: (l) => <span className="font-mono">{l.total.toLocaleString('en-US')}</span> },
            { key: 'updated', header: 'Updated', cell: (l) => <span className="font-mono text-ih-ink-2">{l.updatedAt.toISOString().slice(0, 10)}</span> },
          ]}
          emptyState={<EmptyState condition="NO LISTS" message="Create a list above, then add addresses by hand or upload a CSV or Excel file." />}
        />
      </div>
    </AdminPageShell>
  )
}
