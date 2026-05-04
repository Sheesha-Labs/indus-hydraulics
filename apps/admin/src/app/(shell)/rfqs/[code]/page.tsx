import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@indus/db'
import { getValidTransitions } from '@indus/domain'
import { updateRfqStatus, saveLineReview } from './actions'
import SendQuoteComposer from '../../../../components/SendQuoteComposer'
import { formatAed, formatDayMonthYear } from '../../../../lib/format'

export const metadata: Metadata = { title: 'RFQ Detail — Indus Admin' }

type Props = {
  params: Promise<{ code: string }>
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  engineer_review: 'Under Review',
  engineer_questions_pending: 'Questions Pending',
  quote_sent: 'Quote Sent',
  accepted: 'Accepted',
  declined: 'Declined',
  expired: 'Expired',
  cancelled: 'Cancelled',
  order_created: 'Order Created',
}

const TRANSITION_LABELS: Record<string, string> = {
  engineer_review: 'Move to Review',
  engineer_questions_pending: 'Mark Questions Pending',
  quote_sent: 'Mark Quote Sent',
  accepted: 'Mark Accepted',
  declined: 'Decline',
  cancelled: 'Cancel',
  order_created: 'Mark Order Placed',
  shipped: 'Mark Shipped',
  delivered: 'Mark Delivered',
}

const TRANSITION_STYLES: Record<string, string> = {
  engineer_review: 'bg-[oklch(0.4_0.12_220)] text-white hover:bg-[oklch(0.35_0.12_220)]',
  engineer_questions_pending: 'bg-[oklch(0.5_0.12_60)] text-white hover:opacity-90',
  quote_sent: 'bg-[oklch(0.4_0.14_160)] text-white hover:opacity-90',
  accepted: 'bg-[oklch(0.4_0.14_145)] text-white hover:opacity-90',
  declined: 'border border-[oklch(0.75_0.1_25)] text-[oklch(0.5_0.1_25)] hover:bg-[oklch(0.97_0.02_25)]',
  cancelled: 'border border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-deep)]',
  order_created: 'bg-[oklch(0.45_0.13_260)] text-white hover:opacity-90',
  shipped: 'bg-[oklch(0.45_0.13_220)] text-white hover:opacity-90',
  delivered: 'bg-[oklch(0.4_0.14_145)] text-white hover:opacity-90',
}

const URGENCY_LABEL: Record<string, string> = {
  routine: 'Routine',
  priority: '🟡 Priority',
  plant_down: '🔴 Plant Down',
}

export default async function AdminRfqDetailPage({ params }: Props) {
  const { code } = await params

  const rfq = await db.rfq.findUnique({
    where: { code },
    include: {
      account: { select: { legalName: true, code: true, id: true } },
      submittedBy: { select: { firstName: true, lastName: true, email: true } },
      assignedEngineer: { select: { id: true, name: true } },
      assignedRep: { select: { id: true, name: true } },
      shipToAddress: true,
      lines: {
        include: {
          product: {
            select: { sku: true, title: true, images: { take: 1, orderBy: { position: 'asc' }, include: { media: true } } },
          },
        },
        orderBy: { position: 'asc' },
      },
      attachments: { include: { media: true } },
      quotes: { orderBy: { revision: 'desc' }, include: { pdfMedia: true } },
    },
  })

  if (!rfq) notFound()

  const [engineers, settings] = await Promise.all([
    db.staffUser.findMany({
      where: { isActive: true, role: { in: ['engineer', 'super_admin', 'manager'] } },
      select: { id: true, name: true },
    }),
    db.storeSettings.findFirst(),
  ])

  const validTransitions = getValidTransitions(rfq.status)

  // Compose preview-of-totals values for the SendQuoteComposer
  const currentSubtotal = rfq.lines.reduce(
    (sum, l) => sum + l.requestedQty * Number(l.engineerUnitPrice ?? 0),
    0,
  )
  const isUaeShipTo = rfq.shipToAddress?.countryCode?.toUpperCase() === 'AE'
  const defaultVatRatePct = isUaeShipTo ? Number(settings?.defaultVatRatePct ?? 5) : 0
  const canCompose = ['engineer_review', 'engineer_questions_pending', 'quote_sent'].includes(rfq.status)

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <Link href={`/rfqs`} className="font-mono text-[12px] text-[var(--color-muted)] hover:text-[var(--color-primary)] mb-2 inline-block">
            ← RFQ Queue
          </Link>
          <h1 className="text-[24px] font-semibold tracking-tight">{rfq.code}</h1>
          {rfq.subject && <p className="text-[14px] text-[var(--color-muted)] mt-1">{rfq.subject}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={rfq.status} />
          <div className="font-mono text-[11px] text-[var(--color-muted)]">
            {URGENCY_LABEL[rfq.urgency] ?? rfq.urgency}
          </div>
        </div>
      </div>

      {/* Status action buttons + quote preview link */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-6 border-b border-[var(--color-border)]">
        {validTransitions.map((transition) => (
          <form
            key={transition}
            action={async () => {
              'use server'
              await updateRfqStatus(rfq.id, transition)
            }}
          >
            <button
              type="submit"
              className={`h-9 px-4 font-mono text-[12px] transition-colors ${TRANSITION_STYLES[transition] ?? 'border border-[var(--color-border)] text-[var(--color-body)] hover:bg-[var(--color-deep)]'}`}
            >
              {TRANSITION_LABELS[transition] ?? transition}
            </button>
          </form>
        ))}
        <a
          href={`/api/rfqs/${rfq.code}/preview-pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 px-4 ml-auto inline-flex items-center gap-1.5 border border-[var(--color-border)] font-mono text-[12px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors"
          title="Open the quote PDF preview in a new tab. Uses current line prices and store defaults."
        >
          Preview Quote PDF →
        </a>
      </div>

      {/* Issued quotes (revisions history) — show only after the first send */}
      {rfq.quotes.length > 0 ? (
        <div className="border border-[var(--color-border)] mb-6">
          <div className="px-4 py-2 bg-[var(--color-deep)] border-b border-[var(--color-border)] font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
            Issued quotes
          </div>
          {rfq.quotes.map((q) => (
            <div
              key={q.id}
              className="grid grid-cols-[1fr_140px_120px_140px_auto] gap-3 items-center px-4 py-3 border-b border-[var(--color-border)] last:border-0 text-[13px]"
            >
              <div>
                <div className="font-mono text-[13px] text-[var(--color-primary)]">
                  {q.code}
                  {q.revision > 1 ? <span className="text-[var(--color-muted)] ml-2">R{q.revision}</span> : null}
                </div>
                <div className="font-mono text-[10px] text-[var(--color-caption)] mt-0.5">
                  Sent {q.sentAt ? formatDayMonthYear(q.sentAt) : '—'}
                </div>
              </div>
              <div className="text-right text-[var(--color-body)] font-mono text-[12px]">
                {formatAed(Number(q.total))}
              </div>
              <div className="text-right text-[var(--color-muted)] font-mono text-[11px]">
                Net {q.termsValidityDays}d
              </div>
              <div className="text-right text-[var(--color-muted)] font-mono text-[11px]">
                {q.expiresAt ? `exp ${formatDayMonthYear(q.expiresAt)}` : '—'}
              </div>
              <div className="text-right">
                {q.pdfMedia ? (
                  <a
                    href={`/api/quotes/${q.code}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-[var(--color-accent)] hover:underline"
                  >
                    Download PDF →
                  </a>
                ) : (
                  <span className="font-mono text-[11px] text-[var(--color-muted)]">no PDF</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Send-Quote composer (only when state allows) */}
      {canCompose ? (
        <SendQuoteComposer
          rfqId={rfq.id}
          rfqCode={rfq.code}
          defaultValidityDays={settings?.defaultQuoteValidityDays ?? 30}
          defaultPaymentTerms={'Advance with order'}
          defaultNotes={settings?.defaultQuoteNotes ?? ''}
          defaultVatRatePct={defaultVatRatePct}
          currentSubtotal={currentSubtotal}
          rfqSubject={rfq.subject ?? null}
          hasExistingQuote={rfq.quotes.length > 0}
        />
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
        {/* Main: engineer review form */}
        <div>
          <form
            action={async (fd: FormData) => {
              'use server'
              const r = await saveLineReview(fd)
              if (!r.success) throw new Error(r.message)
            }}
          >
            <input type="hidden" name="rfqId" value={rfq.id} />

            <h2 className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-3">
              Line Items ({rfq.lines.length})
            </h2>

            <div className="border border-[var(--color-border)] mb-4">
              {/* Header */}
              <div className="grid grid-cols-[1fr_120px_120px] px-4 py-2 bg-[var(--color-surface)] border-b border-[var(--color-border)] font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
                <div>Product</div>
                <div className="text-right">Unit Price (AED)</div>
                <div className="text-right">Lead Time (days)</div>
              </div>

              {rfq.lines.map((line, i) => (
                <div key={line.id} className={`border-b border-[var(--color-border)] last:border-0 ${i % 2 === 0 ? 'bg-[var(--color-elevated)]' : 'bg-[var(--color-surface)]'}`}>
                  <div className="grid grid-cols-[1fr_120px_120px] px-4 py-3 items-center">
                    <div>
                      <div className="text-[13px] font-medium">{line.product.title}</div>
                      <div className="font-mono text-[11px] text-[var(--color-muted)]">{line.product.sku}</div>
                      <div className="font-mono text-[11px] text-[var(--color-caption)] mt-0.5">
                        Qty requested: {line.requestedQty}
                        {line.customerTargetPrice && ` · Target: AED ${Number(line.customerTargetPrice).toFixed(2)}`}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <input
                        type="number"
                        name={`unitPrice_${line.id}`}
                        defaultValue={line.engineerUnitPrice ? Number(line.engineerUnitPrice).toString() : ''}
                        step="0.01"
                        min="0"
                        placeholder="—"
                        className="w-24 h-8 px-2 border border-[var(--color-border)] bg-[var(--color-elevated)] font-mono text-[13px] text-[var(--color-primary)] text-right focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-caption)]"
                      />
                    </div>
                    <div className="flex justify-end">
                      <input
                        type="number"
                        name={`leadTime_${line.id}`}
                        defaultValue={line.engineerLeadTimeDays ?? ''}
                        min="0"
                        placeholder="—"
                        className="w-24 h-8 px-2 border border-[var(--color-border)] bg-[var(--color-elevated)] font-mono text-[13px] text-[var(--color-primary)] text-right focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-caption)]"
                      />
                    </div>
                  </div>
                  {/* Line note */}
                  <div className="px-4 pb-3">
                    <input
                      type="text"
                      name={`lineNote_${line.id}`}
                      defaultValue={line.engineerNotes ?? ''}
                      placeholder="Engineer note for this line (optional)"
                      className="w-full h-7 px-2 border border-[var(--color-border)] bg-transparent font-mono text-[11px] text-[var(--color-body)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Internal notes */}
            <div className="mb-4">
              <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
                Internal Notes
              </label>
              <textarea
                name="internalNotes"
                defaultValue={rfq.internalNotes ?? ''}
                rows={4}
                placeholder="Notes visible to staff only — not shown to customer"
                className="w-full px-3 py-2.5 border border-[var(--color-border)] bg-[var(--color-elevated)] font-mono text-[13px] text-[var(--color-primary)] placeholder:text-[var(--color-caption)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
              />
            </div>

            <button
              type="submit"
              className="h-10 px-6 bg-[var(--color-primary)] text-[var(--color-elevated)] font-mono text-[12px] hover:bg-[var(--color-body)] transition-colors"
            >
              Save Review
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Account */}
          <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
            <h3 className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-3">Account</h3>
            <Link href={`/customers/${rfq.account.id}`} className="text-[13px] font-semibold text-[var(--color-accent)] hover:underline">
              {rfq.account.legalName}
            </Link>
            <div className="font-mono text-[11px] text-[var(--color-muted)] mt-0.5">{rfq.account.code}</div>
            {rfq.submittedBy && (
              <div className="mt-2 text-[12px] text-[var(--color-body)]">
                <span className="text-[var(--color-muted)]">Submitted by: </span>
                {rfq.submittedBy.firstName} {rfq.submittedBy.lastName}
                <div className="font-mono text-[11px] text-[var(--color-muted)]">{rfq.submittedBy.email}</div>
              </div>
            )}
          </div>

          {/* Assignment */}
          <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
            <h3 className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-3">Assignment</h3>
            <form action={async (fd: FormData) => {
              'use server'
              const { assignEngineer } = await import('./actions')
              const eId = fd.get('engineerId') as string
              if (eId) await assignEngineer(rfq.id, eId)
            }}>
              <label className="block font-mono text-[11px] text-[var(--color-muted)] mb-1">Engineer</label>
              <div className="flex gap-2">
                <select
                  name="engineerId"
                  defaultValue={rfq.assignedEngineerId ?? ''}
                  className="flex-1 h-8 px-2 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] text-[var(--color-primary)] focus:outline-none"
                >
                  <option value="">— Unassigned —</option>
                  {engineers.map((eng) => (
                    <option key={eng.id} value={eng.id}>
                      {eng.name}
                    </option>
                  ))}
                </select>
                <button type="submit" className="h-8 px-3 border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors">
                  Save
                </button>
              </div>
            </form>
          </div>

          {/* Dates */}
          <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
            <h3 className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-3">Timeline</h3>
            <dl className="space-y-2 text-[13px]">
              {rfq.submittedAt && (
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--color-muted)]">Submitted</dt>
                  <dd className="font-mono text-[var(--color-primary)]">{new Date(rfq.submittedAt).toLocaleDateString()}</dd>
                </div>
              )}
              {rfq.requestedDeliveryDate && (
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--color-muted)]">Req. delivery</dt>
                  <dd className="font-mono text-[var(--color-primary)]">{new Date(rfq.requestedDeliveryDate).toLocaleDateString()}</dd>
                </div>
              )}
              {rfq.quoteSentAt && (
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--color-muted)]">Quote sent</dt>
                  <dd className="font-mono text-[var(--color-primary)]">{new Date(rfq.quoteSentAt).toLocaleDateString()}</dd>
                </div>
              )}
              {rfq.acceptedAt && (
                <div className="flex justify-between gap-2">
                  <dt className="text-[var(--color-muted)]">Accepted</dt>
                  <dd className="font-mono text-[var(--color-primary)]">{new Date(rfq.acceptedAt).toLocaleDateString()}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Ship-to */}
          {rfq.shipToAddress && (
            <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
              <h3 className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-2">Ship-to</h3>
              <div className="text-[12px] text-[var(--color-body)]">
                <div className="font-medium">{rfq.shipToAddress.label}</div>
                {(rfq.shipToAddress.lines as string[]).map((l, i) => <div key={i}>{l}</div>)}
                <div>{rfq.shipToAddress.city}, {rfq.shipToAddress.countryCode}</div>
              </div>
            </div>
          )}

          {/* Application context */}
          {rfq.applicationContext && (
            <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
              <h3 className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-2">Application Context</h3>
              <p className="text-[12px] text-[var(--color-body)] leading-[1.5]">{rfq.applicationContext}</p>
            </div>
          )}

          {/* Customer message */}
          {rfq.customerMessage && (
            <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
              <h3 className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-2">Customer Message</h3>
              <p className="text-[12px] text-[var(--color-body)] leading-[1.5]">{rfq.customerMessage}</p>
            </div>
          )}

          {/* Attachments */}
          {rfq.attachments.length > 0 && (
            <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
              <h3 className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-3">Attachments</h3>
              <div className="flex flex-col gap-2">
                {rfq.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.media.storagePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-mono text-[12px] text-[var(--color-accent)] hover:underline"
                  >
                    ↓ {att.media.originalFilename}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    submitted: 'text-[oklch(0.4_0.12_220)] bg-[oklch(0.95_0.05_220)]',
    engineer_review: 'text-[oklch(0.4_0.12_220)] bg-[oklch(0.95_0.05_220)]',
    engineer_questions_pending: 'text-[oklch(0.5_0.12_60)] bg-[oklch(0.95_0.08_60)]',
    quote_sent: 'text-[oklch(0.4_0.14_160)] bg-[oklch(0.95_0.06_160)]',
    accepted: 'text-[oklch(0.4_0.14_145)] bg-[oklch(0.93_0.08_145)]',
    declined: 'text-[oklch(0.5_0.1_25)] bg-[oklch(0.95_0.04_25)]',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.06em] ${colorMap[status] ?? 'text-[var(--color-muted)] bg-[var(--color-deep)]'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
