'use client'

import { useTransition, useState } from 'react'
import Link from 'next/link'
import type { StoreSettings, EmailTemplate } from '@indus/db'
import { saveStoreSettings, saveEmailTemplate } from '../app/(shell)/settings/actions'

interface Props {
  activeTab: string
  storeSettings: StoreSettings | null
  emailTemplates: EmailTemplate[]
}

const TABS = [
  { id: 'store', label: 'Store' },
  { id: 'emails', label: 'Email Templates' },
]

const INCOTERMS = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FOB', 'CFR', 'CIF']

const EMAIL_KINDS = [
  { kind: 'rfq_ack', label: 'RFQ Acknowledgement', description: 'Sent to customer when RFQ is submitted' },
  { kind: 'quote_sent', label: 'Quote Ready', description: 'Sent to customer when quote is issued' },
  { kind: 'password_reset', label: 'Password Reset', description: 'Sent when customer requests a password reset' },
  { kind: 'order_shipped', label: 'Order Shipped', description: 'Sent to customer when order is shipped' },
]

export default function SettingsPageClient({ activeTab, storeSettings, emailTemplates }: Props) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedEmail, setSelectedEmail] = useState<string>(EMAIL_KINDS[0]!.kind)

  const templateMap = Object.fromEntries(emailTemplates.map((t) => [t.kind, t]))
  const currentTemplate = templateMap[selectedEmail]

  function handleStoreSettings(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await saveStoreSettings(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      setSaved('store')
      setTimeout(() => setSaved(null), 3000)
    })
  }

  function handleEmailTemplate(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await saveEmailTemplate(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      setSaved(selectedEmail)
      setTimeout(() => setSaved(null), 3000)
    })
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] mb-6">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={`?tab=${tab.id}`}
            className={`px-4 py-2.5 font-mono text-[12px] border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-[var(--color-accent)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-body)]'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Store Settings */}
      {activeTab === 'store' && (
        <form action={handleStoreSettings} className="max-w-[560px] space-y-5">
          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Store Name
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={storeSettings?.name ?? 'Indus Hydraulics'}
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Support Email
            </label>
            <input
              name="supportEmail"
              type="email"
              defaultValue={storeSettings?.supportEmail ?? ''}
              placeholder="support@indushydraulics.com"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Default Incoterm
            </label>
            <select
              name="defaultIncoterm"
              defaultValue={storeSettings?.defaultIncoterm ?? ''}
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none"
            >
              <option value="">— None —</option>
              {INCOTERMS.map((term) => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Default Payment Terms (days)
            </label>
            <select
              name="defaultPaymentTerms"
              defaultValue={storeSettings?.defaultPaymentTerms ?? 30}
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none"
            >
              {[0, 7, 14, 30, 45, 60, 90].map((days) => (
                <option key={days} value={days}>
                  {days === 0 ? 'Prepayment' : `Net ${days}`}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
            <h3 className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-3">
              Brand identity
            </h3>
            <p className="text-[12px] text-[var(--color-muted)] mb-4">
              Rendered in the storefront footer brand block. The store name above is reused as the brand name.
            </p>
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Tagline
            </label>
            <textarea
              name="tagline"
              rows={2}
              maxLength={280}
              defaultValue={storeSettings?.tagline ?? ''}
              placeholder="India's trusted distributor of industrial hydraulic components since 2005."
              className="w-full px-3 py-2 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)] resize-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Certification line
            </label>
            <input
              name="certificationLine"
              type="text"
              maxLength={120}
              defaultValue={storeSettings?.certificationLine ?? ''}
              placeholder="ISO 9001:2015 Certified"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--color-border)]">
            <h3 className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--color-muted)] mb-3">
              Public contact info
            </h3>
            <p className="text-[12px] text-[var(--color-muted)] mb-4">
              Rendered in the storefront header topbar (phone + hours) and footer contact block.
            </p>
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Location label
            </label>
            <input
              name="contactLocationLabel"
              type="text"
              maxLength={80}
              defaultValue={storeSettings?.contactLocationLabel ?? ''}
              placeholder="Mumbai HQ"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Phone
            </label>
            <input
              name="contactPhone"
              type="text"
              maxLength={40}
              defaultValue={storeSettings?.contactPhone ?? ''}
              placeholder="+91 22 6614 0200"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Public email
            </label>
            <input
              name="contactEmail"
              type="email"
              defaultValue={storeSettings?.contactEmail ?? ''}
              placeholder="sales@indushydraulics.com"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              Hours
            </label>
            <input
              name="contactHours"
              type="text"
              maxLength={120}
              defaultValue={storeSettings?.contactHours ?? ''}
              placeholder="Mon–Sat 09:00–19:00 IST"
              className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="h-9 px-5 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save Settings'}
            </button>
            {saved === 'store' && (
              <span className="font-mono text-[11px] text-[var(--color-good)]">Saved ✓</span>
            )}
            {error && activeTab === 'store' && (
              <span className="font-mono text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">{error}</span>
            )}
          </div>
        </form>
      )}

      {/* Email Templates */}
      {activeTab === 'emails' && (
        <div className="grid grid-cols-[240px_1fr] gap-6">
          {/* Template list */}
          <div className="border border-[var(--color-border)] overflow-hidden h-fit">
            {EMAIL_KINDS.map((ek) => (
              <button
                key={ek.kind}
                onClick={() => setSelectedEmail(ek.kind)}
                className={`w-full text-left px-4 py-3 border-b border-[var(--color-border)] last:border-0 transition-colors ${
                  selectedEmail === ek.kind
                    ? 'bg-[var(--color-deep)] border-l-2 border-l-[var(--color-accent)]'
                    : 'hover:bg-[var(--color-deep)]'
                }`}
              >
                <div className="text-[13px] font-medium text-[var(--color-primary)] mb-0.5">{ek.label}</div>
                <div className="font-mono text-[10px] text-[var(--color-muted)]">{ek.description}</div>
                {templateMap[ek.kind] && (
                  <div className="mt-1 font-mono text-[9px] px-1.5 py-0.5 bg-[var(--color-good-soft)] text-[var(--color-good)] inline-block">
                    configured
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Template editor */}
          <div>
            {(() => {
              const meta = EMAIL_KINDS.find((e) => e.kind === selectedEmail)!
              return (
                <form action={handleEmailTemplate} key={selectedEmail} className="space-y-4">
                  <input type="hidden" name="kind" value={selectedEmail} />

                  <div>
                    <div className="mb-3">
                      <h2 className="text-[16px] font-semibold">{meta.label}</h2>
                      <p className="text-[12px] text-[var(--color-muted)]">{meta.description}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                      Subject Line
                    </label>
                    <input
                      name="subject"
                      type="text"
                      required
                      defaultValue={currentTemplate?.subject ?? ''}
                      placeholder={`Email subject for ${meta.label}`}
                      className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                      Body HTML
                    </label>
                    <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-3 mb-1.5">
                      <p className="font-mono text-[10px] text-[var(--color-muted)]">
                        Available variables:{' '}
                        <code className="bg-[var(--color-deep)] px-1">{'{{name}}'}</code>{' '}
                        <code className="bg-[var(--color-deep)] px-1">{'{{rfqCode}}'}</code>{' '}
                        <code className="bg-[var(--color-deep)] px-1">{'{{link}}'}</code>
                      </p>
                    </div>
                    <textarea
                      name="bodyHtml"
                      rows={16}
                      required
                      defaultValue={currentTemplate?.bodyHtml ?? ''}
                      className="w-full px-3 py-2.5 border border-[var(--color-border)] bg-[var(--color-elevated)] font-mono text-[12px] focus:outline-none focus:border-[var(--color-accent)] resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="h-9 px-5 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90 disabled:opacity-50"
                    >
                      {isPending ? 'Saving…' : 'Save Template'}
                    </button>
                    {saved === selectedEmail && (
                      <span className="font-mono text-[11px] text-[var(--color-good)]">Saved ✓</span>
                    )}
                    {error && activeTab === 'emails' && (
                      <span className="font-mono text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">{error}</span>
                    )}
                  </div>
                </form>
              )
            })()}
          </div>
        </div>
      )}
    </>
  )
}
