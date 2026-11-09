import { MARKETING_DOMAIN } from '@indus/domain'
import { sendingDomainStatus } from '@indus/email'
import { Callout, Field, Input, Panel } from '@indus/ui'
import type { Metadata } from 'next'

import AdminPageShell from '../../../../../components/admin/AdminPageShell'
import ActionForm from '../../../../../components/admin/newsletter/ActionForm'
import NewsletterTabs from '../../../../../components/admin/newsletter/NewsletterTabs'
import { loadSenderSettings } from '../../../../../lib/newsletter/campaigns'
import { ROLES } from '../../../../../lib/rbac'
import { requireStaffRole } from '../../../../../lib/staff-session'
import { saveSenderSettingsAction } from '../campaign-actions'

export const metadata: Metadata = { title: 'Newsletter sender — Indus Admin' }
export const dynamic = 'force-dynamic'

const STATUS_COPY = {
  verified: { tone: 'success', text: `${MARKETING_DOMAIN} is verified in Resend — newsletters can send from it.` },
  pending: { tone: 'warning', text: `${MARKETING_DOMAIN} is waiting for its DNS records to verify in Resend. Sends will fail until it does.` },
  failed: { tone: 'danger', text: `${MARKETING_DOMAIN} failed verification in Resend. Check its DNS records before sending.` },
  not_found: { tone: 'danger', text: `${MARKETING_DOMAIN} is not set up in Resend. Newsletters cannot send until it is added and verified.` },
  unknown: { tone: 'neutral', text: `Could not check ${MARKETING_DOMAIN} with Resend from here.` },
} as const

export default async function NewsletterSettingsPage() {
  await requireStaffRole(ROLES.NEWSLETTER_SEND)
  const [settings, domain] = await Promise.all([loadSenderSettings(), sendingDomainStatus(MARKETING_DOMAIN)])
  const status = STATUS_COPY[domain]

  return (
    <AdminPageShell title="Sender" sub="Who newsletters come from, and where replies go">
      <div className="flex flex-col gap-6">
        <NewsletterTabs active="settings" />
        <Callout tone={status.tone}>{status.text}</Callout>
        <Panel>
          <ActionForm action={saveSenderSettingsAction} submitLabel="Save sender" kind="primary">
            <Field label="From name" hint="What inboxes show as the sender." className="min-w-[240px]">
              <Input name="fromName" required maxLength={80} defaultValue={settings.fromName} />
            </Field>
            <Field label="From address" hint={`Always on ${MARKETING_DOMAIN}, never the domain quotes are sent from.`} className="min-w-[320px]">
              <div className="flex items-center gap-1.5">
                <Input name="fromLocal" required maxLength={64} defaultValue={settings.fromLocal} className="w-40" aria-label="From address, before the @" />
                <span className="font-mono text-[13px] text-ih-muted">@{MARKETING_DOMAIN}</span>
              </div>
            </Field>
            <Field label="Reply-To" hint="Replies to a newsletter land here — a real, watched inbox." className="min-w-[280px]">
              <Input name="replyTo" type="email" required maxLength={254} defaultValue={settings.replyTo} />
            </Field>
          </ActionForm>
        </Panel>
      </div>
    </AdminPageShell>
  )
}
