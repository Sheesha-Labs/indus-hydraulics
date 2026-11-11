import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@indus/db'
import { ChevronRight, Mail, MessageCircle, Phone } from 'lucide-react'
import { Button, Panel } from '@indus/ui'

import AdminPageShell from '../../../../../../components/admin/AdminPageShell'
import EditorSection from '../../../../../../components/admin/EditorSection'
import { STAGE_LABEL, STATUS_LABEL, stageOf } from '../../../../../../lib/enquiry-inbox'
import { ROLES } from '../../../../../../lib/rbac'
import { requireStaffRole } from '../../../../../../lib/staff-session'
import CallbackActions from './CallbackActions'

export const metadata: Metadata = { title: 'Call-back — Indus Admin' }
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

const DATE_TIME = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dubai' })

const TRIGGER: Record<string, string> = {
  inactivity: 'after a pause on the page',
  exit: 'when leaving the site',
  tab_return: 'on coming back to the tab',
  manual: 'from the call-back button',
}

/**
 * One call-back request: who, how to reach them, what they asked about and
 * where they were on the site. Call-backs had no admin screen before the
 * Enquiries inbox — they only arrived by email.
 */
export default async function CallbackPage({ params }: Props) {
  await requireStaffRole(ROLES.RFQ_REVIEW)
  const { id } = await params
  const lead = await db.callbackLead.findUnique({ where: { id }, include: { assignedTo: { select: { name: true } } } })
  if (!lead) notFound()

  const ref = `CB-${lead.id.slice(0, 6).toUpperCase()}`
  const wa = lead.phoneE164.replace(/[^\d]/g, '')
  const utm = [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(' / ')

  return (
    <AdminPageShell
      title={lead.name}
      breadcrumbs={
        <span className="inline-flex min-w-0 items-center gap-1">
          <Link href="/admin/enquiries?source=callback">Enquiries</Link>
          <ChevronRight size={11} aria-hidden="true" className="shrink-0" />
          <span className="tabular-nums">{ref}</span>
        </span>
      }
      bodyClassName="max-w-[1200px]"
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-5">
          <EditorSection title="Call them back" description={lead.deskOpen ? 'Asked while the desk was open.' : 'Asked outside desk hours.'}>
            <div className="flex flex-wrap gap-2">
              <Button asChild kind="primary" size="dense">
                <a href={`tel:${lead.phoneE164}`}>
                  <Phone size={14} aria-hidden="true" />
                  <span className="tabular-nums">{lead.phoneE164}</span>
                </a>
              </Button>
              <Button asChild kind="outline" size="dense">
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
                  <MessageCircle size={14} aria-hidden="true" />
                  WhatsApp
                </a>
              </Button>
              <Button asChild kind="outline" size="dense">
                <a href={`mailto:${lead.email}`}>
                  <Mail size={14} aria-hidden="true" />
                  {lead.email}
                </a>
              </Button>
            </div>
          </EditorSection>

          <EditorSection title="What they asked about">
            <dl className="grid grid-cols-[140px_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-[13.5px]">
              <dt className="text-ih-muted">Topic</dt>
              <dd className="text-ih-ink">{lead.category ? lead.category.replace(/_/g, ' ') : '—'}</dd>
              <dt className="text-ih-muted">Message</dt>
              <dd className="whitespace-pre-wrap break-words text-ih-ink">{lead.description || '—'}</dd>
              <dt className="text-ih-muted">On the page</dt>
              <dd className="break-words text-ih-ink-2">
                {lead.pageUrl ? (
                  <a href={lead.pageUrl} target="_blank" rel="noreferrer" className="text-ih-accent hover:text-ih-navy">
                    {lead.pageTitle || lead.pageUrl}
                  </a>
                ) : (
                  '—'
                )}
              </dd>
              <dt className="text-ih-muted">Asked</dt>
              <dd className="text-ih-ink-2">{TRIGGER[lead.trigger] ?? lead.trigger}</dd>
              {lead.market ? (
                <>
                  <dt className="text-ih-muted">Market page</dt>
                  <dd className="text-ih-ink-2">{lead.market}</dd>
                </>
              ) : null}
              {utm ? (
                <>
                  <dt className="text-ih-muted">Campaign</dt>
                  <dd className="text-ih-ink-2">{utm}</dd>
                </>
              ) : null}
              {lead.referrer ? (
                <>
                  <dt className="text-ih-muted">Came from</dt>
                  <dd className="break-words text-ih-ink-2">{lead.referrer}</dd>
                </>
              ) : null}
            </dl>
          </EditorSection>
        </div>

        <aside className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-6">
          <Panel padding="rail" className="flex flex-col gap-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-ih-muted">Status</p>
            <dl className="flex flex-col gap-2 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ih-muted">Stage</dt>
                <dd className="text-ih-ink-2">
                  {STAGE_LABEL[stageOf('callback', lead.status)]}
                  {(STATUS_LABEL[lead.status] ?? lead.status) !== STAGE_LABEL[stageOf('callback', lead.status)] ? ` · ${STATUS_LABEL[lead.status] ?? lead.status}` : ''}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ih-muted">Received</dt>
                <dd className="text-ih-ink-2">{DATE_TIME.format(lead.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ih-muted">With</dt>
                <dd className="text-ih-ink-2">{lead.assignedTo?.name ?? 'Unassigned'}</dd>
              </div>
            </dl>
            <CallbackActions id={lead.id} status={lead.status} notes={lead.notes} />
          </Panel>
        </aside>
      </div>
    </AdminPageShell>
  )
}
