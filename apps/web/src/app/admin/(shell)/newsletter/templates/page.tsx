import { db } from '@indus/db'
import { DataTable, EmptyState, Field, Input } from '@indus/ui'
import type { Metadata } from 'next'

import AdminPageShell from '../../../../../components/admin/AdminPageShell'
import ActionButton from '../../../../../components/admin/newsletter/ActionButton'
import ActionForm from '../../../../../components/admin/newsletter/ActionForm'
import NewsletterTabs from '../../../../../components/admin/newsletter/NewsletterTabs'
import StartCampaignButton from '../../../../../components/admin/newsletter/StartCampaignButton'
import { ROLES } from '../../../../../lib/rbac'
import { requireStaffRole } from '../../../../../lib/staff-session'
import { deleteTemplateAction, renameTemplateAction } from '../campaign-actions'

export const metadata: Metadata = { title: 'Newsletter templates — Indus Admin' }
export const dynamic = 'force-dynamic'

export default async function NewsletterTemplatesPage() {
  await requireStaffRole(ROLES.NEWSLETTER_WRITE)
  const templates = await db.newsletterTemplate.findMany({
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true, description: true, format: true, updatedAt: true, createdBy: { select: { name: true } } },
  })

  return (
    <AdminPageShell title="Templates" sub="Saved designs to start a newsletter from. Save one from any newsletter's editor.">
      <div className="flex flex-col gap-6">
        <NewsletterTabs active="templates" />
        <DataTable
          minWidth="lg"
          rows={templates}
          rowKey={(t) => t.id}
          columns={[
            {
              key: 'name',
              header: 'Template',
              width: '50%',
              cell: (t) => (
                <ActionForm action={renameTemplateAction.bind(null, t.id)} submitLabel="Rename" kind="ghost">
                  <Field label={<span className="sr-only">Name</span>} className="min-w-[200px] flex-1">
                    <Input name="name" required maxLength={120} defaultValue={t.name} />
                  </Field>
                  <Field label={<span className="sr-only">Description</span>} className="min-w-[200px] flex-1">
                    <Input name="description" maxLength={400} defaultValue={t.description} placeholder="What it is for" />
                  </Field>
                </ActionForm>
              ),
            },
            { key: 'format', header: 'Kind', cell: (t) => <span className="text-ih-ink-2">{t.format === 'rich' ? 'Rich text' : 'Blocks'}</span> },
            {
              key: 'by',
              header: 'Saved',
              cell: (t) => (
                <span className="font-mono text-ih-ink-2">
                  {t.updatedAt.toISOString().slice(0, 10)}
                  {t.createdBy ? ` · ${t.createdBy.name}` : ''}
                </span>
              ),
            },
            {
              key: 'actions',
              header: <span className="sr-only">Actions</span>,
              cell: (t) => (
                <div className="flex flex-wrap justify-end gap-1">
                  <StartCampaignButton input={{ templateId: t.id }} label="Use" kind="outline" />
                  <ActionButton action={deleteTemplateAction.bind(null, t.id)} confirm={`Delete the template “${t.name}”? Newsletters made from it are not affected.`} aria-label={`Delete template ${t.name}`} trash>
                    Delete
                  </ActionButton>
                </div>
              ),
            },
          ]}
          emptyState={<EmptyState condition="NO TEMPLATES" message="Open a newsletter and use “Save as template” to keep its design for next time." />}
        />
      </div>
    </AdminPageShell>
  )
}
